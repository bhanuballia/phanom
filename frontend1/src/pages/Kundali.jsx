import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Navigation from '../components/Navigation';
import KundaliChart from '../components/KundaliChart';
import {
  User,
  Calendar,
  MapPin,
  Clock,
  Mail,
  Phone,
  Star,
  Send,
  Loader,
  Download,
  CheckCircle,
  Eye,
  Sparkles,
  FileText,
  ArrowLeft,
  Shield,
  Globe
} from 'lucide-react';
import { kundaliAPI } from '../services/api';
import vedastroAPI from '../services/vedastroAPI';


const Kundali = () => {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    country: '',
    state: '',
    placeOfBirth: '',
    timeOfBirth: '',
    coordinates: '',
    timezone: '',
    email: '',
    phoneNumber: '',
    chartStyle: 'SouthIndian', // Default to South Indian
    divisionalChartType: 'RasiD1' // Default to Rasi D1
  });
  const [generationMode, setGenerationMode] = useState('accurate'); // 'accurate' or 'quick'
  const [loading, setLoading] = useState(false);
  const [isFetchingCoords, setIsFetchingCoords] = useState(false);
  const [isFetchingTimezone, setIsFetchingTimezone] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [generatedKundali, setGeneratedKundali] = useState(null);
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
  const [useVedAstro, setUseVedAstro] = useState(true); // Use VedAstro by default for accurate calculations
  const [lagnaChart, setLagnaChart] = useState(null);
  const [chartSvg, setChartSvg] = useState(null);
  const [planetaryPositions, setPlanetaryPositions] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();


  useEffect(() => {
    if (location.state?.quickPreviewData) {
      const data = location.state.quickPreviewData;
      setFormData(prev => ({
        ...prev,
        name: data.name || '',
        dateOfBirth: data.dateOfBirth || '',
        timeOfBirth: data.timeOfBirth || '',
        placeOfBirth: data.placeOfBirth || ''
      }));
      setGenerationMode('quick');

      // Scroll to the form section
      setTimeout(() => {
        const formElement = document.getElementById('kundali-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const buildLocationQuery = () => {
    const { country, state, placeOfBirth } = formData;
    if (!country || !state || !placeOfBirth) {
      setError('कृपया देश, राज्य और जन्म स्थान भरें (Fill country, state & city first)');
      throw new Error('missing-fields');
    }
    return `${placeOfBirth}, ${state}, ${country}`;
  };

  const fetchCoordinatesForLocation = async () => {
    const searchQuery = encodeURIComponent(buildLocationQuery());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${searchQuery}`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'AstrologyApp/1.0 (contact@astroconsult)'
        }
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch coordinates');
    }

    const data = await response.json();
    if (data.length === 0) {
      throw new Error('not-found');
    }

    const { lat, lon } = data[0];
    return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)}`;
  };

  const handleFetchCoordinates = async () => {
    try {
      setIsFetchingCoords(true);
      setError('');
      const coords = await fetchCoordinatesForLocation();
      setFormData(prev => ({ ...prev, coordinates: coords }));
    } catch (coordErr) {
      if (coordErr.message === 'missing-fields') {
        // error already set
      } else if (coordErr.message === 'not-found') {
        setError('स्थान के लिए स्थान निर्देशांक नहीं मिले (No coordinates found for this place)');
        setFormData(prev => ({ ...prev, coordinates: '' }));
      } else {
        setError('स्थान निर्देशांक प्राप्त करने में समस्या (Could not fetch coordinates)');
      }
    } finally {
      setIsFetchingCoords(false);
    }
  };

  const handleFetchTimezone = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      setIsFetchingTimezone(true);
      setError('');
      let coords = formData.coordinates;
      if (!coords) {
        coords = await fetchCoordinatesForLocation();
        setFormData(prev => ({ ...prev, coordinates: coords }));
      }

      const [lat, lon] = coords.split(',').map((val) => parseFloat(val.trim()));

      try {
        // Try Primary API: timeapi.io
        const response = await fetch(
          `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`,
          { signal: controller.signal }
        );

        if (response.ok) {
          const data = await response.json();
          const tzName = data.timeZone || data.timezone || data.TimeZone || '';
          if (tzName) {
            setFormData(prev => ({ ...prev, timezone: tzName }));
            clearTimeout(timeoutId);
            return;
          }
        }
      } catch (err) {
        console.warn('Primary Timezone API failed, trying fallback...', err);
      }

      // Try Fallback API: worldtimeapi.org
      try {
        const fallbackRes = await fetch(
          `https://worldtimeapi.org/api/timezone/etc/GMT`, // Simple check or lookup
          { signal: controller.signal }
        );
        // Note: worldtimeapi doesn't have a direct coordinate lookup without a key usually, 
        // but it's a good place to start for a manual guess or just alert the user.
        // Instead, let's use a more reliable coordinate-to-timezone logic:
      } catch (fErr) {
        console.warn('Fallback Timezone API also failed.');
      }

      // If Latitude is between 6.5 and 35.5 and Longitude is between 68.1 and 97.4, it's likely IST (India)
      if (lat > 6 && lat < 38 && lon > 68 && lon < 98) {
        setFormData(prev => ({ ...prev, timezone: 'Asia/Kolkata' }));
        return;
      }

      setError('टाइमज़ोन प्राप्त करने में समस्या (Timezone API timeout). कृपया स्वयं दर्ज करें।');
    } catch (tzErr) {
      if (tzErr.name === 'AbortError') {
        setError('टाइमज़ोन सर्वर प्रतिक्रिया नहीं दे रहा है (Timezone server timeout).');
      } else if (tzErr.message === 'missing-fields') {
        // already handled
      } else {
        setError('टाइमज़ोन खोज विफल रही (Timezone lookup failed).');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsFetchingTimezone(false);
    }
  };

  const generatePDF = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (generationMode === 'quick') {
      if (!formData.dateOfBirth) {
        setError('कृपया जन्म तिथि भरें (Please fill Date of Birth)');
        setLoading(false);
        return;
      }
    } else {
      if (!formData.name || !formData.dateOfBirth || !formData.placeOfBirth) {
        setError('कृपया सभी आवश्यक फील्ड भरें (Please fill all mandatory fields)');
        setLoading(false);
        return;
      }
    }

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

    const mapChartTypeToFullScreenCode = (type) => {
      switch (type) {
        case 'RasiD1': return 'd1';
        case 'HoraD2': return 'd2';
        case 'DrekkanaD3': return 'd3';
        case 'ChaturthamshaD4': return 'd4';
        case 'SaptamshaD7': return 'd7';
        case 'NavamshaD9': return 'd9';
        case 'DashamamshaD10': return 'd10';
        case 'DwadashamshaD12': return 'd12';
        case 'ShodashamshaD16': return 'd16';
        case 'VimshamshaD20': return 'd20';
        case 'ChaturvimshamshaD24': return 'd24';
        case 'BhamshaD27': return 'd27';
        case 'TrimshamshaD30': return 'd30';
        case 'KhavedamshaD40': return 'd40';
        case 'AkshavedamshaD45': return 'd45';
        case 'ShashtyamshaD60': return 'd60';
        default: return 'd1';
      }
    };

    try {
      const submissionData = { ...formData };

      if (generationMode === 'quick') {
        submissionData.name = formData.name || 'Quick User';
        submissionData.timeOfBirth = formData.timeOfBirth || '12:00';
        submissionData.placeOfBirth = formData.placeOfBirth || 'New Delhi';
        submissionData.country = formData.country || 'India';
        submissionData.state = formData.state || 'Delhi';
        submissionData.coordinates = formData.coordinates || '28.6139, 77.2090';
        submissionData.timezone = formData.timezone || 'Asia/Kolkata';
      }

      let lat = "28.6139";
      let lon = "77.2090";
      if (submissionData.coordinates) {
        const parts = submissionData.coordinates.split(',');
        if (parts.length === 2) {
          lat = parts[0].trim();
          lon = parts[1].trim();
        }
      }

      const offset = getTzOffset(submissionData.timezone || 'Asia/Kolkata');
      // Pass coordinates explicitly in submissionData if they exist, or defaults
      submissionData.coordinates = submissionData.coordinates || `${lat}, ${lon}`;
      submissionData.timezone = submissionData.timezone || 'Asia/Kolkata';

      navigate('/kundali-hub', { state: { birthData: submissionData } });
      setLoading(false);

    } catch (err) {
      console.error('Kundali generation error:', err);
      setError(err.message || 'Error generating Kundali');
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!generatedKundali) {
      setError('कुंडली डेटा उपलब्ध नहीं है (Kundali data not available)');
      return;
    }

    try {
      setLoading(true);
      setError(''); // Clear any previous errors

      // Send birth details for comprehensive PDF generation
      const pdfData = {
        name: formData.name || (generationMode === 'quick' ? 'Quick User' : ''),
        dateOfBirth: formData.dateOfBirth,
        timeOfBirth: formData.timeOfBirth || '12:00',
        placeOfBirth: formData.placeOfBirth || (generationMode === 'quick' ? 'New Delhi' : ''),
        gender: formData.gender || 'Male',
        coordinates: formData.coordinates || '28.6139, 77.2090',
        timezone: formData.timezone || 'Asia/Kolkata'
      };

      console.log('📤 Sending PDF request with data:', pdfData);

      // Show a message that PDF generation is in progress
      setError('PDF तैयार हो रही है... कृपया प्रतीक्षा करें (Generating PDF... Please wait)');

      const response = await kundaliAPI.generatePDF(pdfData);

      console.log('✅ PDF Response received:', response);

      // Check if response has data
      if (!response.data) {
        throw new Error('PDF data not received from server');
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formData.name.replace(/\s+/g, '_')}_Kundali_Report.pdf`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setError(''); // Clear the "generating" message
      setLoading(false);

      // Show success message
      alert('✅ PDF सफलतापूर्वक डाउनलोड हो गई! (PDF downloaded successfully!)');

    } catch (err) {
      console.error('❌ PDF Download Error:', err);
      console.error('Error Response:', err.response);
      console.error('Error Message:', err.message);

      let errorMessage = 'PDF डाउनलोड करने में त्रुटि हुई (Error downloading PDF)';

      if (err.response) {
        // Server responded with an error
        if (err.response.status === 500) {
          errorMessage = 'सर्वर त्रुटि - PDF बनाने में समस्या (Server error generating PDF)';
        } else if (err.response.status === 404) {
          errorMessage = 'PDF सेवा उपलब्ध नहीं है (PDF service not found)';
        } else if (err.response.data) {
          try {
            const errorText = await err.response.data.text();
            errorMessage = errorText || errorMessage;
          } catch (e) {
            // Couldn't parse error
          }
        }
      } else if (err.request) {
        // Request was made but no response
        errorMessage = 'सर्वर से कोई प्रतिक्रिया नहीं मिली (No response from server)';
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleSendToEmail = async () => {
    if (!formData.email) {
      setError('कृपया ईमेल पता दर्ज करें (Please enter email address)');
      return;
    }

    try {
      setLoading(true);
      await kundaliAPI.sendToEmail({
        name: formData.name,
        email: formData.email,
        kundaliText: generatedKundali.text
      });

      setSuccess(true);
      setShowDeliveryOptions(false);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'ईमेल भेजने में त्रुटि हुई (Error sending email)');
      setLoading(false);
    }
  };

  const handleSendToPhone = async () => {
    if (!formData.phoneNumber) {
      setError('कृपया मोबाइल नंबर दर्ज करें (Please enter phone number)');
      return;
    }

    try {
      setLoading(true);
      await kundaliAPI.sendToPhone({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        kundaliText: generatedKundali.text
      });

      setSuccess(true);
      setShowDeliveryOptions(false);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'SMS भेजने में त्रुटि हुई (Error sending SMS)');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dateOfBirth: '',
      country: '',
      state: '',
      placeOfBirth: '',
      timeOfBirth: '',
      coordinates: '',
      timezone: '',
      email: '',
      phoneNumber: '',
      chartStyle: 'SouthIndian',
      divisionalChartType: 'RasiD1'
    });
    setSuccess(false);
    setShowDeliveryOptions(false);
    setGeneratedKundali(null);
    setLagnaChart(null);
    setChartSvg(null);
    setPlanetaryPositions([]);
    setError('');
  };

  const goBackToForm = () => {
    setShowDeliveryOptions(false);
    setError('');
  };

  // Success State
  if (success) {
    return (
      <div
        className="relative min-h-screen bg-cover bg-center bg-fixed overflow-hidden"
        style={{ backgroundImage: "url('/images/our1.jpeg')" }}
      >
        <div className="relative z-10">
          <Navigation />
          <div className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
            <div className="max-w-2xl w-full mx-auto rounded-[32px] border border-black/10 bg-white/90 backdrop-blur-md shadow-[0_35px_90px_rgba(0,0,0,0.25)] p-10 text-center">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-200 to-emerald-200 rounded-full flex items-center justify-center border border-green-400/40 shadow-inner">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
              </div>
              <h2 className="text-3xl font-cinzel font-bold text-black mb-2">
                कुंडली सफलतापूर्वक बन गई!
              </h2>
              <p className="text-xl font-cinzel text-black/70 mb-4">
                Kundali Generated Successfully!
              </p>
              <div className="my-8 p-6 bg-black/5 rounded-2xl border border-black/10">
                <p className="text-black mb-3 leading-relaxed">
                  आपकी कुंडली आपके द्वारा प्रदान किए गए ईमेल या मोबाइल नंबर पर भेज दी गई है।
                </p>
                <p className="text-black/70 text-sm">
                  Your Kundali has been sent to your email or mobile number.
                </p>
              </div>
              <button
                onClick={resetForm}
                className="px-8 py-4 bg-gradient-to-r from-astro-gold via-divine-orange to-astro-gold text-astro-dark font-semibold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto gap-2"
              >
                <Sparkles className="h-5 w-5" />
                <span>एक और कुंडली बनाएं (Generate Another)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Delivery Options State
  if (showDeliveryOptions && generatedKundali) {
    return (
      <div
        className="relative min-h-screen bg-cover bg-center bg-fixed overflow-hidden"
        style={{ backgroundImage: "url('/images/our1.jpeg')" }}
      >
        <div className="relative z-10">
          <Navigation />
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Header */}
              <section className="relative p-8 rounded-[32px] border border-black/10 bg-white/85 backdrop-blur-lg shadow-[0_30px_80px_rgba(0,0,0,0.2)] text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/50 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-black/5 rounded-full mb-5 border border-black/10">
                    <Sparkles className="h-10 w-10 text-astro-gold" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-black mb-3">
                    कुंडली तैयार है!
                  </h1>
                  <p className="text-xl text-black/70 mb-2">Your Kundali is Ready!</p>
                  <p className="text-black uppercase tracking-[0.3em] text-xs">
                    अब अपनी कुंडली कैसे प्राप्त करना चाहते हैं?
                  </p>
                </div>
              </section>

              {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-center">
                  {error}
                </div>
              )}

              {/* Delivery Options Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <button
                  onClick={handleDownloadPDF}
                  className="text-left rounded-2xl border border-black/10 bg-white/90 backdrop-blur-md p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition"
                >
                  <div className="w-16 h-16 mb-4 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Download className="h-7 w-7 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-1">Download PDF</h3>
                  <p className="text-sm text-black/70 mb-2">PDF डाउनलोड करें</p>
                  <p className="text-xs text-black/60">Save to your device instantly.</p>
                </button>

                <button
                  onClick={handleSendToEmail}
                  className="text-left rounded-2xl border border-black/10 bg-white/90 backdrop-blur-md p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition"
                >
                  <div className="w-16 h-16 mb-4 rounded-2xl bg-pink-100 flex items-center justify-center">
                    <Mail className="h-7 w-7 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-1">Email</h3>
                  <p className="text-sm text-black/70 mb-2">ईमेल पर भेजें</p>
                  <p className="text-xs text-black/60">{formData.email || 'Email required'}</p>
                </button>

                <button
                  onClick={handleSendToPhone}
                  className="text-left rounded-2xl border border-black/10 bg-white/90 backdrop-blur-md p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition"
                >
                  <div className="w-16 h-16 mb-4 rounded-2xl bg-green-100 flex items-center justify-center">
                    <Phone className="h-7 w-7 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-1">SMS</h3>
                  <p className="text-sm text-black/70 mb-2">मोबाइल पर भेजें</p>
                  <p className="text-xs text-black/60">{formData.phoneNumber || 'Phone required'}</p>
                </button>
              </div>

              {/* Preview Section */}
              <div className="rounded-2xl border border-black/10 bg-white/90 backdrop-blur-md p-6 shadow-[0_25px_70px_rgba(0,0,0,0.18)]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                    <Eye className="h-5 w-5 text-astro-gold" />
                    Preview
                  </h3>
                  <button
                    onClick={goBackToForm}
                    className="text-sm text-black/60 hover:text-black flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Edit Details
                  </button>
                </div>
                <div className="bg-black/5 rounded-xl p-4 border border-black/10 max-h-60 overflow-y-auto text-black">
                  <pre className="text-sm whitespace-pre-wrap font-mono text-black/80">
                    {generatedKundali.text.substring(0, 500)}
                    {generatedKundali.text.length > 500 && '...'}
                  </pre>
                </div>
              </div>

              {/* Lagna Chart & South Indian Chart */}
              {(lagnaChart || chartSvg) && (
                <div className="rounded-2xl border border-black/10 bg-white/90 backdrop-blur-md p-6 shadow-[0_25px_70px_rgba(0,0,0,0.18)] space-y-8">

                  {/* South Indian / North Indian Chart SVG */}
                  {chartSvg && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-black flex items-center gap-2">
                        <Star className="h-5 w-5 text-astro-gold" />
                        {formData.chartStyle === 'NorthIndian' ? 'उत्तर भारतीय चार्ट (North Indian Chart)' : 'दक्षिण भारतीय चार्ट (South Indian Chart)'}
                        - {formData.divisionalChartType}
                      </h3>
                      <div className="w-full overflow-auto bg-white p-4 rounded-xl border border-black/10 flex justify-center">
                        {/* Render SVG safely */}
                        <div
                          className="w-full max-w-md"
                          dangerouslySetInnerHTML={{ __html: chartSvg }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Traditional Lagna Chart Grid */}
                  {lagnaChart && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-black flex items-center gap-2">
                        <Star className="h-5 w-5 text-astro-gold" />
                        लग्न चार्ट (Lagna Chart Details)
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {lagnaChart.map((house) => (
                          <div key={house.house} className="rounded-xl border border-black/10 bg-black/5 p-4">
                            <p className="text-xs uppercase tracking-widest text-black/50">
                              House {house.house}
                            </p>
                            <p className="text-sm font-semibold text-black mt-1">{house.sign}</p>
                            <p className="text-xs text-black/70 mt-2">
                              {house.planets.length > 0 ? house.planets.map((p) => p.name).join(', ') : '—'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Planetary Positions */}
              {planetaryPositions.length > 0 && (
                <div className="rounded-2xl border border-black/10 bg-white/90 backdrop-blur-md p-6 shadow-[0_25px_70px_rgba(0,0,0,0.18)] space-y-4">
                  <h3 className="text-2xl font-semibold text-black flex items-center gap-2">
                    <Star className="h-5 w-5 text-astro-gold" />
                    ग्रह स्थिति (Planetary Positions)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-black">
                      <thead>
                        <tr className="text-xs uppercase tracking-widest text-black/60">
                          <th className="py-3 pr-4">Planet</th>
                          <th className="py-3 pr-4">Sign</th>
                          <th className="py-3 pr-4">Degree</th>
                          <th className="py-3 pr-4">House</th>
                          <th className="py-3 pr-4">Motion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planetaryPositions.map((planet) => (
                          <tr key={`${planet.planet}-${planet.degree}`} className="border-t border-black/5">
                            <td className="py-3 pr-4 font-semibold">{planet.planet}</td>
                            <td className="py-3 pr-4">{planet.sign}</td>
                            <td className="py-3 pr-4">{planet.degree}°</td>
                            <td className="py-3 pr-4">{planet.house}</td>
                            <td className="py-3 pr-4">{planet.motion}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Back Button */}
              <div className="text-center">
                <button
                  onClick={goBackToForm}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-black/10 bg-white text-black shadow-lg hover:shadow-xl transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Form State
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed overflow-hidden"
      style={{ backgroundImage: "url('/images/our1.jpeg')" }}
    >
      <div className="relative z-10">
        <Navigation />
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <section className="py-10">
            <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 p-10 rounded-[36px] border border-black/10 bg-white/85 backdrop-blur-lg shadow-[0_30px_90px_rgba(0,0,0,0.2)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/60 to-transparent pointer-events-none"></div>
              <div className="relative z-10 flex-1 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-black/5 border border-black/10">
                  <Sparkles className="h-10 w-10 text-astro-gold" />
                </div>
                <p className="text-sm uppercase tracking-[0.3em] text-black/70">वैदिक ज्योतिष</p>
                <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-black leading-tight">
                  जन्म कुंडली <span className="text-astro-gold">Generation</span>
                </h1>
                <p className="text-black/80 text-lg">
                  Get your detailed Hindu astrology birth chart generated instantly and delivered securely to your mobile or email.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-xs uppercase tracking-[0.3em] text-black">
                  <span className="px-4 py-2 rounded-full bg-black/5">Instant PDF</span>
                  <span className="px-4 py-2 rounded-full bg-black/5">Email & SMS</span>
                  <span className="px-4 py-2 rounded-full bg-black/5">Hindi Output</span>
                </div>
              </div>
              <div className="relative z-10 flex-1 w-full grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
                  <p className="text-xs uppercase tracking-[0.4em] text-black/60 mb-2">Accuracy</p>
                  <p className="text-4xl font-bold text-black">99.2%</p>
                  <p className="text-black/70 text-sm">Verified against traditional scripts.</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
                  <p className="text-xs uppercase tracking-[0.4em] text-black/60 mb-2">Delivery</p>
                  <p className="text-4xl font-bold text-black">60s</p>
                  <p className="text-black/70 text-sm">Average time to receive your chart.</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/90 border border-black/5 shadow-lg col-span-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-black/60 mb-2">VedAstro Engine</p>
                  <p className="text-black">
                    Powered by VedAstro - accurate calculations using Swiss Ephemeris for precise planetary positions and Vedic astrology principles.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Form Card */}
          <div id="kundali-form" className="max-w-5xl mx-auto">
            <div className="rounded-[32px] border border-black/10 bg-white/90 backdrop-blur-lg shadow-[0_35px_110px_rgba(0,0,0,0.25)] p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6 text-black">
                {error && (
                  <div className="bg-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
                    {error}
                  </div>
                )}

                {/* Generation Mode Selector */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-astro-gold" />
                    कुंडली मोड (Generation Mode)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setGenerationMode('accurate')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${generationMode === 'accurate' ? 'border-astro-gold bg-astro-gold/10' : 'border-black/10 bg-white hover:border-black/20'}`}
                    >
                      <Sparkles className={`h-5 w-5 mb-2 ${generationMode === 'accurate' ? 'text-astro-gold' : 'text-black/40'}`} />
                      <span className="font-bold text-black">Accurate</span>
                      <span className="text-[10px] text-black/60 uppercase tracking-widest">Full Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerationMode('quick')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${generationMode === 'quick' ? 'border-astro-gold bg-astro-gold/10' : 'border-black/10 bg-white hover:border-black/20'}`}
                    >
                      <Clock className={`h-5 w-5 mb-2 ${generationMode === 'quick' ? 'text-astro-gold' : 'text-black/40'}`} />
                      <span className="font-bold text-black">Quick</span>
                      <span className="text-[10px] text-black/60 uppercase tracking-widest">DOB Only</span>
                    </button>
                  </div>
                  <p className="text-xs text-black/60 mt-2 text-center">
                    {generationMode === 'accurate'
                      ? 'Best for detailed predictions. All birth details required.'
                      : 'Fast generation using default time (12:00 PM) and location (India).'}
                  </p>
                </div>

                {/* VedAstro Toggle */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-2xl border border-black/10 bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-astro-gold mt-1" />
                    <div>
                      <label className="text-sm font-semibold text-black">
                        Use VedAstro for Accurate Calculations
                      </label>
                      <p className="text-xs text-black/70">Powered by Swiss Ephemeris - Industry standard for astronomical calculations</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useVedAstro}
                      onChange={(e) => setUseVedAstro(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-black/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-black/10 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {/* Divisional Chart Type Selector */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                    <Star className="h-4 w-4 mr-2 text-astro-gold" />
                    चार्ट प्रकार (Divisional Chart Type)
                  </label>
                  <select
                    name="divisionalChartType"
                    value={formData.divisionalChartType}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                  >
                    <option value="BhavaChalit">Bhava Chalit (House Chart)</option>
                    <option value="RasiD1">Rasi D1 (Basic Birth Chart)</option>
                    <option value="HoraD2">Hora D2 (Wealth)</option>
                    <option value="DrekkanaD3">Drekkana D3 (Siblings)</option>
                    <option value="ChaturthamshaD4">Chaturthamsha D4 (Assets)</option>
                    <option value="SaptamshaD7">Saptamsha D7 (Progeny)</option>
                    <option value="NavamshaD9">Navamsha D9 (Spouse/Dharma)</option>
                    <option value="DashamamshaD10">Dashamamsha D10 (Nature/Profession)</option>
                    <option value="DwadashamshaD12">Dwadashamsha D12 (Ancestors)</option>
                    <option value="ShodashamshaD16">Shodashamsha D16 (Vehicles)</option>
                    <option value="VimshamshaD20">Vimshamsha D20 (Spiritual Progress)</option>
                    <option value="ChaturvimshamshaD24">Chaturvimshamsha D24 (Education)</option>
                    <option value="BhamshaD27">Bhamsha D27 (Strengths/Weaknesses)</option>
                    <option value="TrimshamshaD30">Trimshamsha D30 (Adversities)</option>
                    <option value="KhavedamshaD40">Khavedamsha D40 (Good/Bad Results)</option>
                    <option value="AkshavedamshaD45">Akshavedamsha D45 (All Areas)</option>
                    <option value="ShashtyamshaD60">Shashtyamsha D60 (Karma/Past Life)</option>
                  </select>
                </div>

                {/* Chart Style Selector */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-astro-gold" />
                    कुंडली चार्ट शैली (Chart Style)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.chartStyle === 'SouthIndian' ? 'border-astro-gold bg-astro-gold/10' : 'border-black/10 bg-white hover:border-black/20'}`}>
                      <input
                        type="radio"
                        name="chartStyle"
                        value="SouthIndian"
                        checked={formData.chartStyle === 'SouthIndian'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="font-semibold text-black">South Indian</span>
                    </label>
                    <label className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.chartStyle === 'NorthIndian' ? 'border-astro-gold bg-astro-gold/10' : 'border-black/10 bg-white hover:border-black/20'}`}>
                      <input
                        type="radio"
                        name="chartStyle"
                        value="NorthIndian"
                        checked={formData.chartStyle === 'NorthIndian'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="font-semibold text-black">North Indian</span>
                    </label>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name Field - Always show but optional in Quick */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2 text-astro-gold" />
                      पूरा नाम (Full Name) {generationMode === 'accurate' && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                      placeholder="अपना पूरा नाम दर्ज करें"
                    />
                  </div>

                  {/* Date of Birth - Essential for both */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-astro-gold" />
                      जन्म तिथि (Date of Birth) <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                    />
                  </div>

                  {/* Time of Birth - Always show */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-astro-gold" />
                      जन्म समय (Time of Birth)
                    </label>
                    <input
                      type="time"
                      name="timeOfBirth"
                      value={formData.timeOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                    />
                    <p className="text-xs text-black/60 mt-2">
                      यदि समय पता नहीं है तो 12:00 दोपहर माना जाएगा (Defaults to 12:00 PM)
                    </p>
                  </div>

                  {/* Place of Birth - Always show */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-astro-gold" />
                      जन्म स्थान (Place of Birth) <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                      placeholder="शहर का नाम (e.g. New Delhi)"
                    />
                  </div>

                  {generationMode === 'accurate' && (
                    <>
                      {/* country of  birth */}
                      <div>
                        <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-astro-gold" />
                          Country <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required={generationMode === 'accurate'}
                          className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                          placeholder="देश"
                        />
                      </div>

                      {/* state of  birth */}
                      <div>
                        <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-astro-gold" />
                          State  <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required={generationMode === 'accurate'}
                          className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                          placeholder="राज्य"
                        />
                      </div>

                      {/* Coordinates */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-astro-gold" />
                          निर्देशांक (Coordinates)
                        </label>
                        <div className="flex flex-col md:flex-row gap-4">
                          <input
                            type="text"
                            name="coordinates"
                            value={formData.coordinates}
                            onChange={handleInputChange}
                            className="flex-1 px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                            placeholder="Latitude, Longitude (e.g. 28.6139, 77.2090)"
                          />
                          <button
                            type="button"
                            onClick={handleFetchCoordinates}
                            disabled={isFetchingCoords}
                            className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isFetchingCoords ? 'Fetching...' : 'Get Coordinates'}
                          </button>
                        </div>
                        <p className="text-xs text-black/60 mt-2">
                          देश, राज्य और जन्म स्थान के आधार पर अक्षांश और देशांतर स्वतः प्राप्त होंगे।
                        </p>
                      </div>

                      {/* Timezone */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-astro-gold" />
                          टाइमज़ोन (Timezone)
                        </label>
                        <div className="flex flex-col md:flex-row gap-4">
                          <input
                            type="text"
                            name="timezone"
                            value={formData.timezone}
                            onChange={handleInputChange}
                            className="flex-1 px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                            placeholder="Timezone (e.g. Asia/Kolkata)"
                          />
                          <button
                            type="button"
                            onClick={handleFetchTimezone}
                            disabled={isFetchingTimezone}
                            className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isFetchingTimezone ? 'Fetching...' : 'Get Timezone'}
                          </button>
                        </div>
                        <p className="text-xs text-black/60 mt-2">
                          दिए गए स्थान और निर्देशांक के आधार पर टाइमज़ोन स्वतः प्राप्त होगा।
                        </p>
                      </div>

                    </>
                  )}

                  {/* Email - Show for both */}
                  <div className={generationMode === 'quick' ? 'md:col-span-1' : ''}>
                    <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-astro-gold" />
                      ईमेल (Email)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-3 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-astro-gold" />
                      मोबाइल नंबर (Phone Number)
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-white border border-black/15 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-4 bg-gradient-to-r from-astro-gold via-divine-orange to-astro-gold text-astro-dark font-bold text-lg rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-6 w-6 animate-spin" />
                        <span>{useVedAstro ? 'VedAstro के साथ कुंडली बनाई जा रही है...' : 'कुंडली बनाई जा रही है...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-6 w-6" />
                        <span>{useVedAstro ? 'VedAstro के साथ कुंडली बनाएं (Generate with VedAstro)' : 'कुंडली बनाएं (Generate Kundali)'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Info Text */}
                <div className="pt-4 border-t border-black/10">
                  <div className="flex items-start gap-3 p-4 bg-black/5 rounded-2xl">
                    <Shield className="h-5 w-5 text-astro-gold mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-black">
                      <p className="mb-1 font-semibold">🕉 आपकी कुंडली हिंदी में वैदिक ज्योतिष के अनुसार तैयार की जाएगी</p>
                      <p className="text-black/70">Your Kundali will be prepared in Hindi according to Vedic astrology principles.</p>
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

export default Kundali;
