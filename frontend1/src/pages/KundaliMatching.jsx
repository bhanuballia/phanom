import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { User, Calendar, MapPin, Clock, Send, Loader, Heart, FileText, Sparkles, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { kundaliMatchingAPI } from '../services/kundaliMatchingAPI';
import { adminAPI } from '../services/api';

const KundaliMatching = () => {
  const [brideData, setBrideData] = useState({
    name: '',
    rashiName: '',
    rashi: '',
    gautra: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: ''
  });
  
  const [lordGaneshaImage, setLordGaneshaImage] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');

  const [groomData, setGroomData] = useState({
    name: '',
    rashiName: '',
    rashi: '',
    gautra: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: ''
  });

  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchLordGaneshaImage = async () => {
      try {
        const response = await adminAPI.getLordGaneshaImage();
        if (response.data.imageUrl) {
          const baseUrl = 'http://localhost:5000';
          const fullImageUrl = `${baseUrl}${response.data.imageUrl}`;
          setLordGaneshaImage(fullImageUrl);
        }
      } catch (err) {
        console.log('No custom Lord Ganesha image found, using default');
      }
    };
    
    const fetchBackgroundImage = async () => {
      try {
        const response = await adminAPI.getKundaliMatchingBackground();
        if (response.data.imageUrl) {
          const baseUrl = 'http://localhost:5000';
          const fullImageUrl = `${baseUrl}${response.data.imageUrl}`;
          setBackgroundImage(fullImageUrl);
        }
      } catch (err) {
        console.log('No custom background image found, using default');
      }
    };
    
    fetchLordGaneshaImage();
    fetchBackgroundImage();
  }, []);

  const handleBrideInputChange = (e) => {
    const { name, value } = e.target;
    setBrideData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGroomInputChange = (e) => {
    const { name, value } = e.target;
    setGroomData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!brideData.name || !brideData.dateOfBirth || !brideData.placeOfBirth ||
        !groomData.name || !groomData.dateOfBirth || !groomData.placeOfBirth) {
      setError('कृपया दोनों पक्षों के आवश्यक फील्ड भरें (Please fill all mandatory fields for both bride and groom)');
      setLoading(false);
      return;
    }

    try {
      const response = await kundaliMatchingAPI.matchKundalis(brideData, groomData);
      setMatchResult(response.result);
    } catch (err) {
      setError(err.message || 'कुंडली मिलान में त्रुटि हुई (Error in Kundali matching)');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      const response = await kundaliMatchingAPI.generatePDF(brideData, groomData, matchResult);
      alert('PDF generated successfully! In a real implementation, this would download the PDF.');
    } catch (err) {
      alert('Error generating PDF: ' + err.message);
    }
  };

  const resetForm = () => {
    setBrideData({
      name: '',
      rashiName: '',
      rashi: '',
      gautra: '',
      dateOfBirth: '',
      timeOfBirth: '',
      placeOfBirth: ''
    });
    setGroomData({
      name: '',
      rashiName: '',
      rashi: '',
      gautra: '',
      dateOfBirth: '',
      timeOfBirth: '',
      placeOfBirth: ''
    });
    setMatchResult(null);
    setError('');
  };

  // Result Page
  if (matchResult) {
    return (
      <div
        className="relative min-h-screen bg-cover bg-center bg-fixed overflow-hidden"
        style={{ backgroundImage: "url('/images/our1.jpeg')" }}
      >
        <div className="relative z-10">
          <Navigation />
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-10">
              {/* Header */}
              <section className="relative p-10 rounded-[32px] border border-black/10 bg-white/85 backdrop-blur-lg shadow-[0_30px_80px_rgba(0,0,0,0.18)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/50 to-transparent pointer-events-none"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-1 text-center lg:text-left space-y-3">
                    <p className="text-xs uppercase tracking-[0.35em] text-black/70">Ashtakoota Analysis</p>
                    <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-black">
                      कुंडली मिलान <span className="text-astro-gold">परिणाम</span>
                    </h1>
                    <p className="text-black/80 text-lg">
                      Comprehensive compatibility score and remedies derived from traditional guna matching.
                    </p>
                  </div>
                  <div className="flex gap-4 w-full lg:w-auto justify-center">
                    <div className="p-6 rounded-3xl bg-white/90 border border-black/5 shadow-lg text-center min-w-[140px]">
                      <p className="text-xs uppercase tracking-[0.4em] text-black/60 mb-1">Points</p>
                      <p className="text-4xl font-bold text-black">{matchResult.totalPoints}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/90 border border-black/5 shadow-lg text-center min-w-[140px]">
                      <p className="text-xs uppercase tracking-[0.4em] text-black/60 mb-1">Max</p>
                      <p className="text-4xl font-bold text-black">{matchResult.maxPoints}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Result Summary Card */}
              <div className="rounded-3xl border border-black/10 p-8 md:p-10 bg-white/90 backdrop-blur-md shadow-[0_30px_90px_rgba(0,0,0,0.2)] text-center">
                <div className="flex justify-center mb-6">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                    matchResult.totalPoints >= 18 
                      ? 'bg-green-100 border-green-400' 
                      : 'bg-red-100 border-red-400'
                  }`}>
                    {matchResult.totalPoints >= 18 ? (
                      <CheckCircle className="h-16 w-16 text-green-600" />
                    ) : (
                      <XCircle className="h-16 w-16 text-red-600" />
                    )}
                  </div>
                </div>
                
                <h2 className="text-3xl font-cinzel font-bold text-black mb-6">
                  {brideData.name} & {groomData.name}
                </h2>
                
                <div className="flex flex-wrap justify-center items-center mb-8 gap-4">
                  <div className="flex flex-col items-center text-center mx-4">
                    <div className="text-5xl font-bold text-astro-gold">{matchResult.totalPoints}</div>
                    <div className="text-black font-semibold mt-2">Points</div>
                  </div>
                  <div className="flex items-center text-4xl text-gray-400 mx-2">/</div>
                  <div className="flex flex-col items-center text-center mx-4">
                    <div className="text-5xl font-bold text-gray-800">{matchResult.maxPoints}</div>
                    <div className="text-black font-semibold mt-2">Max Points</div>
                  </div>
                </div>
                
                <div className={`text-2xl font-bold mb-6 p-4 rounded-xl ${
                  matchResult.totalPoints >= 18 
                    ? 'bg-green-50 text-green-700 border-2 border-green-300' 
                    : 'bg-red-50 text-red-700 border-2 border-red-300'
                }`}>
                  {matchResult.compatibility === 'Compatible' 
                    ? '✓ यह जोड़ा शादी के लिए अनुकूल है' 
                    : '✗ यह जोड़ा शादी के लिए अनुकूल नहीं है'}
                </div>
                
                <p className="text-black text-lg mb-8 leading-relaxed">
                  {matchResult.totalPoints >= 18 
                    ? 'आपकी कुंडलियाँ शादी के लिए अनुकूल हैं। शुभ समय में विवाह करें।' 
                    : 'आपकी कुंडलियाँ शादी के लिए अनुकूल नहीं हैं। कृपया ज्योतिषाचार्य से परामर्श करें।'}
                </p>
                
                <div className="flex justify-center space-x-4 flex-wrap gap-4">
                  <button
                    onClick={generatePDF}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-astro-gold to-divine-orange text-black font-bold rounded-xl hover:shadow-mystical transition-all duration-300 transform hover:scale-105"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    PDF डाउनलोड करें
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex items-center px-8 py-4 bg-gray-800 text-white border-2 border-gray-700 rounded-xl hover:bg-gray-700 transition-all duration-300 font-semibold"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    नया मिलान करें
                  </button>
                </div>
              </div>
              {/* Detailed Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ashtakoota Details */}
                <div className="rounded-2xl border border-black/10 p-6 bg-white/90 backdrop-blur-md shadow-[0_20px_70px_rgba(0,0,0,0.18)]">
                  <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
                    <Sparkles className="h-6 w-6 mr-2 text-astro-gold" />
                    Ashtakoota Analysis
                  </h3>
                  <div className="flex flex-col space-y-4">
                    {Object.entries(matchResult.details).map(([koot, data]) => (
                      <div key={koot} className="flex justify-between items-center py-3 border-b border-gray-300">
                        <span className="text-black font-semibold capitalize">{koot}</span>
                        <span className="text-black font-bold text-lg">{data.points}/{data.max}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manglik Dosha */}
                <div className="rounded-2xl border border-black/10 p-6 bg-white/90 backdrop-blur-md shadow-[0_20px_70px_rgba(0,0,0,0.18)]">
                  <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
                    <Heart className="h-6 w-6 mr-2 text-astro-gold" />
                    Manglik Dosha Analysis
                  </h3>
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-300">
                      <span className="text-black font-semibold">{brideData.name}</span>
                      <span className={`font-bold text-lg ${matchResult.manglikDosha.bride === 'Yes' ? 'text-red-600' : 'text-green-600'}`}>
                        {matchResult.manglikDosha.bride === 'Yes' ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-300">
                      <span className="text-black font-semibold">{groomData.name}</span>
                      <span className={`font-bold text-lg ${matchResult.manglikDosha.groom === 'Yes' ? 'text-red-600' : 'text-green-600'}`}>
                        {matchResult.manglikDosha.groom === 'Yes' ? 'Yes' : 'No'}
                      </span>
                    </div>
                    
                    {matchResult.remedies && matchResult.remedies.length > 0 && (
                      <div className="flex flex-col mt-6 pt-4 border-t border-gray-300">
                        <h4 className="text-lg font-bold text-black mb-3">Remedies</h4>
                        <ul className="flex flex-col text-black space-y-2">
                          {matchResult.remedies.map((remedy, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-astro-gold mr-2 font-bold">•</span>
                              <span>{remedy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Compatibility Report */}
              <div className="rounded-2xl border border-black/10 p-6 bg-white/90 backdrop-blur-md shadow-[0_20px_70px_rgba(0,0,0,0.18)]">
                <h3 className="text-2xl font-bold text-black mb-4">Detailed Compatibility Report</h3>
                <div className="flex flex-col space-y-4">
                  <p className="text-black leading-relaxed">
                    The Ashtakoota matching system evaluates 36 gunas (qualities) to determine compatibility between the bride and groom. 
                    A minimum of 18 points is required for an approved marriage, with higher scores indicating greater marital harmony.
                  </p>
                  <p className="text-black leading-relaxed">
                    Based on the analysis of the birth charts, the compatibility between {brideData.name} and {groomData.name} 
                    has been assessed. The detailed report includes planetary positions, dosha analysis, and personalized remedies 
                    for a harmonious married life.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
  }

  // Main Form Page
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed overflow-hidden"
      style={{ backgroundImage: "url('/images/our1.jpeg')" }}
    >
      <div className="relative z-10">
        <Navigation />
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Header Section */}
            <section className="relative p-10 rounded-[36px] border border-black/10 bg-white/85 backdrop-blur-lg shadow-[0_35px_100px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col lg:flex-row items-center gap-12">
              <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/50 to-transparent pointer-events-none"></div>
              <div className="relative z-10 flex-1 space-y-5 text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-black/5 border border-black/10">
                  <Heart className="h-10 w-10 text-astro-gold" />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-black/70">Ashtakoota Method</p>
                <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-black">
                  कुंडली मिलान <span className="text-astro-gold">सेवा</span>
                </h1>
                <p className="text-black/80 text-lg">
                  Match Kundalis for marriage compatibility using our precise 36-guna engine and tailored remedies.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-xs uppercase tracking-[0.3em] text-black">
                  <span className="px-4 py-2 rounded-full bg-black/5">PDF Report</span>
                  <span className="px-4 py-2 rounded-full bg-black/5">Manglik Check</span>
                  <span className="px-4 py-2 rounded-full bg-black/5">Remedies</span>
                </div>
              </div>
              <div className="relative z-10 flex-1 w-full grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
                  <p className="text-xs uppercase tracking-[0.4em] text-black/60 mb-2">Engine</p>
                  <p className="text-4xl font-bold text-black">36</p>
                  <p className="text-black/70 text-sm">Gun matching + Manglik analysis.</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
                  <p className="text-xs uppercase tracking-[0.4em] text-black/60 mb-2">Turnaround</p>
                  <p className="text-4xl font-bold text-black">2 min</p>
                  <p className="text-black/70 text-sm">Average processing time.</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/90 border border-black/5 shadow-lg col-span-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-black/60 mb-2">Guidance</p>
                  <p className="text-black">
                    Includes dosha detection, compatibility summary, and personalized remedy list crafted by Vedic experts.
                  </p>
                </div>
              </div>
            </section>

            {/* Lord Ganesha Image */}
            {lordGaneshaImage && (
              <div className="flex justify-center">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-black/10 shadow-[0_20px_70px_rgba(0,0,0,0.15)]">
                  <img 
                    src={lordGaneshaImage} 
                    alt="Lord Ganesha" 
                    className="w-32 h-32 mx-auto object-contain"
                  />
                </div>
              </div>
            )}

            {/* Main Form Card */}
            <div className="rounded-3xl border border-black/10 p-8 md:p-10 bg-white/90 backdrop-blur-md shadow-[0_35px_110px_rgba(0,0,0,0.25)]">
            <form onSubmit={handleSubmit} className="space-y-8 text-black">
              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-800 px-6 py-4 rounded-xl text-center font-semibold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bride Section */}
                <div className="lg:pr-4 flex flex-col">
                  <div className="mb-6 pb-4 border-b-2 border-astro-gold/30 flex items-center justify-center">
                    <h2 className="text-2xl font-bold text-black flex items-center justify-center">
                      <Heart className="h-6 w-6 mr-2 text-astro-gold" />
                      वधू (Bride)
                    </h2>
                  </div>
                  
                  <div className="flex flex-col space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2 text-astro-gold" />
                        पूरा नाम (Full Name) <span className="text-red-600 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={brideData.name}
                        onChange={handleBrideInputChange}
                        required
                            className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-300"
                        placeholder="वधू का पूरा नाम"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-3">
                        राशि नाम (Rashi Name)
                      </label>
                      <input
                        type="text"
                        name="rashiName"
                        value={brideData.rashiName}
                        onChange={handleBrideInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-300"
                        placeholder="मेष, वृषभ, मिथुन, आदि"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-3">
                        राशि (Rashi)
                      </label>
                      <input
                        type="text"
                        name="rashi"
                        value={brideData.rashi}
                        onChange={handleBrideInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-300"
                        placeholder="राशि की संख्या (1-12)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-3">
                        गोत्र (Gautra)
                      </label>
                      <input
                        type="text"
                        name="gautra"
                        value={brideData.gautra}
                        onChange={handleBrideInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-300"
                        placeholder="गोत्र का नाम"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-astro-gold" />
                        जन्म तिथि (Date of Birth) <span className="text-red-600 ml-1">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={brideData.dateOfBirth}
                        onChange={handleBrideInputChange}
                        required
                        className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-astro-gold" />
                        जन्म समय (Time of Birth)
                      </label>
                      <input
                        type="time"
                        name="timeOfBirth"
                        value={brideData.timeOfBirth}
                        onChange={handleBrideInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-astro-gold" />
                        जन्म स्थान (Place of Birth) <span className="text-red-600 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="placeOfBirth"
                        value={brideData.placeOfBirth}
                        onChange={handleBrideInputChange}
                        required
                        className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-300"
                        placeholder="शहर, राज्य, देश"
                      />
                    </div>
                  </div>
                </div>

                {/* Groom Section */}
                <div className="lg:pl-4 flex flex-col">
                  <div className="mb-6 pb-4 border-b-2 border-astro-gold/30 flex items-center justify-center">
                    <h2 className="text-2xl font-bold text-black flex items-center justify-center">
                      <Heart className="h-6 w-6 mr-2 text-astro-gold" />
                      वर (Groom)
                    </h2>
                  </div>
                  
                  <div className="flex flex-col space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2 text-astro-gold" />
                        पूरा नाम (Full Name) <span className="text-red-600 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={groomData.name}
                        onChange={handleGroomInputChange}
                        required
                        className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-300"
                        placeholder="वर का पूरा नाम"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-3">
                        राशि नाम (Rashi Name)
                      </label>
                      <input
                        type="text"
                        name="rashiName"
                        value={groomData.rashiName}
                        onChange={handleGroomInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-300"
                        placeholder="मेष, वृषभ, मिथुन, आदि"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-3">
                        राशि (Rashi)
                      </label>
                      <input
                        type="text"
                        name="rashi"
                        value={groomData.rashi}
                        onChange={handleGroomInputChange}
                        className="w-full px-5 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold transition-all duration-300"
                        placeholder="राशि की संख्या (1-12)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-3">
                        गोत्र (Gautra)
                      </label>
                      <input
                        type="text"
                        name="gautra"
                        value={groomData.gautra}
                        onChange={handleGroomInputChange}
                        className="w-full px-5 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold transition-all duration-300"
                        placeholder="गोत्र का नाम"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-astro-gold" />
                        जन्म तिथि (Date of Birth) <span className="text-red-600 ml-1">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={groomData.dateOfBirth}
                        onChange={handleGroomInputChange}
                        required
                        className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-astro-gold" />
                        जन्म समय (Time of Birth)
                      </label>
                      <input
                        type="time"
                        name="timeOfBirth"
                        value={groomData.timeOfBirth}
                        onChange={handleGroomInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-astro-gold" />
                        जन्म स्थान (Place of Birth) <span className="text-red-600 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="placeOfBirth"
                        value={groomData.placeOfBirth}
                        onChange={handleGroomInputChange}
                        required
                        className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-300"
                        placeholder="शहर, राज्य, देश"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-astro-gold via-divine-orange to-astro-gold text-black font-bold text-lg rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader className="h-6 w-6 animate-spin" />
                      <span>प्रस्तुत कर रहे हैं... (Processing...)</span>
                    </>
                  ) : (
                    <>
                      <Heart className="h-6 w-6" />
                      <span>कुंडली मिलान करें (Match Kundalis)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Info Text */}
              <div className="pt-6 border-t border-black/10">
                <div className="flex items-start gap-3 p-4 bg-black/5 rounded-2xl border border-black/10">
                  <Sparkles className="h-5 w-5 text-astro-gold mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-black">
                    <p className="mb-1 font-semibold">🕉 अष्टकूट पद्धति का उपयोग करके कुंडली मिलान किया जाएगा</p>
                    <p className="text-black/70">Kundali matching will be performed using the Ashtakoota system (36 gunas).</p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default KundaliMatching;
