"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import TableSkeleton from "../ui/table-skeleton";
import CardSkeleton from "../ui/card-skeleton";
import BlockSkeleton from "../ui/block-skeleton";
import { useActiveTendersTable } from "@/app/hooks/active/useActiveTendersTable";
import { useActiveCharts } from "@/app/hooks/active/useActiveCharts";
import { useActiveTenderFilters } from "@/app/hooks/active/useActiveTenderFilters";
import { ActiveFiltersProvider } from "@/app/context/ActiveFiltersContext";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";

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

const ActiveTendersCharts = dynamic(() => import("./ActiveTendersCharts"), {
  loading: () => (
    <div className="grid items-start gap-8 md:grid-cols-1 lg:grid-cols-2">
      <BlockSkeleton className="lg:col-span-2" />
      <BlockSkeleton />
      <BlockSkeleton />
      <BlockSkeleton />
      <BlockSkeleton />
      <BlockSkeleton />
    </div>
  ),
  ssr: false,
});

const ActiveTenderTable = dynamic(() => import("./ActiveTenderTable"), {
  loading: () => <TableSkeleton />,
  ssr: false,
});

const ActiveTendersContent = ({ page, currentView, updateUrlParams }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const effectiveView =
    !isDesktop && currentView === "table" ? "visualizations" : currentView;

  useEffect(() => {
    if (!isDesktop && currentView === "table") {
      updateUrlParams({ view: "visualizations" });
    }
  }, [isDesktop, currentView, updateUrlParams]);

  const showCharts = effectiveView === "visualizations";
  const showTable = effectiveView === "table" && isDesktop;

  const chartQueries = useActiveCharts({ enabled: showCharts });
  const { allData } = useActiveTendersTable({ enabled: true });
  const { data: filterOptions } = useActiveTenderFilters({
    enabled: showTable,
  });

  if (showTable) {
    return (
      <ActiveTenderTable
        allTenders={allData.data?.data || []}
        currentPage={page}
        isLoading={allData.isLoading}
        isError={allData.isError}
        onRetry={() => allData.refetch()}
        totalItems={allData.data?.pagination?.total || 0}
        allCategories={filterOptions?.categories || []}
        allDepartments={filterOptions?.departments || []}
        allProvinces={filterOptions?.provinces || []}
      />
    );
  }

  return (
    <>
      <ActiveTendersCard allData={allData} />
      <ActiveTendersCharts chartQueries={chartQueries} />
    </>
  );
};

export default function ActiveTenders(props) {
  return (
    <ActiveFiltersProvider>
      <ActiveTendersContent {...props} />
    </ActiveFiltersProvider>
  );
}
