import puppeteer from "puppeteer";

const AWARDED_TENDERS_URL =
  "https://www.etenders.gov.za/Home/opportunities?id=2#";

export async function scrapeAwardedTenders(options = {}) {
  const { startPage = 1, maxPages = 1, onBatch, onComplete } = options; // support start and both callback names
  console.log("Starting scraper...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    slowMo: 100,
  });

  let currentPage = 1; // Initialize currentPage at the start
  let pagesProcessed = 0;
  let hasMorePages = true;
  let totalCount = 0;
  let allTenders = []; // Store all tenders here

  try {
    console.log("Opening page...");
    const page = await browser.newPage();
    console.log("Navigating to URL:", AWARDED_TENDERS_URL);
    await page.goto(AWARDED_TENDERS_URL, {
      waitUntil: "networkidle0",
      timeout: 600000,
    });

    // Advance to startPage if needed (necessary for workflow 2)
    if (startPage > 1) {
      while (currentPage < startPage) {
        const nextButtonInit = await page.$(
          "a.paginate_button.next:not(.disabled)"
        );
        if (!nextButtonInit) break;
        await nextButtonInit.click();
        await page.waitForSelector("table.display.dataTable", {
          timeout: 30000,
          visible: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        currentPage++;
      }
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
          await page.evaluate((index) => {
            const buttonCell = document
              .querySelectorAll("table.display.dataTable tbody tr")
              [index].querySelector("td:nth-child(1)");
            if (buttonCell) {
              console.log(`Clicking row ${index + 1}`);
              buttonCell.click();
            }
          }, index);

          // Wait for details to load
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Get details
          const details = await page.evaluate((index) => {
            const detailRow = document.querySelectorAll(
              "table.display.dataTable tbody tr"
            )[index].nextElementSibling;
            const detailsTable = detailRow?.querySelector("td table tbody");
            const mainDetails = detailsTable
              ? Array.from(detailsTable.querySelectorAll("tr")).map((tr) =>
                  Array.from(tr.querySelectorAll("td")).map((td) =>
                    td.textContent.trim()
                  )
                )
              : [];
            // Get successful bidders section
            const biddersTable = detailRow?.querySelector(
              "table:not(.display)" // Get the second table that's not the main table
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
          await page.evaluate((index) => {
            const buttonCell = document
              .querySelectorAll(
                "table.display.dataTable tbody tr:not(.details-row)"
              )
              [index].querySelector("td:nth-child(1)");
            if (buttonCell) {
              buttonCell.click();
            }
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
        await nextButton.click();
        // Wait for the table to update
        await page.waitForSelector("table.display.dataTable", {
          timeout: 30000,
          visible: true,
        });
        // Additional wait to ensure the page has loaded
        await new Promise((resolve) => setTimeout(resolve, 3000));
        currentPage++;
        pagesProcessed++;
        console.log(`Moved to page ${currentPage}`);
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
