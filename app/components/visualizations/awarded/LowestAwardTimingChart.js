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

export default function LowestAwardTimingChart({ data }) {
  if (!data) return null;

  // Format data for recharts
  const chartData = data.map((item) => ({
    department: item.department,
    averageDays: item.averageDays,
    count: item.count,
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-semibold mb-1">{item.department}</p>
          <p>{`Average Days: ${item.averageDays}`}</p>
          <p>{`Number of Tenders: ${item.count}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Top 10 Departments with Lowest Days to Award Tender
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        Top 10 departments with lowest days to award tender
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            bottom: 20, // Extra space for department names
          }}
          barSize={60}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="department"
            angle={-45}
            textAnchor="end"
            height={120}
            tick={(props) => {
              const { x, y, payload } = props;

              // Calculate how to break up long text
              const words = payload.value.split(" ");
              const lineHeight = 12;
              const width = 150; // increased maximum width for more words per line
              let line = [];
              let lines = [];
              let currentWidth = 0;

              // Create wrapped lines for long text
              words.forEach((word) => {
                const wordWidth = word.length * 6; // rough estimate of word width
                if (currentWidth + wordWidth > width) {
                  lines.push(line.join(" "));
                  line = [word];
                  currentWidth = wordWidth;
                } else {
                  line.push(word);
                  currentWidth += wordWidth;
                }
              });
              if (line.length > 0) lines.push(line.join(" "));

              return (
                <g transform={`translate(${x},${y})`}>
                  {lines.map((line, i) => (
                    <text
                      key={i}
                      x={0}
                      y={i * lineHeight}
                      dy={0}
                      textAnchor="end"
                      fill="#666"
                      fontSize={10}
                      transform="rotate(-45)"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            }}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="averageDays"
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
