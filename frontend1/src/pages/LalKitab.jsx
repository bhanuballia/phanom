import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { Sparkles, Calendar, BookOpen, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { lalKitabAPI } from '../services/lalKitabAPI';

const LalKitab = () => {
  const [formData, setFormData] = useState({
    jupiter: '',
    sun: '',
    moon: '',
    venus: '',
    mars: '',
    mercury: '',
    saturn: '',
    rahu: '',
    ketu: '',
    kundliType: 'birth',
    year: new Date().getFullYear(),
    period: 'annual'
  });

  const [birthData, setBirthData] = useState({
    day: '',
    month: '',
    year: '',
    hour: '',
    min: '',
    lat: '',
    lon: '',
    tzone: '5.5'
  });

  const [loading, setLoading] = useState(false);
  const [horoscopeData, setHoroscopeData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('planets');

  const planets = [
    { name: 'Jupiter', key: 'jupiter' },
    { name: 'Sun', key: 'sun' },
    { name: 'Moon', key: 'moon' },
    { name: 'Venus', key: 'venus' },
    { name: 'Mars', key: 'mars' },
    { name: 'Mercury', key: 'mercury' },
    { name: 'Saturn', key: 'saturn' },
    { name: 'Rahu', key: 'rahu' },
    { name: 'Ketu', key: 'ketu' }
  ];

  const houses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBirthDataChange = (e) => {
    const { name, value } = e.target;
    setBirthData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate birth data
      if (!birthData.day || !birthData.month || !birthData.year) {
        throw new Error('Please enter complete birth date');
      }
      
      const response = await lalKitabAPI.getLalKitabHoroscope(birthData);
      setHoroscopeData(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch Lal Kitab horoscope. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      jupiter: '',
      sun: '',
      moon: '',
      venus: '',
      mars: '',
      mercury: '',
      saturn: '',
      rahu: '',
      ketu: '',
      kundliType: 'birth',
      year: new Date().getFullYear(),
      period: 'annual'
    });
    setBirthData({
      day: '',
      month: '',
      year: '',
      hour: '',
      min: '',
      lat: '',
      lon: '',
      tzone: '5.5'
    });
    setHoroscopeData(null);
    setError(null);
  };

  // Render horoscope data based on its structure
  const renderHoroscopeData = () => {
    if (!horoscopeData) return null;

    return (
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-yellow-500/30 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 rounded-xl"></div>
            <div className="relative z-10">
              <h4 className="text-black font-semibold mb-2">Sun Sign</h4>
              <p className="text-black">{horoscopeData.sun_sign || 'N/A'}</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-500/30 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 rounded-xl"></div>
            <div className="relative z-10">
              <h4 className="text-black font-semibold mb-2">Moon Sign</h4>
              <p className="text-black">{horoscopeData.moon_sign || 'N/A'}</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-500/30 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 rounded-xl"></div>
            <div className="relative z-10">
              <h4 className="text-black font-semibold mb-2">Rising Sign</h4>
              <p className="text-black">{horoscopeData.rising_sign || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-indigo-500/30 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 rounded-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2" />
              Today's Prediction
            </h3>
            <p className="text-black whitespace-pre-line">
              {horoscopeData.prediction || horoscopeData.daily_prediction || 'No prediction available'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-green-500/30 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 rounded-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-black mb-3 flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Remedy
              </h3>
              <p className="text-black">
                {horoscopeData.remedy || 'No specific remedy available'}
              </p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-red-500/30 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 rounded-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-black mb-3">Malefic Planets</h3>
              <div className="flex flex-wrap gap-2 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-xl"></div>
                <div className="relative z-10 flex flex-wrap gap-2">
                  {horoscopeData.malefic_planets ? (
                    horoscopeData.malefic_planets.map((planet, index) => (
                      <span key={index} className="px-3 py-1 bg-red-200 rounded-full text-sm text-black">
                        {planet}
                      </span>
                    ))
                  ) : (
                    <p className="text-black">No malefic planets identified</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-cyan-500/30 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 rounded-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-black mb-3">Planetary Positions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="pb-2 text-black">Planet</th>
                    <th className="pb-2 text-black">Sign</th>
                    <th className="pb-2 text-black">House</th>
                  </tr>
                </thead>
                <tbody>
                  {horoscopeData.planets ? (
                    Object.entries(horoscopeData.planets).map(([planet, details], index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-2 text-black capitalize">{planet}</td>
                        <td className="py-2 text-black">{details.sign || 'N/A'}</td>
                        <td className="py-2 text-black">{details.house || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-black">
                        No planetary positions available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4">
      {/* Background Image */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/images/kitab1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
      </div>

      <Navigation />
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto pt-24 mb-10">
          <section className="relative p-10 rounded-[36px] border border-black/10 bg-white/85 backdrop-blur-lg shadow-[0_35px_100px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col lg:flex-row items-center gap-12">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex-1 space-y-5 text-center lg:text-left">
              <div className="bg-black/5 border border-black/10 rounded-2xl p-6">
                <p className="text-2xl font-sans text-black mb-2">ॐ तत्पुरुषाय विद्महे महादेवाय धीमहि तन्नो रुद्रः प्रचोदयात्॥</p>
                <p className="text-black/80 text-sm">Om Tatpurushaya Vidmahe Mahadevaya Dhimahi Tanno Rudrah Prachodayat</p>
              </div>
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-black/10 bg-white/80 shadow-sm">
                <BookOpen className="h-5 w-5 text-astro-gold" />
                <span className="text-black font-semibold">Lal Kitab Worksheets</span>
                <Sparkles className="h-4 w-4 text-astro-gold" />
              </div>
              <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-black">
                Lal Kitab Kundli & Varshfal
              </h1>
              <p className="text-black/80 text-lg">
                Provide planetary house positions to generate Lal Kitab Kundli, Varshfal, and detailed insights including benefic or malefic planets with remedies rooted in classical texts.
              </p>
            </div>
            <div className="relative z-10 flex-1 w-full grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
                <p className="text-xs uppercase tracking-[0.35em] text-black/60 mb-2">Kundli Type</p>
                <p className="text-2xl font-bold text-black capitalize">{formData.kundliType}</p>
                <p className="text-sm text-black/60">Birth / Annual</p>
              </div>
              <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
                <p className="text-xs uppercase tracking-[0.35em] text-black/60 mb-2">Varshfal Year</p>
                <p className="text-2xl font-bold text-black">{formData.year}</p>
                <p className="text-sm text-black/60">Selected period</p>
              </div>
              <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
                <p className="text-xs uppercase tracking-[0.35em] text-black/60 mb-2">Active Tab</p>
                <p className="text-2xl font-bold text-black capitalize">{activeTab}</p>
                <p className="text-sm text-black/60">Configuration phase</p>
              </div>
              <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
                <p className="text-xs uppercase tracking-[0.35em] text-black/60 mb-2">Remedy Focus</p>
                <p className="text-2xl font-bold text-black">मुक्ति उपाय</p>
                <p className="text-sm text-black/60">Lal Kitab prescriptions</p>
              </div>
            </div>
          </section>
        </div>
        <div className="max-w-6xl mx-auto">

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-md relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/65 to-white/75 rounded-2xl"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-black mb-6 flex items-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 rounded-xl"></div>
                    <div className="relative z-10 flex items-center">
                      <Sparkles className="h-6 w-6 mr-2 text-yellow-500" />
                      Birth Details
                    </div>
                  </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <label className="block text-black font-medium">
                        Day <span className="text-red-500">*</span>
                      </label>
                    <input
                      type="number"
                      name="day"
                      value={birthData.day}
                      onChange={handleBirthDataChange}
                      min="1"
                      max="31"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="DD"
                      required
                    />
                  </div>
                  
                    <div className="space-y-2">
                      <label className="block text-black font-medium">
                        Month <span className="text-red-500">*</span>
                      </label>
                    <input
                      type="number"
                      name="month"
                      value={birthData.month}
                      onChange={handleBirthDataChange}
                      min="1"
                      max="12"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="MM"
                      required
                    />
                  </div>
                  
                    <div className="space-y-2">
                      <label className="block text-black font-medium">
                        Year <span className="text-red-500">*</span>
                      </label>
                    <input
                      type="number"
                      name="year"
                      value={birthData.year}
                      onChange={handleBirthDataChange}
                      min="1900"
                      max="2100"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="YYYY"
                      required
                    />
                  </div>
                  
                    <div className="space-y-2">
                      <label className="block text-black font-medium">
                        Hour
                      </label>
                    <input
                      type="number"
                      name="hour"
                      value={birthData.hour}
                      onChange={handleBirthDataChange}
                      min="0"
                      max="23"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="HH"
                    />
                  </div>
                  
                    <div className="space-y-2">
                      <label className="block text-black font-medium">
                        Minute
                      </label>
                    <input
                      type="number"
                      name="min"
                      value={birthData.min}
                      onChange={handleBirthDataChange}
                      min="0"
                      max="59"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="MM"
                    />
                  </div>
                  
                    <div className="space-y-2">
                      <label className="block text-black font-medium">
                        Timezone
                      </label>
                    <select
                      name="tzone"
                      value={birthData.tzone}
                      onChange={handleBirthDataChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="5.5">India (UTC+5:30)</option>
                      <option value="0">UTC</option>
                      <option value="-5">EST (UTC-5)</option>
                      <option value="-8">PST (UTC-8)</option>
                      <option value="1">CET (UTC+1)</option>
                    </select>
                  </div>
                </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 rounded-2xl"></div>
                    <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-full hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 flex items-center justify-center disabled:opacity-70"
                      >
                        {loading ? (
                          <>
                            <Loader className="h-5 w-5 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Generate Lal Kitab
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-full border border-gray-300 hover:border-gray-400 transition-all duration-300 flex items-center justify-center"
                      >
                        <Calendar className="h-5 w-5 mr-2" />
                        Reset Form
                      </button>
                    </div>
                  </div>
                </form>

                {/* Error Message */}
                {error && (
                  <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-black flex items-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 rounded-lg"></div>
                    <div className="relative z-10 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {/* Results Display */}
                {horoscopeData && (
                  <div className="mt-8 p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/65 to-white/75 rounded-2xl"></div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-black mb-4 text-center">Lal Kitab Horoscope</h3>
                      {renderHoroscopeData()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Info Section */}
            <div className="space-y-6">
              {/* What is Lal Kitab */}
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/65 to-white/75 rounded-2xl"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-black mb-4">What is Lal Kitab?</h3>
                  <p className="text-black mb-4">
                    Lal Kitab is a system of astrology that originated in India and is based on the principles of 
                    Hindu astrology. It is known for its simple and straightforward approach to predicting future events.
                  </p>
                  <p className="text-black">
                    The Lal Kitab system is particularly popular in North India and is known for its remedial measures 
                    that are easy to follow and implement.
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/65 to-white/75 rounded-2xl"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-black mb-4">Benefits of Lal Kitab</h3>
                  <ul className="text-black space-y-2">
                    <li className="flex items-start relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg"></div>
                      <div className="relative z-10 flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        Simple remedies for planetary afflictions
                      </div>
                    </li>
                    <li className="flex items-start relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg"></div>
                      <div className="relative z-10 flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        Quick and effective solutions to life problems
                      </div>
                    </li>
                    <li className="flex items-start relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg"></div>
                      <div className="relative z-10 flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        Focus on practical results rather than complex calculations
                      </div>
                    </li>
                    <li className="flex items-start relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg"></div>
                      <div className="relative z-10 flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        Emphasis on charity and spiritual practices
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* How to Use */}
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/65 to-white/75 rounded-2xl"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-black mb-4">How to Use This Tool</h3>
                  <ol className="text-black space-y-2">
                    <li className="flex items-start relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg"></div>
                      <div className="relative z-10 flex items-start">
                        <span className="text-blue-600 mr-2">1.</span>
                        Enter your complete birth details (date, time, and place)
                      </div>
                    </li>
                    <li className="flex items-start relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg"></div>
                      <div className="relative z-10 flex items-start">
                        <span className="text-blue-600 mr-2">2.</span>
                        Click "Generate Lal Kitab" to get your horoscope
                      </div>
                    </li>
                    <li className="flex items-start relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg"></div>
                      <div className="relative z-10 flex items-start">
                        <span className="text-blue-600 mr-2">3.</span>
                        Review the predictions, remedies, and planetary positions
                      </div>
                    </li>
                    <li className="flex items-start relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg"></div>
                      <div className="relative z-10 flex items-start">
                        <span className="text-blue-600 mr-2">4.</span>
                        Follow the suggested remedies for positive results
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LalKitab;