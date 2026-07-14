import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { adminAPI } from '../services/api';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Star,
  Calendar,
  Phone,
  Mail,
  User,
  Eye
} from 'lucide-react';

const AstrologerManagement = () => {
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAstrologer, setSelectedAstrologer] = useState(null);

  useEffect(() => {
    fetchAstrologers();
  }, [currentPage, searchTerm]);

  const fetchAstrologers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAstrologers({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      setAstrologers(response.data.astrologers);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to fetch astrologers');
      console.error('Error fetching astrologers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAstrologer = async (id) => {
    try {
      await adminAPI.deleteAstrologer(id);
      fetchAstrologers();
      setShowDeleteModal(false);
      setSelectedAstrologer(null);
    } catch (err) {
      setError('Failed to delete astrologer');
      console.error('Error deleting astrologer:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAstrologers();
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-cinzel font-bold text-black mb-2">
                Astrologer <span className="divine-text">Management</span>
              </h1>
              <p className="text-black">Manage and oversee all astrologers</p>
            </div>
            <Link
              to="/admin/astrologers/new"
              className="px-6 py-3 bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark font-semibold rounded-xl hover:shadow-mystical transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Astrologer</span>
            </Link>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Search */}
          <div className="glass-card rounded-xl p-6 mb-6 mystical-glow border border-astro-gold/20">
            <form onSubmit={handleSearch} className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-astro-dark/50 border border-astro-gold/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-astro-purple to-mystic-indigo text-black rounded-lg hover:shadow-mystical transition-all duration-300"
              >
                Search
              </button>
            </form>
          </div>

          {/* Astrologers Table */}
          <div className="glass-card rounded-xl mystical-glow border border-astro-gold/20 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="text-black text-xl">Loading astrologers...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-astro-dark/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Astrologer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Appointments
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {astrologers.map((astrologer) => (
                      <tr key={astrologer._id} className="hover:bg-astro-dark/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-astro-gold to-divine-orange rounded-full flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-astro-dark" />
                            </div>
                            <div>
                              <div className="text-black font-medium">{astrologer.name}</div>
                              <div className="text-black text-sm">
                                {astrologer.specialization?.join(', ') || 'General'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-black">
                            <div className="flex items-center mb-1">
                              <Mail className="h-4 w-4 mr-2" />
                              {astrologer.email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              {astrologer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-black">
                            {astrologer.experience || 0} years
                          </div>
                          <div className="text-black text-sm">
                            ₹{astrologer.pricing || 100}/session
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-black font-medium">
                            {astrologer.appointmentCount || 0}
                          </div>
                          <div className="text-black text-sm">
                            {astrologer.completedAppointments || 0} completed
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            astrologer.isVerified 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {astrologer.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/admin/astrologers/${astrologer._id}`}
                              className="text-astro-gold hover:text-astro-gold-light transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/admin/astrologers/${astrologer._id}/edit`}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedAstrologer(astrologer);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-400 hover:text-red-300 transition-colors"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAstrologer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 max-w-md w-full mx-4 mystical-glow border border-red-500/30">
            <h3 className="text-xl font-semibold text-black mb-4">Confirm Delete</h3>
            <p className="text-black mb-6">
              Are you sure you want to delete astrologer "{selectedAstrologer.name}"? 
              This action cannot be undone.
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAstrologer(null);
                }}
                className="px-4 py-2 bg-gray-600 text-black rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAstrologer(selectedAstrologer._id)}
                className="px-4 py-2 bg-red-600 text-black rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstrologerManagement;