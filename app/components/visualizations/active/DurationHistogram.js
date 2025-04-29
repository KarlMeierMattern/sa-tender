"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function DurationHistogram({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center p-4">No duration data available.</div>;
  }

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded text-xs">
          <p className="font-semibold">{`${payload[0].payload.label}`}</p>
          <p>{`${payload[0].value} tenders`}</p>
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
        The expected length of time between advertisement and closing date
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} barSize={60}>
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
          <Bar dataKey="count" fill="#B8C5FF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
