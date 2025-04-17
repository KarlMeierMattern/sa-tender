"use client";

import { useQuery } from "@tanstack/react-query";

export function useAwardedTendersTable({ page = 1, limit = 10 } = {}) {
  // Fetch table data
  const { data: tableData, isLoading } = useQuery({
    queryKey: ["awarded-tenders-table", page],
    queryFn: async () => {
      const res = await fetch(
        `/api/tenders-detail-awarded?page=${page}&limit=${limit}`
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get the current page of data
  const getCurrentPageData = () => {
    if (!tableData?.data) return [];
    return tableData?.data || [];
  };

  // Get total count
  const getTotalCount = () => {
    return tableData?.pagination?.total || 0;
  };

  return {
    data: tableData,
    isLoading,
    getCurrentPageData,
    getTotalCount,
  };
}
