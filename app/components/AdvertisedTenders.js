"use client";

import { useQuery } from "@tanstack/react-query";
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

// Lazy load the table view component
const TenderTableView = dynamic(() => import("./TenderTableView"), {
  loading: () => <TableSkeleton />,
  ssr: false,
});

export default function AdvertisedTenders({
  page,
  currentView,
  updateUrlParams,
}) {
  // Fetch advertised tenders data
  const { data: allAdvertised, isLoading } = useQuery({
    queryKey: ["advertised-tenders-all"],
    queryFn: async () => {
      const res = await fetch("/api/tenders-detail?limit=999999");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

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
      const publishDate = new Date(tender.datePublished);
      const daysAgo = differenceInDays(now, publishDate);
      return daysAgo >= 0 && daysAgo <= 7;
    }).length;
  };

  if (isLoading) return <TableSkeleton />;

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
                {calculateRecentlyAdded(allAdvertised?.data || [])}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 bg-gray-50 rounded-3xl p-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <ProvinceBarChart tenders={allAdvertised?.data || []} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
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
        <TenderTableView
          allTenders={allAdvertised?.data || []}
          page={page}
          isAwarded={false}
        />
      </TabsContent>
    </Tabs>
  );
}
