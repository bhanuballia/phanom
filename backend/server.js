const express = require('express');
const mongoose = require('mongoose');

// CRITICAL DEBUG: Catch specific crashes
process.on('uncaughtException', (err) => {
  console.error('CRITICAL UNCAUGHT EXCEPTION:', err);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL UNHANDLED REJECTION:', reason);
});
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const kundaliRoutes = require('./routes/kundali');
const kundaliMatchingRoutes = require('./routes/kundaliMatching');
const adminRoutes = require('./routes/admin');
const chatbotRoutes = require('./routes/chatbot');
const ugcVideoRoutes = require('./routes/ugcVideos');
const n8nVideoRoutes = require('./routes/n8nVideos');
const astrologerRoutes = require('./routes/astrologer');
const shoppingRoutes = require('./routes/shopping');
const palmistryRoutes = require('./routes/palmistry');
const liveChatRoutes = require('./routes/liveChat');
const geoRoutes = require('./routes/geo');
const auditRoutes = require('./routes/audit');
const LiveChatMessage = require('./models/LiveChatMessage');
const axios = require('axios');


// Initialize Express app
const app = express();

// Trust Vercel proxy for rate-limiting and secure cookies
app.set('trust proxy', 1);


// Create HTTP server
const server = http.createServer(app);

// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://astroconsult-r6cluanhe-bhanuballias-projects.vercel.app',
  'https://astrology-astrologer-56eitr621-bhanuballias-projects.vercel.app',
  'https://astrology-astrologer-92aupe02v-bhanuballias-projects.vercel.app',
  'https://astrology-astrologer-ceun2zhka-bhanuballias-projects.vercel.app',
  'https://astrology-astrologer-mpug66wh3-bhanuballias-projects.vercel.app',
  'https://astrology-astrologer-pcpj3nqwm-bhanuballias-projects.vercel.app',
  'https://astrologer-m0mrp6zfx-bhanuballias-projects.vercel.app',
  'https://astrology-run-frontend.onrender.com',
  'https://astrologer-astroconsult-dashboard.onrender.com',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [])
];


// Initialize Socket.io only if not in serverless environment
let io = null;
if (process.env.VERCEL || process.env.NOW_REGION) {
  console.log('Serverless environment detected, skipping persistent Socket.io initialization');
} else {
  io = socketIo(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
}


// 1. MANUAL CORS MIDDLEWARE (MUST BE FIRST)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

  if (req.method === 'OPTIONS') {
    console.log(`CORS Preflight: ${req.method} ${req.url} from ${origin}`);
    return res.status(204).end();
  }
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// MongoDB connection
const connectDB = async () => {
  try {
    // In production, do not attempt to connect to localhost
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI is not set in production. Skipping DB connection.');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astrology');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('⚠️  Warning: MongoDB not available. Some features may not work.');
    console.log('💡 Chatbot will still work without database.');
  }
};

connectDB();

// Validation function for chat messages
const validateChatMessage = async (message) => {
  const lowerMessage = message.toLowerCase();

  // Helper: Comprehensive contact info decoder
  const decodeObfuscatedText = (text) => {
    let clean = text.toLowerCase().trim();

    // 1. Base64 Decoder
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    if (clean.length >= 8 && base64Regex.test(clean)) {
      try {
        const decoded = Buffer.from(clean, 'base64').toString('utf8');
        if (decoded && decoded !== clean) {
          clean += " " + decoded.toLowerCase();
        }
      } catch (e) {}
    }

    // 2. Hex Decoder
    const hexClean = clean.replace(/0x/g, '').replace(/[\s,]+/g, '');
    if (/^[0-9a-f]{10,}$/i.test(hexClean) && hexClean.length % 2 === 0) {
      try {
        const decoded = Buffer.from(hexClean, 'hex').toString('utf8');
        if (decoded) {
          clean += " " + decoded.toLowerCase();
        }
      } catch (e) {}
    }

    // 3. Binary Decoder
    const binaryWords = clean.split(/[\s,.-]+/);
    if (binaryWords.length >= 5 && binaryWords.every(w => /^[01]{1,8}$/.test(w))) {
      try {
        const decoded = binaryWords.map(w => String.fromCharCode(parseInt(w, 2))).join('');
        if (decoded) {
          clean += " " + decoded.toLowerCase();
        }
      } catch (e) {}
    }

    // 4. Morse Code Decoder
    const morseMap = {
      '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
      '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9'
    };
    const morseWords = clean.split(/[\s/]+/);
    if (morseWords.length >= 5 && morseWords.every(w => w in morseMap || w === '')) {
      const decoded = morseWords.map(w => morseMap[w] || '').join('');
      if (decoded.length >= 5) {
        clean += " " + decoded;
      }
    }

    // 5. Emoji & Word Numbers & Devanagari Hindi & NATO phonetic alphabet
    const emojiDigits = {
      '0️⃣': '0', '1️⃣': '1', '2️⃣': '2', '3️⃣': '3', '4️⃣': '4', '5️⃣': '5', '6️⃣': '6', '7️⃣': '7', '8️⃣': '8', '9️⃣': '9',
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
      'niner': '9', 'fife': '5',
      // Devanagari Hindi spelling
      'शून्य': '0', 'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4', 'पाँच': '5', 'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9',
      'shunya': '0', 'ek': '1', 'do': '2', 'teen': '3', 'chaar': '4', 'paanch': '5', 'chhe': '6', 'saat': '7', 'aath': '8', 'nau': '9',
      'shoonya': '0', 'char': '4',
      // Roman numerals for single digits
      'viii': '8', 'vii': '7', 'iii': '3', 'viii': '8', 'ii': '2', 'iv': '4', 'vi': '6', 'ix': '9', 'i': '1', 'v': '5', 'x': '0'
    };
    for (const [key, value] of Object.entries(emojiDigits)) {
      clean = clean.replace(new RegExp(key, 'g'), value);
    }

    // 6. Repeated digits parser: "double nine" -> "99", "triple five" -> "555"
    const repeatWords = {
      'double': 2, 'triple': 3, 'quadruple': 4,
      'doobla': 2, 'tripla': 3
    };
    for (const [rep, count] of Object.entries(repeatWords)) {
      const regex = new RegExp(`\\b${rep}\\s*(\\d)`, 'g');
      clean = clean.replace(regex, (_, digit) => digit.repeat(count));
    }

    // 7. Vanity Keypad Letters translation
    const hasContactKeyword = /\b(phone|call|number|mobile|contact|dial|wa|whatsapp|telegram|insta|fb|ig)\b/i.test(clean);
    const hasAnyDigit = /\d/.test(clean);
    
    let keypadDigits = '';
    if (hasContactKeyword || hasAnyDigit) {
      const keypad = {
        'a': '2', 'b': '2', 'c': '2', 'd': '3', 'e': '3', 'f': '3',
        'g': '4', 'h': '4', 'i': '4', 'j': '5', 'k': '5', 'l': '5',
        'm': '6', 'n': '6', 'o': '6', 'p': '7', 'q': '7', 'r': '7', 's': '7',
        't': '8', 'u': '8', 'v': '8', 'w': '9', 'x': '9', 'y': '9', 'z': '9'
      };
      
      const tokens = clean.split(/[\s\-().,]+/);
      let wordsSinceKeyword = 999;
      
      const translatedTokens = tokens.map(token => {
        if (/\b(phone|call|number|mobile|contact|dial|wa|whatsapp|telegram|insta|fb|ig)\b/i.test(token)) {
          wordsSinceKeyword = 0;
          return token;
        }
        wordsSinceKeyword++;
        if (/\d/.test(token) || wordsSinceKeyword <= 3) {
          return token.split('').map(char => keypad[char] || char).join('');
        }
        return token;
      });
      
      keypadDigits = translatedTokens.join('').replace(/\D/g, '');
    }
    
    const normalDigits = clean.replace(/\D/g, '');

    return { clean, normalDigits, keypadDigits };
  };

  // 1. Phone number check (standard + obfuscated sequences)
  const phonePatterns = [
    /\b\d{10}\b/, // 10 digits
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // US format
    /\b\+?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/, // International
    /\b\d{5}[-.\s]?\d{5}\b/, // Indian format
    /\b(phone|call|number|mobile|contact)[\s:]*\d/i
  ];

  for (const pattern of phonePatterns) {
    if (pattern.test(message)) {
      return { isValid: false, violationType: 'phone number' };
    }
  }

  // Check digit sequence after translation of words & stripping layout spaces/dashes
  const { normalDigits, keypadDigits } = decodeObfuscatedText(message);
  if (normalDigits.length >= 10 || keypadDigits.length >= 10) {
    return { isValid: false, violationType: 'phone number' };
  }

  // 2. Email patterns (standard + obfuscated e.g. "user[at]domain(dot)com")
  const emailPatterns = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    /\b(email|mail|gmail|yahoo|hotmail|outlook)[\s:]*[A-Za-z0-9._%+-]*@?[A-Za-z0-9.-]*\b/i,
    // Obfuscated emails: e.g., "user at domain dot com", "user[at]domain(dot)com"
    /[A-Za-z0-9._%+-]+\s*([@]|\[at\]|\(at\)|\bat\b)\s*[A-Za-z0-9.-]+\s*([.]|\[dot\]|\(dot\)|\bdot\b)\s*[A-Za-z]{2,}/i
  ];

  for (const pattern of emailPatterns) {
    if (pattern.test(message)) {
      return { isValid: false, violationType: 'email address' };
    }
  }

  // 3. WhatsApp patterns
  const whatsappPatterns = [
    /\b(whatsapp|whats app|wa|watsapp)\b/i,
    /\b(whatsapp|whats app|wa)[\s:]*\+?\d/i
  ];

  for (const pattern of whatsappPatterns) {
    if (pattern.test(message)) {
      return { isValid: false, violationType: 'WhatsApp contact' };
    }
  }

  // 4. Instagram patterns
  const instagramPatterns = [
    /\b(instagram|insta|ig)\b/i,
    /\b@[A-Za-z0-9._]+\b/,
    /\b(instagram|insta|ig)[\s:]*[A-Za-z0-9._]/i
  ];

  for (const pattern of instagramPatterns) {
    if (pattern.test(message)) {
      return { isValid: false, violationType: 'Instagram ID' };
    }
  }

  // 5. Facebook patterns
  const facebookPatterns = [
    /\b(facebook|fb|face book)\b/i,
    /\bfacebook\.com\b/i,
    /\b(facebook|fb)[\s:]*[A-Za-z0-9._]/i
  ];

  for (const pattern of facebookPatterns) {
    if (pattern.test(message)) {
      return { isValid: false, violationType: 'Facebook profile' };
    }
  }

  // 6. Telegram, Discord & other handle patterns
  const telegramPatterns = [
    /\b(telegram|tele|tg|discord|dc)\b/i,
    /\b(t\s*\.\s*me|t\(dot\)me|telegram\.me)\b/i,
    /\b(telegram|tele|tg|discord|dc)[\s:]*[A-Za-z0-9._]/i
  ];

  for (const pattern of telegramPatterns) {
    if (pattern.test(message)) {
      return { isValid: false, violationType: 'Telegram/Discord handle' };
    }
  }

  // --- GOOGLE PERSPECTIVE API MODERATION ---
  const apiKey = process.env.PERSPECTIVE_API_KEY;
  if (apiKey) {
    try {
      const response = await axios.post(
        `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`,
        {
          comment: { text: message },
          languages: ["en", "hi"],
          requestedAttributes: {
            TOXICITY: {},
            INSULT: {},
            PROFANITY: {},
            SEXUALLY_EXPLICIT: {},
            IDENTITY_ATTACK: {}
          }
        }
      );

      const scores = response.data.attributeScores;
      const threshold = 0.7; // Profanity & abuse threshold

      if (scores.TOXICITY?.summaryScore?.value > threshold) {
        return { isValid: false, violationType: 'toxic content' };
      }
      if (scores.INSULT?.summaryScore?.value > threshold) {
        return { isValid: false, violationType: 'insulting language' };
      }
      if (scores.PROFANITY?.summaryScore?.value > threshold) {
        return { isValid: false, violationType: 'profanity' };
      }
      if (scores.SEXUALLY_EXPLICIT?.summaryScore?.value > threshold) {
        return { isValid: false, violationType: 'sexually explicit content' };
      }
      if (scores.IDENTITY_ATTACK?.summaryScore?.value > threshold) {
        return { isValid: false, violationType: 'identity attack / defamation' };
      }
    } catch (apiError) {
      console.error('Error calling Google Perspective API:', apiError.response?.data || apiError.message);
      // Fallback: let the message proceed on API error to avoid completely breaking chat
    }
  }

  return { isValid: true };
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Astrology Backend is running', status: 'active' });
});
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/kundali', kundaliRoutes);
app.use('/api/kundali-matching', kundaliMatchingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/ugc-videos', ugcVideoRoutes);
app.use('/api/n8n-videos', n8nVideoRoutes);
app.use('/api/astrologer', astrologerRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/palmistry', palmistryRoutes);
app.use('/api/live-chat', liveChatRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/audit', auditRoutes);


// Serve uploaded files - ensure paths work in Vercel
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Static folder is already covered by global CORS middleware at the top level

// Socket.io for video chat (only if initialized)
if (io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room for video chat
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', userId);
      console.log(`User ${userId} joined room ${roomId}`);

      // Handle user disconnect
      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId);
        console.log(`User ${userId} disconnected from room ${roomId}`);
      });
    });

    // Handle video call signals
    socket.on('offer', (data) => {
      socket.to(data.roomId).emit('offer', data);
    });

    socket.on('answer', (data) => {
      socket.to(data.roomId).emit('answer', data);
    });

    socket.on('ice-candidate', (data) => {
      socket.to(data.roomId).emit('ice-candidate', data);
    });

    socket.on('end-call', (roomId) => {
      socket.to(roomId).emit('call-ended');
    });

    // Handle chat messages with validation
    socket.on('chat-message', async (data) => {
      const { roomId, message } = data;

      // Validate message for personal information
      const validationResult = await validateChatMessage(message.text);

      if (!validationResult.isValid) {
        // Send violation notice back to sender only
        socket.emit('chat-violation', {
          violationType: validationResult.violationType,
          originalMessage: message.text
        });
        return;
      }

      // If message is valid, broadcast to all users in room
      io.to(roomId).emit('chat-message', message);
    });

    // --- LIVE CHAT (REAL PERSON) CHANNELS ---

    // Join a private chat room between user and astrologer
    socket.on('join-live-chat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined private live chat room: ${chatId}`);
    });

    // Handle WebRTC signaling for live chat audio
    socket.on('live-chat-signaling', (data) => {
      const { chatId, eventType, payload } = data;
      socket.to(chatId).emit('live-chat-signaling', { eventType, payload });
    });


    // Handle persistent live chat messages
    socket.on('send-live-message', async (data) => {
      const { senderId, receiverId, text, chatId, attachments } = data;

      // Validate message content if text is present
      if (text) {
        const validationResult = await validateChatMessage(text);
        if (!validationResult.isValid) {
          socket.emit('live-chat-violation', {
            violationType: validationResult.violationType,
            originalMessage: text
          });
          return;
        }
      }

      try {
        // 1. Save to Database for history & admin access
        const newMessageOptions = {
          sender: senderId,
          receiver: receiverId,
          chatId: chatId
        };

        if (text) newMessageOptions.message = text;
        if (attachments) newMessageOptions.attachments = attachments;

        const newMessage = new LiveChatMessage(newMessageOptions);
        const savedMessage = await newMessage.save();

        // 2. Populate sender info for the frontend
        const populatedMessage = await LiveChatMessage.findById(savedMessage._id)
          .populate('sender', 'name profilePicture');

        // 3. Broadcast to the specific chat room
        io.to(chatId).emit('receive-live-message', populatedMessage);

        // 4. Also notify the receiver directly (in case they are not in the room)
        const notificationText = text
          ? (text.substring(0, 50) + (text.length > 50 ? '...' : ''))
          : (attachments && attachments.length > 0 ? `Sent ${attachments.length} attachment(s)` : 'New message');

        socket.to(receiverId).emit('new-message-notification', {
          senderId,
          text: notificationText,
          chatId
        });

      } catch (error) {
        console.error('Error saving live chat message:', error);
        socket.emit('live-chat-error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('mark-as-read', async (chatId) => {
      try {
        await LiveChatMessage.updateMany(
          { chatId, isRead: false },
          { $set: { isRead: true } }
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });
  });
} else {

  console.log('Socket.io not active in this instance');
}


const PORT = process.env.PORT || 5000;

// Serve astrologer portal static files only in LOCAL environment
if (process.env.NODE_ENV === 'production') {
  console.log('Production mode: Static serving is handled by Vercel rewrites');
} else {
  app.use('/astrologer', express.static(path.join(__dirname, '../astrologer/dist')));
}

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }

  console.error('Unhandled Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export app for Vercel
module.exports = app;

// Only start listening if run directly (local dev or standalone)
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}