import { NextResponse } from "next/server";
import { AwardedTenderModel } from "@/app/model/awardedTenderModel";
import { cache } from "@/app/lib/cache";
import { connectDB } from "@/app/lib/db";

const BUCKETS = [
  // { label: "1-7", min: 1, max: 7 },
  // { label: "8-14", min: 8, max: 14 },
  // { label: "15-21", min: 15, max: 21 },
  { label: "1-30", min: 1, max: 30 },
  // { label: "31-60", min: 31, max: 60 },
  { label: "31-90", min: 31, max: 90 },
  { label: "91-180", min: 91, max: 180 },
  { label: "181-365", min: 181, max: 365 },
  { label: "366-730", min: 366, max: 730 },
  { label: "731+", min: 731, max: Infinity },
];

function getBucketLabel(days) {
  for (const bucket of BUCKETS) {
    if (days >= bucket.min && days <= bucket.max) {
      return bucket.label;
    }
  }
  return null;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const year = url.searchParams.get("year") || "all";

    // 1. Check redis cache first
    const cacheKey = `award-timing-buckets:${year}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for", cacheKey);
      return NextResponse.json({ success: true, data: cachedData });
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

    // Get all awarded tenders
    const tenders = await AwardedTenderModel.find(matchStage).select(
      "advertised awarded"
    );

    // Calculate duration in days for each tender
    const durations = tenders
      .map((tender) => {
        const advertised = new Date(tender.advertised);
        const awarded = new Date(tender.awarded);
        const durationInDays = Math.round(
          (awarded - advertised) / (1000 * 60 * 60 * 24)
        );
        return durationInDays;
      })
      .filter((duration) => !isNaN(duration) && duration > 0);

    // Initialize bucket counts
    const bucketCounts = {};
    BUCKETS.forEach((bucket) => {
      bucketCounts[bucket.label] = 0;
    });

    // Populate buckets
    durations.forEach((duration) => {
      const label = getBucketLabel(duration);
      if (label) bucketCounts[label]++;
    });

    // Format for frontend
    const data = BUCKETS.map((bucket) => ({
      label: bucket.label,
      count: bucketCounts[bucket.label],
    }));

    // Store in Redis cache for 5 minutes
    try {
      await cache.set(cacheKey, data, 300);
      console.log("Cached data for", cacheKey);
    } catch (cacheError) {
      console.error("Cache set error:", cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in getAwardTimingBuckets:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
