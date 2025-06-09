"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Location, Trip } from "@/types";

interface TripCalculatorProps {
  userLocation: Location;
  selectedStation: Location;
  fuelPrice: number;
  fuelType: string;
  onTripSave: (trip: Trip) => void;
}

const OPENROUTE_API_KEY =
  "5b3ce3597851110001cf624883bb3b5b72ca49f4b0a6c63f5c91392f";
const OPENROUTE_URL =
  "https://api.openrouteservice.org/v2/directions/driving-car";

export default function TripCalculator({
  userLocation,
  selectedStation,
  fuelPrice,
  fuelType,
  onTripSave,
}: TripCalculatorProps) {
  const [tripInfo, setTripInfo] = useState<{
    distance: number;
    duration: number;
    cost: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fuelConsumption, setFuelConsumption] = useState(7); // L/100km

  useEffect(() => {
    calculateTrip();
  }, [userLocation, selectedStation, fuelPrice]);

  const calculateTrip = async () => {
    setLoading(true);
    try {
      const response = await fetch(OPENROUTE_URL, {
        method: "POST",
        headers: {
          Authorization: OPENROUTE_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [userLocation.lng, userLocation.lat],
            [selectedStation.lng, selectedStation.lat],
          ],
        }),
      });

      const data = await response.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const distance = route.distance / 1000; // Convert to km
        const duration = route.duration / 60; // Convert to minutes
        const cost = ((distance * fuelConsumption) / 100) * fuelPrice;

        setTripInfo({
          distance,
          duration,
          cost,
        });
      }
    } catch (error) {
      console.error("Error calculating trip:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = () => {
    if (!tripInfo) return;

    const trip: Trip = {
      id: Date.now().toString(),
      from: userLocation,
      to: selectedStation,
      distance: tripInfo.distance,
      duration: tripInfo.duration,
      fuelType,
      fuelPrice,
      cost: tripInfo.cost,
      date: new Date().toISOString(),
    };

    onTripSave(trip);
  };

  if (loading) {
    return (
      <div className="glass-effect rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-6 space-y-4"
    >
      <h2 className="text-2xl font-semibold text-gray-800">
        🚗 Trip Calculator
      </h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-gray-700">📍 From:</span>
          <span className="font-semibold">{userLocation.name}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <span className="text-gray-700">⛽ To:</span>
          <span className="font-semibold">{selectedStation.name}</span>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">
            Fuel Consumption (L/100km)
          </label>
          <input
            type="number"
            value={fuelConsumption}
            onChange={(e) => setFuelConsumption(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-fuel-primary focus:ring-2 focus:ring-fuel-primary/20"
            step="0.1"
          />
        </div>
      </div>

      {tripInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3 pt-4 border-t border-gray-200"
        >
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Distance:</span>
            <span className="font-bold text-lg">
              {tripInfo.distance.toFixed(1)} km
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Duration:</span>
            <span className="font-bold text-lg">
              {Math.round(tripInfo.duration)} min
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Fuel Cost:</span>
            <span className="font-bold text-2xl text-fuel-accent">
              €{tripInfo.cost.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleSaveTrip}
            className="btn-secondary w-full mt-4"
          >
            Save Trip
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
