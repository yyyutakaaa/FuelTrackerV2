"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Trip } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TripChartProps {
  trips: Trip[];
}

export default function TripChart({ trips }: TripChartProps) {
  const recentTrips = trips.slice(-7);

  const data = {
    labels: recentTrips.map((trip) =>
      new Date(trip.date).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: "Trip Cost (€)",
        data: recentTrips.map((trip) => trip.cost),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value: any) {
            return "€" + value.toFixed(2);
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-effect rounded-xl p-6"
    >
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        📊 Trip Costs
      </h2>

      {recentTrips.length === 0 ? (
        <p className="text-gray-500 text-center py-16">
          No data to display yet
        </p>
      ) : (
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      )}
    </motion.div>
  );
}
