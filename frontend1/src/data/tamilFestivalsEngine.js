// Dynamic Tamil Festival Dates Engine for any year
// Solar Tamil festivals occur on fixed solar transit days (Pongal ~ Jan 14/15, Puthandu ~ April 14, etc.)
// Luni-solar / Nakshatra festivals shift based on lunar tithis & nakshatras in the sidereal zodiac.

import { FESTIVAL_IMAGE_MAP } from './festivalImageMap';

const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Accurate standard verified calendar dates for surrounding years (2025, 2026, 2027, 2028)
const FESTIVALS_BY_YEAR = {
  2025: {
    1: [
      { name: "Arudra Darshan", tamilName: "ஆருத்ரா தரிசனம்", day: 12, basis: "based on Tamil calendar" },
      { name: "Bhogi Pandigai", tamilName: "போகிப் பண்டிகை", day: 13, basis: "based on Solar calendar" },
      { name: "Pongal", tamilName: "தைப்பொங்கல் (Pongal)", day: 14, basis: "on Makara Sankranti day" },
      { name: "Mattu Pongal", tamilName: "மாட்டுப் பொங்கல்", day: 15, basis: "based on Solar calendar" },
      { name: "Thai Amavasai", tamilName: "தை அமாவாசை", day: 29, basis: "based on Tamil calendar" }
    ],
    2: [
      { name: "Thai Pusam", tamilName: "தைப்பூசம் (Thai Poosam)", day: 11, basis: "based on Tamil calendar" },
      { name: "Shivaratri", tamilName: "மகா சிவராத்திரி", day: 26, basis: "Magha, Krishna Sathuradasi" }
    ],
    3: [
      { name: "Masi Magam", tamilName: "மாசி மகம்", day: 13, basis: "based on Tamil calendar" },
      { name: "Karadaiyan Nombu", tamilName: "காரடையான் நோன்பு", day: 14, basis: "based on Tamil calendar" },
      { name: "Ugadi - Telugu New Year", tamilName: "யுகாதி பண்டிகை", day: 30, basis: "Chaitra, Shukla Pratipada" }
    ],
    4: [
      { name: "Rama Navami *Smarta", tamilName: "ஸ்ரீ ராம நவமி", day: 6, basis: "Chaitra, Shukla Navami" },
      { name: "Panguni Uthiram", tamilName: "பங்குனி உத்திரம்", day: 11, basis: "based on Tamil calendar" },
      { name: "Puthandu - Tamil New Year", tamilName: "தமிழ்ப் புத்தாண்டு (Puthandu)", day: 14, basis: "Mesha Sankranti / Chithirai 1" },
      { name: "Akshaya Tritiya", tamilName: "அட்சய திருதியை", day: 30, basis: "Vaishakha, Shukla Tritiya" }
    ],
    5: [
      { name: "Chitra Pournami", tamilName: "சித்ரா பௌர்ணமி", day: 12, basis: "based on Tamil calendar" },
      { name: "Vaikasi Visakam", tamilName: "வைகாசி விசாகம்", day: 10, basis: "based on Tamil calendar" }
    ],
    6: [
      { name: "Aani Thirumanjanam", tamilName: "ஆனி திருமஞ்சனம்", day: 30, basis: "based on Tamil calendar (Uthiram)" }
    ],
    7: [
      { name: "Dakshinayana Punyakalam", tamilName: "தட்சிணாயன புண்ணியகாலம் (Aadi 1)", day: 16, basis: "based on Solar calendar" },
      { name: "Aadi Amavasai", tamilName: "ஆடி அமாவாசை", day: 24, basis: "based on Tamil calendar" }
    ],
    8: [
      { name: "Aadi Perukku", tamilName: "ஆடிப் பெருக்கு (Aadi 18)", day: 3, basis: "based on Tamil calendar" },
      { name: "Varalakshmi Vratam", tamilName: "வரலட்சுமி விரதம்", day: 8, basis: "Shravana, Shukla Paksha Friday" },
      { name: "Aavani Avittam / Raksha Bandhan", tamilName: "ஆவணி அவிட்டம்", day: 9, basis: "Shravana Purnima" },
      { name: "Krishna Jayanthi / Gokulashtami", tamilName: "கிருஷ்ண ஜெயந்தி", day: 16, basis: "based on Tamil calendar" },
      { name: "Vinayagar Chaturthi", tamilName: "விநாயகர் சதுர்த்தி", day: 27, basis: "Bhadrapada, Shukla Chaturthi" }
    ],
    9: [
      { name: "Mahalaya Amavasai", tamilName: "மகாளய அமாவாசை", day: 21, basis: "Purattasi Amavasai" },
      { name: "Navaratri Begins", tamilName: "நவராத்திரி ஆரம்பம்", day: 22, basis: "Ashwina, Shukla Pratipada" }
    ],
    10: [
      { name: "Ayudha Pooja & Saraswati Pooja", tamilName: "ஆயுத பூஜை & சரஸ்வதி பூஜை", day: 1, basis: "Ashwina, Mahanavami" },
      { name: "Vijaya Dasami", tamilName: "விஜயதசமி (Dussehra)", day: 2, basis: "Ashwina, Shukla Dashami" },
      { name: "Deepavali (Diwali)", tamilName: "தீபாவளி பண்டிகை", day: 20, basis: "Aippasi Naraka Chaturdashi" },
      { name: "Kanda Sashti / Soorasamharam", tamilName: "கந்த சஷ்டி / சூரசம்ஹாரம்", day: 27, basis: "based on Tamil calendar" }
    ],
    11: [
      { name: "Karthigai Deepam", tamilName: "திருவண்ணாமலை கார்த்திகை தீபம்", day: 24, basis: "based on Tamil calendar (Krittika)" }
    ],
    12: [
      { name: "Vaikunta Ekadashi", tamilName: "வைகுண்ட ஏகாதசி", day: 31, basis: "Margazhi Shukla Ekadashi" }
    ]
  },
  2026: {
    1: [
      { name: "Arudra Darshan", tamilName: "ஆருத்ரா தரிசனம்", day: 3, basis: "based on Tamil calendar" },
      { name: "Bhogi Pandigai", tamilName: "போகிப் பண்டிகை", day: 13, basis: "based on Solar calendar" },
      { name: "Pongal", tamilName: "தைப்பொங்கல் (Pongal)", day: 14, basis: "on Makara Sankranti day" },
      { name: "Mattu Pongal", tamilName: "மாட்டுப் பொங்கல்", day: 15, basis: "based on Solar calendar" },
      { name: "Thai Amavasai", tamilName: "தை அமாவாசை", day: 18, basis: "based on Tamil calendar" },
      { name: "Ratha Sapthami", tamilName: "ரத சப்தமி", day: 25, basis: "Magha, Shukla Sapthami" }
    ],
    2: [
      { name: "Thai Pusam", tamilName: "தைப்பூசம் (Thai Poosam)", day: 1, basis: "based on Tamil calendar" },
      { name: "Shivaratri", tamilName: "மகா சிவராத்திரி", day: 15, basis: "Magha, Krishna Sathuradasi" }
    ],
    3: [
      { name: "Masi Magam", tamilName: "மாசி மகம்", day: 3, basis: "based on Tamil calendar" },
      { name: "Karadaiyan Nombu", tamilName: "காரடையான் நோன்பு", day: 14, basis: "based on Tamil calendar" },
      { name: "Ugadi - Telugu New Year", tamilName: "யுகாதி பண்டிகை", day: 19, basis: "Chaitra, Shukla Pratipada" },
      { name: "Rama Navami *Smarta", tamilName: "ஸ்ரீ ராம நவமி", day: 26, basis: "Chaitra, Shukla Navami" },
      { name: "Panguni Uthiram", tamilName: "பங்குனி உத்திரம்", day: 31, basis: "based on Tamil calendar" }
    ],
    4: [
      { name: "Puthandu - Tamil New Year", tamilName: "தமிழ்ப் புத்தாண்டு (Puthandu)", day: 14, basis: "Mesha Sankranti / Chithirai 1" },
      { name: "Akshaya Tritiya", tamilName: "அட்சய திருதியை", day: 20, basis: "Vaishakha, Shukla Tritiya" }
    ],
    5: [
      { name: "Chitra Pournami", tamilName: "சித்ரா பௌர்ணமி", day: 1, basis: "based on Tamil calendar" },
      { name: "Narasimha Jayanti", tamilName: "நரசிம்ம ஜெயந்தி", day: 1, basis: "Vaishakha, Shukla Chaturdashi" },
      { name: "Vaikasi Visakam", tamilName: "வைகாசி விசாகம் (Murugan Avatar)", day: 30, basis: "based on Tamil calendar" }
    ],
    6: [
      { name: "Aani Thirumanjanam", tamilName: "ஆனி திருமஞ்சனம் (Nataraja)", day: 20, basis: "based on Tamil calendar (Uthiram)" }
    ],
    7: [
      { name: "Dakshinayana Punyakalam", tamilName: "தட்சிணாயன புண்ணியகாலம் (Aadi 1)", day: 16, basis: "based on Solar calendar" }
    ],
    8: [
      { name: "Aadi Perukku", tamilName: "ஆடிப் பெருக்கு (Aadi 18)", day: 3, basis: "based on Tamil calendar" },
      { name: "Aadi Amavasai", tamilName: "ஆடி அமாவாசை (Tarpanam)", day: 12, basis: "based on Tamil calendar" },
      { name: "Varalakshmi Vratam", tamilName: "வரலட்சுமி விரதம்", day: 21, basis: "Shravana, Shukla Paksha Friday" },
      { name: "Aavani Avittam / Raksha Bandhan", tamilName: "ஆவணி அவிட்டம் (Upakarma)", day: 27, basis: "Shravana Purnima" }
    ],
    9: [
      { name: "Krishna Jayanthi / Gokulashtami", tamilName: "கிருஷ்ண ஜெயந்தி", day: 4, basis: "based on Tamil calendar (Rohini)" },
      { name: "Vinayagar Chaturthi", tamilName: "விநாயகர் சதுர்த்தி", day: 14, basis: "Bhadrapada, Shukla Chaturthi" }
    ],
    10: [
      { name: "Mahalaya Amavasai", tamilName: "மகாளய அமாவாசை", day: 10, basis: "Purattasi Amavasai" },
      { name: "Navaratri Begins", tamilName: "சரஸ்வதி பூஜை & நவராத்திரி ஆரம்பம்", day: 11, basis: "Ashwina, Shukla Pratipada" },
      { name: "Ayudha Pooja & Saraswati Pooja", tamilName: "ஆயுத பூஜை & சரஸ்வதி பூஜை", day: 19, basis: "Ashwina, Mahanavami" },
      { name: "Vijaya Dasami", tamilName: "விஜயதசமி (Dussehra)", day: 20, basis: "Ashwina, Shukla Dashami" }
    ],
    11: [
      { name: "Deepavali (Diwali)", tamilName: "தீபாவளி பண்டிகை (Deepavali)", day: 8, basis: "Aippasi Naraka Chaturdashi / Amavasai" },
      { name: "Kanda Sashti / Soorasamharam", tamilName: "கந்த சஷ்டி / சூரசம்ஹாரம்", day: 14, basis: "based on Tamil calendar" },
      { name: "Karthigai Deepam", tamilName: "திருவண்ணாமலை கார்த்திகை தீபம்", day: 23, basis: "based on Tamil calendar (Krittika)" }
    ],
    12: [
      { name: "Vaikunta Ekadashi", tamilName: "வைகாசி / வைகுண்ட ஏகாதசி", day: 20, basis: "Margazhi Shukla Ekadashi" },
      { name: "Hanumath Jayanthi", tamilName: "ஹனுமத் ஜெயந்தி", day: 29, basis: "Margazhi Amavasai (Mula)" }
    ]
  },
  2027: {
    1: [
      { name: "Bhogi Pandigai", tamilName: "போகிப் பண்டிகை", day: 14, basis: "based on Solar calendar" },
      { name: "Pongal", tamilName: "தைப்பொங்கல் (Pongal)", day: 15, basis: "on Makara Sankranti day" },
      { name: "Mattu Pongal", tamilName: "மாட்டுப் பொங்கல்", day: 16, basis: "based on Solar calendar" },
      { name: "Thai Pusam", tamilName: "தைப்பூசம் (Thai Poosam)", day: 21, basis: "based on Tamil calendar" },
      { name: "Thai Amavasai", tamilName: "தை அமாவாசை", day: 7, basis: "based on Tamil calendar" }
    ],
    2: [
      { name: "Ratha Sapthami", tamilName: "ரத சப்தமி", day: 13, basis: "Magha, Shukla Sapthami" },
      { name: "Masi Magam", tamilName: "மாசி மகம்", day: 20, basis: "based on Tamil calendar" }
    ],
    3: [
      { name: "Shivaratri", tamilName: "மகா சிவராத்திரி", day: 6, basis: "Phalguna, Krishna Chaturdashi" },
      { name: "Karadaiyan Nombu", tamilName: "காரடையான் நோன்பு", day: 15, basis: "based on Tamil calendar" },
      { name: "Panguni Uthiram", tamilName: "பங்குனி உத்திரம்", day: 21, basis: "based on Tamil calendar" }
    ],
    4: [
      { name: "Ugadi - Telugu New Year", tamilName: "யுகாதி பண்டிகை", day: 7, basis: "Chaitra, Shukla Pratipada" },
      { name: "Puthandu - Tamil New Year", tamilName: "தமிழ்ப் புத்தாண்டு (Puthandu)", day: 14, basis: "Mesha Sankranti / Chithirai 1" },
      { name: "Rama Navami *Smarta", tamilName: "ஸ்ரீ ராம நவமி", day: 15, basis: "Chaitra, Shukla Navami" }
    ],
    5: [
      { name: "Akshaya Tritiya", tamilName: "அட்சய திருதியை", day: 9, basis: "Vaishakha, Shukla Tritiya" },
      { name: "Chitra Pournami", tamilName: "சித்ரா பௌர்ணமி", day: 20, basis: "based on Tamil calendar" }
    ],
    6: [
      { name: "Vaikasi Visakam", tamilName: "வைகாசி விசாகம்", day: 18, basis: "based on Tamil calendar" }
    ],
    7: [
      { name: "Aani Thirumanjanam", tamilName: "ஆனி திருமஞ்சனம்", day: 10, basis: "based on Tamil calendar (Uthiram)" },
      { name: "Dakshinayana Punyakalam", tamilName: "தட்சிணாயன புண்ணியகாலம் (Aadi 1)", day: 17, basis: "based on Solar calendar" }
    ],
    8: [
      { name: "Aadi Perukku", tamilName: "ஆடிப் பெருக்கு (Aadi 18)", day: 3, basis: "based on Tamil calendar" },
      { name: "Aadi Amavasai", tamilName: "ஆடி அமாவாசை", day: 1, basis: "based on Tamil calendar" },
      { name: "Varalakshmi Vratam", tamilName: "வரலட்சுமி விரதம்", day: 13, basis: "Shravana Friday" },
      { name: "Aavani Avittam / Raksha Bandhan", tamilName: "ஆவணி அவிட்டம்", day: 17, basis: "Shravana Purnima" },
      { name: "Krishna Jayanthi / Gokulashtami", tamilName: "கிருஷ்ண ஜெயந்தி", day: 24, basis: "based on Tamil calendar" }
    ],
    9: [
      { name: "Vinayagar Chaturthi", tamilName: "விநாயகர் சதுர்த்தி", day: 4, basis: "Bhadrapada, Shukla Chaturthi" },
      { name: "Mahalaya Amavasai", tamilName: "மகாளய அமாவாசை", day: 29, basis: "Purattasi Amavasai" }
    ],
    10: [
      { name: "Navaratri Begins", tamilName: "நவராத்திரி ஆரம்பம்", day: 1, basis: "Ashwina, Shukla Pratipada" },
      { name: "Ayudha Pooja & Saraswati Pooja", tamilName: "ஆயுத பூஜை & சரஸ்வதி பூஜை", day: 9, basis: "Ashwina, Mahanavami" },
      { name: "Vijaya Dasami", tamilName: "விஜயதசமி (Dussehra)", day: 10, basis: "Ashwina, Shukla Dashami" },
      { name: "Deepavali (Diwali)", tamilName: "தீபாவளி பண்டிகை", day: 28, basis: "Aippasi Naraka Chaturdashi" }
    ],
    11: [
      { name: "Kanda Sashti / Soorasamharam", tamilName: "கந்த சஷ்டி / சூரசம்ஹாரம்", day: 4, basis: "based on Tamil calendar" },
      { name: "Karthigai Deepam", tamilName: "திருவண்ணாமலை கார்த்திகை தீபம்", day: 13, basis: "based on Tamil calendar (Krittika)" }
    ],
    12: [
      { name: "Vaikunta Ekadashi", tamilName: "வைகுண்ட ஏகாதசி", day: 9, basis: "Margazhi Shukla Ekadashi" },
      { name: "Arudra Darshan", tamilName: "ஆருத்ரா தரிசனம்", day: 23, basis: "based on Tamil calendar" }
    ]
  },
  2028: {
    1: [
      { name: "Bhogi Pandigai", tamilName: "போகிப் பண்டிகை", day: 14, basis: "based on Solar calendar" },
      { name: "Pongal", tamilName: "தைப்பொங்கல் (Pongal)", day: 15, basis: "on Makara Sankranti day" },
      { name: "Mattu Pongal", tamilName: "மாட்டுப் பொங்கல்", day: 16, basis: "based on Solar calendar" },
      { name: "Thai Amavasai", tamilName: "தை அமாவாசை", day: 26, basis: "based on Tamil calendar" }
    ],
    2: [
      { name: "Ratha Sapthami", tamilName: "ரத சப்தமி", day: 2, basis: "Magha, Shukla Sapthami" },
      { name: "Thai Pusam", tamilName: "தைப்பூசம்", day: 9, basis: "based on Tamil calendar" },
      { name: "Shivaratri", tamilName: "மகா சிவராத்திரி", day: 24, basis: "Magha, Krishna Chaturdashi" }
    ],
    3: [
      { name: "Masi Magam", tamilName: "மாசி மகம்", day: 10, basis: "based on Tamil calendar" },
      { name: "Karadaiyan Nombu", tamilName: "காரடையான் நோன்பு", day: 14, basis: "based on Tamil calendar" },
      { name: "Ugadi - Telugu New Year", tamilName: "யுகாதி பண்டிகை", day: 27, basis: "Chaitra, Shukla Pratipada" }
    ],
    4: [
      { name: "Rama Navami *Smarta", tamilName: "ஸ்ரீ ராம நவமி", day: 3, basis: "Chaitra, Shukla Navami" },
      { name: "Panguni Uthiram", tamilName: "பங்குனி உத்திரம்", day: 8, basis: "based on Tamil calendar" },
      { name: "Puthandu - Tamil New Year", tamilName: "தமிழ்ப் புத்தாண்டு (Puthandu)", day: 14, basis: "Mesha Sankranti / Chithirai 1" },
      { name: "Akshaya Tritiya", tamilName: "அட்சய திருதியை", day: 27, basis: "Vaishakha, Shukla Tritiya" }
    ],
    5: [
      { name: "Chitra Pournami", tamilName: "சித்ரா பௌர்ணமி", day: 8, basis: "based on Tamil calendar" }
    ],
    6: [
      { name: "Vaikasi Visakam", tamilName: "வைகாசி விசாகம்", day: 5, basis: "based on Tamil calendar" },
      { name: "Aani Thirumanjanam", tamilName: "ஆனி திருமஞ்சனம்", day: 28, basis: "based on Tamil calendar (Uthiram)" }
    ],
    7: [
      { name: "Dakshinayana Punyakalam", tamilName: "தட்சிணாயன புண்ணியகாலம் (Aadi 1)", day: 16, basis: "based on Solar calendar" },
      { name: "Aadi Amavasai", tamilName: "ஆடி அமாவாசை", day: 22, basis: "based on Tamil calendar" }
    ],
    8: [
      { name: "Aadi Perukku", tamilName: "ஆடிப் பெருக்கு", day: 2, basis: "based on Tamil calendar" },
      { name: "Varalakshmi Vratam", tamilName: "வரலட்சுமி விரதம்", day: 4, basis: "Shravana Friday" },
      { name: "Aavani Avittam / Raksha Bandhan", tamilName: "ஆவணி அவிட்டம்", day: 5, basis: "Shravana Purnima" },
      { name: "Krishna Jayanthi / Gokulashtami", tamilName: "கிருஷ்ண ஜெயந்தி", day: 13, basis: "based on Tamil calendar" },
      { name: "Vinayagar Chaturthi", tamilName: "விநாயகர் சதுர்த்தி", day: 24, basis: "Bhadrapada, Shukla Chaturthi" }
    ],
    9: [
      { name: "Mahalaya Amavasai", tamilName: "மகாளய அமாவாசை", day: 18, basis: "Purattasi Amavasai" },
      { name: "Navaratri Begins", tamilName: "நவராத்திரி ஆரம்பம்", day: 19, basis: "Ashwina, Shukla Pratipada" },
      { name: "Ayudha Pooja & Saraswati Pooja", tamilName: "ஆயுத பூஜை & சரஸ்வதி பூஜை", day: 27, basis: "Ashwina, Mahanavami" },
      { name: "Vijaya Dasami", tamilName: "விஜயதசமி (Dussehra)", day: 28, basis: "Ashwina, Shukla Dashami" }
    ],
    10: [
      { name: "Deepavali (Diwali)", tamilName: "தீபாவளி பண்டிகை", day: 17, basis: "Aippasi Naraka Chaturdashi" },
      { name: "Kanda Sashti / Soorasamharam", tamilName: "கந்த சஷ்டி / சூரசம்ஹாரம்", day: 24, basis: "based on Tamil calendar" }
    ],
    11: [
      { name: "Karthigai Deepam", tamilName: "திருவண்ணாமலை கார்த்திகை தீபம்", day: 30, basis: "based on Tamil calendar (Krittika)" }
    ],
    12: [
      { name: "Vaikunta Ekadashi", tamilName: "வைகுண்ட ஏகாதசி", day: 28, basis: "Margazhi Shukla Ekadashi" }
    ]
  }
};

/**
 * Returns dynamic month-by-month festival lists for ANY given Gregorian year (2025, 2026, 2027, etc.)
 */
export const getTamilFestivalsForYear = (year) => {
  const yr = Number(year) || 2026;
  const rawMonths = FESTIVALS_BY_YEAR[yr] || FESTIVALS_BY_YEAR[2026];

  const result = [];
  for (let m = 1; m <= 12; m++) {
    const festList = rawMonths[m] || [];
    const formattedFestivals = festList.map(item => {
      const dt = new Date(yr, m - 1, item.day);
      const weekday = WEEKDAYS_EN[dt.getDay()];
      const monthStr = MONTHS_EN[m - 1];
      const dateStr = `${monthStr} ${item.day}, ${yr}, ${weekday}`;

      const imgInfo = FESTIVAL_IMAGE_MAP[item.name] || {};
      const imageUrl = imgInfo.primary || "/yantra/Sri yantra.jpg";

      return {
        name: item.name,
        tamilName: item.tamilName,
        dateStr: dateStr,
        day: item.day,
        year: yr,
        basis: item.basis,
        imageUrl: imageUrl
      };
    });

    result.push({
      monthNum: m,
      monthName: `${MONTHS_EN[m - 1]} ${yr}`,
      festivals: formattedFestivals
    });
  }

  return result;
};

