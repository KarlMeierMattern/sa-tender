"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CardSkeleton from "../ui/card-skeleton";
import DataStateMessage from "../DataStateMessage";

export default function AwardedTendersCard({
  selectedYear,
  setSelectedYear,
  filterOptions,
  allData,
}) {
  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        filterOptions?.data?.data?.awarded
          ?.map((date) => new Date(date).getFullYear())
          .filter(Boolean)
      )
    ).sort((a, b) => b - a);
  }, [filterOptions?.data?.data?.awarded]);

  const totalValue = useMemo(() => {
    return (
      allData?.data?.data?.reduce(
        (sum, tender) =>
          sum + (parseFloat(tender?.successfulBidderAmount) || 0),
        0
      ) || 0
    );
  }, [allData?.data?.data]);

  const averageValue = useMemo(() => {
    const tenders = allData?.data?.data || [];
    return tenders.length ? totalValue / tenders.length : 0;
  }, [totalValue, allData?.data?.data]);

  if (filterOptions.isLoading || allData.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (filterOptions.isError || allData.isError) {
    return (
      <div className="mb-8">
        <DataStateMessage
          variant="error"
          message="Could not load awarded tender summary."
          onRetry={() => {
            filterOptions.refetch?.();
            allData.refetch?.();
          }}
        />
      </div>
    );
  }

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
            className="w-full rounded-md border bg-background p-2 text-sm"
            aria-label="Filter awarded tenders by year"
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
          <p className="text-2xl md:text-3xl font-bold tabular-nums">
            {allData?.data?.data?.length || 0}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Value Awarded</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl md:text-3xl font-bold tabular-nums">
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
          <p className="text-2xl md:text-3xl font-bold tabular-nums">
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
