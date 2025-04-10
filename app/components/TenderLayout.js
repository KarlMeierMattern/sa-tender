"use client";

import React, { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProvinceBarChart from "./visualizations/ProvinceBarChart";
import CategoryPieChart from "./visualizations/CategoryPieChart";
import DepartmentBarChart from "./visualizations/DepartmentBarChart";
import TenderTypeDonut from "./visualizations/TenderTypeDonut";
import ProvinceMap from "./visualizations/ProvinceMap";
import TableSkeleton from "./ui/table-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInDays } from "date-fns";
import DepartmentValueChart from "./visualizations/awarded/DepartmentValueChart";
import ValueDistributionChart from "./visualizations/awarded/ValueDistributionChart";
import TopSuppliersChart from "./visualizations/awarded/TopSuppliersChart";
import AwardTimingChart from "./visualizations/awarded/AwardTimingChart";

// Lazy load the table component
const TenderTable = React.lazy(() => import("./TenderTable"));

export default function TenderLayout({ initialTenders, awardedTenders }) {
  const [isPending, startTransition] = React.useTransition();
  const [selectedYear, setSelectedYear] = React.useState("all");

  // Get unique years from awarded tenders
  const years = React.useMemo(() => {
    const uniqueYears = new Set(
      awardedTenders.map((tender) => new Date(tender.awarded).getFullYear())
    );
    return ["all", ...Array.from(uniqueYears).sort((a, b) => b - a)];
  }, [awardedTenders]);

  // Filter awarded tenders by selected year
  const filteredAwardedTenders = React.useMemo(() => {
    if (selectedYear === "all") return awardedTenders;
    return awardedTenders.filter(
      (tender) =>
        new Date(tender.awarded).getFullYear() === parseInt(selectedYear)
    );
  }, [awardedTenders, selectedYear]);

  // Calculate statistics for advertised tenders
  const today = new Date();
  const closingSoon = initialTenders.filter((tender) => {
    if (!tender.closingDate) return false;
    const daysUntilClosing = differenceInDays(
      new Date(tender.closingDate),
      today
    );
    return daysUntilClosing >= 0 && daysUntilClosing <= 7;
  }).length;

  const recentlyAdded = initialTenders.filter((tender) => {
    if (!tender.advertised) return false;
    const daysFromAdvertised = differenceInDays(
      today,
      new Date(tender.advertised)
    );
    return daysFromAdvertised >= 0 && daysFromAdvertised <= 7;
  }).length;

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
                <p className="text-3xl font-bold">{initialTenders.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Closing Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{closingSoon}</p>
                <p className="text-sm text-muted-foreground">
                  Closing in next 7 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recently Added</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{recentlyAdded}</p>
                <p className="text-sm text-muted-foreground">
                  Added in last 7 days
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
                    <ProvinceBarChart tenders={initialTenders} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <CategoryPieChart tenders={initialTenders} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <DepartmentBarChart tenders={initialTenders} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <TenderTypeDonut tenders={initialTenders} />
                  </div>
                  <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm">
                    <ProvinceMap tenders={initialTenders} />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="table">
              {isPending ? (
                <TableSkeleton />
              ) : (
                <Suspense fallback={<TableSkeleton />}>
                  <TenderTable initialTenders={initialTenders} />
                </Suspense>
              )}
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
                <p className="text-3xl font-bold">
                  {filteredAwardedTenders.length}
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
                  {filteredAwardedTenders
                    .reduce(
                      (sum, tender) =>
                        sum + (parseFloat(tender.successfulBidderAmount) || 0),
                      0
                    )
                    .toLocaleString()}
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
                  {(
                    filteredAwardedTenders.reduce(
                      (sum, tender) =>
                        sum + (parseFloat(tender.successfulBidderAmount) || 0),
                      0
                    ) / (filteredAwardedTenders.length || 1)
                  ).toLocaleString()}
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
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <ValueDistributionChart tenders={filteredAwardedTenders} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <TopSuppliersChart tenders={filteredAwardedTenders} />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <AwardTimingChart tenders={filteredAwardedTenders} />
                  </div>
                  <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm">
                    <ProvinceMap
                      tenders={filteredAwardedTenders}
                      isAwarded={true}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="table">
              {isPending ? (
                <TableSkeleton />
              ) : (
                <Suspense fallback={<TableSkeleton />}>
                  <TenderTable
                    initialTenders={filteredAwardedTenders}
                    isAwarded={true}
                  />
                </Suspense>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
