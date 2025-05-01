"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TableSkeleton from "../ui/table-skeleton";

export default function AwardedTendersCard({
  selectedYear,
  setSelectedYear,
  filterOptions,
  allData,
}) {
  // Used by card filter for year selection -> Extract unique years from awarded dates
  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        filterOptions?.data?.data?.awarded
          ?.map((date) => new Date(date).getFullYear())
          .filter(Boolean)
      )
    ).sort((a, b) => b - a);
  }, [filterOptions?.data?.data?.awarded]);

  // Calculate total value
  const totalValue = useMemo(() => {
    return (
      allData?.data?.data?.reduce(
        (sum, tender) =>
          sum + (parseFloat(tender?.successfulBidderAmount) || 0),
        0
      ) || 0
    );
  }, [allData?.data?.data]);

  // Calculate average value
  const averageValue = useMemo(() => {
    const tenders = allData?.data?.data || [];
    return tenders.length ? totalValue / tenders.length : 0;
  }, [totalValue, allData?.data?.data]);

  if (filterOptions.isLoading || allData.isLoading) return <TableSkeleton />;

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
            R{" "}
            {(totalValue / 1000000000).toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            bn
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
            {(averageValue / 1000000).toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            m
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
