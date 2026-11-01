import React, { useState } from "react";

const PLANET_COLORS = {
  Sun: "#dc2626",
  Moon: "#0284c7",
  Mars: "#ea580c",
  Mercury: "#16a34a",
  Jupiter: "#d97706",
  Venus: "#db2777",
  Saturn: "#475569",
  Rahu: "#4f46e5",
  Ketu: "#7c3aed",
  Ascendant: "#000000",
};

const SIGNS_LIST = [
  { name: "Aries", type: "Movable" },
  { name: "Taurus", type: "Fixed" },
  { name: "Gemini", type: "Dual" },
  { name: "Cancer", type: "Movable" },
  { name: "Leo", type: "Fixed" },
  { name: "Virgo", type: "Dual" },
  { name: "Libra", type: "Movable" },
  { name: "Scorpio", type: "Fixed" },
  { name: "Sagittarius", type: "Dual" },
  { name: "Capricorn", type: "Movable" },
  { name: "Aquarius", type: "Fixed" },
  { name: "Pisces", type: "Dual" },
];

export default function PlanetaryDrishtiSection({ houses, translations }) {
  const [activeTab, setActiveTab] = useState("graha"); // 'graha' or 'jaimini'

  if (!houses) return null;

  // Extract planet positions from houses
  const positions = [];
  Object.entries(houses).forEach(([hNum, hData]) => {
    (hData.planets || []).forEach((p) => {
      const name = typeof p === "string" ? p : p.planet || p.name;
      if (name === "Ascendant" || name === "Lagna" || name === "L") return;
      positions.push({
        planet: name,
        house: parseInt(hNum, 10),
        is_retrograde: p.is_retrograde,
        is_combust: p.is_combust,
      });
    });
  });

  const planetOrder = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  positions.sort((a, b) => planetOrder.indexOf(a.planet) - planetOrder.indexOf(b.planet));

  const tp = (pName) => translations?.planets?.[pName] || pName;
  const ts = (sName) => translations?.signs?.[sName] || sName;

  const getPlanetRelationshipBadge = (aspecting, target) => {
    const friendships = {
      Sun: { friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"], neutral: ["Mercury"] },
      Moon: { friends: ["Sun", "Mercury"], enemies: [], neutral: ["Mars", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"] },
      Mars: { friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"], neutral: ["Venus", "Saturn", "Rahu", "Ketu"] },
      Mercury: { friends: ["Sun", "Venus"], enemies: ["Moon"], neutral: ["Mars", "Jupiter", "Saturn", "Rahu", "Ketu"] },
      Jupiter: { friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"], neutral: ["Saturn", "Rahu", "Ketu"] },
      Venus: { friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"], neutral: ["Mars", "Jupiter", "Rahu", "Ketu"] },
      Saturn: { friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"], neutral: ["Jupiter", "Rahu", "Ketu"] },
      Rahu: { friends: ["Venus", "Saturn", "Mercury"], enemies: ["Sun", "Moon", "Mars", "Jupiter"], neutral: ["Ketu"] },
      Ketu: { friends: ["Venus", "Saturn", "Mercury"], enemies: ["Sun", "Moon", "Mars", "Jupiter"], neutral: ["Rahu"] },
    };

    const list = friendships[aspecting];
    if (!list) return { label: translations?.ui?.neutral || "Neutral (सम)", bg: "bg-slate-100 text-slate-800 border-slate-300" };
    if (list.friends.includes(target)) {
      return { label: translations?.ui?.friendly || "Friendly (मित्र)", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    }
    if (list.enemies.includes(target)) {
      return { label: translations?.ui?.inimical || "Inimical (शत्रु)", bg: "bg-rose-100 text-rose-800 border-rose-300" };
    }
    return { label: translations?.ui?.neutral || "Neutral (सम)", bg: "bg-slate-100 text-slate-800 border-slate-300" };
  };

  const getAspectDetails = (planet, occupiedHouse, relativeAspect) => {
    const targetHouse = ((occupiedHouse + relativeAspect - 2) % 12) + 1;
    let nature = "Benefic";
    let description = "";

    const th = translations?.ui?.thAspect || "th Aspect";
    const hLabel = translations?.ui?.houseLabel || "House";
    const planetName = tp(planet);

    // Multilingual Astrological Interpretations dictionary
    const interpretations = {
      hi: {
        Jupiter_5: `5वीं धर्म दृष्टि (${hLabel} ${targetHouse}): पूर्वजन्म के शुभ कर्म, तीक्ष्ण बुद्धि, रचनात्मक सफलता और आध्यात्मिक उन्नति का आशीर्वाद देती है।`,
        Jupiter_7: `7वीं पूर्ण दृष्टि (${hLabel} ${targetHouse}): इस भाव को विस्तार, ईश्वरीय कृपा, ज्ञान, सुरक्षा और सर्वांगीण संतुलन प्रदान करती है।`,
        Jupiter_9: `9वीं भाग्य दृष्टि (${hLabel} ${targetHouse}): दिव्य संरक्षण, भाग्योदय, सौभाग्य और उच्च आध्यात्मिक मार्गदर्शन प्रदान करती है।`,
        Mars_4: `4थी विशेष दृष्टि (${hLabel} ${targetHouse}): सुरक्षात्मक ऊर्जा और तीव्र उत्साह लाती है। पारिवारिक व घरेलू मामलों में संघर्ष या साहस देती है।`,
        Mars_7: `7वीं पूर्ण दृष्टि (${hLabel} ${targetHouse}): सक्रिय पराक्रम, तीव्र उत्साह, प्रतिस्पर्धा और ऊर्जा का सीधा संचार करती है।`,
        Mars_8: `8वीं गुप्त दृष्टि (${hLabel} ${targetHouse}): अचानक परिवर्तन, गहन रूपांतरण और आकस्मिक घटनाओं का निर्माण करती है।`,
        Saturn_3: `3री पुरुषार्थ दृष्टि (${hLabel} ${targetHouse}): कठोर परिश्रम, निरंतर प्रयास, धैर्य और आत्मनिर्भरता की मांग करती है।`,
        Saturn_7: `7वीं पूर्ण दृष्टि (${hLabel} ${targetHouse}): अनुशासन, कर्तव्यनिष्ठा, प्रतिबंध और कर्म के कठिन परीक्षण लागू करती है।`,
        Saturn_10: `10वीं कर्म दृष्टि (${hLabel} ${targetHouse}): उत्तरदायित्व, दीर्घकालिक महत्वाकांक्षा और सामाजिक-व्यावसायिक कर्म का दबाव बनाती है।`,
        Rahu_5: `5वीं दृष्टि (${hLabel} ${targetHouse}): तीव्र भौतिक महत्वाकांक्षा, असाधारण बुद्धि और नवीन विचारों को उत्तेजित करती है।`,
        Rahu_7: `7वीं दृष्टि (${hLabel} ${targetHouse}): भौतिक आकर्षण, भटकाव या अप्रत्याशित विदेशी संबंधों का निर्माण करती है।`,
        Rahu_9: `9वीं दृष्टि (${hLabel} ${targetHouse}): अपरंपरागत ज्ञान, गूढ़ विचार और धार्मिक नियमों से परे सोचने की प्रेरणा देती है।`,
        Ketu_5: `5वीं दृष्टि (${hLabel} ${targetHouse}): सहज अंतर्ज्ञान, सांसारिक विषयों से विरक्ति और गूढ़ आध्यात्मिक अंतर्दृष्टि देती है।`,
        Ketu_7: `7वीं दृष्टि (${hLabel} ${targetHouse}): अलगाव, त्याग, दूरी या विदेशी साझेदारी का प्रभाव उत्पन्न करती है।`,
        Ketu_9: `9वीं दृष्टि (${hLabel} ${targetHouse}): रूढ़ियों से मुक्ति, तंत्र-मंत्र व मोक्ष की ओर तीव्र आकर्षण उत्पन्न करती है।`,
        Sun_7: `7वीं दृष्टि (${hLabel} ${targetHouse}): तेज, अधिकार और आत्मविश्वास का प्रसार करती है, किंतु अहंकार या दूरी भी ला सकती है।`,
        Moon_7: `7वीं दृष्टि (${hLabel} ${targetHouse}): मानसिक संवेदनशीलता, पोषण, सौम्यता और सामाजिक संबंधों में मधुरता लाती है।`,
        Mercury_7: `7वीं दृष्टि (${hLabel} ${targetHouse}): तार्किक बुद्धि, बौद्धिक विश्लेषण, व्यापारिक समझ और संवाद क्षमता को प्रखर करती है।`,
        Venus_7: `7वीं दृष्टि (${hLabel} ${targetHouse}): आकर्षण, कला, सौंदर्य, प्रेम, भौतिक सुख और सौहार्दपूर्ण संबंध प्रदान करती है।`
      },
      ta: {
        Jupiter_5: `5ஆம் தர்ம பார்வை (${hLabel} ${targetHouse}): பூர்வ புண்ணியம், ஞானம், படைப்பாற்றல் மற்றும் ஆன்மீக வெற்றியை அருளுகிறது.`,
        Jupiter_7: `7ஆம் பூரண பார்வை (${hLabel} ${targetHouse}): இந்த பாவகத்திற்கு விவேகம், பாதுகாப்பு மற்றும் முழுமையான சுப வளர்ச்சியை தருகிறது.`,
        Jupiter_9: `9ஆம் பாக்ய பார்வை (${hLabel} ${targetHouse}): தெய்வ அருள், யோகம், அதிருஷ்டம் மற்றும் உயர்ந்த நல்வழியைத் தருகிறது.`,
        Mars_4: `4ஆம் பார்வை (${hLabel} ${targetHouse}): பாதுகாப்பு மற்றும் தீவிர உழைப்பைத் தூண்டுகிறது; குடும்ப அமைப்பில் வீரியத்தை அளிக்கிறது.`,
        Mars_7: `7ஆம் பார்வை (${hLabel} ${targetHouse}): ஆர்வம், தைரியம், போட்டி மனப்பான்மை மற்றும் தீவிர ஆற்றலை எதிர்ப்பாவகத்திற்கு செலுத்துகிறது.`,
        Mars_8: `8ஆம் பார்வை (${hLabel} ${targetHouse}): தீவிர திடீர் மாற்றங்கள், மர்மமான உருமாற்றம் மற்றும் சவால்களை உண்டாக்குகிறது.`,
        Saturn_3: `3ஆம் பார்வை (${hLabel} ${targetHouse}): கடுமையான உழைப்பு, விடாமுயற்சி மற்றும் பொறுமையை கோருகிறது.`,
        Saturn_7: `7ஆம் பார்வை (${hLabel} ${targetHouse}): ஒழுக்கம், கடமை உணர்வு, கட்டுப்பாடுகள் மற்றும் கர்ம சோதனைகளை உருவாக்குகிறது.`,
        Saturn_10: `10ஆம் பார்வை (${hLabel} ${targetHouse}): கர்ம பொறுப்பு, தொழில் வளர்ச்சி மற்றும் நீண்டகால வெற்றிக்கான அழுத்தத்தை தருகிறது.`,
        Rahu_5: `5ஆம் பார்வை (${hLabel} ${targetHouse}): தீவிர ஆசைகள், உலகியல் நாட்டம் மற்றும் புத்திக்கூர்மையை தூண்டுகிறது.`,
        Rahu_7: `7ஆம் பார்வை (${hLabel} ${targetHouse}): மாயை, பொருள் நாட்டம் அல்லது எதிர்பாராத தொடர்புகளை ஏற்படுத்துகிறது.`,
        Rahu_9: `9ஆம் பார்வை (${hLabel} ${targetHouse}): வழக்கத்திற்கு மாறான அறிவு, ஆன்மீக தேடல் மற்றும் பயணங்களை தூண்டுகிறது.`,
        Ketu_5: `5ஆம் பார்வை (${hLabel} ${targetHouse}): உள்ளுணர்வு ஞானம், பற்றின்மை மற்றும் ஆன்மீக தெளிவை தருகிறது.`,
        Ketu_7: `7ஆம் பார்வை (${hLabel} ${targetHouse}): பற்றின்மை, தனிமை அல்லது தொலைதூர தொடர்புகளை உருவாக்குகிறது.`,
        Ketu_9: `9ஆம் பார்வை (${hLabel} ${targetHouse}): ஆன்மீக ஈடுபாடு, மறைமுக சாஸ்திர ஞானம் மற்றும் மோட்ச நாட்டத்தை உருவாக்குகிறது.`,
        Sun_7: `7ஆம் பார்வை (${hLabel} ${targetHouse}): ஆதிக்கம், வீரியம் மற்றும் கௌரவத்தை அளிக்கிறது, ஆனால் அகந்தையை உருவாக்கலாம்.`,
        Moon_7: `7ஆம் பார்வை (${hLabel} ${targetHouse}): மன அமைதி, கருணை, பாசம் மற்றும் சமூக நல்வாழ்வை எதிர்ப்பாவகத்திற்கு அளிக்கிறது.`,
        Mercury_7: `7ஆம் பார்வை (${hLabel} ${targetHouse}): புத்திசாலித்தனம், வணிக அறிவு, தகவல் தொடர்பு மற்றும் நகைச்சுவை உணர்வை அளிக்கிறது.`,
        Venus_7: `7ஆம் பார்வை (${hLabel} ${targetHouse}): காதல், அழகு, சுகபோகங்கள் மற்றும் மகிழ்ச்சியான உறவுகளை உருவாக்குகிறது.`
      },
      te: {
        Jupiter_5: `5వ ధర్మ దృష్టి (${hLabel} ${targetHouse}): పూర్వజన్మ సుకృతం, మేధస్సు, సృజనాత్మకత మరియు ఆధ్యాత్మిక ప్రగతిని ప్రసాదిస్తుంది.`,
        Jupiter_7: `7వ పూర్ణ దృష్టి (${hLabel} ${targetHouse}): ఈ భావానికి దివ్య అనుగ్రహం, రక్షణ, జ్ఞానం మరియు సమతుల్య వృద్ధిని అందిస్తుంది.`,
        Jupiter_9: `9వ భాగ్య దృష్టి (${hLabel} ${targetHouse}): దైవ రక్షణ, అదృష్టం, భాగ్యోదయం మరియు ఉన్నత మార్గదర్శకత్వాన్ని ప్రసాదిస్తుంది.`,
        Mars_4: `4వ దృష్టి (${hLabel} ${targetHouse}): రక్షణాత్మక శక్తి మరియు తీవ్ర ఉత్సాహాన్ని కలిగిస్తుంది. కుటుంబ వ్యవహారాలలో చురుకుదనం ఇస్తుంది.`,
        Mars_7: `7వ దృష్టి (${hLabel} ${targetHouse}): చురుకైన పట్టుదల, పరాక్రమం, పోటీతత్వం మరియు శక్తిని నేరుగా ప్రసరింపజేస్తుంది.`,
        Mars_8: `8వ దృష్టి (${hLabel} ${targetHouse}): ఆకస్మిక మార్పులు, రూపాంతరం మరియు తీవ్రమైన ఫలితాలను కలిగిస్తుంది.`,
        Saturn_3: `3వ దృష్టి (${hLabel} ${targetHouse}): కఠిన శ్రమ, పట్టుదల, ఓర్పు మరియు స్వయంకృషిని డిమాండ్ చేస్తుంది.`,
        Saturn_7: `7వ దృష్టి (${hLabel} ${targetHouse}): క్రమశిక్షణ, బాధ్యత, నియమాలు మరియు కర్మ పరీక్షలను ఎదుర్కొనేలా చేస్తుంది.`,
        Saturn_10: `10వ దృష్టి (${hLabel} ${targetHouse}): వృత్తిపరమైన బాధ్యత, కర్మ మరియు దీర్ఘకాలిక లక్ష్యాల సాధనను నిర్దేశిస్తుంది.`,
        Rahu_5: `5వ దృష్టి (${hLabel} ${targetHouse}): బలమైన కోరికలు, తీవ్రమైన విశ్లేషణాత్మక శక్తి మరియు లౌకిక ఆకాంక్షలను పెంచుతుంది.`,
        Rahu_7: `7వ దృష్టి (${hLabel} ${targetHouse}): భ్రమలు, భౌతిక ఆకర్షణలు లేదా విదేశీ సంబంధాలను కలిగిస్తుంది.`,
        Rahu_9: `9వ దృష్టి (${hLabel} ${targetHouse}): సాంప్రదాయేతర జ్ఞానం, నూతన భావజాలం మరియు ఆసక్తికర ప్రయాణాలను ప్రోత్సహిస్తుంది.`,
        Ketu_5: `5వ దృష్టి (${hLabel} ${targetHouse}): అంతర్దృష్టి జ్ఞానం, లౌకిక విరక్తి మరియు ఆధ్యాత్మిక లోతులను తెలుపుతుంది.`,
        Ketu_7: `7వ దృష్టి (${hLabel} ${targetHouse}): బంధాలలో దూరం, వైరాగ్యం లేదా విదేశీ సంబంధాలను సూచిస్తుంది.`,
        Ketu_9: `9వ దృష్టి (${hLabel} ${targetHouse}): మోక్ష సాధన, గూఢ శాస్త్రాలు మరియు ఆధ్యాత్మిక విముక్తి పట్ల ఆసక్తిని పెంచుతుంది.`,
        Sun_7: `7వ దృష్టి (${hLabel} ${targetHouse}): అధికారం, తేజస్సు మరియు దృష్టిని ప్రసరిస్తుంది, అయితే అహంభావ సమస్యలు రావచ్చు.`,
        Moon_7: `7వ దృష్టి (${hLabel} ${targetHouse}): భావోద్వేగ సున్నితత్వం, ఆప్యాయత మరియు సామాజిక సంబంధాలను మధురంగా చేస్తుంది.`,
        Mercury_7: `7వ దృష్టి (${hLabel} ${targetHouse}): తార్కిక ఆలోచన, వ్యాపార నైపుణ్యం మరియు సంభాషణ చాతుర్యాన్ని ఇస్తుంది.`,
        Venus_7: `7వ దృష్టి (${hLabel} ${targetHouse}): శృంగారం, సౌందర్యం, సౌకర్యాలు మరియు సామరస్యపూర్వక బంధాలను కల్పిస్తుంది.`
      }
    };

    const curLang = translations?.lang || 'en';
    const key = `${planet}_${relativeAspect}`;

    if (interpretations[curLang] && interpretations[curLang][key]) {
      description = interpretations[curLang][key];
    } else if (interpretations.hi && curLang !== 'en' && interpretations.hi[key]) {
      // Default to classical Hindi/Sanskrit vocabulary if regional specific key not yet defined
      description = interpretations.hi[key];
    } else {
      // English default
      if (planet === "Jupiter") {
        nature = "Benefic";
        if (relativeAspect === 5) {
          description = `5th Aspect (Dharma Drishti) on House ${targetHouse}: Blesses with past-life merit, intelligence, creative success, and spiritual progress.`;
        } else if (relativeAspect === 7) {
          description = `7th Aspect on House ${targetHouse}: Directly projects expansive grace, wisdom, protection, and balanced growth to this house.`;
        } else if (relativeAspect === 9) {
          description = `9th Aspect (Bhagya Drishti) on House ${targetHouse}: Bestows divine protection, luck, fortune, and higher guidance.`;
        }
      } else if (planet === "Mars") {
        nature = "Malefic";
        if (relativeAspect === 4) {
          description = `4th Aspect on House ${targetHouse}: Directs a protective, high-energy focus. Can bring conflicts or dynamic drive in domestic/foundation matters.`;
        } else if (relativeAspect === 7) {
          description = `7th Aspect on House ${targetHouse}: Directs active drive, passion, competitive energy, or potential friction directly to the opposite house.`;
        } else if (relativeAspect === 8) {
          description = `8th Aspect on House ${targetHouse}: Casts an intense, sudden, transformational force. Can cause sudden changes or intense focus.`;
        }
      } else if (planet === "Saturn") {
        nature = "Malefic";
        if (relativeAspect === 3) {
          description = `3rd Aspect on House ${targetHouse}: Enforces effort, hard work, struggles, and calls for self-reliance and patience.`;
        } else if (relativeAspect === 7) {
          description = `7th Aspect on House ${targetHouse}: Imposes discipline, duty, restrictions, and tests of commitment directly opposite.`;
        } else if (relativeAspect === 10) {
          description = `10th Aspect on House ${targetHouse}: Demands duty, karma, professional responsibility, and long-term ambition.`;
        }
      } else if (planet === "Rahu") {
        nature = "Malefic";
        if (relativeAspect === 5) {
          description = `5th Aspect on House ${targetHouse}: Triggers strong ambition, desires, and intense analytical/intellectual drive.`;
        } else if (relativeAspect === 7) {
          description = `7th Aspect on House ${targetHouse}: Directs projection, material desire, or unusual connections/illusions opposite.`;
        } else if (relativeAspect === 9) {
          description = `9th Aspect on House ${targetHouse}: Promotes unconventional wisdom, wanderlust, and unorthodox beliefs.`;
        }
      } else if (planet === "Ketu") {
        nature = "Malefic";
        if (relativeAspect === 5) {
          description = `5th Aspect on House ${targetHouse}: Connects to intuitive wisdom, detachment from worldly intellect, and spiritual insights.`;
        } else if (relativeAspect === 7) {
          description = `7th Aspect on House ${targetHouse}: Brings distance, detachment, or foreign connections/separation in partnerships.`;
        } else if (relativeAspect === 9) {
          description = `9th Aspect on House ${targetHouse}: Promotes detachment from dogmas, inclination toward occult sciences and liberation.`;
        }
      } else if (planet === "Sun") {
        nature = "Malefic";
        description = `7th Aspect on House ${targetHouse}: Projects warmth, focus, and authority, but can also cause separation or ego tension directly opposite.`;
      } else if (planet === "Moon") {
        nature = "Benefic";
        description = `7th Aspect on House ${targetHouse}: Projects emotional sensitivity, nurturing thoughts, empathy, and social connection directly opposite.`;
      } else if (planet === "Mercury") {
        nature = "Benefic";
        description = `7th Aspect on House ${targetHouse}: Casts an intellectual, logical, communicative, and trade-focused gaze directly opposite.`;
      } else if (planet === "Venus") {
        nature = "Benefic";
        description = `7th Aspect on House ${targetHouse}: Casts romantic grace, aesthetic appreciation, comfort, and harmonious relationships directly opposite.`;
      }
    }

    if (planet === "Jupiter" || planet === "Moon" || planet === "Mercury" || planet === "Venus") {
      nature = "Benefic";
    } else {
      nature = "Malefic";
    }

    return { targetHouse, nature, description };
  };

  // Build rows for each individual aspect
  const tableRows = [];
  positions.forEach((pos) => {
    let relativeAspects = [7];
    if (pos.planet === "Jupiter" || pos.planet === "Rahu" || pos.planet === "Ketu") {
      relativeAspects = [5, 7, 9];
    } else if (pos.planet === "Mars") {
      relativeAspects = [4, 7, 8];
    } else if (pos.planet === "Saturn") {
      relativeAspects = [3, 7, 10];
    }

    relativeAspects.forEach((offset) => {
      const details = getAspectDetails(pos.planet, pos.house, offset);
      tableRows.push({
        planet: pos.planet,
        occupiedHouse: pos.house,
        is_retrograde: pos.is_retrograde,
        is_combust: pos.is_combust,
        relativeAspect: offset,
        targetHouse: details.targetHouse,
        nature: details.nature,
        description: details.description,
      });
    });
  });

  // Jaimini Rasi Drishti
  const getRasiDrishtiRows = () => {
    const lagnaHouse = houses[1] || houses["1"] || {};
    let lagnaSignIdx = lagnaHouse.sign_index;
    if (lagnaSignIdx === undefined && lagnaHouse.cusp_deg !== undefined) {
      lagnaSignIdx = Math.floor(lagnaHouse.cusp_deg / 30);
    }
    if (lagnaSignIdx === undefined) {
      lagnaSignIdx = 0;
    }

    const rows = [];
    for (let h = 1; h <= 12; h++) {
      const signIdx = (lagnaSignIdx + h - 1) % 12;
      const currentSign = SIGNS_LIST[signIdx];

      const aspectedIndices = [];
      if (currentSign.type === "Movable") {
        const fixedIndices = [1, 4, 7, 10];
        fixedIndices.forEach((idx) => {
          const diff = Math.abs(signIdx - idx);
          if (diff !== 1 && diff !== 11) {
            aspectedIndices.push(idx);
          }
        });
      } else if (currentSign.type === "Fixed") {
        const movableIndices = [0, 3, 6, 9];
        movableIndices.forEach((idx) => {
          const diff = Math.abs(signIdx - idx);
          if (diff !== 1 && diff !== 11) {
            aspectedIndices.push(idx);
          }
        });
      } else if (currentSign.type === "Dual") {
        const dualIndices = [2, 5, 8, 11];
        dualIndices.forEach((idx) => {
          if (idx !== signIdx) {
            aspectedIndices.push(idx);
          }
        });
      }

      const aspectedDetails = aspectedIndices.map((targetIdx) => {
        const targetHouse = ((targetIdx - lagnaSignIdx + 12) % 12) + 1;
        const targetHouseData = houses[targetHouse] || {};
        const planets = (targetHouseData.planets || [])
          .map((p) => (typeof p === "string" ? p : p.planet || p.name))
          .filter((p) => p !== "Ascendant" && p !== "Lagna" && p !== "L");

        return {
          signName: SIGNS_LIST[targetIdx].name,
          houseNum: targetHouse,
          planets,
        };
      });

      const sourceHouseData = houses[h] || {};
      const sourcePlanets = (sourceHouseData.planets || [])
        .map((p) => (typeof p === "string" ? p : p.planet || p.name))
        .filter((p) => p !== "Ascendant" && p !== "Lagna" && p !== "L");

      rows.push({
        houseNum: h,
        signName: currentSign.name,
        signType: currentSign.type,
        sourcePlanets,
        aspects: aspectedDetails,
      });
    }

    return rows;
  };

  const rasiRows = getRasiDrishtiRows();

  return (
    <section id="section-planetary-drishti" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-rose-50 border border-rose-200/80 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-rose-800 rounded-xl flex items-center justify-center text-xl shadow-md border-2 border-white/20 text-white">
            👁️
          </div>
          <div>
            <h2 className="text-lg font-black font-serif text-slate-900 uppercase tracking-tight">
              {translations?.ui?.drishtiTitle || 'Planetary Drishti (Aspects)'}
            </h2>
            <div className="text-[10px] font-bold text-rose-800 uppercase tracking-widest mt-0.5">
              {translations?.ui?.drishtiSubtitle || 'Sight of Influence & Karma (ग्रह एवं राशि दृष्टि)'}
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("graha")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === "graha"
              ? "bg-white text-indigo-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            {translations?.ui?.grahaDrishtiTab || 'Graha Drishti (Planetary)'}
          </button>
          <button
            onClick={() => setActiveTab("jaimini")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === "jaimini"
              ? "bg-white text-indigo-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            {translations?.ui?.jaiminiDrishtiTab || 'Jaimini Rasi Drishti (Sign)'}
          </button>
        </div>
      </div>

      {/* TAB 1: Graha Drishti Table */}
      {activeTab === "graha" && (
        <div className="overflow-hidden rounded-2xl border border-indigo-100">
          <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-amber-200 text-black font-bold sticky top-0 z-10 uppercase tracking-wider text-[14px]">
                  <th className="p-3">{translations?.ui?.colPlanet || 'Planet'}</th>
                  <th className="p-3">{translations?.ui?.occupiedHouse || 'Occupied House'}</th>
                  <th className="p-3">{translations?.ui?.aspectLabel || 'Aspect'}</th>
                  <th className="p-3">{translations?.ui?.aspectHouse || 'Aspect House'}</th>
                  <th className="p-3">{translations?.ui?.occupyingPlanets || 'Occupying Planets'}</th>
                  <th className="p-3">{translations?.ui?.drishtiQuality || 'Drishti Quality'}</th>
                  <th className="p-3">{translations?.ui?.interpretation || 'Astrological Interpretation'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {tableRows.map((row, idx) => {
                  const color = PLANET_COLORS[row.planet] || "#000";
                  const targetHouseData = houses[row.targetHouse] || {};
                  const residingPlanets = (targetHouseData.planets || [])
                    .map((p) => (typeof p === "string" ? p : p.planet || p.name))
                    .filter((p) => p !== "Ascendant" && p !== "Lagna" && p !== "L");

                  // Dynamic quality determination
                  const getDynamicDetails = () => {
                    const baseNature = row.nature;
                    const desc = row.description;

                    if (residingPlanets.length === 0) {
                      return {
                        label: baseNature === "Benefic" ? (translations?.ui?.positiveBenefic || "🟢 Positive (Benefic)") : (translations?.ui?.challengingMalefic || "🔴 Challenging (Malefic)"),
                        badgeClass:
                          baseNature === "Benefic"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                            : "bg-rose-50 text-rose-900 border-rose-200",
                        text: desc,
                      };
                    }

                    const relations = residingPlanets.map((planet) => {
                      const rel = getPlanetRelationshipBadge(row.planet, planet);
                      return { planet, rel };
                    });

                    const hasFriends = relations.some((r) => r.rel.label.includes("Friendly") || r.rel.label.includes("मित्र"));
                    const hasEnemies = relations.some((r) => r.rel.label.includes("Inimical") || r.rel.label.includes("शत्रु"));

                    let label = "";
                    let badgeClass = "";

                    if (baseNature === "Benefic") {
                      if (hasEnemies && hasFriends) {
                        label = translations?.ui?.mixedBenefic || "🟡 Mixed Benefic";
                        badgeClass = "bg-amber-50 text-[14px] font-bold text-amber-900 border-amber-200";
                      } else if (hasFriends) {
                        label = translations?.ui?.highlyPositive || "🟢 Highly Positive (Benefic & Friendly)";
                        badgeClass = "bg-emerald-100 text-[14px] font-bold text-emerald-900 border-emerald-300 font-bold";
                      } else if (hasEnemies) {
                        label = translations?.ui?.weakenedBenefic || "🟡 Weakened Benefic (Inimical Target)";
                        badgeClass = "bg-amber-100 text-[14px] font-bold text-amber-900 border-amber-300";
                      } else {
                        label = translations?.ui?.positiveBenefic || "🟢 Positive (Benefic & Neutral)";
                        badgeClass = "bg-emerald-50 text-[14px] font-bold text-emerald-900 border-emerald-200";
                      }
                    } else {
                      if (hasFriends) {
                        label = translations?.ui?.softenedMalefic || "🟡 Softened Malefic (Friendly Target)";
                        badgeClass = "bg-amber-50 text-[14px] font-bold text-amber-900 border-amber-200";
                      } else if (hasEnemies) {
                        label = translations?.ui?.highlyChallenging || "🔴 Highly Challenging (Malefic & Inimical)";
                        badgeClass = "bg-rose-100 text-[14px] font-bold text-rose-900 border-rose-300 font-bold";
                      } else {
                        label = translations?.ui?.challengingMalefic || "🔴 Challenging (Malefic & Neutral)";
                        badgeClass = "bg-rose-50 text-[14px] font-bold text-rose-900 border-rose-200";
                      }
                    }

                    const relDescriptions = relations.map((r) => {
                      const isFriend = r.rel.label.includes("Friendly") || r.rel.label.includes("मित्र");
                      const isEnemy = r.rel.label.includes("Inimical") || r.rel.label.includes("शत्रु");
                      const relStatus = isFriend ? (translations?.ui?.friendStatus || "Mitra (Friendly)") : isEnemy ? (translations?.ui?.enemyStatus || "Shatru (Inimical)") : (translations?.ui?.neutralStatus || "Sama (Neutral)");
                      return `${tp(r.planet)} (${relStatus})`;
                    });

                    const relationshipSummary = `${tp(row.planet)}'s energy is influenced by residing planet(s): ${relDescriptions.join(", ")}.`;
                    const fullDesc = `${desc} ${relationshipSummary}`;

                    return { label, badgeClass, text: fullDesc };
                  };

                  const dynamicInfo = getDynamicDetails();

                  return (
                    <tr key={`${row.planet}-${row.relativeAspect}-${idx}`} className="hover:bg-indigo-50/40 transition">
                      <td className="p-3 font-bold" style={{ color }}>
                        {tp(row.planet)} {row.is_retrograde ? "*" : ""}
                      </td>
                      <td className="p-3 font-semibold text-[14px] text-slate-800">{translations?.ui?.houseLabel || 'House'} {row.occupiedHouse}</td>
                      <td className="p-3 font-medium text-[14px] text-slate-900">{row.relativeAspect}{translations?.ui?.thAspect || 'th Aspect'}</td>
                      <td className="p-3 font-medium text-[14px] font-bold text-indigo-900">{translations?.ui?.houseLabel || 'House'} {row.targetHouse}</td>
                      <td className="p-3">
                        {residingPlanets.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {residingPlanets.map((planet) => {
                              const rel = getPlanetRelationshipBadge(row.planet, planet);
                              const planetColor = PLANET_COLORS[planet] || "#000";
                              return (
                                <div
                                  key={planet}
                                  className="flex items-center justify-between gap-1.5 text-[14px] border border-indigo-100 bg-indigo-50/20 p-1 rounded"
                                >
                                  <span className="font-bold" style={{ color: planetColor }}>
                                    {tp(planet)}
                                  </span>
                                  <span className={`px-1 py-0.5 border text-[14px] font-bold rounded ${rel.bg}`}>
                                    {rel.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-9s00 italic text-[14px]">{translations?.ui?.emptyHouse || 'Empty House'}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 border text-[14px] font-bold uppercase rounded-full whitespace-nowrap inline-block ${dynamicInfo.badgeClass}`}
                        >
                          {dynamicInfo.label}
                        </span>
                      </td>
                      <td className="p-3 text-[14px] text-black leading-relaxed max-w-sm">{dynamicInfo.text}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-indigo-50/30 text-[12spx] text-slate-900 border-t border-indigo-50">
            {translations?.ui?.aspectsFooterNote || '* = Vakri (Retrograde). Aspects are counted in clockwise order starting from the occupied house as 1st.'}
          </div>
        </div>
      )}

      {/* TAB 2: Jaimini Rasi Drishti Table */}
      {activeTab === "jaimini" && (
        <div className="overflow-hidden rounded-2xl border border-indigo-100">
          <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-amber-200 text-black font-bold sticky top-0 z-10 uppercase tracking-wider text-[14px]">
                  <th className="p-3">{translations?.ui?.houseAndSign || 'House & Sign'}</th>
                  <th className="p-3">{translations?.ui?.signNature || 'Sign Nature'}</th>
                  <th className="p-3">{translations?.ui?.occupyingPlanets || 'Occupying Planets'}</th>
                  <th className="p-3">{translations?.ui?.aspectedSignsHouses || 'Aspected Signs & Houses'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {rasiRows.map((row) => (
                  <tr key={row.houseNum} className="hover:bg-indigo-50/40 transition">
                    <td className="p-3 font-bold text-[14px] text-slate-900">
                      {translations?.ui?.houseLabel || 'House'} {row.houseNum} — {ts(row.signName)}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[14px] font-bold bg-slate-100 text-slate-900">
                        {row.signType}
                      </span>
                    </td>
                    <td className="p-3">
                      {row.sourcePlanets.length > 0 ? (
                        <span className="font-bold text-indigo-900">
                          {row.sourcePlanets.map(p => tp(p)).join(", ")}
                        </span>
                      ) : (
                        <span className="text-slate-900 italic">{translations?.ui?.noneOccupants || 'None'}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {row.aspects.map((asp) => (
                          <span
                            key={asp.houseNum}
                            className="px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-black text-[14px] font-semibold"
                          >
                            H{asp.houseNum} ({ts(asp.signName)})
                            {asp.planets.length > 0 && ` [${asp.planets.map(p => tp(p)).join(",")}]`}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-indigo-50/30 text-[11px] text-slate-500 border-t border-indigo-50">
            {translations?.ui?.jaiminiFooterNote || 'Jaimini Sutra: Movable signs aspect all Fixed signs except adjacent; Fixed signs aspect all Movable except adjacent; Dual signs aspect all other Dual signs.'}
          </div>
        </div>
      )}
    </section>
  );
}
