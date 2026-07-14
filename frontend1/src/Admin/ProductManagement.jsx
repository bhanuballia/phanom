import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../services/api';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/shopping/products');
      setProducts(response.data.products);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/shopping/categories');
      setCategories(response.data.categories);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/shopping/products/${id}`);
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
        console.error('Error deleting product:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-astro-dark celestial-bg yantra-bg p-6">
      {/* Cosmic Background Elements */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 border border-astro-gold rounded-full opacity-20"></div>
        <div className="absolute top-1/4 right-20 w-24 h-24 border border-cosmic-pink rounded-full opacity-15" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-16 h-16 border border-astro-purple rounded-full opacity-25" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-cinzel font-bold text-black mb-4">
            Product <span className="divine-text">Management</span>
          </h1>
          <p className="text-black">Manage spiritual products and categories</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/admin/products/new"
            className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-astro-gold/20 group"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-astro-gold rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-astro-dark text-2xl">+</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-black text-center mb-2">Add New Product</h3>
            <p className="text-black text-center">Create a new spiritual product</p>
          </Link>

          <Link
            to="/admin/categories"
            className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-astro-purple/20 group"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-astro-purple rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-black text-2xl">☰</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-black text-center mb-2">Manage Categories</h3>
            <p className="text-black text-center">Add or edit product categories</p>
          </Link>
        </div>

        {/* Products List */}
        <div className="glass-card rounded-xl p-6 border border-astro-gold/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black">All Products</h2>
            <span className="text-black">{products.length} products</span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-black">Loading products...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-astro-gold/20">
                    <th className="py-3 px-4 text-astro-gold">Image</th>
                    <th className="py-3 px-4 text-astro-gold">Product</th>
                    <th className="py-3 px-4 text-astro-gold">Category</th>
                    <th className="py-3 px-4 text-astro-gold">Price</th>
                    <th className="py-3 px-4 text-astro-gold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-astro-gold/10 hover:bg-astro-dark/30">
                      <td className="py-3 px-4">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-astro-purple/20 rounded flex items-center justify-center">
                            <span className="text-astro-purple">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-black">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-black mt-1">
                          {product.description?.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="py-3 px-4 text-black">
                        {product.category?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-black">
                        ₹{product.price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="px-3 py-1 bg-astro-purple text-black text-sm rounded hover:bg-astro-purple/80 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="px-3 py-1 bg-red-600 text-black text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {products.length === 0 && !loading && (
                <div className="text-center py-8 text-black">No products found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;