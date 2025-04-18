import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { TenderModel } from "../../../model/tenderModel";
import { cache } from "../../../lib/cache";
import { connectDB } from "../../db";

export async function GET() {
  try {
    // 1. Check redis cache first
    const cacheKey = `department-count-active`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    await connectDB();

    const data = await TenderModel.aggregate([
      {
        $match: {
          department: { $exists: true },
        },
      },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
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
    console.error("Error in getDepartmentCountActive:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
