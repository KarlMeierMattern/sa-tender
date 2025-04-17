"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DepartmentValueChart,
  ValueDistributionChart,
  TopSuppliersChart,
  AwardTimingChart,
  LowestAwardTimingChart,
  ProvinceMap,
} from "./visualizations/awarded";
import TableSkeleton from "./ui/table-skeleton";
import { useAwardedCharts } from "../hooks/useAwardedCharts.js";
import { useAwardedTendersTable } from "../hooks/useAwardedTendersTable.js";

// Lazy load the table component
const TenderTable = dynamic(() => import("./TenderTable"), {
  loading: () => <TableSkeleton />,
  ssr: false,
});

const ITEMS_PER_PAGE = 10;

export default function AwardedTenders({ page, currentView, updateUrlParams }) {
  const [selectedYear, setSelectedYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([]);

  // Fetch all years from the awarded tenders
  useEffect(() => {
    async function fetchYears() {
      try {
        const response = await fetch(
          "/api/tenders-detail-awarded?limit=999999"
        );
        const data = await response.json();

        const years = Array.from(
          new Set(
            data?.data
              ?.map((tender) => new Date(tender.awarded).getFullYear())
              .filter(Boolean)
          )
        ).sort((a, b) => b - a);

        setAvailableYears(years);
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    }

    fetchYears();
  }, []);

  // Fetch chart data
  const chartQueries = useAwardedCharts(selectedYear);

  // Fetch table data
  const { paginatedData, allData, paginateData, isLoading } =
    useAwardedTendersTable({
      page,
      limit: ITEMS_PER_PAGE,
    });

  // Use full data for charts, but paginated data for table
  const allAwarded =
    currentView === "table"
      ? {
          data: allData.data?.data || [],
          pagination: {
            total: allData.data?.pagination?.total || 0,
            page: page,
            limit: ITEMS_PER_PAGE,
          },
        }
      : allData.data;

  if (isLoading) return <TableSkeleton />;

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
    <Tabs
      defaultValue={currentView}
      className="w-full"
      onValueChange={(value) => updateUrlParams({ view: value })}
    >
      <TabsList>
        <TabsTrigger value="visualizations">charts</TabsTrigger>
        <TabsTrigger value="table">table</TabsTrigger>
      </TabsList>

      <TabsContent value="visualizations">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Filter by Year</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                }}
                className="w-full p-2 border rounded-md"
                disabled={currentView !== "visualizations"}
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
                {allAwarded?.pagination?.total}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Value Awarded</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                R {calculateTotalValue(allAwarded?.data || []).toLocaleString()}
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
                {calculateAverageValue(allAwarded?.data || []).toLocaleString()}
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
      </TabsContent>

      <TabsContent value="table">
        <TenderTable
          allTenders={allData.data?.data || []}
          currentPage={page}
          isAwarded={true}
          isLoading={isLoading}
          totalItems={allData.data?.pagination?.total || 0}
          itemsPerPage={ITEMS_PER_PAGE}
          paginateData={paginateData}
        />
      </TabsContent>
    </Tabs>
  );
}
