import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    imageUrl: '',
    unit: 'piece',
    expiryDate: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/products/my-products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProducts(result.products || []);
        } else {
          toast.error(result.message || 'Failed to fetch products');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingProduct 
        ? `http://localhost:4000/api/products/${editingProduct._id}`
        : 'http://localhost:4000/api/products';
      
      // Validate required fields
      if (!formData.name || !formData.price || !formData.category || !formData.stock || !formData.unit || !formData.expiryDate) {
        toast.error('Please fill all required fields');
        return;
      }
      
      // Create proper product data with all required fields
      const productData = {
        name: formData.name.trim(),
        originalPrice: Number(formData.price),
        category: formData.category,
        stock: Number(formData.stock),
        unit: formData.unit,
        expiryDate: formData.expiryDate,
        description: formData.description?.trim() || '',
        images: formData.imageUrl ? [formData.imageUrl.trim()] : []
      };
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      if (response.ok) {
        toast.success(`Product ${editingProduct ? 'updated' : 'added'} successfully!`);
        fetchProducts();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Product deleted successfully!');
        fetchProducts();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', category: '', stock: '', description: '', imageUrl: '', unit: 'piece', expiryDate: '' });
    setShowAddModal(false);
    setEditingProduct(null);
  };

  const startEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.originalPrice || product.price,
      category: product.category,
      stock: product.stock,
      description: product.description || '',
      imageUrl: product.images?.[0] || '',
      unit: product.unit || 'piece',
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''
    });
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/40'} 
                                alt={product.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.description}</div>
                              <div className="text-xs text-gray-400">
                                Expires: {new Date(product.expiryDate).toLocaleDateString('en-IN')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">₹{product.originalPrice || product.price}</div>
                            {product.discountedPrice && product.discountedPrice < product.originalPrice && (
                              <div className="text-xs text-green-600">
                                Discounted: ₹{product.discountedPrice}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>{product.stock} {product.unit}</div>
                            {product.stock <= 5 && product.stock > 0 && (
                              <div className="text-xs text-orange-600">Low stock</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.status === 'active' && product.stock > 0 
                              ? 'bg-green-100 text-green-800' 
                              : product.status === 'expiring'
                              ? 'bg-yellow-100 text-yellow-800'
                              : product.status === 'expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status === 'active' && product.stock > 0 
                              ? 'Active' 
                              : product.status === 'expiring'
                              ? 'Expiring Soon'
                              : product.status === 'expired'
                              ? 'Expired'
                              : product.stock === 0
                              ? 'Out of Stock'
                              : product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => startEdit(product)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                  <option value="Dairy & Eggs">Dairy & Eggs</option>
                  <option value="Meat & Seafood">Meat & Seafood</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Frozen Foods">Frozen Foods</option>
                  <option value="Pantry Staples">Pantry Staples</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Health & Beauty">Health & Beauty</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="piece">Piece</option>
                  <option value="kg">Kilogram</option>
                  <option value="g">Gram</option>
                  <option value="pack">Pack</option>
                  <option value="bottle">Bottle</option>
                  <option value="can">Can</option>
                  <option value="box">Box</option>
                  <option value="bag">Bag</option>
                </select>
                <input
                  type="date"
                  placeholder="Expiry Date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setFormData({...formData, imageUrl: e.target.result});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Or enter image URL:</p>
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-1"
                  />
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {editingProduct ? 'Update' : 'Add'} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminProductsPage;