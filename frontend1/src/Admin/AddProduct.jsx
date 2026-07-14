import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../services/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    usage: '',
    useByHoroscope: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/shopping/categories');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create FormData object to send both file and JSON data
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('usage', formData.usage || '');
      formDataToSend.append('useByHoroscope', formData.useByHoroscope || '');

      if (image) {
        formDataToSend.append('image', image);
      }

      // Send request with proper headers for file upload
      await axios.post('/shopping/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Redirect to product management page
      navigate('/admin/products');
    } catch (err) {
      setError('Failed to add product');
      console.error('Error adding product:', err);
    } finally {
      setLoading(false);
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

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-cinzel font-bold text-black mb-4">
            Add New <span className="divine-text">Product</span>
          </h1>
          <p className="text-black">Add a new spiritual product to the shop</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="glass-card rounded-xl p-6 border border-astro-gold/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-black mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-black mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
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
                <label className="block text-black mb-2">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-black mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                rows="3"
                placeholder="Brief description of the product"
              />
            </div>

            <div>
              <label className="block text-black mb-2">Usage</label>
              <textarea
                name="usage"
                value={formData.usage}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                rows="3"
                placeholder="How to use this product"
              />
            </div>

            <div>
              <label className="block text-black mb-2">Use By Horoscope</label>
              <textarea
                name="useByHoroscope"
                value={formData.useByHoroscope}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                rows="3"
                placeholder="Which horoscopes benefit most from this product"
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-black mb-2">Product Image</label>
              <div className="flex flex-col items-center justify-center">
                {imagePreview ? (
                  <div className="relative mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 rounded-lg border border-astro-gold/30"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-black rounded-full p-1 hover:bg-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-astro-gold/30 rounded-lg p-8 text-center mb-4 w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-astro-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-black mt-2">No image selected</p>
                  </div>
                )}

                <label className="px-4 py-2 bg-astro-purple text-black rounded-lg cursor-pointer hover:bg-astro-purple/80 transition-colors">
                  {image ? 'Change Image' : 'Select Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {image && (
                  <p className="text-black text-sm mt-2">{image.name}</p>
                )}
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-astro-gold text-astro-dark font-semibold rounded-lg hover:bg-astro-gold/80 transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="px-6 py-2 bg-gray-600 text-black font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;