"use client";

import { motion } from "framer-motion";
import { Trip } from "@/types";

interface TripHistoryProps {
  trips: Trip[];
}

export default function TripHistory({ trips }: TripHistoryProps) {
  const recentTrips = trips.slice(-5).reverse();

  return (
    <div className="glass-effect rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        📋 Trip History
      </h2>

      {recentTrips.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No trips recorded yet</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {trip.from.name} → {trip.to.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(trip.date).toLocaleDateString()} •{" "}
                    {trip.distance.toFixed(1)}km • {trip.fuelType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-fuel-accent">
                    €{trip.cost.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">€{trip.fuelPrice}/L</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
