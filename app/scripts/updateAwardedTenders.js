import mongoose from "mongoose";
import { AwardedTenderModel } from "../model/awardedTenderModel.js";
import { scrapeAwardedTenders } from "../lib/scrapers/tenders-awarded.js";
import dotenv from "dotenv";
dotenv.config();

export async function updateAwardedTenders() {
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
      const tenders = await scrapeAwardedTenders({
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
      const [advertisedDay, advertisedMonth, advertisedYear] =
        tender.advertised.split("/");
      const [awardedDay, awardedMonth, awardedYear] = tender.awarded.split("/");
      const [publishedDay, publishedMonth, publishedYear] = tender.datePublished
        .split(" ")[1]
        .split("/");

      return {
        category: tender.category,
        description: tender.description,
        advertised: new Date(
          `${advertisedYear}-${advertisedMonth}-${advertisedDay}`
        ),
        awarded: new Date(`${awardedYear}-${awardedMonth}-${awardedDay}`),
        tenderNumber: tender.tenderNumber,
        department: tender.department,
        tenderType: tender.tenderType,
        province: tender.province,
        datePublished: new Date(
          `${publishedYear}-${publishedMonth}-${publishedDay}`
        ),
        closingDate: tender.closingDate,
        placeServicesRequired: tender.placeServicesRequired,
        specialConditions: tender.specialConditions,
        successfulBidderName: tender.successfulBidderName,
        successfulBidderAmount: tender.successfulBidderAmount,
      };
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

    formattedTenders.forEach((tender) => {
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
