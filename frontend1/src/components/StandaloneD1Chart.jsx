import React, { useState } from "react";
import { MULTILINGUAL_PLANET_ABBREV } from "../utils/chartLanguageUtils";

// North Indian chart coordinate anchors in normalized 0-100 space
const HOUSE_SIGN_ANCHOR = {
  1: { x: 50, y: 44 },  // bottom of top diamond
  2: { x: 29, y: 23 },  // bottom-right of top-left triangle
  3: { x: 23, y: 29 },  // top-right of left-upper triangle
  4: { x: 44, y: 50 },  // right of left diamond
  5: { x: 23, y: 71 },  // bottom-right of left-lower triangle
  6: { x: 29, y: 77 },  // top-right of bottom-left triangle
  7: { x: 50, y: 56 },  // top of bottom diamond
  8: { x: 71, y: 77 },  // top-left of bottom-right triangle
  9: { x: 77, y: 71 },  // bottom-left of right-lower triangle
  10: { x: 56, y: 50 }, // left of right diamond
  11: { x: 77, y: 29 }, // top-left of right-upper triangle
  12: { x: 71, y: 23 }, // bottom-left of top-right triangle
};

const HOUSE_CENTER = {
  1: { x: 50, y: 27.5 }, // top diamond
  2: { x: 27.5, y: 12.5 }, // top-left triangle
  3: { x: 12.5, y: 27.5 }, // left-upper triangle
  4: { x: 27.5, y: 50 }, // left diamond
  5: { x: 12.5, y: 72.5 }, // left-lower triangle
  6: { x: 27.5, y: 87.5 }, // bottom-left triangle
  7: { x: 50, y: 72.5 }, // bottom diamond
  8: { x: 72.5, y: 87.5 }, // bottom-right triangle
  9: { x: 87.5, y: 72.5 }, // right-lower triangle
  10: { x: 72.5, y: 50 }, // right diamond
  11: { x: 87.5, y: 27.5 }, // right-upper triangle
  12: { x: 72.5, y: 12.5 }, // top-right triangle
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
  Ascendant: "#000000",
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

export default function StandaloneD1Chart({
  houses,
  planetPositions = [],
  title = "Main Birth Chart (D1 / Lagna)",
  onPlanetClick,
  headerExtra = null,
  lang: propLang = "en",
}) {
  const [lang, setLang] = useState((propLang || "en").toLowerCase());
  const [isRect, setIsRect] = useState(true); // Default to Rectangle shape
  const [showDegree, setShowDegree] = useState(true); // Display Degrees
  const [showNakshatra, setShowNakshatra] = useState(true); // Display Nakshatra

  // Keep in sync with parent prop if it changes
  React.useEffect(() => {
    if (propLang) {
      setLang(propLang.toLowerCase());
    }
  }, [propLang]);

  const activeLang = (lang || "en").toLowerCase();

  // Aspect ratio for the rectangle view (width multiplier)
  const aspectRatio = isRect ? 1.45 : 1.0;

  // Build house lookup helper
  const getHouseData = (hNum) => {
    return houses?.[hNum] || { sign_index: (hNum - 1) % 12, planets: [] };
  };

  const getPlanetInfo = (name) => {
    return (planetPositions || []).find(
      (p) => (p.planet || p.name || "").toLowerCase() === (name || "").toLowerCase()
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-y-2.5 gap-x-3 mb-3 px-1">
        {/* Left: Title + North/South Switch */}
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="font-serif font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            {title}
          </h3>
          {headerExtra}
        </div>

        {/* Right: Feature Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 ml-auto">
          {/* Degree Toggle Button */}


          {/* Nakshatra Toggle Button */}

          {/* Toggle between Rectangle and Square shape */}


          {/* Language Toggle */}

        </div>
      </div>

      {/* SVG Chart Container */}
      <div
        className={`w-full bg-[#fdfbf7] p-3 rounded-3xl border border-amber-200/80 shadow-sm relative select-none transition-all duration-300 ${isRect
          ? "max-w-[820px] aspect-[1.48/1]"
          : "max-w-[580px] aspect-square"
          }`}
      >
        <svg
          viewBox={`0 0 ${100 * aspectRatio} 100`}
          className="w-full h-full"
          preserveAspectRatio="none"
          style={{ shapeRendering: "geometricPrecision" }}
        >
          {/* Subtle Outer Drop Shadow / Glow */}
          <defs>
            <linearGradient id="kendraGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#fffbeb" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>

          {/* Chart Background and outer frame */}
          <rect
            x={5 * aspectRatio}
            y="5"
            width={90 * aspectRatio}
            height="90"
            fill="#ffffff"
            stroke="url(#borderGradient)"
            strokeWidth="0.6"
            rx="1.5"
          />

          {/* Inner Decorative Framing Line */}
          <rect
            x={5.8 * aspectRatio}
            y="5.8"
            width={88.4 * aspectRatio}
            height="88.4"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="0.25"
            rx="1"
          />

          {/* Kendra Diamonds Shading (Houses 1, 4, 7, 10) */}
          <polygon
            points={`${50 * aspectRatio},5.8 ${94.2 * aspectRatio},50 ${50 * aspectRatio},94.2 ${5.8 * aspectRatio},50`}
            fill="url(#kendraGlow)"
            stroke="none"
          />

          {/* Diagonals */}
          <line
            x1={5.8 * aspectRatio}
            y1="5.8"
            x2={94.2 * aspectRatio}
            y2="94.2"
            stroke="#94a3b8"
            strokeWidth="0.35"
          />
          <line
            x1={94.2 * aspectRatio}
            y1="5.8"
            x2={5.8 * aspectRatio}
            y2="94.2"
            stroke="#94a3b8"
            strokeWidth="0.35"
          />

          {/* Inner Diamond (Kendra Boundary) */}
          <polygon
            points={`${50 * aspectRatio},5.8 ${94.2 * aspectRatio},50 ${50 * aspectRatio},94.2 ${5.8 * aspectRatio},50`}
            fill="none"
            stroke="#d97706"
            strokeWidth="0.45"
          />

          {/* Center Bindu (Cosmic Origin) */}
          <circle
            cx={50 * aspectRatio}
            cy="50"
            r="0.8"
            fill="#b45309"
            opacity="0.8"
          />

          {/* Render 12 Houses */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hNum) => {
            const hData = getHouseData(hNum);
            const signIdx =
              hData.sign_index !== undefined
                ? hData.sign_index
                : Math.floor((hData.cusp_deg || 0) / 30);
            const signNum = ((signIdx % 12) + 12) % 12 + 1; // 1 to 12

            const signAnchor = HOUSE_SIGN_ANCHOR[hNum];
            const center = HOUSE_CENTER[hNum];

            // Filter out empty or duplicate planet names
            const rawPlanets = hData.planets || [];
            const planets = rawPlanets.map((p) =>
              typeof p === "string" ? p : p.planet || p.name
            );

            const totalPlanets = planets.length;
            const hasExtraInfo = showDegree || showNakshatra;
            const spacing = hasExtraInfo
              ? totalPlanets > 3
                ? 4.2
                : 4.8
              : totalPlanets > 3
                ? 3.2
                : 3.8;

            return (
              <g key={`house-${hNum}`}>
                {/* Sign Number (Traditional numeral) */}
                <text
                  x={signAnchor.x * aspectRatio}
                  y={signAnchor.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isRect ? "4.0" : "4.4"}
                  fontWeight="medium"
                  fill="rgba(5, 3, 3, 1)"
                  className="font-mono"
                >
                  {signNum}
                </text>

                {/* Planets positioned inside House centroid */}
                <g transform={`translate(${center.x * aspectRatio}, ${center.y})`}>
                  {planets.map((pName, pIdx) => {
                    const info = getPlanetInfo(pName);
                    const isRetro = info?.is_retrograde;
                    const isCombust = info?.is_combust;
                    const pColor = PLANET_COLORS[pName] || "#334155";

                    const langMap = MULTILINGUAL_PLANET_ABBREV[activeLang] || MULTILINGUAL_PLANET_ABBREV["en"];
                    const displayName =
                      langMap[pName] ||
                      (pName === "Ascendant" ? "Asc" : pName.slice(0, 3));

                    const statusSuffix = `${isRetro ? "*" : ""}${isCombust ? "#" : ""}`;

                    // Degree calculation
                    let degreeStr = "";
                    if (showDegree && info && info.degree !== undefined) {
                      const normDeg = Number(info.degree) % 30;
                      const d = Math.floor(normDeg);
                      const m = Math.floor((normDeg - d) * 60);
                      degreeStr = `${d}°${m > 0 ? m + "'" : ""}`;
                    }

                    // Nakshatra calculation
                    let nakStr = "";
                    if (showNakshatra && info) {
                      const rawNak =
                        typeof info.nakshatra === "object"
                          ? info.nakshatra?.name
                          : info.nakshatra;
                      if (rawNak) {
                        nakStr =
                          lang === "hi"
                            ? NAKSHATRA_HINDI[rawNak] || rawNak.substring(0, 3)
                            : rawNak.substring(0, 3);
                      }
                    }

                    const yOffset = (pIdx - (totalPlanets - 1) / 2) * spacing;

                    // Dynamic font size depending on detail level
                    const fontSize = hasExtraInfo
                      ? totalPlanets > 3
                        ? "3.0"
                        : "3.4"
                      : totalPlanets > 3
                        ? "4.2"
                        : "4.6";

                    return (
                      <g
                        key={`${pName}-${pIdx}`}
                        transform={`translate(0, ${yOffset})`}
                        className="cursor-pointer hover:opacity-75 transition"
                        onClick={() => onPlanetClick?.(pName, hNum)}
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
                              fill="rgba(0, 0, 0, 1)"
                              fontSize={Number(fontSize) * 0.75}
                              fontWeight="normal"
                              dx="1"
                            >
                              {degreeStr}
                            </tspan>
                          )}
                          {nakStr && (
                            <tspan
                              fill="#000000ff"
                              fontSize={Number(fontSize) * 0.7}
                              fontWeight="medium"
                              dx="1"
                            >
                              ({nakStr})
                            </tspan>
                          )}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Talk To Astrologer Image Banner */}
      <div className="w-full max-w-[820px] mt-3 rounded-2xl overflow-hidden border border-amber-200/70 shadow-xs transition hover:shadow-md">
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
            className="w-full h-auto object-cover max-h-[110px] md:max-h-[200px] rounded-2xl hover:opacity-95 transition"
          />
        </a>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[12px] text-slate-500 mt-2 font-mono">
        <span>* = Vakri (Retrograde)</span>
        <span># = Asth (Combust)</span>
        <span>Asc = Lagna</span>
        <span>Format: Planet Degree (Nakshatra)</span>
      </div>
    </div>
  );
}
