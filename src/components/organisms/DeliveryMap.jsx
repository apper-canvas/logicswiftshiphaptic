import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import StatusBadge from '@/components/atoms/StatusBadge';

const DeliveryMap = ({ deliveries = [], drivers = [], selectedDelivery, onSelectDelivery }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [zoom, setZoom] = useState(12);

  // Mock map implementation - in real app would use Google Maps, Mapbox, etc.
  const MapMarker = ({ position, type, data, isSelected, onClick }) => {
    const markerStyles = {
      delivery: 'bg-accent text-white',
      pickup: 'bg-warning text-white',
      driver: 'bg-primary text-white'
    };

    // Convert lat/lng to pixel position (simplified)
    const pixelX = ((position.lng + 74.0060) * 800) + 100;
    const pixelY = ((40.7128 - position.lat) * 600) + 100;

    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: isSelected ? 1.2 : 1 }}
        whileHover={{ scale: isSelected ? 1.3 : 1.1 }}
        className={`
          absolute w-8 h-8 rounded-full flex items-center justify-center cursor-pointer
          ${markerStyles[type]} ${isSelected ? 'ring-2 ring-white shadow-lg' : 'shadow-md'}
        `}
        style={{
          left: pixelX,
          top: pixelY,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={() => onClick && onClick(data)}
      >
        <ApperIcon 
          name={type === 'driver' ? 'User' : type === 'pickup' ? 'Package' : 'Navigation'} 
          size={14} 
        />
      </motion.div>
    );
  };

  const MapRoute = ({ start, end, color = '#2563EB' }) => {
    const startX = ((start.lng + 74.0060) * 800) + 100;
    const startY = ((40.7128 - start.lat) * 600) + 100;
    const endX = ((end.lng + 74.0060) * 800) + 100;
    const endY = ((40.7128 - end.lat) * 600) + 100;

    return (
      <svg className="absolute inset-0 pointer-events-none">
        <motion.line
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={color}
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-surface-200 overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b border-surface-200 bg-surface-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-surface-900">Live Tracking Map</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-surface-600">Drivers</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-surface-600">Pickups</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="text-surface-600">Deliveries</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-surface-100 rounded-lg">
              <ApperIcon name="ZoomIn" size={16} className="text-surface-600" />
            </button>
            <button className="p-2 hover:bg-surface-100 rounded-lg">
              <ApperIcon name="ZoomOut" size={16} className="text-surface-600" />
            </button>
            <button className="p-2 hover:bg-surface-100 rounded-lg">
              <ApperIcon name="Maximize" size={16} className="text-surface-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative h-96 bg-surface-100 overflow-hidden">
        {/* Mock map background */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-100 to-surface-200">
          <div className="absolute inset-0 opacity-10">
            {/* Grid pattern to simulate map */}
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Routes */}
        {deliveries.filter(d => d.status === 'in_transit' || d.status === 'assigned').map(delivery => (
          <MapRoute
            key={`route-${delivery.id}`}
            start={delivery.pickupAddress.coordinates}
            end={delivery.deliveryAddress.coordinates}
            color={delivery.status === 'in_transit' ? '#10B981' : '#2563EB'}
          />
        ))}

        {/* Driver Markers */}
        {drivers.filter(d => d.status !== 'offline').map(driver => (
          <MapMarker
            key={`driver-${driver.id}`}
            position={driver.location}
            type="driver"
            data={driver}
            isSelected={false}
          />
        ))}

        {/* Delivery Markers */}
        {deliveries.map(delivery => (
          <div key={delivery.id}>
            {/* Pickup marker */}
            <MapMarker
              position={delivery.pickupAddress.coordinates}
              type="pickup"
              data={delivery}
              isSelected={selectedDelivery?.id === delivery.id}
              onClick={onSelectDelivery}
            />
            {/* Delivery marker */}
            <MapMarker
              position={delivery.deliveryAddress.coordinates}
              type="delivery"
              data={delivery}
              isSelected={selectedDelivery?.id === delivery.id}
              onClick={onSelectDelivery}
            />
          </div>
        ))}
      </div>

      {/* Selected Delivery Info */}
      {selectedDelivery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-surface-200 bg-surface-50"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-surface-900">{selectedDelivery.trackingId}</h4>
            <StatusBadge status={selectedDelivery.status} />
          </div>
          <div className="text-sm text-surface-600 space-y-1">
            <p><strong>From:</strong> {selectedDelivery.pickupAddress.street}</p>
            <p><strong>To:</strong> {selectedDelivery.deliveryAddress.street}</p>
            <p><strong>Package:</strong> {selectedDelivery.packageDetails.type} • {selectedDelivery.packageDetails.weight}kg</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DeliveryMap;