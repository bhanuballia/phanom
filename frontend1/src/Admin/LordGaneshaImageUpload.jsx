import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { Upload, X, CheckCircle, Image as ImageIcon } from 'lucide-react';

const LordGaneshaImageUpload = () => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    // Fetch current Lord Ganesha image on component mount
    fetchCurrentImage();
  }, []);

  const fetchCurrentImage = async () => {
    try {
      const response = await adminAPI.getLordGaneshaImage();
      if (response.data.imageUrl) {
        setCurrentImage(response.data.imageUrl);
      }
    } catch (err) {
      console.log('No current image found or error fetching image');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError('');
      } else {
        setError('Please select a valid image file (JPG, PNG, SVG, etc.)');
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
    if (!imageFile) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await adminAPI.uploadLordGaneshaImage(formData);
      
      if (response.data.success) {
        setSuccess(true);
        setImageFile(null);
        setPreviewUrl('');
        setCurrentImage(response.data.imageUrl);
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
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
              <h1 className="text-3xl font-cinzel font-bold text-white mb-2">
                Lord Ganesha Image Upload
              </h1>
              <p className="text-gray-300">Upload Lord Ganesha image for the Kundali Matching page</p>
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
              Image uploaded successfully!
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Form */}
            <div className="glass-card rounded-xl p-6 border border-astro-gold/20">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Image Upload Area */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Lord Ganesha Image
                    </label>
                    
                    {!imageFile ? (
                      <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-astro-gold/50 transition-colors">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                        <p className="text-gray-400 mb-2">Drag and drop your image here, or click to browse</p>
                        <p className="text-gray-500 text-sm mb-4">Supports JPG, PNG, SVG (Max 10MB)</p>
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
                          className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark font-bold rounded-lg hover:shadow-lg transition-all duration-300 flex items-center disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <Upload className="h-5 w-5 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 mr-2" />
                          Upload Image
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Current Image Preview */}
            <div className="glass-card rounded-xl p-6 border border-astro-gold/20">
              <h2 className="text-xl font-bold text-white mb-4">Current Lord Ganesha Image</h2>
              
              {currentImage ? (
                <div className="flex flex-col items-center">
                  <img
                    src={currentImage}
                    alt="Current Lord Ganesha"
                    className="w-full h-64 object-contain rounded-lg"
                  />
                  <p className="text-gray-300 mt-4 text-center">
                    This is the current image displayed on the Kundali Matching page
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-white/5 rounded-lg border border-white/10">
                  <ImageIcon className="h-12 w-12 text-gray-500 mb-4" />
                  <p className="text-gray-400 text-center">
                    No image has been uploaded yet. Upload an image to display it on the Kundali Matching page.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LordGaneshaImageUpload;