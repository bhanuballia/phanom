import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    usage: '',
    useByHoroscope: ''
  });
  const [editingId, setEditingId] = useState(null);
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
      const response = await axios.get('/api/products');
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
      const response = await axios.get('/api/categories');
      setCategories(response.data.categories);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingId) {
        // Update existing product
        await axios.put(`/api/products/${editingId}`, productData);
        setEditingId(null);
      } else {
        // Create new product
        await axios.post('/api/products', productData);
      }

      // Reset form
      setFormData({
        name: '',
        category: '',
        price: '',
        description: '',
        usage: '',
        useByHoroscope: ''
      });

      // Refresh products list
      fetchProducts();
      setError('');
    } catch (err) {
      setError('Failed to save product');
      console.error('Error saving product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category._id,
      price: product.price,
      description: product.description || '',
      usage: product.usage || '',
      useByHoroscope: product.useByHoroscope || ''
    });
    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      usage: '',
      useByHoroscope: ''
    });
  };

  return (
    <div className="min-h-screen bg-astro-dark p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Product Management</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Product Form */}
        <div className="glass-card rounded-xl p-6 mb-8 border border-astro-gold/20">
          <h2 className="text-2xl font-semibold text-white mb-4">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-astro-gold"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-astro-gold"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-astro-gold"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-astro-gold"
                rows="3"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Usage</label>
              <textarea
                name="usage"
                value={formData.usage}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-astro-gold"
                rows="2"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Use By Horoscope</label>
              <textarea
                name="useByHoroscope"
                value={formData.useByHoroscope}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-astro-gold"
                rows="2"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-astro-gold text-astro-dark font-semibold rounded-lg hover:bg-astro-gold/80 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Products List */}
        <div className="glass-card rounded-xl p-6 border border-astro-purple/20">
          <h2 className="text-2xl font-semibold text-white mb-4">Products</h2>
          
          {loading && products.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Loading products...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-astro-gold/20">
                    <th className="py-3 px-4 text-astro-gold">Product</th>
                    <th className="py-3 px-4 text-astro-gold">Category</th>
                    <th className="py-3 px-4 text-astro-gold">Price</th>
                    <th className="py-3 px-4 text-astro-gold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-astro-gold/10 hover:bg-astro-dark/30">
                      <td className="py-3 px-4 text-white">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-400 mt-1">{product.description}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {product.category?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-white">
                        ₹{product.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1 bg-astro-purple text-white text-sm rounded hover:bg-astro-purple/80 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
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
                <div className="text-center py-8 text-gray-400">No products found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;