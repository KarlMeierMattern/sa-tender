"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function TimelineChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center p-4">No timeline data available.</div>;
  }

  // Format the date to show day and month
  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleString("default", { day: "numeric", month: "short" });
  };

  return (
    <div className="w-full h-[400px]">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Daily Tender Publications
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        Number of tenders published in the last 30 days
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            interval="preserveStartEnd"
            textAnchor="end"
            height={60}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleString("default", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
            }}
            contentStyle={{ fontSize: "12px" }} // Changed text size on hover
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            name="Tenders Published"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
