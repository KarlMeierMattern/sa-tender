"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function TopSuppliersChart({ data }) {
  if (!data) return null;

  // Format data for recharts
  const chartData = data.map((item) => ({
    supplier: item.supplier,
    value: item.totalValue,
    count: item.count,
  }));

  // Custom formatter for the x-axis (currency)
  const formatCurrency = (value) => {
    return `R ${value.toLocaleString()}`;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-semibold mb-1">{item.supplier}</p>
          <p>{`Total Value: R ${item.value.toLocaleString()}`}</p>
          <p>{`Number of Tenders: ${item.count}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Top 10 Suppliers by Awarded Value
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        Top 10 suppliers by awarded value
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 5,
            right: 20,
            left: 40,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickFormatter={formatCurrency}
            textAnchor="end"
            height={60}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="supplier"
            width={120}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            fill="#B8C5FF"
            stroke="#C2CDFF"
            strokeWidth={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
