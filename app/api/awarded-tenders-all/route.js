// Fetches all awarded tenders to be displayed in cards on the awarded tenders page
// Data is initially prefetched in ./AdvertisedTenders
// Component is mounted in ./AwardedTendersCard

// ./app/hooks/awarded/useAllAwardedTenders.js -> query this route
// ./app/components/active/AdvertisedTenders.js -> prefetch data
// ./app/components/awarded/AwardedTendersCard.js -> parent component

import { NextResponse } from "next/server";
import { AwardedTenderModel } from "@/app/model/awardedTenderModel";
import { cache } from "@/app/lib/cache";
import { connectDB } from "@/app/lib/db";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const year = url.searchParams.get("year");

    // 1. Check redis cache first
    const cacheKey = `awarded-tenders:${year}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    // 2. If not in cache, get from DB
    await connectDB();

    // Build match stage based on year
    const matchStage = {
      successfulBidderAmount: { $exists: true, $ne: 0 },
    };

    if (year && year !== "all") {
      matchStage.awarded = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    const data = await AwardedTenderModel.aggregate([
      {
        $match: matchStage, // Filter by the criteria
      },
      {
        $project: {
          successfulBidderAmount: 1, // Only return the successfulBidderAmount field
        },
      },
    ]);

    const response = {
      success: true,
      data,
    };

    // 3. Store in Redis cache for 5 minutes
    try {
      await cache.set(cacheKey, response, 300);
      console.log("Cached data for", cacheKey);
    } catch (cacheError) {
      console.error("Cache set error:", cacheError);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in getAwardedTenders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
