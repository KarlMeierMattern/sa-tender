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

    // Scrape tender data
    console.log("Starting full data scrape...");
    const tenders = await scrapeTendersDetail({ maxPages: Infinity });

    // Format the data to match your schema
    const formattedTenders = tenders.map((tender) => {
      // Validate the date format
      const isValidDate = (dateString) => {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/; // DD/MM/YYYY format
        return regex.test(dateString);
      };

      if (!isValidDate(tender.advertised)) {
        console.error(
          `Invalid date format for advertised: ${tender.advertised}`
        );
        return null; // Skip this tender or handle the error
      }

      const [day, month, year] = tender.advertised.split("/");
      const formattedDate = new Date(`${year}-${month}-${day}`); // Create a Date object

      if (isNaN(formattedDate.getTime())) {
        console.error(
          `Invalid date value for advertised: ${tender.advertised}`
        );
        return null; // Skip this tender or handle the error
      }

      return {
        category: tender.category,
        description: tender.description,
        advertised: formattedDate,
        closing: tender.closing,
        tendernumber: tender.tendernumber,
        department: tender.department,
        tendertype: tender.tendertype,
        province: tender.province,
        placeServicesRequired: tender.placeServicesRequired,
      };
    });

    // Insert the tenders
    const result = await TenderModel.insertMany(formattedTenders);
    console.log(`Successfully seeded ${result.length} tenders`);
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
