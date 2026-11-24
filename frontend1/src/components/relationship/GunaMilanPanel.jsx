import React from 'react';

const GunaMilanPanel = ({ report }) => {
  const gunaData = report?.guna_milan || {};
  const totalScore = gunaData.total_score || 0;
  const interpretation = gunaData.interpretation || "Awaiting analysis";

  // Enterprise scaled score out of 100
  const ent = report?.enterprise_analysis || {};
  const scaledScore = ent.guna_milan?.score || 0;

  return (
    <div className="bg-slate-900 p-6 rounded-[2rem] border border-orange-500/20 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full -ml-16 -mt-16"></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <h4 className="text-[16px] font-black uppercase tracking-[0.3em] text-orange-600">Ashtakoota Score</h4>
        <div className="text-orange-400 font-serif italic text-sm">Guna Milan</div>
      </div>

      <div className="relative z-10 text-center mb-6">
        <div className="flex items-end justify-center space-x-2">
          <span className="text-[45px] font-serif italic text-white">{totalScore.toFixed(1)}</span>
          <span className="text-[14px] text-amber-600 pb-2 uppercase tracking-widest">/ 36</span>
        </div>
        <p className="text-[14px] text-orange-600/80 mt-2 font-medium tracking-wider">{interpretation}</p>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-1.5 relative z-10 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, scaledScore)}%` }}></div>
      </div>
    </div>
  );
};

export default GunaMilanPanel;
