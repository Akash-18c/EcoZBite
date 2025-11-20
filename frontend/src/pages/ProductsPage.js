import React from 'react';
import { Link } from 'react-router-dom';

const ProductsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Products</h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing deals on fresh products near you
          </p>
          <Link
            to="/auth/login"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Login to View Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;