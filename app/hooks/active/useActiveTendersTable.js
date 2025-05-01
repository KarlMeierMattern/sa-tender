// This hook is used to fetch all data from the active tenders database

// ./app/api/tenders-detail/route.js -> api call
// ./app/components/active/ActiveTenders.js -> data fetched
// ./app/components/active/ActiveTendersCard.js -> data passed as prop
// ./app/components/active/TenderTable.js -> data passed as prop

"use client";

import { useQuery } from "@tanstack/react-query";

export function useActiveTendersTable() {
  // Query for all data (used in visualizations and filtering)
  const allData = useQuery({
    queryKey: ["advertised-tenders-full"],
    queryFn: async () => {
      const res = await fetch("/api/active-tenders-all?limit=999999");
      return res.json();
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    allData,
  };
}
