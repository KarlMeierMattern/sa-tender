// Fetches unique values for categories, departments, and provinces from the active tenders
// To be used in the filter component of the active tenders page

// ./app/components/active/ActiveTenders.js -> prefetch data
// ./app/api/filters-active/route.js -> fetch data

"use client";

import { useQuery } from "@tanstack/react-query";

export const useActiveTenderFilters = () => {
  return useQuery({
    queryKey: ["activeTenderFilters"],
    queryFn: async () => {
      const res = await fetch("/api/filters/active");
      if (!res.ok) throw new Error("Failed to fetch filter options");
      const data = await res.json();
      return data.data; // Return just the data object with [categories, departments, provinces]
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
