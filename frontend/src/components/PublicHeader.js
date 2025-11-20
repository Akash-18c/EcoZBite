import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const PublicHeader = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="group">
              <Logo size="default" showText={true} className="group-hover:scale-105 transition-transform duration-300" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/help" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
              Help
            </Link>
            <Link to="/faq" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
              FAQ
            </Link>
            <Link to="/support" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
              Support
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
              Contact
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;