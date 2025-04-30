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
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} barSize={80}>
          <XAxis
            dataKey="range"
            interval="preserveStartEnd"
            textAnchor="end"
            tick={false}
            height={0}
            axisLine={{ stroke: "transparent" }}
            tickLine={false}
          />
          <YAxis
            tick={false}
            axisLine={{ stroke: "transparent" }}
            tickLine={false}
            width={0}
          />
          <Tooltip content={customTooltip} />
          <Bar dataKey="count" fill="#B8C5FF" radius={[4, 4, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
