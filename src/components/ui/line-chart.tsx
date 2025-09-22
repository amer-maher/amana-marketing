"use client";
import React from 'react';

type LinePoint = {
  label: string; // x-axis label (e.g., week)
  value: number; // y-axis value
};

interface LineSeries {
  name: string;
  color?: string;
  data: LinePoint[];
}

interface LineChartProps {
  title: string;
  series: LineSeries[]; // supports 1..n series (e.g., Spend, Revenue)
  height?: number;
  showValues?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

// Compatibility props used by some callers: { data, dataKeys, xKey }
interface CompatKey {
  key: string; // key in each datum for y value
  name: string; // series display name
  color?: string;
}

interface LineChartCompatProps {
  title: string;
  data: Array<Record<string, any>>; // [{ week: '2024-10-01', revenue: 100, spend: 50 }]
  dataKeys: CompatKey[]; // [{ key: 'revenue', name: 'Revenue' }, ...]
  xKey?: string; // default 'label'
  height?: number;
  showValues?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

type Props = LineChartProps | LineChartCompatProps;

export function LineChart(props: Props) {
  const {
    title,
    height = 280,
    showValues = false,
    formatValue = (v: number) => v.toLocaleString(),
    className = "",
  } = props as any;

  // Normalize to series-based structure
  const series: LineSeries[] = ((): LineSeries[] => {
    if ((props as any).series) return (props as LineChartProps).series;
    const compat = props as LineChartCompatProps;
    const xKey = compat.xKey || 'label';
    return compat.dataKeys.map((ck, idx) => ({
      name: ck.name,
      color: ck.color,
      data: compat.data.map(d => ({ label: String(d[xKey]), value: Number(d[ck.key]) || 0 })),
    }));
  })();

  const labels = Array.from(new Set(series.flatMap((s) => s.data.map((d) => d.label))));

  const maxValue = Math.max(
    0,
    ...series.flatMap((s) => s.data.map((d) => d.value))
  );

  const colors = [
    '#60A5FA', '#34D399', '#FBBF24', '#F472B6', '#A78BFA', '#22D3EE',
  ];

  const getPointFor = (label: string, s: LineSeries) =>
    s.data.find((d) => d.label === label)?.value ?? 0;

  const paddingTop = 12;
  const paddingBottom = 28;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {labels.length === 0 || maxValue === 0 ? (
        <div className="flex items-center justify-center h-40 text-gray-400">No data available</div>
      ) : (
        <div className="relative" style={{ height }}>
          {/* Y grid */}
          <div className="absolute inset-0 pointer-events-none">
            {[0.25, 0.5, 0.75].map((r) => (
              <div
                key={r}
                className="absolute w-full border-t border-gray-700 opacity-30"
                style={{ bottom: `${paddingBottom + r * (height - paddingTop - paddingBottom)}px` }}
              />
            ))}
          </div>

          {/* Chart body */}
          <div className="flex items-end h-full">
            {/* X-axis labels area */}
            <div className="w-full flex items-end">
              {labels.map((label, idx) => (
                <div key={label} className="flex-1 flex flex-col items-center">
                  {/* Series stacked points */}
                  <div className="relative w-full" style={{ height: height - paddingBottom }}>
                    {series.map((s, sIdx) => {
                      const color = s.color || colors[sIdx % colors.length];
                      const value = getPointFor(label, s);
                      const y = (value / maxValue) * (height - paddingTop - paddingBottom);
                      return (
                        <div key={`${s.name}-${idx}`} className="absolute bottom-0 left-0 right-0 flex justify-center">
                          <div
                            className="rounded-full"
                            style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: color,
                              transform: `translateY(-${y}px)`,
                            }}
                            title={`${s.name}: ${formatValue(value)}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-400 mt-2 break-words text-center">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="absolute right-0 top-0 flex gap-3">
            {series.map((s, sIdx) => (
              <div key={s.name} className="flex items-center gap-2 text-xs text-gray-300">
                <span
                  className="inline-block w-3 h-3 rounded"
                  style={{ backgroundColor: s.color || colors[sIdx % colors.length] }}
                />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LineChart;