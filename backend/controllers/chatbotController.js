const User = require('../models/User');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize cache directory
const os = require('os');

// Initialize cache directory
// On Vercel (read-only FS), use /tmp
const CACHE_DIR = process.env.NODE_ENV === 'production'
  ? path.join(os.tmpdir(), 'astrology-cache')
  : path.join(__dirname, '..', 'cache');

try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR);
  }
} catch (err) {
  console.warn('Failed to create cache directory, caching disabled:', err.message);
}

// Helper to get normalized VedAstro API URL
const getVedAstroApiUrl = () => {
  let url = process.env.VEDASTRO_API_URL || 'https://vedastroapi.azurewebsites.net/api/Calculate';

  // If it's a local address and doesn't have the Azure Functions suffix, add it
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    if (!url.includes('/api/Calculate')) {
      // Remove trailing slash if any
      url = url.replace(/\/+$/, '');
      url = `${url}/api/Calculate`;
    }
  }
  return url;
};

// Function to generate a cache file path for queries
const generateCacheFilePath = (query) => {
  // Create a safe filename from the query
  const safeQuery = query.toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F]/g, '_') // Keep Hindi characters and alphanumeric
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .substring(0, 100); // Limit length

  return path.join(CACHE_DIR, `${safeQuery}.json`);
};

// Function to get response from file cache
const getFromCache = (query) => {
  try {
    const cacheFilePath = generateCacheFilePath(query);
    if (fs.existsSync(cacheFilePath)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));

      // Check if cache is still valid (less than 7 days old)
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (cacheData.timestamp > oneWeekAgo) {
        console.log(`✅ Found cached response for query: ${query}`);
        return cacheData.response;
      } else {
        // Remove expired cache file
        fs.unlinkSync(cacheFilePath);
        console.log(`🗑️ Removed expired cache for query: ${query}`);
      }
    }
    return null;
  } catch (error) {
    console.log('❌ Error reading from cache:', error.message);
    return null;
  }
};

// Function to save response to file cache
const saveToCache = (query, response) => {
  try {
    const cacheFilePath = generateCacheFilePath(query);
    const cacheData = {
      response: response,
      timestamp: Date.now(),
      query: query
    };
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2));
    console.log(`✅ Saved response to cache for query: ${query}`);
  } catch (error) {
    console.log('❌ Error saving to cache:', error.message);
  }
};

// Function to clean old cache entries
// Function to clean old cache entries
const cleanCache = () => {
  try {
    if (!fs.existsSync(CACHE_DIR)) return;

    const files = fs.readdirSync(CACHE_DIR);
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(CACHE_DIR, file);
        try {
          // Check if file still exists before stat (race condition protection)
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);

            if (stats.mtime.getTime() < oneWeekAgo) {
              fs.unlinkSync(filePath);
              console.log(`🧹 Cleaned old cache file: ${file}`);
            }
          }
        } catch (fileErr) {
          // Ignore individual file errors
          console.log(`⚠️ Skiping cache file cleanup for ${file}:`, fileErr.message);
        }
      }
    });
  } catch (error) {
    console.log('❌ Error cleaning cache:', error.message);
  }
};

// Clean cache on startup
cleanCache();

// Initialize Gemini AI
// Initialize Gemini AI
let genAI = null;
let model = null;

try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use an available model with Google Search grounding enabled
    model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      tools: [{ googleSearch: {} }]
    });
    console.log('✅ Gemini AI initialized with Google Search grounding');
  } else {
    console.warn('⚠️ GEMINI_API_KEY is not set. Chatbot AI features will be limited.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error.message);
}

// Enhanced AI Knowledge Base in Hindi
const knowledgeBase = {
  // Greetings and common phrases
  greetings: {
    keywords: ['नमस्ते', 'नमस्कार', 'राम राम', 'हैलो', 'हाई', 'सत श्री अकाल', 'नमस्कार', 'hello', 'hi'],
    responses: [
      "🙏 नमस्ते! मैं आपका डिजिटल ज्योतिष गुरु हूं। आपकी कैसे सेवा कर सकता हूं?",
      "🕉 राम राम! आपका स्वागत है। मैं यहाँ आपकी ज्योतिषीय जिज्ञासाओं का समाधान करने के लिए हूं।",
      "🙏 जय श्री राम! आपको कैसी सहायता चाहिए? आप मुझसे ज्योतिष, कुंडली, और आध्यात्म के बारे में पूछ सकते हैं।"
    ]
  },

  // Astrology related queries
  astrology: {
    keywords: ['ज्योतिष', 'astrology', 'राशि', 'zodiac', 'भविष्यफल', 'horoscope', 'ग्रह', 'planet', 'राशिफल', 'prediction'],
    responses: [
      "🌟 ज्योतिष शास्त्र हमारे पूर्वजों का दिया गया अनमोल खजाना है। यह ग्रहों की स्थिति के आधार पर जीवन के विभिन्न पहलुओं को समझने में मदद करता है।",
      "⭐ वैदिक ज्योतिष में 12 राशियां हैं - मेष से मीन तक। प्रत्येक राशि की अपनी विशेषताएं और गुण होते हैं।",
      "🔮 ज्योतिष के मुख्य अंग हैं - राशि चक्र, भाव चक्र, नक्षत्र, और ग्रहों की स्थिति। ये सभी मिलकर आपके जीवन की कहानी कहते हैं।"
    ]
  },

  // Kundali and birth chart
  kundali: {
    keywords: ['कुंडली', 'kundali', 'जन्मपत्री', 'birth chart', 'होरोस्कोप', 'जन्म कुंडली', 'birth chart', 'horoscope'],
    responses: [
      "📜 कुंडली आपके जन्म के समय आकाश में ग्रहों की स्थिति का मानचित्र है। यह आपके व्यक्तित्व, स्वभाव, और भविष्य के बारे में बताती है।",
      "🎯 हमारे कुंडली पेज पर जाकर आप अपनी विस्तृत जन्म कुंडली बनवा सकते हैं। यह हिंदी में तैयार की जाएगी और आपके ईमेल पर भेजी जाएगी।",
      "✨ कुंडली में 12 भाव होते हैं - धन, पराक्रम, सुख, पुत्र, शत्रु, कलत्र, मृत्यु, भाग्य, कर्म, लाभ, और व्यय। प्रत्येक भाव जीवन के अलग पहलू को दर्शाता है।"
    ]
  },

  // Appointment booking
  appointment: {
    keywords: ['अपॉइंटमेंट', 'appointment', 'बुकिंग', 'booking', 'मिलना', 'परामर्श', 'consultation', 'meeting', 'schedule'],
    responses: [
      "📅 हमारे अनुभवी ज्योतिषियों से मिलने के लिए 'बुकिंग अपॉइंटमेंट' पेज पर जाएं। वहां आप अपना समय और पसंदीदा ज्योतिषी चुन सकते हैं।",
      "💻 वीडियो कॉल के माध्यम से घर बैठे परामर्श लें। हमारे पास अलग-अलग विशेषज्ञताओं वाले ज्योतिषी उपलब्ध हैं।",
      "⏰ अपॉइंटमेंट से पहले आपको ईमेल और SMS के माध्यम से रिमाइंडर भेजे जाएंगे ताकि आप अपना समय न भूलें।"
    ]
  },

  // Gemstones and remedies
  gemstones: {
    keywords: ['रत्न', 'gemstone', 'पत्थर', 'stone', 'मूंगा', 'पुखराज', 'हीरा', 'माणिक', 'remedy', 'उपाय'],
    responses: [
      "💎 रत्न पहनना एक प्रभावी उपाय है। मूंगा (मंगल), पुखराज (बृहस्पति), हीरा (शुक्र), माणिक (सूर्य) - प्रत्येक रत्न अलग ग्रह का प्रतिनिधित्व करता है।",
      "⚠️ रत्न पहनने से पहले किसी योग्य ज्योतिषी से सलाह लेना आवश्यक है। गलत रत्न नुकसान भी कर सकता है।",
      "🌈 नवरत्न में सभी 9 ग्रहों के रत्न होते हैं। यह संपूर्ण सुरक्षा प्रदान करता है और सभी ग्रहों का सकारात्मक प्रभाव देता है।"
    ]
  },

  // Mantras and spirituality
  mantras: {
    keywords: ['मंत्र', 'mantra', 'जाप', 'chanting', 'प्रार्थना', 'पूजा', 'आरती', 'aarti', 'chant', 'ॐ', 'om'],
    responses: [
      "🕉 'ॐ गं गणपतये नमः' - विघ्न हर्ता गणेश जी का यह मंत्र सभी कामों में सफलता दिलाता है। प्रतिदिन 108 बार जपें।",
      "🙏 'ॐ नमः शिवाय' - यह पंचाक्षर महामंत्र है। इसके जाप से मन की शांति और आत्मा की शुद्धता मिलती है।",
      "☀️ 'ॐ घृणि सूर्य आदित्य' - सूर्य मंत्र सुबह सूर्योदय के समय जपने से स्वास्थ्य और तेज मिलता है।"
    ]
  },

  // Gayatri Mantra - Special category
  gayatri: {
    keywords: ['गायत्री', 'gayatri', 'गायत्री मंत्र', 'gayatri mantra', 'महामंत्र', 'mahamantra', 'ॐ भूर्भुवः'],
    responses: [
      "🕉 गायत्री महामंत्र:\n\n'ॐ भूर्भुवः स्वः।\nतत्सवितुर्वरेण्यं।\nभर्गो देवस्य धीमहि।\nधियो यो नः प्रचोदयात्॥'\n\n🌅 इस महामंत्र का अर्थ: हे प्रभु! आप सभी लोकों के स्वामी, जीवनदाता, दुःखनाशक और सुखकर्ता हैं। आप सर्वश्रेष्ठ और पूजनीय हैं। आपकी तेजस्वी शक्ति है। हमारी बुद्धि को सन्मार्ग पर चलाइए।\n\n⏰ सुबह, दोपहर और शाम को इसका जाप करना श्रेष्ठ माना जाता है।"
    ]
  },

  // Vrat and festivals
  festivals: {
    keywords: ['व्रत', 'vrat', 'त्योहार', 'festival', 'पूर्णिमा', 'अमावस्या', 'एकादशी', 'navratri', 'दीपावली', 'दिवाली', 'होली', 'दशहरा', 'शिवरात्रि', 'जन्माष्टमी', 'कार्तिक', 'श्रावण', 'आषाढ़'],
    responses: [
      "🌕 पूर्णिमा का दिन अत्यंत शुभ माना जाता है। इस दिन व्रत रखना और चंद्रमा की पूजा करना लाभकारी होता है।",
      "🌑 अमावस्या के दिन पितृ पूजा और दान-धर्म का विशेष महत्व है। इस दिन दीप जलाने से नकारात्मक ऊर्जा दूर होती है।",
      "🙏 एकादशी व्रत भगवान विष्णु को अत्यंत प्रिय है। इस दिन व्रत रखने से पापों का नाश और मोक्ष की प्राप्ति होती है।"
    ]
  },

  // Career and education
  career: {
    keywords: ['करियर', 'career', 'नौकरी', 'job', 'व्यापार', 'business', 'पढ़ाई', 'education', 'work', 'employment', 'profession'],
    responses: [
      "💼 करियर के लिए 10वां भाव (कर्म स्थान) सबसे महत्वपूर्ण है। इसमें स्थित ग्रह आपके पेशे की दिशा बताते हैं।",
      "📚 पढ़ाई के लिए बुध ग्रह और 4वां भाव (विद्या स्थान) देखा जाता है। सरस्वती मंत्र का जाप पढ़ाई में सफलता दिलाता है।",
      "🏢 व्यापार के लिए 7वां भाव और शुक्र ग्रह की स्थिति महत्वपूर्ण है। गणेश जी की पूजा व्यापार में वृद्धि करती है।"
    ]
  },

  // Health and wellness
  health: {
    keywords: ['स्वास्थ्य', 'health', 'बीमारी', 'illness', 'आयु', 'लंबी उम्र', 'योग', 'yoga', 'wellness', 'fitness'],
    responses: [
      "🏥 स्वास्थ्य के लिए 6वां भाव (रोग स्थान) और 8वां भाव (आयु स्थान) देखा जाता है। मंगल ग्रह शारीरिक शक्ति देता है।",
      "🧘‍♂️ योग और प्राणायाम करना, सूर्य नमस्कार करना स्वास्थ्य के लिए बहुत लाभकारी है। महामृत्युंजय मंत्र का जाप करें।",
      "🌿 आयुर्वेदिक उपचार और सात्विक भोजन लेना स्वास्थ्य के लिए अच्छा होता है। तुलसी की पूजा करने से रोग प्रतिरोधक क्षमता बढ़ती है।"
    ]
  },

  // Marriage and relationships
  marriage: {
    keywords: ['शादी', 'marriage', 'विवाह', 'रिश्ता', 'relationship', 'जीवनसाथी', 'पति', 'पत्नी', 'love', 'partner'],
    responses: [
      "💑 विवाह के लिए 7वां भाव (कलत्र स्थान) सबसे महत्वपूर्ण है। शुक्र ग्रह प्रेम और विवाह का कारक है।",
      "👫 गुण मिलान में 36 गुणों का मेल देखा जाता है। कम से कम 18 गुण मिलना आवश्यक माना जाता है।",
      "🙏 मंगल दोष की समस्या है तो हनुमान जी की पूजा करें। मंगलवार को हनुमान चालीसा का पाठ करना लाभकारी है।"
    ]
  },

  // Panchang and calendar
  panchang: {
    keywords: ['पंचांग', 'panchang', 'तिथि', 'tithi', 'नक्षत्र', 'nakshatra', 'योग', 'करण', 'calendar', 'date'],
    responses: [
      "📅 पंचांग हिंदू पारंपरिक कैलेंडर है जो तिथि, नक्षत्र, योग और करण की जानकारी देता है। यह शुभ मुहूर्त निकालने में मदद करता है।",
      "🌞 पंचांग के अनुसार प्रत्येक दिन की शुभ-अशुभ समय की जानकारी होती है। यह धार्मिक और सांस्कृतिक कार्यों के लिए महत्वपूर्ण है।",
      "📜 पंचांग में चंद्रमा की स्थिति के आधार पर दिन की गणना की जाती है। यह सूर्य और चंद्रमा की गति को दर्शाता है।"
    ]
  },

  // Aarti and prayers
  aarti: {
    keywords: ['आरती', 'aarti', 'पूजा', 'puja', 'भजन', 'bhajan', 'stotra', 'chanting', 'prayer'],
    responses: [
      "🕯 आरती भगवान की पूजा का एक महत्वपूर्ण हिस्सा है। यह दीपक की सहायता से भगवान की पूजा करने की पद्धति है।",
      "🙏 हर आरती का अपना महत्व होता है - गणेश जी की आरती से विघ्न हरण होता है, लक्ष्मी जी की आरती से समृद्धि मिलती है।",
      "ॐ आरती करने से मन की शुद्धि होती है और भगवान की कृपा प्राप्त होती है।"
    ]
  },

  // Specific deities
  deities: {
    keywords: ['गणेश', 'ganesh', 'लक्ष्मी', 'lakshmi', 'विष्णु', 'vishnu', 'शिव', 'shiva', 'हनुमान', 'hanuman', 'दुर्गा', 'durga ji ki aarti', 'कृष्ण', 'krishna', 'राम', 'rama', 'साई बाबा', 'sai baba'],
    responses: [
      "🕯 भगवान गणेश की आरती:\n\n'जय गणेश, जय गणेश, जय गणेश देवा। माता जाकी पार्वती, पिता महादेवा॥\nएकदन्त, दयावन्त, चार भुजा धारी।\nमाथे पर तिलक सोहे, मूस की सवारी॥\nजय गणेश, जय गणेश, जय गणेश देवा। माता जाकी पार्वती, पिता महादेवा॥\nअंधन को आँख देत, कोढ़िन को काया।\nबाँझिन को पुत्र देत, निर्धन को माया॥\nजय गणेश, जय गणेश, जय गणेश देवा। माता जाकी पार्वती, पिता महादेवा॥\nहार चढ़े, फूल चढ़े और चढ़े मेवा।\nलड्डूअन का भोग लगे, संत करें सेवा॥\nजय गणेश, जय गणेश, जय गणेश देवा। माता जाकी पार्वती, पिता महादेवा॥\nदीनन की लाज रखो, शम्भु सुतवारी।\nकामना को पूर्ण करो, जाऊं बलिहारी॥\nजय गणेश, जय गणेश, जय गणेश देवा। माता जाकी पार्वती, पिता महादेवा॥'",
      "💰 लक्ष्मी जी की आरती:\n\n'जय लक्ष्मी माता, जय लक्ष्मी माता।\nफूल-फल चढ़ावे, चढ़ावे मेवा।\nजय लक्ष्मी माता, जय लक्ष्मी माता॥\n\nजय लक्ष्मी माता, जय लक्ष्मी माता।\nसुख-सम्पत्ति देवे, देवे ज्ञान।\nजय लक्ष्मी माता, जय लक्ष्मी माता॥\n\nजय लक्ष्मी माता, जय लक्ष्मी माता।\nभक्ति-भाव सहित, करों ध्यान।\nजय लक्ष्मी माता, जय लक्ष्मी माता॥\n\nजय लक्ष्मी माता, जय लक्ष्मी माता।\nसब पाप हरें, हरें श्राप।\nजय लक्ष्मी माता, जय लक्ष्मी माता॥\n\nजय लक्ष्मी माता, जय लक्ष्मी माता।\nदुःख-दारिद्रय नाश, करों नाश।\nजय लक्ष्मी माता, जय लक्ष्मी माता॥\n\nजय लक्ष्मी माता, जय लक्ष्मी माता।\nप्रभुत्व प्रदान करो, करो प्रसाद।\nजय लक्ष्मी माता, जय लक्ष्मी माता॥'",
      "🌟 भगवान विष्णु जी की आरती:\n\n'ॐ जयन्तं जयन्तं जयन्तं विष्णुम्।\nॐ जयन्तं जयन्तं जयन्तं विष्णुम्॥\n\nशंख-चक्र-गदा-पद्म-धरं श्रीवत्स-वक्षस्थलम्।\nहलं हंसं वाहनं च विष्णुम्॥\n\nश्रीवत्स-लक्ष्मी-सहितं श्रीवत्स-लक्ष्मी-सनातनम्।\nश्रीवत्स-लक्ष्मी-वरं प्रणतो विष्णुम्॥\n\nअनंताय नमो नित्यं नारायण नमो नमः।\nअनंताय नमो नित्यं नारायण नमो नमः॥'",
      "🌙 भगवान शिव जी की आरती:\n\n'जय शिव जय शिव जय शिव महादेवा।\nजय शिव जय शिव जय शिव महादेवा॥\n\nत्रिनेत्र, चतुर्भुज, पिनाकी, शूली।\nअष्टमूर्ति भगवान, जय शिव महादेवा॥\n\nगंगा-जटा-धरी, भस्म-अंगी, धन्वी।\nनीलकण्ठ, त्रिलोचन, जय शिव महादेवा॥\n\nनंदी-वाहन, भूत-गण-सेवक।\nकैलाश-वासी, जय शिव महादेवा॥\n\nअनंत, अमल, अज, अपराजित।\nजय शिव महादेवा, जय शिव महादेवा॥'",
      "🛡️ देवी दुर्गा जी की आरती:\n\n'जय दुर्गे जय दुर्गे जय दुर्गे माता।\nजय दुर्गे जय दुर्गे जय दुर्गे माता॥\n\nशूल-चक्र-गदा-पाश-खड़ग-धरा शुभ्रा।\nअष्टभुजा देवी, जय दुर्गे माता॥\n\nसिंह-वाहना, ललाट-तिलक-श्रीमती।\nनवदुर्गा स्वरूप, जय दुर्गे माता॥\n\nमहाकाली, महालक्ष्मी, महासरस्वती।\nजय दुर्गे माता, जय दुर्गे माता॥\n\nअष्टमी-नवमी में, नवरात्रि में विशेष।\nजय दुर्गे माता, जय दुर्गे माता॥'",
      "💪 भगवान हनुमान जी की आरती:\n\n'जय हनुमान जय हनुमान जय हनुमाना।\nजय हनुमान जय हनुमान जय हनुमाना॥\n\nकपि-वाहन, महावीर, महाबल-धरी।\nराम-दूत, भक्ति-रस, जय हनुमाना॥\n\nपवन-पुत्र, महातेज, महाबुद्धि-धर।\nसंकट-हरण, मंगल-प्रद, जय हनुमाना॥\n\nराम-नाम-जपी, राम-भक्त, राम-सेवक।\nलंका-दहन, रावण-जित, जय हनुमाना॥\n\nअंजनी-तनय, महाबल, महावीर।\nजय हनुमाना, जय हनुमाना॥'",
      "🏹 भगवान श्री राम जी की आरती:\n\n'जय रघुवर जय रघुवर जय रघुवरा।\nजय रघुवर जय रघुवर जय रघुवरा॥\n\nमर्यादा-पुरुषोत्तम, धर्म-धुरंधर।\nअयोध्या-वासी, जय रघुवरा॥\n\nसीता-पति, लक्ष्मण-सहित, भरत-प्रिय।\nहनुमान-सेवक, जय रघुवरा॥\n\nरावण-वधी, धर्म-निधान, त्रिलोकेश।\nजय रघुवरा, जय रघुवरा॥'",
      " flute  भगवान कृष्ण जी की आरती:\n\n'जय जगदीश, जय जगदीश, जय जगदीश हरे।\nजय जगदीश, जय जगदीश, जय जगदीश हरे॥\n\nश्याम-गाति, वंशी-धर, मुरली-मोहन।\nगोकुल-वासी, जय जगदीश हरे॥\n\nरास-लीला, गोपी-जन-प्रिय, राधा-वल्लभ।\nमथुरा-नाथ, जय जगदीश हरे॥\n\nकंस-वधी, धर्म-रक्षक, भक्ति-प्रदाता।\nजय जगदीश हरे, जय जगदीश हरे॥'",
      " sai  साई बाबा की आरती:\n\n'जय साईनाथ, जय साईनाथ, जय साईनाथ।\nजय साईनाथ, जय साईनाथ, जय साईनाथ॥\n\nअनाथों के नाथ, सर्व-कल्याणकारी।\nशिरडी-वासी, जय साईनाथ॥\n\nभक्त-वत्सल, दयालु, सबके साईनाथ।\nमाता-पिता समान, जय साईनाथ॥\n\nऊँ साईं राम, ऊँ साईं राम, ऊँ साईं राम।\nजय साईनाथ, जय साईनाथ॥'",
      "ॐ विष्नु मंत्र: 'ॐ नमो भगवते वासुदेवाय' - यह मंत्र भगवान विष्णु को प्रसन्न करने में मदद करता है।"
    ]
  }
};

// Enhanced internet search using Gemini AI for Hindu religious content
const searchWithGemini = async (query) => {
  try {
    console.log('🤖 Starting Gemini AI search for:', query);

    // Define Hindu religious keywords to filter searches
    const hinduKeywords = [
      'hindu', 'hinduism', 'vedic', 'sanskrit', 'mantra', 'vrat', 'festival',
      'puja', 'pooja', 'path', 'aarti', 'bhajan', 'shloka', 'stotra', 'chalisa', 'gayatri',
      'hanuman', 'shiva', 'vishnu', 'rama', 'krishna', 'devi', 'durga',
      'lakshmi', 'saraswati', 'ganesha', 'kali', 'navratri', 'diwali',
      'holi', 'dussehra', 'janmashtami', 'shivaratri', 'karva chauth',
      'ekadashi', 'purnima', 'amavasya', 'purnmasi', 'sankranti', 'temple', 'dharma',
      'karma', 'moksha', 'yoga', 'meditation', 'pranayama', 'ayurveda',
      'astrology', 'jyotish', 'kundali', 'rashi', 'nakshatra', 'graha',
      'panchang', 'panchangam', 'tithi', 'upanishad', 'ramayana', 'mahabharata', 'bhagavad gita', 'purana'
    ];

    // Check if query contains Hindu-related keywords
    const isHinduQuery = hinduKeywords.some(keyword =>
      query.toLowerCase().includes(keyword)
    );

    if (!isHinduQuery) {
      return {
        success: false,
        message: 'Query not related to Hindu religion'
      };
    }

    // Create a comprehensive prompt for Gemini
    const prompt = `SEARCH GOOGLE for the most accurate and current information on: "${query}"

    You are a knowledgeable expert on Hindu religion, spirituality, and astrology (Swamini). 
    Please provide information specifically grounded in the latest data from authentic sources.

    Please provide:
    1. Accurate and CURRENT details based on today's calendar (Panchang, Tithi, Festivals).
    2. Information based on authentic Hindu scriptures and traditions.
    3. Practical significance and guidance.
    4. Sanskrit terms with translations.

    CRITICAL: For panchang or dates (Amavasya, Ekadashi, etc.), ensure you use the information for today (${new Date().toLocaleDateString()}) and specifically for Indian standard time.
    
    Response should be in English but include Hindi/Sanskrit terms. Keep it respectful and spiritual 🙏.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (text && text.length > 50) {
      console.log('✅ Gemini AI search successful');
      return {
        success: true,
        content: text.trim(),
        source: 'Gemini AI',
        searchType: 'AI Knowledge'
      };
    } else {
      console.log('❌ Gemini returned insufficient content');
      return {
        success: false,
        message: 'Insufficient content from AI search'
      };
    }

  } catch (error) {
    console.error('💥 Gemini AI search error:', error.message);
    return {
      success: false,
      message: 'AI search service temporarily unavailable'
    };
  }
};

// Enhanced internet search combining Gemini with traditional APIs
const searchInternetWithGemini = async (query) => {
  try {
    console.log('🔍 Starting enhanced internet search with Gemini for:', query);

    // Define Hindu religious keywords to filter searches
    const hinduKeywords = [
      'hindu', 'hinduism', 'vedic', 'sanskrit', 'mantra', 'vrat', 'festival',
      'puja', 'aarti', 'bhajan', 'shloka', 'stotra', 'chalisa', 'gayatri',
      'hanuman', 'shiva', 'vishnu', 'rama', 'krishna', 'devi', 'durga',
      'lakshmi', 'saraswati', 'ganesha', 'kali', 'navratri', 'diwali',
      'holi', 'dussehra', 'janmashtami', 'shivaratri', 'karva chauth',
      'ekadashi', 'purnima', 'amavasya', 'sankranti', 'temple', 'dharma',
      'karma', 'moksha', 'yoga', 'meditation', 'pranayama', 'ayurveda',
      'astrology', 'jyotish', 'kundali', 'rashi', 'nakshatra', 'graha',
      'upanishad', 'ramayana', 'mahabharata', 'bhagavad gita', 'purana'
    ];

    // Check if query contains Hindu-related keywords
    const isHinduQuery = hinduKeywords.some(keyword =>
      query.toLowerCase().includes(keyword)
    );

    if (!isHinduQuery) {
      return {
        success: false,
        message: 'Query not related to Hindu religion'
      };
    }

    // PRIMARY METHOD: Try Gemini AI with Google Search grounding
    const geminiResult = await searchWithGemini(query);
    if (geminiResult.success) {
      return geminiResult;
    }

    // Fallback only if Gemini service is completely down
    console.log('📚 Gemini search failed, using local enhanced knowledge base...');
    const enhancedResult = await getEnhancedHinduKnowledge(query);

    if (enhancedResult.success) {
      return {
        success: true,
        content: enhancedResult.content,
        source: 'Enhanced Knowledge Base',
        searchType: 'Local Knowledge'
      };
    }

    return {
      success: false,
      message: 'No relevant Hindu religious content found from Google or local knowledge'
    };

  } catch (error) {
    console.error('💥 Enhanced internet search error:', error.message);
    return {
      success: false,
      message: 'Search service temporarily unavailable'
    };
  }
};

// Enhanced internet search function for Hindu religious content with multiple APIs
const searchHinduContent = async (query) => {
  try {
    // Define Hindu religious keywords to filter searches
    const hinduKeywords = [
      'hindu', 'hinduism', 'vedic', 'sanskrit', 'mantra', 'vrat', 'festival',
      'puja', 'aarti', 'bhajan', 'shloka', 'stotra', 'chalisa', 'gayatri',
      'hanuman', 'shiva', 'vishnu', 'rama', 'krishna', 'devi', 'durga',
      'lakshmi', 'saraswati', 'ganesha', 'kali', 'navratri', 'diwali',
      'holi', 'dussehra', 'janmashtami', 'shivaratri', 'karva chauth',
      'ekadashi', 'purnima', 'amavasya', 'sankranti', 'temple', 'dharma',
      'karma', 'moksha', 'yoga', 'meditation', 'pranayama', 'ayurveda',
      'astrology', 'jyotish', 'kundali', 'rashi', 'nakshatra', 'graha',
      'upanishad', 'ramayana', 'mahabharata', 'bhagavad gita', 'purana'
    ];

    // Check if query contains Hindu-related keywords
    const isHinduQuery = hinduKeywords.some(keyword =>
      query.toLowerCase().includes(keyword)
    );

    if (!isHinduQuery) {
      return {
        success: false,
        message: 'Query not related to Hindu religion'
      };
    }

    console.log('🌐 Starting internet search for:', query);
    let searchResult = '';
    let searchSource = '';

    // Method 1: Try Wikipedia API first (most reliable)
    try {
      console.log('📚 Trying Wikipedia search...');
      const cleanQuery = query.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
      const wikiSearchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;

      const wikiResponse = await axios.get(wikiSearchUrl, {
        timeout: 4000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AstrologyBot/1.0)',
          'Accept': 'application/json'
        }
      });

      if (wikiResponse.data && wikiResponse.data.extract) {
        const extract = wikiResponse.data.extract;
        // Check if content is Hindu-related
        const isRelevant = hinduKeywords.some(keyword =>
          extract.toLowerCase().includes(keyword)
        );

        if (isRelevant && extract.length > 50) {
          searchResult = extract;
          searchSource = 'Wikipedia';
          console.log('✅ Wikipedia search successful');
        } else {
          console.log('❌ Wikipedia content not Hindu-related');
        }
      }
    } catch (wikiError) {
      console.log('❌ Wikipedia search failed:', wikiError.message);
    }

    // Method 2: Try JSONbin.io Hindu Knowledge API (fallback)
    if (!searchResult) {
      try {
        console.log('📖 Trying enhanced Hindu knowledge base...');
        const enhancedResult = await getEnhancedHinduKnowledge(query);
        if (enhancedResult.success) {
          searchResult = enhancedResult.content;
          searchSource = 'Enhanced Knowledge Base';
          console.log('✅ Enhanced knowledge base search successful');
        }
      } catch (enhancedError) {
        console.log('❌ Enhanced knowledge base failed:', enhancedError.message);
      }
    }

    // Method 3: Try REST Countries API for cultural info (if location-based query)
    if (!searchResult && (query.includes('india') || query.includes('hindi') || query.includes('indian'))) {
      try {
        console.log('🌍 Trying cultural information search...');
        const culturalResult = await getCulturalInfo(query);
        if (culturalResult.success) {
          searchResult = culturalResult.content;
          searchSource = 'Cultural Information';
          console.log('✅ Cultural information search successful');
        }
      } catch (culturalError) {
        console.log('❌ Cultural information search failed:', culturalError.message);
      }
    }

    // Method 4: Use DuckDuckGo as final fallback
    if (!searchResult) {
      try {
        console.log('🦆 Trying DuckDuckGo search...');
        const enhancedQuery = `Hindu religion ${query} sanskrit vedic tradition`;
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(enhancedQuery)}&format=json&no_html=1&skip_disambig=1`;

        const response = await axios.get(searchUrl, {
          timeout: 3000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AstrologyBot/1.0)'
          }
        });

        const data = response.data;

        // Extract relevant information from DuckDuckGo
        if (data.Abstract && data.Abstract.length > 50) {
          searchResult = data.Abstract;
          searchSource = 'DuckDuckGo';
        } else if (data.Definition && data.Definition.length > 50) {
          searchResult = data.Definition;
          searchSource = 'DuckDuckGo';
        } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
          const relevantTopic = data.RelatedTopics.find(topic =>
            topic.Text && hinduKeywords.some(keyword =>
              topic.Text.toLowerCase().includes(keyword)
            )
          );
          if (relevantTopic && relevantTopic.Text.length > 50) {
            searchResult = relevantTopic.Text;
            searchSource = 'DuckDuckGo';
          }
        }

        if (searchResult) {
          console.log('✅ DuckDuckGo search successful');
        } else {
          console.log('❌ DuckDuckGo returned no relevant results');
        }
      } catch (duckError) {
        console.log('❌ DuckDuckGo search failed:', duckError.message);
      }
    }

    if (searchResult && searchResult.length > 0) {
      // Limit response length and add source attribution
      const limitedResult = searchResult.length > 900
        ? searchResult.substring(0, 900) + '...'
        : searchResult;

      console.log(`🎉 Internet search successful via ${searchSource}`);
      return {
        success: true,
        content: limitedResult,
        source: searchSource
      };
    }

  } catch (error) {
    console.error('💥 Internet search error:', error.message);
    return {
      success: false,
      message: 'Search service temporarily unavailable'
    };
  }
};

// Enhanced Hindu knowledge base for offline/fallback content
const getEnhancedHinduKnowledge = async (query) => {
  const enhancedKnowledge = {
    'gayatri': {
      content: `The Gayatri Mantra is one of the most sacred and powerful mantras in Hinduism. It is a universal prayer that can be chanted by anyone, regardless of gender, caste, or creed. The mantra is: 'Om Bhur Bhuva Swaha, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat.' It is traditionally chanted 108 times during sunrise, noon, and sunset. The mantra invokes the divine light to illuminate our minds and guide us toward spiritual enlightenment.`,
      keywords: ['gayatri', 'mantra', 'om', 'sacred']
    },
    'diwali': {
      content: `Diwali, also known as Deepavali, is the Festival of Lights celebrated by millions of Hindus worldwide. It typically occurs in October or November and lasts for five days. The festival commemorates the return of Lord Rama to Ayodhya after defeating Ravana, symbolizing the victory of good over evil and light over darkness. People clean their homes, decorate with rangoli, light diyas (oil lamps), exchange gifts, and perform Lakshmi puja for prosperity and wealth.`,
      keywords: ['diwali', 'deepavali', 'festival', 'lights', 'rama', 'lakshmi']
    },
    'navratri': {
      content: `Navratri is a nine-night Hindu festival dedicated to the worship of Goddess Durga and her nine forms (Navadurga). It occurs four times a year, with Sharad Navratri being the most widely celebrated. Each day is dedicated to a different form of the goddess: Shailputri, Brahmacharini, Chandraghanta, Kushmanda, Skandamata, Katyayani, Kalaratri, Mahagauri, and Siddhidatri. Devotees observe fasts, perform pujas, and participate in traditional dances like Garba and Dandiya.`,
      keywords: ['navratri', 'durga', 'goddess', 'nine', 'garba', 'dandiya']
    },
    'yoga': {
      content: `Yoga is an ancient Indian practice that combines physical postures (asanas), breathing techniques (pranayama), and meditation to achieve harmony between mind, body, and spirit. The word 'yoga' comes from the Sanskrit root 'yuj,' meaning 'to unite' or 'to join.' There are various forms of yoga including Hatha, Vinyasa, Ashtanga, and Kundalini. Regular practice of yoga promotes physical health, mental clarity, emotional balance, and spiritual growth.`,
      keywords: ['yoga', 'asanas', 'pranayama', 'meditation', 'hatha', 'sanskrit']
    },
    'karma': {
      content: `Karma is a fundamental concept in Hinduism referring to the law of cause and effect governing actions and their consequences. According to this principle, every action (physical, mental, or emotional) generates energy that will eventually return to the person in some form. Good actions (dharmic karma) lead to positive outcomes, while harmful actions (adharmic karma) result in negative consequences. The concept encourages ethical living and personal responsibility.`,
      keywords: ['karma', 'dharma', 'action', 'consequence', 'law', 'ethics']
    }
  };

  // Find matching content
  for (const [key, data] of Object.entries(enhancedKnowledge)) {
    if (data.keywords.some(keyword => query.toLowerCase().includes(keyword))) {
      return {
        success: true,
        content: data.content
      };
    }
  }

  return {
    success: false,
    message: 'No matching enhanced knowledge found'
  };
};

// Cultural information helper
const getCulturalInfo = async (query) => {
  try {
    // This could be expanded to include cultural APIs
    const culturalContent = {
      'india': 'India is the birthplace of Hinduism, Buddhism, Jainism, and Sikhism. It has a rich cultural heritage spanning over 5,000 years, with diverse traditions, languages, and spiritual practices.',
      'hindi': 'Hindi is one of the official languages of India and is written in the Devanagari script. Many Hindu scriptures and mantras are in Sanskrit, which is closely related to Hindi.',
      'indian': 'Indian culture is deeply rooted in spiritual traditions, with festivals, rituals, and practices that have been preserved for millennia.'
    };

    for (const [key, content] of Object.entries(culturalContent)) {
      if (query.toLowerCase().includes(key)) {
        return {
          success: true,
          content: content
        };
      }
    }

    return {
      success: false,
      message: 'No cultural information found'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Cultural search failed'
    };
  }
};

// Function to determine if query needs internet search
const needsInternetSearch = (query) => {
  const internetTriggers = [
    'latest', 'current', 'today', 'this year', '2025', 'recent',
    'update', 'new', 'modern', 'contemporary', 'now', 'currently',
    'अभी', 'आज', 'नया', 'ताजा', 'वर्तमान', 'हाल ही में',
    'when is', 'which day', 'what date', 'कब है', 'कौन सा दिन', 'तारीख क्या है',
    'panchang', 'panchangam', 'tithi', 'nakshatra', 'yoga', 'karana', 'festival',
    'amavasya', 'purnima', 'ekadashi', 'vrat', 'muhurat', 'shubh samay',
    'पंचांग', 'पञ्चाङ्ग', 'तिथि', 'नक्षत्र', 'योग', 'करण', 'त्योहार', 'त्यौहार', 'पर्व',
    'अमावस्या', 'पूर्णिमा', 'पुर्णमासी', 'एकादशी', 'व्रत', 'मुहूर्त', 'शुभ समय'
  ];

  const complexQueries = [
    'detailed information', 'complete guide', 'comprehensive',
    'विस्तृत जानकारी', 'पूरी जानकारी', 'संपूर्ण गाइड',
    'what does', 'explain', 'tell me about', 'महत्व', 'significance'
  ];

  const unknownTerms = [
    'never heard', 'don\'t know', 'explain', 'what exactly',
    'नहीं पता', 'समझाइए', 'क्या है', 'बताइए',
    'what is', 'how to', 'कैसे करे', 'कैसे करें', 'क्या होता है'
  ];

  return internetTriggers.some(trigger => query.toLowerCase().includes(trigger)) ||
    complexQueries.some(trigger => query.toLowerCase().includes(trigger)) ||
    unknownTerms.some(trigger => query.toLowerCase().includes(trigger));
};

// Function to fetch horoscope predictions from VedAstro API
const getVedAstroPredictions = async (userContext) => {
  try {
    if (!userContext.dob || !userContext.tob || !userContext.pob) {
      console.log('⚠️ Missing user context for VedAstro call');
      return null;
    }

    const VEDASTRO_API_URL = getVedAstroApiUrl();

    // Format location for VedAstro URL
    let location = userContext.pob;
    // Basic cleanup for common formats like "City, State, Country"
    if (location.includes(',')) {
      location = location.split(',')[0].trim();
    }
    location = encodeURIComponent(location);

    // Format birth time
    const dob = new Date(userContext.dob);
    const day = dob.getDate().toString().padStart(2, '0');
    const month = (dob.getMonth() + 1).toString().padStart(2, '0');
    const year = dob.getFullYear();

    // Ensure time is in HH:mm format
    let time = userContext.tob || "12:00";
    if (time.includes('AM') || time.includes('PM')) {
      // Basic conversion if needed
      // (Simplified for now, assuming standard 24h format for backend)
    }

    const offset = "+05:30"; // Default for India as the app is Hindu/Vedic focused

    const timeUrl = `Location/${location}/Time/${time}/${day}/${month}/${year}/${offset}`;
    const url = `${VEDASTRO_API_URL}/HoroscopePredictions/${timeUrl}`;

    console.log(`📡 Fetching VedAstro predictions from: ${url}`);

    const response = await axios.get(url, { timeout: 10000 });
    if (response.data && response.data.Status === "Success") {
      // Extract only Name and Description to keep prompt size manageable
      return response.data.Payload.map(p => `- ${p.Name}: ${p.Description}`).join('\n');
    }
    return null;
  } catch (error) {
    console.error('💥 Error fetching VedAstro predictions:', error.message);
    return null;
  }
};

// Function to call VedAstro Horoscope Chat API directly
const getVedAstroChat = async (userMessage, userContext, sessionId = '') => {
  try {
    if (!userContext.dob || !userContext.tob || !userContext.pob) {
      console.log('⚠️ Missing user context for VedAstro Chat call');
      return null;
    }

    const VEDASTRO_API_URL = getVedAstroApiUrl();

    // Format location for VedAstro URL
    let location = userContext.pob || 'unknown';
    if (typeof location === 'string' && location.includes(',')) {
      location = location.split(',')[0].trim();
    }
    location = encodeURIComponent(location);

    // Format birth time
    const dob = new Date(userContext.dob);
    const day = dob.getDate().toString().padStart(2, '0');
    const month = (dob.getMonth() + 1).toString().padStart(2, '0');
    const year = dob.getFullYear();
    let time = userContext.tob || "12:00";
    time = (time || "12:00").replace(/\s*(AM|PM|am|pm)/g, '');
    time = encodeURIComponent(time);
    const offset = encodeURIComponent("+05:30");

    // Construct Time URL Part
    const timeUrl = `Location/${location}/Time/${time}/${day}/${month}/${year}/${offset}`;

    // Clean user message
    const cleanMessage = encodeURIComponent(userMessage.replace(/\?/g, ''));
    const userId = userContext.userId || "101"; // Default guest ID if missing
    const sessId = sessionId || "GuestSession" + Date.now();

    // Call HoroscopeChat Capability from VedAstro
    const url = `${VEDASTRO_API_URL}/HoroscopeChat/${timeUrl}/UserQuestion/${cleanMessage}/UserId/${userId}/SessionId/${sessId}`;

    console.log(`📡 Calling VedAstro AI Chat: ${url}`);

    // VedAstro AI can take time, but we limit to 30s for better UX
    const startTime = Date.now();
    console.log(`⏱️ [PERF] Starting VedAstro API call at ${new Date().toISOString()}`);

    const response = await axios.get(url, { timeout: 30000 }); // Reduced from 60s to 30s

    const duration = Date.now() - startTime;
    console.log(`⏱️ [PERF] VedAstro API responded in ${duration}ms`);

    if (response.data && (response.data.Status?.toLowerCase() === "pass" || response.data.Status?.toLowerCase() === "success")) {
      const payload = response.data.Payload;
      const chatData = payload.HoroscopeChat || payload;

      // VedAstro often returns a stringified JSON inside the Payload, so we need to parse it again
      let parsedData = chatData;
      if (typeof chatData === 'string') {
        try {
          parsedData = JSON.parse(chatData);
        } catch (e) {
          console.warn('⚠️ Could not parse inner JSON from VedAstro, using raw string');
        }
      }

      // Extract the actual text response
      let text = parsedData.TextHtml || parsedData.Text || parsedData.response || null;

      if (text) {
        // CLEANUP: Remove any [DEBUG-AG] tags from the engine response
        if (typeof text === 'string') {
          text = text.replace(/\[DEBUG-AG\]\s*/g, '');
        }

        console.log(`✅ VedAstro Engine success. Content preview: ${text.substring(0, 50)}...`);

        // Return structured object
        return {
          text: text,
          textHtml: (parsedData.TextHtml || text).replace(/\[DEBUG-AG\]\s*/g, ''),
          followUpQuestions: parsedData.FollowUpQuestions || [],
          text2: parsedData.Text2 ? parsedData.Text2.replace(/\[DEBUG-AG\]\s*/g, '') : undefined,
          text3: parsedData.Text3 ? parsedData.Text3.replace(/\[DEBUG-AG\]\s*/g, '') : undefined,
          commands: parsedData.Commands || [],
          sessionId: parsedData.SessionId || sessId
        };
      }
    }
    console.log('⚠️ VedAstro Engine returned non-success or empty payload');
    return null;

  } catch (error) {
    const errorDuration = Date.now() - startTime;
    console.error(`💥 Error calling VedAstro Chat API after ${errorDuration}ms:`, error.message);

    // Log specific timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error(`⏱️ [PERF] VedAstro API TIMEOUT after ${errorDuration}ms - Consider optimizing server-side calculations`);
    }

    return null;
  }
};

// Function to get response from Gemini AI with user context
const getAIResponseFromGemini = async (userMessage, userContext = {}) => {
  try {
    if (!model) return null;

    console.log('🔮 Generating Gemini AI response for:', userMessage);

    let contextPrompt = '';
    let predictionsText = '';

    if (userContext.name) {
      contextPrompt = `User Name: ${userContext.name}\n`;
      if (userContext.dob) {
        contextPrompt += `Date of Birth: ${new Date(userContext.dob).toLocaleDateString()}\n`;
        contextPrompt += `Time of Birth: ${userContext.tob}\n`;
        contextPrompt += `Place of Birth: ${userContext.pob}\n`;

        // Check if query is personal astrological before calling VedAstro
        const personalTriggers = [
          'my career', 'career', 'future', 'prediction', 'भविष्य', 'करियर',
          'marriage', 'shadi', 'vivah', 'शादी', 'विवाह',
          'health', 'स्वास्थ्य',
          'horoscope', 'rashifal', 'राशिफल', 'rashiphal',
          'kundli', 'kundali', 'birth chart', 'कुंडली', 'कुण्डली',
          'remedy', 'gemstone', 'रत्न', 'उपाय',
          'stars', 'सितारे', 'graha', 'planet', 'kundali',
          'myself', 'who am i', 'my profile', 'मेरे बारे में'
        ];
        const isPersonalAstrological = personalTriggers.some(trigger => userMessage.toLowerCase().includes(trigger.toLowerCase()));

        if (isPersonalAstrological) {
          // PRIMARY STRATEGY for personal queries: Use VedAstro AI Engine
          console.log("🚀 Attempting to call VedAstro AI Engine for personal query...");
          const vedAstroReply = await getVedAstroChat(userMessage, userContext);

          if (vedAstroReply) {
            console.log("✅ VedAstro Engine replied successfully.");
            return typeof vedAstroReply === 'object' ? vedAstroReply.text : vedAstroReply;
          } else {
            console.log("⚠️ VedAstro Engine failed or timed out.");
            // Fallback to Gemini if VedAstro fails
          }
        } else {
          console.log("ℹ️ Non-personal query with birth context, skipping VedAstro engine.");
        }
      }
    }

    // Default to Gemini AI if VedAstro is not applicable or fails
    const systemPrompt = `You are "Swamini", a premium spiritual AI guide and expert in Vedic Astrology and Hindu traditions (Pooja Path).
    ${contextPrompt}
    Current user question: "${userMessage}"
    
    CRITICAL RESTRICTION: You MUST ONLY answer questions related to Astrology, Hindu Spirituality, Vedic traditions, Panchang, Festivals, and Pooja Path.
    If the user asks about anything else (e.g., politics, sports, general technology, unrelated news), politely decline and state that you are here to provide spiritual and astrological guidance only.
    
    Guidelines:
    1. Respond in a spiritual, helpful, and respectful tone.
    2. Provide accurate information based on Vedic scriptures.
    3. For panchang, festivals, or lunar dates (amavasya, etc.), use your internal knowledge or the provided search context.
    4. If birth details are missing and the question requires a personal horoscope, politely ask for them.
    5. Keep the response concise and supportive.
    6. Use spiritual emojis 🙏✨🕉 where appropriate.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('💥 getAIResponseFromGemini error:', error.message);
    return null;
  }
};

// Enhanced response generation with context awareness, caching, and internet search
const generateIntelligentResponse = async (userMessage, userContext = {}) => {
  const message = userMessage.toLowerCase();

  // Personal/Astrological triggers that benefit from AI with user context
  const personalTriggers = [
    'my career', 'career', 'future', 'prediction', 'भविष्य', 'करियर',
    'marriage', 'shadi', 'vivah', 'शादी', 'विवाह',
    'health', 'स्वास्थ्य', 'health',
    'horoscope', 'rashifal', 'राशिफल', 'rashiphal',
    'kundli', 'kundali', 'birth chart', 'कुंडली', 'कुण्डली',
    'remedy', 'gemstone', 'रत्न', 'उपाय',
    'stars', 'सितारे', 'graha', 'planet', 'kundali',
    'myself', 'who am i', 'my profile', 'मेरे बारे में'
  ];
  const isPersonalQuery = personalTriggers.some(trigger => message.includes(trigger.toLowerCase()));

  if (isPersonalQuery) {
    console.log(`🔍 Personal query detected: "${userMessage}"`);
  }

  // If it's a PERSONAL query and we have birth context, go to VedAstro
  if (isPersonalQuery && userContext.dob) {
    console.log('🔮 Personal query with birth context found, calling VedAstro engine...');
    const vedAstroResponse = await getAIResponseFromGemini(userMessage, userContext);
    if (vedAstroResponse) {
      return vedAstroResponse;
    }
  }

  // If it's a personal query but we DON'T have birth context
  if (isPersonalQuery && !userContext.dob) {
    return "🔮 आपका प्रश्न आपकी व्यक्तिगत गणना/कुंडली से संबंधित है। इसके लिए मुझे आपकी जन्म तिथि, समय और स्थान की आवश्यकता होगी। \n\nकृपया ऊपर 'New' बटन दबाकर विवरण भरें या लॉगिन करके अपनी प्रोफाइल अपडेट करें ताकि मैं आपके सितारों का सही विश्लेषण कर सकूं। 🙏";
  }

  // For general queries, check cache
  const cachedResponse = getFromCache(userMessage);
  if (cachedResponse) {
    console.log('✅ Returning cached response for general query');
    return cachedResponse;
  }

  // Check if query needs internet search (e.g., date-specific or complex)
  if (needsInternetSearch(userMessage)) {
    console.log('🌐 Query needs internet search, calling enhanced search...');
    const searchResult = await searchInternetWithGemini(userMessage);
    if (searchResult.success) {
      console.log(`✅ Internet search success via ${searchResult.source}`);
      const searchResponse = `✨ **खोज परिणाम (${searchResult.source}):**\n\n${searchResult.content}\n\n🙏 क्या आप इसके बारे में और कुछ जानना चाहते हैं?`;
      saveToCache(userMessage, searchResponse);
      return searchResponse;
    }
  }

  // Fallback to Gemini for everything else
  console.log('🤖 Calling Gemini AI for general/fallback response...');
  const finalResponse = await getAIResponseFromGemini(userMessage, userContext);

  if (finalResponse) {
    saveToCache(userMessage, finalResponse);
    return finalResponse;
  }

  // Final static fallback
  return "🔮 मैं आपकी ज्योतिषीय सहायता के लिए तैयार हूं। कृपया सटीक और व्यक्तिगत भविष्यवाणियों के लिए अपने जन्म विवरण (जन्मतिथि, समय और स्थान) प्रदान करें। 🙏";
};

// Main chatbot response endpoint
exports.getChatbotResponse = async (req, res) => {
  try {
    const { message, userId, dob, tob, pob, name } = req.body;

    console.log('Chatbot request received:', {
      message: message?.substring(0, 50) + '...',
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get user context if available
    let userContext = {};
    if (userId && !userId.toString().startsWith('Guest-')) {
      try {
        // Only try to fetch user if database is connected
        if (mongoose.connection.readyState === 1) {
          const user = await User.findById(userId).select('-password');
          if (user) {
            userContext = {
              name: user.name,
              dob: user.dateOfBirth,
              tob: user.timeOfBirth,
              pob: user.placeOfBirth,
              hasKundali: true,
              appointments: await Appointment.countDocuments({ client: userId })
            };
            console.log('User context loaded from DB:', { name: userContext.name });
          }
        }
      } catch (error) {
        console.log('User context fetch error:', error.message);
      }
    }

    // Override context if specific birth details provided (from Horoscope Selector)
    if (dob && tob && pob) {
      userContext = {
        ...userContext,
        dob, tob, pob,
        name: name || userContext.name || 'User'
      };
      console.log('Using explicit context from request:', {
        name: userContext.name,
        dob: userContext.dob
      });
    }

    // Generate AI response
    console.log('Generating AI response...');
    const aiResponse = await generateIntelligentResponse(message, userContext);

    // Log the conversation for improvement
    console.log('Chatbot Response generated, length:', aiResponse.length);

    return res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString(),
      suggestions: getSuggestions(message)
    });

  } catch (error) {
    console.error('Chatbot response error:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return res.status(500).json({
      success: false,
      message: '🙏 क्षमा करें, चैटबॉट में कुछ समस्या है। कृपया बाद में कोशिश करें।'
    });
  }
};

// Get conversation suggestions
const getSuggestions = (lastMessage) => {
  const suggestions = [
    "मेरी राशि क्या है?",
    "कुंडली कैसे बनवाएं?",
    "अपॉइंटमेंट कैसे बुक करें?",
    "कौन सा रत्न पहनूं?",
    "गणेश मंत्र बताइए",
    "आज का राशिफल",
    "गायत्री मंत्र का उच्चारण?",
    "एकादशी व्रत कैसे करें?",
    "मेरा करियर कैसा रहेगा?",
    "स्वास्थ्य के लिए उपाय?",
    "मेरी शादी कब होगी?",
    "ध्यान कैसे लगाएं?"
  ];

  return suggestions.slice(0, 3); // Return 3 random suggestions
};

// Export the generateIntelligentResponse function for testing
exports.generateIntelligentResponse = generateIntelligentResponse;

// Export the needsInternetSearch function for testing
exports.needsInternetSearch = needsInternetSearch;

// Get popular questions
exports.getPopularQuestions = async (req, res) => {
  try {
    const popularQuestions = [
      {
        category: "ज्योतिष संबंधी प्रश्न",
        questions: [
          "मेरी राशि क्या है?",
          "भविष्यफल कैसे देखें?",
          "ग्रहों का प्रभाव क्या है?",
          "मेरे ग्रह कहाँ स्थित हैं?"
        ]
      },
      {
        category: "कुंडली और जन्म पत्री",
        questions: [
          "कुंडली कैसे बनवाएं?",
          "मंगल दोष क्या है?",
          "गुण मिलान कैसे करें?",
          "मेरी कुंडली का विश्लेषण करें"
        ]
      },
      {
        category: "अपॉइंटमेंट बुकिंग",
        questions: [
          "अपॉइंटमेंट कैसे बुक करें?",
          "ज्योतिषी कैसे चुनें?",
          "वीडियो कॉल कैसे करें?",
          "परामर्श शुल्क क्या है?"
        ]
      },
      {
        category: "रत्न और उपाय",
        questions: [
          "कौन सा रत्न पहनूं?",
          "रत्न पहनने का समय?",
          "मूल mantra क्या है?",
          "रत्न शुद्धि कैसे करें?"
        ]
      },
      {
        category: "मंत्र और आध्यात्म",
        questions: [
          "गणेश मंत्र बताइए",
          "सरस्वती मंत्र का महत्व?",
          "जाप कैसे करें?",
          "ध्यान कैसे लगाएं?"
        ]
      },
      {
        category: "गायत्री मंत्र",
        questions: [
          "गायत्री मंत्र क्या है?",
          "गायत्री का जाप समय?",
          "गायत्री के लाभ?",
          "गायत्री मंत्र का उच्चारण?"
        ]
      },
      {
        category: "व्रत और त्योहार",
        questions: [
          "एकादशी व्रत कैसे करें?",
          "दीपावली का महत्व?",
          "कार्तिक पूर्णिमा कब है?",
          "शिवरात्रि कैसे मनाएं?"
        ]
      },
      {
        category: "करियर और शिक्षा",
        questions: [
          "मेरा करियर कैसा रहेगा?",
          "पढ़ाई में सुधार कैसे लाएं?",
          "नौकरी मिलेगी कब?",
          "व्यापार में वृद्धि कैसे होगी?"
        ]
      },
      {
        category: "स्वास्थ्य और कल्याण",
        questions: [
          "स्वास्थ्य के लिए उपाय?",
          "योग कैसे करें?",
          "आयुर्वेदिक उपचार?",
          "मनोशांति के लिए क्या करें?"
        ]
      },
      {
        category: "विवाह और संबंध",
        questions: [
          "मेरी शादी कब होगी?",
          "जीवनसाथी कैसा होगा?",
          "मंगल दोष का समाधान?",
          "प्रेम संबंधों में सुधार?"
        ]
      }
    ];

    res.json({
      success: true,
      questions: popularQuestions
    });
  } catch (error) {
    console.error('Popular questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular questions'
    });
  }
};

// Proxy for VedAstro API to avoid CORS issues
exports.vedastroProxy = async (req, res) => {
  try {
    const path = req.params.path || req.params[0] || '';
    const VEDASTRO_API_URL = getVedAstroApiUrl();

    // Construct URL with query params if any
    let url = `${VEDASTRO_API_URL}/${path}`;
    const queryParams = new URLSearchParams(req.query).toString();
    if (queryParams) {
      url += `?${queryParams}`;
    }

    console.log(`🌐 Proxying VedAstro request: ${url}`);

    const response = await axios.get(url, { timeout: 60000 });

    // Clean up debug strings from response if they exist
    if (response.data && response.data.Payload) {
      // Find where the text is (could be HoroscopeChat or HoroscopeFollowUpChat)
      const payload = response.data.Payload.HoroscopeChat ||
        response.data.Payload.HoroscopeFollowUpChat ||
        response.data.Payload;

      // Recursive cleaner for anything that might be a string
      const cleanObject = (obj) => {
        if (!obj) return;
        Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'string') {
            obj[key] = obj[key].replace(/\[DEBUG-AG\]\s*/g, '');
          } else if (typeof obj[key] === 'object') {
            cleanObject(obj[key]);
          }
        });
      };

      cleanObject(payload);
    }

    res.json(response.data);
  } catch (error) {
    console.error('💥 VedAstro Proxy Error:', error.message);
    if (error.response) {
      console.error('Target API responded with:', error.response.status, error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      Status: "Fail",
      Payload: error.message
    });
  }
};