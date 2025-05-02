// Fetches unique values for categories, departments, and provinces from the active tenders
// To be used in the filter component of the active tenders page

// ./app/hooks/active/useActiveTenderFilters.js -> query this route
// ./app/components/active/AdvertisedTenders.js -> parent component

import { NextResponse } from "next/server";
import { TenderModel } from "@/app/model/tenderModel";
import { cache } from "@/app/lib/cache";
import { connectDB } from "@/app/lib/db";

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

    // Only get fields from active tenders (where closing date is in the future)
    const activeFilter = { closingDate: { $gte: new Date() } };

    // Get distinct values for each field
    const [categories, departments, provinces] = await Promise.all([
      (async () => {
        const values = await TenderModel.distinct("category", activeFilter);
        return values.filter(Boolean).sort();
      })(),
      (async () => {
        const values = await TenderModel.distinct("department", activeFilter);
        return values.filter(Boolean).sort();
      })(),
      (async () => {
        const values = await TenderModel.distinct("province", activeFilter);
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

    // Cache the results
    try {
      await cache.set(cacheKey, response, process.env.CACHE_DURATION);
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
