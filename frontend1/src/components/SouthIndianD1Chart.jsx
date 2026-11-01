import React, { useState } from "react";
import { MULTILINGUAL_PLANET_ABBREV } from "../utils/chartLanguageUtils";

// Standard fixed Zodiac Sign definitions for South Indian Chart (0-indexed: 0 = Aries, ..., 11 = Pisces)
// Grid layout is 4 columns x 4 rows (col 0..3, row 0..3)
// Moving clockwise along the perimeter:
// Row 0: Pisces (col 0), Aries (col 1), Taurus (col 2), Gemini (col 3)
// Col 3: Cancer (row 1), Leo (row 2), Virgo (row 3)
// Row 3: Libra (col 2), Scorpio (col 1), Sagittarius (col 0)
// Col 0: Capricorn (row 2), Aquarius (row 1)
const SIGN_GRID_CELLS = {
  11: { row: 0, col: 0, en: "Pisces", sa: "मीन", id: 12 },      // Meena
  0: { row: 0, col: 1, en: "Aries", sa: "मेष", id: 1 },         // Mesha
  1: { row: 0, col: 2, en: "Taurus", sa: "वृषभ", id: 2 },      // Vrishabha
  2: { row: 0, col: 3, en: "Gemini", sa: "मिथुन", id: 3 },     // Mithuna
  3: { row: 1, col: 3, en: "Cancer", sa: "कर्क", id: 4 },       // Karka
  4: { row: 2, col: 3, en: "Leo", sa: "सिंह", id: 5 },          // Simha
  5: { row: 3, col: 3, en: "Virgo", sa: "कन्या", id: 6 },       // Kanya
  6: { row: 3, col: 2, en: "Libra", sa: "तुला", id: 7 },        // Thula
  7: { row: 3, col: 1, en: "Scorpio", sa: "वृश्चिक", id: 8 },   // Vrischika
  8: { row: 3, col: 0, en: "Sagittarius", sa: "धनु", id: 9 },  // Dhanus
  9: { row: 2, col: 0, en: "Capricorn", sa: "मकर", id: 10 },    // Makara
  10: { row: 1, col: 0, en: "Aquarius", sa: "कुंभ", id: 11 },   // Kumbha
};

const PLANET_ABBREV = {
  Sun: "सू.",
  Moon: "च.",
  Mars: "म.",
  Mercury: "बु.",
  Jupiter: "गु.",
  Venus: "शु.",
  Saturn: "श.",
  Rahu: "रा.",
  Ketu: "के.",
  Ascendant: "ल.",
};

const PLANET_COLORS = {
  Sun: "#dc2626",
  Moon: "#0284c7",
  Mars: "#ea580c",
  Mercury: "#16a34a",
  Jupiter: "#d97706",
  Venus: "#db2777",
  Saturn: "#475569",
  Rahu: "#4f46e5",
  Ketu: "#7c3aed",
  Ascendant: "#9333ea",
};

const NAKSHATRA_HINDI = {
  Ashwini: "अश्",
  Bharani: "भर",
  Krittika: "कृत्",
  Rohini: "रोहि",
  Mrigashira: "मृग",
  Ardra: "आर्",
  Punarvasu: "पुन",
  Pushya: "पुष",
  Ashlesha: "आश्",
  Magha: "मघा",
  "Purva Phalguni": "पू.फा",
  "Uttara Phalguni": "उ.फा",
  Hasta: "हस्",
  Chitra: "चित",
  Swati: "स्वा",
  Vishakha: "विश",
  Anuradha: "अनु",
  Jyeshtha: "ज्ये",
  Mula: "मूल",
  "Purva Ashadha": "पू.षा",
  "Uttara Ashadha": "उ.षा",
  Shravana: "श्रव",
  Dhanishta: "धनि",
  Shatabhisha: "शत",
  "Purva Bhadrapada": "पू.भा",
  "Uttara Bhadrapada": "उ.भा",
  Revati: "रेव",
};

export default function SouthIndianD1Chart({
  houses,
  planetPositions = [],
  title = "South Indian Chart (दक्षिण भारतीय कुंडली)",
  onPlanetClick,
  headerExtra = null,
  lang: propLang = "en",
}) {
  const [lang, setLang] = useState((propLang || "en").toLowerCase());
  const [showDegree, setShowDegree] = useState(true);
  const [showNakshatra, setShowNakshatra] = useState(true);

  // Keep in sync with parent prop if it changes
  React.useEffect(() => {
    if (propLang) {
      setLang(propLang.toLowerCase());
    }
  }, [propLang]);

  const activeLang = (lang || "en").toLowerCase();

  // Identify Lagna sign (House 1)
  const lagnaHouse = houses?.[1] || houses?.["1"];
  const lagnaSignIndex =
    lagnaHouse && lagnaHouse.sign_index !== undefined
      ? lagnaHouse.sign_index
      : 0;

  // Map each sign (0..11) to its list of planets & house number
  // House 1 is in lagnaSignIndex, House 2 is (lagnaSignIndex + 1) % 12, etc.
  const signData = {};
  for (let s = 0; s < 12; s++) {
    // Find which house corresponds to sign 's'
    const hNum = ((s - lagnaSignIndex + 12) % 12) + 1;
    const houseInfo = houses?.[hNum] || {};
    const rawList = houseInfo.planets || [];
    // Normalize planets list so it's always clean strings
    const cleanPlanets = rawList
      .map((p) => (typeof p === "string" ? p : p?.planet || p?.name || ""))
      .filter(Boolean);

    signData[s] = {
      houseNum: hNum,
      isLagna: s === lagnaSignIndex,
      planets: cleanPlanets,
    };
  }

  const getPlanetInfo = (target) => {
    const targetStr = (
      typeof target === "string"
        ? target
        : target?.planet || target?.name || ""
    ).toLowerCase();

    return (planetPositions || []).find((p) => {
      const pName = (typeof p === "string" ? p : p?.planet || p?.name || "").toLowerCase();
      return pName === targetStr;
    });
  };

  // Dimensions for SVG: 4x4 grid in a 400x400 viewbox (each cell is 100x100)
  const CELL_SIZE = 100;
  const TOTAL_SIZE = 400;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-y-2.5 gap-x-3 mb-3 px-1">
        {/* Left: Title + North/South Switch */}
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="font-serif font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            {title}
          </h3>
          {headerExtra}
        </div>

        {/* Right: Feature Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 ml-auto">
          {/* Degree Toggle */}
          <button
            onClick={() => setShowDegree(!showDegree)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition shadow-xs ${showDegree
              ? "bg-amber-50 border-amber-300 text-amber-800"
              : "border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            title="Toggle planet degrees"
          >
            {showDegree ? "✓ Degree" : "Degree"}
          </button>

          {/* Nakshatra Toggle */}
          <button
            onClick={() => setShowNakshatra(!showNakshatra)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition shadow-xs ${showNakshatra
              ? "bg-amber-50 border-amber-300 text-amber-800"
              : "border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            title="Toggle planet nakshatras"
          >
            {showNakshatra ? "✓ Nakshatra" : "Nakshatra"}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-300 hover:bg-slate-100 transition shadow-xs text-slate-700"
          >
            {lang === "en" ? "हिंदी" : "EN"}
          </button>
        </div>
      </div>

      {/* SVG South Indian Chart Container */}
      <div className="w-full bg-[#fdfbf7] p-3 rounded-3xl border border-amber-200/80 shadow-xs relative select-none max-w-[580px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${TOTAL_SIZE} ${TOTAL_SIZE}`}
          className="w-full h-full"
          style={{ shapeRendering: "geometricPrecision" }}
        >
          <defs>
            <linearGradient id="siOuterBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="siCenterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#fffbeb" stopOpacity="0.1" />
            </linearGradient>
            <pattern id="lagnaStripe" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#d97706" strokeWidth="2" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Outer Chart Background */}
          <rect
            x="4"
            y="4"
            width={TOTAL_SIZE - 8}
            height={TOTAL_SIZE - 8}
            fill="#ffffff"
            stroke="url(#siOuterBorder)"
            strokeWidth="3"
            rx="4"
          />

          {/* Central 2x2 Box (cols 1..2, rows 1..2 -> x: 100 to 300, y: 100 to 300) */}
          <rect
            x={CELL_SIZE}
            y={CELL_SIZE}
            width={CELL_SIZE * 2}
            height={CELL_SIZE * 2}
            fill="url(#siCenterGrad)"
            stroke="#b45309"
            strokeWidth="2"
          />

          {/* Center Box Text & Logo */}
          <g transform={`translate(${TOTAL_SIZE / 2}, ${TOTAL_SIZE / 2})`}>
            {/* Om or Sun Symbol */}
            <circle cx="0" cy="-28" r="16" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
            <text
              x="0"
              y="-24"
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill="#b45309"
            >
              🕉️
            </text>

            <text
              x="0"
              y="6"
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              fontFamily="serif"
              fill="#92400e"
            >
              {lang === "hi" ? "लग्न कुण्डली" : "Rāśi Chart (D1)"}
            </text>
            <text
              x="0"
              y="24"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#b45309"
            >
              {lang === "hi" ? "दक्षिण भारतीय पद्धति" : "South Indian Style"}
            </text>
            <text
              x="0"
              y="40"
              textAnchor="middle"
              fontSize="8.5"
              fill="#78350f"
              fontFamily="sans-serif"
            >
              Fixed Signs • Clockwise
            </text>
          </g>

          {/* Render 12 Perimeter Sign Cells */}
          {Object.entries(SIGN_GRID_CELLS).map(([sIdxStr, cellInfo]) => {
            const signIdx = Number(sIdxStr);
            const { row, col, en, sa } = cellInfo;
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;

            const data = signData[signIdx] || { houseNum: 1, isLagna: false, planets: [] };
            const { houseNum, isLagna, planets } = data;

            return (
              <g key={`sign-${signIdx}`}>
                {/* Cell Border */}
                <rect
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  fill={isLagna ? "#fffbeb" : "#ffffff"}
                  stroke="#b45309"
                  strokeWidth="1.5"
                />

                {/* Lagna Diagonal Cross / Banner if this sign is Lagna */}
                {isLagna && (
                  <>
                    {/* Top-right corner diagonal banner */}
                    <polygon
                      points={`${x + CELL_SIZE - 24},${y} ${x + CELL_SIZE},${y} ${x + CELL_SIZE},${y + 24}`}
                      fill="#f59e0b"
                      opacity="0.9"
                    />
                    <text
                      x={x + CELL_SIZE - 8}
                      y={y + 11}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="9"
                      fontWeight="black"
                      fill="#ffffff"
                    >
                      {lang === "hi" ? "ल" : "Asc"}
                    </text>

                    {/* Subtle corner badge for Lagna */}
                    <rect
                      x={x + 3}
                      y={y + 3}
                      width="38"
                      height="14"
                      rx="3"
                      fill="#ef4444"
                    />
                    <text
                      x={x + 22}
                      y={y + 11}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="8"
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      {lang === "hi" ? "लग्न (1)" : "LAGNA (1)"}
                    </text>
                  </>
                )}

                {/* Sign Name + House indicator */}
                {!isLagna && (
                  <g>
                    {/* Small House badge */}
                    <rect
                      x={x + 3}
                      y={y + 3}
                      width="20"
                      height="13"
                      rx="2.5"
                      fill="#f1f5f9"
                      stroke="#cbd5e1"
                      strokeWidth="0.8"
                    />
                    <text
                      x={x + 13}
                      y={y + 10.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="8"
                      fontWeight="bold"
                      fill="#475569"
                    >
                      H{houseNum}
                    </text>
                  </g>
                )}

                {/* Sign Title in Top-Right (or center-right if Lagna) */}
                <text
                  x={isLagna ? x + CELL_SIZE - 28 : x + CELL_SIZE - 5}
                  y={y + 11}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize="8.5"
                  fontWeight="bold"
                  fill="#78350f"
                >
                  {lang === "hi" ? sa : en}
                </text>

                {/* Divider Line under header */}
                <line
                  x1={x + 3}
                  y1={y + 19}
                  x2={x + CELL_SIZE - 3}
                  y2={y + 19}
                  stroke="#fde68a"
                  strokeWidth="0.8"
                />

                {/* Planets inside this Sign */}
                <g transform={`translate(${x + CELL_SIZE / 2}, ${y + 24})`}>
                  {planets.length === 0 ? (
                    <text
                      x="0"
                      y="32"
                      textAnchor="middle"
                      fontSize="9"
                      fill="#cbd5e1"
                    >
                      —
                    </text>
                  ) : (
                    planets.map((pName, pIdx) => {
                      const pInfo = getPlanetInfo(pName);
                      const isRetrograde = pInfo?.is_retrograde || false;
                      const isCombust = pInfo?.is_combust || false;
                      const pColor = PLANET_COLORS[pName] || "#1e293b";

                      const langMap = MULTILINGUAL_PLANET_ABBREV[activeLang] || MULTILINGUAL_PLANET_ABBREV["en"];
                      const displayName =
                        langMap[pName] ||
                        (pName === "Ascendant" ? "Asc" : pName.substring(0, 3));

                      let statusSuffix = "";
                      if (isRetrograde) statusSuffix += "*";
                      if (isCombust) statusSuffix += "#";

                      // Degree calculation (handle both norm_degree and degree % 30)
                      let degreeStr = "";
                      if (showDegree && pInfo) {
                        const degVal =
                          pInfo.norm_degree !== undefined
                            ? Number(pInfo.norm_degree)
                            : pInfo.degree !== undefined
                              ? Number(pInfo.degree) % 30
                              : null;
                        if (degVal !== null && !isNaN(degVal)) {
                          const deg = Math.floor(degVal);
                          const min = Math.floor((degVal - deg) * 60);
                          degreeStr = ` ${deg}°${min < 10 ? "0" + min : min}'`;
                        }
                      }

                      // Nakshatra calculation (handle object and string shapes)
                      let nakStr = "";
                      if (showNakshatra && pInfo) {
                        const rawNakVal =
                          typeof pInfo.nakshatra === "object"
                            ? pInfo.nakshatra?.name || ""
                            : String(pInfo.nakshatra || "");
                        if (rawNakVal) {
                          const rawNak = rawNakVal.split("-")[0].trim();
                          nakStr =
                            lang === "hi"
                              ? NAKSHATRA_HINDI[rawNak] || rawNak.substring(0, 3)
                              : rawNak.substring(0, 3);
                        }
                      }

                      // Layout: stack planets vertically
                      // Up to 5-6 planets can be accommodated neatly
                      const totalPlanets = planets.length;
                      const stepY = totalPlanets > 4 ? 13 : totalPlanets > 2 ? 15 : 18;
                      const yPos = 8 + pIdx * stepY;
                      const fontSize = totalPlanets > 4 ? "8" : "9.5";

                      return (
                        <g
                          key={`${pName}-${pIdx}`}
                          transform={`translate(0, ${yPos})`}
                          className="cursor-pointer hover:opacity-75 transition"
                          onClick={() => onPlanetClick?.(pName, houseNum)}
                        >
                          <text
                            x="0"
                            y="0"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={fontSize}
                            fontWeight="bold"
                            fill={pColor}
                          >
                            {displayName}
                            {statusSuffix}
                            {degreeStr && (
                              <tspan
                                fill="#1e293b"
                                fontSize={Number(fontSize) * 0.8}
                                fontWeight="normal"
                                dx="1"
                              >
                                {degreeStr}
                              </tspan>
                            )}
                            {nakStr && (
                              <tspan
                                fill="#64748b"
                                fontSize={Number(fontSize) * 0.72}
                                fontWeight="medium"
                                dx="1"
                              >
                                ({nakStr})
                              </tspan>
                            )}
                          </text>
                        </g>
                      );
                    })
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Talk To Astrologer Image Banner */}
      <div className="w-full max-w-[580px] mt-3 rounded-2xl overflow-hidden border border-amber-200/70 shadow-xs transition hover:shadow-md">
        <a
          href="/live-astrologers"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
          title="Talk to Verified Astrologers Live"
        >
          <img
            src="/images/Astrologertalk.jpg"
            alt="Talk to Astrologer Live"
            className="w-full h-auto object-cover max-h-[140px] md:max-h-[190px] rounded-2xl hover:opacity-95 transition"
          />
        </a>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[12px] text-slate-500 mt-2 font-mono">
        <span>* = Vakri (Retrograde)</span>
        <span># = Asth (Combust)</span>
        <span>Asc / Lagna = Ascendant Sign</span>
        <span>Format: Planet Degree (Nakshatra)</span>
      </div>
    </div>
  );
}
