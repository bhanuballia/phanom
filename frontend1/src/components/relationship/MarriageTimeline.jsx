import React from 'react';

const MarriageTimeline = ({ report }) => {
  const ent = report?.enterprise_analysis || {};
  const timing = ent.marriage_timing || { favorable_years: [] };
  const years = timing.favorable_years || [];

  return (
    <div className="bg-purple-900/80 p-6 rounded-[2rem] border border-purple-500/20 backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>

      <div className="flex items-center space-x-3 mb-6 relative z-10">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
          ⏳
        </div>
        <h4 className="text-[14px] font-black uppercase tracking-[0.3em] text-purple-300">
          Marriage Timeline
        </h4>
      </div>

      <div className="relative z-10">
        {years.length > 0 ? (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:to-transparent">
            {years.map((year, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-purple-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 rounded-xl bg-white/5 border border-purple-500/10 shadow-sm">
                  <div className="font-bold text-white text-lg">{year}</div>
                  <div className="text-[12px] text-black font-bold uppercase tracking-widest mt-1">High Probability Window</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No strong favorable windows detected currently. Check Dasha alignment.</p>
        )}
      </div>
    </div>
  );
};

export default MarriageTimeline;
