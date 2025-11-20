import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { 
  User, 
  Store as StoreIcon, 
  Lock, 
  MapPin, 
  Phone, 
  Mail, 
  Eye, 
  EyeOff,
  CheckCircle,
  ArrowLeft,
  Building,
  Globe
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StoreProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    logo: ''
  });
  const [storeStats, setStoreStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        description: user.description || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      fetchStoreData();
    }
  }, [user]);

  const fetchStoreData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const [storeRes, analyticsRes] = await Promise.all([
        axios.get('http://localhost:4000/api/stores/my/store', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch((error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          return { data: null };
        }),
        axios.get('http://localhost:4000/api/stores/my/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { success: false, analytics: { totalProducts: 0, totalOrders: 0, revenue: 0 } } }))
      ]);
      
      if (storeRes.data) {
        setStoreData(storeRes.data);
      }
      
      if (analyticsRes.data.success) {
        setStoreStats(analyticsRes.data.analytics);
      } else {
        setStoreStats({ totalProducts: 0, totalOrders: 0, revenue: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch store data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error('Failed to load store data');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStoreInputChange = (field, value, subField = null) => {
    if (subField) {
      setStoreData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subField]: value
        }
      }));
    } else {
      setStoreData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        description: formData.description
      };

      const response = await axios.put('http://localhost:4000/api/auth/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.user) {
        updateUser(response.data.user);
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:4000/api/stores/my/store/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Password changed successfully!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:4000/api/stores/my/store', storeData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Store information updated successfully!');
        fetchStoreData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update store information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <Link 
                  to="/store/dashboard"
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                    Profile Settings
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">Manage your personal and store information</p>
                </div>
              </div>
              
              <div className="hidden lg:flex items-center gap-6">
                <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="text-2xl font-bold text-emerald-600">{storeStats.totalProducts || 0}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="text-2xl font-bold text-green-600">{storeStats.totalOrders || 0}</div>
                  <div className="text-sm text-gray-600">Orders</div>
                </div>
                <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="text-2xl font-bold text-teal-600">₹{(storeStats.revenue || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-lg"
          >
            <nav className="flex flex-col sm:flex-row gap-2">
              {[
                { id: 'profile', label: 'Personal Info', icon: User },
                { id: 'store', label: 'Store Info', icon: StoreIcon },
                { id: 'password', label: 'Security', icon: Lock }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center sm:justify-start px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Personal Info Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 shadow-lg"
            >
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white/80 backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white/80 backdrop-blur-sm"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Store Info Tab */}
          {activeTab === 'store' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 shadow-lg"
            >
              <div className="flex items-center mb-6">
                <StoreIcon className="w-6 h-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Store Information</h2>
              </div>
              <form onSubmit={handleStoreUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={storeData.name}
                      onChange={(e) => handleStoreInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/80 backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={storeData.contact?.phone || ''}
                      onChange={(e) => handleStoreInputChange('contact', e.target.value, 'phone')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/80 backdrop-blur-sm"
                      placeholder="Store phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={storeData.contact?.email || ''}
                      onChange={(e) => handleStoreInputChange('contact', e.target.value, 'email')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/80 backdrop-blur-sm"
                      placeholder="Store email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Website
                    </label>
                    <input
                      type="url"
                      value={storeData.contact?.website || ''}
                      onChange={(e) => handleStoreInputChange('contact', e.target.value, 'website')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/80 backdrop-blur-sm"
                      placeholder="https://yourstore.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={storeData.address?.street || ''}
                      onChange={(e) => handleStoreInputChange('address', e.target.value, 'street')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/80 backdrop-blur-sm"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Building className="w-4 h-4 inline mr-1" />
                      City
                    </label>
                    <input
                      type="text"
                      value={storeData.address?.city || ''}
                      onChange={(e) => handleStoreInputChange('address', e.target.value, 'city')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/80 backdrop-blur-sm"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={storeData.address?.state || ''}
                      onChange={(e) => handleStoreInputChange('address', e.target.value, 'state')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/80 backdrop-blur-sm"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={storeData.address?.zipCode || ''}
                      onChange={(e) => handleStoreInputChange('address', e.target.value, 'zipCode')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/80 backdrop-blur-sm"
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={storeData.description}
                    onChange={(e) => handleStoreInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/80 backdrop-blur-sm"
                    placeholder="Describe your store..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg"
                >
                  {loading ? 'Updating...' : 'Update Store Info'}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 shadow-lg"
            >
              <div className="flex items-center mb-6">
                <Lock className="w-6 h-6 text-red-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white/80 backdrop-blur-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white/80 backdrop-blur-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white/80 backdrop-blur-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-red-700 hover:to-pink-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg"
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </motion.button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StoreProfile;