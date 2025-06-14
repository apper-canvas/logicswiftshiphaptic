import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import Chart from 'react-apexcharts';
import memoize from 'lodash.memoize';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import MetricCard from '@/components/atoms/MetricCard';
import { deliveryService, driverService } from '@/services';
const Analytics = memo(() => {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [driverEfficiency, setDriverEfficiency] = useState([]);
  const [performanceComparison, setPerformanceComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7d');
  const [refreshKey, setRefreshKey] = useState(0);
useEffect(() => {
    loadAnalyticsData();
  }, [refreshKey]);

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deliveriesData, driversData, efficiencyData, comparisonData] = await Promise.all([
        deliveryService.getAll(),
        driverService.getAll(),
        driverService.getDriverEfficiency(dateRange),
        driverService.getPerformanceComparison()
      ]);
      setDeliveries(deliveriesData);
      setDrivers(driversData);
      setDriverEfficiency(efficiencyData);
      setPerformanceComparison(comparisonData);
      toast.success('Analytics data updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);
// Memoized metrics calculation for performance
  const metrics = useMemo(() => {
    const totalDeliveries = deliveries.length;
    const completedDeliveries = deliveries.filter(d => d.status === 'delivered').length;
    const cancelledDeliveries = deliveries.filter(d => d.status === 'cancelled').length;
    const completionRate = totalDeliveries > 0 ? ((completedDeliveries / totalDeliveries) * 100).toFixed(1) : '0.0';
    const cancelRate = totalDeliveries > 0 ? ((cancelledDeliveries / totalDeliveries) * 100).toFixed(1) : '0.0';
    const avgDriverRating = drivers.length > 0 ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1) : '0.0';
    const totalRevenue = deliveries.reduce((sum, d) => sum + (d.packageDetails?.value || 0), 0);
    const avgPerformanceScore = driverEfficiency.length > 0 ? 
      (driverEfficiency.reduce((sum, d) => sum + d.performanceScore, 0) / driverEfficiency.length).toFixed(0) : '0';
    const topPerformerScore = driverEfficiency.length > 0 ? 
      Math.max(...driverEfficiency.map(d => d.performanceScore)) : 0;

    return {
      totalDeliveries,
      completedDeliveries,
      completionRate,
      cancelRate,
      avgDriverRating,
      totalRevenue,
      avgPerformanceScore,
      topPerformerScore
    };
  }, [deliveries, drivers, driverEfficiency]);

  // Generate chart data
  const generateVolumeChartData = () => {
    const days = [];
    const volumes = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayDeliveries = deliveries.filter(d => {
        const deliveryDate = new Date(d.createdAt);
        return deliveryDate >= dayStart && deliveryDate <= dayEnd;
      });
      
      days.push(format(date, 'MMM dd'));
      volumes.push(dayDeliveries.length);
    }

    return {
      series: [{
        name: 'Deliveries',
        data: volumes
      }],
      options: {
        chart: {
          type: 'area',
          height: 300,
          toolbar: { show: false }
        },
        colors: ['#2563EB'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.1
          }
        },
        xaxis: {
          categories: days,
          labels: { style: { fontSize: '12px' } }
        },
        yaxis: {
          labels: { style: { fontSize: '12px' } }
        },
        grid: { show: true, strokeDashArray: 3 }
      }
    };
  };

  const generateStatusChartData = () => {
    const statusCounts = {
      'Delivered': deliveries.filter(d => d.status === 'delivered').length,
      'In Transit': deliveries.filter(d => d.status === 'in_transit').length,
      'Assigned': deliveries.filter(d => d.status === 'assigned').length,
      'Pending': deliveries.filter(d => d.status === 'pending').length,
      'Cancelled': deliveries.filter(d => d.status === 'cancelled').length
    };

    return {
      series: Object.values(statusCounts),
      options: {
        chart: { type: 'donut' },
        labels: Object.keys(statusCounts),
        colors: ['#10B981', '#2563EB', '#3B82F6', '#F59E0B', '#EF4444'],
        legend: { position: 'bottom' },
        dataLabels: { enabled: true },
        plotOptions: {
          pie: { donut: { size: '60%' } }
        }
      }
    };
  };
// Optimized chart data generation with memoization
  const generateDriverPerformanceData = useMemo(() => {
    const topPerformers = driverEfficiency.slice(0, 8);
    
    return {
      series: [
        {
          name: 'Performance Score',
          data: topPerformers.map(d => d.performanceScore)
        },
        {
          name: 'Efficiency %',
          data: topPerformers.map(d => d.efficiency)
        },
        {
          name: 'Deliveries/Day',
          data: topPerformers.map(d => d.deliveriesPerDay * 10) // Scale for visibility
        }
      ],
      options: {
        chart: { 
          type: 'bar', 
          stacked: false,
          toolbar: { show: true, tools: { download: true } }
        },
        colors: ['#7C3AED', '#10B981', '#F59E0B'],
        xaxis: { 
          categories: topPerformers.map(d => d.name.split(' ')[0]),
          labels: { style: { fontSize: '11px' } }
        },
        yaxis: [
          { title: { text: 'Performance Score' } },
          { opposite: true, title: { text: 'Efficiency % / Deliveries (x10)' } }
        ],
        legend: { position: 'top' },
        plotOptions: {
          bar: { 
            columnWidth: '60%',
            dataLabels: { position: 'top' }
          }
        },
        dataLabels: {
          enabled: true,
          style: { fontSize: '10px' }
        }
      }
    };
  }, [driverEfficiency]);

  const generateEfficiencyTrendData = useMemo(() => {
    const trendData = driverEfficiency.slice(0, 5);
    
    return {
      series: [{
        name: 'Efficiency Trend',
        data: trendData.map(d => ({
          x: d.name.split(' ')[0],
          y: d.efficiency,
          fillColor: d.trend === 'up' ? '#10B981' : '#EF4444'
        }))
      }],
      options: {
        chart: { 
          type: 'bar',
          toolbar: { show: false }
        },
        colors: ['#10B981'],
        plotOptions: {
          bar: {
            distributed: true,
            columnWidth: '50%'
          }
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val.toFixed(0)}%`
        },
        xaxis: {
          categories: trendData.map(d => d.name.split(' ')[0])
        },
        yaxis: {
          title: { text: 'Efficiency %' },
          max: 100
        },
        legend: { show: false }
      }
    };
  }, [driverEfficiency]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-surface-100 h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-surface-100 h-80 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <ApperIcon name="AlertCircle" size={48} className="mx-auto text-error mb-4" />
        <h3 className="text-lg font-semibold text-surface-900 mb-2">Failed to Load Analytics</h3>
        <p className="text-surface-600 mb-4">{error}</p>
        <Button onClick={loadAnalyticsData} icon="RefreshCw">
          Try Again
        </Button>
      </div>
);
  }

  const volumeChart = generateVolumeChartData();
  const statusChart = generateStatusChartData();
  const efficiencyChart = generateEfficiencyTrendData;
  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Analytics Dashboard</h1>
          <p className="text-surface-600">Performance insights and delivery metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
</select>
          <Button variant="outline" icon="RefreshCw" size="sm" onClick={handleRefresh}>
            Refresh
          </Button>
          <Button variant="outline" icon="Download" size="sm">
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Deliveries"
          value={metrics.totalDeliveries}
          change="+12% from last period"
          changeType="positive"
          icon="Package"
          color="primary"
        />
        <MetricCard
          title="Completion Rate"
          value={`${metrics.completionRate}%`}
          change={`${metrics.cancelRate}% cancelled`}
          changeType={parseFloat(metrics.completionRate) > 90 ? 'positive' : 'neutral'}
          icon="CheckCircle2"
          color="success"
        />
        <MetricCard
          title="Average Rating"
          value={metrics.avgDriverRating}
          change="Driver performance"
          changeType="positive"
          icon="Star"
          color="accent"
/>
        <MetricCard
          title="Avg Performance"
          value={metrics.avgPerformanceScore}
          change={`Top: ${metrics.topPerformerScore}`}
          changeType="positive"
          icon="TrendingUp"
          color="accent"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          change="+18% from last period"
          changeType="positive"
          icon="DollarSign"
          color="secondary"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Daily Volume Trend</h3>
            <ApperIcon name="TrendingUp" size={20} className="text-surface-400" />
          </div>
          <Chart
            options={volumeChart.options}
            series={volumeChart.series}
            type="area"
            height={300}
          />
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Delivery Status Distribution</h3>
            <ApperIcon name="PieChart" size={20} className="text-surface-400" />
          </div>
          <Chart
            options={statusChart.options}
            series={statusChart.series}
            type="donut"
            height={300}
          />
</motion.div>

        {/* Driver Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Top Driver Performance</h3>
            <ApperIcon name="Users" size={20} className="text-surface-400" />
          </div>
          <Chart
            options={generateDriverPerformanceData.options}
            series={generateDriverPerformanceData.series}
            type="bar"
            height={300}
          />
        </motion.div>

        {/* Driver Efficiency Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Driver Efficiency Trends</h3>
            <ApperIcon name="Activity" size={20} className="text-surface-400" />
          </div>
          <Chart
            options={efficiencyChart.options}
            series={efficiencyChart.series}
            type="bar"
            height={300}
          />
        </motion.div>
{/* Performance Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Performance Leaderboard</h3>
            <ApperIcon name="Award" size={20} className="text-surface-400" />
          </div>
          <div className="space-y-3">
            {driverEfficiency.slice(0, 5).map((driver, index) => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                      index === 1 ? 'bg-gray-100 text-gray-800' : 
                      index === 2 ? 'bg-orange-100 text-orange-800' : 
                      'bg-surface-100 text-surface-600'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">{driver.name}</p>
                    <p className="text-sm text-surface-600">{driver.deliveriesPerDay} deliveries/day</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-surface-900">{driver.performanceScore}</p>
                  <p className={`text-sm ${driver.trend === 'up' ? 'text-success' : 'text-error'}`}>
                    {driver.trend === 'up' ? '↗' : '↘'} {driver.trendValue}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Performance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Performance Insights</h3>
            <ApperIcon name="BarChart3" size={20} className="text-surface-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="CheckCircle2" size={16} className="text-success" />
                </div>
                <span className="font-medium text-surface-900">On-Time Performance</span>
              </div>
              <span className="text-lg font-bold text-success">92.5%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="TrendingUp" size={16} className="text-primary" />
                </div>
                <span className="font-medium text-surface-900">Avg Performance Score</span>
              </div>
              <span className="text-lg font-bold text-primary">{metrics.avgPerformanceScore}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="Clock" size={16} className="text-warning" />
                </div>
                <span className="font-medium text-surface-900">Avg Delivery Time</span>
              </div>
              <span className="text-lg font-bold text-warning">2.1h</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="DollarSign" size={16} className="text-accent" />
                </div>
                <span className="font-medium text-surface-900">Revenue per Delivery</span>
              </div>
              <span className="text-lg font-bold text-accent">${(metrics.totalRevenue / Math.max(metrics.totalDeliveries, 1)).toFixed(0)}</span>
            </div>

            {performanceComparison && (
              <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                    <ApperIcon name="Award" size={16} className="text-secondary" />
                  </div>
                  <div>
                    <span className="font-medium text-surface-900">Top Performer</span>
                    <p className="text-sm text-surface-600">{performanceComparison.topPerformer?.name}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-secondary">
                  {performanceComparison.topPerformer?.totalDeliveries || 0}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
);
});

Analytics.displayName = 'Analytics';

export default Analytics;