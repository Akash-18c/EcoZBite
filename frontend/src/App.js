import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import LoadingSpinner from './components/LoadingSpinner';
import GlobalLoader from './components/GlobalLoader';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import StoreErrorBoundary from './components/StoreErrorBoundary';

// Lazy load components for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const PublicProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const HelpCenter = React.lazy(() => import('./pages/HelpCenter'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const Support = React.lazy(() => import('./pages/Support'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const EmailVerificationPage = React.lazy(() => import('./pages/auth/EmailVerificationPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/auth/ResetPasswordPage'));

// User pages
const UserDashboard = React.lazy(() => import('./pages/user/UserDashboard'));
const ProductsPage = React.lazy(() => import('./pages/user/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('./pages/user/ProductDetailPage'));
const OrdersPage = React.lazy(() => import('./pages/user/OrdersPage'));
const ProfilePage = React.lazy(() => import('./pages/user/ProfilePage'));
const PlaceOrderPage = React.lazy(() => import('./pages/user/PlaceOrderPage'));
const CartPage = React.lazy(() => import('./pages/user/CartPage'));
const WishlistPage = React.lazy(() => import('./pages/user/WishlistPage'));

// Admin pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProductsPage = React.lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = React.lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminAnalyticsPage = React.lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminSettingsPage = React.lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminCustomersPage = React.lazy(() => import('./pages/admin/AdminCustomersPage'));
const ContactMessages = React.lazy(() => import('./pages/admin/ContactMessages'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const StoreManagement = React.lazy(() => import('./pages/admin/StoreManagement'));
const StoreDashboard = React.lazy(() => import('./pages/store/StoreDashboard'));
const StoreProducts = React.lazy(() => import('./pages/store/StoreProductsFixed'));
const StoreOrders = React.lazy(() => import('./pages/store/StoreOrdersFixed'));
const StoreAnalytics = React.lazy(() => import('./pages/store/StoreAnalytics'));
const StoreProfile = React.lazy(() => import('./pages/store/StoreProfileFixed'));


// 404 page
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

function App() {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return <GlobalLoader />;
  }

  return (
    <LanguageProvider>
      <div className="App">
        <AnimatePresence mode="wait">
          <Suspense fallback={<GlobalLoader />}
          >
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to={
                    user?.role === 'admin' ? '/admin/dashboard' : 
                    user?.role === 'store_owner' ? '/store/dashboard' : 
                    '/dashboard'
                  } replace />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LandingPage />
                  </motion.div>
                )
              }
            />

            <Route
              path="/about"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AboutPage />
                </motion.div>
              }
            />

            <Route
              path="/contact"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ContactPage />
                </motion.div>
              }
            />

            <Route
              path="/products"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PublicProductsPage />
                </motion.div>
              }
            />

            <Route path="/help" element={<HelpCenter />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/support" element={<Support />} />
            <Route path="/faq" element={<FAQ />} />

            {/* Auth routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to={
                    user?.role === 'admin' ? '/admin/dashboard' : 
                    user?.role === 'store_owner' ? '/store/dashboard' : 
                    '/dashboard'
                  } replace />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginPage />
                  </motion.div>
                )
              }
            />

            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RegisterPage />
                  </motion.div>
                )
              }
            />

            <Route
              path="/auth/login"
              element={
                isAuthenticated ? (
                  <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginPage />
                  </motion.div>
                )
              }
            />

            <Route
              path="/auth/register"
              element={
                isAuthenticated ? (
                  <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RegisterPage />
                  </motion.div>
                )
              }
            />

            <Route
              path="/auth/verify-email"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <EmailVerificationPage />
                </motion.div>
              }
            />

            <Route
              path="/auth/forgot-password"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ForgotPasswordPage />
                </motion.div>
              }
            />

            <Route
              path="/auth/reset-password"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResetPasswordPage />
                </motion.div>
              }
            />

            {/* User protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/products"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/product/:id"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ProductDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products/:id"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ProductDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/place-order/:id"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <PlaceOrderPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CartPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/wishlist"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />

            {/* Admin protected routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ErrorBoundary>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AdminDashboard />
                    </motion.div>
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AdminProductsPage />
                  </motion.div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AdminOrdersPage />
                  </motion.div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AdminAnalyticsPage />
                  </motion.div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AdminSettingsPage />
                  </motion.div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/customers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AdminCustomersPage />
                  </motion.div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/contact-messages"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ContactMessages />
                  </motion.div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <UserManagement />
                  </motion.div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/stores"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ErrorBoundary>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StoreManagement />
                    </motion.div>
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AdminSettings />
                  </motion.div>
                </ProtectedRoute>
              }
            />

            {/* Store Owner Routes */}
            <Route
              path="/store/dashboard"
              element={
                <ProtectedRoute allowedRoles={['store_owner', 'admin']}>
                  <ErrorBoundary>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StoreDashboard />
                    </motion.div>
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/store/products"
              element={
                <ProtectedRoute allowedRoles={['store_owner', 'admin']}>
                  <StoreErrorBoundary>
                    <StoreProducts />
                  </StoreErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/store/orders"
              element={
                <ProtectedRoute allowedRoles={['store_owner', 'admin']}>
                  <StoreErrorBoundary>
                    <StoreOrders />
                  </StoreErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/store/analytics"
              element={
                <ProtectedRoute allowedRoles={['store_owner', 'admin']}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <StoreAnalytics />
                  </motion.div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/store/profile"
              element={
                <ProtectedRoute allowedRoles={['store_owner', 'admin']}>
                  <StoreErrorBoundary>
                    <StoreProfile />
                  </StoreErrorBoundary>
                </ProtectedRoute>
              }
            />



            {/* 404 route */}
            <Route
              path="*"
              element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <NotFoundPage />
                </motion.div>
              }
            />
          </Routes>
          </Suspense>
        </AnimatePresence>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </LanguageProvider>
  );
}

export default App;