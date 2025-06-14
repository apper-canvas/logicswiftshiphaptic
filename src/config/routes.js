import Dashboard from '@/components/pages/Dashboard';
import ActiveDeliveries from '@/components/pages/ActiveDeliveries';
import Dispatch from '@/components/pages/Dispatch';
import Drivers from '@/components/pages/Drivers';
import Analytics from '@/components/pages/Analytics';
import Settings from '@/components/pages/Settings';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  activeDeliveries: {
    id: 'activeDeliveries',
    label: 'Active Deliveries',
    path: '/deliveries',
    icon: 'Truck',
    component: ActiveDeliveries
  },
  dispatch: {
    id: 'dispatch',
    label: 'Dispatch',
    path: '/dispatch',
    icon: 'Send',
    component: Dispatch
  },
  drivers: {
    id: 'drivers',
    label: 'Drivers',
    path: '/drivers',
    icon: 'Users',
    component: Drivers
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: 'BarChart3',
    component: Analytics
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: 'Settings',
    component: Settings
  }
};

export const routeArray = Object.values(routes);
export default routes;