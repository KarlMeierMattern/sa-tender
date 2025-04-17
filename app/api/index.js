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

// Department Value Awarded
export async function getDepartmentValueAwarded(year = "all") {
  try {
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

// Province Value Awarded
export async function getProvinceValueAwarded(year = "all") {
  try {
    // 1. Check redis cache first
    const cacheKey = `province-value-awarded:${year}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    await connectDB();

    // Build match stage based on year
    const matchStage = {
      province: { $exists: true },
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
          _id: "$province",
          totalValue: { $sum: "$successfulBidderAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          province: "$_id",
          totalValue: 1,
          count: 1,
        },
      },
      { $sort: { totalValue: -1 } },
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
    console.error("Error in getProvinceValueAwarded:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Value Distribution
export async function getValueDistributionAwarded(year = "all") {
  try {
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

// Top Suppliers
export async function getTopSuppliersAwarded(year = "all") {
  try {
    // 1. Check redis cache first
    const cacheKey = `top-suppliers:${year}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    await connectDB();

    // Build match stage based on year
    const matchStage = {
      successfulBidderName: { $exists: true, $ne: null },
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
          _id: "$successfulBidderName",
          totalValue: { $sum: "$successfulBidderAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          supplier: "$_id",
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
    console.error("Error in getTopSuppliers:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Award Timing
export async function getAwardTiming(year = "all") {
  try {
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

// Lowest Award Timing
export async function getLowestAwardTiming(year = "all") {
  try {
    // 1. Check redis cache first
    const cacheKey = `lowest-award-timing:${year}`;
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
      { $sort: { averageDays: 1 } }, // Sort in ascending order for lowest days
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
    console.error("Error in getLowestAwardTiming:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function getProvinceCountActive() {
  try {
    // 1. Check redis cache first
    const cacheKey = `province-count-active`;
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
    console.error("Error in getProvinceCountActive:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function getProvinceValueActive() {
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

export async function getDepartmentCountActive() {
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

export async function getCategoryCountActive() {
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

export async function getTenderTypeCountActive() {
  try {
    // 1. Check redis cache first
    const cacheKey = `tender-type-count-active`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json(cachedData);
    }

    await connectDB();

    const data = await TenderModel.aggregate([
      {
        $match: {
          tenderType: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$tenderType",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
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
    console.error("Error in getTenderTypeCountActive:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
