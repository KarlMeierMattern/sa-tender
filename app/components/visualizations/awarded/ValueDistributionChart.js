"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function ValueDistributionChart({ tenders }) {
  // Group tenders by value ranges
  const ranges = {
    "< R1M": 0,
    "R1M - R5M": 0,
    "R5M - R10M": 0,
    "R10M - R50M": 0,
    "> R50M": 0,
  };

  tenders.forEach((tender) => {
    const value = tender.successfulBidderAmount;

    // Add console log to debug values
    console.log("Processing tender value:", value);

    if (value < 1_000_000) ranges["< R1M"]++;
    else if (value < 5_000_000) ranges["R1M - R5M"]++;
    else if (value < 10_000_000) ranges["R5M - R10M"]++;
    else if (value < 50_000_000) ranges["R10M - R50M"]++;
    else ranges["> R50M"]++;
  });

  // Log final ranges for debugging
  console.log("Final ranges:", ranges);

  const data = {
    labels: Object.keys(ranges),
    datasets: [
      {
        data: Object.values(ranges),
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
            const value = context.raw;
            const percentage = ((value / tenders.length) * 100).toFixed(1);
            return `${context.label}: ${value} tenders (${percentage}%)`;
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

  return <Pie data={data} options={options} height={400} width={600} />;
}
