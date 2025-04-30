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

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded text-xs">
        <p className="font-semibold mb-1">{`${item.label} days`}</p>
        <p>{`Number of Tenders: ${item.count}`}</p>
      </div>
    );
  }
  return null;
};

export default function TenderDurationDistribution({ data }) {
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      label: item.label,
      count: item.count,
    }));
  }, [data]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Tender Duration Distribution
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        How long it took for a tender to be awarded
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} barSize={60}>
          <XAxis
            dataKey="label"
            tick={false}
            height={0}
            axisLine={{ stroke: "transparent" }}
            tickLine={false}
          />
          <YAxis
            tick={false}
            width={0}
            axisLine={{ stroke: "transparent" }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
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
