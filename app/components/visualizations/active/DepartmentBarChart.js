"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
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
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Tenders by Department
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        The departments with the most tenders currently advertised
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical" barSize={20}>
          <XAxis
            type="number"
            tickMargin={8}
            // tick={{ fill: "#6B7280", fontSize: 12 }}
            tick={false}
            height={0}
            axisLine={{ stroke: "transparent" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="department"
            width={0}
            tickMargin={8}
            tick={false}
            axisLine={{ stroke: "transparent" }}
            tickLine={false}
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
  );
}
