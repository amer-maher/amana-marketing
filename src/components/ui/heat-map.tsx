'use client';

import { useState, useEffect } from 'react';

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

interface HeatMapProps {
  title: string;
  data: RegionalData[];
  className?: string;
  metric?: 'revenue' | 'conversions' | 'roas' | 'spend' | 'impressions';
}

export function HeatMap({ 
  title, 
  data, 
  className = "",
  metric = 'revenue'
}: HeatMapProps) {
  const [selectedMetric, setSelectedMetric] = useState(metric);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  console.log('HeatMap received data:', data);
  console.log('Data length:', data?.length);

  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <div className="text-lg mb-2">No regional data available</div>
          <div className="text-sm">Data received: {JSON.stringify(data)}</div>
        </div>
      </div>
    );
  }

  // Get the metric values for color mapping
  const metricValues = data.map(item => {
    const value = (() => {
      switch (selectedMetric) {
        case 'revenue':
          return item.revenue || 0;
        case 'conversions':
          return item.conversions || 0;
        case 'roas':
          return item.roas || 0;
        case 'spend':
          return item.spend || 0;
        case 'impressions':
          return item.impressions || 0;
        default:
          return item.revenue || 0;
      }
    })();
    return Number(value) || 0;
  });

  console.log('Metric values:', metricValues);
  console.log('Selected metric:', selectedMetric);

  const maxValue = Math.max(...metricValues);
  const minValue = Math.min(...metricValues);

  console.log('Min/Max values:', { minValue, maxValue });

  // Format value based on metric
  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'revenue':
      case 'spend':
        return `$${value.toLocaleString()}`;
      case 'conversions':
      case 'impressions':
        return value.toLocaleString();
      case 'roas':
        return `${value.toFixed(2)}x`;
      default:
        return value.toLocaleString();
    }
  };

  // Get color intensity based on value
  const getColorIntensity = (value: number) => {
    if (maxValue === minValue) return 0.5;
    return (value - minValue) / (maxValue - minValue);
  };

  // Get color based on intensity
  const getHeatColor = (intensity: number) => {
    const alpha = Math.max(0.2, Math.min(1, intensity));
    return `rgba(59, 130, 246, ${alpha})`; // Blue color with varying opacity
  };

  const metricOptions = [
    { value: 'revenue', label: 'Revenue' },
    { value: 'conversions', label: 'Conversions' },
    { value: 'roas', label: 'ROAS' },
    { value: 'spend', label: 'Spend' },
    { value: 'impressions', label: 'Impressions' }
  ];

  const hoveredData = hoveredRegion ? data.find(d => d.region === hoveredRegion) : null;

  console.log('About to render heat map with', data.length, 'items');

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        
        {/* Metric Selector */}
        <select 
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value as any)}
          className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
        >
          {metricOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Debug info */}
      <div className="mb-4 p-2 bg-gray-700 rounded text-xs text-gray-300">
        Data points: {data.length} | Metric: {selectedMetric} | Values: {metricValues.join(', ')}
      </div>

      {/* Heat Map Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {data.map((item, index) => {
          const metricValue = metricValues[index];
          const intensity = getColorIntensity(metricValue);
          const color = getHeatColor(intensity);
          
          console.log(`Rendering region ${item.region}:`, { metricValue, intensity, color });
          
          return (
            <div
              key={`${item.region}-${item.country}-${index}`}
              className="relative p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200 cursor-pointer min-h-[120px]"
              style={{ backgroundColor: color }}
              onMouseEnter={() => setHoveredRegion(item.region)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              {/* Region Name */}
              <div className="text-white font-medium text-sm mb-1">
                {item.region || 'Unknown'}
              </div>
              
              {/* Country */}
              <div className="text-gray-300 text-xs mb-2">
                {item.country || 'Unknown'}
              </div>
              
              {/* Metric Value */}
              <div className="text-white font-bold text-lg">
                {formatValue(metricValue, selectedMetric)}
              </div>
              
              {/* Performance Indicator */}
              <div className="mt-2 flex items-center">
                <div className="w-2 h-2 rounded-full mr-2" 
                     style={{ backgroundColor: intensity > 0.7 ? '#10B981' : intensity > 0.4 ? '#F59E0B' : '#EF4444' }}>
                </div>
                <span className="text-xs text-gray-300">
                  {intensity > 0.7 ? 'High' : intensity > 0.4 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Legend */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span>Low</span>
        <div className="flex-1 mx-4 h-3 rounded" 
             style={{
               background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 1))'
             }}>
        </div>
        <span>High</span>
      </div>

      {/* Tooltip/Details Panel */}
      {hoveredData && (
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <h4 className="text-white font-semibold mb-3">
            {hoveredData.region}, {hoveredData.country}
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Revenue</div>
              <div className="text-white font-medium">{formatValue(hoveredData.revenue, 'revenue')}</div>
            </div>
            
            <div>
              <div className="text-gray-400">Conversions</div>
              <div className="text-white font-medium">{hoveredData.conversions.toLocaleString()}</div>
            </div>
            
            <div>
              <div className="text-gray-400">ROAS</div>
              <div className="text-white font-medium">{hoveredData.roas.toFixed(2)}x</div>
            </div>
            
            <div>
              <div className="text-gray-400">CTR</div>
              <div className="text-white font-medium">{hoveredData.ctr.toFixed(2)}%</div>
            </div>
            
            <div>
              <div className="text-gray-400">Conv. Rate</div>
              <div className="text-white font-medium">{hoveredData.conversion_rate.toFixed(2)}%</div>
            </div>
            
            <div>
              <div className="text-gray-400">CPC</div>
              <div className="text-white font-medium">${hoveredData.cpc.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}