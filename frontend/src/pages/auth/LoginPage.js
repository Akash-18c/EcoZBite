import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  Loader2,
  Shield,
  Sparkles,
  Heart,
  Leaf
} from 'lucide-react';
import Logo from '../../components/Logo';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // Check if there's a success message from registration
    if (location.state?.message) {
      toast.success(location.state.message);
      // Pre-fill email if provided
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Redirect based on role
        if (result.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (result.data.user.role === 'store_owner') {
          navigate('/store/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else if (result.needsVerification) {
        navigate('/auth/verify-email', {
          state: { email: result.email }
        });
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Helmet>
        <title>Sign In - EcoZBite</title>
        <meta name="description" content="Sign in to your EcoZBite account to access fresh products and save money while reducing food waste." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-teal-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full space-y-8 relative z-10"
        >
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 transition-colors mb-8 group">
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <div className="flex justify-center mb-6">
              <Logo size="large" showText={true} />
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent mb-3"
            >
              Welcome Back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gray-600 text-lg"
            >
              Continue your sustainable journey with EcoZBite
            </motion.p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 bg-gray-50/50 backdrop-blur-sm"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="block w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 bg-gray-50/50 backdrop-blur-sm"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-2xl transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded-lg"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700 font-medium">
                    Remember me
                  </label>
                </div>
                <Link to="/auth/forgot-password" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Forgot password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Signing you in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-3" />
                    Sign In Securely
                  </div>
                )}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-600">
                New to EcoZBite?{' '}
                <Link to="/auth/register" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Create your account
                </Link>
              </p>
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-center"
          >
            <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-white text-xl">💰</span>
                </div>
                <span className="text-sm font-bold text-gray-700">Save Money</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-white text-xl">🌱</span>
                </div>
                <span className="text-sm font-bold text-gray-700">Reduce Waste</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-700">Help Planet</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
