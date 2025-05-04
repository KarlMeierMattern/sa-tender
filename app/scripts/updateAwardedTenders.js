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

    const BATCH_SIZE = 20; // pages per batch (20 pages = 200 entries)
    let allScrapedTenders = [];

    console.log("Starting batch processing...");

    // Scrape all pages in a single call with batching
    await scrapeAwardedTenders({
      maxPages: BATCH_SIZE,
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

        allScrapedTenders = allScrapedTenders.concat(formattedTenders);
        console.log(
          `Processed batch: ${formattedTenders.length} tenders (Total: ${allScrapedTenders.length})`
        );
      },
    });

    // Get all existing tender numbers from DB
    const existingTenders = await AwardedTenderModel.find({}, "tenderNumber");
    const existingTenderNumbers = new Set(
      existingTenders.map((t) => t.tenderNumber)
    );

    // Separate scraped tenders into new and existing
    const newTenders = [];
    const updatedTenders = [];
    const scrapedTenderNumbers = new Set();

    allScrapedTenders.forEach((tender) => {
      scrapedTenderNumbers.add(tender.tenderNumber);

      if (!existingTenderNumbers.has(tender.tenderNumber)) {
        newTenders.push(tender);
      } else {
        updatedTenders.push(tender);
      }
    });

    // Find tenders that are no longer present in scraped data
    const tendersToRemove = [...existingTenderNumbers].filter(
      (number) => !scrapedTenderNumbers.has(number)
    );

    // Perform database operations
    if (newTenders.length > 0) {
      await AwardedTenderModel.insertMany(newTenders);
      console.log(`Added ${newTenders.length} new awarded tenders`);
    }

    if (updatedTenders.length > 0) {
      for (const tender of updatedTenders) {
        await AwardedTenderModel.findOneAndUpdate(
          { tenderNumber: tender.tenderNumber },
          tender,
          { new: true }
        );
      }
      console.log(`Updated ${updatedTenders.length} existing awarded tenders`);
    }

    if (tendersToRemove.length > 0) {
      await AwardedTenderModel.deleteMany({
        tenderNumber: { $in: tendersToRemove },
      });
      console.log(`Removed ${tendersToRemove.length} old awarded tenders`);
    }

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
