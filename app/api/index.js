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
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function getTendersDetail(page = 1, limit = 10) {
  try {
    await connectDB();
    const skip = (page - 1) * limit;

    const [tenders, total] = await Promise.all([
      TenderModel.find({}).skip(skip).limit(limit),
      TenderModel.countDocuments({}),
    ]);

    return NextResponse.json({
      success: true,
      data: tenders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function getAwardedTenders(page = 1, limit = 10, year = "all") {
  try {
    await connectDB();

    let query = {};
    if (year && year !== "all") {
      query.awarded = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      AwardedTenderModel.find(query)
        .sort({ awarded: -1 })
        .skip(skip)
        .limit(limit),
      AwardedTenderModel.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    console.error("Error in getAwardedTenders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
