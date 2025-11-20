import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingCart, Trash2, TrendingDown, Store, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const WishlistPage = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    if (user && isMounted) {
      fetchWishlist();
    }
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        setWishlist([]);
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:4000/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => {
        console.log('Wishlist API error:', err.response?.status);
        return { data: { success: false, wishlist: [] } };
      });
      
      if (response.data.success && Array.isArray(response.data.wishlist)) {
        setWishlist(response.data.wishlist);
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    setRemoving(productId);
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        toast.error('Please login to continue');
        return;
      }
      
      const response = await axios.delete(`http://localhost:4000/api/wishlist/remove/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => {
        console.log('Remove wishlist API error:', err.response?.status);
        return { data: { success: false } };
      });
      
      if (response.data.success !== false) {
        setWishlist(prev => prev.filter(item => item.product._id !== productId));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = (product) => {
    const cartItem = {
      id: product._id,
      name: product.name,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice || product.originalPrice,
      image: product.images?.[0] || 'https://via.placeholder.com/300x200',
      store: product.store?.name || 'Unknown Store',
      storeId: product.store?._id,
      stock: product.stock,
      unit: product.unit
    };
    
    addToCart(cartItem);
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Logo size="large" showText={false} />
            <p className="text-gray-600 mt-4">Loading your wishlist...</p>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Logo size="medium" showText={false} />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                    <Heart className="w-8 h-8 text-red-500 mr-3" />
                    My Wishlist
                  </h1>
                  <p className="mt-1 text-gray-600 text-sm sm:text-base">
                    {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
                  </p>
                </div>
              </div>
              <Link
                to="/user/products"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>

          {/* Wishlist Items */}
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {wishlist.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-100 group"
                  >
                    <div className="relative">
                      <img
                        src={item.product.images?.[0] || 'https://via.placeholder.com/300x200'}
                        alt={item.product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      
                      {/* Discount Badge */}
                      {item.product.discountPercentage > 0 && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            {item.product.discountPercentage}% OFF
                          </span>
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromWishlist(item.product._id)}
                        disabled={removing === item.product._id}
                        className="absolute top-2 left-2 bg-white/90 hover:bg-white text-red-500 p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                      >
                        {removing === item.product._id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>

                      {/* Price Drop Indicator */}
                      {item.product.discountedPrice < item.priceWhenAdded && (
                        <div className="absolute bottom-2 left-2">
                          <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center">
                            <TrendingDown className="w-3 h-3 mr-1" />
                            Price Drop!
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                        {item.product.name}
                      </h3>
                      
                      {/* Store Info */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-blue-600 flex items-center truncate">
                          <Store className="w-4 h-4 mr-1" />
                          {item.product.store?.name}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center truncate">
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.product.store?.address?.city}, {item.product.store?.address?.state}
                        </p>
                      </div>

                      {/* Price Info */}
                      <div className="mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-green-600">
                            ₹{item.product.discountedPrice || item.product.originalPrice}
                          </span>
                          {item.product.discountedPrice < item.product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{item.product.originalPrice}
                            </span>
                          )}
                        </div>
                        
                        {/* Price Change */}
                        {item.product.discountedPrice !== item.priceWhenAdded && (
                          <div className="mt-1">
                            <span className={`text-xs font-medium ${
                              item.product.discountedPrice < item.priceWhenAdded 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {item.product.discountedPrice < item.priceWhenAdded ? '↓' : '↑'} 
                              ₹{Math.abs(item.product.discountedPrice - item.priceWhenAdded)} 
                              since added
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="mb-4 text-xs text-gray-600">
                        <p>⏰ Expires: {new Date(item.product.expiryDate).toLocaleDateString('en-IN')}</p>
                        <p>📦 Stock: {item.product.stock} {item.product.unit}</p>
                        <p>💝 Added: {new Date(item.addedAt).toLocaleDateString('en-IN')}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Link
                          to={`/product/${item.product._id}`}
                          className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-center text-sm font-medium"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleAddToCart(item.product)}
                          disabled={item.product.stock === 0}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          {item.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-6">💝</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Start adding products to your wishlist by clicking the heart icon on any product you like.
              </p>
              <Link
                to="/user/products"
                className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Heart className="w-5 h-5 mr-2" />
                Start Shopping
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WishlistPage;