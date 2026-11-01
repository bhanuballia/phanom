import React from 'react';

/**
 * CareerAlerts Component
 * Displays professional "Transits & Triggers" using a high-visibility alert UI.
 */
export default function CareerAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="career-alerts bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-rose-500/20 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="animate-pulse text-rose-500">🔔</span> Professional Triggers
        </h3>
        <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 uppercase tracking-widest">Live Activation</span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <div 
            key={idx}
            className={`p-4 rounded-2xl border flex items-start gap-4 transition-all hover:translate-x-1
              ${alert.type === 'activation' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100' : 
                alert.type === 'warning' ? 'bg-rose-500/10 border-rose-500/30 text-rose-100' : 
                'bg-amber-500/10 border-amber-500/30 text-amber-100'}`}
          >
            <div className="text-xl pt-0.5">
              {alert.type === 'activation' ? '🚀' : alert.type === 'warning' ? '⚠️' : '⚡'}
            </div>
            <div className="flex-1">
              <div className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">
                {alert.title}
              </div>
              <div className="text-[11px] leading-relaxed opacity-70">
                {alert.message}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
