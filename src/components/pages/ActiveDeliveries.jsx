import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import StatusBadge from '@/components/atoms/StatusBadge';
import DeliveryCard from '@/components/molecules/DeliveryCard';
import DeliveryMap from '@/components/organisms/DeliveryMap';
import DriverAssignmentPanel from '@/components/organisms/DriverAssignmentPanel';
import { deliveryService, driverService } from '@/services';

const ActiveDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [assigningDelivery, setAssigningDelivery] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [deliveries, searchTerm, statusFilter]);

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
      setError(err.message || 'Failed to load deliveries');
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const filterDeliveries = () => {
    let filtered = deliveries;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.pickupAddress.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.deliveryAddress.street.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDeliveries(filtered);
  };

  const handleStatusUpdate = async (delivery, newStatus) => {
    try {
      await deliveryService.update(delivery.id, { status: newStatus });
      toast.success('Status updated successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAssignDriver = (delivery) => {
    setAssigningDelivery(delivery);
  };

  const handleAssignmentComplete = () => {
    setAssigningDelivery(null);
    loadData();
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'pickup', label: 'Pickup' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusCounts = () => {
    return {
      all: deliveries.length,
      pending: deliveries.filter(d => d.status === 'pending').length,
      assigned: deliveries.filter(d => d.status === 'assigned').length,
      pickup: deliveries.filter(d => d.status === 'pickup').length,
      in_transit: deliveries.filter(d => d.status === 'in_transit').length,
      delivered: deliveries.filter(d => d.status === 'delivered').length,
      cancelled: deliveries.filter(d => d.status === 'cancelled').length
    };
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse bg-surface-100 h-20 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-surface-100 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <ApperIcon name="AlertCircle" size={48} className="mx-auto text-error mb-4" />
        <h3 className="text-lg font-semibold text-surface-900 mb-2">Failed to Load Deliveries</h3>
        <p className="text-surface-600 mb-4">{error}</p>
        <Button onClick={loadData} icon="RefreshCw">
          Try Again
        </Button>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Active Deliveries</h1>
          <p className="text-surface-600">Monitor and manage all your deliveries in real-time</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size="sm"
            icon="Grid3X3"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'map' ? 'primary' : 'outline'}
            size="sm"
            icon="Map"
            onClick={() => setViewMode('map')}
          >
            Map
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by tracking ID, pickup or delivery address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-3 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} {statusCounts[option.value] > 0 && `(${statusCounts[option.value]})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {statusOptions.slice(1).map(status => (
          <motion.div
            key={status.value}
            whileHover={{ scale: 1.02 }}
            className={`
              p-3 rounded-lg border cursor-pointer transition-all
              ${statusFilter === status.value 
                ? 'border-primary bg-primary/5' 
                : 'border-surface-200 hover:border-surface-300'
              }
            `}
            onClick={() => setStatusFilter(status.value)}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-surface-900">{statusCounts[status.value]}</div>
              <div className="text-xs text-surface-600">{status.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      {viewMode === 'map' ? (
        <DeliveryMap
          deliveries={filteredDeliveries}
          drivers={drivers}
          selectedDelivery={selectedDelivery}
          onSelectDelivery={setSelectedDelivery}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-surface-600">
              Showing {filteredDeliveries.length} of {deliveries.length} deliveries
            </p>
          </div>

          {filteredDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <ApperIcon name="Package" size={64} className="mx-auto text-surface-300 mb-4" />
              <h3 className="text-lg font-semibold text-surface-900 mb-2">No deliveries found</h3>
              <p className="text-surface-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No deliveries have been created yet'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button icon="Plus">
                  Create First Delivery
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeliveries.map((delivery, index) => (
                <motion.div
                  key={delivery.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DeliveryCard
                    delivery={delivery}
                    onViewDetails={setSelectedDelivery}
                    onUpdateStatus={(delivery) => {
                      // Simple status progression
                      const statusFlow = {
                        'pending': 'assigned',
                        'assigned': 'pickup',
                        'pickup': 'in_transit',
                        'in_transit': 'delivered'
                      };
                      const nextStatus = statusFlow[delivery.status];
                      if (nextStatus) {
                        handleStatusUpdate(delivery, nextStatus);
                      }
                    }}
                    onAssignDriver={handleAssignDriver}
                  />
                </motion.div>
              ))}
            </div>
          )}
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

export default ActiveDeliveries;