import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { adminAPI } from '../services/api';
import {
  Calendar,
  User,
  Phone,
  Clock,
  ArrowLeft,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const AuditReport = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAuditReport();
      if (response && response.data && response.data.report) {
        setReport(response.data.report);
      } else if (response && response.report) {
        setReport(response.report);
      } else {
        setError('Invalid report format received');
      }
    } catch (err) {
      console.error('Error fetching audit report:', err);
      setError(err.message || 'Failed to fetch audit report');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Active Now';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getDuration = (start, end) => {
    if (!end) return 'Ongoing';
    const durationMs = new Date(end) - new Date(start);
    const mins = Math.floor(durationMs / 60000);
    const secs = Math.floor((durationMs % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-astro-dark celestial-bg yantra-bg">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-black text-xl font-cinzel">Loading celestial audit logs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-astro-dark celestial-bg yantra-bg">
      <Navigation />

      <div className="relative z-10 py-8 px-4 max-w-7xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center text-astro-gold hover:text-black transition-colors font-semibold"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Admin Dashboard
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-cinzel font-bold text-black mb-2 flex items-center justify-center gap-3">
            <ShieldAlert className="h-9 w-9 text-astro-gold" />
            Astro Tools <span className="divine-text">Access Audit Logs</span>
          </h1>
          <p className="text-black/80 max-w-xl mx-auto">
            Day-wise tracking of astrologers accessing external advanced calculation tools via mobile authentication.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-700 px-6 py-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        {report.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 border border-astro-gold/20 text-center">
            <Calendar className="h-16 w-16 text-astro-gold mx-auto mb-4 opacity-55" />
            <h3 className="text-2xl font-cinzel font-bold text-black mb-2">No Access Logs Recorded</h3>
            <p className="text-black/80">No astrologers have accessed the Astro Tools using bypass mobile validation yet.</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-astro-gold/20 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-astro-gold/10 border-b border-astro-gold/20 text-black uppercase text-xs tracking-wider font-semibold">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Astrologer</th>
                    <th className="px-6 py-4">Total Uses</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-astro-gold/10">
                  {report.map((item, idx) => {
                    const isExpanded = !!expandedRows[idx];
                    return (
                      <React.Fragment key={idx}>
                        <tr className="hover:bg-astro-gold/5 transition-colors font-medium text-black">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-astro-gold" />
                              {new Date(item.date).toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-astro-purple" />
                              {item.astrologerName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-astro-purple/10 text-astro-purple px-3 py-1 rounded-full text-xs font-bold">
                              {item.useCount} {item.useCount === 1 ? 'Session' : 'Sessions'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => toggleRow(idx)}
                              className="inline-flex items-center gap-1 text-astro-gold hover:text-black font-semibold transition-colors focus:outline-none"
                            >
                              {isExpanded ? 'Hide Details' : 'View Details'}
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-astro-gold/5">
                            <td colSpan="4" className="px-8 py-6">
                              <div className="space-y-4">
                                <h4 className="text-sm font-cinzel font-bold text-black uppercase tracking-wider border-b border-astro-gold/20 pb-2">
                                  Access Timings & Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {item.sessions.map((session, sIdx) => (
                                    <div key={session.logId || sIdx} className="bg-white/60 rounded-xl p-4 border border-astro-gold/10 shadow-sm flex flex-col gap-2">
                                      <div className="flex justify-between items-center border-b border-black/5 pb-2">
                                        <div className="flex items-center gap-2 font-bold text-sm text-black">
                                          <Phone className="h-4 w-4 text-astro-gold" />
                                          Phone Used: {session.phone}
                                        </div>
                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-black ${session.endTime ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 animate-pulse'}`}>
                                          {session.endTime ? 'Completed' : 'Active'}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2 text-xs text-black/80 font-medium mt-1">
                                        <div>
                                          <div className="text-[10px] text-black/50 uppercase tracking-widest">Start Time</div>
                                          <div className="flex items-center gap-1 mt-0.5 font-bold">
                                            <Clock className="h-3 w-3 text-black/40" />
                                            {formatTime(session.startTime)}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] text-black/50 uppercase tracking-widest">End Time</div>
                                          <div className="flex items-center gap-1 mt-0.5 font-bold">
                                            <Clock className="h-3 w-3 text-black/40" />
                                            {formatTime(session.endTime)}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] text-black/50 uppercase tracking-widest">Duration</div>
                                          <div className="mt-0.5 font-bold text-astro-purple">
                                            {getDuration(session.startTime, session.endTime)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditReport;
