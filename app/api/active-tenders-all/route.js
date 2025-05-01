// .route.js handles HTTP request parsing and response handling
// receives request from TenderLayout.js

import { NextResponse } from "next/server";
import { TenderModel } from "@/app/model/tenderModel";
import { cache } from "@/app/lib/cache";
import { connectDB } from "@/app/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // 1. Check redis cache first
    const cacheKey = `tenders:${page}:${limit}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    // 2. If not in cache, connect to DB
    await connectDB();
    const skip = (page - 1) * limit;

    // Only select necessary fields to reduce data size
    const projection = {
      category: 1,
      description: 1,
      advertised: 1,
      closingDate: 1,
      tenderNumber: 1,
      department: 1,
      tenderType: 1,
      province: 1,
      placeServicesRequired: 1,
    };

    // Use Promise.all for parallel execution
    const [tenders, total] = await Promise.all([
      TenderModel.find({}, projection)
        .sort({ datePublished: -1 }) // Use indexed field for sorting
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      TenderModel.countDocuments({}),
    ]);

    const response = {
      success: true,
      data: tenders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit,
      },
    };

    // 3. Store in Redis cache for 5 minutes
    try {
      await cache.set(cacheKey, response, 300);
      console.log("Cached data for", cacheKey);
    } catch (cacheError) {
      console.error("Cache set error:", cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in getTendersDetail:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
