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

export default function DepartmentValueChart({ data }) {
  if (!data) return null;

  // Format the data for recharts
  const chartData = data.map((item) => ({
    department: item.department,
    value: item.totalValue,
  }));

  // Custom formatter for the y-axis (currency)
  const formatCurrency = (value) => {
    return `R ${value.toLocaleString()}`;
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-semibold mb-1">{label}</p>
          <p>{`Total Value: R ${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Department by Total Value Awarded
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        Total value awarded to each department
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
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
          <YAxis
            tickFormatter={formatCurrency}
            width={80}
            tick={{ fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#B8C5FF" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
