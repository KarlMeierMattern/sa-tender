"use client";

import React, { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProvinceBarChart from "./visualizations/ProvinceBarChart";
import CategoryPieChart from "./visualizations/CategoryPieChart";
import DepartmentBarChart from "./visualizations/DepartmentBarChart";
import TenderTypeDonut from "./visualizations/TenderTypeDonut";
import ProvinceMap from "./visualizations/ProvinceMap";
import TableSkeleton from "./ui/table-skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { differenceInDays } from "date-fns";
import DepartmentValueChart from "./visualizations/awarded/DepartmentValueChart";
import ValueDistributionChart from "./visualizations/awarded/ValueDistributionChart";
import TopSuppliersChart from "./visualizations/awarded/TopSuppliersChart";
import AwardTimingChart from "./visualizations/awarded/AwardTimingChart";
import LowestAwardTimingChart from "./visualizations/awarded/LowestAwardTimingChart";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

// Lazy load the table component
// const TenderTable = React.lazy(() => import("./TenderTable"));
const TenderTable = dynamic(() => import("./TenderTable"), { ssr: false });

export default function TenderLayout({ initialPage }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page")) || initialPage || 1;
  const currentView = searchParams.get("view") || "visualizations"; // Get current view from URL
  const currentTab = searchParams.get("tab") || "awarded"; // Get current tab from URL
  const [selectedYear, setSelectedYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([]);

  // Add function to update URL params without reload
  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value);
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

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

  // Split into separate queries
  const { data: paginatedAdvertised, isLoading: isLoadingPaginatedAdvertised } =
    useQuery({
      queryKey: ["advertised-tenders", page],
      queryFn: async () => {
        const res = await fetch(`/api/tenders-detail?page=${page}`);
        return res.json();
      },
    });

  const { data: paginatedAwarded, isLoading: isLoadingPaginatedAwarded } =
    useQuery({
      queryKey: ["awarded-tenders", page, selectedYear],
      queryFn: async () => {
        const res = await fetch(
          `/api/tenders-detail-awarded?page=${page}&year=${selectedYear}`
        );
        return res.json();
      },
    });

  const { data: chartAdvertised, isLoading: isLoadingChartAdvertised } =
    useQuery({
      queryKey: ["advertised-tenders-all"],
      queryFn: async () => {
        const res = await fetch("/api/tenders-detail?limit=999999");
        return res.json();
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const { data: chartAwarded, isLoading: isLoadingChartAwarded } = useQuery({
    queryKey: ["awarded-tenders-all", selectedYear],
    queryFn: async () => {
      const res = await fetch(
        `/api/tenders-detail-awarded?limit=999999&year=${selectedYear}`
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Combine data for components that expect the old structure
  const paginatedData = {
    advertised: paginatedAdvertised,
    awarded: paginatedAwarded,
  };

  const chartData = {
    advertised: chartAdvertised,
    awarded: chartAwarded,
  };

  const isLoading =
    isLoadingPaginatedAdvertised ||
    isLoadingPaginatedAwarded ||
    isLoadingChartAdvertised ||
    isLoadingChartAwarded;

  if (isLoading) return <TableSkeleton />;

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

  const calculateClosingSoon = (tenders) => {
    const now = new Date();
    return tenders.filter((tender) => {
      const closingDate = new Date(tender.closingDate);
      const daysUntilClosing = differenceInDays(closingDate, now);
      return daysUntilClosing >= 0 && daysUntilClosing <= 7;
    }).length;
  };

  const calculateRecentlyAdded = (tenders) => {
    const now = new Date();
    return tenders.filter((tender) => {
      const publishDate = new Date(tender.datePublished);
      const daysAgo = differenceInDays(now, publishDate);
      return daysAgo >= 0 && daysAgo <= 7;
    }).length;
  };

  return (
    <div className="p-4">
      <Tabs
        defaultValue={currentTab}
        className="w-full"
        onValueChange={(value) => updateUrlParams({ tab: value })}
      >
        <TabsList>
          <TabsTrigger value="advertised">advertised</TabsTrigger>
          <TabsTrigger value="awarded">awarded</TabsTrigger>
        </TabsList>

        <TabsContent value="advertised">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Total Tenders Advertised</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {paginatedData?.advertised?.pagination?.total}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Closing Soon</CardTitle>
                <CardDescription>In next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {calculateClosingSoon(chartData?.advertised?.data || [])}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recently Added</CardTitle>
                <CardDescription>In last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {(() => {
                    console.log("Chart Data Structure in Card:", {
                      hasData: !!chartData?.advertised?.data,
                      dataLength: chartData?.advertised?.data?.length,
                      firstItem: chartData?.advertised?.data?.[0],
                    });
                    return calculateRecentlyAdded(
                      chartData?.advertised?.data || []
                    );
                  })()}
                </p>
              </CardContent>
            </Card>
          </div>
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
              <div className="mt-8 bg-gray-50 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <ProvinceBarChart
                      tenders={chartData?.advertised?.data || []}
                    />
                  </div>
                  <div className=" bg-white rounded-xl p-6 shadow-sm">
                    <ProvinceMap tenders={chartData?.advertised?.data || []} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <DepartmentBarChart
                      tenders={chartData?.advertised?.data || []}
                    />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <CategoryPieChart
                      tenders={chartData?.advertised?.data || []}
                    />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <TenderTypeDonut
                      tenders={chartData?.advertised?.data || []}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="table">
              <Suspense fallback={<TableSkeleton />}>
                <TenderTable
                  initialTenders={paginatedData?.advertised?.data || []}
                  pagination={paginatedData?.advertised?.pagination}
                  isAwarded={false}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="awarded">
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
                  {paginatedData?.awarded?.pagination?.total}
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
                  {calculateTotalValue(
                    chartData?.awarded?.data || []
                  ).toLocaleString()}
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
                    chartData?.awarded?.data || []
                  ).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
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
              <div className="mt-8 bg-gray-50 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <DepartmentValueChart
                      tenders={chartData?.awarded?.data || []}
                    />
                  </div>
                  <div className=" bg-white rounded-xl p-6 shadow-sm">
                    <ProvinceMap
                      tenders={chartData?.awarded?.data || []}
                      isAwarded={true}
                    />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <ValueDistributionChart
                      tenders={chartData?.awarded?.data || []}
                    />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <TopSuppliersChart
                      tenders={chartData?.awarded?.data || []}
                    />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <AwardTimingChart
                      tenders={chartData?.awarded?.data || []}
                    />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <LowestAwardTimingChart
                      tenders={chartData?.awarded?.data || []}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="table">
              <Suspense fallback={<TableSkeleton />}>
                <TenderTable
                  initialTenders={paginatedData?.awarded?.data || []}
                  pagination={paginatedData?.awarded?.pagination}
                  isAwarded={true}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
