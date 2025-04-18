import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { TenderModel } from "../../../model/tenderModel";
import { cache } from "../../../lib/cache";
import { connectDB } from "../../db";

export async function GET() {
  try {
    // 1. Check redis cache first
    const cacheKey = `province-value-active`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    await connectDB();

    const data = await TenderModel.aggregate([
      {
        $match: {
          province: { $exists: true },
        },
      },
      {
        $group: {
          _id: "$province",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          province: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
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
    console.error("Error in getProvinceValueActive:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
