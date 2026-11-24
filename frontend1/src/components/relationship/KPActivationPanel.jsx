import React from 'react';

const KPActivationPanel = ({ report }) => {
  const ent = report?.enterprise_analysis || {};
  const kp = ent.kp_activation || { active_planets: [], is_active: false };
  const activePlanets = kp.active_planets;
  const isActive = kp.is_active;

  return (
    <div className="bg-slate-900 p-6 rounded-[2rem] border border-sky-500/20 backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>

      <div className="flex items-center space-x-3 mb-6 relative z-10">
        <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
          ✨
        </div>
        <h4 className="text-[16px] font-black uppercase tracking-[0.3em] text-sky-300">
          KP System Activation
        </h4>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[14px] text-white">Current DB Activation</span>
          <span className={`text-[12px] px-2 py-1 rounded-full font-bold ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-white'}`}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-[14px] uppercase tracking-widest text-white mb-2">Active Planets (Houses 2, 7, 11)</p>
          <div className="flex flex-wrap gap-2">
            {activePlanets.map((planet, idx) => (
              <div key={idx} className="bg-white/5 border border-sky-500/30 px-3 py-1.5 rounded-lg text-sm text-sky-100 flex items-center">
                <span className="w-2 h-2 rounded-full bg-sky-400 mr-2"></span>
                {planet}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPActivationPanel;
