// index.js handles business logic and data fetching

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { TenderModel } from "../model/tenderModel.js";
import { AwardedTenderModel } from "../model/awardedTenderModel.js";
import { cache } from "../lib/cache.js";
dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function getTendersDetail(page = 1, limit = 10) {
  try {
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

    const [tenders, total] = await Promise.all([
      TenderModel.find({}, projection).skip(skip).limit(limit).lean(), // Use lean() to get plain objects instead of Mongoose documents
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

    // 3. Store in Redis cache for 5 minutes, with error handling
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

export async function getAwardedTenders(page = 1, limit = 10, year = "all") {
  try {
    // 1. Check redis cache first
    const cacheKey = `awarded-tenders:${page}:${limit}:${year}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    // 2. If not in cache, get from DB
    await connectDB();

    let query = {};
    if (year && year !== "all") {
      query.awarded = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`),
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

    const [data, total] = await Promise.all([
      AwardedTenderModel.find(query, projection)
        .sort({ awarded: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() to get plain objects instead of Mongoose documents
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

    // 3. Store in Redis cache for 5 minutes, with error handling
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
