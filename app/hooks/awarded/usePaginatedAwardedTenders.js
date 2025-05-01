// // Unused hook

// "use client";

// import { useQuery } from "@tanstack/react-query";

// // Exported queryKey function
// export const awardedTendersQueryKey = ({
//   page = 1,
//   limit = 10,
//   category = "",
//   department = "",
//   province = "",
//   advertised = "",
//   awarded = "",
// }) => [
//   "awarded-tenders-table",
//   page,
//   limit,
//   category,
//   department,
//   province,
//   advertised,
//   awarded,
// ];

// // Exported queryFn function
// export const awardedTendersQueryFn = async ({
//   page = 1,
//   limit = 10,
//   category = "",
//   department = "",
//   province = "",
//   advertised = "",
//   awarded = "",
// }) => {
//   const params = new URLSearchParams({
//     page: page.toString(),
//     limit: limit.toString(),
//   });

//   // Add filter parameters if they exist
//   if (category) params.append("category", category);
//   if (department) params.append("department", department);
//   if (province) params.append("province", province);
//   if (advertised) params.append("advertised", advertised);
//   if (awarded) params.append("awarded", awarded);

//   const res = await fetch(`/api/tenders-detail-awarded?${params.toString()}`);
//   return res.json();
// };

// export function usePaginatedAwardedTenders({
//   page = 1,
//   limit = 10,
//   category = "",
//   department = "",
//   province = "",
//   advertised = "",
//   awarded = "",
// } = {}) {
//   return useQuery({
//     queryKey: awardedTendersQueryKey({
//       page,
//       limit,
//       category,
//       department,
//       province,
//       advertised,
//       awarded,
//     }),
//     queryFn: () =>
//       awardedTendersQueryFn({
//         page,
//         limit,
//         category,
//         department,
//         province,
//         advertised,
//         awarded,
//       }),
//     staleTime: 1000 * 60 * 5,
//   });
// }
