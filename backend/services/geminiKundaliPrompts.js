/**
 * Astrology - run/backend/services/geminiKundaliPrompts.js
 * 
 * 6 Targeted, High-Precision Prompt Templates for the Hybrid 100-Page Kundali
 * Pages 66 to 100:
 * 1. Pages 66-72: Personality, Core Strengths, Weaknesses & Panchang Synthesis
 * 2. Pages 73-80: Career, Business & Financial Wealth Outlook (10th/2nd/11th house & D10)
 * 3. Pages 81-86: Marriage, Spouse Profile & Relationship Timing (7th house & D9 Navamsha)
 * 4. Pages 87-92: Health, Vitality & Disease Vulnerabilities (6th/8th house & doshas)
 * 5. Pages 93-97: Active Dasha & Yearly Transit Deep-Dive (Upcoming 5-Year Timeline)
 * 6. Pages 98-100: Personalized Remedies, Gemstones, Rudraksha, Mantras & Lifestyle Do's/Don'ts
 */

function buildPersonalityPrompt(aiContext) {
  const { native, planetary_summary, key_houses } = aiContext;
  return `You are an enlightened, classical Vedic astrologer writing Pages 66 to 72 of a comprehensive 100-page Kundali report for:
Client: ${native.name} (${native.gender})
Ascendant: ${native.ascendant_sign} | Moon Sign: ${native.moon_sign} | Sun Sign: ${native.sun_sign}
Nakshatra: ${native.nakshatra} (Lord: ${native.nakshatra_lord || 'N/A'})
Panchang: Tithi: ${native.tithi}, Yoga: ${native.yoga}, Karana: ${native.karana}
Planets Summary: ${JSON.stringify(planetary_summary)}

Write an exhaustive, deeply philosophical, and psychologically insightful assessment for "Personality & Core Soul Archetype" covering:
1. Core Temperament & Soul Blueprint (Prakriti, Gunic balance: Sattva/Rajas/Tamas).
2. Cognitive & Emotional Processing (Moon sign, Nakshatra influence on mental resilience).
3. Primary Strengths & Inherent Talents (Planetary yogas and dominant angular placements).
4. Shadow Side & Blind Spots (Afflictions, retrogrades, and areas requiring conscious evolution).
5. Social Persona vs Inner Self (Lagna vs Moon chart dynamics).
6. Spiritual Inclinations & Higher Purpose (9th/12th house influences).

Tone: Authoritative, compassionate, deeply rooted in Vedic philosophy (Brihat Parashara Hora Shastra). Provide detailed paragraphs with actionable self-awareness points.`;
}

function buildCareerPrompt(aiContext) {
  const { native, planetary_summary, key_houses, dashamamsha_d10_summary, current_dasha } = aiContext;
  return `You are an esteemed Vedic astrologer writing Pages 73 to 80 of a 100-page Kundali report focusing on Career, Profession & Wealth for:
Client: ${native.name}
Ascendant: ${native.ascendant_sign} | 10th House: ${JSON.stringify(key_houses['10th_career'])}
2nd House (Wealth): ${JSON.stringify(key_houses['2nd_wealth'])} | 11th House (Gains): ${JSON.stringify(key_houses['11th_gains'])}
Dashamamsha (D10) Lagna: ${dashamamsha_d10_summary.ascendant} | 10th Sign in D10: ${dashamamsha_d10_summary["10th_house_sign"]}
Current Dasha: ${JSON.stringify(current_dasha)}
Planetary Data: ${JSON.stringify(planetary_summary)}

Deliver an in-depth Career & Wealth Strategic Blueprint covering:
1. Primary Vocational Archetype: Most suitable industries (Tech, Corporate, Entrepreneurship, Government, Advisory, Creative arts, or Trade).
2. Business vs Employment Suitability: Risk tolerance, leadership capability, independent venture viability.
3. Financial Architecture (Dhana Yogas): Capacity for wealth accumulation, liquid assets vs real estate/property.
4. Professional Obstacles & Pitfalls: 6th/8th/10th house interactions, periods requiring caution in investments.
5. High-Growth Catalysts: How the current Mahadasha (${current_dasha.active_mahadasha}) and Antardasha (${current_dasha.active_antardasha}) will impact career elevation.
6. Practical Strategic Directives: Specific leadership styles and ethical codes to unlock professional abundance.`;
}

function buildMarriagePrompt(aiContext) {
  const { native, planetary_summary, key_houses, navamsha_d9_summary, doshas } = aiContext;
  return `You are an expert Vedic astrologer writing Pages 81 to 86 of a 100-page Kundali report focusing on Marriage, Partnerships & Conjugal Bliss for:
Client: ${native.name} (${native.gender})
Ascendant: ${native.ascendant_sign} | 7th House: ${JSON.stringify(key_houses['7th_marriage'])}
Venus (Karaka of Marriage) & Jupiter (Karaka of Wisdom/Husband): ${JSON.stringify(planetary_summary.Venus || {})} / ${JSON.stringify(planetary_summary.Jupiter || {})}
Navamsha (D9) Ascendant: ${navamsha_d9_summary.ascendant} | D9 Planets: ${JSON.stringify(navamsha_d9_summary.planets)}
Manglik / Dosha Indications: ${JSON.stringify(doshas.manglik || 'None')}

Deliver an empathetic and nuanced Marriage Analysis covering:
1. Soulmate & Spouse Archetype: Personality, physical attributes, intellectual nature, and family background of the life partner.
2. Dynamics of Conjugal Harmony: Emotional bonding, mutual expectations, and communication tendencies.
3. Marital Timing Windows: Planetary conditions favoring engagement, marriage, or relationship milestones.
4. Karmic Lessons in Partnership: Navamsha (D9) indications, areas requiring patience and maturity.
5. Kuja / Dosha Mitigation: Practical remedies and psychological balance to preserve long-term bliss.`;
}

function buildHealthPrompt(aiContext) {
  const { native, planetary_summary, key_houses, doshas } = aiContext;
  return `You are an expert in Ayur-Astrology (Medical Vedic Astrology) writing Pages 87 to 92 of a 100-page Kundali report for:
Client: ${native.name}
Ascendant: ${native.ascendant_sign} | 6th House (Disease): ${JSON.stringify(key_houses['6th_enemies_disease'])}
8th House (Longevity/Chronic): ${JSON.stringify(key_houses['8th_longevity'])} | 12th House (Hospitalization): ${JSON.stringify(key_houses['12th_expenses_moksha'])}
Planetary Data: ${JSON.stringify(planetary_summary)}

Provide a comprehensive Ayurvedic & Astrological Vitality Guide covering:
1. Constitutional Nature (Prakriti): Vata, Pitta, or Kapha dominance based on Lagna, Moon, and 6th lord.
2. Anatomical & Physiological Vulnerabilities: Specific organ systems requiring mindful care (digestive, cardiac, nervous, musculoskeletal, etc.).
3. Stress & Mental Vitality: Mind-body link governed by Moon and Mercury placements.
4. Vulnerable Astrological Cycles: Transit or Dasha flags where lifestyle vigilance is essential.
5. Dietary & Lifestyle Prescriptions: Ayurvedic food principles, optimal circadian rhythm, and preventive wellness habits.`;
}

function buildTransitPrompt(aiContext) {
  const { native, current_dasha, planetary_summary, sarvashtakavarga_totals } = aiContext;
  return `You are a master Vedic predictive astrologer writing Pages 93 to 97 of a 100-page Kundali report focusing on the 5-Year Predictive Forecast (2025-2030) for:
Client: ${native.name}
Moon Sign: ${native.moon_sign} | Ascendant: ${native.ascendant_sign}
Current Dasha: ${JSON.stringify(current_dasha)}
Sarvashtakavarga Scores: ${JSON.stringify(sarvashtakavarga_totals)}

Provide a structured, year-by-year predictive timeline for the upcoming 5 years:
1. Year 1 Forecast: Key thematic developments in career, personal life, finances, and inner growth.
2. Year 2 Forecast: Major opportunities, decision crossroads, and transiting planetary triggers.
3. Year 3 Forecast: Long-term foundations, relationships, and spiritual developments.
4. Year 4 Forecast: Financial gains, professional recognition, or geographical movements.
5. Year 5 Forecast: Culmination of efforts and transition into the next evolutionary phase.
6. Shani (Saturn) & Guru (Jupiter) Transit Impact: Influence of Saturn's transit relative to Moon sign and Jupiter's benefic gaze.`;
}

function buildRemediesPrompt(aiContext) {
  const { native, planetary_summary, doshas } = aiContext;
  return `You are a revered Vedic master writing Pages 98 to 100 (Final Chapters) of a 100-page Kundali report focusing on Personalized Vedic Remedies for:
Client: ${native.name}
Ascendant: ${native.ascendant_sign} | Moon Sign: ${native.moon_sign}
Planetary Strengths/Dignities: ${JSON.stringify(planetary_summary)}
Active Doshas: ${JSON.stringify(doshas)}

Formulate a holistic, sacred, and practical Remedial Prescription:
1. Auspicious Gemstones (Ratna): Suitable gemstones, carat weight, metal (Gold/Silver/Panchdhatu), finger to wear, auspicious day/time, and purification mantras.
2. Inauspicious Gemstones: Explicit warnings against stones that could aggravate afflicted houses.
3. Sacred Rudraksha: Recommended Mukhi Rudraksha beads for planetary shielding and focus.
4. Vedic & Beej Mantras: Daily japa mantras with count (e.g., 108 times) to appease functional malefics and empower benefics.
5. Yantra & Deity Worship: Recommended Ishta Devata and Yantras for domestic harmony and career success.
6. Daan (Charity) & Karmic Lifestyle Corrections: Meaningful acts of service to neutralize karmic debts.`;
}

module.exports = {
  buildPersonalityPrompt,
  buildCareerPrompt,
  buildMarriagePrompt,
  buildHealthPrompt,
  buildTransitPrompt,
  buildRemediesPrompt
};
