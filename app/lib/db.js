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

export async function fetchAdvertisedTenders() {
  const CACHE_KEY = "advertised_tenders";

  try {
    // Try to get from cache first
    const cachedData = await cache.get(CACHE_KEY);
    if (cachedData) {
      console.log("Cache hit: Advertised tenders");
      return cachedData;
    }

    // If not in cache, fetch from DB
    await connectDB();
    console.log("Fetching advertised tenders...");
    const tenders = await TenderModel.find({}).lean().exec();
    console.log(`Found ${tenders.length} advertised tenders`);

    // Cache the results
    await cache.set(CACHE_KEY, tenders);

    return tenders;
  } catch (error) {
    console.error("Error fetching advertised tenders:", error);
    throw error;
  }
}

export async function fetchAwardedTenders() {
  const CACHE_KEY = "awarded_tenders";

  try {
    // Try to get from cache first
    const cachedData = await cache.get(CACHE_KEY);
    if (cachedData) {
      console.log("Cache hit: Awarded tenders");
      return cachedData;
    }

    // If not in cache, fetch from DB
    await connectDB();
    console.log("Fetching awarded tenders...");
    const tenders = await AwardedTenderModel.find({}).lean().exec();
    console.log(`Found ${tenders.length} awarded tenders`);

    // Cache the results
    await cache.set(CACHE_KEY, tenders);

    return tenders;
  } catch (error) {
    console.error("Error fetching awarded tenders:", error);
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
