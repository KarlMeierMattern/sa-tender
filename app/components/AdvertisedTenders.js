"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
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
import { differenceInDays } from "date-fns";
import TableSkeleton from "./ui/table-skeleton";
import { useAdvertisedCharts } from "../hooks/useAdvertisedCharts";
import { useAdvertisedTenders } from "../hooks/useAdvertisedTendersTable";

const ITEMS_PER_PAGE = 10;

// Lazy load the table component
const TenderTable = dynamic(() => import("./TenderTable"), {
  loading: () => <TableSkeleton />,
  ssr: false,
});

export default function AdvertisedTenders({
  page,
  currentView,
  updateUrlParams,
}) {
  // Use the new hook for advertised tenders data
  const { paginatedData, allData } = useAdvertisedTenders({
    page,
    limit: ITEMS_PER_PAGE,
  });

  // Get chart data
  const chartQueries = useAdvertisedCharts();

  // Calculate metrics
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
      const publishDate = new Date(tender.advertised);
      const daysAgo = differenceInDays(now, publishDate);
      return daysAgo >= 0 && daysAgo <= 7;
    }).length;
  };

  if (paginatedData.isLoading || allData.isLoading) return <TableSkeleton />;

  const displayData =
    currentView === "table" ? paginatedData.data : allData.data;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Tenders Advertised</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {displayData?.pagination?.total}
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
                {calculateClosingSoon(displayData?.data || [])}
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
                {calculateRecentlyAdded(displayData?.data || [])}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 bg-gray-50 rounded-3xl p-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <ProvinceBarChart data={chartQueries.provinceCount.data?.data} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <ProvinceMap data={chartQueries.provinceCount.data?.data} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <DepartmentBarChart
                data={chartQueries.departmentCount.data?.data}
              />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <CategoryPieChart data={chartQueries.categoryCount.data?.data} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <TenderTypeDonut data={chartQueries.tenderTypeCount.data?.data} />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="table">
        <TenderTable
          allTenders={paginatedData.data?.data || []}
          currentPage={page}
          isAwarded={false}
          isLoading={paginatedData.isLoading}
          totalItems={paginatedData.data?.pagination?.total || 0}
        />
      </TabsContent>
    </Tabs>
  );
}
