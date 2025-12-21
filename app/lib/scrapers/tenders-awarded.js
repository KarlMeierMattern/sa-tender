import puppeteer from "puppeteer";

const AWARDED_TENDERS_URL =
  "https://www.etenders.gov.za/Home/opportunities?id=2#";

export async function scrapeAwardedTenders(options = {}) {
  const { startPage = 1, maxPages = 1, onBatch, onComplete } = options; // support start and both callback names
  console.log("Starting scraper...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  let currentPage = 1; // Initialize currentPage at the start
  let pagesProcessed = 0;
  let hasMorePages = true;
  let totalCount = 0;
  let allTenders = []; // Store all tenders here
  let page = await browser.newPage();

  try {
    // Initial navigation or refresh every 100 pages
    if (pagesProcessed === 0 || pagesProcessed % 100 === 0) {
      if (pagesProcessed > 0) {
        console.log("Closing page...");
        await page.close();
        console.log("Opening page...");
        page = await browser.newPage();
      }
      console.log("Navigating to URL:", AWARDED_TENDERS_URL);
      await page.goto(AWARDED_TENDERS_URL, {
        waitUntil: "networkidle0",
        timeout: 300000, // 5 minutes for initial load
      });
      // Wait for table to be ready
      await page.waitForSelector(
        "table.display.dataTable tbody tr:not(.details-row)",
        {
          timeout: 60000,
          visible: true,
        }
      );
    }

    // Advance to startPage if needed (necessary for workflow 2)
    if (startPage > 1) {
      console.log(`Advancing to start page ${startPage}...`);
      while (currentPage < startPage) {
        const nextButtonInit = await page.$(
          "a.paginate_button.next:not(.disabled)"
        );
        if (!nextButtonInit) {
          console.log(
            `No next button found at page ${currentPage}, stopping advancement`
          );
          break;
        }

        try {
          // Get current page before clicking
          const currentPageBefore = await page.evaluate(() => {
            const activePage = document.querySelector(
              "a.paginate_button.current"
            );
            return activePage ? activePage.textContent.trim() : null;
          });

          await nextButtonInit.click();

          // Wait for table to update
          await page.waitForFunction(
            (prevPage) => {
              const activePage = document.querySelector(
                "a.paginate_button.current"
              );
              const currentPageText = activePage
                ? activePage.textContent.trim()
                : null;
              return currentPageText !== prevPage;
            },
            { timeout: 90000 },
            currentPageBefore
          );

          await page.waitForSelector(
            "table.display.dataTable tbody tr:not(.details-row)",
            {
              timeout: 30000,
              visible: true,
            }
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          currentPage++;
          console.log(`Advanced to page ${currentPage}`);
        } catch (error) {
          console.error(
            `Error advancing to page ${currentPage + 1}:`,
            error.message
          );
          // Try to continue, but log the issue
          await new Promise((resolve) => setTimeout(resolve, 3000));
          currentPage++;
        }
      }
      console.log(`Finished advancing to start page ${currentPage}`);
    }

    while (hasMorePages && pagesProcessed < maxPages) {
      console.log(`Processing page ${currentPage}...`);

      // Retry logic for page load
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
            const fs = await import("fs");
            fs.appendFileSync(
              "skipped-pages.log",
              `${new Date().toISOString()} - Page ${currentPage}\n`
            );
          } else {
            await new Promise((resolve) =>
              setTimeout(resolve, 3000 * (attempt + 1))
            );
          }
        }
      }

      if (!pageLoaded) {
        // Move to next page attempt
        const nextButton = await page.$(
          "a.paginate_button.next:not(.disabled)"
        );
        if (nextButton && pagesProcessed < maxPages - 1) {
          await nextButton.click();
          await new Promise((resolve) => setTimeout(resolve, 3000));
          currentPage++;
          pagesProcessed++;
          continue;
        } else {
          hasMorePages = false;
          break;
        }
      }

      // Get basic tender info for current page
      console.log("Getting basic tender info...");
      const tenders = await page.evaluate(() => {
        const rows = Array.from(
          document.querySelectorAll(
            "table.display.dataTable tbody tr:not(.details-row)"
          )
        );
        console.log(`Found ${rows.length} rows on page`);
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
      // Process each row on the current page
      for (let index = 0; index < tenders.length; index++) {
        try {
          totalCount++;
          console.log(
            `Scraping awarded tender ${totalCount} (Page ${currentPage}, Item ${
              index + 1
            }/10): ${tenders[index].description}`
          );

          // Click to reveal details
          await page.evaluate((rowIndex) => {
            const rows = Array.from(
              document.querySelectorAll(
                "table.display.dataTable tbody tr:not(.details-row)"
              )
            );
            const cell = rows[rowIndex]?.querySelector("td:nth-child(1)");
            if (cell) {
              console.log(`Clicking row ${rowIndex + 1}`);
              cell.click();
            }
          }, index);

          // Wait for details to load
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Get details
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

          // console.log("Successful Bidders: ", details.successfulBidders);

          // Process details with improved validation
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

          // Handle special key rename with validation
          if (tenderDetails["placewheregoods,worksorservicesarerequired"]) {
            tenderDetails["placeServicesRequired"] =
              tenderDetails[
                "placewheregoods,worksorservicesarerequired"
              ].trim();
            delete tenderDetails["placewheregoods,worksorservicesarerequired"];
          }

          // Process successful bidders
          let successfulBidderName = "";
          let successfulBidderAmount = 0;

          if (
            details.successfulBidders &&
            details.successfulBidders.length > 0
          ) {
            // Find the row with the actual bidder information
            const bidder = details.successfulBidders.find((b) => {
              const nameLC = b.name.toLowerCase();
              // Look for rows that don't contain any field labels and have an amount with 'R'
              return (
                !nameLC.includes(":") &&
                b.amount &&
                b.amount.includes("R") &&
                /R\s*[\d,.]+/.test(b.amount)
              );
            });

            if (bidder) {
              // Extract name by splitting on 'R' and taking the first part
              const nameParts = bidder.name.split(/(?=R[\d\s,]+$)/);
              successfulBidderName = nameParts[0].trim();

              // Parse amount - handle the format "R951 930,40"
              if (bidder.amount) {
                // Extract just the numeric part after R, preserving the structure
                const amountMatch = bidder.amount.match(/R([\d\s]+)(,\d+)?/);
                if (amountMatch) {
                  // Remove spaces and combine the parts
                  const wholeNumber = amountMatch[1].replace(/\s/g, "");
                  const decimal = amountMatch[2]
                    ? amountMatch[2].replace(",", "")
                    : "00";
                  const fullNumber = wholeNumber + decimal;

                  // Convert to integer and remove cents (divide by 100)
                  const amountWithoutCents = Math.round(
                    parseInt(fullNumber, 10) / 100
                  );
                  successfulBidderAmount = amountWithoutCents;
                }
              }
            }
          }

          // console.log(`Details: ${JSON.stringify({ tenderDetails })}`);

          // Create complete tender object with improved validation
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

          // Click again to close details
          await page.evaluate((rowIndex) => {
            const rows = Array.from(
              document.querySelectorAll(
                "table.display.dataTable tbody tr:not(.details-row)"
              )
            );
            const cell = rows[rowIndex]?.querySelector("td:nth-child(1)");
            if (cell) cell.click();
          }, index);

          // Wait for details to close
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.log(
            `Error processing tender ${index + 1} on page ${currentPage}:`,
            error
          );
        }
      }

      // Process tenders for this page
      if (pageTenders.length > 0) {
        allTenders.push(...pageTenders); // Add to all tenders
        if (onBatch) {
          await onBatch(pageTenders);
        } else if (onComplete) {
          await onComplete(pageTenders);
        }
      }

      // Try to navigate to next page
      const nextButton = await page.$("a.paginate_button.next:not(.disabled)");
      if (nextButton && pagesProcessed < maxPages - 1) {
        console.log("Clicking next page button...");

        // DataTables uses AJAX pagination, not full page navigation
        // So we just click and wait for the table to update
        let navigationSuccess = false;
        for (let navAttempt = 0; navAttempt < 3; navAttempt++) {
          try {
            // Get current page indicator before clicking
            const currentPageBefore = await page.evaluate(() => {
              const activePage = document.querySelector(
                "a.paginate_button.current"
              );
              return activePage ? activePage.textContent.trim() : null;
            });

            await nextButton.click();

            // Wait for table to update (check if page number changed or table content refreshed)
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

            // Additional wait for table to be fully loaded
            await page.waitForSelector(
              "table.display.dataTable tbody tr:not(.details-row)",
              {
                visible: true,
                timeout: 30000,
              }
            );

            // Small delay to ensure all content is loaded
            await new Promise((resolve) => setTimeout(resolve, 2000));

            navigationSuccess = true;
            break;
          } catch (error) {
            console.log(
              `Navigation attempt ${navAttempt + 1}/3 failed:`,
              error.message
            );
            if (navAttempt < 2) {
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, 5000));
              // Re-check if next button still exists
              const nextButtonRetry = await page.$(
                "a.paginate_button.next:not(.disabled)"
              );
              if (!nextButtonRetry) {
                console.log("Next button no longer available");
                hasMorePages = false;
                break;
              }
            } else {
              console.error(
                `Failed to navigate after 3 attempts, skipping to next page`
              );
              // Log the skipped page
              const fs = await import("fs");
              fs.appendFileSync(
                "skipped-pages.log",
                `${new Date().toISOString()} - Navigation failed on page ${currentPage}\n`
              );
              // Try to continue anyway
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }
          }
        }

        if (navigationSuccess) {
          currentPage++;
          pagesProcessed++;
          console.log(`Moved to page ${currentPage}`);
        } else {
          // If navigation failed after retries, check if we should continue
          const stillHasNext = await page.$(
            "a.paginate_button.next:not(.disabled)"
          );
          if (!stillHasNext) {
            hasMorePages = false;
          } else {
            // Force increment to avoid infinite loop
            currentPage++;
            pagesProcessed++;
            console.log(
              `Forced increment to page ${currentPage} after navigation failure`
            );
          }
        }
      } else {
        hasMorePages = false;
      }
    }

    return allTenders; // Return all collected tenders
  } catch (error) {
    console.log(`Scraping error on page ${currentPage}:`, error);
    throw error;
  } finally {
    await browser.close();
  }
}
