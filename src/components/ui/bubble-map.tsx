"use client";
import React from 'react';

type BubbleDatum = {
  name: string; // city/region name
  country?: string;
  value: number; // numeric magnitude used for bubble size
  lat: number;
  lng: number;
  color?: string;
};

interface BubbleMapProps {
  title: string;
  data: BubbleDatum[];
  height?: number;
  className?: string;
  formatValue?: (v: number) => string;
}

// Simple world map background using an inline SVG path (abstracted for size)
export function BubbleMap({ title, data, height = 360, className = "", formatValue = (v) => v.toLocaleString() }: BubbleMapProps) {
  const maxValue = Math.max(0, ...data.map(d => d.value));
  const minRadius = 4;
  const maxRadius = 26;

  // Project lon/lat to SVG coordinates using equirectangular projection
  const project = (lng: number, lat: number, width: number, height: number) => {
    const x = (lng + 180) * (width / 360);
    const latRad = lat * Math.PI / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = height / 2 - (width * mercN) / (2 * Math.PI);
    return { x, y };
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="relative w-full" style={{ height }}>
        {/* Background map image placeholder */}
        <div className="absolute inset-0 bg-gray-900 rounded" />
        <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 1000 500" preserveAspectRatio="none">
          {/* Light graticule */}
          <g stroke="#374151" strokeWidth="0.5" opacity="0.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`v-${i}`} x1={(i+1)*80} y1={0} x2={(i+1)*80} y2={500} />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`h-${i}`} x1={0} y1={(i+1)*70} x2={1000} y2={(i+1)*70} />
            ))}
          </g>

          {/* Bubbles */}
          {data.map((d, idx) => {
            const { x, y } = project(d.lng, d.lat, 1000, 500);
            const radius = maxValue > 0
              ? minRadius + (Math.sqrt(d.value / maxValue) * (maxRadius - minRadius))
              : 0;
            const color = d.color || '#F87171';
            return (
              <g key={`${d.name}-${idx}`}>
                <circle cx={x} cy={y} r={radius} fill={color} fillOpacity="0.6" stroke={color} strokeOpacity="0.9" />
                <title>{`${d.name}${d.country ? ', ' + d.country : ''}: ${formatValue(d.value)}`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export type { BubbleDatum };
export default BubbleMap;
