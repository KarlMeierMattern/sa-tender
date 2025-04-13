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
    // Clear existing data
    await AwardedTenderModel.deleteMany({});
    console.log("Cleared existing awarded tenders");

    console.log("Starting to scrape awarded tenders...");
    let totalInserted = 0;

    const tenders = await scrapeAwardedTenders({
      maxPages: 2204,
      onBatch: async (batch) => {
        if (batch.length === 0) return;

        // Format the tenders
        const formattedTenders = batch
          .map((tender) => {
            // Ensure all required fields are present
            if (!tender.tenderNumber || !tender.description) {
              console.log(
                `Skipping tender with missing required fields:`,
                tender
              );
              return null;
            }

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
          console.log("No valid tenders to insert in this batch");
          return;
        }

        // Save batch to database
        console.log(
          `Inserting batch of ${formattedTenders.length} tenders into database...`
        );
        const result = await AwardedTenderModel.insertMany(formattedTenders);
        totalInserted += result.length;
        console.log(`Successfully inserted ${totalInserted} tenders so far`);
      },
    });

    console.log(`Completed scraping. Total tenders inserted: ${totalInserted}`);
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
