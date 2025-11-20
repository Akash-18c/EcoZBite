import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Loader2,
  Store,
  MapPin,
  Phone,
  X
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('user');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: userType === 'admin' ? 'store_owner' : 'customer'
      };

      // Add store data if store owner
      if (userType === 'admin') {
        userData.storeName = data.storeName;
        userData.storeAddress = {
          street: data.storeStreet,
          city: data.storeCity,
          state: data.storeState,
          zipCode: data.storeZipCode,
          coordinates: { lat: 0, lng: 0 } // Will be updated later with geocoding
        };
        userData.storeContact = {
          phone: data.storePhone,
          email: data.email
        };
      }

      const result = await registerUser(userData);

      if (result.success) {
        // Show success message and redirect to email verification page
        toast.success('Registration successful! Please check your email for verification code.');
        // Animate toast with more professional style
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <p className="text-sm font-medium text-gray-900">
                Registration successful! Please check your email for verification code.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Verification code sent to: <span className="font-semibold">{data.email}</span>
              </p>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Close
              </button>
            </div>
          </motion.div>
        ));
        navigate('/auth/verify-email', {
          state: {
            email: data.email,
            role: userType === 'admin' ? 'admin' : 'customer'
          }
        });
      } else {
        setError('root', { message: result.error || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setError('root', { message: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account - EcoZBite</title>
        <meta name="description" content="Join EcoZBite and start saving money on fresh products while helping reduce food waste. Create your free account today." />
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
            className="max-w-2xl w-full space-y-8 relative z-10"
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
            </div>

            <div className="text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent mb-3"
              >
                Join EcoZBite Today!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-gray-600 text-lg"
              >
                Start your journey towards sustainable shopping and saving money
              </motion.p>
            </div>

          {/* User Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              I want to join as:
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                type="button"
                onClick={() => setUserType('user')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  userType === 'user'
                    ? 'border-emerald-600 bg-emerald-100 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-3xl mb-2">🛒</div>
                <div className="font-semibold">Customer</div>
                <div className="text-sm text-gray-600">Find great deals on fresh products</div>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setUserType('admin')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  userType === 'admin'
                    ? 'border-teal-600 bg-teal-100 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-3xl mb-2">🏪</div>
                <div className="font-semibold">Store Owner</div>
                <div className="text-sm text-gray-600">Reduce waste and increase sales</div>
              </motion.button>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Personal Information
                </h4>
                
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('name', {
                        required: 'Full name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters'
                        },
                        maxLength: {
                          value: 50,
                          message: 'Name cannot exceed 50 characters'
                        }
                      })}
                      type="text"
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.name.message}
                    </motion.p>
                  )}
                </div>

                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative"
                >
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-3">
                    Email Address
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Mail className="h-5 w-5 text-emerald-500 group-focus-within:text-emerald-600" />
                      </motion.div>
                    </div>
                    <motion.input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      type="email"
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)"
                      }}
                      transition={{ duration: 0.2 }}
                      className={`block w-full pl-12 pr-4 py-4 border-2 ${
                        errors.email
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-200 bg-white group-hover:border-emerald-300'
                      } rounded-xl focus:outline-none focus:ring-0 focus:border-emerald-500 transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium shadow-sm`}
                      placeholder="your.email@example.com"
                    />
                    {/* Animated border gradient */}
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"
                      style={{ padding: '2px' }}
                    >
                      <div className="w-full h-full bg-white rounded-xl"></div>
                    </motion.div>

                    {/* Success indicator */}
                    {!errors.email && watch('email') && watch('email').includes('@') && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                          className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>

                  {/* Enhanced error message */}
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="mt-3 flex items-center space-x-2"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: 3 }}
                        className="flex-shrink-0"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </motion.div>
                      <motion.p
                        className="text-sm font-medium text-red-600"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 0.5, repeat: 3 }}
                      >
                        {errors.email.message}
                      </motion.p>
                    </motion.div>
                  )}

                  {/* Helper text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 text-xs text-gray-500 flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    We'll send a verification code to this email address
                  </motion.p>
                </motion.div>

                {/* Password Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                        type={showPassword ? 'text' : 'password'}
                        className={`block w-full pl-10 pr-12 py-3 border ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
                        placeholder="Create password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: value => value === password || 'Passwords do not match'
                        })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`block w-full pl-10 pr-12 py-3 border ${
                          errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {errors.confirmPassword.message}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>

              {/* Store Information (Admin Only) */}
              {userType === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Store Information
                  </h4>
                  
                  {/* Store Name */}
                  <div>
                    <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Store className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('storeName', {
                          required: userType === 'admin' ? 'Store name is required' : false,
                          minLength: {
                            value: 2,
                            message: 'Store name must be at least 2 characters'
                          }
                        })}
                        type="text"
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          errors.storeName ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
                        placeholder="Enter your store name"
                      />
                    </div>
                    {errors.storeName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {errors.storeName.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Store Address */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="storeStreet" className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...register('storeStreet', {
                            required: userType === 'admin' ? 'Street address is required' : false
                          })}
                          type="text"
                          className={`block w-full pl-10 pr-3 py-3 border ${
                            errors.storeStreet ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
                          placeholder="Street address"
                        />
                      </div>
                      {errors.storeStreet && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600"
                        >
                          {errors.storeStreet.message}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="storeCity" className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        {...register('storeCity', {
                          required: userType === 'admin' ? 'City is required' : false
                        })}
                        type="text"
                        className={`block w-full px-3 py-3 border ${
                          errors.storeCity ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
                        placeholder="City"
                      />
                      {errors.storeCity && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600"
                        >
                          {errors.storeCity.message}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="storeState" className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        {...register('storeState', {
                          required: userType === 'admin' ? 'State is required' : false
                        })}
                        type="text"
                        className={`block w-full px-3 py-3 border ${
                          errors.storeState ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
                        placeholder="State"
                      />
                      {errors.storeState && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600"
                        >
                          {errors.storeState.message}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="storeZipCode" className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        {...register('storeZipCode', {
                          required: userType === 'admin' ? 'ZIP code is required' : false
                        })}
                        type="text"
                        className={`block w-full px-3 py-3 border ${
                          errors.storeZipCode ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
                        placeholder="ZIP Code"
                      />
                      {errors.storeZipCode && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600"
                        >
                          {errors.storeZipCode.message}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...register('storePhone', {
                            required: userType === 'admin' ? 'Phone number is required' : false
                          })}
                          type="tel"
                          className={`block w-full pl-10 pr-3 py-3 border ${
                            errors.storePhone ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
                          placeholder="Phone number"
                        />
                      </div>
                      {errors.storePhone && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600"
                        >
                          {errors.storePhone.message}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  {...register('terms', {
                    required: 'You must accept the terms and conditions'
                  })}
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 leading-relaxed">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-emerald-600 hover:text-emerald-700 underline focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 rounded"
                  >
                    Terms and Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-emerald-600 hover:text-emerald-700 underline focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 rounded"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              {errors.terms && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600"
                >
                  {errors.terms.message}
                </motion.p>
              )}

              {/* Error Message */}
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <p className="text-sm text-red-600">{errors.root.message}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </motion.button>

              {/* Sign In Link */}
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/auth/login"
                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                </span>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>

      {/* Terms and Conditions Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Terms and Conditions</h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
                <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">1. Account Registration</h4>
                    <p>You must provide accurate and complete information while signing up. You are responsible for keeping your account credentials safe and secure.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">2. Account Security</h4>
                    <p>You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">3. Acceptable Use</h4>
                    <p>You agree not to use the website for illegal or harmful activities. This includes but is not limited to: violating any laws, infringing on intellectual property rights, or distributing harmful content.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">4. Account Suspension</h4>
                    <p>The company reserves the right to suspend or terminate accounts that violate these terms. We may also suspend accounts for security reasons or if we suspect fraudulent activity.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">5. Service Changes</h4>
                    <p>Services and features may change without prior notice. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">6. Limitation of Liability</h4>
                    <p>EcoZBite shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">7. Governing Law</h4>
                    <p>These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which EcoZBite operates.</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-md"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Privacy Policy</h3>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
                <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h4>
                    <p>We collect basic information (name, email, phone number) only for account creation and service use. For store owners, we also collect store information including address and contact details.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">2. How We Use Your Information</h4>
                    <p>Your personal data is used to provide our services, communicate with you, process transactions, and improve our platform. We may also use your information to send you important updates about your account.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">3. Information Sharing</h4>
                    <p>Your personal data will not be sold or shared with third parties without your explicit consent, except as required by law or to provide our services (such as payment processing).</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">4. Cookies and Tracking</h4>
                    <p>We use cookies to improve user experience, analyze website traffic, and personalize content. You can control cookie settings through your browser preferences.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">5. Data Security</h4>
                    <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">6. Data Retention</h4>
                    <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You have the right to request deletion of your account and data at any time.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">7. Your Rights</h4>
                    <p>You have the right to access, update, or delete your personal information. You can also opt out of marketing communications at any time.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">8. Contact Us</h4>
                    <p>If you have any questions about this Privacy Policy, please contact us through the support channels available on our platform.</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-md"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default RegisterPage;
