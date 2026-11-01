const express = require('express');
const router = express.Router();
const axios = require('axios');

const PYTHON_ASTRO_URL = process.env.PYTHON_ASTRO_URL || 'http://localhost:8000';

// Fallback interpretations for planet pairs when external conjunction engine is offline
const FALLBACK_CONJUNCTIONS = {
  'Mars_Rahu': {
    title: 'Angarak Yoga (Mars-Rahu Conjunction)',
    overview: [
      'Mars represents raw energy, ambition, courage, and action; Rahu amplifies desires and unconventional thinking.',
      'This conjunction forms Angarak Yoga, giving immense drive, intense passion, and fearless determination to conquer obstacles.',
      'Directing this high-voltage energy into disciplined physical pursuits, sports, engineering, or research yields tremendous success.',
      'Caution is advised against impulsiveness or hasty decisions under emotional stress.'
    ],
    positiveDetail: 'Tremendous courage, fearless spirit, pioneering leadership, unstoppable work ethic, and ability to conquer intense challenges.',
    negativeDetail: 'Tendency toward restlessness, impulsive anger, impatience with slow progress, and rash decision making.'
  },
  'Jupiter_Rahu': {
    title: 'Guru Chandal Yoga (Jupiter-Rahu Conjunction)',
    overview: [
      'Jupiter represents wisdom, dharma, and philosophy; Rahu represents innovation and breaking traditional molds.',
      'Creates an unconventional, out-of-the-box thinker who questions dogmas and discovers innovative paths to knowledge.',
      'Highly successful in international business, modern teaching, advanced technology, and unconventional philosophies.'
    ],
    positiveDetail: 'Visionary mindset, deep critical thinking, global perspectives, and unconventional financial acumen.',
    negativeDetail: 'Skepticism of traditional mentors, impatience with orthodox rituals, and periods of philosophical doubt.'
  },
  'Sun_Mercury': {
    title: 'Budhaditya Yoga (Sun-Mercury Conjunction)',
    overview: [
      'Sun represents the soul, authority, and vitality; Mercury represents intellect, logic, and eloquent speech.',
      'Creates Budhaditya Yoga, one of the most auspicious yogas for intellect, business acumen, and administrative mastery.',
      'Endows the native with sharp analytical skills, convincing oratory, and success in management or advisory roles.'
    ],
    positiveDetail: 'Exceptional intelligence, sparkling communication skills, high learning ability, and administrative leadership.',
    negativeDetail: 'Occasional pride in intellect or argumentative tendencies when dealing with slower communicators.'
  },
  'Jupiter_Saturn': {
    title: 'Brahma Yoga / Dharmic Balance (Jupiter-Saturn Conjunction)',
    overview: [
      'Jupiter represents expansion and optimism; Saturn represents structure, discipline, and perseverance.',
      'Produces a practical, grounded philosopher who balances high ideals with meticulous, disciplined execution.',
      'Ensures enduring legacy, sustainable wealth accumulation, and deep respect in society.'
    ],
    positiveDetail: 'Profound patience, ethical leadership, long-term strategic vision, and steady wealth building.',
    negativeDetail: 'Occasional periods of self-imposed delay, heavy burdens of responsibility, or excessive caution.'
  },
  'Venus_Mercury': {
    title: 'Lakshmi-Narayan Yoga (Mercury-Venus Conjunction)',
    overview: [
      'Mercury brings intellect and wit; Venus brings artistic taste, charm, and refinement.',
      'Blessed with charm, artistic talents, commercial brilliance, and harmonious interpersonal relationships.',
      'Exceptional in arts, media, luxury commerce, marketing, and diplomatic relations.'
    ],
    positiveDetail: 'Magnetic charm, refined speech, artistic creativity, aesthetic appreciation, and thriving business partnerships.',
    negativeDetail: 'Susceptibility to superficial flattery or indulgence in luxury comforts beyond necessity.'
  }
};

const getGenericConjunction = (planets) => {
  const pList = planets.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
  return {
    title: `${pList.join(' - ')} Conjunction (Yuti)`,
    overview: [
      `${pList.join(' and ')} occupy the same bhava, uniting their cosmic energies and blending their karakatvas (significations).`,
      `The native experiences a synergistic fusion of ${pList.join(', ')} energies, driving specialized focus in the affairs of this house.`,
      `Balancing both planetary energies harmonizes their collective influence and activates positive results.`
    ],
    positiveDetail: `Dynamic synergy between ${pList.join(' and ')}, offering unique talents, combined vitality, and multifaceted capabilities.`,
    negativeDetail: `Planetary competition within the same house can cause occasional conflicting desires or mood fluctuations.`
  };
};

// ── Two Planet Conjunction Routes ──
router.get('/detail/:p1/:p2', async (req, res) => {
  const { p1, p2 } = req.params;
  const p1Cap = p1.charAt(0).toUpperCase() + p1.slice(1).toLowerCase();
  const p2Cap = p2.charAt(0).toUpperCase() + p2.slice(1).toLowerCase();

  // 1. Try python backend if reachable
  try {
    const pythonRes = await axios.get(`${PYTHON_ASTRO_URL}/api/conjunction/detail/${p1Cap}/${p2Cap}`, { timeout: 3000 });
    if (pythonRes.data) return res.json(pythonRes.data);
  } catch (err) {
    // Fall back to built-in conjunction data
  }

  // 2. Check fallback map
  const key1 = `${p1Cap}_${p2Cap}`;
  const key2 = `${p2Cap}_${p1Cap}`;
  const found = FALLBACK_CONJUNCTIONS[key1] || FALLBACK_CONJUNCTIONS[key2];

  if (found) {
    return res.json(found);
  }

  // 3. Return structured generic interpretation
  return res.json(getGenericConjunction([p1Cap, p2Cap]));
});

// ── Triple Planet Conjunction Routes ──
router.get('/triple/detail/:p1/:p2/:p3', async (req, res) => {
  const { p1, p2, p3 } = req.params;
  const planets = [p1, p2, p3].map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());

  try {
    const pythonRes = await axios.get(`${PYTHON_ASTRO_URL}/api/conjunction/triple/detail/${planets[0]}/${planets[1]}/${planets[2]}`, { timeout: 3000 });
    if (pythonRes.data) return res.json(pythonRes.data);
  } catch (err) {
    // Fallback
  }

  return res.json(getGenericConjunction(planets));
});

// ── Four Planet Conjunction Routes ──
router.get('/four/detail/:p1/:p2/:p3/:p4', async (req, res) => {
  const { p1, p2, p3, p4 } = req.params;
  const planets = [p1, p2, p3, p4].map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());

  try {
    const pythonRes = await axios.get(`${PYTHON_ASTRO_URL}/api/conjunction/four/detail/${planets[0]}/${planets[1]}/${planets[2]}/${planets[3]}`, { timeout: 3000 });
    if (pythonRes.data) return res.json(pythonRes.data);
  } catch (err) {
    // Fallback
  }

  return res.json(getGenericConjunction(planets));
});

module.exports = router;
