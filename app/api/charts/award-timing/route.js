import { NextResponse } from "next/server";
import { AwardedTenderModel } from "../../../model/awardedTenderModel";
import { cache } from "../../../lib/cache";
import { connectDB } from "../../db";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const year = url.searchParams.get("year") || "all";

    // 1. Check redis cache first
    const cacheKey = `award-timing:${year}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    await connectDB();

    // Build match stage based on year
    const matchStage = {
      department: { $exists: true, $ne: null },
      advertised: { $exists: true },
      awarded: { $exists: true },
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
        $project: {
          department: 1,
          daysToAward: {
            $divide: [
              { $subtract: ["$awarded", "$advertised"] },
              1000 * 60 * 60 * 24, // Convert milliseconds to days
            ],
          },
        },
      },
      {
        $group: {
          _id: "$department",
          averageDays: { $avg: "$daysToAward" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          averageDays: { $round: ["$averageDays", 0] },
          count: 1,
        },
      },
      { $sort: { averageDays: -1 } },
      { $limit: 10 },
    ]);

    const response = {
      success: true,
      data,
    };

    // Store in Redis cache for 5 minutes
    try {
      await cache.set(cacheKey, response, 300);
      console.log("Cached data for", cacheKey);
    } catch (cacheError) {
      console.error("Cache set error:", cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in getAwardTiming:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
