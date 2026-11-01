import React from 'react';

/**
 * PromotionMeter Component
 * Displays the probability of professional advancement with a premium gauge UI.
 */
export default function PromotionMeter({ probability }) {
  const percentage = probability || 0;
  const rotation = (percentage / 100) * 180 - 90;

  return (
    <div className="promotion-meter bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-indigo-500/20 shadow-2xl overflow-hidden relative group">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all duration-700" />
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Promotion Probability</h3>
          <p className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">AI Success Prediction</p>
        </div>
        <div className="bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
          <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">D10 Dashamsha</span>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center pt-4">
        {/* Semi-circular Gauge */}
        <div className="relative w-48 h-24 overflow-hidden">
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-800" />
          <div 
            className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-transparent border-t-indigo-500 border-r-indigo-500 transition-all duration-1000 ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
          <div className="absolute inset-0 flex items-end justify-center pb-2">
             <span className="text-4xl font-black text-white tracking-tighter">{percentage}%</span>
          </div>
        </div>

        <div className="mt-6 w-full flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4">
          <span>Static</span>
          <span className="text-indigo-400">High Growth</span>
        </div>
      </div>

      <div className="mt-6 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[11px] text-indigo-200/70 italic text-center leading-relaxed">
        Current planetary alignments suggest a {percentage > 70 ? 'high probability of leadership expansion.' : percentage > 40 ? 'window for career movement and shifts.' : 'period of foundational stability.'}
      </div>
    </div>
  );
}
