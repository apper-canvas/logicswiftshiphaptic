import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import Chart from 'react-apexcharts';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import MetricCard from '@/components/atoms/MetricCard';
import { deliveryService, driverService } from '@/services';

const Analytics = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deliveriesData, driversData] = await Promise.all([
        deliveryService.getAll(),
        driverService.getAll()
      ]);
      setDeliveries(deliveriesData);
      setDrivers(driversData);
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate key metrics
  const calculateMetrics = () => {
    const totalDeliveries = deliveries.length;
    const completedDeliveries = deliveries.filter(d => d.status === 'delivered').length;
    const cancelledDeliveries = deliveries.filter(d => d.status === 'cancelled').length;
    const completionRate = totalDeliveries > 0 ? ((completedDeliveries / totalDeliveries) * 100).toFixed(1) : '0.0';
    const cancelRate = totalDeliveries > 0 ? ((cancelledDeliveries / totalDeliveries) * 100).toFixed(1) : '0.0';
    const avgDriverRating = drivers.length > 0 ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1) : '0.0';
    const totalRevenue = deliveries.reduce((sum, d) => sum + (d.packageDetails?.value || 0), 0);

    return {
      totalDeliveries,
      completedDeliveries,
      completionRate,
      cancelRate,
      avgDriverRating,
      totalRevenue
    };
  };

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

  const generateDriverPerformanceData = () => {
    const driverStats = drivers.map(driver => ({
      name: driver.name.split(' ')[0], // First name only
      deliveries: driver.totalDeliveries,
      rating: driver.rating
    })).sort((a, b) => b.deliveries - a.deliveries).slice(0, 5);

    return {
      series: [
        {
          name: 'Deliveries',
          data: driverStats.map(d => d.deliveries)
        },
        {
          name: 'Rating',
          data: driverStats.map(d => d.rating * 200) // Scale rating for visibility
        }
      ],
      options: {
        chart: { type: 'bar', stacked: false },
        colors: ['#7C3AED', '#10B981'],
        xaxis: { categories: driverStats.map(d => d.name) },
        yaxis: [
          { title: { text: 'Total Deliveries' } },
          { opposite: true, title: { text: 'Rating (x200)' } }
        ],
        legend: { position: 'top' }
      }
    };
  };

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

  const metrics = calculateMetrics();
  const volumeChart = generateVolumeChartData();
  const statusChart = generateStatusChartData();
  const performanceChart = generateDriverPerformanceData();

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

        {/* Driver Performance */}
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
            options={performanceChart.options}
            series={performanceChart.series}
            type="bar"
            height={300}
          />
        </motion.div>

        {/* Performance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Performance Summary</h3>
            <ApperIcon name="BarChart3" size={20} className="text-surface-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="CheckCircle2" size={16} className="text-success" />
                </div>
                <span className="font-medium text-surface-900">On-Time Delivery</span>
              </div>
              <span className="text-lg font-bold text-success">92.5%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="Clock" size={16} className="text-warning" />
                </div>
                <span className="font-medium text-surface-900">Avg Delivery Time</span>
              </div>
              <span className="text-lg font-bold text-warning">2.3h</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="MapPin" size={16} className="text-primary" />
                </div>
                <span className="font-medium text-surface-900">Avg Distance</span>
              </div>
              <span className="text-lg font-bold text-primary">8.7km</span>
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;