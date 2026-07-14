import React, { useState } from 'react';
import { Upload, Play, Heart, MessageCircle, User, X } from 'lucide-react';
import api from '../services/api';

const UGCVideoUpload = ({ onVideoUpload }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [tags, setTags] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setError('File size exceeds 100MB limit');
        return;
      }

      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!videoFile || !title.trim()) {
      setError('Please provide a title and select a video file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      
      if (tags.trim()) {
        formData.append('tags', tags.split(',').map(tag => tag.trim()));
      }

      const response = await api.post('/ugc-videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      if (response.data.success) {
        // Reset form
        setTitle('');
        setDescription('');
        setCategory('other');
        setTags('');
        setVideoFile(null);
        setPreviewUrl('');
        setUploadProgress(0);
        
        // Notify parent component
        if (onVideoUpload) {
          onVideoUpload(response.data.data);
        }
      } else {
        setError(response.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setPreviewUrl('');
    if (document.getElementById('video-upload')) {
      document.getElementById('video-upload').value = '';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <Upload className="mr-2 h-5 w-5" />
        Share Your Experience
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleUpload}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter a title for your video"
              disabled={isUploading}
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isUploading}
            >
              <option value="testimonial">Testimonial</option>
              <option value="experience">Experience</option>
              <option value="teaching">Teaching</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe your video experience..."
            disabled={isUploading}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., astrology, prediction, experience"
            disabled={isUploading}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Video File *
          </label>
          
          {previewUrl ? (
            <div className="relative">
              <video
                src={previewUrl}
                controls
                className="w-full h-48 object-cover rounded-lg border border-white/20"
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                disabled={isUploading}
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-purple-400/50 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-300 mb-2">
                Drag and drop your video here, or click to browse
              </p>
              <p className="text-gray-500 text-sm mb-4">
                MP4, MOV, AVI up to 100MB
              </p>
              <label className="px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
                Select Video
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          )}
        </div>
        
        {isUploading && (
          <div className="mb-6">
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-300 text-sm text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isUploading || !videoFile || !title.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default UGCVideoUpload;