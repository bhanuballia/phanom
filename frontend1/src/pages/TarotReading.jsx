import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';
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
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioCtx = new AudioContextClass();
};

const playAmbient = () => {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  if (ambientOscs.length > 0) return;

  try {
    ambientGain = audioCtx.createGain();
    ambientGain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    ambientGain.connect(audioCtx.destination);

    // Deep baseline frequency D2
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(73.42, audioCtx.currentTime);

    // Minor third A2
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110.00, audioCtx.currentTime);
    const osc2Gain = audioCtx.createGain();
    osc2Gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    osc2.connect(osc2Gain);
    osc2Gain.connect(ambientGain);

    // LFO modulation to simulate a cosmic wave breathing
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(ambientGain.gain);

    osc1.connect(ambientGain);

    osc1.start();
    osc2.start();
    lfo.start();

    ambientOscs = [osc1, osc2, lfo];
  } catch (e) {
    console.error("Audio Context playback error", e);
  }
};

const stopAmbient = () => {
  if (ambientOscs.length === 0) return;
  ambientOscs.forEach(osc => {
    try { osc.stop(); } catch (e) { }
  });
  ambientOscs = [];
  if (ambientGain) {
    try { ambientGain.disconnect(); } catch (e) { }
    ambientGain = null;
  }
};

const playRevealSound = () => {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) { }
};

const playFlipSound = () => {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(680, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.35);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) { }
};

const playShuffleSound = () => {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  try {
    const bufferSize = audioCtx.sampleRate * 1.2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700, audioCtx.currentTime);
    filter.Q.setValueAtTime(1.2, audioCtx.currentTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    gainNode.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.6);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseNode.start();
  } catch (e) { }
};

const TarotReading = () => {
  const [language, setLanguage] = useState('EN'); // 'EN' or 'HI'
  const t = (enText, hiText) => language === 'EN' ? enText : hiText;
  const getCardTranslation = (cardId, field, defaultVal) => {
    if (language === 'EN') return defaultVal;
    const item = TAROT_TRANSLATIONS_HINDI[cardId];
    if (!item) return defaultVal;
    if (field === 'keywords') return item.keywords || defaultVal;
    return item[field] || defaultVal;
  };
  const [profile, setProfile] = useState({ name: '', dob: '' });
  const [zodiacInfo, setZodiacInfo] = useState({ sign: '', element: '' });
  const [selectedSpread, setSelectedSpread] = useState(SPREADS[0]);
  const [readingState, setReadingState] = useState('onboarding');
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [focusQuestion, setFocusQuestion] = useState("");
  const [flippedCards, setFlippedCards] = useState({}); // { [index]: boolean }
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);
  const [selectedSubcategoryIndex, setSelectedSubcategoryIndex] = useState(-1);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, []);

  const handleAudioToggle = () => {
    if (isAudioPlaying) {
      stopAmbient();
      setIsAudioPlaying(false);
    } else {
      playAmbient();
      setIsAudioPlaying(true);
    }
  };

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    if (!profile.name || !profile.dob) return;
    const info = getZodiacInfo(profile.dob);
    setZodiacInfo(info);
    setReadingState('select_spread');
    if (!isAudioPlaying) {
      playAmbient();
      setIsAudioPlaying(true);
    }
  };

  const initializeShuffle = () => {
    setReadingState('shuffling');
    setSelectedCards([]);
    setRevealedIndex(-1);
    setFlippedCards({});
    playShuffleSound();

    setTimeout(() => {
      let deckCopy = [...TAROT_DECK];

      // Shuffle logic based on spread criteria
      if (selectedSpread.id === 'single' || selectedSpread.id === 'decision') {
        deckCopy = deckCopy.filter(card => card.type === 'Minor');
      } else if (selectedSpread.id === 'three' || selectedSpread.id === 'crossroads') {
        deckCopy = deckCopy.filter(card => card.type === 'Major');
      }

      const randomizedDeck = [];
      while (deckCopy.length > 0) {
        const index = Math.floor(Math.random() * deckCopy.length);
        const card = deckCopy.splice(index, 1)[0];
        const isReversed = Math.random() < 0.22;
        randomizedDeck.push({ ...card, isReversed });
      }
      setShuffledDeck(randomizedDeck);
      setReadingState('picking');
    }, 1800);
  };

  const handleCardPick = (deckIndex) => {
    if (readingState !== 'picking' || selectedCards.length >= selectedSpread.cardsNeeded) return;
    if (selectedCards.some(item => item.deckIndex === deckIndex)) return;

    const currentPosIndex = selectedCards.length;
    const positionName = selectedSpread.positions[currentPosIndex];
    const pickedCard = shuffledDeck[deckIndex];

    playFlipSound();

    const newPickedList = [...selectedCards, {
      cardData: pickedCard,
      deckIndex,
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
    if (flippedCards[index]) return; // already flipped
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

    // Find dominant element
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

  // We limit to 24 fanned cards for display aesthetics
  const fanCount = 24;
  const fanCards = shuffledDeck.slice(0, fanCount);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* Custom Global CSS styles injected for CSS transitions and Print layout */}
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
          0% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          50% { opacity: 0.4; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        .particle {
          position: absolute;
          background: radial-gradient(circle, rgba(245,158,11,0.4) 0%, rgba(168,85,247,0) 70%);
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

      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none no-print">
        <div className="particle w-8 h-8 top-1/4 left-1/5" style={{ animationDelay: '0s', animationDuration: '14s' }} />
        <div className="particle w-12 h-12 top-2/3 left-3/4" style={{ animationDelay: '3s', animationDuration: '18s' }} />
        <div className="particle w-6 h-6 top-1/3 right-1/4" style={{ animationDelay: '6s', animationDuration: '10s' }} />
        <div className="particle w-10 h-10 top-3/4 left-1/3" style={{ animationDelay: '1s', animationDuration: '16s' }} />
      </div>

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 md:py-16 relative">
        {/* Glow Spheres */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none no-print"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none no-print"></div>

        {/* Controls Panel */}
        <div className="absolute top-4 right-4 z-50 flex items-center space-x-2 no-print">
          <button
            onClick={() => setLanguage(language === 'EN' ? 'HI' : 'EN')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-purple-500/30 text-purple-300 hover:text-white transition-all text-xs font-semibold backdrop-blur"
          >
            <span>🌐</span>
            <span>{language === 'EN' ? 'हिंदी में पढ़ें' : 'Read in English'}</span>
          </button>
          <button
            onClick={handleAudioToggle}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-purple-500/30 text-purple-300 hover:text-white transition-all text-xs font-semibold backdrop-blur"
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>Music Active</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-slate-500" />
                <span>Music Off</span>
              </>
            )}
          </button>
        </div>

        {/* Header Area */}
        <div className="text-center max-w-3xl mx-auto mb-12 relative z-10 print-container">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-semibold mb-4 no-print">
            <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
            <span>{language === 'EN' ? 'Interactive Divination Sanctuary' : 'इंटरैक्टिव दिव्य साधना स्थल'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent mb-4">
            {profile.name 
              ? (language === 'EN' ? `Welcome, ${profile.name}` : `स्वागत है, ${profile.name}`) 
              : (language === 'EN' ? 'Cosmic Tarot Card Reading' : 'ब्रह्मांडीय टैरो कार्ड रीडिंग')}
          </h1>

          {zodiacInfo.sign ? (
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-sm mb-4">
              <span className="font-semibold text-[20px] text-orange-400">
                {language === 'EN' ? zodiacInfo.sign : {
                  'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
                  'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
                  'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन'
                }[zodiacInfo.sign] || zodiacInfo.sign}
              </span>
              <span className="text-slate-500">•</span>
              <span className=" text-[20px] text-emerald-300 font-medium">
                {language === 'EN' ? `${zodiacInfo.element} Element` : `${
                  zodiacInfo.element === 'Fire' ? 'अग्नि' :
                  zodiacInfo.element === 'Earth' ? 'पृथ्वी' :
                  zodiacInfo.element === 'Air' ? 'वायु' :
                  zodiacInfo.element === 'Water' ? 'जल' : zodiacInfo.element
                } तत्व`}
              </span>
              <span className="text-slate-500">•</span>
              <button
                onClick={() => setReadingState('onboarding')}
                className="text-[16px] text-rose-400 hover:text-purple-300 underline focus:outline-none no-print"
              >
                {language === 'EN' ? 'Change Details' : 'विवरण बदलें'}
              </button>
            </div>
          ) : null}

          {focusQuestion && (
            <div className="mt-2 text-center">
              <span className="text-[20px] text-amber-300 uppercase tracking-widest block font-serif">Focus Intention</span>
              <p className="text-orange-400 text-xl font-medium italic">"{focusQuestion}"</p>
            </div>
          )}
        </div>

        {/* ONBOARDING STATE */}
        {readingState === 'onboarding' && (
          <div className="max-w-md mx-auto relative z-10 animate-fadeIn bg-slate-900/80 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
            <h2 className="text-2xl font-bold text-center text-amber-200 mb-2 flex items-center justify-center">
              <Sparkles className="h-6 w-6 mr-2 text-purple-400" />
              {language === 'EN' ? 'Personalize Your Energy' : 'अपनी ऊर्जा को संरेखित करें'}
            </h2>
            <p className="text-slate-400 text-sm text-center mb-6">
              {language === 'EN' 
                ? 'Connect your cosmic alignment and state your query to align the deck.' 
                : 'डेक को संरेखित करने के लिए अपने ब्रह्मांडीय विवरण और प्रश्न दर्ज करें।'}
            </p>

            <form onSubmit={handleOnboardingSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-350 mb-2" htmlFor="name">
                  {language === 'EN' ? 'Your Sacred Name' : 'आपका पवित्र नाम'}
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  placeholder={language === 'EN' ? 'Enter your name...' : 'अपना नाम दर्ज करें...'}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-slate-650"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-350 mb-2" htmlFor="dob">
                  {language === 'EN' ? 'Date of Birth' : 'जन्म तिथि'}
                </label>
                <input
                  type="date"
                  id="dob"
                  required
                  value={profile.dob}
                  onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-500 hover:from-amber-400 hover:via-purple-500 hover:to-indigo-400 text-black font-bold rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg shadow-purple-950/30 animate-pulse"
              >
                {language === 'EN' ? 'Align energy and Enter' : 'ऊर्जा संरेखित करें और प्रवेश करें'}
              </button>
            </form>
          </div>
        )}

        {/* SELECT SPREAD STATE */}
        {readingState === 'select_spread' && (
          <div className="max-w-5xl mx-auto relative z-10 animate-fadeIn">
            <h2 className="text-2xl font-bold text-center text-slate-200 mb-8 flex items-center justify-center">
              <Layers className="h-6 w-6 mr-2 text-purple-400" />
              {language === 'EN' ? 'Choose Your Divination Spread' : 'अपना दिव्य स्प्रेड चुनें'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {SPREADS.map((spread) => (
                <button
                  key={spread.id}
                  onClick={() => setSelectedSpread(spread)}
                  className={`relative p-6 text-left rounded-2xl border transition-all duration-300 group overflow-hidden ${selectedSpread.id === spread.id
                    ? 'bg-purple-950/45 border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.25)] scale-[1.02]'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full group-hover:scale-125 transition-transform duration-500"></div>

                  <h3 className="text-[22px] font-bold text-amber-200 mb-2 group-hover:text-amber-100 transition-colors">
                    {language === 'EN' ? spread.name : spread.nameHindi || spread.name}
                  </h3>
                  <p className="text-orange-400 text-[18px] mb-4 line-clamp-3">
                    {language === 'EN' ? spread.description : spread.descriptionHindi || spread.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 bg-slate-850 border border-slate-700 rounded-md text-[18px] text-amber-300 font-medium">
                      {spread.cardsNeeded} {language === 'EN' ? (spread.cardsNeeded === 1 ? 'Card Required' : 'Cards Required') : 'कार्ड की आवश्यकता'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-amber-400 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>

            {/* Question / Intention Input Box */}
            <div className="max-w-2xl mx-auto bg-slate-900/40 border border-purple-500/20 rounded-2xl p-6 mb-12">
              <label className="block text-[22px] font-semibold text-orange-400 mb-4 font-serif flex items-center">
                <Sparkles className="h-4 w-4 text-[25px] text-orange-400 mr-2 animate-pulse" />
                {t("Select a Topic & Question (Or write your own)", "एक विषय और प्रश्न चुनें (या अपना स्वयं का लिखें)")}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Category Select */}
                <div>
                  <label className="block text-[18px] text-orange-400 mb-1">{t("Category", "श्रेणी")}</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[18px] text-emerald-200 focus:outline-none focus:border-purple-500"
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
                    <label className="block text-xs text-slate-400 mb-1">{t("Subcategory", "उपश्रेणी")}</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[18px] text-emerald-200 focus:outline-none focus:border-purple-500"
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
                <div className="mb-4">
                  <label className="block text-[20px] text-orange-400 mb-1">{t("Predefined Question", "पूर्व-निर्धारित प्रश्न")}</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[18px] text-emerald-200 focus:outline-none focus:border-purple-500"
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
                <label className="block text-[20px] text-orange-400 mb-1 font-medium" htmlFor="intention">
                  {t("Your Focus Intention", "आपका ध्यान केंद्रित विचार")}
                </label>
                <input
                  type="text"
                  id="intention"
                  placeholder={t("Ex: Will my current creative endeavor bring me success? Or edit the selected question...", "उदा: क्या मेरे वर्तमान प्रयास मुझे सफलता दिलाएंगे? या चयनित प्रश्न को बदलें...")}
                  value={focusQuestion}
                  onChange={(e) => setFocusQuestion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-[18px] text-emerald-200 focus:outline-none focus:border-purple-500 transition-all placeholder-slate-600 text-sm font-medium"
                />
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={initializeShuffle}
                className="px-10 py-4 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-500 hover:from-amber-400 hover:via-purple-500 hover:to-indigo-400 text-[18px] text-black font-bold rounded-full shadow-lg shadow-purple-950/50 hover:shadow-purple-900/50 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-2"
              >
                <Sparkles className="h-5 w-5" />
                <span>{t("Begin Shuffling Deck", "टैरो डेक को फेंटना शुरू करें")}</span>
              </button>
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
                  className="absolute inset-0 bg-gradient-to-br from-purple-950 to-indigo-950 border border-amber-500/40 rounded-xl shadow-2xl flex items-center justify-center transition-all duration-700"
                  style={{
                    transform: `rotate(${i * 8 - 16}deg) translate(${i * 6 - 12}px, ${Math.sin(i) * 6}px)`,
                    zIndex: 10 - i
                  }}
                >
                  <div className="w-full h-full m-1 border border-amber-500/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.08)_0%,transparent_70%)]"></div>
                    <div className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center">
                      <Moon className="h-6 w-6 text-amber-300/45 animate-spin-slow" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="text-xl font-bold text-amber-200 mb-2">{t("Shuffling the Sacred Tarot Deck", "पवित्र टैरो डेक को फेंटा जा रहा है")}</h3>
            <p className="text-slate-400 text-sm">{t("Aligning universal energy fields for your intention...", "आपके उद्देश्य के लिए ब्रह्मांडीय ऊर्जा क्षेत्रों को संरेखित किया जा रहा है...")}</p>
          </div>
        )}

        {/* PICKING CARDS STATE */}
        {readingState === 'picking' && (
          <div className="max-w-5xl mx-auto relative z-10 animate-fadeIn">
            <div className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <span className="text-amber-300 text-xs uppercase tracking-wider block">{t("Selected Spread", "चयनित स्प्रेड")}</span>
                <span className="text-purple-200 font-bold text-lg">
                  {language === 'EN' ? selectedSpread.name : selectedSpread.nameHindi || selectedSpread.name}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-purple-300 font-medium">
                  {t(`Chosen ${selectedCards.length} of ${selectedSpread.cardsNeeded}`, `चुने गए ${selectedCards.length} / ${selectedSpread.cardsNeeded}`)}
                </span>
                <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-amber-400 h-full transition-all duration-300"
                    style={{ width: `${(selectedCards.length / selectedSpread.cardsNeeded) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-100 mb-2">
                {t("Draw Your Divine Path", "अपने दिव्य मार्ग का चयन करें")}
              </h2>
              <p className="text-amber-300/90 text-sm flex items-center justify-center">
                <HelpCircle className="h-4 w-4 mr-1" />
                {t("Focus on your query. Hover and select the card you feel drawn to.", "अपने प्रश्न पर ध्यान केंद्रित करें। कार्ड के ऊपर कर्सर ले जाएं और उसे चुनें जिसकी ओर आप आकर्षित महसूस करते हैं।")}
              </p>
            </div>

            {/* FANNED DECK LAYOUT */}
            <div className="relative h-[320px] md:h-[400px] flex items-end justify-center py-8 mb-16 overflow-hidden">
              <div className="absolute w-[800px] h-[800px] rounded-full border border-dashed border-purple-500/20 top-24 pointer-events-none"></div>

              {fanCards.map((item, index) => {
                const isPicked = selectedCards.some(sel => sel.deckIndex === index);

                // Math to position cards in a beautiful fan/arc
                const totalCards = fanCards.length;
                const angleSpread = 70; // Sweep angle
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
                    className={`absolute w-38 h-60 md:w-52 md:h-68 rounded-xl transition-all duration-300 origin-bottom border shadow-2xl ${isPicked
                      ? 'opacity-20 scale-90 border-purple-500/10 pointer-events-none'
                      : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-amber-500/30 hover:border-amber-400/80 hover:-translate-y-12 hover:shadow-[0_15px_30px_rgba(245,158,11,0.3)]'
                      }`}
                  >
                    <div className="absolute inset-0.5 border border-amber-500/10 rounded-lg flex flex-col items-center justify-between p-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.06)_0%,transparent_60%)]"></div>

                      <div className="w-full flex justify-between text-[8px] text-amber-500/20 font-serif">
                        <span>★</span>
                        <span>★</span>
                      </div>

                      <div className="w-10 h-10 rounded-full border border-amber-500/20 flex items-center justify-center">
                        <Moon className="h-4 w-4 text-amber-500/30" />
                      </div>

                      <div className="w-full flex justify-between text-[8px] text-amber-500/20 font-serif">
                        <span>★</span>
                        <span>★</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-2 border border-slate-700 hover:border-slate-600 hover:bg-slate-900 text-slate-300 text-sm font-semibold rounded-full transition-all"
              >
                {t("Choose Another Spread", "दूसरा स्प्रेड चुनें")}
              </button>
            </div>
          </div>
        )}

        {/* REVEAL READINGS STATE */}
        {readingState === 'reveal' && (
          <div className="max-w-5xl mx-auto relative z-10 animate-fadeIn print-area">

            <div className="mb-12">
              <div className="flex justify-between items-center mb-6 no-print">
                <h2 className="text-xl font-bold text-amber-200">{t("Your Drawn Spread", "आपका चयनित स्प्रेड")}</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={handlePrint}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850 hover:text-white transition-all text-[18px] font-semibold"
                  >
                    <Download className="h-4 w-4" />
                    <span>{t("Save / Export PDF", "पीडीएफ सहेजें / निर्यात करें")}</span>
                  </button>
                </div>
              </div>

              {/* CARD BOARDS GRID */}
              <div className="flex flex-wrap justify-center items-stretch gap-6">
                {selectedCards.map((item, index) => {
                  const card = item.cardData;
                  const isCurrent = index === revealedIndex;
                  const isAligned = card.element === zodiacInfo.element;
                  const isFlipped = flippedCards[index];

                  return (
                    <button
                      key={index}
                      onClick={() => triggerFlipCard(index)}
                      className={`flex-1 min-w-[240px] max-w-[320px] flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 focus:outline-none ${isCurrent
                        ? 'bg-slate-900 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)] scale-[1.02]'
                        : 'bg-[#070318] border-purple-900/40 hover:bg-[#0c0524] hover:border-purple-500/70'
                        } ${isAligned ? 'ring-1 ring-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''}`}
                    >
                      <span className="text-[18px] uppercase tracking-widest text-orange-400 mb-2 block font-semibold">
                        {language === 'EN' ? item.positionName : selectedSpread.positionsHindi[item.positionIndex] || item.positionName}
                      </span>

                      {isAligned && (
                        <span className="text-[18px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full mb-2 animate-pulse border border-amber-500/30 font-medium">
                          {t("✨ Element Alignment", "✨ तत्व संरेखण")}
                        </span>
                      )}

                      {/* 3D Flip Card Container */}
                      <div className="w-56 h-80 relative perspective-1000 mb-4 cursor-pointer">
                        <div className={`card-inner w-full h-full relative ${isFlipped ? 'card-flipped' : ''}`}>

                          {/* CARD FRONT (Face down) */}
                          <div className="card-front bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-xl border-2 border-amber-500/50 shadow-2xl flex flex-col items-center justify-between p-4 overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.06)_0%,transparent_70%)]"></div>
                            <span className="text-[10px] text-amber-500/30 font-serif">★</span>
                            <div className="w-12 h-12 rounded-full border border-amber-500/20 flex items-center justify-center animate-pulse">
                              <Moon className="h-6 w-6 text-amber-500/40" />
                            </div>
                            <span className="text-xs text-amber-300/60 font-serif tracking-widest">{t("TAP TO FLIP", "पलटने के लिए छुएं")}</span>
                          </div>

                          {/* CARD BACK (Face up image) */}
                          <div className="card-back bg-slate-950 rounded-xl border-2 border-amber-500/80 shadow-2xl overflow-hidden flex flex-col relative">
                            <img
                              src={getCardImageUrl(card)}
                              alt={card.name}
                              className="w-full h-full object-cover transition-transform duration-500 print-card-img"
                              style={{ transform: item.isReversed ? 'rotate(180deg)' : 'none' }}
                              loading="lazy"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 py-1.5 px-2 text-center border-t border-amber-500/35 backdrop-blur-sm">
                              <h3 className="text-orange-400 font-serif font-bold text-[20px] truncate tracking-wide">
                                {getCardTranslation(card.id, 'name', card.name)}
                              </h3>
                            </div>
                          </div>

                        </div>
                      </div>

                      {isFlipped ? (
                        <div className="mt-2 text-center flex flex-col items-center">
                          <h4 className="text-orange-400 font-serif font-bold text-[24px]">
                            {getCardTranslation(card.id, 'name', card.name)}
                          </h4>
                          <span className="text-[18px] text-emerald-300 mb-2">
                            {item.isReversed ? t("Reversed", "उल्टा (Reversed)") : t("Upright", "सीधा (Upright)")}
                          </span>

                          <div className="mt-1 max-w-[360px] bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-slate-400 text-center">
                            <span className="text-[20px] text-orange-400 font-bold block mb-0.5">
                              {card.type === 'Major' 
                                ? t('Major Arcana', 'मुख्य रहस्य (Major Arcana)') 
                                : `${t(card.suit, {Wands: 'दंड', Cups: 'प्याले', Swords: 'तलवारें', Pentacles: 'सिक्के'}[card.suit] || card.suit)} (${t(card.element, {Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी'}[card.element] || card.element)})`
                              }
                            </span>
                            <span className="text-[18px] block leading-tight text-emerald-400">
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
                        <div className="text-center py-4 text-xs text-slate-500 italic">
                          {t("Click card to flip", "कार्ड पलटने के लिए क्लिक करें")}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC CARD SYNTHESIS & ANALYSIS */}
            {revealedIndex >= 0 && flippedCards[revealedIndex] && (
              <div className="bg-slate-900/60 border border-purple-500/30 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden animate-slideUp mb-12">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
                      {t("Current Focus Position", "वर्तमान फोकस स्थान")}
                    </span>
                    <h3 className="text-2xl font-bold text-orange-400">
                      {language === 'EN' 
                        ? selectedCards[revealedIndex].positionName 
                        : selectedSpread.positionsHindi[selectedCards[revealedIndex].positionIndex] || selectedCards[revealedIndex].positionName}
                    </h3>
                  </div>

                  <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                    {getCardTranslation(selectedCards[revealedIndex].cardData.id, 'keywords', selectedCards[revealedIndex].cardData.keywords).map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-950/60 border border-purple-500/30 rounded-full text-[18px] text-yellow-400 font-semibold">
                        {kw}
                      </span>
                    ))}
                    <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[18px] text-emerald-400 font-semibold uppercase">
                      {t(selectedCards[revealedIndex].cardData.element, {Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी'}[selectedCards[revealedIndex].cardData.element] || selectedCards[revealedIndex].cardData.element)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h4 className="text-[22px] font-bold text-amber-200 mb-3 font-serif flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-amber-300" />
                      {t("Divined Meaning", "दिव्य अर्थ / वाचन")}
                    </h4>
                    <p className="text-emerald-300 text-[20px] leading-relaxed mb-6">
                      {selectedCards[revealedIndex].isReversed
                        ? getCardTranslation(selectedCards[revealedIndex].cardData.id, 'reversed', selectedCards[revealedIndex].cardData.reversed)
                        : getCardTranslation(selectedCards[revealedIndex].cardData.id, 'upright', selectedCards[revealedIndex].cardData.upright)
                      }
                    </p>

                    <h5 className="text-[22px] font-semibold text-amber-200 mb-2">{t("Focal Energy Advice", "मुख्य ऊर्जा परामर्श")}</h5>
                    <p className="text-emerald-300 text-[20px] leading-relaxed mb-4">
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

                    {selectedCards[revealedIndex].cardData.element === zodiacInfo.element && (
                      <div className="mt-6 p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200">
                        <span className="font-bold flex items-center mb-2 text-sm text-amber-300">
                          <Sparkles className="h-5 w-5 mr-2 text-amber-400 animate-pulse" />
                          {t(`Astrological Resonance (${zodiacInfo.element})`, `ज्योतिषीय प्रतिध्वनि (${t(zodiacInfo.element, {Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी'}[zodiacInfo.element] || zodiacInfo.element)})`)}
                        </span>
                        <p className="text-sm text-amber-400/90 leading-relaxed">
                          {language === 'EN' ? (
                            `This card shares the ${zodiacInfo.element} element of your zodiac sign (${zodiacInfo.sign}). The resonance between your energy and this card amplifies its message, indicating that its themes of ${selectedCards[revealedIndex].cardData.keywords.join(', ').toLowerCase()} are highly active and personal in your life right now.`
                          ) : (
                            `यह कार्ड आपकी राशि (${{
                              'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
                              'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
                              'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन'
                            }[zodiacInfo.sign] || zodiacInfo.sign}) के ${t(zodiacInfo.element, {Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी'}[zodiacInfo.element] || zodiacInfo.element)} तत्व को साझा करता है। आपकी ऊर्जा और इस कार्ड के बीच का यह संरेखण इसके संदेश को और अधिक शक्तिशाली बनाता है।`
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-950/80 border border-purple-500/20 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-orange-400 font-bold text-[20px] uppercase tracking-wider mb-2">
                        {t("Synthesis Context", "संश्लेषण संदर्भ")}
                      </h4>
                      <p className="text-[18px] text-emerald-300 leading-relaxed mb-4">
                        {language === 'EN' ? (
                          `In the context of the ${selectedSpread.name}, this card represents the crucial energy influencing the ${selectedCards[revealedIndex].positionName} phase.`
                        ) : (
                          `चयनित स्प्रेड (${selectedSpread.nameHindi || selectedSpread.name}) के संदर्भ में, यह कार्ड आपके ${selectedSpread.positionsHindi[selectedCards[revealedIndex].positionIndex] || selectedCards[revealedIndex].positionName} चरण को प्रभावित करने वाली महत्वपूर्ण ऊर्जा का प्रतिनिधित्व करता है।`
                        )}
                      </p>

                      <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800 text-[11px] mb-4 space-y-2">
                        <div>
                          <span className="text-orange-400 text-[20px] font-bold block">
                            {selectedCards[revealedIndex].cardData.type === 'Major'
                              ? t('Major Arcana (Primary Path)', 'मुख्य रहस्य (प्रमुख नियति पथ)')
                              : t(`Minor Arcana - Suit of ${selectedCards[revealedIndex].cardData.suit}`, `गौण रहस्य - ${{Wands: 'दंड', Cups: 'प्याले', Swords: 'तलवारें', Pentacles: 'सिक्के'}[selectedCards[revealedIndex].cardData.suit] || selectedCards[revealedIndex].cardData.suit} का समूह`)
                            }
                          </span>
                          <span className="text-[18px] text-emerald-300 block mt-0.5">
                            {selectedCards[revealedIndex].cardData.type === 'Major'
                              ? t("Themes: Core spiritual principles, milestones, and direct destiny.", "मुख्य विषय: मुख्य आध्यात्मिक सिद्धांत, मील के पत्थर और सीधी नियति।")
                              : t("Themes: Daily scenarios, minor events, and practical issues.", "मुख्य विषय: दैनिक परिदृश्य, छोटी घटनाएं और व्यावहारिक मुद्दे।")
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[20px] text-orange-400">{t("Card Name:", "कार्ड का नाम:")}</span>
                        <span className="font-semibold text-[20px] text-emerald-350">
                          {getCardTranslation(selectedCards[revealedIndex].cardData.id, 'name', selectedCards[revealedIndex].cardData.name)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[20px] text-orange-400">{t("Deck Division:", "डेक श्रेणी:")}</span>
                        <span className="font-semibold text-[20px] text-emerald-350">
                          {selectedCards[revealedIndex].cardData.type === 'Major' 
                            ? t('Major Arcana', 'मुख्य रहस्य (Major Arcana)') 
                            : t('Minor Arcana', 'गौण रहस्य (Minor Arcana)')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[20px] text-orange-400">{t("Orientation:", "दिशा / स्थिति:")}</span>
                        <span className="font-semibold text-[20px] text-emerald-300">
                          {selectedCards[revealedIndex].isReversed ? t('Reversed', 'उल्टा (Reversed)') : t('Upright', 'सीधा (Upright)')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedSpread.cardsNeeded > 1 && (
                  <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center no-print">
                    <button
                      onClick={() => setRevealedIndex(prev => Math.max(0, prev - 1))}
                      disabled={revealedIndex === 0}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-all"
                    >
                      {t("← Previous Card", "← पिछला कार्ड")}
                    </button>
                    <span className="text-xs text-slate-400">
                      {t(`Card ${revealedIndex + 1} of ${selectedSpread.cardsNeeded}`, `कार्ड ${revealedIndex + 1} / ${selectedSpread.cardsNeeded}`)}
                    </span>
                    <button
                      onClick={() => setRevealedIndex(prev => Math.min(selectedSpread.cardsNeeded - 1, prev + 1))}
                      disabled={revealedIndex === selectedSpread.cardsNeeded - 1}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-all"
                    >
                      {t("Next Card →", "अगला कार्ड →")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* INTEGRATED READING SYNTHESIS */}
            {selectedCards.every((_, i) => flippedCards[i]) && (
              <div className="bg-slate-900/60 border border-amber-500/30 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden animate-slideUp mb-12">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-2xl"></div>
                <h3 className="text-xl font-bold text-amber-200 mb-4 font-serif flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-orange-400 animate-pulse" />
                  {t("Overall Synthesis of Your Energies", "आपकी ऊर्जाओं का समग्र संश्लेषण")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h4 className="text-[20px] font-semibold text-orange-400 mb-3">{t("Element Analysis", "तत्व विश्लेषण")}</h4>
                    <div className="space-y-3">
                      {Object.entries(resonance.elementCounts).map(([el, count]) => {
                        const pct = (count / selectedCards.length) * 100;
                        return (
                          <div key={el} className="flex items-center space-x-3">
                            <span className="w-16 text-[20px] text-yellow-400 font-medium">
                              {t(el, {Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी'}[el] || el)}
                            </span>
                            <div className="flex-grow bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${el === 'Fire' ? 'bg-orange-500' :
                                  el === 'Water' ? 'bg-blue-500' :
                                    el === 'Air' ? 'bg-indigo-400' : 'bg-emerald-500'
                                  }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-300">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[20px] font-semibold text-orange-400 mb-3">{t("Dominant Force Summary", "प्रमुख बल सारांश")}</h4>
                    <p className="text-[20px] text-slate-350 leading-relaxed">
                      {t("Your reading shows a dominant energy of ", "आपके वाचन में प्रमुख ऊर्जा ")}
                      <strong>{t(resonance.dominantElement, {Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी'}[resonance.dominantElement] || resonance.dominantElement)}</strong>
                      {t(".", " की दिखती है।")}
                      {resonance.dominantElement === 'Fire' && t(" This represents high inspiration, action, and active changes happening right now. Be proactive, but don't rush.", " यह आपके जीवन में वर्तमान में हो रही उच्च प्रेरणा, कार्रवाई और सक्रिय बदलावों का प्रतिनिधित्व करता है। सक्रिय रहें, लेकिन जल्दबाजी न करें।")}
                      {resonance.dominantElement === 'Water' && t(" This signifies heavy emphasis on emotions, relationships, and deep internal intuition. Pause and feel your answers.", " यह भावनाओं, संबंधों और गहरी आंतरिक अंतर्ज्ञान पर भारी जोर देता है। ठहरें और अपने उत्तरों को महसूस करें।")}
                      {resonance.dominantElement === 'Air' && t(" This reflects an intellectual period full of calculations, plans, and minor mental blocks that need clear boundaries.", " यह गणनाओं, योजनाओं और छोटे मानसिक अवरोधों से भरे एक बौद्धिक दौर को दर्शाता है, जिसमें स्पष्ट सीमाओं की आवश्यकता होती है।")}
                      {resonance.dominantElement === 'Earth' && t(" This points to career opportunities, financial considerations, and stability. Focus on anchoring your plans.", " यह करियर के अवसरों, वित्तीय विचारों और स्थिरता की ओर इशारा करता है। अपनी योजनाओं को मजबूत करने पर ध्यान केंद्रित करें।")}
                      {!['Fire', 'Water', 'Air', 'Earth'].includes(resonance.dominantElement) && t(" Multiple elements are equally balanced, representing a rich variety of forces guiding you simultaneously.", " कई तत्व समान रूप से संतुलित हैं, जो एक ही समय में आपका मार्गदर्शन करने वाले बलों की समृद्ध विविधता का प्रतिनिधित्व करते हैं।")}
                    </p>
                    {profile.name && (
                      <p className="text-[18px] text-yellow-400 mt-3 italic">
                        {t(
                          `Aligns with ${profile.name}'s birth sign ${zodiacInfo.sign} (${zodiacInfo.element}).`,
                          `${profile.name} की जन्म राशि ${t(zodiacInfo.sign, {
                            'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
                            'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
                            'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन'
                          }[zodiacInfo.sign] || zodiacInfo.sign)} (${t(zodiacInfo.element, {Fire: 'अग्नि', Water: 'जल', Air: 'वायु', Earth: 'पृथ्वी'}[zodiacInfo.element] || zodiacInfo.element)}) के साथ मेल खाता है।`
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl">
                  <h4 className="text-[20px] font-bold text-amber-300 uppercase tracking-widest mb-1">
                    {t("Sanctuary Guidance", "साधना स्थल मार्गदर्शन")}
                  </h4>
                  <p className="text-[18px] text-slate-350 leading-relaxed">
                    {t(
                      "Use this reading as a mirror for your self-reflection. The Tarot suggests path options, but your free will decides the direction. Meditate on the synthesized elements as you step forward.",
                      "इस वाचन का उपयोग अपने आत्म-चिंतन के लिए एक दर्पण के रूप में करें। टैरो मार्ग के विकल्प सुझाता है, लेकिन आपकी स्वतंत्र इच्छा दिशा तय करती है। जैसे ही आप आगे कदम बढ़ाएं, संश्लेषित तत्वों पर ध्यान केंद्रित करें।"
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-12 flex justify-center space-x-4 no-print">
              <button
                onClick={initializeShuffle}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500  text-[25px] text-black font-bold rounded-full transition-all flex items-center text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("Draw Again", "पुनः चयन करें")}
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-3 border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-orange-400 text-[25px] font-bold rounded-full transition-all"
              >
                {t("Choose Spread", "स्प्रेड बदलें")}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TarotReading;
