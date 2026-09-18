"use client";

import { useQuery } from "@tanstack/react-query";

export const useActiveTenderFilters = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: ["activeTenderFilters"],
    queryFn: async () => {
      const res = await fetch("/api/filters/active");
      if (!res.ok) throw new Error("Failed to fetch filter options");
      const data = await res.json();
      return data.data;
    },
    enabled,
  });
};
