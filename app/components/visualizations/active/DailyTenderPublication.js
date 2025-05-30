"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import React from "react";

export default function DailyTenderPublication({ data }) {
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      date: item.date,
      count: item.count,
    }));
  }, [data]);

  // Format the date to show day and month
  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleString("default", { day: "numeric", month: "short" });
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Daily Tender Publications
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        The number of tenders published in the last 30 days
      </p>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ left: -20, right: 20 }}>
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            interval="preserveStartEnd"
            textAnchor="end"
            height={60}
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={{ stroke: "transparent" }}
            tickLine={false}
          />
          <YAxis
            tick={false}
            axisLine={{ stroke: "transparent" }}
            tickLine={false}
          />
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
