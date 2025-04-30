"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import TableSkeleton from "../ui/table-skeleton";
import { useAdvertisedTenders } from "../../hooks/active/useActiveTendersTable";
import { useActiveTenderFilters } from "../../hooks/active/useActiveTenderFilters";
import AdvertisedTendersCard from "./AvertisedTendersCard";
import AdvertisedTendersCharts from "./AdvertisedTendersCharts";

import { useQueryClient } from "@tanstack/react-query";

import {
  awardedTendersKey,
  awardedTendersFn,
} from "../../hooks/awarded/useAllAwardedTendersTable";

import {
  awardedTenderFiltersKey,
  awardedTenderFiltersFn,
} from "../../hooks/awarded/useAwardedTenderFilters";

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
} from "../../hooks/awarded/useAwardedCharts";

const ITEMS_PER_PAGE = 10;

// Lazy load the table component
const TenderTable = dynamic(() => import("./TenderTable"), {
  loading: () => <TableSkeleton />,
  ssr: false,
});

export default function AdvertisedTenders({
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

  const queryClient = useQueryClient();

  // Hook for filter options
  const { data: filterOptions } = useActiveTenderFilters();

  // Hook for paginated data and all data
  const { paginatedData, allData, paginateData } = useAdvertisedTenders({
    page,
    limit: ITEMS_PER_PAGE,
  });

  // Move prefetch to run after initial data is loaded
  useEffect(() => {
    if (filterOptions && !paginatedData.isLoading) {
      import("../awarded/AwardedTenders"); // prefetch awarded tenders component
      import("../awarded/AwardedTendersCharts"); // prefetch awarded tenders charts component
      import("../awarded/AwardedTendersCard"); // prefetch awarded tenders card component

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
    }
  }, [queryClient, selectedYear, filterOptions, paginatedData.isLoading]);

  if (paginatedData.isLoading || allData.isLoading) return <TableSkeleton />;

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
        <AdvertisedTendersCard />
        <AdvertisedTendersCharts />
      </TabsContent>

      <TabsContent value="table" className="hidden md:block">
        <TenderTable
          allTenders={allData.data?.data || []}
          currentPage={page}
          isLoading={paginatedData.isLoading || allData.isLoading}
          totalItems={allData.data?.pagination?.total || 0}
          itemsPerPage={ITEMS_PER_PAGE}
          paginateData={paginateData}
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
          allCategories={filterOptions?.categories || []}
          allDepartments={filterOptions?.departments || []}
          allProvinces={filterOptions?.provinces || []}
        />
      </TabsContent>
    </Tabs>
  );
}
