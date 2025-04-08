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

export default function TenderTypeDonut({ tenders }) {
  const data = React.useMemo(() => {
    const counts = {};
    const total = tenders.length;

    tenders.forEach((tender) => {
      const type = tender.tendertype || "Unknown";
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
        percent: value / total,
      }))
      .sort((a, b) => b.value - a.value);
  }, [tenders]);

  return (
    <div className="w-full h-[400px]">
      <h2 className="text-xl font-semibold mb-6">Tenders by Type</h2>
      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
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
    </div>
  );
}
