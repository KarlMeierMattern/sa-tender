import { NextResponse } from "next/server";
import { TenderModel } from "@/app/model/tenderModel";
import { cache } from "../../../lib/cache";
import { connectDB } from "../../db";

const CACHE_KEY = "tender-duration-distribution";
const CACHE_DURATION = 5 * 60; // 5 minutes

async function getTenderDurationData() {
  await connectDB();

  // Get all active tenders
  const activeTenders = await TenderModel.find({
    closingDate: { $gte: new Date() },
  }).select("advertised closingDate");

  // Calculate duration for each tender in days
  const durations = activeTenders
    .map((tender) => {
      const advertised = new Date(tender.advertised);
      const closingDate = new Date(tender.closingDate);

      // Calculate duration in days (rounded to nearest whole number)
      const durationInDays = Math.round(
        (closingDate - advertised) / (1000 * 60 * 60 * 24)
      );
      return durationInDays;
    })
    .filter((duration) => !isNaN(duration) && duration > 0);

  // Create histogram buckets
  const buckets = [
    { range: "1-7", label: "1-7 days", count: 0 },
    { range: "8-14", label: "8-14 days", count: 0 },
    { range: "15-21", label: "15-21 days", count: 0 },
    { range: "22-30", label: "22-30 days", count: 0 },
    { range: "31-60", label: "31-60 days", count: 0 },
    { range: "61+", label: "61+ days", count: 0 },
  ];

  // Populate buckets
  durations.forEach((duration) => {
    if (duration <= 7) buckets[0].count++;
    else if (duration <= 14) buckets[1].count++;
    else if (duration <= 21) buckets[2].count++;
    else if (duration <= 30) buckets[3].count++;
    else if (duration <= 60) buckets[4].count++;
    else buckets[5].count++;
  });

  return buckets;
}

export async function GET(request) {
  try {
    const cachedData = await cache.get(CACHE_KEY);
    if (cachedData) {
      console.log(`Cache hit for ${CACHE_KEY}`);
      return NextResponse.json({ success: true, data: cachedData });
    }

    console.log(`Cache miss for ${CACHE_KEY}, fetching from DB.`);
    const data = await getTenderDurationData();

    await cache.set(CACHE_KEY, data, CACHE_DURATION);
    console.log(`Cache set for ${CACHE_KEY}`);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching tender duration data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
