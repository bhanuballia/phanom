import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { authAPI, buildAssetUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Star, MapPin, Clock, BookOpen, Award, ArrowLeft, User, Heart, Send, Check, Calendar } from 'lucide-react';

const AstrologerProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [astrologer, setAstrologer] = useState(location.state?.astrologer || null);
  const [loading, setLoading] = useState(!astrologer);
  const [error, setError] = useState(null);

  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewFilter, setReviewFilter] = useState('week'); // 'week' or 'all'
  const [userRating, setUserRating] = useState(5);
  const [userExperience, setUserExperience] = useState('Good');
  const [hoverRating, setHoverRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

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

  // Sync follow state and fetch real reviews
  useEffect(() => {
    if (astrologer) {
      const count = astrologer.followersCount !== undefined
        ? astrologer.followersCount
        : (astrologer.followers ? astrologer.followers.length : 0);
      setFollowersCount(count);

      if (user && astrologer.followers) {
        const following = astrologer.followers.some(
          fId => (fId._id || fId).toString() === (user._id || user.id).toString()
        );
        setIsFollowing(following);
      }

      const fetchReviews = async () => {
        try {
          setReviewsLoading(true);
          const res = await authAPI.getReviews(astrologer._id);
          setReviews(res.data.reviews || []);
        } catch (err) {
          console.error('Failed to load reviews:', err);
        } finally {
          setReviewsLoading(false);
        }
      };
      fetchReviews();
    }
  }, [astrologer, user]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      alert('Please log in to follow this astrologer');
      return;
    }
    try {
      setFollowLoading(true);
      const res = await authAPI.followAstrologer(astrologer._id);
      setIsFollowing(res.data.isFollowing);
      setFollowersCount(res.data.followersCount);
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert(err.response?.data?.message || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setReviewError('Please log in to submit a rating and review');
      return;
    }
    if (!userComment.trim()) {
      setReviewError('Please write a review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      setReviewSuccess('');

      const formattedComment = `[Experience: ${userExperience}] ${userComment}`.trim();

      const res = await authAPI.submitReview(astrologer._id, {
        rating: userRating,
        comment: formattedComment
      });

      setReviewSuccess('Thank you! Your review has been submitted.');
      setUserComment('');

      // Update astrologer state with new rating and totalReviews
      setAstrologer(prev => ({
        ...prev,
        rating: res.data.rating,
        totalReviews: res.data.totalReviews
      }));

      // Refresh reviews list
      const revRes = await authAPI.getReviews(astrologer._id);
      setReviews(revRes.data.reviews || []);

      setTimeout(() => setReviewSuccess(''), 4000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

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
            <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 flex flex-col items-center">
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

              {/* Follow Button Under Picture */}
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`mt-4 w-full max-w-[200px] py-2.5 px-4 rounded-full font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${isFollowing
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:opacity-90'
                  }`}
              >
                <Heart className={`h-4 w-4 ${isFollowing ? 'fill-current text-white' : 'text-slate-950'}`} />
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </button>
            </div>

            {/* Details Section */}
            <div className="flex-1 text-center md:text-left space-y-6">
              <div>
                <h1 className="text-4xl md:text-[35px] font-cinzel font-bold text-black mb-2">
                  {astrologer.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-stone-900 mb-4">
                  {astrologer.experience && (
                    <span className="flex items-center">
                      <Clock className="h-5 w-5 mr-1.5 text-astro-gold" />
                      {astrologer.experience}+ Years
                    </span>
                  )}
                  <span className="flex items-center">
                    <Star className="h-5 w-5 mr-1.5 text-yellow-400 fill-current" />
                    {astrologer.rating ? astrologer.rating.toFixed(1) : '0.0'} Rating
                  </span>
                  <span className="flex items-center">
                    <User className="h-5 w-5 mr-1.5 text-astro-gold" />
                    {astrologer.totalReviews || 0} Reviews
                  </span>
                  <span className="flex items-center font-medium text-orange-600">
                    <Heart className="h-4 w-4 mr-1 text-orange-500 fill-current" />
                    {followersCount} Followers
                  </span>
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
                    <span className="font-bold text-amber-500 text-lg mr-3">₹</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-500">Live Call / Consultation Rate</p>
                      <p className="text-gray-900 font-bold">₹{astrologer.pricing} / min</p>
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

              {/* Reviews & Ratings Section */}


              {/* Submit Review Form */}







              {/* Experience Dropdown */}


              {/* Comment text area */}



              {/* Filter Header for Past 1 Week Ratings */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Ratings & Experience
                  </h3>
                </div>
                <div className="flex items-center bg-white/80 p-1 rounded-xl border border-gray-200 text-xs font-semibold shadow-sm">
                  {(() => {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    const weekCount = reviews.filter(r => new Date(r.createdAt) >= oneWeekAgo).length;
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => setReviewFilter('week')}
                          className={`px-3 py-1.5 rounded-lg transition ${reviewFilter === 'week'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          Past 1 Week ({weekCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewFilter('all')}
                          className={`px-3 py-1.5 rounded-lg transition ${reviewFilter === 'all'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          All Time ({reviews.length})
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Real Reviews List */}
              {reviewsLoading ? (
                <div className="py-6 text-center text-sm text-gray-500">Loading reviews...</div>
              ) : (
                (() => {
                  const oneWeekAgo = new Date();
                  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                  const filteredReviews = reviewFilter === 'week'
                    ? reviews.filter(r => new Date(r.createdAt) >= oneWeekAgo)
                    : reviews;

                  if (filteredReviews.length === 0) {
                    return (
                      <div className="bg-white/70 p-6 rounded-2xl border border-black/5 text-center text-gray-600 text-sm">
                        {reviewFilter === 'week' ? (
                          <div>
                            <p className="font-medium text-gray-700">No ratings given in the past 1 week.</p>
                            {reviews.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setReviewFilter('all')}
                                className="mt-2 text-xs text-amber-600 hover:underline font-semibold"
                              >
                                View all {reviews.length} previous review{reviews.length > 1 ? 's' : ''}
                              </button>
                            )}
                          </div>
                        ) : (
                          <p>No reviews yet. Be the first to review {astrologer.name}!</p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filteredReviews.map(review => {
                        const expMatch = review.comment?.match(/\[Experience:\s*([^\]]+)\]/i);
                        let experience = expMatch ? expMatch[1].trim() : null;
                        if (!experience) {
                          if (review.rating >= 4.5) experience = 'good';
                          else if (review.rating >= 4) experience = 'good';
                          else if (review.rating >= 3) experience = 'satisfactory';
                          else experience = 'bad';
                        }
                        const cleanComment = review.comment
                          ? review.comment.replace(/\[Experience:\s*[^\]]+\]\s*/i, '').trim()
                          : '';

                        return (
                          <div
                            key={review._id}
                            className="bg-white/90 p-5 rounded-2xl border border-black/5 shadow-sm space-y-3"
                          >
                            {/* Header displaying: UserName, Rating - X, Experience - Y */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold flex items-center justify-center text-sm shadow">
                                  {(review.userName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 text-base">
                                    {review.userName || 'Verified Client'}
                                  </h4>
                                  <span className="text-xs text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>

                              {/* Formatted Rating & Experience Badges */}
                              <div className="flex flex-wrap items-center gap-2.5 text-sm">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-semibold shadow-xs">
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                  <span>Rating - {review.rating}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium shadow-xs">
                                  <span>Experience - {experience.toLowerCase()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Comment text if any */}
                            {cleanComment && (
                              <p className="text-gray-700 text-sm italic pl-2 border-l-2 border-amber-400">
                                "{cleanComment}"
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default AstrologerProfile;
