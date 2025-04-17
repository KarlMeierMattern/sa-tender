"use client";

import { useQuery } from "@tanstack/react-query";

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
    queryKey: ["provinceValueActive"],
    queryFn: async () => {
      const res = await fetch("/api/charts/province-value-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const departmentCount = useQuery({
    queryKey: ["departmentCountActive"],
    queryFn: async () => {
      const res = await fetch("/api/charts/department-count-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const categoryCount = useQuery({
    queryKey: ["categoryCountActive"],
    queryFn: async () => {
      const res = await fetch("/api/charts/category-count-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const tenderTypeCount = useQuery({
    queryKey: ["tenderTypeCountActive"],
    queryFn: async () => {
      const res = await fetch("/api/charts/tender-type-count-active");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    provinceCount,
    provinceValue,
    departmentCount,
    categoryCount,
    tenderTypeCount,
  };
}
