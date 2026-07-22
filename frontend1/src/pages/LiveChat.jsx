import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { liveChatAPI, buildAssetUrl } from '../services/api';
import {
    Send,
    User,
    MessageCircle,
    Search,
    MoreVertical,
    Clock,
    Star,
    ShieldCheck,
    AlertCircle,
    Paperclip,
    FileText,
    Image as ImageIcon,
    X,
    File,
    LayoutDashboard,
    Compass,
    Moon,
    Sun,
    Zap,
    HelpCircle,
    Volume2,
    VolumeX
} from 'lucide-react';


const TOPICS_AND_QUESTIONS = {
    "Love & Romance - Love Life": [
        "Will I fall in love?",
        "When will I find true love?",
        "Is love marriage indicated in my horoscope?",
        "Will I have a successful love relationship?",
        "How many serious relationships are indicated?",
        "What kind of partner will I attract?",
        "Why am I unlucky in love?",
        "Why do my relationships fail?",
        "Is true love destined for me?",
        "Is my soulmate already in my life?"
    ],
    "Love & Romance - Current Relationship": [
        "Does my partner truly love me?",
        "Is this relationship genuine?",
        "Is my relationship stable?",
        "Will our relationship become stronger?",
        "Is my partner loyal?",
        "Is there a future in this relationship?",
        "Will we stay together?",
        "Are we emotionally compatible?",
        "Are we spiritually connected?",
        "What is the karmic purpose of this relationship?"
    ],
    "Love & Romance - Marriage from Love": [
        "Will my love relationship turn into marriage?",
        "Will my family accept our relationship?",
        "Will my partner's family accept me?",
        "Is there any obstacle to our marriage?",
        "Will we have a happy married life?",
        "What is the best time to marry my partner?",
        "Will our love survive family opposition?",
        "Is inter-caste marriage indicated?",
        "Is inter-religion marriage indicated?",
        "Will we marry against our parents' wishes?"
    ],
    "Love & Romance - Love Timing": [
        "When will I meet my soulmate?",
        "When will my love life improve?",
        "Which Dasha favors love?",
        "Which transit activates romance?",
        "When will I enter a relationship?",
        "What is the best year for love?",
        "What is the best age for marriage?",
        "When will I receive a marriage proposal?",
        "Is this year favorable for love?"
    ],
    "Love & Romance - Compatibility": [
        "Are we compatible?",
        "Is our relationship karmic?",
        "Is this person my soulmate?",
        "Are we destined to be together?",
        "Are we emotionally compatible?",
        "Are we mentally compatible?",
        "Are we physically compatible?",
        "Are we spiritually compatible?",
        "Is our relationship long-lasting?",
        "Will we remain together forever?"
    ],
    "Love & Romance - Breakup & Separation": [
        "Will my breakup heal?",
        "Can my ex return?",
        "Will we reconcile?",
        "Should I move on?",
        "Why did this relationship end?",
        "Is separation permanent?",
        "Will we reunite?",
        "Is another relationship coming soon?",
        "What lessons should I learn from this breakup?"
    ],
    "Love & Romance - Ex-Partner": [
        "Will my ex contact me again?",
        "Does my ex still think about me?",
        "Does my ex still love me?",
        "Will my ex marry someone else?",
        "Should I wait for my ex?",
        "Is reconciliation possible?",
        "Will we meet again?",
        "Is there unfinished karma with my ex?"
    ],
    "Love & Romance - Long-Distance Relationships": [
        "Will our long-distance relationship succeed?",
        "Can distance separate us?",
        "Will we eventually live together?",
        "Is relocation indicated after marriage?",
        "Will my partner move abroad?",
        "Will we settle in another country?"
    ],
    "Love & Romance - Hidden Relationships": [
        "Is there a secret relationship in my horoscope?",
        "Is my partner hiding something?",
        "Is there another person involved?",
        "Can I trust my partner?",
        "Is there deception in my relationship?",
        "Will I discover the truth?",
        "Is infidelity indicated?",
        "Is emotional cheating possible?"
    ],
    "Love & Romance - Love Triangle": [
        "Am I in a love triangle?",
        "Will my partner choose me?",
        "Is there another person influencing my relationship?",
        "Who is better for me?",
        "Should I continue this relationship?",
        "Which relationship has better long-term potential?"
    ],
    "Love & Romance - Romantic Personality": [
        "How do I express love?",
        "What attracts people to me?",
        "Why do people fall in love with me?",
        "What type of partner suits me?",
        "What is my love language?",
        "What emotional needs do I have?",
        "What are my relationship strengths?",
        "What are my relationship weaknesses?"
    ],
    "Love & Romance - Physical & Intimacy": [
        "Is physical compatibility good?",
        "Will we have a passionate relationship?",
        "Is our intimacy balanced?",
        "Will our attraction remain strong?",
        "Is Venus strong in my chart?",
        "Is Mars causing relationship conflicts?"
    ],
    "Love & Romance - Karmic Relationships": [
        "Is this relationship from a past life?",
        "Do we share karmic debts?",
        "Why are we repeatedly meeting?",
        "Are we twin souls?",
        "Are we soulmates?",
        "What karmic lesson are we learning together?",
        "Is this relationship spiritually significant?"
    ],
    "Love & Romance - Love Obstacles": [
        "What is delaying my love life?",
        "Is Manglik Dosha affecting my relationship?",
        "Is Saturn delaying love?",
        "Is Rahu causing confusion?",
        "Is Ketu causing detachment?",
        "Which planet is creating relationship problems?",
        "Which remedy will improve my love life?"
    ],
    "Love & Romance - Future Love": [
        "Will I find love after divorce?",
        "Will I marry again?",
        "Will I fall in love twice?",
        "Will my second marriage be happier?",
        "Is a new relationship approaching?",
        "Will I find true happiness in love?"
    ],
    "Love & Romance - AI Deep Analysis": [
        "What does my horoscope reveal about my love life?",
        "What is the biggest challenge in my relationships?",
        "What kind of soulmate is destined for me?",
        "How can I improve my relationships?",
        "What lessons should I learn before marriage?",
        "Which years are most favorable for romance?",
        "Which Dasha will transform my love life?",
        "What remedies can strengthen my relationship?",
        "What is the probability that my current relationship will lead to marriage?",
        "What does my Navamsha reveal about my future spouse?"
    ],
    "Marriage & Relationship": [
        "When will I get married?",
        "At what age will I get married?",
        "Is marriage promised in my horoscope?",
        "Will my marriage be early or delayed?",
        "What is causing the delay in my marriage?",
        "Will I have a love marriage or an arranged marriage?",
        "Will I marry someone from a different caste or religion?",
        "Will I marry someone from another country?",
        "How many marriages are indicated?",
        "Is there a possibility of remarriage?",
        "What will my spouse look like?",
        "What will be my spouse's nature?",
        "Will my spouse be caring?",
        "Will my spouse be wealthy?",
        "Will my spouse be spiritual?",
        "Will my spouse support my career?",
        "What profession will my spouse have?",
        "Will my spouse be older or younger than me?",
        "Where is my spouse likely to come from?",
        "Will my marriage be happy?",
        "Will there be misunderstandings?",
        "Will we live together happily?",
        "Will we settle abroad after marriage?",
        "Will my married life improve financially?",
        "Will my in-laws support me?",
        "Is divorce indicated?",
        "Is separation possible?",
        "How long will my marriage last?",
        "Which Dasha is favorable for marriage?",
        "Are we compatible?",
        "What is our compatibility score?",
        "Is Manglik matching favorable?",
        "How strong is our emotional compatibility?",
        "Are we spiritually compatible?",
        "Is our physical compatibility good?",
        "Will we have children?",
        "What remedies can improve our relationship?"
    ],
    "Career & Job": [
        "Which career suits me best?",
        "What profession is indicated?",
        "Should I work in government or private sector?",
        "Am I suitable for business?",
        "Should I become self-employed?",
        "Which industry is best for me?",
        "Can I become an entrepreneur?",
        "Should I pursue freelancing?",
        "When will I get a job?",
        "Will I change my job?",
        "Is promotion indicated?",
        "Will I get my desired job?",
        "Will I receive salary growth?",
        "Should I resign?",
        "Will I get a government job?",
        "Will I work abroad?",
        "Is foreign settlement possible?",
        "When will my career improve?",
        "Which Dasha favors career?",
        "Which transit supports promotion?",
        "Why am I facing career obstacles?",
        "What is my highest career potential?",
        "Will I become famous?",
        "Can I become a CEO?",
        "Will I be successful in IT?",
        "Is public service suitable for me?"
    ],
    "Business": [
        "Should I start a business?",
        "Which business is suitable?",
        "Is partnership good?",
        "Who should be my business partner?",
        "When should I start my business?",
        "Will my business expand?",
        "Is this year good for investment?",
        "Will I receive funding?",
        "Is export business favorable?",
        "Will I own multiple businesses?"
    ],
    "Wealth & Finance": [
        "Will I become wealthy?",
        "When will I earn good money?",
        "Which Dasha gives wealth?",
        "Will I inherit property?",
        "Can I invest in the stock market?",
        "Is real estate favorable?",
        "Should I invest in gold?",
        "Will I receive sudden wealth?",
        "Is lottery luck indicated?",
        "Will I become financially independent?"
    ],
    "Health": [
        "How is my overall health?",
        "Which diseases should I be careful about?",
        "Is surgery indicated?",
        "Will I recover soon?",
        "Is chronic illness shown?",
        "What is my immunity like?",
        "Which Dasha affects health?",
        "Are accidents indicated?",
        "How can I improve my health?",
        "Which remedies help my health?"
    ],
    "Children": [
        "Will I have children?",
        "When will I have my first child?",
        "Will I have a son or daughter?",
        "Are childbirth delays indicated?",
        "Will fertility treatment be needed?",
        "Will my children be successful?",
        "How many children are indicated?",
        "What is my relationship with my children?"
    ],
    "Education": [
        "Which course is suitable?",
        "Should I study abroad?",
        "Will I complete higher education?",
        "Can I clear competitive exams?",
        "Will I get admission to my preferred college?",
        "Which field matches my horoscope?",
        "Will I receive scholarships?"
    ],
    "Foreign Travel & Settlement": [
        "Will I travel abroad?",
        "Will I settle overseas?",
        "Which country suits me?",
        "When will I receive a visa?",
        "Is immigration indicated?",
        "Will foreign business succeed?",
        "Will I return to my homeland?"
    ],
    "Property & Real Estate": [
        "When will I buy a house?",
        "Should I buy land?",
        "Is this property beneficial?",
        "Will I inherit family property?",
        "Is property litigation indicated?",
        "Which direction is lucky for my home?",
        "Should I renovate my house?"
    ],
    "Litigation & Enemies": [
        "Will I win my court case?",
        "Is litigation favorable?",
        "Do I have hidden enemies?",
        "Who is causing obstacles?",
        "Will legal issues end soon?",
        "Is police involvement indicated?",
        "How can I overcome my enemies?"
    ],
    "Spirituality": [
        "What is my spiritual path?",
        "Am I inclined toward meditation?",
        "Which deity should I worship?",
        "Which mantra is suitable?",
        "What is my karmic purpose?",
        "Is Moksha indicated?",
        "Which pilgrimage is favorable?"
    ],
    "Parents & Family": [
        "How is my relationship with my father?",
        "How is my relationship with my mother?",
        "Will family disputes end?",
        "Will I inherit ancestral wealth?",
        "Is family harmony indicated?",
        "Should I live separately?"
    ],
    "Daily Life": [
        "Is today favorable?",
        "What should I avoid today?",
        "Which color is lucky today?",
        "Which direction is lucky today?",
        "Which Hora is favorable?",
        "Which Choghadiya is best?",
        "Which Muhurta is suitable today?"
    ],
    "Muhurta": [
        "Which day is best for marriage?",
        "When should I start my business?",
        "Which Muhurta is best for housewarming?",
        "Which date is auspicious for surgery?",
        "When should I buy a vehicle?",
        "Which date is best for signing contracts?"
    ],
    "Dasha & Transit": [
        "Which Mahadasha am I running?",
        "What will this Mahadasha bring?",
        "How will Saturn transit affect me?",
        "Is Sade Sati active?",
        "How will Jupiter transit help me?",
        "Which transit activates marriage?",
        "Which transit activates career?"
    ],
    "Remedies": [
        "Which gemstone should I wear?",
        "Which Rudraksha is suitable?",
        "Which mantra should I chant?",
        "Which fast (Vrat) is beneficial?",
        "Which donation will help me?",
        "Which Yantra should I keep?",
        "Which deity should I worship?"
    ],
    "Horary (Prashna)": [
        "Will my lost item be found?",
        "Will this relationship succeed?",
        "Will I get the job I interviewed for?",
        "Should I invest now?",
        "Will my visa be approved?",
        "Will I receive the payment?",
        "Is this business deal favorable?",
        "Will this court case end in my favor?"
    ],
    "AI Personalized Questions": [
        "What is the most important event coming in my life?",
        "Which area of my life needs attention?",
        "What are my biggest strengths?",
        "What are my biggest weaknesses?",
        "What opportunities are approaching?",
        "What challenges should I prepare for?",
        "What is my life purpose?",
        "Which year will be most successful?",
        "Which remedies will give the fastest results?"
    ]
};

const LiveChat = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [astrologers, setAstrologers] = useState([]);
    const [selectedAstrologer, setSelectedAstrologer] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [socket, setSocket] = useState(null);
    const [violation, setViolation] = useState(null);
    const [attachment, setAttachment] = useState(null);
    const [isChatDisabled, setIsChatDisabled] = useState(false);
    const [warningInfo, setWarningInfo] = useState(null);

    const [showAstroCard, setShowAstroCard] = useState(false);
    const [astroReport, setAstroReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Live chat question states
    const [showQuickQuestions, setShowQuickQuestions] = useState(false);
    const [activeChatTopic, setActiveChatTopic] = useState('');

    const location = useLocation();
    const [isDakshinaPaid, setIsDakshinaPaid] = useState(false);
    const [showDakshinaModal, setShowDakshinaModal] = useState(false);

    // Live chat audio stream states & refs
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [isUserMuted, setIsUserMuted] = useState(false);
    const [volume, setVolume] = useState(1); // 0 to 1

    const peerConnectionRef = useRef(null);
    const audioRef = useRef(null);



    const initializeReceiverPeerConnection = () => {
        const servers = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ],
        };
        peerConnectionRef.current = new RTCPeerConnection(servers);

        // Handle remote stream track
        peerConnectionRef.current.ontrack = (event) => {
            console.log('Received remote audio track:', event.streams[0]);
            if (audioRef.current) {
                audioRef.current.srcObject = event.streams[0];
                audioRef.current.volume = isUserMuted ? 0 : volume;
                audioRef.current.play().catch(err => console.log('Audio autoplay blocked or failed:', err));
            }
            setIsVoiceActive(true);
        };

        // Handle ICE candidates
        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate && selectedAstrologer && socket) {
                socket.emit('live-chat-signaling', {
                    chatId: [user._id, selectedAstrologer._id].sort().join('_'),
                    eventType: 'ice-candidate',
                    payload: event.candidate
                });
            }
        };

        peerConnectionRef.current.onconnectionstatechange = () => {
            const state = peerConnectionRef.current?.connectionState;
            console.log('WebRTC connection state changed:', state);
            if (state === 'disconnected' || state === 'failed') {
                setIsVoiceActive(false);
            }
        };
    };

    const cleanupAudioConnection = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (audioRef.current) {
            audioRef.current.srcObject = null;
        }
        setIsVoiceActive(false);
    };

    const handleVolumeChange = (newVal) => {
        setVolume(newVal);
        if (audioRef.current) {
            audioRef.current.volume = isUserMuted ? 0 : newVal;
        }
    };

    const toggleLocalMute = () => {
        const nextMute = !isUserMuted;
        setIsUserMuted(nextMute);
        if (audioRef.current) {
            audioRef.current.volume = nextMute ? 0 : volume;
        }
    };

    // Redirect if not authenticated

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/live-chat' } });
        }
    }, [isAuthenticated, navigate]);

    // Initialize Socket.io
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_BASE_URL
            ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
            : 'http://localhost:5000';

        const newSocket = io(socketUrl);
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    // Fetch available astrologers
    useEffect(() => {
        const fetchAstrologers = async () => {
            try {
                setLoading(true);
                const response = await liveChatAPI.getAvailableAstrologers();
                setAstrologers(response.data);

                // Auto-select if redirected from payment
                if (location.state?.autoSelectAstroId) {
                    const matchedAstro = response.data.find(a => a._id === location.state.autoSelectAstroId);
                    if (matchedAstro) {
                        setSelectedAstrologer(matchedAstro);
                    }
                }
            } catch (error) {
                console.error('Error fetching astrologers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAstrologers();
    }, [location.state]);


    // Set up socket listeners and fetch chat history when an astrologer is selected
    useEffect(() => {
        cleanupAudioConnection();

        if (!selectedAstrologer || !socket || !user) return;

        const chatId = [user._id, selectedAstrologer._id].sort().join('_');

        // Join private room
        socket.emit('join-live-chat', chatId);

        // Request audio connection if astrologer is already streaming
        socket.emit('live-chat-signaling', {
            chatId,
            eventType: 'request-audio-negotiation',
            payload: null
        });

        // Fetch Guru Dakshina Payment status
        const checkDakshinaStatus = async () => {
            try {
                const response = await liveChatAPI.getDakshinaStatus(selectedAstrologer._id);
                setIsDakshinaPaid(response.data.isPaid);
            } catch (err) {
                console.error('Error fetching dakshina status:', err);
                setIsDakshinaPaid(false);
            }
        };

        checkDakshinaStatus();

        // Fetch history
        const fetchHistory = async () => {
            try {
                setChatLoading(true);
                const response = await liveChatAPI.getChatHistory(selectedAstrologer._id);
                const messagesData = Array.isArray(response.data)
                    ? response.data
                    : (response.data?.messages || []);
                setMessages(messagesData);

                const disabledHeader = response.headers && (response.headers['x-chat-disabled'] || response.headers['X-Chat-Disabled']);
                setIsChatDisabled(disabledHeader === 'true' || (response.data && !!response.data.isDisabled));
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setChatLoading(false);
            }
        };

        fetchHistory();


        // Listen for new messages
        socket.on('receive-live-message', (message) => {
            if (message.chatId === chatId) {
                setMessages((prev) => [...prev, message]);
            }
        });

        // Listen for WebRTC audio signaling
        const handleSignaling = async (data) => {
            const { eventType, payload } = data;
            if (eventType === 'audio-stream-started') {
                console.log('Astrologer voice stream started. Connecting...');
                cleanupAudioConnection();
                initializeReceiverPeerConnection();
            } else if (eventType === 'audio-stream-stopped') {
                console.log('Astrologer voice stream stopped.');
                cleanupAudioConnection();
            } else if (eventType === 'audio-offer') {
                console.log('Received audio offer from astrologer');
                if (!peerConnectionRef.current) {
                    initializeReceiverPeerConnection();
                }
                try {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload));
                    const answer = await peerConnectionRef.current.createAnswer();
                    await peerConnectionRef.current.setLocalDescription(answer);
                    socket.emit('live-chat-signaling', {
                        chatId,
                        eventType: 'audio-answer',
                        payload: answer
                    });
                } catch (err) {
                    console.error('Error processing audio offer:', err);
                }
            } else if (eventType === 'ice-candidate') {
                if (peerConnectionRef.current && payload) {
                    try {
                        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload));
                    } catch (err) {
                        console.error('Error adding remote ICE candidate:', err);
                    }
                }
            }
        };

        socket.on('live-chat-signaling', handleSignaling);

        // Listen for violations
        socket.on('live-chat-violation', (data) => {
            setViolation(data.violationType);
            setTimeout(() => setViolation(null), 5000);
        });

        // Listen for warnings
        socket.on('live-chat-warning', (data) => {
            setWarningInfo(data);
            setTimeout(() => setWarningInfo(null), 8000);
        });

        // Listen for chat disabled event
        socket.on('live-chat-disabled', (data) => {
            setIsChatDisabled(true);
            setWarningInfo(null);
        });

        return () => {
            socket.off('receive-live-message');
            socket.off('live-chat-signaling', handleSignaling);
            socket.off('live-chat-violation');
            socket.off('live-chat-warning');
            socket.off('live-chat-disabled');
            cleanupAudioConnection();
        };
    }, [selectedAstrologer, socket, user]);


    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (isChatDisabled) return;
        if ((!newMessage.trim() && !attachment) || !selectedAstrologer || !socket) return;

        // Check if Guru Dakshina is required
        if (!isDakshinaPaid) {
            const cleanMsg = newMessage.trim().toLowerCase();
            if (cleanMsg !== 'hi' && cleanMsg !== 'hello') {
                setShowDakshinaModal(true);
                return;
            }
        }

        const chatId = [user._id, selectedAstrologer._id].sort().join('_');


        const messageData = {
            senderId: user._id,
            receiverId: selectedAstrologer._id,
            chatId
        };

        if (newMessage.trim()) messageData.text = newMessage.trim();
        if (attachment) messageData.attachments = [attachment];

        socket.emit('send-live-message', messageData);

        setNewMessage('');
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

            const response = await liveChatAPI.uploadFile(formData);
            setAttachment({
                fileUrl: response.data.fileUrl,
                fileName: response.data.fileName,
                fileType: response.data.fileType
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

    const fetchAstroReport = async () => {
        if (!user) return;

        if (showAstroCard) {
            setShowAstroCard(false);
            return;
        }

        setShowAstroCard(true);

        if (astroReport) return;

        try {
            setReportLoading(true);

            // Format datetime: YYYY-MM-DDTHH:mm:ssZ
            const date = new Date(user.dateOfBirth);
            const timeParts = (user.timeOfBirth || "12:00").split(':');
            date.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0);

            const datetime = date.toISOString().split('.')[0] + 'Z';
            const coords = "28.6139,77.2090"; // Using New Delhi as default for now

            const response = await liveChatAPI.getBirthReport(datetime, coords);
            setAstroReport(response.data);
        } catch (error) {
            console.error('Error fetching astro report:', error);
            setShowAstroCard(false);
        } finally {
            setReportLoading(false);
        }
    };

    const filteredAstrologers = astrologers.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.specialization?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden max-h-screen">
            <Navigation />
            <audio ref={audioRef} autoPlay />


            <div className="flex-1 flex max-w-7xl mx-auto w-full p-4 gap-4 overflow-hidden pt-20">
                {/* Sidebar: Available Astrologers */}
                <div className="w-1/3 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                            <Star className="w-5 h-5 text-amber-500 mr-2" />
                            Available Astrologers
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search experts..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {filteredAstrologers.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p>No experts online right now</p>
                            </div>
                        ) : (
                            filteredAstrologers.map((astro) => (
                                <button
                                    key={astro._id}
                                    onClick={() => setSelectedAstrologer(astro)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${selectedAstrologer?._id === astro._id
                                        ? 'bg-amber-500/20 border-amber-500/50 shadow-lg shadow-amber-500/10'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20">
                                                {astro.profilePicture ? (
                                                    <img
                                                        src={buildAssetUrl(astro.profilePicture)}
                                                        alt={astro.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                                                        <User className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg shadow-emerald-500/50"></span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white truncate">{astro.name}</h3>
                                            <p className="text-xs text-slate-400 truncate">
                                                {astro.specialization?.join(', ') || 'Vedic Astrology'}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
                    {!selectedAstrologer ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                                <MessageCircle className="w-10 h-10 text-amber-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Live Astrologer Chat</h2>
                            <p className="text-slate-400 max-w-md">
                                Select an available astrologer from the sidebar to start a real-time private consultation.
                            </p>
                            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-lg">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    <span className="text-xs text-slate-300">End-to-end Private</span>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                                    <Star className="w-5 h-5 text-amber-500" />
                                    <span className="text-xs text-slate-300">Verified Experts</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20">
                                        {selectedAstrologer.profilePicture ? (
                                            <img
                                                src={buildAssetUrl(selectedAstrologer.profilePicture)}
                                                alt={selectedAstrologer.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                                                <User className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{selectedAstrologer.name}</h3>
                                        <p className="text-[10px] text-emerald-400 flex items-center font-semibold uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                                            Active Now
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isVoiceActive ? (
                                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1 text-white">
                                            <span className="flex h-2 w-2 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Voice Live</span>

                                            <button
                                                onClick={toggleLocalMute}
                                                className={`p-1 rounded-full transition-colors ${isUserMuted ? 'bg-red-500 text-white' : 'hover:bg-white/10 text-emerald-400'
                                                    }`}
                                                title={isUserMuted ? "Unmute Audio" : "Mute Audio"}
                                            >
                                                {isUserMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                            </button>

                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={volume}
                                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                                className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                                title="Volume"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider bg-white/5 border border-white/5 rounded-full px-2.5 py-1">
                                            Voice Offline
                                        </div>
                                    )}
                                    <button
                                        onClick={fetchAstroReport}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${showAstroCard ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-amber-500 border border-amber-500/30'
                                            }`}
                                    >
                                        <Compass className={`w-3.5 h-3.5 ${reportLoading ? 'animate-spin' : ''}`} />
                                        {reportLoading ? 'Reading Stars...' : 'Astro Card'}
                                    </button>
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                            </div>

                            {/* Message List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('/images/chat-bg.png')] bg-repeat bg-fixed opacity-95">
                                {chatLoading ? (
                                    <div className="flex justify-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-slate-500 text-sm">No previous messages. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                                        return (
                                            <div
                                                key={msg._id || index}
                                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${isMine
                                                    ? 'bg-amber-500 text-slate-950 rounded-tr-none font-medium'
                                                    : 'bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-tl-none'
                                                    }`}>
                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                        <div className="mb-3 space-y-2">
                                                            {msg.attachments.map((file, i) => (
                                                                <div key={i} className="rounded-xl overflow-hidden bg-black/20">
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
                                                                            className={`flex items-center gap-3 p-3 text-xs hover:bg-black/10 transition-colors ${isMine ? 'text-slate-900' : 'text-amber-500'}`}
                                                                        >
                                                                            <div className={`p-2 rounded-lg ${isMine ? 'bg-amber-600/20' : 'bg-amber-500/10'}`}>
                                                                                <FileText className="w-5 h-5" />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-bold truncate">{file.fileName}</p>
                                                                                <p className="opacity-60 uppercase text-[8px]">PDF Document</p>
                                                                            </div>
                                                                            <Send className="w-4 h-4 rotate-45" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
                                                    <div className={`text-[10px] mt-1.5 flex items-center ${isMine ? 'text-slate-800' : 'text-slate-500'}`}>
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

                            {/* Astro Insights Side Panel */}
                            {showAstroCard && (
                                <div className="absolute top-[73px] right-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 z-30 animate-in slide-in-from-right duration-300">
                                    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-amber-500" />
                                                Spiritual Profile
                                            </h3>
                                            <button onClick={() => setShowAstroCard(false)} className="text-slate-400 hover:text-white">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {reportLoading ? (
                                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent animate-spin rounded-full" />
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest animate-pulse">Consulting the Stars...</p>
                                            </div>
                                        ) : astroReport ? (
                                            <div className="space-y-6">
                                                {/* Panchang Details */}
                                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                                    <p className="text-[10px] text-amber-500/70 font-bold uppercase mb-3">Today's Panchang</p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] text-slate-500 uppercase">Tithi</p>
                                                            <p className="text-xs text-white font-medium">{astroReport.panchang?.tithi?.name || 'N/A'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] text-slate-500 uppercase">Nakshatra</p>
                                                            <p className="text-xs text-white font-medium">{astroReport.panchang?.nakshatra?.name || 'N/A'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] text-slate-500 uppercase">Yogi</p>
                                                            <p className="text-xs text-white font-medium">{astroReport.panchang?.yog?.name || 'N/A'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] text-slate-500 uppercase">Karan</p>
                                                            <p className="text-xs text-white font-medium">{astroReport.panchang?.karan?.name || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Planet Positions */}
                                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                                    <p className="text-[10px] text-amber-500/70 font-bold uppercase mb-3">Planet Alignment</p>
                                                    <div className="space-y-2">
                                                        {astroReport.planets?.map((p, i) => (
                                                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                                                <span className="text-[11px] text-slate-300">{p.name}</span>
                                                                <span className="text-[11px] text-white font-medium">
                                                                    {typeof p.rasi === 'object' ? p.rasi.name : p.rasi} ({Math.floor(p.degree)}°)
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Dosha Check */}
                                                <div className={`rounded-2xl p-4 border ${astroReport.mangalDosha?.has_dosha ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <ShieldCheck className={`w-4 h-4 ${astroReport.mangalDosha?.has_dosha ? 'text-red-500' : 'text-emerald-500'}`} />
                                                        <p className="text-[10px] font-bold uppercase">Mangal Dosha</p>
                                                    </div>
                                                    <p className="text-[11px] text-slate-300 px-6">
                                                        {astroReport.mangalDosha?.has_dosha ? 'Dosha detected. Consult expert for remedies.' : 'No Mangal Dosha present in chart.'}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-20">
                                                <AlertCircle className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                                                <p className="text-xs text-slate-500">Failed to load birth data.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Violation Banner */}
                            {violation && (
                                <div className="absolute bottom-24 left-6 right-6 z-20 animate-bounce">
                                    <div className="bg-red-500/90 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-red-400 shadow-2xl flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5" />
                                        <p className="text-xs font-bold">
                                            Sharing {violation} is against policy and has been blocked.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Message Input */}
                            <div className="p-6 bg-slate-900/80 border-t border-white/10">
                                {attachment && (
                                    <div className="mb-4 flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl animate-in slide-in-from-bottom-2">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                                            {attachment.fileType.startsWith('image/') ? (
                                                <ImageIcon className="w-6 h-6" />
                                            ) : (
                                                <FileText className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-medium truncate">{attachment.fileName}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Ready to send</p>
                                        </div>
                                        <button
                                            onClick={() => setAttachment(null)}
                                            className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                                {showQuickQuestions && (
                                    <div className="mb-4 bg-slate-950/90 border border-white/10 rounded-2xl p-4 animate-in slide-in-from-bottom-2 max-h-72 overflow-hidden flex flex-col">
                                        <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3 flex-shrink-0">
                                            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                                                <Zap className="w-3.5 h-3.5" />
                                                Select a Question Topic
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowQuickQuestions(false);
                                                    setActiveChatTopic('');
                                                }}
                                                className="text-slate-400 hover:text-white text-xs font-semibold"
                                            >
                                                Close
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                                            {!activeChatTopic ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.keys(TOPICS_AND_QUESTIONS).map((topic) => (
                                                        <button
                                                            key={topic}
                                                            type="button"
                                                            onClick={() => setActiveChatTopic(topic)}
                                                            className="p-3 text-left rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 hover:text-amber-400 border border-white/5 transition-all text-ellipsis overflow-hidden whitespace-nowrap"
                                                        >
                                                            {topic}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5 mb-3 flex-shrink-0">
                                                        <span className="text-xs font-bold text-slate-300">Topic: {activeChatTopic}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveChatTopic('')}
                                                            className="text-amber-500 hover:text-amber-400 text-xs font-semibold"
                                                        >
                                                            Back to Topics
                                                        </button>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {TOPICS_AND_QUESTIONS[activeChatTopic].map((question, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => {
                                                                    setNewMessage(question);
                                                                    setShowQuickQuestions(false);
                                                                    setActiveChatTopic('');
                                                                }}
                                                                className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-amber-500/10 text-xs text-slate-300 hover:text-white border border-white/5 hover:border-amber-500/20 transition-all leading-normal"
                                                            >
                                                                {question}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {warningInfo && (
                                    <div className="mb-4 bg-amber-950/80 border border-amber-500/50 rounded-2xl p-4 flex items-start gap-3 text-amber-200 animate-pulse">
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                                        <div>
                                            <h4 className="font-extrabold uppercase text-xs tracking-wider text-amber-400">Warning ({warningInfo.count}/{warningInfo.max})</h4>
                                            <p className="text-xs mt-1 text-amber-300/90 leading-relaxed">
                                                Your message contained content that violates our community guidelines (detected: {warningInfo.violationType}). Repeating this {warningInfo.max - warningInfo.count} more time(s) will automatically terminate the chat.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {isChatDisabled && (
                                    <div className="mb-4 bg-red-950/80 border border-red-500/50 rounded-2xl p-4 flex items-start gap-3 text-red-200">
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                                        <div>
                                            <h4 className="font-extrabold uppercase text-xs tracking-wider text-red-400">Chat Terminated</h4>
                                            <p className="text-xs mt-1 text-red-300/90 leading-relaxed">
                                                This chat session has been automatically disabled due to multiple moderation policy violations. No further messages can be sent.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        disabled={isChatDisabled}
                                    />
                                    <button
                                        type="button"
                                        disabled={uploading || isChatDisabled}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`p-4 rounded-2xl flex items-center justify-center transition-all ${uploading || isChatDisabled ? 'bg-slate-850 text-slate-600 border border-white/5' : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                                            }`}
                                    >
                                        {uploading ? (
                                            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent animate-spin rounded-full" />
                                        ) : (
                                            <Paperclip className="w-6 h-6" />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isChatDisabled}
                                        onClick={() => {
                                            if (!isDakshinaPaid) {
                                                setShowDakshinaModal(true);
                                            } else {
                                                setShowQuickQuestions(prev => !prev);
                                            }
                                        }}
                                        className={`p-4 rounded-2xl flex items-center justify-center border transition-all ${isChatDisabled ? 'bg-slate-850 text-slate-600 border-white/5' : showQuickQuestions
                                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md animate-pulse'
                                            : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
                                            }`}
                                        title="Quick Questions"
                                    >
                                        <HelpCircle className="w-6 h-6" />
                                    </button>

                                    <input
                                        type="text"
                                        placeholder={isChatDisabled ? "Chat disabled due to policy violations." : "Type your spiritual query..."}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-inner disabled:opacity-50"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={isChatDisabled}
                                    />
                                    <button
                                        type="submit"
                                        disabled={(!newMessage.trim() && !attachment) || uploading || isChatDisabled}
                                        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-slate-950 p-4 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                                    >
                                        <Send className="w-6 h-6" />
                                    </button>
                                </form>

                                <p className="mt-3 text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">
                                    SECURE • PRIVATE • VEDIC TRADITION
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Guru Dakshina Modal */}
            {showDakshinaModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowDakshinaModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 bg-white/5 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="text-center mt-3 mb-6">
                            <span className="text-2xl">🌸</span>
                            <h3 className="text-lg font-black uppercase tracking-wider text-white mt-2">Offer Guru Dakshina</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                                To ask custom questions or access quick queries, please offer Guru Dakshina to the astrologer.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[11, 21, 51, 101, 151, 201].map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const response = await liveChatAPI.createDakshinaPayment(selectedAstrologer._id, amount);
                                            const paymentData = response.data;
                                            const payment = paymentData.payment || paymentData;

                                            if (!payment || !payment._id) {
                                                throw new Error('No payment ID returned from gateway.');
                                            }

                                            // Redirect to mock payment page
                                            navigate(`/payment?paymentId=${payment._id}&amount=${amount}&astroName=${encodeURIComponent(selectedAstrologer.name)}&astrologerId=${selectedAstrologer._id}`);
                                        } catch (err) {
                                            console.error('Error creating payment:', err);
                                            alert(err.message || 'Failed to initialize payment.');
                                        }
                                    }}
                                    className="bg-white/5 hover:bg-amber-500 hover:text-slate-950 border border-white/5 rounded-2xl py-3 text-sm font-extrabold text-white transition-all duration-200 active:scale-95 flex flex-col items-center justify-center gap-0.5"
                                >
                                    <span className="text-[10px] opacity-75 font-medium">Offer</span>
                                    <span>₹{amount}</span>
                                </button>
                            ))}
                        </div>

                        <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-widest">
                            DEVOTION • KNOWLEDGE • RESPECT
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};


export default LiveChat;
