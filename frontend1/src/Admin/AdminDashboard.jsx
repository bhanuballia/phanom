import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { adminAPI } from '../services/api';
import {
  Users,
  Star,
  Calendar,
  TrendingUp,
  UserPlus,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Zap,
  Edit,
  Trash2,
  ShoppingCart,
  Tag,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAstrologers: 0,
    totalAppointments: 0,
    appointmentsByStatus: [],
    monthlyAppointments: [],
    topAstrologers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch admin statistics');
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'scheduled': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-astro-dark celestial-bg yantra-bg overflow-hidden">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-black text-xl">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-astro-dark celestial-bg yantra-bg overflow-hidden">
      {/* Cosmic Background Elements */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 border border-astro-gold rounded-full opacity-20 floating-element"></div>
        <div className="absolute top-1/4 right-20 w-24 h-24 border border-cosmic-pink rounded-full opacity-15 floating-element" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-16 h-16 border border-astro-purple rounded-full opacity-25 floating-element" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Zodiac Background */}
      <div className="zodiac-bg fixed inset-0"></div>
      <div className="om-pattern fixed inset-0"></div>

      <Navigation />

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-cinzel font-bold text-black mb-4">
              Admin <span className="divine-text">Dashboard</span>
            </h1>
            <p className="text-black">Manage astrologers, appointments, and system overview</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-card rounded-xl p-6 mystical-glow border border-astro-gold/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-black">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-astro-gold" />
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 mystical-glow border border-astro-purple/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black text-sm">Total Astrologers</p>
                  <p className="text-2xl font-bold text-black">{stats.totalAstrologers}</p>
                </div>
                <Star className="h-8 w-8 text-astro-purple" />
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 mystical-glow border border-cosmic-pink/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black text-sm">Total Appointments</p>
                  <p className="text-2xl font-bold text-black">{stats.totalAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-cosmic-pink" />
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 mystical-glow border border-mystic-indigo/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black text-sm">Growth Rate</p>
                  <p className="text-2xl font-bold text-black">+12%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-mystic-indigo" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Link
              to="/admin/astrologers/new"
              className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-astro-gold/20 group"
            >
              <div className="flex items-center justify-center mb-4">
                <UserPlus className="h-12 w-12 text-astro-gold group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold text-black text-center mb-2">Add New Astrologer</h3>
              <p className="text-black text-center">Create a new astrologer account</p>
            </Link>

            <Link
              to="/admin/astrologers"
              className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-astro-purple/20 group"
            >
              <div className="flex items-center justify-center mb-4">
                <Settings className="h-12 w-12 text-astro-purple group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold text-black text-center mb-2">Manage Astrologers</h3>
              <p className="text-black text-center">Edit and manage astrologer profiles</p>
            </Link>

            <Link
              to="/admin/appointments"
              className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-cosmic-pink/20 group"
            >
              <div className="flex items-center justify-center mb-4">
                <BarChart3 className="h-12 w-12 text-cosmic-pink group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold text-black text-center mb-2">Manage Appointments</h3>
              <p className="text-black text-center">View and manage all appointments</p>
            </Link>

            <Link
              to="/admin/ugc-videos"
              className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-mystic-indigo/20 group"
            >
              <div className="flex items-center justify-center mb-4">
                <Play className="h-12 w-12 text-mystic-indigo group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold text-black text-center mb-2">Manage UGC Videos</h3>
              <p className="text-black text-center">Review and manage user videos</p>
            </Link>

            <Link
              to="/admin/n8n-videos"
              className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-divine-orange/20 group"
            >
              <div className="flex items-center justify-center mb-4">
                <Zap className="h-12 w-12 text-divine-orange group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold text-black text-center mb-2">n8n Video Gen</h3>
              <p className="text-black text-center">AI video generation requests</p>
            </Link>

            {/* New Home Page Video Upload Link */}
            <Link
              to="/admin/homepage-video"
              className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-cosmic-pink/20 group"
            >
              <div className="flex items-center justify-center mb-4">
                <Play className="h-12 w-12 text-cosmic-pink group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold text-black text-center mb-2">Home Page Video</h3>
              <p className="text-black text-center">Upload videos for home page</p>
            </Link>

            {/* Lord Ganesha Image Upload Link */}
            <Link
              to="/admin/lord-ganesha-image"
              className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-astro-gold/20 group"
            >
              <div className="flex items-center justify-center mb-4">
                <Star className="h-12 w-12 text-astro-gold group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold text-black text-center mb-2">Lord Ganesha Image</h3>
              <p className="text-black text-center">Upload Lord Ganesha image for Kundali Matching</p>
            </Link>

            {/* Kundali Matching Background Upload Link */}
            <Link
              to="/admin/kundali-matching-background"
              className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-cosmic-pink/20 group"
            >
              <div className="flex items-center justify-center mb-4">
                <ImageIcon className="h-12 w-12 text-cosmic-pink group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold text-black text-center mb-2">Kundali Matching Background</h3>
              <p className="text-black text-center">Upload background image for Kundali Matching</p>
            </Link>

            {/* Home Page Background Upload Link */}
            <Link
              to="/admin/homepage-background"
              className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-astro-gold/20 group"
            >
              <div className="flex items-center justify-center mb-4">
                <ImageIcon className="h-12 w-12 text-astro-gold group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold text-black text-center mb-2">Home Page Background</h3>
              <p className="text-black text-center">Upload background image for Home Page</p>
            </Link>

            {/* Shopping Portal Links */}
            <Link
              to="/admin/products"
              className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-astro-gold/20 group"
            >
              <div className="flex items-center justify-center mb-4">
                <ShoppingCart className="h-12 w-12 text-astro-gold group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold text-black text-center mb-2">Manage Products</h3>
              <p className="text-black text-center">Add and manage spiritual products</p>
            </Link>

            <Link
              to="/admin/categories"
              className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-astro-purple/20 group"
            >
              <div className="flex items-center justify-center mb-4">
                <Tag className="h-12 w-12 text-astro-purple group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold text-black text-center mb-2">Manage Categories</h3>
              <p className="text-black text-center">Organize product categories</p>
            </Link>

            <Link
              to="/admin/live-chat-history"
              className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-amber-500/20 group"
            >
              <div className="flex items-center justify-center mb-4">
                <MessageSquare className="h-12 w-12 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold text-black text-center mb-2">Chat Monitoring</h3>
              <p className="text-black text-center">View all user-astrologer chats</p>
            </Link>

            <Link
              to="/admin/audit-logs"
              className="glass-card rounded-xl p-6 hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-red-500/20 group"
            >
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-12 w-12 text-red-500 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold text-black text-center mb-2">Audit Logs</h3>
              <p className="text-black text-center">Track Astro Tools usage logs</p>
            </Link>
          </div>

          {/* Astrologer Management Quick Actions */}
          <div className="glass-card rounded-xl p-6 mb-8 mystical-glow border border-astro-gold/20">
            <h3 className="text-xl font-semibold text-black mb-4">Astrologer Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/astrologers/new"
                className="flex items-center justify-center p-4 bg-gradient-to-r from-astro-gold/20 to-divine-orange/20 rounded-lg border border-astro-gold/30 hover:shadow-mystical transition-all duration-300"
              >
                <UserPlus className="h-5 w-5 text-astro-gold mr-2" />
                <span className="text-black font-medium">Add New Astrologer</span>
              </Link>
              <Link
                to="/admin/astrologers"
                className="flex items-center justify-center p-4 bg-gradient-to-r from-astro-purple/20 to-mystic-indigo/20 rounded-lg border border-astro-purple/30 hover:shadow-mystical transition-all duration-300"
              >
                <Edit className="h-5 w-5 text-astro-purple mr-2" />
                <span className="text-black font-medium">Edit Astrologers</span>
              </Link>
              <Link
                to="/admin/astrologers"
                className="flex items-center justify-center p-4 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-lg border border-red-500/30 hover:shadow-mystical transition-all duration-300"
              >
                <Trash2 className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-black font-medium">Delete Astrologers</span>
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Appointment Status Breakdown */}
            <div className="glass-card rounded-xl p-6 mystical-glow border border-astro-gold/20">
              <h3 className="text-xl font-semibold text-black mb-4">Appointment Status</h3>
              <div className="space-y-3">
                {stats.appointmentsByStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status._id)}
                      <span className="text-black capitalize">{status._id.replace('_', ' ')}</span>
                    </div>
                    <span className="text-black font-semibold">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Astrologers */}
            <div className="glass-card rounded-xl p-6 mystical-glow border border-astro-purple/20">
              <h3 className="text-xl font-semibold text-black mb-4">Top Performing Astrologers</h3>
              <div className="space-y-3">
                {stats.topAstrologers.map((astrologer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-astro-gold to-divine-orange rounded-full flex items-center justify-center text-astro-dark font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-black font-medium">{astrologer.name}</p>
                        <p className="text-black text-sm">{astrologer.email}</p>
                      </div>
                    </div>
                    <span className="text-astro-gold font-semibold">{astrologer.appointmentCount} sessions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;