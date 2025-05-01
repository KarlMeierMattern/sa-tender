"use client";

import React, { useState } from "react";
import AwardedTendersCard from "./AwardedTendersCard";
// import { useAwardedTenderFilters } from "../../hooks/awarded/useAwardedTenderFilters";
import { useAwardedTenderFilters } from "@/app/hooks/awarded/useAwardedTenderFilters";
import { useAllAwardedTenders } from "@/app/hooks/awarded/useAllAwardedTenders";
import { useAwardedCharts } from "@/app/hooks/awarded/useAwardedCharts";
const AwardedTendersCharts = React.lazy(() => import("./AwardedTendersCharts")); // Lazy-loads AwardedTendersCharts only when it needs to render

export default function AwardedTenders({ selectedYear, setSelectedYear }) {
  // const [isCardLoading, setIsCardLoading] = useState(true);

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
        // setIsCardLoading={setIsCardLoading}
        filterOptions={filterOptions}
        allData={allData}
      />
      {isCardLoading ? (
        <div className="h-[300px] w-full bg-gray-100 rounded-xl animate-pulse" />
      ) : (
        <AwardedTendersCharts chartQueries={chartQueries} />
      )}
    </div>
  );
}
