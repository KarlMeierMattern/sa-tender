"use client";

import { useQuery } from "@tanstack/react-query";

export function useAwardedTendersTable({ page = 1, limit = 10 } = {}) {
  // Query for paginated table data
  const paginatedData = useQuery({
    queryKey: ["awarded-tenders-table", page],
    queryFn: async () => {
      const res = await fetch(
        `/api/tenders-detail-awarded?page=${page}&limit=${limit}`
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for all data (used for filtering)
  const allData = useQuery({
    queryKey: ["awarded-tenders-full"],
    queryFn: async () => {
      const res = await fetch("/api/tenders-detail-awarded?limit=999999");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Helper function to paginate filtered data
  const paginateData = (filteredData, currentPage, itemsPerPage) => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  };

  return {
    paginatedData,
    allData,
    paginateData,
    isLoading: paginatedData.isLoading || allData.isLoading,
  };
}
