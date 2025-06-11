// Performs a single database update when manually executed
// This file also gets exported to be used by cron job
// npm run db:update:awarded

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

export async function updateAwardedTenders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // pages per batch (20 pages = 200 entries)
    const BATCH_SIZE = 20;

    console.log("Starting batch processing...");

    // Scrape all pages in a single call with batching
    await scrapeAwardedTenders({
      // maxPages: BATCH_SIZE,
      onBatch: async (batch) => {
        if (batch.length === 0) return;

        // Format the tenders
        const formattedTenders = batch.map((tender) => {
          // Use our specific date parsing functions
          const advertisedDate =
            parseAdvertisedDate(tender.advertised) || new Date();
          const awardedDate = parseAdvertisedDate(tender.awarded) || new Date();
          const datePublished = parseDatePublished(tender.datePublished);
          const closingDate = parseClosingDate(tender.closingDate);

          return {
            category: tender.category,
            description: tender.description,
            advertised: advertisedDate,
            awarded: awardedDate,
            tenderNumber: tender.tenderNumber,
            department: tender.department,
            tenderType: tender.tenderType,
            province: tender.province,
            datePublished: datePublished,
            closingDate: closingDate,
            placeServicesRequired: tender.placeServicesRequired,
            specialConditions: tender.specialConditions,
            successfulBidderName: tender.successfulBidderName,
            successfulBidderAmount: tender.successfulBidderAmount,
          };
        });

        // --- Batch DB write logic ---
        for (const tender of formattedTenders) {
          await AwardedTenderModel.findOneAndUpdate(
            { tenderNumber: tender.tenderNumber },
            tender,
            { upsert: true, new: true }
          );
        }
        console.log(
          `Processed and saved batch: ${formattedTenders.length} tenders`
        );
      },
    });

    console.log("Awarded tenders database update completed successfully");
  } catch (error) {
    console.error("Error updating awarded tenders database:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Only run directly if this file is executed directly (not imported)
if (import.meta.url === new URL(import.meta.url).href) {
  console.log(
    "Starting awarded tender database update:",
    new Date().toLocaleString("en-ZA", {
      timeZone: "Africa/Johannesburg",
      dateStyle: "full",
      timeStyle: "long",
    })
  );
  updateAwardedTenders().catch((error) => {
    console.error("Update failed:", error);
    process.exit(1);
  });
}
