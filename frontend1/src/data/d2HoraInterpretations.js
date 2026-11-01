/**
 * Classical Vedic Jyotish D2 Hora Interpretations
 * Sources: Brihat Parashara Hora Shastra, Saravali, Phaladeepika
 * 
 * Provides:
 * 1. Planet in Solar Hora (Leo / Sun - Surya)
 * 2. Planet in Lunar Hora (Cancer / Moon - Chandra)
 * 3. Specific D2 House Wealth Interpretations (Houses 1-12)
 */

export const PLANET_HORA_INTERPRETATIONS = {
  Sun: {
    Solar: {
      title: "Sun in Sun's Hora (स्व-होरा / Own Solar Hora)",
      nature: "highly_favorable",
      summary: "Supreme independent earning power, government favor, administrative status & self-made empire.",
      reading: "When Sun occupies its own Hora (Leo) in D2, the native possesses immense willpower to generate independent wealth without relying on family crutches. They achieve leadership positions, government contracts, high executive status, or entrepreneurial dominance. Financial growth occurs through discipline, bold enterprise, and courageous risk-taking.",
      strengths: ["Self-made wealth and sovereign leadership", "Profits through administrative and governmental channels", "Resolute confidence in negotiations and contracts"],
      challenges: ["Excessive pride regarding personal earnings", "Reluctance to accept financial counsel from partners"]
    },
    Lunar: {
      title: "Sun in Moon's Hora (चंद्र होरा / Lunar Hora)",
      nature: "moderate",
      summary: "Comfortable earnings, public diplomacy, wealth through service and maternal goodwill.",
      reading: "Sun placed in Moon's Hora (Cancer) softens the aggressive drive for power into public service, hospitality, real estate, and collaborative prosperity. The native accumulates wealth peacefully with maternal support and public goodwill, though expenditures on luxury and family comfort may be high.",
      strengths: ["Smooth accumulation through public-facing professions", "Maternal blessings and property inheritance", "Balanced ethical approach to earning"],
      challenges: ["Fluctuating motivation based on emotional states", "Occasional clash between ego and financial compromises"]
    }
  },
  Moon: {
    Solar: {
      title: "Moon in Sun's Hora (सूर्य होरा / Solar Hora)",
      nature: "challenging",
      summary: "Emotional restlessness in financial matters, wealth generated through strenuous physical efforts.",
      reading: "Moon in Sun's Hora puts emotional water into solar fire. Financial stability requires disciplined routine and overcoming fluctuating decisions. Wealth is gained through hard persistence, independent trade, and overcoming initial resource scarcity.",
      strengths: ["Courage to pursue difficult commercial ventures", "Dynamic adaptability under financial pressure", "Drive to attain public distinction"],
      challenges: ["Impulsive expenditures during emotional highs", "Mental stress and anxiety regarding savings accumulation"]
    },
    Lunar: {
      title: "Moon in Moon's Hora (स्व-होरा / Own Lunar Hora)",
      nature: "highly_favorable",
      summary: "Supreme Raja Yoga for wealth, abundant liquid cash, luxury vehicles & generational prosperity.",
      reading: "Classical texts describe Moon in its own Hora (Cancer) as an auspicious wealth multiplier. The native easily attracts capital, enjoys consistent liquidity, benefits from ancestral estates, and thrives in trade involving liquids, hospitality, silver, FMCG, and creative arts.",
      strengths: ["Effortless liquid cash reserves and high savings rate", "Substantial prosperity through family and real estate", "Calm and intuitive investment wisdom"],
      challenges: ["Tendency toward comfort-oriented inertia", "Excessive expenditure on domestic luxuries"]
    }
  },
  Mars: {
    Solar: {
      title: "Mars in Sun's Hora (सूर्य होरा / Solar Hora)",
      nature: "highly_favorable",
      summary: "Dominant warrior wealth, real estate gains, surgical/industrial profits & unbeatable competitor edge.",
      reading: "Mars is a natural friend of the Sun and thrives in Sun's Hora. The native possesses relentless stamina to conquer financial rivals, invest boldly in land, construction, engineering, metals, or military/security ventures. They rebound vigorously from any financial setbacks.",
      strengths: ["High profits from real estate, machinery, and technology", "Fearless execution in volatile markets", "Capacity to manage large industrial assets"],
      challenges: ["Hasty or aggressive investment speculation", "Potential property disputes if anger is unchecked"]
    },
    Lunar: {
      title: "Mars in Moon's Hora (चंद्र होरा / Lunar Hora)",
      nature: "moderate",
      summary: "Chandra-Mangala yoga effects, wealth through maritime/food/chemical trade, controlled energy.",
      reading: "Mars in Moon's Hora tempers martial aggression into protective commercial enterprises. The native gains wealth through medical professions, agriculture, pharmaceuticals, culinary ventures, or overseas commerce, provided emotional impulsiveness is regulated.",
      strengths: ["Intuitive financial instincts and resource protection", "Gains through maternal lineage and domestic industries", "Tenacious loyalty to business partners"],
      challenges: ["Emotional volatility affecting investment portfolios", "Occasional expenditure on impulsive property acquisitions"]
    }
  },
  Mercury: {
    Solar: {
      title: "Mercury in Sun's Hora (सूर्य होरा / Solar Hora)",
      nature: "favorable",
      summary: "Commercial intellect, high-level accounting, intellectual enterprise & corporate advisory wealth.",
      reading: "Mercury in Sun's Hora sharpens commercial negotiation and strategic enterprise. The native makes money through intellectual property, high-tech consultancy, publishing, accounting, government advisory, and clever marketing campaigns.",
      strengths: ["Sharp analytical acumen and mathematical precision", "Persuasive communication driving profitable business deals", "Profits from media, software, and consultancy"],
      challenges: ["Over-calculative approach hindering spontaneous opportunities", "Mental strain from managing multiple income streams"]
    },
    Lunar: {
      title: "Mercury in Moon's Hora (चंद्र होरा / Lunar Hora)",
      nature: "favorable",
      summary: "Poetic, artistic and trade wealth, commercial diplomacy & liquid financial operations.",
      reading: "Mercury in Moon's Hora blends intellect with deep empathy and imagination. Wealth flows through counseling, writing, e-commerce, banking, consumer goods, and public communications. The native earns with graceful diplomacy.",
      strengths: ["Magnetic public appeal and customer trust", "Multiple diversified revenue streams", "Rapid liquidity generation in retail trade"],
      challenges: ["Fickle decision-making in volatile investments", "Tendency to over-assist financially dependent associates"]
    }
  },
  Jupiter: {
    Solar: {
      title: "Jupiter in Sun's Hora (सूर्य होरा / Solar Hora)",
      nature: "highly_favorable",
      summary: "Magnificent Dhan Yoga, advisory prestige, institutional wealth & high moral prosperity.",
      reading: "Jupiter as Guru in the royal Hora of the Sun grants ethical, sustained, and institutional prosperity. The native accumulates wealth as a legal counsel, financial advisor, educational director, or spiritual authority. Wealth brings societal reverence and spotless reputation.",
      strengths: ["Steady compounded wealth with generational endurance", "High financial patronage from elite institutions", "Generous philanthropic capacity while retaining treasury"],
      challenges: ["Excessive conservatism missing aggressive growth windows", "Occasional leniency with debtors"]
    },
    Lunar: {
      title: "Jupiter in Moon's Hora (चंद्र होरा / Lunar Hora)",
      nature: "highest_fortune",
      summary: "Hamsa / Gaja-Kesari grade prosperity, divine protection of treasury & peaceful abundance.",
      reading: "Parashara rates Jupiter in Cancer (Moon's Hora) among the supreme placements for material and spiritual abundance. The native enjoys profound peace of mind, unshakeable wealth preservation, fertile property holdings, and extraordinary luck during financial crunches.",
      strengths: ["Unfailing divine luck and sudden financial rescues", "Abundance of fixed assets, jewelry, and gold reserves", "Deeply respected family treasury and benevolent fortune"],
      challenges: ["Prone to over-generosity toward unworthy causes", "Comfort inertia during peak earning years"]
    }
  },
  Venus: {
    Solar: {
      title: "Venus in Sun's Hora (सूर्य होरा / Solar Hora)",
      nature: "moderate",
      summary: "Luxury through struggle, high lifestyle expenses, wealth from creative direction & entertainment.",
      reading: "Venus in Sun's royal sign creates a taste for grand aesthetics and opulent status symbols. The native earns via luxury brands, architecture, fashion, cinema, jewelry, or high-end hospitality, but must maintain strict budgetary controls to avoid outflows exceeding inflows.",
      strengths: ["Elite design sensibility commanding premium pricing", "Influential network of affluent patrons", "Capacity to turn creative skills into luxury capital"],
      challenges: ["Heavy vanity expenses on vehicles and social display", "Ego clashes in creative or financial partnerships"]
    },
    Lunar: {
      title: "Venus in Moon's Hora (चंद्र होरा / Lunar Hora)",
      nature: "highest_fortune",
      summary: "Supreme Sukha & Lakshmi Yoga, aesthetic wealth, blissful prosperity & luxury vehicles.",
      reading: "Venus in Moon's Hora generates the classical Lakshmi Yoga blessing. The native enjoys high luxury, beautiful homes, imported vehicles, artistic abundance, and effortless wealth multiplication through spouse, female benefactors, and lifestyle businesses.",
      strengths: ["Continuous cash flow and high return on aesthetic assets", "Profits through hospitality, beauty, jewels, and real estate", "Substantial financial elevation post-marriage"],
      challenges: ["Overindulgence in sensual pleasures and lavish hospitality", "Occasional lack of financial frugality"]
    }
  },
  Saturn: {
    Solar: {
      title: "Saturn in Sun's Hora (सूर्य होरा / Solar Hora)",
      nature: "challenging_to_solid",
      summary: "Iron determination, wealth after prolonged struggle, industrial and land monopolies.",
      reading: "Saturn in Sun's Hora requires intense initial perseverance and rigorous labor. While early financial life may involve hurdles or delays, the native eventually builds indestructible foundations in mining, heavy manufacturing, logistics, long-term infrastructure, and government contracts.",
      strengths: ["Unmatched financial resilience and endurance", "Monopolistic hold on heavy industrial assets", "Extreme frugality and disciplined risk management"],
      challenges: ["Delayed financial peaks usually maturing after age 36", "Cold or overly transactional approach to money"]
    },
    Lunar: {
      title: "Saturn in Moon's Hora (चंद्र होरा / Lunar Hora)",
      nature: "moderate",
      summary: "Structured cashflow, service-based wealth, international trade & conservative portfolio growth.",
      reading: "Saturn in Moon's Hora creates a patient accumulator who respects every penny. The native builds steady savings through public service, mass commodities, cold storage, agricultural distribution, real estate holdings, and structured long-term index savings.",
      strengths: ["Incredible patience allowing compound interest to work", "Profits through mass public services and necessities", "Protection against reckless market bubbles"],
      challenges: ["Excessive pessimism or fear of financial loss", "Occasional deprivation mindset despite good wealth"]
    }
  },
  Rahu: {
    Solar: {
      title: "Rahu in Sun's Hora (सूर्य होरा / Solar Hora)",
      nature: "volatile_ambitious",
      summary: "Explosive ambitions, wealth through disruptive technology, politics, mass media & speculative highs.",
      reading: "Rahu in Sun's Hora creates an unquenchable hunger for grand wealth and fame. The native breaks traditional norms, leveraging foreign capital, digital networks, unconventional startups, political leverage, and cutting-edge innovations to achieve sudden exponential wealth.",
      strengths: ["Visionary mastery over modern technology and global networks", "Fearless disruption yielding extraordinary windfalls", "High capacity to attract venture capital"],
      challenges: ["Extreme volatility and vulnerability to abrupt reversals", "Legal scrutiny if shortcuts are adopted"]
    },
    Lunar: {
      title: "Rahu in Moon's Hora (चंद्र होरा / Lunar Hora)",
      nature: "unconventional_liquid",
      summary: "Foreign earnings, wealth from pharmaceuticals, liquor/chemicals, media & psychological markets.",
      reading: "Rahu in Moon's Hora operates through psychological intuition and mass desires. The native earns abroad, through entertainment, import-export, aviation, biotech, or market psychology, though emotional attachment to wealth can cause periodic anxiety.",
      strengths: ["Uncanny ability to spot foreign market arbitrage", "High profits from unconventional or overseas sources", "Deep understanding of consumer desires"],
      challenges: ["Financial anxiety and illusions of phantom wealth", "Vulnerability to deceptive financial advisors"]
    }
  },
  Ketu: {
    Solar: {
      title: "Ketu in Sun's Hora (सूर्य होरा / Solar Hora)",
      nature: "spiritual_detached",
      summary: "Detached earning power, wealth through research, coding, occult sciences & sudden breaks.",
      reading: "Ketu in Sun's Hora imparts a philosophical attitude toward money. The native is brilliant in technical algorithms, audit, deep scientific research, metaphysics, or healing, but may lack personal attachment to accumulating vast possessions.",
      strengths: ["Deep mastery of specialized niche fields", "Immunity to material greed and clean karma", "Sudden intuitive insights in investment selection"],
      challenges: ["Neglect of personal financial bookkeeping", "Sudden voluntary abandonment of profitable positions"]
    },
    Lunar: {
      title: "Ketu in Moon's Hora (चंद्र होरा / Lunar Hora)",
      nature: "spiritual_subtle",
      summary: "Intuitive wealth preservation, earnings from spiritual or natural sciences & quiet financial contentment.",
      reading: "Ketu in Moon's Hora purifies desires, directing wealth toward natural agriculture, quiet research, charity, pilgrimage, and secluded assets. The native enjoys sufficient resources for all needs while maintaining peace of mind.",
      strengths: ["Innate spiritual protection from financial catastrophe", "Contentment that minimizes destructive lifestyle inflation", "Ancestral spiritual merit translating into quiet support"],
      challenges: ["Passive attitude toward active wealth growth", "Occasional emotional isolation from commercial networks"]
    }
  }
};

export const D2_HOUSE_INTERPRETATIONS = {
  1: {
    title: "1st House in D2 (लग्न भाव - जन्मजात धन सामर्थ्य)",
    core: "Indicates your baseline innate capability to generate wealth through personal intellect, vitality, and direct decision making.",
    favorable: "Strong natural magnetism for financial opportunities; personal initiative yields instant revenue.",
    challenging: "Requires constant personal exertion; wealth generation pauses if personal involvement drops."
  },
  2: {
    title: "2nd House in D2 (कोश भाव - संचित धन व तिजोरी)",
    core: "Signifies accumulated bank balances, gold reserves, family treasury, and liquidity retention.",
    favorable: "High savings compounding rate; ancestral inheritance preserves and multiplies steadily.",
    challenging: "Vulnerability to treasury leakage through family expenditures or impulsive asset liquidation."
  },
  3: {
    title: "3rd House in D2 (विक्रम भाव - व्यावसायिक साहस व पराक्रम)",
    core: "Represents wealth acquired through commercial courage, marketing, communications, and short journeys.",
    favorable: "Aggressive entrepreneurship yields dynamic profits; siblings and close associates assist in wealth creation.",
    challenging: "High effort-to-return ratio; excessive travel or speculative marketing costs."
  },
  4: {
    title: "4th House in D2 (सुख भाव - अचल संपत्ति व वाहन)",
    core: "Governs fixed real estate, agricultural lands, residential properties, luxury vehicles, and maternal assets.",
    favorable: "Substantial capital appreciation in property; luxurious home life and peaceful asset security.",
    challenging: "Capital tied up in non-liquid real estate; high maintenance costs on vehicles and properties."
  },
  5: {
    title: "5th House in D2 (बुद्धि भाव - निवेश, शेयर व सट्टा लाभ)",
    core: "Governs speculative investments, stock markets, venture capital, intellect-driven profits, and mantra prosperity.",
    favorable: "Exceptional intuition in equity and investment markets; progeny brings financial luck and prestige.",
    challenging: "Risk of speculative losses if impulsive trading is pursued during unfavorable transits."
  },
  6: {
    title: "6th House in D2 (ऋण भाव - ऋण, प्रतिस्पर्धा व दैनिक कार्य)",
    core: "Represents wealth won through litigation, overcoming market competitors, money lending, and service professions.",
    favorable: "Ability to leverage debt productively; absolute victory over financial rivals and litigations.",
    challenging: "Burden of compounding interest, outstanding dues from debtors, or dispute expenses."
  },
  7: {
    title: "7th House in D2 (साझेदारी भाव - वैवाहिक व व्यापारिक धन)",
    core: "Reflects wealth obtained through legal partnerships, spouse's fortune, commercial contracts, and international trade.",
    favorable: "Spouse brings notable financial elevation and assets; partnerships operate smoothly with mutual trust.",
    challenging: "Disagreements over profit sharing; dependency on external partners for cash flow."
  },
  8: {
    title: "8th House in D2 (गुप्त धन भाव - विरासत व अप्रत्याशित लाभ)",
    core: "Governs unearned wealth, sudden inheritances, insurance payouts, tax benefits, and hidden reserves.",
    favorable: "Windfalls, sudden legacy benefits, and uncanny ability to unearth undervalued financial assets.",
    challenging: "Fluctuations in liquid resources; legal delays in settling ancestral or estate divisions."
  },
  9: {
    title: "9th House in D2 (भाग्य भाव - दैवीय भाग्य व धर्म लाभ)",
    core: "Signifies divine luck in financial endeavors, long-distance trade, spiritual patronage, and philanthropic wealth.",
    favorable: "Continuous grace of Goddess Lakshmi; ethical earnings multiply with societal admiration.",
    challenging: "Expectations of easy fortune without solid operational groundwork."
  },
  10: {
    title: "10th House in D2 (कर्म भाव - व्यावसायिक प्रतिष्ठा व राजस्व)",
    core: "Governs highest executive status, corporate revenue, government tenders, and public authority in wealth.",
    favorable: "High-paying executive positions, government contracts, and nationwide brand authority.",
    challenging: "High public visibility requiring costly reputation maintenance; political risk to revenue."
  },
  11: {
    title: "11th House in D2 (लाभ भाव - शुद्ध आय, मुनाफा व मित्र मंडली)",
    core: "Represents pure net profit, cash inflows, realization of long-term desires, and corporate network gains.",
    favorable: "Continuous influx of passive revenue; influential affluent friends accelerate business deals.",
    challenging: "Ambitions exceed realistic cash velocity; friends requesting financial guarantees."
  },
  12: {
    title: "12th House in D2 (व्यय भाव - विदेशी निवेश व बहिर्वाह)",
    core: "Governs capital deployed overseas, philanthropic donations, tax outflows, and hospital/spiritual expenses.",
    favorable: "High profits from export-import, multinational enterprises, and tax-efficient investments abroad.",
    challenging: "Unforeseen expenses and capital drain unless intentional planned investments abroad are maintained."
  }
};

export const CLASSICAL_HORA_GUIDELINES = [
  {
    id: 1,
    title: "1. Natural Benefics in Moon's Hora",
    ruleHindi: "चंद्र होरा में शुभ ग्रह",
    content: "Jupiter, Venus, and waxing Moon positioned in Moon's Hora (Cancer) indicate comfortable wealth, smooth cash flow, peace of mind regarding finances, and generous earnings."
  },
  {
    id: 2,
    title: "2. Natural Malefics in Sun's Hora",
    ruleHindi: "सूर्य होरा में क्रूर ग्रह",
    content: "Sun, Mars, and Saturn placed in Sun's Hora (Leo) give exceptional endurance to overcome poverty, aggressive business acumen, courageous investments, and political support."
  },
  {
    id: 3,
    title: "3. 2nd Lord in D1 vs D2 Harmony",
    ruleHindi: "D1 एवं D2 द्वितीयेश सामंजस्य",
    content: "When the 2nd Lord of the D1 Rasi chart is strongly placed in the 1st, 2nd, 9th, or 11th house of the D2 chart, the native experiences sustained Dhan Yoga and lifelong savings."
  }
];

export const D2_BHAVAS_TITLES = {
  1: { en: 'Personal Capacity to Earn', hi: 'व्यक्तिगत धन उपार्जन क्षमता', ta: 'சுய தன ஈட்டும் திறன்', te: 'స్వంత ధన సంపాదన సామర్థ్యం' },
  2: { en: 'Accumulated Wealth & Treasury', hi: 'संचित धन, बैंक बैलेंस व तिजोरी', ta: 'சேமிக்கப்பட்ட செல்வம் மற்றும் கஜானா', te: 'సంచిత ధనం & కుటుంబ ఖజానా' },
  3: { en: 'Financial Courage & Short Ventures', hi: 'व्यावसायिक साहस व लघु उपक्रम', ta: 'வணிக துணிச்சல் மற்றும் முயற்சிகள்', te: 'వ్యాపార సాహసం & లఘు ప్రయత్నాలు' },
  4: { en: 'Fixed Assets, Vehicles & Lands', hi: 'अचल संपत्ति, भवन, भूमि व वाहन', ta: 'அசையாச் சொத்து, வாகனங்கள் மற்றும் நிலம்', te: 'స్థిరాస్తులు, వాహనాలు & గృహాలు' },
  5: { en: 'Speculative Gains & Investments', hi: 'शेयर, सट्टा व बौद्धिक निवेश लाभ', ta: 'பங்குச் சந்தை மற்றும் முதலீட்டு லாபம்', te: 'షేర్లు, స్పెక్యులేషన్ & పెట్టుబడి లాభం' },
  6: { en: 'Loans, Debts & Litigations', hi: 'ऋण, प्रतिस्पर्धा व सेवा क्षेत्र लाभ', ta: 'கடன், போட்டி மற்றும் சேவை வருவாய்', te: 'రుణాలు, పోటీ & సేవా రంగ రాబడి' },
  7: { en: 'Partnership Wealth & Spouse Income', hi: 'साझेदारी लाभ व वैवाहिक धन', ta: 'கூட்டுத் தொழில் மற்றும் துணைவர் தனம்', te: 'భాగస్వామ్య ధనం & జీవిత భాగస్వామి ఆదాయం' },
  8: { en: 'Inheritance, Hidden & Sudden Assets', hi: 'विरासत, गुप्त धन व आकस्मिक लाभ', ta: 'பரம்பரை சொத்து மற்றும் திடீர் தன லாபம்', te: 'వారసత్వ సంపద & ఆకస్మిక ధన లాభం' },
  9: { en: 'Divine Fortune & Luck in Prosperity', hi: 'दैवीय भाग्य, धर्म लाभ व समृद्धि', ta: 'தெய்வீக பாக்கியம் மற்றும் தர்ம தனம்', te: 'దైవిక భాగ్యం & ధర్మబద్ధమైన రాబడి' },
  10: { en: 'Professional Revenue & Authority', hi: 'व्यावसायिक प्रतिष्ठा, पद व राजस्व', ta: 'தொழில் அந்தஸ்து மற்றும் அதிகார வருவாய்', te: 'వృత్తిపరమైన హోదా & కార్పొరేట్ రాబడి' },
  11: { en: 'Cash Inflow, Profit & Elder Gains', hi: 'शुद्ध मुनाफा, नकद आवक व बड़े लाभ', ta: 'நிகர லாபம், தன வரத்து மற்றும் ஆதாயம்', te: 'నికర లాభం & స్థిరమైన నగదు ప్రవాహం' },
  12: { en: 'Expenditure, Investments & Outflow', hi: 'विदेशी निवेश, व्यय व पूंजी बहिर्वाह', ta: 'வெளிநாட்டு முதலீடு மற்றும் செலவுகள்', te: 'విదేశీ పెట్టుబడులు & ఖర్చులు' }
};


