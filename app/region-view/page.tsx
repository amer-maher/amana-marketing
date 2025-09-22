"use client";
import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import BubbleMap, { BubbleDatum } from '../../src/components/ui/bubble-map';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, RegionalPerformance } from '../../src/types/marketing';

export default function RegionView() {
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

  // Aggregate regional performance across campaigns
  const regional = useMemo(() => {
    const list = (marketingData?.campaigns || [])
      .flatMap(c => c.regional_performance || []) as RegionalPerformance[];
    const map = new Map<string, { region: string; country: string; spend: number; revenue: number }>();
    for (const r of list) {
      const key = `${r.region}|${r.country}`;
      const prev = map.get(key) || { region: r.region, country: r.country, spend: 0, revenue: 0 };
      prev.spend += r.spend || 0;
      prev.revenue += r.revenue || 0;
      map.set(key, prev);
    }
    return Array.from(map.values());
  }, [marketingData]);

  // Naive lat/lng lookup for a few common cities/regions; fallback center
  const coordLookup: Record<string, { lat: number; lng: number }> = {
    'Abu Dhabi|UAE': { lat: 24.4539, lng: 54.3773 },
    'Dubai|UAE': { lat: 25.2048, lng: 55.2708 },
  };

  const spendData: BubbleDatum[] = regional.map(r => ({
    name: r.region,
    country: r.country,
    value: r.spend,
    lat: coordLookup[`${r.region}|${r.country}`]?.lat ?? 20,
    lng: coordLookup[`${r.region}|${r.country}`]?.lng ?? 0,
    color: '#60A5FA'
  }));

  const revenueData: BubbleDatum[] = regional.map(r => ({
    name: r.region,
    country: r.country,
    value: r.revenue,
    lat: coordLookup[`${r.region}|${r.country}`]?.lat ?? 20,
    lng: coordLookup[`${r.region}|${r.country}`]?.lng ?? 0,
    color: '#F59E0B'
  }));

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
                Region View
              </h1>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="text-white">Loading regional data...</div>
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
                Region View
              </h1>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BubbleMap
              title="Spend by Region"
              data={spendData}
              formatValue={(v) => `$${v.toLocaleString()}`}
            />
            <BubbleMap
              title="Revenue by Region"
              data={revenueData}
              formatValue={(v) => `$${v.toLocaleString()}`}
            />
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
