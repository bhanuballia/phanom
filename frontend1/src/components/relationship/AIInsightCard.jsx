import React from 'react';

const AIInsightCard = ({ report }) => {
  const ent = report?.enterprise_analysis || {};
  const aiForecast = ent.ai_prediction || { prediction: "Awaiting Analysis", risk: "UNKNOWN" };

  const isLowRisk = aiForecast.risk === 'LOW';
  const isHighRisk = aiForecast.risk === 'HIGH';

  return (
    <div className="bg-indigo-900/80 p-6 rounded-[2rem] border border-indigo-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full -ml-24 -mb-24"></div>

      <div>
        <div className="flex justify-between items-start mb-6">
          <h4 className="text-[14px] font-black uppercase tracking-[0.3em] text-indigo-300">AI Forecasting</h4>
          <div className={`px-3 py-1 rounded-full text-[12px] font-black tracking-widest ${isLowRisk ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            isHighRisk ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
            {aiForecast.risk} RISK
          </div>
        </div>

        <p className="text-xl font-serif italic text-white leading-relaxed mb-4 relative z-10">
          "{aiForecast.prediction}"
        </p>
      </div>

      <div className="mt-4 flex items-center space-x-2 text-xs text-indigo-300/60 z-10">
        <span className="text-lg">🤖</span>
        <span>Neural Matchmaking Engine v2</span>
      </div>
    </div>
  );
};

export default AIInsightCard;
