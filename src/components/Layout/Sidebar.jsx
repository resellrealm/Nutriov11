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

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'text-emerald-500' },
    { path: '/analyze', icon: Camera, label: 'Analyze Meal', color: 'text-cyan-500' },
    { path: '/meal-planner', icon: ChefHat, label: 'Meal Planner', color: 'text-purple-500' },
    { path: '/goals', icon: Target, label: 'Goals', color: 'text-orange-500' },
    { path: '/favourites', icon: Heart, label: 'My Favourites', color: 'text-rose-500' },
    { path: '/achievements', icon: Trophy, label: 'Achievements', color: 'text-amber-500' },
    { path: '/history', icon: HistoryIcon, label: 'History', color: 'text-blue-500' },
    { path: '/account', icon: User, label: 'Account', color: 'text-gray-500' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
    onClose?.();
  };

  const renderNavList = (onItemClick) => (
    <nav className="flex-1 overflow-y-auto">
      <ul className="space-y-1 px-2 py-4">
        {navItems.map(({ path, icon: Icon, label, color }) => (
          <li key={path}>
            <NavLink
              to={path}
              onClick={onItemClick}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    className={`${color} transition-colors duration-200`}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );

  const renderFooter = () => (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-white/95 dark:bg-gray-900/95 border-r border-gray-200 dark:border-gray-800">
        <div className="h-full flex flex-col safe-area-top pt-4">
          <div className="px-4 pb-2">
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              Nutrio
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your daily nutrition hub
            </p>
          </div>
          {renderNavList()}
          {renderFooter()}
        </div>
      </aside>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-full bg-white dark:bg-gray-900 shadow-xl lg:hidden flex flex-col safe-area-top"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className="flex	items-center	justify-between px-4 pt-5 pb-3 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    Nutrio
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your daily nutrition hub
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-200" />
                </button>
              </div>

              {renderNavList(onClose)}
              {renderFooter()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content offset	on desktop */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0" />
    </>
  );
};

export default Sidebar;
