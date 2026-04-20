import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-50 dark:bg-dark-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex bg-gray-50 dark:bg-dark-50 min-h-screen font-sans text-gray-900 dark:text-gray-100 selection:bg-primary-500 selection:text-white">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto w-full max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
