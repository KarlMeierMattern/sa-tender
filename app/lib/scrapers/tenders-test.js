import puppeteer from "puppeteer";
import { ETENDERS_URL } from "@/app/lib/utils/constants";

export async function scrapeTendersTest() {
  const browser = await puppeteer.launch({
    headless: "false",
    slowMo: 100,
  });

  try {
    const page = await browser.newPage();
    await page.goto(ETENDERS_URL, {
      waitUntil: "networkidle0",
    });

    const descriptions = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("table.display.dataTable tbody tr")
      ).map((row) => {
        return row.querySelector("td.sorting_1")?.textContent.trim();
      });
    });
    console.log(descriptions);

    return descriptions;
  } catch (error) {
    console.log("Scraping error", error);
    throw error;
  } finally {
    await browser.close();
  }
}
