import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data) {
        setProduct(response.data);
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

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login to place order');
      return;
    }

    setPlacing(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        store_id: product.store?._id || product.store,
        items: [{
          product_id: product._id,
          productName: product.name,
          quantity: quantity,
          originalPrice: product.originalPrice,
          discountedPrice: Math.round(product.originalPrice * 0.7),
          totalPrice: Math.round(product.originalPrice * 0.7) * quantity,
          unit: product.unit || 'piece'
        }],
        totalAmount: Math.round(product.originalPrice * 0.7) * quantity,
        customerInfo: {
          name: user.name,
          phone: user.phone || '+91-9876543210',
          email: user.email
        }
      };

      console.log('Order data:', orderData); // Debug log
      
      const response = await axios.post('http://localhost:4000/api/orders', orderData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data) {
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to place order');
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

  const discountedPrice = Math.round(product.originalPrice * 0.7);
  const totalPrice = discountedPrice * quantity;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Place Order</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Details */}
                <div>
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/400x300'}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h2>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-2xl font-bold text-green-600">₹{discountedPrice}</span>
                    <span className="text-lg text-gray-400 line-through">₹{product.originalPrice}</span>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                      30% OFF
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Category:</span> {product.category}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Stock:</span> {product.stock} available
                  </p>
                </div>

                {/* Order Form */}
                <div>
                  <div className="bg-gray-50 p-6 rounded-lg">
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
                      <div className="flex justify-between text-lg font-bold">
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