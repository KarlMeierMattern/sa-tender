"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload, label, totalValue }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded text-xs">
        <p className="font-semibold mb-1">{label}</p>
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

export default function DepartmentByProcurementValue({ data }) {
  // Memoize chartData
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      department: item.department,
      value: item.totalValue,
      count: item.count,
    }));
  }, [data]);

  // Custom formatter for the y-axis (currency)
  const formatCurrency = (value) => {
    if (value >= 1_000_000_000) {
      return `R ${(value / 1_000_000_000).toFixed(1)}B`;
    }
    return `R ${value.toLocaleString()}`;
  };

  const totalValue = Array.isArray(data)
    ? data.reduce((acc, item) => acc + item.totalValue, 0)
    : 0;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Department by Procurement Value
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        The departments that spent the most money on tenders
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} barSize={60}>
          <XAxis
            dataKey="department"
            tick={false}
            axisLine={false}
            height={0}
          />
          <YAxis
            tickFormatter={formatCurrency}
            width={0}
            // tick={{ fontSize: 10 }}
            tick={false}
            axisLine={{ stroke: "transparent" }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip totalValue={totalValue} />} />
          <Bar dataKey="value" fill="#B8C5FF" radius={[4, 4, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
