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
  const res = await fetch(`/api/charts/awarded/department-value?year=${year}`);
  return res.json();
};

export const provinceValueFn = async (year = "all") => {
  const res = await fetch(`/api/charts/awarded/province-value?year=${year}`);
  return res.json();
};

export const valueDistributionFn = async (year = "all") => {
  const res = await fetch(
    `/api/charts/awarded/value-distribution?year=${year}`
  );
  return res.json();
};

export const topSuppliersFn = async (year = "all") => {
  const res = await fetch(`/api/charts/awarded/top-suppliers?year=${year}`);
  return res.json();
};

export const awardTimingFn = async (year = "all") => {
  const res = await fetch(`/api/charts/awarded/award-timing?year=${year}`);
  return res.json();
};

export const topCategoriesFn = async (year = "all") => {
  const res = await fetch(`/api/charts/awarded/top-categories?year=${year}`);
  return res.json();
};

// Hook for awarded charts
// Use () => yourFn(params) to pass arguments safely and defer execution.
export function useAwardedCharts(selectedYear = "all", { enabled = true } = {}) {
  const departmentValue = useQuery({
    queryKey: departmentValueKey(selectedYear),
    queryFn: () => departmentValueFn(selectedYear),
    enabled,
  });

  const provinceValue = useQuery({
    queryKey: provinceValueKey(selectedYear),
    queryFn: () => provinceValueFn(selectedYear),
    enabled,
  });

  const valueDistribution = useQuery({
    queryKey: valueDistributionKey(selectedYear),
    queryFn: () => valueDistributionFn(selectedYear),
    enabled,
  });

  const topSuppliers = useQuery({
    queryKey: topSuppliersKey(selectedYear),
    queryFn: () => topSuppliersFn(selectedYear),
    enabled,
  });

  const awardTiming = useQuery({
    queryKey: awardTimingKey(selectedYear),
    queryFn: () => awardTimingFn(selectedYear),
    enabled,
  });

  const topCategories = useQuery({
    queryKey: topCategoriesKey(selectedYear),
    queryFn: () => topCategoriesFn(selectedYear),
    enabled,
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
