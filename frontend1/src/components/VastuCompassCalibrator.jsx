// frontend/src/components/VastuCompassCalibrator.jsx
import React, { useState, useEffect, useRef } from "react";

export default function VastuCompassCalibrator({ isOpen, onClose, onCalibrate, propertyType }) {
  const [activeTab, setActiveTab] = useState("sunrise");
  const [isMobile, setIsMobile] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [heading, setHeading] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Check device type
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      // Detect mobile phones specifically, exclude tablets
      const isMobileUA = /Mobi|Android|iPhone|iPod/i.test(userAgent) && !/iPad|Tablet|PlayBook|Silicon/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileUA || isSmallScreen);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Handle mobile sensor orientation
  useEffect(() => {
    if (!isOpen || activeTab !== "compass" || !isMobile || !permissionGranted) return;

    const handleOrientation = (e) => {
      // webkitCompassHeading is available on iOS devices
      if (e.webkitCompassHeading !== undefined) {
        setHeading(Math.round(e.webkitCompassHeading));
      } else if (e.alpha !== undefined) {
        // e.alpha increases counter-clockwise on Android. Convert to compass degrees.
        let compassHeading = 360 - e.alpha;
        setHeading(Math.round(compassHeading % 360));
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, [isOpen, activeTab, isMobile, permissionGranted]);

  // Handle camera activation
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
      alert("Could not access camera. Compass will run without live video.");
      setCameraActive(false);
      setPermissionGranted(true); // Allow compass without video
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== "compass") {
      stopCamera();
    }
  };

  // Convert degree heading to cardinal direction string
  const getDirectionString = (deg) => {
    const directions = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  const handleLockAlignment = () => {
    const entranceDir = getDirectionString(heading);
    
    // Auto-map rooms based on locked entrance direction
    let newLayout = {};
    if (propertyType === "commercial") {
      newLayout = {
        Northwest: "Store Room/Inventory",
        North: "Main Entrance",
        Northeast: "Reception",
        West: "Employee Workstations",
        Center: "Lobby",
        East: "Employee Workstations",
        Southwest: "Owner's Cabin/Desk",
        South: "Conference Room",
        Southeast: "Cash Counter"
      };
      // Relocate the Main Entrance room dynamically based on the locked direction
      const keys = ["Northwest", "North", "Northeast", "West", "East", "Southwest", "South", "Southeast"];
      keys.forEach(k => {
        if (k === entranceDir) {
          newLayout[k] = "Main Entrance";
        } else if (newLayout[k] === "Main Entrance") {
          newLayout[k] = "None"; // Clear old entrance placement
        }
      });
    } else {
      newLayout = {
        Northwest: "Guest Bedroom",
        North: "Locker/Vault",
        Northeast: "Pooja Room",
        West: "Dining Room",
        Center: "None",
        East: "Entrance",
        Southwest: "Master Bedroom",
        South: "Store Room",
        Southeast: "Kitchen"
      };
      const keys = ["Northwest", "North", "Northeast", "West", "East", "Southwest", "South", "Southeast"];
      keys.forEach(k => {
        if (k === entranceDir) {
          newLayout[k] = "Entrance";
        } else if (newLayout[k] === "Entrance") {
          newLayout[k] = "None";
        }
      });
    }

    onCalibrate(newLayout);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={() => { stopCamera(); onClose(); }}
          className="absolute top-4 right-4 z-50 bg-slate-850 hover:bg-slate-800 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition shadow"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-amber-400">🧭 Vastu Direction Calibrator</h2>
          <p className="text-xs text-slate-400 mt-1">Determine the compass alignment of your property.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-950 p-1 border-b border-slate-800">
          <button
            onClick={() => handleTabChange("sunrise")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "sunrise" ? "bg-slate-800 text-amber-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            ☀️ Sunrise Method (All Devices)
          </button>
          <button
            onClick={() => handleTabChange("compass")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "compass" ? "bg-slate-800 text-amber-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            📱 Live Phone Compass (Mobile Only)
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {activeTab === "sunrise" && (
            <div className="space-y-4 text-center">
              {/* Graphic Representation */}
              <div className="w-48 h-48 mx-auto bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center relative shadow-inner">
                <div className="absolute top-2 text-[10px] font-bold text-blue-400">NORTH</div>
                <div className="absolute bottom-2 text-[10px] font-bold text-orange-400">SOUTH</div>
                <div className="absolute right-2 text-[10px] font-bold text-amber-400">EAST (🌅 SUNRISE)</div>
                <div className="absolute left-2 text-[10px] font-bold text-indigo-400">WEST</div>
                <div className="text-4xl animate-pulse">🚶‍♂️</div>
              </div>

              <div className="text-left bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs text-slate-300">
                <p className="font-bold text-amber-400 text-sm mb-1">Step-by-Step Directions:</p>
                <p>1. Stand in the absolute <strong>center of your home</strong> in the morning.</p>
                <p>2. Face toward the direction where the <strong>Sun rises (East)</strong>.</p>
                <p>3. While facing East:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your <strong>left hand</strong> points directly to the <strong>North</strong>.</li>
                  <li>Your <strong>right hand</strong> points directly to the <strong>South</strong>.</li>
                  <li>Behind you is <strong>West</strong>.</li>
                  <li>The corner in front of you on your left is <strong>North-East</strong>.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "compass" && (
            <div className="space-y-4 text-center h-full flex flex-col justify-center">
              {!isMobile ? (
                <div className="py-12 px-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <span className="text-4xl block">💻</span>
                  <h4 className="font-bold text-slate-200">Mobile Smartphone Required</h4>
                  <p className="text-xs text-slate-400">
                    Live sensor-based compass calibration is only supported on mobile smartphones. Please use the Sunrise method tab or open this link on your phone.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 flex flex-col items-center">
                  {!permissionGranted ? (
                    <div className="py-8 space-y-3">
                      <p className="text-xs text-slate-300">
                        The app needs permission to access your smartphone's camera and compass/magnetometer sensors.
                      </p>
                      <button
                        onClick={startCamera}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold transition shadow"
                      >
                        Enable Camera & Sensors
                      </button>
                    </div>
                  ) : (
                    <div className="w-full space-y-4">
                      {/* Live Camera View + Compass Ring Overlay */}
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center">
                        
                        {cameraActive ? (
                          <video 
                            ref={videoRef}
                            autoPlay 
                            playsInline 
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                          />
                        ) : (
                          <div className="absolute text-slate-500 text-xs">Camera offline (Compass Active)</div>
                        )}

                        {/* Compass Outer Ring Overlay */}
                        <div 
                          className="absolute w-56 h-56 rounded-full border-4 border-dashed border-amber-400/70 transition-transform duration-100 flex items-center justify-center"
                          style={{ transform: `rotate(${-heading}deg)` }}
                        >
                          <div className="absolute top-1 text-xs font-black text-amber-400">N</div>
                          <div className="absolute right-1 text-xs font-black text-amber-400">E</div>
                          <div className="absolute bottom-1 text-xs font-black text-amber-400">S</div>
                          <div className="absolute left-1 text-xs font-black text-amber-400">W</div>
                        </div>

                        {/* Fixed Target Arrow (Pointing straight up to denote Phone pointing direction) */}
                        <div className="absolute z-10 flex flex-col items-center pointer-events-none">
                          <span className="text-2xl text-red-500 animate-bounce">↓</span>
                          <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Entrance
                          </span>
                        </div>
                      </div>

                      {/* Display Heading Details */}
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
                        <span className="text-slate-400 text-xs block">CURRENT HEADING DIRECTION</span>
                        <span className="text-2xl font-bold text-amber-400 block mt-1">
                          {heading}° {getDirectionString(heading)}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Stand at the center of the house, point your phone at the main entrance, and click lock.
                        </p>
                      </div>

                      <button
                        onClick={handleLockAlignment}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-3 rounded-xl font-bold transition shadow"
                      >
                        Lock Heading & Auto-Map Rooms
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
