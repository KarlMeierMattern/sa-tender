"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function HighestAwardTimingChart({ data }) {
  if (!data) return null;

  // Use data as provided from the backend: [{ label, count }, ...]
  const chartData = data;

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
            // tick={{ fontSize: 12 }}
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
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
