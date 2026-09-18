"use client";

import dynamic from "next/dynamic";
import {
  TendersByDepartment,
  TenderDurationDistribution,
  DailyTenderPublication,
  TendersByCategory,
  TendersByType,
} from "../visualizations/active";
import BlockSkeleton from "../ui/block-skeleton";
import ChartContainer from "../visualizations/ChartContainer";
import DataStateMessage from "../DataStateMessage";
import { getQueryGroupStatus } from "@/app/lib/queryUtils";

const ProvinceMap = dynamic(
  () => import("../visualizations/active/ProvinceMap"),
  {
    ssr: false,
    loading: () => <BlockSkeleton />,
  }
);

export default function ActiveTendersCharts({ chartQueries }) {
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
        <ProvinceMap data={chartQueries.provinceCount.data?.data} />
      </ChartContainer>
      <ChartContainer>
        <TendersByDepartment data={chartQueries.departmentCount.data?.data} />
      </ChartContainer>
      <ChartContainer>
        <TenderDurationDistribution
          data={chartQueries.tenderDuration.data?.data}
        />
      </ChartContainer>
      <ChartContainer>
        <DailyTenderPublication data={chartQueries.activeTimeline.data?.data} />
      </ChartContainer>
      <ChartContainer>
        <TendersByCategory data={chartQueries.categoryCount.data?.data} />
      </ChartContainer>
      <ChartContainer>
        <TendersByType data={chartQueries.tenderTypeCount.data?.data} />
      </ChartContainer>
    </div>
  );
}
