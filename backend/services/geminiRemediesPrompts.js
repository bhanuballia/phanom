/**
 * Astrology - run/backend/services/geminiRemediesPrompts.js
 * 
 * Targeted Prompt Templates for 25-Page Hybrid Remedies Report:
 * Integrates:
 * 1. Shastric rules from "Encyclopedia of Astrological Remedies" (Yashkaran Sharma / Arun Kumar Bansal, AIFAS).
 * 2. Exact Swiss Ephemeris astronomical facts (Ascendant, Planetary Strengths, Shadbala, Combustions, Dasha).
 * 3. Structured 25-Page blueprint spanning Gemology, 43-Day Rules, Rudraksha, Yantras, Lal Kitab, and Vratas.
 */

function buildLagnaRemediesPrompt(context, encyclopediaData) {
  const native = context.native || {};
  const currentDasha = context.current_dasha || {};
  const ascendant = native.ascendant_sign || 'Aries';
  const lagnaInfo = (encyclopediaData && encyclopediaData.lagnaGemMatrix && encyclopediaData.lagnaGemMatrix[ascendant]) || {};

  return `
You are a classical Vedic Astrologer and Gemology authority writing for a 25-Page Comprehensive Astrological Remedies Report.
The source authority is the "Encyclopedia of Astrological Remedies" by Yashkaran Sharma and edited by Arun Kumar Bansal (AIFAS).

CLIENT PROFILE:
- Name: ${native.name || 'Seeker'}
- Gender: ${native.gender || 'Not specified'}
- Ascendant (Lagna): ${ascendant}
- Moon Sign: ${native.moon_sign || 'Unknown'}
- Nakshatra: ${native.nakshatra || 'Unknown'}
- Active Dasha: Mahadasha ${currentDasha.active_mahadasha || 'Active'}, Antardasha ${currentDasha.active_antardasha || 'Current'}

ENCYCLOPEDIA SHASTRA MATRIX FOR ${ascendant} LAGNA:
- Life Stone (Lagna Lord): ${lagnaInfo.lifeStone || 'Ruby / Coral'}
- Karaka Stone (5th Lord): ${lagnaInfo.karakaStone || 'Yellow Sapphire / Emerald'}
- Lucky Stone (9th Lord): ${lagnaInfo.luckyStone || 'Blue Sapphire / Pearl'}
- Prohibited Incompatible Gems: ${Array.isArray(lagnaInfo.incompatible) ? lagnaInfo.incompatible.join(', ') : 'Check 6th/8th/12th lords'}

YOUR MISSION (Pages 1-11 Content Synthesis):
1. **The Classical 40-43 Day Rule**: Explain the scientific and subtle energy basis from the Encyclopedia: why gemstones and remedies take 40 to 43 continuous days to impregnate the subtle aura and align cellular frequencies.
2. **Personalized Gemstone Prescription**:
   - Elaborate thoroughly on the client's Life Stone, Karaka Stone, and Lucky Stone.
   - For each stone, give exact carats/weight calculation (rule: minimum 1/10th or 1/12th of body weight in ratti/carats), auspicious metal (Gold, Silver, Panchdhatu, Copper), auspicious finger, weekday, and muhurta (Shukla Paksha sunrise/evening).
3. **Strict Warnings & Incompatible Stones**: Explicitly warn against wearing prohibited gemstones for this specific Lagna and why doing so causes malefic cross-currents.
4. **Step-by-Step Pran Pratishtha (Consecration Ritual)**:
   - Provide the exact Panchamrit cleansing immersion procedure.
   - Prescribe the Vedic Beej Mantra with exact 108 japa counts.
   - Maintenance rules: touch to skin, avoiding negative energy defilement, recharging during solar/lunar transits.

Tone: Authoritative, scholarly, sacred, clear, and reassuring. Write in detailed, multi-paragraph markdown format.
`;
}

function buildRudrakshaYantraPrompt(context, encyclopediaData) {
  const native = context.native || {};
  const currentDasha = context.current_dasha || {};
  const ascendant = native.ascendant_sign || 'Aries';

  return `
You are an expert on Rudraksha Therapy and Yantra Science from the "Encyclopedia of Astrological Remedies".

CLIENT CONTEXT:
- Name: ${native.name || 'Seeker'}
- Ascendant: ${ascendant}
- Active Mahadasha: ${currentDasha.active_mahadasha || 'Active'}
- Active Antardasha: ${currentDasha.active_antardasha || 'Current'}

YOUR MISSION (Pages 12-18 Content Synthesis):
1. **Sacred Rudraksha Therapy (Pages 12-15)**:
   - Prescribe the optimal Mukhi combination (e.g., 1 to 14 Mukhi, Gauri Shankar, Ganesh Rudraksha) best suited for this native's current planetary period and ascendant lord.
   - Provide the specific biological and electromagnetic properties: stabilizing blood pressure, heart chakra rhythm, and planetary radiation neutralization.
   - Specify wearing protocol: red/silk thread vs. silver cap, energizing on Mondays or Shivaratri with "Om Namah Shivaya" and the specific Beej Mantra.
2. **Yantra Architecture & Geometry (Pages 16-18)**:
   - Prescribe 2-3 specific Yantras (e.g., Sri Yantra, Surya Yantra, Mahamrityunjaya Yantra, Kuber Yantra) tailored to pacify planetary afflictions in this chart.
   - Explain the sacred geometry: Bindu, Trikona, Shatkona, and Bhupura.
   - Provide precise directional installation rules (North, North-East, or East altars), lighting ghee lamps, offering vermilion/incense, and Bhojpatra vs. Copper engraving protocols.

Tone: Scholarly, authentic, spiritually elevated. Provide practical, clear instructions in detailed markdown.
`;
}

function buildLalKitabTotkePrompt(context, encyclopediaData) {
  const native = context.native || {};
  const currentDasha = context.current_dasha || {};
  const ascendant = native.ascendant_sign || 'Aries';

  return `
You are a master of Lal Kitab Remedial Architecture, Planetary Charities (Daan), and Vratas from the "Encyclopedia of Astrological Remedies".

CLIENT CONTEXT:
- Client Name: ${native.name || 'Seeker'}
- Ascendant: ${ascendant}
- Current Dasha Period: ${currentDasha.active_mahadasha || 'Active'} / ${currentDasha.active_antardasha || 'Current'}

YOUR MISSION (Pages 19-25 Content Synthesis):
1. **Lal Kitab Totke & Daytime Rules (Pages 19-21)**:
   - Explain the core Lal Kitab principle: remedies MUST be performed between sunrise and sunset; night remedies are strictly counterproductive.
   - Provide 3-4 specific custom totke for planetary pacification (e.g., feeding black dogs/cows, flowing copper coins or whole almonds in running water (Jal Visarjan), keeping square silver piece in pocket).
2. **Planetary Daan & Food Charities (Pages 21-22)**:
   - Food grains and articles corresponding to afflicted planets (e.g., wheat/jaggery for Sun, rice/milk for Moon, red lentils for Mars, moong dal for Mercury, chana dal for Jupiter).
   - What to NEVER donate (e.g., if a planet is placed in certain houses, donating its articles can ruin positive yoga).
3. **Sacred Vratas (Fasting) & Lifestyle Therapy (Pages 23-24)**:
   - Prescribe weekly fasting regimen aligned with the native's auspicious day.
   - Color therapy and dress code: colors that elevate energy vs. colors to strictly avoid.
4. **Nishiddha Karma & Ethical Injunctions (Page 25)**:
   - Specific behavioral cautions (speaking ill of teachers, disrespecting laborers/Shani, keeping rusted iron or broken clocks).
   - Concluding Vedic benediction: "Sarve Bhavantu Sukhinah, Sarve Santu Niramayah".

Tone: Deeply traditional, practical, insightful, and protective. Write in comprehensive, structured markdown.
`;
}

module.exports = {
  buildLagnaRemediesPrompt,
  buildRudrakshaYantraPrompt,
  buildLalKitabTotkePrompt
};
