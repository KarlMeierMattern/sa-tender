"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAwardedTenderFilters } from "../../hooks/awarded/useAwardedTenderFilters";
import { useAllAwardedTenders } from "../../hooks/awarded/useAllAwardedTendersTable.js";
import TableSkeleton from "../ui/table-skeleton";

export default function AwardedTendersCard({
  selectedYear,
  setSelectedYear,
  setIsCardLoading,
}) {
  // Hook for filter options
  const filterOptions = useAwardedTenderFilters();

  // Hook for all awarded tenders data
  const allData = useAllAwardedTenders({
    enabled: true, // Always enabled since we need it for metrics
  });

  // Notify parent that loading is done
  useEffect(() => {
    if (!filterOptions.isLoading && !allData.isLoading) {
      setIsCardLoading(false);
    }
  }, [filterOptions.isLoading, allData.isLoading, setIsCardLoading]);

  // Extract years from awarded dates
  const availableYears = Array.from(
    new Set(
      filterOptions?.data?.data?.awarded
        ?.map((date) => new Date(date).getFullYear())
        .filter(Boolean)
    )
  ).sort((a, b) => b - a);

  if (filterOptions.isLoading || allData.isLoading) return <TableSkeleton />;

  // Calculdate total value
  const calculateTotalValue = (tenders) => {
    return tenders.reduce(
      (sum, tender) => sum + (parseFloat(tender.successfulBidderAmount) || 0),
      0
    );
  };

  // Calculate average value
  const calculateAverageValue = (tenders) => {
    const total = calculateTotalValue(tenders);
    return tenders.length ? total / tenders.length : 0;
  };

  return (
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
            {allData?.data?.data?.length || 0}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Value Awarded</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            R {calculateTotalValue(allData?.data?.data || []).toLocaleString()}
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
            {calculateAverageValue(allData?.data?.data || []).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
