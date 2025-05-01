import { NextResponse } from "next/server";
import { TenderModel } from "@/app/model/tenderModel";
import { cache } from "@/app/lib/cache";
import { connectDB } from "@/app/lib/db";

const CACHE_KEY = "active-timeline";
const CACHE_DURATION = 5 * 60; // 5 minutes

async function getActiveTimelineData() {
  await connectDB();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const aggregationPipeline = [
    {
      $match: {
        datePublished: { $gte: thirtyDaysAgo },
        closingDate: { $gte: new Date() }, // Only include tenders that haven't closed yet
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$datePublished" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        count: 1,
      },
    },
  ];

  const data = await TenderModel.aggregate(aggregationPipeline).exec();
  return data;
}

export async function GET(request) {
  try {
    const cachedData = await cache.get(CACHE_KEY);
    if (cachedData) {
      console.log(`Cache hit for ${CACHE_KEY}`);
      return NextResponse.json({ success: true, data: cachedData });
    }

    console.log(`Cache miss for ${CACHE_KEY}, fetching from DB.`);
    const data = await getActiveTimelineData();

    await cache.set(CACHE_KEY, data, CACHE_DURATION);
    console.log(`Cache set for ${CACHE_KEY}`);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching active timeline data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
