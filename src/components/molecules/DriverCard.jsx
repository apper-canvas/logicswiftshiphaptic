import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import StatusBadge from '@/components/atoms/StatusBadge';
import Button from '@/components/atoms/Button';

const DriverCard = ({ driver, onViewDetails, onAssignDelivery }) => {
  const getVehicleIcon = (type) => {
    const icons = {
      van: 'Truck',
      car: 'Car',
      motorcycle: 'Bike',
      bicycle: 'Bike',
      default: 'Truck'
    };
    return icons[type] || icons.default;
  };

  const canAssign = driver.status === 'available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-lg p-4 shadow-sm border border-surface-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-surface-200 rounded-full flex items-center justify-center">
            <ApperIcon name="User" size={20} className="text-surface-600" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">{driver.name}</h3>
            <div className="flex items-center space-x-2">
              <ApperIcon name={getVehicleIcon(driver.vehicleType)} size={14} className="text-surface-400" />
              <p className="text-sm text-surface-500 capitalize">{driver.vehicleType}</p>
            </div>
          </div>
        </div>
        <StatusBadge status={driver.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-600">Rating:</span>
          <div className="flex items-center space-x-1">
            <ApperIcon name="Star" size={14} className="text-warning fill-current" />
            <span className="font-medium">{driver.rating}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-600">Deliveries:</span>
          <span className="font-medium">{driver.totalDeliveries}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-600">Active Jobs:</span>
          <span className="font-medium">{driver.activeDeliveries.length}</span>
        </div>
      </div>

      {driver.vehicleInfo && (
        <div className="p-2 bg-surface-50 rounded-lg mb-4">
          <div className="text-sm text-surface-600">
            {driver.vehicleInfo.make} {driver.vehicleInfo.model} ({driver.vehicleInfo.year})
          </div>
          {driver.vehicleInfo.licensePlate !== 'N/A' && (
            <div className="text-xs text-surface-500">{driver.vehicleInfo.licensePlate}</div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-surface-200">
        <div className="text-sm text-surface-500">
          <ApperIcon name="MapPin" size={14} className="inline mr-1" />
          {driver.location.lat.toFixed(4)}, {driver.location.lng.toFixed(4)}
        </div>
        <div className="flex items-center space-x-2">
          {canAssign && (
            <Button
              size="sm"
              icon="Plus"
              onClick={() => onAssignDelivery(driver)}
            >
              Assign
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            icon="Eye"
            onClick={() => onViewDetails(driver)}
          >
            View
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DriverCard;