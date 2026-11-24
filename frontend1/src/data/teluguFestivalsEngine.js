// Dynamic Telugu Festivals Engine for any year
// Covers major Telugu / Andhra & Telangana observances: Ugadi, Sri Rama Navami, Bonalu, Bathukamma, Sankranti, Varalakshmi Vratam, Vinayaka Chavithi, etc.

const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const TELUGU_FESTIVALS_BY_YEAR = {
  2025: {
    1: [
      { name: "Bhogi", telName: "భోగి పండుగ", day: 13, basis: "ధనుర్మాస ముగింపు" },
      { name: "Makara Sankranti", telName: "మకర సంక్రాంతి (పెద్ద పండుగ)", day: 14, basis: "సూర్యుని మకర రాశి ప్రవేశం" },
      { name: "Kanuma", telName: "కనుమ పండుగ (పశువుల పూజ)", day: 15, basis: "సంక్రాంతి మరుసటి రోజు" }
    ],
    2: [
      { name: "Ratha Sapthami", telName: "రథసప్తమి (సూర్య జయంతి)", day: 4, basis: "మాఘ శుద్ధ సప్తమి" },
      { name: "Maha Shivaratri", telName: "మహాశివరాత్రి (లింగోద్భవ కాలం)", day: 26, basis: "మాఘ బహుళ చతుర్దశి" }
    ],
    3: [
      { name: "Holi / Kamadahana", telName: "కామదహనం / హోలీ", day: 14, basis: "ఫాల్గుణ పౌర్ణమి" },
      { name: "Ugadi - Telugu New Year", telName: "ఉగాది (విశ్వావసు నామ సంవత్సరం)", day: 30, basis: "చైత్ర శుద్ధ పాడ్యమి (సంవత్సరాది)" }
    ],
    4: [
      { name: "Sri Rama Navami", telName: "శ్రీరామనవమి (సీతారాముల కళ్యాణం)", day: 6, basis: "చైత్ర శుద్ధ నవమి" },
      { name: "Akshaya Tritiya", telName: "అక్షయ తృతీయ", day: 30, basis: "వైశాఖ శుద్ధ తృతీయ" }
    ],
    5: [
      { name: "Narasimha Jayanti", telName: "శ్రీ నృసింహ జయంతి", day: 11, basis: "వైశాఖ శుద్ధ చతుర్దశి" }
    ],
    6: [
      { name: "Eruvaka Punnami", telName: "ఏరువాక పున్నమి (రైతుల పండుగ)", day: 10, basis: "జ్యేష్ఠ పౌర్ణమి" }
    ],
    7: [
      { name: "Guru Purnima", telName: "గురు పౌర్ణమి (వ్యాస పూజ)", day: 10, basis: "ఆషాఢ పౌర్ణమి" },
      { name: "Telangana Bonalu Begins", telName: "గోల్కొండ బోనాలు ప్రారంభం", day: 20, basis: "ఆషాఢ మాసం మొదటి ఆదివారం" }
    ],
    8: [
      { name: "Varalakshmi Vratam", telName: "వరలక్ష్మి వ్రతం (శ్రావణ శుక్రవారం)", day: 8, basis: "శ్రావణ శుక్ల పక్ష శుక్రవారం" },
      { name: "Rakhi Purnima", telName: "రాఖీ పౌర్ణమి (జంధ్యాల పూర్ణిమ)", day: 9, basis: "శ్రావణ పౌర్ణమి" },
      { name: "Sri Krishna Janmashtami", telName: "శ్రీకృష్ణ జన్మాష్టమి (గోకులాష్టమి)", day: 16, basis: "శ్రావణ బహుళ అష్టమి" },
      { name: "Vinayaka Chavithi", telName: "వినాయక చవితి (గణపతి నవరాత్రులు)", day: 27, basis: "భాద్రపద శుద్ధ చవితి" }
    ],
    9: [
      { name: "Mahalaya Amavasya", telName: "మహాలయ అమావాస్య (పితృ తర్పణం)", day: 21, basis: "భాద్రపద బహుళ అమావాస్య" },
      { name: "Bathukamma Begins", telName: "ఎంగిలిపూల బతుకమ్మ (తెలంగాణ)", day: 22, basis: "ఆశ్వయుజ శుద్ధ పాడ్యమి" },
      { name: "Devi Navaratri Begins", telName: "శరన్నవరాత్రులు ప్రారంభం", day: 22, basis: "కనకదుర్గ దేవి పూజ" }
    ],
    10: [
      { name: "Saddula Bathukamma", telName: "సద్దుల బతుకమ్మ పండుగ", day: 1, basis: "ఆశ్వయుజ దుర్గాష్టమి" },
      { name: "Vijaya Dashami (Dussehra)", telName: "విజయదశమి (దసరా - జమ్మి పూజ)", day: 2, basis: "ఆశ్వయుజ శుద్ధ దశమి" },
      { name: "Deepavali", telName: "దీపావళి (లక్ష్మీ కుబేర పూజ)", day: 20, basis: "ఆశ్వయుజ బహుళ అమావాస్య" }
    ],
    11: [
      { name: "Nagula Chavithi", telName: "నాగుల చవితి (సుబ్రహ్మణ్య పూజ)", day: 13, basis: "కార్తీక శుద్ధ చవితి" },
      { name: "Karthika Deepotsavam", telName: "కార్తీక పౌర్ణమి (జ్వాలాతోరణం)", day: 24, basis: "కార్తీక శుద్ధ పౌర్ణమి" }
    ],
    12: [
      { name: "Subrahmanya Sashti", telName: "సుబ్రహ్మణ్య షష్ఠి (స్కంద షష్ఠి)", day: 15, basis: "మార్గశిర శుద్ధ షష్ఠి" },
      { name: "Mukkoti / Vaikunta Ekadashi", telName: "ముక్కోటి ఏకాదశి (ఉత్తర ద్వార దర్శనం)", day: 30, basis: "మార్గశిర శుద్ధ ఏకాదశి" }
    ]
  },
  2026: {
    1: [
      { name: "Bhogi", telName: "భోగి పండుగ", day: 13, basis: "ధనుర్మాస ముగింపు సంబరాలు" },
      { name: "Makara Sankranti", telName: "మకర సంక్రాంతి (సూర్యుని ఉత్తరాయణ పుణ్యకాలం)", day: 14, basis: "సూర్యుని మకర సంక్రమణం" },
      { name: "Kanuma", telName: "కనుమ పండుగ (రైతుల పంటల సంబరం)", day: 15, basis: "సంక్రాంతి మూడవ రోజు" },
      { name: "Ratha Sapthami", telName: "రథసప్తమి (సూర్య జయంతి)", day: 25, basis: "మాఘ శుద్ధ సప్తమి" }
    ],
    2: [
      { name: "Maha Shivaratri", telName: "మహాశివరాత్రి (కోటి లింగార్చన)", day: 15, basis: "మాఘ బహుళ చతుర్దశి" }
    ],
    3: [
      { name: "Holi / Kamadahana", telName: "హోలీ పండుగ / కాముని పున్నమి", day: 3, basis: "ఫాల్గుణ పూర్ణిమ" },
      { name: "Ugadi - Telugu New Year", telName: "ఉగాది (పరాభవ నామ సంవత్సరం)", day: 19, basis: "చైత్ర శుద్ధ పాడ్యమి (షడ్రుచుల పచ్చడి)" },
      { name: "Sri Rama Navami", telName: "శ్రీరామనవమి (భద్రాచలం సీతారాముల కళ్యాణం)", day: 26, basis: "చైత్ర శుద్ధ నవమి" }
    ],
    4: [
      { name: "Akshaya Tritiya", telName: "అక్షయ తృతీయ (బంగారు కొనుగోలు శుభదినం)", day: 20, basis: "వైశాఖ శుద్ధ తృతీయ" }
    ],
    5: [
      { name: "Narasimha Jayanti", telName: "శ్రీ లక్ష్మీ నృసింహ జయంతి", day: 1, basis: "వైశాఖ శుద్ధ చతుర్దశి" },
      { name: "Eruvaka Punnami", telName: "ఏరువాక పున్నమి", day: 31, basis: "జ్యేష్ఠ పూర్ణిమ" }
    ],
    6: [
      { name: "Nirjala Ekadashi", telName: "నిర్జల ఏకాదశి వ్రతం", day: 25, basis: "జ్యేష్ఠ శుక్ల ఏకాదశి" }
    ],
    7: [
      { name: "Guru Purnima", telName: "గురు పౌర్ణమి (వ్యాస పూర్ణిమ)", day: 29, basis: "ఆషాఢ పూర్ణిమ" },
      { name: "Telangana Bonalu Begins", telName: "ఆషాఢ బోనాలు ప్రారంభం", day: 12, basis: "ఆషాఢ మాసం శ్రీ మహాంకాళి పూజ" }
    ],
    8: [
      { name: "Varalakshmi Vratam", telName: "శ్రావణ వరలక్ష్మి వ్రతం", day: 21, basis: "శ్రావణ పూర్ణిమ ముందు శుక్రవారం" },
      { name: "Rakhi Purnima", telName: "రాఖీ పౌర్ణమి / శ్రావణ పూర్ణిమ", day: 27, basis: "శ్రావణ శుద్ధ పౌర్ణమి" }
    ],
    9: [
      { name: "Sri Krishna Janmashtami", telName: "శ్రీకృష్ణ జన్మాష్టమి (ఉట్లోత్సవం)", day: 4, basis: "శ్రావణ బహుళ అష్టమి" },
      { name: "Vinayaka Chavithi", telName: "వినాయక చవితి (గణపతి నవరాత్రులు)", day: 14, basis: "భాద్రపద శుద్ధ చవితి" }
    ],
    10: [
      { name: "Mahalaya Amavasya", telName: "మహాలయ అమావాస్య (పితృదేవతల తర్పణం)", day: 10, basis: "భాద్రపద బహుళ అమావాస్య" },
      { name: "Bathukamma Begins", telName: "ఎంగిలిపూల బతుకమ్మ (పూల పండుగ)", day: 11, basis: "ఆశ్వయుజ శుద్ధ పాడ్యమి" },
      { name: "Devi Navaratri Begins", telName: "దేవీ శరన్నవరాత్రులు ప్రారంభం", day: 11, basis: "విజయవాడ కనకదుర్గాలంకారాలు" },
      { name: "Saddula Bathukamma", telName: "సద్దుల బతుకమ్మ (మహా సంబరం)", day: 19, basis: "ఆశ్వయుజ దుర్గాష్టమి" },
      { name: "Vijaya Dashami (Dussehra)", telName: "విజయదశమి (దసరా - శమీ పూజ)", day: 20, basis: "ఆశ్వయుజ శుద్ధ దశమి" }
    ],
    11: [
      { name: "Deepavali", telName: "దీపావళి (దివ్య దీపోత్సవం)", day: 8, basis: "ఆశ్వయుజ బహుళ అమావాస్య" },
      { name: "Nagula Chavithi", telName: "నాగుల చవితి", day: 13, basis: "కార్తీక శుద్ధ చవితి" },
      { name: "Karthika Deepotsavam", telName: "కార్తీక పౌర్ణమి (దీపోత్సవం)", day: 23, basis: "కార్తీక శుద్ధ పౌర్ణమి" }
    ],
    12: [
      { name: "Subrahmanya Sashti", telName: "సుబ్రహ్మణ్య షష్ఠి", day: 14, basis: "మార్గశిర శుద్ధ షష్ఠి" },
      { name: "Mukkoti / Vaikunta Ekadashi", telName: "ముక్కోటి ఏకాదశి (వైకుంఠ ద్వార దర్శనం)", day: 20, basis: "మార్గశిర శుద్ధ ఏకాదశి" }
    ]
  },
  2027: {
    1: [
      { name: "Bhogi", telName: "భోగి పండుగ", day: 14, basis: "ధనుర్మాస ముగింపు" },
      { name: "Makara Sankranti", telName: "మకర సంక్రాంతి", day: 15, basis: "సూర్య సంక్రమణం" },
      { name: "Kanuma", telName: "కనుమ పండుగ", day: 16, basis: "పశువుల పండుగ" }
    ],
    2: [
      { name: "Ratha Sapthami", telName: "రథసప్తమి", day: 13, basis: "మాఘ శుద్ధ సప్తమి" }
    ],
    3: [
      { name: "Maha Shivaratri", telName: "మహాశివరాత్రి", day: 6, basis: "మాఘ చతుర్దశి" },
      { name: "Holi / Kamadahana", telName: "హోలీ", day: 22, basis: "ఫాల్గుణ పౌర్ణమి" }
    ],
    4: [
      { name: "Ugadi - Telugu New Year", telName: "ఉగాది (ప్లవంగ నామ సంవత్సరం)", day: 7, basis: "చైత్ర శుద్ధ పాడ్యమి" },
      { name: "Sri Rama Navami", telName: "శ్రీరామనవమి", day: 15, basis: "చైత్ర శుద్ధ నవమి" }
    ],
    5: [
      { name: "Akshaya Tritiya", telName: "అక్షయ తృతీయ", day: 9, basis: "వైశాఖ తృతీయ" },
      { name: "Narasimha Jayanti", telName: "నృసింహ జయంతి", day: 20, basis: "వైశాఖ చతుర్దశి" }
    ],
    7: [
      { name: "Guru Purnima", telName: "గురు పౌర్ణమి", day: 18, basis: "ఆషాఢ పూర్ణిమ" },
      { name: "Telangana Bonalu Begins", telName: "బోనాలు", day: 4, basis: "ఆషాఢ మాసం" }
    ],
    8: [
      { name: "Varalakshmi Vratam", telName: "వరలక్ష్మి వ్రతం", day: 13, basis: "శ్రావణ శుక్రవారం" },
      { name: "Rakhi Purnima", telName: "రాఖీ పౌర్ణమి", day: 17, basis: "శ్రావణ పౌర్ణమి" },
      { name: "Sri Krishna Janmashtami", telName: "శ్రీకృష్ణ జన్మాష్టమి", day: 24, basis: "శ్రావణ అష్టమి" }
    ],
    9: [
      { name: "Vinayaka Chavithi", telName: "వినాయక చవితి", day: 4, basis: "భాద్రపద చవితి" },
      { name: "Mahalaya Amavasya", telName: "మహాలయ అమావాస్య", day: 29, basis: "పితృ అమావాస్య" },
      { name: "Bathukamma Begins", telName: "బతుకమ్మ ప్రారంభం", day: 30, basis: "ఆశ్వయుజ పాడ్యమి" }
    ],
    10: [
      { name: "Saddula Bathukamma", telName: "సద్దుల బతుకమ్మ", day: 8, basis: "దుర్గాష్టమి" },
      { name: "Vijaya Dashami (Dussehra)", telName: "విజయదశమి (దసరా)", day: 10, basis: "ఆశ్వయుజ దశమి" },
      { name: "Deepavali", telName: "దీపావళి", day: 28, basis: "అమావాస్య" }
    ],
    11: [
      { name: "Nagula Chavithi", telName: "నాగుల చవితి", day: 3, basis: "కార్తీక చవితి" },
      { name: "Karthika Deepotsavam", telName: "కార్తీక పౌర్ణమి", day: 13, basis: "కార్తీక పౌర్ణమి" }
    ],
    12: [
      { name: "Mukkoti / Vaikunta Ekadashi", telName: "ముక్కోటి ఏకాదశి", day: 9, basis: "మార్గశిర ఏకాదశి" }
    ]
  }
};

export const getTeluguFestivalsForYear = (year) => {
  const yr = Number(year) || 2026;
  const rawMonths = TELUGU_FESTIVALS_BY_YEAR[yr] || TELUGU_FESTIVALS_BY_YEAR[2026];

  const result = [];
  for (let m = 1; m <= 12; m++) {
    const festList = rawMonths[m] || [];
    const formatted = festList.map(item => {
      const dt = new Date(yr, m - 1, item.day);
      const weekday = WEEKDAYS_EN[dt.getDay()];
      const monthStr = MONTHS_EN[m - 1];
      const dateStr = `${monthStr} ${item.day}, ${yr}, ${weekday}`;

      return {
        name: item.name,
        telName: item.telName,
        dateStr: dateStr,
        day: item.day,
        year: yr,
        basis: item.basis,
        imageUrl: "/yantra/Sri yantra.jpg"
      };
    });

    result.push({
      monthNum: m,
      monthName: `${MONTHS_EN[m - 1]} ${yr}`,
      festivals: formatted
    });
  }

  return result;
};

