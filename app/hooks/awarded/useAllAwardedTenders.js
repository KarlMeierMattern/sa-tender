// Fetches all awarded tenders

// ./app/api/tenders-detail-awarded/route.js -> fetch data
// ./app/components/active/AdvertisedTenders.js -> prefetch data
// ./app/components/awarded/AwardedTendersCard.js -> parent component
"use client";

import { useQuery } from "@tanstack/react-query";

export const awardedTendersKey = (year = "all") => [
  "awarded-tenders-full",
  year,
];

export const awardedTendersFn = async (year = "all") => {
  const params = new URLSearchParams({ limit: "999999" });
  if (year && year !== "all") params.append("year", year);
  const res = await fetch(`/api/awarded-tenders-all?${params.toString()}`);
  return res.json();
};

export function useAllAwardedTenders(year = "all") {
  return useQuery({
    queryKey: awardedTendersKey(year),
    queryFn: () => awardedTendersFn(year),
    staleTime: 1000 * 60 * 60 * 24,
  });
}
