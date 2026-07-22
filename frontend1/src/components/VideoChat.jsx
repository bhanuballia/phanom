import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI } from '../services/api';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageCircle,
  Settings,
  Maximize,
  Minimize
} from 'lucide-react';

const VideoChat = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Safety check: if somehow we reach here without a user, bail out
  // This helps prevent crashes during role-switch logouts
  if (!user && !isAuthenticated) {
    console.log('VideoChat: No user/auth, component will soon be unmounted by ProtectedRoute');
    return null;
  }

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // State
  const [appointment, setAppointment] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isChatDisabled, setIsChatDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null); // time in seconds
  const [showTimeLimitModal, setShowTimeLimitModal] = useState(false);
  const [showSilenceWarning, setShowSilenceWarning] = useState(false);

  // WebRTC configuration
  const servers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    // Fetch appointment details
    const fetchAppointment = async () => {
      try {
        const response = await appointmentsAPI.getById(appointmentId);
        const appointmentData = response.data.appointment;

        // Ensure appointment has a roomId
        if (!appointmentData.roomId) {
          console.warn('Appointment missing roomId, generating one...');
          appointmentData.roomId = appointmentId; // Use appointment ID as room ID
        }

        console.log('Appointment loaded:', {
          id: appointmentData._id,
          roomId: appointmentData.roomId,
          status: appointmentData.status
        });

        setAppointment(appointmentData);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        setError('Failed to load appointment details');
        return;
      }
    };

    // Check for existing violations
    const storedViolations = localStorage.getItem(`videoChat_violations_${appointmentId}`);
    if (storedViolations) {
      const violations = parseInt(storedViolations);
      setViolationCount(violations);
      if (violations >= 2) {
        setIsChatDisabled(true);
        setWarningMessage('Chat has been permanently disabled due to repeated policy violations.');
        setShowWarning(true);
      }
    }

    fetchAppointment();
  }, [appointmentId]);

  useEffect(() => {
    if (!appointment) return;

    // Initialize socket connection
    const socketUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';
    socketRef.current = io(socketUrl);

    // Initialize local media
    initializeMedia();

    // Setup socket listeners
    setupSocketListeners();

    // Join room
    socketRef.current.emit('join-room', appointment.roomId, user._id);

    return () => {
      cleanupResources();
    };
  }, [appointment, user._id]);

  // Handle 10-minute timer for first-time bookings
  useEffect(() => {
    if (!appointment?.isFirstTimeBooking || connectionStatus !== 'connected' || timeLeft === 0) return;

    // Start timer at 10 minutes (600 seconds) if it's not already started
    if (timeLeft === null) {
      setTimeLeft(600);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeLimitReached();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [appointment, connectionStatus, timeLeft]);

  const handleTimeLimitReached = () => {
    // End the call
    cleanupResources();
    setConnectionStatus('disconnected');
    setIsConnected(false);

    // Show the "For Detailed Information" message
    setShowTimeLimitModal(true);
  };

  // Load Tesseract.js dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Web Speech API for real-time transcription
  useEffect(() => {
    if (connectionStatus !== 'connected' || !appointment) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript;
          console.log('Spoken text detected:', transcript);
          
          // Validate locally for PII/Contact Info
          const validation = validateMessage(transcript);
          if (!validation.isValid) {
            handleViolation(validation.violationType);
            // Notify other peer via socket
            if (socketRef.current) {
              socketRef.current.emit('chat-message', {
                roomId: appointment.roomId,
                message: {
                  text: `[System: Spoken violation blocked - tried to say ${validation.violationType}]`,
                  sender: 'System',
                  senderId: 'system',
                  timestamp: new Date().toISOString(),
                  isSystem: true
                }
              });
            }
          }

          // Send transcript to server for profanity and abuse validation against moderation files
          if (socketRef.current) {
            socketRef.current.emit('validate-spoken-text', { text: transcript });
          }
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      // Restart recognition if call is still active
      if (connectionStatus === 'connected') {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [connectionStatus, appointment]);

  // OCR Canvas-based Frame Capture Loop
  useEffect(() => {
    if (connectionStatus !== 'connected' || !localVideoRef.current || !appointment) return;

    const interval = setInterval(async () => {
      if (!window.Tesseract || !localVideoRef.current) return;

      try {
        const video = localVideoRef.current;
        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        const canvas = document.createElement('canvas');
        canvas.width = 320; // smaller size for faster OCR performance
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Perform OCR on local frame
        const result = await window.Tesseract.recognize(canvas, 'eng');
        const text = result.data.text;
        
        if (text && text.trim()) {
          console.log('Visual text detected in video feed:', text);
          const validation = validateMessage(text);
          if (!validation.isValid) {
            handleViolation(validation.violationType + ' (shown on screen)');
            if (socketRef.current) {
              socketRef.current.emit('chat-message', {
                roomId: appointment.roomId,
                message: {
                  text: `[System: Visual bypass warning - user showed ${validation.violationType} on screen]`,
                  sender: 'System',
                  senderId: 'system',
                  timestamp: new Date().toISOString(),
                  isSystem: true
                }
              });
            }
          }
        }
      } catch (ocrError) {
        console.error('OCR Error:', ocrError);
      }
    }, 4000); // scan every 4 seconds to prevent lag

    return () => clearInterval(interval);
  }, [connectionStatus, appointment]);

  // Web Audio based Suspicious Silence Detection
  useEffect(() => {
    if (connectionStatus !== 'connected' || !appointment || !localStreamRef.current) return;

    let audioContext = null;
    let analyser = null;
    let source = null;
    let dataArray = null;

    try {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source = audioContext.createMediaStreamSource(localStreamRef.current);
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      }
    } catch (err) {
      console.warn('Web Audio API failed to initialize:', err);
    }

    let silenceSeconds = 0;
    const interval = setInterval(() => {
      // We only flag silence if their video (camera) is active
      if (!isVideoEnabled) {
        silenceSeconds = 0;
        setShowSilenceWarning(false);
        return;
      }

      let isSilent = false;

      if (!isAudioEnabled) {
        // If mic is explicitly muted via UI, they are silent
        isSilent = true;
      } else if (analyser && dataArray) {
        // Measure real-time mic volume level
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const averageVolume = sum / dataArray.length;
        isSilent = averageVolume < 8; // Threshold of 8 for silence (range is 0-255)
      } else {
        // Fallback: if analyzer failed, do not flag silence to avoid false positives
        isSilent = false;
      }

      if (isSilent) {
        silenceSeconds += 1;
        if (silenceSeconds >= 8) {
          setShowSilenceWarning(true);
          
          // Emit suspicious silence warning to backend for logging
          if (socketRef.current) {
            socketRef.current.emit('suspicious-silence', {
              roomId: appointment.roomId,
              userId: user._id
            });
          }
        }
      } else {
        silenceSeconds = 0;
        setShowSilenceWarning(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(e => console.error('Error closing AudioContext:', e));
      }
    };
  }, [connectionStatus, appointment, isVideoEnabled, isAudioEnabled]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize peer connection
      initializePeerConnection();
      setConnectionStatus('ready');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setError('Could not access camera and microphone');
    }
  };

  const initializePeerConnection = () => {
    peerConnectionRef.current = new RTCPeerConnection(servers);

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote stream
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsConnected(true);
        setConnectionStatus('connected');
      }
    };

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          roomId: appointment.roomId,
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    peerConnectionRef.current.onconnectionstatechange = () => {
      const state = peerConnectionRef.current.connectionState;
      setConnectionStatus(state);

      if (state === 'disconnected' || state === 'failed') {
        setIsConnected(false);
      }
    };
  };

  const setupSocketListeners = () => {
    // Handle user connection
    socketRef.current.on('user-connected', async (userId) => {
      console.log('User connected:', userId);
      await createOffer();
    });

    // Handle user disconnection
    socketRef.current.on('user-disconnected', (userId) => {
      console.log('User disconnected:', userId);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    // Handle WebRTC offer
    socketRef.current.on('offer', async (data) => {
      await handleOffer(data.offer);
    });

    // Handle WebRTC answer
    socketRef.current.on('answer', async (data) => {
      await handleAnswer(data.answer);
    });

    // Handle ICE candidates
    socketRef.current.on('ice-candidate', async (data) => {
      await handleIceCandidate(data.candidate);
    });

    // Handle call end
    socketRef.current.on('call-ended', () => {
      navigate('/dashboard');
    });

    // Handle chat messages
    socketRef.current.on('chat-message', (message) => {
      // Validate incoming messages as well
      const validationResult = validateMessage(message.text);

      if (!validationResult.isValid) {
        // If incoming message contains personal info, show a system message instead
        const systemMessage = {
          text: `[System: Message blocked - contained ${validationResult.violationType}]`,
          sender: 'System',
          senderId: 'system',
          timestamp: new Date().toISOString(),
          isSystem: true
        };
        setChatMessages(prev => [...prev, systemMessage]);
      } else {
        setChatMessages(prev => [...prev, message]);
      }
    });

    // Handle chat violations from server
    socketRef.current.on('chat-violation', (data) => {
      console.log('Chat violation detected by server:', data);
      handleViolation(data.violationType);
    });

    // Handle spoken violations from server
    socketRef.current.on('spoken-violation', (data) => {
      console.log('Spoken violation detected by server:', data);
      handleViolation(`${data.violationType} (spoken)`);
      
      // Notify other peer via socket about the spoken violation
      if (socketRef.current) {
        socketRef.current.emit('chat-message', {
          roomId: appointment.roomId,
          message: {
            text: `[System: Spoken violation detected - user spoke ${data.violationType}]`,
            sender: 'System',
            senderId: 'system',
            timestamp: new Date().toISOString(),
            isSystem: true
          }
        });
      }
    });
  };

  const createOffer = async () => {
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socketRef.current.emit('offer', {
        roomId: appointment.roomId,
        offer: offer,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (offer) => {
    try {
      if (!peerConnectionRef.current) {
        console.error('Peer connection not initialized when handling offer');
        initializePeerConnection();
        // Wait a bit for initialization
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (!peerConnectionRef.current) {
        console.error('Failed to initialize peer connection');
        return;
      }

      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socketRef.current.emit('answer', {
        roomId: appointment.roomId,
        answer: answer,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      if (!peerConnectionRef.current) {
        console.error('Peer connection not initialized when handling answer');
        return;
      }
      await peerConnectionRef.current.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate) => {
    try {
      if (!peerConnectionRef.current) {
        console.error('Peer connection not initialized when handling ICE candidate');
        return;
      }
      await peerConnectionRef.current.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    socketRef.current.emit('end-call', appointment.roomId);
    cleanupResources();
    navigate('/dashboard');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const sendMessage = () => {
    if (isChatDisabled) {
      return;
    }

    if (newMessage.trim()) {
      // Validate message for personal information
      const validationResult = validateMessage(newMessage.trim());

      if (!validationResult.isValid) {
        handleViolation(validationResult.violationType);
        return;
      }

      const message = {
        text: newMessage,
        sender: user.name,
        senderId: user._id,
        timestamp: new Date().toISOString(),
      };

      socketRef.current.emit('chat-message', {
        roomId: appointment.roomId,
        message,
      });

      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const cleanupResources = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  // Validation function to check for personal information
  const validateMessage = (message) => {
    const lowerMessage = message.toLowerCase();

    // Phone number patterns (various formats)
    const phonePatterns = [
      /\b\d{10}\b/, // 10 digits
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // US format
      /\b\+?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/, // International
      /\b\d{5}[-.\s]?\d{5}\b/, // Indian format
      /\b(phone|call|number|mobile|contact)[\s:]*\d/i
    ];

    // Email patterns
    const emailPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      /\b(email|mail|gmail|yahoo|hotmail|outlook)[\s:]*[A-Za-z0-9._%+-]*@?[A-Za-z0-9.-]*\b/i
    ];

    // WhatsApp patterns
    const whatsappPatterns = [
      /\b(whatsapp|whats app|wa|watsapp)\b/i,
      /\b(whatsapp|whats app|wa)[\s:]*\+?\d/i
    ];

    // Instagram patterns
    const instagramPatterns = [
      /\b(instagram|insta|ig)\b/i,
      /\b@[A-Za-z0-9._]+\b/,
      /\b(instagram|insta|ig)[\s:]*[A-Za-z0-9._]/i
    ];

    // Facebook patterns
    const facebookPatterns = [
      /\b(facebook|fb|face book)\b/i,
      /\bfacebook\.com\b/i,
      /\b(facebook|fb)[\s:]*[A-Za-z0-9._]/i
    ];

    // Check for phone numbers
    for (const pattern of phonePatterns) {
      if (pattern.test(message)) {
        return { isValid: false, violationType: 'phone number' };
      }
    }

    // Check for emails
    for (const pattern of emailPatterns) {
      if (pattern.test(message)) {
        return { isValid: false, violationType: 'email address' };
      }
    }

    // Check for WhatsApp
    for (const pattern of whatsappPatterns) {
      if (pattern.test(message)) {
        return { isValid: false, violationType: 'WhatsApp contact' };
      }
    }

    // Check for Instagram
    for (const pattern of instagramPatterns) {
      if (pattern.test(message)) {
        return { isValid: false, violationType: 'Instagram ID' };
      }
    }

    // Check for Facebook
    for (const pattern of facebookPatterns) {
      if (pattern.test(message)) {
        return { isValid: false, violationType: 'Facebook profile' };
      }
    }

    return { isValid: true };
  };

  // Handle violation and update counts
  const handleViolation = (violationType) => {
    const newViolationCount = violationCount + 1;
    setViolationCount(newViolationCount);

    // Store violation count in localStorage
    localStorage.setItem(`videoChat_violations_${appointmentId}`, newViolationCount.toString());

    if (newViolationCount === 1) {
      // First violation - show warning
      setWarningMessage(`⚠️ Warning: Sharing ${violationType} is not allowed. This is your first warning. If you share personal contact information again, the chat will be disabled.`);
      setShowWarning(true);
      setNewMessage('');
    } else if (newViolationCount >= 2) {
      // Second violation - disable chat
      setIsChatDisabled(true);
      setWarningMessage(`🚫 Chat has been disabled permanently due to repeated attempts to share personal contact information (${violationType}). Please use only the video call for communication.`);
      setShowWarning(true);
      setNewMessage('');
    }
  };

  // Close warning modal
  const closeWarning = () => {
    setShowWarning(false);
  };

  if (error) {
    console.log('VideoChat: Showing error screen:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!appointment) {
    console.log('VideoChat: Waiting for appointment to load...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading appointment details...</p>
        </div>
      </div>
    );
  }

  console.log('VideoChat: Rendering video interface for appointment:', appointment._id);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">
            Video Consultation with {user?.role === 'astrologer' ? (appointment.client?.name || 'Client') : (appointment.astrologer?.name || 'Astrologer')}
          </h1>
          <p className="text-sm text-gray-400">
            Status: {connectionStatus} {timeLeft !== null && `(Time Remaining: ${formatTime(timeLeft)})`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-gray-800"
          />

          {/* Suspicious Silence Warning Banner */}
          {showSilenceWarning && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600/95 text-white px-6 py-3 rounded-lg shadow-lg border border-red-500 max-w-md text-center z-10 animate-pulse">
              <p className="font-semibold text-sm">
                ⚠️ We notice you are silent. Please speak clearly. Silent gesturing is against policy and may lead to session termination.
              </p>
            </div>
          )}

          {/* Local Video */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>

          {/* Connection Status Overlay */}
          {!isConnected && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Waiting for connection...</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg ${message.isSystem
                    ? 'bg-red-100 border border-red-300 text-red-800 text-center text-xs'
                    : message.senderId === user._id
                      ? 'bg-purple-600 text-white ml-8'
                      : 'bg-gray-700 text-gray-100 mr-8'
                    }`}
                >
                  {!message.isSystem && (
                    <p className="text-xs opacity-70">{message.sender}</p>
                  )}
                  <p className={message.isSystem ? 'font-medium' : ''}>{message.text}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-700">
              {isChatDisabled ? (
                <div className="text-center text-red-400 p-4">
                  <p className="text-sm">Chat is disabled due to policy violations</p>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message... (No personal contact info allowed)"
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isChatDisabled}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isChatDisabled || !newMessage.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center space-x-4">
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
            }`}
        >
          {isVideoEnabled ? (
            <Video className="h-6 w-6 text-white" />
          ) : (
            <VideoOff className="h-6 w-6 text-white" />
          )}
        </button>

        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
            }`}
        >
          {isAudioEnabled ? (
            <Mic className="h-6 w-6 text-white" />
          ) : (
            <MicOff className="h-6 w-6 text-white" />
          )}
        </button>

        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-500"
        >
          <PhoneOff className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">
                {violationCount === 1 ? '⚠️' : '🚫'}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {violationCount === 1 ? 'Policy Violation Warning' : 'Chat Disabled'}
              </h3>
              <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                {warningMessage}
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  <strong>Prohibited Information:</strong> Phone numbers, Email addresses, WhatsApp contacts, Instagram IDs, Facebook profiles
                </p>
              </div>
              <button
                onClick={closeWarning}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Time Limit Modal */}
      {showTimeLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl transform transition-all">
            <div className="mx-auto w-16 h-16 bg-astro-gold/20 rounded-full flex items-center justify-center mb-6">
              <Star className="w-8 h-8 text-astro-gold" />
            </div>
            <h2 className="text-3xl font-cinzel font-bold text-gray-900 mb-4">
              Session Completed
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Your free introductory session has ended. To continue your spiritual journey and get deeper insights, please schedule a regular consultation.
            </p>
            <div className="p-4 bg-gray-50 rounded-2xl mb-8 border border-gray-100">
              <p className="text-astro-purple font-semibold text-xl italic">
                "For Detailed Information Book an Appointment"
              </p>
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => navigate('/booking')}
                className="w-full py-4 px-6 bg-gradient-to-r from-astro-gold to-divine-orange text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Book New Session
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 px-6 text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChat;