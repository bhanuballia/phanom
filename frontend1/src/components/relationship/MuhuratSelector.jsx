import React from 'react';

const MuhuratSelector = ({ report }) => {
  return (
    <div className="bg-yellow-900/50 p-6 rounded-[2rem] border border-yellow-500/20 backdrop-blur-md relative overflow-hidden flex flex-col justify-center">
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full -ml-16 -mb-16"></div>

      <div className="flex items-center space-x-3 mb-6 relative z-10">
        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
          📅
        </div>
        <h4 className="text-[14px] font-black uppercase tracking-[0.3em] text-yellow-300">
          Wedding Date AI
        </h4>
      </div>

      <div className="relative z-10 text-center bg-black/20 rounded-xl p-4 border border-white/5">
        <p className="text-[16px] text-white mb-2 uppercase tracking-widest">Selected Muhurta Score</p>
        <div className="text-3xl font-serif italic text-white mb-1">
          {report?.enterprise_analysis?.muhurta?.score || 85}
          <span className="text-lg text-white not-italic">/100</span>
        </div>
        <p className="text-[14px] text-yellow-400">Excellent Tara Bala & Chandrabala</p>
      </div>

      <button
        onClick={() => {
          const date = report?.enterprise_analysis?.muhurta?.best_date || "Calculating optimal cosmic window...";
          alert(`Date AI Engine Output:\nOptimal Wedding Date: ${date}`);
        }}
        className="mt-4 w-full py-2 bg-rose-200 hover:bg-yellow-500/20 transition border border-yellow-500/30 rounded-lg text-xs font-bold uppercase tracking-widest text-black">
        Launch Date AI
      </button>
    </div>
  );
};

export default MuhuratSelector;
