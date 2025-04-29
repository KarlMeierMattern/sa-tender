"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function DepartmentValueChart({ data }) {
  if (!data) return null;

  // Format the data for recharts
  const chartData = data.map((item) => ({
    department: item.department,
    value: item.totalValue,
    count: item.count,
  }));

  // Custom formatter for the y-axis (currency)
  const formatCurrency = (value) => {
    if (value >= 1_000_000_000) {
      return `R ${(value / 1_000_000_000).toFixed(1)}B`;
    }
    return `R ${value.toLocaleString()}`;
  };

  const totalValue = data.reduce((acc, item) => acc + item.totalValue, 0);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
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
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#B8C5FF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
