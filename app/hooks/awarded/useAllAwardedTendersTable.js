"use client";

import { useQuery } from "@tanstack/react-query";

export const awardedTendersKey = (year = "all") => [
  "awarded-tenders-full",
  year,
];

export const awardedTendersFn = async (year = "all") => {
  const params = new URLSearchParams({ limit: "999999" });
  if (year && year !== "all") params.append("year", year);
  const res = await fetch(`/api/tenders-detail-awarded?${params.toString()}`);
  return res.json();
};

export function useAllAwardedTenders(year = "all") {
  return useQuery({
    queryKey: awardedTendersKey(year),
    queryFn: () => awardedTendersFn(year),
    staleTime: 1000 * 60 * 5,
  });
}
