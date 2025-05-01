import { NextResponse } from "next/server";
import { AwardedTenderModel } from "@/app/model/awardedTenderModel";
import { cache } from "@/app/lib/cache";
import { connectDB } from "@/app/lib/db";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const year = url.searchParams.get("year") || "all";

    // 1. Check redis cache first
    const cacheKey = `department-value-awarded:${year}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    await connectDB();

    // Build match stage based on year
    const matchStage = {
      department: { $exists: true },
      successfulBidderAmount: { $exists: true, $ne: 0 },
    };

    // Add year filter if specified
    if (year && year !== "all") {
      matchStage.awarded = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    const data = await AwardedTenderModel.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: "$department",
          totalValue: { $sum: "$successfulBidderAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          totalValue: 1,
          count: 1,
        },
      },
      { $sort: { totalValue: -1 } },
      { $limit: 10 },
    ]);

    const response = {
      success: true,
      data,
    };

    // Store in Redis cache for 5 minutes, with error handling
    try {
      await cache.set(cacheKey, response, 300);
      console.log("Cached data for", cacheKey);
    } catch (cacheError) {
      console.error("Cache set error:", cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in getDepartmentValueAwarded:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
