import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Star, Calendar, User, MapPin, Clock, Award, BookOpen, Filter, Bookmark, BadgeCheck, MessageCircle, ScrollText, Tag, ChevronDown } from 'lucide-react';
import { authAPI, buildAssetUrl } from '../services/api';

const OurAstrologers = () => {
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdminAddedOnly, setShowAdminAddedOnly] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const specialties = [
    { id: 'all', name: 'All Specialties' },
    { id: 'vedic', name: 'Vedic Astrology' },
    { id: 'numerology', name: 'Numerology' },
    { id: 'palmistry', name: 'Palmistry' },
    { id: 'tarot_reading', name: 'Tarot Reading' },
    { id: 'vastu_shastra', name: 'Vastu Shastra' },
    { id: 'gemstone_consultation', name: 'Gemstone Consultation' },
    { id: 'marriage_matching', name: 'Marriage Matching' },
    { id: 'health_astrology', name: 'Health Astrology' },
    { id: 'financial_astrology', name: 'Financial Astrology' },
    { id: 'career_guidance', name: 'Career Guidance' }
  ];

  // Specialization mapping for display
  const specializationMap = {
    'vedic': 'Vedic Astrology',
    'numerology': 'Numerology',
    'palmistry': 'Palmistry',
    'tarot_reading': 'Tarot Reading',
    'vastu_shastra': 'Vastu Shastra',
    'gemstone_consultation': 'Gemstone Consultation',
    'marriage_matching': 'Marriage Matching',
    'health_astrology': 'Health Astrology',
    'financial_astrology': 'Financial Astrology',
    'career_guidance': 'Career Guidance'
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

      const specialtyName = getSpecialtyName(selectedSpecialty);
      return astrologer.specialization && astrologer.specialization.some(s =>
        s === selectedSpecialty ||
        s.toLowerCase() === selectedSpecialty.toLowerCase() ||
        s.toLowerCase() === specialtyName.toLowerCase()
      );
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

        {/* Fixed Dropdown */}
        <div className="fixed top-24 right-4 md:right-8 z-50">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center px-5 py-2.5 bg-yellow-300 text-astro-dark rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Filter className="w-4 h-4 mr-2" />
              Select Astrologer
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden py-2 max-h-[60vh] overflow-y-auto z-50">
                {specialties.map((specialty) => (
                  <button
                    key={specialty.id}
                    onClick={() => {
                      setSelectedSpecialty(specialty.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-astro-gold/10 ${selectedSpecialty === specialty.id ? 'bg-astro-gold/20 font-bold text-astro-dark' : 'text-gray-700'
                      }`}
                  >
                    {specialty.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-6 p-6 md:p-8 rounded-3xl border border-black/10 bg-white/85 backdrop-blur-lg shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/50 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex-1 space-y-4 text-center lg:text-left">
              <div>
                <p className="text-astro-gold font-hindi text-lg mb-1">गुरुर्ब्रह्मा गुरुर्विष्णुः</p>
                <p className="text-gray-700 text-xs uppercase tracking-[0.25em]">Guidance beyond stars</p>
              </div>
              <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-black leading-tight">
                Our Sacred <span className="text-astro-gold">Astrologers</span>
              </h1>
              <p className="text-base text-gray-700 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Meet our distinguished panel of Vedic astrology experts. Each guru blends timeless scriptures,
                meditation, and modern insight to gently steer your journey.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-xs uppercase tracking-[0.2em] text-gray-600">
                <span className="px-3 py-1.5 bg-black/5 rounded-full">500+ Experts</span>
                <span className="px-3 py-1.5 bg-black/5 rounded-full">24/7 Guidance</span>
                <span className="px-3 py-1.5 bg-black/5 rounded-full">15+ Languages</span>
              </div>
            </div>
            <div className="relative z-10 flex-1 w-full mt-4 lg:mt-0">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-black/5 shadow-md">
                  <p className="text-xs text-gray-600 uppercase tracking-[0.3em] mb-1">Average Rating</p>
                  <p className="text-2xl font-bold text-black mb-1.5">4.9<span className="text-lg text-gray-500">/5</span></p>
                  <p className="text-xs text-gray-500">Verified by over 1M consultations.</p>
                </div>
                <div className="flex-1 p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-black/5 shadow-md">
                  <p className="text-xs text-gray-600 uppercase tracking-[0.3em] mb-1">Experience</p>
                  <p className="text-2xl font-bold text-black mb-1.5">20+ <span className="text-lg text-gray-500">yrs</span></p>
                  <p className="text-xs text-gray-500">Average practice across our mentors.</p>
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
                    onClick={() => navigate(`/astrologers/${astrologer._id}`, { state: { astrologer } })}
                    className="bg-emerald-100 rounded-2xl p-4 border border-black/10 shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1 flex flex-row h-full cursor-pointer relative"
                  >
                    {/* Left Column - Image & Stats */}
                    <div className="flex flex-col items-center w-1/3 pr-4 border-r border-gray-100">
                      <div className="relative mb-3 mt-2">
                        {(() => {
                          const rawImage = astrologer.profilePicture || astrologer.image || astrologer.imageUrl || astrologer.photo;
                          const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;
                          const hasImageError = imageErrors.has(astrologer._id);
                          const showImage = imageSrc && !hasImageError;

                          return (
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border border-gray-200">
                              {showImage ? (
                                <img
                                  src={imageSrc}
                                  alt={astrologer.name}
                                  className="w-full h-full object-cover"
                                  onError={() => setImageErrors(prev => new Set([...prev, astrologer._id]))}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-astro-gold to-divine-orange flex items-center justify-center text-3xl text-white font-bold">
                                  {astrologer.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        {/* Verified Badge */}
                        <div className="absolute -bottom-1 -left-1 bg-white rounded-full p-0.5">
                          <BadgeCheck className="w-6 h-6 text-blue-500 fill-current" />
                        </div>
                      </div>

                      {/* Offer Tag */}
                      <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center mb-2 transform -rotate-6">
                        <Tag className="w-3 h-3 mr-1" />
                        OFFER
                      </div>

                      {/* Followers */}
                      <div className="flex items-center text-xs text-gray-500 font-medium">
                        <User className="w-3.5 h-3.5 mr-1 text-orange-500" />
                        Followers {astrologer.followersCount !== undefined ? astrologer.followersCount : (astrologer.followers?.length || 0)}
                      </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="flex flex-col w-2/3 pl-4 justify-between">
                      <div>
                        {/* Name Row */}
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            <div className={`w-2.5 h-2.5 rounded-full mr-2 ${astrologer.isAvailable !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <h3 className="text-lg font-bold text-gray-900 truncate max-w-[140px] md:max-w-[180px]">
                              {astrologer.name}
                            </h3>
                          </div>
                          <Bookmark className="w-5 h-5 text-orange-400 cursor-pointer hover:fill-current transition-colors" />
                        </div>

                        {/* Specialization */}
                        <div className="flex items-center text-sm text-red-900 mb-1.5">
                          <Star className="w-4 h-4 mr-1.5 text-gray-400" />
                          <span className="truncate">
                            {astrologer.specialization && astrologer.specialization.length > 0
                              ? astrologer.specialization.map(s => specializationMap[s] || s).join(', ')
                              : 'Vedic Astrology'}
                          </span>
                        </div>

                        {/* Languages & Experience */}
                        <div className="flex items-center justify-between text-sm text-black mb-2">
                          <div className="flex items-center truncate mr-2 max-w-[60%]">
                            <BookOpen className="w-4 h-4 mr-1.5 text-black flex-shrink-0" />
                            <span className="truncate">
                              {astrologer.languages && astrologer.languages.length > 0 ? astrologer.languages.join(", ") : 'English, Hindi'}
                            </span>
                          </div>
                          <div className="flex items-center flex-shrink-0">
                            <ScrollText className="w-4 h-4 mr-1.5 text-black" />
                            <span>{astrologer.experience || 1} Exp.</span>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center text-sm mb-2">
                          <span className="font-semibold text-gray-900">₹ {astrologer.pricing || 16}/min</span>
                          <span className="text-gray-400 line-through ml-2 text-xs">₹ {(astrologer.pricing || 16) * 6}/min</span>
                        </div>
                      </div>

                      {/* Bottom Row - Rating & Action */}
                      <div className="flex justify-between items-end mt-2">
                        <div className="flex flex-col">
                          <div className="flex items-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.floor(astrologer.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                            <span className="ml-1 text-xs font-semibold text-gray-700">{astrologer.rating ? astrologer.rating.toFixed(1) : "0.0"}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <User className="w-3 h-3 mr-1 text-orange-500" />
                            {astrologer.totalReviews || 0}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/book-appointment', { state: { astrologerId: astrologer._id } });
                          }}
                          className={`flex items-center px-4 py-1.5 rounded-full text-sm font-semibold transition-all shadow-md ${astrologer.isAvailable !== false
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-400 text-white cursor-not-allowed'
                            }`}
                          disabled={astrologer.isAvailable === false}
                        >
                          <MessageCircle className="w-4 h-4 mr-1.5" />
                          Book
                        </button>
                      </div>
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

        {/* Zoomed Image Modal */}
        {zoomedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 cursor-pointer"
            onClick={() => setZoomedImage(null)}
          >
            <div
              className="relative max-w-md w-full overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/85 text-white rounded-full p-2 transition-colors duration-200 z-10"
                onClick={() => setZoomedImage(null)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={zoomedImage}
                alt="Zoomed Astrologer"
                className="w-full h-auto rounded-2xl object-cover aspect-square"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OurAstrologers;