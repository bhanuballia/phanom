import React, { useState, useEffect } from "react";
import axios from "axios";
import { UPAKETU_HOUSE_EFFECTS } from "../data/upaketuData";
import { Flame, Swords, Compass, AlertOctagon } from "lucide-react";
import { API_BASE_URL } from "../services/api";

export default function UpaketuAnalysis({ upaketu, translations, currentLang }) {
  if (!upaketu || !upaketu.house) {
    return null;
  }

  const houseData = UPAKETU_HOUSE_EFFECTS[upaketu.house];
  if (!houseData) return null;

  const isUpachaya = [3, 6, 10, 11].includes(upaketu.house);

  const [translatedData, setTranslatedData] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Sign localization helper
  const ts = (sign) => translations?.signs?.[sign] || sign;

  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setTranslatedData(null);
      return;
    }

    const localCacheKey = `astro_upaketu_interp_${currentLang}`;
    const cached = localStorage.getItem(localCacheKey);
    let cachedMap = {};
    if (cached) {
      try {
        cachedMap = JSON.parse(cached);
        if (cachedMap && cachedMap[upaketu.house]) {
          setTranslatedData(cachedMap[upaketu.house]);
        }
      } catch (e) {}
    }

    if (cachedMap && cachedMap[upaketu.house]) return;

    let isMounted = true;
    setIsTranslating(true);

    axios.post(`${API_BASE_URL}/translate/upaketu-interpretations`, {
      targetLang: currentLang,
      targetLangName: translations?.langName || currentLang,
      items: [
        {
          key: String(upaketu.house),
          title: houseData.title,
          effect: houseData.effect
        }
      ]
    }).then((res) => {
      if (isMounted && res.data?.success && res.data?.translations?.[upaketu.house]) {
        const item = res.data.translations[upaketu.house];
        setTranslatedData(item);
        try {
          const updated = { ...cachedMap, [upaketu.house]: item };
          localStorage.setItem(localCacheKey, JSON.stringify(updated));
        } catch (e) {}
      }
    }).catch((err) => {
      console.warn("Upaketu translation request error:", err.message);
    }).finally(() => {
      if (isMounted) setIsTranslating(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentLang, upaketu.house]);

  const displayTitle = translatedData?.title || houseData.title;
  const displayEffect = translatedData?.effect || houseData.effect;

  const sectionTitle = translations?.ui?.upaketuTitle || "Upaketu (Sikhi) Analysis";
  const upaketuBadge = translations?.ui?.upaketuBadge || "Aprakasha Graha (उपकेतु शिखी)";
  const sectionSubtitle = translations?.ui?.upaketuSubtitle || "Fiery Non-Luminous Planet of Sudden Events & Aggressive Karma";
  const residingBhavaLabel = translations?.ui?.residingBhava || "Residing Bhava";
  const rasiLabel = translations?.ui?.upaketuRasi || "Rasi";
  const longitudeLabel = translations?.ui?.upaketuLongitude || "Longitude";
  const houseTypeLabel = translations?.ui?.houseTypeLabel || "House Type";
  const houseTypeVal = isUpachaya 
    ? (translations?.ui?.upaketuUpachayaType || "Upachaya (उपाचय पराक्रम)") 
    : (translations?.ui?.standardBhava || "Standard Bhava");
  const classicalRuleText = translations?.ui?.upaketuClassicalRule || "Classical Parashara: Upaketu carries fiery Mars-Ketu resonance influencing sudden transformations.";
  const headerCardTitle = isUpachaya 
    ? (translations?.ui?.upaketuUpachayaHeader || "Fierce Success & Aggressive Growth") 
    : (translations?.ui?.upaketuNonUpachayaHeader || "Sudden Events & Volatile Energy");
  const bhavaResonanceTag = translations?.ui?.bhavaResonanceTag || "Resonance";
  const classicalGuidanceLabel = translations?.ui?.upaketuClassicalGuidance || "Classical Guidance";
  const classicalGuidanceText = isUpachaya 
    ? (translations?.ui?.upaketuUpachayaGuidance || "Channeled aggressively through discipline and determination, this fiery placement grants absolute victory over competition.") 
    : (translations?.ui?.upaketuNonUpachayaGuidance || "Practice caution around sudden arguments, impulsiveness, and fire hazards; channel extra vitality into physical fitness.");

  return (
    <section id="section-upaketu-analysis" className="space-y-6 scroll-mt-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-rose-50 border border-rose-200/80 p-4 rounded-2xl flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md border border-white/20 text-white bg-rose-700">
            🔥
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-serif uppercase flex items-center gap-2 flex-wrap">
              <span>{sectionTitle}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-bold normal-case bg-white text-rose-800 border border-rose-200">
                {upaketuBadge}
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
                ? "bg-gradient-to-br from-rose-50 via-red-50/70 to-rose-100/40 border-red-200/80"
                : "bg-gradient-to-br from-red-50 via-red-100/50 to-orange-50/40 border-red-200"
            }`}
          >
            <div
              className={`absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40 ${
                isUpachaya ? "bg-rose-300" : "bg-red-300"
              }`}
            ></div>

            <div className="relative z-10 space-y-4">
              <div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${
                    isUpachaya ? "text-red-700" : "text-red-800"
                  }`}
                >
                  {residingBhavaLabel}
                </span>
                <div className="text-2xl lg:text-3xl font-black text-slate-900 font-serif leading-tight">
                  {displayTitle}
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-red-200/60 shadow-xs">
                  <Compass className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    <strong className="text-slate-900">{rasiLabel}:</strong> {ts(upaketu.sign_name) || `${translations?.ui?.signLabel || "Sign"} ${upaketu.sign}`}
                  </span>
                </div>

                {upaketu.lon !== undefined && (
                  <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-red-200/60 shadow-xs">
                    <Flame className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>
                      <strong className="text-slate-900">{longitudeLabel}:</strong> {typeof upaketu.lon === 'number' ? upaketu.lon.toFixed(2) : upaketu.lon}°
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-red-200/60 shadow-xs">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isUpachaya ? "bg-rose-500" : "bg-red-700"
                    }`}
                  ></span>
                  <span>
                    <strong className="text-slate-900">{houseTypeLabel}:</strong>{" "}
                    {houseTypeVal}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-red-200/60 text-[11px] text-red-900/80 italic font-medium">
              {classicalRuleText}
            </div>
          </div>
        </div>

        {/* Narrative & Karmic Effects */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
            <div
              className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${
                isUpachaya ? "from-rose-400 via-red-500 to-red-700" : "from-red-500 via-red-600 to-red-900"
              }`}
            ></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  {isUpachaya ? (
                    <Swords className="w-5 h-5 text-rose-600" />
                  ) : (
                    <AlertOctagon className="w-5 h-5 text-red-600" />
                  )}
                  {headerCardTitle}
                </h3>
                <span
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${
                    isUpachaya
                      ? "text-rose-900 bg-rose-100 border-rose-300"
                      : "text-red-900 bg-red-100 border-red-300"
                  }`}
                >
                  {translations?.ui?.houseLabel || "Bhava"} {upaketu.house} {bhavaResonanceTag}
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
