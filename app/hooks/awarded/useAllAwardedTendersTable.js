"use client";

import { useQuery } from "@tanstack/react-query";

export const awardedTendersKey = ["awarded-tenders-full"]; // This is how to identify this piece of data in the cache”

export const awardedTendersFn = async () => {
  const res = await fetch("/api/tenders-detail-awarded?limit=999999"); // This is how to fetch the data if it’s not in the cache yet
  return res.json();
};

export function useAllAwardedTenders() {
  return useQuery({
    queryKey: awardedTendersKey,
    queryFn: awardedTendersFn,
    staleTime: 1000 * 60 * 5,
  });
}
