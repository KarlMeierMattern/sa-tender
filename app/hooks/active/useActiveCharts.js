// Fetches data for the charts on the active tenders page

// ./app/components/active/ActiveTenders -> data fetched
// ./app/components/active/ActiveTendersCharts.js -> data passed as prop

"use client";

import { useQuery } from "@tanstack/react-query";

export function useActiveCharts() {
  // Active: Province Count Chart
  const provinceCount = useQuery({
    queryKey: ["province-count-chart"],
    queryFn: async () => {
      const res = await fetch("/api/charts/active/province-count");
      return res.json();
    },
    staleTime: process.env.STALE_TIME,
    cacheTime: process.env.CACHE_TIME,
  });

  const departmentCount = useQuery({
    queryKey: ["department-count-active"],
    queryFn: async () => {
      const res = await fetch("/api/charts/active/department-count");
      return res.json();
    },
    staleTime: process.env.STALE_TIME,
    cacheTime: process.env.CACHE_TIME,
  });

  const categoryCount = useQuery({
    queryKey: ["category-count-active"],
    queryFn: async () => {
      const res = await fetch("/api/charts/active/category-count");
      return res.json();
    },
    staleTime: process.env.STALE_TIME,
    cacheTime: process.env.CACHE_TIME,
  });

  const tenderTypeCount = useQuery({
    queryKey: ["tender-type-count-active"],
    queryFn: async () => {
      const res = await fetch("/api/charts/active/tender-type-count");
      return res.json();
    },
    staleTime: process.env.STALE_TIME,
    cacheTime: process.env.CACHE_TIME,
  });

  // Active Timeline Chart
  const activeTimeline = useQuery({
    queryKey: ["activeTimeline"],
    queryFn: async () => {
      const res = await fetch("/api/charts/active/timeline");
      return res.json();
    },
    staleTime: process.env.STALE_TIME,
    cacheTime: process.env.CACHE_TIME,
  });

  // Tender Duration Distribution Chart
  const tenderDuration = useQuery({
    queryKey: ["tenderDuration"],
    queryFn: async () => {
      const res = await fetch("/api/charts/active/tender-duration");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    },
    staleTime: process.env.STALE_TIME,
    cacheTime: process.env.CACHE_TIME,
  });

  return {
    provinceCount,
    departmentCount,
    categoryCount,
    tenderTypeCount,
    activeTimeline,
    tenderDuration,
  };
}
