import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Mail,
  ArrowLeft,
  Loader2,
  Shield,
  Sparkles,
  Heart,
  CheckCircle,
  Key
} from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setSent(true);
        toast.success('Password reset code sent! Please check your email.');
      } else {
        setError(result.error || 'Failed to send reset code. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <Helmet>
          <title>Check Your Email - EcoZBite</title>
          <meta name="description" content="Check your email for password reset instructions from EcoZBite." />
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

              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 5
                }}
                className="flex justify-center mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl relative">
                  <CheckCircle className="w-10 h-10 text-white" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent mb-3"
              >
                Check Your Email
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-gray-600 text-lg"
              >
                We've sent a password reset code to
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-emerald-600 font-semibold text-lg"
              >
                {email}
              </motion.p>
            </div>

            {/* Success Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
            >
              <div className="text-center space-y-6">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto"
                >
                  <Mail className="w-8 h-8 text-emerald-600" />
                </motion.div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Password Reset Code Sent!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Click the link in your email to reset your password. The code will expire in 10 minutes.
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="space-y-4"
                >
                  <Link
                    to={`/auth/reset-password?email=${encodeURIComponent(email)}`}
                    className="w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
                  >
                    <Key className="w-5 h-5 mr-3" />
                    Enter Reset Code
                  </Link>

                  <button
                    onClick={() => setSent(false)}
                    className="w-full flex justify-center py-3 px-6 border-2 border-emerald-200 rounded-2xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-300"
                  >
                    Try Different Email
                  </button>
                </motion.div>
              </div>
            </motion.div>

            {/* Back to Login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-center"
            >
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link to="/auth/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Sign In
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password - EcoZBite</title>
        <meta name="description" content="Reset your EcoZBite password. Enter your email to receive a secure password reset code." />
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

            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 5
              }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl relative">
                <Key className="w-10 h-10 text-white" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent mb-3"
            >
              Forgot Your Password?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gray-600 text-lg"
            >
              No worries! Enter your email and we'll send you a reset code
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Sending Reset Code...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-3" />
                    Send Reset Code
                  </div>
                )}
              </motion.button>
            </form>

            {/* Back to Login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link to="/auth/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Sign In
                </Link>
              </p>
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-white text-xl">🔒</span>
                </div>
                <span className="text-sm font-bold text-gray-700">Secure</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <span className="text-sm font-bold text-gray-700">Fast</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-700">Trusted</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
