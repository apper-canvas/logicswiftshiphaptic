import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { deliveryService } from "@/services";

const BookingForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    pickupAddress: {
      street: '',
      city: '',
      postalCode: ''
    },
    deliveryAddress: {
      street: '',
      city: '',
      postalCode: ''
    },
    packageDetails: {
      type: 'document',
      weight: '',
      value: '',
      instructions: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const packageTypes = [
    { value: 'document', label: 'Document' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'medical', label: 'Medical' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'food', label: 'Food' },
    { value: 'other', label: 'Other' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pickupAddress.street) newErrors.pickupStreet = 'Pickup address is required';
    if (!formData.pickupAddress.city) newErrors.pickupCity = 'Pickup city is required';
    if (!formData.pickupAddress.postalCode) newErrors.pickupPostal = 'Pickup postal code is required';
    
    if (!formData.deliveryAddress.street) newErrors.deliveryStreet = 'Delivery address is required';
    if (!formData.deliveryAddress.city) newErrors.deliveryCity = 'Delivery city is required';
    if (!formData.deliveryAddress.postalCode) newErrors.deliveryPostal = 'Delivery postal code is required';
    
    if (!formData.packageDetails.weight) newErrors.weight = 'Package weight is required';
    if (!formData.packageDetails.value) newErrors.value = 'Package value is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Add coordinates for addresses (mock)
      const bookingData = {
        ...formData,
        pickupAddress: {
          ...formData.pickupAddress,
          coordinates: {
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1
          }
        },
        deliveryAddress: {
          ...formData.deliveryAddress,
          coordinates: {
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1
          }
        },
        packageDetails: {
          ...formData.packageDetails,
          weight: parseFloat(formData.packageDetails.weight),
          value: parseFloat(formData.packageDetails.value),
          dimensions: {
            length: 30,
            width: 20,
            height: 10
          }
        }
      };

      await deliveryService.create(bookingData);
      toast.success('Delivery booked successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to book delivery');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6 max-w-full"
    >
      {/* Pickup Address */}
      <div className="space-y-4">
        <h3 className="font-semibold text-surface-900 flex items-center">
          <ApperIcon name="MapPin" size={16} className="mr-2" />
          Pickup Address
        </h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Street Address"
              placeholder="123 Main Street, Apt 4B"
              value={formData.pickupAddress.street}
              onChange={(e) => updateField('pickupAddress', 'street', e.target.value)}
              error={errors.pickupStreet}
              required
            />
          </div>
<Input
            label="City"
            placeholder="New York"
            value={formData.pickupAddress.city}
            onChange={(e) => updateField('pickupAddress', 'city', e.target.value)}
            error={errors.pickupCity}
            required
          />
<Input
            label="Postal Code"
            placeholder="10001"
            value={formData.pickupAddress.postalCode}
            onChange={(e) => updateField('pickupAddress', 'postalCode', e.target.value)}
            error={errors.pickupPostal}
            required
          />
        </div>
      </div>

      {/* Delivery Address */}
      <div className="space-y-4">
        <h3 className="font-semibold text-surface-900 flex items-center">
          <ApperIcon name="Navigation" size={16} className="mr-2" />
          Delivery Address
</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="md:col-span-2">
            <Input
              label="Street Address"
              placeholder="456 Oak Avenue, Suite 2A"
              value={formData.deliveryAddress.street}
              onChange={(e) => updateField('deliveryAddress', 'street', e.target.value)}
              error={errors.deliveryStreet}
              required
            />
          </div>
<Input
            label="City"
            placeholder="Los Angeles"
            value={formData.deliveryAddress.city}
            onChange={(e) => updateField('deliveryAddress', 'city', e.target.value)}
            error={errors.deliveryCity}
            required
          />
<Input
            label="Postal Code"
            placeholder="90210"
            value={formData.deliveryAddress.postalCode}
            onChange={(e) => updateField('deliveryAddress', 'postalCode', e.target.value)}
            error={errors.deliveryPostal}
            required
          />
        </div>
      </div>

      {/* Package Details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-surface-900 flex items-center">
          <ApperIcon name="Package" size={16} className="mr-2" />
          Package Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Package Type <span className="text-error">*</span>
            </label>
            <select
              value={formData.packageDetails.type}
              onChange={(e) => updateField('packageDetails', 'type', e.target.value)}
              className="w-full px-3 py-3 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {packageTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
<Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            placeholder="2.5"
            value={formData.packageDetails.weight}
            onChange={(e) => updateField('packageDetails', 'weight', e.target.value)}
            error={errors.weight}
            required
          />
<Input
            label="Declared Value ($)"
            type="number"
            step="0.01"
            placeholder="150.00"
            value={formData.packageDetails.value}
            onChange={(e) => updateField('packageDetails', 'value', e.target.value)}
            error={errors.value}
            required
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Special Instructions
            </label>
            <textarea
              value={formData.packageDetails.instructions}
              onChange={(e) => updateField('packageDetails', 'instructions', e.target.value)}
              placeholder="Any special handling instructions..."
              rows={3}
              className="w-full px-3 py-3 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-surface-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          icon="Send"
        >
          Book Delivery
        </Button>
      </div>
    </motion.form>
  );
};

export default BookingForm;