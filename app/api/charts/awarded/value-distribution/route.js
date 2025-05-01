import { NextResponse } from "next/server";
import { AwardedTenderModel } from "@/app/model/awardedTenderModel";
import { cache } from "@/app/lib/cache";
import { connectDB } from "@/app/lib/db";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const year = url.searchParams.get("year") || "all";

    // 1. Check redis cache first
    const cacheKey = `value-distribution:${year}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    await connectDB();

    // Build match stage based on year
    const matchStage = {
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
        $bucket: {
          groupBy: "$successfulBidderAmount",
          boundaries: [0, 1000000, 5000000, 10000000, 50000000, Infinity],
          default: "Other",
          output: {
            count: { $sum: 1 },
            totalValue: { $sum: "$successfulBidderAmount" },
          },
        },
      },
      {
        $project: {
          _id: 0,
          range: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "< R1M" },
                { case: { $eq: ["$_id", 1000000] }, then: "R1M - R5M" },
                { case: { $eq: ["$_id", 5000000] }, then: "R5M - R10M" },
                { case: { $eq: ["$_id", 10000000] }, then: "R10M - R50M" },
                { case: { $eq: ["$_id", 50000000] }, then: "> R50M" },
              ],
              default: "Other",
            },
          },
          count: 1,
          totalValue: 1,
        },
      },
      { $sort: { _id: 1 } },
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
    console.error("Error in getValueDistribution:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
