// Dynamic Kerala Malayalam Festival Dates Engine for any year
// Solar & Lunar Kerala Observances: Vishu, Onam (Thiruvonam), Makaravilakku, Attukal Pongala, Thrissur Pooram, etc.

const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const KERALA_FESTIVALS_BY_YEAR = {
  2025: {
    1: [
      { name: "Makaravilakku (Sabarimala)", malName: "മകരവിളക്ക് (ശബരിമല)", day: 14, basis: "Makara Sankramam" },
      { name: "Thaipooyam", malName: "തൈപ്പൂയം", day: 25, basis: "Pushya Nakshatra" }
    ],
    2: [
      { name: "Aluva Sivarathri", malName: "ആലുവ ശിവരാത്രി", day: 26, basis: "Kumbham, Krishna Chaturdashi" },
      { name: "Attukal Pongala", malName: "ആറ്റുകാൽ പൊങ്കാല", day: 24, basis: "Karthika Nakshatra" }
    ],
    3: [
      { name: "Kodungallur Bharani", malName: "കൊടുങ്ങല്ലൂർ ഭരണി", day: 24, basis: "Meenam, Bharani" }
    ],
    4: [
      { name: "Vishu (വിഷുക്കണി)", malName: "വിഷുക്കണി & കൈനീട്ടം", day: 14, basis: "Medam 1 (Solar New Year)" },
      { name: "Thrissur Pooram", malName: "തൃശ്ശൂർ പൂരം", day: 30, basis: "Medam, Pooram Nakshatra" }
    ],
    5: [
      { name: "Kurma Jayanti", malName: "കൂർമ്മ ജയന്തി (ശ്രീ മഹാവിഷ്ണു അവതാരം)", day: 11, basis: "Vaisakha Purnima (കൂര്‍മ്മാവതാര ദിനം)" },
      { name: "Chitra Pournami", malName: "ചിത്രാ പൗർണ്ണമി", day: 12, basis: "Chithira Nakshatra, Pournami" },
      { name: "Itavam Sankramam", malName: "ഇടവം സംക്രമം (ഇടവ മാസാചരണം)", day: 15, basis: "Sun enters Edavam (Vrishabha) Rasi" }
    ],
    6: [
      { name: "Mithunam Sankramam", malName: "മിഥുനം സംക്രമം (മിഥുന മാസം 1)", day: 15, basis: "Sun enters Mithunam (Gemini) Rasi" },
      { name: "Ochira Kali", malName: "ഓച്ചിറക്കളി മഹോത്സവം", day: 15, basis: "Mithunam 1 & 2 (പടനിലത്തെ യുദ്ധനൃത്തം)" }
    ],
    7: [
      { name: "Karkidaka Vavu Bali", malName: "കർക്കടക വാവുബലി", day: 24, basis: "Karkidakam Amavasya (പിതൃതർപ്പണം)" },
      { name: "Ramayana Masam Begins", malName: "രാമായണ മാസാചരണം", day: 17, basis: "Karkidakam 1" }
    ],
    8: [
      { name: "Nira Puthari", malName: "നിറപുത്തരി", day: 15, basis: "Chingam 1 auspicious harvest" },
      { name: "Chingam 1 (Malayalam New Year)", malName: "ചിങ്ങം 1 (കർഷക ദിനം)", day: 17, basis: "Kollavarsham New Year" }
    ],
    9: [
      { name: "Thiruvonam (Onam)", malName: "തിരുവോണം (ഓണം)", day: 5, basis: "Chingam, Thiruvonam Nakshatra" },
      { name: "Sree Krishna Jayanthi", malName: "ശ്രീകൃഷ്ണ ജയന്തി (അഷ്ടമിരോഹിണി)", day: 14, basis: "Rohini Nakshatra" }
    ],
    10: [
      { name: "Vidyarambham / Pooja Eduppu", malName: "വിദ്യാരംഭം (എഴുത്തിനിരുത്ത്)", day: 2, basis: "Mahanavami / Vijayadashami" }
    ],
    11: [
      { name: "Mandala Kalam Begins", malName: "മണ്ഡലകാലാരംഭം (ശബരിമല വ്രതം)", day: 17, basis: "Vrischikam 1" },
      { name: "Guruvayur Ekadashi", malName: "ഗുരുവായൂർ ഏകാദശി", day: 30, basis: "Vrischikam Shukla Ekadashi" }
    ],
    12: [
      { name: "Thiruvathira (Dhanu)", malName: "ധനു തിരുവാതിര", day: 23, basis: "Dhanu, Thiruvathira Nakshatra" }
    ]
  },
  2026: {
    1: [
      { name: "Makaravilakku (Sabarimala)", malName: "മകരവിളക്ക് (ശബരിമല ദർശനം)", day: 14, basis: "Makara Sankramam day" },
      { name: "Thaipooyam", malName: "തൈപ്പൂയം", day: 29, basis: "Makaram, Pooyam Nakshatra" }
    ],
    2: [
      { name: "Aluva Sivarathri", malName: "ആലുവ ശിവരാത്രി (മണപ്പുറം)", day: 15, basis: "Kumbham, Krishna Chaturdashi" },
      { name: "Attukal Pongala", malName: "ആറ്റുകാൽ പൊങ്കാല മഹോത്സവം", day: 23, basis: "Kumbham, Pooram Nakshatra" }
    ],
    3: [
      { name: "Kodungallur Bharani", malName: "കൊടുങ്ങല്ലൂർ കാവുതീണ്ടൽ & ഭരണി", day: 19, basis: "Meenam, Bharani Nakshatra" },
      { name: "Painkuni Uthram", malName: "പൈങ്കുനി ഉത്രം", day: 31, basis: "Meenam, Uthram" }
    ],
    4: [
      { name: "Vishu (വിഷുക്കണി)", malName: "വിഷുക്കണി & വിഷു കൈനീട്ടം", day: 14, basis: "Medam 1 (സൗരമാന വിഷു)" },
      { name: "Thrissur Pooram", malName: "തൃശ്ശൂർ പൂരം (കുടമാറ്റം)", day: 25, basis: "Medam, Pooram Nakshatra" }
    ],
    5: [
      { name: "Chitra Pournami", malName: "ചിത്രാ പൗർണ്ണമി (ചിത്രഗുപ്ത പൂജ)", day: 1, basis: "Chitra Nakshatra, Pournami" },
      { name: "Kurma Jayanti", malName: "കൂർമ്മ ജയന്തി (മഹാവിഷ്ണു കൂർമ്മാവതാരം)", day: 1, basis: "Vaisakham, Shukla Pournami" },
      { name: "Itavam Sankramam", malName: "ഇടവം സംക്രമം (ഇടവ മാസം 1)", day: 15, basis: "സൂര്യൻ ഇടവം രാശിയിലേക്ക് പ്രവേശിക്കുന്നു (Edavam 1)" }
    ],
    6: [
      { name: "Mithunam Sankramam", malName: "മിഥുനം സംക്രമം (മിഥുന മാസം 1)", day: 15, basis: "സൂര്യൻ മിഥുനം രാശിയിലേക്ക് പ്രവേശിക്കുന്നു (Mithunam 1)" },
      { name: "Ochira Kali", malName: "ഓച്ചിറക്കളി മഹോത്സവം", day: 15, basis: "Mithunam 1 & 2 (പടനിലത്തെ ചരിത്രപ്രസിദ്ധമായ കളി)" }
    ],
    7: [
      { name: "Ramayana Masam Begins", malName: "കർക്കടക രാമായണ മാസം ആരംഭം", day: 17, basis: "Karkidakam 1" }
    ],
    8: [
      { name: "Karkidaka Vavu Bali", malName: "കർക്കടക വാവുബലി (പിതൃതർപ്പണം)", day: 12, basis: "Karkidakam Amavasya" },
      { name: "Chingam 1 (Malayalam New Year)", malName: "ചിങ്ങം 1 (മലയാള പുതുവർഷം 1202)", day: 17, basis: "Kollavarsham 1202 ആരംഭം" },
      { name: "First Onam (Uthrada Pacha)", malName: "ഉത്രാട പാച്ചിൽ (ഒന്നാം ഓണം)", day: 25, basis: "Chingam, Uthradam" },
      { name: "Thiruvonam (Onam)", malName: "തിരുവോണം (മഹാബലി വരവേൽപ്പ്)", day: 26, basis: "Chingam, Thiruvonam Nakshatra" }
    ],
    9: [
      { name: "Sree Krishna Jayanthi", malName: "ശ്രീകൃഷ്ണ ജയന്തി (അഷ്ടമിരോഹിണി)", day: 4, basis: "Chingam, Rohini Nakshatra" },
      { name: "Aranmula Vallasadya", malName: "ആറന്മുള ഉത്തൃട്ടാതി വള്ളംകളി", day: 14, basis: "Uthrattathi Nakshatra" }
    ],
    10: [
      { name: "Mahanavami / Pooja Vayppu", malName: "ആയുധപൂജ & പൂജാവെപ്പ്", day: 19, basis: "Kanni, Durgashtami / Mahanavami" },
      { name: "Vidyarambham / Pooja Eduppu", malName: "വിദ്യാരംഭം (അക്ഷരപ്പൂജ)", day: 20, basis: "Vijayadashami day" }
    ],
    11: [
      { name: "Mandala Kalam Begins", malName: "മണ്ഡലകാലാരംഭം (ശബരിമല ദീക്ഷ)", day: 17, basis: "Vrischikam 1 (41 days vratham)" },
      { name: "Guruvayur Ekadashi", malName: "ഗുരുവായൂർ ഏകാദശി വിളക്ക്", day: 20, basis: "Vrischikam, Shukla Ekadashi" }
    ],
    12: [
      { name: "Thiruvathira (Dhanu)", malName: "ധനു തിരുവാതിര (പാതിരാപ്പൂചൂടൽ)", day: 22, basis: "Dhanu, Thiruvathira Nakshatra" }
    ]
  },
  2027: {
    1: [
      { name: "Makaravilakku (Sabarimala)", malName: "മകരവിളക്ക് (ശബരിമല)", day: 15, basis: "Makara Sankramam" },
      { name: "Thaipooyam", malName: "തൈപ്പൂയം", day: 22, basis: "Pooyam Nakshatra" }
    ],
    2: [
      { name: "Attukal Pongala", malName: "ആറ്റുകാൽ പൊങ്കാല", day: 20, basis: "Kumbham, Karthika/Pooram" }
    ],
    3: [
      { name: "Aluva Sivarathri", malName: "ആലുവ ശിവരാത്രി", day: 6, basis: "Kumbham, Krishna Chaturdashi" }
    ],
    4: [
      { name: "Vishu (വിഷുക്കണി)", malName: "വിഷുക്കണി & കൈനീട്ടം", day: 14, basis: "Medam 1" },
      { name: "Thrissur Pooram", malName: "തൃശ്ശൂർ പൂരം", day: 15, basis: "Medam, Pooram Nakshatra" }
    ],
    5: [
      { name: "Itavam Sankramam", malName: "ഇടവം സംക്രമം (ഇടവ മാസം 1)", day: 15, basis: "Sun enters Edavam Rasi" },
      { name: "Chitra Pournami", malName: "ചിത്രാ പൗർണ്ണമി", day: 20, basis: "Chitra Nakshatra, Pournami" },
      { name: "Kurma Jayanti", malName: "കൂർമ്മ ജയന്തി", day: 20, basis: "Vaisakha Pournami" }
    ],
    6: [
      { name: "Mithunam Sankramam", malName: "മിഥുനം സംക്രമം (മിഥുന മാസം 1)", day: 15, basis: "Sun enters Mithunam Rasi" },
      { name: "Ochira Kali", malName: "ഓച്ചിറക്കളി", day: 15, basis: "Mithunam 1 & 2" }
    ],
    7: [
      { name: "Ramayana Masam Begins", malName: "കർക്കടക രാമായണ മാസം", day: 17, basis: "Karkidakam 1" }
    ],
    8: [
      { name: "Karkidaka Vavu Bali", malName: "കർക്കടക വാവുബലി", day: 1, basis: "Karkidakam Amavasya" },
      { name: "Chingam 1 (Malayalam New Year)", malName: "ചിങ്ങം 1 (മലയാള പുതുവർഷം 1203)", day: 17, basis: "Kollavarsham 1203" }
    ],
    9: [
      { name: "Thiruvonam (Onam)", malName: "തിരുവോണം (ഓണം)", day: 12, basis: "Chingam, Thiruvonam" }
    ],
    10: [
      { name: "Vidyarambham", malName: "വിദ്യാരംഭം", day: 10, basis: "Vijayadashami" }
    ],
    11: [
      { name: "Mandala Kalam Begins", malName: "മണ്ഡലകാലാരംഭം", day: 17, basis: "Vrischikam 1" }
    ],
    12: [
      { name: "Thiruvathira (Dhanu)", malName: "ധനു തിരുവാതിര", day: 12, basis: "Dhanu, Thiruvathira" }
    ]
  }
};

export const getMalayalamFestivalsForYear = (year) => {
  const yr = Number(year) || 2026;
  const rawMonths = KERALA_FESTIVALS_BY_YEAR[yr] || KERALA_FESTIVALS_BY_YEAR[2026];

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
        malName: item.malName,
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

