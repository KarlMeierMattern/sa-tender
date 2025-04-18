import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { TenderModel } from "../../model/tenderModel";
import { cache } from "../../lib/cache";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function GET() {
  try {
    // Check cache first
    const cacheKey = `active-tender-filters`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    // Connect to DB
    await connectDB();

    // Get distinct values for each field
    const [categories, departments, provinces] = await Promise.all([
      (async () => {
        const values = await TenderModel.distinct("category");
        return values.filter(Boolean).sort();
      })(),
      (async () => {
        const values = await TenderModel.distinct("department");
        return values.filter(Boolean).sort();
      })(),
      (async () => {
        const values = await TenderModel.distinct("province");
        return values.filter(Boolean).sort();
      })(),
    ]);

    const response = {
      success: true,
      data: {
        categories,
        departments,
        provinces,
      },
    };

    // Cache the results for 10 minutes

    try {
      await cache.set(cacheKey, response, 600);
      console.log("Cached filter data for", cacheKey);
    } catch (error) {
      console.error("Cache set error:", error);
      // Continue even if caching fails
    }
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in getActiveTenderFilters:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
