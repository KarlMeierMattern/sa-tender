"use client";

import { useState } from "react";
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
import { usePaginatedAwardedTenders } from "../hooks/usePaginatedAwardedTenders.js";
import { useAllAwardedTenders } from "../hooks/useAllAwardedTendersTable.js";
import { format } from "date-fns";
import { useAwardedTenderFilters } from "../hooks/useAwardedTenderFilters";

// Lazy load the table component
const TenderTable = dynamic(() => import("./TenderTable"), {
  loading: () => <TableSkeleton />,
  ssr: false,
});

const ITEMS_PER_PAGE = 10;

export default function AwardedTenders({ page, currentView, updateUrlParams }) {
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [selectedAdvertisedDate, setSelectedAdvertisedDate] = useState(null);
  const [selectedSecondDate, setSelectedSecondDate] = useState(null);

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

  const paginatedData = usePaginatedAwardedTenders({
    page,
    category: selectedCategories.join(","),
    department: selectedDepartments.join(","),
    province: selectedProvinces.join(","),
    advertised: selectedAdvertisedDate
      ? format(selectedAdvertisedDate, "yyyy-MM-dd")
      : "",
    awarded: selectedSecondDate ? format(selectedSecondDate, "yyyy-MM-dd") : "",
  });

  // Use paginated data for table view, all data for charts
  const tableData = paginatedData.data?.data || [];
  const totalItems = paginatedData.data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const allData = useAllAwardedTenders({
    enabled: currentView === "visualizations",
  });

  // Combine loading states
  const isLoading = paginatedData.isALoading || allData.isLoading;

  // Extract unique filter values from the full dataset
  const allCategories = Array.from(
    new Set(tableData.map((t) => t.category).filter(Boolean))
  ).sort();
  const allDepartments = Array.from(
    new Set(tableData.map((t) => t.department).filter(Boolean))
  ).sort();
  const allProvinces = Array.from(
    new Set(tableData.map((t) => t.province).filter(Boolean))
  ).sort();

  if (isLoading || isFiltersLoading) return <TableSkeleton />;

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
              <p className="text-3xl font-bold">{totalItems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Value Awarded</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                R{" "}
                {calculateTotalValue(allData.data?.data || []).toLocaleString()}
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
                {calculateAverageValue(
                  allData.data?.data || []
                ).toLocaleString()}
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
          allTenders={tableData}
          currentPage={page}
          isAwarded={true}
          isLoading={isLoading}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          paginateData={null}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedDepartments={selectedDepartments}
          setSelectedDepartments={setSelectedDepartments}
          selectedProvinces={selectedProvinces}
          setSelectedProvinces={setSelectedProvinces}
          selectedAdvertisedDate={selectedAdvertisedDate}
          setSelectedAdvertisedDate={setSelectedAdvertisedDate}
          selectedSecondDate={selectedSecondDate}
          setSelectedSecondDate={setSelectedSecondDate}
          allCategories={filterOptions?.categories || []}
          allDepartments={filterOptions?.departments || []}
          allProvinces={filterOptions?.provinces || []}
        />
      </TabsContent>
    </Tabs>
  );
}
