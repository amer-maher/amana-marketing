'use client';

import { LeafletMapContainer, LeafletTileLayer, LeafletCircleMarker, LeafletTooltip } from './leaflet-compat';
import 'leaflet/dist/leaflet.css';

interface BubbleData {
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  value: number; // e.g. revenue, conversions, etc.
  color?: string; // optional, for custom coloring
}

export interface BubbleMapProps {
  data: BubbleData[];
  valueLabel?: string;
}

export function BubbleMap({ data, valueLabel = 'Value' }: BubbleMapProps) {
  // Calculate max for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  // Set map center (UAE as default)
  const center = [24.4539, 54.3773];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Regional Bubble Map</h3>
  <LeafletMapContainer center={center as [number, number]} zoom={2} style={{ height: 400, width: '100%' }} scrollWheelZoom={true}>
    <LeafletTileLayer
      attribution='&copy; OpenStreetMap contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {data.map((d, i) => (
      <LeafletCircleMarker
        key={i}
        center={[d.latitude, d.longitude] as [number, number]}
        radius={8 + 30 * Math.sqrt(d.value / (maxValue || 1))}
        pathOptions={{
          color: d.color || '#3B82F6',
          fillColor: d.color || '#3B82F6',
          fillOpacity: 0.6,
          weight: 1,
        }}
      >
        <LeafletTooltip
          direction="top"
          offset={[0, -10]}
          opacity={1}
          permanent={false}
        >
          <div>
            <strong>{d.region}, {d.country}</strong><br />
            {valueLabel}: {d.value.toLocaleString()}
          </div>
        </LeafletTooltip>
      </LeafletCircleMarker>
    ))}
  </LeafletMapContainer>
    </div>
  );
}
