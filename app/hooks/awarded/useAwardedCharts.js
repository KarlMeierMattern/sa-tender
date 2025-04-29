"use client";

import { useQuery } from "@tanstack/react-query";

// Query Keys
export const departmentValueKey = (year = "all") => [
  "department-value-chart",
  year,
];
export const provinceValueKey = (year = "all") => [
  "province-value-chart",
  year,
];
export const valueDistributionKey = (year = "all") => [
  "value-distribution-chart",
  year,
];
export const topSuppliersKey = (year = "all") => ["top-suppliers-chart", year];
export const awardTimingKey = (year = "all") => ["award-timing-chart", year];

export const topCategoriesKey = (year = "all") => [
  "top-categories-chart",
  year,
];

// Query Fns
export const departmentValueFn = async (year = "all") => {
  const res = await fetch(`/api/charts/department-value-awarded?year=${year}`);
  return res.json();
};

export const provinceValueFn = async (year = "all") => {
  const res = await fetch(`/api/charts/province-value-awarded?year=${year}`);
  return res.json();
};

export const valueDistributionFn = async (year = "all") => {
  const res = await fetch(
    `/api/charts/value-distribution-awarded?year=${year}`
  );
  return res.json();
};

export const topSuppliersFn = async (year = "all") => {
  const res = await fetch(`/api/charts/top-suppliers-awarded?year=${year}`);
  return res.json();
};

export const awardTimingFn = async (year = "all") => {
  const res = await fetch(`/api/charts/award-timing?year=${year}`);
  return res.json();
};

export const topCategoriesFn = async (year = "all") => {
  const res = await fetch(`/api/charts/top-categories-awarded?year=${year}`);
  return res.json();
};

// Hook for awarded charts
// Use () => yourFn(params) to pass arguments safely and defer execution.
export function useAwardedCharts(selectedYear = "all") {
  const departmentValue = useQuery({
    queryKey: departmentValueKey(selectedYear),
    queryFn: () => departmentValueFn(selectedYear),
    staleTime: 1000 * 60 * 5,
  });

  const provinceValue = useQuery({
    queryKey: provinceValueKey(selectedYear),
    queryFn: () => provinceValueFn(selectedYear),
    staleTime: 1000 * 60 * 5,
  });

  const valueDistribution = useQuery({
    queryKey: valueDistributionKey(selectedYear),
    queryFn: () => valueDistributionFn(selectedYear),
    staleTime: 1000 * 60 * 5,
  });

  const topSuppliers = useQuery({
    queryKey: topSuppliersKey(selectedYear),
    queryFn: () => topSuppliersFn(selectedYear),
    staleTime: 1000 * 60 * 5,
  });

  const awardTiming = useQuery({
    queryKey: awardTimingKey(selectedYear),
    queryFn: () => awardTimingFn(selectedYear),
    staleTime: 1000 * 60 * 5,
  });

  const topCategories = useQuery({
    queryKey: topCategoriesKey(selectedYear),
    queryFn: () => topCategoriesFn(selectedYear),
    staleTime: 1000 * 60 * 5,
  });

  return {
    departmentValue,
    provinceValue,
    valueDistribution,
    topSuppliers,
    awardTiming,
    topCategories,
  };
}
