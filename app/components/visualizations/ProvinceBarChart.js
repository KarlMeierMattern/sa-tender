"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
        <p className="font-medium text-gray-900">{data.province}</p>
        <p className="text-gray-600">{data.count} tenders</p>
        <p className="text-gray-500 text-sm">
          {(data.percent * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

export default function ProvinceBarChart({ tenders }) {
  // Process data to get counts per province
  // useMemo caches the result of the function so that it is not recalculated on every render
  const provinceData = React.useMemo(() => {
    const counts = {};
    const total = tenders.length;

    tenders.forEach((tender) => {
      const province = tender.province || "Unknown";
      counts[province] = (counts[province] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([province, count]) => ({
        province,
        count,
        percent: count / total,
      }))
      .sort((a, b) => b.count - a.count);
  }, [tenders]);

  return (
    <div className="w-full h-[400px]">
      <h2 className="text-xl font-semibold mb-6">Tenders by Province</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={provinceData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="province"
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
