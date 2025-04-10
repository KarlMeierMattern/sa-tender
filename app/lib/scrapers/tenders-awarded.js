import puppeteer from "puppeteer";

const AWARDED_TENDERS_URL =
  "https://www.etenders.gov.za/Home/opportunities?id=2#";

export async function scrapeAwardedTenders(options = {}) {
  // Default to 1 page (10 entries) if not specified
  const { maxPages = 1, startPage = 0 } = options;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  async function scrapeWithRetry(currentStartPage) {
    console.log("Starting scraper...");
    const browser = await puppeteer.launch({
      headless: true,
      slowMo: 100,
    });

    try {
      console.log("Opening page...");
      const page = await browser.newPage();
      console.log("Navigating to URL:", AWARDED_TENDERS_URL);
      await page.goto(AWARDED_TENDERS_URL, {
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

      const allAwardedTenders = [];
      let currentPage = 0;
      let totalCount = currentStartPage * 10;

      while (currentPage < maxPages) {
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
            awarded:
              row.querySelector("td:nth-child(6)")?.textContent?.trim() || "",
          }));
        });

        console.log(`Found ${tenders.length} tenders on current page`);

        // Process each row on the current page
        for (let index = 0; index < tenders.length; index++) {
          try {
            totalCount++;
            console.log(
              `Scraping awarded tender ${totalCount} (Page ${
                currentPage + 1
              }, Item ${index + 1}/10): ${tenders[index].description}`
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

            // Get details including successful bidders
            const details = await page.evaluate((index) => {
              console.log(`Getting details for row ${index + 1}`);
              const detailRow = document.querySelectorAll(
                "table.display.dataTable tbody tr"
              )[index].nextElementSibling;

              // Get main tender details
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

            // Process main details
            const tenderDetails = {};
            details.mainDetails.forEach((detail) => {
              const [key, value] = detail;
              if (key && value) {
                const originalKey = key.replace(/:\s*$/, "").trim();
                const cleanKey = originalKey
                  .toLowerCase()
                  .replace(/[^a-z]/g, "");

                // Special handling for place where services are required
                if (
                  originalKey
                    .toLowerCase()
                    .includes(
                      "place where goods, works or services are required"
                    )
                ) {
                  tenderDetails.placeServicesRequired = detail[1] || "";
                }
                // Handle other specified fields
                else if (
                  [
                    "tendernumber",
                    "department",
                    "tendertype",
                    "province",
                    "datepublished",
                    "closingdate",
                    "specialconditions",
                  ].includes(cleanKey)
                ) {
                  tenderDetails[cleanKey] = detail[1] || "";
                }
              }
            });

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
                successfulBidderName = bidder.name.split("R")[0].trim();

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

            // Create complete tender object with flattened structure
            const tender = {
              category: tenders[index].category,
              description: tenders[index].description,
              advertised: tenders[index].advertised,
              awarded: tenders[index].awarded,
              tenderNumber: tenderDetails.tendernumber || "",
              department: tenderDetails.department || "",
              tenderType: tenderDetails.tendertype || "",
              province: tenderDetails.province || "",
              datePublished: tenderDetails.datepublished || "",
              closingDate: tenderDetails.closingdate || "",
              placeServicesRequired: tenderDetails.placeServicesRequired || "",
              specialConditions: tenderDetails.specialconditions || "",
              successfulBidderName,
              successfulBidderAmount,
            };

            allAwardedTenders.push(tender);

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
            console.log(
              `Error processing awarded tender at index ${index}:`,
              error
            );
            // If error occurs, add basic tender info
            allAwardedTenders.push(tenders[index]);
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

      return allAwardedTenders;
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
  return scrapeWithRetry(startPage); // Use the startPage from options
}
