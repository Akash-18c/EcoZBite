import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import PublicHeader from './PublicHeader';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';
  const isStoreOwner = user?.role === 'store_owner';
  const isActive = (path) => location.pathname === path;

  // Public pages that should use PublicHeader
  const publicPages = ['/help', '/faq', '/support', '/contact', '/privacy', '/terms'];
  const isPublicPage = publicPages.includes(location.pathname);

  const userNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/user/products', label: 'Products', icon: '🛒' },
    { path: '/orders', label: 'Orders', icon: '📦' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  const storeNavItems = [
    { path: '/store/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/store/products', label: 'Products', icon: '📦' },
    { path: '/store/orders', label: 'Orders', icon: '📋' },
    { path: '/store/analytics', label: 'Analytics', icon: '📈' },
    { path: '/store/profile', label: 'Profile', icon: '👤' }
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/stores', label: 'Stores', icon: '🏪' },
    { path: '/admin/contact-messages', label: 'Messages', icon: '📧' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' }
  ];

  const navItems = isAdmin ? adminNavItems : isStoreOwner ? storeNavItems : userNavItems;

  // If user is not logged in or on public page, show public header
  if (!user || isPublicPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Authenticated user layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="group">
                <Logo size="default" showText={true} className="group-hover:scale-105 transition-transform duration-300" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center ring-2 ring-primary-200">
                  <span className="text-primary-700 text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">Hi, {user?.name}</p>
                  <p className="text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
