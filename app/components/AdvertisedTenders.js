"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import TableSkeleton from "./ui/table-skeleton";
import { useAdvertisedTenders } from "../hooks/active/useActiveTendersTable";
import { useActiveTenderFilters } from "../hooks/active/useActiveTenderFilters";
import AdvertisedTendersCard from "./AvertisedTendersCard";
import AdvertisedTendersCharts from "./AdvertisedTendersCharts";
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
  // Add state for filters
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [selectedAdvertisedDate, setSelectedAdvertisedDate] = useState(null);
  const [selectedClosingDate, setSelectedClosingDate] = useState(null);

  // Hook for filter options
  const { data: filterOptions } = useActiveTenderFilters();

  // Hook for paginated data and all data
  const { paginatedData, allData, paginateData } = useAdvertisedTenders({
    page,
    limit: ITEMS_PER_PAGE,
  });

  if (paginatedData.isLoading || allData.isLoading) return <TableSkeleton />;

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
        <AdvertisedTendersCard />
        <AdvertisedTendersCharts />
      </TabsContent>

      <TabsContent value="table">
        <TenderTable
          allTenders={allData.data?.data || []}
          currentPage={page}
          isLoading={paginatedData.isLoading || allData.isLoading}
          totalItems={allData.data?.pagination?.total || 0}
          itemsPerPage={ITEMS_PER_PAGE}
          paginateData={paginateData}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedDepartments={selectedDepartments}
          setSelectedDepartments={setSelectedDepartments}
          selectedProvinces={selectedProvinces}
          setSelectedProvinces={setSelectedProvinces}
          selectedAdvertisedDate={selectedAdvertisedDate}
          setSelectedAdvertisedDate={setSelectedAdvertisedDate}
          selectedClosingDate={selectedClosingDate}
          setSelectedClosingDate={setSelectedClosingDate}
          allCategories={filterOptions?.categories || []}
          allDepartments={filterOptions?.departments || []}
          allProvinces={filterOptions?.provinces || []}
        />
      </TabsContent>
    </Tabs>
  );
}
