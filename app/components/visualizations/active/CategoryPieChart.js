"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
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
  "#E2E8F0", // Light gray for "Other"
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

const renderColorfulLegendText = (value, entry) => {
  // Truncate and format category names
  const parts = value.split(":");
  if (parts.length > 1) {
    // If it's a category with a subcategory (e.g. "Services: General")
    return (
      <span className="text-xs">{`${parts[0]}: ${parts[1].slice(0, 15)}${
        parts[1].length > 15 ? "..." : ""
      }`}</span>
    );
  }
  // For single word categories or "Other"
  return (
    <span className="text-xs">
      {value.slice(0, 20)}
      {value.length > 20 ? "..." : ""}
    </span>
  );
};

export default function CategoryPieChart({ tenders }) {
  const data = React.useMemo(() => {
    const counts = {};
    const total = tenders.length;

    // Count tenders by category
    tenders.forEach((tender) => {
      const category = tender.category || "Unknown";
      counts[category] = (counts[category] || 0) + 1;
    });

    // Convert to array and sort by count
    let sortedData = Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
        percent: value / total,
      }))
      .sort((a, b) => b.value - a.value);

    // Take top 10 and group the rest as "Other"
    if (sortedData.length > 10) {
      const topTen = sortedData.slice(0, 10);
      const otherSum = sortedData
        .slice(10)
        .reduce((sum, item) => sum + item.value, 0);

      topTen.push({
        name: "Other",
        value: otherSum,
        percent: otherSum / total,
      });

      sortedData = topTen;
    }

    return sortedData;
  }, [tenders]);

  return (
    <div className="w-full h-[400px]">
      <h2 className="text-xl font-semibold mb-6">Tenders by Category</h2>
      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
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
