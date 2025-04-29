"use client";

import { useQuery } from "@tanstack/react-query";

const fetchActiveTimeline = async () => {
  const res = await fetch("/api/charts/active-timeline");
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export function useAdvertisedCharts() {
  // Active: Province Count Chart
  const provinceCount = useQuery({
    queryKey: ["province-count-chart"],
    queryFn: async () => {
      const res = await fetch("/api/charts/province-count-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const provinceValue = useQuery({
    queryKey: ["province-value-active"],
    queryFn: async () => {
      const res = await fetch("/api/charts/province-value-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const departmentCount = useQuery({
    queryKey: ["department-count-active"],
    queryFn: async () => {
      const res = await fetch("/api/charts/department-count-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const categoryCount = useQuery({
    queryKey: ["category-count-active"],
    queryFn: async () => {
      const res = await fetch("/api/charts/category-count-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const tenderTypeCount = useQuery({
    queryKey: ["tender-type-count-active"],
    queryFn: async () => {
      const res = await fetch("/api/charts/tender-type-count-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Active Timeline Chart
  const activeTimeline = useQuery({
    queryKey: ["activeTimeline"],
    queryFn: fetchActiveTimeline,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Tender Duration Distribution Chart
  const tenderDuration = useQuery({
    queryKey: ["tenderDuration"],
    queryFn: async () => {
      const res = await fetch("/api/charts/tender-duration");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Department vs Tender Type Breakdown
  // const departmentTenderType = useQuery({
  //   queryKey: ["departmentTenderType"],
  //   queryFn: async () => {
  //     const res = await fetch("/api/charts/department-tendertype");
  //     if (!res.ok) {
  //       throw new Error(`HTTP error! status: ${res.status}`);
  //     }
  //     return res.json();
  //   },
  //   staleTime: 1000 * 60 * 5, // 5 minutes
  // });

  // Category vs Province Breakdown
  const categoryProvince = useQuery({
    queryKey: ["categoryProvince"],
    queryFn: async () => {
      const res = await fetch("/api/charts/category-province");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Keyword Cloud from Descriptions
  const keywordCloud = useQuery({
    queryKey: ["keywordCloud"],
    queryFn: async () => {
      const res = await fetch("/api/charts/keyword-cloud");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes, longer cache for this expensive operation
  });

  return {
    provinceCount,
    provinceValue,
    departmentCount,
    categoryCount,
    tenderTypeCount,
    activeTimeline,
    tenderDuration,
    // departmentTenderType,
    categoryProvince,
    keywordCloud,
  };
}
