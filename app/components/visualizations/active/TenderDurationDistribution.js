"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { CHART_HEIGHT } from "@/app/lib/chartHelpers";

const customTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded text-xs">
        <p className="font-semibold">{`${data.range}`}</p>
        <p>{`${data.count} tenders`}</p>
      </div>
    );
  }
  return null;
};

export default function TenderDurationDistribution({ data }) {
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      range: item.label,
      count: item.count,
    }));
  }, [data]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Tender Duration Distribution
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        The expected length of time between advertisement and closing date
      </p>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={chartData} barSize={48} margin={{ bottom: 8 }}>
          <XAxis
            dataKey="range"
            interval="preserveStartEnd"
            tick={{ fontSize: 10 }}
            height={48}
            axisLine={{ stroke: "transparent" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            width={36}
            axisLine={{ stroke: "transparent" }}
            tickLine={false}
          />
          <Tooltip content={customTooltip} />
          <Bar dataKey="count" fill="#B8C5FF" radius={[4, 4, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
