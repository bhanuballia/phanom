import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api, { buildAssetUrl } from '../services/api';
import {
  MessageCircle,
  Send,
  User,
  Clock,
  Search,
  MoreVertical,
  ShieldCheck,
  Star,
  AlertCircle,
  LayoutDashboard,
  Paperclip,
  FileText,
  ImageIcon,
  X,
  File,
  Compass,
  Calendar,
  Layers,
  Users,
  Heart,
  Zap,
  ChevronRight,
  ChevronDown,
  Info,
  CheckCircle,
  Moon,
  FileCode,
  Download,
  Mic,
  MicOff
} from 'lucide-react';

import { generateAstroPDF } from '../services/pdfGenerator';

const AstrologerDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('scheduled');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [editingPricing, setEditingPricing] = useState(false); // New state for pricing editing
  const [newPricing, setNewPricing] = useState(''); // New state for pricing input
  const [imageErrors, setImageErrors] = useState(new Set()); // Track image loading errors
  const [palmistrySubmissions, setPalmistrySubmissions] = useState([]);
  const [palmistryLoading, setPalmistryLoading] = useState(false);
  const [palmistryFilter, setPalmistryFilter] = useState('pending');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'chat'
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [socket, setSocket] = useState(null);
  const [violation, setViolation] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);


  // Live chat audio stream states & refs
  const [isVoiceBroadcasting, setIsVoiceBroadcasting] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const localAudioStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);


  // Prokerala Astro Tools State
  const [activeAstroTool, setActiveAstroTool] = useState(null); // 'kundli', 'chart', 'sadesati', 'dasha', 'matching'
  const [astroFormData, setAstroFormData] = useState({
    datetime: '',
    coordinates: '28.6139,77.2090', // Default New Delhi
    chart_type: 'rasi',
    chart_style: 'north-indian',
    girl_datetime: '',
    girl_coordinates: '28.6139,77.2090',
    boy_datetime: '',
    boy_coordinates: '28.6139,77.2090',
    first_name: '',
    last_name: '',
    gender: 'male',
    rasi: 'mesha'
  });
  const [astroResult, setAstroResult] = useState(null);
  const [astroLoading, setAstroLoading] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Debug: Check if token exists
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);

    if (!token) {
      // Redirect to login if no token
      navigate('/login');
      return;
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  useEffect(() => {
    if (profile) {
      fetchPalmistrySubmissions();
      fetchChatSessions();
    }
  }, [palmistryFilter, profile]);

  // Initialize Socket.io
  useEffect(() => {
    const socketUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : 'https://astrology-run-backend.onrender.com';

    const newSocket = io(socketUrl);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Set up socket listeners and fetch chat history when a session is selected
  useEffect(() => {
    // Stop any ongoing audio broadcast when switching chats
    stopVoiceBroadcast();

    if (!selectedChat || !socket || !profile) return;

    // Join private room
    socket.emit('join-live-chat', selectedChat._id);

    // Fetch history
    fetchChatHistory(selectedChat);

    // Listen for new messages
    const handleReceiveMessage = (message) => {
      if (message.chatId === selectedChat._id) {
        setChatMessages((prev) => [...prev, message]);
        // Auto mark as read if this chat is open
        socket.emit('mark-as-read', selectedChat._id);
      } else {
        // Refresh sessions list to show notification/unread count
        fetchChatSessions();
      }
    };

    const handleSignaling = async (data) => {
      const { eventType, payload } = data;
      if (eventType === 'audio-answer') {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload));
          } catch (e) {
            console.error('Error setting remote description:', e);
          }
        }
      } else if (eventType === 'ice-candidate') {
        if (peerConnectionRef.current && payload) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload));
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
      } else if (eventType === 'request-audio-negotiation') {
        if (localAudioStreamRef.current) {
          await createAudioOffer();
        }
      }
    };

    socket.on('receive-live-message', handleReceiveMessage);
    socket.on('live-chat-signaling', handleSignaling);

    // Listen for violations
    socket.on('live-chat-violation', (data) => {
      setViolation(data.violationType);
      setTimeout(() => setViolation(null), 5000);
    });

    return () => {
      socket.off('receive-live-message', handleReceiveMessage);
      socket.off('live-chat-signaling', handleSignaling);
      socket.off('live-chat-violation');
      stopVoiceBroadcast();
    };
  }, [selectedChat, socket, profile]);


  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const startVoiceBroadcast = async () => {
    if (!selectedChat || !socket) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localAudioStreamRef.current = stream;
      setIsVoiceBroadcasting(true);
      setIsMicMuted(false);

      // Initialize peer connection
      initializeBroadcasterPeerConnection();

      // Notify user
      socket.emit('live-chat-signaling', {
        chatId: selectedChat._id,
        eventType: 'audio-stream-started',
        payload: null
      });

      // Create offer
      await createAudioOffer();
    } catch (e) {
      console.error('Error starting voice broadcast:', e);
      alert('Could not access microphone: ' + e.message);
    }
  };

  const stopVoiceBroadcast = () => {
    if (localAudioStreamRef.current) {
      localAudioStreamRef.current.getTracks().forEach(track => track.stop());
      localAudioStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsVoiceBroadcasting(false);
    setIsMicMuted(false);

    if (selectedChat && socket) {
      socket.emit('live-chat-signaling', {
        chatId: selectedChat._id,
        eventType: 'audio-stream-stopped',
        payload: null
      });
    }
  };

  const toggleMicMute = () => {
    if (localAudioStreamRef.current) {
      const audioTrack = localAudioStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  const initializeBroadcasterPeerConnection = () => {
    const servers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
    peerConnectionRef.current = new RTCPeerConnection(servers);

    // Add audio tracks
    if (localAudioStreamRef.current) {
      localAudioStreamRef.current.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, localAudioStreamRef.current);
      });
    }

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate && selectedChat && socket) {
        socket.emit('live-chat-signaling', {
          chatId: selectedChat._id,
          eventType: 'ice-candidate',
          payload: event.candidate
        });
      }
    };
  };

  const createAudioOffer = async () => {
    if (!peerConnectionRef.current || !selectedChat || !socket) return;
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit('live-chat-signaling', {
        chatId: selectedChat._id,
        eventType: 'audio-offer',
        payload: offer
      });
    } catch (e) {
      console.error('Error creating offer:', e);
    }
  };

  const fetchProfile = async () => {

    try {
      // Debug: Check token before API call
      const token = localStorage.getItem('token');
      console.log('Fetching profile with token:', token ? 'Token present' : 'No token');

      const data = await api.getProfile();
      console.log('Profile data received:', data);

      if (data && data.astrologer) {
        setProfile(data.astrologer);
        setStats(data.statistics);
        // Initialize availability status
        setIsAvailable(data.astrologer.isAvailable !== false); // Default to true if not set
        setError(null);
      } else {
        throw new Error('Invalid profile data received');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile information: ' + error.message);

      // If it's an auth error, redirect to login
      if (error.message.includes('Invalid token') || error.message.includes('Access denied')) {
        api.removeToken();
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await api.getAppointments({ status: filter });
      setAppointments(data.appointments);
      setError(null);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.removeToken();
    localStorage.removeItem('user');
    navigate('/login');
  };

  const updateAppointmentStatus = async (appointmentId, status, message = '') => {
    try {
      const data = await api.updateAppointment(appointmentId, {
        status,
        astrologerNotes: message
      });

      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // New function to update availability status
  const updateAvailability = async (available) => {
    try {
      // Include current pricing in the update if it exists
      const updateData = { isAvailable: available };
      if (profile && profile.pricing) {
        updateData.pricing = profile.pricing;
      }

      const data = await api.updateProfile(updateData);
      setProfile(data.astrologer);
      setIsAvailable(available);
      setError(null);
    } catch (error) {
      console.error('Error updating availability:', error);
      setError('Failed to update availability status');
    }
  };

  const isUpcoming = (appointment) => {
    if (!appointment.appointmentDate || !appointment.appointmentTime) return false;

    // Create date string in YYYY-MM-DD format
    const datePart = appointment.appointmentDate.split('T')[0];
    const appointmentDateTime = new Date(`${datePart}T${appointment.appointmentTime}`);
    const now = new Date();

    const timeDiff = appointmentDateTime.getTime() - now.getTime();

    // Allow joining from 30 minutes before until 2 hours after (in case of delay)
    return timeDiff <= 30 * 60 * 1000 && timeDiff > -120 * 60 * 1000;
  };

  const handleJoinCall = (appointmentId) => {
    // Redirect to the main frontend's video chat route
    // The astrologer portal doesn't have its own VideoChat component
    // So we redirect to the main app's video chat page

    console.log('Joining call for appointment:', appointmentId);

    // In development, astrologer portal might be on different port
    // In production, both are on same domain
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);

    // Check if we're in the astrologer portal
    if (currentUrl.includes('/astrologer')) {
      // Remove /astrologer from the path to get to main frontend
      const baseUrl = window.location.origin;
      const targetUrl = `${baseUrl}/video-chat/${appointmentId}`;
      console.log('Redirecting to:', targetUrl);

      // Force a full page navigation (not React Router navigation)
      window.location.replace(targetUrl);
    } else {
      // Already in main app, just navigate
      const targetUrl = `/video-chat/${appointmentId}`;
      console.log('Navigating to:', targetUrl);
      window.location.href = targetUrl;
    }
  };

  // New function to update pricing
  const updatePricing = async () => {
    if (!newPricing || isNaN(newPricing) || parseInt(newPricing) <= 0) {
      setError('Please enter a valid pricing amount');
      return;
    }

    try {
      const data = await api.updateProfile({
        pricing: parseInt(newPricing),
        isAvailable: isAvailable // Preserve current availability status
      });
      setProfile(data.astrologer);
      setEditingPricing(false);
      setNewPricing('');
      setError(null);
    } catch (error) {
      console.error('Error updating pricing:', error);
      setError('Failed to update pricing');
    }
  };

  // Fetch palmistry submissions
  const fetchPalmistrySubmissions = async () => {
    try {
      setPalmistryLoading(true);
      const data = await api.getPalmistrySubmissions({ status: palmistryFilter });
      setPalmistrySubmissions(data.submissions || []);
    } catch (error) {
      console.error('Error fetching palmistry submissions:', error);
      setError('Failed to load palmistry submissions');
    } finally {
      setPalmistryLoading(false);
    }
  };

  // Update palmistry submission
  const updatePalmistrySubmission = async (submissionId, updateData) => {
    try {
      await api.updatePalmistrySubmission(submissionId, updateData);
      fetchPalmistrySubmissions(); // Refresh list
    } catch (error) {
      console.error('Error updating palmistry submission:', error);
      setError('Failed to update palmistry submission');
    }
  };

  // Live Chat functions
  const fetchChatSessions = async () => {
    try {
      const data = await api.getMySessions();
      setChatSessions(data);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const fetchChatHistory = async (session) => {
    try {
      setChatLoading(true);
      // For astrologer, the other person is the client
      // We need to identify which participant is NOT the astrologer
      const otherUser = session.sender._id === profile._id ? session.receiver : session.sender;
      const response = await api.getChatHistory(otherUser._id);
      setChatMessages(response);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if ((!newChatMessage.trim() && !attachment) || !selectedChat || !socket) return;

    const otherUser = selectedChat.sender._id === profile._id ? selectedChat.receiver : selectedChat.sender;

    const messageData = {
      senderId: profile._id,
      receiverId: otherUser._id,
      chatId: selectedChat._id
    };

    if (newChatMessage.trim()) messageData.text = newChatMessage.trim();
    if (attachment) messageData.attachments = [attachment];

    socket.emit('send-live-message', messageData);

    setNewChatMessage('');
    setAttachment(null);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Max 10MB allowed.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.uploadFile(formData);
      setAttachment({
        fileUrl: response.fileUrl,
        fileName: response.fileName,
        fileType: response.fileType
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerateAstroReport = async (tool) => {
    try {
      setAstroLoading(true);
      setAstroResult(null);
      setError(null);

      let data;
      const { datetime, coordinates, chart_type, girl_datetime, girl_coordinates, boy_datetime, boy_coordinates } = astroFormData;

      // Ensure datetime is in correct format (YYYY-MM-DDTHH:mm:ssZ)
      const formatDT = (dt) => {
        if (!dt) return '';
        const date = new Date(dt);
        return date.toISOString().split('.')[0] + 'Z';
      };

      switch (tool) {
        case 'kundli':
          data = await api.getAdvancedKundli({ datetime: formatDT(datetime), coordinates });
          break;
        case 'chart':
          data = await api.getChart({ datetime: formatDT(datetime), coordinates, chart_type, chart_style: astroFormData.chart_style || 'north-indian' });
          break;
        case 'sadesati':
          data = await api.getAdvancedSadesati({ datetime: formatDT(datetime), coordinates });
          break;
        case 'dasha':
          data = await api.getDashaPeriods({ datetime: formatDT(datetime), coordinates });
          break;
        case 'matching':
          data = await api.getAdvancedMatching({
            girl_datetime: formatDT(girl_datetime),
            girl_coordinates,
            boy_datetime: formatDT(boy_datetime),
            boy_coordinates
          });
          break;
        case 'personal-report':
          data = await api.getPersonalReport({
            datetime: formatDT(datetime),
            coordinates,
            first_name: astroFormData.first_name,
            last_name: astroFormData.last_name,
            gender: astroFormData.gender
          });
          break;
        case 'kaal-sarp':
          data = await api.getKaalSarpDosha({ datetime: formatDT(datetime), coordinates });
          break;
        case 'mangal-dosha':
          data = await api.getMangalDoshaAdvanced({ datetime: formatDT(datetime), coordinates });
          break;
        case 'planet-position':
          data = await api.getPlanetPosition({ datetime: formatDT(datetime), coordinates });
          break;
        case 'daily-prediction':
          data = await api.getDailyPredictionAdvanced({ datetime: formatDT(datetime), coordinates, rasi: astroFormData.rasi });
          break;
        case 'panchang':
          data = await api.getAdvancedPanchang({ datetime: formatDT(datetime), coordinates });
          break;
        default:
          throw new Error('Invalid tool selected');
      }

      setAstroResult(data);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report: ' + (error.message || 'Unknown error'));
    } finally {
      setAstroLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-800 hover:text-red-900 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Astrologer Dashboard</h1>
              {profile ? (
                <p className="mt-1 text-sm text-gray-500">
                  Welcome, <span className="font-semibold text-purple-600">{profile.name}</span>! Manage your appointments and consultations.
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Loading your profile...</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {profile ? (
                <div className="flex items-center space-x-3 bg-purple-50 rounded-full py-1 px-3">
                  {(() => {
                    const rawImage = profile.profilePicture || profile.image || profile.imageUrl || profile.photo;
                    const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;
                    const hasImageError = imageErrors.has('header');
                    const showImage = imageSrc && !hasImageError;

                    return (
                      <div className="h-10 w-10 rounded-full overflow-hidden relative">
                        {showImage ? (
                          <img
                            src={imageSrc}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                            onError={() => setImageErrors(prev => new Set([...prev, 'header']))}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                            {profile.name ? profile.name.charAt(0) : 'A'}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-medium">{profile.name || 'Astrologer'}</span>
                    <span className="text-xs text-gray-500">Astrologer</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 bg-purple-50 rounded-full py-1 px-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse"></div>
                  <div className="flex flex-col">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mt-1 animate-pulse"></div>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                {/* Availability Toggle Button */}
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-600">Availability:</span>
                  <button
                    onClick={() => updateAvailability(!isAvailable)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isAvailable ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                  <span className={`ml-2 text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                    {isAvailable ? 'Available' : 'Not Available'}
                  </span>
                </div>

                <button
                  onClick={fetchProfile}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                  title="Refresh profile"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'dashboard'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-105'
              : 'bg-white text-gray-600 hover:bg-purple-50'
              }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('chat');
              fetchChatSessions();
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all relative ${activeTab === 'chat'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-105'
              : 'bg-white text-gray-600 hover:bg-purple-50'
              }`}
          >
            <MessageCircle className="w-5 h-5" />
            Live Chat
            {chatSessions.reduce((acc, s) => acc + (s.unreadCount || 0), 0) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {chatSessions.reduce((acc, s) => acc + (s.unreadCount || 0), 0)}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const hasActiveChat = !!selectedChat;
              const hasActiveBooking = hasActiveChat || appointments.some(app => {
                if (app.status === 'in_progress') return true;
                if (app.status === 'scheduled') {
                  const appDate = new Date(app.appointmentDate);
                  const isToday = appDate.getDate() === now.getDate() &&
                                  appDate.getMonth() === now.getMonth() &&
                                  appDate.getFullYear() === now.getFullYear();
                  if (isToday) {
                    const timeStr = app.appointmentTime || "";
                    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
                    if (match) {
                      let hour = parseInt(match[1]);
                      const min = parseInt(match[2]);
                      const ampm = match[3];
                      if (ampm) {
                        if (ampm.toUpperCase() === 'PM' && hour < 12) hour += 12;
                        if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
                      }
                      const appTimeToday = new Date(now);
                      appTimeToday.setHours(hour, min, 0, 0);
                      const diffMs = Math.abs(now.getTime() - appTimeToday.getTime());
                      return diffMs <= 30 * 60 * 1000; // 30 minutes tolerance
                    }
                  }
                }
                return false;
              });

              const openAndTrackTools = async (phoneUsed) => {
                const targetUrl = window.location.hostname === 'localhost'
                  ? 'http://localhost:5173'
                  : 'https://astrology-run-frontend.onrender.com';

                try {
                  const response = await api.request('/audit/start', {
                    method: 'POST',
                    body: JSON.stringify({ phoneUsed })
                  });
                  const logId = response.logId;
                  
                  const win = window.open(targetUrl, '_blank');
                  if (win && logId) {
                    const timer = setInterval(() => {
                      if (win.closed) {
                        clearInterval(timer);
                        api.request(`/audit/end/${logId}`, { method: 'POST' })
                          .catch(err => console.error("Failed to log session end:", err));
                      }
                    }, 1000);
                  }
                } catch (err) {
                  console.error("Audit log start failed:", err);
                  window.open(targetUrl, '_blank');
                }
              };

              if (hasActiveBooking) {
                openAndTrackTools(profile?.phone || 'active_booking');
              } else {
                const confirmPhone = window.confirm("No active scheduled booking detected. Are you currently consulting a client over a phone call? If yes, click OK and enter your registered mobile number to authenticate access.");
                if (confirmPhone) {
                  const enteredPhone = prompt("Enter your registered mobile number:");
                  if (!enteredPhone) return;
                  
                  const cleanEntered = enteredPhone.replace(/\D/g, '');
                  const cleanProfilePhone = (profile?.phone || '').replace(/\D/g, '');
                  
                  const cleanEnteredTail = cleanEntered.slice(-10);
                  const cleanProfilePhoneTail = cleanProfilePhone.slice(-10);
                  
                  if (cleanEnteredTail && cleanProfilePhoneTail && cleanEnteredTail === cleanProfilePhoneTail) {
                    openAndTrackTools(cleanEntered);
                  } else {
                    alert("Incorrect mobile number. Access denied.");
                  }
                }
              }
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all bg-white text-gray-600 hover:bg-purple-50"
          >
            <Compass className="w-5 h-5" />
            Astro Tools
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <>
            {/* Welcome Banner */}
            {profile ? (
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex items-center mb-4 md:mb-0">
                    {(() => {
                      const rawImage = profile.profilePicture || profile.image || profile.imageUrl || profile.photo;
                      const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;
                      const hasImageError = imageErrors.has('banner');
                      const showImage = imageSrc && !hasImageError;

                      return (
                        <div className="h-16 w-16 rounded-full overflow-hidden mr-4 relative">
                          {showImage ? (
                            <img
                              src={imageSrc}
                              alt={profile.name}
                              className="w-full h-full object-cover"
                              onError={() => setImageErrors(prev => new Set([...prev, 'banner']))}
                            />
                          ) : (
                            <div className="w-full h-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl">
                              {profile.name ? profile.name.charAt(0) : 'A'}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <div>
                      <h2 className="text-2xl font-bold">Welcome back, {profile.name || 'Astrologer'}!</h2>
                      <p className="text-purple-100 mt-1">
                        {profile.specialization && profile.specialization.length > 0
                          ? `Specializing in ${profile.specialization.join(', ')} • ${profile.experience || 0} years of experience`
                          : `Astrologer with ${profile.experience || 0} years of experience`}
                      </p>
                    </div>
                  </div>
                  <div className="md:ml-auto mt-4 md:mt-0 flex flex-col items-end">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.languages && profile.languages.map((lang, index) => (
                        <span key={index} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                    {/* Availability Status Indicator in Banner */}
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${isAvailable ? 'text-green-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      {isAvailable ? 'Currently Available' : 'Currently Not Available'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-white/20 animate-pulse"></div>
                  <div>
                    <div className="h-6 bg-white/20 rounded w-64 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-white/10 rounded w-80 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Summary Card */}
            {profile ? (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    {(() => {
                      const rawImage = profile.profilePicture || profile.image || profile.imageUrl || profile.photo;
                      const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;
                      const hasImageError = imageErrors.has('profile');
                      const showImage = imageSrc && !hasImageError;

                      return (
                        <div className="h-16 w-16 rounded-full overflow-hidden mr-4 relative">
                          {showImage ? (
                            <img
                              src={imageSrc}
                              alt={profile.name}
                              className="w-full h-full object-cover"
                              onError={() => setImageErrors(prev => new Set([...prev, 'profile']))}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                              {profile.name ? profile.name.charAt(0) : 'A'}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{profile.name || 'Astrologer'}</h2>
                      <p className="text-gray-600">
                        {profile.specialization && profile.specialization.length > 0
                          ? profile.specialization.join(', ')
                          : 'Professional Astrologer'}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-gray-500 text-sm">
                          {profile.experience ? `${profile.experience} years of experience` : 'Experienced Astrologer'}
                        </span>
                        {/* Pricing Display */}
                        <span className="mx-2 text-gray-300">•</span>
                        {editingPricing ? (
                          <div className="flex items-center">
                            <input
                              type="number"
                              min="1"
                              value={newPricing}
                              onChange={(e) => setNewPricing(e.target.value)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              placeholder="₹"
                            />
                            <span className="text-gray-500 text-sm ml-1 mr-2">/session</span>
                            <button
                              onClick={updatePricing}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded mr-1"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingPricing(false);
                                setNewPricing('');
                              }}
                              className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-gray-500 text-sm">
                              ₹{profile.pricing || 100}/session
                            </span>
                            <button
                              onClick={() => {
                                setEditingPricing(true);
                                setNewPricing(profile.pricing || '');
                              }}
                              className="text-xs bg-purple-500 text-white px-2 py-1 rounded ml-2"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                        {/* Availability Status Indicator */}
                        <span className="mx-2 text-gray-300">•</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${isAvailable ? 'text-green-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          {isAvailable ? 'Available' : 'Not Available'}
                        </span>
                      </div>

                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats ? stats.totalAppointments : '0'}
                      </div>
                      <div className="text-sm text-gray-500">Total Clients</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats ? stats.completedAppointments : '0'}
                      </div>
                      <div className="text-sm text-gray-500">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {profile.rating ? profile.rating.toFixed(1) : '0.0'}
                      </div>
                      <div className="text-sm text-gray-500">Rating</div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {(profile.email || profile.phone || profile.placeOfBirth) && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {profile.email && (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          <span className="text-gray-600">{profile.email}</span>
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                          </svg>
                          <span className="text-gray-600">{profile.phone}</span>
                        </div>
                      )}
                      {profile.placeOfBirth && (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <span className="text-gray-600">{profile.placeOfBirth}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio Section */}
                {profile.bio && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
                    <p className="text-gray-600 whitespace-pre-line">{profile.bio}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats ? stats.upcomingAppointments : '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats ? stats.completedAppointments : '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats ? (stats.totalAppointments - stats.completedAppointments) : '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Total Clients</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats ? stats.totalAppointments : '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Appointments</h2>
                  <div className="mt-4 md:mt-0 flex items-center space-x-2">
                    <button
                      onClick={fetchAppointments}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                      title="Refresh appointments"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setFilter('scheduled')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${filter === 'scheduled'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Scheduled
                      </button>
                      <button
                        onClick={() => setFilter('in_progress')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${filter === 'in_progress'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${filter === 'completed'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Completed
                      </button>
                      <button
                        onClick={() => setFilter('cancelled')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${filter === 'cancelled'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Cancelled
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-600">Loading appointments...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointments.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            No appointments found
                          </td>
                        </tr>
                      ) : (
                        appointments.map((appointment) => (
                          <tr key={appointment._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                                    {appointment.client?.name?.charAt(0) || 'U'}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{appointment.client?.name || 'User'}</div>
                                  <div className="text-sm text-gray-500">{appointment.client?.email}</div>
                                  {appointment.selectedQuestion && (
                                    <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-100 text-xs text-purple-700 font-semibold max-w-xs whitespace-normal">
                                      ❓ <span className="font-bold">{appointment.selectedTopic}</span>: {appointment.selectedQuestion}
                                    </div>
                                  )}
                                  {appointment.selectedQuestions && appointment.selectedQuestions.length > 0 && (
                                    <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-100 text-xs text-purple-700 max-w-xs whitespace-normal">
                                      <div className="font-bold mb-1">❓ Selected Questions ({appointment.selectedQuestions.length}):</div>
                                      <ul className="list-disc pl-4 space-y-1">
                                        {appointment.selectedQuestions.map((q, i) => (
                                          <li key={i}>
                                            <span className="font-semibold text-purple-800">[{q.topic}]</span> {q.question}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>


                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(appointment.appointmentDate).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 capitalize">{appointment.consultationType.replace('_', ' ')}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                {appointment.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex flex-col space-y-3">
                                {(appointment.status === 'scheduled' || appointment.status === 'in_progress') && (
                                  <div className="flex flex-col space-y-2">
                                    <button
                                      onClick={() => {
                                        let baseUrl = window.location.origin;
                                        if (window.location.hostname === 'localhost') {
                                          baseUrl = 'http://localhost:3000';
                                        }
                                        const targetUrl = baseUrl + '/video-chat/' + appointment._id + '?role=astrologer';
                                        console.log('Jumping to video call on main frontend:', targetUrl);
                                        window.location.assign(targetUrl);
                                      }}
                                      className={`inline-flex items-center px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 ${isUpcoming(appointment)
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-md'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                    >
                                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                      </svg>
                                      {isUpcoming(appointment) ? 'Join Session' : 'Go to Call Page'}
                                    </button>

                                    <button
                                      onClick={() => {
                                        let baseUrl = window.location.origin;
                                        if (window.location.hostname === 'localhost') {
                                          baseUrl = 'http://localhost:3000';
                                        }
                                        const targetUrl = baseUrl + '/video-chat/' + appointment._id + '?role=astrologer';
                                        navigator.clipboard.writeText(targetUrl);
                                        alert('Session link copied to clipboard!');
                                      }}
                                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center justify-center underline decoration-dotted"
                                    >
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                                      </svg>
                                      Copy Session Link
                                    </button>
                                  </div>
                                )}

                                {appointment.status === 'scheduled' && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => updateAppointmentStatus(appointment._id, 'in_progress')}
                                      className="text-indigo-600 hover:text-indigo-900 px-3 py-1 border border-indigo-600 rounded-md text-xs font-medium"
                                    >
                                      Start
                                    </button>
                                    <button
                                      onClick={() => {
                                        const reason = prompt('Enter reason for cancellation:');
                                        if (reason) {
                                          updateAppointmentStatus(appointment._id, 'cancelled', reason);
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded-md text-xs font-medium"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}

                                {appointment.status === 'in_progress' && (
                                  <button
                                    onClick={() => {
                                      const message = prompt('Leave a message for the client:');
                                      if (message) {
                                        updateAppointmentStatus(appointment._id, 'completed', message);
                                      }
                                    }}
                                    className="text-green-600 hover:text-green-900 px-3 py-1 border border-green-600 rounded-md text-xs font-medium"
                                  >
                                    Complete
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    const message = prompt('Leave a message for the client:');
                                    if (message) {
                                      // Just add a note without changing status
                                      updateAppointmentStatus(appointment._id, appointment.status, message);
                                    }
                                  }}
                                  className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                                >
                                  Message
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Palmistry Submissions Section */}
            {
              profile && profile.specialization && profile.specialization.includes('Palmistry') && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Palmistry Submissions</h2>
                      <div className="mt-4 md:mt-0 flex items-center space-x-2">
                        <button
                          onClick={fetchPalmistrySubmissions}
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                          title="Refresh submissions"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setPalmistryFilter('pending')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${palmistryFilter === 'pending'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => setPalmistryFilter('in-progress')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${palmistryFilter === 'in-progress'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => setPalmistryFilter('completed')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${palmistryFilter === 'completed'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            Completed
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {palmistryLoading ? (
                    <div className="px-6 py-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">Loading palmistry submissions...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      {palmistrySubmissions.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500">
                          No palmistry submissions found
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                          {palmistrySubmissions.map((submission) => (
                            <div
                              key={submission._id}
                              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                            >
                              {/* Submission Header */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">{submission.userName}</h3>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    submission.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                      submission.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {submission.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                                </p>
                              </div>

                              {/* Palm Images */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-2">Right Hand</p>
                                  <img
                                    src={buildAssetUrl(submission.rightHandImage)}
                                    alt="Right hand"
                                    className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                                    onClick={() => window.open(buildAssetUrl(submission.rightHandImage), '_blank')}
                                  />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-2">Left Hand</p>
                                  <img
                                    src={buildAssetUrl(submission.leftHandImage)}
                                    alt="Left hand"
                                    className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                                    onClick={() => window.open(buildAssetUrl(submission.leftHandImage), '_blank')}
                                  />
                                </div>
                              </div>

                              {/* Notes Section */}
                              {submission.astrologerNotes && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-xs font-semibold text-blue-900 mb-1">Your Notes:</p>
                                  <p className="text-sm text-blue-800">{submission.astrologerNotes}</p>
                                </div>
                              )}

                              {/* Response Section */}
                              {submission.response && (
                                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                  <p className="text-xs font-semibold text-green-900 mb-1">Your Response:</p>
                                  <p className="text-sm text-green-800">{submission.response}</p>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-col space-y-2">
                                {submission.status === 'pending' && (
                                  <button
                                    onClick={() => updatePalmistrySubmission(submission._id, { status: 'in-progress' })}
                                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                                  >
                                    Start Analysis
                                  </button>
                                )}

                                {submission.status !== 'completed' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        const notes = prompt('Add notes for this submission:');
                                        if (notes) {
                                          updatePalmistrySubmission(submission._id, { astrologerNotes: notes });
                                        }
                                      }}
                                      className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                                    >
                                      Add Notes
                                    </button>

                                    <button
                                      onClick={() => {
                                        const response = prompt('Provide your palmistry reading:');
                                        if (response) {
                                          updatePalmistrySubmission(submission._id, {
                                            response,
                                            status: 'completed'
                                          });
                                        }
                                      }}
                                      className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                                    >
                                      Complete & Send Response
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            }
          </>
        ) : activeTab === 'chat' ? (
          /* Live Chat Tab */
          <div className="flex bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 h-[700px]">
            {/* Sidebar: Chat Sessions */}
            <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
              <div className="p-6 border-b border-gray-100 bg-white">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 text-amber-500 mr-2" />
                  Your Consultations
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    className="w-full bg-gray-100 border-transparent rounded-xl py-2 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all"
                    value={chatSearchTerm}
                    onChange={(e) => setChatSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {chatSessions.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>No active chats yet</p>
                  </div>
                ) : (
                  chatSessions.filter(s => {
                    const otherUser = s.sender?._id === profile?._id ? (s.receiver || {}) : (s.sender || {});
                    return (otherUser.name || '').toLowerCase().includes(chatSearchTerm.toLowerCase());
                  }).map((session) => {
                    const otherUser = session.sender?._id === profile?._id ? (session.receiver || {}) : (session.sender || {});
                    const isSelected = selectedChat?._id === session._id;

                    return (
                      <button
                        key={session._id}
                        onClick={() => setSelectedChat(session)}
                        className={`w-full text-left p-4 rounded-2xl transition-all duration-300 relative ${isSelected
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                          : 'bg-white hover:bg-purple-50 text-gray-700'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200">
                              {otherUser.profilePicture ? (
                                <img
                                  src={buildAssetUrl(otherUser.profilePicture)}
                                  alt={otherUser.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className={`w-full h-full flex items-center justify-center text-white font-bold ${isSelected ? 'bg-white/20' : 'bg-purple-500'}`}>
                                  {(otherUser.name || 'U').charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className={`font-bold truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>{otherUser.name || 'User'}</h3>
                              <span className={`text-[10px] ${isSelected ? 'text-purple-100' : 'text-gray-400'}`}>
                                {new Date(session.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-purple-100' : 'text-gray-500'}`}>
                              {session.lastMessage}
                            </p>
                          </div>
                        </div>
                        {session.unreadCount > 0 && !isSelected && (
                          <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            {session.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
              {!selectedChat ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-gray-50/30">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                    <MessageCircle className="w-10 h-10 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Client Chat</h2>
                  <p className="text-gray-500 max-w-md">
                    Select a conversation from the sidebar to start responding to your clients in real-time.
                  </p>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10">
                    <div className="flex items-center gap-4">
                      {(() => {
                        const otherUser = selectedChat.sender?._id === profile?._id ? (selectedChat.receiver || {}) : (selectedChat.sender || {});
                        return (
                          <>
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200">
                              {otherUser.profilePicture ? (
                                <img
                                  src={buildAssetUrl(otherUser.profilePicture)}
                                  alt={otherUser.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-purple-500 flex items-center justify-center text-white font-bold">
                                  {(otherUser.name || 'U').charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{otherUser.name || 'User'}</h3>
                              <p className="text-[10px] text-emerald-500 flex items-center font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                                Online
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-3">
                      {isVoiceBroadcasting ? (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-1.5 shadow-sm">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Live</span>
                          
                          <button
                            type="button"
                            onClick={toggleMicMute}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isMicMuted ? 'bg-red-500 text-white' : 'hover:bg-red-100 text-red-600'
                            }`}
                            title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
                          >
                            {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </button>

                          <button
                            type="button"
                            onClick={stopVoiceBroadcast}
                            className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-lg transition-colors ml-1"
                          >
                            Stop
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={startVoiceBroadcast}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-100 transition-all active:scale-95 animate-pulse"
                        >
                          <Mic className="w-4 h-4" />
                          Go Live (Voice)
                        </button>
                      )}
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>


                  {/* Message List */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 custom-scrollbar">
                    {chatLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-gray-400 text-sm">No messages yet. Send a greeting!</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, index) => {
                        const isMine = msg.sender?._id === profile?._id || msg.sender === profile?._id;
                        return (
                          <div
                            key={msg._id || index}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${isMine
                              ? 'bg-purple-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                              }`}>
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mb-3 space-y-2">
                                  {msg.attachments.map((file, i) => (
                                    <div key={i} className="rounded-xl overflow-hidden bg-black/5 border border-black/5">
                                      {file.fileType.startsWith('image/') ? (
                                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                          <img
                                            src={file.fileUrl}
                                            alt={file.fileName}
                                            className="max-w-full h-auto max-h-64 object-contain hover:opacity-90 transition-opacity"
                                          />
                                        </a>
                                      ) : (
                                        <a
                                          href={file.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-3 p-3 text-xs hover:bg-black/5 transition-colors ${isMine ? 'text-white' : 'text-purple-600'}`}
                                        >
                                          <div className={`p-2 rounded-lg ${isMine ? 'bg-white/20' : 'bg-purple-100'}`}>
                                            <FileText className="w-5 h-5" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{file.fileName}</p>
                                            <p className={`${isMine ? 'text-purple-100' : 'text-gray-400'} uppercase text-[8px]`}>PDF Document</p>
                                          </div>
                                          <Send className="w-4 h-4 rotate-45" />
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
                              <div className={`text-[10px] mt-1.5 flex items-center ${isMine ? 'text-purple-100' : 'text-gray-400'}`}>
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Violation Banner */}
                  {violation && (
                    <div className="px-6 py-2 bg-red-50 border-t border-red-100 flex items-center gap-3 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-xs font-medium">
                        Sharing {violation} is against policy and has been blocked.
                      </p>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="p-6 bg-white border-t border-gray-100">
                    {attachment && (
                      <div className="mb-4 flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-2xl">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                          {attachment.fileType.startsWith('image/') ? (
                            <ImageIcon className="w-6 h-6" />
                          ) : (
                            <FileText className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium truncate">{attachment.fileName}</p>
                          <p className="text-[10px] text-gray-500 uppercase">Ready to send</p>
                        </div>
                        <button
                          onClick={() => setAttachment(null)}
                          className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors shadow-sm"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    <form onSubmit={handleSendChatMessage} className="flex gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,.pdf"
                      />
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-4 rounded-2xl flex items-center justify-center transition-all ${uploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                          }`}
                      >
                        {uploading ? (
                          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent animate-spin rounded-full" />
                        ) : (
                          <Paperclip className="w-6 h-6" />
                        )}
                      </button>
                      <input
                        type="text"
                        placeholder="Type your response..."
                        className="flex-1 bg-gray-100 border-transparent rounded-2xl px-6 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={(!newChatMessage.trim() && !attachment) || uploading}
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-4 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 active:scale-95 transition-all"
                      >
                        <Send className="w-6 h-6" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Astro Tools Tab */
          <div className="flex bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 min-h-[700px]">
            {/* Sidebar: Tool Selection */}
            <div className="w-1/4 border-r border-gray-100 flex flex-col bg-gray-50/50">
              <div className="p-6 border-b border-gray-100 bg-white">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Zap className="w-5 h-5 text-amber-500 mr-2" />
                  Divination Tools
                </h2>
                <p className="text-xs text-gray-500 mt-1">Powered by Bhrigu Software</p>
              </div>


            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-white overflow-y-auto custom-scrollbar">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {activeAstroTool === 'kundli' && 'Advanced Kundali Analysis'}
                      {activeAstroTool === 'chart' && 'Birth Chart Generator'}
                      {activeAstroTool === 'sadesati' && 'Detailed Sade Sati Report'}
                      {activeAstroTool === 'dasha' && 'Vimshottari Dasha Periods'}
                      {activeAstroTool === 'matching' && 'Advanced Kundali Matching'}
                      {activeAstroTool === 'personal-report' && 'Personal Reading Report'}
                      {activeAstroTool === 'kaal-sarp' && 'Kaal Sarp Dosha Report'}
                      {activeAstroTool === 'mangal-dosha' && 'Advanced Mangal Dosha Report'}
                      {activeAstroTool === 'planet-position' && 'Planet Position Report'}
                      {activeAstroTool === 'daily-prediction' && 'Daily Advanced Prediction'}
                      {activeAstroTool === 'panchang' && 'Advanced Panchang Report'}
                    </h2>
                    <p className="text-gray-500 mt-1">Enter birth details to generate the professional report.</p>
                  </div>
                  {astroResult && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => generateAstroPDF(activeAstroTool, astroResult, astroFormData)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </button>
                      <button
                        onClick={() => setAstroResult(null)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                      >
                        New Calculation
                      </button>
                    </div>
                  )}
                </div>

                {!astroResult ? (
                  <div className="max-w-2xl bg-gray-50 rounded-3xl p-8 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activeAstroTool === 'matching' ? (
                        <>
                          <div className="col-span-1 md:col-span-2 text-sm font-bold text-purple-600 uppercase tracking-wider border-b border-purple-100 pb-2 mb-2">
                            Bride's Details
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Date & Time of Birth</label>
                            <input
                              type="datetime-local"
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                              value={astroFormData.girl_datetime}
                              onChange={(e) => setAstroFormData({ ...astroFormData, girl_datetime: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Coordinates (Lat, Lon)</label>
                            <input
                              type="text"
                              placeholder="28.6139,77.2090"
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                              value={astroFormData.girl_coordinates}
                              onChange={(e) => setAstroFormData({ ...astroFormData, girl_coordinates: e.target.value })}
                            />
                          </div>
                          <div className="col-span-1 md:col-span-2 text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-blue-100 pb-2 mb-2 mt-4">
                            Groom's Details
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Date & Time of Birth</label>
                            <input
                              type="datetime-local"
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                              value={astroFormData.boy_datetime}
                              onChange={(e) => setAstroFormData({ ...astroFormData, boy_datetime: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Coordinates (Lat, Lon)</label>
                            <input
                              type="text"
                              placeholder="28.6139,77.2090"
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                              value={astroFormData.boy_coordinates}
                              onChange={(e) => setAstroFormData({ ...astroFormData, boy_coordinates: e.target.value })}
                            />
                          </div>
                        </>
                      ) : activeAstroTool === 'personal-report' ? (
                        <>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                            <input
                              type="text"
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                              value={astroFormData.first_name}
                              onChange={(e) => setAstroFormData({ ...astroFormData, first_name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                            <input
                              type="text"
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                              value={astroFormData.last_name}
                              onChange={(e) => setAstroFormData({ ...astroFormData, last_name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                            <select
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                              value={astroFormData.gender}
                              onChange={(e) => setAstroFormData({ ...astroFormData, gender: e.target.value })}
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Date & Time of Birth</label>
                            <input
                              type="datetime-local"
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                              value={astroFormData.datetime}
                              onChange={(e) => setAstroFormData({ ...astroFormData, datetime: e.target.value })}
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Coordinates (Lat, Lon)</label>
                            <input
                              type="text"
                              placeholder="28.6139,77.2090"
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                              value={astroFormData.coordinates}
                              onChange={(e) => setAstroFormData({ ...astroFormData, coordinates: e.target.value })}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Date & Time of Birth</label>
                            <input
                              type="datetime-local"
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                              value={astroFormData.datetime}
                              onChange={(e) => setAstroFormData({ ...astroFormData, datetime: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Coordinates (Lat, Lon)</label>
                            <input
                              type="text"
                              placeholder="28.6139,77.2090"
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                              value={astroFormData.coordinates}
                              onChange={(e) => setAstroFormData({ ...astroFormData, coordinates: e.target.value })}
                            />
                          </div>
                          {activeAstroTool === 'chart' && (
                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Chart Type</label>
                                <select
                                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                                  value={astroFormData.chart_type}
                                  onChange={(e) => setAstroFormData({ ...astroFormData, chart_type: e.target.value })}
                                >
                                  <option value="rasi">Rasi Chart</option>
                                  <option value="navamsa">Navamsa Chart</option>
                                  <option value="bhava">Bhava Chart</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Chart Style</label>
                                <select
                                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                                  value={astroFormData.chart_style || 'north-indian'}
                                  onChange={(e) => setAstroFormData({ ...astroFormData, chart_style: e.target.value })}
                                >
                                  <option value="north-indian">North Indian</option>
                                  <option value="south-indian">South Indian</option>
                                  <option value="east-indian">East Indian</option>
                                </select>
                              </div>
                            </div>
                          )}
                          {activeAstroTool === 'daily-prediction' && (
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-sm font-bold text-gray-700 mb-2">Moon Sign (Rasi)</label>
                              <select
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                                value={astroFormData.rasi}
                                onChange={(e) => setAstroFormData({ ...astroFormData, rasi: e.target.value })}
                              >
                                <option value="mesha">Aries (Mesha)</option>
                                <option value="vrishabha">Taurus (Vrishabha)</option>
                                <option value="mithuna">Gemini (Mithuna)</option>
                                <option value="karka">Cancer (Karka)</option>
                                <option value="simha">Leo (Simha)</option>
                                <option value="kanya">Virgo (Kanya)</option>
                                <option value="tula">Libra (Tula)</option>
                                <option value="vrischika">Scorpio (Vrischika)</option>
                                <option value="dhanu">Sagittarius (Dhanu)</option>
                                <option value="makara">Capricorn (Makara)</option>
                                <option value="kumbha">Aquarius (Kumbha)</option>
                                <option value="meena">Pisces (Meena)</option>
                              </select>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleGenerateAstroReport(activeAstroTool)}
                      disabled={astroLoading}
                      className="w-full mt-8 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
                    >
                      {astroLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                          Consulting the Cosmos...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Generate Report
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Results Display Area */}
                    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                      <div className="bg-purple-600 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Report Generated Successfully
                        </h3>
                        <div className="text-[10px] text-purple-100 uppercase tracking-widest font-bold">
                          Official Astrology Data
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Custom views based on tool type */}
                        {activeAstroTool === 'kundli' && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-[10px] text-purple-600 font-bold uppercase mb-1 uppercase tracking-wider">Ascendant</p>
                                <p className="text-xl font-bold text-gray-900">{astroResult.ascendant?.name || 'N/A'}</p>
                                <p className="text-[10px] text-gray-500 font-medium">Lagna</p>
                              </div>
                              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-[10px] text-purple-600 font-bold uppercase mb-1 uppercase tracking-wider">Nakshatra</p>
                                <p className="text-xl font-bold text-gray-900">{astroResult.nakshatra_details?.nakshatra?.name || 'N/A'}</p>
                                <p className="text-[10px] text-gray-500 font-medium">
                                  Lord: {astroResult.nakshatra_details?.nakshatra?.lord?.name}
                                  {astroResult.nakshatra_details?.nakshatra?.lord?.vedic_name && ` (${astroResult.nakshatra_details?.nakshatra?.lord?.vedic_name})`}
                                  • Pada {astroResult.nakshatra_details?.nakshatra?.pada || 'N/A'}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-[10px] text-purple-600 font-bold uppercase mb-1 uppercase tracking-wider">Moon Sign (Rasi)</p>
                                <p className="text-xl font-bold text-gray-900">{astroResult.nakshatra_details?.chandra_rasi?.name || 'N/A'}</p>
                                <p className="text-[10px] text-gray-500 font-medium">
                                  Lord: {astroResult.nakshatra_details?.chandra_rasi?.lord?.name}
                                  {astroResult.nakshatra_details?.chandra_rasi?.lord?.vedic_name && ` (${astroResult.nakshatra_details?.chandra_rasi?.lord?.vedic_name})`}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-[10px] text-purple-600 font-bold uppercase mb-1 uppercase tracking-wider">Sun Sign</p>
                                <p className="text-xl font-bold text-gray-900">{astroResult.nakshatra_details?.soorya_rasi?.name || 'N/A'}</p>
                                <p className="text-[10px] text-gray-500 font-medium">
                                  Lord: {astroResult.nakshatra_details?.soorya_rasi?.lord?.name}
                                  {astroResult.nakshatra_details?.soorya_rasi?.lord?.vedic_name && ` (${astroResult.nakshatra_details?.soorya_rasi?.lord?.vedic_name})`}
                                </p>
                              </div>
                            </div>

                            <div className="border border-gray-100 rounded-2xl overflow-hidden">
                              <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] font-bold">
                                  <tr>
                                    <th className="px-6 py-3">Planet</th>
                                    <th className="px-6 py-3">Sign</th>
                                    <th className="px-6 py-3">Degree</th>
                                    <th className="px-6 py-3">House</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {astroResult.planets?.map((p, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-6 py-4 font-bold text-gray-900">{p.name}</td>
                                      <td className="px-6 py-4">{p.rasi?.name || p.rasi}</td>
                                      <td className="px-6 py-4">{Math.floor(p.degree)}° {Math.floor((p.degree % 1) * 60)}'</td>
                                      <td className="px-6 py-4 font-medium text-purple-600">{p.house}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {activeAstroTool === 'chart' && (
                          <div className="flex flex-col items-center py-8">
                            {astroResult.svg ? (
                              <div
                                className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-8 shadow-inner"
                                dangerouslySetInnerHTML={{ __html: astroResult.svg }}
                              />
                            ) : (
                              <div className="text-center py-20 bg-gray-50 rounded-3xl w-full">
                                <Compass className="w-20 h-20 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold italic">Chart SVG data received. (Visualization Layer)</p>
                              </div>
                            )}
                            <p className="mt-6 text-sm text-gray-500 max-w-md text-center">
                              This is the {astroFormData.chart_type} chart based on the provided birth details.
                            </p>
                          </div>
                        )}

                        {activeAstroTool === 'dasha' && (
                          <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 mb-4 border-b pb-2">Vimshottari Dasha Hierarchy</h4>
                            <div className="space-y-3">
                              {astroResult.vimshottari_dasha?.map((d, i) => (
                                <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold">
                                      {d.lord.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-900">{d.lord} Mahadasha</p>
                                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                                        Subperiods: {d.antardasha?.length || 0} Bhuktis
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-gray-700">{new Date(d.start).toLocaleDateString()} - {new Date(d.end).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-emerald-500 font-bold uppercase">Active Period</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeAstroTool === 'matching' && (
                          <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-8 items-center justify-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                              <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600">
                                  <Heart className="w-8 h-8 fill-current" />
                                </div>
                                <p className="text-[10px] font-bold uppercase text-purple-600">Bride</p>
                                <p className="font-bold text-gray-900">{astroResult.girl_details?.nakshatram?.name || 'Loading...'}</p>
                              </div>
                              <div className="text-center border-l border-gray-200">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-600">
                                  <Star className="w-8 h-8 fill-current" />
                                </div>
                                <p className="text-[10px] font-bold uppercase text-blue-600">Groom</p>
                                <p className="font-bold text-gray-900">{astroResult.boy_details?.nakshatram?.name || 'Loading...'}</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-900">Ashta Kuta Score</h4>
                                <span className={`text-2xl font-black ${astroResult.total?.points > 18 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {astroResult.total?.points} / 36
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className={`h-full transition-all duration-1000 ${astroResult.total?.points > 18 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                  style={{ width: `${(astroResult.total?.points || 0) / 36 * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeAstroTool === 'personal-report' && (
                          <div className="space-y-6">
                            <div className="bg-purple-50 rounded-3xl p-8 border border-purple-100 text-center">
                              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                                <File className="w-10 h-10" />
                              </div>
                              <h3 className="text-xl font-bold text-purple-900 mb-2">Personal Reading Report Generated</h3>
                              <p className="text-purple-600 mb-6">The comprehensive report for {astroFormData.first_name} is ready.</p>
                              <p className="text-sm text-gray-500">Click the "Download PDF" button at the top right to save the full report.</p>
                            </div>
                          </div>
                        )}

                        {/* Universal Raw Data Toggle */}
                        <div className="mt-12 pt-8 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <button
                              onClick={() => {
                                const el = document.getElementById('raw-data-panel');
                                el.classList.toggle('hidden');
                              }}
                              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-purple-600 transition-colors flex items-center gap-2"
                            >
                              <FileCode className="w-4 h-4" />
                              View Technical Raw Data
                            </button>
                            <button
                              onClick={() => generateAstroPDF('raw-data', astroResult, astroFormData)}
                              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-purple-600 transition-colors flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download Professional Report
                            </button>
                          </div>
                          <div id="raw-data-panel" className="hidden mt-4 bg-gray-900 rounded-2xl p-6 overflow-x-auto">
                            <pre className="text-emerald-400 text-xs font-mono">{JSON.stringify(astroResult, null, 2)}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AstrologerDashboard;