import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import LocationMap from '../../components/LocationMap';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const UserDashboard = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    totalSaved: 0,
    orders: 0,
    foodSaved: 0,
    activeDeals: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchUserData = async () => {
      if (!user || !isMounted) {
        if (isMounted) setLoading(false);
        return;
      }
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          if (isMounted) {
            setUserStats({ totalSaved: 0, orders: 0, foodSaved: 0, activeDeals: 0 });
            setRecentOrders([]);
            setLoading(false);
          }
          return;
        }
        
        const [statsResponse, ordersResponse] = await Promise.all([
          axios.get('http://localhost:4000/api/analytics/user-stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(err => {
            console.log('Stats API error:', err.response?.status);
            return { data: { success: false, stats: { totalSaved: 0, orders: 0, foodSaved: 0, activeDeals: 0 } } };
          }),
          axios.get('http://localhost:4000/api/orders/my-orders?limit=3', {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(err => {
            console.log('Orders API error:', err.response?.status);
            return { data: { orders: [] } };
          })
        ]);
        
        if (isMounted) {
          if (statsResponse.data.success) {
            setUserStats(statsResponse.data.stats);
          } else {
            setUserStats({ totalSaved: 0, orders: 0, foodSaved: 0, activeDeals: 0 });
          }
          
          if (ordersResponse.data.orders && Array.isArray(ordersResponse.data.orders)) {
            const formattedOrders = ordersResponse.data.orders.map(order => ({
              id: order._id,
              storeName: order.store?.name || 'EcoZBite Store',
              items: order.items?.map(item => item.product?.name).join(', ') || 'No items',
              amount: `₹${order.total || 0}`,
              status: order.status || 'pending',
              time: new Date(order.createdAt).toLocaleDateString('en-IN'),
              color: order.status === 'delivered' ? 'bg-green-500' : 
                     order.status === 'processing' ? 'bg-blue-500' : 'bg-orange-500'
            }));
            setRecentOrders(formattedOrders);
          } else {
            setRecentOrders([]);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (isMounted) {
          setUserStats({ totalSaved: 0, orders: 0, foodSaved: 0, activeDeals: 0 });
          setRecentOrders([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  const stats = [
    {
      title: 'Total Saved',
      value: `₹${(userStats.totalSaved || 0).toLocaleString()}`,
      color: 'from-green-400 to-green-600'
    },
    {
      title: 'Orders',
      value: (userStats.orders || 0).toString(),
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: 'Food Saved',
      value: `${userStats.foodSaved || 0} kg`,
      color: 'from-emerald-400 to-emerald-600'
    },
    {
      title: 'Active Deals',
      value: (userStats.activeDeals || 0).toString(),
      color: 'from-orange-400 to-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Browse Products',
      description: 'Find great deals on fresh products',
      path: '/user/products',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'View Orders',
      description: 'Track your recent purchases',
      path: '/orders',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Update Profile',
      description: 'Manage your account settings',
      path: '/profile',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Logo size="large" showText={false} />
            <p className="text-gray-600 mt-4">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Logo size="medium" showText={false} />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                      Here's what's happening with your EcoZBite account today.
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-500">Member since</p>
                  <p className="text-lg font-semibold text-green-600">
                    {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">
                        {stat.title}
                      </p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-3 h-12 rounded-full bg-gradient-to-b ${stat.color} shadow-sm`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Location Map */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <LocationMap />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Quick Actions
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                      Get started with these common tasks
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                      <Link
                        key={index}
                        to={action.path}
                        className="group block"
                      >
                        <div className="p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-br from-white to-gray-50">
                          <div className={`w-full h-2 rounded-full bg-gradient-to-r ${action.color} mb-4`}></div>
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors text-sm sm:text-base">
                            {action.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {action.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Recent Orders
                    </h2>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {recentOrders.map((order, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                        <div className={`w-3 h-3 rounded-full ${order.color} mt-2 flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {order.storeName}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {order.items} • {order.amount}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {order.status}
                            </span>
                            <p className="text-xs text-gray-500">
                              {order.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/orders"
                    className="block mt-4 text-center text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    View All Orders →
                  </Link>
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-100 p-6 sm:p-8">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <span className="text-white text-2xl sm:text-3xl">🌍</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  Your Environmental Impact
                </h3>
                <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
                  By shopping with EcoZBite, you've helped reduce food waste and contributed to a more sustainable future.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
                  <div className="text-center bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">{userStats.foodSaved} kg</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Food Saved</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">{(userStats.foodSaved * 2.3).toFixed(1)} kg</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">CO₂ Reduced</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">₹{userStats.totalSaved.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Money Saved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;