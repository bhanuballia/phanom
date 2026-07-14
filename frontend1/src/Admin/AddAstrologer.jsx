import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { adminAPI } from '../services/api';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Star,
  DollarSign,
  FileText,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  X
} from 'lucide-react';

const AddAstrologer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    phone: '',
    specialization: [],
    experience: '',
    languages: ['Hindi', 'English'],
    pricing: 100,
    bio: '',
    profilePicture: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const specializationOptions = [
    'Vedic Astrology',
    'Numerology',
    'Palmistry',
    'Tarot Reading',
    'Vastu Shastra',
    'Gemstone Consultation',
    'Marriage Matching',
    'Career Guidance',
    'Health Astrology',
    'Financial Astrology'
  ];

  const languageOptions = [
    'Hindi',
    'English',
    'Bengali',
    'Tamil',
    'Telugu',
    'Marathi',
    'Gujarati',
    'Punjabi',
    'Malayalam',
    'Kannada'
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSpecializationChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      specialization: checked
        ? [...prev.specialization, value]
        : prev.specialization.filter(spec => spec !== value)
    }));
  };

  const handleLanguageChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      languages: checked
        ? [...prev.languages, value]
        : prev.languages.filter(lang => lang !== value)
    }));
  };

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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let submitData;

      // If there's an image file, use FormData
      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('profilePicture', imageFile);

        // Append all other form fields (exclude profilePicture from state)
        Object.keys(formData).forEach(key => {
          if (key !== 'profilePicture') {
            const value = formData[key];
            if (Array.isArray(value)) {
              formDataToSend.append(key, JSON.stringify(value));
            } else if (value !== null && value !== undefined) {
              formDataToSend.append(key, value);
            }
          }
        });

        submitData = formDataToSend;
      } else {
        // Remove profilePicture field when no image is uploaded
        const { profilePicture, ...dataToSend } = formData;
        submitData = dataToSend;
      }

      // Log what we're sending (without sensitive data)
      console.log('Submitting astrologer data:', {
        hasImage: !!imageFile,
        isFormData: submitData instanceof FormData,
        formDataKeys: submitData instanceof FormData ? 'FormData (cannot log)' : Object.keys(submitData),
        name: submitData instanceof FormData ? 'N/A' : submitData.name,
        email: submitData instanceof FormData ? 'N/A' : submitData.email,
        hasPassword: submitData instanceof FormData ? 'N/A' : !!submitData.password
      });

      await adminAPI.createAstrologer(submitData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/astrologers');
      }, 2000);
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error message:', err.message);

      let errorMessage = 'Failed to create astrologer';

      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || err.response.data?.error || errorMessage;
        const missingFields = err.response.data?.missingFields;
        const fieldErrors = err.response.data?.fieldErrors;
        const errors = err.response.data?.errors;

        if (missingFields && missingFields.length > 0) {
          errorMessage += `\nMissing fields: ${missingFields.join(', ')}`;
        }
        if (fieldErrors) {
          const fieldErrorMessages = Object.entries(fieldErrors).map(([field, msg]) => `${field}: ${msg}`);
          errorMessage += `\n${fieldErrorMessages.join('\n')}`;
        }
        if (errors && Array.isArray(errors)) {
          errorMessage += `\n${errors.join('\n')}`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Error setting up the request
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-astro-dark celestial-bg yantra-bg overflow-hidden">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="glass-card rounded-xl p-8 max-w-md w-full mx-4 mystical-glow border border-astro-gold/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-astro-gold to-divine-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-astro-dark" />
            </div>
            <h2 className="text-2xl font-cinzel font-bold text-black mb-2">
              Astrologer Created Successfully!
            </h2>
            <p className="text-black">Redirecting to astrologer management...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-astro-dark celestial-bg yantra-bg overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 border border-astro-gold rounded-full opacity-20 floating-element"></div>
        <div className="absolute top-1/4 right-20 w-24 h-24 border border-cosmic-pink rounded-full opacity-15 floating-element" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="zodiac-bg fixed inset-0"></div>
      <div className="om-pattern fixed inset-0"></div>

      <Navigation />

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/admin/astrologers')}
              className="mr-4 p-2 text-astro-gold hover:text-astro-gold-light transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-4xl font-cinzel font-bold text-black mb-2">
                Add New <span className="divine-text">Astrologer</span>
              </h1>
              <p className="text-black">Create a new astrologer account</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="glass-card rounded-xl mystical-glow border border-astro-gold/20 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <User className="inline h-4 w-4 mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <Star className="inline h-4 w-4 mr-2" />
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                    placeholder="Years of experience"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <DollarSign className="inline h-4 w-4 mr-2" />
                    Pricing (₹ per session)
                  </label>
                  <input
                    type="number"
                    name="pricing"
                    value={formData.pricing}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                    placeholder="Price per session"
                    min="0"
                  />
                </div>
              </div>

              {/* Specializations */}
              <div>
                <label className="block text-sm font-medium text-black mb-3">
                  Specializations
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specializationOptions.map((spec) => (
                    <label key={spec} className="flex items-center space-x-2 text-black">
                      <input
                        type="checkbox"
                        value={spec}
                        checked={formData.specialization.includes(spec)}
                        onChange={handleSpecializationChange}
                        className="rounded bg-astro-dark border-astro-gold focus:ring-astro-gold"
                      />
                      <span className="text-sm">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-black mb-3">
                  Languages
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {languageOptions.map((lang) => (
                    <label key={lang} className="flex items-center space-x-2 text-black">
                      <input
                        type="checkbox"
                        value={lang}
                        checked={formData.languages.includes(lang)}
                        onChange={handleLanguageChange}
                        className="rounded bg-astro-dark border-astro-gold focus:ring-astro-gold"
                      />
                      <span className="text-sm">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  <FileText className="inline h-4 w-4 mr-2" />
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                  placeholder="Brief bio about the astrologer..."
                />
              </div>

              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  <ImageIcon className="inline h-4 w-4 mr-2" />
                  Profile Picture
                </label>
                <div className="space-y-4">
                  {previewUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-astro-gold/30"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-astro-gold/30 rounded-lg p-6 text-center hover:border-astro-gold/50 transition-colors">
                      <Upload className="h-8 w-8 text-astro-gold mx-auto mb-2" />
                      <p className="text-black text-sm mb-2">Click to upload or drag and drop</p>
                      <p className="text-black text-xs">JPG, PNG, GIF, SVG or WebP (MAX. 5MB)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="profile-picture-upload"
                      />
                      <label
                        htmlFor="profile-picture-upload"
                        className="mt-3 inline-block px-4 py-2 bg-astro-gold/20 text-astro-gold rounded-lg hover:bg-astro-gold/30 transition-colors cursor-pointer"
                      >
                        Select Image
                      </label>
                    </div>
                  )}
                  {!previewUrl && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                    />
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/astrologers')}
                  className="px-6 py-3 bg-gray-600 text-black rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark font-semibold rounded-lg hover:shadow-mystical transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-astro-dark"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Create Astrologer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAstrologer;