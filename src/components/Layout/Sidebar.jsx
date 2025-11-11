import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Camera,
  ChefHat,
  Target,
  Heart,
  Trophy,
  History as HistoryIcon,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Nutriov10 colors and icons with Nutriov9 structure
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'text-emerald-500' },
    { path: '/analyze', icon: Camera, label: 'Analyze Meal', color: 'text-cyan-500' },
    { path: '/meal-planner', icon: ChefHat, label: 'Meal Planner', color: 'text-purple-500' },
    { path: '/goals', icon: Target, label: 'Goals', color: 'text-orange-500' },
    { path: '/favourites', icon: Heart, label: 'Favourites', color: 'text-rose-500' },
    { path: '/achievements', icon: Trophy, label: 'Achievements', color: 'text-amber-500' },
    { path: '/history', icon: HistoryIcon, label: 'History', color: 'text-blue-500' },
    { path: '/account', icon: User, label: 'Account', color: 'text-gray-500' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay/Scrim */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
                 style={{ paddingTop: 'max(16px, calc(env(safe-area-inset-top) + 16px))' }}>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center overflow-hidden">
                  <span className="text-2xl">🍽️</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Nutrio</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                aria-label="Close menu"
              >
                <X size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-primary/10 to-accent/10 text-primary font-semibold'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              size={20}
                              className={`${
                                isActive ? 'text-primary' : item.color
                              } transition-colors duration-200`}
                            />
                            <span>{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
