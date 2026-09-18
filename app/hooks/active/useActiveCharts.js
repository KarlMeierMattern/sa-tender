"use client";

import { useQuery } from "@tanstack/react-query";

export function useActiveCharts({ enabled = true } = {}) {
  const provinceCount = useQuery({
    queryKey: ["province-count-chart"],
    queryFn: async () => {
      const res = await fetch("/api/charts/active/province-count");
      if (!res.ok) throw new Error("Failed to fetch province data");
      return res.json();
    },
    enabled,
  });

  const departmentCount = useQuery({
    queryKey: ["department-count-active"],
    queryFn: async () => {
      const res = await fetch("/api/charts/active/department-count");
      if (!res.ok) throw new Error("Failed to fetch department data");
      return res.json();
    },
    enabled,
  });

  const categoryCount = useQuery({
    queryKey: ["category-count-active"],
    queryFn: async () => {
      const res = await fetch("/api/charts/active/category-count");
      if (!res.ok) throw new Error("Failed to fetch category data");
      return res.json();
    },
    enabled,
  });

  const tenderTypeCount = useQuery({
    queryKey: ["tender-type-count-active"],
    queryFn: async () => {
      const res = await fetch("/api/charts/active/tender-type-count");
      if (!res.ok) throw new Error("Failed to fetch tender type data");
      return res.json();
    },
    enabled,
  });

  const activeTimeline = useQuery({
    queryKey: ["activeTimeline"],
    queryFn: async () => {
      const res = await fetch("/api/charts/active/timeline");
      if (!res.ok) throw new Error("Failed to fetch timeline data");
      return res.json();
    },
    enabled,
  });

  const tenderDuration = useQuery({
    queryKey: ["tenderDuration"],
    queryFn: async () => {
      const res = await fetch("/api/charts/active/tender-duration");
      if (!res.ok) throw new Error("Failed to fetch duration data");
      return res.json();
    },
    enabled,
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
