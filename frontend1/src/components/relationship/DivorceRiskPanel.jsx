import React from 'react';

const DivorceRiskPanel = ({ report }) => {
  const ent = report?.enterprise_analysis || {};
  const divorceRisk = ent.divorce_risk || { risk_score: 0, risk_level: "UNKNOWN" };
  const score = divorceRisk.risk_score;
  const isHighRisk = divorceRisk.risk_level === "HIGH";

  return (
    <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-700/50 backdrop-blur-xl relative overflow-hidden flex flex-col justify-center">

      <h4 className="text-[16px] font-black uppercase tracking-[0.3em] text-white mb-6">Separation Probability</h4>

      <div className="flex items-end justify-between mb-2">
        <div className="text-[20px] font-serif italic font-bold text-white">
          {score}<span className="text-[16px] text-amber-600 not-italic">%</span>
        </div>
        <div className={`text-[14px] font-black tracking-widest ${isHighRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
          {divorceRisk.risk_level}
        </div>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-2 mb-6 overflow-hidden">
        <div
          className={`h-2 rounded-full ${isHighRisk ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
          style={{ width: `${Math.min(100, score)}%` }}
        ></div>
      </div>

      <p className="text-[16px] text-amber-600 leading-relaxed">
        Based on 7th house afflictions, malefic influences, and D9 Navamsha stability metrics.
      </p>
    </div>
  );
};

export default DivorceRiskPanel;
