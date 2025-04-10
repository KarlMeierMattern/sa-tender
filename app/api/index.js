import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { generateObject } from "ai";
import { scrapeTenders } from "@/app/lib/scrapers";
import { scrapeTendersTest } from "@/app/lib/scrapers";
import { TenderModel } from "@/app/model/tenderModel";
import { AwardedTenderModel } from "@/app/model/awardedTenderModel";
dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
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

export async function getTendersDetail() {
  try {
    await connectDB();
    const tenders = await TenderModel.find({});
    return NextResponse.json({ success: true, data: tenders });
  } catch (error) {
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
    console.log("Awarded tenders count:", tenders.length);
    return NextResponse.json({ success: true, data: tenders });
  } catch (error) {
    console.error("Error fetching awarded tenders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function getTendersTest() {
  try {
    const tenders = await scrapeTendersTest();
    return NextResponse.json({ success: true, data: tenders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function getAiResponse() {
  const tenderData = await scrapeTenders();

  const prompt = `The following descriptions relate to South African government tenders, list the specific tenders I should go after and why if my business is in logistics: ${tenderData}`;

  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini", {
        structuredOutputs: true,
      }),
      schemaName: "recipe",
      schemaDescription: "A recipe for lasagna.",
      schema: z.object({
        name: z.string(),
        items: z.array(
          z.object({
            key: z.string(),
            value: z.string(),
          })
        ),
        steps: z.array(z.string()),
      }),
      prompt: prompt,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse(
      { sucess: false, error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function getCategorizedTenders() {
  try {
    const tenders = await scrapeTenders();
    const categorizedTenders = {};

    tenders.forEach((tender) => {
      const category = tender.category;
      if (!categorizedTenders[category]) {
        categorizedTenders[category] = [];
      } else {
        categorizedTenders[category].push({
          description: tender.description,
          advertised: tender.advertised,
          closing: tender.closing,
        });
      }
    });

    return NextResponse.json({ success: true, data: categorizedTenders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
