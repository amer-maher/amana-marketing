import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { scaleSqrt } from "d3-scale";

interface BubbleMapProps {
  data: {
    region: string;
    country: string;
    revenue: number;
    coordinates: [number, number]; // [longitude, latitude]
  }[];
}

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

export function BubbleMap({ data }: BubbleMapProps) {
  // Scale bubble size by revenue
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const sizeScale = scaleSqrt().domain([0, maxRevenue]).range([5, 40]);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ComposableMap projection="geoMercator">
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map(geo => (
              <Geography key={geo.rsmKey} geography={geo} fill="#222" stroke="#444" />
            ))
          }
        </Geographies>
        {data.map((d, i) => (
          <Marker key={i} coordinates={d.coordinates}>
            <circle
              r={sizeScale(d.revenue)}
              fill="#34d399"
              fillOpacity={0.5}
              stroke="#10b981"
              strokeWidth={2}
            />
            <text textAnchor="middle" y={-sizeScale(d.revenue) - 4} fill="#fff" fontSize={12}>
              {d.region}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}