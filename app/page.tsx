"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import FuelDropdown from "@/components/FuelDropdown";
import TripCalculator from "@/components/TripCalculator";
import TripHistory from "@/components/TripHistory";
import TripChart from "@/components/TripChart";
import { Trip, FuelPrice, Location } from "@/types";

// Dynamic import for Map component to avoid SSR issues
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg" />
  ),
});

export default function Home() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [selectedStation, setSelectedStation] = useState<Location | null>(null);
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);
  const [selectedFuelType, setSelectedFuelType] = useState<string>("Diesel");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [locationError, setLocationError] = useState<string>("");

  useEffect(() => {
    // Load trips from localStorage
    const savedTrips = localStorage.getItem("fuelTrips");
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    }

    // Fetch fuel prices
    fetchFuelPrices();
  }, []);

  const fetchFuelPrices = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/fuel-prices");
      const data = await response.json();
      // Transform the data to match the FuelPrice interface
      const transformedData: FuelPrice[] = data.map((item: any) => ({
        station: item.stationName || "",
        location: `${item.lat},${item.lng}`,
        fuelType: item.fuelType,
        price: item.price,
        updatedAt: new Date().toISOString(),
        lat: item.lat,
        lng: item.lng,
      }));
      setFuelPrices(transformedData);
    } catch (error) {
      console.error("Error fetching fuel prices:", error);
    }
  };

  const getUserLocation = () => {
    setLocationError("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: "Your Location",
          });
        },
        () => {
          setLocationError("Unable to get your location. Please enable GPS.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  const handleTripSave = (trip: Trip) => {
    const updatedTrips = [
      ...trips,
      {
        ...trip,
        cost: trip.distance * trip.fuelPrice, // Calculate cost if not provided
        duration: 0, // Default duration if not provided
      },
    ];
    setTrips(updatedTrips);
    localStorage.setItem("fuelTrips", JSON.stringify(updatedTrips));
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          ⛽ Fuel Tracker
        </h1>
        <p className="text-gray-600 text-lg">
          Find the cheapest fuel prices and calculate your trip costs
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* GPS Location Button */}
          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              📍 Your Location
            </h2>
            <button onClick={getUserLocation} className="btn-primary w-full">
              Get My GPS Location
            </button>
            {locationError && (
              <p className="text-red-500 mt-2 text-sm">{locationError}</p>
            )}
            {userLocation && (
              <p className="text-green-600 mt-2 text-sm">
                Location found: {userLocation.lat.toFixed(4)},{" "}
                {userLocation.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Fuel Type Selection */}
          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              ⛽ Fuel Type & Prices
            </h2>
            <FuelDropdown
              fuelPrices={fuelPrices}
              selectedFuelType={selectedFuelType}
              onFuelTypeChange={setSelectedFuelType}
            />
          </div>

          {/* Trip Calculator */}
          {userLocation && selectedStation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <TripCalculator
                userLocation={userLocation}
                selectedStation={selectedStation}
                fuelPrice={
                  fuelPrices.find((fp) => fp.fuelType === selectedFuelType)
                    ?.price || 0
                }
                fuelType={selectedFuelType}
                onTripSave={handleTripSave}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Right Column - Map */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-[500px] lg:h-auto glass-effect rounded-xl p-2"
        >
          <Map
            userLocation={userLocation}
            fuelStations={fuelPrices}
            selectedStation={selectedStation}
            onStationSelect={setSelectedStation}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <TripHistory trips={trips} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <TripChart trips={trips} />
        </motion.div>
      </div>
    </main>
  );
}
