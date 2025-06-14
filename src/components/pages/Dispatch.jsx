import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import MetricCard from '@/components/atoms/MetricCard';
import BookingForm from '@/components/molecules/BookingForm';
import DriverAssignmentPanel from '@/components/organisms/DriverAssignmentPanel';
import DeliveryCard from '@/components/molecules/DeliveryCard';
import { deliveryService, driverService } from '@/services';

const Dispatch = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [assigningDelivery, setAssigningDelivery] = useState(null);
  const [autoAssigning, setAutoAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
      setError(err.message || 'Failed to load dispatch data');
      toast.error('Failed to load dispatch data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    loadData();
  };

  const handleAssignDriver = (delivery) => {
    setAssigningDelivery(delivery);
  };

  const handleAssignmentComplete = () => {
    setAssigningDelivery(null);
    loadData();
  };

  const handleAutoAssignAll = async () => {
    const pendingDeliveries = deliveries.filter(d => d.status === 'pending');
    const availableDrivers = drivers.filter(d => d.status === 'available');

    if (pendingDeliveries.length === 0) {
      toast.info('No pending deliveries to assign');
      return;
    }

    if (availableDrivers.length === 0) {
      toast.error('No available drivers for assignment');
      return;
    }

    setAutoAssigning(true);
    let assignedCount = 0;

    try {
      // Simple round-robin assignment
      for (let i = 0; i < Math.min(pendingDeliveries.length, availableDrivers.length); i++) {
        const delivery = pendingDeliveries[i];
        const driver = availableDrivers[i % availableDrivers.length];
        
        await deliveryService.assignDriver(delivery.id, driver.id);
        assignedCount++;
      }

      toast.success(`Auto-assigned ${assignedCount} deliveries`);
      loadData();
    } catch (error) {
      toast.error(`Failed to auto-assign deliveries. Assigned ${assignedCount} successfully.`);
    } finally {
      setAutoAssigning(false);
    }
  };

  // Calculate metrics
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending');
  const assignedDeliveries = deliveries.filter(d => d.status === 'assigned');
  const inTransitDeliveries = deliveries.filter(d => d.status === 'in_transit' || d.status === 'pickup');
  const availableDrivers = drivers.filter(d => d.status === 'available');

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-surface-100 h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="animate-pulse bg-surface-100 h-96 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <ApperIcon name="AlertCircle" size={48} className="mx-auto text-error mb-4" />
        <h3 className="text-lg font-semibold text-surface-900 mb-2">Failed to Load Dispatch Center</h3>
        <p className="text-surface-600 mb-4">{error}</p>
        <Button onClick={loadData} icon="RefreshCw">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Dispatch Center</h1>
          <p className="text-surface-600">Manage bookings and optimize driver assignments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleAutoAssignAll}
            loading={autoAssigning}
            icon="Zap"
            variant="accent"
            disabled={pendingDeliveries.length === 0 || availableDrivers.length === 0}
          >
            Auto Assign All
          </Button>
          <Button
            onClick={() => setShowBookingForm(true)}
            icon="Plus"
            size="lg"
          >
            New Booking
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Pending Assignments"
          value={pendingDeliveries.length}
          icon="Clock"
          color="warning"
          change={pendingDeliveries.length > 0 ? 'Needs attention' : 'All caught up'}
          changeType={pendingDeliveries.length > 0 ? 'neutral' : 'positive'}
        />
        <MetricCard
          title="Assigned Today"
          value={assignedDeliveries.length}
          icon="UserCheck"
          color="info"
          change="Ready for pickup"
          changeType="neutral"
        />
        <MetricCard
          title="In Transit"
          value={inTransitDeliveries.length}
          icon="Truck"
          color="accent"
          change="En route to destination"
          changeType="neutral"
        />
        <MetricCard
          title="Available Drivers"
          value={availableDrivers.length}
          icon="Users"
          color="success"
          change={`${drivers.filter(d => d.status === 'busy').length} busy`}
          changeType="neutral"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
        <h3 className="font-semibold text-surface-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-surface-50 rounded-lg border border-surface-200 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => setShowBookingForm(true)}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ApperIcon name="Plus" size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-surface-900">Book Delivery</h4>
                <p className="text-sm text-surface-600">Create new pickup request</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-surface-50 rounded-lg border border-surface-200 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
            onClick={handleAutoAssignAll}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <ApperIcon name="Zap" size={20} className="text-accent" />
              </div>
              <div>
                <h4 className="font-medium text-surface-900">Auto Assign</h4>
                <p className="text-sm text-surface-600">Optimize driver routing</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-surface-50 rounded-lg border border-surface-200 cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <ApperIcon name="Route" size={20} className="text-secondary" />
              </div>
              <div>
                <h4 className="font-medium text-surface-900">Route Optimizer</h4>
                <p className="text-sm text-surface-600">Plan efficient routes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Deliveries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-surface-900">
            Pending Assignments ({pendingDeliveries.length})
          </h3>
          {pendingDeliveries.length > 0 && (
            <Button
              onClick={handleAutoAssignAll}
              loading={autoAssigning}
              size="sm"
              icon="Zap"
              variant="outline"
            >
              Assign All
            </Button>
          )}
        </div>

        {pendingDeliveries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-surface-200">
            <ApperIcon name="CheckCircle2" size={64} className="mx-auto text-success mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 mb-2">All Caught Up!</h3>
            <p className="text-surface-600 mb-4">No pending deliveries need driver assignment</p>
            <Button
              onClick={() => setShowBookingForm(true)}
              icon="Plus"
            >
              Book New Delivery
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingDeliveries.map((delivery, index) => (
              <motion.div
                key={delivery.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DeliveryCard
                  delivery={delivery}
                  onAssignDriver={handleAssignDriver}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Assigned */}
      {assignedDeliveries.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-surface-900">
            Recently Assigned ({assignedDeliveries.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedDeliveries.slice(0, 6).map((delivery, index) => (
              <motion.div
                key={delivery.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DeliveryCard
                  delivery={delivery}
                  onAssignDriver={handleAssignDriver}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

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

export default Dispatch;