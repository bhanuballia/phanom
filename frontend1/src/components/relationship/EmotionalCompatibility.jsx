import React from 'react';

const EmotionalCompatibility = ({ report }) => {
  const ent = report?.enterprise_analysis || {};
  const emotional = ent.emotional || { score: 0, details: "Awaiting analysis" };
  const intimacy = ent.intimacy || { score: 0, description: "Awaiting analysis" };

  return (
    <div className="bg-slate-900 p-6 rounded-[2rem] border border-pink-500/20 backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>

      <h4 className="text-[14px] font-black uppercase tracking-[0.3em] text-pink-300 mb-6 relative z-10">
        Emotional & Intimacy Profile
      </h4>

      <div className="space-y-6 relative z-10">
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[12px] uppercase tracking-widest text-white">Emotional Bonding</span>
            <span className="text-[12px] font-bold text-white">{emotional.score}/100</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1">
            <div className="bg-pink-400 h-1 rounded-full" style={{ width: `${Math.min(100, emotional.score)}%` }}></div>
          </div>
          <p className="text-[14px] text-white mt-2 italic">{emotional.details}</p>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[12px] uppercase tracking-widest text-white">Physical Intimacy</span>
            <span className="text-[12px] font-bold text-white">{intimacy.score}/100</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1">
            <div className="bg-rose-400 h-1 rounded-full" style={{ width: `${Math.min(100, intimacy.score)}%` }}></div>
          </div>
          <p className="text-[14px] text-white mt-2 italic">{intimacy.description}</p>
        </div>
      </div>
    </div>
  );
};

export default EmotionalCompatibility;
