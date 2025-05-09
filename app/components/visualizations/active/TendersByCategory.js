"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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
  "#E2E8F0", // Light gray for "Other"
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 text-xs">
        <p className="font-medium text-gray-900">{data.category}</p>
        <p className="text-gray-600">{data.count} tenders</p>
      </div>
    );
  }
  return null;
};

export default function TendersByCategory({ data }) {
  const chartData = React.useMemo(() => {
    if (!data) return [];

    return data.map((item) => ({
      category: item.category || "Unknown",
      count: item.count || 0,
    }));
  }, [data]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Tenders by Category
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        The types of tenders currently advertised
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius="100%"
            fill="#8884d8"
            dataKey="count"
            nameKey="category"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
