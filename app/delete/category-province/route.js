// import { NextResponse } from "next/server";
// import { TenderModel } from "@/app/model/tenderModel";
// import { cache } from "../../../lib/cache";
// import { connectDB } from "../../../lib/db";

// const CACHE_KEY = "category-province-breakdown";
// const CACHE_DURATION = 5 * 60; // 5 minutes

// async function getCategoryProvinceData() {
//   await connectDB();

//   // Aggregate active tenders by category and province
//   const aggregationPipeline = [
//     {
//       $match: {
//         closingDate: { $gte: new Date() }, // Only include active tenders
//         category: { $exists: true, $ne: "" }, // Ensure category exists
//         province: { $exists: true, $ne: "" }, // Ensure province exists
//       },
//     },
//     {
//       $group: {
//         _id: {
//           category: "$category",
//           province: "$province",
//         },
//         count: { $sum: 1 },
//       },
//     },
//     {
//       $sort: { "_id.category": 1, "_id.province": 1 },
//     },
//   ];

//   const result = await TenderModel.aggregate(aggregationPipeline).exec();

//   // Transform the data into a format suitable for a stacked bar chart
//   // Group by category and organize provinces as properties
//   const categories = {};

//   result.forEach((item) => {
//     const category = item._id.category;
//     const province = item._id.province;
//     const count = item.count;

//     if (!categories[category]) {
//       categories[category] = { category };
//     }

//     categories[category][province] = count;
//   });

//   // Convert to array and limit to top 10 categories by total count
//   const categoryArray = Object.values(categories);

//   // Calculate total count for each category
//   categoryArray.forEach((cat) => {
//     cat.total = Object.entries(cat)
//       .filter(([key]) => key !== "category" && key !== "total")
//       .reduce((sum, [_, count]) => sum + count, 0);
//   });

//   // Sort by total count and take top 10
//   const top10Categories = categoryArray
//     .sort((a, b) => b.total - a.total)
//     .slice(0, 10)
//     .map(({ total, ...rest }) => rest); // Remove the total property

//   return top10Categories;
// }

// export async function GET(request) {
//   try {
//     const cachedData = await cache.get(CACHE_KEY);
//     if (cachedData) {
//       console.log(`Cache hit for ${CACHE_KEY}`);
//       return NextResponse.json({ success: true, data: cachedData });
//     }

//     console.log(`Cache miss for ${CACHE_KEY}, fetching from DB.`);
//     const data = await getCategoryProvinceData();

//     await cache.set(CACHE_KEY, data, CACHE_DURATION);
//     console.log(`Cache set for ${CACHE_KEY}`);

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     console.error("Error fetching category-province data:", error);
//     return NextResponse.json(
//       { success: false, error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
