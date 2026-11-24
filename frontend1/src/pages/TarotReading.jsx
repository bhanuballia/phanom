import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { authAPI, buildAssetUrl } from '../services/api';
import {
  Sparkles,
  RefreshCw,
  Layers,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Eye,
  Moon,
  Star,
  Sun,
  Volume2,
  VolumeX,
  FileText,
  Download,
  Flame,
  Droplets,
  Wind,
  Coins
} from 'lucide-react';
import { TAROT_DECK } from '../data/tarotDeck';
import { TAROT_QUESTIONS } from '../data/tarotQuestions';
import { TAROT_TRANSLATIONS_HINDI } from '../data/tarotTranslationsHindi';

const SPREADS = [
  {
    id: "single",
    name: "Daily Draw",
    nameHindi: "दैनिक संदेश (Daily Draw)",
    cardsNeeded: 1,
    description: "Draw one card for today's overall guidance, focal theme, and immediate action.",
    descriptionHindi: "आज के समग्र मार्गदर्शन, मुख्य विषय और त्वरित कार्रवाई के लिए एक कार्ड चुनें।",
    positions: ["Today's Guidance"],
    positionsHindi: ["आज का मार्गदर्शन"]
  },
  {
    id: "three",
    name: "Timeline (Past, Present, Future)",
    nameHindi: "समयरेखा (Past, Present, Future)",
    cardsNeeded: 3,
    description: "A comprehensive look at what you've left behind, where you are now, and the path ahead.",
    descriptionHindi: "आप अतीत में क्या छोड़ चुके हैं, वर्तमान में कहाँ हैं और आगे का मार्ग क्या है, इसका एक विस्तृत विश्लेषण।",
    positions: ["Past (The Roots)", "Present (The Current Challenge)", "Future (The Final Outcome)"],
    positionsHindi: ["अतीत (Past)", "वर्तमान (Present)", "भविष्य (Future)"]
  },
  {
    id: "decision",
    name: "Decision Path (Choice / Outcome)",
    nameHindi: "निर्णय मार्ग (Choice / Outcome)",
    cardsNeeded: 2,
    description: "Weighing options. Card 1 represents the Pros/Option A. Card 2 represents the Cons/Option B.",
    descriptionHindi: "विकल्पों का आकलन। कार्ड 1 विकल्प A के पक्ष को दर्शाता है। कार्ड 2 विकल्प B के विपक्ष को दर्शाता है।",
    positions: ["Option A (Path of Action)", "Option B (Path of Contemplation)"],
    positionsHindi: ["विकल्प A (Path of Action)", "विकल्प B (Path of Contemplation)"]
  },
  {
    id: "crossroads",
    name: "Spiritual Crossroads",
    nameHindi: "आध्यात्मिक चौराहा (Spiritual Crossroads)",
    cardsNeeded: 4,
    description: "Understand a crucial transition point. Assess the situation, core obstacle, your strength, and the ultimate outcome.",
    descriptionHindi: "एक महत्वपूर्ण संक्रमण बिंदु को समझें। स्थिति, मुख्य बाधा, आपकी आंतरिक शक्ति और अंतिम परिणाम का आकलन करें।",
    positions: ["Current Situation", "Core Obstacle", "Your Hidden Strength", "Final Outcome"],
    positionsHindi: ["वर्तमान स्थिति", "मुख्य बाधा", "आपकी गुप्त शक्ति", "अंतिम परिणाम"]
  },
  {
    id: "harmony",
    name: "Relationship Harmony",
    nameHindi: "रिश्तों में सद्भाव (Relationship Harmony)",
    cardsNeeded: 5,
    description: "Deep dive into your connection with another. Understand your energy, their energy, the connection, the challenge, and potential.",
    descriptionHindi: "किसी अन्य व्यक्ति के साथ आपके संबंध की गहराई को जानें। अपनी ऊर्जा, उनकी ऊर्जा, मुख्य संबंध, चुनौती और क्षमता को समझें।",
    positions: ["Your Energy", "Their Energy", "The Core Connection", "The Main Challenge", "Relationship Potential"],
    positionsHindi: ["आपकी ऊर्जा", "उनकी ऊर्जा", "मुख्य संबंध", "मुख्य चुनौती", "रिश्ते की क्षमता"]
  }
];

const getCardImageUrl = (card) => {
  if (card.type === 'Major') {
    const paddedId = String(card.id).padStart(2, '0');
    return `https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m${paddedId}.jpg`;
  }

  let prefix = '';
  let offset = 0;
  if (card.suit === 'Wands') { prefix = 'w'; offset = 22; }
  else if (card.suit === 'Cups') { prefix = 'c'; offset = 36; }
  else if (card.suit === 'Swords') { prefix = 's'; offset = 50; }
  else if (card.suit === 'Pentacles') { prefix = 'p'; offset = 64; }

  const cardNum = card.id - offset + 1;
  const paddedNum = String(cardNum).padStart(2, '0');
  return `https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/${prefix}${paddedNum}.jpg`;
};

const getZodiacInfo = (dobString) => {
  if (!dobString) return { sign: 'Unknown', element: 'Unknown' };
  const date = new Date(dobString);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let sign = '';
  let element = '';

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    sign = 'Aries'; element = 'Fire';
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    sign = 'Taurus'; element = 'Earth';
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    sign = 'Gemini'; element = 'Air';
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    sign = 'Cancer'; element = 'Water';
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    sign = 'Leo'; element = 'Fire';
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    sign = 'Virgo'; element = 'Earth';
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    sign = 'Libra'; element = 'Air';
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    sign = 'Scorpio'; element = 'Water';
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    sign = 'Sagittarius'; element = 'Fire';
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    sign = 'Capricorn'; element = 'Earth';
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    sign = 'Aquarius'; element = 'Air';
  } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    sign = 'Pisces'; element = 'Water';
  }

  return { sign, element };
};

// Web Audio API Synthesizer Configuration
let audioCtx = null;
let ambientOscs = [];
let ambientGain = null;

const initAudio = () => {
  if (audioCtx) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  } catch (e) {
    console.error("Web Audio not supported", e);
  }
};

const startAmbientSound = () => {
  initAudio();
  if (!audioCtx || ambientOscs.length > 0) return;

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  ambientGain = audioCtx.createGain();
  ambientGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

  // Filter for soft mystical low-pass drone
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(320, audioCtx.currentTime);

  ambientGain.connect(filter);
  filter.connect(audioCtx.destination);

  // Gentle meditative frequencies (F# minor chord: F#2, C#3, A3)
  const freqs = [92.50, 138.59, 220.00];
  freqs.forEach(freq => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Subtle detune for shimmer
    osc.detune.setValueAtTime((Math.random() - 0.5) * 8, audioCtx.currentTime);
    osc.connect(ambientGain);
    osc.start();
    ambientOscs.push(osc);
  });
};

const stopAmbientSound = () => {
  if (ambientGain && audioCtx) {
    ambientGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
    setTimeout(() => {
      ambientOscs.forEach(osc => osc.stop());
      ambientOscs = [];
      ambientGain = null;
    }, 400);
  }
};

const playCardSound = () => {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.12);
};

const playFlipSound = () => {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  // White noise burst for card sweep
  const bufferSize = audioCtx.sampleRate * 0.1;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
  filter.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.1);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  noise.start();
};

const TarotReading = () => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('tarot_profile');
    return saved ? JSON.parse(saved) : { name: '', dob: '' };
  });

  const [readingState, setReadingState] = useState('onboarding');
  const [selectedSpread, setSelectedSpread] = useState(SPREADS[0]);
  const [focusQuestion, setFocusQuestion] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);
  const [selectedSubcategoryIndex, setSelectedSubcategoryIndex] = useState(-1);
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [flippedCards, setFlippedCards] = useState({});
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [language, setLanguage] = useState('EN'); // 'EN' or 'HI'
  const questionSectionRef = useRef(null);

  // Live Astrologers Carousel State for Onboarding Section
  const [astrologersList, setAstrologersList] = useState([]);
  const [currentAstroIndex, setCurrentAstroIndex] = useState(0);

  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const response = await authAPI.getAstrologers();
        const all = response?.data?.astrologers || [];
        if (all.length > 0) {
          setAstrologersList(all);
        }
      } catch (err) {
        console.error('Failed to load astrologers for Tarot:', err);
      }
    };
    fetchAstrologers();
  }, []);

  // 3-second rotation timer for astrologers
  useEffect(() => {
    if (astrologersList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAstroIndex((prev) => (prev + 1) % astrologersList.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [astrologersList]);

  const cleanAstrologerName = (name) => {
    if (!name) return 'Vedic Astrologer';
    return name
      .replace(/^(Astrologer|Astro\.?|Acharya|Pandit|Dr\.?)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleSpreadSelect = (spread) => {
    setSelectedSpread(spread);
    if (questionSectionRef.current) {
      questionSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const zodiacInfo = getZodiacInfo(profile.dob);

  useEffect(() => {
    if (profile.name && profile.dob) {
      setReadingState('select_spread');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tarot_profile', JSON.stringify(profile));
  }, [profile]);

  const handleAudioToggle = () => {
    if (isAudioPlaying) {
      stopAmbientSound();
      setIsAudioPlaying(false);
    } else {
      startAmbientSound();
      setIsAudioPlaying(true);
    }
  };

  const getCardTranslation = (cardId, field, fallback) => {
    if (language === 'EN') return fallback;
    const item = TAROT_TRANSLATIONS_HINDI[cardId];
    if (!item) return fallback;
    return item[field] || fallback;
  };

  const t = (enStr, hiStr) => (language === 'EN' ? enStr : hiStr);

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    if (!profile.name || !profile.dob) return;
    setReadingState('select_spread');
  };

  const initializeShuffle = () => {
    setReadingState('shuffling');
    setSelectedCards([]);
    setRevealedIndex(-1);
    setFlippedCards({});

    const deckCopy = [...TAROT_DECK];
    // Modern Fisher-Yates shuffle with true randomized upright/reversed orientation
    for (let i = deckCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
    }

    const preparedDeck = deckCopy.map((card, idx) => ({
      ...card,
      isReversed: Math.random() < 0.28,
      uniqueId: `${card.id}-${idx}-${Date.now()}`
    }));

    setShuffledDeck(preparedDeck);

    setTimeout(() => {
      setReadingState('picking');
    }, 1800);
  };

  const handleCardPick = (deckIndex) => {
    if (selectedCards.length >= selectedSpread.cardsNeeded) return;
    if (selectedCards.some(c => c.deckIndex === deckIndex)) return;

    playCardSound();

    const pickedCard = shuffledDeck[deckIndex];
    const currentPosIndex = selectedCards.length;
    const positionName = selectedSpread.positions[currentPosIndex] || `Card ${currentPosIndex + 1}`;

    const newPickedList = [...selectedCards, {
      deckIndex,
      cardData: pickedCard,
      positionName,
      positionIndex: currentPosIndex,
      isReversed: pickedCard.isReversed
    }];

    setSelectedCards(newPickedList);

    if (newPickedList.length === selectedSpread.cardsNeeded) {
      setTimeout(() => {
        setReadingState('reveal');
        setRevealedIndex(0);
      }, 800);
    }
  };

  const triggerFlipCard = (index) => {
    if (flippedCards[index]) return;
    playFlipSound();
    setFlippedCards(prev => ({ ...prev, [index]: true }));
    setRevealedIndex(index);
  };

  const handleReset = () => {
    setSelectedCards([]);
    setReadingState('select_spread');
    setRevealedIndex(-1);
    setFlippedCards({});
  };

  const getElementResonance = () => {
    if (selectedCards.length === 0) return null;
    const elementCounts = { Fire: 0, Water: 0, Air: 0, Earth: 0 };
    const suitCounts = { Wands: 0, Cups: 0, Swords: 0, Pentacles: 0 };

    selectedCards.forEach(c => {
      const el = c.cardData.element;
      if (el && elementCounts[el] !== undefined) {
        elementCounts[el]++;
      }
      const suit = c.cardData.suit;
      if (suit && suitCounts[suit] !== undefined) {
        suitCounts[suit]++;
      }
    });

    let dominantElement = 'None';
    let maxElVal = 0;
    Object.entries(elementCounts).forEach(([el, count]) => {
      if (count > maxElVal) {
        maxElVal = count;
        dominantElement = el;
      }
    });

    return { dominantElement, elementCounts, suitCounts };
  };

  const resonance = getElementResonance();

  const handlePrint = () => {
    window.print();
  };

  const fanCount = 24;
  const fanCards = shuffledDeck.slice(0, fanCount);

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-200">
      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .perspective-1000 {
          perspective: 1000px;
        }
        .card-inner {
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .card-flipped {
          transform: rotateY(180deg);
        }
        .card-front, .card-back {
          backface-visibility: hidden;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .card-back {
          transform: rotateY(180deg);
        }
        
        @keyframes drift {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.15; }
          50% { opacity: 0.35; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        .particle {
          position: absolute;
          background: radial-gradient(circle, rgba(217,119,6,0.3) 0%, rgba(244,63,94,0) 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: drift 12s infinite linear;
        }
        
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            background: white !important;
            color: black !important;
            padding: 20px;
          }
          .print-card-img {
            max-width: 150px;
            border: 1px solid #ddd;
          }
        }
      `}} />

      <Navigation />

      {/* Floating particles background (Subtle Warm) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none no-print">
        <div className="particle w-8 h-8 top-1/4 left-1/5" style={{ animationDelay: '0s', animationDuration: '14s' }} />
        <div className="particle w-12 h-12 top-2/3 left-3/4" style={{ animationDelay: '3s', animationDuration: '18s' }} />
        <div className="particle w-6 h-6 top-1/3 right-1/4" style={{ animationDelay: '6s', animationDuration: '10s' }} />
        <div className="particle w-10 h-10 top-3/4 left-1/3" style={{ animationDelay: '1s', animationDuration: '16s' }} />
      </div>

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-4 md:py-6 relative pt-32 sm:pt-36">
        {/* Controls Panel */}
        <div className="absolute top-32 sm:top-36 right-4 z-40 flex items-center space-x-2 no-print">
          <button
            onClick={() => setLanguage(language === 'EN' ? 'HI' : 'EN')}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 transition-all text-xs font-semibold shadow-xs"
          >
            <span>🌐</span>
            <span>{language === 'EN' ? 'हिंदी में पढ़ें' : 'Read in English'}</span>
          </button>
          <button
            onClick={handleAudioToggle}
            className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-amber-300 text-neutral-800 hover:bg-amber-50 transition-all text-xs font-semibold shadow-xs"
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                <span>Music Active</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-neutral-400" />
                <span>Music Off</span>
              </>
            )}
          </button>
        </div>

        {/* Header Area */}
        <div className="text-center max-w-3xl mx-auto mb-7 relative z-10 print-container">
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold mb-1.5 no-print">
            <Sparkles className="h-3.5 w-3.5 text-amber-700 animate-pulse" />
            <span>{language === 'EN' ? 'Interactive Divination Sanctuary' : 'इंटरैक्टिव दिव्य साधना स्थल'}</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black font-serif tracking-tight text-neutral-900 mb-4">
            {profile.name
              ? (language === 'EN' ? `Welcome, ${profile.name}` : `स्वागत है, ${profile.name}`)
              : (language === 'EN' ? 'Cosmic Tarot Card Reading' : 'ब्रह्मांडीय टैरो कार्ड रीडिंग')}
          </h1>

          {zodiacInfo.sign ? (
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-xl bg-white border border-amber-200 text-neutral-800 text-xs shadow-xs mb-1.5">
              <span className="font-bold text-amber-800">
                {language === 'EN' ? zodiacInfo.sign : {
                  'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
                  'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
                  'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन'
                }[zodiacInfo.sign] || zodiacInfo.sign}
              </span>
              <span className="text-neutral-400">•</span>
              <span className="text-emerald-700 font-semibold">
                {language === 'EN' ? `${zodiacInfo.element} Element` : `${zodiacInfo.element === 'Fire' ? 'अग्नि' :
                  zodiacInfo.element === 'Earth' ? 'पृथ्वी' :
                    zodiacInfo.element === 'Air' ? 'वायु' :
                      zodiacInfo.element === 'Water' ? 'जल' : zodiacInfo.element
                  } तत्व`}
              </span>
              <span className="text-neutral-400">•</span>
              <button
                onClick={() => setReadingState('onboarding')}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-bold underline focus:outline-none no-print"
              >
                {language === 'EN' ? 'Change Details' : 'विवरण बदलें'}
              </button>
            </div>
          ) : null}

          {focusQuestion && (
            <div className="mt-1 text-center bg-amber-50/70 border border-amber-200 rounded-xl py-1 px-3.5 inline-block">
              <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block font-serif">Focus Intention</span>
              <p className="text-neutral-900 text-sm md:text-base font-bold italic">"{focusQuestion}"</p>
            </div>
          )}
        </div>

        {/* ONBOARDING STATE */}
        {readingState === 'onboarding' && (() => {
          const activeAstro = astrologersList.length > 0 ? astrologersList[currentAstroIndex] : null;
          const rawAstroImg = activeAstro?.profilePicture || activeAstro?.image || activeAstro?.imageUrl || activeAstro?.photo;
          const astroImgSrc = rawAstroImg ? buildAssetUrl(rawAstroImg) : null;
          const astroName = activeAstro ? cleanAstrologerName(activeAstro.name) : 'Astro Expert';

          return (
            <div className="max-w-7xl mx-auto relative z-10 animate-fadeIn grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* 1. Left Separate Section: TR1.jpg Banner Card */}
              <div className="lg:col-span-4 relative min-h-[340px] lg:min-h-full rounded-3xl overflow-hidden border border-amber-200/90 shadow-md bg-neutral-950 flex flex-col justify-end p-6">
                <img
                  src="/images/TR1.jpg"
                  alt="Tarot Reading Sanctum"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent"></div>
                <div className="relative z-10 text-white space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/90 text-neutral-950 text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>{language === 'EN' ? 'Sacred Divination' : 'दिव्य साधना'}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-white leading-snug drop-shadow-sm">
                    {language === 'EN' ? 'Awaken Your Inner Wisdom' : 'अपनी आंतरिक प्रज्ञा को जागृत करें'}
                  </h3>
                  <p className="text-xs text-neutral-200 leading-normal font-medium drop-shadow-xs line-clamp-2">
                    {language === 'EN'
                      ? 'Step into a tranquil space of clarity and unlock intuitive tarot guidance.'
                      : 'सटीक और प्रामाणिक टैरो भविष्यवाणियों के लिए अपनी ऊर्जा को ब्रह्मांड से जोड़ें।'}
                  </p>
                </div>
              </div>

              {/* 2. Middle Separate Section: Energy Alignment Form Card */}
              <div className="lg:col-span-5 bg-white border border-amber-600 rounded-3xl p-6 sm:p-7 shadow-md flex flex-col justify-center">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1 flex items-center font-serif">
                  <Sparkles className="h-5 w-5 mr-2 text-amber-600" />
                  {language === 'EN' ? 'Personalize Your Energy' : 'अपनी ऊर्जा को संरेखित करें'}
                </h2>
                <p className="text-neutral-900 text-xs sm:text-[16px] mb-5">
                  {language === 'EN'
                    ? 'Connect your cosmic alignment and state your query to align the deck.'
                    : 'डेक को संरेखित करने के लिए अपने ब्रह्मांडीय विवरण और प्रश्न दर्ज करें।'}
                </p>

                <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[16px] font-bold text-neutral-800 mb-1" htmlFor="name">
                      {language === 'EN' ? 'Your Sacred Name' : 'आपका पवित्र नाम'}
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      placeholder={language === 'EN' ? 'Enter your name...' : 'अपना नाम दर्ज करें...'}
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-4 py-2.5 text-neutral-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-neutral-400 font-medium text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[16px] font-bold text-neutral-800 mb-1" htmlFor="dob">
                      {language === 'EN' ? 'Date of Birth' : 'जन्म तिथि'}
                    </label>
                    <input
                      type="date"
                      id="dob"
                      required
                      value={profile.dob}
                      onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                      className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-4 py-2.5 text-neutral-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium text-xs sm:text-sm cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl transition-all transform hover:-translate-y-0.5 shadow-md text-sm sm:text-base cursor-pointer"
                  >
                    {language === 'EN' ? 'Align Energy & Enter' : 'ऊर्जा संरेखित करें और प्रवेश करें'}
                  </button>
                </form>
              </div>

              {/* 3. Right Separate Section: Rotating Live Astrologer Card with Slogan */}
              <div className="lg:col-span-3 bg-gradient-to-br from-white via-amber-50/50 to-orange-50/60 border border-yellow-400 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col justify-between items-center text-center">
                <div className="w-full flex items-center justify-between border-b border-amber-200/60 pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-950 font-serif">
                      Live Astrologer
                    </span>
                  </div>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full border border-red-200">
                    LIVE NOW
                  </span>
                </div>

                {/* Rotating Astrologer Image & Name */}
                <div className="my-auto flex flex-col items-center py-2 transition-all duration-500 w-full">
                  <div className="relative p-[3px] rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-500 shadow-md">
                    <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-xl overflow-hidden bg-neutral-900 border-2 border-white flex items-center justify-center">
                      {astroImgSrc ? (
                        <img
                          src={astroImgSrc}
                          alt={astroName}
                          className="w-full h-full object-cover transition-opacity duration-500"
                        />
                      ) : (
                        <span className="text-3xl font-black text-amber-300 font-serif">
                          {astroName.charAt(0) || 'A'}
                        </span>
                      )}
                    </div>
                    <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs"></span>
                  </div>

                  <h4 className="mt-3 text-base sm:text-lg font-bold font-serif text-neutral-900 tracking-tight">
                    {astroName}
                  </h4>
                  <span className="text-[14px] text-neutral-900 font-medium">
                    {activeAstro?.specialties?.[0] || 'Vedic & Tarot Expert'}
                  </span>

                  {/* Micro indicator dots */}
                  {astrologersList.length > 1 && (
                    <div className="flex items-center gap-1 mt-2.5">
                      {astrologersList.slice(0, Math.min(6, astrologersList.length)).map((_, dotIdx) => (
                        <span
                          key={dotIdx}
                          className={`h-1.5 rounded-full transition-all duration-300 ${dotIdx === currentAstroIndex % Math.min(6, astrologersList.length)
                            ? 'w-4 bg-amber-600'
                            : 'w-1.5 bg-amber-200'
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Slogan at Bottom: Redirects to Live Astrologers Page */}
                <Link
                  to="/live-astrologers"
                  className="w-full group mt-3 p-3 bg-amber-400 hover:bg-amber-500/10 border-2 border-dashed border-amber-400 hover:border-amber-600 rounded-2xl shadow-xs transition-all transform hover:-translate-y-0.5 text-center flex flex-col items-center justify-center cursor-pointer"
                  title="Click to speak with Live Astrologers"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 mb-1">
                    Direct Consultation
                  </span>
                  <span className="text-xs sm:text-sm font-black font-serif text-neutral-900 group-hover:text-amber-800 transition-colors leading-tight">
                    "Know What Card Tells About You"
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-[14px] font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">
                    <span>Connect with Astrologer</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
            </div>
          );
        })()}

        {/* SELECT SPREAD STATE */}
        {readingState === 'select_spread' && (
          <div className="max-w-5xl mx-auto relative z-10 animate-fadeIn space-y-6">
            <h2 className="text-2xl font-bold text-center text-neutral-900 mb-6 flex items-center justify-center font-serif">
              <Layers className="h-6 w-6 mr-2 text-amber-600" />
              {language === 'EN' ? 'Choose Your Divination Spread' : 'अपना दिव्य स्प्रेड चुनें'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {SPREADS.map((spread) => (
                <button
                  key={spread.id}
                  onClick={() => handleSpreadSelect(spread)}
                  className={`relative p-5 text-left rounded-2xl border transition-all duration-300 group overflow-hidden ${selectedSpread.id === spread.id
                    ? 'bg-gradient-to-br from-amber-50 via-white to-orange-50/70 border-amber-500 shadow-md scale-[1.02] ring-2 ring-amber-400'
                    : 'bg-white border-neutral-600 hover:border-amber-300 hover:bg-amber-50/30 shadow-xs'
                    }`}
                >
                  <h3 className="text-lg font-bold text-neutral-900 mb-1.5 group-hover:text-amber-800 transition-colors">
                    {language === 'EN' ? spread.name : spread.nameHindi || spread.name}
                  </h3>
                  <p className="text-neutral-900 text-xs sm:text-[16px] mb-4 line-clamp-3 leading-relaxed">
                    {language === 'EN' ? spread.description : spread.descriptionHindi || spread.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
                    <span className="px-2.5 py-1 bg-amber-100/70 border border-amber-300 rounded-lg text-[16px] text-amber-900 font-bold">
                      {spread.cardsNeeded} {language === 'EN' ? (spread.cardsNeeded === 1 ? 'Card Required' : 'Cards Required') : 'कार्ड की आवश्यकता'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-amber-600 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>

            {/* Question / Intention Input Box */}
            <div ref={questionSectionRef} className="max-w-2xl mx-auto bg-white border border-amber-600 rounded-2xl p-6 shadow-sm scroll-mt-24">
              <label className="block text-base font-bold text-neutral-900 mb-3 font-serif flex items-center">
                <Sparkles className="h-4 w-4 text-amber-600 mr-2" />
                {t("Select a Topic & Question (Or write your own)", "एक विषय और प्रश्न चुनें (या अपना स्वयं का लिखें)")}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                {/* Category Select */}
                <div>
                  <label className="block text-[16px] font-bold text-neutral-900 mb-1">{t("Category", "श्रेणी")}</label>
                  <select
                    className="w-full bg-stone-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs sm:text-[14px] text-neutral-900 focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      setSelectedCategoryIndex(idx);
                      setSelectedSubcategoryIndex(-1);
                      setFocusQuestion("");
                    }}
                    value={selectedCategoryIndex}
                  >
                    <option value={-1}>{t("-- Choose a Category --", "-- एक श्रेणी चुनें --")}</option>
                    {TAROT_QUESTIONS.map((cat, i) => (
                      <option key={i} value={i}>
                        {language === 'EN' ? cat.category : {
                          "❤️ Love & Relationships": "❤️ प्रेम और संबंध",
                          "💼 Career & Job": "💼 करियर और नौकरी",
                          "💰 Money & Finance": "💰 धन और वित्त",
                          "🌟 Destiny & Future": "🌟 भाग्य और भविष्य",
                          "🔮 Spiritual Guidance": "🔮 आध्यात्मिक मार्गदर्शन"
                        }[cat.category] || cat.category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Select */}
                {selectedCategoryIndex >= 0 && TAROT_QUESTIONS[selectedCategoryIndex].subcategories && (
                  <div>
                    <label className="block text-[14px] font-bold text-neutral-900 mb-1">{t("Subcategory", "उपश्रेणी")}</label>
                    <select
                      className="w-full bg-stone-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs sm:text-[14px] text-neutral-900 focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                      onChange={(e) => {
                        const idx = parseInt(e.target.value);
                        setSelectedSubcategoryIndex(idx);
                        setFocusQuestion("");
                      }}
                      value={selectedSubcategoryIndex}
                    >
                      <option value={-1}>{t("-- Choose Subcategory --", "-- उपश्रेणी चुनें --")}</option>
                      {TAROT_QUESTIONS[selectedCategoryIndex].subcategories.map((sub, i) => (
                        <option key={i} value={i}>
                          {language === 'EN' ? sub.name : {
                            "Love Life": "प्रेम जीवन",
                            "Current Relationship": "वर्तमान संबंध",
                            "Ex Relationship": "पूर्व संबंध",
                            "Marriage": "विवाह"
                          }[sub.name] || sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Predefined Questions Select */}
              {selectedCategoryIndex >= 0 && (
                <div className="mb-3.5">
                  <label className="block text-[14px] font-bold text-neutral-900 mb-1">{t("Predefined Question", "पूर्व-निर्धारित प्रश्न")}</label>
                  <select
                    className="w-full bg-stone-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs sm:text-[14px] text-neutral-900 focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                    onChange={(e) => setFocusQuestion(e.target.value)}
                    value={focusQuestion}
                  >
                    <option value="">{t("-- Select a Question --", "-- एक प्रश्न चुनें --")}</option>
                    {TAROT_QUESTIONS[selectedCategoryIndex].subcategories ? (
                      selectedSubcategoryIndex >= 0 &&
                      TAROT_QUESTIONS[selectedCategoryIndex].subcategories[selectedSubcategoryIndex].questions.map((q, i) => (
                        <option key={i} value={q}>{q}</option>
                      ))
                    ) : (
                      TAROT_QUESTIONS[selectedCategoryIndex].questions.map((q, i) => (
                        <option key={i} value={q}>{q}</option>
                      ))
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[14px] font-bold text-neutral-900 mb-1" htmlFor="intention">
                  {t("Your Focus Intention", "आपका ध्यान केंद्रित विचार")}
                </label>
                <input
                  type="text"
                  id="intention"
                  placeholder={t("Ex: Will my current creative endeavor bring me success? Or edit the selected question...", "उदा: क्या मेरे वर्तमान प्रयास मुझे सफलता दिलाएंगे? या चयनित प्रश्न को बदलें...")}
                  value={focusQuestion}
                  onChange={(e) => setFocusQuestion(e.target.value)}
                  className="w-full bg-stone-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-neutral-900 focus:outline-none focus:border-amber-500 transition-all placeholder-neutral-400 text-xs sm:text-sm font-medium"
                />
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={initializeShuffle}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-2 text-sm sm:text-base cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{t("Begin Shuffling Deck", "टैरो डेक को फेंटना शुरू करें")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHUFFLING STATE */}
        {readingState === 'shuffling' && (
          <div className="flex flex-col items-center justify-center py-20 relative z-10 animate-pulse">
            <div className="relative w-48 h-64 mb-8">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 bg-white border-2 border-amber-black rounded-xl shadow-xl flex items-center justify-center transition-all duration-700"
                  style={{
                    transform: `rotate(${i * 8 - 16}deg) translate(${i * 6 - 12}px, ${Math.sin(i) * 6}px)`,
                    zIndex: 10 - i
                  }}
                >
                  <div className="w-full h-full m-1 border border-amber-300 rounded-lg flex items-center justify-center relative overflow-hidden bg-amber-50/50">
                    <div className="w-12 h-12 rounded-full border border-amber-black bg-white flex items-center justify-center shadow-xs">
                      <Moon className="h-6 w-6 text-amber-700 animate-spin-slow" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-1 font-serif">{t("Shuffling the Sacred Tarot Deck", "पवित्र टैरो डेक को फेंटा जा रहा है")}</h3>
            <p className="text-neutral-600 text-sm">{t("Aligning universal energy fields for your intention...", "आपके उद्देश्य के लिए ब्रह्मांडीय ऊर्जा क्षेत्रों को संरेखित किया जा रहा है...")}</p>
          </div>
        )}

        {/* PICKING CARDS STATE */}
        {readingState === 'picking' && (
          <div className="max-w-5xl mx-auto relative z-10 animate-fadeIn">
            <div className="bg-white border border-amber-200 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between shadow-xs">
              <div className="mb-2 sm:mb-0">
                <span className="text-amber-800 text-xs font-bold uppercase tracking-wider block">{t("Selected Spread", "चयनित स्प्रेड")}</span>
                <span className="text-neutral-900 font-bold text-base sm:text-lg">
                  {language === 'EN' ? selectedSpread.name : selectedSpread.nameHindi || selectedSpread.name}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs sm:text-sm text-neutral-700 font-bold">
                  {t(`Chosen ${selectedCards.length} of ${selectedSpread.cardsNeeded}`, `चुने गए ${selectedCards.length} / ${selectedSpread.cardsNeeded}`)}
                </span>
                <div className="w-24 bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-rose-600 h-full transition-all duration-300"
                    style={{ width: `${(selectedCards.length / selectedSpread.cardsNeeded) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-1 font-serif">
                {t("Draw Your Divine Path", "अपने दिव्य मार्ग का चयन करें")}
              </h2>
              <p className="text-amber-900 text-xs sm:text-sm font-medium flex items-center justify-center">
                <HelpCircle className="h-4 w-4 mr-1 text-amber-600" />
                {t("Focus on your query. Hover and select the card you feel drawn to.", "अपने प्रश्न पर ध्यान केंद्रित करें। कार्ड के ऊपर कर्सर ले जाएं और उसे चुनें जिसकी ओर आप आकर्षित महसूस करते हैं।")}
              </p>
            </div>

            {/* FANNED DECK LAYOUT */}
            <div className="relative h-[320px] md:h-[400px] flex items-end justify-center py-8 mb-12 overflow-hidden">
              <div className="absolute w-[800px] h-[800px] rounded-full border border-dashed border-amber-300/60 top-24 pointer-events-none"></div>

              {fanCards.map((item, index) => {
                const isPicked = selectedCards.some(sel => sel.deckIndex === index);

                const totalCards = fanCards.length;
                const angleSpread = 70;
                const mid = (totalCards - 1) / 2;
                const angle = (index - mid) * (angleSpread / totalCards);
                const translationY = Math.pow(Math.abs(index - mid), 1.8) * (200 / Math.pow(totalCards, 1.8));
                const translationX = (index - mid) * 20;

                return (
                  <button
                    key={index}
                    onClick={() => handleCardPick(index)}
                    disabled={isPicked || selectedCards.length >= selectedSpread.cardsNeeded}
                    style={{
                      transform: `translateX(${translationX}px) translateY(${translationY}px) rotate(${angle}deg)`,
                      zIndex: isPicked ? 0 : 20 + index
                    }}
                    className={`absolute w-36 h-56 md:w-48 md:h-64 rounded-xl transition-all duration-300 origin-bottom border shadow-md cursor-pointer ${isPicked
                      ? 'bg-amber-100/70 border-amber-900 opacity-50 scale-95 pointer-events-none'
                      : 'bg-gradient-to-br from-white via-amber-50 to-orange-50 border-amber-900 hover:border-amber-600 hover:-translate-y-10 hover:shadow-xl'
                      }`}
                  >
                    {/* Top-Left Corner Card Number Badge */}
                    <div className="absolute -top-2.5 -left-2.5 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-600 to-rose-600 text-white font-serif font-black text-xs sm:text-sm flex items-center justify-center shadow-md border-2 border-white ring-1 ring-amber-400">
                      {index + 1}
                    </div>

                    <div className="absolute inset-1 border border-amber-200 rounded-lg flex flex-col items-center justify-between p-3 relative overflow-hidden bg-white/70">
                      <div className="w-full flex justify-between text-xs text-neutral-900 font-serif font-bold">
                        <span className="font-extrabold text-amber-900">#{index + 1}</span>
                        <span className="font-extrabold text-amber-900">#{index + 1}</span>
                      </div>

                      <div className="w-9 h-9 rounded-full border border-amber-300 bg-amber-50 flex items-center justify-center shadow-xs">
                        <span className="text-sm font-black text-neutral-900 font-serif">{index + 1}</span>
                      </div>

                      <div className="w-full flex justify-between text-xs text-neutral-900 font-serif font-bold">
                        <span className="font-extrabold text-amber-900">#{index + 1}</span>
                        <span className="font-extrabold text-amber-900">#{index + 1}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-2 border border-neutral-300 hover:bg-stone-100 text-neutral-800 text-xs font-bold rounded-full transition-all cursor-pointer"
              >
                {t("Choose Another Spread", "दूसरा स्प्रेड चुनें")}
              </button>
            </div>
          </div>
        )}

        {/* REVEAL READINGS STATE */}
        {readingState === 'reveal' && (() => {
          const activeAstro = astrologersList.length > 0 ? astrologersList[currentAstroIndex] : null;
          const rawAstroImg = activeAstro?.profilePicture || activeAstro?.image || activeAstro?.imageUrl || activeAstro?.photo;
          const astroImgSrc = rawAstroImg ? buildAssetUrl(rawAstroImg) : null;
          const astroName = activeAstro ? cleanAstrologerName(activeAstro.name) : 'Tarot Expert';

          return (
            <div className="max-w-7xl mx-auto relative z-10 animate-fadeIn print-area space-y-8">
              <div>
                <div className="flex justify-between items-center mb-6 no-print">
                  <h2 className="text-xl font-bold text-neutral-900 font-serif">{t("Your Drawn Spread", "आपका चयनित स्प्रेड")}</h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={handlePrint}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-800 hover:bg-stone-100 transition-all text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                    >
                      <Download className="h-4 w-4 text-amber-600" />
                      <span>{t("Save / Export PDF", "पीडीएफ सहेजें / निर्यात करें")}</span>
                    </button>
                  </div>
                </div>

                {/* CARD BOARDS GRID + RIGHT SIDE ASTROLOGER FLEX */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Left Column: Cards Grid */}
                  <div className="lg:col-span-9 flex flex-wrap justify-center items-stretch gap-5">
                    {selectedCards.map((item, index) => {
                      const card = item.cardData;
                      const isCurrent = index === revealedIndex;
                      const isAligned = card.element === zodiacInfo.element;
                      const isFlipped = flippedCards[index];

                      return (
                        <button
                          key={index}
                          onClick={() => triggerFlipCard(index)}
                          className={`flex-1 min-w-[240px] max-w-[320px] flex flex-col items-center p-5 rounded-2xl border transition-all duration-300 focus:outline-none cursor-pointer ${isCurrent
                            ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-400 shadow-md scale-[1.02]'
                            : 'bg-white border-neutral-200 hover:bg-amber-50/30 hover:border-amber-300 shadow-xs'
                            } ${isAligned ? 'ring-2 ring-amber-500' : ''}`}
                        >
                          <span className="text-xs uppercase tracking-wider text-amber-800 mb-2 block font-bold">
                            {language === 'EN' ? item.positionName : selectedSpread.positionsHindi[item.positionIndex] || item.positionName}
                          </span>

                          {isAligned && (
                            <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full mb-2 border border-amber-300 font-bold">
                              {t("✨ Element Alignment", "✨ तत्व संरेखण")}
                            </span>
                          )}

                          {/* 3D Flip Card Container */}
                          <div className="w-52 h-72 relative perspective-1000 mb-3 cursor-pointer">
                            <div className={`card-inner w-full h-full relative ${isFlipped ? 'card-flipped' : ''}`}>

                              {/* CARD FRONT (Face down) */}
                              <div className="card-front bg-gradient-to-br from-white via-amber-50 to-orange-50 rounded-xl border-2 border-amber-400 shadow-md flex flex-col items-center justify-between p-4 overflow-hidden">
                                <span className="text-xs font-bold text-amber-800 font-serif">Card #{index + 1}</span>
                                <div className="w-12 h-12 rounded-full border border-amber-300 bg-white flex items-center justify-center shadow-xs">
                                  <span className="text-lg font-black text-amber-900 font-serif">{index + 1}</span>
                                </div>
                                <span className="text-xs text-amber-800 font-bold font-serif tracking-wider">{t("TAP TO FLIP", "पलटने के लिए छुएं")}</span>
                              </div>

                              {/* CARD BACK (Face up image) */}
                              <div className="card-back bg-white rounded-xl border-2 border-amber-400 shadow-md overflow-hidden flex flex-col relative">
                                <img
                                  src={getCardImageUrl(card)}
                                  alt={card.name}
                                  className="w-full h-full object-cover transition-transform duration-500 print-card-img"
                                  style={{ transform: item.isReversed ? 'rotate(180deg)' : 'none' }}
                                  loading="lazy"
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-white/95 py-1.5 px-2 text-center border-t border-amber-200">
                                  <h3 className="text-neutral-900 font-serif font-bold text-sm truncate tracking-wide">
                                    {getCardTranslation(card.id, 'name', card.name)}
                                  </h3>
                                </div>
                              </div>

                            </div>
                          </div>

                          {isFlipped ? (
                            <div className="mt-2 text-center flex flex-col items-center w-full">
                              <h4 className="text-neutral-900 font-serif font-bold text-lg">
                                {getCardTranslation(card.id, 'name', card.name)}
                              </h4>
                              <span className="text-xs font-bold text-emerald-700 mb-2">
                                {item.isReversed ? t("Reversed", "उल्टा (Reversed)") : t("Upright", "सीधा (Upright)")}
                              </span>

                              <div className="mt-1 w-full bg-stone-50 border border-neutral-200 rounded-xl p-2.5 text-neutral-700 text-center">
                                <span className="text-xs text-amber-900 font-bold block mb-0.5">
                                  {card.type === 'Major'
                                    ? t('Major Arcana', 'मुख्य रहस्य (Major Arcana)')
                                    : `${t(card.suit, { Wands: 'दंड', Cups: 'प्याले', Swords: 'तलवारें', Pentacles: 'सिक्के' }[card.suit] || card.suit)} (${t(card.element, { Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी' }[card.element] || card.element)})`
                                  }
                                </span>
                                <span className="text-[11px] block leading-tight text-neutral-600">
                                  {card.type === 'Major'
                                    ? t("Themes: Life milestones, karma, & spirit lesson", "विषय: जीवन के मील के पत्थर, कर्म और आध्यात्मिक सबक")
                                    : `${t("Themes: ", "विषय: ")} ${t(
                                      card.suit === 'Wands' ? 'Action & Ambition' : card.suit === 'Cups' ? 'Emotion & Intuition' : card.suit === 'Swords' ? 'Logic & Challenges' : 'Material & Finances',
                                      card.suit === 'Wands' ? 'कर्म और महत्वाकांक्षा' : card.suit === 'Cups' ? 'भावना और अंतर्ज्ञान' : card.suit === 'Swords' ? 'तर्क और चुनौतियाँ' : 'भौतिक और धन'
                                    )}`
                                  }
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-3 text-xs text-neutral-500 italic">
                              {t("Click card to flip", "कार्ड पलटने के लिए क्लिक करें")}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Separate Section: Live Astrologer Flex on Cards Grid */}
                  <div className="lg:col-span-3 bg-gradient-to-br from-white via-amber-50/50 to-orange-50/60 border border-amber-600 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col justify-between items-center text-center">
                    <div className="w-full flex items-center justify-between border-b border-amber-200/60 pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-950 font-serif">
                          Tarot Expert
                        </span>
                      </div>
                      <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full border border-red-200">
                        LIVE NOW
                      </span>
                    </div>

                    {/* Rotating Astrologer Image & Clean Name (3-sec cycle) */}
                    <div className="my-auto flex flex-col items-center py-2 transition-all duration-500 w-full">
                      <div className="relative p-[3px] rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-500 shadow-md">
                        <div className="w-28 h-36 sm:w-58 sm:h-62 rounded-xl overflow-hidden bg-neutral-900 border-2 border-white flex items-center justify-center">
                          {astroImgSrc ? (
                            <img
                              src={astroImgSrc}
                              alt={astroName}
                              className="w-full h-full object-cover transition-opacity duration-500"
                            />
                          ) : (
                            <span className="text-3xl font-black text-amber-300 font-serif">
                              {astroName.charAt(0) || 'A'}
                            </span>
                          )}
                        </div>
                        <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs"></span>
                      </div>

                      <h4 className="mt-3 text-base sm:text-lg font-bold font-serif text-neutral-900 tracking-tight">
                        {astroName}
                      </h4>
                      <span className="text-[11px] text-neutral-500 font-medium">
                        {activeAstro?.specialties?.[0] || 'Vedic & Tarot Specialist'}
                      </span>

                      {/* Micro indicator dots */}
                      {astrologersList.length > 1 && (
                        <div className="flex items-center gap-1 mt-2.5">
                          {astrologersList.slice(0, Math.min(6, astrologersList.length)).map((_, dotIdx) => (
                            <span
                              key={dotIdx}
                              className={`h-1.5 rounded-full transition-all duration-300 ${dotIdx === currentAstroIndex % Math.min(6, astrologersList.length)
                                ? 'w-4 bg-amber-600'
                                : 'w-1.5 bg-amber-200'
                                }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Slogan at Bottom: "Live Tarot Card Readers" Redirects to Live Astrologers Page */}
                    <Link
                      to="/live-astrologers"
                      className="w-full group mt-3 p-3 bg-white hover:bg-amber-500/10 border-2 border-dashed border-amber-400 hover:border-amber-600 rounded-2xl shadow-xs transition-all transform hover:-translate-y-0.5 text-center flex flex-col items-center justify-center cursor-pointer"
                      title="Click to speak with Live Tarot Readers"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 mb-1">
                        Instant Reading
                      </span>
                      <span className="text-xs sm:text-sm font-black font-serif text-neutral-900 group-hover:text-amber-800 transition-colors leading-tight">
                        "Live Tarot Card Readers"
                      </span>
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">
                        <span>Consult Live Reader</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* DYNAMIC CARD SYNTHESIS & ANALYSIS */}
              {revealedIndex >= 0 && flippedCards[revealedIndex] && (
                <div className="bg-white border border-amber-200 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden animate-slideUp">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-neutral-200">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-amber-800 font-bold block mb-1">
                        {t("Current Focus Position", "वर्तमान फोकस स्थान")}
                      </span>
                      <h3 className="text-2xl font-bold text-neutral-900 font-serif">
                        {language === 'EN'
                          ? selectedCards[revealedIndex].positionName
                          : selectedSpread.positionsHindi[selectedCards[revealedIndex].positionIndex] || selectedCards[revealedIndex].positionName}
                      </h3>
                    </div>

                    <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2">
                      {selectedSpread.cardsNeeded > 1 && (
                        <div className="flex items-center gap-1.5 no-print bg-stone-100 p-1.5 rounded-xl border border-neutral-200">
                          <button
                            onClick={() => setRevealedIndex(prev => Math.max(0, prev - 1))}
                            disabled={revealedIndex === 0}
                            className="px-2.5 py-1 bg-white hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-neutral-800 transition-all border border-neutral-200"
                          >
                            {t("← Prev", "← पिछला")}
                          </button>
                          <span className="text-xs text-neutral-700 font-bold px-1.5">
                            {revealedIndex + 1} / {selectedSpread.cardsNeeded}
                          </span>
                          <button
                            onClick={() => setRevealedIndex(prev => Math.min(selectedSpread.cardsNeeded - 1, prev + 1))}
                            disabled={revealedIndex === selectedSpread.cardsNeeded - 1}
                            className="px-2.5 py-1 bg-white hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-neutral-800 transition-all border border-neutral-200"
                          >
                            {t("Next →", "अगला →")}
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {getCardTranslation(selectedCards[revealedIndex].cardData.id, 'keywords', selectedCards[revealedIndex].cardData.keywords).map((kw, i) => (
                          <span key={i} className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-900 font-bold">
                            {kw}
                          </span>
                        ))}
                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-800 font-bold uppercase">
                          {t(selectedCards[revealedIndex].cardData.element, { Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी' }[selectedCards[revealedIndex].cardData.element] || selectedCards[revealedIndex].cardData.element)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <h4 className="text-lg font-bold text-neutral-900 mb-2 font-serif flex items-center">
                          <Eye className="h-4 w-4 mr-1.5 text-amber-600" />
                          {t("Divined Meaning", "दिव्य अर्थ / वाचन")}
                        </h4>
                        <p className="text-neutral-800 text-sm sm:text-base leading-relaxed font-medium">
                          {selectedCards[revealedIndex].isReversed
                            ? getCardTranslation(selectedCards[revealedIndex].cardData.id, 'reversed', selectedCards[revealedIndex].cardData.reversed)
                            : getCardTranslation(selectedCards[revealedIndex].cardData.id, 'upright', selectedCards[revealedIndex].cardData.upright)
                          }
                        </p>
                      </div>

                      <div>
                        <h5 className="text-base font-bold text-neutral-900 mb-1.5">{t("Focal Energy Advice", "मुख्य ऊर्जा परामर्श")}</h5>
                        <p className="text-neutral-900 text-xs sm:text-[16px] leading-relaxed">
                          {language === 'EN' ? (
                            <>
                              This card advises you to examine how <strong>{selectedCards[revealedIndex].cardData.keywords[0].toLowerCase()}</strong> is currently playing out in your query.
                              {selectedCards[revealedIndex].isReversed
                                ? " The reversed position indicates a block, delay, or internal friction that requires your inner focus to clear."
                                : " The upright position shows clear forward momentum, outer support, or active guidance that you should follow."
                              }
                            </>
                          ) : (
                            <>
                              यह कार्ड आपको सलाह देता है कि आप विचार करें कि आपके जीवन में <strong>{getCardTranslation(selectedCards[revealedIndex].cardData.id, 'keywords', selectedCards[revealedIndex].cardData.keywords)[0]}</strong> किस प्रकार प्रभाव डाल रहा है।
                              {selectedCards[revealedIndex].isReversed
                                ? " उल्टा कार्ड एक अवरोध, देरी या आंतरिक घर्षण को दर्शाता है जिसे दूर करने के लिए आत्म-मंथन और आंतरिक सुधार की आवश्यकता है।"
                                : " सीधा कार्ड स्पष्ट प्रगति, बाहरी समर्थन या सक्रिय मार्गदर्शन दिखाता है जिसका आपको बिना झिझक पालन करना चाहिए।"
                              }
                            </>
                          )}
                        </p>
                      </div>

                      {selectedCards[revealedIndex].cardData.element === zodiacInfo.element && (
                        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 text-amber-900">
                          <span className="font-bold flex items-center mb-1 text-[16px] text-amber-900">
                            <Sparkles className="h-4 w-4 mr-1.5 text-amber-600 animate-pulse" />
                            {t(`Astrological Resonance (${zodiacInfo.element})`, `ज्योतिषीय प्रतिध्वनि (${t(zodiacInfo.element, { Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी' }[zodiacInfo.element] || zodiacInfo.element)})`)}
                          </span>
                          <p className="text-xs sm:text-[16px] text-black leading-relaxed">
                            {language === 'EN' ? (
                              `This card shares the ${zodiacInfo.element} element of your zodiac sign (${zodiacInfo.sign}). The resonance between your energy and this card amplifies its message, indicating that its themes of ${selectedCards[revealedIndex].cardData.keywords.join(', ').toLowerCase()} are highly active and personal in your life right now.`
                            ) : (
                              `यह कार्ड आपकी राशि (${{
                                'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
                                'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
                                'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन'
                              }[zodiacInfo.sign] || zodiacInfo.sign}) के ${t(zodiacInfo.element, { Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी' }[zodiacInfo.element] || zodiacInfo.element)} तत्व को साझा करता है। आपकी ऊर्जा और इस कार्ड के बीच का यह संरेखण इसके संदेश को और अधिक शक्तिशाली बनाता है।`
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-stone-50 border border-neutral-600 rounded-2xl p-5 flex flex-col justify-between">
                      <div>
                        <h4 className="text-[16px] font-bold uppercase tracking-wider text-amber-900 mb-1.5">
                          {t("Synthesis Context", "संश्लेषण संदर्भ")}
                        </h4>
                        <p className="text-xs sm:text-[16px] text-neutral-900 leading-relaxed mb-3">
                          {language === 'EN' ? (
                            `In the context of the ${selectedSpread.name}, this card represents the crucial energy influencing the ${selectedCards[revealedIndex].positionName} phase.`
                          ) : (
                            `चयनित स्प्रेड (${selectedSpread.nameHindi || selectedSpread.name}) के संदर्भ में, यह कार्ड आपके ${selectedSpread.positionsHindi[selectedCards[revealedIndex].positionIndex] || selectedCards[revealedIndex].positionName} चरण को प्रभावित करने वाली महत्वपूर्ण ऊर्जा का प्रतिनिधित्व करता है।`
                          )}
                        </p>

                        <div className="bg-white rounded-xl p-3 border border-neutral-200 text-[16px] mb-3 space-y-1.5 shadow-2xs">
                          <span className="text-neutral-900 font-bold block">
                            {selectedCards[revealedIndex].cardData.type === 'Major'
                              ? t('Major Arcana (Primary Path)', 'मुख्य रहस्य (प्रमुख नियति पथ)')
                              : t(`Minor Arcana - Suit of ${selectedCards[revealedIndex].cardData.suit}`, `गौण रहस्य - ${{ Wands: 'दंड', Cups: 'प्याले', Swords: 'तलवारें', Pentacles: 'सिक्के' }[selectedCards[revealedIndex].cardData.suit] || selectedCards[revealedIndex].cardData.suit} का समूह`)
                            }
                          </span>
                          <span className="text-black block text-[16px] leading-relaxed">
                            {selectedCards[revealedIndex].cardData.type === 'Major'
                              ? t("Themes: Core spiritual principles, milestones, and direct destiny.", "मुख्य विषय: मुख्य आध्यात्मिक सिद्धांत, मील के पत्थर और सीधी नियति।")
                              : t("Themes: Daily scenarios, minor events, and practical issues.", "मुख्य विषय: दैनिक परिदृश्य, छोटी घटनाएं और व्यावहारिक मुद्दे।")
                            }
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-neutral-200 text-[16px]">
                        <div className="flex justify-between">
                          <span className="text-neutral-900">{t("Card Name:", "कार्ड का नाम:")}</span>
                          <span className="font-bold text-neutral-900">
                            {getCardTranslation(selectedCards[revealedIndex].cardData.id, 'name', selectedCards[revealedIndex].cardData.name)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-900">{t("Deck Division:", "डेक श्रेणी:")}</span>
                          <span className="font-bold text-neutral-900">
                            {selectedCards[revealedIndex].cardData.type === 'Major'
                              ? t('Major Arcana', 'मुख्य रहस्य (Major Arcana)')
                              : t('Minor Arcana', 'गौण रहस्य (Minor Arcana)')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-900">{t("Orientation:", "दिशा / स्थिति:")}</span>
                          <span className="font-bold text-emerald-700">
                            {selectedCards[revealedIndex].isReversed ? t('Reversed', 'उल्टा (Reversed)') : t('Upright', 'सीधा (Upright)')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedSpread.cardsNeeded > 1 && (
                    <div className="mt-6 pt-5 border-t border-neutral-200 flex justify-between items-center no-print text-[16px]">
                      <button
                        onClick={() => setRevealedIndex(prev => Math.max(0, prev - 1))}
                        disabled={revealedIndex === 0}
                        className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-bold text-neutral-800 transition-all border border-neutral-200"
                      >
                        {t("← Previous Card", "← पिछला कार्ड")}
                      </button>
                      <span className="text-neutral-600 font-medium">
                        {t(`Card ${revealedIndex + 1} of ${selectedSpread.cardsNeeded}`, `कार्ड ${revealedIndex + 1} / ${selectedSpread.cardsNeeded}`)}
                      </span>
                      <button
                        onClick={() => setRevealedIndex(prev => Math.min(selectedSpread.cardsNeeded - 1, prev + 1))}
                        disabled={revealedIndex === selectedSpread.cardsNeeded - 1}
                        className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-bold text-neutral-800 transition-all border border-neutral-200"
                      >
                        {t("Next Card →", "अगला कार्ड →")}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* INTEGRATED READING SYNTHESIS */}
              {selectedCards.every((_, i) => flippedCards[i]) && (
                <div className="bg-white border border-amber-200 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden animate-slideUp">
                  <h3 className="text-xl font-bold text-neutral-900 mb-4 font-serif flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-amber-600 animate-pulse" />
                    {t("Overall Synthesis of Your Energies", "आपकी ऊर्जाओं का समग्र संश्लेषण")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <div>
                      <h4 className="text-base font-bold text-neutral-900 mb-3">{t("Element Analysis", "तत्व विश्लेषण")}</h4>
                      <div className="space-y-2.5">
                        {Object.entries(resonance.elementCounts).map(([el, count]) => {
                          const pct = (count / selectedCards.length) * 100;
                          return (
                            <div key={el} className="flex items-center space-x-3 text-[16px]">
                              <span className="w-16 text-neutral-700 font-bold">
                                {t(el, { Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी' }[el] || el)}
                              </span>
                              <div className="flex-grow bg-stone-200 h-2.5 rounded-full overflow-hidden border border-neutral-300">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${el === 'Fire' ? 'bg-orange-500' :
                                    el === 'Water' ? 'bg-blue-500' :
                                      el === 'Air' ? 'bg-indigo-500' : 'bg-emerald-500'
                                    }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-neutral-800">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[16px] font-bold text-neutral-900 mb-2">{t("Dominant Force Summary", "प्रमुख बल सारांश")}</h4>
                      <p className="text-neutral-900 text-xs sm:text-[16px] leading-relaxed">
                        {t("Your reading shows a dominant energy of ", "आपके वाचन में प्रमुख ऊर्जा ")}
                        <strong className="text-neutral-900">{t(resonance.dominantElement, { Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी' }[resonance.dominantElement] || resonance.dominantElement)}</strong>
                        {t(".", " की दिखती है।")}
                        {resonance.dominantElement === 'Fire' && t(" This represents high inspiration, action, and active changes happening right now. Be proactive, but don't rush.", " यह आपके जीवन में वर्तमान में हो रही उच्च प्रेरणा, कार्रवाई और सक्रिय बदलावों का प्रतिनिधित्व करता है। सक्रिय रहें, लेकिन जल्दबाजी न करें।")}
                        {resonance.dominantElement === 'Water' && t(" This signifies heavy emphasis on emotions, relationships, and deep internal intuition. Pause and feel your answers.", " यह भावनाओं, संबंधों और गहरी आंतरिक अंतर्ज्ञान पर भारी जोर देता है। ठहरें और अपने उत्तरों को महसूस करें।")}
                        {resonance.dominantElement === 'Air' && t(" This reflects an intellectual period full of calculations, plans, and minor mental blocks that need clear boundaries.", " यह गणनाओं, योजनाओं और छोटे मानसिक अवरोधों से भरे एक बौद्धिक दौर को दर्शाता है, जिसमें स्पष्ट सीमाओं की आवश्यकता होती है।")}
                        {resonance.dominantElement === 'Earth' && t(" This points to career opportunities, financial considerations, and stability. Focus on anchoring your plans.", " यह करियर के अवसरों, वित्तीय विचारों और स्थिरता की ओर इशारा करता है। अपनी योजनाओं को मजबूत करने पर ध्यान केंद्रित करें।")}
                        {!['Fire', 'Water', 'Air', 'Earth'].includes(resonance.dominantElement) && t(" Multiple elements are equally balanced, representing a rich variety of forces guiding you simultaneously.", " कई तत्व समान रूप से संतुलित हैं, जो एक ही समय में आपका मार्गदर्शन करने वाले बलों की समृद्ध विविधता का प्रतिनिधित्व करते हैं।")}
                      </p>
                      {profile.name && (
                        <p className="text-[18px] text-emerald-800 font-semibold mt-2.5 italic">
                          {t(
                            `Aligns with ${profile.name}'s birth sign ${zodiacInfo.sign} (${zodiacInfo.element}).`,
                            `${profile.name} की जन्म राशि ${t(zodiacInfo.sign, {
                              'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
                              'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
                              'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन'
                            }[zodiacInfo.sign] || zodiacInfo.sign)} (${t(zodiacInfo.element, { Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी' }[zodiacInfo.element] || zodiacInfo.element)}) के साथ मेल खाता है।`
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
                    <h4 className="text-[16px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                      {t("Sanctuary Guidance", "साधना स्थल मार्गदर्शन")}
                    </h4>
                    <p className="text-xs sm:text-[16px] text-neutral-900 leading-relaxed font-medium">
                      {t(
                        "Use this reading as a mirror for your self-reflection. The Tarot suggests path options, but your free will decides the direction. Meditate on the synthesized elements as you step forward.",
                        "इस वाचन का उपयोग अपने आत्म-चिंतन के लिए एक दर्पण के रूप में करें। टैरो मार्ग के विकल्प सुझाता है, लेकिन आपकी स्वतंत्र इच्छा दिशा तय करती है। जैसे ही आप आगे कदम बढ़ाएं, संश्लेषित तत्वों पर ध्यान केंद्रित करें।"
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-center space-x-3 no-print">
                <button
                  onClick={initializeShuffle}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-full transition-all flex items-center text-xs sm:text-[16px] shadow-sm cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  {t("Draw Again", "पुनः चयन करें")}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 border border-neutral-300 hover:bg-lime-300 bg-white text-neutral-800 text-xs sm:text-[16px] font-bold rounded-full transition-all shadow-2xs cursor-pointer"
                >
                  {t("Choose Spread", "स्प्रेड बदलें")}
                </button>
              </div>

            </div>
          );
        })()}

      </div>
    </div>
  );
};

export default TarotReading;
