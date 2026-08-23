import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { authAPI, buildAssetUrl } from '../../services/api';
import { Star, MapPin, Clock, BookOpen, Award, ArrowLeft, User } from 'lucide-react';

const AstrologerProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [astrologer, setAstrologer] = useState(location.state?.astrologer || null);
  const [loading, setLoading] = useState(!astrologer);
  const [error, setError] = useState(null);

  const specializationMap = {
    'vedic': 'Vedic Astrology',
    'relationship': 'Relationship',
    'career': 'Career & Finance',
    'health': 'Health & Wellness',
    'spiritual': 'Spiritual Growth'
  };

  useEffect(() => {
    if (!astrologer) {
      const fetchAstrologer = async () => {
        try {
          setLoading(true);
          const response = await authAPI.getAstrologers();
          const found = response.data.astrologers.find(a => a._id === id);
          if (found) {
            setAstrologer(found);
          } else {
            setError('Astrologer not found');
          }
        } catch (err) {
          setError('Failed to load astrologer details');
        } finally {
          setLoading(false);
        }
      };
      fetchAstrologer();
    }
  }, [id, astrologer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/images/our1.jpeg')" }}>
        <Navigation />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-astro-gold"></div>
        </div>
      </div>
    );
  }

  if (error || !astrologer) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/images/our1.jpeg')" }}>
        <Navigation />
        <div className="flex justify-center items-center h-96 text-center">
          <div className="bg-white/90 p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{error || 'Astrologer not found'}</h2>
            <button onClick={() => navigate('/astrologers')} className="px-6 py-2 bg-astro-gold text-white rounded-full">
              Back to Astrologers
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rawImage = astrologer.profilePicture || astrologer.image || astrologer.imageUrl || astrologer.photo;
  const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/images/our1.jpeg')" }}>
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <button
          onClick={() => navigate('/astrologers')}
          className="flex items-center text-astro-gold hover:text-divine-orange mb-8 transition-colors bg-white/80 px-4 py-2 rounded-full inline-flex font-medium shadow-sm"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to all astrologers
        </button>

        <div className="bg-white/90 backdrop-blur-md rounded-[2rem] p-8 md:p-12 shadow-2xl border border-black/10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-12">

            {/* Image Section - Centered on mobile, left on desktop */}
            <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
              <div className="w-full h-full rounded-full border-4 border-astro-gold shadow-xl overflow-hidden bg-gradient-to-br from-astro-gold to-divine-orange flex items-center justify-center">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={astrologer.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-6xl text-astro-dark">{astrologer.name.charAt(0)}</span>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 text-center md:text-left space-y-6">
              <div>
                <h1 className="text-4xl md:text-[35px] font-cinzel font-bold text-black mb-2">
                  {astrologer.name}
                </h1>
                <div className="flex items-center justify-center md:justify-start space-x-4 text-stone-900 mb-4">
                  {astrologer.experience && (
                    <span className="flex items-center">
                      <Clock className="h-5 w-5 mr-1.5 text-astro-gold" />
                      {astrologer.experience}+ Years
                    </span>
                  )}
                  {astrologer.rating > 0 && (
                    <span className="flex items-center">
                      <Star className="h-5 w-5 mr-1.5 text-yellow-400" />
                      {astrologer.rating.toFixed(1)} Rating
                    </span>
                  )}
                  {astrologer.totalReviews > 0 && (
                    <span className="flex items-center">
                      <User className="h-5 w-5 mr-1.5 text-astro-gold" />
                      {astrologer.totalReviews} Reviews
                    </span>
                  )}
                </div>

                {/* Specialties */}
                {astrologer.specialization && astrologer.specialization.length > 0 && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                    {astrologer.specialization.map(s => (
                      <span key={s} className="px-4 py-1.5 bg-astro-purple/10 text-astro-purple rounded-full text-sm font-medium">
                        {specializationMap[s] || s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bio / Brief */}
              <div className="border-t border-b border-black/5 py-6">
                <h3 className="text-xl font-bold mb-3 flex items-center justify-center md:justify-start">
                  <Award className="h-6 w-6 mr-2 text-astro-gold" />
                  About {astrologer.name}
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg text-justify">
                  {astrologer.bio || `${astrologer.name} is a renowned Vedic astrologer offering deep insights and guidance. Through years of practice and study, they help individuals find their true path and navigate life's challenges using ancient astrological wisdom.`}
                </p>
              </div>

              {/* Additional Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {astrologer.languages && astrologer.languages.length > 0 && (
                  <div className="flex items-start">
                    <BookOpen className="h-5 w-5 text-astro-gold mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-gray-500">Languages</p>
                      <p className="text-gray-800">{astrologer.languages.join(", ")}</p>
                    </div>
                  </div>
                )}
                {astrologer.placeOfBirth && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-astro-gold mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-gray-500">Location</p>
                      <p className="text-gray-800">{astrologer.placeOfBirth}</p>
                    </div>
                  </div>
                )}
                {astrologer.pricing && (
                  <div className="flex items-start">
                    <span className="font-bold text-astro-gold text-xl mr-3">$</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-500">Consultation Fee</p>
                      <p className="text-gray-800 font-bold">${astrologer.pricing} / session</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <div className={`w-3 h-3 rounded-full mr-3 mt-1.5 flex-shrink-0 ${astrologer.isAvailable !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="font-semibold text-sm text-gray-500">Status</p>
                    <p className={`${astrologer.isAvailable !== false ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      {astrologer.isAvailable !== false ? 'Available Now' : 'Currently Unavailable'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6">
                <button
                  className={`w-full md:w-auto px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-xl ${astrologer.isAvailable !== false
                    ? 'bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark hover:shadow-2xl'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                  disabled={astrologer.isAvailable === false}
                >
                  {astrologer.isAvailable !== false ? 'Book Consultation Now' : 'Not Available for Booking'}
                </button>
              </div>

              {/* Reviews Section */}
              <div className="mt-12 border-t border-black/10 pt-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center text-black">
                  <Star className="h-6 w-6 mr-2 text-astro-gold fill-current" />
                  Client Reviews & Ratings
                </h3>

                <div className="space-y-6">
                  {/* Mock Data for Reviews (Since there's no Review model in the backend currently) */}
                  {[
                    { id: 1, name: 'Rahul Sharma', rating: 5, comment: 'Very accurate predictions! Helped me a lot with my career choices.', date: 'Oct 15, 2023' },
                    { id: 2, name: 'Priya Singh', rating: 4, comment: 'Good session, very polite and explained things clearly.', date: 'Nov 02, 2023' },
                    { id: 3, name: 'Amit Patel', rating: 5, comment: 'Excellent remedies suggested. Feeling much more positive now.', date: 'Dec 10, 2023' }
                  ].map(review => (
                    <div key={review.id} className="bg-white/60 p-5 rounded-2xl border border-black/5 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{review.name}</p>
                          <p className="text-xs text-gray-500">{review.date}</p>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mt-2 text-sm italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">* Note: These are sample reviews. Real reviews functionality requires a backend update.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AstrologerProfile;
