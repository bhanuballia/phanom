// frontend/src/pages/VastuAnalyzer.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import PlaceAutocomplete from "../components/PlaceAutocomplete";
import { fetchVastuAnalysis } from "../services/api";
import VastuCompassCalibrator from "../components/VastuCompassCalibrator";

const RESIDENTIAL_ROOM_OPTIONS = [
  "None",
  "Entrance",
  "Kitchen",
  "Pooja Room",
  "Master Bedroom",
  "Children's Bedroom",
  "Guest Bedroom",
  "Toilet",
  "Bathroom",
  "Living Room",
  "Study Room",
  "Locker/Vault",
  "Store Room",
  "Dining Room",
  "Balcony"
];

const COMMERCIAL_ROOM_OPTIONS = [
  "None",
  "Main Entrance",
  "Owner's Cabin/Desk",
  "Employee Workstations",
  "Reception",
  "Cash Counter",
  "Safe/Locker",
  "Conference Room",
  "Pantry/Kitchen",
  "Toilet",
  "Store Room/Inventory",
  "Lobby"
];

// Coordinate direction names to mandala layout coordinates
const MANDALA_ZONES = [
  { key: "Northwest", name: "North-West (Vayavya)", bg: "bg-emerald-50/60 border-emerald-100 hover:bg-emerald-50", text: "text-emerald-950" },
  { key: "North", name: "North (Uttara)", bg: "bg-blue-50/60 border-blue-100 hover:bg-blue-50", text: "text-blue-950" },
  { key: "Northeast", name: "North-East (Eesanya)", bg: "bg-cyan-50/60 border-cyan-100 hover:bg-cyan-50", text: "text-cyan-950" },
  { key: "West", name: "West (Paschim)", bg: "bg-indigo-50/60 border-indigo-100 hover:bg-indigo-50", text: "text-indigo-955" },
  { key: "Center", name: "Center (Brahmasthan)", bg: "bg-purple-50/60 border-purple-100 hover:bg-purple-50", text: "text-purple-955" },
  { key: "East", name: "East (Purva)", bg: "bg-amber-50/60 border-amber-100 hover:bg-amber-50", text: "text-amber-955" },
  { key: "Southwest", name: "South-West (Nairutya)", bg: "bg-yellow-50/60 border-yellow-100 hover:bg-yellow-50", text: "text-yellow-955" },
  { key: "South", name: "South (Dakshin)", bg: "bg-orange-50/60 border-orange-100 hover:bg-orange-50", text: "text-orange-955" },
  { key: "Southeast", name: "South-East (Agneya)", bg: "bg-rose-50/60 border-rose-100 hover:bg-rose-50", text: "text-rose-955" }
];

export default function VastuAnalyzer() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [tzOffset, setTzOffset] = useState(5.5);
  const [latLon, setLatLon] = useState(null);

  const [propertyType, setPropertyType] = useState("residential");
  const [intent, setIntent] = useState("buy");

  const [layout, setLayout] = useState({
    Northwest: "Guest Bedroom",
    North: "Locker/Vault",
    Northeast: "Pooja Room",
    West: "Dining Room",
    Center: "None",
    East: "Entrance",
    Southwest: "Master Bedroom",
    South: "Store Room",
    Southeast: "Kitchen"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("mandala");
  const [calibratorOpen, setCalibratorOpen] = useState(false);
  const [is3D, setIs3D] = useState(false);

  // Sync default layout when property type changes
  useEffect(() => {
    if (propertyType === "commercial") {
      setLayout({
        Northwest: "Store Room/Inventory",
        North: "Main Entrance",
        Northeast: "Reception",
        West: "Employee Workstations",
        Center: "Lobby",
        East: "Employee Workstations",
        Southwest: "Owner's Cabin/Desk",
        South: "Conference Room",
        Southeast: "Cash Counter"
      });
    } else {
      setLayout({
        Northwest: "Guest Bedroom",
        North: "Locker/Vault",
        Northeast: "Pooja Room",
        West: "Dining Room",
        Center: "None",
        East: "Entrance",
        Southwest: "Master Bedroom",
        South: "Store Room",
        Southeast: "Kitchen"
      });
    }
  }, [propertyType]);

  // Read URL parameters on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlName = params.get("name");
    const urlDate = params.get("date");
    const urlTime = params.get("time");
    const urlLat = params.get("lat");
    const urlLon = params.get("lon");
    const urlTz = params.get("tz");
    const urlLoc = params.get("loc");

    if (urlName) setName(urlName);
    if (urlDate) setDate(urlDate);
    if (urlTime) setTime(urlTime.substring(0, 5));
    if (urlTz) setTzOffset(parseFloat(urlTz));
    if (urlLat && urlLon) {
      setLatLon({
        lat: parseFloat(urlLat),
        lon: parseFloat(urlLon),
        display_name: urlLoc || `${urlLat}, ${urlLon}`
      });
    } else {
      setLatLon({
        lat: 28.6139,
        lon: 77.2090,
        display_name: "New Delhi, India"
      });
    }
  }, []);

  // Auto-detect & synchronize user profile details when user is authenticated
  useEffect(() => {
    if (user) {
      if (user.name) {
        setName((prev) => prev || user.name);
      }
      if (user.dateOfBirth) {
        let dob = user.dateOfBirth;
        if (typeof dob === "string" && dob.includes("T")) {
          dob = dob.split("T")[0];
        }
        setDate((prev) => prev || dob);
      }
      if (user.timeOfBirth) {
        setTime((prev) => prev || user.timeOfBirth.substring(0, 5));
      }
      if (user.placeOfBirth || user.city) {
        const placeStr = user.placeOfBirth || user.city;
        setLatLon((prev) => {
          if (!prev || prev.display_name === "New Delhi, India") {
            return {
              lat: user.lat || 28.6139,
              lon: user.lon || 77.2090,
              display_name: placeStr
            };
          }
          return prev;
        });
      }
    }
  }, [user]);

  // Run calculation whenever parameters change
  useEffect(() => {
    if (date && latLon) {
      triggerAnalysis();
    }
  }, [date, latLon, layout, propertyType]);

  const triggerAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        date,
        time: time ? `${time}:00` : "12:00:00",
        tz_offset: tzOffset,
        lat: latLon.lat,
        lon: latLon.lon,
        layout,
        property_type: propertyType
      };
      const res = await fetchVastuAnalysis(payload);
      setResult(res);
    } catch (err) {
      console.error("Vastu analysis error:", err);
      setError(err?.message || "Failed to analyze Vastu.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place) => {
    setLatLon(place);
    if (place?.tz_offset_hours) {
      setTzOffset(place.tz_offset_hours);
    }
  };

  const handleRoomChange = (direction, room) => {
    setLayout(prev => ({
      ...prev,
      [direction]: room
    }));
  };

  // Get dynamic room list based on property type selection
  const roomOptions = propertyType === "commercial" ? COMMERCIAL_ROOM_OPTIONS : RESIDENTIAL_ROOM_OPTIONS;

  // Custom guidance content based on property type and intent
  const getIntentGuidance = () => {
    const isCommercial = propertyType === "commercial";

    if (intent === "build") {
      return {
        title: isCommercial ? "Construction Guidelines (Office/Shop)" : "Construction Guidelines (New House)",
        tips: [
          "Plot Selection: Ensure the shape of the land is Square or Rectangular. Avoid irregular curves or extensions.",
          "Digging Sequence: Always begin excavating from the North-East zone and finish digging the South-West corner last.",
          "Foundation Block: Place the very first foundation stone/brick in the South-West or South-East zone to anchor heavy energy.",
          isCommercial
            ? "Ensure the commercial main entrance is tall, wide, and clutter-free to attract active footfall."
            : "Keep the Northeast zone of the plot completely empty or dedicated only to water reservoirs or prayer halls."
        ]
      };
    } else if (intent === "buy") {
      return {
        title: isCommercial ? "Purchase Checklist (Office/Shop)" : "Purchase Checklist (Apartment/Flat)",
        tips: [
          "Main Entrance Facing: Look for North, North-East, or East facing entrances. Avoid South-West facing main gates.",
          "Cut Corners: Check that the floor plan has no cuts or missing areas in the North-East (cuts block wisdom/growth) or South-West (cuts cause instability).",
          "Wet Placements: Strictly avoid flats or offices where the toilet, pantry, or kitchen is located exactly in the North-East zone.",
          isCommercial
            ? "Check that the cash counter area has solid wall support in the South and West."
            : "Ensure the kitchen is positioned in the South-East (Fire element) zone of the flat."
        ]
      };
    } else {
      return {
        title: isCommercial ? "Rental Guidelines (Office/Shop)" : "Rental Guidelines (House/Rooms)",
        tips: [
          "Billing/Safe Position: For rented shops, position your cash safe or billing counter in the North or East facing direction.",
          "Landlord Remedies: Since structural modifications might not be permitted on rent, place pyramid panels or element color strips to block negative energies.",
          "Owner Desk: Sit in the South-West zone facing North or East to establish authority and attract smooth rent negotiations.",
          isCommercial
            ? "Place a silver wind-chime in the Northwest zone to ensure continuous movement of items and guest footfall."
            : "Verify that the water dispenser or sink is not in the Southeast (Fire) zone of the kitchen."
        ]
      };
    }
  };

  const guidance = getIntentGuidance();

  return (
    <div className="min-h-screen bg-rose-50/30 text-slate-800 p-6 md:p-10 font-sans antialiased">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header - Professional Layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-rose-200/80 pb-6 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-slate-900">
              Vastu & Astro-Vastu Dashboard
            </h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">
              Analyze room placements, directional element mapping, and planetary lord charts.
            </p>
          </div>
          <button
            onClick={() => window.close()}
            className="px-5 py-2.5 bg-white text-slate-700 hover:text-slate-900 rounded-xl text-sm font-bold border border-rose-200 hover:bg-rose-50/50 shadow-sm transition-all self-start flex items-center gap-1.5"
          >
            ✕ Close Window
          </button>
        </div>

        {/* Property Intent Configurator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-rose-150 p-6 rounded-2xl shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Property Category
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPropertyType("residential")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border ${propertyType === "residential"
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50/50"
                  }`}
              >
                🏠 Residential Home
              </button>
              <button
                onClick={() => setPropertyType("commercial")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border ${propertyType === "commercial"
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50/50"
                  }`}
              >
                🏢 Commercial Space
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Vastu Purpose
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setIntent("build")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all border ${intent === "build"
                  ? "bg-rose-700 text-white border-rose-700 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50/50"
                  }`}
              >
                🏗️ Construction
              </button>
              <button
                onClick={() => setIntent("buy")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all border ${intent === "buy"
                  ? "bg-rose-700 text-white border-rose-700 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50/50"
                  }`}
              >
                🔑 Purchase
              </button>
              <button
                onClick={() => setIntent("rent")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all border ${intent === "rent"
                  ? "bg-rose-700 text-white border-rose-700 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50/50"
                  }`}
              >
                📜 Rental Space
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Panel: Form details */}
          <div className="lg:col-span-1 bg-white border border-rose-150 rounded-2xl p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 border-b border-rose-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>👤</span> Birth Identity
              </div>
              {user && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Auto-detected ({user.name?.split(' ')[0] || 'User'})
                </span>
              )}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900">Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-rose-500 mt-1.5"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900">Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-rose-500 mt-1.5"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900">Time</label>
                  <input
                    type="time"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-rose-500 mt-1.5"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900">Birth Place</label>
                <div className="mt-1.5 text-black">
                  <PlaceAutocomplete value={latLon?.display_name || ""} onSelect={handlePlaceSelect} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900">Timezone Offset</label>
                  <input
                    type="number"
                    step="0.25"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-rose-500 mt-1.5"
                    value={tzOffset}
                    onChange={(e) => setTzOffset(parseFloat(e.target.value))}
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <button
                    onClick={triggerAnalysis}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold transition-all shadow-sm border border-rose-600"
                  >
                    Analyze Map
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs font-medium">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Right Panel: Vastu Mandala and Tabs */}
          <div className="lg:col-span-2 space-y-6">

            {/* Scorecard Component */}
            {result && (
              <div className="bg-white border border-rose-150 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-rose-500 flex items-center justify-center bg-rose-50 shadow-inner">
                    <span className="text-lg font-black text-rose-700">{result.overall_score}%</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Overall Vastu Index</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Derived from chart alignments ({result.astro_vastu_score}%) & layout compatibility ({result.layout_compatibility_score}%).
                    </p>
                  </div>
                </div>
                <div className="text-xs font-bold px-4 py-2 bg-rose-50/50 border border-rose-200 rounded-xl text-rose-800">
                  Lagna: <span className="font-extrabold">{result.ascendant || "N/A"}</span>
                </div>
              </div>
            )}

            {/* Premium Tabbed Navigation (Segmented Switch style) */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-inner">
              <button
                onClick={() => setActiveTab("mandala")}
                className={`flex-1 py-2 text-center rounded-lg font-bold text-xs md:text-sm transition-all ${activeTab === "mandala" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                📐 House Mandala Grid
              </button>
              <button
                onClick={() => setActiveTab("planets")}
                className={`flex-1 py-2 text-center rounded-lg font-bold text-xs md:text-sm transition-all ${activeTab === "planets" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                🪐 Astro-Vastu Strengths
              </button>
              <button
                onClick={() => setActiveTab("remedies")}
                className={`flex-1 py-2 text-center rounded-lg font-bold text-xs md:text-sm transition-all ${activeTab === "remedies" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                📿 Remedies & Tips
              </button>
            </div>

            {/* Tab: Mandala Grid */}
            {activeTab === "mandala" && (
              <div className="bg-white border border-rose-150 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-rose-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Interactive Mandala Layout</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Assign your rooms to directions to compute Vastu score.</p>
                  </div>
                  <div className="flex gap-2 self-start md:self-auto">
                    <button
                      onClick={() => setCalibratorOpen(true)}
                      className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <span>🧭</span> Calibrate Directions
                    </button>
                    <button
                      onClick={() => setIs3D(prev => !prev)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 border ${
                        is3D 
                          ? "bg-rose-600 text-white border-rose-600" 
                          : "bg-white text-slate-750 border-slate-205 hover:bg-rose-50/50"
                      }`}
                    >
                      <span>🧊</span> {is3D ? "2D View" : "Isometric 3D"}
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="h-96 flex items-center justify-center text-slate-400 animate-pulse font-serif text-base tracking-wider">
                    Analyzing celestial alignments...
                  </div>
                ) : (
                  <div 
                    className="grid grid-cols-3 gap-3 md:gap-4 max-w-md mx-auto aspect-square transition-all duration-700 ease-in-out py-6"
                    style={is3D ? {
                      transform: "perspective(1000px) rotateX(55deg) rotateZ(-45deg)",
                      transformStyle: "preserve-3d"
                    } : {}}
                  >
                    {MANDALA_ZONES.map((zone) => {
                      const analysis = result?.directions?.[zone.key] || {};
                      const roomVal = layout[zone.key] || "None";
                      const isCompatible = analysis.is_room_compatible !== false;
                      const planetStrength = analysis.planet_strength || "N/A";

                      // Deduce 3D wall background shading based on element zone
                      let wallBg = "bg-slate-200/80";
                      let wallBorder = "border-slate-300";
                      if (zone.key === "Northwest") { wallBg = "bg-teal-200/80"; wallBorder = "border-teal-300"; }
                      else if (zone.key === "North") { wallBg = "bg-blue-200/80"; wallBorder = "border-blue-300"; }
                      else if (zone.key === "Northeast") { wallBg = "bg-cyan-200/80"; wallBorder = "border-cyan-300"; }
                      else if (zone.key === "West") { wallBg = "bg-indigo-200/80"; wallBorder = "border-indigo-300"; }
                      else if (zone.key === "Center") { wallBg = "bg-purple-200/80"; wallBorder = "border-purple-300"; }
                      else if (zone.key === "East") { wallBg = "bg-amber-200/80"; wallBorder = "border-amber-300"; }
                      else if (zone.key === "Southwest") { wallBg = "bg-yellow-200/80"; wallBorder = "border-yellow-300"; }
                      else if (zone.key === "South") { wallBg = "bg-orange-200/80"; wallBorder = "border-orange-300"; }
                      else if (zone.key === "Southeast") { wallBg = "bg-rose-200/80"; wallBorder = "border-rose-300"; }

                      return (
                        <div
                          key={zone.key}
                          className={`relative border rounded-xl p-3 flex flex-col justify-between transition-all duration-700 hover:scale-[1.01] ${zone.bg} ${
                            is3D 
                              ? "shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15),_0_10px_10px_-5px_rgba(0,0,0,0.1)] border-slate-300" 
                              : "shadow-sm border-slate-200"
                          }`}
                          style={is3D ? {
                            transform: "translateZ(30px)",
                            transformStyle: "preserve-3d"
                          } : {}}
                        >
                          {/* Extruded Walls in 3D Mode */}
                          {is3D && (
                            <>
                              {/* Bottom Wall */}
                              <div 
                                className={`absolute left-0 right-0 h-[30px] bottom-0 origin-bottom border-l border-r border-b ${wallBg} ${wallBorder}`}
                                style={{
                                  transform: "rotateX(-90deg) translateY(30px)",
                                  transformOrigin: "bottom"
                                }}
                              />
                              {/* Right Wall */}
                              <div 
                                className={`absolute top-0 bottom-0 w-[30px] right-0 origin-right border-t border-b border-r ${wallBg} ${wallBorder}`}
                                style={{
                                  transform: "rotateY(90deg) translateX(30px)",
                                  transformOrigin: "right"
                                }}
                              />
                            </>
                          )}

                          {/* Top Indicators */}
                          <div className="flex justify-between items-center">
                            <span className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">
                              {zone.key}
                            </span>
                            {result && (
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${planetStrength === "Excellent" || planetStrength === "Strong"
                                  ? "bg-emerald-500 animate-ping"
                                  : planetStrength === "Average"
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                  }`}
                                title={`Planet strength: ${planetStrength}`}
                              />
                            )}
                          </div>

                          {/* Dropdown Room Selector */}
                          <div className="my-2.5">
                            <select
                              value={roomVal}
                              onChange={(e) => handleRoomChange(zone.key, e.target.value)}
                              className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg p-1.5 text-xs md:text-sm font-bold focus:outline-none focus:border-rose-400 cursor-pointer shadow-inner"
                            >
                              {roomOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>

                          {/* Element Badge */}
                          <div className="flex items-center justify-between text-xs font-extrabold text-slate-600">
                            <span>{analysis.element || "Space"}</span>
                            {roomVal !== "None" && result && (
                              <span className={`font-black uppercase tracking-wider ${isCompatible ? "text-emerald-700" : "text-rose-600"}`}>
                                {isCompatible ? "✓ OK" : "✗ Alert"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Planets */}
            {activeTab === "planets" && (
              <div className="bg-white border border-rose-150 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b border-rose-100 pb-3">Planetary Direction Lords</h3>
                <p className="text-xs text-slate-400 mb-2">Each cardinal direction matches a planetary ruler. High planetary strength brings positive energy to that zone.</p>

                {result ? (
                  <div className="space-y-3">
                    {Object.entries(result.directions).map(([dir, data]) => (
                      <div key={dir} className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-base">{dir}</span>
                            <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold border border-rose-100">{data.element}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-semibold">Deity: {data.deity}</p>
                          <p className="text-xs text-slate-400 italic font-medium">{data.planet_details}</p>
                        </div>
                        <div className="flex items-center gap-4 self-end md:self-auto">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Lord</span>
                            <span className="font-extrabold text-rose-700 text-sm">{data.planet}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${data.planet_strength === "Excellent" || data.planet_strength === "Strong"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : data.planet_strength === "Average"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}>
                            {data.planet_strength}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 italic">Enter birth details to compute strength.</div>
                )}
              </div>
            )}

            {/* Tab: Remedies */}
            {activeTab === "remedies" && (
              <div className="bg-white border border-rose-150 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b border-rose-100 pb-3">Personalized Remedies & Tips</h3>

                {result ? (
                  <div className="space-y-3">
                    {Object.entries(result.directions).map(([dir, data]) => {
                      if (!data.remedies || data.remedies.length === 0) return null;

                      const hasIssues = !data.is_room_compatible || data.is_afflicted;
                      return (
                        <div key={dir} className={`border rounded-xl p-4 space-y-2 bg-white ${hasIssues ? "border-rose-200 bg-rose-50/20" : "border-slate-100"}`}>
                          <div className="flex justify-between items-center border-b border-rose-100/50 pb-1.5">
                            <h4 className="font-bold text-rose-800 text-sm">{dir} Zone</h4>
                            <span className="text-[10px] text-slate-400 italic">Lord: {data.planet}</span>
                          </div>
                          <ul className="space-y-1 list-disc pl-4 text-xs text-slate-600 font-medium">
                            {data.remedies.map((rem, idx) => (
                              <li key={idx}>{rem}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 italic">No remedies available yet. Configure room layout.</div>
                )}
              </div>
            )}

            {/* Intent Guide & Checklist */}
            <div className="bg-white border border-rose-150 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-rose-700 flex items-center gap-2 border-b border-rose-100 pb-3">
                <span>📋</span> {guidance.title}
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none">
                {guidance.tips.map((tip, idx) => {
                  const parts = tip.split(":");
                  return (
                    <li key={idx} className="bg-rose-50/10 border border-rose-100 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-slate-600 font-medium shadow-sm">
                      <span className="text-rose-500 font-bold text-base">✦</span>
                      <div>
                        {parts.length > 1 ? (
                          <>
                            <strong className="text-slate-800 block mb-1.5 text-sm">{parts[0]}</strong>
                            <span>{parts.slice(1).join(":")}</span>
                          </>
                        ) : (
                          <span>{tip}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

          </div>
        </div>

      </div>
      <VastuCompassCalibrator
        isOpen={calibratorOpen}
        onClose={() => setCalibratorOpen(false)}
        onCalibrate={(newLayout) => setLayout(newLayout)}
        propertyType={propertyType}
      />
    </div>
  );
}
