import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Star, Calendar, User, MapPin, Clock, Award, BookOpen, Filter } from 'lucide-react';
import { authAPI, buildAssetUrl } from '../services/api';

const OurAstrologers = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdminAddedOnly, setShowAdminAddedOnly] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());

  const specialties = [
    { id: 'all', name: 'All Specialties' },
    { id: 'vedic', name: 'Vedic Astrology' },
    { id: 'relationship', name: 'Relationship' },
    { id: 'career', name: 'Career & Finance' },
    { id: 'health', name: 'Health & Wellness' },
    { id: 'spiritual', name: 'Spiritual Growth' }
  ];

  // Specialization mapping for display
  const specializationMap = {
    'vedic': 'Vedic Astrology',
    'relationship': 'Relationship',
    'career': 'Career & Finance',
    'health': 'Health & Wellness',
    'spiritual': 'Spiritual Growth'
  };

  useEffect(() => {
    fetchAstrologers();
  }, [showAdminAddedOnly]);

  const fetchAstrologers = async () => {
    try {
      setLoading(true);
      // Use the public auth API endpoint which doesn't require admin permissions
      const response = await authAPI.getAstrologers();
      console.log('Fetched astrologers:', response.data.astrologers);
      // Debug: Log profile pictures
      response.data.astrologers.forEach(astrologer => {
        if (astrologer.profilePicture) {
          console.log(`Astrologer ${astrologer.name} profilePicture:`, astrologer.profilePicture);
          console.log(`Built URL:`, buildAssetUrl(astrologer.profilePicture));
        }
      });
      setAstrologers(response.data.astrologers);
      setError(null);
    } catch (err) {
      console.error('Error fetching astrologers:', err);
      setError('Failed to load astrologers');
    } finally {
      setLoading(false);
    }
  };

  const getSpecialtyName = (id) => {
    const specialty = specialties.find(s => s.id === id);
    return specialty ? specialty.name : id;
  };

  // Filter astrologers based on selected specialty and admin-added filter
  const filteredAstrologers = astrologers
    .filter(astrologer => {
      // Filter by admin-added if enabled
      if (showAdminAddedOnly && astrologer.registrationSource !== 'admin_created') {
        return false;
      }
      
      // Filter by specialty
      if (selectedSpecialty === 'all') {
        return true;
      }
      
      return astrologer.specialization && astrologer.specialization.includes(selectedSpecialty);
    });

  if (loading) {
    return (
      <div
        className="relative min-h-screen bg-cover bg-center bg-fixed overflow-hidden"
        style={{ backgroundImage: "url('/images/our1.jpeg')" }}
      >
        <div className="relative z-10">
          <Navigation />
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-astro-gold"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="relative min-h-screen bg-cover bg-center bg-fixed overflow-hidden"
        style={{ backgroundImage: "url('/images/our1.jpeg')" }}
      >
        <div className="relative z-10">
          <Navigation />
          <div className="flex justify-center items-center h-96">
            <div className="text-red-600 text-center bg-white/85 border border-red-200 rounded-2xl px-8 py-6 shadow-lg">
              <p className="text-xl font-semibold mb-4">{error}</p>
              <button 
                onClick={fetchAstrologers}
                className="px-5 py-2.5 bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark rounded-full font-medium shadow-md"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed overflow-hidden"
      style={{ backgroundImage: "url('/images/our1.jpeg')" }}
    >
      <div className="relative z-10">
        <Navigation />

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 p-10 rounded-[36px] border border-black/10 bg-white/85 backdrop-blur-lg shadow-[0_20px_70px_rgba(0,0,0,0.15)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/50 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex-1 space-y-6 text-center lg:text-left">
              <div>
                <p className="text-astro-gold font-hindi text-xl mb-2">गुरुर्ब्रह्मा गुरुर्विष्णुः</p>
                <p className="text-gray-700 text-sm uppercase tracking-[0.25em]">Guidance beyond stars</p>
              </div>
              <h1 className="text-5xl md:text-6xl font-cinzel font-bold text-black leading-tight">
                Our Sacred <span className="text-astro-gold">Astrologers</span>
              </h1>
              <p className="text-xl text-gray-700 leading-relaxed">
                Meet our distinguished panel of Vedic astrology experts. Each guru blends timeless scriptures,
                meditation, and modern insight to gently steer your journey.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm uppercase tracking-[0.3em] text-gray-600">
                <span className="px-4 py-2 bg-black/5 rounded-full">500+ Experts</span>
                <span className="px-4 py-2 bg-black/5 rounded-full">24/7 Guidance</span>
                <span className="px-4 py-2 bg-black/5 rounded-full">15+ Languages</span>
              </div>
            </div>
            <div className="relative z-10 flex-1 w-full">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-black/5 shadow-lg">
                  <p className="text-sm text-gray-600 uppercase tracking-[0.4em] mb-2">Average Rating</p>
                  <p className="text-4xl font-bold text-black mb-3">4.9<span className="text-2xl">/5</span></p>
                  <p className="text-gray-600">Verified by over 1M consultations worldwide.</p>
                </div>
                <div className="flex-1 p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-black/5 shadow-lg">
                  <p className="text-sm text-gray-600 uppercase tracking-[0.4em] mb-2">Experience</p>
                  <p className="text-4xl font-bold text-black mb-3">20+ <span className="text-2xl">yrs</span></p>
                  <p className="text-gray-600">Average practice across our senior mentors.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/90 border border-black/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-8">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap gap-4">
                  {specialties.map((specialty) => (
                    <button
                      key={specialty.id}
                      onClick={() => setSelectedSpecialty(specialty.id)}
                      className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                        selectedSpecialty === specialty.id
                          ? 'bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark shadow-lg'
                          : 'bg-white/80 text-gray-700 hover:text-astro-gold border border-black/10 shadow-sm'
                      }`}
                    >
                      {specialty.name}
                    </button>
                  ))}
                </div>
                
                {/* Admin Added Filter */}
                <div className="flex items-center">
                  <button
                    onClick={() => setShowAdminAddedOnly(!showAdminAddedOnly)}
                    className={`flex items-center px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                      showAdminAddedOnly
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-white/80 text-gray-700 hover:text-purple-600 border border-black/10 shadow-sm'
                    }`}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showAdminAddedOnly ? 'Admin Added Only' : 'All Astrologers'}
                  </button>
                </div>
              </div>
          </div>
        </div>
      </section>

        {/* Astrologers Grid */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredAstrologers.length === 0 ? (
            <div className="text-center py-12">
                <p className="text-xl text-gray-700 bg-white/85 inline-block px-6 py-3 rounded-full border border-black/5 shadow-md">
                  No astrologers found for the selected filters.
                </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAstrologers.map((astrologer) => (
                <div
                  key={astrologer._id}
                    className="bg-white/90 rounded-2xl p-6 border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.2)] transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Profile Header */}
                  <div className="text-center mb-6">
                      {(() => {
                        const rawImage =
                          astrologer.profilePicture ||
                          astrologer.image ||
                          astrologer.imageUrl ||
                          astrologer.photo;
                        const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;
                        const hasImageError = imageErrors.has(astrologer._id);
                        const showImage = imageSrc && !hasImageError;
                        
                        // Debug logging
                        if (rawImage && !hasImageError) {
                          console.log(`Rendering image for ${astrologer.name}:`, {
                            rawImage,
                            imageSrc,
                            astrologerId: astrologer._id
                          });
                        }
                        
                        return (
                          <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden shadow-inner relative">
                            {showImage ? (
                              <img
                                src={imageSrc}
                                alt={astrologer.name}
                                className="w-full h-full object-cover"
                                onLoad={() => {
                                  console.log(`Image loaded successfully for ${astrologer.name}:`, imageSrc);
                                }}
                                onError={(e) => {
                                  console.error(`Image failed to load for ${astrologer.name}:`, {
                                    imageSrc,
                                    rawImage: astrologer.profilePicture,
                                    error: e
                                  });
                                  setImageErrors(prev => new Set([...prev, astrologer._id]));
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-astro-gold to-divine-orange flex items-center justify-center text-3xl text-astro-dark">
                                {astrologer.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      <h3 className="text-xl font-cinzel font-bold text-astro-gold mb-1">
                      {astrologer.name}
                    </h3>
                      <p className="text-gray-700 mb-2">
                      {astrologer.experience ? `${astrologer.experience}+ Years Experience` : 'Astrologer'}
                    </p>
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {astrologer.experience ? `${astrologer.experience}+ Years` : 'Experienced'}
                      </div>
                      {astrologer.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-400" />
                          {astrologer.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    
                    {/* Availability Status */}
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        astrologer.isAvailable !== false 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          astrologer.isAvailable !== false ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        {astrologer.isAvailable !== false ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    
                    {/* Admin Added Badge */}
                    {astrologer.registrationSource === 'admin_created' && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Admin Added
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4 mb-6">
                    {astrologer.bio && (
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {astrologer.bio}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      {astrologer.placeOfBirth && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-astro-gold mr-2" />
                          <span className="text-gray-700">{astrologer.placeOfBirth}</span>
                        </div>
                      )}
                      {astrologer.totalReviews && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-astro-gold mr-2" />
                          <span className="text-gray-700">{astrologer.totalReviews}+ consultations</span>
                        </div>
                      )}
                      {astrologer.languages && astrologer.languages.length > 0 && (
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-astro-gold mr-2" />
                          <span className="text-gray-700">{astrologer.languages.join(", ")}</span>
                        </div>
                      )}
                    </div>

                    {/* Specialties */}
                    {astrologer.specialization && astrologer.specialization.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-astro-gold mb-2">Specialties:</h4>
                        <div className="flex flex-wrap gap-2">
                          {astrologer.specialization.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-astro-purple/15 text-astro-purple text-xs rounded-full border border-astro-purple/30"
                            >
                              {specializationMap[specialty] || specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="border-t border-black/5 pt-4">
                    {astrologer.pricing && (
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold divine-text">${astrologer.pricing}</span>
                        <span className="text-gray-400 text-sm">per session</span>
                      </div>
                    )}
                    <button 
                      className={`w-full py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                        astrologer.isAvailable !== false
                          ? 'bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark hover:shadow-mystical'
                          : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                      }`}
                      disabled={astrologer.isAvailable === false}
                    >
                      <Calendar className="h-4 w-4 inline mr-2" />
                      {astrologer.isAvailable !== false ? 'Book Consultation' : 'Not Available'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="rounded-2xl p-12 border border-black/10 bg-white/90 backdrop-blur-md shadow-[0_35px_90px_rgba(0,0,0,0.2)]">
              <h2 className="text-3xl font-cinzel font-bold text-black mb-4">
                Can't Find the Right <span className="text-astro-gold">Astrologer</span>?
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Our support team will help you connect with the perfect astrologer for your specific needs.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-astro-purple via-mystic-indigo to-cosmic-blue text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Award className="h-5 w-5 mr-2" />
                Get Personalized Recommendation
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OurAstrologers;