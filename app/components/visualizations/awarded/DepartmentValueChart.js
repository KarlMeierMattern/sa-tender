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

export default function DepartmentValueChart({ tenders }) {
  // Group and sum tender values by department
  const departmentValues = tenders.reduce((acc, tender) => {
    if (!tender.department || !tender.successfulBidderAmount) return acc;

    const value = parseFloat(tender.successfulBidderAmount) || 0;
    acc[tender.department] = (acc[tender.department] || 0) + value;
    return acc;
  }, {});

  // Sort departments by value and get top 10
  const sortedDepartments = Object.entries(departmentValues)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const data = {
    labels: sortedDepartments.map(([dept]) => dept),
    datasets: [
      {
        label: "Total Awarded Value (R)",
        data: sortedDepartments.map(([, value]) => value),
        backgroundColor: "#B8C5FF", // Base periwinkle
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
        text: "Top Departments by Awarded Tender Value",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `R ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `R ${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div>
      <Bar data={data} options={options} />
    </div>
  );
}
