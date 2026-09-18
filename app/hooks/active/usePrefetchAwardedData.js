"use client";

import {
  awardedTendersKey,
  awardedTendersFn,
} from "@/app/hooks/awarded/useAllAwardedTenders";
import {
  awardedTenderFiltersKey,
  awardedTenderFiltersFn,
} from "@/app/hooks/awarded/useAwardedTenderFilters";
import {
  departmentValueKey,
  departmentValueFn,
  provinceValueKey,
  provinceValueFn,
  valueDistributionKey,
  valueDistributionFn,
  topSuppliersKey,
  topSuppliersFn,
  awardTimingKey,
  awardTimingFn,
  topCategoriesKey,
  topCategoriesFn,
} from "@/app/hooks/awarded/useAwardedCharts";

export async function prefetchAwardedData(queryClient, selectedYear = "all") {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: awardedTendersKey(selectedYear),
      queryFn: () => awardedTendersFn(selectedYear),
    }),
    queryClient.prefetchQuery({
      queryKey: departmentValueKey(selectedYear),
      queryFn: () => departmentValueFn(selectedYear),
    }),
    queryClient.prefetchQuery({
      queryKey: provinceValueKey(selectedYear),
      queryFn: () => provinceValueFn(selectedYear),
    }),
    queryClient.prefetchQuery({
      queryKey: valueDistributionKey(selectedYear),
      queryFn: () => valueDistributionFn(selectedYear),
    }),
    queryClient.prefetchQuery({
      queryKey: topSuppliersKey(selectedYear),
      queryFn: () => topSuppliersFn(selectedYear),
    }),
    queryClient.prefetchQuery({
      queryKey: awardTimingKey(selectedYear),
      queryFn: () => awardTimingFn(selectedYear),
    }),
    queryClient.prefetchQuery({
      queryKey: topCategoriesKey(selectedYear),
      queryFn: () => topCategoriesFn(selectedYear),
    }),
    queryClient.prefetchQuery({
      queryKey: awardedTenderFiltersKey,
      queryFn: awardedTenderFiltersFn,
    }),
  ]);
}
