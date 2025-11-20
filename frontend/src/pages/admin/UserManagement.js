import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Shield, 
  ShieldOff, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  Activity
} from 'lucide-react';
import Layout from '../../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('customers');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, activeTab, statusFilter, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const [customersRes, storeOwnersRes] = await Promise.all([
        axios.get('http://localhost:4000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
          params: { role: 'customer', search: searchTerm, status: statusFilter, limit: 50 }
        }),
        axios.get('http://localhost:4000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
          params: { search: searchTerm, status: statusFilter, limit: 50 }
        })
      ]);

      setCustomers(customersRes.data.users || []);
      // Combine store owners and admins
      const allStoreOwners = (storeOwnersRes.data.users || []).filter(u => u.role === 'admin' || u.role === 'store_owner');
      setStoreOwners(allStoreOwners);
      
      const currentUsers = activeTab === 'customers' ? customersRes.data.users : allStoreOwners;
      setUsers(currentUsers || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, updates) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:4000/api/admin/users/${userId}/status`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`User ${updates.isActive ? 'unblocked' : 'blocked'} successfully`, {
        icon: updates.isActive ? '✅' : '🚫',
        duration: 3000
      });
      fetchUsers();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const getCurrentUsers = () => {
    switch(activeTab) {
      case 'customers': return customers;
      case 'storeOwners': return storeOwners;
      default: return customers;
    }
  };

  const getTabCount = (tab) => {
    switch(tab) {
      case 'customers': return customers.length;
      case 'storeOwners': return storeOwners.length;
      default: return 0;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'store_owner':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (user) => {
    if (!user.isEmailVerified) return 'bg-yellow-100 text-yellow-800';
    if (!user.isActive) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (user) => {
    if (!user.isEmailVerified) return 'Pending Verification';
    if (!user.isActive) return 'Blocked';
    return 'Active';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                👥 User Management
              </h1>
              <p className="text-gray-600 text-lg">Manage customers, store owners, and administrators</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{customers.length + storeOwners.length}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{customers.length}</div>
                <div className="text-sm text-gray-500">Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{storeOwners.length}</div>
                <div className="text-sm text-gray-500">Store Owners & Admins</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'customers', label: '👤 Customers', color: 'blue' },
              { key: 'storeOwners', label: '🏪 Store Owners & Admins', color: 'purple' }
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab(tab.key);
                  setUsers(getCurrentUsers());
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? `bg-${tab.color}-100 text-${tab.color}-700 border border-${tab.color}-200 shadow-sm`
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.key ? `bg-${tab.color}-200` : 'bg-gray-200'
                }`}>
                  {getTabCount(tab.key)}
                </span>
              </motion.button>
            ))}
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="active">✅ Active</option>
                <option value="blocked">❌ Blocked</option>
                <option value="pending">⏳ Pending</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {getCurrentUsers().length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">No users match your current filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence mode="wait">
                {getCurrentUsers().map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role.replace('_', ' ')}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user)}`}>
                              {getStatusText(user)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {user.email}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                            {user.lastLogin && (
                              <div className="flex items-center">
                                <Activity className="w-4 h-4 mr-1" />
                                Last seen {new Date(user.lastLogin).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        {user.isActive ? (
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            animate={actionLoading === user._id ? { rotate: 360 } : {}}
                            transition={{ duration: actionLoading === user._id ? 1 : 0.2 }}
                            onClick={() => updateUserStatus(user._id, { isActive: false })}
                            disabled={actionLoading === user._id}
                            className="relative p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group overflow-hidden"
                            title="Block User"
                          >
                            <motion.div
                              className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                              initial={false}
                              animate={{ scale: actionLoading === user._id ? [1, 1.2, 1] : 1 }}
                              transition={{ duration: 0.6, repeat: actionLoading === user._id ? Infinity : 0 }}
                            />
                            {actionLoading === user._id ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <ShieldOff className="w-5 h-5" />
                              </motion.div>
                            ) : (
                              <ShieldOff className="w-5 h-5 group-hover:drop-shadow-lg" />
                            )}
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            whileTap={{ scale: 0.9 }}
                            animate={actionLoading === user._id ? { rotate: 360 } : {}}
                            transition={{ duration: actionLoading === user._id ? 1 : 0.2 }}
                            onClick={() => updateUserStatus(user._id, { isActive: true })}
                            disabled={actionLoading === user._id}
                            className="relative p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 group overflow-hidden"
                            title="Unblock User"
                          >
                            <motion.div
                              className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                              initial={false}
                              animate={{ scale: actionLoading === user._id ? [1, 1.2, 1] : 1 }}
                              transition={{ duration: 0.6, repeat: actionLoading === user._id ? Infinity : 0 }}
                            />
                            {actionLoading === user._id ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Shield className="w-5 h-5" />
                              </motion.div>
                            ) : (
                              <Shield className="w-5 h-5 group-hover:drop-shadow-lg" />
                            )}
                          </motion.button>
                        )}
                        {!user.isEmailVerified && (
                          <motion.button
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateUserStatus(user._id, { isEmailVerified: true })}
                            className="relative p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group overflow-hidden"
                            title="Verify Email"
                          >
                            <motion.div
                              className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                            />
                            <CheckCircle className="w-5 h-5 group-hover:drop-shadow-lg" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <div className="flex space-x-2 bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    page === pagination.currentPage
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-2xl">
                        {selectedUser.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                      <p className="text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all duration-200"
                  >
                    <XCircle className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role.replace('_', ' ')}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(selectedUser)}`}>
                        {getStatusText(selectedUser)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Joined Date</label>
                      <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email Verified</label>
                      <p className="text-gray-900">{selectedUser.isEmailVerified ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Active</label>
                      <p className="text-gray-900">{selectedUser.isActive ? 'Yes' : 'No'}</p>
                    </div>
                    {selectedUser.lastLogin && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Login</label>
                        <p className="text-gray-900">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                  {selectedUser.isActive ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateUserStatus(selectedUser._id, { isActive: false })}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <ShieldOff className="w-4 h-4 mr-2" />
                      Block User
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateUserStatus(selectedUser._id, { isActive: true })}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Unblock User
                    </motion.button>
                  )}
                  {!selectedUser.isEmailVerified && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateUserStatus(selectedUser._id, { isEmailVerified: true })}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Email
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default UserManagement;