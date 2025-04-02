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

    // 1. Get new data from scraping
    const scrapedTenders = await scrapeTendersDetail({ maxPages: Infinity });

    // 2. Format the scraped tenders
    const formattedTenders = scrapedTenders.map((tender) => {
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

    // 3. Get all existing tender numbers from DB
    const existingTenders = await TenderModel.find({}, "tendernumber");
    const existingTenderNumbers = new Set(
      existingTenders.map((t) => t.tendernumber)
    );

    // 4. Separate scraped tenders into new and existing
    const newTenders = [];
    const updatedTenders = [];
    const scrapedTenderNumbers = new Set();

    formattedTenders.forEach((tender) => {
      // Add each scraped tender number to a Set of all scraped numbers
      scrapedTenderNumbers.add(tender.tendernumber);

      // Check if this tender number already exists in our database
      if (!existingTenderNumbers.has(tender.tendernumber)) {
        // If it doesn't exist in database, it's a new tender
        newTenders.push(tender);
      } else {
        // If it does exist, we might need to update it
        updatedTenders.push(tender);
      }
    });

    // 5. Find tenders that are no longer present in scraped data
    const tendersToRemove = [...existingTenderNumbers].filter(
      (number) => !scrapedTenderNumbers.has(number)
    );

    // 6. Perform database operations

    // Add new tenders
    if (newTenders.length > 0) {
      await TenderModel.insertMany(newTenders);
      console.log(`Added ${newTenders.length} new tenders`);
    }

    // Update existing tenders
    for (const tender of updatedTenders) {
      await TenderModel.findOneAndUpdate(
        { tendernumber: tender.tendernumber },
        tender,
        { new: true }
      );
    }
    console.log(`Updated ${updatedTenders.length} existing tenders`);

    // Remove old tenders
    if (tendersToRemove.length > 0) {
      // delete any document where the tendernumber is in our tendersToRemove array
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
