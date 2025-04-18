"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function DepartmentTenderTypeChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center p-4">No data available.</div>;
  }

  // Extract all unique tender types from the data
  const tenderTypes = new Set();
  data.forEach((dept) => {
    Object.keys(dept).forEach((key) => {
      if (key !== "department") {
        tenderTypes.add(key);
      }
    });
  });

  // Define colors for different tender types
  const colors = {
    RFQ: "#8884d8",
    RFP: "#82ca9d",
    Tender: "#ffc658",
    EOI: "#ff8042",
    RFI: "#0088fe",
    Other: "#00C49F",
  };

  // Custom tooltip to display data
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-center">
        Department vs Tender Type
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        Number of tenders by department and tender type
      </p>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 100,
          }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="department"
            type="category"
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {Array.from(tenderTypes).map((type) => (
            <Bar
              key={type}
              dataKey={type}
              stackId="a"
              fill={colors[type] || "#B8C5FF"}
              name={type}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-500 text-center mt-2">
        Distribution of tender types by department
      </p>
    </div>
  );
}
