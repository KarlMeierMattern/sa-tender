// Handles initial db seeding
// To seed database run:
// npm run db:seed

import mongoose from "mongoose";
import { TenderModel } from "../model/tenderModel.js";
import { scrapeTendersDetail } from "../lib/scrapers/tenders-detail.js";
import dotenv from "dotenv";
dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

async function main() {
  await connectDB();

  try {
    // Clear existing data
    await TenderModel.deleteMany({});
    console.log("Cleared existing tenders");

    const BATCH_SIZE = 20; // pages per batch (20 pages = 200 entries)
    let currentBatch = 0;
    let totalTenders = 0;
    let hasMoreData = true;

    console.log("Starting batch processing...");

    while (hasMoreData) {
      console.log(
        `Processing batch ${currentBatch + 1} (pages ${
          currentBatch * BATCH_SIZE + 1
        } to ${(currentBatch + 1) * BATCH_SIZE})`
      );

      // Scrape current batch of pages
      const tenders = await scrapeTendersDetail({
        maxPages: BATCH_SIZE,
        startPage: currentBatch * BATCH_SIZE,
      });

      // If we got less tenders than expected for a full batch, we've reached the end
      if (tenders.length < BATCH_SIZE * 10) {
        // 10 tenders per page
        hasMoreData = false;
      }

      // Format the tenders for this batch
      const formattedTenders = tenders.map((tender) => {
        // Convert DD/MM/YYYY to mongo db recognised format of YYYY-MM-DD
        const [advertisedDay, advertisedMonth, advertisedYear] =
          tender.advertised.split("/");

        // Helper function to parse date strings
        const parseDateString = (dateStr) => {
          if (!dateStr || dateStr.trim() === "") return null;

          // Extract date part from "Wednesday, 9 April 2025"
          const dateMatch = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
          if (dateMatch) {
            const [, day, month, year] = dateMatch;
            const monthMap = {
              January: "01",
              February: "02",
              March: "03",
              April: "04",
              May: "05",
              June: "06",
              July: "07",
              August: "08",
              September: "09",
              October: "10",
              November: "11",
              December: "12",
            };

            const monthNum = monthMap[month];
            if (monthNum) {
              const formattedDateStr = `${year}-${monthNum}-${day.padStart(
                2,
                "0"
              )}`;
              const parsedDate = new Date(formattedDateStr);
              if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
              }
            }
          }
          return null;
        };

        // Handle closingDate with validation
        let closingDate = null;
        if (tender.closingDate && tender.closingDate.trim() !== "") {
          // Extract date part from "Monday, 14 April 2025 - 12:00"
          const dateMatch = tender.closingDate.match(
            /(\d{1,2})\s+(\w+)\s+(\d{4})/
          );
          if (dateMatch) {
            const [, day, month, year] = dateMatch;
            const monthMap = {
              January: "01",
              February: "02",
              March: "03",
              April: "04",
              May: "05",
              June: "06",
              July: "07",
              August: "08",
              September: "09",
              October: "10",
              November: "11",
              December: "12",
            };

            const monthNum = monthMap[month];
            if (monthNum) {
              const dateStr = `${year}-${monthNum}-${day.padStart(2, "0")}`;
              const parsedDate = new Date(dateStr);
              if (!isNaN(parsedDate.getTime())) {
                closingDate = parsedDate;
              }
            }
          }
        }

        return {
          category: tender.category,
          description: tender.description,
          advertised: new Date(
            `${advertisedYear}-${advertisedMonth}-${advertisedDay}`
          ),
          closing: tender.closing,
          datePublished: parseDateString(tender.datePublished),
          closingDate: closingDate,
          tenderNumber: tender.tenderNumber,
          department: tender.department,
          tenderType: tender.tenderType,
          province: tender.province,
          placeServicesRequired: tender.placeServicesRequired,
        };
      });

      // Save this batch to the database
      const result = await TenderModel.insertMany(formattedTenders);
      totalTenders += result.length;
      console.log(
        `Batch ${currentBatch + 1} complete: Saved ${
          result.length
        } tenders (Total: ${totalTenders})`
      );

      currentBatch++;
    }

    console.log(
      `Successfully seeded ${totalTenders} tenders in ${currentBatch} batches`
    );
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the seed function
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
