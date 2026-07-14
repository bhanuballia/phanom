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
  Edit,
  ArrowLeft
} from 'lucide-react';

const ViewAstrologer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [astrologer, setAstrologer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAstrologer();
  }, [id]);

  const fetchAstrologer = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAstrologerById(id);
      setAstrologer(response.data.astrologer);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch astrologer details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-astro-dark celestial-bg yantra-bg overflow-hidden">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-black text-xl">Loading astrologer details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-astro-dark celestial-bg yantra-bg overflow-hidden">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="glass-card rounded-xl p-8 max-w-md w-full mx-4 mystical-glow border border-red-500/30 text-center">
            <div className="text-red-400 text-xl mb-4">Error</div>
            <p className="text-black mb-6">{error}</p>
            <button
              onClick={() => navigate('/admin/astrologers')}
              className="px-4 py-2 bg-astro-gold text-astro-dark rounded-lg"
            >
              Back to Management
            </button>
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
        <div className="absolute top-1/4 right-20 w-24 h-24 border border-cosmic-pink rounded-full opacity-15 floating-element" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="zodiac-bg fixed inset-0"></div>
      <div className="om-pattern fixed inset-0"></div>

      <Navigation />

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/astrologers')}
                className="mr-4 p-2 text-astro-gold hover:text-astro-gold-light transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-4xl font-cinzel font-bold text-black mb-2">
                  Astrologer <span className="divine-text">Details</span>
                </h1>
                <p className="text-black">View astrologer information</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/admin/astrologers/${id}/edit`)}
              className="px-4 py-2 bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark font-semibold rounded-lg hover:shadow-mystical transition-all duration-300 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Astrologer
            </button>
          </div>

          {/* Astrologer Details */}
          <div className="glass-card rounded-xl mystical-glow border border-astro-gold/20 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Picture */}
              <div className="md:col-span-1">
                <div className="w-48 h-48 bg-gradient-to-br from-astro-gold to-divine-orange rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="h-24 w-24 text-astro-dark" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-cinzel font-bold text-black mb-2">
                    {astrologer.name}
                  </h2>
                  <p className="text-black mb-4">
                    {astrologer.specialization?.join(', ') || 'General Astrologer'}
                  </p>
                  <div className="flex justify-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      astrologer.isAvailable 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {astrologer.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      astrologer.isVerified 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {astrologer.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="md:col-span-2 space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-astro-gold mr-3" />
                      <div>
                        <p className="text-black text-sm">Email</p>
                        <p className="text-black">{astrologer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-astro-gold mr-3" />
                      <div>
                        <p className="text-black text-sm">Phone</p>
                        <p className="text-black">{astrologer.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Birth Details */}
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">Birth Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-astro-gold mr-3" />
                      <div>
                        <p className="text-black text-sm">Date of Birth</p>
                        <p className="text-black">
                          {astrologer.dateOfBirth 
                            ? new Date(astrologer.dateOfBirth).toLocaleDateString('en-IN') 
                            : 'Not provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-astro-gold mr-3" />
                      <div>
                        <p className="text-black text-sm">Time of Birth</p>
                        <p className="text-black">{astrologer.timeOfBirth || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-astro-gold mr-3" />
                      <div>
                        <p className="text-black text-sm">Place of Birth</p>
                        <p className="text-black">{astrologer.placeOfBirth || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-black text-sm">Experience</p>
                      <p className="text-black">{astrologer.experience || 0} years</p>
                    </div>
                    <div>
                      <p className="text-black text-sm">Pricing</p>
                      <p className="text-black">₹{astrologer.pricing || 100}/session</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-black text-sm">Languages</p>
                      <p className="text-black">
                        {astrologer.languages?.join(', ') || 'Hindi, English'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-black text-sm">Specializations</p>
                      <p className="text-black">
                        {astrologer.specialization?.join(', ') || 'General Astrology'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {astrologer.bio && (
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-4">Bio</h3>
                    <p className="text-black whitespace-pre-wrap">{astrologer.bio}</p>
                  </div>
                )}

                {/* Metadata */}
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-black text-sm">Registration Date</p>
                      <p className="text-black">
                        {new Date(astrologer.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-black text-sm">Last Updated</p>
                      <p className="text-black">
                        {new Date(astrologer.updatedAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-black text-sm">Registration Source</p>
                      <p className="text-black capitalize">
                        {astrologer.registrationSource?.replace('_', ' ') || 'web_form'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAstrologer;