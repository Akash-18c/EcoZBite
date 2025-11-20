import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  Package, 
  User, 
  Calendar, 
  DollarSign,
  Search,
  Eye,
  RefreshCw,
  X,
  ArrowLeft,
  Filter,
  FileText,
  Download
} from 'lucide-react';
import Layout from '../../components/Layout';
import InvoiceGenerator from '../../components/InvoiceGenerator';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const StoreOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    totalRevenue: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [storeInfo, setStoreInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    if (user && user.role === 'store_owner' && isMounted) {
      fetchOrders();
      fetchStoreInfo();
    } else if (user && user.role !== 'store_owner' && isMounted) {
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [filter, user]);

  const fetchStoreInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user || user.role !== 'store_owner') {
        return;
      }
      
      const response = await axios.get('http://localhost:4000/api/stores/my/store', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        console.log('Store info API error:', err.response?.status);
        return { data: null };
      });
      
      if (response.data) {
        setStoreInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
    }
  };

  useEffect(() => {
    if (user && orders.length > 0) {
      const delayedSearch = setTimeout(() => {
        const filtered = orders.filter(order => 
          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }, 300);
      return () => clearTimeout(delayedSearch);
    }
  }, [searchTerm, orders, user]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || !user || user.role !== 'store_owner') {
        setOrders([]);
        setStats({ pending: 0, completed: 0, totalRevenue: 0 });
        setPagination({ currentPage: 1, totalPages: 1, total: 0 });
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (filter !== 'all') params.append('status', filter);
      
      const response = await axios.get(`http://localhost:4000/api/orders/store?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        console.log('Store orders API error:', err.response?.status);
        return { 
          data: { 
            success: false, 
            orders: [], 
            stats: { pending: 0, completed: 0, totalRevenue: 0 },
            pagination: { currentPage: 1, totalPages: 1, total: 0 }
          } 
        };
      });
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
        setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, total: 0 });
        setStats(response.data.stats || { pending: 0, completed: 0, totalRevenue: 0 });
      } else {
        setOrders([]);
        setStats({ pending: 0, completed: 0, totalRevenue: 0 });
        setPagination({ currentPage: 1, totalPages: 1, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setStats({ pending: 0, completed: 0, totalRevenue: 0 });
      setPagination({ currentPage: 1, totalPages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const response = await axios.patch(`http://localhost:4000/api/orders/${orderId}/status`, 
        { status, notes }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Order status updated successfully!');
        fetchOrders(pagination.currentPage);
        setShowOrderModal(false);
        setOrderNotes('');
      } else {
        toast.error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        toast.error('Access denied. You are not authorized to perform this action.');
      } else if (error.response?.status === 404) {
        toast.error('Order not found.');
      } else {
        toast.error(error.response?.data?.message || 'Server error while updating order status');
      }
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderNotes(order.storeNotes || '');
    setShowOrderModal(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ready': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== 'store_owner') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need to be a store owner to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-emerald-100"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link 
              to="/store/dashboard"
              className="p-2 hover:bg-white/60 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
                Store Orders
              </h1>
              <p className="text-gray-600 text-sm sm:text-lg">Manage and track your customer orders</p>
            </div>
          </div>
          <motion.select
            whileHover={{ scale: 1.02 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm text-sm sm:text-base"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </motion.select>
        </div>
      </motion.div>

      {/* Orders Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6"
      >
        <AnimatePresence>
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-xl hover:bg-white transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">
                      Order #{order.orderNumber}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{order.user?.name || order.customerInfo?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap ${getStatusColor(order.status)}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </motion.span>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-emerald-50/30 rounded-xl p-3 sm:p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center text-sm sm:text-base">
                  <Package className="w-4 h-4 mr-2" />
                  Order Items
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {order.items?.map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-3 px-3 sm:px-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-900 text-sm sm:text-base block truncate">{item.productName || item.product?.name || 'Product'}</span>
                          <div className="text-xs sm:text-sm text-gray-500">Quantity: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-gray-900 text-sm sm:text-base">₹{((item.totalPrice || item.price * item.quantity) || 0).toFixed(2)}</div>
                        <div className="text-xs sm:text-sm text-gray-500">₹{(item.discountedPrice || item.price || 0).toFixed(2)} each</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-emerald-600">₹{(order.totalAmount || 0).toFixed(2)}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Total Amount</div>
                  </div>
                  {order.totalSavings > 0 && (
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-orange-600">₹{(order.totalSavings || 0).toFixed(2)}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Savings</div>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
                  {/* Invoice Generation */}
                  {(order.status === 'completed' || order.status === 'ready') && storeInfo && (
                    <div className="w-full mb-3">
                      <InvoiceGenerator 
                        order={order} 
                        store={storeInfo}
                        onClose={() => {}}
                      />
                    </div>
                  )}
                  
                  {order.status === 'pending' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateOrderStatus(order._id, 'confirmed')}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                      >
                        Confirm Order
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                      >
                        Cancel
                      </motion.button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateOrderStatus(order._id, 'preparing')}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                    >
                      Start Preparing
                    </motion.button>
                  )}
                  {order.status === 'preparing' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateOrderStatus(order._id, 'ready')}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                    >
                      Mark Ready
                    </motion.button>
                  )}
                  {order.status === 'ready' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateOrderStatus(order._id, 'completed')}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                    >
                      Complete
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

          {filteredOrders.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 sm:py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 text-sm sm:text-lg px-4">Orders will appear here when customers place them</p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StoreOrders;