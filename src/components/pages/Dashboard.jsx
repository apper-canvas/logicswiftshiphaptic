import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import MetricCard from '@/components/atoms/MetricCard';
import Button from '@/components/atoms/Button';
import DeliveryMap from '@/components/organisms/DeliveryMap';
import DeliveryCard from '@/components/molecules/DeliveryCard';
import BookingForm from '@/components/molecules/BookingForm';
import DriverAssignmentPanel from '@/components/organisms/DriverAssignmentPanel';
import { deliveryService, driverService } from '@/services';

const Dashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [assigningDelivery, setAssigningDelivery] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    loadDashboardData();
  };

  const handleAssignDriver = (delivery) => {
    setAssigningDelivery(delivery);
  };

  const handleAssignmentComplete = () => {
    setAssigningDelivery(null);
    loadDashboardData();
  };

  // Calculate metrics
  const metrics = {
    totalDeliveries: deliveries.length,
    activeDeliveries: deliveries.filter(d => ['assigned', 'pickup', 'in_transit'].includes(d.status)).length,
    completedToday: deliveries.filter(d => d.status === 'delivered').length,
    pendingPickups: deliveries.filter(d => d.status === 'pending').length,
    availableDrivers: drivers.filter(d => d.status === 'available').length,
    busyDrivers: drivers.filter(d => d.status === 'busy').length
  };

  const recentDeliveries = deliveries.slice(0, 5);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-surface-100 h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-pulse bg-surface-100 h-96 rounded-lg"></div>
          <div className="animate-pulse bg-surface-100 h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <ApperIcon name="AlertCircle" size={48} className="mx-auto text-error mb-4" />
        <h3 className="text-lg font-semibold text-surface-900 mb-2">Failed to Load Dashboard</h3>
        <p className="text-surface-600 mb-4">{error}</p>
        <Button onClick={loadDashboardData} icon="RefreshCw">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Dashboard</h1>
          <p className="text-surface-600">Welcome back! Here's your logistics overview.</p>
        </div>
        <Button
          onClick={() => setShowBookingForm(true)}
          icon="Plus"
          size="lg"
        >
          New Booking
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Deliveries"
          value={metrics.totalDeliveries}
          change="+12% from yesterday"
          changeType="positive"
          icon="Package"
          color="primary"
        />
        <MetricCard
          title="Active Deliveries"
          value={metrics.activeDeliveries}
          change={`${metrics.pendingPickups} pending pickup`}
          changeType="neutral"
          icon="Truck"
          color="accent"
        />
        <MetricCard
          title="Completed Today"
          value={metrics.completedToday}
          change="+8% vs yesterday"
          changeType="positive"
          icon="CheckCircle2"
          color="success"
        />
        <MetricCard
          title="Available Drivers"
          value={`${metrics.availableDrivers}/${drivers.length}`}
          change={`${metrics.busyDrivers} busy`}
          changeType="neutral"
          icon="Users"
          color="secondary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <DeliveryMap
            deliveries={deliveries}
            drivers={drivers}
            selectedDelivery={selectedDelivery}
            onSelectDelivery={setSelectedDelivery}
          />
        </div>

        {/* Recent Deliveries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-surface-900">Recent Deliveries</h3>
            <Button variant="ghost" size="sm" icon="ArrowRight">
              View All
            </Button>
          </div>
          
          {recentDeliveries.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Package" size={48} className="mx-auto text-surface-300 mb-4" />
              <p className="text-surface-500">No deliveries yet</p>
              <p className="text-sm text-surface-400 mt-1">Book your first delivery to get started</p>
              <Button
                onClick={() => setShowBookingForm(true)}
                size="sm"
                className="mt-4"
                icon="Plus"
              >
                Book Delivery
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentDeliveries.map((delivery, index) => (
                <motion.div
                  key={delivery.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DeliveryCard
                    delivery={delivery}
                    onViewDetails={setSelectedDelivery}
                    onAssignDriver={handleAssignDriver}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-surface-900">Book New Delivery</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="X"
                  onClick={() => setShowBookingForm(false)}
                />
              </div>
              <BookingForm
                onSuccess={handleBookingSuccess}
                onCancel={() => setShowBookingForm(false)}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {assigningDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <DriverAssignmentPanel
                delivery={assigningDelivery}
                onClose={() => setAssigningDelivery(null)}
                onAssigned={handleAssignmentComplete}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;