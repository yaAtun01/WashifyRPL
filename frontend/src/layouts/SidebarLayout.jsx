import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FiHome, 
  FiUsers, 
  FiLayers, 
  FiDollarSign, 
  FiTrendingUp, 
  FiMoon, 
  FiSun, 
  FiLogOut, 
  FiMenu, 
  FiX
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const SidebarLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FiHome className="w-5 h-5" /> },
    { name: 'Pelanggan', path: '/admin/customers', icon: <FiUsers className="w-5 h-5" /> },
    { name: 'Layanan', path: '/admin/services', icon: <FiLayers className="w-5 h-5" /> },
    { name: 'Transaksi', path: '/admin/transactions', icon: <FiDollarSign className="w-5 h-5" /> },
    { name: 'Laporan Keuangan', path: '/admin/reports', icon: <FiTrendingUp className="w-5 h-5" /> },
    { name: 'Prediksi Pendapatan', path: '/admin/predictions', icon: <FiTrendingUp className="w-5 h-5" /> },
  ];

  const logoSVG = (
    <svg className="w-8 h-8 text-primary-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <circle cx="12" cy="14" r="5" strokeDasharray="4 2" />
      <circle cx="12" cy="14" r="2" />
      <line x1="8" y1="5" x2="8.01" y2="5" />
      <line x1="12" y1="5" x2="12.01" y2="5" />
      <line x1="16" y1="5" x2="16.01" y2="5" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-darkbg-deep text-gray-900 dark:text-gray-100 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden no-print bg-white dark:bg-darkbg-dark border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
          {logoSVG}
          <div className="leading-none">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">Washify</span>
            <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">Admin System</span>
          </div>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-darkbg-light focus:outline-none"
        >
          {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        no-print fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-white dark:bg-darkbg-dark border-r border-gray-200 dark:border-gray-800 z-40 flex flex-col justify-between
        h-full md:sticky md:top-0 md:h-screen
      `}>
        <div>
          {/* Logo Section */}
          <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 space-x-3">
            {logoSVG}
            <div>
              <span className="font-black text-2xl tracking-wider bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent block">WASHIFY</span>
              <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider block -mt-1">Laundry Management</span>
            </div>
          </div>

          {/* User Profile Summary */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-darkbg-light/10">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Administrator</p>
            <p className="font-bold text-gray-800 dark:text-white truncate mt-0.5">{user?.name}</p>
            <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
              {user?.role}
            </span>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            {adminMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                    ${isActive 
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/35' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkbg-light/40 hover:text-primary-500 dark:hover:text-white'}
                  `}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkbg-light transition-colors"
          >
            <div className="flex items-center space-x-3">
              {isDarkMode ? <FiSun className="w-5 h-5 text-yellow-500" /> : <FiMoon className="w-5 h-5 text-gray-500" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <span className="text-[10px] bg-gray-200 dark:bg-darkbg-light px-2 py-0.5 rounded font-bold">
              {isDarkMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50 dark:bg-darkbg-deep/40">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

    </div>
  );
};

export default SidebarLayout;
