"use client";

import React, { useState } from "react";
import AwardedTendersCard from "./AwardedTendersCard";
const AwardedTendersCharts = React.lazy(() => import("./AwardedTendersCharts")); // Lazy-loads AwardedTendersCharts only when it needs to render

export default function AwardedTenders() {
  const [selectedYear, setSelectedYear] = useState("all");
  const [isCardLoading, setIsCardLoading] = useState(true);

  return (
    <div className="w-full">
      <AwardedTendersCard
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        setIsCardLoading={setIsCardLoading}
      />
      {isCardLoading ? (
        <div className="h-[300px] w-full bg-gray-100 rounded-xl animate-pulse" />
      ) : (
        <AwardedTendersCharts selectedYear={selectedYear} />
      )}
    </div>
  );
}
