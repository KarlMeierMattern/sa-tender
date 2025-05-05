"use client";

import {
  ProvinceMap,
  TendersByDepartment,
  TenderDurationDistribution,
  DailyTenderPublication,
  TendersByCategory,
  TendersByType,
} from "../visualizations/active";
import BlockSkeleton from "../ui/block-skeleton";

export default function ActiveTendersCharts({ chartQueries }) {
  if (chartQueries.isLoading) {
    return (
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
        <BlockSkeleton />
        <BlockSkeleton />
        <BlockSkeleton />
        <BlockSkeleton />
        <BlockSkeleton />
        <BlockSkeleton />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <ProvinceMap data={chartQueries.provinceCount.data?.data} />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <TendersByDepartment data={chartQueries.departmentCount.data?.data} />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <TenderDurationDistribution
          data={chartQueries.tenderDuration.data?.data}
        />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <DailyTenderPublication data={chartQueries.activeTimeline.data?.data} />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <TendersByCategory data={chartQueries.categoryCount.data?.data} />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <TendersByType data={chartQueries.tenderTypeCount.data?.data} />
      </div>
    </div>
  );
}
