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

export default function ProvinceBarChart({ tenders }) {
  // Process data to get counts per province
  const provinceData = React.useMemo(() => {
    const counts = {};
    tenders.forEach((tender) => {
      const province = tender.province || "Unknown";
      counts[province] = (counts[province] || 0) + 1;
    });

    return Object.entries(counts).map(([province, count]) => ({
      province,
      count,
    }));
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
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
          <Bar dataKey="count" fill="#818CF8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
