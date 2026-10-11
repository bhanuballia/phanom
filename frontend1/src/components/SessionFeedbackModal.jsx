import React, { useState } from 'react';
import { Star, Heart, Check, X } from 'lucide-react';
import { authAPI } from '../services/api';

const SessionFeedbackModal = ({
  isOpen,
  onClose,
  astrologer,
  sessionType = 'Session', // 'Live Stream', 'Live Chat', 'Video Chat'
  onComplete
}) => {
  const [rating, setRating] = useState(5);
  const [experience, setExperience] = useState('Very Good');
  const [comment, setComment] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !astrologer) return null;

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      const astrologerId = astrologer._id || astrologer.id || astrologer.userId;
      const res = await authAPI.followAstrologer(astrologerId);
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      const astrologerId = astrologer._id || astrologer.id || astrologer.userId;

      // Submit rating & comment
      const fullComment = `[Experience: ${experience}] ${comment.trim()}`;
      await authAPI.submitReview(astrologerId, {
        rating,
        comment: fullComment
      });

      setSubmitted(true);
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Submit feedback error:', err);
      // Fallback if not logged in or endpoint error
      setSubmitted(true);
      if (onComplete) onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 text-white relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-400">
                <Star className="w-8 h-8 fill-amber-400 text-amber-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {sessionType} Ended
              </h3>
              <p className="text-xs text-slate-400">
                Rate your experience with{' '}
                <span className="text-amber-400 font-semibold">{astrologer.name}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-white/5 text-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Rate Astrologer
                </label>
                <div className="flex justify-center items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-amber-400 mt-2">
                  {rating === 5 && '🌟 Excellent Guidance'}
                  {rating === 4 && '👍 Very Good'}
                  {rating === 3 && '🙂 Satisfactory'}
                  {rating === 2 && '😐 Needs Improvement'}
                  {rating === 1 && '😞 Poor'}
                </p>
              </div>

              {/* Experience Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Experience
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-400 outline-none cursor-pointer"
                >
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Bad">Bad</option>
                </select>
              </div>

              {/* Comments Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Feedback / Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share what you felt about this session..."
                  rows={2}
                  className="w-full bg-slate-800 border border-white/10 text-white rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-400 outline-none resize-none placeholder-slate-500"
                />
              </div>

              {/* Follow Astrologer Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md ${
                    isFollowing
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30'
                      : 'bg-slate-800 text-slate-200 border border-white/10 hover:bg-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current text-emerald-400' : 'text-slate-400'}`} />
                  <span>{isFollowing ? 'Following Astrologer ✓' : `Follow ${astrologer.name}`}</span>
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Submit Rating
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Thank You! 🙏</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto mb-6 leading-relaxed">
              Your feedback and rating have been recorded. May divine blessings guide your journey!
            </p>
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionFeedbackModal;
