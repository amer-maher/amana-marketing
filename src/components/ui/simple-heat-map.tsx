'use client';

interface SimpleHeatMapProps {
  title: string;
  data: any[];
  className?: string;
}

export function SimpleHeatMap({ title, data, className = "" }: SimpleHeatMapProps) {
  console.log('SimpleHeatMap data:', data);
  
  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      {!data || data.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No data available
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-white">Found {data.length} data points</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.slice(0, 6).map((item, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded border border-gray-600">
                <div className="text-white font-medium mb-2">
                  {item.region || 'Unknown Region'}
                </div>
                <div className="text-gray-300 text-sm">
                  {item.country || 'Unknown Country'}
                </div>
                <div className="text-blue-400 font-bold mt-2">
                  Revenue: ${(item.revenue || 0).toLocaleString()}
                </div>
                <div className="text-green-400 text-sm">
                  Conversions: {(item.conversions || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          
          {data.length > 6 && (
            <div className="text-gray-400 text-center">
              ... and {data.length - 6} more regions
            </div>
          )}
        </div>
      )}
    </div>
  );
}