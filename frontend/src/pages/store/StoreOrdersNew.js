import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  Package, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign,
  Filter,
  Search,
  Eye,
  Edit,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import Layout from '../../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';

const StoreOrders = () => {
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

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm) {
        const filtered = orders.filter(order => 
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // For now, we'll filter on frontend. In production, implement backend search
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, orders]);

  const fetchOrders = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (filter !== 'all') params.append('status', filter);
      
      const response = await axios.get(`http://localhost:4000/api/orders/store?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:4000/api/orders/${orderId}/status`, 
        { status, notes }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order status updated successfully!');
      fetchOrders(pagination.currentPage);
      setShowOrderModal(false);
      setOrderNotes('');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderNotes(order.storeNotes || '');
    setShowOrderModal(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 rounded-2xl p-8 border border-purple-100 shadow-lg"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                📋 Store Orders
              </h1>
              <p className="text-gray-600 text-lg">Manage and track your customer orders</p>
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-sm text-gray-600">{stats.pending} Pending</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">{stats.completed} Completed</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">₹{stats.totalRevenue.toLocaleString()} Revenue</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchOrders(pagination.currentPage)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order number or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 focus:bg-white"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
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
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Order #{order.orderNumber}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {order.user?.name || order.customerInfo?.name || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(order.status)}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </motion.span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border border-gray-100"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">{item.productName || item.product?.name || 'Product'}</span>
                            <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">₹{((item.totalPrice || item.price * item.quantity) || 0).toFixed(2)}</div>
                          <div className="text-sm text-gray-500">₹{(item.discountedPrice || item.price || 0).toFixed(2)} each</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">₹{(order.totalAmount || 0).toFixed(2)}</div>
                      <div className="text-sm text-gray-500">Total Amount</div>
                    </div>
                    {order.totalSavings > 0 && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">₹{(order.totalSavings || 0).toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Savings</div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {order.status === 'pending' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => viewOrderDetails(order)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1 inline" />
                          View Details
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateOrderStatus(order._id, 'confirmed')}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                        >
                          ✅ Confirm Order
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateOrderStatus(order._id, 'cancelled')}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                        >
                          ❌ Cancel
                        </motion.button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => viewOrderDetails(order)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1 inline" />
                          View Details
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateOrderStatus(order._id, 'preparing')}
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                        >
                          🍳 Start Preparing
                        </motion.button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => viewOrderDetails(order)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1 inline" />
                          View Details
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateOrderStatus(order._id, 'ready')}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                        >
                          ✅ Mark Ready
                        </motion.button>
                      </>
                    )}
                    {order.status === 'ready' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => viewOrderDetails(order)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1 inline" />
                          View Details
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateOrderStatus(order._id, 'completed')}
                          className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                        >
                          🎉 Complete
                        </motion.button>
                      </>
                    )}
                    {(order.status === 'completed' || order.status === 'cancelled') && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => viewOrderDetails(order)}
                        className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-semibold"
                      >
                        <Eye className="w-5 h-5 mr-2 inline" />
                        View Details
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
            className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 text-lg">Orders will appear here when customers place them</p>
          </motion.div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center space-x-2"
          >
            <button
              onClick={() => fetchOrders(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchOrders(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </motion.div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order #{selectedOrder.orderNumber}
                  </h2>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium">{selectedOrder.customerInfo?.name || selectedOrder.user_id?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">{selectedOrder.customerInfo?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{selectedOrder.customerInfo?.email || selectedOrder.user_id?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Order Date:</span>
                      <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{item.totalPrice}</p>
                          <p className="text-sm text-gray-600">₹{item.discountedPrice} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-600">₹{selectedOrder.totalAmount}</span>
                  </div>
                  {selectedOrder.totalSavings > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Customer Savings:</span>
                      <span className="text-sm font-semibold text-green-600">₹{selectedOrder.totalSavings}</span>
                    </div>
                  )}
                </div>

                {/* Store Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Notes (Optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add notes about this order..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {selectedOrder.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder._id, 'confirmed', orderNotes)}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                      >
                        Confirm Order
                      </button>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder._id, 'cancelled', orderNotes)}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                      >
                        Cancel Order
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder._id, 'preparing', orderNotes)}
                      className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
                    >
                      Start Preparing
                    </button>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder._id, 'ready', orderNotes)}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Mark as Ready
                    </button>
                  )}
                  {selectedOrder.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder._id, 'completed', orderNotes)}
                      className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-semibold"
                    >
                      Complete Order
                    </button>
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

export default StoreOrders;