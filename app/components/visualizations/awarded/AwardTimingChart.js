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
import { differenceInDays } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AwardTimingChart({ tenders }) {
  // Calculate average time from advertisement to award by department
  const departmentTiming = tenders.reduce((acc, tender) => {
    if (!tender.department || !tender.advertised || !tender.awarded) return acc;

    const daysToAward = differenceInDays(
      new Date(tender.awarded),
      new Date(tender.advertised)
    );

    if (!acc[tender.department]) {
      acc[tender.department] = { total: 0, count: 0 };
    }

    acc[tender.department].total += daysToAward;
    acc[tender.department].count += 1;

    return acc;
  }, {});

  // Calculate averages and sort by highest average
  const departmentAverages = Object.entries(departmentTiming)
    .map(([dept, { total, count }]) => ({
      department: dept,
      average: Math.round(total / count),
    }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 10);

  const data = {
    labels: departmentAverages.map((item) => item.department),
    datasets: [
      {
        label: "Average Days to Award",
        data: departmentAverages.map((item) => item.average),
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
        text: "Average Time from Advertisement to Award by Department",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${value} days`;
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
      <Bar data={data} options={options} />
    </div>
  );
}
