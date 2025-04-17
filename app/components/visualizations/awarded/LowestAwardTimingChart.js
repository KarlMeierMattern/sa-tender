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

export default function LowestAwardTimingChart({ data }) {
  if (!data) return null;

  const chartData = {
    labels: data.map((item) => item.department),
    datasets: [
      {
        label: "Average Days to Award",
        data: data.map((item) => item.averageDays),
        backgroundColor: "#B8C5FF",
        borderColor: "#C2CDFF",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Top 10 Departments with Lowest Days to Award Tender",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = data[context.dataIndex];
            return [
              `Average Days: ${item.averageDays}`,
              `Number of Tenders: ${item.count}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Days",
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
