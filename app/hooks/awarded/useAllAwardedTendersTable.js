"use client";

import { useQuery } from "@tanstack/react-query";

export function useAllAwardedTenders({ enabled = false } = {}) {
  return useQuery({
    queryKey: ["awarded-tenders-full"],
    queryFn: async () => {
      const res = await fetch("/api/tenders-detail-awarded?limit=999999");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    enabled, // 👈 Only fetches when enabled is true
  });
}
