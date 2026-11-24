import React from 'react';

const CompatibilityMeter = ({ report }) => {
  const ent = report?.enterprise_analysis || {};
  const score = ent.final_score ? Math.round(ent.final_score) : 0;

  // Calculate stroke dasharray for the SVG circle
  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "text-rose-500";
  if (score >= 80) colorClass = "text-emerald-400";
  else if (score >= 60) colorClass = "text-amber-400";

  return (
    <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-700/50 backdrop-blur-xl relative overflow-hidden flex flex-col items-center justify-center text-center">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>

      <h4 className="text-[14px] font-black uppercase tracking-[0.3em] text-white mb-6 z-10">Master Compatibility</h4>

      <div className="relative w-32 h-32 flex items-center justify-center z-10 mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-white" />
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-serif italic text-white">{score}</span>
          <span className="text-[12px] text-white uppercase tracking-widest">/ 100</span>
        </div>
      </div>

      <p className="text-[14px] text-white z-10">Aggregated from Astrological & AI analysis</p>
    </div>
  );
};

export default CompatibilityMeter;
