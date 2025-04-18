"use client";

import {
  ProvinceMap,
  ProvinceBarChart,
  CategoryPieChart,
  DepartmentBarChart,
  TenderTypeDonut,
  TimelineChart,
  DurationHistogram,
  DepartmentTenderTypeChart,
  CategoryProvinceChart,
  KeywordCloud,
} from "../visualizations/active";
import TableSkeleton from "../ui/table-skeleton";
import { useAdvertisedCharts } from "../../hooks/active/useActiveCharts";

export default function AdvertisedTendersCharts() {
  // Hook for chart data
  const chartQueries = useAdvertisedCharts();

  if (chartQueries.isLoading) return <TableSkeleton />;

  return (
    <div className="mt-8 bg-gray-50 rounded-3xl p-8">
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <TimelineChart data={chartQueries.activeTimeline.data?.data} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <DurationHistogram data={chartQueries.tenderDuration.data?.data} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <ProvinceMap data={chartQueries.provinceCount.data?.data} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <DepartmentBarChart data={chartQueries.departmentCount.data?.data} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <CategoryPieChart data={chartQueries.categoryCount.data?.data} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <TenderTypeDonut data={chartQueries.tenderTypeCount.data?.data} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <ProvinceBarChart data={chartQueries.provinceCount.data?.data} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <DepartmentTenderTypeChart
            data={chartQueries.departmentTenderType.data?.data}
          />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <CategoryProvinceChart
            data={chartQueries.categoryProvince.data?.data}
          />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <KeywordCloud data={chartQueries.keywordCloud.data?.data} />
        </div>
      </div>
    </div>
  );
}
