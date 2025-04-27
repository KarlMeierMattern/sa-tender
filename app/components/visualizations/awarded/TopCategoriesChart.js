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

export default function TopCategoriesChart({ data }) {
  if (!data) return null;

  // Format data for recharts
  const chartData = data.map((item) => ({
    category: item.category,
    value: item.totalValue,
    count: item.count,
  }));

  // Custom formatter for the x-axis (currency)
  const formatCurrency = (value) => {
    return `R ${value.toLocaleString()}`;
  };

  // const totalValue = data.reduce((acc, item) => acc + item.totalValue, 0);

  const totalValue = data.reduce((acc, item) => acc + item.totalValue, 0);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-semibold mb-1">{item.category}</p>
          <p>{`Total Value: R ${item.value.toLocaleString()}`}</p>
          <p>{`Number of Tenders: ${item.count}`}</p>
          <p>{`% of total value: ${((item.value / totalValue) * 100).toFixed(
            2
          )}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Top 10 Categories by Awarded Value
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        Top categories by total awarded value
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          barSize={20}
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
            dataKey="category"
            width={120}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            fill="#B8C5FF"
            stroke="#C2CDFF"
            strokeWidth={1}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
