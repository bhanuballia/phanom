import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatbotAPI } from '../services/api';
import { BrowserDetector, CrossBrowserUtils } from '../utils/browserCompatibility';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  ChevronRight,
  Plus,
  ArrowRight,
  Settings,
  HelpCircle,
  Info
} from 'lucide-react';

const AIChatbot = () => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage if available
    try {
      const savedMessages = localStorage.getItem('swamini_chat_history');
      if (savedMessages && savedMessages !== 'undefined') {
        return JSON.parse(savedMessages);
      }
    } catch (e) {
      console.error('Error parsing chat history:', e);
    }
    return [];
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [popularQuestions, setPopularQuestions] = useState([
    "What is my Sun sign?",
    "How is my career looking?",
    "Tell me about my day.",
    "Compatibility check?",
    "Is today good for money?",
    "What is a Kundali?"
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('swamini_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Load relevant data on component mount
  useEffect(() => {
    fetchPopularQuestions();

    // Create personalized welcome message if no history exists
    if (messages.length === 0 && !hasWelcomed) {
      createWelcomeMessage();
    }
  }, []);

  // Create personalized welcome message
  const createWelcomeMessage = () => {
    const userName = user?.name || 'मित्र';
    const welcomeText = `🙏 नमस्ते ${userName} जी! मैं स्वामिनी हूँ। आपकी ज्योतिषीय यात्रा में मैं आपकी किस प्रकार सहायता कर सकती हूँ?`;

    const categoryText = `आप मुझसे इन विषयों पर चर्चा कर सकते हैं:
    
- ✨ **ज्योतिषीय मार्गदर्शन** (राशिफल, जन्मपत्री)
- 📅 **पंचांग और शुभ समय** (मुहूर्त, त्यौहार)
- 💎 **उपाय और रत्न** (मंत्र, दान)
- 💼 **करियर और समृद्धि** (शिक्षा, व्यापार)

नीचे दिए गए सुझावों पर क्लिक करें या अपना प्रश्न टाइप करें। 🤖`;

    const welcomeMessage = {
      id: Date.now(),
      text: welcomeText,
      isBot: true,
      timestamp: new Date(),
      isWelcome: true
    };

    const categoryMessage = {
      id: Date.now() + 1,
      text: categoryText,
      isBot: true,
      timestamp: new Date(),
      isCategoryInfo: true
    };

    setMessages([welcomeMessage, categoryMessage]);
    setHasWelcomed(true);
  };

  const fetchPopularQuestions = async () => {
    try {
      const response = await chatbotAPI.getPopularQuestions();
      if (response.data?.questions) {
        setPopularQuestions(response.data.questions);
      }
    } catch (error) {
      console.error('Error fetching popular questions:', error);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isSearching]);

  // AI Response using backend API
  const getAIResponse = async (userMessage) => {
    try {
      let response;
      if (isAuthenticated && user) {
        response = await chatbotAPI.sendMessageWithContext(userMessage);
      } else {
        response = await chatbotAPI.sendMessage(userMessage);
      }
      return response.data.response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "🙏 क्षमा करें, मुझे कुछ तकनीकी समस्या हो रही है। कृपया बाद में कोशिश करें।";
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: textToSend,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setShowSuggestions(false);

    const searchTriggers = ['latest', 'current', 'today', '2025', 'recent', 'detailed', 'विस्तृत'];
    const mightSearch = searchTriggers.some(trigger => textToSend.toLowerCase().includes(trigger));

    if (mightSearch) {
      setIsSearching(true);
    } else {
      setIsTyping(true);
    }

    try {
      const aiResponseText = await getAIResponse(textToSend);
      const botMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      setIsSearching(false);
    } catch (error) {
      setIsTyping(false);
      setIsSearching(false);
      const errorMessage = {
        id: Date.now() + 1,
        text: '⚠️ कुछ तकनीकी समस्या हो रही है। कृपया पुनः प्रयास करें।',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Glassmorphism Styles
  const glassStyles = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-gradient-to-br from-red-600 via-rose-500 to-amber-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center group"
          >
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            className="w-[400px] h-[650px] rounded-[2.5rem] flex flex-col overflow-hidden relative"
            style={glassStyles}
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-red-600/80 via-rose-500/80 to-amber-500/80 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-2xl overflow-hidden border border-white/30 shadow-xl bg-white/20 p-1"
                >
                  <img src="/artifacts/spiritual_ai_mascot.png" alt="Swamini" className="w-full h-full object-cover rounded-xl" />
                </motion.div>
                <div>
                  <h3 className="text-white font-bold text-lg">स्वामिनी प्रो</h3>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse transition-all"></span>
                    <span className="text-white/80 text-xs">आपकी आध्यात्मिक गाइड</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
              {messages.map((message) => (
                <motion.div
                  initial={{ opacity: 0, x: message.isBot ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl ${message.isBot
                    ? 'bg-white/90 text-gray-800 rounded-tl-none border border-red-100 shadow-sm'
                    : 'bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-tr-none shadow-md'
                    }`}>
                    <div className="prose prose-sm prose-red max-w-none">
                      {message.isBot ? (
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      ) : (
                        <p>{message.text}</p>
                      )}
                    </div>
                    <p className="text-[10px] mt-1 opacity-50 text-right">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {(isTyping || isSearching) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl rounded-tl-none flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 bg-red-500 rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-red-600 font-medium">
                      {isSearching ? 'खोज रही हूँ...' : 'स्वामिनी टाइप कर रही है...'}
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {popularQuestions.length > 0 && !isTyping && !isSearching && (
              <div className="px-6 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex space-x-2">
                {popularQuestions.slice(0, 6).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(typeof q === 'string' ? q : q.question)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs rounded-full transition-all duration-300"
                  >
                    {typeof q === 'string' ? q : q.question}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-6">
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="यहाँ अपना प्रश्न पूछें..."
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none transition-all pr-12"
                  rows={2}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isTyping || isSearching}
                  className="absolute right-3 bottom-4 p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <div className="text-[10px] text-white/30 mt-3 text-center flex items-center justify-center space-x-1">
                <Info className="h-3 w-3" />
                <span>स्वामिनी AI आपके आध्यात्मिक मार्गदर्शन के लिए सदैव तत्पर है</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatbot;
