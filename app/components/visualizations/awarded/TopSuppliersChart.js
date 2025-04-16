"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TopSuppliersChart({ data }) {
  if (!data) {
    return <div>Loading...</div>;
  }

  const chartData = {
    labels: data.map((item) => item.supplier),
    datasets: [
      {
        label: "Total Awarded Value (R)",
        data: data.map((item) => item.totalValue),
        backgroundColor: "#B8C5FF", // Base periwinkle
        borderColor: "#C2CDFF",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: "y", // This makes it a horizontal bar chart
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Top 10 Suppliers by Awarded Value",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = data[context.dataIndex];
            return [
              `Total Value: R ${item.totalValue.toLocaleString()}`,
              `Number of Tenders: ${item.count}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `R ${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div>
      <Bar data={chartData} options={options} />
    </div>
  );
}
