import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import OurAstrologers from './pages/OurAstrologers';
import AstrologerProfile from './pages/AstrologerProfile/AstrologerProfile';
import ZodiacSigns from './pages/ZodiacSigns';
import ContactUs from './pages/ContactUs';
import Kundali from './pages/Kundali';
import KundaliMatching from './pages/KundaliMatching';
import DailyCalendar from './pages/DailyCalendar';
import MonthlyPanchang from './pages/MonthlyPanchang';
import AdminDashboard from './Admin/AdminDashboard';
import AstrologerManagement from './Admin/AstrologerManagement';
import AddAstrologer from './Admin/AddAstrologer';
import EditAstrologer from './Admin/EditAstrologer';
import ViewAstrologer from './Admin/ViewAstrologer';
import AppointmentManagement from './Admin/AppointmentManagement';
import UGCVideoManagement from './Admin/UGCVideoManagement';
import N8nVideoManagement from './Admin/N8nVideoManagement';
import ProductManagement from './Admin/ProductManagement';
import AddProduct from './Admin/AddProduct';
import EditProduct from './Admin/EditProduct';
import CategoryManagement from './Admin/CategoryManagement';
import AIChatbot from './components/AIChatbot';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import BookingAppointment from './pages/BookingAppointment';
import VideoChat from './components/VideoChat';
import FirefoxCompatibilityNotice from './components/FirefoxCompatibilityNotice';
import UGCVideoPage from './pages/UGCVideoPage';
import Shop from './pages/Shop';
import HomePageVideoUpload from './Admin/HomePageVideoUpload';
import LordGaneshaImageUpload from './Admin/LordGaneshaImageUpload';
import KundaliMatchingBackgroundUpload from './Admin/KundaliMatchingBackgroundUpload';
import HomePageBackgroundUpload from './Admin/HomePageBackgroundUpload';
import LalKitab from './pages/LalKitab';
import Numerology from './pages/Numerology';
import Palmistry from './pages/Palmistry';
import VastuShastra from './pages/VastuShastra';
import AIAstrologer from './pages/AIAstrologer';
import LiveChat from './pages/LiveChat';
import LiveStream from './pages/LiveStream';
import LiveAstrologers from './pages/LiveAstrologers';
import PaymentPage from './pages/PaymentPage';
import LiveChatHistory from './Admin/LiveChatHistory';
import AuditReport from './Admin/AuditReport';
import KundaliHub from './pages/KundaliHub';
import TarotReading from './pages/TarotReading';
import D1ChartWindow from './pages/D1ChartWindow';
import D2ChartWindow from './pages/charts/D2ChartWindow';
import D3ChartWindow from './pages/charts/D3ChartWindow';
import D4ChartWindow from './pages/charts/D4ChartWindow';
import D7ChartWindow from './pages/charts/D7ChartWindow';
import D9ChartWindow from './pages/charts/D9ChartWindow';
import D10ChartWindow from './pages/charts/D10ChartWindow';
import D12ChartWindow from './pages/charts/D12ChartWindow';
import D16ChartWindow from './pages/charts/D16ChartWindow';
import D20ChartWindow from './pages/charts/D20ChartWindow';
import D24ChartWindow from './pages/charts/D24ChartWindow';
import D27ChartWindow from './pages/charts/D27ChartWindow';
import D30ChartWindow from './pages/charts/D30ChartWindow';
import D40ChartWindow from './pages/charts/D40ChartWindow';
import D45ChartWindow from './pages/charts/D45ChartWindow';
import D60ChartWindow from './pages/charts/D60ChartWindow';
import VimshottariDashaWindow from './pages/VimshottariDashaWindow';




import { BrowserDetector, FeatureDetector, FirefoxCompatibility } from './utils/browserCompatibility';
import WebTritWidget from './components/WebTritWidget';
import './App.css';

function App() {
  // Initialize browser compatibility features
  useEffect(() => {
    const browserInfo = BrowserDetector.getBrowserInfo();
    console.log('Browser detected:', browserInfo);

    // Check and log feature support
    const features = {
      backdropFilter: FeatureDetector.supportsBackdropFilter(),
      speechRecognition: FeatureDetector.supportsSpeechRecognition(),
      speechSynthesis: FeatureDetector.supportsSpeechSynthesis(),
      userMedia: FeatureDetector.supportsUserMedia(),
      secureContext: FeatureDetector.isSecureContext()
    };

    console.log('Feature support:', features);

    // Apply Firefox-specific fixes if needed
    if (BrowserDetector.isFirefox()) {
      console.log('Applying Firefox compatibility features...');
      FirefoxCompatibility.initializeFirefoxFeatures();

      // Show Firefox-specific notice if some features are limited
      if (!features.secureContext) {
        console.warn('Firefox: Secure context required for full functionality. Please use HTTPS.');
      }
    }

    // Store browser info globally for components to access
    window.browserCompatibility = {
      browser: browserInfo,
      features,
      isFirefox: BrowserDetector.isFirefox()
    };
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/live-astrologers" element={<LiveAstrologers />} />

            {/* Protected Routes - Require Authentication */}
            <Route path="/about" element={<AboutUs />} />
            <Route path="/astrologers" element={<OurAstrologers />} />
            <Route path="/astrologers/:id" element={<AstrologerProfile />} />
            <Route path="/zodiac" element={<ZodiacSigns />} />
            <Route
              path="/kundali"
              element={
                <ProtectedRoute>
                  <Kundali />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kundali-hub"
              element={<KundaliHub />}
            />
            <Route
              path="/chart/d1"
              element={<D1ChartWindow />}
            />
            <Route
              path="/chart/d2"
              element={<D2ChartWindow />}
            />
            <Route
              path="/chart/d3"
              element={<D3ChartWindow />}
            />
            <Route
              path="/chart/d4"
              element={<D4ChartWindow />}
            />
            <Route
              path="/chart/d7"
              element={<D7ChartWindow />}
            />
            <Route
              path="/chart/d9"
              element={<D9ChartWindow />}
            />
            <Route
              path="/chart/d10"
              element={<D10ChartWindow />}
            />
            <Route
              path="/chart/d12"
              element={<D12ChartWindow />}
            />
            <Route
              path="/chart/d16"
              element={<D16ChartWindow />}
            />
            <Route
              path="/chart/d20"
              element={<D20ChartWindow />}
            />
            <Route
              path="/chart/d24"
              element={<D24ChartWindow />}
            />
            <Route
              path="/chart/d27"
              element={<D27ChartWindow />}
            />
            <Route
              path="/chart/d30"
              element={<D30ChartWindow />}
            />
            <Route
              path="/chart/d40"
              element={<D40ChartWindow />}
            />
            <Route
              path="/chart/d45"
              element={<D45ChartWindow />}
            />
            <Route
              path="/chart/d60"
              element={<D60ChartWindow />}
            />
            <Route
              path="/chart/vimshottari"
              element={<VimshottariDashaWindow />}
            />

            <Route
              path="/kundali-matching"
              element={
                <ProtectedRoute>
                  <KundaliMatching />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily-calendar"
              element={
                <ProtectedRoute>
                  <DailyCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/monthly-panchang"
              element={<MonthlyPanchang />}
            />
            <Route
              path="/lal-kitab"
              element={
                <ProtectedRoute>
                  <LalKitab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/numerology"
              element={
                <ProtectedRoute>
                  <Numerology />
                </ProtectedRoute>
              }
            />
            <Route path="/contact" element={<ContactUs />} />
            <Route
              path="/booking"
              element={
                <ProtectedRoute>
                  <BookingAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/palmistry"
              element={
                <ProtectedRoute>
                  <Palmistry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vastu-shastra"
              element={
                <ProtectedRoute>
                  <VastuShastra />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live-chat"
              element={
                <ProtectedRoute>
                  <LiveChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live/:astrologerId"
              element={
                <ProtectedRoute>
                  <LiveStream />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tarot-reading"
              element={
                <ProtectedRoute>
                  <TarotReading />
                </ProtectedRoute>
              }
            />



            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/homepage-video"
              element={
                <ProtectedRoute adminOnly>
                  <HomePageVideoUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/homepage-background"
              element={
                <ProtectedRoute adminOnly>
                  <HomePageBackgroundUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lord-ganesha-image"
              element={
                <ProtectedRoute adminOnly>
                  <LordGaneshaImageUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/kundali-matching-background"
              element={
                <ProtectedRoute adminOnly>
                  <KundaliMatchingBackgroundUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/astrologers"
              element={
                <ProtectedRoute adminOnly>
                  <AstrologerManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/astrologers/new"
              element={
                <ProtectedRoute adminOnly>
                  <AddAstrologer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/astrologers/:id"
              element={
                <ProtectedRoute adminOnly>
                  <ViewAstrologer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/astrologers/:id/edit"
              element={
                <ProtectedRoute adminOnly>
                  <EditAstrologer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <ProtectedRoute adminOnly>
                  <AppointmentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ugc-videos"
              element={
                <ProtectedRoute adminOnly>
                  <UGCVideoManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/n8n-videos"
              element={
                <ProtectedRoute adminOnly>
                  <N8nVideoManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute adminOnly>
                  <ProductManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <ProtectedRoute adminOnly>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/:id/edit"
              element={
                <ProtectedRoute adminOnly>
                  <EditProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute adminOnly>
                  <CategoryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/live-chat-history"
              element={
                <ProtectedRoute adminOnly>
                  <LiveChatHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute adminOnly>
                  <AuditReport />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-appointment"
              element={
                <ProtectedRoute>
                  <BookingAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video-chat/:appointmentId"
              element={
                <ProtectedRoute>
                  {(() => {
                    console.log('VideoChat route matched!');
                    console.log('Token:', localStorage.getItem('token'));
                    console.log('User:', localStorage.getItem('user'));
                    return <VideoChat />;
                  })()}
                </ProtectedRoute>
              }
            />

            {/* UGC Video Page - Public */}
            <Route path="/community-videos" element={<UGCVideoPage />} />
            <Route path="/ai-astrologer" element={<AIAstrologer />} />

            {/* Test route for debugging */}
            <Route
              path="/test-route"
              element={
                <div style={{ padding: '20px' }}>
                  <h1>Test Route Works!</h1>
                  <p>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
                  <p>User: {localStorage.getItem('user') || 'Not found'}</p>
                </div>
              }
            />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* AI Chatbot - Available on all pages except dedicated AI Astrologer page */}
          <ChatbotWrapper />
          
          {/* Live Astrologers Floating Button */}
          <LiveFloatingButton />

          {/* Firefox Compatibility Notice */}
          <FirefoxCompatibilityNotice />

          {/* WebTrit SIP Calling Widget 
          <WebTritWidget /> */}
        </div>
      </Router>
    </LanguageProvider>
  </AuthProvider>
  );
}

const ChatbotWrapper = () => {
  const location = useLocation();
  // Don't show floating chatbot on the dedicated AI Astrologer page or dedicated popup chart windows
  if (location.pathname === '/ai-astrologer' || location.pathname.startsWith('/chart/')) return null;
  return <AIChatbot />;
};

function LiveFloatingButton() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Don't show redundant floating button on popup chart windows
  if (location.pathname.startsWith('/chart/')) return null;

  const handleClick = () => {
    navigate('/live-astrologers');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-white border border-red-500/50 shadow-lg shadow-red-500/20 px-5 py-3 rounded-full font-bold transition-all hover:scale-105"
    >
      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
      LIVE
    </button>
  );
};

export default App;