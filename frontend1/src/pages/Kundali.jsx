import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

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
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      let userCity = user.city || '';
      let userState = user.state || '';
      let userCountry = user.country || '';
      let placeOfBirth = user.placeOfBirth || userCity || '';

      if (user.placeOfBirth && (!userCity || !userState || !userCountry)) {
        const parts = user.placeOfBirth.split(',').map(p => p.trim());
        if (parts.length === 3) {
          placeOfBirth = parts[0];
          userState = parts[1];
          userCountry = parts[2];
        } else if (parts.length > 0) {
          placeOfBirth = parts[0];
        }
      }

      let dateOfBirth = user.dateOfBirth || '';
      if (dateOfBirth && dateOfBirth.includes('T')) {
        dateOfBirth = dateOfBirth.split('T')[0];
      }

      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        dateOfBirth: dateOfBirth || prev.dateOfBirth,
        timeOfBirth: user.timeOfBirth || prev.timeOfBirth,
        placeOfBirth: placeOfBirth || prev.placeOfBirth,
        email: user.email || prev.email,
        phoneNumber: user.phone || prev.phoneNumber,
        country: userCountry || prev.country,
        state: userState || prev.state
      }));
    }
  }, [user]);



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
      className="relative min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/images/our1.jpeg')" }}
    >
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation />

        {/* Ancient Wisdom, Modern Guidance Section */}
        <section className="relative z-10 px-3 sm:px-4 lg:px-6 pt-8 pb-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Main Ancient Wisdom Card (Left 2 cols) */}
            <div className="lg:col-span-8 rounded-[32px] bg-white border border-slate-200 p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-amber-200/30 -z-10 rounded-[32px]" />
                <img
                  src="/images/home3.webp"
                  alt="Horoscope and Consultations"
                  className="w-full rounded-[28px] border border-slate-200 object-cover shadow-lg"
                  loading="lazy"
                />
              </div>
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.4em] text-amber-600 font-bold">{t('Horoscope & Consultations')}</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">{t('Ancient Wisdom, Modern Guidance')}</h2>
                <p className="text-slate-700 leading-relaxed font-normal text-sm sm:text-base">
                  {t('Our certified Hindu astrologers bring thousands of years of Vedic tradition to your modern life. With deep knowledge of Sanskrit texts and authentic practices, we provide personalized guidance that honors both tradition and your contemporary needs.')}
                </p>
                <div className="space-y-2.5">
                  {[
                    'Certified Vedic astrologers with 15+ years experience',
                    'Authentic Sanskrit-based calculations and interpretations',
                    'Personalized remedies and spiritual guidance'
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-2.5 text-slate-800 text-sm font-medium">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{t(point)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side kundalifree.jpg Card */}
            <div className="lg:col-span-4 rounded-[32px] bg-white border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between overflow-hidden group">
              <div className="relative w-full h-full min-h-[320px] rounded-[24px] overflow-hidden border border-slate-200 shadow-inner flex flex-col justify-end">
                <img
                  src="/images/kundalifree.jpg"
                  alt="Free Kundali Insights"
                  className="w-full h-full object-cover rounded-[24px] group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                <div className="relative z-10 p-5 text-white pointer-events-none">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
                    निःशुल्क जन्म पत्रिका
                  </span>
                  <p className="text-base font-bold leading-snug drop-shadow-sm">
                    Free Detailed Vedic Kundli & Astrological Predictions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 lg:p-6">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

            {/* Left Info & Settings Panel */}
            <div className="lg:col-span-3 flex flex-col justify-between rounded-3xl border border-black/10 bg-white/85 backdrop-blur-lg shadow-xl p-5 sm:p-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-astro-gold/15 border border-astro-gold/40 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-astro-gold" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-black/70 font-semibold">वैदिक ज्योतिष</p>
                    <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-black leading-tight">
                      जन्म कुंडली <span className="text-astro-gold">Generation</span>
                    </h1>
                  </div>
                </div>

                <p className="text-xs text-black/75 mb-3 leading-relaxed">
                  Generate your authentic Vedic birth chart instantly with planetary positions and divisional charts.
                </p>

                {/* Quick stats pills */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="p-2 rounded-xl bg-black/5 border border-black/5">
                    <p className="text-xs font-bold text-black">99.2%</p>
                    <p className="text-[10px] text-black/60 uppercase">Accuracy</p>
                  </div>
                  <div className="p-2 rounded-xl bg-black/5 border border-black/5">
                    <p className="text-xs font-bold text-black">Swiss</p>
                    <p className="text-[10px] text-black/60 uppercase">Ephemeris</p>
                  </div>
                  <div className="p-2 rounded-xl bg-black/5 border border-black/5">
                    <p className="text-xs font-bold text-black">Instant</p>
                    <p className="text-[10px] text-black/60 uppercase">PDF Chart</p>
                  </div>
                </div>

                {/* Generation Mode Selector */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-black mb-1.5 flex items-center">
                    <User className="h-3.5 w-3.5 mr-1.5 text-astro-gold" />
                    कुंडली मोड (Generation Mode)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGenerationMode('accurate')}
                      className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl border-2 transition-all cursor-pointer ${generationMode === 'accurate' ? 'border-astro-gold bg-amber-200 shadow-sm' : 'border-black/10 bg-white hover:border-black/20'}`}
                    >
                      <Sparkles className={`h-4 w-4 mb-0.5 ${generationMode === 'accurate' ? 'text-astro-gold' : 'text-black/40'}`} />
                      <span className="font-bold text-[16px] text-black">Accurate</span>
                      <span className="text-[14px] text-amber-900 uppercase tracking-wider">Full Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerationMode('quick')}
                      className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl border-2 transition-all cursor-pointer ${generationMode === 'quick' ? 'border-astro-gold bg-emerald-200 shadow-sm' : 'border-black/10 bg-white hover:border-black/20'}`}
                    >
                      <Clock className={`h-4 w-4 mb-0.5 ${generationMode === 'quick' ? 'text-astro-gold' : 'text-black/40'}`} />
                      <span className="font-bold text-[16px] text-black">Quick</span>
                      <span className="text-[14px] text-red-900 uppercase tracking-wider">DOB Only</span>
                    </button>
                  </div>
                </div>

                {/* VedAstro Engine Toggle */}
                <div className="p-2.5 rounded-xl border border-black/10 bg-gradient-to-r from-green-50 to-blue-50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-astro-gold flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-black leading-tight">VedAstro Calculations</p>
                      <p className="text-[10px] text-black/60">Swiss Ephemeris precision</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useVedAstro}
                      onChange={(e) => setUseVedAstro(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-black/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              {/* Bottom Security Note */}
              <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center gap-2 text-[16px] text-black">
                <Shield className="h-3.5 w-3.5 text-black flex-shrink-0" />
                <span>वैदिक ज्योतिष अनुसार शुद्ध गणितीय गणना</span>
              </div>
            </div>

            {/* Right Generate Kundali Form Card */}
            <div id="kundali-form" className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-black/10 bg-orange-200 backdrop-blur-lg shadow-xl p-5 sm:p-6">
              <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full space-y-3 text-black">
                {error && (
                  <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-xs sm:text-sm text-center">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between pb-1.5 border-b border-black/10">
                  <h2 className="text-base sm:text-lg font-bold font-cinzel text-black flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-astro-gold" />
                    जन्म विवरण (Birth Details Form)
                  </h2>
                  <span className="text-[14px] font-medium text-black bg-black/5 px-2.5 py-1 rounded-full">
                    {generationMode === 'accurate' ? 'Mode: Accurate (सटीक)' : 'Mode: Quick (त्वरित)'}
                  </span>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Name Field */}
                  <div className={generationMode === 'quick' ? 'md:col-span-1' : ''}>
                    <label className="block text-xs font-semibold text-black mb-1 flex items-center">
                      <User className="h-3.5 w-3.5 mr-1 text-astro-gold" />
                      पूरा नाम (Full Name) {generationMode === 'accurate' && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2 bg-white border border-black/15 rounded-xl text-sm text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold"
                      placeholder="अपना पूरा नाम दर्ज करें"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-semibold text-black mb-1 flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-astro-gold" />
                      जन्म तिथि (Date of Birth) <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2 bg-white border border-black/15 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                    />
                  </div>

                  {generationMode !== 'quick' && (
                    <>
                      {/* Time of Birth */}
                      <div>
                        <label className="block text-xs font-semibold text-black mb-1 flex items-center justify-between">
                          <span className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-astro-gold" />
                            जन्म समय (Birth Time)
                          </span>
                          <span className="text-[10px] text-black/50">Defaults 12:00 PM</span>
                        </label>
                        <input
                          type="time"
                          name="timeOfBirth"
                          value={formData.timeOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2 bg-white border border-black/15 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                        />
                      </div>

                      {/* Place of Birth */}
                      <div>
                        <label className="block text-xs font-semibold text-black mb-1 flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-astro-gold" />
                          जन्म स्थान (City/Place) <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          name="placeOfBirth"
                          value={formData.placeOfBirth}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3.5 py-2 bg-white border border-black/15 rounded-xl text-sm text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold"
                          placeholder="e.g. New Delhi"
                        />
                      </div>

                      {/* State */}
                      <div>
                        <label className="block text-xs font-semibold text-black mb-1 flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-astro-gold" />
                          राज्य (State) <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required={generationMode === 'accurate'}
                          className="w-full px-3.5 py-2 bg-white border border-black/15 rounded-xl text-sm text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold"
                          placeholder="e.g. Delhi"
                        />
                      </div>

                      {/* Country */}
                      <div>
                        <label className="block text-xs font-semibold text-black mb-1 flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-astro-gold" />
                          देश (Country) <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required={generationMode === 'accurate'}
                          className="w-full px-3.5 py-2 bg-white border border-black/15 rounded-xl text-sm text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold"
                          placeholder="e.g. India"
                        />
                      </div>

                      {/* Coordinates */}
                      <div>
                        <label className="block text-xs font-semibold text-black mb-1 flex items-center justify-between">
                          <span className="flex items-center">
                            <Globe className="h-3.5 w-3.5 mr-1 text-astro-gold" /> निर्देशांक (Coordinates)
                          </span>
                          <button
                            type="button"
                            onClick={handleFetchCoordinates}
                            disabled={isFetchingCoords}
                            className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 disabled:opacity-50 cursor-pointer"
                          >
                            {isFetchingCoords ? 'Fetching...' : '⚡ Get Coords'}
                          </button>
                        </label>
                        <input
                          type="text"
                          name="coordinates"
                          value={formData.coordinates}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2 bg-white border border-black/15 rounded-xl text-sm text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold"
                          placeholder="e.g. 28.6139, 77.2090"
                        />
                      </div>

                      {/* Timezone */}
                      <div>
                        <label className="block text-xs font-semibold text-black mb-1 flex items-center justify-between">
                          <span className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-astro-gold" /> टाइमज़ोन (Timezone)
                          </span>
                          <button
                            type="button"
                            onClick={handleFetchTimezone}
                            disabled={isFetchingTimezone}
                            className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 disabled:opacity-50 cursor-pointer"
                          >
                            {isFetchingTimezone ? 'Fetching...' : '⚡ Get Timezone'}
                          </button>
                        </label>
                        <input
                          type="text"
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2 bg-white border border-black/15 rounded-xl text-sm text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-astro-gold"
                          placeholder="e.g. Asia/Kolkata"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-astro-gold via-divine-orange to-astro-gold text-astro-dark font-bold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>{useVedAstro ? 'VedAstro के साथ कुंडली बनाई जा रही है...' : 'कुंडली बनाई जा रही है...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>{useVedAstro ? 'VedAstro के साथ कुंडली बनाएं (Generate with VedAstro)' : 'कुंडली बनाएं (Generate Kundali)'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Side Kundali Image Card */}
            <div className="lg:col-span-3 flex flex-col justify-between rounded-3xl border border-black/10 bg-white/90 backdrop-blur-lg shadow-xl p-3 sm:p-4 overflow-hidden group">
              <div className="relative w-full h-full min-h-[300px] lg:min-h-full rounded-2xl overflow-hidden border border-black/10 shadow-inner flex flex-col justify-between">
                <img
                  src="/images/dkundali.jpg"
                  alt="Vedic Kundali Chart"
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-4 text-white z-10 pointer-events-none">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
                    वैदिक जन्म पत्रिका
                  </span>
                  <p className="text-sm font-bold leading-snug drop-shadow-sm">
                    Authentic Vedic Kundali & Planetary Chart
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kundali;
