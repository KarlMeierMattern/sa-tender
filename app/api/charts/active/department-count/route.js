import { NextResponse } from "next/server";
import { TenderModel } from "@/app/model/tenderModel";
import { cache } from "@/app/lib/cache";
import { connectDB } from "@/app/lib/db";

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
      // Normalize department: trim whitespace and uppercase for consistent grouping
      {
        $addFields: {
          departmentNormalized: {
            $toUpper: {
              $ifNull: [{ $trim: { input: "$department" } }, ""],
            },
          },
        },
      },
      // Group by normalized department, bucket blanks as "UNKNOWN"
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$departmentNormalized", ""] },
              "UNKNOWN",
              "$departmentNormalized",
            ],
          },
          count: { $sum: 1 },
        },
      },
      // Project human-friendly label, mapping UNKNOWN -> "Unknown"
      {
        $project: {
          _id: 0,
          department: {
            $cond: [{ $eq: ["$_id", "UNKNOWN"] }, "Unknown", "$_id"],
          },
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
    console.error("Error in getDepartmentCountActive:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
