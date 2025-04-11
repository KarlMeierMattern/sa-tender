import puppeteer from "puppeteer";
import { ETENDERS_URL } from "../utils/constants.js";
import {
  parseAdvertisedDate,
  parseDatePublished,
  parseClosingDate,
} from "../utils/dateParsers.js";

export async function scrapeTendersDetail(options = {}) {
  // Default to starting from page 1
  const { startPage = 0 } = options;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  async function scrapeWithRetry(currentStartPage, previousTotalCount = 0) {
    console.log("Starting scraper...");
    const browser = await puppeteer.launch({
      headless: true,
      slowMo: 100,
    });

    try {
      console.log("Opening page...");
      const page = await browser.newPage();
      console.log("Navigating to URL:", ETENDERS_URL);
      await page.goto(ETENDERS_URL, {
        waitUntil: "networkidle0",
        timeout: 600000,
      });

      // If we're not starting from page 1, navigate to the correct page
      if (currentStartPage > 0) {
        console.log(`Navigating to page ${currentStartPage}...`);
        for (let i = 0; i < currentStartPage; i++) {
          const nextButton = await page.$(
            "a.paginate_button.next:not(.disabled)"
          );
          if (nextButton) {
            await nextButton.click();
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else {
            console.log(
              "No more pages available during navigation to start page"
            );
            return []; // Return empty array if we can't reach the start page
          }
        }
      }

      const allTenders = [];
      let currentPage = 0;
      let totalCount = previousTotalCount; // Continue from previous count
      let hasMorePages = true;

      while (hasMorePages) {
        console.log(`Processing page ${currentPage + 1}...`);
        await page.waitForSelector("table.display.dataTable", {
          timeout: 30000,
          visible: true,
        });

        // Get basic tender info for current page
        console.log("Getting basic tender info...");
        const tenders = await page.evaluate(() => {
          const rows = Array.from(
            document.querySelectorAll("table.display.dataTable tbody tr")
          );
          console.log(`Found ${rows.length} rows on page`);
          return rows.map((row) => ({
            category:
              row.querySelector("td:nth-child(2)")?.textContent?.trim() || "",
            description:
              row.querySelector("td:nth-child(3)")?.textContent?.trim() || "",
            advertised:
              row.querySelector("td:nth-child(5)")?.textContent?.trim() || "",
            closing:
              row.querySelector("td:nth-child(6)")?.textContent?.trim() || "",
          }));
        });

        // Process each row on the current page
        for (let index = 0; index < tenders.length; index++) {
          try {
            totalCount++;
            console.log(
              `Scraping tender ${totalCount} (Page ${currentPage + 1}, Item ${
                index + 1
              }/10): ${tenders[index].description}`
            );

            // Click to reveal details
            await page.evaluate((index) => {
              const buttonCell = document
                .querySelectorAll("table.display.dataTable tbody tr")
                [index].querySelector("td:nth-child(1)");
              if (buttonCell) buttonCell.click();
            }, index);

            // Wait for details to load
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Get details
            const details = await page.evaluate((index) => {
              const detailRow = document.querySelectorAll(
                "table.display.dataTable tbody tr"
              )[index].nextElementSibling;
              const nestedTable = detailRow?.querySelector("td table tbody");
              if (!nestedTable) return [];
              return Array.from(nestedTable.querySelectorAll("tr")).map((tr) =>
                Array.from(tr.querySelectorAll("td")).map((td) =>
                  td.textContent.trim()
                )
              );
            }, index);

            // Process details with improved validation
            const tenderDetails = {};
            try {
              details.forEach((detail) => {
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
                delete tenderDetails[
                  "placewheregoods,worksorservicesarerequired"
                ];
              }
            } catch (error) {
              console.error("Error processing tender details:", error);
            }

            // Create complete tender object with improved validation
            const tender = {
              category: tenders[index].category || "",
              description: tenders[index].description || "",
              advertised: parseAdvertisedDate(tenders[index].advertised),
              closing: tenders[index].closing || "",
              tenderNumber: tenderDetails.tendernumber || "",
              department: tenderDetails.department || "",
              tenderType: tenderDetails.tendertype || "",
              province: tenderDetails.province || "",
              datePublished: parseDatePublished(tenderDetails.datepublished),
              closingDate: parseClosingDate(tenderDetails.closingdate),
              placeServicesRequired: tenderDetails.placeServicesRequired || "",
            };

            // Remove unwanted keys with validation
            const keysToRemove = [
              "faxnumber",
              "isthereabriefingsession?",
              "isitcompulsory?",
              "briefingdateandtime",
              "briefingvenue",
              "contactperson",
              "email",
              "telephonenumber",
              "specialconditions",
            ];

            try {
              keysToRemove.forEach((key) => {
                if (tender.hasOwnProperty(key)) {
                  delete tender[key];
                }
              });
            } catch (error) {
              console.error("Error removing unwanted keys:", error);
            }

            allTenders.push(tender);

            // Click again to close details (prepare for next row)
            await page.evaluate((index) => {
              const buttonCell = document
                .querySelectorAll("table.display.dataTable tbody tr")
                [index].querySelector("td:nth-child(1)");
              if (buttonCell) buttonCell.click();
            }, index);

            // Wait for details to close
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            console.log(`Error processing tender at index ${index}:`, error);
            allTenders.push(tenders[index]);
          }
        }

        // Check if there's a next page
        const nextButton = await page.$(
          "a.paginate_button.next:not(.disabled)"
        );
        if (nextButton) {
          await nextButton.click();
          await new Promise((resolve) => setTimeout(resolve, 2000));
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      return allTenders;
    } catch (error) {
      console.log(`Scraping error on page ${currentStartPage}:`, error);

      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(
          `Retrying from page ${currentStartPage}, attempt ${retryCount}/${MAX_RETRIES}`
        );
        await browser.close();
        return scrapeWithRetry(currentStartPage, totalCount); // Pass totalCount to retry
      }

      throw error;
    } finally {
      await browser.close();
    }
  }
  return scrapeWithRetry(startPage); // Use the startPage from options
}
