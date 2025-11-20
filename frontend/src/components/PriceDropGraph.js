import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingDown, Award, MapPin, Clock, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const PriceDropGraph = ({ productId, productName }) => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('comparison'); // 'comparison' or 'trend'

  useEffect(() => {
    if (productId) {
      fetchPriceComparison();
    }
  }, [productId]);

  const fetchPriceComparison = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/products/${productId}/price-comparison`);
      if (response.data.success) {
        setPriceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching price comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <h4 className="font-semibold text-gray-900">{data.storeName}</h4>
          <div className="space-y-1 mt-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Original:</span> ₹{data.originalPrice}
            </p>
            <p className="text-sm text-green-600">
              <span className="font-medium">Discounted:</span> ₹{data.discountedPrice}
            </p>
            <p className="text-sm text-red-600">
              <span className="font-medium">Discount:</span> {data.discountPercent}%
            </p>
            <p className="text-sm text-blue-600">
              <span className="font-medium">You Save:</span> ₹{data.savings}
            </p>
            <p className="text-xs text-gray-500">
              <Clock className="w-3 h-3 inline mr-1" />
              Expires: {new Date(data.expiryDate).toLocaleDateString('en-IN')}
            </p>
            <p className="text-xs text-gray-500">
              <Package className="w-3 h-3 inline mr-1" />
              Stock: {data.stock} {data.unit}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const generateTrendData = (originalPrice, discountedPrice) => {
    const days = 7;
    const data = [];
    const priceStep = (originalPrice - discountedPrice) / days;
    
    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      const price = originalPrice - (priceStep * i);
      data.push({
        day: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: Math.round(price * 100) / 100,
        originalPrice: originalPrice,
        discountedPrice: i === days ? discountedPrice : price
      });
    }
    return data;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!priceData || priceData.priceComparison.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Price Data Available</h3>
        <p className="text-gray-500">Price comparison data will appear when multiple stores offer this product.</p>
      </div>
    );
  }

  const { bestDeal, priceComparison, totalStores } = priceData;
  const trendData = generateTrendData(bestDeal.originalPrice, bestDeal.discountedPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingDown className="w-6 h-6 text-green-600 mr-2" />
              Price Analysis
            </h3>
            <p className="text-gray-600 mt-1">{productName || 'Product'} • {totalStores} stores</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewType('comparison')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewType === 'comparison' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Store Comparison
            </button>
            <button
              onClick={() => setViewType('trend')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewType === 'trend' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Price Trend
            </button>
          </div>
        </div>

        {/* Best Deal Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Award className="w-5 h-5 text-green-600 mr-2" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900">
                🏆 Best Deal: {bestDeal.storeName}
              </h4>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-lg font-bold text-green-700">
                  ₹{bestDeal.originalPrice} → ₹{bestDeal.discountedPrice}
                </span>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                  {bestDeal.discountPercent}% off
                </span>
                <span className="text-sm text-green-600">
                  Save ₹{bestDeal.savings}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-600 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Expires: {new Date(bestDeal.expiryDate).toLocaleDateString('en-IN')}
              </p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {bestDeal.storeAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Content */}
      <div className="p-6">
        {viewType === 'comparison' ? (
          <motion.div
            key="comparison"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Store Price Comparison</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceComparison} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="storeName" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft' }}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="originalPrice" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                  name="Original Price"
                />
                <Line 
                  type="monotone" 
                  dataKey="discountedPrice" 
                  stroke="#10B981" 
                  strokeWidth={4}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 8 }}
                  activeDot={{ r: 10, stroke: '#10B981', strokeWidth: 3, fill: '#ffffff' }}
                  name="Discounted Price"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <motion.div
            key="trend"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Price Drop Trend - {bestDeal.storeName}
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis 
                  label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft' }}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value, name) => [`₹${value}`, 'Price']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Price dropped from <span className="font-semibold text-gray-900">₹{bestDeal.originalPrice}</span> to{' '}
                <span className="font-semibold text-green-600">₹{bestDeal.discountedPrice}</span>{' '}
                ({bestDeal.discountPercent}% discount)
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Store Details */}
      <div className="border-t border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">All Store Offers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {priceComparison.slice(0, 6).map((store, index) => (
            <motion.div
              key={store.storeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-4 ${
                index === 0 ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{store.storeName}</h5>
                {index === 0 && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    Best Deal
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Original:</span>
                  <span className="line-through text-gray-400">₹{store.originalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discounted:</span>
                  <span className="font-semibold text-green-600">₹{store.discountedPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-red-600">{store.discountPercent}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">You Save:</span>
                  <span className="font-medium text-blue-600">₹{store.savings}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {store.storeAddress}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  Expires: {new Date(store.expiryDate).toLocaleDateString('en-IN')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Prices and discounts are updated in real-time by store owners
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PriceDropGraph;