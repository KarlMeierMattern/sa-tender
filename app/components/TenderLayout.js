"use client";

import React, { Suspense } from "react";
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
import { useSearchParams } from "next/navigation";

// Lazy load the table component
const TenderTable = React.lazy(() => import("./TenderTable"));

export default function TenderLayout({ initialPage }) {
  const [isPending, startTransition] = React.useTransition();
  const [selectedYear, setSelectedYear] = React.useState("all");
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page")) || initialPage || 1;
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["tenders"],
    queryFn: async () => {
      const [activeTendersRes, awardedTendersRes] = await Promise.all([
        fetch("/api/tenders-detail"),
        fetch("/api/tenders-detail-awarded"),
      ]);

      const [advertisedResponse, awardedResponse] = await Promise.all([
        activeTendersRes.json(),
        awardedTendersRes.json(),
      ]);

      // Extract data from the success/data structure
      return {
        advertisedData: advertisedResponse.success
          ? advertisedResponse.data
          : [],
        awardedData: awardedResponse.success ? awardedResponse.data : [],
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Safely access data with defaults
  const advertisedTenders = data?.advertisedData || [];
  const awardedTenders = data?.awardedData || [];

  // Client-side pagination
  const paginatedAdvertised = advertisedTenders.slice(
    (page - 1) * limit,
    page * limit
  );
  const paginatedAwarded = awardedTenders.slice(
    (page - 1) * limit,
    page * limit
  );

  // Update the years calculation
  const years = React.useMemo(() => {
    const uniqueYears = new Set(
      awardedTenders
        .filter((tender) => tender.awarded)
        .map((tender) => new Date(tender.awarded).getFullYear())
    );
    return ["all", ...Array.from(uniqueYears).sort((a, b) => b - a)];
  }, [awardedTenders]);

  // Filter awarded tenders by selected year
  const filteredAwardedTenders = React.useMemo(() => {
    if (selectedYear === "all") return awardedTenders;
    return awardedTenders.filter(
      (tender) =>
        tender.awarded &&
        new Date(tender.awarded).getFullYear() === parseInt(selectedYear)
    );
  }, [awardedTenders, selectedYear]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  // Calculate pagination
  const advertisedPagination = {
    total: advertisedTenders.length,
    pages: Math.ceil(advertisedTenders.length / limit),
    currentPage: page,
    perPage: limit,
  };

  const awardedPagination = {
    total: awardedTenders.length,
    pages: Math.ceil(awardedTenders.length / limit),
    currentPage: page,
    perPage: limit,
  };

  // Calculate metrics
  const today = new Date();
  const closingSoon = advertisedTenders.filter((tender) => {
    if (!tender.closingDate) return false;
    const daysUntilClosing = differenceInDays(
      new Date(tender.closingDate),
      today
    );
    return daysUntilClosing >= 0 && daysUntilClosing <= 7;
  }).length;

  const recentlyAdded = advertisedTenders.filter((tender) => {
    if (!tender.advertised) return false;
    const daysFromAdvertised = differenceInDays(
      today,
      new Date(tender.advertised)
    );
    return daysFromAdvertised >= 0 && daysFromAdvertised <= 7;
  }).length;

  const metrics = {
    closingSoon,
    recentlyAdded,
  };

  // Add console logs to help debug
  console.log("Advertised Tenders:", {
    initial: data?.advertisedData?.length || 0,
    all: data?.advertisedData?.length || 0,
    pagination: data?.advertisedData || [],
  });

  console.log("Awarded Tenders:", {
    initial: data?.awardedData?.length || 0,
    all: data?.awardedData?.length || 0,
    pagination: data?.awardedData || [],
  });

  // Add these helper functions at the top of your TenderLayout component
  const calculateTotalValue = (tenders) => {
    try {
      return tenders.reduce(
        (sum, tender) => sum + (parseFloat(tender.successfulBidderAmount) || 0),
        0
      );
    } catch (error) {
      console.error("Error calculating total value:", error);
      return 0;
    }
  };

  const calculateAverageValue = (tenders) => {
    try {
      const total = calculateTotalValue(tenders);
      return total / (tenders.length || 1);
    } catch (error) {
      console.error("Error calculating average value:", error);
      return 0;
    }
  };

  return (
    <div className="p-4">
      <Tabs
        defaultValue="advertised"
        className="w-full"
        onValueChange={(value) => {
          startTransition(() => {
            // This empty transition will ensure we show the loading state
          });
        }}
      >
        <TabsList>
          <TabsTrigger className="cursor-pointer" value="advertised">
            advertised
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="awarded">
            awarded
          </TabsTrigger>
        </TabsList>
        <TabsContent value="advertised">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Total Tenders Advertised</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {advertisedPagination.total}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Closing Soon</CardTitle>
                <CardDescription>In next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics.closingSoon}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recently Added</CardTitle>
                <CardDescription>In last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics.recentlyAdded}</p>
              </CardContent>
            </Card>
          </div>
          <Tabs defaultValue="visualizations" className="w-full">
            <TabsList>
              <TabsTrigger className="cursor-pointer" value="visualizations">
                charts
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="table">
                table
              </TabsTrigger>
            </TabsList>
            <TabsContent value="visualizations">
              <div className="mt-8 bg-gray-50 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <ProvinceBarChart tenders={advertisedTenders} />
                  </div>
                  <div className=" bg-white rounded-xl p-6 shadow-sm">
                    <ProvinceMap tenders={advertisedTenders} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <DepartmentBarChart tenders={advertisedTenders} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <CategoryPieChart tenders={advertisedTenders} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <TenderTypeDonut tenders={advertisedTenders} />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="table">
              <Suspense fallback={<TableSkeleton />}>
                <TenderTable
                  initialTenders={paginatedAdvertised}
                  allTenders={advertisedTenders}
                  pagination={advertisedPagination}
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
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year === "all" ? "All Years" : year}
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
                <p className="text-3xl font-bold">{awardedPagination.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Value Awarded</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  R {calculateTotalValue(awardedTenders).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Award Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  R {calculateAverageValue(awardedTenders).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
          <Tabs defaultValue="visualizations" className="w-full">
            <TabsList>
              <TabsTrigger className="cursor-pointer" value="visualizations">
                charts
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="table">
                table
              </TabsTrigger>
            </TabsList>
            <TabsContent value="visualizations">
              <div className="mt-8 bg-gray-50 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <DepartmentValueChart tenders={filteredAwardedTenders} />
                  </div>
                  <div className=" bg-white rounded-xl p-6 shadow-sm">
                    <ProvinceMap
                      tenders={filteredAwardedTenders}
                      isAwarded={true}
                    />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <ValueDistributionChart tenders={filteredAwardedTenders} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <TopSuppliersChart tenders={filteredAwardedTenders} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <AwardTimingChart tenders={filteredAwardedTenders} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <LowestAwardTimingChart tenders={filteredAwardedTenders} />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="table">
              <Suspense fallback={<TableSkeleton />}>
                <TenderTable
                  initialTenders={paginatedAwarded}
                  allTenders={awardedTenders}
                  pagination={awardedPagination}
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
