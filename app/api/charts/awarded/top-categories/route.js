import { NextResponse } from "next/server";
import { AwardedTenderModel } from "@/app/model/awardedTenderModel";
import { cache } from "@/app/lib/cache";
import { connectDB } from "@/app/lib/db";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const year = url.searchParams.get("year") || "all";

    const cachekey = `top-categories:${year}`;
    const cachedData = await cache.get(cachekey);

    if (cachedData) {
      console.log("Cache hit for", cachekey);
      return NextResponse.json(cachedData);
    }

    await connectDB();

    const matchStage = {
      category: { $exists: true, $ne: null },
      successfulBidderAmount: { $exists: true, $ne: 0 },
    };

    if (year && year !== "all") {
      matchStage.awarded = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    const data = await AwardedTenderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$category",
          totalValue: { $sum: "$successfulBidderAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          totalValue: 1,
          count: 1,
        },
      },
      { $sort: { totalValue: -1 } },
      { $limit: 10 },
    ]);

    const response = {
      success: true,
      data,
    };

    try {
      await cache.set(cachekey, response, 300);
      console.log("Cached data for", cachekey);
    } catch (cacheError) {
      console.error("Cache set error:", cacheError);
    }
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in getTopCategories:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
