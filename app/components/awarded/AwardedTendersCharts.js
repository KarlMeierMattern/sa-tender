"use client";

import {
  ProvinceMap,
  DepartmentByProcurementValue,
  IndustriesByAwardedValue,
  AwardedTenderDistribution,
  ContractorsByAwardedValue,
  TenderDurationDistribution,
} from "../visualizations/awarded";
import BlockSkeleton from "../ui/block-skeleton";

export default function AwardedTendersCharts({ chartQueries }) {
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
        <ProvinceMap data={chartQueries.provinceValue.data?.data} />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <DepartmentByProcurementValue
          data={chartQueries.departmentValue.data?.data}
        />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <IndustriesByAwardedValue
          data={chartQueries.topCategories.data?.data}
        />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <AwardedTenderDistribution
          data={chartQueries.valueDistribution.data?.data}
        />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <ContractorsByAwardedValue
          data={chartQueries.topSuppliers.data?.data}
        />
      </div>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <TenderDurationDistribution
          data={chartQueries.awardTiming.data?.data}
        />
      </div>
    </div>
  );
}
