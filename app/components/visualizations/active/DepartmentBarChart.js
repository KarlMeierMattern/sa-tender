"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Periwinkle color palette with incrementally lighter shades
const COLORS = [
  "#B8C5FF", // Base periwinkle
  "#C2CDFF",
  "#CCD5FF",
  "#D6DDFF",
  "#E0E5FF",
  "#EAE9FF",
  "#F4F1FF",
  "#F8F7FF",
  "#FBFAFF",
  "#FDFCFF", // Lightest periwinkle
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-gray-600">{data.value} tenders</p>
        <p className="text-gray-500 text-sm">
          {(data.percent * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

export default function DepartmentBarChart({ tenders }) {
  const data = React.useMemo(() => {
    const counts = {};
    const total = tenders.length;

    tenders.forEach((tender) => {
      const dept = tender.department || "Unknown";
      counts[dept] = (counts[dept] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
        percent: value / total,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [tenders]);

  return (
    <div className="w-full h-[400px]">
      <h2 className="text-xl font-semibold mb-6">Top 10 Departments</h2>
      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 180, bottom: 20 }}
            barSize={20}
          >
            <CartesianGrid
              stroke="#E5E7EB"
              strokeDasharray="3 3"
              horizontal={true}
              vertical={true}
            />
            <XAxis
              type="number"
              tickMargin={8}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={160}
              tickMargin={8}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={{ stroke: "#E5E7EB" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
