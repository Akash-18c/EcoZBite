import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, DollarSign, Clock } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

const StoreDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'store_owner') {
      setLoading(false);
      return;
    }
    
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch products
      const productsRes = await fetch('http://localhost:4000/api/products/my-products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch orders
      const ordersRes = await fetch('http://localhost:4000/api/orders/store', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let products = [];
      let orders = [];
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        if (productsData.success) {
          products = productsData.products || [];
        }
      }
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          orders = ordersData.orders || [];
        }
      }

      // Calculate stats
      const revenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      const pendingOrders = orders.filter(order => order.status === 'pending').length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        revenue: revenue,
        pendingOrders: pendingOrders,
        recentOrders: orders.slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        revenue: 0,
        pendingOrders: 0,
        recentOrders: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 shadow border">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}</p>
                <p className="text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <ShoppingCart className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-gray-600">Total Orders</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-gray-600">Active Products</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                <p className="text-gray-600">Pending Orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg p-6 shadow border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Recent Orders</h3>
            <button
              onClick={() => window.location.href = '/store/orders'}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          
          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h4>
              <p className="text-gray-500">Orders will appear here when customers place them</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order, index) => (
                <div 
                  key={order._id || index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">#{order.orderNumber || 'N/A'}</p>
                      <p className="text-sm text-gray-600">
                        {order.customerInfo?.name || order.user_id?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{order.totalAmount || 0}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => window.location.href = '/store/products'}
            className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow text-left"
          >
            <Package className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Products</h3>
            <p className="text-gray-600">Add, edit, or remove products from your store</p>
          </button>
          
          <button
            onClick={() => window.location.href = '/store/orders'}
            className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow text-left"
          >
            <ShoppingCart className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Orders</h3>
            <p className="text-gray-600">Process and manage customer orders</p>
          </button>
          
          <button
            onClick={() => window.location.href = '/store/profile'}
            className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow text-left"
          >
            <DollarSign className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Store Settings</h3>
            <p className="text-gray-600">Update store information and settings</p>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default StoreDashboard;