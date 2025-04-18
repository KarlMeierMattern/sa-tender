// .route.js handles HTTP request parsing and response handling
// receives request from TenderLayout.js

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { AwardedTenderModel } from "../../model/awardedTenderModel";
import { cache } from "../../lib/cache";
import { connectDB } from "../db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const year = searchParams.get("year");
    const category = searchParams.get("category");
    const department = searchParams.get("department");
    const province = searchParams.get("province");
    const advertised = searchParams.get("advertised");
    const awarded = searchParams.get("awarded");

    // 1. Check redis cache first
    const cacheKey = `awarded-tenders:${page}:${limit}:${year}:${JSON.stringify(
      {
        category,
        department,
        province,
        advertised,
        awarded,
      }
    )}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    // 2. If not in cache, get from DB
    await connectDB();

    // Build query efficiently
    const query = {};
    const dateRange = {};

    // Year filter
    if (year && year !== "all") {
      dateRange.$gte = new Date(`${year}-01-01`);
      dateRange.$lt = new Date(`${parseInt(year) + 1}-01-01`);
      query.awarded = dateRange;
    }

    // Category filter with $in for multiple values
    if (category) {
      query.category = { $in: category.split(",") };
    }

    // Department filter with $in for multiple values
    if (department) {
      query.department = { $in: department.split(",") };
    }

    // Province filter with $in for multiple values
    if (province) {
      query.province = { $in: province.split(",") };
    }

    // Date filters with proper date handling
    if (advertised) {
      const advertisedDate = new Date(advertised);
      query.advertised = {
        $gte: new Date(advertisedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(advertisedDate.setHours(23, 59, 59, 999)),
      };
    }

    if (awarded) {
      const awardedDate = new Date(awarded);
      query.awarded = {
        $gte: new Date(awardedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(awardedDate.setHours(23, 59, 59, 999)),
      };
    }

    const skip = (page - 1) * limit;

    // Only select necessary fields to reduce data size
    const projection = {
      category: 1,
      description: 1,
      advertised: 1,
      awarded: 1,
      tenderNumber: 1,
      department: 1,
      province: 1,
      successfulBidderName: 1,
      successfulBidderAmount: 1,
    };

    // Use Promise.all for parallel execution
    const [data, total] = await Promise.all([
      AwardedTenderModel.find(query, projection)
        .sort({ awarded: -1 }) // Use indexed field for sorting
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      AwardedTenderModel.countDocuments(query),
    ]);

    const response = {
      success: true,
      data,
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
    console.error("Error in getAwardedTenders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
