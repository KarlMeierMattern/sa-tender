"use client";

import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import TableSkeleton from "../ui/table-skeleton";

// Hooks for active tenders
import { useActiveTendersTable } from "@/app/hooks/active/useActiveTendersTable";
import { useActiveCharts } from "@/app/hooks/active/useActiveCharts";
import { useActiveTenderFilters } from "@/app/hooks/active/useActiveTenderFilters";
import { usePrefetchAwardedData } from "@/app/hooks/active/usePrefetchAwardedData";

// Context
import { ActiveFiltersProvider } from "@/app/context/ActiveFiltersContext";

// Components for active tenders
import ActiveTendersCard from "./ActiveTendersCard";
import ActiveTendersCharts from "./ActiveTendersCharts";

const ITEMS_PER_PAGE = 10;

// Lazy load the table component
const ActiveTenderTable = dynamic(() => import("./ActiveTenderTable"), {
  loading: () => <TableSkeleton />,
  ssr: false,
});

const ActiveTendersContent = ({
  page,
  currentView,
  updateUrlParams,
  selectedYear,
}) => {
  // Data passed to ActiveTendersCharts
  const chartQueries = useActiveCharts();

  // Data passed to ActiveTendersCard and ActiveTenderTable
  const { allData } = useActiveTendersTable();

  // Data passed to ActiveTenderTable
  const { data: filterOptions } = useActiveTenderFilters();

  // Prefetch awarded data
  usePrefetchAwardedData(selectedYear);

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
          allCategories={filterOptions?.categories || []}
          allDepartments={filterOptions?.departments || []}
          allProvinces={filterOptions?.provinces || []}
        />
      </TabsContent>
    </Tabs>
  );
};

export default function ActiveTenders(props) {
  return (
    <ActiveFiltersProvider>
      <ActiveTendersContent {...props} />
    </ActiveFiltersProvider>
  );
}
