"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TableSkeleton from "../ui/table-skeleton";
import CardSkeleton from "../ui/card-skeleton";
import BlockSkeleton from "../ui/block-skeleton";

// Hooks for active tenders
import { useActiveTendersTable } from "@/app/hooks/active/useActiveTendersTable";
import { useActiveCharts } from "@/app/hooks/active/useActiveCharts";
import { useActiveTenderFilters } from "@/app/hooks/active/useActiveTenderFilters";
import { usePrefetchAwardedData } from "@/app/hooks/active/usePrefetchAwardedData";

// Context
import { ActiveFiltersProvider } from "@/app/context/ActiveFiltersContext";

// Lazy load the card component
const ActiveTendersCard = dynamic(() => import("./ActiveTendersCard"), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  ),
  ssr: false,
});

// Lazy load the charts component
const ActiveTendersCharts = dynamic(() => import("./ActiveTendersCharts"), {
  loading: () => (
    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
      <BlockSkeleton />
      <BlockSkeleton />
      <BlockSkeleton />
      <BlockSkeleton />
      <BlockSkeleton />
      <BlockSkeleton />
    </div>
  ),
  ssr: false,
});

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
