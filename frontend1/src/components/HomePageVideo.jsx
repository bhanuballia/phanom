import React, { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';
import { ugcAPI } from '../services/api';

const HomePageVideo = () => {
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchFeaturedVideo();
  }, []);

  const fetchFeaturedVideo = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ugcAPI.getHomePageFeaturedVideo();
      console.log('Featured video response:', response.data);
      if (response.data.success && response.data.data) {
        setFeaturedVideo(response.data.data);
      } else {
        // No featured video found, that's okay
        setFeaturedVideo(null);
      }
    } catch (err) {
      setError('Failed to load featured video');
      console.error('Error fetching featured video:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't render if manually closed or still loading
  if (!isVisible || loading) {
    return null;
  }
  
  // Don't render if there's an error or no featured video
  if (error || !featuredVideo) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-30">
      <div className="glass-card p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl w-80">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Play className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-white font-semibold text-sm">Featured Video</h3>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Video Preview */}
        <div className="relative mb-3 rounded-xl overflow-hidden">
          {featuredVideo.videoUrl ? (
            <div className="relative">
              <video
                src={featuredVideo.videoUrl}
                className="w-full h-40 object-cover"
                controls={false}
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Play className="h-6 w-6 text-white ml-1" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 h-40 flex items-center justify-center">
              <Play className="h-8 w-8 text-gray-500" />
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="mb-3">
          <h4 className="text-white font-medium text-sm mb-1 line-clamp-1">
            {featuredVideo.title}
          </h4>
          <p className="text-gray-400 text-xs line-clamp-2">
            {featuredVideo.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {new Date(featuredVideo.uploadDate).toLocaleDateString()}
          </span>
          <button className="text-xs text-purple-400 hover:text-purple-300 font-medium">
            Watch Full Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePageVideo;