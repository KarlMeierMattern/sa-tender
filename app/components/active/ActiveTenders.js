"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import TableSkeleton from "../ui/table-skeleton";

// Hooks for active tenders
import { useActiveTendersTable } from "@/app/hooks/active/useActiveTendersTable";
import { useActiveCharts } from "@/app/hooks/active/useActiveCharts";
import { useActiveTenderFilters } from "@/app/hooks/active/useActiveTenderFilters";

// Components for active tenders
import ActiveTendersCard from "./ActiveTendersCard";
import ActiveTendersCharts from "./ActiveTendersCharts";

// Hooks for awarded tenders
import { useQueryClient } from "@tanstack/react-query";
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
} from "@/app/hooks/awarded/useAwardedCharts";

const ITEMS_PER_PAGE = 10;

// Lazy load the table component
const ActiveTenderTable = dynamic(() => import("./ActiveTenderTable"), {
  loading: () => <TableSkeleton />,
  ssr: false,
});

export default function ActiveTenders({
  page,
  currentView,
  updateUrlParams,
  selectedYear,
}) {
  // Add state for filters
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [selectedAdvertisedDate, setSelectedAdvertisedDate] = useState(null);
  const [selectedClosingDate, setSelectedClosingDate] = useState(null);

  // Data passed to ActiveTendersCharts
  const chartQueries = useActiveCharts();

  // Data passed to ActiveTendersCard and ActiveTenderTable
  const { allData } = useActiveTendersTable();

  // Data passed to ActiveTenderTable
  const { data: filterOptions } = useActiveTenderFilters();

  // prefetch data
  const queryClient = useQueryClient();

  // Prefetch to run after initial data is loaded
  useEffect(() => {
    Promise.all([
      queryClient.prefetchQuery({
        queryKey: awardedTendersKey(selectedYear),
        queryFn: awardedTendersFn(selectedYear),
      }),
      queryClient.prefetchQuery({
        queryKey: departmentValueKey(selectedYear),
        queryFn: departmentValueFn(selectedYear),
      }),
      queryClient.prefetchQuery({
        queryKey: provinceValueKey(selectedYear),
        queryFn: provinceValueFn(selectedYear),
      }),
      queryClient.prefetchQuery({
        queryKey: valueDistributionKey(selectedYear),
        queryFn: valueDistributionFn(selectedYear),
      }),
      queryClient.prefetchQuery({
        queryKey: topSuppliersKey(selectedYear),
        queryFn: topSuppliersFn(selectedYear),
      }),
      queryClient.prefetchQuery({
        queryKey: awardTimingKey(selectedYear),
        queryFn: awardTimingFn(selectedYear),
      }),
      queryClient.prefetchQuery({
        queryKey: awardedTenderFiltersKey,
        queryFn: awardedTenderFiltersFn,
      }),
    ]).catch((error) => {
      console.error("Error prefetching data:", error);
    });
  }, [queryClient, selectedYear]);

  // Prefetch components in a separate effect
  useEffect(() => {
    import("../awarded/AwardedTenders");
    import("../awarded/AwardedTendersCharts");
    import("../awarded/AwardedTendersCard");
  }, []);

  if (allData.isLoading) return <TableSkeleton />;

  return (
    <Tabs
      defaultValue={currentView}
      className="w-full"
      onValueChange={(value) => updateUrlParams({ view: value })}
    >
      <TabsList className="hidden md:flex">
        <TabsTrigger className="cursor-pointer" value="visualizations">
          charts
        </TabsTrigger>
        <TabsTrigger className="cursor-pointer" value="table">
          table
        </TabsTrigger>
      </TabsList>

      <TabsContent value="visualizations">
        <ActiveTendersCard allData={allData} />
        <ActiveTendersCharts chartQueries={chartQueries} />
      </TabsContent>

      <TabsContent value="table" className="hidden md:block">
        <ActiveTenderTable
          allTenders={allData.data?.data || []}
          currentPage={page}
          isLoading={allData.isLoading}
          totalItems={allData.data?.pagination?.total || 0}
          itemsPerPage={ITEMS_PER_PAGE}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedDepartments={selectedDepartments}
          setSelectedDepartments={setSelectedDepartments}
          selectedProvinces={selectedProvinces}
          setSelectedProvinces={setSelectedProvinces}
          selectedAdvertisedDate={selectedAdvertisedDate}
          setSelectedAdvertisedDate={setSelectedAdvertisedDate}
          selectedClosingDate={selectedClosingDate}
          setSelectedClosingDate={setSelectedClosingDate}
          allCategories={filterOptions?.categories || []} // categories to be displayed in the filter
          allDepartments={filterOptions?.departments || []} // departments to be displayed in the filter
          allProvinces={filterOptions?.provinces || []} // provinces to be displayed in the filter
        />
      </TabsContent>
    </Tabs>
  );
}
