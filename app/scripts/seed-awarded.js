// Handles initial db seeding for awarded tenders
// To seed database run:
// npm run db:seed:awarded

import mongoose from "mongoose";
import { AwardedTenderModel } from "../model/awardedTenderModel.js";
import { scrapeAwardedTenders } from "../lib/scrapers/tenders-awarded.js";
import {
  parseAdvertisedDate,
  parseDatePublished,
  parseClosingDate,
} from "../lib/utils/dateParsers.js";
import dotenv from "dotenv";
dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

async function main() {
  await connectDB();

  try {
    // Remove the deleteMany call to allow duplicates
    // await AwardedTenderModel.deleteMany({});
    // console.log("Cleared existing awarded tenders");

    console.log("Starting to scrape awarded tenders...");
    let totalInserted = 0;
    let totalProcessed = 0; // Track total tenders processed

    await scrapeAwardedTenders({
      maxPages: 2235,
      onComplete: async (tenders) => {
        if (tenders.length === 0) return;

        totalProcessed += tenders.length; // Add to total processed count

        // Format the tenders
        const formattedTenders = tenders
          .map((tender) => {
            // Ensure all required fields are present
            const advertisedDate =
              parseAdvertisedDate(tender.advertised) || new Date();
            const awardedDate =
              parseAdvertisedDate(tender.awarded) || new Date();
            const datePublished = parseDatePublished(tender.datePublished);
            const closingDate = parseClosingDate(tender.closingDate);

            return {
              category: tender.category || "",
              description: tender.description || "",
              advertised: advertisedDate,
              awarded: awardedDate,
              tenderNumber: tender.tenderNumber || "",
              department: tender.department || "",
              tenderType: tender.tenderType || "",
              province: tender.province || "",
              datePublished: datePublished,
              closingDate: closingDate,
              placeServicesRequired: tender.placeServicesRequired || "",
              specialConditions: tender.specialConditions || "",
              successfulBidderName: tender.successfulBidderName || "",
              successfulBidderAmount: tender.successfulBidderAmount || "",
            };
          })
          .filter((tender) => tender !== null);

        if (formattedTenders.length === 0) {
          console.log("No valid tenders to insert");
          return;
        }

        // Save all tenders to database using upsert
        console.log(
          `Upserting ${formattedTenders.length} tenders into database...`
        );

        // Use bulkWrite with upsert for each tender
        const operations = formattedTenders.map((tender) => ({
          updateOne: {
            filter: { tenderNumber: tender.tenderNumber },
            update: { $set: tender },
            upsert: true,
          },
        }));

        try {
          const result = await AwardedTenderModel.bulkWrite(operations, {
            ordered: false,
          });

          const processedCount = result.upsertedCount + result.modifiedCount;
          totalInserted += processedCount;
          console.log(
            `Successfully processed ${processedCount} tenders in this batch (Total processed: ${totalProcessed}, Total inserted: ${totalInserted})`
          );
        } catch (error) {
          console.error("Error during bulkWrite:", error);
          // Try individual upserts as fallback
          let individualSuccessCount = 0;
          for (const tender of formattedTenders) {
            try {
              await AwardedTenderModel.findOneAndUpdate(
                { tenderNumber: tender.tenderNumber },
                tender,
                { upsert: true }
              );
              individualSuccessCount++;
            } catch (err) {
              console.error(
                `Failed to upsert tender ${tender.tenderNumber}:`,
                err
              );
            }
          }
          totalInserted += individualSuccessCount;
          console.log(
            `Successfully processed ${individualSuccessCount} tenders individually (Total processed: ${totalProcessed}, Total inserted: ${totalInserted})`
          );
        }
      },
    });

    console.log(
      `Completed scraping. Total tenders processed: ${totalProcessed}, Total inserted: ${totalInserted}`
    );
  } catch (error) {
    console.error("Error seeding awarded tenders database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the seed function
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
