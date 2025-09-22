'use client';

interface BasicHeatMapProps {
  title: string;
  data: any[];
  className?: string;
}

export function BasicHeatMap({ title, data, className = "" }: BasicHeatMapProps) {
  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      <div className="text-white mb-4">
        Rendering {data.length} regions:
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((region, index) => (
          <div 
            key={index}
            className="bg-blue-600 p-4 rounded-lg border border-blue-500 hover:bg-blue-700 transition-colors"
          >
            <div className="text-white font-bold text-lg mb-2">
              {region.region || 'Unknown Region'}
            </div>
            <div className="text-blue-100 text-sm mb-2">
              {region.country || 'Unknown Country'}
            </div>
            <div className="text-white">
              Revenue: ${(region.revenue || 0).toLocaleString()}
            </div>
            <div className="text-blue-200 text-sm">
              Conversions: {(region.conversions || 0).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}