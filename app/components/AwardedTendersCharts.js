"use client";

import {
  DepartmentValueChart,
  ValueDistributionChart,
  TopSuppliersChart,
  HighestAwardTimingChart,
  LowestAwardTimingChart,
  ProvinceMap,
} from "./visualizations/awarded";
import { useAwardedCharts } from "../hooks/awarded/useAwardedCharts.js";
import TableSkeleton from "./ui/table-skeleton";

export default function AwardedTendersCharts({ selectedYear }) {
  // Fetch chart data
  const chartQueries = useAwardedCharts(selectedYear);

  if (chartQueries.isLoading) return <TableSkeleton />;

  return (
    <div className="mt-8 bg-gray-50 rounded-3xl p-8">
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <DepartmentValueChart
            data={chartQueries.departmentValue.data?.data}
          />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <ProvinceMap data={chartQueries.provinceValue.data?.data} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <ValueDistributionChart
            data={chartQueries.valueDistribution.data?.data}
          />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <TopSuppliersChart data={chartQueries.topSuppliers.data?.data} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <HighestAwardTimingChart data={chartQueries.awardTiming.data?.data} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <LowestAwardTimingChart
            data={chartQueries.lowestAwardTiming.data?.data}
          />
        </div>
      </div>
    </div>
  );
}
