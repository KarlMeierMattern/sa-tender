import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { scrapeTenders } from "../lib/scrapers/index.js";
import { TenderModel } from "../model/tenderModel.js";
import { AwardedTenderModel } from "../model/awardedTenderModel.js";
dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function getTendersDetail() {
  try {
    await connectDB();
    const tenders = await TenderModel.find({});
    return NextResponse.json({ success: true, data: tenders });
  } catch (error) {
    console.error("Error fetching tenders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function getAwardedTenders() {
  try {
    await connectDB();
    const tenders = await AwardedTenderModel.find({});
    return NextResponse.json({ success: true, data: tenders });
  } catch (error) {
    console.error("Error fetching awarded tenders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function getTenders() {
  try {
    const tenders = await scrapeTenders();
    return NextResponse.json({ success: true, data: tenders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
