// lib/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import { TenderModel } from "../model/tenderModel";
import { AwardedTenderModel } from "../model/awardedTenderModel";

dotenv.config();

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function fetchAdvertisedTenders() {
  await connectDB();
  return TenderModel.find({}).lean(); // .lean() returns plain JS objects instead of Mongoose documents — which avoids the serialization issue and is also faster.
}

export async function fetchAwardedTenders() {
  await connectDB();
  return AwardedTenderModel.find({}).lean();
}
