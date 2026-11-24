import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import CompatibilityDashboard from '../components/matchmaking/CompatibilityDashboard';
import PlaceAutocomplete from '../components/PlaceAutocomplete';
import { PYTHON_ASTRO_URL } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Heart,
  Users,
  Compass,
  BookOpen,
  Shield,
  Award,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const MATCHMAKING_API_BASE = PYTHON_ASTRO_URL.replace(/\/api\/kundali\/?$/, '').replace(/\/+$/, '');

const MatchmakingPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [wsAlert, setWsAlert] = useState(null);

  // Multi-match state
  const [primaryGender, setPrimaryGender] = useState('boy');
  const [primaryProfile, setPrimaryProfile] = useState({
    title: 'Shri',
    name: 'Rahul',
    birth_date: '1988-02-07',
    birth_time: '14:06',
    tz_offset: 5.5,
    lat: 25.7592,
    lon: 84.1504,
    location_name: 'Ballia, Uttar Pradesh'
  });

  const defaultCandidateData = (gender) => ({
    title: gender === 'boy' ? 'Shri' : 'Kumari',
    name: '',
    birth_date: '1992-06-15',
    birth_time: '14:30',
    tz_offset: 5.5,
    lat: 28.6139,
    lon: 77.2090,
    location_name: 'Delhi, India'
  });

  const [candidates, setCandidates] = useState([defaultCandidateData('girl')]);
  const [multiResults, setMultiResults] = useState(null);
  const [activeReportData, setActiveReportData] = useState(null);

  useEffect(() => {
    let ws = null;
    try {
      const wsUrl = MATCHMAKING_API_BASE.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:') + '/ws/matchmaking/alerts';
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setWsAlert(data);
          setTimeout(() => setWsAlert(null), 3500);
        } catch (e) { }
      };
      ws.onerror = () => { };
    } catch (e) { }
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const handlePrimaryGenderChange = (newGender) => {
    setPrimaryGender(newGender);
    setPrimaryProfile(prev => ({
      ...prev,
      title: newGender === 'boy' ? 'Shri' : 'Kumari'
    }));
    // Reset candidates for the opposite gender
    setCandidates([defaultCandidateData(newGender === 'boy' ? 'girl' : 'boy')]);
  };

  const addCandidate = () => {
    if (candidates.length < 4) {
      setCandidates([...candidates, defaultCandidateData(primaryGender === 'boy' ? 'girl' : 'boy')]);
    }
  };

  const removeCandidate = (index) => {
    if (candidates.length > 1) {
      const newCandidates = [...candidates];
      newCandidates.splice(index, 1);
      setCandidates(newCandidates);
    }
  };

  const updateCandidate = (index, field, value) => {
    const newCandidates = [...candidates];
    newCandidates[index][field] = value;
    setCandidates(newCandidates);
  };

  const updateCandidatePlace = (index, place) => {
    const newCandidates = [...candidates];
    newCandidates[index].lat = place.lat;
    newCandidates[index].lon = place.lon;
    newCandidates[index].tz_offset = place.tz_offset_hours;
    newCandidates[index].location_name = place.display_name;
    setCandidates(newCandidates);
  };

  const runMatchmaking = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const payload = {
        primary_gender: primaryGender,
        primary_profile: {
          ...primaryProfile,
          lat: parseFloat(primaryProfile.lat),
          lon: parseFloat(primaryProfile.lon),
          tz_offset: parseFloat(primaryProfile.tz_offset)
        },
        candidates: candidates.map(c => ({
          ...c,
          lat: parseFloat(c.lat),
          lon: parseFloat(c.lon),
          tz_offset: parseFloat(c.tz_offset)
        }))
      };

      // Try via direct backend proxy or Python engine
      let data = null;
      try {
        const response = await fetch('/api/matchmaking/multi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          data = await response.json();
        }
      } catch (err) {
        // Fallback to direct Python engine url
        const response = await fetch(`${MATCHMAKING_API_BASE}/api/matchmaking/multi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          data = await response.json();
        }
      }

      if (data && Array.isArray(data)) {
        setMultiResults(data);
      } else {
        throw new Error("Unable to compute matchmaking synthesis. Please check birth details.");
      }
    } catch (err) {
      console.error("Matchmaking error:", err);
      setErrorMsg(err.message || "Matchmaking calculation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderProfileForm = (data, onChange, placeOnSelect, theme = 'amber') => {
    const isGirl = theme === 'rose' || theme === 'pink';

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <div className="sm:col-span-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-black mb-1.5">
              Title
            </label>
            <select
              value={data.title}
              onChange={e => onChange('title', e.target.value)}
              className="w-full px-3.5 py-3 bg-white rounded-xl border border-neutral-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            >
              <option>Shri</option>
              <option>Kumar</option>
              <option>Kumari</option>
              <option>Shrimati</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-black mb-1.5">
              Full Name *
            </label>
            <input
              placeholder={isGirl ? "e.g. Aarushi Mishra" : "e.g. Sanjeev Pandey"}
              value={data.name}
              onChange={e => onChange('name', e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-neutral-300 font-bold text-orange-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs text-[16px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-black mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Date of Birth</span>
            </label>
            <input
              type="date"
              value={data.birth_date}
              onChange={e => onChange('birth_date', e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-neutral-300 font-bold text-orange-900 text-[16px] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-black mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Time of Birth</span>
            </label>
            <input
              type="time"
              value={data.birth_time}
              onChange={e => onChange('birth_time', e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-neutral-300 font-bold text-orange-900 text-[16px] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-black mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Birth Location (City / State)</span>
          </label>
          <div className="relative matchmaking-place-search">
            <PlaceAutocomplete value={data.location_name || ""} onSelect={placeOnSelect} />
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <div className="text-[14px] font-bold text-black px-2.5 py-1.5 bg-neutral-100 rounded-lg text-center border border-neutral-200">
                LAT: {parseFloat(data.lat || 0).toFixed(4)}
              </div>
              <div className="text-[14px] font-bold text-black px-2.5 py-1.5 bg-neutral-100 rounded-lg text-center border border-neutral-200">
                LON: {parseFloat(data.lon || 0).toFixed(4)}
              </div>
              <div className="text-[14px] font-bold text-black px-2.5 py-1.5 bg-neutral-100 rounded-lg text-center border border-neutral-200">
                TZ: +{data.tz_offset || 5.5}h
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#fafaf9] min-h-screen font-sans text-neutral-900 selection:bg-amber-200 selection:text-amber-900">
      <Navigation />

      {/* Input Section */}
      {!multiResults && !activeReportData && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-24">

          {/* Hero Banner Header (Compact, balanced height) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900 via-rose-500 to-amber-600 border border-neutral-800 px-6 py-5 sm:px-8 sm:py-6 mb-8 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="text-center sm:text-left space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Vedic Kundali Milan & Multi-Match Synthesis</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight leading-snug">
                  Sacred Relationship Compatibility
                </h1>
                {/* Ganesha Auspicious Invocation Mantra */}
                <div className="inline-block py-1 px-3 rounded-xl bg-black/30 backdrop-blur-md border border-amber-400/40 text-amber-200 font-serif text-xs sm:text-[18px] tracking-wide shadow-xs">
                  ॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
                </div>
                <p className="text-xs sm:text-[16px] text-white leading-relaxed font-normal">
                  Ashtakoot 36 Guna Milan, Dosha Samiksha (Manglik, Nadi, Bhakoot), Vimshottari Dasha overlays & predictive AI synthesis across matches.
                </p>
              </div>

              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 shadow-lg shadow-amber-500/20">
                  <img
                    src="/deities/marriage.jpg"
                    alt="Sacred Vivah"
                    className="w-full h-full object-cover rounded-full border-2 border-neutral-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Container Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Primary Profile Column (Left 6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-amber-900 shadow-xl shadow-neutral-200/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center font-bold text-lg">
                    {primaryGender === 'boy' ? '🤴' : '👸'}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900">Primary Profile</h2>
                    <p className="text-[14px] text-black">Person whose matches are being evaluated</p>
                  </div>
                </div>

                {/* Gender Selector Switch */}
                <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => handlePrimaryGenderChange('boy')}
                    className={`px-3 py-1.5 rounded-lg text-[16px] font-bold transition-all ${primaryGender === 'boy'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-900 hover:text-neutral-900'
                      }`}
                  >
                    Groom (वर)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrimaryGenderChange('girl')}
                    className={`px-3 py-1.5 rounded-lg text-[16px] font-bold transition-all ${primaryGender === 'girl'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-slate-900 hover:text-neutral-900'
                      }`}
                  >
                    Bride (वधू)
                  </button>
                </div>
              </div>

              {renderProfileForm(
                primaryProfile,
                (field, val) => setPrimaryProfile({ ...primaryProfile, [field]: val }),
                (place) => setPrimaryProfile({
                  ...primaryProfile,
                  lat: place.lat,
                  lon: place.lon,
                  tz_offset: place.tz_offset_hours,
                  location_name: place.display_name
                }),
                primaryGender === 'boy' ? 'amber' : 'rose'
              )}
            </div>

            {/* Candidates Column (Right 6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-600" />
                    <span>Candidate Profiles ({candidates.length}/4)</span>
                  </h2>
                  <p className="text-[16px] text-black">
                    Evaluate up to 4 prospective {primaryGender === 'boy' ? 'brides (वधू)' : 'grooms (वर)'} together
                  </p>
                </div>

                {candidates.length < 4 && (
                  <button
                    type="button"
                    onClick={addCandidate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[14px] font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Candidate</span>
                  </button>
                )}
              </div>

              {candidates.map((candidate, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-900 shadow-xl shadow-neutral-200/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400"></div>

                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center font-bold text-sm">
                        #{index + 1}
                      </div>
                      <span className="font-bold text-[16px] text-slate-900">
                        {primaryGender === 'boy' ? 'Prospective Bride' : 'Prospective Groom'} {index + 1}
                      </span>
                    </div>

                    {candidates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCandidate(index)}
                        title="Remove Candidate"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {renderProfileForm(
                    candidate,
                    (field, val) => updateCandidate(index, field, val),
                    (place) => updateCandidatePlace(index, place),
                    primaryGender === 'boy' ? 'rose' : 'amber'
                  )}
                </div>
              ))}

              {candidates.length < 4 && (
                <button
                  type="button"
                  onClick={addCandidate}
                  className="w-full py-4 border-2 border-dashed border-neutral-300 hover:border-amber-500 rounded-2xl text-neutral-600 hover:text-amber-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-amber-50/40 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Candidate (Max 4 Profiles)</span>
                </button>
              )}
            </div>

          </div>

          {/* Action CTA Bar */}
          <div className="mt-12 text-center">
            <button
              onClick={runMatchmaking}
              disabled={loading || candidates.length === 0}
              className="px-12 sm:px-16 py-5 rounded-2xl font-bold uppercase tracking-widest text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>{loading ? 'Synthesizing Vedic Alignments...' : 'Synthesize Match Compatibility'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="mt-3 text-[18px] text-slate-900">
              Instant multi-chart Ashtakoot, Manglik Samiksha, Vimshottari & AI synergy calculation
            </p>
          </div>

        </div>
      )}

      {/* Leaderboard Section */}
      {multiResults && !activeReportData && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-24">
          <button
            onClick={() => setMultiResults(null)}
            className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-800 font-bold text-xs uppercase tracking-wider hover:bg-neutral-50 shadow-2xs transition"
          >
            <ArrowLeft className="w-4 h-4 text-amber-700" />
            <span>Back to Input Form</span>
          </button>

          <div className="text-center mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
              🏆 Vedic Rank Order
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900">
              Compatibility Leaderboard
            </h2>
            <p className="text-sm text-neutral-600 font-medium">
              Ranked compatibility scores evaluated for <strong className="text-neutral-900">{primaryProfile.name}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {multiResults.map((result, index) => {
              const gunaScore = result.report?.guna_milan?.total_score || 0;
              const successProb = result.report?.success_probability || 0;
              const candName = `${result.candidate_info.title || ''} ${result.candidate_info.name || ''}`.trim();

              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xl shadow-neutral-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-amber-400 transition-all"
                >
                  <div className="flex items-center gap-5 sm:gap-6 flex-1 min-w-0">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 shadow-sm ${index === 0
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/25'
                      : index === 1
                        ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white'
                        : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                      }`}>
                      #{index + 1}
                    </div>

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 truncate">
                          {candName}
                        </h3>
                        {index === 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                            🌟 Best Cosmic Match
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                            Guna Milan
                          </span>
                          <span className="text-sm font-extrabold text-amber-950">
                            {gunaScore.toFixed(1)} / 36
                          </span>
                        </div>

                        <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                            Success Probability
                          </span>
                          <span className="text-sm font-extrabold text-indigo-950">
                            {successProb.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveReportData(result)}
                    className="w-full md:w-auto px-7 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Analyze Full Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Full Report View (CompatibilityDashboard) */}
      {activeReportData && (
        <div className="relative">
          <div className="fixed top-20 left-4 sm:left-8 z-50">
            <button
              onClick={() => setActiveReportData(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-900 font-extrabold text-xs uppercase tracking-wider shadow-2xl border border-amber-500 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Leaderboard</span>
            </button>
          </div>

          <CompatibilityDashboard
            bride={`${activeReportData.bride_info.title} ${activeReportData.bride_info.name}`}
            groom={`${activeReportData.groom_info.title} ${activeReportData.groom_info.name}`}
            brideFullData={activeReportData.bride_info}
            groomFullData={activeReportData.groom_info}
            report={activeReportData.report}
            bride_vimshottari={activeReportData.bride_vimshottari}
            groom_vimshottari={activeReportData.groom_vimshottari}
          />
        </div>
      )}

      {/* Live WebSocket Toast Alert */}
      {wsAlert && (
        <div className="fixed bottom-6 right-6 bg-neutral-950/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 shadow-2xl z-50 flex items-start gap-3.5 max-w-sm text-white animate-bounce">
          <div className="text-2xl mt-0.5">📡</div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-0.5">
              {wsAlert.event || 'Cosmic Synthesis Alert'}
            </div>
            <div className="text-xs text-neutral-200 leading-tight">
              {wsAlert.data?.step || wsAlert.data?.status || (wsAlert.data?.final_score && `Analysis Complete! Score: ${Math.round(wsAlert.data.final_score)}`) || 'Processing celestial positions...'}
            </div>
          </div>
        </div>
      )}

      {/* Modern Vedic Astrological Footer */}
      {!activeReportData && (
        <footer className="w-full bg-neutral-900 text-neutral-300 border-t border-neutral-800 mt-16 transition-colors">
          <div className="border-b border-neutral-800/80 bg-neutral-950/60 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-neutral-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[16px] font-medium text-white">Swiss Ephemeris Precision</h4>
                  <p className="text-[14px] text-amber-400">High-accuracy degrees & planetary positions</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[16px] font-medium text-white">Brihat Parashara Classical</h4>
                  <p className="text-[14px] text-amber-400">Authentic Shastric principles & yogas</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[16px] font-medium text-white">100% Confidential & Secure</h4>
                  <p className="text-[14px] text-amber-400">Private birth charts & consultations</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[16px] font-medium text-white">Verified Astrologers</h4>
                  <p className="text-[14px] text-amber-400">Live chat & personalized remedies</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold font-serif bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    AstroConsult
                  </span>
                  <span className="text-[14px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Vedic Astrology
                  </span>
                </div>
                <p className="text-xs sm:text-[16px] text-lime-400 leading-relaxed max-w-md">
                  Empowering your matrimonial journey through authentic Vedic matchmaking calculations, comprehensive 36 Guna Milan, Dosha Samiksha, and certified astrologer consultations.
                </p>
              </div>

              <div>
                <h4 className="text-[16px] font-bold text-amber-400 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
                  Astrology Hub
                </h4>
                <ul className="space-y-2 text-[16px]">
                  <li><Link to="/kundali" className="text-indigo-400 hover:text-amber-400 transition">Kundali Generation</Link></li>
                  <li><Link to="/kundali-matching" className="text-indigo-400 hover:text-amber-400 transition">Kundali Matching</Link></li>
                  <li><Link to="/daily-calendar" className="text-indigo-400 hover:text-amber-400 transition">Daily Panchang</Link></li>
                  <li><Link to="/advance-muhurt" className="text-indigo-400 hover:text-amber-400 transition">Advance Muhurta</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[16px] font-bold text-amber-400 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
                  Consultations
                </h4>
                <ul className="space-y-2 text-[16px]">
                  <li><Link to="/live-astrologers" className="text-indigo-400 hover:text-amber-400 transition">Live Video Consultation</Link></li>
                  <li><Link to="/live-chat" className="text-indigo-400 hover:text-amber-400 transition">Live Chat with Astrologer</Link></li>
                  <li><Link to="/ai-astrologer" className="text-indigo-400 hover:text-amber-400 transition">AI Vedic Astrologer 24/7</Link></li>
                  <li><Link to="/shop" className="text-indigo-400 hover:text-amber-400 transition">Astro Shop & Gemstones</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[16px] font-bold text-amber-400 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
                  Company
                </h4>
                <ul className="space-y-2 text-[16px]">
                  <li><Link to="/about" className="text-indigo-400 hover:text-amber-400 transition">About Us</Link></li>
                  <li><Link to="/contact" className="text-indigo-400 hover:text-amber-400 transition">Contact & Support</Link></li>
                  <li><Link to="/dashboard" className="text-indigo-400 hover:text-amber-400 transition">My Account</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 py-6 px-4 sm:px-6 lg:px-8 bg-black/40">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[16px] text-neutral-500 text-center md:text-left">
              <p>Disclaimer: Vedic astrology provides spiritual guidance based on ancient scriptures and planetary models.</p>
              <p>Copyright © 2026 Phanom Technologies. All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
};

export default MatchmakingPage;
