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

// Helper to bucket durations
function getDurationBucket(days) {
  if (days <= 7) return "1-7";
  if (days <= 14) return "8-14";
  if (days <= 21) return "15-21";
  if (days <= 30) return "22-30";
  if (days <= 60) return "31-60";
  return "61+";
}

export default function HighestAwardTimingChart({ data }) {
  if (!data) return null;

  // Group data into buckets
  const bucketCounts = {
    "1-7": 0,
    "8-14": 0,
    "15-21": 0,
    "22-30": 0,
    "31-60": 0,
    "61+": 0,
  };
  data.forEach((item) => {
    const bucket = getDurationBucket(item.duration);
    bucketCounts[bucket] = (bucketCounts[bucket] || 0) + 1;
  });

  const chartData = Object.entries(bucketCounts).map(([bucket, count]) => ({
    bucket,
    count,
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded text-xs">
          <p className="font-semibold mb-1">{item.bucket} days</p>
          <p>{`Number of Tenders: ${item.count}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Tender Duration Distribution
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        Days between advertisement and closing date
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ bottom: 20 }} barSize={60}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            fill="#B8C5FF"
            stroke="#C2CDFF"
            strokeWidth={1}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
