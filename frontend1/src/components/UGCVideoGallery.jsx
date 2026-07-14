import React, { useState, useEffect } from 'react';
import { Play, Heart, MessageCircle, User, Eye, Clock, Search, Filter } from 'lucide-react';
import api from '../services/api';

const UGCVideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likedVideos, setLikedVideos] = useState(new Set());

  useEffect(() => {
    fetchVideos();
  }, [page, searchTerm, categoryFilter, sortBy]);

  const fetchVideos = async () => {
    try {
      setLoading(page === 1);
      setError('');
      
      const params = {
        page,
        limit: 12,
        search: searchTerm,
        category: categoryFilter,
        sortBy
      };
      
      const response = await api.get('/ugc-videos', { params });
      
      if (response.data.success) {
        const newVideos = response.data.data;
        setVideos(page === 1 ? newVideos : [...videos, ...newVideos]);
        setHasMore(response.data.pagination.hasNext);
      } else {
        setError(response.data.message || 'Failed to fetch videos');
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to fetch videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (videoId) => {
    try {
      const response = await api.post(`/ugc-videos/${videoId}/like`);
      
      if (response.data.success) {
        // Update the video in the list
        setVideos(prevVideos => 
          prevVideos.map(video => 
            video._id === videoId 
              ? { ...video, likes: response.data.data.likes } 
              : video
          )
        );
        
        // Update liked state
        if (response.data.data.userLiked) {
          setLikedVideos(prev => new Set(prev).add(videoId));
        } else {
          setLikedVideos(prev => {
            const newSet = new Set(prev);
            newSet.delete(videoId);
            return newSet;
          });
        }
      }
    } catch (err) {
      console.error('Error liking video:', err);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const filteredVideos = videos.filter(video => {
    if (searchTerm && !video.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !video.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (categoryFilter && video.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search videos..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="">All Categories</option>
                <option value="testimonial">Testimonial</option>
                <option value="experience">Experience</option>
                <option value="teaching">Teaching</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="uploadDate">Newest First</option>
              <option value="views">Most Viewed</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {filteredVideos.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Play className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-xl font-medium text-gray-300 mb-2">No videos found</h3>
          <p className="text-gray-500">
            {searchTerm || categoryFilter 
              ? 'Try adjusting your search or filter criteria' 
              : 'Be the first to share your experience!'}
          </p>
        </div>
      ) : (
        <>
          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <div 
                key={video._id} 
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:bg-white/10 transition-all duration-300 group"
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gray-800">
                  {video.thumbnailUrl ? (
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                      <Play className="h-12 w-12 text-white/50 group-hover:text-white/80 transition-colors" />
                    </div>
                  )}
                  
                  {/* Duration */}
                  {video.duration > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="h-6 w-6 text-white ml-1" />
                    </div>
                  </div>
                </div>
                
                {/* Video Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  
                  {/* User Info */}
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-2">
                      {video.user?.profilePicture ? (
                        <img 
                          src={video.user.profilePicture} 
                          alt={video.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{video.user?.name || 'Anonymous'}</p>
                      <p className="text-gray-500 text-xs">{formatDate(video.uploadDate)}</p>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-gray-400 text-sm">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleLike(video._id)}
                        className={`flex items-center space-x-1 hover:text-red-400 transition-colors ${
                          likedVideos.has(video._id) ? 'text-red-400' : ''
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${likedVideos.has(video._id) ? 'fill-current' : ''}`} />
                        <span>{video.likes}</span>
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{video.views}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(video.uploadDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="text-center py-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More Videos'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UGCVideoGallery;