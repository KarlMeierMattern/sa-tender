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

export default function TopSuppliersChart({ tenders }) {
  // Group and sum tender values by supplier
  const supplierValues = tenders.reduce((acc, tender) => {
    if (!tender.successfulBidderName || !tender.successfulBidderAmount)
      return acc;

    const value = parseFloat(tender.successfulBidderAmount) || 0;
    acc[tender.successfulBidderName] =
      (acc[tender.successfulBidderName] || 0) + value;
    return acc;
  }, {});

  // Sort suppliers by value and get top 10
  const sortedSuppliers = Object.entries(supplierValues)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const data = {
    labels: sortedSuppliers.map(([supplier]) => supplier),
    datasets: [
      {
        label: "Total Awarded Value (R)",
        data: sortedSuppliers.map(([, value]) => value),
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
            const value = context.raw;
            return `R ${value.toLocaleString()}`;
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
      <Bar data={data} options={options} />
    </div>
  );
}
