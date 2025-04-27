"use client";

import {
  DepartmentValueChart,
  ValueDistributionChart,
  TopSuppliersChart,
  HighestAwardTimingChart,
  LowestAwardTimingChart,
  ProvinceMap,
  TopCategoriesChart,
} from "../visualizations/awarded";
import { useAwardedCharts } from "../../hooks/awarded/useAwardedCharts.js";
import TableSkeleton from "../ui/table-skeleton";

export default function AwardedTendersCharts({ selectedYear }) {
  // Fetch chart data
  const chartQueries = useAwardedCharts(selectedYear);

  if (chartQueries.isLoading) return <TableSkeleton />;

  return (
    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <DepartmentValueChart data={chartQueries.departmentValue.data?.data} />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <ProvinceMap data={chartQueries.provinceValue.data?.data} />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <TopCategoriesChart data={chartQueries.topCategories.data?.data} />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <TopSuppliersChart data={chartQueries.topSuppliers.data?.data} />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <ValueDistributionChart
          data={chartQueries.valueDistribution.data?.data}
        />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <HighestAwardTimingChart data={chartQueries.awardTiming.data?.data} />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <LowestAwardTimingChart
          data={chartQueries.lowestAwardTiming.data?.data}
        />
      </div>
    </div>
  );
}
