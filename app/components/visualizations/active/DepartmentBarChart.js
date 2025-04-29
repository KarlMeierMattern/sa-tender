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
  Legend,
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
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 text-xs">
        <p className="font-medium text-gray-900">{data.department}</p>
        <p className="text-gray-600">{data.count} tenders</p>
      </div>
    );
  }
  return null;
};

export default function DepartmentBarChart({ data }) {
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      department: item.department,
      count: item.count,
    }));
  }, [data]);

  return (
    <div className="w-full h-[400px]">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Departments by Tenders
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        Top 10 procuring departments by number of tenders
      </p>

      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ bottom: 40 }}
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
              dataKey="department"
              width={100}
              tickMargin={8}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={{ stroke: "#E5E7EB" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
            <Legend
              verticalAlign="top"
              height={0}
              wrapperStyle={{ display: "none" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
