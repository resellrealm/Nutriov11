import React from 'react';
import { Menu } from 'lucide-react';

const StickyHeader = ({ title, onMenuClick, isSidebarOpen, children }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700 backdrop-blur safe-area-top">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: menu + title */}
        <div className="flex items-center space-x-3">
          {/* Hide hamburger when sidebar is open on mobile */}
          {!isSidebarOpen && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={24} className="text-gray-700 dark:text-gray-200" />
            </button>
          )}

          <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h1>
        </div>

        {/* Right: optional actions */}
        {children && (
          <div className="flex items-center space-x-2">
            {children}
          </div>
        )}
      </div>
    </header>
  );
};

export default StickyHeader;
