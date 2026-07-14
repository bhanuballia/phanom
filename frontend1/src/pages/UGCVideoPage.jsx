import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import UGCVideoUpload from '../components/UGCVideoUpload';
import UGCVideoGallery from '../components/UGCVideoGallery';
import { Play, Users, Star, Award } from 'lucide-react';

const UGCVideoPage = () => {
  const { isAuthenticated, user } = useAuth();

  const handleVideoUpload = (newVideo) => {
    // Handle successful video upload
    console.log('New video uploaded:', newVideo);
    // You can add logic here to update the gallery or show a notification
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-xl rounded-full px-6 py-3 border border-white/10 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <Play className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-gray-300 font-medium tracking-wide uppercase">Community Videos</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                User Stories
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover inspiring experiences and testimonials from our community of astrology enthusiasts
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-purple-400 mr-2" />
                  <span className="text-2xl font-bold text-white">10K+</span>
                </div>
                <p className="text-gray-400 text-sm">Community Members</p>
              </div>
              
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex items-center justify-center mb-2">
                  <Play className="h-6 w-6 text-pink-400 mr-2" />
                  <span className="text-2xl font-bold text-white">1K+</span>
                </div>
                <p className="text-gray-400 text-sm">Videos Shared</p>
              </div>
              
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-yellow-400 mr-2" />
                  <span className="text-2xl font-bold text-white">4.9</span>
                </div>
                <p className="text-gray-400 text-sm">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Upload Section (for authenticated users) */}
          {isAuthenticated && (
            <div className="mb-12">
              <UGCVideoUpload onVideoUpload={handleVideoUpload} />
            </div>
          )}

          {/* Video Gallery */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Featured Videos</h2>
              <div className="text-sm text-gray-400">
                {isAuthenticated 
                  ? "Share your experience with the community" 
                  : "Join our community to share your story"}
              </div>
            </div>
            
            <UGCVideoGallery />
          </div>

          {/* Community Guidelines */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-start mb-4">
              <Award className="h-6 w-6 text-yellow-400 mr-3 mt-1" />
              <h3 className="text-xl font-bold text-white">Community Guidelines</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Respectful Content</h4>
                <p className="text-gray-400 text-sm">
                  Share your genuine experiences and treat others with kindness and respect.
                </p>
              </div>
              
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Authentic Stories</h4>
                <p className="text-gray-400 text-sm">
                  Be honest about your experiences. Authentic stories help others on their journey.
                </p>
              </div>
              
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Privacy Protection</h4>
                <p className="text-gray-400 text-sm">
                  Don't share personal information of yourself or others in your videos.
                </p>
              </div>
              
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Quality Content</h4>
                <p className="text-gray-400 text-sm">
                  Ensure your videos are clear and appropriate for all community members.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UGCVideoPage;