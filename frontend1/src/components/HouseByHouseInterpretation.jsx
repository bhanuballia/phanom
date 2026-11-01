import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../services/api";
import {
  SUN_HOUSE_INTERPRETATIONS,
  MARS_HOUSE_INTERPRETATIONS,
  MERCURY_HOUSE_INTERPRETATIONS,
  VENUS_HOUSE_INTERPRETATIONS,
  MOON_HOUSE_INTERPRETATIONS,
  JUPITER_HOUSE_INTERPRETATIONS,
  RAHU_HOUSE_INTERPRETATIONS,
  KETU_HOUSE_INTERPRETATIONS,
  SATURN_HOUSE_INTERPRETATIONS,
} from "../data/houseInterpretations";

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

const BulletInterpretation = ({ text, colorClass = "text-slate-800" }) => {
  if (!text) return null;
  const points = text.split(/(?<=\.)\s+|\n+/).filter((p) => p.trim());
  return (
    <ul className="space-y-3 relative z-10">
      {points.map((point, i) => (
        <li key={i} className="flex gap-3 items-start group/point">
          <span
            className={`mt-2.5 w-2 h-2 rounded-full shrink-0 ${colorClass.replace(
              "text-",
              "bg-"
            )} opacity-60 group-hover/point:opacity-100 transition-opacity`}
          ></span>
          <span className="text-base text-slate-950 font-normal leading-relaxed font-sans">
            {point.trim()}
          </span>
        </li>
      ))}
    </ul>
  );
};

const parseInterpretationString = (text, translations, status = "neutral") => {
  if (!text) return { general: "", positive: "", negative: "", neutral: "" };
  if (typeof text === "object") return text;

  const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)/g) || [text];

  let general = [];
  let positive = [];
  let negative = [];
  let neutral = [];

  sentences.forEach((sentence) => {
    const s = sentence.trim();
    if (!s) return;
    const lower = s.toLowerCase();

    if (
      lower.includes("positive") ||
      lower.includes("well-placed") ||
      lower.includes("favorable") ||
      lower.includes("gains") ||
      lower.includes("blesses you") ||
      lower.includes("benefit") ||
      lower.includes("सकारात्मक") ||
      lower.includes("शुभ") ||
      lower.includes("நன்மை") ||
      lower.includes("சுப") ||
      lower.includes("மஞ்சி") ||
      lower.includes("లాభం")
    ) {
      positive.push(s);
    } else if (
      lower.includes("afflicted") ||
      lower.includes("negative") ||
      lower.includes("unfavorable") ||
      lower.includes("combust") ||
      lower.includes("retrograde") ||
      lower.includes("isolation") ||
      lower.includes("depression") ||
      lower.includes("discord") ||
      lower.includes("harms") ||
      lower.includes("losses") ||
      lower.includes("challenges") ||
      lower.includes("hurdles") ||
      lower.includes("problems") ||
      lower.includes("illness") ||
      lower.includes("accidents") ||
      lower.includes("disappointment") ||
      lower.includes("anxiety") ||
      lower.includes("fear") ||
      lower.includes("struggle") ||
      lower.includes("नकारात्मक") ||
      lower.includes("हानि") ||
      lower.includes("कठिनाई") ||
      lower.includes("சவால்") ||
      lower.includes("கஷ்டம்") ||
      lower.includes("அசுப") ||
      lower.includes("சவாலான") ||
      lower.includes("సవాలు")
    ) {
      negative.push(s);
    } else if (
      lower.includes("neutral") ||
      lower.includes("average") ||
      lower.includes("moderate") ||
      lower.includes("typical") ||
      lower.includes("balanced") ||
      lower.includes("सामान्य") ||
      lower.includes("சமம்") ||
      lower.includes("சம பலன்") ||
      lower.includes("நிலையான") ||
      lower.includes("సమ")
    ) {
      neutral.push(s);
    } else {
      general.push(s);
    }
  });

  const defaultPositive = translations?.ui?.positiveManifestDesc || translations?.ui?.positiveManifest || "Constructive and favorable alignment qualities manifest standard positive energy.";
  const defaultNegative = translations?.ui?.negativeManifestDesc || translations?.ui?.negativeManifest || "Afflictions or imbalances can trigger standard blockages and challenges.";
  const defaultNeutral = translations?.ui?.neutralManifestDesc || 
    (translations?.ui?.neutralManifest && translations.ui.neutralManifest !== "சம பலன்" && translations.ui.neutralManifest !== "Neutral" 
      ? translations.ui.neutralManifest 
      : (translations?.lang === 'ta' 
          ? "சமச்சீரான கிரக அமைப்பானது ஜாதகருக்கு சீரான முடிவுகளையும், மிதமான நற்பலன்களையும் நிலைநிறுத்துகிறது." 
          : "Balanced placement qualities manifest steady, moderate influence and progressive equilibrium."));

  return {
    general: general.join(" ") || text,
    positive: positive.join(" ") || defaultPositive,
    negative: negative.join(" ") || defaultNegative,
    neutral: neutral.join(" ") || defaultNeutral,
  };
};

const calculatePlanetEffects = (reportData) => {
  const effects = {};
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

  let lagnaSignIndex = 0;
  const lagnaHouse = reportData?.charts?.houses?.[1] || reportData?.charts?.houses?.["1"];
  if (lagnaHouse) {
    lagnaSignIndex =
      lagnaHouse.sign_index !== undefined
        ? lagnaHouse.sign_index
        : Math.floor(lagnaHouse.cusp_deg / 30);
  } else if (reportData?.charts?.ascendant_sign_index !== undefined) {
    lagnaSignIndex = reportData.charts.ascendant_sign_index;
  }

  const lagnaMap = {
    0: { benefic: ["Sun", "Moon", "Mars", "Jupiter"], malefic: ["Mercury", "Venus", "Saturn"] },
    1: { benefic: ["Sun", "Mercury", "Saturn", "Mars"], malefic: ["Moon", "Jupiter", "Venus"] },
    2: { benefic: ["Venus"], malefic: ["Sun", "Mars", "Jupiter"] },
    3: { benefic: ["Moon", "Mars", "Jupiter"], malefic: ["Mercury", "Venus", "Saturn"] },
    4: { benefic: ["Sun", "Mars", "Jupiter"], malefic: ["Moon", "Mercury", "Venus", "Saturn"] },
    5: { benefic: ["Venus"], malefic: ["Moon", "Mars", "Jupiter"] },
    6: { benefic: ["Mercury", "Saturn", "Venus"], malefic: ["Sun", "Moon", "Mars", "Jupiter"] },
    7: { benefic: ["Moon", "Sun", "Jupiter"], malefic: ["Mercury", "Venus", "Saturn"] },
    8: { benefic: ["Sun", "Mars"], malefic: ["Venus", "Saturn", "Mercury"] },
    9: { benefic: ["Mercury", "Venus", "Saturn"], malefic: ["Moon", "Mars", "Jupiter"] },
    10: { benefic: ["Venus", "Saturn", "Mars"], malefic: ["Moon", "Jupiter"] },
    11: { benefic: ["Moon", "Mars", "Jupiter"], malefic: ["Sun", "Venus", "Saturn"] },
  };

  const lagnaData = lagnaMap[lagnaSignIndex] || { benefic: [], malefic: [] };

  planets.forEach((p) => {
    if (p === "Rahu" || p === "Ketu") {
      effects[p] = "negative";
    } else if (lagnaData.benefic.includes(p)) {
      effects[p] = "positive";
    } else if (lagnaData.malefic.includes(p)) {
      effects[p] = "negative";
    } else {
      effects[p] = "neutral";
    }
  });

  effects["Ascendant"] = "neutral";
  return effects;
};

export default function HouseByHouseInterpretation({ reportData, translations, currentLang }) {
  if (!reportData) return null;

  const positions = reportData.planet_positions || [];
  const planetEffects = calculatePlanetEffects(reportData);

  const interpMap = {
    Sun: SUN_HOUSE_INTERPRETATIONS,
    Moon: MOON_HOUSE_INTERPRETATIONS,
    Mars: MARS_HOUSE_INTERPRETATIONS,
    Mercury: MERCURY_HOUSE_INTERPRETATIONS,
    Jupiter: JUPITER_HOUSE_INTERPRETATIONS,
    Venus: VENUS_HOUSE_INTERPRETATIONS,
    Saturn: SATURN_HOUSE_INTERPRETATIONS,
    Rahu: RAHU_HOUSE_INTERPRETATIONS,
    Ketu: KETU_HOUSE_INTERPRETATIONS,
  };

  const eligiblePlanets = positions.filter((p) => interpMap[p.planet]);

  // Translation state for house interpretation paragraphs
  const [translatedTexts, setTranslatedTexts] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setTranslatedTexts({});
      return;
    }

    // Reset immediately to avoid displaying stale language from a previous selection
    let initialTexts = {};

    // Check local storage cache for house interpretations
    const localCacheKey = `astro_house_interp_${currentLang}`;
    const cached = localStorage.getItem(localCacheKey);
    let cachedMap = {};
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          // Verify that cached items aren't raw English text if user selected non-English
          const sampleKey = Object.keys(parsed)[0];
          const sampleText = sampleKey ? parsed[sampleKey] : '';
          const hasEnglishWords = /^(The |Sun |Moon |Mars |Mercury |Jupiter |Venus |Saturn |Rahu |Ketu )/i.test(sampleText);
          if (currentLang !== 'en' && hasEnglishWords) {
            localStorage.removeItem(localCacheKey);
          } else {
            cachedMap = parsed;
            setTranslatedTexts(parsed);
          }
        }
      } catch (e) {}
    } else {
      setTranslatedTexts({});
    }

    // Prepare items to translate
    const allItems = eligiblePlanets.map((p) => {
      const origText = interpMap[p.planet]?.[p.house];
      return {
        key: `${p.planet}_${p.house}`,
        text: origText || ""
      };
    }).filter((it) => it.text);

    if (allItems.length === 0) return;

    // Check if any items are missing from cache
    const missingItems = allItems.filter(it => !cachedMap[it.key]);
    if (missingItems.length === 0) {
      setTranslatedTexts(cachedMap);
      return;
    }

    let isMounted = true;
    setIsTranslating(true);

    axios.post(`${API_BASE_URL}/translate/house-interpretations`, {
      targetLang: currentLang,
      targetLangName: translations?.langName || currentLang,
      items: allItems
    }).then((res) => {
      if (isMounted && res.data?.success && res.data?.translations) {
        setTranslatedTexts((prev) => {
          const merged = { ...prev, ...cachedMap, ...res.data.translations };
          try {
            localStorage.setItem(localCacheKey, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    }).catch((err) => {
      console.warn("House interpretation translation request error:", err.message);
    }).finally(() => {
      if (isMounted) setIsTranslating(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentLang, eligiblePlanets.length, translations?.langName]);

  // Localization helper functions
  const tp = (planet) => translations?.planets?.[planet] || planet;
  const ts = (sign) => translations?.signs?.[sign] || sign;

  const headerTitle = translations?.ui?.houseInterpTitle || "House-by-House Interpretations";
  const headerSubtitle = translations?.ui?.houseInterpSubtitle || "Lagna Chart Placements & Diagnostic Results (भावगत ग्रह फल)";
  const placementLabel = translations?.ui?.housePlacement || "Placement";
  const analysisLabel = translations?.ui?.houseAnalysis || "Analysis";
  const manifestSuffix = translations?.ui?.manifestationSuffix || "Manifestation";
  const manifestAnalysisTitle = translations?.ui?.manifestationAnalysis || "Manifestation Analysis";

  const getStatusBadgeLabel = (status) => {
    if (status === "positive") return translations?.ui?.positiveManifest || "Positive Manifestation";
    if (status === "negative") return translations?.ui?.negativeManifest || "Challenging Manifestation";
    return translations?.ui?.neutralManifest || "Neutral Manifestation";
  };

  const getStatusAnalysisHeader = (status) => {
    if (status === "positive") return translations?.ui?.positiveManifestAnalysis || (translations?.ui?.positiveManifest ? `${translations.ui.positiveManifest} ${manifestAnalysisTitle}` : "Positive Manifestation Analysis");
    if (status === "negative") return translations?.ui?.negativeManifestAnalysis || (translations?.ui?.negativeManifest ? `${translations.ui.negativeManifest} ${manifestAnalysisTitle}` : "Challenging Manifestation Analysis");
    return translations?.ui?.neutralManifestAnalysis || (translations?.ui?.neutralManifest ? `${translations.ui.neutralManifest} ${manifestAnalysisTitle}` : "Neutral Manifestation Analysis");
  };

  return (
    <section id="section-house-interpretation" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-8 scroll-mt-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-3.5 bg-rose-50 border border-rose-200/80 p-4 rounded-2xl flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-rose-800 rounded-xl flex items-center justify-center text-xl text-white shadow-md">
            📖
          </div>
          <div>
            <h2 className="text-lg font-black font-serif text-slate-900 uppercase tracking-tight">
              {headerTitle}
            </h2>
            <div className="text-[10px] font-bold text-rose-800 uppercase tracking-widest mt-0.5">
              {headerSubtitle}
            </div>
          </div>
        </div>

        {isTranslating && (
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 bg-white/80 px-3 py-1.5 rounded-full border border-rose-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            <span>{translations?.ui?.translating || "Translating interpretations..."}</span>
          </div>
        )}
      </div>

      {/* List of Planet House Interpretations */}
      <div className="space-y-6">
        {eligiblePlanets.map((p) => {
          const itemKey = `${p.planet}_${p.house}`;
          const rawHouseData = interpMap[p.planet]?.[p.house];
          if (!rawHouseData) return null;

          // Use translated text if available in chosen language, otherwise fallback to original
          const effectiveHouseData = translatedTexts[itemKey] || rawHouseData;

          const status = planetEffects[p.planet] || "neutral";
          const parsedData =
            typeof effectiveHouseData === "object"
              ? effectiveHouseData
              : parseInterpretationString(effectiveHouseData, translations, status);
          const generalText = parsedData.general;
          const statusText = parsedData[status];

          const statusColor =
            status === "positive"
              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
              : status === "negative"
              ? "bg-rose-100 text-rose-800 border-rose-200"
              : "bg-amber-100 text-amber-800 border-amber-200";

          const statusBoxBg =
            status === "positive"
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
              : status === "negative"
              ? "bg-rose-50/70 border-rose-200 text-rose-950"
              : "bg-amber-50/70 border-amber-200 text-amber-950";

          return (
            <div
              key={p.planet}
              className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all shadow-xs relative overflow-hidden space-y-4"
            >
              {/* Background House Numeral watermark */}
              <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl font-black text-indigo-950 pointer-events-none">
                {p.house}
              </div>

              {/* Card Title Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-sm shadow-xs">
                    ✨
                  </div>
                  <div>
                    <h3
                      className="text-lg font-black uppercase tracking-tight flex items-center gap-1.5"
                      style={{ color: PLANET_COLORS[p.planet] || "#0f172a" }}
                    >
                      <span>
                        {tp(p.planet)}
                        {p.is_retrograde ? "*" : ""}
                        {p.is_combust ? "#" : ""} {placementLabel}
                      </span>
                    </h3>
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {translations?.ui?.houseLabel || "House"} {p.house} {analysisLabel} ({ts(p.sign) || "Rasi"} • {(p.degree % 30).toFixed(2)}°)
                    </div>
                  </div>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${statusColor} shadow-2xs`}
                >
                  {getStatusBadgeLabel(status)}
                </span>
              </div>

              {/* General Core Reading */}
              {generalText && (
                <div className="pt-2">
                  <BulletInterpretation text={generalText} colorClass="text-slate-900" />
                </div>
              )}

              {/* Status Specific Manifestation Box */}
              {statusText && (
                <div className={`p-5 rounded-2xl border ${statusBoxBg} mt-3`}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-90 flex items-center gap-1.5">
                    <span>⚡</span> {getStatusAnalysisHeader(status)}
                  </div>
                  <BulletInterpretation
                    text={statusText}
                    colorClass={
                      status === "positive"
                        ? "text-emerald-950"
                        : status === "negative"
                        ? "text-rose-950"
                        : "text-amber-950"
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
