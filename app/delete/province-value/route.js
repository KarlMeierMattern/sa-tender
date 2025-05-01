// import { NextResponse } from "next/server";
// import { TenderModel } from "@/app/model/tenderModel";
// import { cache } from "@/app/lib/cache";
// import { connectDB } from "@/app/lib/db";

// export async function GET() {
//   try {
//     const cacheKey = `province-value-active`;
//     const cachedData = await cache.get(cacheKey);

//     if (cachedData) {
//       console.log("Cache hit for", cacheKey);
//       return NextResponse.json(cachedData);
//     }

//     await connectDB();

//     const data = await TenderModel.aggregate([
//       {
//         $match: {
//           province: { $exists: true },
//         },
//       },
//       {
//         $group: {
//           _id: "$province",
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           province: "$_id",
//           count: 1,
//         },
//       },
//       { $sort: { count: -1 } },
//     ]);

//     const response = {
//       success: true,
//       data,
//     };

//     try {
//       await cache.set(cacheKey, response, 300);
//       console.log("Cached data for", cacheKey);
//     } catch (cacheError) {
//       console.error("Cache set error:", cacheError);
//     }

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("Error in getProvinceValueActive:", error);
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }
