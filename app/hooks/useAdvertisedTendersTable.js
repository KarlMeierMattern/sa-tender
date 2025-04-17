"use client";

import { useQuery } from "@tanstack/react-query";

export function useAdvertisedTenders({ page = 1, limit = 10 } = {}) {
  // Query for paginated table data
  const paginatedData = useQuery({
    queryKey: ["advertised-tenders", page, limit],
    queryFn: async () => {
      const res = await fetch(
        `/api/tenders-detail?page=${page}&limit=${limit}`
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for all data (used in visualizations)
  const allData = useQuery({
    queryKey: ["advertised-tenders-full"],
    queryFn: async () => {
      const res = await fetch("/api/tenders-detail?limit=999999");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    paginatedData,
    allData,
  };
}
