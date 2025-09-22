"use client";

import React from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface DataPoint {
  region: string;
  country: string;
  revenue: number;
  coordinates: [number, number]; // [longitude, latitude]
}

interface BubbleMapProps {
  data: DataPoint[];
}

export const BubbleMap: React.FC<BubbleMapProps> = ({ data }) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <MapContainer
        center={[20, 0]} // default center
        zoom={2}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {data.map((d, i) => {
          const [lng, lat] = d.coordinates;
          const radius = (d.revenue / maxRevenue) * 40;

          return (
            <CircleMarker
              key={i}
              center={[lat, lng]} // leaflet expects [lat, lng]
              radius={radius}
              pathOptions={{
                fillColor: "#34d399",
                fillOpacity: 0.5,
                color: "#10b981",
                weight: 2,
                stroke: true,
              }}
            >
              <Tooltip direction="top" offset={[0, -radius]} opacity={1}>
                <span>
                  {d.region} – {d.revenue.toLocaleString()}$
                </span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};
