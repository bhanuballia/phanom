// Tamil Calendar Data Helper
// Maps Gregorian Month & Dates to Tamil Months, Tamil Year names, and Traditional Tamil Festivals

export const TAMIL_YEARS = [
  "பிரபவ (Prabhava)", "விபவ (Vibhava)", "சுக்ல (Shukla)", "பிரமோதூத (Pramodoota)", "பிரசோற்பத்தி (Prachorpatti)",
  "ஆங்கீரச (Aangirasa)", "ஸ்ரீமுக (Srimukha)", "பவ (Bhava)", "யுவ (Yuva)", "தாது (Dhatru)",
  "ஈஸ்வர (Eswara)", "வெகுதானிய (Vehudhanya)", "பிரமாதி (Pramathi)", "விக்ரம (Vikrama)", "விஷு (Vishu)",
  "சித்திரபானு (Chithrabhanu)", "சுபானு (Subhanu)", "தாரண (Dharana)", "பார்த்திப (Parthiba)", "விய (Viya)",
  "சர்வசித்து (Sarvajithu)", "சர்வதாரி (Sarvadhari)", "विरोधी (Virodhi)", "விக்ருதி (Vikruthi)", "கர (Kara)",
  "நந்தன (Nandhana)", "விஜய (Vijaya)", "ஜய (Jaya)", "மன்மத (Manmadha)", "துன்முகி (Dhunmuki)",
  "ஹேவிளம்பி (Hevilambi)", "விளம்பி (Vilambi)", "விகாரி (Vikari)", "சார்வரி (Sarvari)", "பிலவ (Plava)",
  "சுபகிருது (Subhakrithu)", "சோபகிருது (Sobhakrithu)", "குரோதி (Krodhi)", "விசுவாவசு (Visvavasu)", "பராபவ (Parabhava)",
  "பிலவங்க (Plavanga)", "கீலக (Keelaka)", "சௌமிய (Saumya)", "சாதாரண (Sadharana)", "விரோதகிருது (Virodhikrithu)",
  "பரிதாபி (Paridhabi)", "பிரமாதீச (Pramadheesa)", "ஆனந்த (Aanandha)", "ராட்சச (Rakshasa)", "நள (Nala)",
  "பிங்கள (Pingala)", "காளயுக்தி (Kalayukthi)", "சித்தார்த்தி (Siddharthi)", "ரௌத்திரி (Roudhri)", "துன்மதி (Dhunmathi)",
  "துந்துபி (Dhundhubhi)", "ருத்ரோத்காரி (Rudhrodhkari)", "ரக்தாட்சி (Raktakshi)", "குரோதன (Krodhana)", "அட்சய (Akshaya)"
];

export const getTamilYear = (gregorianYear, gregorianMonth) => {
  // Tamil New Year starts in mid-April (Chithirai 1)
  const baseOffset = (gregorianYear - 1987) % 60;
  let idx = (baseOffset >= 0 ? baseOffset : baseOffset + 60);
  if (gregorianMonth < 4) {
    idx = (idx - 1 + 60) % 60;
  }
  return TAMIL_YEARS[idx] || "குரோதி / விசுவாவசு";
};

// 12 Tamil Months metadata
export const TAMIL_MONTHS_INFO = [
  { id: 1, tamil: "சித்திரை", en: "Chithirai", rasi: "மேஷம் (Mesham / Aries)", startMidMonth: "Mid April - Mid May", deity: "Lord Vishnu / Chitragupta", desc: "தமிழ் புத்தாண்டு, வசந்த காலம்" },
  { id: 2, tamil: "வைகாசி", en: "Vaikasi", rasi: "ரிஷபம் (Rishabham / Taurus)", startMidMonth: "Mid May - Mid June", deity: "Lord Murugan", desc: "வைகாசி விசாகம், கோடை காலம்" },
  { id: 3, tamil: "ஆனி", en: "Aani", rasi: "மிதுனம் (Mithunam / Gemini)", startMidMonth: "Mid June - Mid July", deity: "Lord Nataraja", desc: "ஆனி திருமஞ்சனம், உத்திரம்" },
  { id: 4, tamil: "ஆடி", en: "Aadi", rasi: "கடகம் (Kadagam / Cancer)", startMidMonth: "Mid July - Mid August", deity: "Goddess Amman", desc: "தட்சிணாயனம் ஆரம்பம், ஆடி பெருக்கு, ஆடி அமாவாசை" },
  { id: 5, tamil: "ஆவணி", en: "Aavani", rasi: "சிம்மம் (Simham / Leo)", startMidMonth: "Mid August - Mid September", deity: "Lord Vinayagar & Krishna", desc: "ஆவணி அவிட்டம், விநாயகர் சதுர்த்தி" },
  { id: 6, tamil: "புரட்டாசி", en: "Purattasi", rasi: "கன்னி (Kanni / Virgo)", startMidMonth: "Mid September - Mid October", deity: "Lord Venkateswara (Perumal)", desc: "புரட்டாசி சனிக்கிழமைகள், நவராத்திரி" },
  { id: 7, tamil: "ஐப்பசி", en: "Aippasi", rasi: "துலாம் (Thulam / Libra)", startMidMonth: "Mid October - Mid November", deity: "Lord Shiva & Murugan", desc: "தீபாவளி, கந்த சஷ்டி, அன்னாபிஷேகம்" },
  { id: 8, tamil: "கார்த்திகை", en: "Karthigai", rasi: "விருச்சிகம் (Viruchigam / Scorpio)", startMidMonth: "Mid November - Mid December", deity: "Lord Murugan & Shiva", desc: "கார்த்திகை தீபம், சொக்கப்பனை" },
  { id: 9, tamil: "மார்கழி", en: "Margazhi", rasi: "தனுசு (Dhanusu / Sagittarius)", startMidMonth: "Mid December - Mid January", deity: "Lord Krishna & Andal", desc: "திருப்பாவை, வைகுண்ட ஏகாதசி, ஆருத்ரா தரிசனம்" },
  { id: 10, tamil: "தை", en: "Thai", rasi: "மகரம் (Makaram / Capricorn)", startMidMonth: "Mid January - Mid February", deity: "Surya Bhagavan", desc: "தைப்பொங்கல், உத்தராயணம், தைப்பூசம்" },
  { id: 11, tamil: "மாசி", en: "Maasi", rasi: "கும்பம் (Kumbham / Aquarius)", startMidMonth: "Mid February - Mid March", deity: "Lord Shiva & Mahavishnu", desc: "மகா சிவராத்திரி, மாசி மகம்" },
  { id: 12, tamil: "பங்குனி", en: "Panguni", rasi: "மீனம் (Meenam / Pisces)", startMidMonth: "Mid March - Mid April", deity: "Deva Kalyanam", desc: "பங்குனி உத்திரம், தெய்வத் திருமணங்கள்" }
];

export const TAMIL_WEEKDAYS = [
  { name: "ஞாயிறு", en: "Gnayiru", planet: "சூரியன் (Sun)" },
  { name: "திங்கள்", en: "Thingal", planet: "சந்திரன் (Moon)" },
  { name: "செவ்வாய்", en: "Sevvai", planet: "செவ்வாய் (Mars)" },
  { name: "புதன்", en: "Budhan", planet: "புதன் (Mercury)" },
  { name: "வியாழன்", en: "Vyazhan", planet: "குரு (Jupiter)" },
  { name: "வெள்ளி", en: "Velli", planet: "சுக்கிரன் (Venus)" },
  { name: "சனி", en: "Sani", planet: "சனி (Saturn)" }
];

// Special Tamil Muhurat timings (Gowri & Nalla Neram reference)
export const GOWRI_NALLA_NERAM = {
  0: { day: "07:30 AM - 08:30 AM, 01:30 PM - 02:30 PM", night: "09:00 PM - 10:30 PM", rahu: "04:30 PM - 06:00 PM", yama: "12:00 PM - 01:30 PM", kuligai: "03:00 PM - 04:30 PM" },
  1: { day: "06:00 AM - 07:30 AM, 04:30 PM - 06:00 PM", night: "07:30 PM - 09:00 PM", rahu: "07:30 AM - 09:00 AM", yama: "10:30 AM - 12:00 PM", kuligai: "01:30 PM - 03:00 PM" },
  2: { day: "10:30 AM - 11:30 AM, 04:30 PM - 05:30 PM", night: "07:30 PM - 08:30 PM", rahu: "03:00 PM - 04:30 PM", yama: "09:00 AM - 10:30 AM", kuligai: "12:00 PM - 01:30 PM" },
  3: { day: "09:00 AM - 10:00 AM, 01:30 PM - 02:30 PM", night: "06:30 PM - 07:30 PM", rahu: "12:00 PM - 01:30 PM", yama: "07:30 AM - 09:00 AM", kuligai: "10:30 AM - 12:00 PM" },
  4: { day: "09:00 AM - 10:30 AM, 01:00 PM - 02:00 PM", night: "08:00 PM - 09:30 PM", rahu: "01:30 PM - 03:00 PM", yama: "06:00 AM - 07:30 AM", kuligai: "09:00 AM - 10:30 AM" },
  5: { day: "09:00 AM - 10:30 AM, 04:30 PM - 05:30 PM", night: "06:30 PM - 08:00 PM", rahu: "10:30 AM - 12:00 PM", yama: "03:00 PM - 04:30 PM", kuligai: "07:30 AM - 09:00 AM" },
  6: { day: "07:30 AM - 09:00 AM, 05:00 PM - 06:00 PM", night: "09:30 PM - 10:30 PM", rahu: "09:00 AM - 10:30 AM", yama: "01:30 PM - 03:00 PM", kuligai: "06:00 AM - 07:30 AM" }
};

