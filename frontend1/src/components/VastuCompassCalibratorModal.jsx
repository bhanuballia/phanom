import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Sun,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  X,
  Building2,
  Home as HomeIcon,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Maximize2
} from "lucide-react";

const MANDALA_ZONES = [
  { key: "Northwest", name: "North-West (वायव्य)", deity: "वायु / चंद्र", color: "bg-teal-50 border-teal-300 text-teal-950", defaultRes: "अतिथि कक्ष (Guest Room)", defaultComm: "स्टोर / इन्वेंट्री" },
  { key: "North", name: "North (उत्तर)", deity: "कुबेर (धन)", color: "bg-cyan-50 border-cyan-300 text-cyan-950", defaultRes: "लॉकर / तिजोरी (Vault)", defaultComm: "मुख्य द्वार (Main Entrance)" },
  { key: "Northeast", name: "North-East (ईशान)", deity: "ईश्वर / गुरु", color: "bg-blue-50 border-blue-300 text-blue-950", defaultRes: "पूजा घर / मंदिर (Mandir)", defaultComm: "रिसेप्शन / स्वागत कक्ष" },
  { key: "West", name: "West (पश्चिम)", deity: "वरुण / शनि", color: "bg-indigo-50 border-indigo-300 text-indigo-950", defaultRes: "भोजन कक्ष (Dining)", defaultComm: "कर्मचारी वर्कस्टेशन" },
  { key: "Center", name: "Center (ब्रह्मस्थान)", deity: "ब्रह्मा (आकाश)", color: "bg-amber-50 border-amber-300 text-amber-950", defaultRes: "खुला आंगन / खुला स्थान", defaultComm: "लॉबी / केंद्रीय क्षेत्र" },
  { key: "East", name: "East (पूर्व)", deity: "सूर्य / इंद्र", color: "bg-yellow-50 border-yellow-300 text-yellow-950", defaultRes: "मुख्य द्वार / बैठक (Living)", defaultComm: "वर्कस्टेशन / कार्यकारी डेस्क" },
  { key: "Southwest", name: "South-West (नैऋत्य)", deity: "निर्रिति / राहु", color: "bg-yellow-100 border-yellow-400 text-yellow-950", defaultRes: "मास्टर बेडरूम (Master Bed)", defaultComm: "मालिक / निदेशक केबिन" },
  { key: "South", name: "South (दक्षिण)", deity: "यम (मंगल)", color: "bg-rose-50 border-rose-300 text-rose-950", defaultRes: "भंडार कक्ष / शयनकक्ष", defaultComm: "सम्मेलन कक्ष (Conference)" },
  { key: "Southeast", name: "South-East (आग्नेय)", deity: "अग्नि देव", color: "bg-orange-50 border-orange-300 text-orange-950", defaultRes: "रसोईघर (Kitchen)", defaultComm: "कैश काउंटर / पैंट्री" }
];

const RESIDENTIAL_ROOM_OPTIONS = [
  "खुला / कोई नहीं",
  "मुख्य द्वार (Main Entrance)",
  "रसोईघर (Kitchen)",
  "पूजा घर (Pooja Room)",
  "मास्टर बेडरूम (Master Bedroom)",
  "बच्चों का कमरा (Children Bedroom)",
  "अतिथि कक्ष (Guest Room)",
  "शौचालय (Toilet)",
  "स्नानघर (Bathroom)",
  "बैठक कक्ष (Living Room)",
  "अध्ययन कक्ष (Study Room)",
  "तिजोरी / धन स्थान (Locker/Vault)",
  "भंडार कक्ष (Store Room)",
  "भोजन कक्ष (Dining Room)",
  "बालकनी / खुला स्थान (Balcony)"
];

const COMMERCIAL_ROOM_OPTIONS = [
  "खुला / कोई नहीं",
  "मुख्य द्वार (Main Entrance)",
  "मालिक का केबिन (Owner Cabin)",
  "कर्मचारी वर्कस्टेशन (Workstations)",
  "रिसेप्शन / स्वागत (Reception)",
  "कैश काउंटर (Cash Counter)",
  "तिजोरी / सेफ (Safe/Locker)",
  "कॉन्फ्रेंस रूम (Conference Room)",
  "पैंट्री / किचन (Pantry)",
  "शौचालय (Toilet)",
  "स्टोर / गोदाम (Inventory/Store)",
  "लॉबी / खुला क्षेत्र (Lobby)"
];

export default function VastuCompassCalibratorModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("mandala"); // 'mandala' | 'sunrise' | 'compass' | 'score'
  const [propertyType, setPropertyType] = useState("residential"); // 'residential' | 'commercial'
  const [isMobile, setIsMobile] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [heading, setHeading] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState("North");

  // Grid layout state
  const [layout, setLayout] = useState({
    Northwest: "अतिथि कक्ष (Guest Room)",
    North: "तिजोरी / धन स्थान (Locker/Vault)",
    Northeast: "पूजा घर (Pooja Room)",
    West: "भोजन कक्ष (Dining Room)",
    Center: "खुला / कोई नहीं",
    East: "मुख्य द्वार (Main Entrance)",
    Southwest: "मास्टर बेडरूम (Master Bedroom)",
    South: "भंडार कक्ष (Store Room)",
    Southeast: "रसोईघर (Kitchen)"
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Check device type
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileUA = /Mobi|Android|iPhone|iPod/i.test(userAgent) && !/iPad|Tablet|PlayBook|Silicon/i.test(userAgent);
      setIsMobile(isMobileUA || window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Sync default layout on property type switch
  useEffect(() => {
    if (propertyType === "commercial") {
      setLayout({
        Northwest: "स्टोर / इन्वेंट्री",
        North: "मुख्य द्वार (Main Entrance)",
        Northeast: "रिसेप्शन / स्वागत",
        West: "कर्मचारी वर्कस्टेशन (Workstations)",
        Center: "लॉबी / खुला क्षेत्र (Lobby)",
        East: "कर्मचारी वर्कस्टेशन (Workstations)",
        Southwest: "मालिक का केबिन (Owner Cabin)",
        South: "कॉन्फ्रेंस रूम (Conference Room)",
        Southeast: "कैश काउंटर (Cash Counter)"
      });
    } else {
      setLayout({
        Northwest: "अतिथि कक्ष (Guest Room)",
        North: "तिजोरी / धन स्थान (Locker/Vault)",
        Northeast: "पूजा घर (Pooja Room)",
        West: "भोजन कक्ष (Dining Room)",
        Center: "खुला / कोई नहीं",
        East: "मुख्य द्वार (Main Entrance)",
        Southwest: "मास्टर बेडरूम (Master Bedroom)",
        South: "भंडार कक्ष (Store Room)",
        Southeast: "रसोईघर (Kitchen)"
      });
    }
  }, [propertyType]);

  // Handle device orientation
  useEffect(() => {
    if (!isOpen || activeTab !== "compass" || !isMobile || !permissionGranted) return;

    const handleOrientation = (e) => {
      if (e.webkitCompassHeading !== undefined) {
        setHeading(Math.round(e.webkitCompassHeading));
      } else if (e.alpha !== undefined) {
        let compassHeading = 360 - e.alpha;
        setHeading(Math.round(compassHeading % 360));
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, [isOpen, activeTab, isMobile, permissionGranted]);

  const startCamera = async () => {
    try {
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === "granted") {
          setPermissionGranted(true);
        } else {
          alert("Compass sensor permission denied.");
          return;
        }
      } else {
        setPermissionGranted(true);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraActive(false);
      setPermissionGranted(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const getDirectionString = (deg) => {
    const directions = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  const handleRoomChange = (zoneKey, value) => {
    setLayout((prev) => ({
      ...prev,
      [zoneKey]: value
    }));
  };

  // Calculate live Vastu score based on standard Vedic principles
  const calculateScore = () => {
    let score = 70; // baseline
    const isRes = propertyType === "residential";

    if (isRes) {
      // Kitchen in Southeast is ideal (+10), Northeast is critical dosh (-20)
      if (layout.Southeast?.includes("Kitchen") || layout.Southeast?.includes("रसोईघर")) score += 10;
      if (layout.Northeast?.includes("Kitchen") || layout.Northeast?.includes("रसोईघर")) score -= 25;

      // Mandir in Northeast is ideal (+10), Southwest is bad (-15)
      if (layout.Northeast?.includes("Pooja") || layout.Northeast?.includes("मंदिर") || layout.Northeast?.includes("पूजा")) score += 10;
      if (layout.Southwest?.includes("Pooja") || layout.Southwest?.includes("मंदिर")) score -= 15;

      // Master bed in Southwest (+10), Northeast is dosh (-15)
      if (layout.Southwest?.includes("Master") || layout.Southwest?.includes("मास्टर")) score += 10;
      if (layout.Northeast?.includes("Master") || layout.Northeast?.includes("मास्टर")) score -= 15;

      // Toilet in Northeast or Center is heavy dosh (-20)
      if (layout.Northeast?.includes("Toilet") || layout.Northeast?.includes("शौचालय")) score -= 25;
      if (layout.Center?.includes("Toilet") || layout.Center?.includes("शौचालय")) score -= 25;
      if (layout.Northwest?.includes("Toilet") || layout.South?.includes("Toilet") || layout.Northwest?.includes("शौचालय")) score += 5;

      // North entrance or locker
      if (layout.North?.includes("Entrance") || layout.North?.includes("Locker") || layout.North?.includes("तिजोरी")) score += 10;
    } else {
      // Commercial checks
      if (layout.Southwest?.includes("Owner") || layout.Southwest?.includes("मालिक")) score += 15;
      if (layout.Northeast?.includes("Reception") || layout.Northeast?.includes("रिसेप्शन")) score += 10;
      if (layout.Southeast?.includes("Cash") || layout.Southeast?.includes("कैश")) score += 10;
      if (layout.North?.includes("Entrance") || layout.East?.includes("Entrance") || layout.North?.includes("मुख्य द्वार")) score += 10;
    }

    return Math.min(100, Math.max(30, score));
  };

  if (!isOpen) return null;

  const currentScore = calculateScore();
  const roomOptions = propertyType === "residential" ? RESIDENTIAL_ROOM_OPTIONS : COMMERCIAL_ROOM_OPTIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#fffdfa] border border-amber-300 w-full max-w-4xl rounded-3xl shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-amber-200 bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide font-cinzel text-amber-100">
                  वास्तु शास्त्र दिशा सूचक एवं कक्ष स्थिति कैलिब्रेटर
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                  LIVE IN-APP
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                प्राचीन 9-पद वास्तु पुरुष मंडल अनुसार अपने घर अथवा व्यावसायिक प्रतिष्ठान की दिशा ऊर्जा जांचें
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="बंद करें (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Property Type Selector & Mode Tabs */}
        <div className="bg-amber-50/70 border-b border-amber-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Residential vs Commercial */}
          <div className="flex items-center bg-white border border-amber-300 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setPropertyType("residential")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                propertyType === "residential"
                  ? "bg-amber-900 text-white shadow-xs"
                  : "text-stone-700 hover:text-amber-900"
              }`}
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>आवासीय गृह (Residential)</span>
            </button>
            <button
              onClick={() => setPropertyType("commercial")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                propertyType === "commercial"
                  ? "bg-amber-900 text-white shadow-xs"
                  : "text-stone-700 hover:text-amber-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>व्यावसायिक / दुकान (Commercial)</span>
            </button>
          </div>

          {/* Calibrator Mode Tabs */}
          <div className="flex items-center bg-white border border-amber-300 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => {
                stopCamera();
                setActiveTab("mandala");
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "mandala"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-600 hover:text-amber-900"
              }`}
            >
              📐 9-मंडल कक्ष ग्रिड
            </button>
            <button
              onClick={() => {
                stopCamera();
                setActiveTab("sunrise");
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "sunrise"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-600 hover:text-amber-900"
              }`}
            >
              ☀️ सूर्योदय विधि
            </button>
            <button
              onClick={() => {
                setActiveTab("compass");
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "compass"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-600 hover:text-amber-900"
              }`}
            >
              📱 लाइव कंपास
            </button>
          </div>
        </div>

        {/* Main Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* TAB 1: 9-ZONE MANDALA INTERACTIVE GRID */}
          {activeTab === "mandala" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>वास्तु पद मंडल - प्रत्येक दिशा के कक्ष का चयन करें</span>
                  </h4>
                  <p className="text-xs text-stone-500">
                    नीचे दिए गए 9-जोन ग्रिड में अपनी संपत्ति के अनुसार कमरों की स्थिति चुनें।
                  </p>
                </div>

                {/* Live Score Badge */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-stone-500 font-semibold block">वास्तु अनुकूलता अंक</span>
                    <span className="text-lg font-black text-amber-950 font-cinzel">
                      {currentScore}/100
                    </span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                    currentScore >= 80 ? "bg-emerald-100 text-emerald-900 border border-emerald-300" :
                    currentScore >= 60 ? "bg-amber-100 text-amber-900 border border-amber-300" :
                    "bg-rose-100 text-rose-900 border border-rose-300"
                  }`}>
                    {currentScore >= 80 ? "उत्तम (A+)" : currentScore >= 60 ? "मध्यम (B)" : "दोषपूर्ण (C)"}
                  </div>
                </div>
              </div>

              {/* 3x3 Mandala Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MANDALA_ZONES.map((zone) => (
                  <div
                    key={zone.key}
                    className={`rounded-2xl border p-3.5 flex flex-col justify-between shadow-2xs transition-all hover:shadow-md ${zone.color}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black uppercase tracking-wide">
                          {zone.name}
                        </span>
                        <span className="text-[10px] font-bold opacity-75">
                          {zone.deity}
                        </span>
                      </div>

                      <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                        वर्तमान कक्ष (Current Room):
                      </label>
                      <select
                        value={layout[zone.key] || "खुला / कोई नहीं"}
                        onChange={(e) => handleRoomChange(zone.key, e.target.value)}
                        className="w-full text-xs font-medium bg-white/95 border border-amber-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
                      >
                        {roomOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-bold">
                      <span className="opacity-75">आदर्श व्यवस्था:</span>
                      <span className="text-amber-900 font-extrabold truncate ml-1">
                        {propertyType === "residential" ? zone.defaultRes : zone.defaultComm}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vedic Advice Insight based on Current Layout */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-stone-700 space-y-1.5">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>वैदिक स्थापत्य शास्त्र परामर्श (Real-time Vastu Findings):</span>
                </div>
                <p>
                  • <strong>ईशान कोण (NE)</strong>: हमेशा हल्का व स्वच्छ रखें। यदि यहाँ पूजा घर अथवा खुला जल स्थान है तो ज्ञान और आरोग्य में वृद्धि होती है।
                </p>
                <p>
                  • <strong>आग्नेय कोण (SE)</strong>: रसोईघर हेतु सर्वोत्कृष्ट है। यहाँ पानी की टंकी या शौचालय बनाने से आर्थिक हानि व स्वास्थ्य समस्याएं हो सकती हैं।
                </p>
                <p>
                  • <strong>नैऋत्य कोण (SW)</strong>: भारी व ऊँचा होना चाहिए। परिवार के मुखिया का शयनकक्ष यहाँ होने से निर्णयों में स्थिरता और अधिकार प्राप्त होता है।
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SUNRISE METHOD */}
          {activeTab === "sunrise" && (
            <div className="space-y-4 text-center">
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-amber-50 to-orange-100 rounded-full border-2 border-amber-400 flex items-center justify-center relative shadow-inner">
                <div className="absolute top-2 text-[11px] font-black text-cyan-900">उत्तर (NORTH)</div>
                <div className="absolute bottom-2 text-[11px] font-black text-rose-900">दक्षिण (SOUTH)</div>
                <div className="absolute right-2 text-[11px] font-black text-amber-950">पूर्व ☀️ (SUNRISE)</div>
                <div className="absolute left-2 text-[11px] font-black text-indigo-900">पश्चिम (WEST)</div>
                <div className="text-4xl animate-bounce">🧘‍♂️</div>
              </div>

              <div className="text-left bg-white border border-amber-200 p-5 rounded-2xl space-y-2.5 text-xs text-stone-700 shadow-2xs max-w-xl mx-auto">
                <p className="font-extrabold text-amber-950 text-sm mb-1 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>सूर्योदय आधारित दिशा निर्धारण विधि (Step-by-Step Sunrise Method):</span>
                </p>
                <p>1. सुबह सूर्योदय के समय अपने <strong>घर अथवा भूखंड के ठीक केंद्र (ब्रह्मस्थान)</strong> में खड़े हों।</p>
                <p>2. अपना मुख सीधे उगते हुए सूर्य यानी <strong>पूर्व दिशा (East)</strong> की ओर करें।</p>
                <p>3. पूर्व दिशा की ओर मुख करके खड़े होने पर:</p>
                <ul className="list-disc pl-5 space-y-1 font-medium">
                  <li>आपका <strong>बायां हाथ (Left hand)</strong> ठीक <strong>उत्तर दिशा (North)</strong> को दर्शाएगा।</li>
                  <li>आपका <strong>दायां हाथ (Right hand)</strong> ठीक <strong>दक्षिण दिशा (South)</strong> को दर्शाएगा।</li>
                  <li>आपकी <strong>पीठ के पीछे</strong> की दिशा <strong>पश्चिम (West)</strong> होगी।</li>
                  <li>आपके बाईं ओर सामने का कोना <strong>ईशान कोण (North-East)</strong> कहलाएगा।</li>
                  <li>आपके दाईं ओर सामने का कोना <strong>आग्नेय कोण (South-East)</strong> कहलाएगा।</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: PHONE COMPASS & SENSORS */}
          {activeTab === "compass" && (
            <div className="space-y-4 text-center">
              {!isMobile ? (
                <div className="py-10 px-6 bg-white border border-amber-200 rounded-2xl space-y-3 max-w-md mx-auto shadow-sm">
                  <span className="text-4xl block">💻</span>
                  <h4 className="font-bold text-stone-900">स्मार्टफोन अथवा मोबाइल सेंसर आवश्यक</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    लाइव सेंसर-आधारित मैग्नेटोमीटर कंपास केवल स्मार्टफोन में समर्थित है। कृपया डेस्कटॉप पर ऊपर दिए गए <strong>"☀️ सूर्योदय विधि"</strong> या <strong>"📐 9-मंडल कक्ष ग्रिड"</strong> टैब का उपयोग करें।
                  </p>
                </div>
              ) : (
                <div className="space-y-4 flex flex-col items-center max-w-md mx-auto">
                  {!permissionGranted ? (
                    <div className="py-8 bg-white border border-amber-200 rounded-2xl p-6 space-y-4 shadow-sm text-center">
                      <Compass className="w-12 h-12 text-amber-600 mx-auto animate-pulse" />
                      <p className="text-xs text-stone-700 leading-relaxed">
                        सटीक दिशा कोण मापने हेतु आपके स्मार्टफोन के कंपास और कैमरा सेंसर की अनुमति चाहिए।
                      </p>
                      <button
                        onClick={startCamera}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow hover:scale-105 transition cursor-pointer"
                      >
                        कंपास सेंसर सक्रिय करें
                      </button>
                    </div>
                  ) : (
                    <div className="w-full space-y-4">
                      {/* Compass Dial */}
                      <div className="w-56 h-56 mx-auto relative rounded-full border-4 border-amber-500 bg-stone-900 flex items-center justify-center shadow-xl overflow-hidden">
                        {cameraActive && (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover opacity-35"
                          />
                        )}
                        <div
                          className="w-48 h-48 rounded-full border border-amber-400/50 flex items-center justify-center relative transition-transform duration-200"
                          style={{ transform: `rotate(${-heading}deg)` }}
                        >
                          <div className="absolute top-2 text-xs font-black text-red-500">N (0°)</div>
                          <div className="absolute right-2 text-xs font-black text-amber-400">E (90°)</div>
                          <div className="absolute bottom-2 text-xs font-black text-yellow-400">S (180°)</div>
                          <div className="absolute left-2 text-xs font-black text-blue-400">W (270°)</div>
                          <div className="w-1 h-20 bg-gradient-to-t from-transparent via-red-500 to-red-600 rounded-full"></div>
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-2xl font-black text-white font-mono">{heading}°</span>
                          <span className="text-xs font-bold text-amber-300">{getDirectionString(heading)}</span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-xs text-stone-700">
                        वर्तमान मुख्य द्वार दिशा: <strong>{getDirectionString(heading)} ({heading}°)</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 border-t border-amber-200 bg-amber-50/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>लाइव वास्तु विश्लेषण एवं ऊर्जा समन्वय सक्रिय</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-bold transition shadow-xs cursor-pointer"
            >
              पूर्ण हुआ (Done)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
