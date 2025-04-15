"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { differenceInDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import TableSkeleton from "./ui/table-skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ProvinceMap,
  ProvinceBarChart,
  CategoryPieChart,
  DepartmentBarChart,
  TenderTypeDonut,
} from "./visualizations/active";
import {
  DepartmentValueChart,
  ValueDistributionChart,
  TopSuppliersChart,
  AwardTimingChart,
  LowestAwardTimingChart,
} from "./visualizations/awarded";

// Lazy load the table component
const TenderTable = dynamic(() => import("./TenderTable"), { ssr: false });

export default function TenderLayout({ initialPage }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page")) || initialPage || 1;
  const currentView = searchParams.get("view") || "visualizations";
  const currentTab = searchParams.get("tab") || "awarded";
  const [selectedYear, setSelectedYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([]);
  const [advertizedFilters, setAdvertizedFilters] = useState({});
  const [awardedFilters, setAwardedFilters] = useState({});

  // Function to build query string from filters
  const buildFilterQuery = (filters) => {
    if (!filters) return "";
    const query = {
      categories: filters.categories,
      departments: filters.departments,
      provinces: filters.provinces,
      date: filters.date ? new Date(filters.date).toISOString() : undefined,
    };
    return encodeURIComponent(JSON.stringify(query));
  };

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

  // Fetch all data at once
  const { data: allAdvertised, isLoading: isLoadingAdvertised } = useQuery({
    queryKey: ["advertised-tenders-all"],
    queryFn: async () => {
      const res = await fetch("/api/tenders-detail?limit=999999");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: allAwarded, isLoading: isLoadingAwarded } = useQuery({
    queryKey: ["awarded-tenders-all", selectedYear],
    queryFn: async () => {
      const res = await fetch(
        `/api/tenders-detail-awarded?limit=999999&year=${selectedYear}`
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = isLoadingAdvertised || isLoadingAwarded;

  if (isLoading) return <TableSkeleton />;

  // Calculate metrics from full dataset
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
                  {allAdvertised?.pagination?.total}
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
                  {calculateClosingSoon(allAdvertised?.data || [])}
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
                      hasData: !!allAdvertised?.data,
                      dataLength: allAdvertised?.data?.length,
                      firstItem: allAdvertised?.data?.[0],
                    });
                    return calculateRecentlyAdded(allAdvertised?.data || []);
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
                    <ProvinceBarChart tenders={allAdvertised?.data || []} />
                  </div>
                  <div className=" bg-white rounded-xl p-6 shadow-sm">
                    <ProvinceMap tenders={allAdvertised?.data || []} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <DepartmentBarChart tenders={allAdvertised?.data || []} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <CategoryPieChart tenders={allAdvertised?.data || []} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <TenderTypeDonut tenders={allAdvertised?.data || []} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="table">
              <Suspense fallback={<TableSkeleton />}>
                <TenderTable
                  allTenders={allAdvertised?.data || []}
                  currentPage={page}
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
                  R{" "}
                  {calculateTotalValue(allAwarded?.data || []).toLocaleString()}
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
                    allAwarded?.data || []
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
                    <DepartmentValueChart tenders={allAwarded?.data || []} />
                  </div>
                  <div className=" bg-white rounded-xl p-6 shadow-sm">
                    <ProvinceMap
                      tenders={allAwarded?.data || []}
                      isAwarded={true}
                    />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <ValueDistributionChart tenders={allAwarded?.data || []} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <TopSuppliersChart tenders={allAwarded?.data || []} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <AwardTimingChart tenders={allAwarded?.data || []} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <LowestAwardTimingChart tenders={allAwarded?.data || []} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="table">
              <Suspense fallback={<TableSkeleton />}>
                <TenderTable
                  allTenders={allAwarded?.data || []}
                  currentPage={page}
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
