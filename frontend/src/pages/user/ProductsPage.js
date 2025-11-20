import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, TrendingDown, MapPin, Store, Heart, Award, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const ProductsPage = () => {
  const { user } = useAuth();
  const { addToCart, getCartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [stores, setStores] = useState([]);
  const [priceComparisons, setPriceComparisons] = useState({});
  const [wishlist, setWishlist] = useState(new Set());
  const [recommendations, setRecommendations] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showRecommendations, setShowRecommendations] = useState(true);

  const categories = ['All', 'Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery'];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using default location');
          setUserLocation({
            latitude: 19.0760,
            longitude: 72.8777
          });
        }
      );
    } else {
      setUserLocation({
        latitude: 19.0760,
        longitude: 72.8777
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    if (user && isMounted) {
      fetchWishlist();
      fetchRecommendations();
    }
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        setWishlist(new Set());
        return;
      }
      
      const response = await axios.get('http://localhost:4000/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => {
        console.log('Wishlist API error:', err.response?.status);
        return { data: { success: false, wishlist: [] } };
      });
      
      if (response.data.success && Array.isArray(response.data.wishlist)) {
        const wishlistIds = new Set(response.data.wishlist.map(item => item.product?._id).filter(Boolean));
        setWishlist(wishlistIds);
      } else {
        setWishlist(new Set());
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist(new Set());
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        setRecommendations([]);
        return;
      }
      
      const response = await axios.get('http://localhost:4000/api/recommendations/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => {
        console.log('Recommendations API error:', err.response?.status);
        return { data: { success: false, recommendations: [] } };
      });
      
      if (response.data.success && Array.isArray(response.data.recommendations)) {
        setRecommendations(response.data.recommendations);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    }
  };

  // Fetch products and stores
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, storesResponse] = await Promise.all([
          axios.get('http://localhost:4000/api/products'),
          axios.get('http://localhost:4000/api/stores')
        ]);
        
        if (productsResponse.data.products && productsResponse.data.products.length > 0) {
          const transformedProducts = productsResponse.data.products
            .filter(product => product.stock > 0 && product.status === 'active')
            .map(product => ({
              id: product._id,
              name: product.name,
              category: product.category,
              originalPrice: product.originalPrice,
              discountedPrice: product.discountedPrice || product.originalPrice,
              discount: product.discountPercentage || 0,
              image: product.images?.[0] || 'https://via.placeholder.com/300x200',
              store: product.store?.name || 'Unknown Store',
              storeId: product.store?._id,
              storeAddress: product.store?.address ? 
                `${product.store.address.city}, ${product.store.address.state}` : 'Location not available',
              storePhone: product.store?.contact?.phone,
              storeCoordinates: product.store?.address?.coordinates,
              expiryDate: product.expiryDate,
              stock: product.stock,
              description: product.description,
              unit: product.unit
            }));
          setProducts(transformedProducts);
          
          // Generate price comparisons
          const comparisons = {};
          transformedProducts.forEach(product => {
            const key = product.name.toLowerCase();
            if (!comparisons[key]) {
              comparisons[key] = [];
            }
            comparisons[key].push({
              store: product.store,
              originalPrice: product.originalPrice,
              discountedPrice: product.discountedPrice,
              discount: product.discount,
              storeId: product.storeId
            });
          });
          setPriceComparisons(comparisons);
        } else {
          setProducts([]);
        }
        
        if (storesResponse.data.stores) {
          setStores(storesResponse.data.stores);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to continue');
        return;
      }
      
      const isInWishlist = wishlist.has(productId);
      
      const response = isInWishlist
        ? await axios.delete(`http://localhost:4000/api/wishlist/remove/${productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(err => ({ data: { success: false } }))
        : await axios.post(`http://localhost:4000/api/wishlist/add/${productId}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(err => ({ data: { success: false } }));
      
      if (response.data.success !== false) {
        if (isInWishlist) {
          setWishlist(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          toast.success('Removed from wishlist');
        } else {
          setWishlist(prev => new Set([...prev, productId]));
          toast.success('Added to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.discountedPrice - b.discountedPrice;
        case 'price-high':
          return b.discountedPrice - a.discountedPrice;
        case 'discount':
          return b.discount - a.discount;
        case 'expiry':
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        default:
          return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      }
    });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Logo size="large" showText={false} />
            <p className="text-gray-600 mt-4">Loading products...</p>
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
                  <p className="mt-1 text-gray-600 text-sm sm:text-base">Discover great deals on fresh products near you</p>
                </div>
              </div>
              <Link
                to="/cart"
                className="relative bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-green-600" />
                Filter & Sort Products
              </h2>
              <Link
                to="/wishlist"
                className="flex items-center text-red-600 hover:text-red-700 transition-colors"
              >
                <Heart className="w-5 h-5 mr-1" />
                Wishlist ({wishlist.size})
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="expiry">Expiring Soon</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredProducts.length} products
              </div>
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                {showRecommendations ? 'Hide' : 'Show'} Recommendations
              </button>
            </div>
          </div>

          {/* Recommendations Section */}
          {showRecommendations && recommendations.length > 0 && user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-100 p-6 mb-6"
            >
              <div className="flex items-center mb-4">
                <Award className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.slice(0, 4).map(product => (
                  <div key={product._id} className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/150x100'}
                      alt={product.name}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                    <h4 className="font-medium text-sm text-gray-900 truncate">{product.name}</h4>
                    <p className="text-xs text-blue-600 truncate">{product.store?.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-green-600">₹{product.discountedPrice || product.originalPrice}</span>
                      {product.discountPercentage > 0 && (
                        <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">
                          {product.discountPercentage}% off
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence>
              {filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-100 group"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    
                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-2 right-2 p-2 rounded-full shadow-lg transition-all duration-200 ${
                        wishlist.has(product.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${wishlist.has(product.id) ? 'fill-current' : ''}`} />
                    </button>

                    {/* Discount Badge */}
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          {product.discount}% OFF
                        </span>
                      </div>
                    )}

                    {/* Best Price Badge */}
                    {priceComparisons[product.name.toLowerCase()] && 
                     priceComparisons[product.name.toLowerCase()].length > 1 &&
                     priceComparisons[product.name.toLowerCase()][0].storeId === product.storeId && (
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center">
                          <Award className="w-3 h-3 mr-1" />
                          Best Price
                        </span>
                      </div>
                    )}
                  </div>
                <div className="p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-blue-600 truncate">🏪 {product.store}</p>
                    <p className="text-xs text-gray-500 truncate">📍 {product.storeAddress}</p>
                    {product.storePhone && (
                      <p className="text-xs text-gray-500">📞 {product.storePhone}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg sm:text-xl font-bold text-green-600">₹{product.discountedPrice}</span>
                      {product.discountedPrice < product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs text-orange-600 font-medium">
                      ⏰ Expires: {new Date(product.expiryDate).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      📦 Stock: {product.stock} {product.unit || 'pieces'} available
                    </p>
                  </div>
                  
                  {/* Price Comparison */}
                  {priceComparisons[product.name.toLowerCase()] && priceComparisons[product.name.toLowerCase()].length > 1 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <TrendingDown className="w-4 h-4 text-yellow-600 mr-1" />
                        <span className="text-xs font-medium text-yellow-800">Price Comparison</span>
                      </div>
                      <div className="space-y-1">
                        {priceComparisons[product.name.toLowerCase()]
                          .sort((a, b) => a.discountedPrice - b.discountedPrice)
                          .slice(0, 3)
                          .map((comp, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-gray-600 truncate">{comp.store}</span>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium text-green-600">₹{comp.discountedPrice}</span>
                                {comp.discount > 0 && (
                                  <span className="text-red-500">({comp.discount}% off)</span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Store Location */}
                  {product.storeCoordinates && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-blue-600 mr-1" />
                          <span className="text-xs font-medium text-blue-800">Store Location</span>
                        </div>
                        <a
                          href={`https://maps.google.com/maps?q=${product.storeCoordinates.lat},${product.storeCoordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View on Map
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 mt-4">
                    <Link
                      to={`/product/${product.id}`}
                      className="flex-1 bg-gray-600 text-white py-2.5 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center block font-medium text-sm sm:text-base"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => {
                        addToCart(product);
                        toast.success('Added to cart!');
                      }}
                      disabled={product.stock === 0}
                      className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-4xl sm:text-6xl mb-4">🏪</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-500 text-sm sm:text-base mb-4">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No stores in your area have uploaded products yet.'}
              </p>
              {(!searchTerm && selectedCategory === 'All') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-blue-800 text-sm">
                    📍 Products are shown based on your location. Stores need to upload products for them to appear here.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Store Information */}
          {stores.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Store className="w-5 h-5 mr-2 text-green-600" />
                Available Stores ({stores.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.slice(0, 6).map(store => (
                  <div key={store._id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                    <h4 className="font-medium text-gray-900">{store.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {store.address.city}, {store.address.state}
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      {store.activeProductCount || 0} products available
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;