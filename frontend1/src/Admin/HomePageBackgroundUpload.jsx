import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { Image as ImageIcon, Upload, X, CheckCircle } from 'lucide-react';

const HomePageBackgroundUpload = () => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError('');
      } else {
        setError('Please select a valid image file (JPG, JPEG, PNG, GIF, SVG, WebP)');
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || !title) {
      setError('Please provide an image file and title');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('title', title);
      formData.append('description', description);
      
      console.log('Submitting form data:', {
        title,
        description
      });

      // Use the specific endpoint for home page background
      const response = await adminAPI.uploadHomePageBackground(formData);
      
      if (response.data.success) {
        setSuccess(true);
        setImageFile(null);
        setPreviewUrl('');
        setTitle('');
        setDescription('');
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
        
        // Notify parent or global state that background image has changed
        // This will help refresh the home page
        window.dispatchEvent(new Event('backgroundImageUpdated'));
      } else {
        setError(response.data.message || 'Failed to upload image');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-astro-dark celestial-bg yantra-bg overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 border border-astro-gold rounded-full opacity-20"></div>
        <div className="absolute top-1/4 right-20 w-24 h-24 border border-cosmic-pink rounded-full opacity-15" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-cinzel font-bold text-black mb-2">
                Home Page Background Upload
              </h1>
              <p className="text-black">Upload background images to be displayed on the home page</p>
            </div>
            
            <Link 
              to="/admin" 
              className="px-4 py-2 bg-astro-purple/20 text-astro-purple border border-astro-purple/30 rounded-lg hover:bg-astro-purple/30 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-100 px-4 py-3 rounded-lg mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Background image uploaded successfully and will be displayed on the home page!
            </div>
          )}

          <div className="glass-card rounded-xl p-6 border border-astro-gold/20">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Image Upload Area */}
                <div>
                  <label className="block text-black font-medium mb-2">
                    Background Image
                  </label>
                  
                  {!imageFile ? (
                    <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-astro-gold/50 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                      <p className="text-black mb-2">Drag and drop your image here, or click to browse</p>
                      <p className="text-gray-500 text-sm mb-4">Supports JPG, JPEG, PNG, GIF, SVG, WebP (Max 10MB)</p>
                      <label className="px-4 py-2 bg-astro-purple/20 text-astro-purple border border-astro-purple/30 rounded-lg hover:bg-astro-purple/30 transition-colors cursor-pointer">
                        Select Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative rounded-xl overflow-hidden bg-black">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-64 object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-2 bg-red-500/80 text-black rounded-full hover:bg-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-black font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-purple"
                    placeholder="Enter image title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-black font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-purple"
                    placeholder="Enter image description"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !imageFile || !title}
                    className="w-full px-6 py-3 bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark font-semibold rounded-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-astro-dark mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-2" />
                        Upload Background Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Instructions */}
          <div className="glass-card rounded-xl p-6 mt-6 border border-astro-purple/20">
            <h3 className="text-xl font-semibold text-black mb-4">Instructions</h3>
            <ul className="space-y-2 text-black">
              <li className="flex items-start">
                <span className="text-astro-gold mr-2">•</span>
                <span>Background images uploaded here will be displayed on the home page</span>
              </li>
              <li className="flex items-start">
                <span className="text-astro-gold mr-2">•</span>
                <span>Only admins can upload home page background images</span>
              </li>
              <li className="flex items-start">
                <span className="text-astro-gold mr-2">•</span>
                <span>Images will be used as the background for the home page</span>
              </li>
              <li className="flex items-start">
                <span className="text-astro-gold mr-2">•</span>
                <span>Keep images under 10MB for best performance</span>
              </li>
              <li className="flex items-start">
                <span className="text-astro-gold mr-2">•</span>
                <span>Use high-quality images with appropriate dimensions for best display</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageBackgroundUpload;