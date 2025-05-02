import { NextResponse } from "next/server";
import { AwardedTenderModel } from "@/app/model/awardedTenderModel";
import { cache } from "@/app/lib/cache";
import { connectDB } from "@/app/lib/db";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const year = url.searchParams.get("year") || "all";

    // 1. Check redis cache first
    const cacheKey = `top-suppliers:${year}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    await connectDB();

    // Build match stage based on year
    const matchStage = {
      successfulBidderName: { $exists: true, $ne: null }, // exists AND is not 0
      successfulBidderAmount: { $exists: true, $ne: 0 },
      category: { $exists: true, $ne: null },
    };

    // Add year filter if specified
    if (year && year !== "all") {
      matchStage.awarded = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    const data = await AwardedTenderModel.aggregate(
      [
        {
          $match: matchStage,
        },
        {
          $group: {
            _id: "$successfulBidderName", // group by supplier name
            totalValue: { $sum: "$successfulBidderAmount" }, // sum the total value of all tenders for this supplier
            count: { $sum: 1 }, // add 1 for each document in the group
            categories: { $addToSet: "$category" }, // collect all categories for this supplier
          },
        },
        {
          // use $project to limit the number of categories
          $project: {
            _id: 0, // remove the _id field
            supplier: "$_id", // rename _id to supplier
            totalValue: 1, // include the total value
            count: 1, // include the count
            categories: { $slice: ["$categories", 3] }, // limit to first 3 categories
          },
        },
        { $sort: { totalValue: -1 } },
        { $limit: 10 },
      ],
      { allowDiskUse: true }
    );

    const response = {
      success: true,
      data,
    };

    // Store in Redis cache
    try {
      await cache.set(cacheKey, response, process.env.CACHE_DURATION);
      console.log("Cached data for", cacheKey);
    } catch (cacheError) {
      console.error("Cache set error:", cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in getTopSuppliers:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
