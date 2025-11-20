import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text="Checking authentication..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check if user email is verified
  if (!user?.isEmailVerified) {
    return <Navigate to="/auth/verify-email" state={{ email: user?.email }} replace />;
  }

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    let redirectPath = '/dashboard';
    if (user?.role === 'admin') {
      redirectPath = '/admin/dashboard';
    } else if (user?.role === 'store_owner') {
      redirectPath = '/store/dashboard';
    }
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;