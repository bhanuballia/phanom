import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import io from 'socket.io-client';
import api from '../services/api';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Users, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const APP_ID = 'cc1026d971f6445c89c2ec73a3603925'; // Replace with your real Agora App ID
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
// Debug listeners for Agora client
client.on('error', (err) => {
  console.error('Agora client error:', err);
});
client.on('connection-state-change', (curState, prevState, reason) => {
  console.log(`Agora connection state changed from ${prevState} to ${curState} because ${reason}`);
});

const LiveStreamStudio = () => {
  const [profile, setProfile] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [localTracks, setLocalTracks] = useState({ videoTrack: null, audioTrack: null });
  const [hasPermissions, setHasPermissions] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch astrologer profile to get the ID for the channel
    const fetchProfile = async () => {
      try {
        const response = await api.getProfile();
        setProfile(response.astrologer);
        setIsLive(response.astrologer.isLive || false);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();

    // Cleanup on unmount
    return () => {
      if (isLive) {
        stopLiveStream();
      }
    };
  }, []);

  useEffect(() => {
    if (!profile) return;
    
    // Initialize Socket
    const socketUrl = import.meta.env.VITE_API_BASE_URL 
        ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') 
        : 'http://localhost:5000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.emit('join-stream-chat', profile._id);

    newSocket.on('receive-stream-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => newSocket.close();
  }, [profile]);

  const requestPermissions = async () => {
    try {
      const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks({ videoTrack: cameraTrack, audioTrack: microphoneTrack });
      setHasPermissions(true);

      // Play local video preview
      if (videoRef.current) {
        cameraTrack.play(videoRef.current);
      }
    } catch (err) {
      console.error('Error getting permissions:', err);
      alert('Could not access camera/microphone. Please grant permissions.');
    }
  };

  const startLiveStream = async () => {
    if (!profile) return;
    if (!APP_ID || APP_ID === 'your_agora_app_id') {
      alert('Please configure your Agora App ID in LiveStreamStudio.jsx');
      return;
    }

    try {
      if (!hasPermissions) {
        await requestPermissions();
      }

      // 1. Update backend to set isLive = true BEFORE Agora to ensure it works
      console.log('Updating profile to isLive: true...');
      try {
        await api.updateProfile({ isLive: true });
        alert('Backend updated successfully: isLive is now true');
      } catch (backendErr) {
        alert('Backend update failed: ' + backendErr.message);
        throw backendErr;
      }
      setIsLive(true);
      console.log('Profile updated! isLive state is true');

      // 2. Join the channel (channel name = astrologer's ID)
      console.log('Fetching Agora token...');
      const tokenRes = await api.getAgoraToken(String(profile._id), 'publisher', 0);
      const token = tokenRes.token;
      
      console.log('Joining Agora channel...');
      await client.join(APP_ID.trim(), String(profile._id), token, null);
      console.log('Joined Agora channel successfully');

      // Publish local tracks
      if (localTracks.videoTrack && localTracks.audioTrack) {
        await client.publish([localTracks.audioTrack, localTracks.videoTrack]);
      } else {
        const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks({ videoTrack: cameraTrack, audioTrack: microphoneTrack });
        await client.publish([microphoneTrack, cameraTrack]);
        cameraTrack.play(videoRef.current);
      }

    } catch (err) {
      console.error('Failed to start stream', err);
      alert('Failed to start stream (but keeping you LIVE in DB for testing): ' + err.message);

      // TEMPORARILY DISABLED: Rollback the isLive state if Agora fails
      /*
      try {
        await api.updateProfile({ isLive: false });
      } catch (rollbackErr) {
        console.error('Failed to rollback stream state:', rollbackErr);
      }
      setIsLive(false);
      */
    }
  };

  const stopLiveStream = async () => {
    try {
      // Unpublish and close tracks
      if (localTracks.videoTrack) {
        localTracks.videoTrack.close();
      }
      if (localTracks.audioTrack) {
        localTracks.audioTrack.close();
      }
      setLocalTracks({ videoTrack: null, audioTrack: null });
      setHasPermissions(false);

      await client.leave();

      // Update backend to set isLive = false
      if (profile) {
        await api.updateProfile({ isLive: false });
      }
      setIsLive(false);

    } catch (err) {
      console.error('Failed to stop stream', err);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !profile) return;
    socket.emit('send-stream-message', {
      astrologerId: profile._id,
      senderName: profile.name || 'Astrologer',
      text: newMessage
    });
    setNewMessage('');
  };

  const handleVoiceTyping = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Typing. Try Google Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsRecordingVoice(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewMessage((prev) => (prev ? prev + ' ' + transcript : transcript));
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecordingVoice(false);
    };
    
    recognition.onend = () => {
      setIsRecordingVoice(false);
    };
    
    recognition.start();
  };

  const toggleVideo = async () => {
    if (localTracks.videoTrack) {
      await localTracks.videoTrack.setEnabled(!localTracks.videoTrack.enabled);
    }
  };

  const toggleAudio = async () => {
    if (localTracks.audioTrack) {
      await localTracks.audioTrack.setEnabled(!localTracks.audioTrack.enabled);
    }
  };

  if (!profile) return <div className="p-8 text-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-slate-900 border-b border-white/10 p-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-xl font-bold text-white">Live Stream Studio</h1>
          <p className="text-sm text-slate-400">Broadcast your wisdom to your followers</p>
        </div>

        {isLive ? (
          <div className="flex items-center gap-4">
            <div className="bg-red-500/20 text-red-500 font-bold px-3 py-1 rounded-full flex items-center gap-2 border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              YOU ARE LIVE
            </div>
            <button
              onClick={stopLiveStream}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 border border-white/10 transition"
            >
              <PhoneOff className="w-4 h-4 text-red-500" /> End Stream
            </button>
          </div>
        ) : (
          <button
            onClick={startLiveStream}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-2 rounded-lg font-bold shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
          >
            <Video className="w-5 h-5" /> Go Live Now
          </button>
        )}
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 h-[calc(100vh-80px)]">

        {/* Video Preview */}
        <div className="flex-1 bg-black rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl flex items-center justify-center">

          <div ref={videoRef} className="w-full h-full absolute inset-0"></div>

          {!hasPermissions && !isLive && (
            <div className="text-center z-10 p-6 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Video className="w-8 h-8 text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Camera Access Required</h2>
              <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">Please allow camera and microphone permissions to start streaming.</p>
              <button
                onClick={requestPermissions}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-semibold border border-white/10 transition"
              >
                Enable Camera
              </button>
            </div>
          )}

          {/* Stream Controls Overlay */}
          {hasPermissions && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-4 z-10 shadow-xl">
              <button onClick={toggleAudio} className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white border border-white/5 transition">
                <Mic className="w-5 h-5" />
              </button>
              <button onClick={toggleVideo} className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white border border-white/5 transition">
                <Video className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Live Chat Sidebar */}
        <div className="w-full lg:w-96 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 border-b border-white/10 bg-slate-800/50 flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" /> Live Chat
            </h3>
            <span className="text-xs font-semibold text-slate-400 bg-slate-950 px-2 py-1 rounded-md flex items-center gap-1 border border-white/5">
              <Users className="w-3 h-3" /> 0 Viewers
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col">
            {!isLive ? (
              <div className="bg-slate-900/30 h-full flex items-center justify-center text-slate-500 text-sm flex-1">
                <p>Go live to start interacting with your audience!</p>
              </div>
            ) : (
              <>
                <div className="flex-1"></div>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-3 text-sm border border-amber-500/20">
                    <span className="text-amber-500 font-bold">System:</span> Welcome to your live stream. Be respectful to your audience.
                  </div>
                  {messages.map((msg, idx) => (
                    <div key={idx} className="bg-white/5 rounded-xl p-3 text-sm">
                      <span className="text-amber-500 font-bold">{msg.senderName}: </span>
                      <span className="text-white">{msg.text}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </>
            )}
          </div>
          
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={handleVoiceTyping}
                disabled={!isLive || isRecordingVoice}
                className={`p-2 rounded-full border transition-all ${!isLive ? 'bg-white/5 text-slate-600 border-white/5 cursor-not-allowed' : isRecordingVoice ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'bg-white/5 text-amber-500 border-white/10 hover:bg-white/10'}`}
                title="Voice Typing"
              >
                <Mic className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isRecordingVoice ? "Listening..." : "Reply to audience..."}
                disabled={!isLive}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
              />
              <button 
                onClick={handleSendMessage} 
                disabled={!isLive}
                className="bg-amber-500 text-slate-900 p-2 rounded-full hover:bg-amber-400 transition disabled:opacity-50"
              >
                <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveStreamStudio;
