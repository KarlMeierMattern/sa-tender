"use client";

import React from "react";
import dynamic from "next/dynamic";

// import AwardedTendersCard from "./AwardedTendersCard";
import { useAwardedTenderFilters } from "@/app/hooks/awarded/useAwardedTenderFilters";
import { useAllAwardedTenders } from "@/app/hooks/awarded/useAllAwardedTenders";
import { useAwardedCharts } from "@/app/hooks/awarded/useAwardedCharts";
import CardSkeleton from "../ui/card-skeleton";
import BlockSkeleton from "../ui/block-skeleton";

// Lazy-loads AwardedTendersCard
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

// Lazy-loads AwardedTendersCharts
const AwardedTendersCharts = dynamic(() => import("./AwardedTendersCharts"), {
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

export default function AwardedTenders({ selectedYear, setSelectedYear }) {
  // Data passed to AwardedTendersCard for filter options
  const filterOptions = useAwardedTenderFilters();

  // Data passed to AwardedTendersCard for all awarded tenders data filtered by selected year
  const allData = useAllAwardedTenders(selectedYear);

  // Data passed to AwardedTendersCharts
  const chartQueries = useAwardedCharts(selectedYear);

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
