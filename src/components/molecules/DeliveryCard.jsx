import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import StatusBadge from '@/components/atoms/StatusBadge';
import Button from '@/components/atoms/Button';

const DeliveryCard = ({ delivery, onViewDetails, onUpdateStatus, onAssignDriver }) => {
  const getPackageIcon = (type) => {
    const icons = {
      document: 'FileText',
      electronics: 'Laptop',
      medical: 'Heart',
      clothing: 'Shirt',
      food: 'Coffee',
      default: 'Package'
    };
    return icons[type] || icons.default;
  };

  const canAssignDriver = delivery.status === 'pending' && !delivery.driverId;
  const canUpdateStatus = delivery.driverId && ['assigned', 'pickup', 'in_transit'].includes(delivery.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-lg p-4 shadow-sm border border-surface-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-surface-100 rounded-lg">
            <ApperIcon name={getPackageIcon(delivery.packageDetails.type)} size={20} className="text-surface-600" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">{delivery.trackingId}</h3>
            <p className="text-sm text-surface-500 capitalize">{delivery.packageDetails.type}</p>
          </div>
        </div>
        <StatusBadge status={delivery.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start space-x-2">
          <ApperIcon name="MapPin" size={14} className="text-surface-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-surface-700 break-words">{delivery.pickupAddress.street}</p>
            <p className="text-xs text-surface-500">{delivery.pickupAddress.city}, {delivery.pickupAddress.postalCode}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <div className="w-4 border-l-2 border-dashed border-surface-300"></div>
        </div>
        <div className="flex items-start space-x-2">
          <ApperIcon name="Navigation" size={14} className="text-accent mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-surface-700 break-words">{delivery.deliveryAddress.street}</p>
            <p className="text-xs text-surface-500">{delivery.deliveryAddress.city}, {delivery.deliveryAddress.postalCode}</p>
          </div>
        </div>
      </div>

      {delivery.estimatedTime && (
        <div className="flex items-center space-x-2 mb-4 p-2 bg-surface-50 rounded-lg">
          <ApperIcon name="Clock" size={14} className="text-surface-400" />
          <span className="text-sm text-surface-600">
            ETA: {format(new Date(delivery.estimatedTime), 'MMM dd, HH:mm')}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-surface-200">
        <div className="text-sm text-surface-500">
          ${delivery.packageDetails.value} • {delivery.packageDetails.weight}kg
        </div>
        <div className="flex items-center space-x-2">
          {canAssignDriver && (
            <Button
              size="sm"
              icon="UserPlus"
              onClick={() => onAssignDriver(delivery)}
            >
              Assign
            </Button>
          )}
          {canUpdateStatus && (
            <Button
              size="sm"
              variant="outline"
              icon="RefreshCw"
              onClick={() => onUpdateStatus(delivery)}
            >
              Update
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            icon="Eye"
            onClick={() => onViewDetails(delivery)}
          >
            View
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DeliveryCard;