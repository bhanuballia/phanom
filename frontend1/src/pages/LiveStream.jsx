import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import io from 'socket.io-client';
import { authAPI, walletAPI, buildAssetUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Users, MessageSquare, HelpCircle, Zap, X, AlertCircle, Wallet, Clock as ClockIcon } from 'lucide-react';
import { TOPICS_AND_QUESTIONS } from '../utils/chatTopics';
import SessionFeedbackModal from '../components/SessionFeedbackModal';

const APP_ID = '8227aff5e9cd4cf7aae153f81ee178c1'; // Replace with your real Agora App ID
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

const LiveStream = () => {
  const { astrologerId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [astrologer, setAstrologer] = useState(null);
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const [activeChatTopic, setActiveChatTopic] = useState('');
  const [warningInfo, setWarningInfo] = useState(null);
  const [isChatDisabled, setIsChatDisabled] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Per-Minute Wallet Deduction State
  const [walletBalance, setWalletBalance] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [totalDeducted, setTotalDeducted] = useState(0);
  const [insufficientFundsAlert, setInsufficientFundsAlert] = useState(false);
  const deductionIntervalRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const currentBalanceRef = useRef(0);
  const isDeductingRef = useRef(false);

  const messagesEndRef = useRef(null);
  useEffect(() => {
    // Fetch astrologer info
    const fetchAstrologer = async () => {
      try {
        const response = await authAPI.getAstrologers();
        const found = response.data?.astrologers?.find(a => a._id === astrologerId);
        if (found) setAstrologer(found);
      } catch (err) {
        console.error('Failed to fetch astrologer:', err);
      }
    };
    fetchAstrologer();
  }, [astrologerId]);

  useEffect(() => {
    // Initialize Socket
    const socketUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.emit('join-stream-chat', astrologerId);

    newSocket.on('receive-stream-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    newSocket.on('stream-chat-warning', (data) => {
      setWarningInfo(data);
      setTimeout(() => setWarningInfo(null), 8000);
    });

    newSocket.on('stream-chat-disabled', (data) => {
      setIsChatDisabled(true);
      setMessages((prev) => [...prev, {
        senderName: 'System',
        text: 'This chat has been disabled for you due to multiple policy violations.'
      }]);
    });

    return () => newSocket.close();
  }, [astrologerId]);

  useEffect(() => {
    // Setup Agora Event Listeners
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      if (mediaType === 'video') {
        setRemoteUsers(prev => [...prev, user]);
      }
      if (mediaType === 'audio') {
        user.audioTrack.play();
      }
    });

    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      }
    });

    client.on('user-left', (user) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    });

    return () => {
      client.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    // Render remote videos when remoteUsers change
    remoteUsers.forEach(user => {
      if (user.videoTrack) {
        const container = document.getElementById(`video-${user.uid}`);
        if (container) {
          container.innerHTML = '';
          user.videoTrack.play(container);
        }
      }
    });
  }, [remoteUsers]);

  // Fetch user's wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (isAuthenticated) {
        try {
          const res = await walletAPI.getBalance();
          const bal = res.data?.balance || 0;
          setWalletBalance(bal);
          currentBalanceRef.current = bal;
        } catch (err) {
          console.error('Failed to fetch wallet balance:', err);
        }
      }
    };
    fetchBalance();
  }, [isAuthenticated]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (deductionIntervalRef.current) clearInterval(deductionIntervalRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, []);

  const perMinuteRate = Number(astrologer?.pricing) > 0 ? Number(astrologer.pricing) : 9;

  const startBilling = (rate) => {
    // Session seconds timer
    sessionTimerRef.current = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);

    // Deductions start after ONE MINUTE (60 seconds) of connecting to talk
    deductionIntervalRef.current = setInterval(() => {
      deductMinute(rate);
    }, 60000);
  };

  const deductMinute = async (rate) => {
    if (isDeductingRef.current) return;
    isDeductingRef.current = true;

    if (currentBalanceRef.current < rate) {
      setInsufficientFundsAlert(true);
      alert(`Your wallet balance is insufficient (₹${currentBalanceRef.current}). Required: ₹${rate}/min. Ending session.`);
      leaveStream();
      isDeductingRef.current = false;
      return;
    }

    try {
      const res = await walletAPI.deduct({
        amount: rate,
        description: `Live consultation with ${astrologer?.name || 'Astrologer'} (₹${rate}/min)`,
        relatedServiceId: astrologerId
      });

      if (res.data?.success) {
        const newBal = res.data.balance;
        setWalletBalance(newBal);
        currentBalanceRef.current = newBal;
        setTotalDeducted(prev => prev + rate);
      }
    } catch (err) {
      console.error('Error during per-minute deduction:', err);
      if (err.response?.status === 400) {
        setInsufficientFundsAlert(true);
        alert(`Insufficient wallet balance. Ending live call.`);
        leaveStream();
      }
    } finally {
      isDeductingRef.current = false;
    }
  };

  const joinStream = async () => {
    if (!isAuthenticated) {
      alert('Please log in to talk with the astrologer.');
      navigate('/login', { state: { from: `/live/${astrologerId}` } });
      return;
    }

    // Check minimum balance for at least 1 minute
    if (walletBalance < perMinuteRate) {
      alert(`Insufficient Wallet Balance. You need at least ₹${perMinuteRate} for 1 minute to talk with ${astrologer?.name || 'this astrologer'}. Your balance: ₹${walletBalance}.`);
      navigate('/dashboard');
      return;
    }

    try {
      if (!APP_ID || APP_ID === 'your_agora_app_id') {
        alert('Please configure your Agora App ID in LiveStream.jsx');
        return;
      }

      // For Audience, we join the astrologerId channel
      console.log('Fetching Agora token...');
      const tokenRes = await authAPI.getAgoraToken(astrologerId, 'subscriber', 0);
      const token = tokenRes.data.token;
      const fetchedAppId = tokenRes.data.appId;

      console.log('Joining Agora channel...');
      await client.join(fetchedAppId, astrologerId, token, null);
      setJoined(true);

      // Start per-minute billing
      startBilling(perMinuteRate);
    } catch (err) {
      console.error('Failed to join stream', err);
      alert('Failed to join stream: ' + (err.response?.data?.message || err.message));
    }
  };

  const leaveStream = async () => {
    if (deductionIntervalRef.current) clearInterval(deductionIntervalRef.current);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);

    try {
      await client.leave();
      setJoined(false);
      setShowFeedbackModal(true);
    } catch (err) {
      console.error('Failed to leave stream', err);
      setShowFeedbackModal(true);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || isChatDisabled) return;
    socket.emit('send-stream-message', {
      astrologerId,
      senderName: user?.name || 'Audience Member',
      text: newMessage
    });
    setNewMessage('');
  };

  const formatSessionTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!astrologer) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-white/10 p-4 flex flex-wrap items-center justify-between gap-3 z-10 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-500 relative">
            <img
              src={buildAssetUrl(astrologer.profilePicture || astrologer.image || astrologer.photo)}
              alt={astrologer.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "/images/AstroIcon.jpg"; }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              {astrologer.name}
              <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full animate-pulse">Live</span>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                ₹{perMinuteRate}/min
              </span>
            </h1>
            <p className="text-sm text-slate-400">{astrologer.specialization?.join(', ')}</p>
          </div>
        </div>

        {/* Live Call Billing Bar */}
        <div className="flex items-center gap-3">
          {joined ? (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
                <ClockIcon className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{formatSessionTime(sessionSeconds)}</span>
              </div>
              <div className="h-4 w-px bg-white/20"></div>
              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Wallet className="w-4 h-4" />
                <span>Bal: ₹{walletBalance}</span>
              </div>
              <div className="h-4 w-px bg-white/20"></div>
              <div className="text-amber-300 font-medium">
                Charged: ₹{totalDeducted}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-800/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Wallet: ₹{walletBalance}</span>
            </div>
          )}

          <button
            onClick={leaveStream}
            className="bg-red-500 hover:bg-red-600 text-white p-2 sm:px-4 sm:py-2 rounded-xl font-semibold flex items-center gap-2 transition"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden sm:inline">Leave Stream</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-80px)]">

        {/* Video Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {!joined ? (
            <div className="text-center z-10 px-4">
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/20 border border-white/10">
                <Video className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ready to talk with {astrologer.name}?</h2>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span>Call Rate: ₹{perMinuteRate} / min</span>
                <span>•</span>
                <span>Your Wallet: ₹{walletBalance}</span>
              </div>
              <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm">
                Connect and talk with {astrologer.name}. Per-minute live call deductions (₹{perMinuteRate}/min) will start after 1 minute of conversation.
              </p>
              <button
                onClick={joinStream}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-slate-950 font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-amber-500/30 transition transform hover:scale-105 active:scale-95"
              >
                Join & Talk Now (₹{perMinuteRate}/min)
              </button>
            </div>
          ) : remoteUsers.length > 0 ? (
            // Remote Video
            <div
              id={`video-${remoteUsers[0].uid}`}
              className="w-full h-full object-cover"
            />
          ) : (
            // Joined but waiting for video
            <div className="text-center text-slate-400 z-10 animate-pulse">
              <p className="text-xl">Connected to {astrologer.name}...</p>
              <p className="text-sm text-amber-400 mt-2">
                {sessionSeconds < 60
                  ? `Grace period: Billing starts in ${60 - sessionSeconds}s (₹${perMinuteRate}/min)`
                  : `Live rate: ₹${perMinuteRate}/min active`}
              </p>
            </div>
          )}

          {joined && (
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
              <Users className="w-4 h-4" />
              {remoteUsers.length + 1}
            </div>
          )}
        </div>

        {/* Chat / Interaction Area */}
        <div className="w-full lg:w-80 bg-white border-l border-slate-200 flex flex-col h-[30vh] lg:h-full shadow-lg z-10">
          <div className="p-4 border-b border-slate-200 bg-white shadow-sm flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" /> Live Chat
            </h3>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              ₹{perMinuteRate}/min
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col">
            <div className="flex-1"></div>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 text-sm border border-amber-500/20 text-slate-700 shadow-sm">
                <span className="text-amber-500 font-bold">System:</span> Welcome to {astrologer.name}'s live stream. Please be respectful.
              </div>
              {messages.map((msg, idx) => (
                <div key={idx} className="bg-slate-100 rounded-xl p-3 text-sm shadow-sm border border-slate-200/50">
                  <span className="text-amber-600 font-bold">{msg.senderName}: </span>
                  <span className="text-slate-800">{msg.text}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-white relative">

            {warningInfo && (
              <div className="mb-4 bg-amber-950/80 border border-amber-500/50 rounded-2xl p-4 flex items-start gap-3 text-amber-200 animate-pulse">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <h4 className="font-extrabold uppercase text-xs tracking-wider text-amber-400">Warning ({warningInfo.count}/{warningInfo.max})</h4>
                  <p className="text-xs mt-1 text-amber-300/90 leading-relaxed">
                    Your message contained content that violates our community guidelines (detected: {warningInfo.violationType}). Repeating this {warningInfo.max - warningInfo.count} more time(s) will automatically block you from chatting.
                  </p>
                </div>
              </div>
            )}

            {isChatDisabled && (
              <div className="mb-4 bg-red-950/80 border border-red-500/50 rounded-2xl p-4 flex items-start gap-3 text-red-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                <div>
                  <h4 className="font-extrabold uppercase text-xs tracking-wider text-red-400">Chat Blocked</h4>
                  <p className="text-xs mt-1 text-red-300/90 leading-relaxed">
                    You have been blocked from sending messages in this stream due to multiple safety policy violations.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuickQuestions(prev => !prev)}
                disabled={!astrologer?.isLive || isChatDisabled}
                className={`p-2 rounded-full border transition-all ${!astrologer?.isLive || isChatDisabled ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : showQuickQuestions ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-amber-500 border-slate-200 hover:bg-slate-100'}`}
                title={!astrologer?.isLive ? "Astrologer is not live" : isChatDisabled ? "Chat Disabled" : "Quick Questions"}
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                disabled={!astrologer?.isLive || isChatDisabled}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && astrologer?.isLive && !isChatDisabled && handleSendMessage()}
                placeholder={isChatDisabled ? "Chat disabled due to policy violations." : astrologer?.isLive ? "Say something..." : "Wait for astrologer to go live..."}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!astrologer?.isLive || isChatDisabled}
                className={`p-2 rounded-full transition shrink-0 shadow-sm ${!astrologer?.isLive || isChatDisabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
              >
                <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Questions Modal */}
      {showQuickQuestions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">

            <button
              onClick={() => { setShowQuickQuestions(false); setActiveChatTopic(''); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-500">
                <Zap className="w-8 h-8 fill-amber-500 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Select a Question</h3>
              <p className="text-xs text-slate-400">
                Choose a spiritual topic to view common questions
              </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
              {!activeChatTopic ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(TOPICS_AND_QUESTIONS).map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setActiveChatTopic(topic)}
                      className="p-4 text-left rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-slate-200 hover:text-amber-400 border border-white/5 hover:border-amber-500/30 transition-all text-ellipsis overflow-hidden whitespace-nowrap shadow-sm"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 sticky top-0 backdrop-blur-md z-10 shadow-md">
                    <span className="text-sm font-bold text-amber-500 truncate">{activeChatTopic}</span>
                    <button onClick={() => setActiveChatTopic('')} className="text-slate-300 hover:text-white text-xs font-semibold px-3 py-1.5 bg-slate-800 rounded-lg transition-colors">
                      ← Back to Topics
                    </button>
                  </div>
                  <div className="space-y-2 pb-4">
                    {TOPICS_AND_QUESTIONS[activeChatTopic].map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setNewMessage(question); setShowQuickQuestions(false); setActiveChatTopic(''); }}
                        className="w-full text-left p-4 rounded-xl bg-slate-800/50 hover:bg-amber-500/10 text-sm text-slate-300 hover:text-white border border-transparent hover:border-amber-500/20 transition-all shadow-sm"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Session Feedback / Rating Modal */}
      <SessionFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          navigate('/');
        }}
        astrologer={astrologer}
        sessionType="Live Stream"
        onComplete={() => {
          setTimeout(() => {
            setShowFeedbackModal(false);
            navigate('/');
          }, 1500);
        }}
      />
    </div>
  );
};

export default LiveStream;
