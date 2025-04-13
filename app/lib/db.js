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

export async function fetchAdvertisedTenders() {
  const CACHE_KEY_PREFIX = "advertised_tenders";

  try {
    // Try to get total count from cache
    const totalCountKey = `${CACHE_KEY_PREFIX}_total`;
    const cachedTotal = await cache.get(totalCountKey);

    if (cachedTotal) {
      // Get all chunks and combine
      const chunks = [];
      for (let i = 0; i < Math.ceil(cachedTotal / ITEMS_PER_CHUNK); i++) {
        const chunkData = await cache.get(`${CACHE_KEY_PREFIX}_${i}`);
        if (chunkData) chunks.push(...chunkData);
      }

      if (chunks.length === cachedTotal) {
        console.log("Cache hit: Advertised tenders");
        return chunks;
      }
    }

    // If not in cache or incomplete, fetch from DB
    await connectDB();
    console.log("Fetching advertised tenders...");
    const tenders = await TenderModel.find({}).lean().exec(); // lean() tells Mongoose not to create full model instances, improving memory and speed.
    console.log(`Found ${tenders.length} advertised tenders`);

    // Cache in chunks
    await cache.set(totalCountKey, tenders.length);
    for (let i = 0; i < tenders.length; i += ITEMS_PER_CHUNK) {
      const chunk = tenders.slice(i, i + ITEMS_PER_CHUNK);
      await cache.set(`${CACHE_KEY_PREFIX}_${i / ITEMS_PER_CHUNK}`, chunk);
    }

    return tenders;
  } catch (error) {
    console.error("Error fetching advertised tenders:", error);
    throw error;
  }
}

export async function fetchAwardedTenders() {
  const CACHE_KEY_PREFIX = "awarded_tenders";

  try {
    // Try to get total count from cache
    const totalCountKey = `${CACHE_KEY_PREFIX}_total`;
    const cachedTotal = await cache.get(totalCountKey);

    if (cachedTotal) {
      // Get all chunks and combine
      const chunks = [];
      for (let i = 0; i < Math.ceil(cachedTotal / ITEMS_PER_CHUNK); i++) {
        const chunkData = await cache.get(`${CACHE_KEY_PREFIX}_${i}`);
        if (chunkData) chunks.push(...chunkData);
      }

      if (chunks.length === cachedTotal) {
        console.log("Cache hit: Awarded tenders");
        return chunks;
      }
    }

    // If not in cache or incomplete, fetch from DB
    await connectDB();
    console.log("Fetching awarded tenders...");
    const tenders = await AwardedTenderModel.find({}).lean().exec();
    console.log(`Found ${tenders.length} awarded tenders`);

    // Cache in chunks
    await cache.set(totalCountKey, tenders.length);
    for (let i = 0; i < tenders.length; i += ITEMS_PER_CHUNK) {
      const chunk = tenders.slice(i, i + ITEMS_PER_CHUNK);
      await cache.set(`${CACHE_KEY_PREFIX}_${i / ITEMS_PER_CHUNK}`, chunk);
    }

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
