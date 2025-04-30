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

const CustomTooltip = ({ active, payload, totalTenders }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const percentage = ((item.value / totalTenders) * 100).toFixed(1);

    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded text-xs">
        <p className="font-semibold mb-1">{item.name}</p>
        <p>{`${item.value} tenders (${percentage}%)`}</p>
        <p>{`Total Value: R ${item.totalValue.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

export default function AwardedTenderDistribution({ data }) {
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      name: item.range,
      value: item.count,
      totalValue: item.totalValue,
    }));
  }, [data]);

  const totalTenders = Array.isArray(data)
    ? data.reduce((sum, item) => sum + item.count, 0)
    : 0;

  // Colors for the pie segments
  const COLORS = [
    "#B8C5FF", // Base periwinkle
    "#CCD5FF",
    "#E0E5FF",
    "#F4F1FF",
    "#FBFAFF",
    "#E5E7EB", // Lightest periwinkle
  ];

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Awarded Tender Distribution
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        The value ranges of awarded tenders
      </p>
      <div className="flex items-center justify-center">
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
            <Tooltip content={<CustomTooltip totalTenders={totalTenders} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
