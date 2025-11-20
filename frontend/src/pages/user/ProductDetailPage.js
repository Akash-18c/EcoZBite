import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import PriceDropGraph from '../../components/PriceDropGraph';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, MapPin, Clock, Package, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/products/${id}`);
      if (response.data) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/user/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartProduct = {
      id: product._id,
      name: product.name,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice || product.originalPrice,
      image: product.images?.[0] || 'https://via.placeholder.com/300x200',
      store: product.store?.name,
      storeId: product.store?._id,
      unit: product.unit,
      stock: product.stock
    };
    
    addToCart(cartProduct, quantity);
    toast.success(`Added ${quantity} ${product.unit}(s) to cart!`);
  };

  const handleBuyNow = () => {
    navigate(`/place-order/${product._id}`);
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
  const savings = product.originalPrice - discountedPrice;
  const discountPercentage = savings > 0 ? Math.round((savings / product.originalPrice) * 100) : 0;
  const totalPrice = discountedPrice * quantity;
  const totalSavings = savings * quantity;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="mb-6 text-green-600 hover:text-green-500 flex items-center font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-green-200 hover:bg-green-50 transition-all duration-200"
          >
            ← Back to Products
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8 hover:shadow-2xl transition-all duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="relative group">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/400x400'}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {product.images && product.images.length > 1 && (
                  <div className="flex space-x-2 mt-4">
                    {product.images.slice(1, 4).map((image, index) => (
                      <motion.img
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        src={image}
                        alt={`${product.name} ${index + 2}`}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:scale-105"
                      />
                    ))}
                  </div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Store className="w-5 h-5 mr-2" />
                    Store Information
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Store:</span> {product.store?.name}
                    </p>
                    <p className="text-sm text-blue-700 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {product.store?.address?.street}, {product.store?.address?.city}, {product.store?.address?.state}
                    </p>
                    <p className="text-sm text-blue-700">
                      📞 {product.store?.contact?.phone}
                    </p>
                    {product.store?.address?.coordinates && (
                      <a
                        href={`https://maps.google.com/maps?q=${product.store.address.coordinates.lat},${product.store.address.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        View on Map
                      </a>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.h1 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6"
                >
                  {product.name}
                </motion.h1>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-3xl font-bold text-green-600">₹{discountedPrice}</span>
                    {savings > 0 && (
                      <>
                        <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
                        <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                          {discountPercentage}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-sm text-green-700">
                      You save ₹{savings} per {product.unit}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4 mb-6"
                >
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2 text-orange-500" />
                    <span className="font-medium">Expires:</span>
                    <span className="ml-2">{new Date(product.expiryDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Package className="w-5 h-5 mr-2 text-blue-500" />
                    <span className="font-medium">Stock:</span>
                    <span className="ml-2">{product.stock} {product.unit}s available</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">Category:</span>
                    <span className="ml-2">{product.category}</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mb-6 bg-gray-50 rounded-xl p-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-blue-600" />
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{product.description || 'Fresh and high-quality product from our trusted store partners.'}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Quantity
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 font-medium"
                      >
                        -
                      </button>
                      <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 font-medium"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 shadow-sm"
                  >
                    <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Price per {product.unit}:</span>
                        <span>₹{discountedPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Quantity:</span>
                        <span>{quantity}</span>
                      </div>
                      {totalSavings > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Total Savings:</span>
                          <span>₹{totalSavings}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span className="text-green-600">₹{totalPrice}</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="flex space-x-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      disabled={product.stock < 1}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBuyNow}
                      disabled={product.stock < 1}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                      Buy Now
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <PriceDropGraph 
              productId={product._id} 
              productName={product.name}
            />
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;