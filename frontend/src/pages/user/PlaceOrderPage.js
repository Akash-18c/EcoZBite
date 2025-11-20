import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { TrendingDown, MapPin, Clock, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const PlaceOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const [productResponse, productsResponse] = await Promise.all([
        axios.get(`http://localhost:4000/api/products/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:4000/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (productResponse.data) {
        const productData = productResponse.data;
        setProduct(productData);
        
        // Generate mock price history for demonstration
        const history = generatePriceHistory(productData.originalPrice, productData.discountedPrice);
        setPriceHistory(history);
        
        // Find similar products
        const similar = productsResponse.data.products
          ?.filter(p => p.category === productData.category && p._id !== productData._id)
          .slice(0, 3) || [];
        setSimilarProducts(similar);
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/user/products');
    } finally {
      setLoading(false);
    }
  };

  const generatePriceHistory = (originalPrice, discountedPrice) => {
    const days = 7;
    const history = [];
    const priceStep = (originalPrice - discountedPrice) / days;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const price = originalPrice - (priceStep * (days - i));
      history.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: Math.round(price)
      });
    }
    return history;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login to place order');
      return;
    }

    if (quantity > product.stock) {
      toast.error('Insufficient stock available');
      return;
    }

    setPlacing(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        items: [{
          product_id: product._id,
          quantity: quantity
        }],
        customerInfo: {
          name: user.name,
          phone: user.phone || '+91-9876543210',
          email: user.email
        }
      };

      console.log('Order data:', orderData);
      
      const response = await axios.post('http://localhost:4000/api/orders', orderData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to place order';
      toast.error(errorMessage);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
            <button 
              onClick={() => navigate('/user/products')}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Back to Products
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const discountedPrice = product.discountedPrice || product.originalPrice;
  const totalPrice = discountedPrice * quantity;
  const savings = (product.originalPrice - discountedPrice) * quantity;
  const discountPercentage = Math.round(((product.originalPrice - discountedPrice) / product.originalPrice) * 100);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Place Order</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Details */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/400x300'}
                        alt={product.name}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                      
                      {/* Store Information */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Store Information</h4>
                        <p className="text-sm text-blue-800">🏪 {product.store?.name}</p>
                        <p className="text-sm text-blue-700">
                          📍 {product.store?.address?.city}, {product.store?.address?.state}
                        </p>
                        <p className="text-sm text-blue-700">📞 {product.store?.contact?.phone}</p>
                        {product.store?.address?.coordinates && (
                          <a
                            href={`https://maps.google.com/maps?q=${product.store.address.coordinates.lat},${product.store.address.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-2"
                          >
                            <MapPin className="w-4 h-4 mr-1" />
                            View on Map
                          </a>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h2>
                      <p className="text-gray-600 mb-4">{product.description}</p>
                      
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="text-2xl font-bold text-green-600">₹{discountedPrice}</span>
                        {discountedPrice < product.originalPrice && (
                          <>
                            <span className="text-lg text-gray-400 line-through">₹{product.originalPrice}</span>
                            <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                              {discountPercentage}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Category:</span> {product.category}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          <span className="font-medium">Stock:</span> {product.stock} {product.unit} available
                        </p>
                        <p className="text-sm text-orange-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="font-medium">Expires:</span> {new Date(product.expiryDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>

                      {/* Price History Graph */}
                      {priceHistory.length > 0 && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                            <TrendingDown className="w-4 h-4 mr-1" />
                            Price Trend (Last 7 Days)
                          </h4>
                          <div className="relative h-24">
                            <svg className="w-full h-full" viewBox="0 0 300 80">
                              <defs>
                                <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
                                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.1"/>
                                </linearGradient>
                              </defs>
                              {priceHistory.map((point, index) => {
                                const x = (index / (priceHistory.length - 1)) * 280 + 10;
                                const maxPrice = Math.max(...priceHistory.map(p => p.price));
                                const minPrice = Math.min(...priceHistory.map(p => p.price));
                                const y = 70 - ((point.price - minPrice) / (maxPrice - minPrice)) * 60;
                                
                                return (
                                  <g key={index}>
                                    {index > 0 && (
                                      <line
                                        x1={(index - 1) / (priceHistory.length - 1) * 280 + 10}
                                        y1={70 - ((priceHistory[index - 1].price - minPrice) / (maxPrice - minPrice)) * 60}
                                        x2={x}
                                        y2={y}
                                        stroke="#10B981"
                                        strokeWidth="2"
                                      />
                                    )}
                                    <circle cx={x} cy={y} r="3" fill="#10B981" />
                                  </g>
                                );
                              })}
                            </svg>
                          </div>
                          <div className="flex justify-between text-xs text-yellow-700 mt-2">
                            <span>{priceHistory[0]?.date}</span>
                            <span className="font-medium">₹{product.originalPrice} → ₹{discountedPrice}</span>
                            <span>{priceHistory[priceHistory.length - 1]?.date}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Similar Products */}
                  {similarProducts.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Products</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {similarProducts.map(similar => (
                          <div key={similar._id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                            <img
                              src={similar.images?.[0] || 'https://via.placeholder.com/150x100'}
                              alt={similar.name}
                              className="w-full h-24 object-cover rounded mb-2"
                            />
                            <h4 className="font-medium text-sm text-gray-900 truncate">{similar.name}</h4>
                            <p className="text-xs text-gray-600 truncate">🏪 {similar.store?.name}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm font-bold text-green-600">
                                ₹{similar.discountedPrice || similar.originalPrice}
                              </span>
                              {similar.discountedPrice && similar.discountedPrice < similar.originalPrice && (
                                <span className="text-xs text-red-600">
                                  {Math.round(((similar.originalPrice - similar.discountedPrice) / similar.originalPrice) * 100)}% off
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Form */}
                <div>
                  <div className="bg-gray-50 p-6 rounded-lg sticky top-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price per item:</span>
                        <span className="font-medium">₹{discountedPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{quantity}</span>
                      </div>
                      {savings > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>You save:</span>
                          <span className="font-medium">₹{savings}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span className="text-green-600">₹{totalPrice}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Address</h4>
                      <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                        {user?.address ? (
                          <div>
                            <p>{user.address.street}</p>
                            <p>{user.address.city}, {user.address.state} {user.address.zipCode}</p>
                          </div>
                        ) : (
                          <p>Default Address, Mumbai, Maharashtra 400001</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={placing || product.stock < quantity}
                      className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {placing ? 'Placing Order...' : `Place Order - ₹${totalPrice}`}
                    </button>

                    <button
                      onClick={() => navigate('/user/products')}
                      className="w-full mt-3 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Back to Products
                    </button>
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

export default PlaceOrderPage;