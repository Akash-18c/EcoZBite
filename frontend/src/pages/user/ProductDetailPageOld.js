import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  // Mock product data
  const product = {
    id: 1,
    name: 'Fresh Bananas',
    description: 'Sweet and ripe bananas, perfect for smoothies or snacking. Organic and locally sourced.',
    originalPrice: 299,
    discountedPrice: 149,
    discount: 50,
    expiryDate: '2024-01-15',
    stock: 15,
    store: {
      name: 'FreshMart',
      address: '123 Green Street, City',
      phone: '(555) 123-4567'
    },
    images: ['https://via.placeholder.com/400x400/22c55e/ffffff?text=🍌'],
    category: 'Fruits & Vegetables',
    unit: 'bunch'
  };

  const handleAddToCart = () => {
    alert(`Added ${quantity} ${product.unit}(s) of ${product.name} to cart`);
  };

  const handleBuyNow = () => {
    navigate('/checkout');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-green-600 hover:text-green-500 flex items-center"
          >
            ← Back to Products
          </button>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Product Image */}
              <div>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>

              {/* Product Details */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-3xl font-bold text-green-600">₹{product.discountedPrice}</span>
                  <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                    {product.discount}% OFF
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 mb-2">
                    <strong>Expires:</strong> {new Date(product.expiryDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <strong>Stock:</strong> {product.stock} {product.unit}s available
                  </p>
                  <p className="text-gray-600 mb-4">
                    <strong>Category:</strong> {product.category}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                {/* Store Info */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Store Information</h3>
                  <p className="text-gray-600 mb-1"><strong>{product.store.name}</strong></p>
                  <p className="text-gray-600 mb-1">{product.store.address}</p>
                  <p className="text-gray-600">{product.store.phone}</p>
                </div>

                {/* Quantity and Actions */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="text-lg font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-green-100 text-green-700 py-3 px-6 rounded-md hover:bg-green-200 transition-colors font-medium"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </Layout>
  );
};

export default ProductDetailPage;