"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DepartmentValueChart,
  ValueDistributionChart,
  TopSuppliersChart,
  AwardTimingChart,
  LowestAwardTimingChart,
  ProvinceMap,
} from "./visualizations/awarded";
import { useAwardedCharts } from "../hooks/useAwardedCharts.js";
import { useAllAwardedTenders } from "../hooks/useAllAwardedTendersTable.js";
import { useAwardedTenderFilters } from "../hooks/useAwardedTenderFilters";

export default function AwardedTenders() {
  const [selectedYear, setSelectedYear] = useState("all");

  // Fetch filter options
  const { data: filterOptions, isLoading: isFiltersLoading } =
    useAwardedTenderFilters();

  // Extract years from awarded dates
  const availableYears = Array.from(
    new Set(
      filterOptions?.awarded
        ?.map((date) => new Date(date).getFullYear())
        .filter(Boolean)
    )
  ).sort((a, b) => b - a);

  // Fetch chart data
  const chartQueries = useAwardedCharts(selectedYear);

  // Fetch all awarded tenders data for metrics
  const allData = useAllAwardedTenders({
    enabled: true, // Always enabled since we need it for metrics
  });

  if (isFiltersLoading || allData.isLoading) return <div>Loading...</div>;

  // Calculate metrics
  const calculateTotalValue = (tenders) => {
    return tenders.reduce(
      (sum, tender) => sum + (parseFloat(tender.successfulBidderAmount) || 0),
      0
    );
  };

  const calculateAverageValue = (tenders) => {
    const total = calculateTotalValue(tenders);
    return tenders.length ? total / tenders.length : 0;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Filter by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Tenders Awarded</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {allData.data?.data?.length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Value Awarded</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              R {calculateTotalValue(allData.data?.data || []).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Award Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              R{" "}
              {calculateAverageValue(allData.data?.data || []).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 bg-gray-50 rounded-3xl p-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <DepartmentValueChart
              data={chartQueries.departmentValue.data?.data}
            />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <ProvinceMap data={chartQueries.provinceValue.data?.data} />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <ValueDistributionChart
              data={chartQueries.valueDistribution.data?.data}
            />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <TopSuppliersChart data={chartQueries.topSuppliers.data?.data} />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <AwardTimingChart data={chartQueries.awardTiming.data?.data} />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <LowestAwardTimingChart
              data={chartQueries.lowestAwardTiming.data?.data}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
