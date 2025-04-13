import puppeteer from "puppeteer";
const ETENDERS_URL = "https://www.etenders.gov.za/Home/opportunities?id=1#";

export async function scrapeTenders() {
  const browser = await puppeteer.launch({
    headless: "new",
  });

  try {
    const page = await browser.newPage();
    await page.goto(ETENDERS_URL, {
      waitUntil: "networkidle0",
    });

    const allTenders = [];
    let hasNextPage = true;

    while (hasNextPage && allTenders.length < 10) {
      // Wait for the table to load
      await page.waitForSelector("table.display.dataTable");

      // Scrape the current page's tenders
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
            row.querySelector("td:nth-child(6")?.textContent?.trim() || "",
        }));
      });

      allTenders.push(...tenders); // Add the current page's tenders to the allTenders array

      // Check if there's a next page
      const nextButton = await page.$("a.paginate_button"); // Adjust the selector based on the actual pagination button
      if (nextButton) {
        await nextButton.click(); // Click the "Next" button
      } else {
        hasNextPage = false; // No more pages
      }
    }

    return allTenders;
  } catch (error) {
    console.log("Scraping error", error);
    throw error;
  } finally {
    await browser.close();
  }
}
