// Performs a single database update when manually executed
// This file also gets exported to be used by cron job
// npm run db:update

import mongoose from "mongoose";
import { TenderModel } from "../model/tenderModel.js";
import { scrapeTendersDetail } from "../lib/scrapers/tenders-detail.js";
import {
  parseAdvertisedDate,
  parseDatePublished,
  parseClosingDate,
} from "../lib/utils/dateParsers.js";
import dotenv from "dotenv";
dotenv.config();

export async function updateTenders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    console.log("Starting tender update...");
    const tenders = await scrapeTendersDetail({
      startPage: 0,
    });

    // Format the tenders
    const formattedTenders = tenders.map((tender) => {
      // Use our specific date parsing functions
      const advertisedDate =
        parseAdvertisedDate(tender.advertised) || new Date();
      const datePublished = parseDatePublished(tender.datePublished);
      const closingDate = parseClosingDate(tender.closingDate);

      return {
        category: tender.category,
        description: tender.description,
        advertised: advertisedDate,
        closing: tender.closing,
        datePublished: datePublished,
        closingDate: closingDate,
        tenderNumber: tender.tenderNumber,
        department: tender.department,
        tenderType: tender.tenderType,
        province: tender.province,
        placeServicesRequired: tender.placeServicesRequired,
      };
    });

    // Update or insert tenders
    const operations = formattedTenders.map((tender) => ({
      updateOne: {
        filter: { tenderNumber: tender.tenderNumber },
        update: { $set: tender },
        upsert: true,
      },
    }));

    const result = await TenderModel.bulkWrite(operations);
    console.log(
      `Successfully updated ${
        result.upsertedCount + result.modifiedCount
      } tenders`
    );
  } catch (error) {
    console.error("Error updating tenders:", error);
    process.exit(1);
  } finally {
    // Close the MongoDB connection
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
