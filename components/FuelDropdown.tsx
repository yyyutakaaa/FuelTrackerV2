"use client";

import { motion } from "framer-motion";
import { FuelPrice } from "@/types";

interface FuelDropdownProps {
  fuelPrices: FuelPrice[];
  selectedFuelType: string;
  onFuelTypeChange: (fuelType: string) => void;
}

export default function FuelDropdown({
  fuelPrices,
  selectedFuelType,
  onFuelTypeChange,
}: FuelDropdownProps) {
  const uniqueFuelTypes = Array.from(
    new Set(fuelPrices.map((fp) => fp.fuelType))
  );
  const avgPriceByType = uniqueFuelTypes.reduce((acc, type) => {
    const prices = fuelPrices
      .filter((fp) => fp.fuelType === type)
      .map((fp) => fp.price);
    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    return { ...acc, [type]: avg };
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <select
        value={selectedFuelType}
        onChange={(e) => onFuelTypeChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-fuel-primary focus:ring-2 focus:ring-fuel-primary/20 transition-all duration-200"
      >
        {uniqueFuelTypes.map((type) => (
          <option key={type} value={type}>
            {type} - Avg: €{avgPriceByType[type]?.toFixed(3)}/L
          </option>
        ))}
      </select>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ duration: 0.3 }}
        className="space-y-2 max-h-60 overflow-y-auto"
      >
        {fuelPrices
          .filter((fp) => fp.fuelType === selectedFuelType)
          .sort((a, b) => a.price - b.price)
          .slice(0, 5)
          .map((price, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-3 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-semibold text-sm">{price.station}</p>
                <p className="text-xs text-gray-600">{price.location}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-fuel-accent">€{price.price}/L</p>
                <p className="text-xs text-gray-500">
                  {new Date(price.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
      </motion.div>
    </div>
  );
}
