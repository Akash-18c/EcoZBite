import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        setOrders([]);
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:4000/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(err => {
        console.log('Orders API error:', err.response?.status);
        return { data: { orders: [] } };
      });
      
      if (response.data && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
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

  useEffect(() => {
    let isMounted = true;
    
    if (user && isMounted) {
      fetchOrders();
    }
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !loading) {
        fetchOrders();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, loading]);

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    console.log('Attempting to cancel order:', orderId);
    setUpdating(orderId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`http://localhost:4000/api/orders/${orderId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Cancel response:', response.data);
      toast.success('Order cancelled successfully');
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error cancelling order:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setUpdating(null);
    }
  };

  // Reorder
  const handleReorder = async (order) => {
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        items: order.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        }))
      };
      
      await axios.post('http://localhost:4000/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Order placed successfully!');
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to reorder');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = activeTab === 'all' ? orders : orders.filter(order => order.status === activeTab);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Logo size="large" showText={false} />
            <p className="text-gray-600 mt-4">Loading your orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center space-x-4">
              <Logo size="medium" showText={false} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="mt-1 text-gray-600 text-sm sm:text-base">Track and manage your orders</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
                {['all', 'pending', 'processing', 'delivered', 'cancelled'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab} ({orders.filter(order => tab === 'all' || order.status === tab).length})
                  </button>
                ))}
              </nav>
            </div>
          </div>
          {/* Orders List */}
          <div className="space-y-4 sm:space-y-6">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order {order.id}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString('en-IN')} • {order.store}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="text-lg font-bold text-gray-900">₹{order.totalAmount || order.total || 0}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.productName || item.product_id?.name || 'Product'}
                        </span>
                        <span className="text-gray-900 font-medium">₹{item.totalPrice || item.discountedPrice * item.quantity || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end mt-4 space-y-2 sm:space-y-0 sm:space-x-3">
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetails(true);
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    View Details
                  </button>
                  {order.status === 'delivered' && (
                    <button 
                      onClick={() => handleReorder(order)}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Reorder
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'processing') && (
                    (() => {
                      const orderTime = new Date(order.createdAt || order.date);
                      const now = new Date();
                      const timeDiff = (now - orderTime) / (1000 * 60); // minutes
                      const canCancel = timeDiff <= 2;
                      
                      return (
                        <button 
                          onClick={() => handleCancelOrder(order._id || order.id)}
                          disabled={!canCancel || updating === (order._id || order.id)}
                          className={`px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            canCancel 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-gray-300 text-gray-500'
                          }`}
                          title={!canCancel ? 'Cancel period expired (2 minutes)' : ''}
                        >
                          {updating === (order._id || order.id) 
                            ? 'Cancelling...' 
                            : canCancel 
                              ? `Cancel (${Math.max(0, Math.ceil(2 - timeDiff))}m left)` 
                              : 'Cancel Expired'
                          }
                        </button>
                      );
                    })()
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl sm:text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 text-sm sm:text-base">You don't have any orders in this category yet.</p>
            </div>
          )}

          {/* Order Details Modal */}
          {showDetails && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                    <button 
                      onClick={() => setShowDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Order Number</p>
                        <p className="font-medium">{selectedOrder.orderNumber || selectedOrder._id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-medium">{new Date(selectedOrder.createdAt || selectedOrder.date).toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium text-lg">₹{selectedOrder.totalAmount || selectedOrder.total || 0}</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="font-medium text-gray-900 mb-3">Items Ordered</h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.productName || item.product_id?.name || 'Product'}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity} {item.unit || 'piece'}</p>
                              <p className="text-sm text-gray-600">Price per item: ₹{item.discountedPrice || item.originalPrice || 0}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{item.totalPrice || (item.discountedPrice * item.quantity) || 0}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {selectedOrder.customerInfo && (
                      <div className="border-t pt-4">
                        <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p><span className="font-medium">Name:</span> {selectedOrder.customerInfo.name}</p>
                          <p><span className="font-medium">Phone:</span> {selectedOrder.customerInfo.phone}</p>
                          <p><span className="font-medium">Email:</span> {selectedOrder.customerInfo.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button 
                      onClick={() => setShowDetails(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage;