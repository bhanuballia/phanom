import React from 'react';

const SynastryOverlay = ({ report }) => {
  const ent = report?.enterprise_analysis || {};
  const synastry = ent.synastry || { score: 0, details: [] };

  return (
    <div className="bg-fuchsia-900/80 p-6 rounded-[2rem] border border-fuchsia-500/20 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>

      <div className="flex items-center space-x-3 mb-6 relative z-10">
        <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
          ⚛️
        </div>
        <h4 className="text-[14px] font-black uppercase tracking-[0.3em] text-fuchsia-300">
          Synastry Engine
        </h4>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
        <div className="flex items-end justify-center mb-4">
          <div className="text-4xl font-serif italic text-white font-bold">{synastry.score}</div>
          <div className="text-[14px] text-white mb-1 ml-1 uppercase tracking-widest">/100</div>
        </div>

        {synastry.details && synastry.details.length > 0 ? (
          <ul className="w-full space-y-2 mt-2">
            {synastry.details.map((detail, idx) => (
              <li key={idx} className="text-[10px] text-fuchsia-300 bg-fuchsia-500/10 px-3 py-1.5 rounded-lg border border-fuchsia-500/20 text-center leading-tight">
                {detail}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-white text-center px-4">
            No major tight orb synastry aspects detected.
          </p>
        )}
      </div>

      <button
        onClick={() => {
          const details = synastry.details?.join('\n') || "No major tight orb synastry aspects detected.";
          alert(`Synastry Composite Matrix:\n\nScore: ${synastry.score}/100\n\n${details}`);
        }}
        className="mt-4 w-full py-2 bg-rose-200 hover:bg-fuchsia-500/20 transition border border-fuchsia-500/30 rounded-lg text-xs font-bold uppercase tracking-widest text-black">
        View Composite Matrix
      </button>
    </div>
  );
};

export default SynastryOverlay;
