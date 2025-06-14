import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import StatusBadge from '@/components/atoms/StatusBadge';
import { driverService, deliveryService } from '@/services';

const DriverAssignmentPanel = ({ delivery, onClose, onAssigned }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    loadAvailableDrivers();
  }, []);

  const loadAvailableDrivers = async () => {
    setLoading(true);
    try {
      const availableDrivers = await driverService.getAvailable();
      setDrivers(availableDrivers);
    } catch (error) {
      toast.error('Failed to load available drivers');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (driver, delivery) => {
    // Simplified distance calculation
    const lat1 = driver.location.lat;
    const lng1 = driver.location.lng;
    const lat2 = delivery.pickupAddress.coordinates.lat;
    const lng2 = delivery.pickupAddress.coordinates.lng;
    
    const distance = Math.sqrt(
      Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)
    ) * 111; // Approximate km conversion
    
    return distance.toFixed(1);
  };

  const getOptimalDriver = () => {
    if (drivers.length === 0) return null;
    
    // Simple algorithm: closest driver with compatible vehicle
    return drivers.reduce((best, current) => {
      const currentDistance = parseFloat(calculateDistance(current, delivery));
      const bestDistance = best ? parseFloat(calculateDistance(best, delivery)) : Infinity;
      
      if (currentDistance < bestDistance) {
        return current;
      }
      return best;
    }, null);
  };

  const handleAutoAssign = async () => {
    const optimalDriver = getOptimalDriver();
    if (!optimalDriver) {
      toast.error('No suitable drivers available');
      return;
    }
    
    await handleAssign(optimalDriver);
  };

  const handleAssign = async (driver) => {
    setAssigning(true);
    try {
      await deliveryService.assignDriver(delivery.id, driver.id);
      toast.success(`Assigned to ${driver.name}`);
      onAssigned();
      onClose();
    } catch (error) {
      toast.error('Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  };

  const getVehicleIcon = (type) => {
    const icons = {
      van: 'Truck',
      car: 'Car',
      motorcycle: 'Bike',
      bicycle: 'Bike'
    };
    return icons[type] || 'Truck';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-surface-100 h-20 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const optimalDriver = getOptimalDriver();

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-surface-900">Assign Driver</h3>
          <p className="text-sm text-surface-600">Delivery: {delivery.trackingId}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon="X"
          onClick={onClose}
        />
      </div>

      {/* Auto Assign Section */}
      {optimalDriver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-accent/5 border border-accent/20 rounded-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-surface-900 flex items-center">
              <ApperIcon name="Zap" size={16} className="mr-2 text-accent" />
              Recommended Assignment
            </h4>
            <Button
              size="sm"
              icon="Zap"
              onClick={handleAutoAssign}
              loading={assigning}
            >
              Auto Assign
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-surface-200 rounded-full flex items-center justify-center">
              <ApperIcon name="User" size={20} className="text-surface-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-surface-900">{optimalDriver.name}</p>
              <div className="flex items-center space-x-4 text-sm text-surface-600">
                <span className="flex items-center">
                  <ApperIcon name={getVehicleIcon(optimalDriver.vehicleType)} size={14} className="mr-1" />
                  {optimalDriver.vehicleType}
                </span>
                <span className="flex items-center">
                  <ApperIcon name="MapPin" size={14} className="mr-1" />
                  {calculateDistance(optimalDriver, delivery)} km away
                </span>
                <span className="flex items-center">
                  <ApperIcon name="Star" size={14} className="mr-1" />
                  {optimalDriver.rating}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Available Drivers List */}
      <div className="space-y-3">
        <h4 className="font-medium text-surface-900">Available Drivers ({drivers.length})</h4>
        
        {drivers.length === 0 ? (
          <div className="text-center py-8">
            <ApperIcon name="Users" size={48} className="mx-auto text-surface-300 mb-4" />
            <p className="text-surface-500">No drivers available</p>
            <p className="text-sm text-surface-400 mt-1">All drivers are currently busy or offline</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {drivers.map(driver => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${selectedDriver?.id === driver.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                  }
                `}
                onClick={() => setSelectedDriver(driver)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-surface-200 rounded-full flex items-center justify-center">
                      <ApperIcon name="User" size={16} className="text-surface-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-surface-900">{driver.name}</p>
                      <div className="flex items-center space-x-3 text-sm text-surface-600">
                        <span className="flex items-center">
                          <ApperIcon name={getVehicleIcon(driver.vehicleType)} size={12} className="mr-1" />
                          {driver.vehicleType}
                        </span>
                        <span className="flex items-center">
                          <ApperIcon name="MapPin" size={12} className="mr-1" />
                          {calculateDistance(driver, delivery)} km
                        </span>
                        <span className="flex items-center">
                          <ApperIcon name="Star" size={12} className="mr-1" />
                          {driver.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={driver.status} size="sm" />
                    {driver === optimalDriver && (
                      <div className="flex items-center text-xs text-accent font-medium">
                        <ApperIcon name="Zap" size={12} className="mr-1" />
                        Best Match
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-surface-200">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={assigning}
        >
          Cancel
        </Button>
        <Button
          onClick={() => selectedDriver && handleAssign(selectedDriver)}
          disabled={!selectedDriver || assigning}
          loading={assigning}
          icon="UserCheck"
        >
          Assign Selected Driver
        </Button>
      </div>
    </div>
  );
};

export default DriverAssignmentPanel;