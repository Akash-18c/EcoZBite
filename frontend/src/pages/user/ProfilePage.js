import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import Logo from '../../components/Logo';
import { User, Mail, Phone, MapPin, Save, Edit3, Camera, Lock, BarChart3, TrendingUp, ShoppingBag, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        }
      });
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      fetchUserData();
      fetchAnalytics();
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        setAnalytics(null);
        setAnalyticsLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:4000/api/analytics/user-analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => {
        console.log('User analytics API error:', err.response?.status);
        return { data: { success: false, analytics: null } };
      });
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      } else {
        setAnalytics(null);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        // Update the user context with new data
        if (updateUser) {
          updateUser(result.user);
        }
        // Fetch fresh user data to ensure consistency
        await fetchUserData();
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch fresh user data from API
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (updateUser) {
          updateUser(result.user);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || ''
      }
    });
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (response.ok) {
        toast.success('Password changed successfully! You will be logged out in 3 seconds.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        
        // Auto logout after 3 seconds
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
        }, 3000);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <Logo size="medium" showText={false} />
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your account information</p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit}>
                {/* Profile Picture Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 sm:p-8 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-2xl sm:text-3xl font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <Camera className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{user?.name}</h2>
                      <p className="text-gray-600 text-sm sm:text-base">{user?.email}</p>
                      <p className="text-sm text-green-600 mt-1">
                        Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                      <User className="w-5 h-5 mr-2 text-green-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={true} // Email should not be editable
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-lg"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                              isEditing 
                                ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' 
                                : 'border-gray-200 bg-gray-50'
                            }`}
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-green-600" />
                      Address Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                          placeholder="Enter your street address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                          placeholder="Enter your city"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                          placeholder="Enter your state"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                          placeholder="Enter ZIP code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Analytics Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                      Your Shopping Analytics
                    </h3>
                    
                    {analyticsLoading ? (
                      <div className="bg-gray-50 p-8 rounded-lg text-center">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                          <div className="h-32 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ) : analytics ? (
                      <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200"
                          >
                            <div className="flex items-center">
                              <ShoppingBag className="w-8 h-8 text-blue-600 mr-3" />
                              <div>
                                <p className="text-2xl font-bold text-blue-900">{analytics.totalOrders || 0}</p>
                                <p className="text-sm text-blue-700">Total Orders</p>
                              </div>
                            </div>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200"
                          >
                            <div className="flex items-center">
                              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                              <div>
                                <p className="text-2xl font-bold text-green-900">₹{analytics.totalSpent || 0}</p>
                                <p className="text-sm text-green-700">Total Spent</p>
                              </div>
                            </div>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200"
                          >
                            <div className="flex items-center">
                              <Heart className="w-8 h-8 text-purple-600 mr-3" />
                              <div>
                                <p className="text-2xl font-bold text-purple-900">{analytics.wishlistItems || 0}</p>
                                <p className="text-sm text-purple-700">Wishlist Items</p>
                              </div>
                            </div>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200"
                          >
                            <div className="flex items-center">
                              <BarChart3 className="w-8 h-8 text-orange-600 mr-3" />
                              <div>
                                <p className="text-2xl font-bold text-orange-900">₹{analytics.avgOrderValue || 0}</p>
                                <p className="text-sm text-orange-700">Avg Order Value</p>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Monthly Orders Chart */}
                          {analytics.monthlyOrders && analytics.monthlyOrders.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                              className="bg-white p-4 rounded-lg border border-gray-200"
                            >
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Orders per Month</h4>
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={analytics.monthlyOrders}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" fontSize={12} />
                                  <YAxis fontSize={12} />
                                  <Tooltip />
                                  <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </motion.div>
                          )}

                          {/* Favorite Categories Chart */}
                          {analytics.favoriteCategories && analytics.favoriteCategories.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 }}
                              className="bg-white p-4 rounded-lg border border-gray-200"
                            >
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Favorite Categories</h4>
                              <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                  <Pie
                                    data={analytics.favoriteCategories}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  >
                                    {analytics.favoriteCategories.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={[
                                        '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'
                                      ][index % 6]} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </motion.div>
                          )}
                        </div>

                        {/* Recent Activity */}
                        {analytics.recentActivity && analytics.recentActivity.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white p-4 rounded-lg border border-gray-200"
                          >
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                            <div className="space-y-3">
                              {analytics.recentActivity.slice(0, 5).map((activity, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="font-medium text-gray-900">{activity.action}</p>
                                    <p className="text-sm text-gray-600">{activity.details}</p>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(activity.date).toLocaleDateString('en-IN')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-8 rounded-lg text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No analytics data available yet.</p>
                        <p className="text-sm text-gray-500 mt-2">Start shopping to see your analytics!</p>
                      </div>
                    )}
                  </div>

                  {/* Security Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Lock className="w-5 h-5 mr-2 text-green-600" />
                        Security
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {showPasswordForm ? 'Cancel' : 'Change Password'}
                      </button>
                    </div>
                    
                    {showPasswordForm && (
                      <form onSubmit={handlePasswordSubmit} className="bg-gray-50 p-4 sm:p-6 rounded-lg space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              minLength="6"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              minLength="6"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={passwordLoading}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {passwordLoading ? 'Changing...' : 'Change Password'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;