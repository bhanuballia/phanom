import React, { useState, useEffect } from "react";
import axios from "axios";
import { INDRACHAPA_HOUSE_EFFECTS } from "../data/indrachapaData";
import { Zap, Wind, Compass, Sparkles } from "lucide-react";
import { API_BASE_URL } from "../services/api";

export default function IndrachapaAnalysis({ indrachapa, translations, currentLang }) {
  if (!indrachapa || !indrachapa.house) {
    return null;
  }

  const houseData = INDRACHAPA_HOUSE_EFFECTS[indrachapa.house];
  if (!houseData) return null;

  const isUpachaya = [3, 6, 10, 11].includes(indrachapa.house);

  const [translatedData, setTranslatedData] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Localization helper for signs
  const ts = (sign) => translations?.signs?.[sign] || sign;

  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setTranslatedData(null);
      return;
    }

    const localCacheKey = `astro_indrachapa_interp_${currentLang}`;
    const cached = localStorage.getItem(localCacheKey);
    let cachedMap = {};
    if (cached) {
      try {
        cachedMap = JSON.parse(cached);
        if (cachedMap && cachedMap[indrachapa.house]) {
          setTranslatedData(cachedMap[indrachapa.house]);
        }
      } catch (e) {}
    }

    if (cachedMap && cachedMap[indrachapa.house]) return;

    let isMounted = true;
    setIsTranslating(true);

    axios.post(`${API_BASE_URL}/translate/indrachapa-interpretations`, {
      targetLang: currentLang,
      targetLangName: translations?.langName || currentLang,
      items: [
        {
          key: String(indrachapa.house),
          title: houseData.title,
          effect: houseData.effect
        }
      ]
    }).then((res) => {
      if (isMounted && res.data?.success && res.data?.translations?.[indrachapa.house]) {
        const item = res.data.translations[indrachapa.house];
        setTranslatedData(item);
        try {
          const updated = { ...cachedMap, [indrachapa.house]: item };
          localStorage.setItem(localCacheKey, JSON.stringify(updated));
        } catch (e) {}
      }
    }).catch((err) => {
      console.warn("Indrachapa translation request error:", err.message);
    }).finally(() => {
      if (isMounted) setIsTranslating(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentLang, indrachapa.house]);

  const displayTitle = translatedData?.title || houseData.title;
  const displayEffect = translatedData?.effect || houseData.effect;

  const sectionTitle = translations?.ui?.indrachapaTitle || "Indrachapa (Kodanda) Analysis";
  const indrachapaBadge = translations?.ui?.indrachapaBadge || "Aprakasha Graha (इंद्रचाप कोदंड)";
  const sectionSubtitle = translations?.ui?.indrachapaSubtitle || "Mysterious Rainbow Bow Planet of Illusions & Sudden Strikes (इंद्रधनुष विचार)";
  const residingBhavaLabel = translations?.ui?.residingBhava || "Residing Bhava";
  const rasiLabel = translations?.ui?.upaketuRasi || "Rasi";
  const longitudeLabel = translations?.ui?.upaketuLongitude || "Longitude";
  const houseTypeLabel = translations?.ui?.houseTypeLabel || "House Type";
  const houseTypeVal = isUpachaya 
    ? (translations?.ui?.upaketuUpachayaType || "Upachaya (उपाचय पराक्रम)") 
    : (translations?.ui?.standardBhava || "Standard Bhava");
  const classicalRuleText = translations?.ui?.indrachapaClassicalRule || "Classical Parashara: Indrachapa (Kodanda) acts as the celestial bow producing sudden flashes of destiny.";
  const headerCardTitle = isUpachaya 
    ? (translations?.ui?.indrachapaUpachayaHeader || "Sudden Rise & Strategic Illusions") 
    : (translations?.ui?.indrachapaNonUpachayaHeader || "Mysterious Events & Mirages");
  const bhavaResonanceTag = translations?.ui?.bhavaResonanceTag || "Resonance";
  const classicalGuidanceLabel = translations?.ui?.upaketuClassicalGuidance || "Classical Guidance";
  const classicalGuidanceText = isUpachaya 
    ? (translations?.ui?.indrachapaUpachayaGuidance || "Employs strategic brilliance and sudden breakthroughs to seize high positions and defeat adversities.") 
    : (translations?.ui?.indrachapaNonUpachayaGuidance || "Stay grounded and avoid falling for mirages or speculative get-rich-quick schemes; verify truth before trusting.");

  return (
    <section id="section-indrachapa-analysis" className="space-y-6 scroll-mt-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-rose-50 border border-rose-200/80 p-4 rounded-2xl flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md border border-white/20 text-white bg-indigo-900">
            🌩️
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-serif uppercase flex items-center gap-2 flex-wrap">
              <span>{sectionTitle}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-bold normal-case bg-white text-rose-800 border border-rose-200">
                {indrachapaBadge}
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
            <span>{translations?.ui?.translating || "Translating insights..."}</span>
          </div>
        )}
      </div>

      {/* Main Analysis Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Placement Info Card */}
        <div className="md:col-span-4 lg:col-span-3">
          <div
            className={`rounded-3xl p-6 border shadow-sm relative overflow-hidden h-full flex flex-col justify-between ${
              isUpachaya
                ? "bg-gradient-to-br from-indigo-50 via-violet-50/70 to-indigo-100/40 border-violet-200/80"
                : "bg-gradient-to-br from-violet-50 via-purple-100/50 to-indigo-50/40 border-purple-200"
            }`}
          >
            <div
              className={`absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40 ${
                isUpachaya ? "bg-indigo-300" : "bg-purple-300"
              }`}
            ></div>

            <div className="relative z-10 space-y-4">
              <div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${
                    isUpachaya ? "text-indigo-700" : "text-purple-800"
                  }`}
                >
                  {residingBhavaLabel}
                </span>
                <div className="text-2xl lg:text-3xl font-black text-slate-900 font-serif leading-tight">
                  {displayTitle}
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-purple-200/60 shadow-xs">
                  <Compass className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>
                    <strong className="text-slate-900">{rasiLabel}:</strong> {ts(indrachapa.sign_name) || `${translations?.ui?.signLabel || "Sign"} ${indrachapa.sign}`}
                  </span>
                </div>

                {indrachapa.lon !== undefined && (
                  <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-purple-200/60 shadow-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      <strong className="text-slate-900">{longitudeLabel}:</strong> {typeof indrachapa.lon === 'number' ? indrachapa.lon.toFixed(2) : indrachapa.lon}°
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-purple-200/60 shadow-xs">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isUpachaya ? "bg-indigo-500" : "bg-purple-700"
                    }`}
                  ></span>
                  <span>
                    <strong className="text-slate-900">{houseTypeLabel}:</strong>{" "}
                    {houseTypeVal}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-200/60 text-[11px] text-purple-900/80 italic font-medium">
              {classicalRuleText}
            </div>
          </div>
        </div>

        {/* Narrative & Karmic Effects */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
            <div
              className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${
                isUpachaya ? "from-indigo-400 via-violet-500 to-violet-700" : "from-violet-500 via-purple-600 to-purple-900"
              }`}
            ></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  {isUpachaya ? (
                    <Zap className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Wind className="w-5 h-5 text-purple-600" />
                  )}
                  {headerCardTitle}
                </h3>
                <span
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${
                    isUpachaya
                      ? "text-indigo-900 bg-indigo-100 border-indigo-300"
                      : "text-purple-900 bg-purple-100 border-purple-300"
                  }`}
                >
                  {translations?.ui?.houseLabel || "Bhava"} {indrachapa.house} {bhavaResonanceTag}
                </span>
              </div>

              <p className="text-slate-950 font-normal leading-relaxed text-base md:text-lg font-sans">
                {displayEffect}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-sm text-slate-700">
              <span className="font-bold text-slate-900">{classicalGuidanceLabel}:</span>
              <span>
                {classicalGuidanceText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
