import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StickyHeader from './StickyHeader';
import Sidebar from './Sidebar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Get page title based on route
  const getPageTitle = (pathname) => {
    const titles = {
      '/': 'Dashboard',
      '/analyze': 'Analyze Meal',
      '/meal-planner': 'Meal Planner',
      '/grocery-list': 'Grocery List',
      '/barcode': 'Scan Barcode',
      '/goals': 'Goals',
      '/favourites': 'Favourites',
      '/achievements': 'Achievements',
      '/history': 'History',
      '/account': 'Account',
    };
    return titles[pathname] || 'Nutrio';
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky Header - Always visible */}
      <StickyHeader
        title={getPageTitle(location.pathname)}
        onMenuClick={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Sidebar Drawer */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content with safe spacing for header */}
      <main
        className="px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 lg:ml-64"
        style={{
          paddingTop: 'calc(var(--header-height, 56px) + 6px)',
          minHeight: 'calc(100vh - var(--header-height, 56px))'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet key={location.pathname} />
        </div>
      </main>
    </div>
  );
};

export default Layout;
