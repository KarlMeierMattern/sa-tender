import puppeteer from "puppeteer";

const AWARDED_TENDERS_URL =
  "https://www.etenders.gov.za/Home/opportunities?id=2#";

const TABLE_SELECTOR = "table.display.dataTable tbody tr:not(.details-row)";
const NEXT_BUTTON_SELECTOR = "a.paginate_button.next:not(.disabled)";
const PAGE_REFRESH_INTERVAL = 50;

const BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
];

function isProtocolError(error) {
  const message = error?.message || "";
  return (
    error?.name === "ProtocolError" ||
    message.includes("ProtocolError") ||
    message.includes("Runtime.callFunctionOn timed out")
  );
}

async function launchBrowser() {
  return puppeteer.launch({
    headless: "new",
    protocolTimeout: 300000,
    args: BROWSER_ARGS,
  });
}

async function configurePage(page) {
  page.setDefaultTimeout(120000);
  page.setDefaultNavigationTimeout(300000);
}

async function navigateToAwardedList(page) {
  console.log("Navigating to URL:", AWARDED_TENDERS_URL);
  await page.goto(AWARDED_TENDERS_URL, {
    waitUntil: "networkidle2",
    timeout: 300000,
  });
  await page.waitForSelector(TABLE_SELECTOR, {
    timeout: 60000,
    visible: true,
  });
}

async function getCurrentPageNumber(page) {
  return page.evaluate(() => {
    const activePage = document.querySelector("a.paginate_button.current");
    return activePage ? activePage.textContent.trim() : null;
  });
}

async function clickNextPage(page) {
  for (let navAttempt = 0; navAttempt < 3; navAttempt++) {
    try {
      const nextButton = await page.$(NEXT_BUTTON_SELECTOR);
      if (!nextButton) {
        return false;
      }

      const currentPageBefore = await getCurrentPageNumber(page);
      await nextButton.click();

      await page.waitForFunction(
        (prevPage) => {
          const activePage = document.querySelector(
            "a.paginate_button.current"
          );
          const currentPageText = activePage
            ? activePage.textContent.trim()
            : null;
          const tableRows = document.querySelectorAll(
            "table.display.dataTable tbody tr:not(.details-row)"
          );
          return currentPageText !== prevPage && tableRows.length > 0;
        },
        { timeout: 90000 },
        currentPageBefore
      );

      await page.waitForSelector(TABLE_SELECTOR, {
        visible: true,
        timeout: 30000,
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return true;
    } catch (error) {
      console.log(
        `Navigation attempt ${navAttempt + 1}/3 failed:`,
        error.message
      );
      if (navAttempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  return false;
}

async function advanceToPage(page, targetPage) {
  let current = 1;

  while (current < targetPage) {
    const nextButton = await page.$(NEXT_BUTTON_SELECTOR);
    if (!nextButton) {
      console.log(
        `No next button found at page ${current}, stopping advancement`
      );
      break;
    }

    const moved = await clickNextPage(page);
    if (!moved) {
      console.log(`Failed to advance past page ${current}`);
      break;
    }

    current++;
    if (current % 10 === 0 || current === targetPage) {
      console.log(`Advanced to page ${current}`);
    }
  }

  return current;
}

async function recoverPageSession(browser, page, targetPage) {
  console.log(`Recovering browser session at page ${targetPage}...`);

  try {
    await page.close();
  } catch {
    // Page may already be closed or unresponsive.
  }

  const newPage = await browser.newPage();
  await configurePage(newPage);
  await navigateToAwardedList(newPage);

  if (targetPage > 1) {
    await advanceToPage(newPage, targetPage);
  }

  return newPage;
}

async function logSkippedPage(currentPage, reason) {
  const fs = await import("fs");
  fs.appendFileSync(
    "skipped-pages.log",
    `${new Date().toISOString()} - Page ${currentPage} (${reason})\n`
  );
}

export async function scrapeAwardedTenders(options = {}) {
  const { startPage = 1, maxPages = 1, onBatch, onComplete } = options;
  console.log("Starting scraper...");

  const browser = await launchBrowser();

  let currentPage = 1;
  let pagesProcessed = 0;
  let hasMorePages = true;
  let totalCount = 0;
  let allTenders = [];
  let page = await browser.newPage();
  await configurePage(page);

  try {
    await navigateToAwardedList(page);

    if (startPage > 1) {
      console.log(`Advancing to start page ${startPage}...`);
      currentPage = await advanceToPage(page, startPage);
      console.log(`Finished advancing to start page ${currentPage}`);
    }

    while (hasMorePages && pagesProcessed < maxPages) {
      if (pagesProcessed > 0 && pagesProcessed % PAGE_REFRESH_INTERVAL === 0) {
        console.log(
          `Refreshing page session after ${pagesProcessed} processed pages...`
        );
        try {
          page = await recoverPageSession(browser, page, currentPage);
        } catch (refreshError) {
          console.error(
            "Page refresh failed:",
            refreshError.message || refreshError
          );
        }
      }

      console.log(`Processing page ${currentPage}...`);

      let pageLoaded = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await page.waitForSelector("table.display.dataTable", {
            timeout: 60000,
            visible: true,
          });
          pageLoaded = true;
          break;
        } catch (error) {
          console.log(
            `Attempt ${attempt + 1}/3 failed for page ${currentPage}`
          );
          if (attempt === 2) {
            console.error(
              `Skipping page ${currentPage} after 3 failed attempts`
            );
            await logSkippedPage(currentPage, "load failed");
          } else {
            await new Promise((resolve) =>
              setTimeout(resolve, 3000 * (attempt + 1))
            );
          }
        }
      }

      if (!pageLoaded) {
        const moved = await clickNextPage(page);
        if (moved && pagesProcessed < maxPages - 1) {
          currentPage++;
          pagesProcessed++;
          continue;
        }

        hasMorePages = false;
        break;
      }

      console.log("Getting basic tender info...");
      const tenders = await page.evaluate(() => {
        const rows = Array.from(
          document.querySelectorAll(
            "table.display.dataTable tbody tr:not(.details-row)"
          )
        );
        return rows.map((row) => ({
          category:
            row.querySelector("td:nth-child(2)")?.textContent?.trim() || "",
          description:
            row.querySelector("td:nth-child(3)")?.textContent?.trim() || "",
          advertised:
            row.querySelector("td:nth-child(5)")?.textContent?.trim() || "",
          awarded:
            row.querySelector("td:nth-child(6)")?.textContent?.trim() || "",
        }));
      });

      const pageTenders = [];
      for (let index = 0; index < tenders.length; index++) {
        try {
          totalCount++;
          console.log(
            `Scraping awarded tender ${totalCount} (Page ${currentPage}, Item ${
              index + 1
            }/10): ${tenders[index].description}`
          );

          await page.evaluate((rowIndex) => {
            const rows = Array.from(
              document.querySelectorAll(
                "table.display.dataTable tbody tr:not(.details-row)"
              )
            );
            const cell = rows[rowIndex]?.querySelector("td:nth-child(1)");
            if (cell) {
              cell.click();
            }
          }, index);

          await new Promise((resolve) => setTimeout(resolve, 1000));

          const details = await page.evaluate((rowIndex) => {
            const rows = Array.from(
              document.querySelectorAll(
                "table.display.dataTable tbody tr:not(.details-row)"
              )
            );
            const detailRow = rows[rowIndex]?.nextElementSibling;
            const detailsTable = detailRow?.querySelector("td table tbody");
            const mainDetails = detailsTable
              ? Array.from(detailsTable.querySelectorAll("tr")).map((tr) =>
                  Array.from(tr.querySelectorAll("td")).map((td) =>
                    td.textContent.trim()
                  )
                )
              : [];
            const biddersTable = detailRow?.querySelector(
              "table:not(.display)"
            );
            const successfulBidders = biddersTable
              ? Array.from(biddersTable.querySelectorAll("tr")).map((tr) => ({
                  name:
                    tr.querySelector("td:first-child")?.textContent?.trim() ||
                    "",
                  amount:
                    tr.querySelector("td:last-child")?.textContent?.trim() ||
                    "",
                }))
              : [];
            return { mainDetails, successfulBidders };
          }, index);

          const tenderDetails = {};
          details.mainDetails.forEach((detail) => {
            const [key, value] = detail;
            if (key && value) {
              const formattedKey = key
                .replace(/:\s*$/, "")
                .replace(/\s+/g, "")
                .toLowerCase();
              tenderDetails[formattedKey] = value.trim();
            }
          });

          if (tenderDetails["placewheregoods,worksorservicesarerequired"]) {
            tenderDetails["placeServicesRequired"] =
              tenderDetails[
                "placewheregoods,worksorservicesarerequired"
              ].trim();
            delete tenderDetails["placewheregoods,worksorservicesarerequired"];
          }

          if (tenderDetails["organofstate"]) {
            tenderDetails["department"] = tenderDetails["organofstate"].trim();
            delete tenderDetails["organofstate"];
          }

          let successfulBidderName = "";
          let successfulBidderAmount = 0;

          if (
            details.successfulBidders &&
            details.successfulBidders.length > 0
          ) {
            const bidder = details.successfulBidders.find((b) => {
              const nameLC = b.name.toLowerCase();
              return (
                !nameLC.includes(":") &&
                b.amount &&
                b.amount.includes("R") &&
                /R\s*[\d,.]+/.test(b.amount)
              );
            });

            if (bidder) {
              const nameParts = bidder.name.split(/(?=R[\d\s,]+$)/);
              successfulBidderName = nameParts[0].trim();

              if (bidder.amount) {
                const amountMatch = bidder.amount.match(/R([\d\s]+)(,\d+)?/);
                if (amountMatch) {
                  const wholeNumber = amountMatch[1].replace(/\s/g, "");
                  const decimal = amountMatch[2]
                    ? amountMatch[2].replace(",", "")
                    : "00";
                  const fullNumber = wholeNumber + decimal;
                  successfulBidderAmount = Math.round(
                    parseInt(fullNumber, 10) / 100
                  );
                }
              }
            }
          }

          const tender = {
            category: tenders[index].category || "",
            description: tenders[index].description || "",
            advertised: tenders[index].advertised,
            awarded: tenders[index].awarded,
            tenderNumber: tenderDetails.tendernumber || "",
            department: tenderDetails.department || "",
            tenderType: tenderDetails.tendertype || "",
            province: tenderDetails.province || "",
            datePublished: tenderDetails.datepublished,
            closingDate: tenderDetails.closingdate,
            placeServicesRequired: tenderDetails.placeServicesRequired || "",
            specialConditions: tenderDetails.specialconditions || "",
            successfulBidderName: successfulBidderName || "",
            successfulBidderAmount: successfulBidderAmount || "",
          };
          pageTenders.push(tender);

          await page.evaluate((rowIndex) => {
            const rows = Array.from(
              document.querySelectorAll(
                "table.display.dataTable tbody tr:not(.details-row)"
              )
            );
            const cell = rows[rowIndex]?.querySelector("td:nth-child(1)");
            if (cell) cell.click();
          }, index);

          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.log(
            `Error processing tender ${index + 1} on page ${currentPage}:`,
            error
          );

          if (isProtocolError(error)) {
            try {
              page = await recoverPageSession(browser, page, currentPage);
            } catch (recoverError) {
              console.error(
                "Failed to recover after row error:",
                recoverError.message || recoverError
              );
              throw recoverError;
            }
          }
        }
      }

      if (pageTenders.length > 0) {
        allTenders.push(...pageTenders);
        if (onBatch) {
          await onBatch(pageTenders);
        } else if (onComplete) {
          await onComplete(pageTenders);
        }
      }

      if (pagesProcessed >= maxPages - 1) {
        hasMorePages = false;
        break;
      }

      console.log("Clicking next page button...");
      let navigationSuccess = false;

      try {
        navigationSuccess = await clickNextPage(page);
      } catch (error) {
        console.error("Navigation error:", error.message || error);
      }

      if (!navigationSuccess) {
        console.log("Navigation failed, attempting session recovery...");
        try {
          page = await recoverPageSession(browser, page, currentPage);
          navigationSuccess = await clickNextPage(page);
        } catch (recoverError) {
          console.error(
            "Recovery after navigation failure failed:",
            recoverError.message || recoverError
          );
        }
      }

      if (navigationSuccess) {
        currentPage++;
        pagesProcessed++;
        console.log(`Moved to page ${currentPage}`);
        continue;
      }

      await logSkippedPage(currentPage + 1, "navigation failed");
      console.error(
        `Stopping early after page ${currentPage}. Re-run with START_PAGE=${currentPage + 1} to continue.`
      );
      hasMorePages = false;
    }

    return allTenders;
  } catch (error) {
    console.log(`Scraping error on page ${currentPage}:`, error);

    if (allTenders.length > 0) {
      console.log(
        `Returning ${allTenders.length} tenders collected before the error. Re-run with START_PAGE=${currentPage} to continue.`
      );
      return allTenders;
    }

    throw error;
  } finally {
    await browser.close();
  }
}
