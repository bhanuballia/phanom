import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { adminAPI } from '../services/api';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Search,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    astrologerId: '',
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleData, setRescheduleData] = useState({
    newDate: '',
    newTime: '',
    reason: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAppointments({
        page: currentPage,
        limit: 10,
        ...filters
      });
      setAppointments(response.data.appointments);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    try {
      await adminAPI.cancelAppointment(selectedAppointment._id, { reason: cancelReason });
      fetchAppointments();
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancelReason('');
    } catch (err) {
      setError('Failed to cancel appointment');
      console.error('Error cancelling appointment:', err);
    }
  };

  const handleRescheduleAppointment = async () => {
    try {
      await adminAPI.rescheduleAppointment(selectedAppointment._id, rescheduleData);
      fetchAppointments();
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      setRescheduleData({ newDate: '', newTime: '', reason: '' });
    } catch (err) {
      setError('Failed to reschedule appointment');
      console.error('Error rescheduling appointment:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'scheduled': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'rescheduled': return <RotateCcw className="h-4 w-4 text-purple-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-400';
      case 'rescheduled': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-black';
    }
  };

  return (
    <div className="min-h-screen bg-astro-dark celestial-bg yantra-bg overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 border border-astro-gold rounded-full opacity-20 floating-element"></div>
        <div className="absolute top-1/4 right-20 w-24 h-24 border border-cosmic-pink rounded-full opacity-15 floating-element" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="zodiac-bg fixed inset-0"></div>
      <div className="om-pattern fixed inset-0"></div>

      <Navigation />

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-cinzel font-bold text-black mb-4">
              Appointment <span className="divine-text">Management</span>
            </h1>
            <p className="text-black">Monitor and manage all appointments</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="glass-card rounded-xl p-6 mb-6 mystical-glow border border-astro-gold/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                >
                  <option value="">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: '', astrologerId: '', startDate: '', endDate: '' })}
                  className="w-full px-4 py-2 bg-astro-purple text-black rounded-lg hover:bg-astro-purple/80 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="glass-card rounded-xl mystical-glow border border-astro-gold/20 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="text-black text-xl">Loading appointments...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-astro-dark/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Astrologer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {appointments.map((appointment) => (
                      <tr key={appointment._id} className="hover:bg-astro-dark/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-astro-gold to-divine-orange rounded-full flex items-center justify-center mr-3">
                              <User className="h-4 w-4 text-astro-dark" />
                            </div>
                            <div>
                              <div className="text-black font-medium">{appointment.client?.name}</div>
                              <div className="text-black text-sm flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {appointment.client?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-black font-medium">{appointment.astrologer?.name}</div>
                          <div className="text-black text-sm">{appointment.astrologer?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-black">
                            {new Date(appointment.appointmentDate).toLocaleDateString('en-IN')}
                          </div>
                          <div className="text-black text-sm">
                            {appointment.appointmentTime} ({appointment.duration} min)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-black capitalize">
                            {appointment.consultationType?.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(appointment.status)}
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-black font-medium">₹{appointment.price}</div>
                          <div className={`text-xs ${
                            appointment.paymentStatus === 'completed' 
                              ? 'text-green-400' 
                              : 'text-yellow-400'
                          }`}>
                            {appointment.paymentStatus}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {appointment.status === 'scheduled' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setShowRescheduleModal(true);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Reschedule"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setShowCancelModal(true);
                                  }}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-astro-dark/30 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-black">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-astro-purple text-black rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-astro-purple text-black rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 max-w-md w-full mx-4 mystical-glow border border-red-500/30">
            <h3 className="text-xl font-semibold text-black mb-4">Cancel Appointment</h3>
            <p className="text-black mb-4">
              Cancel appointment for {selectedAppointment.client?.name} with {selectedAppointment.astrologer?.name}?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">Reason for cancellation</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-gold"
                placeholder="Enter reason for cancellation..."
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedAppointment(null);
                  setCancelReason('');
                }}
                className="px-4 py-2 bg-gray-600 text-black rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelAppointment}
                className="px-4 py-2 bg-red-600 text-black rounded hover:bg-red-700 transition-colors"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 max-w-md w-full mx-4 mystical-glow border border-blue-500/30">
            <h3 className="text-xl font-semibold text-black mb-4">Reschedule Appointment</h3>
            <p className="text-black mb-4">
              Reschedule appointment for {selectedAppointment.client?.name} with {selectedAppointment.astrologer?.name}
            </p>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleData.newDate}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, newDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">New Time</label>
                <input
                  type="time"
                  value={rescheduleData.newTime}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, newTime: e.target.value }))}
                  className="w-full px-3 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Reason</label>
                <textarea
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-gold"
                  placeholder="Enter reason for rescheduling..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedAppointment(null);
                  setRescheduleData({ newDate: '', newTime: '', reason: '' });
                }}
                className="px-4 py-2 bg-gray-600 text-black rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleAppointment}
                className="px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-700 transition-colors"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;