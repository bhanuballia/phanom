import React, { useState, useEffect } from "react";
import axios from "axios";
import { MANDI_GULIKA_HOUSE_EFFECTS } from "../data/mandiGulikaData";
import { AlertTriangle, TrendingUp, ShieldAlert, Compass, Clock } from "lucide-react";
import { API_BASE_URL } from "../services/api";

export default function MandiGulikaAnalysis({ mandi, gulika, translations, currentLang }) {
  if (!mandi || !mandi.house) return null;

  const houseData = MANDI_GULIKA_HOUSE_EFFECTS[mandi.house];
  if (!houseData) return null;

  const isUpachaya = [3, 6, 10, 11].includes(mandi.house);

  const [translatedData, setTranslatedData] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Localization helpers
  const ts = (sign) => translations?.signs?.[sign] || sign;

  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setTranslatedData(null);
      return;
    }

    const localCacheKey = `astro_mandi_gulika_interp_${currentLang}`;
    const cached = localStorage.getItem(localCacheKey);
    let cachedMap = {};
    if (cached) {
      try {
        cachedMap = JSON.parse(cached);
        if (cachedMap && cachedMap[mandi.house]) {
          setTranslatedData(cachedMap[mandi.house]);
        }
      } catch (e) {}
    }

    if (cachedMap && cachedMap[mandi.house]) return;

    let isMounted = true;
    setIsTranslating(true);

    axios.post(`${API_BASE_URL}/translate/mandi-gulika-interpretations`, {
      targetLang: currentLang,
      targetLangName: translations?.langName || currentLang,
      items: [
        {
          key: String(mandi.house),
          title: houseData.title,
          effect: houseData.effect
        }
      ]
    }).then((res) => {
      if (isMounted && res.data?.success && res.data?.translations?.[mandi.house]) {
        const item = res.data.translations[mandi.house];
        setTranslatedData(item);
        try {
          const updated = { ...cachedMap, [mandi.house]: item };
          localStorage.setItem(localCacheKey, JSON.stringify(updated));
        } catch (e) {}
      }
    }).catch((err) => {
      console.warn("Mandi Gulika translation request error:", err.message);
    }).finally(() => {
      if (isMounted) setIsTranslating(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentLang, mandi.house]);

  const displayTitle = translatedData?.title || houseData.title;
  const displayEffect = translatedData?.effect || houseData.effect;

  const sectionTitle = translations?.ui?.mandiGulikaTitle || "Mandi & Gulika Analysis";
  const sectionSubtitle = translations?.ui?.mandiGulikaSubtitle || "Saturn's Shadow Planets of Delay, Obstacles & Concentrated Karma (मांदि एवं गुलिका विचार)";
  const saturnSonsTag = translations?.ui?.saturnSonsTag || "Saturn's Sons (छाया ग्रह)";
  const residingBhavaLabel = translations?.ui?.residingBhava || "Residing Bhava";
  const houseTypeLabel = translations?.ui?.houseTypeLabel || "House Type";
  const houseTypeVal = isUpachaya 
    ? (translations?.ui?.upachayaGrowth || "Upachaya (उपाचय वृद्धि)") 
    : (translations?.ui?.standardBhava || "Standard Bhava");
  const classicalRuleText = translations?.ui?.classicalUpachayaRule || "Classical Rule: In Upachaya houses (3, 6, 10, 11), Mandi & Gulika turn into potent drivers of material victory.";
  const headerCardTitle = isUpachaya 
    ? (translations?.ui?.upachayaHeader || "Material Success & Karmic Victory") 
    : (translations?.ui?.nonUpachayaHeader || "Karmic Challenges & Caution");
  const bhavaResonanceTag = translations?.ui?.bhavaResonanceTag || "Resonance";
  const karmicNoteLabel = translations?.ui?.karmicNoteLabel || "Karmic Note";
  const karmicNoteText = isUpachaya 
    ? (translations?.ui?.upachayaNote || "Energies in this house are conquered and turned into relentless ambition and worldly gains over time.") 
    : (translations?.ui?.nonUpachayaNote || "Requires mindfulness, spiritual remedies, and patient discipline to mitigate delays and friction.");

  return (
    <section id="section-mandi-gulika-analysis" className="space-y-6 scroll-mt-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-rose-50 border border-rose-200/80 p-4 rounded-2xl flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md border border-white/20 text-white bg-slate-800">
            🌑
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-serif uppercase flex items-center gap-2 flex-wrap">
              <span>{sectionTitle}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-bold normal-case bg-white text-rose-800 border border-rose-200">
                {saturnSonsTag}
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
                ? "bg-gradient-to-br from-emerald-50 via-teal-50/70 to-emerald-100/40 border-teal-200/80"
                : "bg-gradient-to-br from-slate-50 via-slate-100/70 to-slate-200/40 border-slate-300/80"
            }`}
          >
            <div
              className={`absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40 ${
                isUpachaya ? "bg-teal-300" : "bg-slate-400"
              }`}
            ></div>

            <div className="relative z-10 space-y-4">
              <div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${
                    isUpachaya ? "text-teal-700" : "text-slate-600"
                  }`}
                >
                  {residingBhavaLabel}
                </span>
                <div className="text-2xl lg:text-3xl font-black text-slate-900 font-serif leading-tight">
                  {displayTitle}
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                  <Compass className={`w-4 h-4 shrink-0 ${isUpachaya ? "text-teal-600" : "text-slate-700"}`} />
                  <span>
                    <strong className="text-slate-900">Mandi:</strong> {ts(mandi.sign_name) || `${translations?.ui?.signLabel || "Sign"} ${mandi.sign}`}
                    {mandi.time ? ` (${mandi.time})` : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                  <Compass className={`w-4 h-4 shrink-0 ${isUpachaya ? "text-emerald-600" : "text-slate-500"}`} />
                  <span>
                    <strong className="text-slate-900">Gulika:</strong>{" "}
                    {ts(gulika ? gulika.sign_name : mandi.sign_name) || `${translations?.ui?.signLabel || "Sign"} ${gulika ? gulika.sign : mandi.sign}`}
                    {gulika?.time ? ` (${gulika.time})` : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isUpachaya ? "bg-emerald-500" : "bg-slate-700"
                    }`}
                  ></span>
                  <span>
                    <strong className="text-slate-900">{houseTypeLabel}:</strong>{" "}
                    {houseTypeVal}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-600 italic font-medium">
              {classicalRuleText}
            </div>
          </div>
        </div>

        {/* Narrative & Karmic Effects */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
            <div
              className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${
                isUpachaya ? "from-emerald-400 via-teal-500 to-teal-700" : "from-slate-400 via-slate-600 to-slate-800"
              }`}
            ></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  {isUpachaya ? (
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-slate-700" />
                  )}
                  {headerCardTitle}
                </h3>
                <span
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${
                    isUpachaya
                      ? "text-teal-900 bg-teal-100 border-teal-300"
                      : "text-slate-800 bg-slate-100 border-slate-300"
                  }`}
                >
                  {translations?.ui?.houseLabel || "Bhava"} {mandi.house} {bhavaResonanceTag}
                </span>
              </div>

              <p className="text-slate-950 font-normal leading-relaxed text-base md:text-lg font-sans">
                {displayEffect}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-sm text-slate-700">
              <span className="font-bold text-slate-900">{karmicNoteLabel}:</span>
              <span>
                {karmicNoteText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
