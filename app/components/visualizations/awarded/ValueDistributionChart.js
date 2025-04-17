"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function ValueDistributionChart({ data }) {
  if (!data) return null;

  const chartData = {
    labels: data.map((item) => item.range),
    datasets: [
      {
        data: data.map((item) => item.count),
        backgroundColor: [
          "#B8C5FF", // Base periwinkle
          "#C2CDFF",
          "#CCD5FF",
          "#D6DDFF",
          "#E0E5FF",
        ],
      },
    ],
  };

  const totalTenders = data.reduce((sum, item) => sum + item.count, 0);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        align: "center",
      },
      title: {
        display: true,
        text: "Distribution of Awarded Tender Values",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = data[context.dataIndex];
            const percentage = ((item.count / totalTenders) * 100).toFixed(1);
            const value = item.totalValue.toLocaleString();
            return [
              `Count: ${item.count} tenders (${percentage}%)`,
              `Total Value: R ${value}`,
            ];
          },
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        right: 120,
        bottom: 20,
        left: 20,
      },
    },
    canvas: {
      height: 400,
      width: 600,
    },
  };

  return <Pie data={chartData} options={options} height={400} width={600} />;
}
