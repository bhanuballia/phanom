/**
 * Astrology - run/backend/services/geminiDhanYogPrompts.js
 * 
 * Targeted prompt generators for 25-Page Dhan Yog (Wealth & Financial Horoscope) Report:
 * 1. Chapter 1: Dhana Yogas & Divine Wealth Combinations (Mahalaxmi, Chandra-Mangal, Vasumati, Vipreet)
 * 2. Chapter 2: Asset Accumulation, Real Estate, Liquid Savings (2nd, 4th & 11th House Matrix)
 * 3. Chapter 3: Investment Avenues (Stock Market, Gold, Land, Business vs Job)
 * 4. Chapter 4: Financial Timeline & Dasha Wealth Cycles (Vimshottari activation triggers)
 * 5. Chapter 5: Sacred Wealth Remedies, Gemstones, Rudraksha, Kuber/Shree Yantra & Mantras
 */

function buildDhanYogaDeconstructionPrompt(aiContext) {
  const { native, planetary_summary, key_houses, current_dasha } = aiContext;
  return `You are a world-renowned authority in Vedic Wealth Astrology (Brihat Parashara Hora Shastra, Jaimini Sutras).
You are authoring Chapter 1 of a specialized 25-page "Master Dhan Yog & Wealth Matrix Report" for:
Client: ${native.name} (${native.gender})
Lagna (Ascendant): ${native.ascendant_sign} | Moon Sign: ${native.moon_sign}
Key Wealth Houses:
- 2nd House (Accumulated Wealth/Savings): ${JSON.stringify(key_houses['2nd_wealth'] || {})}
- 5th House (Speculative Gains & Purva Punya): ${JSON.stringify(key_houses['5th_speculation'] || {})}
- 9th House (Bhagya / Divine Grace): ${JSON.stringify(key_houses['9th_fortune'] || {})}
- 11th House (Cash Inflow & Profitability): ${JSON.stringify(key_houses['11th_gains'] || {})}
Planetary Matrix: ${JSON.stringify(planetary_summary)}
Active Dasha: ${JSON.stringify(current_dasha)}

Deliver an authoritative, multi-page deep analysis:
1. Classical Dhan Yogas Active in the Natal Chart: Explicitly evaluate 1st, 2nd, 5th, 9th, and 11th lord interconnections (Yuti, Drishti, Parivartana). Check for Lakshmi Yoga, Chandra-Mangala Yoga, Gaja Kesari, Vasumati Yoga, or Vipreet Raj Yoga.
2. Wealth Holding Capacity (Dhana Sanchaya): Distinguish between "Earning Power" (11th house) vs "Retaining/Accumulation Power" (2nd house). 
3. Karmic Financial Debts (Rina / Daridra Checks): Identify if 6th, 8th, or 12th houses afflict the wealth lords or if Rahu/Ketu cause sudden windfalls vs sudden leakage.
4. Wealth Potential Score Assessment: Categorize the native's lifetime financial peak (Upper Middle, High Net Worth, or Exceptional Tycoon potential).

Tone: Highly knowledgeable, scholarly, motivating, precise Vedic astrological terminology.`;
}

function buildInvestmentAvenuesPrompt(aiContext) {
  const { native, planetary_summary, key_houses } = aiContext;
  return `You are an expert financial astrologer advising high-net-worth seekers.
Author Chapter 2 & 3 of the 25-page Dhan Yog Report for: ${native.name} (Lagna: ${native.ascendant_sign}, Moon: ${native.moon_sign}).
Planets: ${JSON.stringify(planetary_summary)}

Provide exhaustive financial strategy chapters covering:
1. Business vs Corporate Employment Wealth: Analysis of 10th lord, 6th lord (service), and 7th lord (commerce/partnership). Is solo entrepreneurship or salaried corporate scaling more lucrative?
2. Real Estate & Fixed Property Potential (4th House & Mars): Capability to acquire commercial land, residential rental yields, or agricultural property.
3. Speculative Markets & Liquid Capital (5th House, Mercury & Rahu): Suitability for Equity Markets, Crypto, Startups, Angel Investing, or Mutual Funds. Warning periods for market crashes.
4. Foreign Wealth & Global Sourcing (12th & 9th House): Earning in foreign currency, offshore ventures, import-export, or multinational remote contracts.
5. Family Inheritance & Unexpected Windfalls (8th House & Saturn/Jupiter): Inherited properties, legacy trusts, and settlements.`;
}

function buildWealthTimelinePrompt(aiContext) {
  const { native, current_dasha, planetary_summary } = aiContext;
  return `You are writing Chapter 4 (The 10-Year Financial Timeline & Dasha Activation) of the 25-page Dhan Yog Report for:
Client: ${native.name}
Active Mahadasha: ${current_dasha.active_mahadasha} | Antardasha: ${current_dasha.active_antardasha}
Planetary Configuration: ${JSON.stringify(planetary_summary)}

Provide a year-by-year predictive roadmap for financial growth over the next 5-10 years:
1. Current Dasha Impact on Cashflow: How the active ruler (${current_dasha.active_mahadasha}) activates 2nd/11th/9th houses.
2. Prime Golden Windows: Exact age phases and sub-periods where major business expansion, salary jumps, or asset acquisitions will materialize.
3. Cautionary Transit Caution Phases: When Saturn (Shani), Rahu-Ketu, or 8th house transits demand conservative budgeting and zero debt expansion.
4. Practical Liquidity Directives: Clear advice on when to aggressively invest versus when to hold risk-free liquid reserves.`;
}

function buildWealthRemediesPrompt(aiContext) {
  const { native, planetary_summary } = aiContext;
  return `You are a traditional Vedic Astro-Remedial Master prescribing Chapter 5 (Remedies, Gemstones & Spiritual Wealth Alignment) for:
Client: ${native.name} (${native.ascendant_sign} Lagna, ${native.moon_sign} Moon).
Planets: ${JSON.stringify(planetary_summary)}

Provide a comprehensive, authentic remedial blueprint:
1. Certified Wealth Gemstone (Ratna): Identify the auspicious gem for 2nd or 9th or 11th lord (e.g., Yellow Sapphire, Emerald, Diamond/White Zircon). Detail finger, metal (Gold/Silver), and purification day.
2. Rudraksha Therapy: Precise bead configuration (e.g., 7 Mukhi Mahalaxmi Rudraksha or 12 Mukhi Surya Rudraksha) to remove obstacles in savings.
3. Sacred Mantras: Dedicated Mahalakshmi, Kubera, or Sri Suktam japa schedules with specific count (108x) and auspicious Muhurta.
4. Yantra Placement: Exact instructions on placing Sri Yantra or Kuber Yantra in the North/North-East direction of home/workplace.
5. Behavioral & Daana (Charity) Codes: Feeding animals, Thursday/Friday daana rules to permanently clear financial obstructions.`;
}

module.exports = {
  buildDhanYogaDeconstructionPrompt,
  buildInvestmentAvenuesPrompt,
  buildWealthTimelinePrompt,
  buildWealthRemediesPrompt
};
