import React from 'react';

const CinematicAstrologyBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Main gradient background with deeper space colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900"></div>
      
      {/* Nebula effect - subtle cosmic clouds */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Realistic starfield with varying sizes and brightness */}
      <div className="absolute inset-0">
        {/* Large bright stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`large-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              opacity: Math.random() * 0.8 + 0.2,
              boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.5)'
            }}
          />
        ))}
        
        {/* Medium stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`medium-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              opacity: Math.random() * 0.6 + 0.1
            }}
          />
        ))}
        
        {/* Small faint stars */}
        {[...Array(100)].map((_, i) => (
          <div
            key={`small-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 1.5 + 0.2}px`,
              height: `${Math.random() * 1.5 + 0.2}px`,
              opacity: Math.random() * 0.3 + 0.05
            }}
          />
        ))}
      </div>
      
      {/* Realistic celestial bodies with glow effects */}
      <div className="absolute inset-0">
        {/* Moon with realistic craters */}
        <div 
          className="absolute rounded-full bg-gradient-to-br from-gray-200 to-gray-400 shadow-lg"
          style={{
            top: '15%',
            right: '10%',
            width: '120px',
            height: '120px',
            boxShadow: '0 0 40px rgba(255, 255, 255, 0.3), inset -15px -15px 25px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Moon craters */}
          <div className="absolute top-1/4 left-1/3 w-4 h-4 rounded-full bg-gray-500/30"></div>
          <div className="absolute top-2/3 left-1/2 w-3 h-3 rounded-full bg-gray-500/30"></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-gray-500/30"></div>
        </div>
        
        {/* Sun with realistic glow */}
        <div 
          className="absolute rounded-full bg-gradient-to-br from-yellow-300 to-orange-500"
          style={{
            bottom: '20%',
            left: '15%',
            width: '90px',
            height: '90px',
            boxShadow: '0 0 60px 20px rgba(255, 165, 0, 0.4), 0 0 100px 40px rgba(255, 140, 0, 0.2)'
          }}
        />
        
        {/* Distant planet */}
        <div 
          className="absolute rounded-full bg-gradient-to-br from-red-700 to-red-900"
          style={{
            top: '40%',
            left: '20%',
            width: '40px',
            height: '40px',
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)'
          }}
        >
          {/* Planet surface details */}
          <div className="absolute top-1/4 left-1/4 w-2 h-6 rounded-full bg-red-800/50 rotate-45"></div>
          <div className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full bg-red-800/40"></div>
        </div>
      </div>
      
      {/* Realistic zodiac constellations with connecting lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        {/* Aries constellation */}
        <g transform="translate(100, 100)">
          <circle cx="0" cy="0" r="2" fill="white" />
          <circle cx="20" cy="5" r="2.5" fill="white" />
          <circle cx="40" cy="0" r="2" fill="white" />
          <circle cx="60" cy="-10" r="2" fill="white" />
          <line x1="0" y1="0" x2="20" y2="5" stroke="white" strokeWidth="0.5" />
          <line x1="20" y1="5" x2="40" y2="0" stroke="white" strokeWidth="0.5" />
          <line x1="40" y1="0" x2="60" y2="-10" stroke="white" strokeWidth="0.5" />
        </g>
        
        {/* Taurus constellation */}
        <g transform="translate(300, 200)">
          <circle cx="0" cy="0" r="2.5" fill="white" />
          <circle cx="20" cy="0" r="2" fill="white" />
          <circle cx="40" cy="5" r="2" fill="white" />
          <circle cx="35" cy="25" r="2.5" fill="white" />
          <circle cx="15" cy="25" r="2" fill="white" />
          <line x1="0" y1="0" x2="20" y2="0" stroke="white" strokeWidth="0.5" />
          <line x1="20" y1="0" x2="40" y2="5" stroke="white" strokeWidth="0.5" />
          <line x1="40" y1="5" x2="35" y2="25" stroke="white" strokeWidth="0.5" />
          <line x1="35" y1="25" x2="15" y2="25" stroke="white" strokeWidth="0.5" />
          <line x1="15" y1="25" x2="0" y2="0" stroke="white" strokeWidth="0.5" />
        </g>
        
        {/* Gemini constellation */}
        <g transform="translate(500, 100)">
          <circle cx="0" cy="0" r="2" fill="white" />
          <circle cx="0" cy="20" r="2.5" fill="white" />
          <circle cx="20" cy="0" r="2" fill="white" />
          <circle cx="20" cy="20" r="2.5" fill="white" />
          <line x1="0" y1="0" x2="0" y2="20" stroke="white" strokeWidth="0.5" />
          <line x1="20" y1="0" x2="20" y2="20" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="0" x2="20" y2="0" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="20" x2="20" y2="20" stroke="white" strokeWidth="0.5" />
        </g>
        
        {/* Leo constellation */}
        <g transform="translate(200, 300)">
          <circle cx="0" cy="0" r="2.5" fill="white" />
          <circle cx="15" cy="10" r="2" fill="white" />
          <circle cx="30" cy="5" r="2" fill="white" />
          <circle cx="40" cy="-5" r="2" fill="white" />
          <circle cx="25" cy="-15" r="2" fill="white" />
          <circle cx="10" cy="-10" r="2" fill="white" />
          <line x1="0" y1="0" x2="15" y2="10" stroke="white" strokeWidth="0.5" />
          <line x1="15" y1="10" x2="30" y2="5" stroke="white" strokeWidth="0.5" />
          <line x1="30" y1="5" x2="40" y2="-5" stroke="white" strokeWidth="0.5" />
          <line x1="40" y1="-5" x2="25" y2="-15" stroke="white" strokeWidth="0.5" />
          <line x1="25" y1="-15" x2="10" y2="-10" stroke="white" strokeWidth="0.5" />
          <line x1="10" y1="-10" x2="0" y2="0" stroke="white" strokeWidth="0.5" />
        </g>
      </svg>
      
      {/* Sacred geometry patterns with more detail */}
      <div className="absolute inset-0">
        {/* Enhanced Flower of Life pattern */}
        <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-10">
          <defs>
            <circle id="circle-large" r="40" stroke="white" strokeWidth="0.8" fill="none" />
          </defs>
          <use href="#circle-large" x="0" y="0" />
          <use href="#circle-large" x="80" y="0" />
          <use href="#circle-large" x="40" y="69" />
          <use href="#circle-large" x="-40" y="69" />
          <use href="#circle-large" x="-80" y="0" />
          <use href="#circle-large" x="-40" y="-69" />
          <use href="#circle-large" x="40" y="-69" />
        </svg>
      </div>
      
      {/* Spiritual symbols with better placement */}
      <div className="absolute inset-0">
        {/* Om symbol */}
        <div className="absolute top-1/4 left-1/4 text-5xl opacity-10 text-yellow-200">
          🕉
        </div>
        
        {/* Yantra symbol */}
        <div className="absolute bottom-1/4 right-1/4 text-4xl opacity-10 text-purple-200">
          ◎
        </div>
        
        {/* Additional spiritual symbols */}
        <div className="absolute top-1/3 right-1/3 text-3xl opacity-5 text-blue-200">
          ☸
        </div>
        
        <div className="absolute bottom-1/3 left-1/3 text-3xl opacity-5 text-pink-200">
          ✡
        </div>
      </div>
    </div>
  );
};

export default CinematicAstrologyBackground;