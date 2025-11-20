import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Upload,
  X,
  Camera,
  DollarSign,
  Calendar,
  Tag,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  TrendingUp,
  BarChart3,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import Layout from '../../components/Layout';
import BulkUploadModal from '../../components/BulkUploadModal';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const StoreProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stats, setStats] = useState({
    activeProducts: 0,
    lowStockProducts: 0,
    expiringProducts: 0
  });
  const [imageUploadType, setImageUploadType] = useState('url'); // 'url' or 'file'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    originalPrice: '',
    discountedPrice: '',
    expiryDate: '',
    stock: '',
    unit: '',
    description: '',
    images: ['', '', '']
  });

  const categories = [
    'Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 
    'Frozen Foods', 'Pantry Staples', 'Beverages', 'Snacks', 
    'Health & Beauty', 'Other'
  ];

  useEffect(() => {
    let isMounted = true;
    
    if (user && user.role === 'store_owner' && isMounted) {
      fetchProducts();
    } else if (user && user.role !== 'store_owner' && isMounted) {
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, categoryFilter, statusFilter]);

  useEffect(() => {
    let isMounted = true;
    
    if (user && user.role === 'store_owner' && isMounted) {
      const delayedSearch = setTimeout(() => {
        if (isMounted) fetchProducts();
      }, 500);
      return () => {
        clearTimeout(delayedSearch);
        isMounted = false;
      };
    }
  }, [searchTerm, user]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user || user.role !== 'store_owner') {
        setProducts([]);
        setStats({ activeProducts: 0, lowStockProducts: 0, expiringProducts: 0 });
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await axios.get(`http://localhost:4000/api/products/my-products?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        console.log('Store products API error:', err.response?.status);
        return { 
          data: { 
            success: false, 
            products: [], 
            stats: { activeProducts: 0, lowStockProducts: 0, expiringProducts: 0 }
          } 
        };
      });

      if (response.data.success) {
        setProducts(response.data.products || []);
        setStats(response.data.stats || {
          activeProducts: 0,
          lowStockProducts: 0,
          expiringProducts: 0
        });
      } else {
        setProducts([]);
        setStats({ activeProducts: 0, lowStockProducts: 0, expiringProducts: 0 });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setStats({ activeProducts: 0, lowStockProducts: 0, expiringProducts: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await axios.post('http://localhost:4000/api/products/upload-image', formDataUpload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const imageUrl = `http://localhost:4000${response.data.imageUrl}`;
        const emptyIndex = formData.images.findIndex(img => !img);
        if (emptyIndex !== -1) {
          const newImages = [...formData.images];
          newImages[emptyIndex] = imageUrl;
          setFormData(prev => ({ ...prev, images: newImages }));
          toast.success('Image uploaded successfully!');
        } else {
          toast.error('Maximum 3 images allowed');
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const productData = {
        ...formData,
        originalPrice: Number(formData.originalPrice),
        discountedPrice: Number(formData.discountedPrice) || Number(formData.originalPrice),
        stock: Number(formData.stock)
      };

      // Calculate discount percentage
      if (productData.discountedPrice < productData.originalPrice) {
        productData.discountPercentage = Math.round(
          ((productData.originalPrice - productData.discountedPrice) / productData.originalPrice) * 100
        );
      }

      const url = editingProduct 
        ? `http://localhost:4000/api/products/${editingProduct._id}`
        : 'http://localhost:4000/api/products';
      
      const method = editingProduct ? 'put' : 'post';

      await axios[method](url, productData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success(`Product ${editingProduct ? 'updated' : 'added'} successfully!`);
      setShowAddModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', category: '', originalPrice: '', discountedPrice: '',
      expiryDate: '', stock: '', unit: '', description: '', images: ['', '', '']
    });
    setImageUploadType('url');
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice || product.originalPrice,
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
      stock: product.stock,
      unit: product.unit,
      description: product.description || '',
      images: [
        product.images?.[0] || '',
        product.images?.[1] || '',
        product.images?.[2] || ''
      ]
    });
    setShowAddModal(true);
  };

  const getProductStatus = (product) => {
    const now = new Date();
    const expiry = new Date(product.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (product.stock === 0) return { status: 'Out of Stock', color: 'red', icon: AlertTriangle };
    if (product.stock <= 5) return { status: 'Low Stock', color: 'orange', icon: AlertTriangle };
    if (daysUntilExpiry <= 2) return { status: 'Expiring Soon', color: 'yellow', icon: Clock };
    if (daysUntilExpiry <= 0) return { status: 'Expired', color: 'red', icon: X };
    return { status: 'Active', color: 'green', icon: CheckCircle };
  };

  const filteredProducts = products;

  if (loading && products.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-emerald-100 shadow-lg"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                My Products
              </h1>
              <p className="text-gray-600 text-lg">Manage your store inventory and products</p>
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">{stats.activeProducts} Active</span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-sm text-gray-600">{stats.lowStockProducts} Low Stock</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-gray-600">{stats.expiringProducts} Expiring Soon</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBulkUpload(true)}
                className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-sm"
              >
                <Upload className="w-5 h-5 mr-2" />
                Bulk Upload
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="flex items-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring</option>
                <option value="sold_out">Sold Out</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Start by adding your first product to the store</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200"
              >
                <div className="relative h-48 bg-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(product)}
                      className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(product._id)}
                      className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </motion.button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-2">{product.name}</h3>
                    {(() => {
                      const statusInfo = getProductStatus(product);
                      return (
                        <span className={`flex items-center text-xs px-2 py-1 rounded-full font-semibold ${
                          statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                          statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                          statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          <statusInfo.icon className="w-3 h-3 mr-1" />
                          {statusInfo.status}
                        </span>
                      );
                    })()} 
                  </div>
                  <p className="text-sm text-gray-600 mb-3 capitalize">{product.category}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-green-600">₹{product.discountedPrice || product.originalPrice}</span>
                      {product.discountedPrice && product.discountedPrice < product.originalPrice && (
                        <>
                          <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold">
                            {Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                      product.stock > 10 ? 'bg-green-100 text-green-800' :
                      product.stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                      product.stock > 0 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} {product.unit} in stock
                    </span>
                    <div className="text-xs text-gray-500">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Expires: {new Date(product.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                  {product.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discounted Price (₹)</label>
                    <input
                      type="number"
                      value={formData.discountedPrice}
                      onChange={(e) => setFormData({...formData, discountedPrice: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock & Unit</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Stock"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Unit</option>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                        <option value="piece">piece</option>
                        <option value="pack">pack</option>
                        <option value="bottle">bottle</option>
                        <option value="can">can</option>
                        <option value="box">box</option>
                        <option value="bag">bag</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-4">Product Images (Up to 3)</label>
                  <div className="space-y-6">
                    {/* Image Upload Type Selector */}
                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setImageUploadType('url')}
                        className={`flex items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                          imageUploadType === 'url'
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        <LinkIcon className="w-5 h-5 mr-2" />
                        Image URLs
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setImageUploadType('file')}
                        className={`flex items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                          imageUploadType === 'file'
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Files
                      </motion.button>
                    </div>

                    {/* Image URL Inputs */}
                    {imageUploadType === 'url' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        {[0, 1, 2].map((index) => (
                          <div key={index} className="relative">
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                              Image {index + 1} {index === 0 && '(Main)'}
                            </label>
                            <input
                              type="url"
                              placeholder={`https://example.com/image${index + 1}.jpg`}
                              value={formData.images[index] || ''}
                              onChange={(e) => {
                                const newImages = [...formData.images];
                                newImages[index] = e.target.value;
                                setFormData({...formData, images: newImages});
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            />
                          </div>
                        ))}
                        <p className="text-xs text-gray-500">Enter direct URLs to your product images</p>
                      </motion.div>
                    )}

                    {/* File Upload */}
                    {imageUploadType === 'file' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        {[0, 1, 2].map((index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                          >
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                              Image {index + 1} {index === 0 && '(Main)'}
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 transition-all duration-200 hover:bg-blue-50/30">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setUploadingImage(true);
                                    handleImageUpload(file).finally(() => setUploadingImage(false));
                                  }
                                }}
                                className="hidden"
                                id={`image-upload-${index}`}
                              />
                              <label htmlFor={`image-upload-${index}`} className="cursor-pointer block">
                                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-600">Click to upload</p>
                                <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
                              </label>
                            </div>
                          </motion.div>
                        ))}
                        {uploadingImage && (
                          <div className="col-span-full flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                            <span className="text-sm text-gray-600 font-medium">Uploading image...</span>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Image Previews */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        image && (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative group"
                          >
                            <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200">
                              <img
                                src={image}
                                alt={`Product preview ${index + 1}`}
                                className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  toast.error(`Invalid image URL for image ${index + 1}`);
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200"></div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => {
                                  const newImages = [...formData.images];
                                  newImages[index] = '';
                                  setFormData({...formData, images: newImages});
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                              >
                                <X className="w-3 h-3" />
                              </motion.button>
                              {index === 0 && (
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                                  Main
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-center">Image {index + 1}</p>
                          </motion.div>
                        )
                      ))}
                    </div>
                  </div>
                </motion.div>
                
                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploadingImage}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 font-semibold"
                  >
                    {loading ? 'Saving...' : uploadingImage ? 'Uploading...' : editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onSuccess={() => {
          fetchProducts();
          setShowBulkUpload(false);
        }}
      />
    </Layout>
  );
};

export default StoreProducts;