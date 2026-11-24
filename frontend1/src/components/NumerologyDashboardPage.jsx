import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, User, ArrowLeft, RefreshCw, Star, Compass, Flame, ShieldAlert, Award, AlertCircle, ToggleLeft, CheckCircle, Heart, Coins, Baby, Briefcase, Landmark, Volume2, VolumeX, Play, Square, Radio, Activity, Zap, Clock, Sun } from "lucide-react";

// Chaldean Numerology Letter Values
const CHALDEAN_MAP = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3,
  'H': 5, 'I': 1, 'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5,
  'O': 7, 'P': 8, 'Q': 1, 'R': 2, 'S': 3, 'T': 4, 'U': 6,
  'V': 6, 'W': 6, 'X': 5, 'Y': 1, 'Z': 7
};

const COMPOUND_LUCKY_DETAILS = {
  10: { title: "Wheel of Fortune", desc: "Brings success, honor, and rises in fortune." },
  15: { title: "Spiritual Power", desc: "Brings magnetic personality, charisma, and luck." },
  19: { title: "The Prince of Heaven", desc: "Extremely lucky. Brings health, victory, and high honors." },
  23: { title: "Royal Star of the Bull", desc: "Extremely lucky. Overcomes obstacles, excellent for business/career." },
  24: { title: "Venus Harmony", desc: "Brings support from friends, love, and artistic talents." },
  27: { title: "The Scepter", desc: "Auspicious. Represents power, influence, and leadership." },
  32: { title: "Universal Messenger", desc: "Very lucky. Popularity, success in public relations and business." },
  33: { title: "Master Nurturer", desc: "Master number. Creative brilliance and financial success." },
  37: { title: "Fortunate Union", desc: "Indicates success in partnerships, love, and commercial ventures." },
  41: { title: "Intellectual Leader", desc: "Great for writing, public speaking, and digital business." },
  42: { title: "Venus Luxury", desc: "Brings comforts, professional advancement, and luxury." },
  45: { title: "Charming Crown", desc: "A symbol of success, popularity, and high achievements." },
  46: { title: "The Crown of Life", desc: "Brings fame, leadership, and great success." },
  50: { title: "Mercury Intelligence", desc: "Brings adaptability, luck in travel, and sharp business mind." },
  51: { title: "Royal Commander", desc: "Brings unexpected success, authority, and power." }
};

const FRIENDLY_NUMBERS = {
  1: [1, 2, 3, 5, 9],
  2: [1, 2, 3, 7],
  3: [1, 3, 5, 7, 9],
  4: [1, 3, 5, 6, 7],
  5: [1, 3, 5, 6],
  6: [3, 5, 6, 9],
  7: [1, 2, 3, 5, 7],
  8: [3, 5, 6],
  9: [1, 3, 5, 9]
};

const PLANET_NAMES = {
  1: "Sun",
  2: "Moon",
  3: "Jupiter",
  4: "Rahu",
  5: "Mercury",
  6: "Venus",
  7: "Ketu",
  8: "Saturn",
  9: "Mars"
};

const VASTU_DIRECTIONS = {
  4: { zone: "Southeast (SE)", element: "Wood", aspect: "Wealth & Cash Flow", issue: "Wealth leaks, financial instability, bad investment luck", remedy: "Place a healthy green plant or a green aventurine tree in this corner." },
  9: { zone: "South (S)", element: "Fire", aspect: "Fame, Name & Recognition", issue: "Lack of fame/recognition, low energy levels, lack of confidence", remedy: "Place a red bulb, light a red candle daily, or keep a copper emblem." },
  2: { zone: "Southwest (SW)", element: "Earth", aspect: "Relationships & Marriage", issue: "Marriage instability, frequent misunderstandings, relationship stress", remedy: "Place rose quartz crystal lovebirds or a family photo in a golden frame." },
  3: { zone: "East (E)", element: "Wood", aspect: "Health, Ancestors & Family", issue: "Strained family relations, weak health, lack of growth", remedy: "Hang a green aventurine crystal hanging or place wooden artifacts here." },
  5: { zone: "Center (Brahmasthan)", element: "Earth", aspect: "Stability, Focus & Balance", issue: "Instability, confusion, lack of focus in daily life", remedy: "Keep this area clean and free of heavy clutter. Place a yellow crystal tree here." },
  7: { zone: "West (W)", element: "Metal", aspect: "Wisdom, Skills & Children", issue: "Delays in learning, difficulty in concentration, creativity blocks", remedy: "Hang a 6-rod or 7-rod metal windchime or keep a metal globe here." },
  8: { zone: "Northeast (NE)", element: "Earth", aspect: "Knowledge & Savings", issue: "High expenses, money leaks, lack of clarity", remedy: "Keep a rock salt lamp or a bowl of sea salt in this corner." },
  1: { zone: "North (N)", element: "Water", aspect: "Career Opportunities", issue: "Career stagnation, lack of job options or promotion blocks", remedy: "Keep a small water fountain or a painting of a peaceful water body." },
  6: { zone: "Northwest (NW)", element: "Metal", aspect: "Helpful Friends & Support", issue: "Lack of support, loneliness, bad luck with networking", remedy: "Hang a silver key or keep a metal windchime in the northwest corner." }
};

const NUMEROLOGY_RUDRAKSHA_DATA = {
  1: { dates: "1st, 10th, 19th, 28th", planet: "Sun (Surya)", mukhi: "1 Mukhi Rudraksha", icon: "👑", benefits: "Leadership, focus, and confidence." },
  2: { dates: "2nd, 11th, 20th, 29th", planet: "Moon (Chandra)", mukhi: "2 Mukhi Rudraksha", icon: "🌙", benefits: "Emotional balance and peace." },
  3: { dates: "3rd, 12th, 21st, 30th", planet: "Jupiter (Guru)", mukhi: "4 or 5 Mukhi Rudraksha", icon: "🕉️", benefits: "Wisdom, knowledge, and growth." },
  4: { dates: "4th, 13th, 22nd, 31st", planet: "Rahu", mukhi: "9 Mukhi Rudraksha", icon: "🛡️", benefits: "Courage and protection." },
  5: { dates: "5th, 14th, 23rd", planet: "Mercury (Budh)", mukhi: "14 or 6 Mukhi Rudraksha", icon: "⚡", benefits: "Sharp intellect and communication." },
  6: { dates: "6th, 15th, 24th", planet: "Venus (Shukra)", mukhi: "6 Mukhi or Gauri Shankar Rudraksha", icon: "💎", benefits: "Harmony and luxury." },
  7: { dates: "7th, 16th, 25th", planet: "Ketu", mukhi: "7 Mukhi or Ganesh Rudraksha", icon: "🧘", benefits: "Intuition and grounding." },
  8: { dates: "8th, 17th, 26th", planet: "Saturn (Shani)", mukhi: "7 Mukhi or 14 Mukhi Rudraksha", icon: "⚖️", benefits: "Ease obstacles and attract stability." },
  9: { dates: "9th, 18th, 27th", planet: "Mars (Mangal)", mukhi: "3 Mukhi Rudraksha", icon: "🔥", benefits: "Energy, action, and overcoming fears." }
};

const REPEATED_NUMBERS_DATA = {
  1: {
    planet: "Sun (Surya)",
    domain: "Communication, Self-Expression & Ego",
    icon: "☀️",
    1: "Good communicator, balanced self-confidence, can express thoughts clearly.",
    2: "Highly communicative, articulate speaker, empathetic listener, balanced ego.",
    3: "Talkative, highly expressive, can be overly opinionated, talks without stopping, or turns quiet suddenly.",
    4: "Ego clashes, difficulty listening to others, struggle with self-expression, over-dominant or deeply misunderstood."
  },
  2: {
    planet: "Moon (Chandra)",
    domain: "Intuition, Sensitivity & Emotions",
    icon: "🌙",
    1: "Sensitive, intuitive, cooperative, gentle nature.",
    2: "Master Builder energy; high intuition, deep empathy, artistic, excellent emotional intelligence.",
    3: "Hyper-sensitive, moody, easily hurt, over-analytical in relationships, prone to anxiety or overthinking.",
    4: "Emotional volatility, trust issues, extreme mood swings, difficulty making practical decisions without emotional bias."
  },
  3: {
    planet: "Jupiter (Guru)",
    domain: "Knowledge, Wisdom & Creativity",
    icon: "🕉️",
    1: "Good memory, logical thinker, creative, values education.",
    2: "High imagination, great wisdom, natural teacher/mentor, excellent writing or speech skills.",
    3: "Over-imaginative, day-dreamer, impractical, difficulty focusing on one project, intellectual arrogance.",
    4: "Scattered energy, over-thinking, unrealistically high standards for others, digestive/liver health sensitivity."
  },
  4: {
    planet: "Rahu",
    domain: "Structure, Discipline, Practicality & Money",
    icon: "🛡️",
    1: "Organized, systematic, practical, respects rules and hard work.",
    2: "Extremely methodical, detail-oriented, hard worker, excellent in finance, IT, law, or engineering.",
    3: "Workaholic, rigid, stubborn, prone to material obsession or worry about financial security.",
    4: "Heavy mental stress, over-controlling nature, fear of failure, difficulty adapting to sudden changes."
  },
  5: {
    planet: "Mercury (Budh)",
    domain: "Balance, Adaptability & Communication",
    icon: "⚡",
    1: "Emotionally balanced, adaptable, good freedom-seeker, versatile.",
    2: "Highly dynamic, charismatic, energetic, great in business/trading, loves travel and adventure.",
    3: "Restless, risk-taker, prone to impulse spending, sudden decisions, difficulty staying still.",
    4: "Reckless behavior, boundary-pushing, difficulty maintaining long-term routines, speech or nervous tension."
  },
  6: {
    planet: "Venus (Shukra)",
    domain: "Family, Luxury, Romance & Harmony",
    icon: "💎",
    1: "Family-oriented, loves beauty/comforts, caring, responsible.",
    2: "High artistic taste, strong love for luxury, protective parent/partner, attractive personality.",
    3: "Over-protective, possessive in love, perfectionist, over-spends on luxury/comforts.",
    4: "Excessive attachment to material world, anxiety regarding family/partner, high expectations from loved ones."
  },
  7: {
    planet: "Ketu",
    domain: "Intuition, Research, Spirituality & Disappointment",
    icon: "🧘",
    1: "Analytical, spiritual leaning, learns through experience.",
    2: "Deep intuitive power, analytical researcher, spiritual depth, philosophical mind.",
    3: "Experiences emotional or financial setbacks early in life that lead to profound spiritual awakening; detachment.",
    4: "Deep isolation, severe trust issues, highly unconventional path, living in a world of deep mystical thoughts."
  },
  8: {
    planet: "Saturn (Shani)",
    domain: "Wealth, Executive Power, Karma & Discipline",
    icon: "⚖️",
    1: "Good manager, respects authority, detail-focused, practical with money.",
    2: "Strong financial acumen, high executive presence, natural business leadership, persistent.",
    3: "Fluctuations in wealth, life lessons through hard labor, delayed success, high sense of justice/karma.",
    4: "Extreme highs and lows, struggle with authority figures, intense karmic payback cycles, need for strict ethical living."
  },
  9: {
    planet: "Mars (Mangal)",
    domain: "Energy, Courage, Humanitarianism & Temperament",
    icon: "🔥",
    1: "Courageous, helpful, energetic, cares for society.",
    2: "High ambition, sharp mind, natural leader, strong drive to achieve goals.",
    3: "Short-tempered, quick to anger, overly competitive, impulsive actions followed by regret.",
    4: "Aggressive energy, ego clashes, extreme impatience, proneness to minor accidents or burnouts if energy is not channeled into sports/fitness."
  }
};

function reduceToSingleDigit(number) {
  let temp = number;
  while (temp > 9) {
    temp = temp.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return temp;
}

function getChaldeanSum(name) {
  let total = 0;
  const uppercase = name.toUpperCase();
  for (let i = 0; i < uppercase.length; i++) {
    const char = uppercase[i];
    if (CHALDEAN_MAP[char]) {
      total += CHALDEAN_MAP[char];
    }
  }
  return total;
}

function generateSpellingCorrections(fullName, mulank, bhagyank) {
  const cleanName = fullName.trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length === 0) return [];

  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");

  const suggestions = new Map();

  // Helper to add suggestion
  const addSuggestion = (fName, lName, method) => {
    const full = lName ? `${fName} ${lName}` : fName;
    if (full.toUpperCase() === cleanName.toUpperCase()) return;

    // Calculate Chaldean
    let total = 0;
    const upperFull = full.toUpperCase();
    for (let char of upperFull) {
      if (CHALDEAN_MAP[char]) {
        total += CHALDEAN_MAP[char];
      }
    }
    const single = reduceToSingleDigit(total);

    // Check compatibility
    const isMulankFriendly = FRIENDLY_NUMBERS[mulank]?.includes(single);
    const isBhagyankFriendly = FRIENDLY_NUMBERS[bhagyank]?.includes(single);

    if (isMulankFriendly && isBhagyankFriendly) {
      const score = COMPOUND_LUCKY_DETAILS[total] ? 95 : 85;
      suggestions.set(full, {
        name: full,
        compound: total,
        single: single,
        score: score,
        method: method,
        friendlyWith: "Both Psychic & Destiny"
      });
    } else if (isMulankFriendly) {
      const score = COMPOUND_LUCKY_DETAILS[total] ? 80 : 70;
      suggestions.set(full, {
        name: full,
        compound: total,
        single: single,
        score: score,
        method: method,
        friendlyWith: "Psychic Number"
      });
    }
  };

  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const consonants = ['S', 'R', 'L', 'N', 'M', 'T', 'G', 'D', 'H'];

  // Method 1: Append suffix vowel/consonant
  addSuggestion(firstName + 'a', lastName, "Append 'a' to first name");
  addSuggestion(firstName + 'i', lastName, "Append 'i' to first name");
  addSuggestion(firstName + 'e', lastName, "Append 'e' to first name");
  addSuggestion(firstName + 'h', lastName, "Append 'h' to first name");

  // Method 2: Double vowels inside the first name
  for (let i = 0; i < firstName.length; i++) {
    const char = firstName[i].toUpperCase();
    if (vowels.includes(char)) {
      const mod = firstName.slice(0, i + 1) + char.toLowerCase() + firstName.slice(i + 1);
      addSuggestion(mod, lastName, `Double vowel '${char.toLowerCase()}'`);
    }
  }

  // Method 3: Double key consonants
  for (let i = 0; i < firstName.length; i++) {
    const char = firstName[i].toUpperCase();
    if (consonants.includes(char)) {
      const mod = firstName.slice(0, i + 1) + char.toLowerCase() + firstName.slice(i + 1);
      addSuggestion(mod, lastName, `Double consonant '${char.toLowerCase()}'`);
    }
  }

  // Method 4: Modify last name (if exists)
  if (lastName) {
    addSuggestion(firstName, lastName + 'a', "Append 'a' to last name");
    addSuggestion(firstName, lastName + 'h', "Append 'h' to last name");

    const lastParts = lastName.split(/\s+/);
    const lastPart = lastParts[0];
    const restLast = lastParts.slice(1).join(" ");

    for (let i = 0; i < lastPart.length; i++) {
      const char = lastPart[i].toUpperCase();
      if (vowels.includes(char) || consonants.includes(char)) {
        const modPart = lastPart.slice(0, i + 1) + char.toLowerCase() + lastPart.slice(i + 1);
        const newLastName = restLast ? `${modPart} ${restLast}` : modPart;
        addSuggestion(firstName, newLastName, `Modify last name spelling`);
      }
    }
  }

  return Array.from(suggestions.values())
    .sort((a, b) => b.score - a.score || a.compound - b.compound)
    .slice(0, 10);
}

export default function NumerologyDashboard() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [nameSystem, setNameSystem] = useState("Chaldean"); // "Chaldean" | "Pythagorean"
  const [activeTab, setActiveTab] = useState("report");
  const [hoveredPlane, setHoveredPlane] = useState(null); // 'mental' | 'emotional' | 'practical' | 'thought' | 'will' | 'action' | 'golden' | 'silver' | null
  const [selectedForecastMonth, setSelectedForecastMonth] = useState(new Date().getMonth() + 1); // 1 to 12

  const isCellHighlighted = (num) => {
    if (!hoveredPlane) return false;
    const planeName = hoveredPlane.toLowerCase();
    if (planeName.includes('mental')) return [4, 9, 2].includes(num);
    if (planeName.includes('emotional') || planeName.includes('heart')) return [3, 5, 7].includes(num);
    if (planeName.includes('practical')) return [8, 1, 6].includes(num);
    if (planeName.includes('thought')) return [4, 3, 8].includes(num);
    if (planeName.includes('will')) return [9, 5, 1].includes(num);
    if (planeName.includes('action')) return [2, 7, 6].includes(num);
    if (planeName.includes('golden') || planeName.includes('success')) return [4, 5, 6].includes(num);
    if (planeName.includes('silver') || planeName.includes('willpower') || planeName.includes('determination')) return [2, 5, 8].includes(num);
    return false;
  };

  const getMonthForecast = (num) => {
    const data = {
      1: {
        title: "New Beginnings & Fresh Start",
        focus: "Personal independence, fresh ventures, and leadership.",
        advice: "A month to start new projects, change direction, and trust your gut. Stand out and be proactive!"
      },
      2: {
        title: "Partnership, Harmony & Patience",
        focus: "Cooperation, diplomatic talks, and emotional connections.",
        advice: "Focus on relationships and teamwork. It is a time for patience and listening rather than forcing decisions."
      },
      3: {
        title: "Creative Expression & Expansion",
        focus: "Social life, artistic expression, and communication.",
        advice: "Excellent period for writing, presenting, and socializing. Express yourself freely and stay optimistic."
      },
      4: {
        title: "Structure, Discipline & Security",
        focus: "Hard work, system setups, and financial grounding.",
        advice: "Focus on details, health, and grounding your plans. A month to put down roots and work diligently."
      },
      5: {
        title: "Change, Freedom & Adaptability",
        focus: "Travel, exploration, shifting gears, and adventure.",
        advice: "Be open to unexpected options. Network, travel, and let go of stagnant structures. Embrace change!"
      },
      6: {
        title: "Family, Domestic Harmony & Healing",
        focus: "Home life, community service, and relationship repair.",
        advice: "Nurture your loved ones, beautify your home, and take responsibility. Excellent month for healing family bonds."
      },
      7: {
        title: "Introspection, Analysis & Spirituality",
        focus: "Self-reflection, studies, meditation, and quiet time.",
        advice: "Spend time alone in nature. Analyze your path, read spiritual or academic works, and rest your mind."
      },
      8: {
        title: "Material Success & Abundance",
        focus: "Financial control, business deals, and power.",
        advice: "A power month. Claim your authority, make smart business/career decisions, and focus on abundance."
      },
      9: {
        title: "Completion, Humanitarianism & Release",
        focus: "Ending outdated cycles, forgiving others, and charity.",
        advice: "Clean out clutter (physical and emotional). Forgive past issues, donate to charity, and prepare for the next cycle."
      }
    };
    return data[num] || data[1];
  };

  const getDayForecast = (num) => {
    const data = {
      1: {
        tagline: "Action & Leadership",
        advice: "Start a new habit, pitch a new concept, or take independent control of your tasks. Avoid self-doubt."
      },
      2: {
        tagline: "Collaboration & Harmony",
        advice: "Perfect day for romantic dates, quiet dinners, mediation, or signing joint agreements. Stay calm."
      },
      3: {
        tagline: "Creativity & Socializing",
        advice: "Speak up, share ideas, write creative content, or call friends. Enjoy life and stay lighthearted today."
      },
      4: {
        tagline: "Hard Work & Details",
        advice: "Organize files, clean your room, review budgets, or set clear guidelines. Focus on solid tasks."
      },
      5: {
        tagline: "Adventure & Adaptability",
        advice: "Try a new route, meet new contacts, embrace spontaneous plan changes, or travel. Be flexible today."
      },
      6: {
        tagline: "Nurturing & Relationships",
        advice: "Help a family member, cook a healthy meal, resolve domestic disputes, or focus on home decor. Show love."
      },
      7: {
        tagline: "Research & Meditation",
        advice: "Read a book, meditate, study difficult concepts, or spend quiet hours in introspection. Avoid noise."
      },
      8: {
        tagline: "Power & Wealth",
        advice: "Make investments, demand what you deserve, negotiate contracts, or work on high-value business deals."
      },
      9: {
        tagline: "Release & Compassion",
        advice: "Donate unwanted goods, finish pending chores, forgive someone, and avoid starting brand-new projects."
      }
    };
    return data[num] || data[1];
  };

  // Marriage Compatibility states
  const [partnerAName, setPartnerAName] = useState("");
  const [partnerADob, setPartnerADob] = useState("");
  const [partnerBName, setPartnerBName] = useState("");
  const [partnerBDob, setPartnerBDob] = useState("");
  const [compatResult, setCompatResult] = useState(null);
  const [compatLoading, setCompatLoading] = useState(false);
  const [compatError, setCompatError] = useState(null);

  const [quantumData, setQuantumData] = useState(null);

  // Brand & Business Name Resonance Tuner state
  const [brandInput, setBrandInput] = useState("");
  const [brandResult, setBrandResult] = useState(null);

  // Mobile Numerology state
  const [mobileInput, setMobileInput] = useState("");
  const [mobileResult, setMobileResult] = useState(null);

  const calculateMobileNumerology = (phoneStr, userMulank, userBhagyank) => {
    if (!phoneStr) return null;
    const digits = phoneStr.replace(/\D/g, "");
    if (digits.length !== 10) return null;

    // Compound & Single sum
    let compoundSum = digits.split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
    let singleDigit = compoundSum;
    while (singleDigit > 9) {
      singleDigit = String(singleDigit).split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
    }

    const planetName = PLANET_NAMES[singleDigit] || "Sun";
    const compoundInfo = COMPOUND_LUCKY_DETAILS[compoundSum] || {
      title: `Vibration ${compoundSum}`,
      desc: `Carries the combined essence of number ${singleDigit} governed by ${planetName}.`
    };

    // Pairs Analysis
    const pairs = [];
    const PAIR_KNOWLEDGE = {
      "15": { type: "LUCKY", label: "Business Luck & Growth", desc: "Brings strong communication, trade opportunities, and mental agility." },
      "51": { type: "LUCKY", label: "Business Luck & Growth", desc: "Brings strong communication, trade opportunities, and mental agility." },
      "24": { type: "STRESS", label: "Emotional Volatility", desc: "Can bring mental anxiety, stress, or sudden mood fluctuations." },
      "42": { type: "STRESS", label: "Emotional Volatility", desc: "Can bring mental anxiety, stress, or sudden mood fluctuations." },
      "18": { type: "CHALLENGE", label: "Struggle & Delay", desc: "Requires hard work before fruitfulness; watch out for obstacles." },
      "81": { type: "CHALLENGE", label: "Struggle & Delay", desc: "Requires hard work before fruitfulness; watch out for obstacles." },
      "36": { type: "CREATIVE", label: "Creative & Luxury Fusion", desc: "Brings artistic expression, teaching ability, and luxury charm." },
      "63": { type: "CREATIVE", label: "Creative & Luxury Fusion", desc: "Brings artistic expression, teaching ability, and luxury charm." },
      "56": { type: "LUCKY", label: "Wealth & Magnetism", desc: "Highly auspicious pair for commercial gain, luxury, and networking." },
      "65": { type: "LUCKY", label: "Wealth & Magnetism", desc: "Highly auspicious pair for commercial gain, luxury, and networking." },
      "48": { type: "CHALLENGE", label: "Sudden Ups & Downs", desc: "Brings unpredictable karmic shifts; requires high discipline." },
      "84": { type: "CHALLENGE", label: "Sudden Ups & Downs", desc: "Brings unpredictable karmic shifts; requires high discipline." },
      "99": { type: "POWER", label: "High Courage & Energy", desc: "Double Mars energy: intense power, drive, and protective instinct." },
      "55": { type: "POWER", label: "Sharp Intellect & Speed", desc: "Double Mercury energy: fast processing, high digital aptitude." }
    };

    for (let i = 0; i < digits.length - 1; i++) {
      const pairStr = digits.slice(i, i + 2);
      if (PAIR_KNOWLEDGE[pairStr]) {
        pairs.push({ pair: pairStr, ...PAIR_KNOWLEDGE[pairStr] });
      }
    }

    // Digit Frequencies
    const frequencies = {};
    for (let d of digits) {
      frequencies[d] = (frequencies[d] || 0) + 1;
    }

    // Compatibility check with Mulank & Bhagyank
    const mul = userMulank || (result?.mulankDetails?.number) || null;
    const bhag = userBhagyank || (result?.bhagyankDetails?.number) || null;

    let isMulFriendly = mul ? FRIENDLY_NUMBERS[mul]?.includes(singleDigit) : null;
    let isBhagFriendly = bhag ? FRIENDLY_NUMBERS[bhag]?.includes(singleDigit) : null;

    let harmonyScore = 75;
    if (isMulFriendly && isBhagFriendly) harmonyScore = 95;
    else if (isMulFriendly || isBhagFriendly) harmonyScore = 82;
    else if (mul && !isMulFriendly) harmonyScore = 55;

    if (COMPOUND_LUCKY_DETAILS[compoundSum]) harmonyScore += 5;
    harmonyScore = Math.min(99, Math.max(40, harmonyScore));

    // Mobile Cover & Wallpaper Remedies mapping
    const REMEDY_MAP = {
      1: {
        coverColors: ["Golden Yellow", "Ruby Red", "Bright Orange", "Warm Amber"],
        avoidColors: ["Black", "Dark Navy Blue"],
        wallpaperTheme: "Rising Sun, 7 Running Golden Horses facing East, Majestic Lions, Solar Geometry.",
        wallpaperDesc: "Enhances leadership, authority, high energy, confidence, and career recognition."
      },
      2: {
        coverColors: ["Silver", "Pearl White", "Cream", "Light Sky Blue"],
        avoidColors: ["Dark Red", "Jet Black"],
        wallpaperTheme: "Calm Lake Reflection, Full Moon, Peaceful Waterfalls, White Lotus floating in Water.",
        wallpaperDesc: "Brings emotional stability, inner peace, creative intuition, and harmonious public relations."
      },
      3: {
        coverColors: ["Royal Yellow", "Saffron", "Deep Purple", "Gold"],
        avoidColors: ["Dark Navy Blue"],
        wallpaperTheme: "Sacred Geometry, Golden Temple, Expanding Rays of Light, Stack of Ancient Books / Wisdom.",
        wallpaperDesc: "Attracts financial expansion, higher knowledge, spiritual wisdom, and guidance."
      },
      4: {
        coverColors: ["Electric Blue", "Steel Grey", "Metallic Silver", "Cyan"],
        avoidColors: ["Bright Crimson Red"],
        wallpaperTheme: "Abstract Futuristic Digital Grids, Cyberpunk Polygons, High-Tech Nodes, Metallic Crystals.",
        wallpaperDesc: "Channelizes Rahu energy for tech innovation, out-of-the-box thinking, and sudden opportunities."
      },
      5: {
        coverColors: ["Emerald Green", "Mint Green", "Pastel Shades", "Light Olive"],
        avoidColors: ["Dark Navy Blue", "Blood Red"],
        wallpaperTheme: "Lush Green Bamboo Forest, Birds in Flight, Financial Growth Gradients, Mercury Caduceus.",
        wallpaperDesc: "Boosts commercial intelligence, trade, quick decision making, and speech magnetism."
      },
      6: {
        coverColors: ["Pastel Pink", "Pure White", "Cyan Blue", "Rose Gold"],
        avoidColors: ["Dark Ochre Yellow", "Charcoal Black"],
        wallpaperTheme: "Pink Lotus Flowers, Aesthetic Art, Glowing Crystals, Sparkling Diamond Gradients.",
        wallpaperDesc: "Invites luxury, romantic charm, beauty, comfort, and lucrative artistic ventures."
      },
      7: {
        coverColors: ["Light Violet", "Sea Green", "Soft Lavender", "Sky Blue"],
        avoidColors: ["Dark Crimson Red", "Jet Black"],
        wallpaperTheme: "Snowy Mountain Peaks, Deep Forest Meditation Trails, Starry Cosmic Galaxies.",
        wallpaperDesc: "Strengthens analytical research, intuition, mental clarity, and spiritual protection."
      },
      8: {
        coverColors: ["Dark Navy Blue", "Charcoal Grey", "Steel Blue", "Deep Indigo"],
        avoidColors: ["Bright Red", "Bright Yellow"],
        wallpaperTheme: "Granite Rock Textures, Ancient Heritage Stone Architecture, Iron Bridges, Midnight Sky.",
        wallpaperDesc: "Provides long-term career stability, discipline, financial grounding, and perseverance."
      },
      9: {
        coverColors: ["Bright Crimson", "Coral Red", "Deep Orange", "Terracotta"],
        avoidColors: ["Jet Black", "Dark Green"],
        wallpaperTheme: "Rising Phoenix, Flaming Ember Trails, High-Speed Motion Graphics, Bold Geometric Red.",
        wallpaperDesc: "Ignites physical vigor, courage, quick execution, protection from competitors, and passion."
      }
    };

    const targetNum = mul || singleDigit;
    const remedyData = REMEDY_MAP[targetNum] || REMEDY_MAP[1];

    return {
      phoneStr,
      digits,
      compoundSum,
      singleDigit,
      planetName,
      compoundInfo,
      pairs,
      frequencies,
      harmonyScore,
      isMulFriendly,
      isBhagFriendly,
      mul,
      bhag,
      remedyData
    };
  };

  const calculateBrandResonance = (nameStr, ownerMulankVal, ownerBhagyankVal) => {
    if (!nameStr) return null;
    const cleaned = nameStr.replace(/[^a-zA-Z]/g, "").toUpperCase();
    if (!cleaned) return null;

    let rawTotal = 0;
    for (let i = 0; i < cleaned.length; i++) {
      rawTotal += CHALDEAN_MAP[cleaned[i]] || 0;
    }

    let singleDigit = rawTotal;
    while (singleDigit > 9) {
      singleDigit = String(singleDigit).split("").reduce((acc, curr) => acc + parseInt(curr), 0);
    }

    const planetMap = {
      1: { planet: "Sun", freq: 528, element: "Fire", color: "Gold & Ruby Red", traits: "Authority, Leadership, Pioneer Status" },
      2: { planet: "Moon", freq: 432, element: "Water", color: "Silver & Pure White", traits: "Emotional Appeal, Public Relations, Nurturing" },
      3: { planet: "Jupiter", freq: 639, element: "Ether", color: "Yellow & Royal Purple", traits: "Expansion, Wisdom, High Growth" },
      4: { planet: "Rahu", freq: 741, element: "Air/Shadow", color: "Electric Blue & Metallic", traits: "Disruptive Tech, Innovation, Viral Growth" },
      5: { planet: "Mercury", freq: 852, element: "Earth/Air", color: "Emerald Green", traits: "Commerce, Digital Speed, High Sales" },
      6: { planet: "Venus", freq: 963, element: "Water/Luxury", color: "Pastel Pink & Gold", traits: "Luxury, Beauty, Comfort, High Margins" },
      7: { planet: "Ketu", freq: 174, element: "Fire/Moksha", color: "Violet & Sea Green", traits: "Niche Mastery, Research, Spiritual Appeal" },
      8: { planet: "Saturn", freq: 285, element: "Earth/Karma", color: "Dark Navy & Steel", traits: "Long-term Stability, Real Estate, Enterprise" },
      9: { planet: "Mars", freq: 396, element: "Fire/Action", color: "Bright Crimson & Orange", traits: "Energy, Defense, Sports, Bold Execution" },
    };

    const pInfo = planetMap[singleDigit] || planetMap[1];

    let harmony = 100;
    if (ownerMulankVal) {
      const diff1 = Math.abs(ownerMulankVal - singleDigit);
      harmony -= diff1 * 7;
    }
    if (ownerBhagyankVal) {
      const diff2 = Math.abs(ownerBhagyankVal - singleDigit);
      harmony -= diff2 * 4;
    }
    harmony = Math.max(45, Math.min(99, harmony));

    const compoundDetail = COMPOUND_LUCKY_DETAILS[rawTotal] || null;

    let statusText = "Super Resonance";
    if (harmony < 65) statusText = "Vibrational Shift Advised";
    else if (harmony < 82) statusText = "Good Harmony";

    return {
      brandName: nameStr,
      rawTotal,
      singleDigit,
      planet: pInfo.planet,
      freq: pInfo.freq,
      element: pInfo.element,
      color: pInfo.color,
      traits: pInfo.traits,
      harmony,
      statusText,
      compoundDetail
    };
  };

  const getDailyQuantumVoltage = (userMulank, userBhagyank) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = today.getMonth() + 1;
    const dd = today.getDate();

    const dateDigits = `${yyyy}${String(mm).padStart(2, "0")}${String(dd).padStart(2, "0")}`.split("").map(Number);
    let univSum = dateDigits.reduce((acc, curr) => acc + curr, 0);
    while (univSum > 9) {
      univSum = String(univSum).split("").reduce((acc, curr) => acc + parseInt(curr), 0);
    }

    const mul = userMulank || 1;
    const bhag = userBhagyank || 1;

    let voltage = 100 - (Math.abs(univSum - mul) * 6 + Math.abs(univSum - bhag) * 4);
    voltage = Math.max(52, Math.min(98, voltage));

    const planetMap = {
      1: { planet: "Sun", freq: 528, color: "Gold & Ruby Red", focus: "Authority, Executive Decisions & New Launches" },
      2: { planet: "Moon", freq: 432, color: "Pearl White & Silver", focus: "Public Relations, Intuition & Collaborative Agreements" },
      3: { planet: "Jupiter", freq: 639, color: "Yellow & Royal Purple", focus: "Financial Expansion, Higher Learning & Strategic Planning" },
      4: { planet: "Rahu", freq: 741, color: "Electric Blue & Metallic", focus: "Innovation, Disruptive Ideas & High Tech Execution" },
      5: { planet: "Mercury", freq: 852, color: "Emerald Green", focus: "Commercial Trading, Sales Calls & Rapid Networking" },
      6: { planet: "Venus", freq: 963, color: "Pastel Pink & Royal Gold", focus: "Creative Design, Luxury Pitching & Relationship Harmony" },
      7: { planet: "Ketu", freq: 174, color: "Light Violet & Sea Green", focus: "Deep Research, Technical Mastery & Meditation" },
      8: { planet: "Saturn", freq: 285, color: "Dark Navy & Charcoal", focus: "Structural Operations, Complex Tasks & Long-term Investments" },
      9: { planet: "Mars", freq: 396, color: "Bright Crimson & Coral", focus: "Bold Execution, Competitive Moves & Negotiations" },
    };

    const pData = planetMap[univSum] || planetMap[1];

    const windows = [
      { time: "06:00 AM - 09:00 AM", slot: "Morning Solar Alignment", planet: "Sun / Jupiter", score: 92, type: "Golden Window", desc: "Prime window for high-level strategy, pitch calls & meditation." },
      { time: "09:00 AM - 12:00 PM", slot: "Mid-Day Voltage Peak", planet: "Mercury / Venus", score: 88, type: "High Manifestation", desc: "Ideal for sales presentations, financial transactions & deal closing." },
      { time: "12:00 PM - 03:00 PM", slot: "Afternoon Karma Cycle", planet: "Mars / Rahu", score: 74, type: "Execution Focus", desc: "Best for intense operations, analytical coding & routine execution." },
      { time: "03:00 PM - 06:00 PM", slot: "Pre-Sunset Energy Peak", planet: "Jupiter / Sun", score: 96, type: "Golden Window", desc: "Super-charged slot for launching products, signing contracts & big announcements." },
      { time: "06:00 PM - 09:00 PM", slot: "Evening Solfeggio Resonance", planet: "Moon / Venus", score: 86, type: "Harmonic Flow", desc: "Best for networking dinners, creative arts & relationship bonding." },
      { time: "09:00 PM - 12:00 AM", slot: "Night Quantum Void Tuning", planet: "Ketu / Saturn", score: 80, type: "Recharge Window", desc: "Perfect for Solfeggio audio therapy, journaling & deep restful sleep." },
    ];

    return {
      todayFormatted: today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      univNumber: univSum,
      planet: pData.planet,
      freq: pData.freq,
      color: pData.color,
      focus: pData.focus,
      voltage,
      windows
    };
  };

  // Solfeggio Web Audio Synth State
  const [playingFreq, setPlayingFreq] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [binauralMode, setBinauralMode] = useState(true);
  const audioCtxRef = React.useRef(null);
  const osc1Ref = React.useRef(null);
  const osc2Ref = React.useRef(null);
  const gainNodeRef = React.useRef(null);

  const stopAudio = () => {
    try {
      if (osc1Ref.current) { osc1Ref.current.stop(); osc1Ref.current.disconnect(); osc1Ref.current = null; }
      if (osc2Ref.current) { osc2Ref.current.stop(); osc2Ref.current.disconnect(); osc2Ref.current = null; }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) { console.error("Audio stop error:", e); }
    setIsPlayingAudio(false);
    setPlayingFreq(null);
  };

  const playSolfeggioTone = (freqHz) => {
    stopAudio();
    if (!freqHz) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freqHz, ctx.currentTime);
      osc1.connect(gain);
      osc1.start();
      osc1Ref.current = osc1;

      if (binauralMode) {
        const osc2 = ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(freqHz + 4, ctx.currentTime);
        osc2.connect(gain);
        osc2.start();
        osc2Ref.current = osc2;
      }

      setPlayingFreq(freqHz);
      setIsPlayingAudio(true);
    } catch (e) {
      console.error("Audio synth error:", e);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlName = params.get("name");
    const urlDob = params.get("date");
    const urlTab = params.get("tab");
    if (urlTab === "quantum") {
      setActiveTab("quantum");
    } else if (urlTab === "mobile") {
      setActiveTab("mobile");
    } else if (urlTab === "prediction") {
      setActiveTab("prediction");
    }
    if (urlName) setName(urlName);
    if (urlDob) {
      setDob(urlDob);
      if (urlName) {
        // Auto trigger calculation if both parameters exist
        (async () => {
          setLoading(true);
          try {
            const response = await fetch("/api/numerology/detailed-report", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
              },
              body: JSON.stringify({ name: urlName, dob: urlDob }),
            });
            if (response.ok) {
              const data = await response.json();
              setResult(data);
            }

            // Also fetch Quantum Analysis
            const qRes = await fetch("/api/numerology/quantum/calculate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: urlName, dob: urlDob }),
            });
            if (qRes.ok) {
              const qData = await qRes.json();
              setQuantumData(qData);
            }
          } catch (e) {
            console.error("Auto calculation failed:", e);
          } finally {
            setLoading(false);
          }
        })();
      }
    }
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!name || !dob) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/numerology/detailed-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify({ name, dob }),
      });
      if (!response.ok) {
        throw new Error("Failed to compute detailed numerology report");
      }
      const data = await response.json();
      setResult(data);

      const qRes = await fetch("/api/numerology/quantum/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dob }),
      });
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuantumData(qData);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "An error occurred while calculating.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/numerology';
    }
  };

  const resetForm = () => {
    setResult(null);
    setName("");
    setDob("");
  };

  // Loshu Grid indices mapper
  const getGridVal = (num) => {
    const count = result?.loshuGrid?.[num] || 0;
    if (count === 0) return "-";
    return String(num).repeat(count);
  };

  const getLoshuGridForDOB = (dobStr) => {
    const grid = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    if (!dobStr) return { grid, mulank: 0, bhagyank: 0 };

    const parts = dobStr.split('-');
    let digitsStr = "";
    let mulank = 0;
    let bhagyank = 0;

    if (parts.length === 3) {
      let year = parts[0];
      const month = parts[1];
      const day = parts[2];

      if (year.length === 4) {
        year = year.slice(2);
      }
      digitsStr = year + month + day;

      const dayVal = parseInt(day, 10);
      mulank = reduceToSingleDigit(dayVal);

      const allDigits = dobStr.replace(/\D/g, '').split('').map(Number);
      const sum = allDigits.reduce((acc, d) => acc + d, 0);
      bhagyank = reduceToSingleDigit(sum);
    }

    for (let char of digitsStr) {
      const val = parseInt(char, 10);
      if (grid[val] !== undefined) {
        grid[val] += 1;
      }
    }

    if (mulank && grid[mulank] !== undefined) {
      grid[mulank] += 1;
    }
    if (bhagyank && grid[bhagyank] !== undefined) {
      grid[bhagyank] += 1;
    }

    return { grid, mulank, bhagyank };
  };

  const renderMarriageCompatibilityPanel = () => {
    const handleCalculateCompatibility = (e) => {
      e.preventDefault();
      if (!partnerAName || !partnerADob || !partnerBName || !partnerBDob) {
        setCompatError("Please fill in details for both partners");
        return;
      }
      setCompatLoading(true);
      setCompatError(null);

      try {
        const dataA = getLoshuGridForDOB(partnerADob);
        const dataB = getLoshuGridForDOB(partnerBDob);

        const p1 = dataA.mulank;
        const p2 = dataB.mulank;
        const d1 = dataA.bhagyank;
        const d2 = dataB.bhagyank;

        const isMulankFriendly = FRIENDLY_NUMBERS[p1]?.includes(p2);
        const isBhagyankFriendly = FRIENDLY_NUMBERS[d1]?.includes(d2);

        let planetaryScore = 50;
        let planetaryMsg = "";
        if (isMulankFriendly && isBhagyankFriendly) {
          planetaryScore = 95;
          planetaryMsg = "Highly harmonious birth connections! Your ruling planetary forces are friendly, creating mutual respect and support.";
        } else if (isMulankFriendly || isBhagyankFriendly) {
          planetaryScore = 75;
          planetaryMsg = "Good birth connection. One of your core numbers is in planetary harmony, helping you connect well at either a mental or destiny level.";
        } else {
          planetaryScore = 45;
          planetaryMsg = "Neutral to challenging birth alignment. Your planetary energies are different, which may require active compromise and understanding.";
        }

        let totalMissingA = 0;
        let filledByB = 0;
        let totalMissingB = 0;
        let filledByA = 0;

        for (let i = 1; i <= 9; i++) {
          if (dataA.grid[i] === 0) {
            totalMissingA++;
            if (dataB.grid[i] > 0) filledByB++;
          }
          if (dataB.grid[i] === 0) {
            totalMissingB++;
            if (dataA.grid[i] > 0) filledByA++;
          }
        }

        const totalMissingSlots = totalMissingA + totalMissingB;
        const totalGapsFilled = filledByB + filledByA;
        const complementaryScore = totalMissingSlots > 0
          ? Math.round((totalGapsFilled / totalMissingSlots) * 100)
          : 100;

        let pillarPoints = 0;
        const has2A = dataA.grid[2] > 0;
        const has2B = dataB.grid[2] > 0;
        const has5A = dataA.grid[5] > 0;
        const has5B = dataB.grid[5] > 0;
        const has6A = dataA.grid[6] > 0;
        const has6B = dataB.grid[6] > 0;

        if (has2A && has2B) pillarPoints += 30;
        else if (has2A || has2B) pillarPoints += 15;

        if (has5A && has5B) pillarPoints += 15;
        else if (has5A || has5B) pillarPoints += 8;

        if (has6A && has6B) pillarPoints += 15;
        else if (has6A || has6B) pillarPoints += 8;

        const hasCombinedPillars = (has2A || has2B) && (has5A || has5B) && (has6A || has6B);
        if (hasCombinedPillars) pillarPoints += 40;

        const relationshipScore = Math.min(Math.round((pillarPoints / 100) * 100), 100);
        const overallScore = Math.round((planetaryScore * 0.3) + (complementaryScore * 0.4) + (relationshipScore * 0.3));

        const remediesList = [];
        if (!has2A && !has2B) {
          remediesList.push({
            title: "Strengthen Love Vibration (Missing 2)",
            desc: "Both partners lack the number 2. Place a pair of rose quartz love birds or a crystal tree in the Southwest corner of your bedroom to foster deep emotional bonding and understanding."
          });
        }
        if (!has5A && !has5B) {
          remediesList.push({
            title: "Establish Relationship Stability (Missing 5)",
            desc: "Both partners lack the stabilizing number 5. Keep a green aventurine pyramid or crystal tree in the center of your home to balance communication and maintain relationship harmony."
          });
        }
        if (!has6A && !has6B) {
          remediesList.push({
            title: "Enhance Romance and Family Support (Missing 6)",
            desc: "Both partners lack the number 6. Wear silver ornaments, keep Northwestern areas clean, or place golden metallic curtains to invite warmth, family support, and romantic vibes."
          });
        }
        if (planetaryScore < 60) {
          remediesList.push({
            title: "Planetary Harmony Remedy",
            desc: "Chant the Gayatri Mantra or Sri Suktam together on Fridays to nullify clashes between your birth path planets and bring spiritual synergy."
          });
        }

        setCompatResult({
          partnerA: {
            name: partnerAName,
            dob: partnerADob,
            grid: dataA.grid,
            mulank: dataA.mulank,
            bhagyank: dataA.bhagyank
          },
          partnerB: {
            name: partnerBName,
            dob: partnerBDob,
            grid: dataB.grid,
            mulank: dataB.mulank,
            bhagyank: dataB.bhagyank
          },
          planetaryScore,
          planetaryMsg,
          complementaryScore,
          relationshipScore,
          overallScore,
          filledByA,
          filledByB,
          totalMissingA,
          totalMissingB,
          remediesList
        });
      } catch (err) {
        console.error(err);
        setCompatError("An error occurred during compatibility calculation.");
      } finally {
        setCompatLoading(false);
      }
    };

    const handleResetCompat = () => {
      setCompatResult(null);
      setPartnerAName("");
      setPartnerADob("");
      setPartnerBName("");
      setPartnerBDob("");
      setCompatError(null);
    };

    const renderLoshuCell = (num, grid, name, otherGrid) => {
      const count = grid[num] || 0;
      const isMissing = count === 0;
      const isFilledByOther = isMissing && otherGrid[num] > 0;

      return (
        <div
          key={num}
          className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center relative border transition-all ${isMissing
            ? isFilledByOther
              ? "bg-green-50 border-green-300 text-green-800 ring-2 ring-green-200/50"
              : "bg-slate-50 border-slate-200 text-slate-300"
            : "bg-rose-50 border-rose-200 text-rose-900 font-bold shadow-sm"
            }`}
        >
          <span className="absolute top-1.5 right-2 text-[9px] font-bold text-slate-400">{num}</span>
          <span className="text-xl font-black">
            {isMissing
              ? isFilledByOther ? "+" : "-"
              : String(num).repeat(count)}
          </span>
          {isFilledByOther && (
            <span className="text-[12px] font-bold text-green-600 tracking-tighter uppercase mt-0.5">Balanced</span>
          )}
        </div>
      );
    };

    if (compatResult) {
      const { overallScore, partnerA, partnerB } = compatResult;

      let ratingClass = "bg-orange-100 text-orange-800";
      let ratingText = "Needs Understanding";
      if (overallScore >= 80) {
        ratingClass = "bg-green-100 text-green-800";
        ratingText = "Excellent Alignment";
      } else if (overallScore >= 60) {
        ratingClass = "bg-yellow-100 text-yellow-800";
        ratingText = "Good Harmony";
      }

      return (
        <div className="space-y-6">
          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="relative flex items-center justify-center w-36 h-36 shrink-0 bg-rose-50 rounded-full border border-rose-150 animate-fadeIn">
              <div className="text-center">
                <p className="text-[12px] font-bold text-slate-900 uppercase">Match Score</p>
                <p className="text-4xl font-black text-rose-600">{overallScore}%</p>
                <span className={`inline-block text-[12px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${ratingClass}`}>
                  {ratingText}
                </span>
              </div>
            </div>

            <div className="space-y-3 flex-1 text-center md:text-left">
              <h3 className="text-3xl font-bold text-slate-900">
                {partnerA.name} & {partnerB.name} Compatibility
              </h3>
              <p className="text-[16px] text-slate-900 leading-relaxed">
                Your combined Lo Shu Magic Squares indicate an overall vibration compatibility of <strong>{overallScore}%</strong>. This report outlines how you balance each other's elemental missing voids and align spiritually through planetary frequencies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900 text-[16px]">{partnerA.name}'s Grid</h4>
                <span className="text-[16px] font-bold text-slate-900">Psychic: {partnerA.mulank} | Destiny: {partnerA.bhagyank}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {renderLoshuCell(4, partnerA.grid, partnerA.name, partnerB.grid)}
                {renderLoshuCell(9, partnerA.grid, partnerA.name, partnerB.grid)}
                {renderLoshuCell(2, partnerA.grid, partnerA.name, partnerB.grid)}
                {renderLoshuCell(3, partnerA.grid, partnerA.name, partnerB.grid)}
                {renderLoshuCell(5, partnerA.grid, partnerA.name, partnerB.grid)}
                {renderLoshuCell(7, partnerA.grid, partnerA.name, partnerB.grid)}
                {renderLoshuCell(8, partnerA.grid, partnerA.name, partnerB.grid)}
                {renderLoshuCell(1, partnerA.grid, partnerA.name, partnerB.grid)}
                {renderLoshuCell(6, partnerA.grid, partnerA.name, partnerB.grid)}
              </div>
            </div>

            <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900 text-[16px]">{partnerB.name}'s Grid</h4>
                <span className="text-[16px] font-bold text-slate-900">Psychic: {partnerB.mulank} | Destiny: {partnerB.bhagyank}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {renderLoshuCell(4, partnerB.grid, partnerB.name, partnerA.grid)}
                {renderLoshuCell(9, partnerB.grid, partnerB.name, partnerA.grid)}
                {renderLoshuCell(2, partnerB.grid, partnerB.name, partnerA.grid)}
                {renderLoshuCell(3, partnerB.grid, partnerB.name, partnerA.grid)}
                {renderLoshuCell(5, partnerB.grid, partnerB.name, partnerA.grid)}
                {renderLoshuCell(7, partnerB.grid, partnerB.name, partnerA.grid)}
                {renderLoshuCell(8, partnerB.grid, partnerB.name, partnerA.grid)}
                {renderLoshuCell(1, partnerB.grid, partnerB.name, partnerA.grid)}
                {renderLoshuCell(6, partnerB.grid, partnerB.name, partnerA.grid)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-orange-900 font-bold text-[18px] uppercase tracking-wider">
                <Star className="w-4 h-4 text-orange-900" /> Planetary Birth Match
              </div>
              <p className="text-2xl font-bold text-orange-900">{compatResult.planetaryScore}%</p>
              <p className="text-[16px] font-medium text-slate-900 leading-relaxed">{compatResult.planetaryMsg}</p>
            </div>

            <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-[18px] uppercase tracking-wider">
                <Compass className="w-4 h-4 text-rose-600" /> Complementary Balance
              </div>
              <p className="text-2xl font-bold text-rose-700">{compatResult.complementaryScore}%</p>
              <p className="text-[16px] font-medium text-slate-900 leading-relaxed">
                {partnerA.name} fills <strong>{compatResult.filledByA}</strong> of {partnerB.name}'s missing slots, and {partnerB.name} fills <strong>{compatResult.filledByB}</strong> of {partnerA.name}'s missing slots.
              </p>
            </div>

            <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-[18px] uppercase tracking-wider">
                <Heart className="w-4 h-4 text-rose-600" /> Relationship Pillars
              </div>
              <p className="text-2xl font-black text-rose-700">{compatResult.relationshipScore}%</p>
              <p className="text-[16px] font-medium text-slate-900 leading-relaxed">
                Measures presence of <strong>2</strong> (harmony), <strong>5</strong> (stability), and <strong>6</strong> (support). Strong pillar numbers keep the relationship steady under challenges.
              </p>
            </div>
          </div>

          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-orange-900 text-[18px] border-b border-rose-100 pb-2">
              🌸 Marriage Compatibility Remedies
            </h4>
            {compatResult.remediesList.length === 0 ? (
              <p className="text-[16px] text-green-700 font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Your joint numerology profiles are naturally balanced! No remedies are needed.
              </p>
            ) : (
              <div className="space-y-4">
                {compatResult.remediesList.map((rem, idx) => (
                  <div key={idx} className="bg-rose-50/20 border border-rose-100/50 p-4 rounded-2xl">
                    <h5 className="font-extrabold text-rose-950 text-[16px] mb-1">{rem.title}</h5>
                    <p className="text-[16px] font-medium text-slate-900 leading-relaxed">{rem.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleResetCompat}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-rose-600/20 text-[14px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Match Another Couple</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto bg-white border border-rose-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-rose-200/50 animate-fadeIn">
        <h3 className="text-xl font-bold text-rose-955 text-center mb-6">
          Enter Details for Both Partners
        </h3>

        {compatError && (
          <div className="bg-rose-100 border border-rose-350 text-rose-850 p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {compatError}
          </div>
        )}

        <form onSubmit={handleCalculateCompatibility} className="space-y-6">
          <div className="space-y-3.5 border-b border-rose-100 pb-4">
            <h4 className="font-bold text-slate-900 text-[18px] uppercase tracking-wide">Partner A</h4>
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                type="text"
                required
                value={partnerAName}
                onChange={(e) => setPartnerAName(e.target.value)}
                placeholder="Partner A Name"
                className="w-full bg-rose-50/50 border border-rose-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-[14px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date of Birth
              </label>
              <input
                type="date"
                required
                value={partnerADob}
                onChange={(e) => setPartnerADob(e.target.value)}
                className="w-full bg-rose-50/50 border border-rose-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-[14px]"
              />
            </div>
          </div>

          <div className="space-y-3.5 pb-4">
            <h4 className="font-bold text-rose-900 text-[18px] uppercase tracking-wide">Partner B</h4>
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                type="text"
                required
                value={partnerBName}
                onChange={(e) => setPartnerBName(e.target.value)}
                placeholder="Partner B Name"
                className="w-full bg-rose-50/50 border border-rose-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-[14px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date of Birth
              </label>
              <input
                type="date"
                required
                value={partnerBDob}
                onChange={(e) => setPartnerBDob(e.target.value)}
                className="w-full bg-rose-50/50 border border-rose-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-[14px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={compatLoading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-rose-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 text-[14px] flex items-center justify-center gap-1.5"
          >
            {compatLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Computing Match...</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 animate-pulse" />
                <span>Check Marriage Compatibility</span>
              </>
            )}
          </button>
        </form>
      </div>
    );
  };

  const renderNameCorrectionPanel = () => {
    const currentChaldeanCompound = getChaldeanSum(result.name);
    const currentChaldeanReduced = result.namank;
    const psychic = result.mulank;
    const destiny = result.bhagyank;

    const friendlyList = FRIENDLY_NUMBERS[psychic] || [];
    const isCompatible = friendlyList.includes(currentChaldeanReduced);
    const avoids = Object.keys(PLANET_NAMES)
      .map(Number)
      .filter(num => !friendlyList.includes(num) && num !== psychic);

    const corrections = generateSpellingCorrections(result.name, psychic, destiny);

    const handleApplyCorrection = async (correctedName) => {
      setName(correctedName);
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/numerology/detailed-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
          },
          body: JSON.stringify({ name: correctedName, dob }),
        });
        if (!response.ok) {
          throw new Error("Failed to compute detailed report for corrected spelling");
        }
        const data = await response.json();
        setResult(data);
        setActiveTab("report");
      } catch (err) {
        console.error(err);
        setError(err?.message || "An error occurred while calculating.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        {/* Compatibility Overview Card */}
        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-[22px] font-bold text-orange-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-600" /> Current Name Spelling Compatibility
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50">
                <p className="text-[18px] font-bold text-slate-900 uppercase tracking-wider mb-1">Target Name Analysed</p>
                <p className="text-xl font-bold text-rose-950">{result.name}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-rose-50/30 p-3 rounded-xl border border-rose-100/20 text-center">
                  <p className="text-[16px] font-extrabold text-slate-900 uppercase">Psychic (Mulank)</p>
                  <p className="text-2xl font-black text-rose-600">{psychic}</p>
                  <p className="text-[16px] font-medium text-slate-900">{PLANET_NAMES[psychic]}</p>
                </div>
                <div className="bg-rose-50/30 p-3 rounded-xl border border-rose-100/20 text-center">
                  <p className="text-[16px] font-extrabold text-slate-900 uppercase">Destiny (Bhagyank)</p>
                  <p className="text-2xl font-black text-rose-600">{destiny}</p>
                  <p className="text-[16px] font-medium text-slate-900">{PLANET_NAMES[destiny]}</p>
                </div>
                <div className="bg-rose-50/30 p-3 rounded-xl border border-rose-100/20 text-center">
                  <p className="text-[16px] font-extrabold text-slate-900 uppercase">Name (Chaldean)</p>
                  <p className="text-2xl font-black text-rose-600">{currentChaldeanReduced}</p>
                  <p className="text-[16px] font-medium text-slate-900">Total: {currentChaldeanCompound}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              {isCompatible ? (
                <div className="bg-green-50 border border-green-200 text-green-950 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-green-800 font-extrabold text-base">
                    <CheckCircle className="w-5 h-5 shrink-0" /> Auspicious Alignment!
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed">
                    Your name spelling reduces to <strong>{currentChaldeanReduced}</strong>, which is highly compatible with your Psychic/Birth number <strong>{psychic}</strong>. This alignment brings smooth progress, positive vibrations, and luck.
                  </p>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 text-orange-950 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-orange-800 font-extrabold text-base">
                    <AlertCircle className="w-5 h-5 shrink-0" /> Spelling Conflict Detected
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed">
                    Your name reduces to <strong>{currentChaldeanReduced}</strong>, which is not in harmony with your Psychic number <strong>{psychic}</strong>. This clash can cause unexpected delays, professional hurdles, or miscommunications.
                  </p>
                  <p className="text-xs font-bold text-orange-900">
                    💡 We suggest minor spelling corrections below to tune it to a friendly frequency.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lucky Numbers Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 text-[20px] mb-3">Friendly Target Numbers</h4>
            <p className="text-[16px] text-slate-900 mb-4">Aim to adjust your name spelling so that the Chaldean sum reduces to one of these single digits:</p>
            <div className="flex flex-wrap gap-2">
              {friendlyList.map(num => (
                <span key={num} className="inline-flex flex-col items-center justify-center w-14 h-14 bg-green-50 border border-green-200 rounded-xl">
                  <span className="text-[18px] font-black text-green-700">{num}</span>
                  <span className="text-[16px] font-bold text-slate-900">{PLANET_NAMES[num]}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 text-[18px] mb-3">Numbers to Avoid</h4>
            <p className="text-[16px] text-slate-900 mb-4">Try to avoid name spelling totals that reduce to these conflicting digits:</p>
            <div className="flex flex-wrap gap-2">
              {avoids.map(num => (
                <span key={num} className="inline-flex flex-col items-center justify-center w-14 h-14 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[18px] font-black text-rose-700/60 line-through">{num}</span>
                  <span className="text-[16px] font-bold text-slate-900">{PLANET_NAMES[num]}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Spelling Suggestions list */}
        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
          <div className="border-b border-rose-100 pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-[22px] font-bold text-rose-950">Lucky Spelling Correction Suggestions</h3>
              <p className="text-[16px] text-slate-900">Minor spell changes that create maximum compatibility with your charts</p>
            </div>
            <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Chaldean Method
            </span>
          </div>

          {corrections.length === 0 ? (
            <div className="text-center py-8 bg-rose-50/10 rounded-2xl border border-dashed border-rose-200/50">
              <Sparkles className="w-8 h-8 text-rose-350 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">Your current name is already fully optimized!</p>
              <p className="text-xs text-slate-400">No spelling modifications are needed for this birth profile.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-rose-100 text-slate-900 font-bold uppercase tracking-wider text-[16px]">
                    <th className="py-3 px-2">Proposed Spelling</th>
                    <th className="py-3 px-2">Correction Method</th>
                    <th className="py-3 px-2 text-center">Chaldean Sum</th>
                    <th className="py-3 px-2 text-center">Reduced Number</th>
                    <th className="py-3 px-2">Spelling Vibration</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50/50 font-medium">
                  {corrections.map((item, idx) => {
                    const compoundDetail = COMPOUND_LUCKY_DETAILS[item.compound];
                    return (
                      <tr key={idx} className="hover:bg-rose-50/20 transition-all">
                        <td className="py-4 px-2">
                          <span className="font-semibold text-slate-900 text-[16px]">{item.name}</span>
                        </td>
                        <td className="py-4 px-2 text-slate-900 text-[16px]">{item.method}</td>
                        <td className="py-4 px-2 text-center text-rose-700 font-black">{item.compound}</td>
                        <td className="py-4 px-2 text-center">
                          <span className="inline-flex flex-col items-center justify-center bg-rose-50 px-2 py-0.5 rounded font-black text-rose-600">
                            {item.single}
                            <span className="text-[16px] text-slate-900">{PLANET_NAMES[item.single]}</span>
                          </span>
                        </td>
                        <td className="py-4 px-2 max-w-xs">
                          {compoundDetail ? (
                            <div>
                              <span className="font-bold text-green-700 block text-[16px]">🌟 {compoundDetail.title}</span>
                              <span className="text-[16px] text-slate-900 leading-snug block">{compoundDetail.desc}</span>
                            </div>
                          ) : (
                            <span className="text-[16px] text-slate-900">Harmonious compound vibration. Good for personality and career.</span>
                          )}
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button
                            onClick={() => handleApplyCorrection(item.name)}
                            className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold px-3 py-1.5 rounded-xl text-[16px] transition-all shadow shadow-rose-200"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Try Spelling</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVastuOverlayPanel = () => {
    const checkVedicYogas = (grid) => {
      const yogas = [
        {
          name: "Raj Yoga (Golden Conjunction)",
          numbers: [8, 5, 6],
          desc: "Highly auspicious alignment representing ultimate luck, wealth expansion, social status, and business success.",
          remedy: "Keep your workdesk clean, avoid dark/grey colors in the center, and wear gold tones."
        },
        {
          name: "Property & Asset Yoga (Silver Conjunction)",
          numbers: [2, 5, 8],
          desc: "Incredible planetary support for purchase of land, home ownership, property assets, and long-term financial security.",
          remedy: "Place a rock salt lamp or a brass globe in the Southwest zone of your bedroom or living room."
        },
        {
          name: "Mental Plan Yoga (4-9-2)",
          numbers: [4, 9, 2],
          desc: "Indicates deep intellectual ability, high analytical memory, logical analysis, and sharp calculation capacity.",
          remedy: "Read daily, perform mind-challenging puzzles, and carry yellow elements."
        },
        {
          name: "Will Power Yoga (4-3-8)",
          numbers: [4, 3, 8],
          desc: "Represents absolute willpower, determination, resilience to bounce back from defeats, and hard-working nature.",
          remedy: "Keep a small table fountain or green plants in your East/North workspace."
        },
        {
          name: "Intellectual / Spiritual Yoga (9-5-1)",
          numbers: [9, 5, 1],
          desc: "Brings strong business communication skills, leadership, foresight, and spiritual alignment.",
          remedy: "Practice breathing exercises daily, perform yoga, and surround yourself with light green accents."
        },
        {
          name: "Action & Execution Yoga (2-7-6)",
          numbers: [2, 7, 6],
          desc: "Represents the ability to quickly execute concepts and convert abstract plans into reality without delays.",
          remedy: "Wear silver or white color bands, or place metal windchimes in the West zone."
        }
      ];

      return yogas.map(y => {
        const activeNumbers = y.numbers.filter(n => grid[n] > 0);
        const isActive = activeNumbers.length === y.numbers.length;
        return { ...y, isActive, activeNumbers };
      });
    };

    const yogaData = checkVedicYogas(result.loshuGrid);

    return (
      <div className="space-y-6 animate-fadeIn">

        {/* Vastu Compass Overlay Container */}
        <div className="bg-white border border-rose-100 rounded-5xl p-6 shadow-sm space-y-6">
          <h3 className="text-[22px] font-bold text-rose-955 border-b border-rose-100 pb-3 flex items-center gap-2">
            <Compass className="w-5 h-5 text-rose-600 animate-spin-slow" />
            Vastu & Feng Shui Directions Overlay
          </h3>

          {/* Vastu Wheel & Diagnostics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Vastu Compass Wheel Layout */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center bg-rose-50/20 border border-rose-100/50 p-4 rounded-3xl">
              <span className="text-xs font-extrabold text-rose-900 uppercase tracking-widest mb-3">Vastu Compass Alignment</span>
              <div className="relative w-80 h-80 rounded-full border-4 border-rose-200 bg-white flex items-center justify-center shadow-md">

                {/* Inner center Brahmasthan (5) */}
                <div className={`absolute w-32 h-32 rounded-full flex flex-col items-center justify-center shadow z-10 transition-all ${result.loshuGrid[5] > 0 ? "bg-green-500 text-white border-2 border-green-600" : "bg-orange-100 text-orange-800 border-2 border-orange-300 border-dashed"
                  }`}>
                  <span className="text-xs font-black leading-none uppercase tracking-wide">Center</span>
                  <span className="text-[10px] font-extrabold mt-1">(5)</span>
                </div>

                {/* Outer Direction Cells */}
                {[
                  { dir: "N", num: 1, angle: 0 },
                  { dir: "NE", num: 8, angle: 45 },
                  { dir: "E", num: 3, angle: 90 },
                  { dir: "SE", num: 4, angle: 135 },
                  { dir: "S", num: 9, angle: 180 },
                  { dir: "SW", num: 2, angle: 225 },
                  { dir: "W", num: 7, angle: 270 },
                  { dir: "NW", num: 6, angle: 315 }
                ].map((item) => {
                  const isPresent = result.loshuGrid[item.num] > 0;
                  // Math to position directions in a circle
                  const rad = (item.angle - 90) * (Math.PI / 180);
                  const x = Math.cos(rad) * 122; // radius
                  const y = Math.sin(rad) * 122;
                  return (
                    <div
                      key={item.dir}
                      className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center text-center text-xs font-extrabold transition-all shadow-sm ${isPresent
                        ? "bg-emerald-200 text-slate-900 border border-emerald-600 font-black"
                        : "bg-orange-50 text-orange-700 border border-orange-700 border-dashed"
                        }`}
                      style={{
                        transform: `translate(${x}px, ${y}px)`
                      }}
                    >
                      <span className="font-black leading-none">{item.dir}</span>
                      <span className="text-[12px]">({item.num})</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-4 text-[16px] font-bold">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Harmonious
                </span>
                <span className="flex items-center gap-1 text-orange-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-300"></span> Defect/Missing
                </span>
              </div>
            </div>

            {/* Directional Analysis & Remedies */}
            <div className="lg:col-span-2 space-y-4 max-h-[650px] overflow-y-auto scrollbar-thin scrollbar-thumb-rose-100 pr-1">

              {/* Heading */}
              <div className="bg-rose-50/30 p-3.5 rounded-2xl border border-rose-100/50">
                <h4 className="text-[20px] font-bold text-rose-955 uppercase tracking-wider mb-1">Directional Diagnostics</h4>
                <p className="text-[18px] text-orange-900  font-medium leading-relaxed">
                  Numerology maps home directions to birth date vibrations. Missing numbers point to weak Vastu directions in your living space. Follow the remedies below to balance your home layout.
                </p>
              </div>

              {/* List of missing direction defects and remedies */}
              {(() => {
                const missingList = Object.entries(VASTU_DIRECTIONS)
                  .filter(([num]) => result.loshuGrid[parseInt(num)] === 0)
                  .map(([num, data]) => ({ num: parseInt(num), ...data }));

                if (missingList.length === 0) {
                  return (
                    <div className="p-4 bg-green-50 border border-green-100 text-green-950 text-xs font-medium rounded-2xl flex items-center gap-2 animate-fadeIn">
                      <CheckCircle className="w-4 h-4 text-green-700" />
                      <span>Perfect Vastu Alignment! All 9 compass direction elements are active in your grid profile. Keep your home clutter-free to preserve this flow.</span>
                    </div>
                  );
                }

                return missingList.map((item) => (
                  <div key={item.num} className="p-4 border border-rose-100/70 rounded-2xl bg-white shadow-sm flex items-start gap-3 animate-fadeIn">
                    <div className="p-2.5 bg-orange-50 text-orange-700 rounded-xl font-black text-[18px] shrink-0">
                      {item.num}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-[20px]">{item.zone} Zone</span>
                        <span className="text-[16px] font-bold text-amber-900 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
                          {item.element} Element
                        </span>
                      </div>
                      <p className="text-[18px] text-orange-900 font-medium leading-relaxed">
                        <strong>Impact:</strong> {item.aspect} — {item.issue}
                      </p>
                      <p className="text-[18px] text-slate-900 font-semibold bg-rose-50/30 p-2 rounded-xl border border-rose-100/20 leading-relaxed">
                        <strong>Vastu Remedy:</strong> {item.remedy}
                      </p>
                    </div>
                  </div>
                ));
              })()}

            </div>
          </div>
        </div>

        {/* Vedic Number Yogas Card */}
        <div className="bg-white border border-rose-100 rounded-5xl p-6 shadow-sm space-y-6">
          <h3 className="text-[22px] font-bold text-rose-955 border-b border-rose-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-600" />
            Vedic Number Yogas (Grid Conjunctions)
          </h3>
          <p className="text-[18px] text-slate-900 leading-relaxed">
            In Vedic Numerology, when specific combinations of numbers align in your Lo Shu Grid, they trigger highly powerful life dynamics called **Yogas**.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {yogaData.map((yoga, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-3xl border transition-all ${yoga.isActive
                  ? "bg-gradient-to-br from-amber-50/70 to-yellow-50/30 border-amber-300 ring-2 ring-amber-100 shadow-md animate-fadeIn"
                  : "bg-slate-50/40 border-slate-200 opacity-60"
                  }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[20px] font-bold text-rose-955">{yoga.name}</h4>
                  <span
                    className={`text-[14px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${yoga.isActive
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-slate-200 text-slate-500"
                      }`}
                  >
                    {yoga.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-[18px] text-slate-900 mt-1 leading-relaxed">
                  {yoga.desc}
                </p>
                {yoga.isActive && (
                  <div className="mt-4 bg-white/80 p-3 rounded-xl border border-amber-200 text-[18px]">
                    <span className="font-bold text-amber-900">Recommended Remedy: </span>
                    <span className="text-slate-800 font-medium">{yoga.remedy}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  };

  const getReductionSteps = (num) => {
    const steps = [];
    let current = num;
    while (current > 9) {
      steps.push(current);
      current = current.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    }
    steps.push(current);
    return steps;
  };

  const getKarmicDetail = (num) => {
    const details = {
      13: {
        title: "Focus, Structure & Discipline",
        pattern: "Tendency toward procrastination, laziness, avoiding hard work, or trying to find quick shortcuts.",
        remedy: "Accept slow progress, commit to daily routines, stay organized, and avoid taking shortcuts."
      },
      14: {
        title: "Freedom, Commitment & Moderation",
        pattern: "Tendency toward excessive behavior, restlessness, sudden changes, and fear of commitment.",
        remedy: "Practice moderation in all things. Commit to long-term goals and stay grounded when facing changes."
      },
      16: {
        title: "Spiritual Rebirth & Ego Dissolution",
        pattern: "Intellectual pride, separation from others, ego clashes, and sudden lifepath collapses.",
        remedy: "Develop deep humility and authenticity. Avoid arrogance and learn to accept spiritual insights."
      },
      19: {
        title: "Independence, Authority & Collaboration",
        pattern: "Selfishness, stubbornness, refusal to ask for help, or commanding others with too much ego.",
        remedy: "Learn to listen and collaborate. Serve others unselfishly and share your power without demanding praise."
      }
    };
    return details[num];
  };

  const detectMasterAndKarmicNumbers = (dob, name) => {
    const masterNumbers = [];
    const karmicNumbers = [];

    if (!dob || !name) return { masterNumbers, karmicNumbers };

    // 1. Check Birth Day
    const parts = dob.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      if ([11, 22].includes(day)) {
        masterNumbers.push({
          num: day,
          source: `Day of Birth (${day}th)`,
          type: "Master Number",
          traits: day === 11 ? "Intuitive leader, highly sensitive, visionary." : "Master Builder, practical dreamer, turns concepts into reality."
        });
      }
      if ([13, 14, 16, 19].includes(day)) {
        karmicNumbers.push({
          num: day,
          source: `Day of Birth (${day}th)`,
          type: "Karmic Debt",
          ...getKarmicDetail(day)
        });
      }
    }

    // 2. Check Life Path Intermediate Reduction Steps
    const dobDigits = dob.replace(/\D/g, '').split('').map(Number);
    const dobSum = dobDigits.reduce((acc, d) => acc + d, 0);
    const lpSteps = getReductionSteps(dobSum);
    for (const step of lpSteps) {
      if ([11, 22, 33].includes(step)) {
        if (!masterNumbers.some(m => m.num === step && m.source.includes("Life Path"))) {
          masterNumbers.push({
            num: step,
            source: "Life Path Calculation",
            type: "Master Number",
            traits: step === 11 ? "Intuitive channel, inspirational speaker, highly empathetic." : step === 22 ? "Master organizer, builder, constructs systems for humanity." : "Master Teacher, selfless healer, high protective energy."
          });
        }
      }
      if ([13, 14, 16, 19].includes(step)) {
        if (!karmicNumbers.some(k => k.num === step && k.source.includes("Life Path"))) {
          karmicNumbers.push({
            num: step,
            source: "Life Path Calculation",
            type: "Karmic Debt",
            ...getKarmicDetail(step)
          });
        }
      }
    }

    // 3. Check Name Sum (Chaldean Sum & intermediate steps)
    const chaldeanSum = getChaldeanSum(name);
    const nameSteps = getReductionSteps(chaldeanSum);
    for (const step of nameSteps) {
      if ([11, 22, 33].includes(step)) {
        if (!masterNumbers.some(m => m.num === step && m.source.includes("Name"))) {
          masterNumbers.push({
            num: step,
            source: "Name Vibration (Chaldean)",
            type: "Master Number",
            traits: step === 11 ? "Magnetic charisma, artistic brilliance, emotional depth." : step === 22 ? "International reach, commercial leader, structures plans." : "Nurturer, creative expression, global influence."
          });
        }
      }
      if ([13, 14, 16, 19].includes(step)) {
        if (!karmicNumbers.some(k => k.num === step && k.source.includes("Name"))) {
          karmicNumbers.push({
            num: step,
            source: "Name Vibration (Chaldean)",
            type: "Karmic Debt",
            ...getKarmicDetail(step)
          });
        }
      }
    }

    return { masterNumbers, karmicNumbers };
  };

  const renderAdvancedAnalyticsPanel = () => {
    const { masterNumbers, karmicNumbers } = detectMasterAndKarmicNumbers(result.dob, result.name);

    // Calculate elements strength percentage
    const grid = result.loshuGrid;
    const elements = [
      { name: "Water (Intuition & Career)", num: [1], color: "bg-blue-500", fontsize: "24px", text: "text-blue-800", bg: "bg-blue-50", desc: "Ruling over career opportunity, deep wisdom, and focus." },
      { name: "Wood (Wealth & Growth)", num: [3, 4], color: "bg-emerald-500", fontsize: "24px", text: "text-emerald-800", bg: "bg-emerald-50", desc: "Ruling over wealth, assets, physical vitality, and expansion." },
      { name: "Fire (Fame & Energy)", num: [9], color: "bg-rose-500", fontsize: "24px", text: "text-rose-800", bg: "bg-rose-50", desc: "Ruling over fame, recognition, energy levels, and passion." },
      { name: "Earth (Stability & Marriage)", num: [2, 5, 8], color: "bg-amber-500", fontsize: "24px", text: "text-amber-800", bg: "bg-amber-50", desc: "Ruling over marital harmony, central balance, and material savings." },
      { name: "Metal (Wisdom & Support)", num: [6, 7], color: "bg-zinc-500", fontsize: "24px", text: "text-zinc-800", bg: "bg-zinc-50", desc: "Ruling over wisdom, planning skills, helpful mentors, and travel." }
    ];

    // Compute elemental distribution
    const elementData = elements.map(el => {
      const activeCount = el.num.filter(n => grid[n] > 0).length;
      const pct = Math.round((activeCount / el.num.length) * 100);
      return { ...el, pct, activeCount };
    });

    return (
      <div className="space-y-6 animate-fadeIn">

        {/* Title Card */}
        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-[22px] font-bold text-rose-955 flex items-center gap-2 border-b border-rose-100 pb-3 mb-4">
            <Award className="w-5 h-5 text-rose-600" />
            Advanced Chart Analytics & Core Indicators
          </h3>
          <p className="text-[18px] text-orange-900 leading-relaxed">
            This module evaluates hidden vibrations, master frequencies, elemental weights, and karmic lessons within your numerological chart structure.
          </p>
        </div>

        {/* Master & Karmic Numbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Master Numbers Box */}
          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-rose-955 text-[20px] flex items-center gap-1.5">
              🌟 Master Number Frequencies
            </h4>
            <p className="text-[18px] text-slate-900">
              Master Numbers (11, 22, 33) indicate high spiritual potential, vision, and major life challenges.
            </p>

            {masterNumbers.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                No active Master Numbers in your primary core profiles.
              </div>
            ) : (
              <div className="space-y-3">
                {masterNumbers.map((m, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50/20 border border-green-200 rounded-2xl shadow-sm flex items-start gap-3 animate-fadeIn">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
                      {m.num}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-amber-900 text-[20px]">{m.source}</span>
                        <span className="text-[16px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                      </div>
                      <p className="text-[16px] text-slate-900 mt-1 leading-relaxed">
                        <strong>Traits:</strong> {m.traits}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Karmic Debt Box */}
          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-rose-955 text-[20px] flex items-center gap-1.5">
              ⚠️ Karmic Debt Diagnostics
            </h4>
            <p className="text-[18px] text-slate-900">
              Karmic Debts (13, 14, 16, 19) highlight past behavioral lessons you must work through in this life.
            </p>

            {karmicNumbers.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-900 rounded-2xl text-center text-[18px] text-slate-900">
                No active Karmic Debts detected in this profile! You have a balanced baseline path.
              </div>
            ) : (
              <div className="space-y-3">
                {karmicNumbers.map((k, idx) => (
                  <div key={idx} className="p-4 border border-rose-200 bg-rose-50/10 rounded-2xl shadow-sm flex items-start gap-3 animate-fadeIn">
                    <div className="w-12 h-12 bg-rose-600 text-amber-900 rounded-xl flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
                      {k.num}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-[20px]">{k.source}</span>
                        <span className="text-[16px] font-bold bg-rose-105 text-rose-800 px-2 py-0.5 rounded-full uppercase tracking-wider">{k.title}</span>
                      </div>
                      <p className="text-[18px] text-slate-550 leading-relaxed">
                        <strong>Shadow Pattern:</strong> {k.pattern}
                      </p>
                      <p className="text-[18px] text-slate-700 font-semibold bg-white/70 p-2 rounded-lg border border-rose-100/30 leading-relaxed">
                        <strong>Actionable Remedy:</strong> {k.remedy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Elemental Strength Analytics Card */}
        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
          <h4 className="font-extrabold text-rose-955 text-[20px]">
            🌊 Elemental Strength Analysis
          </h4>
          <p className="text-[18px] text-slate-550 leading-relaxed">
            Each number in the Lo Shu grid channels one of the five elements. Here is the active balance of elements in your profile:
          </p>

          <div className="space-y-4 pt-2">
            {elementData.map((el, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-[20px] font-bold">
                  <span className="text-slate-800">{el.name}</span>
                  <span className={`${el.text} bg-slate-50 px-2.5 py-0.5 rounded-full`}>{el.pct}% Strength</span>
                </div>
                <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full ${el.color} transition-all duration-1000`}
                    style={{ width: `${el.pct}%` }}
                  ></div>
                </div>
                <p className="text-[18px] text-slate-900 leading-relaxed">
                  {el.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  };

  const getPinnacleTheme = (num) => {
    const themes = {
      1: "Developing independence, self-reliance, and leadership. Focus on building individuality and standing on your own feet.",
      2: "Developing cooperation, patience, partnerships, and sensitivity. Focus on teamwork, marriage, and emotional harmony.",
      3: "Developing self-expression, creativity, public communication, and social connection. Focus on arts, writing, and optimism.",
      4: "Developing hard work, stability, organizational structures, and building foundations. Focus on career discipline and assets.",
      5: "Developing freedom, adventure, unexpected changes, networking, and adaptability. Focus on travel and releasing limits.",
      6: "Developing responsibility, family love, community service, home, and nurturing. Focus on household harmony and healing.",
      7: "Developing introspection, spiritual wisdom, studies, self-realization, and quiet focus. Focus on meditation and learning.",
      8: "Developing material authority, career execution, finances, power, and abundance. Focus on commercial success and power.",
      9: "Developing completion, release, global compassion, humanitarian views, and ends of cycles. Focus on forgiveness and charity."
    };
    return themes[num] || themes[1];
  };

  const getChallengeTheme = (num) => {
    const challenges = {
      0: "Lack of major specific challenge. High freedom of choice, but do not drift without purpose or become lazy.",
      1: "Ego vs. Indecision. Overcome insecurity, fear of standing out, or dominant behavior. Practice self-reliance.",
      2: "Hypersensitivity and fear of disapproval. Overcome fear of criticism and learn to say no without guilt.",
      3: "Scattering energy, lack of focus, and self-doubt. Learn to express yourself constructively and avoid gossip.",
      4: "Disorganized, lack of grounding, or workaholism. Learn routine, structure, and persistence.",
      5: "Impulsiveness, fear of change, or restlessness. Learn freedom with responsibility and stay committed.",
      6: "Idealism and over-burdening yourself with duties. Accept others as they are without demanding perfection.",
      7: "Over-analytical, pride, or fear of emotional depth. Overcome isolation and trust life.",
      8: "Material greed vs. fear of poverty. Learn balance between spiritual goals and material wealth."
    };
    return challenges[num] || challenges[0];
  };

  const getPinnacleAndChallengeData = (dob, bhagyank) => {
    if (!dob) return null;
    const parts = dob.split('-');
    if (parts.length !== 3) return null;

    const yearStr = parts[0];
    const monthVal = parseInt(parts[1], 10);
    const dayVal = parseInt(parts[2], 10);

    const monthDigit = reduceToSingleDigit(monthVal);
    const dayDigit = reduceToSingleDigit(dayVal);
    const yearDigit = reduceToSingleDigit(yearStr.split('').map(Number).reduce((a, b) => a + b, 0));

    const p1 = reduceToSingleDigit(monthDigit + dayDigit);
    const p2 = reduceToSingleDigit(dayDigit + yearDigit);
    const p3 = reduceToSingleDigit(p1 + p2);
    const p4 = reduceToSingleDigit(monthDigit + yearDigit);

    const c1 = Math.abs(monthDigit - dayDigit);
    const c2 = Math.abs(dayDigit - yearDigit);
    const c3 = Math.abs(c1 - c2);
    const c4 = Math.abs(monthDigit - yearDigit);

    const p1End = 36 - bhagyank;
    const p2Start = p1End + 1;
    const p2End = p1End + 9;
    const p3Start = p2End + 1;
    const p3End = p2End + 9;
    const p4Start = p3End + 1;

    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return {
      age,
      pinnacles: [
        { phase: "First Pinnacle", ageSpan: `0 to ${p1End} Years`, val: p1, challenge: c1, isActive: age <= p1End, theme: getPinnacleTheme(p1), challengeTheme: getChallengeTheme(c1) },
        { phase: "Second Pinnacle", ageSpan: `${p2Start} to ${p2End} Years`, val: p2, challenge: c2, isActive: age >= p2Start && age <= p2End, theme: getPinnacleTheme(p2), challengeTheme: getChallengeTheme(c2) },
        { phase: "Third Pinnacle", ageSpan: `${p3Start} to ${p3End} Years`, val: p3, challenge: c3, isActive: age >= p3Start && age <= p3End, theme: getPinnacleTheme(p3), challengeTheme: getChallengeTheme(c3) },
        { phase: "Fourth Pinnacle", ageSpan: `${p4Start}+ Years`, val: p4, challenge: c4, isActive: age >= p4Start, theme: getPinnacleTheme(p4), challengeTheme: getChallengeTheme(c4) }
      ]
    };
  };

  const renderQuantumPanel = () => {
    const q = quantumData || {};
    const gridInfo = q.quantum_grid || {};
    const gridAnalysis = gridInfo.grid_analysis || [];
    const remedies = q.quantum_remedies || [];

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold uppercase tracking-widest text-xs">
              <Sparkles className="w-4 h-4 animate-spin-slow" /> Quantum Resonance Engine
            </div>
            <h3 className="text-2xl md:text-3xl font-black">Quantum Numerology Matrix</h3>
            <p className="text-purple-200 text-[18px] max-w-2xl leading-relaxed">
              Fuses your birth date superposition grid with name frequencies and planetary entanglement vectors to measure your energetic resonance phase.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-purple-800/60 flex flex-wrap gap-6 items-center">
            <div>
              <span className="text-[18px] text-purple-300 block font-semibold uppercase">Phase Coherence Score</span>
              <span className="text-[24px] font-black text-amber-300">{q.phase_coherence_percent || 88}%</span>
            </div>
            <div>
              <span className="text-[18px] text-purple-300 block font-semibold uppercase">Entanglement Status</span>
              <span className="text-[24px] font-bold text-emerald-400">{q.quantum_entanglement_status || "Constructive Resonance"}</span>
            </div>
            <div>
              <span className="text-[18px] text-purple-300 block font-semibold uppercase">Name Frequency</span>
              <span className="text-[24px] font-bold text-cyan-300">{q.name_frequency?.frequency_hz || 528} Hz ({q.name_frequency?.ruling_planet || 'Sun'})</span>
            </div>
          </div>
        </div>

        {/* Real-Time Daily Quantum Voltage & Peak Windows */}
        {(() => {
          const daily = getDailyQuantumVoltage(result?.mulank, result?.bhagyank);
          return (
            <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-100 pb-3">
                <div>
                  <h4 className="font-bold text-purple-950 text-[24px] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>Real-Time Daily Quantum Voltage & Peak Windows</span>
                  </h4>
                  <p className="text-[18px] text-slate-500">
                    Live daily planetary alignment clock calculated for {daily.todayFormatted}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-black bg-rose-100 text-rose-900 px-3 py-1 rounded-full flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5" /> Universal Day Number: {daily.univNumber} ({daily.planet})
                  </span>
                </div>
              </div>

              {/* Voltage Metrics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-[18px] text-purple-200 uppercase font-bold block">Today's Voltage Power</span>
                    <span className="text-[24px] font-black text-amber-300">{daily.voltage}%</span>
                    <span className="text-[14px] text-purple-200 block mt-0.5 font-medium">Manifestation Supercharge</span>
                  </div>
                  <Zap className="w-8 h-8 text-amber-400 fill-amber-400 animate-pulse" />
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-1">
                  <span className="text-[18px] text-purple-900 font-bold uppercase block">Lucky Color & Gem Resonance</span>
                  <span className="text-[24px] font-black text-purple-950 block">{daily.color}</span>
                  <span className="text-[14px] text-slate-600 font-medium block">Wear or visualize this palette today</span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-1">
                  <span className="text-[18px] text-indigo-900 font-bold uppercase block">Primary Energy Focus Area</span>
                  <span className="text-[24px] font-bold text-indigo-950 block">{daily.focus}</span>
                  <span className="text-[14px] text-indigo-700 block font-semibold">{daily.freq} Hz Active Tuning</span>
                </div>
              </div>

              {/* Hourly Peak Windows Grid */}
              <div className="space-y-3 pt-2">
                <h5 className="text-[18px] font-black uppercase text-purple-900 tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Hourly Planetary Hora Windows & Optimal Activities</span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {daily.windows.map((w, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all space-y-1.5 flex flex-col justify-between ${w.type === "Golden Window"
                        ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-200"
                        : w.type === "High Manifestation"
                          ? "bg-emerald-50/70 border-emerald-300"
                          : "bg-slate-50 border-slate-200"
                        }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[18px] font-black text-slate-900">{w.time}</span>
                          <span className={`text-[14px] font-extrabold px-2 py-0.5 rounded-full ${w.type === "Golden Window"
                            ? "bg-amber-500 text-white"
                            : w.type === "High Manifestation"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-700"
                            }`}>
                            {w.score}% Score
                          </span>
                        </div>
                        <h6 className="font-bold text-[18px] text-purple-950">{w.slot}</h6>
                        <span className="text-[14px] font-bold text-purple-700 block">Planet Alignment: {w.planet}</span>
                      </div>
                      <p className="text-[14px] text-slate-600 font-medium leading-relaxed pt-1 border-t border-slate-200/50">
                        {w.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}


        {/* 3x3 Quantum Superposition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-purple-950 text-lg flex items-center justify-between">
              <span>⚛️ 3x3 Quantum Energy Grid</span>
              <span className="text-[18px] text-purple-700 bg-purple-50 px-3 py-1 rounded-full font-bold">Active vs Void States</span>
            </h4>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {gridAnalysis.map((item) => {
                const isSuper = item.count >= 2;
                const isLatent = item.count === 1;
                return (
                  <div
                    key={item.number}
                    className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${isSuper
                      ? "bg-purple-900 text-white border-purple-700 shadow-md shadow-purple-900/20"
                      : isLatent
                        ? "bg-purple-50 border-purple-200 text-purple-950"
                        : "bg-slate-50 border-dashed border-slate-300 text-slate-400"
                      }`}
                  >
                    <span className="text-[18px] font-semibold uppercase opacity-75">{item.planet}</span>
                    <span className="text-[24px] font-black my-0.5">
                      {item.count > 0 ? String(item.number).repeat(item.count) : item.number}
                    </span>
                    <span className="text-[14px] font-bold tracking-tight">
                      {item.solfeggio} Hz
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Frequencies Summary */}
          <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-purple-950 text-[24px]">Quantum States</h4>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                <span className="text-[18px] font-bold text-purple-900 uppercase block">Active Superposition</span>
                <span className="text-[24px] font-semibold text-purple-950">
                  {gridInfo.active_superposition?.length > 0 ? gridInfo.active_superposition.join(", ") : "None (Balanced)"}
                </span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                <span className="text-[18px] font-bold text-indigo-900 uppercase block">Latent Frequency States</span>
                <span className="text-[24px] font-semibold text-indigo-950">
                  {gridInfo.latent_states?.length > 0 ? gridInfo.latent_states.join(", ") : "None"}
                </span>
              </div>
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="text-[18px] font-bold text-rose-900 uppercase block">Quantum Void (Missing)</span>
                <span className="text-[24px] font-semibold text-rose-950">
                  {gridInfo.quantum_voids?.length > 0 ? gridInfo.quantum_voids.join(", ") : "All Present"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Solfeggio Sound Healing Synthesizer Console */}
        <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl space-y-5 border border-purple-800/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-800/60 pb-4">
            <div>
              <h4 className="text-[18px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 flex items-center gap-2">
                <Radio className={`w-6 h-6 ${isPlayingAudio ? "text-cyan-400 animate-pulse" : "text-purple-400"}`} />
                <span>Solfeggio Harmonic Audio Synthesizer</span>
              </h4>
              <p className="text-[14px] text-purple-200 mt-1">
                Real-time Web Audio API sound generator tailored for Solfeggio Sol-Fa healing frequencies.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setBinauralMode(!binauralMode)}
                className={`text-[18px] font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 border ${binauralMode
                  ? "bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/30"
                  : "bg-slate-800/80 border-slate-700 text-purple-300"
                  }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Binaural Theta (+4 Hz): {binauralMode ? "ON" : "OFF"}</span>
              </button>

              {isPlayingAudio ? (
                <button
                  onClick={stopAudio}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-4 py-2 rounded-full transition-all shadow-lg flex items-center gap-1.5 animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Audio</span>
                </button>
              ) : (
                <div className="text-[14px] font-semibold text-purple-300 bg-purple-900/50 px-3 py-1.5 rounded-full border border-purple-700/50 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Select Frequency Below</span>
                </div>
              )}
            </div>
          </div>

          {/* Sound Wave Graphic Visualizer */}
          {isPlayingAudio && (
            <div className="p-3 bg-purple-900/40 rounded-2xl border border-purple-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-cyan-400 animate-bounce" />
                <div>
                  <span className="text-[18px] font-extrabold text-cyan-300 block">
                    Now Playing: {playingFreq} Hz Solfeggio Vibration
                  </span>
                  <span className="text-[14px] text-purple-200">
                    {binauralMode ? `Binaural Theta Beat Layer active (${playingFreq} Hz + ${playingFreq + 4} Hz)` : "Pure Carrier Wave"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-6 bg-cyan-400 rounded-full animate-pulse"></span>
                <span className="w-1.5 h-10 bg-purple-400 rounded-full animate-pulse delay-75"></span>
                <span className="w-1.5 h-4 bg-pink-400 rounded-full animate-pulse delay-150"></span>
                <span className="w-1.5 h-8 bg-amber-400 rounded-full animate-pulse delay-100"></span>
                <span className="w-1.5 h-5 bg-emerald-400 rounded-full animate-pulse"></span>
              </div>
            </div>
          )}

          {/* Preset Frequency Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {[
              { freq: 174, label: "174 Hz", planet: "Ketu", benefit: "Pain & Grounding" },
              { freq: 285, label: "285 Hz", planet: "Saturn", benefit: "Cellular Healing" },
              { freq: 396, label: "396 Hz", planet: "Mars", benefit: "Liberation & Courage" },
              { freq: 432, label: "432 Hz", planet: "Moon", benefit: "Cosmic Harmony" },
              { freq: 528, label: "528 Hz", planet: "Sun", benefit: "Miracle & Vitality" },
              { freq: 639, label: "639 Hz", planet: "Jupiter", benefit: "Love & Abundance" },
              { freq: 741, label: "741 Hz", planet: "Rahu", benefit: "Awakening & Clarity" },
              { freq: 852, label: "852 Hz", planet: "Mercury", benefit: "Intuition & Order" },
              { freq: 963, label: "963 Hz", planet: "Venus", benefit: "Divine Joy & Charm" },
            ].map((item) => {
              const isThisPlaying = isPlayingAudio && playingFreq === item.freq;
              return (
                <button
                  key={item.freq}
                  onClick={() => isThisPlaying ? stopAudio() : playSolfeggioTone(item.freq)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${isThisPlaying
                    ? "bg-gradient-to-r from-cyan-600 to-purple-600 border-cyan-300 text-white shadow-lg scale-[1.02] ring-2 ring-cyan-400"
                    : "bg-purple-900/40 hover:bg-purple-800/60 border-purple-800/80 text-purple-100"
                    }`}
                >
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className="text-[18px] font-black tracking-wider text-cyan-200">{item.planet}</span>
                    {isThisPlaying ? (
                      <Square className="w-3.5 h-3.5 text-white fill-current animate-pulse" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-purple-300 fill-purple-300 opacity-70" />
                    )}
                  </div>
                  <span className="text-[18px] font-black text-white">{item.label}</span>
                  <span className="text-[14px] text-purple-300 font-semibold">{item.benefit}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantum Remedies & Tuning */}
        <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-bold text-purple-950 text-[18px] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>🎵 Harmonic Quantum Tuning & Remedies</span>
            </span>
            <span className="text-[14px] text-purple-700 bg-purple-50 px-3 py-1 rounded-full font-bold">
              Listen to Custom Void Frequencies
            </span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {remedies.map((rem, idx) => {
              const numericFreq = parseInt(rem.solfeggio_freq);
              const isCardPlaying = isPlayingAudio && playingFreq === numericFreq;
              return (
                <div key={idx} className="bg-purple-50/60 border border-purple-200/70 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-purple-900 text-[18px]">Number {rem.missing_number} Void</span>
                      <span className="text-[14px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">{rem.solfeggio_freq}</span>
                    </div>
                    <p className="text-[14px] font-bold text-slate-800">Planet: {rem.planet}</p>
                    <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                      {rem.quantum_tuning}
                    </p>
                    <div className="text-[14px] font-semibold text-purple-900 bg-white p-2 rounded-xl border border-purple-100">
                      <strong>Bija Mantra:</strong> {rem.bija_mantra}
                    </div>
                  </div>

                  <button
                    onClick={() => isCardPlaying ? stopAudio() : playSolfeggioTone(numericFreq)}
                    className={`w-full mt-2 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${isCardPlaying
                      ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                      : "bg-purple-900 hover:bg-purple-950 text-white"
                      }`}
                  >
                    {isCardPlaying ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop {rem.solfeggio_freq} Audio</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play {rem.solfeggio_freq} Audio Remedy</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Business & Brand Name Quantum Resonance Tuner */}
        <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-100 pb-3">
            <div>
              <h4 className="font-bold text-purple-950 text-[18px] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <span>Quantum Brand & Business Name Optimizer</span>
              </h4>
              <p className="text-[14px] text-slate-500">
                Analyze company names, social handles, or personal signatures against your birth vibration.
              </p>
            </div>
            <span className="text-[14px] font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full w-fit">
              Chaldean Quantum Resonance Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[14px] font-extrabold text-purple-900 uppercase">
                Enter Business / Brand / Handle / Signature:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={brandInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBrandInput(val);
                    if (val.trim()) {
                      const res = calculateBrandResonance(val, result?.mulank, result?.bhagyank);
                      setBrandResult(res);
                    } else {
                      setBrandResult(null);
                    }
                  }}
                  placeholder="e.g. Astro Consult, Zenith Corp, @quantum_app"
                  className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-semibold text-slate-800 bg-purple-50/30"
                />
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  if (brandInput.trim()) {
                    const res = calculateBrandResonance(brandInput, result?.mulank, result?.bhagyank);
                    setBrandResult(res);
                  }
                }}
                className="w-full bg-purple-900 hover:bg-purple-950 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Analyze Resonance</span>
              </button>
            </div>
          </div>

          {/* Brand Analysis Output Card */}
          {brandResult && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white border border-purple-200 space-y-4 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-purple-200/60 pb-3">
                <div>
                  <span className="text-[14px] font-bold uppercase tracking-wider text-purple-700 block">Brand Analysis Target</span>
                  <h5 className="text-[18px] font-black text-purple-950">{brandResult.brandName}</h5>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[14px] font-bold text-slate-500 block uppercase">Phase Coherence</span>
                    <span className="text-[24px] font-black text-rose-600">{brandResult.harmony}%</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[14px] font-extrabold ${brandResult.harmony >= 80 ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
                    {brandResult.statusText}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[14px]">
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-slate-400 font-bold block uppercase text-[14px]">Chaldean Sum</span>
                  <span className="text-[18px] font-black text-purple-900">{brandResult.rawTotal}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-slate-400 font-bold block uppercase text-[14px]">Single Root Digit</span>
                  <span className="text-[18px] font-black text-rose-600">{brandResult.singleDigit} ({brandResult.planet})</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-slate-400 font-bold block uppercase text-[14px]">Solfeggio Frequency</span>
                  <span className="text-lg font-black text-cyan-600">{brandResult.freq} Hz</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-slate-400 font-bold block uppercase text-[14px]">Resonance Element</span>
                  <span className="text-sm font-bold text-slate-800">{brandResult.element}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1 text-[14px]">
                <div className="p-3 bg-purple-100/60 rounded-xl text-purple-950 font-medium">
                  <strong>Corporate Traits & Energy:</strong> {brandResult.traits}
                </div>

                <div className="p-3 bg-pink-50 rounded-xl border border-pink-100 text-slate-800 font-medium">
                  <strong>Auspicious Brand Palette & Gemstone Alignment:</strong> {brandResult.color}
                </div>

                {brandResult.compoundDetail && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
                    <strong className="text-amber-900 block font-black text-[14px] mb-0.5">
                      🌟 Compound Royal Star Number {brandResult.rawTotal}: {brandResult.compoundDetail.title}
                    </strong>
                    <p className="text-[14px] leading-relaxed">{brandResult.compoundDetail.desc}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLifespanCyclesPanel = () => {
    const data = getPinnacleAndChallengeData(result.dob, result.bhagyank);

    return (
      <div className="space-y-6 animate-fadeIn">

        {/* Lifespan Pinnacles & Challenges Card */}
        <div className="bg-white border border-rose-100 rounded-5xl p-6 shadow-sm space-y-6">
          <h3 className="text-[22px] font-bold text-rose-955 border-b border-rose-100 pb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-600 animate-pulse" />
            Your Lifespan Pinnacle Cycles & Challenge Numbers
          </h3>
          <p className="text-[18px] text-orange-900 leading-relaxed">
            Your life is divided into four major Pinnacles, each bringing a unique vibration or focus area, accompanied by a specific challenge lesson that must be integrated.
          </p>

          <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 text-[18px] font-medium text-amber-900">
            Current Age: <strong className="text-rose-700 text-[20px]">{data?.age || 0} Years</strong> (Active cycle phase is highlighted below)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.pinnacles.map((p, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-3xl border transition-all ${p.isActive
                  ? "bg-gradient-to-br from-rose-50/60 to-amber-50/40 border-rose-400 ring-2 ring-rose-200/50 shadow-md"
                  : "bg-white border-rose-100/60 opacity-80 hover:opacity-100"
                  }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="text-[20px] font-bold text-rose-955">{p.phase}</h4>
                    <span className="text-[16px] font-bold text-slate-500">{p.ageSpan}</span>
                  </div>
                  {p.isActive && (
                    <span className="bg-rose-600 text-white text-[14px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                      Active
                    </span>
                  )}
                </div>

                <div className="space-y-4 text-[18px]">
                  {/* Pinnacle Value */}
                  <div className="bg-white/80 p-3 rounded-xl border border-rose-100/20">
                    <span className="font-bold text-rose-800">Pinnacle Number {p.val}:</span>
                    <p className="text-amber-900 font-medium mt-1 leading-relaxed">
                      {p.theme}
                    </p>
                  </div>

                  {/* Challenge Value */}
                  <div className="bg-white/80 p-3 rounded-xl border border-rose-100/20">
                    <span className="font-bold text-orange-800">Challenge Number {p.challenge}:</span>
                    <p className="text-slate-900 font-medium mt-1 leading-relaxed">
                      {p.challengeTheme}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Short-Term Progressive predictions & Temporal Cycles Forecast (Relocated here!) */}
        <div className="bg-white border border-rose-100 rounded-5xl p-6 shadow-sm space-y-6">
          <h3 className="text-[22px] font-bold text-rose-955 border-b border-rose-100 pb-3 flex items-center gap-2">
            <Compass className="w-5 h-5 text-rose-600 animate-spin-slow" />
            Current Progressive Cycles & Forecasts
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Personal Year Card */}
            <div className="bg-gradient-to-br from-rose-50 to-amber-50/30 p-5 rounded-2xl border border-rose-100 flex flex-col justify-between">
              <div>
                <span className="text-[14px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100/50 px-2.5 py-1 rounded-full">
                  Current Year Vibration
                </span>
                <h4 className="text-[20px] font-bold text-rose-955 mt-3">
                  Personal Year {result.personalYear}
                </h4>
                <p className="text-[16px] text-amber-900 mt-2 leading-relaxed">
                  Overall vibration theme of the entire year:
                </p>
                <p className="text-[18px] font-semibold text-slate-900 mt-2 bg-white/70 p-2.5 rounded-xl border border-rose-100/30 leading-relaxed">
                  {result.personalYearDetails?.traits || "Year of development and progress."}
                </p>
              </div>
              <div className="text-[18px] text-slate-900 mt-4 border-t border-rose-100/50 pt-2 font-semibold">
                Ruling Planet: {result.personalYearDetails?.planet || "Sun"}
              </div>
            </div>

            {/* Daily Forecast Gauge */}
            {(() => {
              const today = new Date();
              const currentMonthNum = today.getMonth() + 1;
              const currentDayNum = today.getDate();
              const pMonth = reduceToSingleDigit(result.personalYear + currentMonthNum);
              const pDay = reduceToSingleDigit(pMonth + currentDayNum);
              const dayData = getDayForecast(pDay);
              return (
                <div className="bg-white border border-rose-100 p-5 rounded-2xl shadow-sm text-center flex flex-col justify-between md:col-span-2 relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 rounded-full px-2.5 py-1 text-[12px] font-bold uppercase">
                    Today's Energy
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 my-2">
                    {/* Circular progress ring representing the daily number */}
                    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center bg-rose-50 rounded-full border-4 border-rose-400 shadow-inner">
                      <span className="text-5xl font-black text-rose-600">{pDay}</span>
                    </div>
                    <div className="text-left space-y-1">
                      <h5 className="font-bold text-slate-900 text-[20px]">{dayData.tagline}</h5>
                      <p className="text-[18px] text-slate-900 mt-1 leading-relaxed">
                        {dayData.advice}
                      </p>
                    </div>
                  </div>
                  <div className="text-[18px] text-slate-900 text-left border-t border-slate-100 pt-2 font-semibold">
                    Current Date: {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Personal Month Timeline */}
          <div className="border-t border-rose-100 pt-4">
            <h4 className="text-[20px] font-bold text-rose-955 mb-3">
              Monthly Forecast Timeline ({result.currentYear})
            </h4>

            {/* Months slider */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-rose-200">
              {Array.from({ length: 12 }, (_, i) => {
                const mIndex = i + 1;
                const pMonth = reduceToSingleDigit(result.personalYear + mIndex);
                const mName = new Date(2026, i).toLocaleString('en-US', { month: 'short' });
                const isActive = selectedForecastMonth === mIndex;
                return (
                  <button
                    key={mIndex}
                    onClick={() => setSelectedForecastMonth(mIndex)}
                    className={`px-4 py-2.5 rounded-xl border text-center transition-all shrink-0 min-w-[70px] ${isActive
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                      : 'bg-rose-50/30 text-rose-950 border-rose-100/50 hover:bg-rose-50'
                      }`}
                  >
                    <span className="text-[16px] font-bold block leading-none">{mName}</span>
                    <span className={`text-[14px] font-black block mt-1 ${isActive ? 'text-amber-200' : 'text-rose-600'}`}>
                      Vib: {pMonth}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Month Details Display */}
            {(() => {
              const mData = getMonthForecast(reduceToSingleDigit(result.personalYear + selectedForecastMonth));
              const monthFull = new Date(2026, selectedForecastMonth - 1).toLocaleString('en-US', { month: 'long' });
              return (
                <div className="bg-rose-50/20 border border-rose-100/70 rounded-2xl p-4 mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[18px] font-bold text-rose-800 uppercase tracking-wider">
                      {monthFull} Vibration
                    </span>
                    <span className="text-[18px] font-bold bg-rose-100 text-slate-900 px-2.5 py-0.5 rounded-full">
                      Personal Month {reduceToSingleDigit(result.personalYear + selectedForecastMonth)}
                    </span>
                  </div>
                  <h5 className="font-bold text-rose-955 text-[20px] mb-1">{mData.title}</h5>
                  <p className="text-[18px] text-slate-900 mb-2 leading-relaxed">
                    <strong>Primary Focus:</strong> {mData.focus}
                  </p>
                  <p className="text-[18px] text-slate-900 leading-relaxed bg-white/50 p-3 rounded-xl border border-rose-100/20 font-medium">
                    <strong>Actionable Advice:</strong> {mData.advice}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-rose-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-rose-600 text-white p-2.5 rounded-2xl shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-rose-950 tracking-tight">
              Vedic & Chaldean Numerology
            </h1>
            <p className="text-xs md:text-[16px] text-rose-700 font-medium">
              Deep numerical analytics of your name, personality, destiny, and remedies
            </p>
          </div>
        </div>
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
          {result && (
            <div className="p-1 bg-rose-50/60 border border-rose-200 rounded-xl shadow-xs">
              <select
                value={activeTab}
                onChange={(e) => {
                  const val = e.target.value;
                  const urlParams = new URLSearchParams({
                    name: name || '',
                    date: dob || ''
                  });

                  if (val.startsWith('ext_')) {
                    // Handle external popup reports
                    switch (val) {
                      case 'ext_remedy':
                        urlParams.append('remedy_numerology', 'true');
                        window.open(`/?${urlParams.toString()}`, 'RemedyNumerology', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no')?.focus();
                        break;
                      case 'ext_medical':
                        urlParams.append('medical_numerology', 'true');
                        window.open(`/?${urlParams.toString()}`, 'MedicalNumerology', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no')?.focus();
                        break;
                      case 'ext_personality':
                        urlParams.append('personality_numerology', 'true');
                        window.open(`/?${urlParams.toString()}`, 'PersonalityNumerology', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no')?.focus();
                        break;
                      case 'ext_career':
                        urlParams.append('carrier_numerology', 'true');
                        window.open(`/?${urlParams.toString()}`, 'CarrierNumerology', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no')?.focus();
                        break;
                      case 'ext_prediction':
                        urlParams.append('prediction_numerology', 'true');
                        window.open(`/?${urlParams.toString()}`, 'PredictionNumerology', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no')?.focus();
                        break;
                      case 'ext_daily':
                        urlParams.append('daily_numerology', 'true');
                        window.open(`/?${urlParams.toString()}`, 'DailyNumerology', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no')?.focus();
                        break;
                      default:
                        break;
                    }
                  } else {
                    // Internal tabs
                    setActiveTab(val);
                  }
                }}
                className="w-full bg-white border border-rose-300 text-rose-950 font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm shadow-sm appearance-none cursor-pointer pr-8"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23881337'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
              >
                <optgroup label="Dashboard Views">
                  <option value="report">Detailed Report</option>
                  <option value="prediction">Special Yogas</option>
                  <option value="correction">Name Correction</option>
                  <option value="compatibility">Marriage Match</option>
                  <option value="vastu">Vastu & Yogas</option>
                  <option value="analytics">Numerology Grid (Analytics)</option>
                  <option value="cycles">Life Cycles & Years</option>
                  <option value="quantum">Quantum Sync</option>
                  <option value="mobile">Mobile Numerology</option>
                </optgroup>
                <optgroup label="Advanced External Reports">
                  <option value="ext_remedy"> Remedy Numerology</option>
                  <option value="ext_medical"> Medical Diagnostics</option>
                  <option value="ext_personality"> Personality Matrix</option>
                  <option value="ext_career"> Career Prediction</option>
                  <option value="ext_prediction"> Car & Home Prediction</option>
                  <option value="ext_daily"> Daily Forecast</option>
                </optgroup>
              </select>
            </div>
          )}
          <button
            onClick={handleClose}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl font-bold transition-all text-sm border border-rose-200 shrink-0 h-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Close Dashboard</span>
            <span className="md:hidden">Close</span>
          </button>
        </div>
      </div>

      {
        error && (
          <div className="bg-rose-100 border border-rose-300 text-rose-800 p-4 rounded-xl flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )
      }

      {
        !result ? (
          <div className="max-w-md mx-auto bg-white border border-rose-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-rose-200/50 mt-10">
            <h2 className="text-xl font-bold text-rose-950 text-center mb-6">
              Enter Birth Details
            </h2>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-rose-50/50 border border-rose-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-rose-50/50 border border-rose-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-rose-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Calculate Numerology Profile"}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">


            {activeTab === "report" && (
              <div className="space-y-6">
                {/* Sticky Quick-Jump Sub-Nav Bar */}
                <div className="sticky top-2 z-20 bg-white/95 backdrop-blur-md border border-rose-200/80 rounded-2xl p-2.5 shadow-md flex items-center gap-4">
                  <span className="text-[18px] font-black text-rose-900 uppercase tracking-wider pl-2 shrink-0 flex items-center gap-1">
                    <span>📍</span> Quick Jump:
                  </span>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;

                      const urlParams = new URLSearchParams({
                        name: name || '',
                        date: dob || ''
                      });

                      if (val.startsWith('ext_')) {
                        switch (val) {
                          case 'ext_remedy':
                            urlParams.append('remedy_numerology', 'true');
                            window.open(`/?${urlParams.toString()}`, 'RemedyNumerology', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no')?.focus();
                            break;
                          case 'ext_medical':
                            urlParams.append('medical_numerology', 'true');
                            window.open(`/?${urlParams.toString()}`, 'MedicalNumerology', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no')?.focus();
                            break;
                          case 'ext_personality':
                            urlParams.append('personality_numerology', 'true');
                            window.open(`/?${urlParams.toString()}`, 'PersonalityNumerology', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no')?.focus();
                            break;
                          case 'ext_career':
                            urlParams.append('carrier_numerology', 'true');
                            window.open(`/?${urlParams.toString()}`, 'CarrierNumerology', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no')?.focus();
                            break;
                          case 'ext_prediction':
                            urlParams.append('prediction_numerology', 'true');
                            window.open(`/?${urlParams.toString()}`, 'PredictionNumerology', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no')?.focus();
                            break;
                          case 'ext_daily':
                            urlParams.append('daily_numerology', 'true');
                            window.open(`/?${urlParams.toString()}`, 'DailyNumerology', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no')?.focus();
                            break;
                          default:
                            break;
                        }
                      } else {
                        document.getElementById(val)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                      e.target.value = ""; // Reset to placeholder
                    }}
                    className="flex-0.5 min-w-[200px] bg-white border border-rose-300 text-rose-950 font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm shadow-sm appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23881337'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
                  >
                    <option value="" disabled selected>Jump to section...</option>
                    <optgroup label="Page Sections">
                      <option value="num-sec-core"> Core Numbers</option>
                      <option value="num-sec-profile"> Profile Analysis</option>
                      <option value="num-sec-loshugrid"> Loshu Grid</option>
                      <option value="num-sec-repeateddob"> Repeated DOB</option>
                      <option value="num-sec-planes"> Grid Planes</option>
                      <option value="num-sec-cycles"> Cycles & Predictions</option>
                      <option value="num-sec-domains"> Life Domains</option>
                      <option value="num-sec-remedies"> Missing Remedies</option>
                      <option value="num-sec-matrix"> Lucky Dates</option>
                    </optgroup>
                    <optgroup label="Advanced External Reports">
                      <option value="ext_remedy"> Powerful Remedies</option>
                      <option value="ext_medical"> Medical Diagnostics</option>
                      <option value="ext_personality"> Personality Matrix</option>
                      <option value="ext_career"> Career & Wealth</option>
                      <option value="ext_prediction"> Special Yogas Page</option>
                      <option value="ext_daily"> Daily Forecast</option>
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Left Column: Core Numbers, Profile Analysis, and Loshu Grid Visual */}
                  <div className="space-y-6 lg:col-span-2">

                    {/* Core Numbers Overview */}
                    <div id="num-sec-core" className="grid grid-cols-1 md:grid-cols-3 gap-4 scroll-mt-20">

                      {/* Mulank (Ruling) */}
                      <div className="bg-white border border-rose-100 p-5 rounded-2xl shadow-sm text-center flex flex-col justify-between">
                        <div>
                          <span className="inline-flex items-center gap-1 text-[18px] font-bold text-slate-900 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-full mb-3">
                            <Star className="w-3 h-3" /> Mulank (Ruling)
                          </span>
                          <p className="text-orange-900 text-[16px] font-medium mb-1">Birth Date Day Vibration</p>
                        </div>
                        <div className="my-3">
                          <span className="text-5xl font-black text-rose-600">{result.mulank}</span>
                        </div>
                        <div className="text-[16px] font-bold text-slate-900 bg-rose-50/50 py-1.5 rounded-lg">
                          Planet: {result.mulankDetails.planet}
                        </div>
                      </div>

                      {/* Bhagyank (Destiny) */}
                      <div className="bg-white border border-rose-100 p-5 rounded-2xl shadow-sm text-center flex flex-col justify-between">
                        <div>
                          <span className="inline-flex items-center gap-1 text-[18px] font-bold text-slate-900 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-full mb-3">
                            <Compass className="w-3 h-3" /> Bhagyank (Destiny)
                          </span>
                          <p className="text-orange-900 text-[16px] font-medium mb-1">Full Date of Birth Sum</p>
                        </div>
                        <div className="my-3">
                          <span className="text-5xl font-black text-rose-600">{result.bhagyank}</span>
                        </div>
                        <div className="text-[16px] font-bold text-slate-900 bg-rose-50/50 py-1.5 rounded-lg">
                          Planet: {result.bhagyankDetails.planet}
                        </div>
                      </div>

                      {/* Namank (Name Vibration with Chaldean vs Pythagorean Toggle) */}
                      <div className="bg-white border border-rose-100 p-5 rounded-2xl shadow-sm text-center flex flex-col justify-between relative overflow-hidden">
                        <div>
                          <span className="inline-flex items-center gap-1 text-[18px] font-bold text-slate-900 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-full mb-2">
                            <User className="w-3 h-3" /> Namank ({nameSystem})
                          </span>
                          <div className="flex justify-center mb-1">
                            <button
                              onClick={() => setNameSystem(nameSystem === "Chaldean" ? "Pythagorean" : "Chaldean")}
                              className="inline-flex items-center gap-1 text-[16px] bg-rose-100 hover:bg-rose-200 text-orange-900 font-bold px-2 py-0.5 rounded-full transition-all border border-rose-200"
                            >
                              Toggle System
                            </button>
                          </div>
                        </div>
                        <div className="my-2">
                          <span className="text-5xl font-black text-rose-600">
                            {nameSystem === "Chaldean" ? result.namank : result.pythagoreanNamank}
                          </span>
                        </div>
                        <div className="text-[16px] font-bold text-slate-900 bg-rose-50/50 py-1.5 rounded-lg">
                          Planet: {nameSystem === "Chaldean" ? result.namankDetails.planet : "Calculated"}
                        </div>
                      </div>

                    </div>

                    {/* Chaldean vs Pythagorean Comparison Card */}
                    <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-[20px] font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <ToggleLeft className="w-5 h-5 text-rose-600" /> Name Number System Analysis
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className={`p-4 rounded-2xl border transition-all ${nameSystem === "Chaldean" ? "bg-rose-50 border-rose-200" : "bg-white border-slate-100"}`}>
                          <h4 className="font-bold text-rose-955 text-[16px] mb-1">Chaldean / Cheiro System</h4>
                          <p className="text-[16px] text-slate-900 mb-2 leading-relaxed">Originating in ancient Babylon, it assigns values based on sounds and vibration rather than alphabetical order.</p>
                          <span className="text-[16px] font-bold text-rose-955">Namank Score: {result.namank}</span>
                        </div>
                        <div className={`p-4 rounded-2xl border transition-all ${nameSystem === "Pythagorean" ? "bg-rose-50 border-rose-200" : "bg-white border-slate-100"}`}>
                          <h4 className="font-bold text-rose-950 text-[16px] mb-1">Pythagorean System</h4>
                          <p className="text-[16px] text-slate-900 mb-2 leading-relaxed">Developed by the Greek philosopher Pythagoras, it maps letters sequentially from 1 to 9 based on the alphabet.</p>
                          <span className="text-sm font-black text-rose-700">Namank Score: {result.pythagoreanNamank}</span>
                        </div>
                      </div>
                    </div>

                    {/* In-depth Core Profile Panels */}
                    <div id="num-sec-profile" className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm space-y-6 scroll-mt-20">
                      <h3 className="text-[20px] font-bold text-slate-900 border-b border-rose-100 pb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-rose-600" /> Numerological Profile Analysis
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-[18px] font-bold text-orange-900 mb-1">
                            Mulank {result.mulank} - Core Personality
                          </h4>
                          <p className="text-[18px] text-slate-900 font-medium leading-relaxed bg-rose-50/20 p-3.5 rounded-xl border border-rose-100/50">
                            {result.mulankDetails.traits}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[18px] font-bold text-orange-900 mb-1">
                            Bhagyank {result.bhagyank} - Destiny & Careers
                          </h4>
                          <p className="text-[18px] text-slate-900 font-medium leading-relaxed bg-rose-50/20 p-3.5 rounded-xl border border-rose-100/50">
                            <strong>Best Fields: </strong> {result.bhagyankDetails.careers}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[18px] font-bold text-orange-900 mb-1">
                            Personal Year Forecast ({result.currentYear})
                          </h4>
                          <p className="text-[18px] text-slate-900 font-medium leading-relaxed bg-rose-50/20 p-3.5 rounded-xl border border-rose-100/50">
                            Your Personal Year vibration is <strong className="text-rose-700">{result.personalYear}</strong>.
                            This year is ruled by <strong>{result.personalYearDetails.planet}</strong>, indicating a phase of:{" "}
                            {result.personalYearDetails.traits}
                          </p>
                          {/* Numerology & Rudraksha Recommendation */}
                          {(() => {
                            const rudrakshaInfo = NUMEROLOGY_RUDRAKSHA_DATA[result.mulank];
                            if (!rudrakshaInfo) return null;
                            return (
                              <div className="pt-2 border-t border-rose-100">
                                <h4 className="text-[18px] font-bold text-orange-900 mb-2 flex items-center gap-2">
                                  <span>📿</span> Numerology & Rudraksha Recommendation
                                </h4>
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                                      <span>{rudrakshaInfo.icon}</span> Root Number (Mulank {result.mulank}): Ruled by {rudrakshaInfo.planet}
                                    </span>
                                    <span className="text-xs bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full font-bold">
                                      Born on: {rudrakshaInfo.dates}
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-rose-950">
                                    <strong>Recommended Bead:</strong> <span className="text-amber-800 font-extrabold">{rudrakshaInfo.mukhi}</span>
                                  </p>
                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    <strong>Purpose & Benefits:</strong> {rudrakshaInfo.benefits}
                                  </p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Loshu Grid Visual Card - Displayed below Numerological Profile Analysis */}
                      <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col items-stretch w-full">
                        <h3 className="text-[22px] font-bold text-orange-900 mb-1 text-center w-full">Loshu Grid</h3>
                        <p className="text-[16px] text-slate-900 font-semibold uppercase tracking-wider mb-5 text-center w-full">3x3 Saturnine Magic Square</p>

                        <div className="grid grid-cols-3 gap-4 w-full">

                          {/* Row 1 */}
                          {/* Cell 4 */}
                          <div className={`p-4 rounded-3xl flex flex-col items-center justify-between text-center relative text-slate-900 bg-white shadow-md border-2 border-amber-400 transition-all duration-300 ${isCellHighlighted(4) ? 'ring-4 ring-rose-500 border-rose-500 scale-[1.04] bg-rose-50/50 shadow-lg z-10' : ''}`}>
                            <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold">4</div>
                            <div className="my-3">
                              {result.loshuGrid[4] > 0 ? (
                                <span className="text-3xl font-black text-amber-600">{getGridVal(4)}</span>
                              ) : (
                                <span className="text-2xl font-bold text-slate-300 line-through">4</span>
                              )}
                            </div>
                            <div className="space-y-2 text-[16px]">
                              <p className="font-semibold text-slate-700 leading-tight">Discipline, Stability, Hard Work, Practicality, Organization, Structure</p>
                              <div className="text-[16px] bg-amber-50/70 border border-amber-100 py-1.5 rounded space-y-0.5 font-bold text-amber-900 w-full">
                                <p>Element: Wood</p>
                                <p>Planet: Rahu</p>
                                <p>Merit: Stability</p>
                                <p>Direction: Southeast</p>
                              </div>
                            </div>
                          </div>

                          {/* Cell 9 */}
                          <div className={`p-4 rounded-3xl flex flex-col items-center justify-between text-center relative text-slate-900 bg-white shadow-md border-2 border-orange-400 transition-all duration-300 ${isCellHighlighted(9) ? 'ring-4 ring-rose-500 border-rose-500 scale-[1.04] bg-rose-50/50 shadow-lg z-10' : ''}`}>
                            <div className="absolute top-2 right-2 bg-orange-100 text-orange-800 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold">9</div>
                            <div className="my-3">
                              {result.loshuGrid[9] > 0 ? (
                                <span className="text-3xl font-black text-orange-600">{getGridVal(9)}</span>
                              ) : (
                                <span className="text-2xl font-bold text-slate-300 line-through">9</span>
                              )}
                            </div>
                            <div className="space-y-2 text-[16px]">
                              <p className="font-semibold text-slate-700 leading-tight">Compassion, Empathy, Idealism, Generosity, Sacrifice, Vision, Humanitarianism</p>
                              <div className="text-[16px] bg-orange-50/70 border border-orange-100 py-1.5 rounded space-y-0.5 font-bold text-orange-900 w-full">
                                <p>Element: Fire</p>
                                <p>Planet: Mars</p>
                                <p>Merit: Compassion</p>
                                <p>Direction: South</p>
                              </div>
                            </div>
                          </div>

                          {/* Cell 2 */}
                          <div className={`p-4 rounded-3xl flex flex-col items-center justify-between text-center relative text-slate-900 bg-white shadow-md border-2 border-indigo-400 transition-all duration-300 ${isCellHighlighted(2) ? 'ring-4 ring-rose-500 border-rose-500 scale-[1.04] bg-rose-50/50 shadow-lg z-10' : ''}`}>
                            <div className="absolute top-2 right-2 bg-indigo-100 text-indigo-800 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold">2</div>
                            <div className="my-3">
                              {result.loshuGrid[2] > 0 ? (
                                <span className="text-3xl font-black text-indigo-600">{getGridVal(2)}</span>
                              ) : (
                                <span className="text-2xl font-bold text-slate-300 line-through">2</span>
                              )}
                            </div>
                            <div className="space-y-2 text-[16px]">
                              <p className="font-semibold text-slate-700 leading-tight">Cooperation, Sensitivity, Harmony, Balance, Partnership, Diplomacy, Receptivity</p>
                              <div className="text-[16px] bg-indigo-50/70 border border-indigo-100 py-1.5 rounded space-y-0.5 font-bold text-indigo-900 w-full">
                                <p>Element: Earth</p>
                                <p>Planet: Moon</p>
                                <p>Merit: Supportiveness</p>
                                <p>Direction: Southwest</p>
                              </div>
                            </div>
                          </div>

                          {/* Row 2 */}
                          {/* Cell 3 */}
                          <div className={`p-4 rounded-3xl flex flex-col items-center justify-between text-center relative text-slate-900 bg-white shadow-md border-2 border-emerald-400 transition-all duration-300 ${isCellHighlighted(3) ? 'ring-4 ring-rose-500 border-rose-500 scale-[1.04] bg-rose-50/50 shadow-lg z-10' : ''}`}>
                            <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold">3</div>
                            <div className="my-3">
                              {result.loshuGrid[3] > 0 ? (
                                <span className="text-3xl font-black text-emerald-600">{getGridVal(3)}</span>
                              ) : (
                                <span className="text-2xl font-bold text-slate-300 line-through">3</span>
                              )}
                            </div>
                            <div className="space-y-2 text-[16px]">
                              <p className="font-semibold text-slate-700 leading-tight">Expression, Creativity, Joy, Charisma, Communication, Art, Optimism</p>
                              <div className="text-[16px] bg-emerald-50/70 border border-emerald-100 py-1.5 rounded space-y-0.5 font-bold text-emerald-900 w-full">
                                <p>Element: Wood</p>
                                <p>Planet: Jupiter</p>
                                <p>Merit: Creativity</p>
                                <p>Direction: East</p>
                              </div>
                            </div>
                          </div>

                          {/* Cell 5 */}
                          <div className={`p-4 rounded-3xl flex flex-col items-center justify-between text-center relative text-slate-900 bg-white shadow-md border-2 border-indigo-500 transition-all duration-300 ${isCellHighlighted(5) ? 'ring-4 ring-rose-500 border-rose-500 scale-[1.04] bg-rose-50/50 shadow-lg z-10' : ''}`}>
                            <div className="absolute top-2 right-2 bg-indigo-100 text-indigo-800 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold">5</div>
                            <div className="my-3">
                              {result.loshuGrid[5] > 0 ? (
                                <span className="text-3xl font-black text-indigo-700">{getGridVal(5)}</span>
                              ) : (
                                <span className="text-2xl font-bold text-slate-300 line-through">5</span>
                              )}
                            </div>
                            <div className="space-y-2 text-[16px]">
                              <p className="font-semibold text-slate-700 leading-tight">Freedom, Adaptability, Change, Adventure, Versatility, Movement, Exploration</p>
                              <div className="text-[16px] bg-indigo-50/70 border border-indigo-100 py-1.5 rounded space-y-0.5 font-bold text-indigo-955 w-full">
                                <p>Element: Earth</p>
                                <p>Planet: Mercury</p>
                                <p>Merit: Balance</p>
                                <p>Direction: Center</p>
                              </div>
                            </div>
                          </div>

                          {/* Cell 7 */}
                          <div className={`p-4 rounded-3xl flex flex-col items-center justify-between text-center relative text-slate-900 bg-white shadow-md border-2 border-teal-400 transition-all duration-300 ${isCellHighlighted(7) ? 'ring-4 ring-rose-500 border-rose-500 scale-[1.04] bg-rose-50/50 shadow-lg z-10' : ''}`}>
                            <div className="absolute top-2 right-2 bg-teal-100 text-teal-800 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold">7</div>
                            <div className="my-3">
                              {result.loshuGrid[7] > 0 ? (
                                <span className="text-3xl font-black text-teal-600">{getGridVal(7)}</span>
                              ) : (
                                <span className="text-2xl font-bold text-slate-300 line-through">7</span>
                              )}
                            </div>
                            <div className="space-y-2 text-[16px]">
                              <p className="font-semibold text-slate-700 leading-tight">Spirituality, Wisdom, Research, Inner Growth, Solitude, Introspection, Knowledge</p>
                              <div className="text-[16px] bg-teal-50/70 border border-teal-100 py-1.5 rounded space-y-0.5 font-bold text-teal-900 w-full">
                                <p>Element: Metal</p>
                                <p>Planet: Ketu</p>
                                <p>Merit: Wisdom</p>
                                <p>Direction: West</p>
                              </div>
                            </div>
                          </div>

                          {/* Row 3 */}
                          {/* Cell 8 */}
                          <div className={`p-4 rounded-3xl flex flex-col items-center justify-between text-center relative text-slate-900 bg-white shadow-md border-2 border-purple-400 transition-all duration-300 ${isCellHighlighted(8) ? 'ring-4 ring-rose-500 border-rose-500 scale-[1.04] bg-rose-50/50 shadow-lg z-10' : ''}`}>
                            <div className="absolute top-2 right-2 bg-purple-100 text-purple-800 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold">8</div>
                            <div className="my-3">
                              {result.loshuGrid[8] > 0 ? (
                                <span className="text-3xl font-black text-purple-600">{getGridVal(8)}</span>
                              ) : (
                                <span className="text-2xl font-bold text-slate-300 line-through">8</span>
                              )}
                            </div>
                            <div className="space-y-2 text-[16px]">
                              <p className="font-semibold text-slate-700 leading-tight">Power, Ambition, Authority, Status, Success, Control, Leadership</p>
                              <div className="text-[16px] bg-purple-50/70 border border-purple-100 py-1.5 rounded space-y-0.5 font-bold text-purple-900 w-full">
                                <p>Element: Earth</p>
                                <p>Planet: Saturn</p>
                                <p>Merit: Success</p>
                                <p>Direction: Northeast</p>
                              </div>
                            </div>
                          </div>

                          {/* Cell 1 */}
                          <div className={`p-4 rounded-3xl flex flex-col items-center justify-between text-center relative text-slate-900 bg-white shadow-md border-2 border-blue-400 transition-all duration-300 ${isCellHighlighted(1) ? 'ring-4 ring-rose-500 border-rose-500 scale-[1.04] bg-rose-50/50 shadow-lg z-10' : ''}`}>
                            <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold">1</div>
                            <div className="my-3">
                              {result.loshuGrid[1] > 0 ? (
                                <span className="text-3xl font-black text-blue-600">{getGridVal(1)}</span>
                              ) : (
                                <span className="text-2xl font-bold text-slate-300 line-through">1</span>
                              )}
                            </div>
                            <div className="space-y-2 text-[16px]">
                              <p className="font-semibold text-slate-700 leading-tight">Leadership, Individualism, Confidence, Creativity, Determination, Originality, Willpower</p>
                              <div className="text-[16px] bg-blue-50/70 border border-blue-100 py-1.5 rounded space-y-0.5 font-bold text-blue-900 w-full">
                                <p>Element: Water</p>
                                <p>Planet: Sun</p>
                                <p>Merit: Individualism</p>
                                <p>Direction: North</p>
                              </div>
                            </div>
                          </div>

                          {/* Cell 6 */}
                          <div className={`p-4 rounded-3xl flex flex-col items-center justify-between text-center relative text-slate-900 bg-white shadow-md border-2 border-rose-350 transition-all duration-300 ${isCellHighlighted(6) ? 'ring-4 ring-rose-500 border-rose-500 scale-[1.04] bg-rose-50/50 shadow-lg z-10' : ''}`}>
                            <div className="absolute top-2 right-2 bg-rose-100 text-rose-800 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold">6</div>
                            <div className="my-3">
                              {result.loshuGrid[6] > 0 ? (
                                <span className="text-3xl font-black text-rose-600">{getGridVal(6)}</span>
                              ) : (
                                <span className="text-2xl font-bold text-slate-300 line-through">6</span>
                              )}
                            </div>
                            <div className="space-y-2 text-[16px]">
                              <p className="font-semibold text-slate-700 leading-tight">Responsibility, Love, Service, Family, Compassion, Support, Harmony</p>
                              <div className="text-[16px] bg-rose-50/70 border border-rose-100 py-1.5 rounded space-y-0.5 font-bold text-rose-900 w-full">
                                <p>Element: Metal</p>
                                <p>Planet: Venus</p>
                                <p>Merit: Service</p>
                                <p>Direction: Northwest</p>
                              </div>
                            </div>
                          </div>

                        </div>

                        <div className="mt-6 text-[16px] text-slate-900 space-y-2 leading-relaxed text-center">
                          <p>
                            <strong>Loshu Grid</strong> indicates which elements and planes are fully active. Repeating numbers boost the respective element, while absent numbers suggest fields for remedy focus.
                          </p>
                        </div>
                      </div>

                      {/* Repeated Numbers in Date of Birth Analysis Card */}
                      <div id="num-sec-repeateddob" className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm space-y-6 scroll-mt-20">
                        <div className="border-b border-rose-100 pb-3">
                          <h3 className="text-[22px] font-bold text-orange-900 flex items-center gap-2">
                            <span>🔢</span> Repeated Numbers in Date of Birth Analysis
                          </h3>
                          <p className="text-[18px] text-slate-900 font-medium mt-1">
                            How frequency and repetition modulate planetary vibrations in your birth chart
                          </p>
                        </div>

                        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2">
                          <h4 className="text-[18px] font-bold text-amber-900 flex items-center gap-1.5">
                            <span>⚡</span> Core Principle: Planetary Frequency Modulation
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[18px] font-semibold text-slate-800 pt-1">
                            <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                              <span className="text-amber-700 font-extrabold block">Single (1x)</span>
                              Balanced, healthy expression of planetary traits.
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                              <span className="text-emerald-700 font-extrabold block">Double (2x)</span>
                              Peak strength, intuition, talent & leadership; very auspicious.
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                              <span className="text-orange-700 font-extrabold block">Triple (3x)</span>
                              Excess energy; over-sensitivity, stubbornness, or restlessness.
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                              <span className="text-rose-700 font-extrabold block">Quadruple+ (4x+)</span>
                              Over-saturation / Rahu-Ketu distortion; internal friction & mood swings.
                            </div>
                          </div>
                        </div>

                        {/* Dynamic DOB Digit Frequency Cards */}
                        {(() => {
                          const dobClean = (dob || '').replace(/\D/g, '');
                          const counts = {};
                          for (let num = 1; num <= 9; num++) counts[num] = 0;
                          for (let char of dobClean) {
                            const digit = parseInt(char, 10);
                            if (digit >= 1 && digit <= 9) counts[digit] = (counts[digit] || 0) + 1;
                          }

                          const activeNumbers = Object.keys(counts).map(Number).filter(n => counts[n] > 0);

                          return (
                            <div className="space-y-4">
                              <h4 className="text-[18px] font-bold text-slate-900 flex items-center justify-between">
                                <span>Your Active Digit Frequencies (DOB: {dob || "N/A"})</span>
                                <span className="text-[18px] bg-rose-100 text-rose-800 px-3 py-1 rounded-full font-bold">
                                  {activeNumbers.length} Digits Present
                                </span>
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                                  const count = counts[num];
                                  const data = REPEATED_NUMBERS_DATA[num];
                                  if (!data) return null;

                                  const freqKey = count >= 4 ? 4 : count;
                                  const interp = count > 0 ? data[freqKey] : "Digit absent in Date of Birth (Remedy recommended).";

                                  const badgeColor = count === 0 ? "bg-slate-100 text-slate-500 border-slate-200" :
                                    count === 1 ? "bg-blue-50 text-blue-800 border-blue-200" :
                                      count === 2 ? "bg-emerald-50 text-emerald-800 border-emerald-300" :
                                        count === 3 ? "bg-amber-50 text-amber-900 border-amber-300 font-extrabold" :
                                          "bg-rose-100 text-rose-900 border-rose-400 font-black";

                                  const badgeLabel = count === 0 ? "Absent (0x)" :
                                    count === 1 ? "Single (1x)" :
                                      count === 2 ? "Double (2x) - Peak" :
                                        count === 3 ? "Triple (3x) - High" :
                                          `Quadruple (${count}x) - Intense`;

                                  return (
                                    <div key={num} className={`p-4 rounded-2xl border transition-all ${count > 0 ? "bg-white shadow-sm border-rose-100 hover:shadow-md" : "bg-slate-50/60 border-slate-200 opacity-60"}`}>
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[18px]">{data.icon}</span>
                                          <div>
                                            <h5 className="text-[18px] font-bold text-slate-900">
                                              Number {num} - {data.planet}
                                            </h5>
                                            <p className="text-[18px] text-slate-500 font-medium">{data.domain}</p>
                                          </div>
                                        </div>
                                        <span className={`text-[18px] px-2.5 py-1 rounded-full border font-bold ${badgeColor}`}>
                                          {badgeLabel}
                                        </span>
                                      </div>
                                      <p className={`text-[18px] leading-relaxed font-medium ${count > 0 ? "text-slate-700 bg-rose-50/30 p-2.5 rounded-xl border border-rose-100/40" : "text-slate-500 italic p-2"}`}>
                                        {interp}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Loshu Planes Analysis */}
                      <div id="num-sec-planes" className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm scroll-mt-20">
                        <h3 className="text-[22px] font-bold text-orange-900 border-b border-rose-100 pb-3 mb-4 flex items-center gap-2">
                          <Compass className="w-5 h-5 text-orange-900" /> Loshu Grid Planes Analysis
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.loshuPlanes.map((plane, idx) => (
                            <div
                              key={idx}
                              onMouseEnter={() => setHoveredPlane(plane.name)}
                              onMouseLeave={() => setHoveredPlane(null)}
                              className="p-4 rounded-2xl border border-rose-100/50 bg-rose-50/10 flex flex-col justify-between transition-all hover:bg-rose-50/40 hover:border-rose-300 hover:shadow-md cursor-pointer"
                            >
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <h4 className="font-bold text-slate-900 text-[18px]">{plane.name}</h4>
                                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${plane.status === "Strong" ? "bg-green-100 text-green-800" :
                                    plane.status === "Moderate" ? "bg-yellow-100 text-yellow-800" :
                                      "bg-orange-100 text-orange-800"
                                    }`}>
                                    {plane.status}
                                  </span>
                                </div>
                                <p className="text-[18px] font-medium text-slate-900 mb-2">{plane.description}</p>
                              </div>
                              {plane.status === "Missing/Weak" && (
                                <div className="mt-2 text-[18px] md:text-[18px] bg-orange-50 text-emerald-900 p-2.5 rounded-xl border border-orange-100 flex items-start gap-1">
                                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 text-red-700 shrink-0" />
                                  <div>
                                    <span className="font-bold">Missing Remedy:</span> {plane.remedy}
                                  </div>
                                </div>
                              )}
                              {plane.status !== "Missing/Weak" && (
                                <div className="mt-2 text-[18px] md:text-[18px] bg-green-50 text-green-950 p-2.5 rounded-xl border border-green-100 flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5 text-green-700 shrink-0" />
                                  <span className="font-semibold">Plane elements are well balanced!</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progressive predictions & Temporal Cycles Forecast */}
                      <div id="num-sec-cycles" className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm space-y-6 scroll-mt-20">
                        <h3 className="text-[20px] font-bold text-orange-900 border-b border-rose-100 pb-3 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-rose-600" /> Progressive Predictions & Cycle Forecasts
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                          {/* Personal Year Card */}
                          <div className="bg-gradient-to-br from-rose-50 to-amber-50/30 p-5 rounded-2xl border border-rose-100 flex flex-col justify-between">
                            <div>
                              <span className="text-[18px] font-semibold uppercase tracking-wider text-slate-900 bg-rose-100/50 px-2.5 py-1 rounded-full">
                                Current Year Vibration
                              </span>
                              <h4 className="text-base font-semibold text-slate-900 mt-2">
                                Personal Year {result.personalYear}
                              </h4>
                              <p className="text-[16px] text-slate-900 mt-1 leading-relaxed">
                                Overall vibration theme of the entire year:
                              </p>
                              <p className="text-[16px] font-semibold text-slate-900 mt-2 bg-white/70 p-2.5 rounded-xl border border-rose-100/30">
                                {result.personalYearDetails?.traits || "Year of development and progress."}
                              </p>
                            </div>
                            <div className="text-[16px] text-slate-900 mt-4 border-t border-rose-100/50 pt-2 font-medium">
                              Ruling Planet: {result.personalYearDetails?.planet || "Sun"}
                            </div>
                          </div>

                          {/* Daily Forecast Gauge */}
                          {(() => {
                            const today = new Date();
                            const currentMonthNum = today.getMonth() + 1;
                            const currentDayNum = today.getDate();
                            const pMonth = reduceToSingleDigit(result.personalYear + currentMonthNum);
                            const pDay = reduceToSingleDigit(pMonth + currentDayNum);
                            const dayData = getDayForecast(pDay);
                            return (
                              <div className="bg-white border border-rose-100 p-5 rounded-2xl shadow-sm text-center flex flex-col justify-between md:col-span-2 relative overflow-hidden">
                                <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 text-[16px] font-bold uppercase">
                                  Today's Energy
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4 my-2">
                                  {/* Circular progress ring representing the daily number */}
                                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center bg-rose-50 rounded-full border-4 border-rose-400 shadow-inner">
                                    <span className="text-4xl font-black text-rose-600">{pDay}</span>
                                  </div>
                                  <div className="text-left">
                                    <h5 className="font-bold text-orange-900 text-[18px]">{dayData.tagline}</h5>
                                    <p className="text-[16px] text-slate-900 mt-1 leading-relaxed">
                                      {dayData.advice}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-[16px] text-slate-900 text-left border-t border-slate-100 pt-2 font-semibold">
                                  Current Date: {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                              </div>
                            );
                          })()}

                        </div>

                        {/* Personal Month Timeline */}
                        <div className="border-t border-rose-100 pt-4">
                          <h4 className="text-[18px] font-bold text-orange-900 mb-3">
                            Monthly Forecast Timeline ({result.currentYear})
                          </h4>

                          {/* Months slider */}
                          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-rose-200">
                            {Array.from({ length: 12 }, (_, i) => {
                              const mIndex = i + 1;
                              const pMonth = reduceToSingleDigit(result.personalYear + mIndex);
                              const mName = new Date(2026, i).toLocaleString('en-US', { month: 'short' });
                              const isActive = selectedForecastMonth === mIndex;
                              return (
                                <button
                                  key={mIndex}
                                  onClick={() => setSelectedForecastMonth(mIndex)}
                                  className={`px-4 py-2.5 rounded-xl border text-center transition-all shrink-0 min-w-[70px] ${isActive
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                                    : 'bg-rose-50/30 text-rose-950 border-rose-100/50 hover:bg-rose-50'
                                    }`}
                                >
                                  <span className="text-xs font-bold block leading-none">{mName}</span>
                                  <span className={`text-[10px] font-black block mt-1 ${isActive ? 'text-amber-200' : 'text-rose-600'}`}>
                                    Vib: {pMonth}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Active Month Details Display */}
                          {(() => {
                            const mData = getMonthForecast(reduceToSingleDigit(result.personalYear + selectedForecastMonth));
                            const monthFull = new Date(2026, selectedForecastMonth - 1).toLocaleString('en-US', { month: 'long' });
                            return (
                              <div className="bg-rose-50/20 border border-rose-100/70 rounded-2xl p-4 mt-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[16px] font-bold text-orange-900 uppercase tracking-wider">
                                    {monthFull} Vibration
                                  </span>
                                  <span className="text-[16px] font-bold bg-rose-100 text-slate-900 px-2 py-0.5 rounded-full">
                                    Personal Month {reduceToSingleDigit(result.personalYear + selectedForecastMonth)}
                                  </span>
                                </div>
                                <h5 className="font-bold text-orange-900 text-[18px] mb-1">{mData.title}</h5>
                                <p className="text-[16px] text-slate-900 mb-2 leading-relaxed">
                                  <strong>Primary Focus:</strong> {mData.focus}
                                </p>
                                <p className="text-[16px] text-slate-900 leading-relaxed bg-white/50 p-3 rounded-xl border border-rose-100/20 font-medium">
                                  <strong>Actionable Advice:</strong> {mData.advice}
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      {/* Lo Shu Grid Life Domain Analytics */}
                      <div id="num-sec-domains" className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm space-y-6 scroll-mt-20">
                        <h3 className="text-[20px] font-bold text-orange-900 border-b border-rose-100 pb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-rose-600" /> Lo Shu Life Domain Analytics
                        </h3>

                        {result.domainAnalytics ? (
                          <div className="space-y-6">

                            {/* Marriage & Money Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                              {/* Marriage Card */}
                              <div className="p-5 rounded-2xl border border-rose-100 bg-rose-50/5 flex flex-col justify-between space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2.5">
                                    <div className="p-2 bg-pink-100 text-pink-700 rounded-xl">
                                      <Heart className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base md:text-lg">Marriage & Relationship</h4>
                                  </div>
                                  <span className={`text-xs md:text-sm font-black px-3 py-1 rounded-full uppercase tracking-wider ${result.domainAnalytics.marriage.score >= 80 ? "bg-green-100 text-green-800" :
                                    result.domainAnalytics.marriage.score >= 60 ? "bg-yellow-100 text-yellow-800" :
                                      "bg-orange-100 text-orange-800"
                                    }`}>
                                    {result.domainAnalytics.marriage.score}%
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[18px] font-bold text-slate-900 uppercase tracking-wider">Status: {result.domainAnalytics.marriage.status}</p>
                                  <p className="text-[18px] text-slate-900 leading-relaxed">{result.domainAnalytics.marriage.analysis}</p>
                                </div>
                                <div className="bg-pink-50/50 text-slate-900 p-3 rounded-xl border border-pink-100 text-[18px]">
                                  <span className="font-bold text-pink-900 block mb-0.5">🌸 Relationship Remedies:</span>
                                  {result.domainAnalytics.marriage.remedies}
                                </div>
                              </div>

                              {/* Money Card */}
                              <div className="p-5 rounded-2xl border border-rose-100 bg-rose-50/5 flex flex-col justify-between space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2.5">
                                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                      <Coins className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base md:text-lg">Wealth & Assets</h4>
                                  </div>
                                  <span className={`text-xs md:text-sm font-black px-3 py-1 rounded-full uppercase tracking-wider ${result.domainAnalytics.money.score >= 80 ? "bg-green-100 text-green-800" :
                                    result.domainAnalytics.money.score >= 50 ? "bg-yellow-100 text-yellow-800" :
                                      "bg-orange-100 text-orange-800"
                                    }`}>
                                    {result.domainAnalytics.money.score}%
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[18px] font-bold text-slate-900 uppercase tracking-wider">Status: {result.domainAnalytics.money.status}</p>
                                  <p className="text-[18px] text-slate-900 leading-relaxed">{result.domainAnalytics.money.analysis}</p>
                                </div>
                                <div className="bg-emerald-50/50 text-slate-900 p-3 rounded-xl border border-emerald-100 text-[18px]">
                                  <span className="font-bold text-emerald-900 block mb-0.5">💰 Wealth Remedies:</span>
                                  {result.domainAnalytics.money.remedies}
                                </div>
                              </div>

                            </div>

                            {/* Child Birth, Career & Gov Job Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                              {/* Child Birth Card */}
                              <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/5 flex flex-col justify-between space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                                      <Baby className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-sm md:text-base">Child Birth</h4>
                                  </div>
                                  <span className="text-xs font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full">{result.domainAnalytics.child_birth.score}%</span>
                                </div>
                                <p className="text-[18px] text-slate-900 leading-relaxed">{result.domainAnalytics.child_birth.analysis}</p>
                                <div className="bg-blue-50/50 text-slate-900 p-3 rounded-xl border border-blue-100 text-[18px]">
                                  <span className="font-bold text-blue-900 block mb-0.5">🍼 Progeny Remedy:</span>
                                  {result.domainAnalytics.child_birth.remedies}
                                </div>
                              </div>

                              {/* Career Card */}
                              <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/5 flex flex-col justify-between space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                                      <Briefcase className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-[18px] md:text-base">Career & Success</h4>
                                  </div>
                                  <span className="text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">{result.domainAnalytics.career.score}%</span>
                                </div>
                                <p className="text-[18px] text-slate-900 leading-relaxed">{result.domainAnalytics.career.analysis}</p>
                                <div className="bg-amber-50/50 text-slate-900 p-3 rounded-xl border border-amber-100 text-[18px]">
                                  <span className="font-bold text-amber-900 block mb-0.5">💼 Career Remedy:</span>
                                  {result.domainAnalytics.career.remedies}
                                </div>
                              </div>

                              {/* Gov Job Card */}
                              <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/5 flex flex-col justify-between space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                                      <Landmark className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-[18px] md:text-base">Government Job</h4>
                                  </div>
                                  <span className="text-xs font-black text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full">{result.domainAnalytics.government_job.score}%</span>
                                </div>
                                <p className="text-[18px] text-slate-900 leading-relaxed">{result.domainAnalytics.government_job.analysis}</p>
                                <div className="bg-purple-50/50 text-slate-900 p-3 rounded-xl border border-purple-100 text-[18px]">
                                  <span className="font-bold text-purple-900 block mb-0.5">🏛️ Exam Remedy:</span>
                                  {result.domainAnalytics.government_job.remedies}
                                </div>
                              </div>

                            </div>

                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">Loading domain analytics details...</p>
                        )}
                      </div>

                      {/* Remedies & Lucky Factors */}
                      <div id="num-sec-remedies" className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm scroll-mt-20">
                        <h3 className="text-[20px] font-bold text-orange-900 border-b border-rose-100 pb-3 mb-4 flex items-center gap-2">
                          <Flame className="w-5 h-5 text-rose-600" /> Vedic Remedies & Auspicious Energies
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div className="space-y-3">
                            <div>
                              <span className="font-bold text-[18px] text-rose-900">Lucky Colors: </span>
                              <span className="text-[18px] font-bold  text-slate-900">{result.mulankDetails.colors.join(", ")}</span>
                            </div>
                            <div>
                              <span className="font-bold text-[18px] text-rose-900">Lucky Directions: </span>
                              <span className="text-[18px] font-bold text-slate-900">{result.mulankDetails.lucky_directions.join(", ")}</span>
                            </div>
                            <div>
                              <span className="font-bold text-[18px] text-rose-900">Auspicious Gemstone: </span>
                              <span className="text-[18px] font-bold text-slate-900">{result.mulankDetails.gemstone}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <span className="font-bold text-[18px] text-rose-900">Friendly Numbers: </span>
                              <span className="text-[18px] font-bold text-slate-900">{result.mulankDetails.friendly_numbers.join(", ")}</span>
                            </div>
                            <div>
                              <span className="font-bold text-[18px] text-rose-900">Numbers to Avoid: </span>
                              <span className="text-[18px] font-bold text-slate-900">{result.mulankDetails.enemy_numbers.join(", ")}</span>
                            </div>
                            <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                              <span className="block font-bold text-rose-950 text-[18px] mb-1 uppercase tracking-wider">Auspicious Beej Mantra:</span>
                              <span className="font-semibold text-rose-800 text-[18px] italic">"{result.mulankDetails.mantra}"</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Lucky Matrix */}
                    <div className="space-y-6">

                      {/* Lucky Match Matrix */}
                      <div id="num-sec-matrix" className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm space-y-4 scroll-mt-20">
                        <h3 className="text-lg font-black text-rose-955 text-center w-full">Lucky Match Matrix</h3>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider text-center">Best Calendar Dates of the Month</p>
                        <div className="space-y-3.5 text-xs">
                          <div className="p-3 bg-green-50/60 border border-green-100 rounded-2xl">
                            <span className="block font-extrabold text-green-800 mb-1">🌟 Super Lucky Dates</span>
                            <span className="text-slate-700 font-bold">{result.luckyDates.super_lucky.join(", ")}</span>
                          </div>
                          <div className="p-3 bg-yellow-50/60 border border-yellow-100 rounded-2xl">
                            <span className="block font-extrabold text-yellow-800 mb-1">⚖️ Neutral Dates</span>
                            <span className="text-slate-700 font-bold">{result.luckyDates.neutral.join(", ")}</span>
                          </div>
                          <div className="p-3 bg-orange-50/60 border border-orange-100 rounded-2xl">
                            <span className="block font-extrabold text-orange-800 mb-1">⚠️ Dates to Avoid</span>
                            <span className="text-slate-700 font-bold">{result.luckyDates.avoid.join(", ")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button to test another */}
                      <button
                        onClick={resetForm}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-rose-600/20"
                      >
                        <RefreshCw className="w-5 h-5" />
                        <span>Analyze Another Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Name Correction Tab */}
            {activeTab === "correction" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {renderNameCorrectionPanel()}
              </div>
            )}

            {/* Marriage Compatibility Tab */}
            {activeTab === "compatibility" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {renderMarriageCompatibilityPanel()}
              </div>
            )}

            {/* Vastu & Yogas Tab */}
            {activeTab === "vastu" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {renderVastuOverlayPanel()}
              </div>
            )}

            {/* Advanced Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {renderAdvancedAnalyticsPanel()}
              </div>
            )}

            {/* Cycles & Progression Tab */}
            {activeTab === "cycles" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {renderLifespanCyclesPanel()}
              </div>
            )}

            {/* Quantum Numerology Tab */}
            {activeTab === "quantum" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {renderQuantumPanel()}
              </div>
            )}

            {/* Mobile Numerology Tab */}
            {activeTab === "mobile" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
                    <Zap className="w-96 h-96 text-emerald-300" />
                  </div>
                  <div className="relative z-10 max-w-3xl">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                      <Zap className="w-4 h-4 text-emerald-400" /> Mobile Vibrational Mastery
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black mb-3 text-white">
                      Mobile Numerology Analyzer
                    </h2>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                      Discover how your 10-digit mobile phone number impacts your wealth, communication, relationships, and peace. Calculate total compound energy, planetary ruler, adjacent digit pairs, and Mulank/Bhagyank compatibility.
                    </p>
                  </div>
                </div>

                {/* Input Card */}
                <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>📱</span> Enter Phone Number for Analysis
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number"
                        value={mobileInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setMobileInput(val);
                        }}
                        className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-base font-bold tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      <span className="absolute right-4 top-3.5 text-xs font-extrabold text-slate-400">
                        {mobileInput.length}/10
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const cleanDigits = mobileInput.replace(/\D/g, "");
                        if (cleanDigits.length !== 10) {
                          alert("Please enter a valid 10-digit mobile number.");
                          return;
                        }
                        const res = calculateMobileNumerology(
                          cleanDigits,
                          result?.mulankDetails?.number,
                          result?.bhagyankDetails?.number
                        );
                        setMobileResult(res);
                      }}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5" />
                      <span>Analyze Mobile Energy</span>
                    </button>
                  </div>
                  {mobileInput.length > 0 && mobileInput.length < 10 && (
                    <p className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                      <span>⚠️</span> Please enter exactly 10 digits (currently {mobileInput.length} digit{mobileInput.length === 1 ? "" : "s"}).
                    </p>
                  )}
                </div>

                {/* Results Section */}
                {mobileResult && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                    {/* Top Row: Total Vibrations & Harmony Score */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Card 1: Single & Compound Total */}
                      <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between text-center space-y-4">
                        <div>
                          <span className="text-[18px] font-bold text-slate-900 uppercase tracking-wider block mb-1">Total Vibration Sum</span>
                          <div className="text-5xl font-black text-emerald-700 my-2">
                            {mobileResult.singleDigit}
                          </div>
                          <span className="text-[18px] font-semibold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            Compound Total: {mobileResult.compoundSum}
                          </span>
                        </div>
                        <div className="border-t border-slate-100 pt-3">
                          <span className="text-[18px] font-bold text-slate-900 uppercase tracking-wider block">Governing Planet</span>
                          <span className="text-[18px] font-black text-slate-800">{mobileResult.planetName}</span>
                        </div>
                      </div>

                      {/* Card 2: Compound Vibration Title & Meaning */}
                      <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-3">
                        <div>
                          <span className="text-[18px] font-bold text-slate-900 uppercase tracking-wider block mb-1">Compound Energy Signature</span>
                          <h4 className="text-[18px] font-black text-slate-900 mb-2">
                            {mobileResult.compoundInfo.title}
                          </h4>
                          <p className="text-[18px] text-slate-600 leading-relaxed font-medium">
                            {mobileResult.compoundInfo.desc}
                          </p>
                        </div>
                        <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 text-[18px] text-emerald-950 font-medium">
                          <strong>Note:</strong> Compound totals like 15, 19, 23, 24, 32, 45, 51 carry special royal vibrations for success and luck.
                        </div>
                      </div>

                      {/* Card 3: Compatibility / Harmony Score */}
                      <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between text-center space-y-3">
                        <div>
                          <span className="text-[18px] font-bold text-slate-900 uppercase tracking-wider block mb-1">Psychic & Destiny Resonance</span>
                          <div className="text-4xl font-black text-slate-900 my-2">
                            {mobileResult.harmonyScore}%
                          </div>
                          <div className="space-y-1 text-[18px]">
                            {mobileResult.mul && (
                              <p className="font-medium text-slate-700">
                                Mulank ({mobileResult.mul}): <strong className={mobileResult.isMulFriendly ? "text-emerald-600" : "text-rose-600"}>{mobileResult.isMulFriendly ? "Harmonious" : "Hostile/Neutral"}</strong>
                              </p>
                            )}
                            {mobileResult.bhag && (
                              <p className="font-medium text-slate-700">
                                Bhagyank ({mobileResult.bhag}): <strong className={mobileResult.isBhagFriendly ? "text-emerald-600" : "text-rose-600"}>{mobileResult.isBhagFriendly ? "Harmonious" : "Hostile/Neutral"}</strong>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-2xl text-[18px] text-orange-900 font-semibold">
                          Higher scores indicate strong alignment with your birth chart vibrations.
                        </div>
                      </div>
                    </div>

                    {/* Active Digit Pairs Breakdown */}
                    <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span>✨</span> Significant Digit Pairs Detected in Phone Number
                      </h3>
                      {mobileResult.pairs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {mobileResult.pairs.map((p, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-2xl border text-[16px] space-y-1.5 ${p.type === "LUCKY"
                                ? "bg-emerald-50/60 border-emerald-200"
                                : p.type === "STRESS"
                                  ? "bg-amber-50/60 border-amber-200"
                                  : p.type === "POWER"
                                    ? "bg-purple-50/60 border-purple-200"
                                    : "bg-rose-50/60 border-rose-200"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[16px] font-black tracking-widest text-slate-900">{p.pair}</span>
                                <span className="font-extrabold uppercase px-2 py-0.5 rounded-full text-[16px] bg-white border shadow-xs">
                                  {p.type}
                                </span>
                              </div>
                              <h5 className="font-bold text-slate-800 text-[16px]">{p.label}</h5>
                              <p className="text-slate-600 font-medium leading-relaxed">{p.desc}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[16px] text-slate-500 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          No distinct power or stress pairs detected. The number operates mainly under its single root sum vibration.
                        </p>
                      )}
                    </div>

                    {/* Digit Repetitions & Frequency Matrix */}
                    <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
                        <span>🔢</span> Digit Frequency & Repetition Audit
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3 text-center">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
                          const count = mobileResult.frequencies[digit] || 0;
                          return (
                            <div
                              key={digit}
                              className={`p-3 rounded-2xl border transition-all ${count >= 3
                                ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/30"
                                : count > 0
                                  ? "bg-emerald-50/40 border-emerald-100"
                                  : "bg-slate-50 border-slate-100 opacity-40"
                                }`}
                            >
                              <span className="text-[18px] font-bold text-slate-400 block">Digit</span>
                              <span className="text-[18px] font-black text-slate-900">{digit}</span>
                              <span className="text-[18px] font-extrabold block text-emerald-800 mt-1">
                                {count}x
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <strong>Practical Guidance:</strong> Having a digit repeat 1 to 2 times amplifies its positive planetary traits. However, repeating 3+ times (especially 4s or 8s) can create energetic overload, delays, or restlessness.
                      </p>
                    </div>

                    {/* Lucky Mobile Cover & Wallpaper Remedies */}
                    <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                        <h3 className="text-[22px] font-bold text-slate-900 flex items-center gap-2">
                          <span>🛡️</span> Lucky Mobile Cover & Wallpaper Remedies
                        </h3>
                        <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          Remedial Frequency Alignment
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mobile Cover Remedies */}
                        <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white p-5 rounded-2xl border border-emerald-100 space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">📱</span>
                            <h4 className="text-[18px] font-bold text-slate-900">Auspicious Mobile Cover Colors</h4>
                          </div>

                          <div>
                            <span className="text-[18px] font-bold text-emerald-900 uppercase tracking-wider block mb-2">Recommended Colors:</span>
                            <div className="flex flex-wrap gap-2">
                              {mobileResult.remedyData.coverColors.map((color, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-white border border-emerald-200 text-emerald-950 font-bold text-[18px] rounded-xl shadow-2xs flex items-center gap-1.5"
                                >
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-emerald-100">
                            <span className="text-[18px] font-bold text-rose-900 uppercase tracking-wider block mb-2">Colors to Avoid:</span>
                            <div className="flex flex-wrap gap-2">
                              {mobileResult.remedyData.avoidColors.map((color, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-900 font-bold text-[18px] rounded-xl flex items-center gap-1.5"
                                >
                                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Mobile Wallpaper Remedies */}
                        <div className="bg-gradient-to-br from-purple-50/70 via-indigo-50/30 to-white p-5 rounded-2xl border border-purple-100 space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🖼️</span>
                            <h4 className="text-[18px] font-bold text-slate-900">Auspicious Mobile Wallpaper</h4>
                          </div>

                          <div>
                            <span className="text-[18px] font-bold text-purple-900 uppercase tracking-wider block mb-1">Recommended Themes:</span>
                            <p className="text-[18px] font-bold text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-purple-100">
                              {mobileResult.remedyData.wallpaperTheme}
                            </p>
                          </div>

                          <div>
                            <span className="text-[18px] font-bold text-purple-900 uppercase tracking-wider block mb-1">Planetary Benefit:</span>
                            <p className="text-[18px] font-medium text-slate-600 leading-relaxed">
                              {mobileResult.remedyData.wallpaperDesc}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "prediction" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
                    <Star className="w-96 h-96 text-amber-300" />
                  </div>
                  <div className="relative z-10 max-w-3xl">
                    <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                      <Star className="w-4 h-4 text-amber-400" /> Vedic Planetary Combinations
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black mb-3 text-white">
                      Special Yogas & Predictive Matrix
                    </h2>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                      Detailed evaluation of special planetary Yogas formed by your birth date numbers. Uncover presence of Raj Yogas (Golden/Silver Planes), Foreign Travel Yoga, Vish Yoga, Bandhan Yoga, and their specific remedies.
                    </p>
                  </div>
                </div>

                {/* Special Yogas Analysis Card */}
                {(() => {
                  const dobDigits = (dob || "").replace(/\D/g, "").split("").map(Number);
                  let presentNumbers = [];
                  if (result?.loshuGrid) {
                    if (Array.isArray(result.loshuGrid)) {
                      presentNumbers = result.loshuGrid.flat ? result.loshuGrid.flat() : result.loshuGrid;
                    } else if (typeof result.loshuGrid === "object") {
                      // Dictionary map like {1: 2, 4: 1, 9: 0}
                      presentNumbers = Object.keys(result.loshuGrid)
                        .filter(key => Number(result.loshuGrid[key]) > 0)
                        .map(Number);
                    }
                  }
                  if (presentNumbers.length === 0) {
                    presentNumbers = dobDigits;
                  }

                  const gridSet = new Set(presentNumbers);
                  const mulank = result?.mulank || result?.mulankDetails?.number || 1;
                  const bhagyank = result?.bhagyank || result?.bhagyankDetails?.number || 1;

                  // Yoga calculations
                  const yogaList = [];

                  // 1. Golden Raj Yoga (4-5-6)
                  const hasGolden = gridSet.has(4) && gridSet.has(5) && gridSet.has(6);
                  if (hasGolden) {
                    yogaList.push({
                      title: "Golden Raj Yoga (4 - 5 - 6)",
                      type: "ROYAL",
                      badge: "🌟 Auspicious",
                      summary: "Complete Will power & Financial Fortune Plane",
                      desc: "Extremely lucky combination. Grants high wealth, authority, luxury cars, real estate, and extraordinary administrative success.",
                      remedy: "Maintain high moral integrity and donate yellow/green items on Thursdays."
                    });
                  }

                  // 2. Silver Raj Yoga (2-5-8)
                  const hasSilver = gridSet.has(2) && gridSet.has(5) && gridSet.has(8);
                  if (hasSilver) {
                    yogaList.push({
                      title: "Silver Raj Yoga (2 - 5 - 8)",
                      type: "ROYAL",
                      badge: "💎 Property & Stability",
                      summary: "Earth Element & Real Estate Dominance",
                      desc: "Brings massive success in real estate, land acquisition, multi-property ownership, and long-term financial security.",
                      remedy: "Keep a crystal quartz globe or rock salt lamp in the Northeast corner of your house."
                    });
                  }

                  // 3. Foreign Travel / Settlement Yoga (5-6-7 or 5-6)
                  const hasForeign = (gridSet.has(5) && gridSet.has(6) && gridSet.has(7)) || (gridSet.has(5) && gridSet.has(6) && (mulank === 7 || bhagyank === 7));
                  if (hasForeign) {
                    yogaList.push({
                      title: "Foreign Travel & Settlement Yoga (Pardesh Yoga)",
                      type: "TRAVEL",
                      badge: "✈️ International Luck",
                      summary: "Global Commerce & Overseas Prosperity",
                      desc: "Indicates strong planetary drive for foreign education, overseas business trips, international client deals, and permanent settlement abroad.",
                      remedy: "Keep a silver metallic globe or model airplane in the Northwest zone (Number 6 direction)."
                    });
                  }

                  // 4. Vish Yoga (2 & 4 or 2 & 8)
                  const hasVish = (gridSet.has(2) && gridSet.has(4)) || (gridSet.has(2) && gridSet.has(8)) || (mulank === 2 && (bhagyank === 4 || bhagyank === 8)) || (mulank === 4 && bhagyank === 2);
                  if (hasVish) {
                    yogaList.push({
                      title: "Vish Yoga (Poison / Mental Stress Combination)",
                      type: "DOSHA",
                      badge: "⚠️ Mental Vulnerability",
                      summary: "Moon-Rahu / Moon-Saturn Emotional Conflict",
                      desc: "Causes overthinking, mood volatility, emotional anxiety, or feeling misunderstood despite honest efforts.",
                      remedy: "Offer water/milk to Shivling on Mondays, wear a natural Pearl or Rose Quartz, and avoid overthinking late at night."
                    });
                  }

                  // 5. Bandhan Yoga (4 & 8 with missing 5 & 6)
                  const hasBandhan = (gridSet.has(4) && gridSet.has(8)) && (!gridSet.has(5) || !gridSet.has(6));
                  if (hasBandhan) {
                    yogaList.push({
                      title: "Bandhan Yoga (Restriction & Struggle Combination)",
                      type: "DOSHA",
                      badge: "🔒 Career Blockages",
                      summary: "Rahu-Saturn Structural Constraint",
                      desc: "Creates feeling of being trapped in unfulfilling jobs or sticky legal/contractual situations. Delays outcomes despite hard effort.",
                      remedy: "Light a mustard oil lamp under a Peepal tree on Saturday evenings and chant 'Om Sham Shanaishcharaya Namah'."
                    });
                  }

                  // 6. Intuition & Healing Yoga (3-5-7)
                  const hasIntuition = gridSet.has(3) && gridSet.has(5) && gridSet.has(7);
                  if (hasIntuition) {
                    yogaList.push({
                      title: "Intuition & Mystical Yoga (3 - 5 - 7)",
                      type: "SPIRITUAL",
                      badge: "🔮 Sixth Sense",
                      summary: "Emotional & Occult Mastery Plane",
                      desc: "Bestows high intuitive gut feel, healing power, spiritual insight, and deep psychological empathy for others.",
                      remedy: "Practice daily morning meditation and wear 5-Mukhi or 7-Mukhi Rudraksha."
                    });
                  }

                  // 7. Thought & Genius Yoga (4-3-8)
                  const hasThought = gridSet.has(4) && gridSet.has(3) && gridSet.has(8);
                  if (hasThought) {
                    yogaList.push({
                      title: "Intellectual Genius Yoga (4 - 3 - 8)",
                      type: "INTELLECT",
                      badge: "🧠 Master Mind",
                      summary: "Mental & Strategic Vision Plane",
                      desc: "Exceptional analytical brain, visionary strategic planning, problem solving, and digital/academic sharpness.",
                      remedy: "Engage in research, writing, or strategic advisory work."
                    });
                  }

                  return (
                    <div className="space-y-6">
                      <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-amber-100 pb-4">
                          <div>
                            <h3 className="text-[22px] font-bold text-slate-900 flex items-center gap-2">
                              <span>🔮</span> Special Yogas Detected in Your Profile
                            </h3>
                            <p className="text-xs text-slate-500 font-semibold mt-1">
                              Calculated from Date of Birth ({dob || "Selected Birth Date"}) & Core Numbers (Mulank {mulank}, Bhagyank {bhagyank})
                            </p>
                          </div>
                          <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                            {yogaList.length} Special Yogas Active
                          </span>
                        </div>

                        {yogaList.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {yogaList.map((y, idx) => (
                              <div
                                key={idx}
                                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${y.type === "ROYAL"
                                  ? "bg-gradient-to-br from-amber-50/80 via-yellow-50/40 to-white border-amber-200"
                                  : y.type === "TRAVEL"
                                    ? "bg-gradient-to-br from-blue-50/80 via-cyan-50/40 to-white border-blue-200"
                                    : y.type === "SPIRITUAL"
                                      ? "bg-gradient-to-br from-purple-50/80 via-indigo-50/40 to-white border-purple-200"
                                      : y.type === "INTELLECT"
                                        ? "bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-white border-teal-200"
                                        : "bg-gradient-to-br from-rose-50/80 via-orange-50/40 to-white border-rose-200"
                                  }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white border shadow-2xs text-slate-800">
                                      {y.badge}
                                    </span>
                                  </div>
                                  <h4 className="text-[18px] font-bold text-slate-900 mb-1">{y.title}</h4>
                                  <p className="text-xs font-extrabold text-amber-900 mb-2">{y.summary}</p>
                                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{y.desc}</p>
                                </div>
                                <div className="bg-white/80 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 font-semibold">
                                  <span className="font-bold text-rose-900 block mb-0.5">🌿 Vedic Remedy:</span>
                                  {y.remedy}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center space-y-2">
                            <p className="text-sm font-bold text-slate-700">No Major Heavy Dosha or Multi-Plane Raj Yogas Detected.</p>
                            <p className="text-xs text-slate-500">Your profile operates primarily on your single digit Mulank ({mulank}) and Bhagyank ({bhagyank}) vibrations.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
    </div>
  )
}

