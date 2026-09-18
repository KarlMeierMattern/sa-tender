"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useAwardedTenderFilters } from "@/app/hooks/awarded/useAwardedTenderFilters";
import { useAllAwardedTenders } from "@/app/hooks/awarded/useAllAwardedTenders";
import { useAwardedCharts } from "@/app/hooks/awarded/useAwardedCharts";
import CardSkeleton from "../ui/card-skeleton";
import BlockSkeleton from "../ui/block-skeleton";

const AwardedTendersCard = dynamic(() => import("./AwardedTendersCard"), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  ),
  ssr: false,
});

const AwardedTendersCharts = dynamic(() => import("./AwardedTendersCharts"), {
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

export default function AwardedTenders({ selectedYear, setSelectedYear }) {
  const filterOptions = useAwardedTenderFilters({ enabled: true });
  const allData = useAllAwardedTenders(selectedYear, { enabled: true });
  const chartQueries = useAwardedCharts(selectedYear, { enabled: true });

  return (
    <div className="w-full">
      <AwardedTendersCard
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        filterOptions={filterOptions}
        allData={allData}
      />
      <AwardedTendersCharts chartQueries={chartQueries} />
    </div>
  );
}
