import puppeteer from "puppeteer";
import { ETENDERS_URL } from "../utils/constants.js";

export async function scrapeTendersDetail(options = {}) {
  // Default to 1 page (10 entries) if not specified
  const { maxPages = 1 } = options;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  async function scrapeWithRetry(startPage = 0) {
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
      if (startPage > 0) {
        for (let i = 0; i < startPage; i++) {
          const nextButton = await page.$("a.paginate_button");
          if (nextButton) {
            await nextButton.click();
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      }

      const allTenders = [];
      let currentPage = 0;
      let totalCount = startPage * 10;

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

            // Handle special key rename
            if (tenderDetails["placewheregoods,worksorservicesarerequired"]) {
              tenderDetails["placeServicesRequired"] =
                tenderDetails["placewheregoods,worksorservicesarerequired"];
              delete tenderDetails[
                "placewheregoods,worksorservicesarerequired"
              ];
            }

            // Create complete tender object
            const tender = {
              category: tenders[index].category,
              description: tenders[index].description,
              advertised: tenders[index].advertised,
              closing: tenders[index].closing,
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
              "datepublished",
              "closingdate",
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
      console.log(`Scraping error on page ${startPage}:`, error);

      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(
          `Retrying from page ${startPage}, attempt ${retryCount}/${MAX_RETRIES}`
        );
        await browser.close();
        return scrapeWithRetry(startPage);
      }

      throw error;
    } finally {
      await browser.close();
    }
  }
  return scrapeWithRetry(0);
}
