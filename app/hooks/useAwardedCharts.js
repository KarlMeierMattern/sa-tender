"use client";

import { useQuery } from "@tanstack/react-query";

export function useAwardedCharts(selectedYear = "all") {
  // Department Value Chart
  const departmentValue = useQuery({
    queryKey: ["department-value-chart", selectedYear],
    queryFn: async () => {
      const res = await fetch(
        `/api/charts/department-value-awarded?year=${selectedYear}`
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Province Value Chart
  const provinceValue = useQuery({
    queryKey: ["province-value-chart", selectedYear],
    queryFn: async () => {
      const res = await fetch(
        `/api/charts/province-value-awarded?year=${selectedYear}`
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Value Distribution Chart
  const valueDistribution = useQuery({
    queryKey: ["value-distribution-chart", selectedYear],
    queryFn: async () => {
      const res = await fetch(
        `/api/charts/value-distribution-awarded?year=${selectedYear}`
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Top Suppliers Chart
  const topSuppliers = useQuery({
    queryKey: ["top-suppliers-chart", selectedYear],
    queryFn: async () => {
      const res = await fetch(
        `/api/charts/top-suppliers-awarded?year=${selectedYear}`
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Award Timing Chart
  const awardTiming = useQuery({
    queryKey: ["award-timing-chart", selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/charts/award-timing?year=${selectedYear}`);
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Lowest Award Timing Chart
  const lowestAwardTiming = useQuery({
    queryKey: ["lowest-award-timing-chart", selectedYear],
    queryFn: async () => {
      const res = await fetch(
        `/api/charts/lowest-award-timing?year=${selectedYear}`
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Active: Province Count Chart
  const provinceCountActive = useQuery({
    queryKey: ["province-count-chart"],
    queryFn: async () => {
      const res = await fetch("/api/charts/province-count-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const provinceValueActive = useQuery({
    queryKey: ["provinceValueActive"],
    queryFn: async () => {
      const res = await fetch("/api/charts/province-value-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const departmentCountActive = useQuery({
    queryKey: ["departmentCountActive"],
    queryFn: async () => {
      const res = await fetch("/api/charts/department-count-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const categoryCountActive = useQuery({
    queryKey: ["categoryCountActive"],
    queryFn: async () => {
      const res = await fetch("/api/charts/category-count-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const tenderTypeCountActive = useQuery({
    queryKey: ["tenderTypeCountActive"],
    queryFn: async () => {
      const res = await fetch("/api/charts/tender-type-count-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    departmentValue,
    provinceValue,
    provinceValueActive,
    provinceCountActive,
    departmentCountActive,
    categoryCountActive,
    tenderTypeCountActive,
    valueDistribution,
    topSuppliers,
    awardTiming,
    lowestAwardTiming,
  };
}
