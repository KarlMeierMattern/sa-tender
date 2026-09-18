"use client";

import { useQuery } from "@tanstack/react-query";

export function useActiveTendersTable({ enabled = true } = {}) {
  const allData = useQuery({
    queryKey: ["advertised-tenders-full"],
    queryFn: async () => {
      const res = await fetch("/api/active-tenders-all?limit=999999");
      if (!res.ok) throw new Error("Failed to fetch tenders");
      return res.json();
    },
    enabled,
  });

  return { allData };
}
