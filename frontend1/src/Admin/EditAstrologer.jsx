import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  ArrowLeft
} from 'lucide-react';

const EditAstrologer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: [],
    experience: '',
    languages: ['Hindi', 'English'],
    pricing: 100,
    bio: '',
    profilePicture: '',
    isAvailable: true,
    isVerified: false
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    fetchAstrologer();
  }, [id]);

  const fetchAstrologer = async () => {
    try {
      setFetching(true);
      const response = await adminAPI.getAstrologerById(id);
      const astrologer = response.data.astrologer;

      // Format the data for the form
      setFormData({
        name: astrologer.name || '',
        email: astrologer.email || '',
        phone: astrologer.phone || '',
        specialization: astrologer.specialization || [],
        experience: astrologer.experience || '',
        languages: astrologer.languages || ['Hindi', 'English'],
        pricing: astrologer.pricing || 100,
        bio: astrologer.bio || '',
        profilePicture: astrologer.profilePicture || '',
        isAvailable: astrologer.isAvailable !== undefined ? astrologer.isAvailable : true,
        isVerified: astrologer.isVerified || false
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch astrologer details');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'isAvailable' || name === 'isVerified') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminAPI.updateAstrologer(id, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/astrologers');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update astrologer');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-astro-dark celestial-bg yantra-bg overflow-hidden">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-black text-xl">Loading astrologer details...</div>
        </div>
      </div>
    );
  }

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
              Astrologer Updated Successfully!
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
                Edit <span className="divine-text">Astrologer</span>
              </h1>
              <p className="text-black">Update astrologer information</p>
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
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <DollarSign className="inline h-4 w-4 mr-2" />
                    Pricing (₹ per session) *
                  </label>
                  <input
                    type="number"
                    name="pricing"
                    value={formData.pricing}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="w-full px-4 py-3 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                    placeholder="Enter pricing"
                  />
                </div>
              </div>


              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  <Star className="inline h-4 w-4 mr-2" />
                  Experience (years)
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                  placeholder="Enter years of experience"
                />
              </div>

              {/* Specializations */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Specializations
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specializationOptions.map((spec) => (
                    <div key={spec} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`spec-${spec}`}
                        value={spec}
                        checked={formData.specialization.includes(spec)}
                        onChange={handleSpecializationChange}
                        className="h-4 w-4 text-astro-gold focus:ring-astro-gold border-gray-600 rounded"
                      />
                      <label htmlFor={`spec-${spec}`} className="ml-2 text-black">
                        {spec}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Languages
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {languageOptions.map((lang) => (
                    <div key={lang} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`lang-${lang}`}
                        value={lang}
                        checked={formData.languages.includes(lang)}
                        onChange={handleLanguageChange}
                        className="h-4 w-4 text-astro-gold focus:ring-astro-gold border-gray-600 rounded"
                      />
                      <label htmlFor={`lang-${lang}`} className="ml-2 text-black">
                        {lang}
                      </label>
                    </div>
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
                  rows="4"
                  className="w-full px-4 py-3 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                  placeholder="Enter astrologer bio"
                ></textarea>
              </div>

              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-astro-gold focus:ring-astro-gold border-gray-600 rounded"
                  />
                  <label htmlFor="isAvailable" className="ml-2 text-black">
                    Available for appointments
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isVerified"
                    name="isVerified"
                    checked={formData.isVerified}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-astro-gold focus:ring-astro-gold border-gray-600 rounded"
                  />
                  <label htmlFor="isVerified" className="ml-2 text-black">
                    Verified astrologer
                  </label>
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
                  className="px-6 py-3 bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark font-semibold rounded-lg hover:shadow-mystical transition-all duration-300 flex items-center disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Astrologer
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

export default EditAstrologer;