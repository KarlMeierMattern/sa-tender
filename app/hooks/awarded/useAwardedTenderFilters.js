"use client";

import { useQuery } from "@tanstack/react-query";

export const awardedTenderFiltersKey = ["awardedTenderFilters"];

export const awardedTenderFiltersFn = async () => {
  const res = await fetch("/api/filters-awarded");
  if (!res.ok) throw new Error("Failed to fetch filter options");
  return res.json(); // data.data includes [categories, departments, provinces]
};

export const useAwardedTenderFilters = () => {
  return useQuery({
    queryKey: awardedTenderFiltersKey,
    queryFn: awardedTenderFiltersFn,
    staleTime: 1000 * 60 * 10, // cache for 10 minutes
  });
};
