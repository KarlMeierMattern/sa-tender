import mongoose from "mongoose";
import dotenv from "dotenv";
import { TenderModel } from "../model/tenderModel";
import { AwardedTenderModel } from "../model/awardedTenderModel";
import { cache } from "./cache.js";

dotenv.config();

// Increase timeouts and add connection options
const MONGODB_OPTIONS = {
  serverSelectionTimeoutMS: 30000, // Increase from default 30s to handle slow connections
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  retryWrites: true,
};

// Cache the connection
let isConnected = false;

async function connectDB() {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    if (mongoose.connections[0].readyState) {
      isConnected = true;
      console.log("Using existing MongoDB connection");
      return;
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, MONGODB_OPTIONS);
    isConnected = true;
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    isConnected = false;
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}

const ITEMS_PER_CHUNK = 100; // Adjust based on your average item size

// Separate query builders for advertised and awarded tenders
function buildAdvertisedTenderQuery(filters = {}) {
  const query = {};

  // Fields from TenderModel
  if (filters.category?.length) {
    query.category = { $in: filters.category };
  }
  if (filters.department?.length) {
    query.department = { $in: filters.department };
  }
  if (filters.province?.length) {
    query.province = { $in: filters.province };
  }
  if (filters.description) {
    query.description = { $regex: new RegExp(filters.description, "i") };
  }
  if (filters.tenderNumber) {
    query.tenderNumber = { $regex: new RegExp(filters.tenderNumber, "i") };
  }
  if (filters.tenderType) {
    query.tenderType = { $regex: new RegExp(filters.tenderType, "i") };
  }
  if (filters.placeServicesRequired) {
    query.placeServicesRequired = {
      $regex: new RegExp(filters.placeServicesRequired, "i"),
    };
  }
  // Date fields
  if (filters.advertised) {
    query.advertised = {
      $gte: new Date(filters.advertised),
      $lt: new Date(
        new Date(filters.advertised).setDate(
          new Date(filters.advertised).getDate() + 1
        )
      ),
    };
  }
  if (filters.closingDate) {
    query.closingDate = {
      $gte: new Date(filters.closingDate),
      $lt: new Date(
        new Date(filters.closingDate).setDate(
          new Date(filters.closingDate).getDate() + 1
        )
      ),
    };
  }
  if (filters.datePublished) {
    query.datePublished = {
      $gte: new Date(filters.datePublished),
      $lt: new Date(
        new Date(filters.datePublished).setDate(
          new Date(filters.datePublished).getDate() + 1
        )
      ),
    };
  }
  // String field
  if (filters.closing) {
    query.closing = { $regex: new RegExp(filters.closing, "i") };
  }

  return query;
}

function buildAwardedTenderQuery(filters = {}) {
  const query = {};

  // Fields from AwardedTenderModel
  if (filters.category?.length) {
    query.category = { $in: filters.category };
  }
  if (filters.department?.length) {
    query.department = { $in: filters.department };
  }
  if (filters.province?.length) {
    query.province = { $in: filters.province };
  }
  if (filters.description) {
    query.description = { $regex: new RegExp(filters.description, "i") };
  }
  if (filters.tenderNumber) {
    query.tenderNumber = { $regex: new RegExp(filters.tenderNumber, "i") };
  }
  if (filters.tenderType) {
    query.tenderType = { $regex: new RegExp(filters.tenderType, "i") };
  }
  if (filters.placeServicesRequired) {
    query.placeServicesRequired = {
      $regex: new RegExp(filters.placeServicesRequired, "i"),
    };
  }
  // Additional fields specific to awarded tenders
  if (filters.successfulBidderName) {
    query.successfulBidderName = {
      $regex: new RegExp(filters.successfulBidderName, "i"),
    };
  }
  if (filters.successfulBidderAmount) {
    query.successfulBidderAmount = filters.successfulBidderAmount;
  }
  if (filters.specialConditions) {
    query.specialConditions = {
      $regex: new RegExp(filters.specialConditions, "i"),
    };
  }
  // Date fields
  if (filters.advertised) {
    query.advertised = {
      $gte: new Date(filters.advertised),
      $lt: new Date(
        new Date(filters.advertised).setDate(
          new Date(filters.advertised).getDate() + 1
        )
      ),
    };
  }
  if (filters.awarded) {
    query.awarded = {
      $gte: new Date(filters.awarded),
      $lt: new Date(
        new Date(filters.awarded).setDate(
          new Date(filters.awarded).getDate() + 1
        )
      ),
    };
  }
  if (filters.datePublished) {
    query.datePublished = {
      $gte: new Date(filters.datePublished),
      $lt: new Date(
        new Date(filters.datePublished).setDate(
          new Date(filters.datePublished).getDate() + 1
        )
      ),
    };
  }
  if (filters.closingDate) {
    query.closingDate = {
      $gte: new Date(filters.closingDate),
      $lt: new Date(
        new Date(filters.closingDate).setDate(
          new Date(filters.closingDate).getDate() + 1
        )
      ),
    };
  }

  return query;
}

// Add this helper function to clean the MongoDB documents
function serializeTender(tender) {
  return {
    id: tender._id.toString(), // Convert ObjectId to string
    category: tender.category || "",
    description: tender.description || "",
    advertised: tender.advertised ? tender.advertised.toISOString() : null,
    closing: tender.closing || "",
    datePublished: tender.datePublished
      ? tender.datePublished.toISOString()
      : null,
    closingDate: tender.closingDate ? tender.closingDate.toISOString() : null,
    tenderNumber: tender.tenderNumber || "",
    department: tender.department || "",
    tenderType: tender.tenderType || "",
    province: tender.province || "",
    placeServicesRequired: tender.placeServicesRequired || "",
    // Add for awarded tenders
    awarded: tender.awarded ? tender.awarded.toISOString() : null,
    successfulBidderName: tender.successfulBidderName || "",
    successfulBidderAmount: tender.successfulBidderAmount || 0,
    specialConditions: tender.specialConditions || "",
  };
}

// Update the fetch functions to use the appropriate query builder
export async function fetchAdvertisedTenders(
  page = 1,
  limit = 10,
  filters = {}
) {
  try {
    await connectDB();
    const query = buildAdvertisedTenderQuery(filters);
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Get all counts in parallel
    const [total, closingSoonCount, recentlyAddedCount, paginatedTenders] =
      await Promise.all([
        TenderModel.countDocuments(query),
        TenderModel.countDocuments({
          ...query,
          closingDate: {
            $gte: today,
            $lte: sevenDaysFromNow,
          },
        }),
        TenderModel.countDocuments({
          ...query,
          advertised: {
            $gte: sevenDaysAgo,
            $lte: today,
          },
        }),
        TenderModel.find(query)
          .lean()
          .sort({ advertised: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
      ]);

    return {
      tenders: paginatedTenders.map(serializeTender),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit,
      },
      metrics: {
        closingSoon: closingSoonCount,
        recentlyAdded: recentlyAddedCount,
      },
    };
  } catch (error) {
    console.error("Error fetching advertised tenders:", error);
    throw error;
  }
}

export async function fetchAwardedTenders(page = 1, limit = 10, filters = {}) {
  try {
    await connectDB();
    const query = buildAwardedTenderQuery(filters);

    // Only get the count, not all tenders
    const total = await AwardedTenderModel.countDocuments(query);

    // Get only paginated data
    const paginatedTenders = await AwardedTenderModel.find(query)
      .lean()
      .sort({ awarded: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      tenders: paginatedTenders.map(serializeTender),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit,
      },
    };
  } catch (error) {
    console.error("Error fetching awarded tenders:", error);
    throw error;
  }
}

// Add this new function to fetch all tenders for charts
export async function fetchAllAdvertisedTendersForCharts() {
  try {
    await connectDB();
    const tenders = await TenderModel.find().lean().sort({ advertised: -1 });

    return tenders.map(serializeTender);
  } catch (error) {
    console.error("Error fetching all advertised tenders for charts:", error);
    throw error;
  }
}

export async function fetchAllAwardedTendersForCharts() {
  try {
    await connectDB();
    const tenders = await AwardedTenderModel.find()
      .lean()
      .sort({ awarded: -1 });

    return tenders.map(serializeTender);
  } catch (error) {
    console.error("Error fetching all awarded tenders for charts:", error);
    throw error;
  }
}

// Add a function to close connection if needed
export async function closeConnection() {
  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
}
