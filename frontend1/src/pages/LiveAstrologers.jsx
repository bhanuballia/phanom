import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, ArrowLeft, RefreshCw } from 'lucide-react';
import Navigation from '../components/Navigation';
import { authAPI, buildAssetUrl } from '../services/api';

const LiveAstrologers = () => {
  const [liveAstrologers, setLiveAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveAstrologers = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getAstrologers();
      const allAstrologers = response.data?.astrologers || [];
      const liveOnly = allAstrologers.filter((astrologer) => astrologer.isLive);
      setLiveAstrologers(liveOnly);
    } catch (error) {
      console.error('Failed to fetch astrologers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAstrologers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Happening Now</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold">Live Astrologers</h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Join live streams, interact with top astrologers, and ask your questions in real-time.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchLiveAstrologers}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-semibold">Refresh</span>
            </button>
            <Link to="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>

        {/* Live Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl h-72 animate-pulse"></div>
            ))}
          </div>
        ) : liveAstrologers.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6">
              <Video className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Astrologers Live Right Now</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              There are currently no active live streams. Our experts usually go live during the evenings. Check back later or book a private session.
            </p>
            <Link to="/astrologers" className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:opacity-90 transition">
              Browse All Astrologers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {liveAstrologers.map((astrologer) => {
              const rawImage = astrologer.profilePicture || astrologer.image || astrologer.imageUrl || astrologer.photo;
              const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;

              return (
                <Link
                  key={astrologer._id}
                  to={`/live/${astrologer._id}`}
                  className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-48 w-full bg-slate-900">
                    {imageSrc ? (
                      <img src={imageSrc} alt={astrologer.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-400/30 to-pink-500/30 flex items-center justify-center text-4xl font-bold">
                        {astrologer.name?.charAt(0) || 'A'}
                      </div>
                    )}

                    {/* Live Badge */}
                    <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-red-500/50 shadow-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                      <span className="text-[10px] font-black tracking-wider text-white">LIVE</span>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 relative">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors truncate">{astrologer.name}</h3>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
                        ₹{astrologer.pricing || 9}/min
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-1">
                      {astrologer.specialization?.join(', ') || 'Vedic Expert'}
                    </p>
                    <div className="mt-auto">
                      <div className="w-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold py-2 rounded-xl flex justify-center items-center gap-2 group-hover:bg-red-500 group-hover:text-white transition-all">
                        <Video className="w-4 h-4" />
                        Join & Talk (₹{astrologer.pricing || 9}/min)
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default LiveAstrologers;
