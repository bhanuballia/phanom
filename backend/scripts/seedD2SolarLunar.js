/**
 * Seed script to save Row 2: "Solar vs Lunar Wealth Accumulation" section
 * into MongoDB (D2HoraTranslation collection) across ALL Indian languages:
 * Hindi (hi), Tamil (ta), Telugu (te), Kannada (kn), Gujarati (gu),
 * Marathi (mr), Bengali (bn), Malayalam (ml), Punjabi (pa), Sanskrit (sa)
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D2HoraTranslation = require('../models/D2HoraTranslation');

const SOLAR_LUNAR_SEEDS = {
  hi: {
    langName: 'Hindi',
    sectionTitle: 'सौर एवं चंद्र होरा धन संचय विश्लेषण (Solar vs Lunar Wealth Accumulation)',
    sectionSubtitle: 'महर्षि पाराशर के अनुसार मानव की वित्तीय नियति दो धाराओं में विभक्त है: सौर (कठिन परिश्रम, स्वतंत्र उपक्रम, प्रशासनिक अधिकार) एवं चंद्र (सहज संपदा, पारिवारिक विरासत, तरल पूंजी)।',
    dualitiesBadge: 'होरा द्वैत (Hora Dualities)',
    solarBoxTitle: "सूर्य की होरा (सिंह राशि - सौर होरा)",
    solarPlanetsBadge: 'ग्रह',
    solarDesc: 'यह होरा स्वतंत्र पहलों, उच्च नेतृत्व क्षमता, साहसिक उद्यमिता, राजकीय कृपा, प्रशासनिक ओहदे और स्वयं के पसीने व पराक्रम से अर्जित संपदा का प्रतिनिधित्व करती है।',
    solarPlanetsLabel: 'सौर होरा में स्थित ग्रह:',
    solarNoneLabel: 'सौर होरा में कोई ग्रह नहीं',
    lunarBoxTitle: "चंद्रमा की होरा (कर्क राशि - चंद्र होरा)",
    lunarPlanetsBadge: 'ग्रह',
    lunarDesc: 'यह होरा पारिवारिक कुल, पैतृक विरासत, मातृ आशीर्वाद, जन-स्वीकार्यता, तरल नकदी और शांतिपूर्ण संतुष्टि से सहजता से प्राप्त धन का प्रतिनिधित्व करती है।',
    lunarPlanetsLabel: 'चंद्र होरा में स्थित ग्रह:',
    lunarNoneLabel: 'चंद्र होरा में कोई ग्रह नहीं',
    tableFooterSun: 'सूर्य होरा: स्व-प्रयास, उद्यमिता, प्रशासनिक नेतृत्व',
    tableFooterMoon: 'चंद्र होरा: पैतृक विरासत, सहज भाग्य, साझेदारी'
  },
  ta: {
    langName: 'Tamil',
    sectionTitle: 'சூரிய மற்றும் சந்திர ஹோரா செல்வக் குவிப்பு (Solar vs Lunar Wealth Accumulation)',
    sectionSubtitle: 'பராசர மகரிஷியின் கூற்றுப்படி மனிதனின் நிதி விதி இரு வழிகளில் பிரிகிறது: சூரிய ஹோரை (கடின உழைப்பு, தலைமை, நிர்வாக அதிகாரம்) மற்றும் சந்திர ஹோரை (சீர்மிகு செல்வம், பரம்பரை சொத்து, ரொக்கப் புழக்கம்).',
    dualitiesBadge: 'ஹோரா இருமைகள் (Hora Dualities)',
    solarBoxTitle: "சூரியனின் ஹோரை (சிம்ம ராசி - சூரிய ஹோரை)",
    solarPlanetsBadge: 'கிரகங்கள்',
    solarDesc: 'சுயமுயற்சி, தலைமைப் பண்பு, துணிச்சலான வணிகம், அரசாங்க ஆதரவு, நிர்வாக அந்தஸ்து மற்றும் உழைப்பினால் ஈட்டப்படும் சுய சம்பாத்தியத்தைக் குறிக்கிறது.',
    solarPlanetsLabel: 'சூரிய ஹோரையில் உள்ள கிரகங்கள்:',
    solarNoneLabel: 'சூரிய ஹோரையில் கிரகங்கள் இல்லை',
    lunarBoxTitle: "சந்திரனின் ஹோரை (கடக ராசி - சந்திர ஹோரை)",
    lunarPlanetsBadge: 'கிரகங்கள்',
    lunarDesc: 'குடும்ப பாரம்பரியம், பரம்பரை சொத்து, தாயின் ஆசிகள், மக்கள் ஆதரவு, தாராளமான ரொக்கப் புழக்கம் மற்றும் அமைதியான மனநிறைவுடன் கிட்டும் செல்வத்தைக் குறிக்கிறது.',
    lunarPlanetsLabel: 'சந்திர ஹோரையில் உள்ள கிரகங்கள்:',
    lunarNoneLabel: 'சந்திர ஹோரையில் கிரகங்கள் இல்லை',
    tableFooterSun: 'சூரிய ஹோரை: சுய முயற்சி, துணிச்சல், தலைமைத்துவம்',
    tableFooterMoon: 'சந்திர ஹோரை: பரம்பரை சொத்து, பாக்கியம், கூட்டுறவு'
  },
  te: {
    langName: 'Telugu',
    sectionTitle: 'సౌర & చంద్ర హోరా ధన సంచిత విశ్లేషణ (Solar vs Lunar Wealth Accumulation)',
    sectionSubtitle: 'మహర్షి పరాశరుని ప్రకారం మానవ ఆర్థిక విధి రెండు విధాలుగా విభజించబడింది: సౌర హోరా (కఠిన శ్రమ, నాయకత్వం, ప్రభుత్వ ప్రాపకం) మరియు చంద్ర హోరా (సులభ సంపద, వారసత్వ ఆస్తులు, ద్రవ్య నగదు).',
    dualitiesBadge: 'హోరా ద్వైతాలు (Hora Dualities)',
    solarBoxTitle: "సూర్యుని హోరా (సింహ రాశి - సౌర హోరా)",
    solarPlanetsBadge: 'గ్రహాలు',
    solarDesc: 'స్వయంకృషి, నాయకత్వ లక్షణాలు, సాహసోపేత వ్యాపారం, ప్రభుత్వ అనుగ్రహం, పరిపాలనా హోదా మరియు సొంత శ్రమతో ఆర్జించే స్వయం సంపదను సూచిస్తుంది.',
    solarPlanetsLabel: 'సౌర హోరాలో ఉన్న గ్రహాలు:',
    solarNoneLabel: 'సౌర హోరాలో ఏ గ్రహమూ లేదు',
    lunarBoxTitle: "చంద్రుని హోరా (కర్కాటక రాశి - చంద్ర హోరా)",
    lunarPlanetsBadge: 'గ్రహాలు',
    lunarDesc: 'కుటుంబ సంప్రదాయం, వారసత్వ సంపద, మాతృ ఆశీస్సులు, ప్రజాదరణ, స్థిరమైన నగదు ప్రవాహం మరియు మానసిక సంతృప్తితో లభించే సంపదను సూచిస్తుంది.',
    lunarPlanetsLabel: 'చంద్ర హోరాలో ఉన్న గ్రహాలు:',
    lunarNoneLabel: 'చంద్ర హోరాలో ఏ గ్రహమూ లేదు',
    tableFooterSun: 'సూర్య హోరా: స్వయంకృషి, వ్యాపార దక్షత, నాయకత్వం',
    tableFooterMoon: 'చంద్ర హోరా: వారసత్వ సంపద, అదృష్టం, భాగస్వామ్యం'
  },
  kn: {
    langName: 'Kannada',
    sectionTitle: 'ಸೌರ ಮತ್ತು ಚಂದ್ರ ಹೋರಾ ಸಂಪತ್ತು ಸಂಗ್ರಹಣೆ (Solar vs Lunar Wealth Accumulation)',
    sectionSubtitle: 'ಮಹರ್ಷಿ ಪರಾಶರರ ಪ್ರಕಾರ ಮಾನವನ ಆರ್ಥಿಕ ಭವಿಷ್ಯ ಎರಡು ಮಾರ್ಗಗಳಾಗಿ ವಿಭಜಿಸಲ್ಪಟ್ಟಿದೆ: ಸೌರ (ಕಠಿಣ ಶ್ರಮ, ನಾಯಕತ್ವ, ಆಡಳಿತ ಅಧಿಕಾರ) ಮತ್ತು ಚಂದ್ರ (ಸುಲಭ ಸಂಪತ್ತು, ಪಿತ್ರಾರ್ಜಿತ ಆಸ್ತಿ, ನಗದು ದ್ರವ್ಯತೆ).',
    dualitiesBadge: 'ಹೋರಾ ದ್ವಂದ್ವಗಳು (Hora Dualities)',
    solarBoxTitle: "ಸೂರ್ಯನ ಹೋರಾ (ಸಿಂಹ ರಾಶಿ - ಸೌರ ಹೋರಾ)",
    solarPlanetsBadge: 'ಗ್ರಹಗಳು',
    solarDesc: 'ಸ್ವಪ್ರಯತ್ನ, ಉನ್ನತ ನಾಯಕತ್ವ, ಸಾಹಸೋದ್ಯಮ, ಸರ್ಕಾರದ ಕೃಪೆ, ಆಡಳಿತಾತ್ಮಕ ಸ್ಥಾನಮಾನ ಮತ್ತು ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ಗಳಿಸಿದ ಸಂಪತ್ತನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ.',
    solarPlanetsLabel: 'ಸೌರ ಹೋರಾದಲ್ಲಿರುವ ಗ್ರಹಗಳು:',
    solarNoneLabel: 'ಸೌರ ಹೋರಾದಲ್ಲಿ ಯಾವುದೇ ಗ್ರಹಗಳಿಲ್ಲ',
    lunarBoxTitle: "ಚಂದ್ರನ ಹೋರಾ (ಕರ್ಕಾಟಕ ರಾಶಿ - ಚಂದ್ರ ಹೋರಾ)",
    lunarPlanetsBadge: 'ಗ್ರಹಗಳು',
    lunarDesc: 'ಕುಟುಂಬ ಪರಂಪರೆ, ಪೂರ್ವಜರ ಆಸ್ತಿ, ತಾಯಿಯ ಆಶೀರ್ವಾದ, ಜನಪ್ರಿಯತೆ, ನಗದು ಹರಿವು ಮತ್ತು ಆಂತರಿಕ ತೃಪ್ತಿಯೊಂದಿಗೆ ಸುಲಭವಾಗಿ ದೊರೆಯುವ ಸಂಪತ್ತನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ.',
    lunarPlanetsLabel: 'ಚಂದ್ರ ಹೋರಾದಲ್ಲಿರುವ ಗ್ರಹಗಳು:',
    lunarNoneLabel: 'ಚಂದ್ರ ಹೋರಾದಲ್ಲಿ ಯಾವುದೇ ಗ್ರಹಗಳಿಲ್ಲ',
    tableFooterSun: 'ಸೂರ್ಯ ಹೋರಾ: ಸ್ವಪ್ರಯತ್ನ, ಉದ್ಯಮಶೀಲತೆ, ನಾಯಕತ್ವ',
    tableFooterMoon: 'ಚಂದ್ರ ಹೋರಾ: ಪಿತ್ರಾರ್ಜಿತ ಸಂಪತ್ತು, ಅದೃಷ್ಟ, ಪಾಲುದಾರಿಕೆ'
  },
  gu: {
    langName: 'Gujarati',
    sectionTitle: 'સૌર અને ચંદ્ર હોરા ધન સંચય વિશ્લેષણ (Solar vs Lunar Wealth Accumulation)',
    sectionSubtitle: 'મહર્ષિ પરાશર અનુસાર માનવનું આર્થિક ભાગ્ય બે પ્રવાહોમાં વહેંચાયેલું છે: સૌર (કઠોર પરિશ્રમ, સ્વતંત્ર સાહસ, સરકારી હોદ્દો) અને ચંદ્ર (સહજ સંપત્તિ, પારિવારિક વારસો, પ્રવાહી રોકડ).',
    dualitiesBadge: 'હોરા દ્વૈત (Hora Dualities)',
    solarBoxTitle: "સૂર્યની હોરા (સિંહ રાશિ - સૌર હોરા)",
    solarPlanetsBadge: 'ગ્રહો',
    solarDesc: 'સ્વતંત્ર પહેલ, નેતૃત્વ ક્ષમતા, સાહસિક વ્યવસાય, રાજકીય કૃપા, વહીવટી પદ અને પોતાના પરિશ્રમથી કમાયેલી સંપત્તિનું પ્રતિનિધિત્વ કરે છે.',
    solarPlanetsLabel: 'સૌર હોરામાં રહેલા ગ્રહો:',
    solarNoneLabel: 'સૌર હોરામાં કોઈ ગ્રહ નથી',
    lunarBoxTitle: "ચંદ્રની હોરા (કર્ક રાશિ - ચંદ્ર હોરા)",
    lunarPlanetsBadge: 'ગ્રહો',
    lunarDesc: 'પારિવારિક કુળ, પૂર્વજોનો વારસો, માતૃ આશીર્વાદ, જનપ્રિયતા, પ્રવાહી મૂડી અને માનસિક સંતોષથી સહજતાથી મળતા ધનનું પ્રતિનિધિત્વ કરે છે.',
    lunarPlanetsLabel: 'ચંદ્ર હોરામાં રહેલા ગ્રહો:',
    lunarNoneLabel: 'ચંદ્ર હોરામાં કોઈ ગ્રહ નથી',
    tableFooterSun: 'સૂર્ય હોરા: સ્વ-પ્રયાસ, ઉદ્યોગસાહસિકતા, નેતૃત્વ',
    tableFooterMoon: 'ચંદ્ર હોરા: વારસાગત મિલકત, નસીબ, ભાગીદારી'
  },
  mr: {
    langName: 'Marathi',
    sectionTitle: 'सौर आणि चंद्र होरा संपत्ती संचय विश्लेषण (Solar vs Lunar Wealth Accumulation)',
    sectionSubtitle: 'महर्षी पराशरांच्या मते मानवाचे आर्थिक नशीब दोन प्रवाहात विभागलेले आहे: सौर (कठोर परिश्रम, स्वतंत्र उपक्रम, प्रशासकीय अधिकार) आणि चंद्र (सहज संपत्ती, वडिलोपार्जित वारसा, रोख तरलता).',
    dualitiesBadge: 'होरा द्वैत (Hora Dualities)',
    solarBoxTitle: "सूर्याची होरा (सिंह रास - सौर होरा)",
    solarPlanetsBadge: 'ग्रह',
    solarDesc: 'स्वतःचे प्रयत्न, उच्च नेतृत्व क्षमता, धाडसी व्यवसाय, शासकीय कृपा, प्रशासकीय दर्जा आणि स्वतःच्या घामातून कमावलेल्या संपत्तीचे प्रतिनिधित्व करते.',
    solarPlanetsLabel: 'सौर होरात असलेले ग्रह:',
    solarNoneLabel: 'सौर होरात एकही ग्रह नाही',
    lunarBoxTitle: "चंद्राची होरा (कर्क रास - चंद्र होरा)",
    lunarPlanetsBadge: 'ग्रह',
    lunarDesc: 'कौटुंबिक घराणे, वडिलोपार्जित वारसा, आईचे आशीर्वाद, लोकप्रियता, रोख भांडवल आणि मनःशांतीतून सहज प्राप्त होणाऱ्या संपत्तीचे प्रतिनिधित्व करते.',
    lunarPlanetsLabel: 'चंद्र होरात असलेले ग्रह:',
    lunarNoneLabel: 'चंद्र होरात एकही ग्रह नाही',
    tableFooterSun: 'सूर्य होरा: स्व-प्रयत्न, उद्योजकता, नेतृत्व',
    tableFooterMoon: 'चंद्र होरा: वारसाहक्क, भाग्य, भागीदारी'
  },
  bn: {
    langName: 'Bengali',
    sectionTitle: 'সৌর ও চন্দ্র হোরা সম্পদ সঞ্চয় বিশ্লেষণ (Solar vs Lunar Wealth Accumulation)',
    sectionSubtitle: 'মহর্ষি পরাশরের মতে মানুষের আর্থিক ভাগ্য দুটি ধারায় বিভক্ত: সৌর (কঠোর পরিশ্রম, উদ্যোগ, প্রশাসনিক ক্ষমতা) এবং চন্দ্র (সহজ সম্পদ, পৈতৃক উত্তরাধিকার, তরল পুঁজি)।',
    dualitiesBadge: 'হোরা দ্বৈত (Hora Dualities)',
    solarBoxTitle: "সূর্যের হোরা (সিংহ রাশি - সৌর হোরা)",
    solarPlanetsBadge: 'গ্রহ',
    solarDesc: 'ব্যক্তিগত উদ্যোগ, বলিষ্ঠ নেতৃত্ব, দুঃসাহসী ব্যবসা, সরকারি অনুগ্রহ, প্রশাসনিক পদমর্যাদা এবং নিজের পরিশ্রমে অর্জিত সম্পদের প্রতিনিধিত্ব করে।',
    solarPlanetsLabel: 'সৌর হোরায় অবস্থিত গ্রহসমূহ:',
    solarNoneLabel: 'সৌর হোরায় কোনো গ্রহ নেই',
    lunarBoxTitle: "চন্দ্রের হোরা (কর্কট রাশি - চন্দ্র হোরা)",
    lunarPlanetsBadge: 'গ্রহ',
    lunarDesc: 'পারিবারিক ঐতিহ্য, পৈতৃক উত্তরাধিকার, মাতৃ আশীর্বাদ, গণপ্রিয়তা, নগদ অর্থ এবং মানসিক তৃপ্তির মাধ্যমে সহজে অর্জিত সম্পদের প্রতিনিধিত্ব করে।',
    lunarPlanetsLabel: 'চন্দ্র হোরায় অবস্থিত গ্রহসমূহ:',
    lunarNoneLabel: 'চন্দ্র হোরায় কোনো গ্রহ নেই',
    tableFooterSun: 'সূর্য হোরা: আত্মপ্রচেষ্টা, উদ্যোগ, নেতৃত্ব',
    tableFooterMoon: 'চন্দ্র হোরা: উত্তরাধিকার, সৌভাগ্য, অংশীদারি'
  },
  ml: {
    langName: 'Malayalam',
    sectionTitle: 'സൗര - ചന്ദ്ര ഹോരാ സമ്പത്ത് ശേഖരണ വിശകലനം (Solar vs Lunar Wealth Accumulation)',
    sectionSubtitle: 'പരാശര മഹർഷിയുടെ അഭിപ്രായത്തിൽ മനുഷ്യന്റെ സാമ്പത്തിക വിധി രണ്ടായി തിരിച്ചിരിക്കുന്നു: സൗര ഹോര (കഠിനാധ്വാനം, നേതൃത്വം, ഭരണാധികാരം) ചന്ദ്ര ഹോര (സൗകര്യപ്രദമായ സമ്പത്ത്, പാരമ്പര്യം, പണലഭ്യത).',
    dualitiesBadge: 'ഹോരാ ദ്വന്ദങ്ങൾ (Hora Dualities)',
    solarBoxTitle: "സൂര്യന്റെ ഹോര (ചിങ്ങം രാശി - സൗര ഹോര)",
    solarPlanetsBadge: 'ഗ്രഹങ്ങൾ',
    solarDesc: 'സ്വപ്രയത്നം, നേതൃപാടവം, സംരംഭകത്വം, ഗവൺമെന്റ് ആനുകൂല്യം, ഉന്നത പദവി, അധ്വാനം എന്നിവയിലൂടെ നേടുന്ന സ്വയംസമ്പാദ്യത്തെ പ്രതിനിധീകരിക്കുന്നു.',
    solarPlanetsLabel: 'സൗര ഹോരയിലുള്ള ഗ്രഹങ്ങൾ:',
    solarNoneLabel: 'സൗര ഹോരയിൽ ഗ്രഹങ്ങളില്ല',
    lunarBoxTitle: "ചന്ദ്രന്റെ ഹോര (കർക്കിടകം രാശി - ചന്ദ്ര ഹോര)",
    lunarPlanetsBadge: 'ഗ്രഹങ്ങൾ',
    lunarDesc: 'കുടുംബ പാരമ്പര്യം, പിതൃസ്വത്ത്, മാതൃ അനുഗ്രഹം, ജനപ്രീതി, ലിക്വിഡ് ക്യാപിറ്റൽ, സംതൃപ്തി എന്നിവയിലൂടെ അനായാസമായി വന്നുചേരുന്ന സമ്പത്തിനെ പ്രതിനിധീകരിക്കുന്നു.',
    lunarPlanetsLabel: 'ചന്ദ്ര ഹോരയിലുള്ള ഗ്രഹങ്ങൾ:',
    lunarNoneLabel: 'ചന്ദ്ര ഹോരയിൽ ഗ്രഹങ്ങളില്ല',
    tableFooterSun: 'സൂര്യ ഹോര: സ്വപ്രയത്നം, സംരംഭകത്വം, നേതൃത്വം',
    tableFooterMoon: 'ചന്ദ്ര ഹോര: പാരമ്പര്യം, ഭാഗ്യം, പങ്കാളിത്തം'
  },
  pa: {
    langName: 'Punjabi',
    sectionTitle: 'ਸੂਰਜੀ ਅਤੇ ਚੰਦਰ ਹੋਰਾ ਧਨ ਸੰਚੈ ਵਿਸ਼ਲੇਸ਼ਣ (Solar vs Lunar Wealth Accumulation)',
    sectionSubtitle: 'ਮਹਾਰਿਸ਼ੀ ਪਰਾਸ਼ਰ ਅਨੁਸਾਰ ਮਨੁੱਖ ਦੀ ਆਰਥਿਕ ਕਿਸਮਤ ਦੋ ਧਾਰਾਵਾਂ ਵਿੱਚ ਵੰਡੀ ਹੋਈ ਹੈ: ਸੂਰਜ (ਸਖ਼ਤ ਮਿਹਨਤ, ਸੁਤੰਤਰ ਪਹਿਲ, ਪ੍ਰਸ਼ਾਸਨਿਕ ਅਧਿਕਾਰ) ਅਤੇ ਚੰਦਰਮਾ (ਸਹਿਜ ਦੌਲਤ, ਜੱਦੀ ਜਾਇਦਾਦ, ਨਕਦ ਪੂੰਜੀ)।',
    dualitiesBadge: 'ਹੋਰਾ ਦੋਹਰਾਪਨ (Hora Dualities)',
    solarBoxTitle: "ਸੂਰਜ ਦੀ ਹੋਰਾ (ਸਿੰਘ ਰਾਸ਼ੀ - ਸੂਰਜੀ ਹੋਰਾ)",
    solarPlanetsBadge: 'ਗ੍ਰਹਿ',
    solarDesc: 'ਸੁਤੰਤਰ ਪਹਿਲਕਦਮੀਆਂ, ਉੱਚ ਅਗਵਾਈ, ਦਲੇਰਾਨਾ ਕਾਰੋਬਾਰ, ਸਰਕਾਰੀ ਕਿਰਪਾ, ਪ੍ਰਸ਼ਾਸਨਿਕ ਅਹੁਦੇ ਅਤੇ ਆਪਣੀ ਮਿਹਨਤ ਦੀ ਕਮਾਈ ਨੂੰ ਦਰਸਾਉਂਦੀ ਹੈ।',
    solarPlanetsLabel: 'ਸੂਰਜੀ ਹੋਰਾ ਵਿੱਚ ਸਥਿਤ ਗ੍ਰਹਿ:',
    solarNoneLabel: 'ਸੂਰਜੀ ਹੋਰਾ ਵਿੱਚ ਕੋਈ ਗ੍ਰਹਿ ਨਹੀਂ',
    lunarBoxTitle: "ਚੰਦਰਮਾ ਦੀ ਹੋਰਾ (ਕਰਕ ਰਾਸ਼ੀ - ਚੰਦਰ ਹੋਰਾ)",
    lunarPlanetsBadge: 'ਗ੍ਰਹਿ',
    lunarDesc: 'ਪਰਿਵਾਰਕ ਵਿਰਾਸਤ, ਜੱਦੀ ਜਾਇਦਾਦ, ਮਾਂ ਦੇ ਆਸ਼ੀਰਵਾਦ, ਲੋਕਪ੍ਰਿਅਤਾ, ਤਰਲ ਨਕਦੀ ਅਤੇ ਆਤਮਿਕ ਸੰਤੁਸ਼ਟੀ ਨਾਲ ਆਸਾਨੀ ਨਾਲ ਪ੍ਰਾਪਤ ਹੋਣ ਵਾਲੇ ਧਨ ਨੂੰ ਦਰਸਾਉਂਦੀ ਹੈ।',
    lunarPlanetsLabel: 'ਚੰਦਰ ਹੋਰਾ ਵਿੱਚ ਸਥਿਤ ਗ੍ਰਹਿ:',
    lunarNoneLabel: 'ਚੰਦਰ ਹੋਰਾ ਵਿੱਚ ਕੋਈ ਗ੍ਰਹਿ ਨਹੀਂ',
    tableFooterSun: 'ਸੂਰਜ ਹੋਰਾ: ਸਵੈ-ਕੋਸ਼ਿਸ਼, ਕਾਰੋਬਾਰ, ਅਗਵਾਈ',
    tableFooterMoon: 'ਚੰਦਰ ਹੋਰਾ: ਵਿਰਾਸਤ, ਕਿਸਮਤ, ਭਾਈਵਾਲੀ'
  },
  sa: {
    langName: 'Sanskrit',
    sectionTitle: 'सौर एवं चन्द्र होरा धन संचय विश्लेषणम् (Solar vs Lunar Wealth Accumulation)',
    sectionSubtitle: 'महर्षि पाराशरोक्तेन मानवस्य वित्तीय भाग्यं द्विधा विभक्तम्: सौरं (परिश्रमः, स्वातन्त्र्योद्यमः, राज्याधिकारः) चन्द्रं च (सहज सम्पत्तिः, कुलपरम्परा, तरलकोशः)।',
    dualitiesBadge: 'होरा द्वैतम् (Hora Dualities)',
    solarBoxTitle: "सूर्यस्य होरा (सिंह राशिः - सौर होरा)",
    solarPlanetsBadge: 'ग्रहाः',
    solarDesc: 'आत्मप्रयत्नेन, नेतृत्वसामर्थ्येन, राजकृपायुक्त प्रशासनिकपदेन, स्वेदार्जित पुरुषार्थेन च लब्धां सम्पदं सूचयति।',
    solarPlanetsLabel: 'सौरहोरायाम् स्थिताः ग्रहाः:',
    solarNoneLabel: 'सौरहोरायां कोऽपि ग्रहो नास्ति',
    lunarBoxTitle: "चन्द्रस्य होरा (कर्क राशिः - चन्द्र होरा)",
    lunarPlanetsBadge: 'ग्रहाः',
    lunarDesc: 'कुलपरम्परया, मातृवरप्रसादेन, पैतृकधनेन, जनप्रीत्या, तरलकोशवृद्ध्या सुखशान्त्या च प्राप्तां सम्पदं सूचयति।',
    lunarPlanetsLabel: 'चन्द्रहोरायाम् स्थिताः ग्रहाः:',
    lunarNoneLabel: 'चन्द्रहोरायां कोऽपि ग्रहो नास्ति',
    tableFooterSun: 'सूर्य होरा: स्वावलम्बनम्, उद्यमशीलता, नेतृत्वम्',
    tableFooterMoon: 'चन्द्र होरा: पैतृकसम्पत्तिः, भाग्योदयः, सौहार्दम्'
  }
};

async function seedSolarLunarTranslations() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found');
      return;
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    for (const [langCode, langData] of Object.entries(SOLAR_LUNAR_SEEDS)) {
      console.log(`Seeding Solar vs Lunar Wealth Accumulation into MongoDB for [${langCode}] - ${langData.langName}...`);
      
      await D2HoraTranslation.findOneAndUpdate(
        { lang: langCode },
        {
          $set: {
            lang: langCode,
            langName: langData.langName,
            solarLunar: langData
          }
        },
        { upsert: true, new: true }
      );
    }

    console.log('🎉 Successfully saved Solar vs Lunar Wealth Accumulation into MongoDB across all Indian languages!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Solar vs Lunar translations:', err);
    process.exit(1);
  }
}

seedSolarLunarTranslations();
