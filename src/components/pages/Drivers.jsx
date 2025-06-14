import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import MetricCard from '@/components/atoms/MetricCard';
import DriverCard from '@/components/molecules/DriverCard';
import { driverService, deliveryService } from '@/services';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [drivers, searchTerm, statusFilter, vehicleFilter]);

  const loadDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const driversData = await driverService.getAll();
      setDrivers(driversData);
    } catch (err) {
      setError(err.message || 'Failed to load drivers');
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const filterDrivers = () => {
    let filtered = drivers;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    // Filter by vehicle type
    if (vehicleFilter !== 'all') {
      filtered = filtered.filter(d => d.vehicleType === vehicleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.vehicleInfo.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDrivers(filtered);
  };

  const handleViewDetails = (driver) => {
    // In a real app, this would open a detailed driver profile modal
    toast.info(`Viewing details for ${driver.name}`);
  };

  const handleAssignDelivery = (driver) => {
    // In a real app, this would open a delivery assignment modal
    toast.info(`Assigning delivery to ${driver.name}`);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' },
    { value: 'offline', label: 'Offline' }
  ];

  const vehicleOptions = [
    { value: 'all', label: 'All Vehicles' },
    { value: 'van', label: 'Van' },
    { value: 'car', label: 'Car' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'bicycle', label: 'Bicycle' }
  ];

  // Calculate metrics
  const metrics = {
    total: drivers.length,
    available: drivers.filter(d => d.status === 'available').length,
    busy: drivers.filter(d => d.status === 'busy').length,
    offline: drivers.filter(d => d.status === 'offline').length,
    averageRating: drivers.length > 0 ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1) : '0.0'
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-surface-100 h-32 rounded-lg"></div>
          ))}
        </div>
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
        <h3 className="text-lg font-semibold text-surface-900 mb-2">Failed to Load Drivers</h3>
        <p className="text-surface-600 mb-4">{error}</p>
        <Button onClick={loadDrivers} icon="RefreshCw">
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
          <h1 className="text-2xl font-display font-bold text-surface-900">Driver Management</h1>
          <p className="text-surface-600">Monitor and manage your delivery team</p>
        </div>
        <Button icon="UserPlus" size="lg">
          Add Driver
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Drivers"
          value={metrics.total}
          icon="Users"
          color="primary"
        />
        <MetricCard
          title="Available"
          value={metrics.available}
          icon="UserCheck"
          color="success"
          change={`${Math.round((metrics.available / metrics.total) * 100)}% of fleet`}
          changeType="neutral"
        />
        <MetricCard
          title="Currently Busy"
          value={metrics.busy}
          icon="Clock"
          color="warning"
          change={`${Math.round((metrics.busy / metrics.total) * 100)}% of fleet`}
          changeType="neutral"
        />
        <MetricCard
          title="Average Rating"
          value={metrics.averageRating}
          icon="Star"
          color="accent"
          change="Out of 5.0"
          changeType="neutral"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search drivers by name, email, or license plate..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon="Search"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-3 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="w-full px-3 py-3 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {vehicleOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Driver Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusOptions.slice(1).map(status => {
          const count = drivers.filter(d => d.status === status.value).length;
          return (
            <motion.div
              key={status.value}
              whileHover={{ scale: 1.02 }}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all
                ${statusFilter === status.value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-surface-200 hover:border-surface-300'
                }
              `}
              onClick={() => setStatusFilter(status.value)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-surface-900">{status.label}</h4>
                  <p className="text-sm text-surface-600">{count} drivers</p>
                </div>
                <div className="text-2xl font-bold text-surface-900">{count}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Drivers Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-600">
            Showing {filteredDrivers.length} of {drivers.length} drivers
          </p>
        </div>

        {filteredDrivers.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="Users" size={64} className="mx-auto text-surface-300 mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No drivers found</h3>
            <p className="text-surface-600 mb-4">
              {searchTerm || statusFilter !== 'all' || vehicleFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No drivers have been added yet'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && vehicleFilter === 'all' && (
              <Button icon="UserPlus">
                Add First Driver
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrivers.map((driver, index) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DriverCard
                  driver={driver}
                  onViewDetails={handleViewDetails}
                  onAssignDelivery={handleAssignDelivery}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drivers;