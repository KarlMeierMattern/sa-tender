"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, totalValue }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded text-xs">
        <p className="font-semibold mb-1">{item.name}</p>
        <p>{`R ${item.value.toLocaleString()} (${(
          (item.value / totalValue) *
          100
        ).toFixed(2)}%)`}</p>
        <p>{`${item.count} tenders`}</p>
      </div>
    );
  }
  return null;
};

export default function IndustriesByAwardedValue({ data }) {
  // Calculate total value
  const totalValue = data
    ? data.reduce((acc, item) => acc + item.totalValue, 0)
    : 0;

  // Memoize chartData
  const chartData = React.useMemo(() => {
    if (!data) return [];
    // Sort data by value and take top 10
    const sortedData = [...data].sort((a, b) => b.totalValue - a.totalValue);
    const top10 = sortedData.slice(0, 10);

    // Calculate "Other" category value
    const otherValue =
      totalValue - top10.reduce((acc, item) => acc + item.totalValue, 0);
    const otherCount = data.length - 10;

    // Format data for pie chart
    return [
      ...top10.map((item) => ({
        name: item.category,
        value: item.totalValue,
        count: item.count,
      })),
      {
        name: "Other",
        value: otherValue,
        count: otherCount,
      },
    ];
  }, [data, totalValue]);

  // Color scheme
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
    "#E5E7EB", // Gray for "Other"
  ];

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Industries by Awarded Value
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        The industries that received the most money from tenders
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius="100%"
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip totalValue={totalValue} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
