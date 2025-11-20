import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, 
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
  Package,
  ShoppingCart
} from 'lucide-react';
import Layout from '../../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStore, setSelectedStore] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchStores();
  }, [searchTerm, statusFilter, pagination.currentPage]);

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/admin/stores', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.currentPage,
          limit: 10,
          search: searchTerm,
          status: statusFilter
        }
      });

      if (response.data.success) {
        setStores(response.data.stores);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          total: response.data.total
        });
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const updateStoreStatus = async (storeId, isActive) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:4000/api/admin/stores/${storeId}/status`, 
        { isActive }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Store status updated successfully');
      fetchStores();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating store status:', error);
      toast.error('Failed to update store status');
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
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
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                🏪 Store Management
              </h1>
              <p className="text-gray-600 text-lg">Manage and monitor all stores on the platform</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{pagination.total}</div>
                <div className="text-sm text-gray-500">Total Stores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {stores.filter(s => s.isActive).length}
                </div>
                <div className="text-sm text-gray-500">Active Stores</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by store name or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 focus:bg-white transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="active">✅ Active</option>
                <option value="inactive">❌ Inactive</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stores List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {stores.length === 0 ? (
            <div className="text-center py-16">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No stores found</h3>
              <p className="text-gray-600">No stores match your current filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {stores.map((store, index) => (
                  <motion.div
                    key={store._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                          <Store className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(store.isActive)}`}>
                              {getStatusText(store.isActive)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {store?.address?.city || 'N/A'}, {store?.address?.state || 'N/A'}
                            </div>
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {store?.owner?.email || 'N/A'}
                            </div>
                            <div className="flex items-center">
                              <Package className="w-4 h-4 mr-1" />
                              {store?.productCount || 0} products
                            </div>
                            <div className="flex items-center">
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              {store?.orderCount || 0} orders
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedStore(store);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        {store.isActive ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateStoreStatus(store._id, false)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Deactivate Store"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateStoreStatus(store._id, true)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                            title="Activate Store"
                          >
                            <Shield className="w-4 h-4" />
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
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
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

      {/* Store Detail Modal */}
      <AnimatePresence>
        {showModal && selectedStore && (
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
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                      <Store className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedStore.name}</h2>
                      <p className="text-gray-600">Owner: {selectedStore.owner?.name}</p>
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
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(selectedStore.isActive)}`}>
                        {getStatusText(selectedStore.isActive)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Owner Email</label>
                      <p className="text-gray-900">{selectedStore.owner?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created Date</label>
                      <p className="text-gray-900">{new Date(selectedStore.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Products</label>
                      <p className="text-gray-900">{selectedStore.productCount || 0} products</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Orders</label>
                      <p className="text-gray-900">{selectedStore.orderCount || 0} orders</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900">
                        {selectedStore.address?.street}, {selectedStore.address?.city}, {selectedStore.address?.state} {selectedStore.address?.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                  {selectedStore.isActive ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateStoreStatus(selectedStore._id, false)}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <ShieldOff className="w-4 h-4 mr-2" />
                      Deactivate Store
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateStoreStatus(selectedStore._id, true)}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Activate Store
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

export default StoreManagement;