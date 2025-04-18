import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { TenderModel } from "../../../model/tenderModel";
import { cache } from "../../../lib/cache";
import { connectDB } from "../../db";

export async function GET() {
  try {
    // 1. Check redis cache first
    const cacheKey = `category-count-active`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    await connectDB();

    // First, get all categories with their counts
    const aggregationResult = await TenderModel.aggregate([
      {
        $match: {
          category: { $exists: true, $ne: null }, // only include categories that exist
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    console.log("Aggregation result:", aggregationResult);

    // Process the results
    let processedData = aggregationResult;

    // If we have more than 10 categories, group the rest as "Other"
    if (processedData.length > 10) {
      const topTen = processedData.slice(0, 10);
      const otherSum = processedData
        .slice(10)
        .reduce((sum, item) => sum + (item.count || 0), 0);

      processedData = [
        ...topTen,
        {
          category: "Other",
          count: otherSum,
        },
      ];
    }

    const response = {
      success: true,
      data: processedData,
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
    console.error("Error in getCategoryCountActive:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
