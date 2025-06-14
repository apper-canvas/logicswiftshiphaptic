import ApperIcon from '@/components/ApperIcon';

const StatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      color: 'bg-warning/10 text-warning border-warning/20',
      icon: 'Clock'
    },
    assigned: {
      label: 'Assigned',
      color: 'bg-info/10 text-info border-info/20',
      icon: 'UserCheck'
    },
    pickup: {
      label: 'Pickup',
      color: 'bg-secondary/10 text-secondary border-secondary/20',
      icon: 'PackageOpen'
    },
    in_transit: {
      label: 'In Transit',
      color: 'bg-primary/10 text-primary border-primary/20',
      icon: 'Truck'
    },
    delivered: {
      label: 'Delivered',
      color: 'bg-success/10 text-success border-success/20',
      icon: 'CheckCircle2'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-error/10 text-error border-error/20',
      icon: 'XCircle'
    },
    available: {
      label: 'Available',
      color: 'bg-success/10 text-success border-success/20',
      icon: 'CheckCircle2'
    },
    busy: {
      label: 'Busy',
      color: 'bg-warning/10 text-warning border-warning/20',
      icon: 'Clock'
    },
    offline: {
      label: 'Offline',
      color: 'bg-surface-100 text-surface-600 border-surface-200',
      icon: 'CircleOff'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14
  };

  return (
    <span className={`
      inline-flex items-center gap-1 font-medium rounded-full border
      ${config.color}
      ${sizes[size]}
    `}>
      <ApperIcon name={config.icon} size={iconSizes[size]} />
      {config.label}
    </span>
  );
};

export default StatusBadge;