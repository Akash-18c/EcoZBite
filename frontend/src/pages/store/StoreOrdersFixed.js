import React, { useState, useEffect } from 'react';
import { ShoppingCart, Clock, CheckCircle, Package, User, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const StoreOrdersFixed = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    
    if (user && user.role === 'store_owner' && isMounted) {
      fetchOrders();
    } else if (isMounted) {
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [filter, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || !user || user.role !== 'store_owner') {
        setOrders([]);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      
      const response = await axios.get(`http://localhost:4000/api/orders/store?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: { success: false, orders: [] } }));
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const response = await axios.patch(`http://localhost:4000/api/orders/${orderId}/status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Order status updated successfully!');
        fetchOrders();
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg p-6 shadow border">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Link 
                  to="/store/dashboard"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Store Orders</h1>
                  <p className="text-gray-600">Manage and track your customer orders</p>
                </div>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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

          {/* Orders List */}
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow border">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">Orders will appear here when customers place them</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>{order.user?.name || order.customerInfo?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div 
                          key={index}
                          className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Package className="w-4 h-4 text-green-600" />
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
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">₹{(order.totalAmount || 0).toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Total Amount</div>
                      </div>
                      {order.totalSavings > 0 && (
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-600">₹{(order.totalSavings || 0).toFixed(2)}</div>
                          <div className="text-sm text-gray-500">Savings</div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order._id, 'confirmed')}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                          >
                            Confirm Order
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order._id, 'cancelled')}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'preparing')}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'ready')}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'completed')}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StoreOrdersFixed;