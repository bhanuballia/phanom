import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../services/api'; // Use the existing API service

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedProducts, setExpandedProducts] = useState({}); // Track expanded state for each product

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await axios.get('/shopping/products', { params });
      // Safely access products array
      setProducts(Array.isArray(response.data.products) ? response.data.products : []);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
      setProducts([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/shopping/categories');
      // Safely access categories array
      setCategories(Array.isArray(response.data.categories) ? response.data.categories : []);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
      setCategories([]); // Set to empty array on error
    }
  };

  const toggleDetails = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  return (
    <div className="min-h-screen bg-white p-6">


      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-cinzel font-bold text-gray-800 mb-4">
              Spiritual <span className="text-astro-gold">Shop</span>
            </h1>
            <p className="text-gray-600">Discover powerful spiritual items for your journey</p>
          </div>
          <Link
            to="/"
            className="self-center md:self-start inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark font-semibold shadow-lg hover:shadow-xl transition"
          >
            Back to Home
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Category Filter */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full transition-all ${selectedCategory === ''
                ? 'bg-astro-gold text-astro-dark font-semibold'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
            >
              All Products
            </button>

            {/* Safely map over categories array */}
            {Array.isArray(categories) && categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`px-4 py-2 rounded-full transition-all ${selectedCategory === category._id
                  ? 'bg-astro-purple text-white font-semibold'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-astro-gold"></div>
            <p className="text-gray-700 mt-4">Loading spiritual products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Safely map over products array */}
            {Array.isArray(products) && products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                {/* Product Image */}
                {product.imageUrl ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <div className="text-4xl">📿</div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-astro-gold font-medium">₹{product.price?.toFixed(2) || '0.00'}</p>
                    </div>
                    <span className="px-3 py-1 bg-astro-purple/20 text-astro-purple text-sm rounded-full">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => toggleDetails(product._id)}
                      className="text-astro-purple font-medium flex items-center justify-center gap-2 hover:underline transition-all"
                    >
                      {expandedProducts[product._id] ? (
                        <>
                          <span>Hide Details</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>Show Details</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>

                    {expandedProducts[product._id] && (
                      <div className="border-t border-gray-100 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {product.description && (
                          <div className="mb-4">
                            <h4 className="text-astro-gold font-medium mb-1">Description</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                          </div>
                        )}

                        {product.usage && (
                          <div className="mb-4">
                            <h4 className="text-astro-gold font-medium mb-1">Usage</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{product.usage}</p>
                          </div>
                        )}

                        {product.useByHoroscope && (
                          <div className="mb-4">
                            <h4 className="text-astro-gold font-medium mb-1">Recommended for Horoscope</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{product.useByHoroscope}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <button className="w-full py-2 bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark font-semibold rounded-lg hover:opacity-90 transition-opacity mt-2">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && Array.isArray(products) && products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📿</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;