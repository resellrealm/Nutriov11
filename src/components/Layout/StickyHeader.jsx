import React, { useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';

const StickyHeader = ({ title, onMenuClick, isSidebarOpen, children }) => {
  const headerRef = useRef(null);

  useEffect(() => {
    // Update CSS variable for header height on mount and resize
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700 backdrop-blur"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        minHeight: '56px',
      }}
    >
      <div className="px-4 py-2 flex items-center justify-between">
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
