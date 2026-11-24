import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import VastuCompassCalibratorModal from '../components/VastuCompassCalibratorModal';
import { authAPI, buildAssetUrl } from '../services/api';
import {
    Compass,
    Wind,
    Droplet,
    Flame,
    Mountain,
    Phone,
    PhoneCall,
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    XCircle,
    Sparkles,
    Building2,
    ShieldCheck,
    ChevronRight,
    Home as HomeIcon,
    Sun,
    Layers,
    HelpCircle,
    AlertTriangle,
    Lightbulb,
    Check,
    Star,
    Video,
    Radio
} from 'lucide-react';

const DIRECTIONS = [
    {
        name: 'North (उत्तर)',
        diety: 'Kuber (कुबेर)',
        element: 'Water / Jal',
        color: 'border-cyan-400 bg-cyan-50/70 text-cyan-950',
        accent: 'bg-cyan-500',
        icon: '↑',
        bestFor: 'Living Room, Treasury, Cash locker, Study',
        avoid: 'Toilet, Heavy storage, Staircase',
        benefit: 'धन, समृद्धि और नए अवसर (Wealth & Career Opportunities)'
    },
    {
        name: 'North-East (ईशान)',
        diety: 'Shiva (ईश्वर / गुरु)',
        element: 'Water / Space',
        color: 'border-blue-400 bg-blue-50/70 text-blue-950',
        accent: 'bg-blue-600',
        icon: '↗',
        bestFor: 'Pooja Room (मंदिर), Meditation, Water tank, Open veranda',
        avoid: 'Kitchen, Toilet, Heavy furniture, Master bedroom',
        benefit: 'आध्यात्मिक शांति, ज्ञान और दैवीय कृपा (Spiritual Wisdom & Clarity)'
    },
    {
        name: 'East (पूर्व)',
        diety: 'Indra / Surya (सूर्य)',
        element: 'Air / Light',
        color: 'border-amber-400 bg-amber-50/70 text-amber-950',
        accent: 'bg-amber-500',
        icon: '→',
        bestFor: 'Main entrance, Balcony, Study desk, Morning meditation',
        avoid: 'Heavy cupboards, Septic tank, Dark clutter',
        benefit: 'सामाजिक मान-सम्मान, उत्तम स्वास्थ्य और तेज (Health & Vitality)'
    },
    {
        name: 'South-East (आग्नेय)',
        diety: 'Agni Dev (अग्नि)',
        element: 'Fire / Agni',
        color: 'border-orange-400 bg-orange-50/70 text-orange-950',
        accent: 'bg-orange-600',
        icon: '↘',
        bestFor: 'Kitchen (रसोई), Electric meter, Inverters, Boiler',
        avoid: 'Water tanks, Borewell, Guest bedroom, Pooja room',
        benefit: 'ऊर्जा, उत्साह और पाचन आरोग्य (Energy, Vitality & Cash Flow)'
    },
    {
        name: 'South (दक्षिण)',
        diety: 'Yama (यम)',
        element: 'Earth / Fire',
        color: 'border-rose-400 bg-rose-50/70 text-rose-950',
        accent: 'bg-rose-600',
        icon: '↓',
        bestFor: 'Bedroom, High boundary walls, Heavy storage, Wardrobes',
        avoid: 'Main entrance (unless tested), Underground water',
        benefit: 'स्थायित्व, कानूनी सुरक्षा और निष्ठा (Stability & Legal Security)'
    },
    {
        name: 'South-West (नैऋत्य)',
        diety: 'Nirriti / Rahu (पृथ्वी)',
        element: 'Earth / Heavy',
        color: 'border-yellow-500 bg-yellow-50/70 text-yellow-950',
        accent: 'bg-yellow-700',
        icon: '↙',
        bestFor: 'Master Bedroom, Head of Family room, Overhead tank',
        avoid: 'Underground tank, Entrance, Open spaces, Balcony',
        benefit: 'पारिवारिक स्थिरता, निर्णय क्षमता व दीर्घायु (Authority & Strength)'
    },
    {
        name: 'West (पश्चिम)',
        diety: 'Varun (वरुण / शनि)',
        element: 'Air / Water',
        color: 'border-indigo-400 bg-indigo-50/70 text-indigo-950',
        accent: 'bg-indigo-600',
        icon: '←',
        bestFor: 'Children Bedroom, Dining space, Study room, Overhead tank',
        avoid: 'Pooja room, Open balconies with low walls',
        benefit: 'व्यापारिक लाभ, बचत और सफलता (Business Gains & Profits)'
    },
    {
        name: 'North-West (वायव्य)',
        diety: 'Vayu (वायु / चंद्र)',
        element: 'Air / Movement',
        color: 'border-teal-400 bg-teal-50/70 text-teal-950',
        accent: 'bg-teal-600',
        icon: '↖',
        bestFor: 'Guest Bedroom, Finished goods, Garage, Unmarried daughters',
        avoid: 'Master bedroom, Heavy construction, Safe/Treasury',
        benefit: 'सहयोग, गतिशीलता, सुरक्षित यात्रा और रिश्ते (Support & Movement)'
    }
];

const FIVE_ELEMENTS = [
    {
        name: 'Earth (पृथ्वी)',
        sanskrit: 'Prithvi',
        icon: Mountain,
        zone: 'South-West (नैऋत्य)',
        color: 'from-amber-600 to-yellow-700',
        bg: 'bg-amber-50 border-amber-300',
        desc: 'स्थिरता, शक्ति, गृहस्वामी का प्रभाव और सुरक्षा प्रदान करता है।',
        tips: 'दक्षिण-पश्चिम भाग को हमेशा सबसे ऊँचा और भारी रखें।'
    },
    {
        name: 'Water (जल)',
        sanskrit: 'Jal',
        icon: Droplet,
        zone: 'North-East (ईशान)',
        color: 'from-blue-500 to-cyan-600',
        bg: 'bg-blue-50 border-blue-300',
        desc: 'समृद्धि, मानसिक शांति, धन के प्रवाह और स्पष्टता का कारक है।',
        tips: 'उत्तर-पूर्व को हमेशा स्वच्छ, खुला व जल तत्वों (फव्वारा/बोरवेल) से युक्त रखें।'
    },
    {
        name: 'Fire (अग्नि)',
        sanskrit: 'Agni',
        icon: Flame,
        zone: 'South-East (आग्नेय)',
        color: 'from-orange-500 to-red-600',
        bg: 'bg-orange-50 border-orange-300',
        desc: 'ऊर्जा, उत्साह, पाचन, वित्तीय तरलता और तेज का प्रतीक है।',
        tips: 'रसोईघर एवं बिजली उपकरण आग्नेय कोण में रखें; जल व अग्नि को पास न रखें।'
    },
    {
        name: 'Air (वायु)',
        sanskrit: 'Vayu',
        icon: Wind,
        zone: 'North-West (वायव्य)',
        color: 'from-teal-500 to-emerald-600',
        bg: 'bg-teal-50 border-teal-300',
        desc: 'संबंधों, व्यापारिक आवागमन, बदलाव और सहयोग की प्रेरणा देता है।',
        tips: 'अतिथि कक्ष एवं तैयार माल का भंडारण उत्तर-पश्चिम में शुभ रहता है।'
    },
    {
        name: 'Space (आकाश)',
        sanskrit: 'Akash',
        icon: Compass,
        zone: 'Center (ब्रह्मस्थान)',
        color: 'from-purple-500 to-indigo-600',
        bg: 'bg-purple-50 border-purple-300',
        desc: 'अनंत संभावनाएं, आध्यात्मिक विस्तार और सामंजस्य का केंद्र है।',
        tips: 'घर के मध्य (ब्रह्मस्थान) को हमेशा हल्का, खुला, हवादार और भारमुक्त रखें।'
    }
];

const ROOM_TIPS = [
    {
        room: 'Main Entrance (मुख्य द्वार)',
        direction: 'North, East or North-East',
        element: 'Surya / Kuber Zone',
        doList: [
            'द्वार हमेशा अंदर की ओर और दोनों पल्लों वाला खुलना चाहिए।',
            'मुख्य द्वार पर ॐ, स्वास्तिक या श्री गणेश जी का शुभ चिह्न लगाएं।',
            'द्वार की चौखट के पास प्रकाश व्यवस्था उत्तम और स्वच्छ रखें।'
        ],
        dontList: [
            'मुख्य द्वार के ठीक सामने जूते-चप्पल या डस्टबिन न रखें।',
            'द्वार खोलते या बंद करते समय चरमराने की आवाज नहीं आनी चाहिए।'
        ],
        hindi: 'मुख्य द्वार से ही घर में सकारात्मक ऊर्जा (प्राण ऊर्जा) का प्रवेश होता है।'
    },
    {
        room: 'Kitchen (रसोईघर)',
        direction: 'South-East (आग्नेय कोण)',
        element: 'Agni Tatva',
        doList: [
            'खाना बनाते समय मुख पूर्व दिशा की ओर होना सर्वोत्तम माना जाता है।',
            'गैस चूल्हा और पानी का सिंक कम से कम 2-3 फीट की दूरी पर हों।',
            'रसोई में पीले, नारंगी या हल्के गर्म रंगों का उपयोग करें।'
        ],
        dontList: [
            'रसोईघर को कभी भी उत्तर-पूर्व (ईशान) कोण में न बनाएं।',
            'रसोई और शौचालय की दीवार कभी भी एक दूसरे से सटी नहीं होनी चाहिए।'
        ],
        hindi: 'आग्नेय कोण में अग्नि देव का वास होता है, जो परिवार के स्वास्थ्य व समृद्धि का आधार है।'
    },
    {
        room: 'Master Bedroom (शयनकक्ष)',
        direction: 'South-West (नैऋत्य कोण)',
        element: 'Prithvi Tatva',
        doList: [
            'सोते समय सिर हमेशा दक्षिण (South) या पूर्व (East) दिशा में रखें।',
            'पलंग लकड़ी का बना हो और दीवार से 2-3 इंच दूर रखा गया हो।',
            'कमरे में सौम्य व सुखद रंगों (Off-white, Light Cream, Soft Pink) का प्रयोग करें।'
        ],
        dontList: [
            'बिस्तर के ठीक सामने दर्पण (Mirror) न लगाएं जिसमें सोते समय प्रतिबिंब दिखे।',
            'बीम के ठीक नीचे सिर रखकर सोने से मानसिक तनाव और सिरदर्द होता है।'
        ],
        hindi: 'नैऋत्य का शयनकक्ष परिवार के मुखिया को स्थिरता, नेतृत्व और अधिकार शक्ति प्रदान करता है।'
    },
    {
        room: 'Pooja Room (पूजा घर / मंदिर)',
        direction: 'North-East (ईशान कोण)',
        element: 'Jal / Devata Zone',
        doList: [
            'मूर्तियां या चित्र इस प्रकार हों कि पूजा करते समय मुख पूर्व या उत्तर में रहे।',
            'प्रतिदिन सुबह-शाम शुद्ध घी या तिल के तेल का दीपक प्रज्वलित करें।',
            'मंदिर की दीवारों पर सफेद, हल्का पीला या हल्का नीला रंग रखें।'
        ],
        dontList: [
            'सीढ़ियों के नीचे, बेसमेंट में या शयनकक्ष के भीतर मंदिर न बनाएं।',
            'मंदिर में खंडित मूर्तियां या पूर्वजों की तस्वीरें देवी-देवताओं के साथ न रखें।'
        ],
        hindi: 'ईशान कोण सात्विक ऊर्जा का केंद्र है, जो घर में ईश्वर का आशीर्वाद आकर्षित करता है।'
    },
    {
        room: 'Living Room (बैठक कक्ष)',
        direction: 'North or East',
        element: 'Kuber / Surya Zone',
        doList: [
            'गृहस्वामी का मुख उत्तर या पूर्व की ओर मुख करके बैठना शुभ होता है।',
            'भारी सोफे व अलमारी दक्षिण या पश्चिम दीवार की तरफ रखें।',
            'ईशान कोण को खुला रखें और वहाँ हल्के ताजे फूल या पानी का फव्वारा लगाएं।'
        ],
        dontList: [
            'हिंसक जंगली जानवरों या युद्ध के दृश्य वाले चित्र बैठक में न लगाएं।',
            'कमरे के कोनों में अंधेरा या भारी अवांछित कबाड़ न इकट्ठा होने दें।'
        ],
        hindi: 'बैठक कक्ष अतिथियों से सकारात्मक संबंध और घर में सामाजिक प्रतिष्ठा बढ़ाता है।'
    },
    {
        room: 'Bathroom & Toilet (शौचालय)',
        direction: 'North-West (वायव्य) or West',
        element: 'Vayu / Varun Zone',
        doList: [
            'कमोड (WC) इस प्रकार हो कि बैठते समय मुख उत्तर या दक्षिण दिशा में रहे।',
            'पानी का बहाव उत्तर या पूर्व की ओर होना चाहिए।',
            'शौचालय का दरवाजा हमेशा बंद रखें ताकि नकारात्मक ऊर्जा बाहर न फैले।'
        ],
        dontList: [
            'ईशान (North-East) या ब्रह्मस्थान में शौचालय कभी न बनाएं—यह गंभीर वास्तु दोष है।',
            'शौचालय में शीशा दरवाजे के ठीक सामने नहीं लगाना चाहिए।'
        ],
        hindi: 'शौचालय की सही दिशा घर के सदस्यों को असाध्य रोगों और आर्थिक नुकसान से बचाती है।'
    }
];

const REMEDIES = [
    {
        title: 'वास्तु यंत्र स्थापना (Vastu Yantra)',
        desc: 'घर के मुख्य द्वार या पूजा स्थल में सिद्ध सम्पूर्ण वास्तु दोष निवारण यंत्र स्थापित करने से बिना तोड़-फोड़ के 80% वास्तु दोष शांत होते हैं।',
        img: '/images/vastu_yantra.jpg',
        tag: 'अचूक वैदिक उपाय'
    },
    {
        title: 'समुद्री नमक एवं कर्पूर (Sea Salt & Camphor)',
        desc: 'घर के कोनों में कांच की कटोरी में डला हुआ समुद्री नमक रखें और संध्या समय भीमसेनी कर्पूर जलाएं। यह नकारात्मक ऊर्जा (Negative Ions) को नष्ट करता है।',
        img: '/images/vastu_dosh_nivaran.jpg',
        tag: 'ऊर्जा शुद्धि'
    },
    {
        title: 'पिरामिड एवं धातु पट्टिका (Vastu Pyramids)',
        desc: 'दिशा दोष निवारण हेतु तांबे, पीतल अथवा रांगे की वास्तु स्ट्रिप्स एवं पिरामिड चौखट के नीचे अथवा दीवारों में स्थापित किए जाते हैं।',
        img: '/images/home4.png',
        tag: 'आधुनिक ऊर्जा संतुलन'
    }
];

const DONT_LIST = [
    'उत्तर दिशा की ओर सिर करके कभी न सोएं—इससे रक्तचाप और अनिद्रा की समस्या होती है।',
    'घर के ईशान कोण (North-East) या मध्य (ब्रह्मस्थान) में शौचालय अथवा सीढ़ी न बनाएं।',
    'बंद पड़ी घड़ियां, टूटे हुए शीशे, चटके हुए बर्तन और जंग लगा लोहा घर में न रखें।',
    'घर के मुख्य द्वार के सामने सीधा खंभा, पेड़ की छाया या नुकीली सड़क (वीथी शूल) नहीं होनी चाहिए।',
    'शयनकक्ष में कांटेदार पौधे (कैक्टस आदि) या सूखे-मुरझाए फूल कभी न रखें।',
    'रसोईघर में गैस चूल्हा और पानी का नल एक सीध में या एक दूसरे से सटाकर न रखें।'
];

const FALLBACK_LIVE_ASTROLOGERS = [
    {
        _id: 'live-vastu-1',
        name: 'आचार्य विक्रमादित्य (Acharya Vikramaditya)',
        specialization: ['Vastu Shastra', 'Vedic Astrology', 'Kundali'],
        pricing: 21,
        rating: 4.9,
        experience: '18+ yrs',
        isLive: true
    },
    {
        _id: 'live-vastu-2',
        name: 'डॉ. मीनाक्षी शर्मा (Dr. Meenakshi Sharma)',
        specialization: ['Astro-Vastu', 'Pyramid Vastu', 'Numerology'],
        pricing: 19,
        rating: 4.85,
        experience: '14+ yrs',
        isLive: true
    },
    {
        _id: 'live-vastu-3',
        name: 'पंडित राघवेंद्र शास्त्री (Pt. Raghavendra Shastri)',
        specialization: ['Dosh Nivaran', 'Griha Pravesh', 'Vastu Yantra'],
        pricing: 25,
        rating: 4.95,
        experience: '22+ yrs',
        isLive: true
    },
    {
        _id: 'live-vastu-4',
        name: 'स्वामी आनंद तीर्थ (Swami Anand Teerth)',
        specialization: ['Commercial Vastu', 'Industrial Energy', 'Panchamahabhoot'],
        pricing: 29,
        rating: 4.9,
        experience: '20+ yrs',
        isLive: true
    }
];

export default function VastuShastra() {
    const [activeTab, setActiveTab] = useState('directions');
    const [isCalibratorOpen, setIsCalibratorOpen] = useState(false); // 'directions' | 'rooms' | 'elements' | 'remedies'
    const [liveAstrologers, setLiveAstrologers] = useState([]);
    const [currentAstroIndex, setCurrentAstroIndex] = useState(0);

    // Fetch live astrologers (or fall back to curated Vastu live experts)
    useEffect(() => {
        let isMounted = true;
        const fetchLive = async () => {
            try {
                const response = await authAPI.getAstrologers();
                const all = response.data?.astrologers || [];
                const liveOnly = all.filter((a) => a.isLive);
                if (isMounted) {
                    if (liveOnly.length > 0) {
                        setLiveAstrologers(liveOnly);
                    } else if (all.length > 0) {
                        setLiveAstrologers(all.slice(0, 6));
                    } else {
                        setLiveAstrologers(FALLBACK_LIVE_ASTROLOGERS);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setLiveAstrologers(FALLBACK_LIVE_ASTROLOGERS);
                }
            }
        };

        fetchLive();
        return () => {
            isMounted = false;
        };
    }, []);

    // Rotate astrologer every 3 seconds
    useEffect(() => {
        const listLength = liveAstrologers.length > 0 ? liveAstrologers.length : FALLBACK_LIVE_ASTROLOGERS.length;
        if (listLength <= 1) return;

        const timer = setInterval(() => {
            setCurrentAstroIndex((prev) => (prev + 1) % listLength);
        }, 3000);

        return () => clearInterval(timer);
    }, [liveAstrologers]);

    const displayedList = liveAstrologers.length > 0 ? liveAstrologers : FALLBACK_LIVE_ASTROLOGERS;
    const activeAstrologer = displayedList[currentAstroIndex % displayedList.length] || displayedList[0];

    return (
        <div className="min-h-screen bg-[#fffdfa] flex flex-col font-sans text-slate-800 selection:bg-amber-200">
            <Navigation />

            <main className="flex-1 w-full pt-20 sm:pt-24 pb-14 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

                {/* Top Breadcrumb & Quick Navigation Links */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 text-[15px] font-medium">
                        <Link to="/" className="hover:text-amber-800 transition">होम (Home)</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-amber-900 font-bold">वास्तु शास्त्र (Vastu Shastra Consultation)</span>
                    </div>

                    {/* Center: First Talk Free CTA */}
                    <div className="flex items-center justify-center my-1 sm:my-0">
                        <Link
                            to="/astrologers"
                            title="First Talk Free"
                            className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-black text-[18px] uppercase tracking-wider shadow-md hover:shadow-amber-500/30 border border-yellow-200/80 hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                            <div className="w-5 h-5 rounded-full bg-white/95 text-amber-900 flex items-center justify-center shrink-0">
                                <PhoneCall className="w-6 h-6 text-orange-600 animate-pulse" />
                            </div>
                            <span className="font-extrabold text-[22px] tracking-wide text-slate-950">First Talk Free</span>
                            <span className="text-[16px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider animate-bounce shadow-xs">
                                FREE
                            </span>
                            <ArrowUpRight className="w-3 h-3 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            to="/astrologers"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[16px] font-bold bg-white hover:bg-amber-50 text-slate-800 border border-amber-300 shadow-2xs transition"
                        >
                            <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
                            <span>Talk To Vastu Expert</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-500" />
                        </Link>

                        <Link
                            to="/booking"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[16px] font-bold bg-white hover:bg-amber-50 text-slate-800 border border-amber-300 shadow-2xs transition"
                        >
                            <Building2 className="w-4 h-4 text-amber-900" />
                            <span>Book Consulation</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-500" />
                        </Link>
                    </div>
                </div>

                {/* Hero Section Container (Half-width Banner paired with VT1.png on Right) */}
                <div className="flex flex-col md:flex-row items-stretch justify-between gap-4">
                    {/* Half-width Hero Banner with Celestial Vedic Styling */}
                    <div className="w-full md:w-1/2 md:max-w-[50%] relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 text-white px-5 py-4 sm:px-6 sm:py-5 shadow-lg border border-amber-500/25 flex flex-col justify-center">
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute right-4 top-3 hidden lg:flex items-center gap-3 opacity-15 pointer-events-none">
                            <Compass className="w-16 h-16 stroke-[1.2] text-amber-300" />
                            <Building2 className="w-14 h-14 stroke-[1.2] text-amber-100" />
                        </div>

                        <div className="relative z-10 space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold tracking-wide">
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                <span>प्राचीन वैदिक स्थापत्य वेद • Architectural Science</span>
                            </div>

                            <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold font-cinzel text-amber-100 tracking-wide leading-snug">
                                वास्तु शास्त्र एवं ऊर्जा संतुलन परामर्श
                            </h1>

                            <p className="text-xs text-amber-200/85 leading-relaxed font-normal">
                                अष्ट दिशाएं, पंचमहाभूत एवं गृह-कक्षों के सूक्ष्म ऊर्जा सिद्धांतों द्वारा घर, दुकान व कार्यालय में सुख, शांति, स्वास्थ्य और अटूट धन समृद्धि प्राप्त करें।
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Vastu Visual Image (VT1.png) - Clickable to Astrologer Page */}
                    <div className="w-full md:w-1/2 md:max-w-[50%] flex items-center justify-center">
                        <Link
                            to="/astrologers"
                            title="वास्तु विशेषज्ञ से बात करें (Consult Vastu Expert)"
                            className="w-full h-full min-h-[140px] max-h-[180px] sm:max-h-[200px] rounded-2xl overflow-hidden border border-amber-300/80 shadow-lg hover:shadow-2xl hover:border-amber-500 bg-gradient-to-br from-amber-50 to-orange-100/50 flex items-center justify-center relative group cursor-pointer transition-all duration-300"
                        >
                            <img
                                src="/images/VT1.png"
                                alt="Vedic Vastu Purusha Mandala"
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70 transition-colors pointer-events-none" />
                            <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[11px] font-bold text-amber-100 bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-amber-400/40 group-hover:border-amber-400 transition-colors">
                                <span>✨ वास्तु पुरुष मंडल एवं दिशा चक्र</span>
                                <span className="text-amber-300">• विशेषज्ञ से बात करें</span>
                                <ArrowUpRight className="w-3 h-3 text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Interactive Astro-Vastu Calibrator Banner & Live Astrologer Carousel */}
                <div className="flex flex-col xl:flex-row items-stretch gap-4">
                    {/* Left/Main: Astro-Vastu Directional Calibrator */}
                    <div className="flex-1 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-yellow-500/15 border border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-5">
                        <div className="space-y-1 text-center lg:text-left flex-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[12px] font-bold">
                                <Compass className="w-3.5 h-3.5 text-amber-700" />
                                <span>Interactive Tool</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
                                एस्ट्रो-वास्तु दिशा सूचक एवं कक्ष स्थिति परीक्षक
                            </h3>
                            <p className="text-[14px] text-stone-900">
                                अपनी जन्म कुंडली के ग्रहों व दिशा तत्वों के अनुसार कमरे, मुख्य द्वार और रसोई की उपयुक्तता जांचें।
                            </p>
                        </div>

                        {/* Vertical CTA Action Buttons Stack */}
                        <div className="flex flex-col items-stretch sm:items-end justify-center gap-2.5 shrink-0 w-full sm:w-auto">
                            {/* First Talk Free CTA Button */}
                            <Link
                                to="/astrologers"
                                className="group inline-flex items-center justify-between sm:justify-start gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all w-full sm:w-56"
                            >
                                <div className="flex items-center gap-2">
                                    <PhoneCall className="w-4 h-4 text-orange-950 animate-pulse shrink-0" />
                                    <span>First Talk Free</span>
                                </div>
                                <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-xs ml-auto">
                                    FREE
                                </span>
                            </Link>

                            {/* वास्तु कैलिब्रेटर खोलें Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    const win = window.open(
                                        '/vastu-analyzer?vastu=true',
                                        'VastuAnalyzerWindow',
                                        'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes'
                                    );
                                    if (win) win.focus();
                                }}
                                className="inline-flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-[16px] uppercase tracking-wider shadow-md hover:scale-105 transition cursor-pointer w-full sm:w-56"
                            >
                                <div className="flex items-center gap-2">
                                    <Compass className="w-4 h-6 shrink-0" />
                                    <span>Open Vastu Calculator</span>
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 text-amber-200 ml-auto" />
                            </button>

                            {/* परामर्श बुक करें Button */}
                            <Link
                                to="/booking"
                                className="inline-flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-amber-950 font-bold text-[14px] uppercase tracking-wider border border-amber-300 shadow-2xs hover:scale-105 transition w-full sm:w-56"
                            >
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
                                    <span>परामर्श बुक करें</span>
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 ml-auto" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Side: Live Astrologer Rotating Card (Changes every 3 seconds -> redirects to /live-astrologers) */}
                    <div className="w-full xl:w-[380px] shrink-0">
                        <Link
                            to="/live-astrologers"
                            title="लाइव ज्योतिषी से सीधे जुड़ें (Join Live Astrologers)"
                            className="group relative h-full min-h-[110px] rounded-3xl bg-gradient-to-br from-red-950 via-stone-900 to-amber-950 text-white p-4 sm:p-5 shadow-lg border border-red-500/40 hover:border-red-400 flex items-center justify-between gap-4 overflow-hidden transition-all duration-300 hover:shadow-red-500/20 hover:scale-[1.01]"
                        >
                            {/* Subtle background glow */}
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

                            {/* Left Profile Avatar with pulsing LIVE indicator */}
                            <div className="relative shrink-0">
                                <div className="w-14 h-14 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-amber-400/80 shadow-md bg-stone-800 flex items-center justify-center">
                                    {(() => {
                                        const rawImage = activeAstrologer?.profilePicture || activeAstrologer?.image || activeAstrologer?.imageUrl || activeAstrologer?.photo;
                                        const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;
                                        if (imageSrc) {
                                            return <img src={imageSrc} alt={activeAstrologer?.name} className="w-full h-full object-cover" />;
                                        }
                                        return (
                                            <div className="w-full h-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-xl font-black text-white">
                                                {activeAstrologer?.name?.charAt(0) || 'A'}
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Pulsing LIVE tag on top of avatar */}
                                <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm border border-white/30 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                    <span>LIVE</span>
                                </div>
                            </div>

                            {/* Center Details: Rotates smoothly */}
                            <div className="flex-1 min-w-0 key={activeAstrologer?._id || currentAstroIndex}">
                                <div className="flex items-center gap-1.5 text-[14px] text-amber-300 font-bold mb-0.5">
                                    <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse shrink-0" />
                                    <span className="truncate">Vastu Consult </span>
                                </div>

                                <h4 className="text-sm sm:text-base font-extrabold text-white group-hover:text-amber-200 transition-colors truncate">
                                    {activeAstrologer?.name || 'आचार्य जी'}
                                </h4>

                                <div className="flex items-center gap-2 text-[11px] text-stone-300 mt-1">
                                    <span className="text-amber-300 font-bold flex items-center gap-0.5">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        {activeAstrologer?.rating || '4.9'}
                                    </span>
                                    <span>•</span>
                                    <span className="truncate text-amber-100/90 font-medium">
                                        {Array.isArray(activeAstrologer?.specialization)
                                            ? activeAstrologer.specialization[0]
                                            : activeAstrologer?.specialization || 'Vastu Expert'}
                                    </span>
                                </div>

                                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                                    <span className="text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                                        ₹{activeAstrologer?.pricing || 19}/min
                                    </span>
                                    <span className="text-[10px] text-amber-300/80 font-semibold group-hover:text-amber-200 flex items-center gap-0.5">
                                        <span>जुड़ें (Connect)</span>
                                        <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </span>
                                </div>
                            </div>

                            {/* Next Astrologer ticker progress dots */}
                            <div className="hidden sm:flex flex-col gap-1 items-center justify-center shrink-0 pl-1 border-l border-white/10">
                                {displayedList.slice(0, 4).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-1.5 rounded-full transition-all duration-300 ${idx === (currentAstroIndex % Math.min(displayedList.length, 4))
                                            ? 'h-4 bg-amber-400'
                                            : 'h-1.5 bg-white/25'
                                            }`}
                                    />
                                ))}
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Section Navigation Tabs */}
                <div className="bg-white rounded-2xl border border-amber-200 p-2 shadow-sm flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    <button
                        onClick={() => setActiveTab('directions')}
                        className={`px-4 py-2 rounded-xl text-[14px] font-bold transition flex items-center gap-2 cursor-pointer ${activeTab === 'directions'
                            ? 'bg-amber-900 text-white shadow-xs'
                            : 'text-stone-700 hover:bg-amber-50 hover:text-amber-950'
                            }`}
                    >
                        <Compass className="w-4 h-4 text-amber-400" />
                        <span>अष्ट दिशाएं एवं देवता (8 Directions)</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('rooms')}
                        className={`px-4 py-2 rounded-xl text-[14px] font-bold transition flex items-center gap-2 cursor-pointer ${activeTab === 'rooms'
                            ? 'bg-amber-900 text-white shadow-xs'
                            : 'text-stone-700 hover:bg-amber-50 hover:text-amber-950'
                            }`}
                    >
                        <HomeIcon className="w-4 h-4 text-amber-400" />
                        <span>कक्ष-वार वास्तु नियम (Room-wise Vastu)</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('elements')}
                        className={`px-4 py-2 rounded-xl text-[14px] font-bold transition flex items-center gap-2 cursor-pointer ${activeTab === 'elements'
                            ? 'bg-amber-900 text-white shadow-xs'
                            : 'text-stone-700 hover:bg-amber-50 hover:text-amber-950'
                            }`}
                    >
                        <Layers className="w-4 h-4 text-amber-400" />
                        <span>पंचमहाभूत संतुलन (5 Elements)</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('remedies')}
                        className={`px-4 py-2 rounded-xl text-[14px] font-bold transition flex items-center gap-2 cursor-pointer ${activeTab === 'remedies'
                            ? 'bg-amber-900 text-white shadow-xs'
                            : 'text-stone-700 hover:bg-amber-50 hover:text-amber-950'
                            }`}
                    >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>दोष निवारण व उपाय (Remedies)</span>
                    </button>
                </div>

                {/* TAB 1: 8 DIRECTIONS (अष्ट दिशाएं) */}
                {activeTab === 'directions' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                            <div>
                                <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
                                    <Compass className="w-5 h-5 text-amber-700" />
                                    <span>अष्ट दिशाएं, अधिष्ठाता देवता एवं शुभ फल</span>
                                </h2>
                                <p className="text-[14px] text-stone-900 mt-0.5">
                                    प्रत्येक दिशा का एक विशिष्ट तत्व, ग्रह और अधिष्ठाता देव होते हैं जो संबंधित फल प्रदान करते हैं।
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {DIRECTIONS.map((dir, i) => (
                                <div
                                    key={i}
                                    className={`rounded-2xl border p-4 shadow-2xs hover:shadow-md transition bg-white flex flex-col justify-between ${dir.color}`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-lg font-black">{dir.icon} {dir.name}</span>
                                            <span className="text-[14px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-black">
                                                {dir.element}
                                            </span>
                                        </div>

                                        <div className="text-[14px] text-amber-900 font-bold mb-3">
                                            देवता / स्वामी: <span className="underline">{dir.diety}</span>
                                        </div>

                                        <div className="space-y-2 text-[14px">
                                            <div>
                                                <span className="font-bold text-emerald-800 block mb-0.5">✓ शुभ उपयोग:</span>
                                                <p className="text-black text-[14px] leading-tight">{dir.bestFor}</p>
                                            </div>
                                            <div>
                                                <span className="font-bold text-rose-800 block mb-0.5">✗ वर्जित निर्माण:</span>
                                                <p className="text-black text-[14px] leading-tight">{dir.avoid}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-black/10 text-[14px] font-semibold text-stone-900">
                                        {dir.benefit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 2: ROOM-WISE TIPS (कक्ष-वार वास्तु नियम) */}
                {activeTab === 'rooms' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                            <div>
                                <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
                                    <HomeIcon className="w-5 h-5 text-amber-700" />
                                    <span>घर के मुख्य कक्षों के लिए सटीक वास्तु नियम</span>
                                </h2>
                                <p className="text-xs text-stone-600 mt-0.5">
                                    रसोई, शयनकक्ष, पूजा स्थल और मुख्य द्वार के लिए शास्त्रीय वास्तु परामर्श।
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {ROOM_TIPS.map((room, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-3xl border border-amber-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-3 mb-3">
                                            <h3 className="text-lg font-bold font-serif text-stone-900">
                                                {room.room}
                                            </h3>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
                                                {room.direction}
                                            </span>
                                        </div>

                                        <p className="text-xs text-amber-900 font-semibold mb-4 italic">
                                            "{room.hindi}"
                                        </p>

                                        <div className="space-y-3">
                                            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5">
                                                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                    <span>क्या करें (Recommended Dos)</span>
                                                </span>
                                                <ul className="space-y-1.5 text-xs text-stone-700">
                                                    {room.doList.map((tip, idx) => (
                                                        <li key={idx} className="flex items-start gap-1.5">
                                                            <span className="text-emerald-600 font-bold">•</span>
                                                            <span>{tip}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5">
                                                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                                    <XCircle className="w-4 h-4 text-rose-600" />
                                                    <span>क्या न करें (Avoid / Don'ts)</span>
                                                </span>
                                                <ul className="space-y-1.5 text-xs text-stone-700">
                                                    {room.dontList.map((tip, idx) => (
                                                        <li key={idx} className="flex items-start gap-1.5">
                                                            <span className="text-rose-600 font-bold">•</span>
                                                            <span>{tip}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 3: 5 ELEMENTS (पंचमहाभूत संतुलन) */}
                {activeTab === 'elements' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                            <div>
                                <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-amber-700" />
                                    <span>पंचमहाभूत संतुलन (Earth, Water, Fire, Air, Space)</span>
                                </h2>
                                <p className="text-xs text-stone-600 mt-0.5">
                                    समस्त ब्रह्मांड और हमारा शरीर पंचतत्वों से निर्मित है—इनका संतुलन ही वास्तु का मूल रहस्य है।
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {FIVE_ELEMENTS.map((el, i) => {
                                const Icon = el.icon;
                                return (
                                    <div
                                        key={i}
                                        className={`rounded-3xl border p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between ${el.bg}`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${el.color} text-white flex items-center justify-center shadow-md`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-bold text-stone-700 bg-white/90 border border-black/10 px-2.5 py-1 rounded-full">
                                                    {el.zone}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold text-stone-900 font-serif">
                                                {el.name}
                                            </h3>
                                            <div className="text-xs text-amber-900 font-semibold mb-2">
                                                संस्कृत नाम: {el.sanskrit} तत्व
                                            </div>

                                            <p className="text-xs text-stone-700 leading-relaxed mb-3">
                                                {el.desc}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-black/10 text-xs font-semibold text-stone-800 bg-white/60 p-2.5 rounded-xl">
                                            <span className="font-bold text-amber-900">वास्तु सूत्र: </span>
                                            {el.tips}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 4: REMEDIES & IMPORTANT DON'TS */}
                {activeTab === 'remedies' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                            <div>
                                <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-amber-700" />
                                    <span>बिना तोड़-फोड़ के वास्तु दोष निवारण (Non-Destructive Remedies)</span>
                                </h2>
                                <p className="text-xs text-stone-600 mt-0.5">
                                    वैदिक यंत्र, समुद्री नमक, पिरामिड और रंगों के संतुलन द्वारा गृह शुद्धि।
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {REMEDIES.map((rem, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-3xl border border-amber-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                                >
                                    <div className="h-44 w-full bg-stone-100 overflow-hidden relative">
                                        <img
                                            src={rem.img}
                                            alt={rem.title}
                                            className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 bg-black/60 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                                            {rem.tag}
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-base font-bold font-serif text-stone-900 mb-1.5">
                                                {rem.title}
                                            </h3>
                                            <p className="text-xs text-stone-600 leading-relaxed">
                                                {rem.desc}
                                            </p>
                                        </div>

                                        <Link
                                            to="/shop"
                                            className="mt-4 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 transition"
                                        >
                                            <span>यंत्र सामग्री देखें</span>
                                            <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Crucial Don'ts Checklist */}
                        <div className="bg-rose-50/70 border border-rose-300 rounded-3xl p-5 sm:p-6 shadow-xs">
                            <h3 className="text-base sm:text-lg font-bold font-serif text-rose-950 flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-5 h-5 text-rose-600" />
                                <span>अति-महत्वपूर्ण वास्तु निषेध (Critical Vastu Don'ts)</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {DONT_LIST.map((dont, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-2 bg-white/80 border border-rose-200 rounded-xl p-3 text-xs text-stone-800"
                                    >
                                        <span className="text-rose-600 font-bold shrink-0 mt-0.5">✗</span>
                                        <span>{dont}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Personalized Consultation Footer CTA Card */}
                <div className="rounded-3xl bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-amber-500/30 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="space-y-3 text-center lg:text-left max-w-2xl">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center justify-center lg:justify-start gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            व्यक्तिगत वास्तु समाधान
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-amber-100">
                            घर या कार्यस्थल के लिए व्यक्तिगत वास्तु विज़िट व समाधान
                        </h3>
                        
                        {/* Vedic Slogan Flex Box */}
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-400/30 backdrop-blur-xs text-amber-200">
                            <span className="text-base sm:text-lg">🕉️</span>
                            <p className="text-xs sm:text-sm font-semibold tracking-wide text-amber-100 italic leading-snug">
                                &ldquo;जहाँ सकारात्मक ऊर्जा का वास होता है, वहीं सुख, शांति और समृद्धि का निवास होता है।&rdquo;
                            </p>
                        </div>

                        <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed font-normal">
                            हमारे वरिष्ठ वैदिक वास्तु शास्त्री आपके आवासीय अथवा व्यावसायिक नक्शे (Floor Plan) का गहन विश्लेषण कर बिना तोड़-फोड़ के सटीक उपाय प्रदान करते हैं।
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        <Link
                            to="/astrologers"
                            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:scale-105 transition"
                        >
                            <PhoneCall className="w-4 h-4 text-orange-600" />
                            <span>वास्तु विशेषज्ञ से बात करें</span>
                        </Link>

                        <Link
                            to="/booking"
                            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition"
                        >
                            <Building2 className="w-4 h-4 text-amber-300" />
                            <span>वास्तु विज़िट बुक करें</span>
                        </Link>
                    </div>
                </div>

                {/* In-App Interactive Vastu Compass Calibrator Modal */}
                <VastuCompassCalibratorModal
                    isOpen={isCalibratorOpen}
                    onClose={() => setIsCalibratorOpen(false)}
                />

            </main>
        </div>
    );
}
