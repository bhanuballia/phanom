import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Send,
    Sparkles,
    X,
    Volume2,
    User,
    Bot,
    Mic,
    MicOff,
    Trash2,
    ChevronRight,
    BookOpen,
    Plus,
    Users,
    MapPin,
    Heart,
    Activity,
    Brain,
    CircleDollarSign,
    ShieldCheck,
    Copy,
    Share2,
    Check,
    RefreshCcw,
    Download
} from 'lucide-react';
import Navigation from '../components/Navigation';
import { API_BASE_URL } from '../services/api';
import { FeatureDetector } from '../utils/browserCompatibility';
import VedAstroChatClient from '../utils/vedastroChat';
import { PRESET_QUESTIONS, CHAT_TOPICS } from '../data/chatPresets';


const ASTROLOGER_NAMES = ['Siddarth', 'ChandraShekar', 'Vikas', 'Anurag', 'Sonika', 'Anu', 'Devesh'];
const WELCOME_TAGLINES = [
    "Namaste! What’s on your mind? 🤔✨",
    "Unlock the secrets of the stars! 🌌🔑",
    "Recognize the signs of the universe! 💫🔭",
    "Answers to your questions are here! ❓✅",
    "The truth of your zodiac sign! ♈♉♊"
];

const ASTROLOGER_GENDERS = {
    'Siddarth': 'Male',
    'ChandraShekar': 'Male',
    'Vikas': 'Male',
    'Anurag': 'Male',
    'Sonika': 'Female',
    'Anu': 'Female',
    'Devesh': 'Male'
};


const AIAstrologer = () => {
    const { isAuthenticated, user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [ratedMessages, setRatedMessages] = useState(new Set());
    const [isInitializing, setIsInitializing] = useState(true);
    const [astrologerName, setAstrologerName] = useState(ASTROLOGER_NAMES[0]);



    // Chat Topic State
    const [selectedTopic, setSelectedTopic] = useState('horoscope');
    const [activePresetCategory, setActivePresetCategory] = useState(null);

    // Horoscope Selector State
    const [selectedHoroscope, setSelectedHoroscope] = useState(null);
    const [savedHoroscopes, setSavedHoroscopes] = useState([]);
    const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
    const [modalStep, setModalStep] = useState(1); // Multi-step modal: 1 = Birth Time, 2 = Birth Location
    const [newPersonData, setNewPersonData] = useState({
        name: '',
        dob: '',
        tob: '',
        pob: '',
        hour: '12',
        minute: '00',
        ampm: 'PM',
        day: '15',
        month: 'January',
        year: '1990',
        country: 'India',
        gender: 'Male'
    });
    const [chartImage, setChartImage] = useState(null); // Store generated chart image
    const [showActionButtons, setShowActionButtons] = useState(true); // Show action buttons on responses
    const [lifeSummary, setLifeSummary] = useState(null); // Data for Life Summary dashboard
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [lastQuery, setLastQuery] = useState(null); // Store last query for retry
    const [copiedId, setCopiedId] = useState(null);

    // Location detection handler
    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsDetectingLocation(true);

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Using OpenStreetMap Nominatim API for reverse geocoding
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();

                if (data && data.address) {
                    const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
                    const country = data.address.country || '';

                    setNewPersonData(prev => ({
                        ...prev,
                        pob: city,
                        country: country || prev.country
                    }));
                }
            } catch (error) {
                console.error('Error detecting location:', error);
                alert('Unable to detect location. Please enter manually.');
            } finally {
                setIsDetectingLocation(false);
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            setIsDetectingLocation(false);
            alert('Unable to retrieve your location.');
        });
    };

    const messagesEndRef = useRef(null);
    const speechSynthesisRef = useRef(null);
    const [speechRecognition, setSpeechRecognition] = useState(null);

    // VedAstro Chat Client instance
    const vedastroChatRef = useRef(null);

    // Initialize VedAstro Chat Client
    useEffect(() => {
        if (!vedastroChatRef.current) {
            vedastroChatRef.current = new VedAstroChatClient({
                userId: (isAuthenticated && user) ? user._id : 'Guest-' + Math.floor(Math.random() * 1000),
                apiUrl: `${API_BASE_URL}/chatbot`
            });
            console.log('✅ VedAstro Chat Client initialized' + (isAuthenticated ? ' (Auth)' : ' (Guest)'));
        }
    }, [isAuthenticated, user]);

    // Load User's Horoscope
    useEffect(() => {
        if (isAuthenticated && user && user._id) {

            // Set up initial horoscopes list if not already done
            if (savedHoroscopes.length === 0) {
                const me = {
                    id: 'me',
                    name: `${user.name} (My Chart)`,
                    dob: user.dateOfBirth || user.dob || '',
                    tob: user.timeOfBirth || user.tob || '12:00',
                    pob: user.placeOfBirth || user.pob || '',
                    gender: user.gender || 'Male',
                    isMe: true
                };

                setSavedHoroscopes([me]);
                setSelectedHoroscope(me);
                generateLifeSummary(me);
            }
        } else if (!isAuthenticated) {
            // For guest users, ensure the bar is visible/interactive
            if (savedHoroscopes.length === 0) {
                // We keep it empty but maybe we should add a "Guest" placeholder note
                console.log('User is guest, horoscope list empty');
            }
        }
    }, [isAuthenticated, user, savedHoroscopes.length]);

    // Initial welcome message
    useEffect(() => {
        const randomName = ASTROLOGER_NAMES[Math.floor(Math.random() * ASTROLOGER_NAMES.length)];
        const randomTagline = WELCOME_TAGLINES[Math.floor(Math.random() * WELCOME_TAGLINES.length)];

        setAstrologerName(randomName);

        const welcomeMsg = {
            id: Date.now(),
            text: isAuthenticated && user
                ? `Namaste! I am ${randomName}. ${randomTagline} I'm ready to read your chart. What would you like to know today?`
                : `Namaste! I am ${randomName}. ${randomTagline} To get a personalized reading , please login or add your birth details.`,
            isBot: true,
            timestamp: new Date(),
            audio: true,
            showFeedback: false
        };
        setMessages([welcomeMsg]);

        // Initialize speech recognition
        if (FeatureDetector.supportsSpeechRecognition()) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'hi-IN';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                handleSendMessage(transcript);
            };

            setSpeechRecognition(recognition);
        }

        // Simulate Loader.js behavior with an initial loading screen
        const initTimer = setTimeout(() => {
            setIsInitializing(false);
        }, 2500);

        return () => clearTimeout(initTimer);
    }, [isAuthenticated, user]);

    // SEO and Metadata injection (matches static HTML template)
    useEffect(() => {
        document.title = "Ask Astrologer - Free Online Astrology Predictions by Best Astrologer";

        // Meta Tags
        const metaTags = [
            { name: "title", content: "Astrologer Near Me | Best Astrologers for Love, Marriage & Career Guidance | Astrotalk" },
            { name: "description", content: "Get personalized astrology readings from the best astrologers near you. Expert guidance on love, marriage, career, and more. Download Astrotalk app for free chat with top astrologers." },
            { property: "og:title", content: "Astrologer Near Me | Best Astrologers for Love, Marriage & Career Guidance | Astrotalk" },
            { property: "og:image", content: "https://vedastro.org/images/vedastro-api-logo.png" }
        ];

        metaTags.forEach(tag => {
            let element = document.querySelector(`meta[${tag.name ? 'name' : 'property'}="${tag.name || tag.property}"]`);
            if (!element) {
                element = document.createElement('meta');
                if (tag.name) element.setAttribute('name', tag.name);
                if (tag.property) element.setAttribute('property', tag.property);
                document.head.appendChild(element);
            }
            element.setAttribute('content', tag.content);
        });

        // JSON-LD Structured Data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Astrologer Chat",
            "description": "Get personalized astrology readings from the best astrologers near you.",
            "publisher": {
                "@type": "Organization",
                "name": "VedAstro"
            }
        });
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    // Play sound on bot response
    const playResponseSound = () => {
        const audio = new Audio('/sounds/positive-notification.mp3');
        audio.play().catch(e => console.log('Audio play blocked:', e));
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const speakText = (text) => {
        if (!voiceEnabled || !FeatureDetector.supportsSpeechSynthesis()) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.85;
        utterance.pitch = 1.1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        // Try to find a Hindi voice
        const voices = window.speechSynthesis.getVoices();
        const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
        if (hindiVoice) utterance.voice = hindiVoice;

        window.speechSynthesis.speak(utterance);
    };




    const toggleListening = () => {
        if (!speechRecognition) return;
        if (isListening) speechRecognition.stop();
        else speechRecognition.start();
    };

    const clearChat = () => {
        if (window.confirm("Are you sure you want to clear the chat history?")) {
            setMessages([{
                id: Date.now(),
                text: "Chat cleared. I'm ready for your next question! How can I help you today?",
                isBot: true,
                timestamp: new Date()
            }]);
            setRatedMessages(new Set()); // Clear rated messages
            if (vedastroChatRef.current) {
                vedastroChatRef.current.resetSession(); // Reset VedAstro session
            }
        }
    };

    const handleRateMessage = async (messageHash, rating) => {
        // Prevent duplicate ratings
        if (ratedMessages.has(messageHash)) {
            alert("You have already rated this message.");
            return;
        }

        try {
            if (!messageHash || !vedastroChatRef.current) return;

            // Submit feedback to VedAstro API
            const feedbackResponse = await vedastroChatRef.current.sendFeedback(messageHash, rating);

            if (feedbackResponse.success) {
                // Mark message as rated
                setRatedMessages(prev => new Set([...prev, messageHash]));

                // Show thank you message
                const thankYouMsg = {
                    id: Date.now(),
                    text: rating > 0
                        ? "🙏 Thank you! Your positive feedback helps Siddharth provide better insights."
                        : "🙏 Thank you! We'll use your feedback to improve the accuracy of our readings.",
                    isBot: true,
                    timestamp: new Date(),
                    commands: ["noFeedback"], // Don't show feedback on thank you message
                    showFeedback: false
                };

                setMessages(prev => [...prev, thankYouMsg]);
                console.log('✅ Feedback submitted successfully');
            } else {
                alert("There was an issue submitting your feedback. Please try again.");
            }
        } catch (error) {
            console.error('❌ Error submitting feedback:', error);
            alert("Could not submit feedback at this time.");
        }
    };

    const handleHoroscopeSelect = (h) => {
        if (selectedHoroscope?.id === h.id) {
            // Already selected, but provide a small nudge
            const msg = {
                id: Date.now(),
                text: `🔮 I am already analyzing ${h.isMe ? 'your' : h.name + "'s"} chart.You can ask your question now!`,
                isBot: true,
                timestamp: new Date(),
                showFeedback: false
            };
            setMessages(prev => [...prev.slice(-10), msg]); // Keep history manageable
            return;
        }

        setSelectedHoroscope(h);

        // Add a switch confirmation message
        const switchMsg = {
            id: Date.now(),
            text: `✨ Now switching my focus to ${h.isMe ? 'your' : h.name + "'s"} chart.`,
            isBot: true,
            timestamp: new Date(),
            showFeedback: false
        };
        setMessages(prev => [...prev, switchMsg]);

        // Reset session if using VedAstro proxy for fresh context
        if (vedastroChatRef.current) {
            vedastroChatRef.current.resetSession();
        }

        // Generate life summary for the new person
        generateLifeSummary(h);
    };

    const generateLifeSummary = (horoscope) => {
        if (!horoscope) return;

        // In a real app, this would hash birth details and lookup in the safety cache CSV
        // Here we simulate a stable lookup based on name/dob
        const seedValue = (horoscope.name + (horoscope.dob || '')).length;
        const natures = ['Good', 'Neutral', 'Bad'];

        const summary = {
            Mind: natures[seedValue % 3],
            Studies: natures[(seedValue + 1) % 3],
            Family: natures[(seedValue + 2) % 3],
            Money: natures[(seedValue + 1) % 2 === 0 ? 0 : 1], // simpler toggle to avoid "Bad" too often for money
            Love: natures[(seedValue + 3) % 3],
            Body: natures[(seedValue + 2) % 2 === 0 ? 0 : 1]
        };

        setLifeSummary(summary);
    };

    const handleTopicChange = (topicId) => {
        setSelectedTopic(topicId);
        setActivePresetCategory(null); // Reset preset category selection

        // Notify user
        const topicName = CHAT_TOPICS.find(t => t.id === topicId)?.label || topicId;
        const msg = {
            id: Date.now(),
            text: `Conversation topic changed to: ** ${topicName}** `,
            isBot: true,
            timestamp: new Date(),
            showFeedback: false,
            commands: ['noFeedback']
        };
        setMessages(prev => [...prev, msg]);

        if (vedastroChatRef.current) {
            vedastroChatRef.current.resetSession();
        }
    };

    const TypewriterText = ({ text, speed = 40, onComplete }) => {
        const [displayedText, setDisplayedText] = useState("");
        const [index, setIndex] = useState(0);
        const words = useMemo(() => text ? text.split(" ") : [], [text]);

        useEffect(() => {
            if (words.length > 0 && index < words.length) {
                const timer = setTimeout(() => {
                    setDisplayedText((prev) => prev + (index === 0 ? "" : " ") + words[index]);
                    setIndex((prev) => prev + 1);
                }, speed);
                return () => clearTimeout(timer);
            } else if (words.length > 0 && index >= words.length) {
                onComplete?.();
            }
        }, [index, words, speed, onComplete]);

        return (
            <span className="font-playfair text-slate-800 leading-relaxed text-[16px] md:text-[17px]">
                {displayedText}
                {index < words.length && <span className="inline-block w-1.5 h-4 bg-indigo-500/50 ml-1 rounded-full animate-pulse align-middle"></span>}
            </span>
        );
    };

    const renderMessageContent = (msg) => {
        // Check if message is "new" (less than 5 seconds old) to trigger typewriter
        const isNew = Date.now() - new Date(msg.timestamp).getTime() < 5000;

        // Helper to safely render HTML
        const createMarkup = (htmlContent) => {
            return { __html: htmlContent };
        };

        const BotContent = () => {
            const [typingFinished, setTypingFinished] = useState(!isNew);

            // If it's a simple text message or we're typing
            if (!typingFinished && msg.text && msg.isBot) {
                return (
                    <div className="animate-in fade-in duration-300">
                        <TypewriterText text={msg.text} onComplete={() => setTypingFinished(true)} />
                    </div>
                );
            }

            // Final beautiful version (with HTML if available)
            return (
                <div className="space-y-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <div
                        className="vedastro-html-content text-slate-800 leading-relaxed font-playfair text-[16px] md:text-[17px] 
                                   prose prose-sm md:prose-base 
                                   prose-headings:text-indigo-900 prose-headings:font-bold prose-headings:mb-3
                                   prose-strong:text-indigo-700 prose-strong:font-bold
                                   prose-p:mb-5 prose-p:leading-8
                                   prose-li:mb-2
                                   prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                                   max-w-none"
                        dangerouslySetInnerHTML={createMarkup(msg.textHtml || msg.text)}
                    />

                    {/* Multiple Answers (Teacher Mode) - Accordion Style */}
                    {(msg.text2 || msg.text3) && (
                        <div className="space-y-3 mt-6 border-t border-slate-100 pt-4">
                            {msg.text2 && (
                                <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                                    <details className="group">
                                        <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-700 hover:text-indigo-600">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                                <span className="text-xs uppercase tracking-widest font-playfair">Alternative Perspective</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 transition group-open:rotate-90 text-slate-400" />
                                        </summary>
                                        <div
                                            className="text-slate-700 p-5 border-t border-slate-100 prose prose-sm max-w-none font-outfit"
                                            dangerouslySetInnerHTML={createMarkup(msg.text2)}
                                        />
                                    </details>
                                </div>
                            )}
                            {msg.text3 && (
                                <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                                    <details className="group">
                                        <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-4 bg-indigo-50/30 hover:bg-indigo-50 transition-colors text-indigo-900">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-indigo-600" />
                                                <span className="text-xs uppercase tracking-widest font-playfair text-indigo-800">Deep Vedic Insights</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 transition group-open:rotate-90 text-indigo-400" />
                                        </summary>
                                        <div
                                            className="text-slate-700 p-5 border-t border-indigo-100/30 prose prose-sm max-w-none font-outfit"
                                            dangerouslySetInnerHTML={createMarkup(msg.text3)}
                                        />
                                    </details>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        };

        if (msg.isBot) {
            return <BotContent />;
        }

        // User message
        return <p className="whitespace-pre-wrap font-outfit text-white">{msg.text}</p>;
    };

    const handleAddPerson = (e) => {
        if (e) e.preventDefault();

        const { name, hour, minute, ampm, day, month, year, pob, gender } = newPersonData;

        if (!name || !pob) {
            alert("Please enter name and birth location.");
            return;
        }

        // Convert to 24-hour format
        let hour24 = parseInt(hour);
        if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
        if (ampm === 'AM' && hour24 === 12) hour24 = 0;

        // Format date as YYYY-MM-DD
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = monthNames.indexOf(month) + 1;
        const dob = `${year}-${monthIndex.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;

        // Format time as HH:MM
        const tob = `${hour24.toString().padStart(2, '0')}:${minute}`;

        const newPerson = {
            id: Date.now().toString(),
            name,
            dob,
            tob,
            pob,
            gender: gender || 'Male',
            isMe: false
        };

        setSavedHoroscopes(prev => [...prev, newPerson]);
        setSelectedHoroscope(newPerson);
        setIsAddPersonOpen(false);
        setModalStep(1); // Reset to step 1
        setNewPersonData({
            name: '',
            dob: '',
            tob: '',
            pob: '',
            hour: '12',
            minute: '00',
            ampm: 'PM',
            day: '15',
            month: 'January',
            year: '1990',
            country: 'India',
            gender: 'Male'
        });

        // Add chart generation message
        const chartMsg = {
            id: Date.now(),
            text: `I'm drawing the vedic chart 🎨 📊`,
            isBot: true,
            timestamp: new Date(),
            showFeedback: false
        };
        setMessages(prev => [...prev, chartMsg]);

        // Simulate chart generation (in real app, call API here)
        setTimeout(() => {
            const readyMsg = {
                id: Date.now() + 1,
                text: `Ok, I've read the horoscope.😊\nAny questions?`,
                isBot: true,
                timestamp: new Date(),
                showFeedback: false
            };
            setMessages(prev => [...prev, readyMsg]);
        }, 1500);

        // Generate life summary for the new person
        generateLifeSummary(newPerson);
    };




    const handleSendMessage = async (text, isFollowUp = false, parentMessageHash = null) => {
        if (!text.trim()) return;

        // Store last query for retry
        setLastQuery({ text, isFollowUp, parentMessageHash });

        const newUserMsg = {
            id: Date.now(),
            text: text,
            isBot: false,
            timestamp: new Date()
        };

        if (!isFollowUp) {
            setMessages(prev => [...prev, newUserMsg]);
            setInputText('');
        }

        setIsTyping(true);
        setIsSearching(true);

        // Performance tracking
        const startTime = Date.now();
        console.log(`⏱️ [PERF-FRONTEND] Starting message send at ${new Date().toISOString()}`);

        try {
            const horoscope = selectedHoroscope || savedHoroscopes.find(h => h.id === 'me');

            if (!horoscope) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: "Please add your birth details first by clicking the + button. I need your birth time and location to provide accurate astrological insights using VedAstro AI.",
                    isBot: true,
                    timestamp: new Date(),
                    showFeedback: false
                }]);
                setIsTyping(false);
                setIsSearching(false);
                return;
            }

            // Construct birth details required by VedAstro Chat Client
            const birthDetails = {
                dob: horoscope.dob || horoscope.dateOfBirth,
                tob: horoscope.tob || horoscope.timeOfBirth,
                pob: horoscope.pob || horoscope.placeOfBirth,
                name: horoscope.name
            };

            console.log(`⏱️ [PERF-FRONTEND] Calling VedAstro API...`);
            let response;
            if (isFollowUp && parentMessageHash) {
                response = await vedastroChatRef.current.sendFollowUpQuestion(text, parentMessageHash, birthDetails);
            } else {
                response = await vedastroChatRef.current.sendMessage(text, birthDetails);
            }

            const duration = Date.now() - startTime;
            console.log(`⏱️ [PERF-FRONTEND] Total response time: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);

            if (response) {
                const botMessage = {
                    id: Date.now(),
                    text: response.text || "...",
                    textHtml: response.textHtml,
                    text2: response.text2,
                    text3: response.text3,
                    isBot: true,
                    timestamp: new Date(),
                    messageHash: response.messageHash || response.sessionId, // Fallback if no hash
                    followUpQuestions: response.followUpQuestions,
                    commands: response.commands,
                    showFeedback: !response.commands?.includes('noFeedback'),
                    // If audio URL is provided (future), or just use text
                    audio: response.audio
                };

                setMessages(prev => [...prev, botMessage]);

                if (voiceEnabled) {
                    // Use text for TTS if audio file not provided
                    speakText(response.audio || response.text);
                }

                // Play notification sound (matches static HTML template)
                playResponseSound();
            } else {
                throw new Error("Empty response from AI");
            }

        } catch (error) {
            console.error('❌ VedAstro API Error:', error);

            let userErrorMessage = "Sorry, I'm having trouble connecting to the VedAstro engine. Please ensure your local API is running.";

            if (error.message.includes('429') || error.message.includes('TooManyRequests')) {
                userErrorMessage = "🙏 Our AI engine is currently very busy analysisng many stars! Please wait 1-2 minutes and try again. Alternatively, you can book a personal session with our experts.";
            } else if (error.message.includes('timeout') || error.message.includes('deadline')) {
                userErrorMessage = "⌛ The calculation is taking longer than expected. Vedic charts are complex! Please try asking a simpler question or try again in a moment.";
            }

            setMessages(prev => [...prev, {
                id: Date.now(),
                text: userErrorMessage,
                isBot: true,
                timestamp: new Date(),
                showFeedback: false
            }]);
        } finally {
            setIsTyping(false);
            setIsSearching(false);
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleShare = async (text) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Vedic Astrology Insight',
                    text: text,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            handleCopy(text, 'share-msg');
            alert('Link copied to clipboard!');
        }
    };


    if (isInitializing) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center font-['Lexend_Deca'] text-[#1c1e21]">
                {/* Initial Loading GIF - exact same as in the static HTML provided */}
                <div id="HoroscopeChat" className="flex flex-col items-center gap-6 animate-pulse">
                    <img
                        src="/images/loading-animation-progress-transparent.gif"
                        alt="Loading VedAstro..."
                        className="w-48 md:w-64"
                    />
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-black text-blue-600 uppercase tracking-widest">Initializing AI Siddhartha</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Connecting to VedAstro Engine</p>
                    </div>
                </div>

                {/* Loader.js injection simulation */}
                <div className="fixed bottom-10 left-0 right-0 flex justify-center opacity-30">
                    <div className="flex gap-4">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-50 font-['Inter',sans-serif] text-slate-900 overflow-hidden flex transition-all duration-300">
            <Navigation />

            {/* Sidebar - Desktop */}
            <div className="hidden md:flex w-80 bg-white border-r border-slate-200 flex-col h-full pt-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-20">
                {/* Profile Selector Heading */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Profile</h3>
                    <button onClick={() => setIsAddPersonOpen(true)} className="text-indigo-600 hover:text-indigo-700 bg-indigo-50 p-1.5 rounded-lg transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Profile List */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar-light">
                    {savedHoroscopes.map((h) => (
                        <button
                            key={h.id}
                            onClick={() => handleHoroscopeSelect(h)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border group ${selectedHoroscope?.id === h.id
                                ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-transform ${selectedHoroscope?.id === h.id
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'bg-slate-100 text-slate-400 group-hover:bg-white'
                                }`}>
                                {h.name.charAt(0)}
                            </div>
                            <div className="text-left overflow-hidden flex-1">
                                <div className={`font-semibold text-sm truncate ${selectedHoroscope?.id === h.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                                    {h.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                    {h.dob}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Your Astrologer Section */}
                <div className="px-6 py-6 border-t border-slate-100 bg-indigo-50/10">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Your Astrologer</h4>
                    <div className="relative group/astro">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl opacity-10 group-hover/astro:opacity-20 transition duration-500"></div>
                        <div className="relative bg-white rounded-xl overflow-hidden border border-indigo-100 shadow-sm transition-transform hover:scale-[1.02]">
                            <img
                                src={ASTROLOGER_GENDERS[astrologerName] === 'Female'
                                    ? "/images/astrologers/female_astrologer.png"
                                    : "/images/astrologers/male_astrologer.png"}
                                alt={astrologerName}
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-3 bg-white/95 backdrop-blur-sm absolute bottom-0 left-0 right-0 border-t border-indigo-50">
                                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-indigo-500" />
                                    {astrologerName}
                                </div>
                                <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Vedic Expert</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Life Summary Mini-Widget (If Profile Selected) */}
                {lifeSummary && (
                    <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/50">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Life Snapshot</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(lifeSummary).map(([key, value]) => (
                                <div key={key} className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col items-center gap-1 shadow-sm transition-all hover:border-indigo-200">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${value === 'Good' ? 'bg-emerald-50 text-emerald-600' :
                                        value === 'Bad' ? 'bg-rose-50 text-rose-500' :
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                        {key === 'Mind' && <Brain className="w-4 h-4" />}
                                        {key === 'Studies' && <BookOpen className="w-4 h-4" />}
                                        {key === 'Family' && <Users className="w-4 h-4" />}
                                        {key === 'Money' && <CircleDollarSign className="w-4 h-4" />}
                                        {key === 'Love' && <Heart className="w-4 h-4" />}
                                        {key === 'Body' && <Activity className="w-4 h-4" />}
                                    </div>
                                    <span className={`text-[10px] font-bold ${value === 'Good' ? 'text-emerald-700' :
                                        value === 'Bad' ? 'text-rose-600' :
                                            'text-amber-700'
                                        }`}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reset Chat Button */}
                <div className="p-4 border-t border-slate-100">
                    <button onClick={clearChat} className="w-full flex items-center justify-center gap-2 p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-xs font-bold uppercase tracking-wider">
                        <Trash2 className="w-4 h-4" />
                        Clear Conversation
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative bg-slate-50 pt-16 md:pt-0">
                {/* Mobile Header (Visible only on mobile) */}
                <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-10 pt-16">
                    <span className="font-bold text-slate-800">Chat Astrologer</span>
                    <button onClick={() => setIsAddPersonOpen(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Top Bar / Context Header */}
                <div className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 hidden md:flex z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-sm font-semibold text-slate-600">
                            AI Astrologer <span className="mx-2 text-slate-300">|</span> <span className="text-indigo-600">{selectedHoroscope?.name || "Guest"}</span>
                        </span>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar-light scroll-smooth bg-slate-50/50">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 select-none">
                            <Sparkles className="w-24 h-24 text-slate-300 mb-4" />
                            <p className="text-xl font-bold text-slate-400">Start a new reading</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                            <div className={`flex gap-4 max-w-[95%] md:max-w-[80%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                                {/* Bot Avatar */}
                                {msg.isBot && (
                                    <div className="flex-shrink-0 mt-1 hidden sm:block">
                                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm p-1 overflow-hidden">
                                            <img src="/artifacts/spiritual_ai_mascot.png" alt="AI" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    {msg.isBot && (
                                        <span className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">{astrologerName}</span>
                                    )}
                                    <div
                                        className={`px-6 py-4 rounded-2xl shadow-sm text-[15px] leading-7 ${msg.isBot
                                            ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                                            : 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-200/50'
                                            }`}
                                    >
                                        {msg.isBot ? renderMessageContent(msg) : <p className="whitespace-pre-wrap">{msg.text}</p>}
                                    </div>

                                    {/* Action Buttons for Bot Responses */}
                                    {msg.isBot && msg.showFeedback !== false && (
                                        <div className="flex items-center gap-3 px-2 mt-2">
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <button
                                                    onClick={() => handleCopy(msg.text, msg.id)}
                                                    className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-indigo-600"
                                                    title="Copy response"
                                                >
                                                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>

                                                <button
                                                    onClick={() => handleShare(msg.text)}
                                                    className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-indigo-600"
                                                    title="Share insight"
                                                >
                                                    <Share2 className="w-3.5 h-3.5" />
                                                </button>

                                                <button
                                                    onClick={() => speakText(msg.text)}
                                                    className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-indigo-600"
                                                    title="Listen again"
                                                >
                                                    <Volume2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Retry button for error messages */}
                                    {msg.isBot && msg.text.includes('trouble connecting') && (
                                        <div className="mt-2 px-2">
                                            <button
                                                onClick={() => lastQuery && handleSendMessage(lastQuery.text, lastQuery.isFollowUp, lastQuery.parentMessageHash)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                                            >
                                                <RefreshCcw className="w-3 h-3" />
                                                Try Again
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start animate-in fade-in duration-300">
                            <div className="flex gap-4 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm p-1 hidden sm:block">
                                    <div className="w-full h-full bg-slate-100 rounded-full"></div>
                                </div>
                                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Bottom Input Area */}
                <div className="p-4 md:p-6 bg-white/90 backdrop-blur-md border-t border-slate-100 z-20">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {/* Preset Questions (Vertical List - All Topics) */}
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar-light">
                            {CHAT_TOPICS.map((topic) => (
                                <div key={topic.id} className="space-y-2 mb-4 last:mb-0">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50/50 rounded-lg">
                                        {topic.label}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {topic.questions.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSendMessage(q)}
                                                className="w-full text-left px-6 py-3.5 bg-white border border-slate-100 rounded-xl text-[14px] font-bold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all shadow-sm flex items-center justify-between group/q"
                                            >
                                                <span>{q}</span>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover/q:text-indigo-400 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Box */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl opacity-20 blur group-focus-within:opacity-40 transition duration-500"></div>
                            <div className="relative flex items-center bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-100 transition-all p-1">
                                <button
                                    onClick={toggleListening}
                                    className={`p-3 rounded-lg transition-all ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}`}
                                >
                                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>

                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                                    placeholder={`Message ${astrologerName}...`}
                                    className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 px-4 py-3 font-medium focus:outline-none text-[15px]"
                                />

                                <button
                                    onClick={() => handleSendMessage(inputText)}
                                    disabled={!inputText.trim() || isTyping}
                                    className={`p-2 m-1 rounded-lg transition-all ${inputText.trim() ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700' : 'bg-slate-100 text-slate-300'}`}
                                >
                                    {isTyping ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-slate-400 font-medium">
                            AI Astrology can make mistakes. Consider checking important predictions with a certified Vedic expert.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal Components (Add Person, etc) */}
            {isAddPersonOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Add New Profile</h3>
                            <button onClick={() => setIsAddPersonOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Step 1: Birth Time */}
                            {modalStep === 1 && (
                                <div className="space-y-5">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-slate-700">Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter full name"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all font-medium text-slate-800"
                                            value={newPersonData.name}
                                            onChange={(e) => setNewPersonData({ ...newPersonData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Day</label>
                                            <select
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-300"
                                                value={newPersonData.day}
                                                onChange={(e) => setNewPersonData({ ...newPersonData, day: e.target.value })}
                                            >
                                                {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Month</label>
                                            <select
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-300"
                                                value={newPersonData.month}
                                                onChange={(e) => setNewPersonData({ ...newPersonData, month: e.target.value })}
                                            >
                                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Year</label>
                                            <input
                                                type="number"
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-300"
                                                value={newPersonData.year}
                                                onChange={(e) => setNewPersonData({ ...newPersonData, year: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Hour</label>
                                            <select
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-300"
                                                value={newPersonData.hour}
                                                onChange={(e) => setNewPersonData({ ...newPersonData, hour: e.target.value })}
                                            >
                                                {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(h => (
                                                    <option key={h} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Min</label>
                                            <select
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-300"
                                                value={newPersonData.minute}
                                                onChange={(e) => setNewPersonData({ ...newPersonData, minute: e.target.value })}
                                            >
                                                {['00', '15', '30', '45', '10', '20', '40', '50'].sort().map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setModalStep(2)}
                                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-4"
                                    >
                                        Next Step <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Birth Location */}
                            {modalStep === 2 && (
                                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-slate-700">Country</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-300"
                                            value={newPersonData.country}
                                            onChange={(e) => setNewPersonData({ ...newPersonData, country: e.target.value })}
                                        >
                                            <option value="India">India</option>
                                            <option value="USA">USA</option>
                                            <option value="UK">UK</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Singapore">Singapore</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-slate-700">City / Place of Birth</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="e.g. Mumbai, New York"
                                                className="w-full p-3 pl-10 pr-24 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                                                value={newPersonData.pob}
                                                onChange={(e) => setNewPersonData({ ...newPersonData, pob: e.target.value })}
                                            />
                                            <button
                                                onClick={detectLocation}
                                                disabled={isDetectingLocation}
                                                className="absolute right-2 top-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                {isDetectingLocation ? '...' : 'Detect'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setModalStep(1)}
                                            className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => setModalStep(3)}
                                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            Next Step <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Gender */}
                            {modalStep === 3 && (
                                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setNewPersonData({ ...newPersonData, gender: 'Male' })}
                                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${newPersonData.gender === 'Male'
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                    : 'border-slate-200 hover:border-indigo-200 text-slate-600'
                                                    }`}
                                            >
                                                <div className="p-2 bg-white rounded-full shadow-sm">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <span className="font-bold">Male</span>
                                            </button>
                                            <button
                                                onClick={() => setNewPersonData({ ...newPersonData, gender: 'Female' })}
                                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${newPersonData.gender === 'Female'
                                                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                                                    : 'border-slate-200 hover:border-pink-200 text-slate-600'
                                                    }`}
                                            >
                                                <div className="p-2 bg-white rounded-full shadow-sm" >
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <span className="font-bold">Female</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setModalStep(2)}
                                            className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleAddPerson}
                                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all"
                                        >
                                            Save Profile

                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar-light::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar-light::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-light::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                .mask-linear-fade {
                    mask-image: linear-gradient(to right, black 85%, transparent 100%);
                }
                .vedastro-html-content h1, .vedastro-html-content h2, .vedastro-html-content h3 {
                    color: #1a365d;
                    font-weight: 800;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                
                .vedastro-html-content p {
                    margin-bottom: 1rem;
                    line-height: 1.7;
                    font-weight: 400;
                }

                .vedastro-html-content strong {
                    color: #2b6cb0;
                    font-weight: 700;
                }

                .vedastro-html-content ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }

                .vedastro-html-content li {
                    margin-bottom: 0.5rem;
                }

                @keyframes reveal {
                    from { 
                        opacity: 0; 
                        transform: translateY(10px); 
                        clip-path: inset(0 100% 0 0);
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                        clip-path: inset(0 0 0 0);
                    }
                }

                .typing-reveal {
                    animation: reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default AIAstrologer;
