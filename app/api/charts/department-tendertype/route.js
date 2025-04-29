// import { NextResponse } from "next/server";
// import { TenderModel } from "@/app/model/tenderModel";
// import { cache } from "../../../lib/cache";
// import { connectDB } from "../../db";

// const CACHE_KEY = "department-tendertype-breakdown";
// const CACHE_DURATION = 5 * 60; // 5 minutes

// async function getDepartmentTenderTypeData() {
//   await connectDB();

//   // Aggregate active tenders by department and tender type
//   const aggregationPipeline = [
//     {
//       $match: {
//         closingDate: { $gte: new Date() }, // Only include active tenders
//         department: { $exists: true, $ne: "" }, // Ensure department exists
//         tenderType: { $exists: true, $ne: "" }, // Ensure tender type exists
//       },
//     },
//     {
//       $group: {
//         _id: {
//           department: "$department",
//           tenderType: "$tenderType",
//         },
//         count: { $sum: 1 },
//       },
//     },
//     {
//       $sort: { "_id.department": 1, "_id.tenderType": 1 },
//     },
//   ];

//   const result = await TenderModel.aggregate(aggregationPipeline).exec();

//   // Transform the data into a format suitable for a stacked bar chart
//   // Group by department and organize tender types as properties
//   const departments = {};

//   result.forEach((item) => {
//     const department = item._id.department;
//     const tenderType = item._id.tenderType;
//     const count = item.count;

//     if (!departments[department]) {
//       departments[department] = { department };
//     }

//     departments[department][tenderType] = count;
//   });

//   // Convert to array and limit to top 10 departments by total count
//   const departmentArray = Object.values(departments);

//   // Calculate total count for each department
//   departmentArray.forEach((dept) => {
//     dept.total = Object.entries(dept)
//       .filter(([key]) => key !== "department" && key !== "total")
//       .reduce((sum, [_, count]) => sum + count, 0);
//   });

//   // Sort by total count and take top 10
//   const top10Departments = departmentArray
//     .sort((a, b) => b.total - a.total)
//     .slice(0, 10)
//     .map(({ total, ...rest }) => rest); // Remove the total property

//   return top10Departments;
// }

// export async function GET(request) {
//   try {
//     const cachedData = await cache.get(CACHE_KEY);
//     if (cachedData) {
//       console.log(`Cache hit for ${CACHE_KEY}`);
//       return NextResponse.json({ success: true, data: cachedData });
//     }

//     console.log(`Cache miss for ${CACHE_KEY}, fetching from DB.`);
//     const data = await getDepartmentTenderTypeData();

//     await cache.set(CACHE_KEY, data, CACHE_DURATION);
//     console.log(`Cache set for ${CACHE_KEY}`);

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     console.error("Error fetching department-tendertype data:", error);
//     return NextResponse.json(
//       { success: false, error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
