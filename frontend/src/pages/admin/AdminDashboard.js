import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Store, 
  Package, 
  ShoppingCart, 
  Mail, 
  TrendingUp, 
  Activity,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Layout from '../../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingMessages: 0,
    revenue: 0,
    activeUsers: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const [statsRes, ordersRes, messagesRes] = await Promise.all([
        axios.get('http://localhost:4000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { totalUsers: 0, totalStores: 0, totalProducts: 0, totalOrders: 0, revenue: 0, activeUsers: 0 } })),
        axios.get('http://localhost:4000/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 5 }
        }).catch(() => ({ data: { orders: [] } })),
        axios.get('http://localhost:4000/api/contact', {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'pending', limit: 5 }
        }).catch(() => ({ data: { total: 0 } }))
      ]);

      const statsData = statsRes.data || {};
      const ordersData = ordersRes.data || {};
      const messagesData = messagesRes.data || {};

      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalStores: statsData.totalStores || 0,
        totalProducts: statsData.totalProducts || 0,
        totalOrders: statsData.totalOrders || 0,
        revenue: statsData.revenue || 0,
        activeUsers: statsData.activeUsers || 0,
        recentOrders: ordersData.orders || [],
        pendingMessages: messagesData.total || 0
      });

      // Generate chart data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          orders: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 5000) + 1000
        };
      }).reverse();

      setChartData(last7Days);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Set default values to prevent crashes
      setStats({
        totalUsers: 0,
        totalStores: 0,
        totalProducts: 0,
        totalOrders: 0,
        revenue: 0,
        activeUsers: 0,
        recentOrders: [],
        pendingMessages: 0
      });
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Stores',
      value: stats.totalStores,
      icon: Store,
      color: 'green',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'purple',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'orange',
      change: '+23%',
      changeType: 'positive'
    }
  ];

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
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with EcoZBite today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹{stats.revenue?.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Today's Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.activeUsers}</div>
                <div className="text-sm text-gray-500">Active Users</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${card.color}-100 rounded-xl flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  card.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {card.change}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value?.toLocaleString()}</h3>
                <p className="text-gray-600 text-sm">{card.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Orders Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Orders Overview</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Revenue Trend</h3>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Orders</h3>
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div className="space-y-4">
              {(stats.recentOrders || []).slice(0, 5).map((order, index) => (
                <div key={order?._id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order #{order?.orderNumber || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{order?.user_id?.name || 'Unknown Customer'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{order?.totalAmount || 0}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order?.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order?.status || 'unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Pending Messages</span>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {stats.pendingMessages}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Active Stores</span>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {stats.totalStores}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Total Users</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {stats.totalUsers}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;