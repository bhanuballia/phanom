import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, CheckCircle2, AlertTriangle, Layers, Info } from "lucide-react";
import { API_BASE_URL, PYTHON_ASTRO_URL } from '../services/api';

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
};

export default function HouseConjunctionAnalysis({ houses, translations, currentLang }) {
  const [conjunctions, setConjunctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [translatedTexts, setTranslatedTexts] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Helper localization functions
  const tp = (planet) => translations?.planets?.[planet] || planet;

  const parseConjunctionDetail = (detail) => {
    let good = [];
    let bad = [];

    let posText =
      detail.positiveDetail ||
      detail.positiveConjunction ||
      detail.positive_conjunction ||
      (detail.effectsDetail && detail.effectsDetail.positiveConjunction) ||
      (detail.effects && detail.effects.positiveConjunction) ||
      "";

    let negText =
      detail.negativeDetail ||
      detail.negativeConjunction ||
      detail.negative_conjunction ||
      (detail.effectsDetail && detail.effectsDetail.negativeConjunction) ||
      (detail.effects && detail.effects.negativeConjunction) ||
      "";

    // If neither is present, try fallback from description / interpretation / overview
    if (!posText && !negText) {
      let textToParse =
        detail.description ||
        detail.interpretation ||
        detail.results ||
        (Array.isArray(detail.overview) ? detail.overview.join(". ") : "") ||
        "";

      const sentences = textToParse.match(/[^.!?]+[.!?]+(\s+|$)/g) || [textToParse];
      let posSentences = [];
      let negSentences = [];

      sentences.forEach((s) => {
        const trimmed = s.trim();
        if (!trimmed) return;
        const lower = trimmed.toLowerCase();
        if (
          lower.includes("negative") ||
          lower.includes("bad") ||
          lower.includes("afflict") ||
          lower.includes("overthinking") ||
          lower.includes("anger") ||
          lower.includes("accident") ||
          lower.includes("struggle") ||
          lower.includes("loss") ||
          lower.includes("anxiety") ||
          lower.includes("deception") ||
          lower.includes("conflict") ||
          lower.includes("hinder") ||
          lower.includes("clash") ||
          lower.includes("ego") ||
          lower.includes("ritual") ||
          lower.includes("blindly") ||
          lower.includes("noise") ||
          lower.includes("problems") ||
          lower.includes("exaggeration") ||
          lower.includes("false")
        ) {
          negSentences.push(trimmed);
        } else if (
          lower.includes("positive") ||
          lower.includes("good") ||
          lower.includes("success") ||
          lower.includes("benefit") ||
          lower.includes("gain") ||
          lower.includes("bless") ||
          lower.includes("creative") ||
          lower.includes("wealth") ||
          lower.includes("intelligence") ||
          lower.includes("mind") ||
          lower.includes("spiritual") ||
          lower.includes("authority") ||
          lower.includes("logic") ||
          lower.includes("wisdom")
        ) {
          posSentences.push(trimmed);
        } else {
          posSentences.push(trimmed);
        }
      });

      posText = posSentences.join(" ");
      negText = negSentences.join(" ");
    }

    if (posText) {
      const sentences = posText.match(/[^.!?]+[.!?]+(\s+|$)/g) || [posText];
      sentences.forEach((s) => {
        const trimmed = s.trim();
        if (!trimmed) return;

        let label = "Strength";
        const lower = trimmed.toLowerCase();
        if (lower.includes("mind") || lower.includes("think") || lower.includes("intellect") || lower.includes("logic")) {
          label = "Sharp Mind";
        } else if (lower.includes("success") || lower.includes("fortune") || lower.includes("wealth") || lower.includes("gain") || lower.includes("rich")) {
          label = "Big Successes";
        } else if (lower.includes("foreign") || lower.includes("travel") || lower.includes("abroad") || lower.includes("culture") || lower.includes("birthplace") || lower.includes("connection")) {
          label = "Foreign Connections";
        } else if (lower.includes("speech") || lower.includes("speak") || lower.includes("express") || lower.includes("eloquent")) {
          label = "Eloquent Expression";
        } else if (lower.includes("lead") || lower.includes("authority") || lower.includes("power") || lower.includes("ruler")) {
          label = "Leadership Authority";
        } else if (lower.includes("spiritual") || lower.includes("god") || lower.includes("faith") || lower.includes("wise") || lower.includes("wisdom")) {
          label = "Spiritual Wisdom";
        }
        good.push({ label, text: trimmed });
      });
    }

    if (negText) {
      const sentences = negText.match(/[^.!?]+[.!?]+(\s+|$)/g) || [negText];
      sentences.forEach((s) => {
        const trimmed = s.trim();
        if (!trimmed) return;

        let label = "Challenge";
        const lower = trimmed.toLowerCase();
        if (lower.includes("faith") || lower.includes("religion") || lower.includes("ritual") || lower.includes("teachings") || lower.includes("blindly")) {
          label = "Questioning Faith";
        } else if (lower.includes("overthinking") || lower.includes("worry") || lower.includes("mental noise") || lower.includes("noise") || lower.includes("confused")) {
          label = "Overthinking";
        } else if (lower.includes("anger") || lower.includes("temper") || lower.includes("aggression") || lower.includes("fight")) {
          label = "Anger & Aggression";
        } else if (lower.includes("health") || lower.includes("disease") || lower.includes("accident") || lower.includes("pain")) {
          label = "Health Risks";
        } else if (lower.includes("cheat") || lower.includes("deception") || lower.includes("lie") || lower.includes("dishonest")) {
          label = "Risk of Deception";
        } else if (lower.includes("clash") || lower.includes("egotism") || lower.includes("ego") || lower.includes("proud")) {
          label = "Ego Clashes";
        }
        bad.push({ label, text: trimmed });
      });
    }

    return { good, bad, rawOverview: detail.overview || [] };
  };

  useEffect(() => {
    if (!houses) return;

    const detected = [];
    Object.keys(houses).forEach((houseNum) => {
      const houseData = houses[houseNum];
      const planets = houseData.planets || [];
      const cleanPlanets = planets
        .map((p) => {
          if (!p) return null;
          if (typeof p === "object") {
            return p.planet || p.name;
          }
          return p;
        })
        .filter(
          (p) =>
            p &&
            p !== "Ascendant" &&
            p !== "Lagna" &&
            p !== "L" &&
            !p.toLowerCase().includes("mandi") &&
            !p.toLowerCase().includes("gulika")
        );

      if (cleanPlanets.length >= 2 && cleanPlanets.length <= 4) {
        detected.push({
          house: houseNum,
          planets: cleanPlanets,
        });
      }
    });

    if (detected.length > 0) {
      setLoading(true);
      Promise.all(
        detected.map(async (conj) => {
          try {
            let url = "";
            const baseUrl = PYTHON_ASTRO_URL.includes('/api/kundali') ? PYTHON_ASTRO_URL : `${PYTHON_ASTRO_URL}/api`;
            if (conj.planets.length === 2) {
              url = `${baseUrl}/api/conjunction/detail/${conj.planets[0]}/${conj.planets[1]}`;
            } else if (conj.planets.length === 3) {
              url = `${baseUrl}/api/conjunction/triple/detail/${conj.planets[0]}/${conj.planets[1]}/${conj.planets[2]}`;
            } else if (conj.planets.length === 4) {
              url = `${baseUrl}/api/conjunction/four/detail/${conj.planets[0]}/${conj.planets[1]}/${conj.planets[2]}/${conj.planets[3]}`;
            }

            if (!url) return null;

            const res = await axios.get(url);
            if (res.data) {
              return { ...conj, detail: res.data };
            }
          } catch (err) {
            console.error(`Failed to fetch conjunction for ${conj.planets.join("-")}`, err);
          }
          return null;
        })
      ).then((results) => {
        setConjunctions(results.filter((r) => r !== null));
        setLoading(false);
      });
    } else {
      setConjunctions([]);
    }
  }, [houses]);

  // Dynamic batch translation for conjunction texts
  useEffect(() => {
    if (!currentLang || currentLang === 'en' || conjunctions.length === 0) {
      setTranslatedTexts({});
      return;
    }

    const localCacheKey = `astro_conjunction_interp_${currentLang}`;
    const cached = localStorage.getItem(localCacheKey);
    let cachedMap = {};
    if (cached) {
      try {
        cachedMap = JSON.parse(cached);
        if (cachedMap && typeof cachedMap === 'object') {
          setTranslatedTexts(cachedMap);
        }
      } catch (e) {}
    } else {
      setTranslatedTexts({});
    }

    // Collect all texts that need translation
    const itemsToTranslate = [];
    conjunctions.forEach((conj) => {
      const conjKey = conj.planets.join("-");
      const parsed = parseConjunctionDetail(conj.detail);

      // Overviews
      if (Array.isArray(conj.detail?.overview)) {
        conj.detail.overview.forEach((ov, idx) => {
          itemsToTranslate.push({
            key: `${conjKey}_ov_${idx}`,
            text: ov
          });
        });
      }

      // Good points
      parsed.good.forEach((item, idx) => {
        itemsToTranslate.push({
          key: `${conjKey}_good_lbl_${idx}`,
          text: item.label
        });
        itemsToTranslate.push({
          key: `${conjKey}_good_txt_${idx}`,
          text: item.text
        });
      });

      // Bad points
      parsed.bad.forEach((item, idx) => {
        itemsToTranslate.push({
          key: `${conjKey}_bad_lbl_${idx}`,
          text: item.label
        });
        itemsToTranslate.push({
          key: `${conjKey}_bad_txt_${idx}`,
          text: item.text
        });
      });
    });

    if (itemsToTranslate.length === 0) return;

    let isMounted = true;
    setIsTranslating(true);

    axios.post(`${API_BASE_URL}/translate/conjunction-interpretations`, {
      targetLang: currentLang,
      targetLangName: translations?.langName || currentLang,
      items: itemsToTranslate
    }).then((res) => {
      if (isMounted && res.data?.success && res.data?.translations) {
        setTranslatedTexts((prev) => {
          const merged = { ...prev, ...res.data.translations };
          try {
            localStorage.setItem(localCacheKey, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    }).catch((err) => {
      console.warn("Conjunction interpretation translation request error:", err.message);
    }).finally(() => {
      if (isMounted) setIsTranslating(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentLang, conjunctions.length]);

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
        <div className="text-xs text-slate-500 font-medium">
          {translations?.ui?.exploringConjunctions || "Exploring House Conjunctions in D1 Rasi Chart..."}
        </div>
      </div>
    );
  }

  if (conjunctions.length === 0) {
    return null;
  }

  const sectionTitle = translations?.ui?.conjunctionSectionTitle || "House Conjunction Analysis";
  const sectionSubtitle = translations?.ui?.conjunctionSectionSubtitle || "Diagnostic Pairing & Multi-Planet Yuti Insights";
  const activeLabel = conjunctions.length === 1 
    ? (translations?.ui?.conjunctionActive || "Conjunction Active") 
    : (translations?.ui?.conjunctionsActive || "Conjunctions Active");
  const planetYutiSuffix = translations?.ui?.planetYuti || "Planet Yuti";
  const bhavaResonanceText = translations?.ui?.bhavaResonance || "द्वादश भाव संयोग";
  const coreOverviewTitle = translations?.ui?.coreOverviewTitle || "Core Overview & Principle";
  const theGoodTitle = translations?.ui?.theGoodTitle || "The Good Analysis of Conjunction (सकारात्मक प्रभाव)";
  const theBadTitle = translations?.ui?.theBadTitle || "The Bad Analysis of Conjunction (चुनौतियां एवं सावधानियां)";

  return (
    <section id="section-house-conjunction-analysis" className="space-y-6 scroll-mt-24">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-rose-50 border border-rose-200/80 p-4 rounded-2xl flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-rose-700 rounded-2xl flex items-center justify-center text-xl shadow-md border border-white/20 text-white">
            💠
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-serif uppercase flex items-center gap-2 flex-wrap">
              <span>{sectionTitle}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white text-rose-800 font-sans font-bold normal-case border border-rose-200">
                {conjunctions.length} {activeLabel}
              </span>
            </h2>
            <p className="text-xs font-bold text-rose-800 uppercase tracking-widest mt-0.5">
              {sectionSubtitle}
            </p>
          </div>
        </div>

        {isTranslating && (
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 bg-white/80 px-3 py-1.5 rounded-full border border-rose-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            <span>{translations?.ui?.translating || "Translating Yuti insights..."}</span>
          </div>
        )}
      </div>

      {/* List of Detected Conjunctions */}
      <div className="space-y-6">
        {conjunctions.map((conj, idx) => {
          const conjKey = conj.planets.join("-");
          const parsed = parseConjunctionDetail(conj.detail);

          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Title Bar */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg border border-white/10">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-wide flex items-center gap-2 flex-wrap">
                      {conj.planets.map((p, pIdx) => (
                        <span key={pIdx} className="flex items-center">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full mr-1.5"
                            style={{ backgroundColor: PLANET_COLORS[p] || "#818cf8" }}
                          ></span>
                          <span>{tp(p)}</span>
                          {pIdx < conj.planets.length - 1 && (
                            <span className="text-slate-400 mx-2 font-normal">+</span>
                          )}
                        </span>
                      ))}
                    </h3>
                    <div className="text-[11px] text-indigo-200/80 font-medium">
                      {translations?.ui?.houseLabel || "House"} {conj.house} Resonance ({bhavaResonanceText})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono font-bold text-indigo-200 border border-white/10">
                    {translations?.ui?.houseLabel || "House"} {conj.house}
                  </span>
                  <span className="px-3 py-1 bg-indigo-500/20 rounded-full text-xs font-bold text-indigo-300 border border-indigo-400/30">
                    {conj.planets.length}-{planetYutiSuffix}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-6 relative">
                {/* Background House Watermark */}
                <div className="absolute top-2 right-4 opacity-[0.04] text-9xl font-black text-indigo-950 pointer-events-none select-none">
                  {conj.house}
                </div>

                {/* Overview Insights if available */}
                {Array.isArray(conj.detail?.overview) && conj.detail.overview.length > 0 && (
                  <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/80 space-y-2.5">
                    <div className="text-sm font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                      <Info className="w-4 h-4 text-indigo-700" />
                      {coreOverviewTitle}
                    </div>
                    <ul className="text-sm text-slate-900 space-y-2 pl-2">
                      {conj.detail.overview.map((item, oIdx) => {
                        const translatedOverview = translatedTexts[`${conjKey}_ov_${oIdx}`] || item;
                        return (
                          <li key={oIdx} className="flex items-start gap-2.5">
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                            <span className="leading-relaxed font-normal">{translatedOverview}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* The Good Section */}
                {parsed.good.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                      {theGoodTitle}
                    </h4>
                    <div className="space-y-3 pl-2">
                      {parsed.good.map((item, gIdx) => {
                        const trLabel = translatedTexts[`${conjKey}_good_lbl_${gIdx}`] || item.label;
                        const trText = translatedTexts[`${conjKey}_good_txt_${gIdx}`] || item.text;
                        return (
                          <div
                            key={gIdx}
                            className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 text-sm md:text-base text-slate-950 leading-relaxed font-sans"
                          >
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-emerald-950 mr-2 text-base">{trLabel}:</span>
                              <span className="font-normal">{trText}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* The Bad Section */}
                {parsed.bad.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-black text-rose-800 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
                      {theBadTitle}
                    </h4>
                    <div className="space-y-3 pl-2">
                      {parsed.bad.map((item, bIdx) => {
                        const trLabel = translatedTexts[`${conjKey}_bad_lbl_${bIdx}`] || item.label;
                        const trText = translatedTexts[`${conjKey}_bad_txt_${bIdx}`] || item.text;
                        return (
                          <div
                            key={bIdx}
                            className="flex items-start gap-3 p-4 rounded-xl bg-rose-50/40 border border-rose-100 text-sm md:text-base text-slate-950 leading-relaxed font-sans"
                          >
                            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-rose-950 mr-2 text-base">{trLabel}:</span>
                              <span className="font-normal">{trText}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
