// Kerala Malayalam Calendar (Kollavarsham) Data Helper
// Maps Gregorian Month & Dates to Malayalam Months, Kollam Era Year, and Traditional Kerala Festivals

export const getKollamYear = (gregorianYear, gregorianMonth) => {
  // Kollam Era started in 825 CE.
  // Malayalam new year starts on Chingam 1 (around August 16/17).
  if (gregorianMonth >= 9 || (gregorianMonth === 8)) {
    return gregorianYear - 824;
  }
  return gregorianYear - 825;
};

// 12 Malayalam Months Metadata (Rasi-based)
export const MALAYALAM_MONTHS_INFO = [
  { id: 1, name: "ചിങ്ങം", en: "Chingam", rasi: "ചിങ്ങം (Simham / Leo)", startMidMonth: "Mid Aug - Mid Sep", deity: "Lord Mahavishnu & Ganapathi", desc: "മലയാള പുതുവർഷം, തിരുവോണം (Onam)" },
  { id: 2, name: "കന്നി", en: "Kanni", rasi: "കന്നി (Kanya / Virgo)", startMidMonth: "Mid Sep - Mid Oct", deity: "Nagaraja & Saraswathi", desc: "കന്നി ആയില്യം, നവരാത്രി, പൂജാവെപ്പ്, വിദ്യാരംഭം" },
  { id: 3, name: "തുലാം", en: "Thulam", rasi: "തുലാം (Thulam / Libra)", startMidMonth: "Mid Oct - Mid Nov", deity: "Surya Bhagavan & Shiva", desc: "തുലാപ്പത്ത്, ദീപാവലി, തുലാമാസ പൂജകൾ" },
  { id: 4, name: "വൃശ്ചികം", en: "Vrischikam", rasi: "വൃശ്ചികം (Vrischika / Scorpio)", startMidMonth: "Mid Nov - Mid Dec", deity: "Lord Ayyappa & Guruvayurappan", desc: "മണ്ഡലകാല ആരംഭം (ശബരിമല), ഗുരുവായൂർ ഏകാദശി" },
  { id: 5, name: "ധനു", en: "Dhanu", rasi: "ധനു (Dhanu / Sagittarius)", startMidMonth: "Mid Dec - Mid Jan", deity: "Lord Shiva & Parvathi", desc: "തിരുവാതിര (ധനു തിരുവാതിര), വൈകുണ്ഠ ഏകാദശി" },
  { id: 6, name: "മകരം", en: "Makaram", rasi: "മകരം (Makaram / Capricorn)", startMidMonth: "Mid Jan - Mid Feb", deity: "Lord Ayyappa (Makaravilakku)", desc: "മകരവിളക്ക് (ശബരിമല), തൈപ്പൂയം" },
  { id: 7, name: "കുംഭം", en: "Kumbham", rasi: "കുംഭം (Kumbham / Aquarius)", startMidMonth: "Mid Feb - Mid Mar", deity: "Lord Shiva & Attukal Amma", desc: "ആലുവാ ശിവരാത്രി, ആറ്റുകാൽ പൊങ്കാല" },
  { id: 8, name: "മീനം", en: "Meenam", rasi: "മീനം (Meenam / Pisces)", startMidMonth: "Mid Mar - Mid Apr", deity: "Kodungallur Bhagavathi", desc: "കൊടുങ്ങല്ലൂർ ഭരണി, മീനപ്പൂരം" },
  { id: 9, name: "മേടം", en: "Medam", rasi: "മേടം (Mesha / Aries)", startMidMonth: "Mid Apr - Mid May", deity: "Lord Krishna & Vadakkunnathan", desc: "വിഷുക്കണി (Vishu), തൃശ്ശൂർ പൂരം (Thrissur Pooram)" },
  { id: 10, name: "ഇടവം", en: "Edavam", rasi: "ഇടവം (Vrishabha / Taurus)", startMidMonth: "Mid May - Mid Jun", deity: "Devi & Shiva", desc: "ഇടവപ്പാതി (മഴക്കാല ആരംഭം), പ്രതിഷ്ഠാ ദിനങ്ങൾ" },
  { id: 11, name: "മിഥുനം", en: "Mithunam", rasi: "മിഥുനം (Mithuna / Gemini)", startMidMonth: "Mid Jun - Mid Jul", deity: "Ochira Parabrahma", desc: "ഓച്ചിറക്കളി, ചമ്പക്കുളം മൂലം വള്ളംകളി" },
  { id: 12, name: "കർക്കടകം", en: "Karkidakam", rasi: "കർക്കടകം (Karkidakam / Cancer)", startMidMonth: "Mid Jul - Mid Aug", deity: "Sree Rama & Pitrus", desc: "രാമായണ മാസം, കർക്കടക വാവുബലി (പിതൃതർപ്പണം)" }
];

export const MALAYALAM_WEEKDAYS = [
  { name: "ഞായർ", en: "Njayar", planet: "സൂര്യൻ (Sun)" },
  { name: "തിങ്കൾ", en: "Thinkal", planet: "ചന്ദ്രൻ (Moon)" },
  { name: "ചൊവ്വ", en: "Chovva", planet: "ചൊവ്വ (Mars)" },
  { name: "ബുധൻ", en: "Budhan", planet: "ബുധൻ (Mercury)" },
  { name: "വ്യാഴം", en: "Vyazham", planet: "വ്യാഴം / ഗുരു (Jupiter)" },
  { name: "വെള്ളി", en: "Velli", planet: "ശുക്രൻ (Venus)" },
  { name: "ശനി", en: "Shani", planet: "ശനി (Saturn)" }
];

// Kerala Traditional Daily Rahu Kalam, Gulika Kalam & Yamagandam
export const KERALA_DAILY_TIMINGS = {
  0: { rahu: "04:30 PM - 06:00 PM", gulika: "03:00 PM - 04:30 PM", yama: "12:00 PM - 01:30 PM", nallaNeram: "07:30 AM - 08:30 AM, 01:30 PM - 02:30 PM" },
  1: { rahu: "07:30 AM - 09:00 AM", gulika: "01:30 PM - 03:00 PM", yama: "10:30 AM - 12:00 PM", nallaNeram: "06:00 AM - 07:30 AM, 04:30 PM - 06:00 PM" },
  2: { rahu: "03:00 PM - 04:30 PM", gulika: "12:00 PM - 01:30 PM", yama: "09:00 AM - 10:30 AM", nallaNeram: "10:30 AM - 11:30 AM, 04:30 PM - 05:30 PM" },
  3: { rahu: "12:00 PM - 01:30 PM", gulika: "10:30 AM - 12:00 PM", yama: "07:30 AM - 09:00 AM", nallaNeram: "09:00 AM - 10:00 AM, 01:30 PM - 02:30 PM" },
  4: { rahu: "01:30 PM - 03:00 PM", gulika: "09:00 AM - 10:30 AM", yama: "06:00 AM - 07:30 AM", nallaNeram: "09:00 AM - 10:30 AM, 01:00 PM - 02:00 PM" },
  5: { rahu: "10:30 AM - 12:00 PM", gulika: "07:30 AM - 09:00 AM", yama: "03:00 PM - 04:30 PM", nallaNeram: "09:00 AM - 10:30 AM, 04:30 PM - 05:30 PM" },
  6: { rahu: "09:00 AM - 10:30 AM", gulika: "06:00 AM - 07:30 AM", yama: "01:30 PM - 03:00 PM", nallaNeram: "07:30 AM - 09:00 AM, 05:00 PM - 06:00 PM" }
};

