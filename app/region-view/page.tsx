'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { BasicHeatMap } from '../../src/components/ui/basic-heat-map';
import dynamic from 'next/dynamic';
import type { BubbleMapProps } from '../../src/components/ui/BubbleMap';
const BubbleMap = dynamic<BubbleMapProps>(
  () => import('../../src/components/ui/BubbleMap').then(mod => mod.BubbleMap),
  { ssr: false }
);
import { CardMetric } from '../../src/components/ui/card-metric';
import { REGION_COORDS } from '../../src/components/ui/region-coords';

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

interface MarketingData {
  message: string;
  company_info: any;
  marketing_stats: any;
  campaigns: Array<{
    id: number;
    name: string;
    status: string;
    regional_performance: RegionalData[];
  }>;
}

export default function RegionView() {
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

  // Process regional data
  const getRegionalData = (): RegionalData[] => {
    if (!data?.campaigns) {
      console.log('No campaigns data available');
      return [];
    }
    
    console.log('Available campaigns:', data.campaigns.length);
    console.log('First campaign structure:', data.campaigns[0]);
    
    if (selectedCampaign === 'all') {
      // Aggregate data from all campaigns
      const regionMap = new Map<string, RegionalData>();
      
      data.campaigns.forEach((campaign, index) => {
        console.log(`Processing campaign ${index}:`, campaign.name);
        console.log(`Regional performance data:`, campaign.regional_performance);
        
        if (campaign.regional_performance && Array.isArray(campaign.regional_performance)) {
          campaign.regional_performance.forEach(region => {
            const key = `${region.region}-${region.country}`;
            const existing = regionMap.get(key);
            
            if (existing) {
              // Aggregate the metrics
              existing.impressions += region.impressions || 0;
              existing.clicks += region.clicks || 0;
              existing.conversions += region.conversions || 0;
              existing.spend += region.spend || 0;
              existing.revenue += region.revenue || 0;
              // Recalculate derived metrics safely
              existing.ctr = existing.impressions > 0 ? (existing.clicks / existing.impressions) * 100 : 0;
              existing.conversion_rate = existing.clicks > 0 ? (existing.conversions / existing.clicks) * 100 : 0;
              existing.cpc = existing.clicks > 0 ? existing.spend / existing.clicks : 0;
              existing.cpa = existing.conversions > 0 ? existing.spend / existing.conversions : 0;
              existing.roas = existing.spend > 0 ? existing.revenue / existing.spend : 0;
            } else {
              regionMap.set(key, { 
                ...region,
                // Ensure all values are numbers
                impressions: region.impressions || 0,
                clicks: region.clicks || 0,
                conversions: region.conversions || 0,
                spend: region.spend || 0,
                revenue: region.revenue || 0,
                ctr: region.ctr || 0,
                conversion_rate: region.conversion_rate || 0,
                cpc: region.cpc || 0,
                cpa: region.cpa || 0,
                roas: region.roas || 0
              });
            }
          });
        }
      });
      
      const result = Array.from(regionMap.values());
      console.log('Aggregated regional data:', result);
      return result;
    } else {
      // Return data for specific campaign
      const campaign = data.campaigns.find(c => c.id === selectedCampaign);
      const result = campaign?.regional_performance || [];
      console.log('Campaign specific regional data:', result);
      return result;
    }
  };

  const regionalData = getRegionalData();
  
  // Calculate summary metrics
  const totalRevenue = regionalData.reduce((sum, region) => sum + region.revenue, 0);
  const totalConversions = regionalData.reduce((sum, region) => sum + region.conversions, 0);
  const totalSpend = regionalData.reduce((sum, region) => sum + region.spend, 0);
  const averageROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const topRegion = regionalData.length > 0 
    ? regionalData.reduce((max, region) => region.revenue > max.revenue ? region : max)
    : null;

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading regional data...</div>
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
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">
                Regional Performance
              </h1>
              <p className="mt-4 text-lg text-gray-300">
                Analyze marketing performance across different regions and countries
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

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <CardMetric
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={<span>💰</span>}
            />
            <CardMetric
              title="Total Conversions"
              value={totalConversions.toLocaleString()}
              icon={<span>🎯</span>}
            />
            <CardMetric
              title="Average ROAS"
              value={`${averageROAS.toFixed(2)}x`}
              icon={<span>📈</span>}
            />
            <CardMetric
              title="Top Region"
              value={topRegion ? `${topRegion.region}, ${topRegion.country}` : 'N/A'}
              icon={<span>🏆</span>}
            />
          </div>

          {/* Bubble Map */}
          <BubbleMap
            data={regionalData.map(region => ({
              region: region.region,
              country: region.country,
              latitude: REGION_COORDS[`${region.region}|${region.country}`]?.latitude ?? 24.4539,
              longitude: REGION_COORDS[`${region.region}|${region.country}`]?.longitude ?? 54.3773,
              value: region.revenue, // or conversions, etc.
              color: '#3B82F6', // or assign by region/country
            }))}
            valueLabel="Revenue"
          />
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
