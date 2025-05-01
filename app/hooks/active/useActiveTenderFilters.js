// ./app/components/active/AdvertisedTenders.js
// ./app/api/filters-active/route.js

"use client";

import { useQuery } from "@tanstack/react-query";

export const useActiveTenderFilters = () => {
  return useQuery({
    queryKey: ["activeTenderFilters"],
    queryFn: async () => {
      const res = await fetch("/api/filters-active");
      if (!res.ok) throw new Error("Failed to fetch filter options");
      const data = await res.json();
      return data.data; // Return just the data object with [categories, departments, provinces]
    },
    staleTime: 1000 * 60 * 10, // cache for 10 minutes
  });
};
