import React from 'react';

/**
 * CareerHeatmap Component
 * Visualizes professional momentum across 12 months with a premium glassmorphic UI.
 */
export default function CareerHeatmap({ data }) {
  if (!data) return null;

  return (
    <div className="career-heatmap-container p-6 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-emerald-400">⚡</span> Annual Professional Momentum
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data.map((m) => (
          <div
            key={m.month}
            className={`group relative p-4 rounded-xl border transition-all duration-300 hover:scale-105
              ${m.color === 'green' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                m.color === 'yellow' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 
                'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}
          >
            <div className="text-xs uppercase tracking-widest opacity-60 font-semibold mb-1">
              Month {m.month}
            </div>
            
            <div className="text-2xl font-black mb-2">
              {m.score}%
            </div>
            
            <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out
                  ${m.color === 'green' ? 'bg-emerald-500' : 
                    m.color === 'yellow' ? 'bg-amber-500' : 
                    'bg-rose-500'}`}
                style={{ width: `${m.score}%` }}
              />
            </div>

            {/* Tooltip hint */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-slate-800 text-[10px] px-2 py-1 rounded border border-slate-600 shadow-xl">
                {m.score >= 75 ? 'Peak Performance' : m.score >= 45 ? 'Steady Growth' : 'High Caution'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span>Activation Phase</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <span>Stability Phase</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <span>Restructuring Phase</span>
        </div>
      </div>
    </div>
  );
}
