// Performs a single database update when manually executed
// This file also gets exported to be used by cron job
// npm run db:update

import mongoose from "mongoose";
import { TenderModel } from "../model/tenderModel.js";
import { scrapeTendersDetail } from "../lib/scrapers/tenders-detail.js";
import dotenv from "dotenv";
dotenv.config();

export async function updateTenders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const BATCH_SIZE = 20; // pages per batch (20 pages = 200 entries)
    let currentBatch = 0;
    let hasMoreData = true;
    let allScrapedTenders = [];

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

      allScrapedTenders = allScrapedTenders.concat(tenders);
      console.log(
        `Batch ${currentBatch + 1} complete: Got ${
          tenders.length
        } tenders (Total: ${allScrapedTenders.length})`
      );

      currentBatch++;
    }

    // Format all the scraped tenders
    const formattedTenders = allScrapedTenders.map((tender) => {
      // Convert DD/MM/YYYY to mongo db recognised format of YYYY-MM-DD
      const [day, month, year] = tender.advertised.split("/");
      const formattedDate = `${year}-${month}-${day}`;

      return {
        category: tender.category,
        description: tender.description,
        advertised: new Date(formattedDate), // Convert to Date object
        closing: tender.closing,
        tendernumber: tender.tendernumber,
        department: tender.department,
        tendertype: tender.tendertype,
        province: tender.province,
        placeServicesRequired: tender.placeServicesRequired,
      };
    });

    // Get all existing tender numbers from DB
    const existingTenders = await TenderModel.find({}, "tendernumber");
    const existingTenderNumbers = new Set(
      existingTenders.map((t) => t.tendernumber)
    );

    // Separate scraped tenders into new and existing
    const newTenders = [];
    const updatedTenders = [];
    const scrapedTenderNumbers = new Set();

    formattedTenders.forEach((tender) => {
      scrapedTenderNumbers.add(tender.tendernumber);

      if (!existingTenderNumbers.has(tender.tendernumber)) {
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
      await TenderModel.insertMany(newTenders);
      console.log(`Added ${newTenders.length} new tenders`);
    }

    if (updatedTenders.length > 0) {
      for (const tender of updatedTenders) {
        await TenderModel.findOneAndUpdate(
          { tendernumber: tender.tendernumber },
          tender,
          { new: true }
        );
      }
      console.log(`Updated ${updatedTenders.length} existing tenders`);
    }

    if (tendersToRemove.length > 0) {
      await TenderModel.deleteMany({
        tendernumber: { $in: tendersToRemove },
      });
      console.log(`Removed ${tendersToRemove.length} old tenders`);
    }

    console.log("Database update completed successfully");
  } catch (error) {
    console.error("Error updating database:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Only run directly if this file is executed directly (not imported)
if (import.meta.url === new URL(import.meta.url).href) {
  console.log(
    "Starting tender database update:",
    new Date().toLocaleString("en-ZA", {
      timeZone: "Africa/Johannesburg",
      dateStyle: "full",
      timeStyle: "long",
    })
  );
  updateTenders().catch((error) => {
    console.error("Update failed:", error);
    process.exit(1);
  });
}
