'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { BarChart } from '../../src/components/ui/bar-chart';

interface DevicePerformance {
  device: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  conversion_rate: number;
  percentage_of_traffic: number;
}

interface MarketingData {
  message: string;
  company_info: any;
  marketing_stats: any;
  campaigns: Array<{
    id: number;
    name: string;
    status: string;
    device_performance: DevicePerformance[];
  }>;
}

export default function DeviceView() {
  const [data, setData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<number | 'all'>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/marketing-data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Aggregate or select device performance data
  const getDeviceData = (): DevicePerformance[] => {
    if (!data?.campaigns) return [];
    if (selectedCampaign === 'all') {
      // Aggregate across all campaigns
      const deviceMap = new Map<string, DevicePerformance>();
      data.campaigns.forEach(campaign => {
        campaign.device_performance?.forEach(device => {
          const key = device.device;
          const existing = deviceMap.get(key);
          if (existing) {
            existing.impressions += device.impressions || 0;
            existing.clicks += device.clicks || 0;
            existing.conversions += device.conversions || 0;
            existing.spend += device.spend || 0;
            existing.revenue += device.revenue || 0;
            existing.percentage_of_traffic += device.percentage_of_traffic || 0;
            // Derived metrics
            existing.ctr = existing.impressions > 0 ? (existing.clicks / existing.impressions) * 100 : 0;
            existing.conversion_rate = existing.clicks > 0 ? (existing.conversions / existing.clicks) * 100 : 0;
          } else {
            deviceMap.set(key, { ...device });
          }
        });
      });
      return Array.from(deviceMap.values());
    } else {
      const campaign = data.campaigns.find(c => c.id === selectedCampaign);
      return campaign?.device_performance || [];
    }
  };

  const deviceData = getDeviceData();

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading device data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400 text-xl">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">
                Device Performance
              </h1>
              <p className="mt-4 text-lg text-gray-300">
                Analyze marketing performance across different devices
              </p>
            </div>
          </div>
        </section>
        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Campaign Selector */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Select Campaign
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Campaigns (Aggregated)</option>
              {data?.campaigns?.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bar Charts for Device Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BarChart
              title="Impressions by Device"
              data={deviceData.map(d => ({ label: d.device, value: d.impressions }))}
            />
            <BarChart
              title="Clicks by Device"
              data={deviceData.map(d => ({ label: d.device, value: d.clicks }))}
            />
            <BarChart
              title="Conversions by Device"
              data={deviceData.map(d => ({ label: d.device, value: d.conversions }))}
            />
            <BarChart
              title="Spend by Device"
              data={deviceData.map(d => ({ label: d.device, value: d.spend }))}
              formatValue={(v: number) => `$${v.toLocaleString()}`}
            />
            <BarChart
              title="Revenue by Device"
              data={deviceData.map(d => ({ label: d.device, value: d.revenue }))}
              formatValue={(v: number) => `$${v.toLocaleString()}`}
            />
            <BarChart
              title="% of Traffic by Device"
              data={deviceData.map(d => ({ label: d.device, value: d.percentage_of_traffic }))}
              formatValue={(v) => `${v}%`}
            />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
