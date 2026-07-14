import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../services/api';

const CategoryManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/shopping/categories');
      setCategories(response.data.categories);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
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

      if (editingId) {
        // Update existing category
        await axios.put(`/shopping/categories/${editingId}`, formData);
        setEditingId(null);
      } else {
        // Create new category
        await axios.post('/shopping/categories', formData);
      }

      // Reset form
      setFormData({
        name: '',
        description: ''
      });

      // Refresh categories list
      fetchCategories();
      setError('');
    } catch (err) {
      setError('Failed to save category');
      console.error('Error saving category:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setEditingId(category._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? All products in this category will be affected.')) {
      try {
        await axios.delete(`/shopping/categories/${id}`);
        fetchCategories();
      } catch (err) {
        setError('Failed to delete category. It might have associated products.');
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: ''
    });
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
            Category <span className="divine-text">Management</span>
          </h1>
          <p className="text-black">Manage product categories</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Category Form */}
        <div className="glass-card rounded-xl p-6 mb-8 border border-astro-gold/20">
          <h2 className="text-2xl font-semibold text-black mb-4">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-black mb-2">Category Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                required
                placeholder="e.g., Ratna, Rudraksha, Mala, etc."
              />
            </div>

            <div>
              <label className="block text-black mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                rows="3"
                placeholder="Description of this category"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-astro-gold text-astro-dark font-semibold rounded-lg hover:bg-astro-gold/80 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingId ? 'Update Category' : 'Add Category')}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-600 text-black font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="px-6 py-2 bg-astro-purple text-black font-semibold rounded-lg hover:bg-astro-purple/80 transition-colors"
              >
                Back to Products
              </button>
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="glass-card rounded-xl p-6 border border-astro-purple/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black">All Categories</h2>
            <span className="text-black">{categories.length} categories</span>
          </div>

          {loading && categories.length === 0 ? (
            <div className="text-center py-8 text-black">Loading categories...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-astro-gold/20">
                    <th className="py-3 px-4 text-astro-gold">Category</th>
                    <th className="py-3 px-4 text-astro-gold">Description</th>
                    <th className="py-3 px-4 text-astro-gold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id} className="border-b border-astro-gold/10 hover:bg-astro-dark/30">
                      <td className="py-3 px-4 text-black">
                        <div className="font-medium">{category.name}</div>
                      </td>
                      <td className="py-3 px-4 text-black">
                        {category.description || 'No description'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="px-3 py-1 bg-astro-purple text-black text-sm rounded hover:bg-astro-purple/80 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
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

              {categories.length === 0 && !loading && (
                <div className="text-center py-8 text-black">No categories found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;