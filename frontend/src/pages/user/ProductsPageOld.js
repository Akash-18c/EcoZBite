import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart } from 'lucide-react';
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
          // Default to Mumbai coordinates
          setUserLocation({
            latitude: 19.0760,
            longitude: 72.8777
          });
        }
      );
    } else {
      // Default location if geolocation not supported
      setUserLocation({
        latitude: 19.0760,
        longitude: 72.8777
      });
    }
  }, []);

  // Fetch products from all stores
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/products');
        
        if (response.data.products && response.data.products.length > 0) {
          const transformedProducts = response.data.products
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
              expiryDate: product.expiryDate,
              stock: product.stock,
              description: product.description,
              unit: product.unit
            }));
          setProducts(transformedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredProducts.length} products
            </div>
          </div>
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-100 group">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        {product.discount}% OFF
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
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        addToCart(product);
                        toast.success('Added to cart!');
                      }}
                      className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                    >
                      Add to Cart
                    </button>
                    <Link
                      to={`/place-order/${product.id}`}
                      className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors text-center block font-medium text-sm sm:text-base"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;