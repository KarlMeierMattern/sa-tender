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

export default function CategoryProvinceChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center p-4">No data available.</div>;
  }

  // Extract all unique provinces from the data
  const provinces = new Set();
  data.forEach((cat) => {
    Object.keys(cat).forEach((key) => {
      if (key !== "category") {
        provinces.add(key);
      }
    });
  });

  // Define colors for different provinces
  const colors = {
    Gauteng: "#8884d8",
    "Western Cape": "#82ca9d",
    "KwaZulu-Natal": "#ffc658",
    "Eastern Cape": "#ff8042",
    "Free State": "#0088fe",
    Mpumalanga: "#00C49F",
    "North West": "#FFBB28",
    Limpopo: "#FF8042",
    "Northern Cape": "#AFB4FF",
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
        Category vs Province Breakdown
      </h3>
      <p className="text-sm text-gray-500 mb-2 text-center">
        Number of tenders by category and province
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
            dataKey="category"
            type="category"
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {Array.from(provinces).map((province) => (
            <Bar
              key={province}
              dataKey={province}
              stackId="a"
              fill={colors[province] || "#B8C5FF"}
              name={province}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
