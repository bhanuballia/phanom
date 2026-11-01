import React from 'react';

/**
 * WealthActivation Component
 * Displays financial growth potential in the professional chart with a premium metallic UI.
 */
export default function WealthActivation({ score }) {
  return (
    <div className="wealth-activation-card relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl border border-amber-500/20 shadow-2xl group">
      <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl font-black text-amber-500 pointer-events-none group-hover:scale-110 transition-transform duration-700">💰</div>
      
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-white mb-1">Wealth Activation</h3>
        <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] mb-6">Professional Gains Engine</p>

        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-slate-700"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={226}
                strokeDashoffset={226 - (226 * score) / 100}
                className="text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-xl font-black text-white">{score}%</span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${score > 70 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Dhan Yoga Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${score > 40 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Investment Gain Window</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${score > 20 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Asset Liquidity</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="text-[9px] text-slate-500 leading-tight">
            Wealth activation is computed through 2nd House strength and Jupiter/Venus D10 transits. Higher scores indicate peak periods for professional monetization.
          </div>
        </div>
      </div>
    </div>
  );
}
