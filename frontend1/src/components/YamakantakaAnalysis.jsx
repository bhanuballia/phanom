import React, { useState, useEffect } from "react";
import axios from "axios";
import { YAMAKANTAKA_HOUSE_EFFECTS } from "../data/yamakantakaData";
import { Sparkles, Shield, Clock, Compass } from "lucide-react";
import { API_BASE_URL } from "../services/api";

export default function YamakantakaAnalysis({ yamakantaka, translations, currentLang }) {
  if (!yamakantaka || !yamakantaka.house) return null;

  const houseData = YAMAKANTAKA_HOUSE_EFFECTS[yamakantaka.house];
  if (!houseData) return null;

  const [translatedData, setTranslatedData] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Localization helpers
  const ts = (sign) => translations?.signs?.[sign] || sign;

  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setTranslatedData(null);
      return;
    }

    const localCacheKey = `astro_yamakantaka_interp_${currentLang}`;
    const cached = localStorage.getItem(localCacheKey);
    let cachedMap = {};
    if (cached) {
      try {
        cachedMap = JSON.parse(cached);
        if (cachedMap && cachedMap[yamakantaka.house]) {
          setTranslatedData(cachedMap[yamakantaka.house]);
        }
      } catch (e) {}
    }

    if (cachedMap && cachedMap[yamakantaka.house]) return;

    let isMounted = true;
    setIsTranslating(true);

    axios.post(`${API_BASE_URL}/translate/yamakantaka-interpretations`, {
      targetLang: currentLang,
      targetLangName: translations?.langName || currentLang,
      items: [
        {
          key: String(yamakantaka.house),
          title: houseData.title,
          effect: houseData.effect
        }
      ]
    }).then((res) => {
      if (isMounted && res.data?.success && res.data?.translations?.[yamakantaka.house]) {
        const item = res.data.translations[yamakantaka.house];
        setTranslatedData(item);
        try {
          const updated = { ...cachedMap, [yamakantaka.house]: item };
          localStorage.setItem(localCacheKey, JSON.stringify(updated));
        } catch (e) {}
      }
    }).catch((err) => {
      console.warn("Yamakantaka translation request error:", err.message);
    }).finally(() => {
      if (isMounted) setIsTranslating(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentLang, yamakantaka.house]);

  const displayTitle = translatedData?.title || houseData.title;
  const displayEffect = translatedData?.effect || houseData.effect;

  const sectionTitle = translations?.ui?.yamakantakaTitle || "Yamakantaka Analysis";
  const sectionSubtitle = translations?.ui?.yamakantakaSubtitle || "The Protective Grace & Auspicious Sub-Planet Shield (यमकंटक विचार)";
  const jupiterUpagrahaTag = translations?.ui?.jupiterUpagraha || "Jupiter's Upagraha";
  const residingBhavaLabel = translations?.ui?.residingBhava || "Residing Bhava";
  const riseTimeLabel = translations?.ui?.riseTime || "Rise Time";
  const natureLabel = translations?.ui?.natureLabel || "Nature";
  const natureAuspiciousText = translations?.ui?.natureAuspicious || "Auspicious (शुभ उपग्रह)";
  const classicalParasharaRef = translations?.ui?.classicalParasharaRef || "Classical Parashara: Upagraha linked with Guru's divine radiation.";
  const protectiveEffectsTitle = translations?.ui?.protectiveEffectsTitle || "Protective Effects & Classical Blessings";
  const bhavaResonanceTag = translations?.ui?.bhavaResonanceTag || "Resonance";
  const divineShieldLabel = translations?.ui?.divineShieldLabel || "Divine Shield";
  const divineShieldDesc = translations?.ui?.divineShieldDesc || "Protects the signified house from severe malefic afflictions and bestows benevolent expansion.";

  return (
    <section id="section-yamakantaka-analysis" className="space-y-6 scroll-mt-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-rose-50 border border-rose-200/80 p-4 rounded-2xl flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-rose-700 rounded-2xl flex items-center justify-center text-xl shadow-md text-white border border-white/20">
            🌟
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-serif uppercase flex items-center gap-2 flex-wrap">
              <span>{sectionTitle}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white text-rose-800 font-sans font-bold normal-case border border-rose-200">
                {jupiterUpagrahaTag}
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
          <div className="bg-gradient-to-br from-amber-50 via-orange-50/70 to-amber-100/40 rounded-3xl p-6 border border-amber-200/80 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-orange-300/30 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 space-y-4">
              <div>
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-1">
                  {residingBhavaLabel}
                </span>
                <div className="text-2xl lg:text-3xl font-black text-slate-900 font-serif leading-tight">
                  {displayTitle}
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-200/60 shadow-xs">
                  <Compass className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>
                    <strong className="text-slate-900">{translations?.ui?.signLabel || "Rasi"}:</strong>{" "}
                    {ts(yamakantaka.sign_name) || `${translations?.ui?.signLabel || "Sign"} ${yamakantaka.sign}`}
                  </span>
                </div>

                {yamakantaka.time && (
                  <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-200/60 shadow-xs">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong className="text-slate-900">{riseTimeLabel}:</strong> {yamakantaka.time}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-200/60 shadow-xs">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong className="text-slate-900">{natureLabel}:</strong> {natureAuspiciousText}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/60 text-[11px] text-amber-800/80 italic font-medium">
              {classicalParasharaRef}
            </div>
          </div>
        </div>

        {/* Narrative & Protective Effects */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600"></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  {protectiveEffectsTitle}
                </h3>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">
                  {translations?.ui?.houseLabel || "Bhava"} {yamakantaka.house} {bhavaResonanceTag}
                </span>
              </div>

              <p className="text-slate-950 font-normal leading-relaxed text-base md:text-lg font-sans">
                {displayEffect}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-sm text-slate-700">
              <span className="font-bold text-slate-900">{divineShieldLabel}:</span>
              <span>{divineShieldDesc}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
