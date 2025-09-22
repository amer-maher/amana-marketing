"use client";
import { useState, useEffect } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Footer } from '../../src/components/ui/footer';
import { Users, UserCheck, TrendingUp, Target, MousePointer, DollarSign, BarChart3 } from 'lucide-react';
import { MarketingData, DemographicBreakdown } from '../../src/types/marketing';
import { fetchMarketingData } from '../../src/lib/api';

export default function DemographicView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate demographic metrics
  const calculateDemographicMetrics = () => {
    if (!marketingData?.campaigns) return null;

    const allDemographics = marketingData.campaigns.flatMap(campaign => 
      campaign.demographic_breakdown || []
    );

    // Group by gender
    const maleData = allDemographics.filter(d => d.gender === 'Male');
    const femaleData = allDemographics.filter(d => d.gender === 'Female');

    // Calculate totals for each gender
    const maleMetrics = {
      clicks: maleData.reduce((sum, d) => sum + d.performance.clicks, 0),
      spend: maleData.reduce((sum, d) => sum + (d.performance.clicks * 0.5), 0), // Estimated spend
      revenue: maleData.reduce((sum, d) => sum + (d.performance.conversions * 300), 0), // Estimated revenue
    };

    const femaleMetrics = {
      clicks: femaleData.reduce((sum, d) => sum + d.performance.clicks, 0),
      spend: femaleData.reduce((sum, d) => sum + (d.performance.clicks * 0.5), 0), // Estimated spend
      revenue: femaleData.reduce((sum, d) => sum + (d.performance.conversions * 300), 0), // Estimated revenue
    };

    // Group by age for charts (derive dynamically)
    const ageGroups = Array.from(new Set(allDemographics.map(d => d.age_group))).sort();
    const ageSpendData = ageGroups.map(age => {
      const ageData = allDemographics.filter(d => d.age_group === age);
      const totalSpend = ageData.reduce((sum, d) => sum + (d.performance.clicks * 0.5), 0);
      const totalRevenue = ageData.reduce((sum, d) => sum + (d.performance.conversions * 300), 0);
      return { age, spend: totalSpend, revenue: totalRevenue };
    });

    return {
      maleMetrics,
      femaleMetrics,
      ageSpendData,
      allDemographics
    };
  };

  const metrics = calculateDemographicMetrics();

  // Prepare table data for male and female age groups
  const prepareTableData = (gender: 'Male' | 'Female') => {
    if (!marketingData?.campaigns) return [];

    const allDemographics = marketingData.campaigns.flatMap(campaign => campaign.demographic_breakdown || []);
    const ageGroups = Array.from(new Set(allDemographics.map(d => d.age_group))).sort();
    return ageGroups.map(ageGroup => {
      const ageData = marketingData.campaigns
        .flatMap(campaign => campaign.demographic_breakdown || [])
        .filter(d => d.gender === gender && d.age_group === ageGroup);

      const totals = ageData.reduce((acc, d) => ({
        impressions: acc.impressions + d.performance.impressions,
        clicks: acc.clicks + d.performance.clicks,
        conversions: acc.conversions + d.performance.conversions,
      }), { impressions: 0, clicks: 0, conversions: 0 });

      const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
      const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

      return {
        ageGroup,
        impressions: totals.impressions.toLocaleString(),
        clicks: totals.clicks.toLocaleString(),
        conversions: totals.conversions.toLocaleString(),
        ctr: `${ctr.toFixed(2)}%`,
        conversionRate: `${conversionRate.toFixed(2)}%`
      };
    });
  };

  const maleTableData = prepareTableData('Male');
  const femaleTableData = prepareTableData('Female');

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading demographic data...</div>
        </div>
      </div>
    );
  }

  if (error || !marketingData) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400 text-xl">Error: {error || 'Failed to load data'}</div>
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
                Demographic View
              </h1>
              <p className="mt-4 text-lg text-gray-300">
                Performance metrics by gender and age demographics
              </p>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {metrics && (
            <>
              {/* Card Metrics Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Gender Performance Overview</h2>
                
                {/* Male Metrics */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">Male Demographics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CardMetric
                      title="Total Clicks by Males"
                      value={metrics.maleMetrics.clicks.toLocaleString()}
                      icon={<MousePointer className="h-5 w-5" />}
                    />
                    <CardMetric
                      title="Total Spend by Males"
                      value={`$${metrics.maleMetrics.spend.toLocaleString()}`}
                      icon={<DollarSign className="h-5 w-5" />}
                    />
                    <CardMetric
                      title="Total Revenue by Males"
                      value={`$${metrics.maleMetrics.revenue.toLocaleString()}`}
                      icon={<TrendingUp className="h-5 w-5" />}
                    />
                  </div>
                </div>

                {/* Female Metrics */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-pink-400 mb-4">Female Demographics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CardMetric
                      title="Total Clicks by Females"
                      value={metrics.femaleMetrics.clicks.toLocaleString()}
                      icon={<MousePointer className="h-5 w-5" />}
                    />
                    <CardMetric
                      title="Total Spend by Females"
                      value={`$${metrics.femaleMetrics.spend.toLocaleString()}`}
                      icon={<DollarSign className="h-5 w-5" />}
                    />
                    <CardMetric
                      title="Total Revenue by Females"
                      value={`$${metrics.femaleMetrics.revenue.toLocaleString()}`}
                      icon={<TrendingUp className="h-5 w-5" />}
                    />
                  </div>
                </div>
              </div>

              {/* Bar Charts Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Age Group Performance</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <BarChart
                    title="Total Spend by Age Group"
                    data={metrics.ageSpendData.map(item => ({
                      label: item.age,
                      value: item.spend,
                      color: '#3B82F6'
                    }))}
                    formatValue={(value) => `$${value.toLocaleString()}`}
                  />
                  <BarChart
                    title="Total Revenue by Age Group"
                    data={metrics.ageSpendData.map(item => ({
                      label: item.age,
                      value: item.revenue,
                      color: '#10B981'
                    }))}
                    formatValue={(value) => `$${value.toLocaleString()}`}
                  />
                </div>
              </div>

              {/* Tables Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Campaign Performance by Demographics</h2>
                
                {/* Male Age Groups Table */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">Male Age Groups Performance</h3>
                  <Table
                    title=""
                    columns={[
                      { key: 'ageGroup', header: 'Age Group', sortable: true },
                      { key: 'impressions', header: 'Impressions', sortable: true, align: 'right' },
                      { key: 'clicks', header: 'Clicks', sortable: true, align: 'right' },
                      { key: 'conversions', header: 'Conversions', sortable: true, align: 'right' },
                      { key: 'ctr', header: 'CTR', sortable: true, align: 'right' },
                      { key: 'conversionRate', header: 'Conversion Rate', sortable: true, align: 'right' }
                    ]}
                    data={maleTableData}
                    defaultSort={{ key: 'ageGroup', direction: 'asc' }}
                  />
                </div>

                {/* Female Age Groups Table */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-pink-400 mb-4">Female Age Groups Performance</h3>
                  <Table
                    title=""
                    columns={[
                      { key: 'ageGroup', header: 'Age Group', sortable: true },
                      { key: 'impressions', header: 'Impressions', sortable: true, align: 'right' },
                      { key: 'clicks', header: 'Clicks', sortable: true, align: 'right' },
                      { key: 'conversions', header: 'Conversions', sortable: true, align: 'right' },
                      { key: 'ctr', header: 'CTR', sortable: true, align: 'right' },
                      { key: 'conversionRate', header: 'Conversion Rate', sortable: true, align: 'right' }
                    ]}
                    data={femaleTableData}
                    defaultSort={{ key: 'ageGroup', direction: 'asc' }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
