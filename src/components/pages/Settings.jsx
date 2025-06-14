import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      companyName: 'SwiftShip Logistics',
      email: 'admin@swiftship.com',
      phone: '+1-555-0123',
      address: '123 Logistics Ave, New York, NY 10001',
      timezone: 'America/New_York',
      currency: 'USD'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      deliveryUpdates: true,
      driverAlerts: true,
      systemMaintenance: false
    },
    operational: {
      autoAssignment: true,
      optimizeRoutes: true,
      allowCancellations: true,
      requireSignature: true,
      enableTracking: true,
      businessHours: '09:00-18:00'
    }
  });
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'operational', label: 'Operations', icon: 'Truck' },
    { id: 'integrations', label: 'Integrations', icon: 'Plug' }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const toggleSetting = (category, key) => {
    updateSetting(category, key, !settings[category][key]);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            value={settings.general.companyName}
            onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={settings.general.email}
            onChange={(e) => updateSetting('general', 'email', e.target.value)}
          />
          <Input
            label="Phone"
            value={settings.general.phone}
            onChange={(e) => updateSetting('general', 'phone', e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Timezone</label>
            <select
              value={settings.general.timezone}
              onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
              className="w-full px-3 py-3 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Input
              label="Address"
              value={settings.general.address}
              onChange={(e) => updateSetting('general', 'address', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
              <div>
                <h4 className="font-medium text-surface-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </h4>
                <p className="text-sm text-surface-600">
                  {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                  {key === 'smsNotifications' && 'Get SMS alerts for urgent delivery issues'}
                  {key === 'pushNotifications' && 'Browser push notifications for real-time updates'}
                  {key === 'deliveryUpdates' && 'Notifications when deliveries are completed'}
                  {key === 'driverAlerts' && 'Alerts when drivers go offline or need assistance'}
                  {key === 'systemMaintenance' && 'Notifications about scheduled maintenance'}
                </p>
              </div>
              <button
                onClick={() => toggleSetting('notifications', key)}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${value ? 'bg-primary' : 'bg-surface-300'}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                    ${value ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOperationalSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Operational Settings</h3>
        <div className="space-y-4">
          {Object.entries(settings.operational).map(([key, value]) => {
            if (key === 'businessHours') {
              return (
                <div key={key} className="p-4 bg-surface-50 rounded-lg">
                  <label className="block text-sm font-medium text-surface-700 mb-2">Business Hours</label>
                  <Input
                    value={value}
                    onChange={(e) => updateSetting('operational', key, e.target.value)}
                    placeholder="09:00-18:00"
                  />
                </div>
              );
            }
            
            return (
              <div key={key} className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-surface-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </h4>
                  <p className="text-sm text-surface-600">
                    {key === 'autoAssignment' && 'Automatically assign deliveries to available drivers'}
                    {key === 'optimizeRoutes' && 'Use AI to optimize delivery routes'}
                    {key === 'allowCancellations' && 'Allow customers to cancel deliveries'}
                    {key === 'requireSignature' && 'Require signature for proof of delivery'}
                    {key === 'enableTracking' && 'Enable real-time GPS tracking for deliveries'}
                  </p>
                </div>
                <button
                  onClick={() => toggleSetting('operational', key)}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors
                    ${value ? 'bg-primary' : 'bg-surface-300'}
                  `}
                >
                  <div
                    className={`
                      absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                      ${value ? 'translate-x-7' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Third-Party Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-surface-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="MapPin" size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-surface-900">Google Maps API</h4>
                <p className="text-sm text-surface-600">Route optimization and tracking</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Configure
            </Button>
          </div>

          <div className="p-4 border border-surface-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="CreditCard" size={20} className="text-accent" />
              </div>
              <div>
                <h4 className="font-medium text-surface-900">Stripe Payment</h4>
                <p className="text-sm text-surface-600">Process payments securely</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Configure
            </Button>
          </div>

          <div className="p-4 border border-surface-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="MessageSquare" size={20} className="text-secondary" />
              </div>
              <div>
                <h4 className="font-medium text-surface-900">Twilio SMS</h4>
                <p className="text-sm text-surface-600">Send SMS notifications</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Configure
            </Button>
          </div>

          <div className="p-4 border border-surface-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="Mail" size={20} className="text-warning" />
              </div>
              <div>
                <h4 className="font-medium text-surface-900">SendGrid Email</h4>
                <p className="text-sm text-surface-600">Email delivery notifications</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Configure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Settings</h1>
          <p className="text-surface-600">Manage your SwiftShip platform configuration</p>
        </div>
        <Button
          onClick={handleSave}
          loading={saving}
          icon="Save"
          size="lg"
        >
          Save Changes
        </Button>
      </div>

      {/* Settings Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-surface-700 hover:bg-surface-100'
                  }
                `}
              >
                <ApperIcon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
          >
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'operational' && renderOperationalSettings()}
            {activeTab === 'integrations' && renderIntegrationsSettings()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;