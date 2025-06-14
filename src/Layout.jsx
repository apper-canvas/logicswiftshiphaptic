import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Header with Navigation */}
      <header className="flex-shrink-0 bg-white border-b border-surface-200 z-40">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md hover:bg-surface-100 mr-2"
            >
              <ApperIcon name="Menu" size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ApperIcon name="Truck" size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-surface-900">SwiftShip</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {routeArray.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-surface-700 hover:bg-surface-100'
                  }`
                }
              >
                <ApperIcon name={route.icon} size={16} />
                <span>{route.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-lg hover:bg-surface-100 transition-colors">
              <ApperIcon name="Bell" size={20} className="text-surface-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-surface-200 rounded-full flex items-center justify-center">
              <ApperIcon name="User" size={16} className="text-surface-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.aside
            initial={{ y: -300 }}
            animate={{ y: 0 }}
            exit={{ y: -300 }}
            className="lg:hidden fixed left-0 right-0 top-16 bg-white border-b border-surface-200 z-50 shadow-lg"
          >
            <nav className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {routeArray.map((route) => (
                <NavLink
                  key={route.id}
                  to={route.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-surface-700 hover:bg-surface-100'
                    }`
                  }
                >
                  <ApperIcon name={route.icon} size={16} />
                  <span>{route.label}</span>
                </NavLink>
              ))}
            </nav>
          </motion.aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;