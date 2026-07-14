import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { 
  Play, 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Heart, 
  MessageCircle, 
  Search, 
  Filter,
  Trash2,
  Edit,
  Check
} from 'lucide-react';

const UGCVideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUGCVideos();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchUGCVideos = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        isApproved: statusFilter || undefined
      };
      
      const response = await adminAPI.getUGCVideos(params);
      if (response.data.success) {
        setVideos(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.data.message || 'Failed to fetch videos');
      }
    } catch (err) {
      setError('Failed to fetch videos');
      console.error('Error fetching UGC videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVideo = async (videoId) => {
    try {
      const response = await adminAPI.updateUGCVideo(videoId, { isApproved: true });
      if (response.data.success) {
        setVideos(prev => prev.map(video => 
          video._id === videoId ? { ...video, isApproved: true } : video
        ));
      } else {
        setError(response.data.message || 'Failed to approve video');
      }
    } catch (err) {
      setError('Failed to approve video');
      console.error('Error approving video:', err);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      const response = await adminAPI.deleteUGCVideo(videoId);
      if (response.data.success) {
        setVideos(prev => prev.filter(video => video._id !== videoId));
      } else {
        setError(response.data.message || 'Failed to delete video');
      }
    } catch (err) {
      setError('Failed to delete video');
      console.error('Error deleting video:', err);
    }
  };

  const handleSelectVideo = (videoId) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId) 
        : [...prev, videoId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVideos.length === videos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos.map(video => video._id));
    }
  };

  const handleBulkApprove = async () => {
    try {
      const promises = selectedVideos.map(id => 
        adminAPI.updateUGCVideo(id, { isApproved: true })
      );
      
      await Promise.all(promises);
      setVideos(prev => prev.map(video => 
        selectedVideos.includes(video._id) ? { ...video, isApproved: true } : video
      ));
      setSelectedVideos([]);
    } catch (err) {
      setError('Failed to approve selected videos');
      console.error('Error bulk approving videos:', err);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const promises = selectedVideos.map(id => 
        adminAPI.deleteUGCVideo(id)
      );
      
      await Promise.all(promises);
      setVideos(prev => prev.filter(video => !selectedVideos.includes(video._id)));
      setSelectedVideos([]);
    } catch (err) {
      setError('Failed to delete selected videos');
      console.error('Error bulk deleting videos:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-black text-xl">Loading videos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-astro-dark celestial-bg yantra-bg overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 border border-astro-gold rounded-full opacity-20 floating-element"></div>
        <div className="absolute top-1/4 right-20 w-24 h-24 border border-cosmic-pink rounded-full opacity-15 floating-element" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-cinzel font-bold text-black mb-2">
                UGC Video Management
              </h1>
              <p className="text-black">Manage user-generated video content</p>
            </div>
            
            <Link 
              to="/admin" 
              className="px-4 py-2 bg-astro-purple/20 text-astro-purple border border-astro-purple/30 rounded-lg hover:bg-astro-purple/30 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="glass-card rounded-xl p-6 mb-8 border border-astro-gold/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-purple"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-purple appearance-none"
                >
                  <option value="">All Status</option>
                  <option value="true">Approved</option>
                  <option value="false">Pending</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedVideos.length > 0 && (
                  <>
                    <button
                      onClick={handleBulkApprove}
                      className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-400/30 rounded-lg hover:bg-green-500/30 transition-colors flex items-center"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Selected
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-400/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Videos Table */}
          <div className="glass-card rounded-xl p-6 border border-astro-gold/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="pb-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedVideos.length === videos.length && videos.length > 0}
                        onChange={handleSelectAll}
                        className="rounded bg-white/10 border-white/20 text-astro-purple focus:ring-astro-purple"
                      />
                    </th>
                    <th className="pb-4 text-left text-black font-semibold">Video</th>
                    <th className="pb-4 text-left text-black font-semibold">User</th>
                    <th className="pb-4 text-left text-black font-semibold">Category</th>
                    <th className="pb-4 text-left text-black font-semibold">Stats</th>
                    <th className="pb-4 text-left text-black font-semibold">Status</th>
                    <th className="pb-4 text-left text-black font-semibold">Date</th>
                    <th className="pb-4 text-left text-black font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4">
                        <input
                          type="checkbox"
                          checked={selectedVideos.includes(video._id)}
                          onChange={() => handleSelectVideo(video._id)}
                          className="rounded bg-white/10 border-white/20 text-astro-purple focus:ring-astro-purple"
                        />
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-astro-purple to-cosmic-pink rounded-lg flex items-center justify-center">
                            <Play className="h-6 w-6 text-black" />
                          </div>
                          <div>
                            <p className="text-black font-medium line-clamp-2 max-w-xs">{video.title}</p>
                            <p className="text-black text-sm line-clamp-1 max-w-xs">{video.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-astro-gold to-divine-orange rounded-full flex items-center justify-center text-astro-dark font-semibold">
                            {video.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-black text-sm">{video.user?.name || 'Unknown User'}</p>
                            <p className="text-black text-xs">{video.user?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-astro-purple/20 text-astro-purple rounded-full text-xs capitalize">
                          {video.category}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-4 text-black">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="text-xs">{video.views}</span>
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            <span className="text-xs">{video.likes}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">{video.comments?.length || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        {video.isApproved ? (
                          <span className="flex items-center text-green-400">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approved
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-400">
                            <XCircle className="h-4 w-4 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-black text-sm">
                        {formatDate(video.uploadDate)}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          {!video.isApproved && (
                            <button
                              onClick={() => handleApproveVideo(video._id)}
                              className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteVideo(video._id)}
                            className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {videos.length === 0 && (
              <div className="text-center py-12">
                <Play className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-black mb-2">No videos found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'No user-generated videos have been uploaded yet'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {videos.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-black text-sm">
                  Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, videos.length)} of {videos.length} videos
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-white/10 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-black">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-white/10 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UGCVideoManagement;