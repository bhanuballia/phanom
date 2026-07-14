import React, { useState, useEffect } from 'react';
import { Play, Image, Sparkles } from 'lucide-react';
import api from '../services/api';

const N8nVideoSection = () => {
  const [latestVideo, setLatestVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLatestVideo();
  }, []);

  const fetchLatestVideo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/n8n-videos/latest');
      if (response.data.success && response.data.data) {
        setLatestVideo(response.data.data);
      }
    } catch (err) {
      setError('Failed to load video');
      console.error('Error fetching latest video:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed bottom-6 left-6 z-30">
        <div className="glass-card p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl w-80">
          <div className="flex items-center justify-center h-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !latestVideo) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <div className="glass-card p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl w-80">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-white font-semibold text-sm">Divine Vision</h3>
          </div>
          <span className="text-xs text-gray-400 bg-green-500/20 px-2 py-1 rounded-full">
            AI Generated
          </span>
        </div>

        {/* Video Preview */}
        <div className="relative mb-3 rounded-xl overflow-hidden">
          {latestVideo.videoUrl ? (
            <div className="relative">
              <video
                src={latestVideo.videoUrl}
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
              <Image className="h-8 w-8 text-gray-500" />
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="mb-3">
          <h4 className="text-white font-medium text-sm mb-1 line-clamp-1">
            {latestVideo.title}
          </h4>
          <p className="text-gray-400 text-xs line-clamp-2">
            {latestVideo.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {new Date(latestVideo.createdAt).toLocaleDateString()}
          </span>
          <button className="text-xs text-purple-400 hover:text-purple-300 font-medium">
            View Full Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default N8nVideoSection;