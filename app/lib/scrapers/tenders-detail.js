import puppeteer from "puppeteer";
import { ETENDERS_URL } from "../utils/constants.js";

export async function scrapeTendersDetail(options = {}) {
  // Default to 1 page (10 entries) if not specified
  const { maxPages = 1, startPage = 0 } = options;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  async function scrapeWithRetry(currentStartPage) {
    const browser = await puppeteer.launch({
      headless: true,
      slowMo: 100,
    });

    try {
      const page = await browser.newPage();
      await page.goto(ETENDERS_URL, {
        waitUntil: "networkidle0",
        timeout: 600000,
      });

      // If we're not starting from page 1, navigate to the correct page
      if (currentStartPage > 0) {
        console.log(`Navigating to page ${currentStartPage + 1}...`);
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
      let totalCount = currentStartPage * 10;

      while (currentPage < maxPages) {
        await page.waitForSelector("table.display.dataTable", {
          timeout: 30000,
          visible: true,
        });

        // Get basic tender info for current page
        const tenders = await page.evaluate(() => {
          const rows = Array.from(
            document.querySelectorAll("table.display.dataTable tbody tr")
          );
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

            // Process details
            const tenderDetails = {};
            details.forEach((detail) => {
              const [key, value] = detail;
              if (key && value) {
                const formattedKey = key
                  .replace(/:\s*$/, "")
                  .replace(/\s+/g, "")
                  .toLowerCase();
                tenderDetails[formattedKey] = value;
              }
            });

            // Parse date strings into Date objects
            function parseDate(dateStr) {
              if (!dateStr) return null;
              // Handle date format: "10 Apr 2025"
              const parts = dateStr.split(" ");
              if (parts.length === 3) {
                const months = {
                  Jan: 0,
                  Feb: 1,
                  Mar: 2,
                  Apr: 3,
                  May: 4,
                  Jun: 5,
                  Jul: 6,
                  Aug: 7,
                  Sep: 8,
                  Oct: 9,
                  Nov: 10,
                  Dec: 11,
                };
                const day = parseInt(parts[0]);
                const month = months[parts[1]];
                const year = parseInt(parts[2]);
                if (!isNaN(day) && month !== undefined && !isNaN(year)) {
                  return new Date(year, month, day);
                }
              }
              return null;
            }

            // Handle special key rename
            if (tenderDetails["placewheregoods,worksorservicesarerequired"]) {
              tenderDetails["placeServicesRequired"] =
                tenderDetails["placewheregoods,worksorservicesarerequired"];
              delete tenderDetails[
                "placewheregoods,worksorservicesarerequired"
              ];
            }

            // Create complete tender object with parsed dates
            const tender = {
              category: tenders[index].category,
              description: tenders[index].description,
              advertised: parseDate(tenders[index].advertised),
              closing: tenders[index].closing,
              tenderNumber: tenderDetails.tendernumber || "",
              department: tenderDetails.department || "",
              tenderType: tenderDetails.tendertype || "",
              province: tenderDetails.province || "",
              datePublished: parseDate(tenderDetails.datepublished),
              closingDate: parseDate(tenderDetails.closingdate),
              placeServicesRequired: tenderDetails.placeServicesRequired || "",
              ...tenderDetails,
            };

            // Remove unwanted keys
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

            keysToRemove.forEach((key) => {
              delete tender[key];
            });

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
            // If error occurs, add basic tender info
            allTenders.push(tenders[index]);
          }
        }

        // Move to next page if not on last page
        currentPage++;
        if (currentPage < maxPages) {
          const nextButton = await page.$(
            "a.paginate_button.next:not(.disabled)"
          );
          if (nextButton) {
            await nextButton.click();
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else {
            break; // No more pages available
          }
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
        return scrapeWithRetry(currentStartPage);
      }

      throw error;
    } finally {
      await browser.close();
    }
  }
  return scrapeWithRetry(startPage);
}
