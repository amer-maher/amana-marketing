"use client";
import { useEffect, useState } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { LineChart } from '../../src/components/ui/line-chart';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, WeeklyPerformance } from '../../src/types/marketing';

export default function WeeklyView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const weekly = (marketingData?.campaigns || [])
    .flatMap(c => c.weekly_performance || []) as WeeklyPerformance[];

  // Aggregate by week_start (in case multiple campaigns share the same week)
  const weekKeyToTotals = weekly.reduce<Record<string, { revenue: number; spend: number }>>((acc, w) => {
    const key = w.week_start;
    if (!acc[key]) acc[key] = { revenue: 0, spend: 0 };
    acc[key].revenue += w.revenue || 0;
    acc[key].spend += w.spend || 0;
    return acc;
  }, {});

  const sortedWeeks = Object.keys(weekKeyToTotals).sort();

  const revenueSeries = {
    name: 'Revenue',
    color: '#10B981',
    data: sortedWeeks.map(label => ({ label, value: weekKeyToTotals[label].revenue })),
  };

  const spendSeries = {
    name: 'Spend',
    color: '#3B82F6',
    data: sortedWeeks.map(label => ({ label, value: weekKeyToTotals[label].spend })),
  };

  if (loading) {
    return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">
                Weekly View
              </h1>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="text-white">Loading weekly data...</div>
        </div>
        
        <Footer />
      </div>
    </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">
                Weekly View
              </h1>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart
              title="Revenue by Week"
              series={[revenueSeries]}
              formatValue={(v) => `$${v.toLocaleString()}`}
            />
            <LineChart
              title="Spend by Week"
              series={[spendSeries]}
              formatValue={(v) => `$${v.toLocaleString()}`}
            />
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
