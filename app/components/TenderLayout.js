"use client";

import React, { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProvinceBarChart from "./visualizations/ProvinceBarChart";
import CategoryPieChart from "./visualizations/CategoryPieChart";
import DepartmentBarChart from "./visualizations/DepartmentBarChart";
import TenderTypeDonut from "./visualizations/TenderTypeDonut";
import ProvinceMapChart from "./visualizations/ProvinceMapChart";
import TableSkeleton from "./ui/table-skeleton";

// Lazy load the table component
const TenderTable = React.lazy(() => import("./TenderTable"));

export default function TenderLayout({ initialTenders }) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <div className="p-4">
      <Tabs
        defaultValue="visualizations"
        className="w-full"
        onValueChange={(value) => {
          startTransition(() => {
            // This empty transition will ensure we show the loading state
          });
        }}
      >
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
                <ProvinceMapChart tenders={initialTenders} />
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
    </div>
  );
}
