"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Location, FuelPrice } from "@/types";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapProps {
  userLocation: Location | null;
  fuelStations: FuelPrice[];
  selectedStation: Location | null;
  onStationSelect: (station: Location) => void;
}

const OPENROUTE_API_KEY =
  "5b3ce3597851110001cf624883bb3b5b72ca49f4b0a6c63f5c91392f";
const OPENROUTE_URL =
  "https://api.openrouteservice.org/v2/directions/driving-car";

export default function Map({
  userLocation,
  fuelStations,
  selectedStation,
  onStationSelect,
}: MapProps) {
  const [route, setRoute] = useState<[number, number][]>([]);
  const defaultCenter: [number, number] = [51.05, 3.7167]; // Gent, Belgium

  useEffect(() => {
    if (userLocation && selectedStation) {
      fetchRoute();
    }
  }, [userLocation, selectedStation]);

  const fetchRoute = async () => {
    if (!userLocation || !selectedStation) return;

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
        const coordinates = data.routes[0].geometry.coordinates.map(
          (coord: number[]) => [coord[1], coord[0]] as [number, number]
        );
        setRoute(coordinates);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const userIcon = new L.Icon({
    iconUrl:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjM0I4MkY2IiBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0iIzNCODJGNiIvPjwvc3ZnPg==",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const stationIcon = new L.Icon({
    iconUrl:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjRjU5RTBCIiBkPSJNMTkuNzcgNy4yM2wuMDEtLjAxTDE2LjI0IDMuNjhsLS43MS43MWwyLjA5IDIuMDljLS42My44NC0xLjEyIDEuNDItMS4xMiAyLjMyIDAgLjIuMDIuNDEuMDYuNjJMMTMgMTN2LTJjMC0xLjY2LTEuMzQtMy0zLTNINnYtNGgxVjNoLTRjLS41NSAwLTEgLjQ1LTEgMXY0YzAgLjU1LjQ1IDEgMSAxaDFsMSA5djdoNHYtNWg0djVoNHYtN0gxN3YtMi42NGMuNS4zNyAxLjEyLjY0IDEuOC42NEE0LjAwNSA0LjAwNSAwIDAgMCAxOS43NyA3LjIzek04IDE4djMtM2MtMi44MSAwLTUuMjEtMS42My02LjMzLTRsMS44Ny00Ljg3QzMuODIgOC40NyA0LjM3IDggNSA4aDVjLjU1IDAgMSAuNDUgMSAxdjRINy4zM0M2LjIxIDE1LjM3IDMuODEgMTggOCAxOHptMTEtOGMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6Ii8+PC9zdmc+",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  // Mock stations with coordinates (in real app, these would come from API)
  const stationsWithCoords = fuelStations.map((station, index) => ({
    ...station,
    lat: station.lat || defaultCenter[0] + (Math.random() - 0.5) * 0.1,
    lng: station.lng || defaultCenter[1] + (Math.random() - 0.5) * 0.1,
  }));

  return (
    <MapContainer
      center={
        userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter
      }
      zoom={13}
      className="w-full h-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Your Location</Popup>
        </Marker>
      )}

      {stationsWithCoords.map((station, index) => (
        <Marker
          key={index}
          position={[station.lat, station.lng]}
          icon={stationIcon}
          eventHandlers={{
            click: () => {
              onStationSelect({
                lat: station.lat,
                lng: station.lng,
                name: station.station,
              });
            },
          }}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold">{station.station}</h3>
              <p>{station.location}</p>
              <p className="text-fuel-accent font-semibold">
                {station.fuelType}: €{station.price}/L
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {route.length > 0 && (
        <Polyline positions={route} color="#3B82F6" weight={5} opacity={0.8} />
      )}
    </MapContainer>
  );
}
