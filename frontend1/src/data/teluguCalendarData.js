// Telugu Calendar (తెలుగు పంచాంగం / క్యాలెండర్) Data Helper
// Lunar Months, 60-year Jovian Samvatsaras, Weekdays & Daily Panchang Timings

export const TELUGU_YEARS = [
  "ప్రభవ (Prabhava)", "విభవ (Vibhava)", "శుక్ల (Shukla)", "ప్రమోదూత (Pramodoota)", "ప్రజోత్పత్తి (Prajotpatti)",
  "ఆంగీరస (Aangirasa)", "శ్రీముఖ (Srimukha)", "భావ (Bhava)", "యువ (Yuva)", "ధాత (Dhatru)",
  "ఈశ్వర (Eswara)", "బహుధాన్య (Bahudhanya)", "ప్రమాది (Pramathi)", "విక్రమ (Vikrama)", "వృష (Vrusha)",
  "చిత్రభాను (Chitrabhanu)", "స్వభాను (Svabhanu)", "తారణ (Tarana)", "పార్థివ (Parthiva)", "వ్యయ (Vyaya)",
  "సర్వజిత్తు (Sarvajittu)", "సర్వధారి (Sarvadhari)", "విరోధి (Virodhi)", "వికృతి (Vikruti)", "ఖర (Khara)",
  "నందన (Nandana)", "విజయ (Vijaya)", "జయ (Jaya)", "మన్మథ (Manmadha)", "దుర్ముఖి (Durmukhi)",
  "హేవళంబి (Hevalambi)", "విళంబి (Vilambi)", "వికారి (Vikari)", "శార్వరి (Sharvari)", "ప్లవ (Plava)",
  "శుభకృతు (Shubhakrutu)", "శోభకృతు (Shobhakrutu)", "క్రోధి (Krodhi)", "విశ్వావసు (Viswavasu)", "పరాభవ (Parabhava)",
  "ప్లవంగ (Plavanga)", "కీలక (Keelaka)", "సౌమ్య (Saumya)", "సాధారణ (Sadharana)", "విరోధికృతు (Virodhikrutu)",
  "పరీధావి (Paridhavi)", "ప్రమాదీచ (Pramadeecha)", "ఆనంద (Ananda)", "రాక్షస (Rakshasa)", "నల (Nala)",
  "పింగళ (Pingala)", "కాళయుక్తి (Kalayukti)", "సిద్ధార్థి (Siddharthi)", "రౌద్రి (Raudri)", "దుర్మతి (Durmati)",
  "దుందుభి (Dundubhi)", "రుధిరోద్గారి (Rudhrodgari)", "రక్తాక్షి (Raktakshi)", "క్రోధన (Krodhana)", "అక్షయ (Akshaya)"
];

export const getTeluguYear = (gregorianYear, gregorianMonth) => {
  // Telugu New Year starts on Ugadi (mid-March/April)
  const baseOffset = (gregorianYear - 1987) % 60;
  let idx = (baseOffset >= 0 ? baseOffset : baseOffset + 60);
  if (gregorianMonth < 4) {
    idx = (idx - 1 + 60) % 60;
  }
  const name = TELUGU_YEARS[idx] || "విశ్వావసు (Viswavasu)";
  const shaka = gregorianYear - 78 - (gregorianMonth < 4 ? 1 : 0);
  return { name, shaka };
};

// 12 Telugu Lunar Months
export const TELUGU_MONTHS_INFO = [
  { id: 1, name: "చైత్రం", en: "Chaitram", deity: "Lord Brahma & Sri Rama", desc: "ఉగాది (తెలుగు సంవత్సరాది), శ్రీరామ నవమి, వసంత నవరాత్రులు" },
  { id: 2, name: "వైశాఖం", en: "Vaishakham", deity: "Lord Vishnu & Narasimha", desc: "అక్షయ తృతీయ, నృసింహ జయంతి, శంకర జయంతి, మోహినీ ఏకాదశి" },
  { id: 3, name: "జ్యేష్ఠం", en: "Jyeshtham", deity: "Goddess Ganga & Trivikrama", desc: "ఏరువాక పున్నమి (రైతుల పండుగ), నిర్జల ఏకాదశి, గంగావతరణం" },
  { id: 4, name: "ఆషాఢం", en: "Ashadham", deity: "Mahankali & Jagannath", desc: "తెలంగాణ బోనాలు, పూరి జగన్నాథ రథయాత్ర, గురు పౌర్ణమి (వ్యాస పూజ)" },
  { id: 5, name: "శ్రావణం", en: "Shravanam", deity: "Goddess Sri Mahalakshmi", desc: "వరలక్ష్మి వ్రతం, మంగళగౌరి వ్రతం, రాఖీ పౌర్ణమి, శ్రీకృష్ణ జన్మాష్టమి" },
  { id: 6, name: "భాద్రపదం", en: "Bhadrapadam", deity: "Lord Vighneshwara", desc: "వినాయక చవితి, అనంత పద్మనాభ వ్రతం, మహాలయ పితృపక్షం ప్రారంభం" },
  { id: 7, name: "ఆశ్వయుజం", en: "Ashvayujam", deity: "Kanaka Durga & Rama", desc: "బతుకమ్మ పండుగ, దేవీ శరన్నవరాత్రులు, విజయదశమి (దసరా), దీపావళి" },
  { id: 8, name: "కార్తీకం", en: "Karthikam", deity: "Lord Shiva & Damodara", desc: "కార్తీక సోమవారాలు, నాగుల చవితి, క్షీరాబ్ధి ద్వాదశి, కార్తీక దీపోత్సవం" },
  { id: 9, name: "మార్గశిరం", en: "Margashiram", deity: "Lord Krishna & Subrahmanya", desc: "సుబ్రహ్మణ్య షష్ఠి, ముక్కోటి / వైకుంఠ ఏకాదశి, భగవద్గీత జయంతి" },
  { id: 10, name: "పుష్యం", en: "Pushyam", deity: "Surya Bhagavan & Sri Hari", desc: "భోగి, మకర సంక్రాంతి, కనుమ (పెద్ద పండుగ), ముక్కనుమ" },
  { id: 11, name: "మాఘం", en: "Magham", deity: "Lord Shiva & Surya", desc: "రథసప్తమి (సూర్య జయంతి), భీష్మ ఏకాదశి, మహాశివరాత్రి (జాగరణ)" },
  { id: 12, name: "ఫాల్గుణం", en: "Phalgunam", deity: "Goddess Lakshmi & Kamadeva", desc: "కామదహనం, హోలీ పండుగ, లక్ష్మీ జయంతి (సంవత్సర సమాప్తి)" }
];

export const TELUGU_WEEKDAYS = [
  { name: "ఆదివారం", en: "Sunday", telugu: "ఆదివారం (Sunday)", lord: "సూర్యుడు (Sun)" },
  { name: "సోమవారం", en: "Monday", telugu: "సోమవారం (Monday)", lord: "చంద్రుడు (Moon)" },
  { name: "మంగళవారం", en: "Tuesday", telugu: "మంగళవారం (Tuesday)", lord: "కుజుడు (Mars)" },
  { name: "బుధవారం", en: "Wednesday", telugu: "బుధవారం (Wednesday)", lord: "బుధుడు (Mercury)" },
  { name: "గురువారం", en: "Thursday", telugu: "గురువారం (Thursday)", lord: "బృహస్పతి (Jupiter)" },
  { name: "శుక్రవారం", en: "Friday", telugu: "శుక్రవారం (Friday)", lord: "శుక్రుడు (Venus)" },
  { name: "శనివారం", en: "Saturday", telugu: "శనివారం (Saturday)", lord: "శనీశ్వరుడు (Saturn)" }
];

// Daily Rahu Kalam, Yamagandam, Durmuhurtham, Amrutha Kalam & Abhijit Muhurtham
export const TELUGU_DAILY_TIMINGS = [
  { day: "Sunday", telugu: "ఆదివారం", lord: "సూర్యుడు", rahuKalam: "04:30 PM - 06:00 PM", yamagandam: "12:00 PM - 01:30 PM", durmuhurtham: "04:45 PM - 05:35 PM", amruthaKalam: "02:15 PM - 03:45 PM", abhijit: "11:45 AM - 12:35 PM" },
  { day: "Monday", telugu: "సోమవారం", lord: "చంద్రుడు", rahuKalam: "07:30 AM - 09:00 AM", yamagandam: "10:30 AM - 12:00 PM", durmuhurtham: "12:35 PM - 01:25 PM", amruthaKalam: "05:00 AM - 06:30 AM", abhijit: "11:45 AM - 12:35 PM" },
  { day: "Tuesday", telugu: "మంగళవారం", lord: "కుజుడు", rahuKalam: "03:00 PM - 04:30 PM", yamagandam: "09:00 AM - 10:30 AM", durmuhurtham: "08:35 AM - 09:25 AM", amruthaKalam: "10:15 AM - 11:45 AM", abhijit: "11:45 AM - 12:35 PM" },
  { day: "Wednesday", telugu: "బుధవారం", lord: "బుధుడు", rahuKalam: "12:00 PM - 01:30 PM", yamagandam: "07:30 AM - 09:00 AM", durmuhurtham: "11:45 AM - 12:35 PM", amruthaKalam: "08:30 PM - 10:00 PM", abhijit: "11:45 AM - 12:35 PM" },
  { day: "Thursday", telugu: "గురువారం", lord: "బృహస్పతి", rahuKalam: "01:30 PM - 03:00 PM", yamagandam: "06:00 AM - 07:30 AM", durmuhurtham: "10:15 AM - 11:05 AM", amruthaKalam: "06:15 PM - 07:45 PM", abhijit: "11:45 AM - 12:35 PM" },
  { day: "Friday", telugu: "శుక్రవారం", lord: "శుక్రుడు", rahuKalam: "10:30 AM - 12:00 PM", yamagandam: "03:00 PM - 04:30 PM", durmuhurtham: "08:35 AM - 09:25 AM", amruthaKalam: "04:30 PM - 06:00 PM", abhijit: "11:45 AM - 12:35 PM" },
  { day: "Saturday", telugu: "శనివారం", lord: "శనీశ్వరుడు", rahuKalam: "09:00 AM - 10:30 AM", yamagandam: "01:30 PM - 03:00 PM", durmuhurtham: "06:15 AM - 07:55 AM", amruthaKalam: "01:15 PM - 02:45 PM", abhijit: "11:45 AM - 12:35 PM" }
];
