// API route for filters for awarded tenders
// ./app/hooks/awarded/useAwardedTenderFilters.js
// ./app/components/awarded/AwardedTendersCard.js

import { NextResponse } from "next/server";
import { AwardedTenderModel } from "../../model/awardedTenderModel.js";
import { cache } from "../../lib/cache.js";
import { connectDB } from "../db";

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
      (values) => values.filter(Boolean).sort()
    );

    const response = {
      success: true,
      data: {
        awarded: awardedDates,
      },
    };

    // Cache the results for 10 minutes
    try {
      await cache.set(cacheKey, response, 600);
      console.log("Cached filter data for", cacheKey);
    } catch (cacheError) {
      console.error("Cache set error:", cacheError);
      // Continue even if caching fails
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
