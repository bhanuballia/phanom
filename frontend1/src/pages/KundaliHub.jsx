import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import {
  Compass,
  Briefcase,
  BookOpen,
  DollarSign,
  Heart,
  TrendingUp,
  Activity,
  Users,
  Grid,
  Sparkles,
  ArrowLeft,
  Calendar,
  Globe,
  MapPin,
  Clock,
  LayoutGrid,
  Star
} from 'lucide-react';
import { VEDIC_ASTROLOGY_BASE_URL } from '../services/api';

const KundaliHub = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [birthData, setBirthData] = useState(null);

  useEffect(() => {
    // Attempt to load birth data from router state, fallback to localStorage/sessionStorage
    if (location.state && location.state.birthData) {
      setBirthData(location.state.birthData);
      sessionStorage.setItem('lastGeneratedKundali', JSON.stringify(location.state.birthData));
    } else {
      const saved = sessionStorage.getItem('lastGeneratedKundali');
      if (saved) {
        try {
          setBirthData(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse birth data from session storage', e);
        }
      }
    }
  }, [location.state]);

  const handleRedirect = (type, value) => {
    if (!birthData) return;

    const basePortUrl = VEDIC_ASTROLOGY_BASE_URL;
    let targetParams = '';

    // Map parameters based on type
    if (type === 'varga') {
      targetParams = `worksheet=true&fullScreen=${value}`;
    } else if (type === 'oracle') {
      targetParams = `oracle=${value}`;
    } else if (type === 'simple') {
      targetParams = `${value}=true`;
    }

    // Build common parameters
    const latLon = birthData.coordinates ? birthData.coordinates.split(',') : ['28.6139', '77.2090'];
    const lat = latLon[0]?.trim() || '28.6139';
    const lon = latLon[1]?.trim() || '77.2090';

    const getTzOffset = (timezoneName) => {
      try {
        const date = new Date();
        const tzString = date.toLocaleString('en-US', { timeZone: timezoneName });
        const localString = date.toLocaleString('en-US');
        const diff = (Date.parse(tzString) - Date.parse(localString)) / 3600000;
        const localOffset = -date.getTimezoneOffset() / 60;
        return localOffset + diff;
      } catch (err) {
        return 5.5; // fallback
      }
    };

    const tzOffset = getTzOffset(birthData.timezone || 'Asia/Kolkata');

    const redirectUrl = `${basePortUrl}/?${targetParams}&name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&gender=Male`;

    window.open(redirectUrl, '_blank');
  };

  const vargaCharts = [
    { code: 'd1', name: 'D1 Rasi', desc: 'Rasi / Natal chart' },
    { code: 'd2', name: 'D2 Hora', desc: 'Wealth & Prosperity' },
    { code: 'd3', name: 'D3 Drekkana', desc: 'Siblings & Initiatives' },
    { code: 'd4', name: 'D4 Chaturthamsha', desc: 'Property & Fortune' },
    { code: 'd7', name: 'D7 Saptamsha', desc: 'Children & Legacy' },
    { code: 'd9', name: 'D9 Navamsha', desc: 'Marriage & Soul Purpose' },
    { code: 'd10', name: 'D10 Dashamamsha', desc: 'Career & Power' },
    { code: 'd12', name: 'D12 Dwadashamsha', desc: 'Parents & Ancestors' },
    { code: 'd16', name: 'D16 Shodashamsha', desc: 'Vehicles & Happiness' },
    { code: 'd20', name: 'D20 Vimshamsha', desc: 'Spirituality & Devotion' },
    { code: 'd24', name: 'D24 Chaturvimshamsha', desc: 'Learning & Wisdom' },
    { code: 'd27', name: 'D27 Bhamsha', desc: 'Strengths & Weaknesses' },
    { code: 'd30', name: 'D30 Trimshamsha', desc: 'Evils & Hardships' },
    { code: 'd40', name: 'D40 Khavedamsha', desc: 'Auspicious Fruits' },
    { code: 'd45', name: 'D45 Akshavedamsha', desc: 'Character & Integrity' },
    { code: 'd60', name: 'D60 Shashtyamsha', desc: 'Past Karma & Destiny' }
  ];

  const lifeThemes = [
    { key: 'study', name: 'Study Analysis', icon: BookOpen, desc: 'Education & Academics', color: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-700' },
    { key: 'career', name: 'Career Analysis', icon: Briefcase, desc: 'Profession & Growth', color: 'from-amber-50 to-orange-50 border-amber-200 text-amber-700' },
    { key: 'finance', name: 'Finance Analysis', icon: DollarSign, desc: 'Wealth & Income', color: 'from-green-50 to-emerald-50 border-green-200 text-green-700' },
    { key: 'marriage', name: 'Marriage Analysis', icon: Heart, desc: 'Relationships & Spouse', color: 'from-rose-50 to-pink-50 border-rose-200 text-rose-700' },
    { key: 'business', name: 'Business Analysis', icon: TrendingUp, desc: 'Business & Ventures', color: 'from-cyan-50 to-teal-50 border-cyan-200 text-cyan-700' },
    { key: 'business_naming', name: 'Business Naming', icon: Sparkles, desc: 'Auspicious Business Name', color: 'from-purple-50 to-violet-50 border-purple-200 text-purple-700', isOracle: true, oracleKey: 'business_naming' }
  ];

  const healthThemes = [
    { key: 'health', name: 'General Health', icon: Activity, desc: 'Physical Well-being' },
    { key: 'parents_health', name: 'Parents Health', icon: Users, desc: 'Family Well-being' },
    { key: 'spouse_health', name: 'Spouse Health', icon: Heart, desc: 'Partner Well-being' },
    { key: 'children_health', name: 'Children Health', icon: Users, desc: 'Offspring Well-being' }
  ];

  const oracleTools = [
    { key: 'manglik', name: 'Manglik Dosha', desc: 'Mars Affliction Analysis', icon: Sparkles },
    { key: 'kalsarp', name: 'Kalsarp Dosha', desc: 'Snake Curse Analysis', icon: Sparkles },
    { key: 'pitra', name: 'Pitra Dosha', desc: 'Ancestral Debt Analysis', icon: Sparkles },
    { key: 'sadesati', name: 'Sadesati Analysis', desc: 'Saturn Period Analysis', icon: Sparkles },
    { key: 'rahu', name: 'Rahu Dosha', desc: 'North Node Remedies', icon: Sparkles },
    { key: 'ketu', name: 'Ketu Dosha', desc: 'South Node Remedies', icon: Sparkles },
    { key: 'loshu', name: 'Lo Shu Grid', desc: 'Chinese Numerology Grid', icon: Grid }
  ];

  const specialtyRemedies = [
    { key: 'advanced_nakshatra', name: 'Adv. Nakshatra', desc: 'Advanced Nakshatra & Deity analysis', icon: Star, type: 'simple', value: 'advanced_nakshatra' },
    { key: 'ishtaDev', name: 'Know Your Ishta Dev', desc: 'Discover your personal deity & mantras', icon: Sparkles, type: 'simple', value: 'ishtaDev' },
    { key: 'lalkitab', name: 'Lal Kitab remedies', desc: 'Special Lal Kitab guidance', icon: BookOpen, type: 'simple', value: 'lalkitab' },
    { key: 'dosha', name: 'Advance Dosha & Exception', desc: 'Detailed dosha conditions', icon: Sparkles, type: 'simple', value: 'dosha' },
    { key: 'digbala', name: 'Digbala Compass', desc: 'Directional Strengths', icon: Compass, type: 'simple', value: 'digbala' },
    { key: 'yantra', name: 'Yantra Suggestion', desc: 'Protective Geometric Sigils', icon: LayoutGrid, type: 'simple', value: 'yantra' },
    { key: 'ascendant', name: 'Ascendant Analysis', desc: 'Ascendant & Personality', icon: Compass, type: 'simple', value: 'ascendant' },
    { key: 'medical_astrology', name: 'Ayur Jyotish', desc: 'Ayur Jyotish (Medical Astrology)', icon: Activity, type: 'simple', value: 'medical_astrology' },
    { key: 'naming', name: 'Naming', desc: 'Auspicious baby/person naming analysis', icon: Sparkles, type: 'simple', value: 'naming' },
    { key: 'sadesati_report', name: 'Sade Sati Status', desc: 'Saturn transit period & phase analysis', icon: Sparkles, type: 'simple', value: 'sadesati_report' }
  ];

  if (!birthData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navigation />
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-black/10 shadow-2xl p-8 text-center">
            <h2 className="text-2xl font-bold font-cinzel mb-4">No Birth Details Found</h2>
            <p className="text-gray-600 mb-6">Please generate your Kundali first from the services page.</p>
            <button
              onClick={() => navigate('/kundali')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition duration-200"
            >
              Go to Kundali Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed overflow-hidden flex flex-col justify-between"
      style={{ backgroundImage: "url('/images/our1.jpeg')" }}
    >
      <div className="relative z-10 flex flex-col min-h-screen bg-black/30 backdrop-blur-[2px]">
        <Navigation />

        {/* Main Content Area */}
        <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header Summary */}
          <div className="mb-8 p-6 rounded-3xl border border-white/20 bg-black/60 backdrop-blur-md shadow-lg text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Celestial Portal</span>
              <h1 className="text-3xl font-cinzel font-bold text-white mt-1">
                {birthData.name}'s Kundali Dashboard
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Explore specialized charts and diagnostic oracles for your birth details.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                <Calendar className="h-4 w-4 text-amber-400" />
                <div>
                  <div className="text-white/50">Date of Birth</div>
                  <div className="font-semibold">{birthData.dateOfBirth}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                <Clock className="h-4 w-4 text-amber-400" />
                <div>
                  <div className="text-white/50">Time</div>
                  <div className="font-semibold">{birthData.timeOfBirth || '12:00'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                <MapPin className="h-4 w-4 text-amber-400" />
                <div>
                  <div className="text-white/50">Place</div>
                  <div className="font-semibold truncate max-w-[100px]">{birthData.placeOfBirth}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                <Globe className="h-4 w-4 text-amber-400" />
                <div>
                  <div className="text-white/50">Timezone</div>
                  <div className="font-semibold truncate max-w-[80px]">{birthData.timezone || 'Asia/Kolkata'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">

            {/* 1. divisional charts (varga charts) */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-black/10 shadow-xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                  <Grid className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-cinzel font-bold text-slate-800">Varga / Divisional Charts</h2>
                  <p className="text-xs text-slate-500">Examine specific aspects of life mapped to astronomical divisionals.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3.5">
                {vargaCharts.map((chart) => (
                  <button
                    key={chart.code}
                    onClick={() => handleRedirect('varga', chart.code)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-400 transition-all duration-200 group text-center shadow-sm"
                  >
                    <span className="text-sm font-bold text-slate-800 group-hover:text-amber-700 font-cinzel">
                      {chart.code.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-amber-600 mt-1">
                      {chart.name.replace(/d\d+\s+/i, '')}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">
                      {chart.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. life & career themes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-3xl border border-black/10 shadow-xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-cinzel font-bold text-slate-800">Life Analysis & Career Lenses</h2>
                      <p className="text-xs text-slate-500">Detailed insights into education, career, romance, and financial wealth.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {lifeThemes.map((theme) => {
                      const IconComponent = theme.icon;
                      return (
                        <button
                          key={theme.key}
                          onClick={() => {
                            if (theme.isOracle) {
                              handleRedirect('oracle', theme.oracleKey);
                            } else {
                              handleRedirect('simple', theme.key);
                            }
                          }}
                          className={`flex items-start gap-3.5 p-4 rounded-2xl border bg-gradient-to-br ${theme.color} hover:shadow-md transition-all duration-200 text-left`}
                        >
                          <div className="p-2 bg-white rounded-xl shadow-sm mt-0.5">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm font-cinzel text-slate-800">{theme.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5 leading-snug">{theme.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. health diagnostics */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-black/10 shadow-xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-cinzel font-bold text-slate-800">Health Diagnostics</h2>
                    <p className="text-xs text-slate-500">Examine specific indicators of health and longevity.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {healthThemes.map((theme) => {
                    const IconComponent = theme.icon;
                    return (
                      <button
                        key={theme.key}
                        onClick={() => handleRedirect('simple', theme.key)}
                        className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 text-left shadow-sm group"
                      >
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-white transition-colors duration-200">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs font-cinzel text-slate-800">{theme.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{theme.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 4. Oracle & Specialized tools */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Oracle Tools */}
              <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-3xl border border-black/10 shadow-xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-cinzel font-bold text-slate-800">Astro-Oracle Diagnostics</h2>
                    <p className="text-xs text-slate-500 font-medium">Check for key planetary conditions and doshas affecting your destiny.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {oracleTools.map((tool) => (
                    <button
                      key={tool.key}
                      onClick={() => handleRedirect('oracle', tool.key)}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 text-left shadow-sm group"
                    >
                      <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-white transition-colors duration-200">
                        {tool.key === 'loshu' ? (
                          <Grid className="h-5 w-5" />
                        ) : (
                          <Sparkles className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-800 font-cinzel">{tool.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 leading-snug">{tool.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialty & Remedies */}
              <div className="lg:col-span-5 bg-white/90 backdrop-blur-md rounded-3xl border border-black/10 shadow-xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-cyan-100 text-cyan-700 rounded-xl">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-cinzel font-bold text-slate-800">Specialty & Suggestions</h2>
                    <p className="text-xs text-slate-500">Remedial metrics, planetary alignments, and directional forces.</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {specialtyRemedies.map((remedy) => {
                    const IconComponent = remedy.icon;
                    return (
                      <button
                        key={remedy.key}
                        onClick={() => handleRedirect(remedy.type, remedy.value)}
                        className="flex items-center justify-between w-full p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-200 text-left shadow-sm group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl group-hover:bg-white transition-colors duration-200">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs font-cinzel text-slate-800">{remedy.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{remedy.desc}</div>
                          </div>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2.5 py-1 rounded-lg uppercase tracking-wider group-hover:bg-cyan-100 group-hover:text-cyan-700 transition-colors">
                          Analyze
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Floating action buttons */}
        <div className="sticky bottom-6 w-full flex justify-center py-4 pointer-events-none">
          <button
            onClick={() => navigate('/kundali')}
            className="pointer-events-auto flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold shadow-2xl border border-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 text-amber-400" />
            <span>Back to Kundali Generator</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KundaliHub;
