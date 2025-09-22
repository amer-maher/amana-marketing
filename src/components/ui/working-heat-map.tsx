'use client';

import { useState } from 'react';

interface RegionalData {
  region: string;
  country: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  conversion_rate: number;
  cpc: number;
  cpa: number;
  roas: number;
}

interface WorkingHeatMapProps {
  title: string;
  data: RegionalData[];
  className?: string;
}

export function WorkingHeatMap({ title, data, className = "" }: WorkingHeatMapProps) {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'conversions' | 'roas'>('revenue');

  console.log('WorkingHeatMap rendering with data:', data);

  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="text-gray-400 text-center py-8">No data available</div>
      </div>
    );
  }

  // Get values for the selected metric
  const values = data.map(item => {
    switch (selectedMetric) {
      case 'revenue':
        return Number(item.revenue) || 0;
      case 'conversions':
        return Number(item.conversions) || 0;
      case 'roas':
        return Number(item.roas) || 0;
      default:
        return Number(item.revenue) || 0;
    }
  });

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  // Format value for display
  const formatValue = (value: number) => {
    switch (selectedMetric) {
      case 'revenue':
        return `$${value.toLocaleString()}`;
      case 'conversions':
        return value.toLocaleString();
      case 'roas':
        return `${value.toFixed(2)}x`;
      default:
        return value.toLocaleString();
    }
  };

  // Get color intensity (0-1)
  const getIntensity = (value: number) => {
    if (maxValue === minValue) return 0.5;
    return (value - minValue) / (maxValue - minValue);
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <select 
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value as any)}
          className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
        >
          <option value="revenue">Revenue</option>
          <option value="conversions">Conversions</option>
          <option value="roas">ROAS</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {data.map((region, index) => {
          const value = values[index];
          const intensity = getIntensity(value);
          const bgColor = `rgba(59, 130, 246, ${Math.max(0.2, intensity)})`;
          
          return (
            <div
              key={`${region.region}-${region.country}`}
              className="p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200"
              style={{ backgroundColor: bgColor }}
            >
              <div className="text-white font-medium text-sm mb-1">
                {region.region}
              </div>
              <div className="text-gray-300 text-xs mb-2">
                {region.country}
              </div>
              <div className="text-white font-bold">
                {formatValue(value)}
              </div>
              <div className="mt-2 flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ 
                    backgroundColor: intensity > 0.7 ? '#10B981' : intensity > 0.4 ? '#F59E0B' : '#EF4444' 
                  }}
                />
                <span className="text-xs text-gray-300">
                  {intensity > 0.7 ? 'High' : intensity > 0.4 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Legend */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Low</span>
        <div className="flex-1 mx-4 h-3 rounded bg-gradient-to-r from-blue-200 to-blue-600" />
        <span>High</span>
      </div>
    </div>
  );
}