// API route for filters for awarded tenders
// ./app/hooks/awarded/useAwardedTenderFilters.js
// ./app/components/awarded/AwardedTendersCard.js

import { NextResponse } from "next/server";
import { AwardedTenderModel } from "@/app/model/awardedTenderModel";
import { cache } from "@/app/lib/cache";
import { connectDB } from "@/app/lib/db";

export async function GET() {
  try {
    // Check cache first
    const cacheKey = "awarded-tender-filters";
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    // Connect to DB
    await connectDB();

    // Get distinct awarded dates to be used for year filter
    const awardedDates = await AwardedTenderModel.distinct("awarded").then(
      (values) =>
        values
          .filter(Boolean)
          .filter((date) => new Date(date).getFullYear() >= 2022)
          .sort()
    );

    const response = {
      success: true,
      data: {
        awarded: awardedDates,
      },
    };

    // Cache the results
    try {
      await cache.set(cacheKey, response, process.env.CACHE_DURATION);
      console.log("Cached filter data for", cacheKey);
    } catch (cacheError) {
      console.error("Cache set error:", cacheError);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in getAwardedTenderFilters:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
