/**
 * Astrology - run/backend/services/geminiNumerologyPrompts.js
 * 
 * High-Precision Prompt Templates for the 25-Page Hybrid Numerology Life Book:
 * 1. Pages 3-5: Core Numbers Deep Dive (Mulank, Bhagyank, Namank, Kua)
 * 2. Pages 6-9: Loshu Grid Magic Planes, Raj Yogas & Doshas
 * 3. Pages 10-12: Career, Wealth, Business Acumen & Auspicious Partnerships
 * 4. Pages 13-16: Love, Marriage, Relationship Compatibility & Health Numerology
 * 5. Pages 17-22: 9-Year Mahadasha & 5-Year Predictive Roadmap
 * 6. Pages 23-25: Personalized Remedies, Lucky Elements, Signature & Daily Affirmations
 */

function buildCoreNumbersPrompt(context, language = 'en') {
  const { native, numbers, planetaryRulers } = context;
  const isHindi = language === 'hi';

  return `You are a master Vedic and Western Numerologist (Pythagorean & Chaldean traditions) writing Pages 3 to 5 of an authoritative 25-Page Numerology Life Book for:
Client: ${native.name}
Date of Birth: ${native.dob}
Mulank (Life Path / Driver): ${numbers.mulank} (Ruler: ${planetaryRulers.mulank})
Bhagyank (Destiny / Conductor): ${numbers.bhagyank} (Ruler: ${planetaryRulers.bhagyank})
Namank (Name Expression): ${numbers.namank} (Chaldean: ${numbers.namankChaldean || numbers.namank})
Kua / Soul Urge: ${numbers.kuaNumber || 'N/A'}

Language requested: ${isHindi ? 'Hindi (Shuddha Vedic terminology)' : 'English (Classical, insightful, and authoritative)'}

Deliver a profound, detailed narrative breakdown covering:
1. Mulank (Root / Driver Vibration): Soul psyche, internal desires, core strengths, and instinctual behavior governed by ${planetaryRulers.mulank}.
2. Bhagyank (Destiny / Conductor Vibration): Outer life purpose, karmic trajectory, and major life lessons governed by ${planetaryRulers.bhagyank}.
3. The Driver-Conductor Compatibility Harmony: How Mulank and Bhagyank interact (Friendly, Neutral, or Conflicting dynamics) and what that implies for life momentum.
4. Namank & Public Resonance: How their name frequency projects into society, commercial ventures, and reputation.
5. Master Numbers / Hidden Frequencies: Any compound or master vibrations (11, 22, 33) present in their date of birth or name.

Format with clear headers and thorough, insightful paragraphs suitable for an executive-grade 25-page life report.`;
}

function buildLoshuYogasPrompt(context, language = 'en') {
  const { native, loshuGrid, activePlanes, yogas, doshas } = context;
  const isHindi = language === 'hi';

  return `You are an expert in Chinese Loshu Magic Grid and Vedic Ank Shastra writing Pages 6 to 9 of a 25-Page Numerology Report for ${native.name}:
Loshu Grid Counts (3x3): ${JSON.stringify(loshuGrid)}
Active Planes: ${JSON.stringify(activePlanes)}
Detected Raj Yogas: ${JSON.stringify(yogas)}
Missing Numbers / Doshas: ${JSON.stringify(doshas)}

Language: ${isHindi ? 'Hindi' : 'English'}

Provide an exhaustive analysis covering:
1. The 3x3 Magic Grid Architecture: The distribution of cosmic numbers across the 9 sectors.
2. The Horizontal Planes:
   - Mental Plane (4-9-2): Intellectual agility, memory, and strategic foresight.
   - Emotional Plane (3-5-7): Spiritual balance, heart-centered wisdom, and empathy.
   - Practical Plane (8-1-6): Business execution, material manifestation, and discipline.
3. The Vertical Planes:
   - Thought Plane (4-3-8), Will Plane (9-5-1), and Action Plane (2-7-6).
4. Major Raj Yogas:
   - Golden Raj Yoga (4-5-6), Silver Raj Yoga (2-5-8), or Multi-Number alignments found in their grid.
5. Missing Numbers & Remedial Neutralization: The psychological and material blind spots created by absent numbers and how to activate them naturally.`;
}

function buildCareerWealthPrompt(context, language = 'en') {
  const { native, numbers, planetaryRulers } = context;
  const isHindi = language === 'hi';

  return `You are a high-level corporate and Vedic Numerology consultant writing Pages 10 to 12 (Career, Wealth & Business Acumen) of a 25-Page Report for ${native.name}:
Mulank: ${numbers.mulank} | Bhagyank: ${numbers.bhagyank} | Namank: ${numbers.namank}

Language: ${isHindi ? 'Hindi' : 'English'}

Write a strategic vocational and financial analysis:
1. Peak Vocational Arenas: Industries where the native achieves maximum leverage (e.g. Technology, Leadership, Trading, Consulting, Creative Arts, Government, Finance).
2. Business vs Employment Archetype: Independent entrepreneurship viability vs corporate leadership stability based on driver/conductor harmony.
3. Wealth Magnetism & Money Karma: How their numbers accumulate, retain, and multiply liquid wealth and real assets.
4. Auspicious Business Partners & Collaboration Numbers: Favorable numbers for co-founders, business titles, and corporate branding.
5. Critical Pitfalls: Financial traps, impulse decisions, or periods where risk should be hedged.`;
}

function buildRelationshipHealthPrompt(context, language = 'en') {
  const { native, numbers, planetaryRulers } = context;
  const isHindi = language === 'hi';

  return `You are an empathetic Vedic Numerologist writing Pages 13 to 16 (Love, Relationships & Health Vitality) for ${native.name}:
Numbers: Mulank ${numbers.mulank}, Bhagyank ${numbers.bhagyank}, Namank ${numbers.namank}
Rulers: ${planetaryRulers.mulank} & ${planetaryRulers.bhagyank}

Language: ${isHindi ? 'Hindi' : 'English'}

Deliver a detailed breakdown covering:
1. Romantic & Emotional Temperament: Love language, attachment style, and partnership expectations.
2. Marriage & Compatibility Matrix:
   - Most harmonious partner numbers (Soulmate resonance).
   - Neutral partner numbers (Requires conscious communication).
   - Challenging partner numbers (Karmic friction points).
3. Health & Ayurvedic Vitality Mapping:
   - Organ vulnerabilities ruled by planet ${planetaryRulers.mulank} and ${planetaryRulers.bhagyank} (e.g. cardiovascular, digestive, nervous, or joint vitality).
   - Nutritional and lifestyle balance aligned with their vibrational elemental balance (Fire, Water, Wood, Metal, Earth).`;
}

function buildPredictiveRoadmapPrompt(context, language = 'en') {
  const { native, numbers, currentYearCycle, upcomingYears } = context;
  const isHindi = language === 'hi';

  return `You are an elite predictive Numerologist writing Pages 17 to 22 (9-Year Dasha & 5-Year Predictive Roadmap) for ${native.name}:
Current Personal Year Vibration: ${currentYearCycle.personalYear}
Upcoming 5-Year Cycle: ${JSON.stringify(upcomingYears)}
Birth Vibrations: Mulank ${numbers.mulank}, Bhagyank ${numbers.bhagyank}

Language: ${isHindi ? 'Hindi' : 'English'}

Provide an authoritative future forecast:
1. 9-Year Epicycle Dynamics: Explaining the universal and personal 9-year cycle from Year 1 (Seed planting) to Year 9 (Culmination and release).
2. Detailed 5-Year Predictive Breakdown:
   For EACH of the upcoming 5 years (Year 1 to Year 5), provide:
   - Annual Theme & Governing Planet.
   - Career & Financial Trends.
   - Relationship & Personal Milestones.
   - Auspicious Months & Warning Periods.`;
}

function buildRemediesAffirmationsPrompt(context, language = 'en') {
  const { native, numbers, missingNumbers, planetaryRulers } = context;
  const isHindi = language === 'hi';

  return `You are a revered Vedic Numerologist writing Pages 23 to 25 (Personalized Remedies & Daily Success Blueprint) for ${native.name}:
Mulank: ${numbers.mulank} (${planetaryRulers.mulank}) | Bhagyank: ${numbers.bhagyank} (${planetaryRulers.bhagyank})
Missing Numbers in Loshu Grid: ${JSON.stringify(missingNumbers)}

Language: ${isHindi ? 'Hindi' : 'English'}

Write the final remedial prescription:
1. Lucky Elemental Prescription:
   - Auspicious Colors & Colors to avoid.
   - Lucky Numbers, Dates of each month, and Days of the week.
   - Auspicious Vastu Direction for home & office workspace.
2. Gemstone & Rudraksha Guidance:
   - Suitable primary and secondary gemstones (with energization rules).
   - Recommended Rudraksha mukhi for maximum energetic alignment.
3. Name Correction & Signature Vibration:
   - Principles for optimizing name spelling and signing angle (rising 45-degree angle).
4. Daily Sacred Affirmations & Vedic Seed Mantras:
   - Empowering daily affirmations tailored to Mulank ${numbers.mulank} and Bhagyank ${numbers.bhagyank}.
   - Daily Beej Mantra for spiritual protection and abundance.`;
}

module.exports = {
  buildCoreNumbersPrompt,
  buildLoshuYogasPrompt,
  buildCareerWealthPrompt,
  buildRelationshipHealthPrompt,
  buildPredictiveRoadmapPrompt,
  buildRemediesAffirmationsPrompt
};
