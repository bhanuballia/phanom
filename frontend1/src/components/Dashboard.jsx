import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI } from '../services/api';
import {
  Calendar,
  Clock,
  User,
  Video,
  Plus,
  Filter,
  LogOut,
  Settings,
  Star,
  CheckCircle,
  XCircle,
  PlayCircle,
  Home,
  Trash2
} from 'lucide-react';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
    calculateStats();
  }, [appointments, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data.appointments);
    } catch (error) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    if (statusFilter === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter(apt => apt.status === statusFilter));
    }
  };

  const calculateStats = () => {
    const total = appointments.length;
    const scheduled = appointments.filter(apt => apt.status === 'scheduled').length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;

    setStats({ total, scheduled, completed, cancelled });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/20 text-black';
      case 'in_progress':
        return 'bg-green-500/20 text-black';
      case 'completed':
        return 'bg-green-500/20 text-black';
      case 'cancelled':
        return 'bg-red-500/20 text-black';
      default:
        return 'bg-gray-500/20 text-black';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcoming = (appointment) => {
    const appointmentDateTime = new Date(`${appointment.appointmentDate.split('T')[0]}T${appointment.appointmentTime}`);
    const now = new Date();
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    return timeDiff <= 30 * 60 * 1000 && timeDiff > 0; // Within 30 minutes
  };

  const canJoinCall = (appointment) => {
    return appointment.status === 'scheduled' && isUpcoming(appointment);
  };

  const canCancelAppointment = (appointment) => {
    // Can only cancel scheduled appointments that are not within 30 minutes of start time
    return appointment.status === 'scheduled' && !isUpcoming(appointment);
  };

  const handleJoinCall = (appointmentId) => {
    navigate(`/video-chat/${appointmentId}`);
  };

  /**
   * Handle appointment cancellation
   * Users can cancel scheduled appointments that are not within 30 minutes of start time
   * Displays success/error messages and auto-refreshes the appointment list
   */

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
      try {
        setError('');
        setSuccessMessage('');
        await appointmentsAPI.cancel(appointmentId);
        setSuccessMessage('✅ Appointment cancelled successfully!');
        fetchAppointments(); // Refresh the list

        // Auto-dismiss success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Failed to cancel appointment. Please try again.';
        setError(errorMsg);

        // Auto-dismiss error message after 5 seconds
        setTimeout(() => {
          setError('');
        }, 5000);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: 'url(/images/dash1.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        >
        </div>
        <div className="flex flex-col items-center justify-center text-black">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="flex items-center justify-center">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/images/dash1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
      </div>

      {/* Header Banner with Overlay Effects */}
      <div className="relative z-10 overflow-hidden">
        {/* Decorative Banner Background */}
        <div className="relative bg-gradient-to-r from-astro-light via-mystic-indigo to-astro-gold border-b-4 border-astro-gold/50 overflow-hidden">
          {/* Multi-layered Overlay Effects */}
          <div className="absolute inset-0 bg-white/80 pointer-events-none"></div>          {/* Animated shimmer effect */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
          </div>

          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}></div>

          {/* Mystical glow effects */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/30 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/30 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

          {/* Decorative stars/sparkles */}
          <div className="absolute top-4 left-10 text-astro-gold opacity-60 animate-pulse text-2xl">✨</div>
          <div className="absolute top-8 right-20 text-white opacity-40 animate-pulse text-xl" style={{ animationDelay: '0.5s' }}>⭐</div>
          <div className="absolute bottom-6 left-1/3 text-divine-orange opacity-50 animate-pulse text-2xl" style={{ animationDelay: '1.5s' }}>🌟</div>
          <div className="absolute bottom-4 right-1/3 text-astro-gold opacity-60 animate-pulse text-xl" style={{ animationDelay: '2s' }}>✨</div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex flex-col mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <div className="w-1 h-12 bg-astro-gold mr-4 rounded-full shadow-lg"></div>
                  <div>
                    <h1 className="flex flex-wrap items-center text-3xl md:text-4xl font-cinzel font-bold text-black drop-shadow-sm">
                      <span className="flex items-center">Welcome back,</span>
                      <span className="flex items-center text-black ml-2 animate-pulse">{user?.name}</span>
                    </h1>
                    <p className="flex items-center text-black/90 mt-1 text-lg drop-shadow-sm">
                      <span className="flex items-center">Manage your sacred astrology consultations</span>
                    </p>
                    <p className="flex items-center text-black font-hindi text-sm mt-2 font-bold">
                      <span className="flex items-center">🕉 आपका स्वागत है (You are welcome) 🕉</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center px-5 py-2.5 bg-black/10 backdrop-blur-md border border-black/20 text-black rounded-lg hover:bg-black/20 hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
                <Link
                  to="/book-appointment"
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-astro-gold to-divine-orange text-black rounded-lg hover:shadow-xl hover:shadow-astro-gold/50 transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-5 py-2.5 bg-red-600/90 backdrop-blur-md border border-red-500/30 text-white rounded-lg hover:bg-red-700 transition-all duration-300 font-medium"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-black px-4 py-3 rounded-lg mb-6 relative overflow-hidden">
            {/* Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-astro-gold/5 via-transparent to-divine-orange/5 opacity-50 pointer-events-none"></div>
            <p className="relative z-10 flex items-center justify-center text-black">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 text-black px-4 py-3 rounded-lg mb-6 relative overflow-hidden animate-fade-in">
            {/* Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-transparent to-green-600/10 opacity-50 pointer-events-none"></div>
            <p className="relative z-10 flex items-center justify-center text-black font-medium">{successMessage}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-astro-gold/20 relative overflow-hidden">
            {/* Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-astro-gold/5 via-transparent to-divine-orange/5 opacity-50 pointer-events-none"></div>
            <div className="relative z-10 flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex flex-col">
                <p className="text-sm text-black">Total Appointments</p>
                <p className="text-2xl font-bold text-black">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-astro-gold/20 relative overflow-hidden">
            {/* Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-astro-gold/5 via-transparent to-divine-orange/5 opacity-50 pointer-events-none"></div>
            <div className="relative z-10 flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex flex-col">
                <p className="text-sm text-black">Scheduled</p>
                <p className="text-2xl font-bold text-black">{stats.scheduled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-astro-gold/20 relative overflow-hidden">
            {/* Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-astro-gold/5 via-transparent to-divine-orange/5 opacity-50 pointer-events-none"></div>
            <div className="relative z-10 flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex flex-col">
                <p className="text-sm text-black">Completed</p>
                <p className="text-2xl font-bold text-black">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-astro-gold/20 relative overflow-hidden">
            {/* Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-astro-gold/5 via-transparent to-divine-orange/5 opacity-50 pointer-events-none"></div>
            <div className="relative z-10 flex items-center">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4 flex flex-col">
                <p className="text-sm text-black">Cancelled</p>
                <p className="text-2xl font-bold text-black">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl border border-astro-gold/20 relative overflow-hidden">
          {/* Overlay Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-astro-gold/5 via-transparent to-divine-orange/5 opacity-50 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="p-6 border-b border-astro-gold/20">
              <div className="flex flex-wrap justify-between items-center">
                <h2 className="flex items-center text-xl font-semibold text-black">Your Appointments</h2>
                <div className="flex flex-wrap items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-black" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white/90 border border-astro-gold/30 text-black text-sm rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all" className="text-gray-900">All Status</option>
                      <option value="scheduled" className="text-gray-900">Scheduled</option>
                      <option value="in_progress" className="text-gray-900">In Progress</option>
                      <option value="completed" className="text-gray-900">Completed</option>
                      <option value="cancelled" className="text-gray-900">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {filteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="flex items-center justify-center text-lg font-medium text-black mb-2">No appointments found</h3>
                  <p className="flex items-center justify-center text-black mb-4">
                    <span className="flex items-center justify-center">
                      {statusFilter === 'all'
                        ? "You haven't booked any appointments yet."
                        : `No ${statusFilter} appointments found.`}
                    </span>
                  </p>
                  <Link
                    to="/book-appointment"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Appointment
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="bg-white/90 backdrop-blur-sm border border-astro-gold/20 rounded-lg p-4 hover:bg-white/95 transition-colors duration-200 relative overflow-hidden"
                    >
                      {/* Overlay Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-astro-gold/5 via-transparent to-divine-orange/5 opacity-50 pointer-events-none"></div>
                      <div className="relative z-10">
                        <div className="flex flex-wrap items-center justify-between">
                          <div className="flex flex-wrap items-center space-x-4">
                            <div className="flex-shrink-0">
                              {getStatusIcon(appointment.status)}
                            </div>
                            <div className="flex flex-col">
                              <h3 className="flex items-center text-lg font-medium text-black">
                                {user.role === 'astrologer'
                                  ? `Session with ${appointment.client.name}`
                                  : `Session with ${appointment.astrologer.name}`}
                              </h3>
                              <div className="flex flex-wrap items-center space-x-4 text-sm text-black">
                                <span className="flex items-center">{formatDate(appointment.appointmentDate)}</span>
                                <span className="flex items-center">{appointment.appointmentTime}</span>
                                <span className="flex items-center">{appointment.duration} minutes</span>
                                <span className="flex items-center capitalize">{appointment.consultationType.replace('_', ' ')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center space-x-4">
                            <span className={`flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status.replace('_', ' ')}
                            </span>

                            {canJoinCall(appointment) && (
                              <button
                                onClick={() => handleJoinCall(appointment._id)}
                                className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200"
                              >
                                <Video className="h-4 w-4 mr-1" />
                                Join Call
                              </button>
                            )}

                            {canCancelAppointment(appointment) && (
                              <button
                                onClick={() => handleCancelAppointment(appointment._id)}
                                className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                                title="Cancel this appointment"
                              >
                                <Trash2 className="h-4 w-4 mr-1.5" />
                                Cancel Appointment
                              </button>
                            )}

                            <span className="flex items-center text-lg font-semibold text-black">${appointment.price}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="mt-3 pt-3 border-t border-astro-gold/20">
                            <p className="flex items-center text-sm text-black">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;