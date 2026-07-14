import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { n8nVideoAPI } from '../services/api';
import { 
  Play, 
  Image, 
  Plus, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Trash2,
  Edit,
  Check
} from 'lucide-react';

const N8nVideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form state for creating new video requests
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchVideoRequests();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchVideoRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter || undefined
      };
      
      const response = await n8nVideoAPI.getAllVideoRequests(params);
      if (response.data.success) {
        setVideos(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.data.message || 'Failed to fetch video requests');
      }
    } catch (err) {
      setError('Failed to fetch video requests');
      console.error('Error fetching n8n video requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVideoRequest = async (e) => {
    e.preventDefault();
    
    if (!title || !prompt || !imageFile) {
      setError('Title, prompt, and image are required');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('prompt', prompt);
      formData.append('image', imageFile);

      const response = await n8nVideoAPI.createVideoRequest(formData);
      if (response.data.success) {
        // Reset form
        setTitle('');
        setDescription('');
        setPrompt('');
        setImageFile(null);
        setShowCreateForm(false);
        
        // Refresh the list
        fetchVideoRequests();
      } else {
        setError(response.data.message || 'Failed to create video request');
      }
    } catch (err) {
      setError('Failed to create video request');
      console.error('Error creating video request:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateVideoStatus = async (videoId, status) => {
    try {
      const response = await n8nVideoAPI.updateVideoRequest(videoId, { status });
      if (response.data.success) {
        setVideos(prev => prev.map(video => 
          video._id === videoId ? { ...video, status } : video
        ));
      } else {
        setError(response.data.message || 'Failed to update video status');
      }
    } catch (err) {
      setError('Failed to update video status');
      console.error('Error updating video status:', err);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      const response = await n8nVideoAPI.deleteVideoRequest(videoId);
      if (response.data.success) {
        setVideos(prev => prev.filter(video => video._id !== videoId));
      } else {
        setError(response.data.message || 'Failed to delete video request');
      }
    } catch (err) {
      setError('Failed to delete video request');
      console.error('Error deleting video request:', err);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': 
        return <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">Completed</span>;
      case 'processing': 
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">Processing</span>;
      case 'failed': 
        return <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">Failed</span>;
      default: 
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading video requests...</div>
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
              <h1 className="text-3xl font-cinzel font-bold text-white mb-2">
                n8n Video Management
              </h1>
              <p className="text-gray-300">Manage AI-generated video content</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-astro-purple/20 text-astro-purple border border-astro-purple/30 rounded-lg hover:bg-astro-purple/30 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Video Request
              </button>
              <Link 
                to="/admin" 
                className="px-4 py-2 bg-astro-gold/20 text-astro-gold border border-astro-gold/30 rounded-lg hover:bg-astro-gold/30 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <div className="glass-card rounded-xl p-6 mb-8 border border-astro-gold/20">
              <h3 className="text-xl font-semibold text-white mb-4">Create New Video Request</h3>
              <form onSubmit={handleCreateVideoRequest}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-purple"
                      placeholder="Enter video title"
                      disabled={isCreating}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Image *
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="hidden"
                        id="image-upload"
                        disabled={isCreating}
                      />
                      <label
                        htmlFor="image-upload"
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white cursor-pointer hover:bg-white/20 transition-colors flex items-center"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </label>
                      {imageFile && (
                        <span className="text-gray-400 text-sm">{imageFile.name}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-purple"
                      placeholder="Enter video description"
                      disabled={isCreating}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Prompt *
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-purple"
                      placeholder="Enter detailed prompt for video generation"
                      disabled={isCreating}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 bg-gray-500/20 text-gray-300 border border-gray-400/30 rounded-lg hover:bg-gray-500/30 transition-colors"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !title || !prompt || !imageFile}
                    className="px-4 py-2 bg-astro-gold/20 text-astro-gold border border-astro-gold/30 rounded-lg hover:bg-astro-gold/30 transition-colors flex items-center disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-astro-gold mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="glass-card rounded-xl p-6 mb-8 border border-astro-gold/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search video requests..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-purple"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-astro-purple appearance-none"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Videos Table */}
          <div className="glass-card rounded-xl p-6 border border-astro-gold/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="pb-4 text-left text-gray-300 font-semibold">Video</th>
                    <th className="pb-4 text-left text-gray-300 font-semibold">Creator</th>
                    <th className="pb-4 text-left text-gray-300 font-semibold">Prompt</th>
                    <th className="pb-4 text-left text-gray-300 font-semibold">Status</th>
                    <th className="pb-4 text-left text-gray-300 font-semibold">Date</th>
                    <th className="pb-4 text-left text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-astro-purple to-cosmic-pink rounded-lg flex items-center justify-center">
                            {video.videoUrl ? (
                              <Play className="h-6 w-6 text-white" />
                            ) : (
                              <Image className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium line-clamp-2 max-w-xs">{video.title}</p>
                            <p className="text-gray-400 text-sm line-clamp-1 max-w-xs">{video.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-astro-gold to-divine-orange rounded-full flex items-center justify-center text-astro-dark font-semibold">
                            {video.createdBy?.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="text-white text-sm">{video.createdBy?.name || 'Unknown Admin'}</p>
                            <p className="text-gray-400 text-xs">{video.createdBy?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="text-gray-400 text-sm line-clamp-2 max-w-xs">{video.prompt}</p>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(video.status)}
                          {getStatusBadge(video.status)}
                        </div>
                      </td>
                      <td className="py-4 text-gray-400 text-sm">
                        {formatDate(video.createdAt)}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          {video.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateVideoStatus(video._id, 'processing')}
                              className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                              title="Start Processing"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          {video.status === 'processing' && (
                            <button
                              onClick={() => handleUpdateVideoStatus(video._id, 'completed')}
                              className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                              title="Mark as Completed"
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
                <h3 className="text-xl font-medium text-gray-300 mb-2">No video requests found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Create your first video request to get started'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {videos.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-gray-400 text-sm">
                  Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, videos.length)} of {videos.length} requests
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-white">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
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

export default N8nVideoManagement;