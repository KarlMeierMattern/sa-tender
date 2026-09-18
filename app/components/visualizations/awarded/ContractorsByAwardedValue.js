"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import React from "react";
import { truncateLabel, verticalBarChartHeight } from "@/app/lib/chartHelpers";

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded text-xs">
        <p className="font-semibold mb-1">{item.supplier}</p>
        <p>{`Total Value: R ${item.value.toLocaleString()}`}</p>
        <p>{`Number of Tenders: ${item.count}`}</p>
        <p>{`Categories: ${
          item.categories ? item?.categories.join(", ") : "na"
        }`}</p>
      </div>
    );
  }
  return null;
};

export default function ContractorsByAwardedValue({ data }) {
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      supplier: item.supplier,
      value: item.totalValue,
      count: item.count,
      categories: item.categories,
    }));
  }, [data]);

  if (!data?.length) return null;

  // Custom formatter for the x-axis (currency)
  const formatCurrency = (value) => {
    if (value >= 1_000_000_000) {
      return `R ${(value / 1_000_000_000).toFixed(1)}B`;
    }
    return `R ${value.toLocaleString()}`;
  };

  const chartHeight = verticalBarChartHeight(chartData.length);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Contractors by Awarded Value
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        The contractors that received the most money from tenders
      </p>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={chartData} layout="vertical" barSize={20} margin={{ left: 8 }}>
          <XAxis
            type="number"
            tickFormatter={formatCurrency}
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: "transparent" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="supplier"
            width={96}
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => truncateLabel(v, 12)}
            axisLine={{ stroke: "transparent" }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            fill="#B8C5FF"
            stroke="#C2CDFF"
            strokeWidth={1}
            radius={[4, 4, 4, 4]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
