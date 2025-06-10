// Handles initial db seeding
// To seed database run:
// npm run db:seed

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

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

export default async function seedDatabase() {
  await connectDB();

  try {
    // Clear existing data
    await TenderModel.deleteMany({});
    console.log("Cleared existing tenders");

    console.log("Starting tender scraping...");
    const tenders = await scrapeTendersDetail({
      startPage: 1,
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

    // Save all tenders to the database
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
// seedDatabase().catch((e) => {
//   console.error(e);
//   process.exit(1);
// });
