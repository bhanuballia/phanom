import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import OurAstrologers from './pages/OurAstrologers';
import ZodiacSigns from './pages/ZodiacSigns';
import ContactUs from './pages/ContactUs';
import Kundali from './pages/Kundali';
import KundaliMatching from './pages/KundaliMatching';
import DailyCalendar from './pages/DailyCalendar';
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
import PaymentPage from './pages/PaymentPage';
import LiveChatHistory from './Admin/LiveChatHistory';
import AuditReport from './Admin/AuditReport';
import KundaliHub from './pages/KundaliHub';




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
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />

            {/* Protected Routes - Require Authentication */}
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <AboutUs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/astrologers"
              element={
                <ProtectedRoute>
                  <OurAstrologers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/zodiac"
              element={
                <ProtectedRoute>
                  <ZodiacSigns />
                </ProtectedRoute>
              }
            />
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
              element={
                <ProtectedRoute>
                  <KundaliHub />
                </ProtectedRoute>
              }
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
            <Route
              path="/contact"
              element={
                <ProtectedRoute>
                  <ContactUs />
                </ProtectedRoute>
              }
            />
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
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
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

          {/* Firefox Compatibility Notice */}
          <FirefoxCompatibilityNotice />

          {/* WebTrit SIP Calling Widget 
          <WebTritWidget /> */}
        </div>
      </Router>
    </AuthProvider>
  );
}

// Wrapper to handle path-based rendering since we need useLocation
const ChatbotWrapper = () => {
  const location = useLocation();
  // Don't show floating chatbot on the dedicated AI Astrologer page
  if (location.pathname === '/ai-astrologer') return null;
  return <AIChatbot />;
};

export default App;