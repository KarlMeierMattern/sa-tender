"use client";

import dynamic from "next/dynamic";
import {
  DepartmentByProcurementValue,
  IndustriesByAwardedValue,
  AwardedTenderDistribution,
  ContractorsByAwardedValue,
  TenderDurationDistribution,
} from "../visualizations/awarded";
import BlockSkeleton from "../ui/block-skeleton";
import ChartContainer from "../visualizations/ChartContainer";
import DataStateMessage from "../DataStateMessage";
import { getQueryGroupStatus } from "@/app/lib/queryUtils";

const ProvinceMap = dynamic(
  () => import("../visualizations/awarded/ProvinceMap"),
  {
    ssr: false,
    loading: () => <BlockSkeleton />,
  }
);

export default function AwardedTendersCharts({ chartQueries }) {
  const { isLoading, isError, refetch } = getQueryGroupStatus(chartQueries);

  if (isLoading) {
    return (
      <div className="grid items-start gap-8 md:grid-cols-1 lg:grid-cols-2">
        <BlockSkeleton className="lg:col-span-2" />
        <BlockSkeleton />
        <BlockSkeleton />
        <BlockSkeleton />
        <BlockSkeleton />
        <BlockSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <DataStateMessage
        variant="error"
        message="Could not load chart data. Please try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="grid items-start gap-8 md:grid-cols-1 lg:grid-cols-2">
      <ChartContainer className="lg:col-span-2">
        <ProvinceMap data={chartQueries.provinceValue.data?.data} />
      </ChartContainer>
      <ChartContainer>
        <DepartmentByProcurementValue
          data={chartQueries.departmentValue.data?.data}
        />
      </ChartContainer>
      <ChartContainer>
        <IndustriesByAwardedValue
          data={chartQueries.topCategories.data?.data}
        />
      </ChartContainer>
      <ChartContainer>
        <AwardedTenderDistribution
          data={chartQueries.valueDistribution.data?.data}
        />
      </ChartContainer>
      <ChartContainer>
        <ContractorsByAwardedValue
          data={chartQueries.topSuppliers.data?.data}
        />
      </ChartContainer>
      <ChartContainer>
        <TenderDurationDistribution
          data={chartQueries.awardTiming.data?.data}
        />
      </ChartContainer>
    </div>
  );
}
