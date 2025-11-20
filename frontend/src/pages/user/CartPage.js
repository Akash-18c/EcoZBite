import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Plus, Minus, TrendingDown, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, getOriginalTotal, getTotalSavings } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to place order');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Group items by store
      const itemsByStore = cartItems.reduce((acc, item) => {
        const storeId = item.storeId || '507f1f77bcf86cd799439011';
        if (!acc[storeId]) acc[storeId] = [];
        acc[storeId].push(item);
        return acc;
      }, {});

      // Create separate orders for each store
      for (const [storeId, items] of Object.entries(itemsByStore)) {
        const orderData = {
          store_id: storeId,
          items: items.map(item => ({
            product_id: item.id,
            productName: item.name,
            quantity: item.quantity,
            originalPrice: item.originalPrice,
            discountedPrice: item.discountedPrice,
            totalPrice: item.discountedPrice * item.quantity,
            unit: item.unit || 'piece'
          })),
          totalAmount: items.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0),
          customerInfo: {
            name: user.name,
            phone: user.phone || '+91-9876543210',
            email: user.email
          }
        };

        await axios.post('http://localhost:4000/api/orders', orderData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      toast.success('Orders placed successfully!');
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to place orders');
    }
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
            <button
              onClick={() => navigate('/user/products')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Browse Products
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.store}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-lg font-bold text-green-600">₹{item.discountedPrice}</span>
                      {item.discountedPrice < item.originalPrice && (
                        <>
                          <span className="text-sm text-gray-400 line-through">₹{item.originalPrice}</span>
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                            {Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100)}% off
                          </span>
                        </>
                      )}
                    </div>
                    {item.discountedPrice < item.originalPrice && (
                      <p className="text-xs text-green-600 mt-1">
                        Save ₹{(item.originalPrice - item.discountedPrice) * item.quantity} on {item.quantity} {item.unit}(s)
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900">₹{item.discountedPrice * item.quantity}</p>
                      {item.discountedPrice < item.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">₹{item.originalPrice * item.quantity}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-6 border-t border-gray-100">
              {/* Savings Summary */}
              {getTotalSavings() > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <h4 className="font-semibold text-green-900">🎉 Great Savings!</h4>
                        <p className="text-sm text-green-700">
                          You're saving ₹{getTotalSavings()} on this order
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="w-4 h-4 text-green-600" />
                        <span className="text-lg font-bold text-green-700">
                          {Math.round((getTotalSavings() / getOriginalTotal()) * 100)}% OFF
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Order Summary */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                  <span>₹{getOriginalTotal()}</span>
                </div>
                {getTotalSavings() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₹{getTotalSavings()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-green-600">₹{getCartTotal()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={clearCart}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;