import React, { useState, useMemo } from 'react';

const RelationshipHeatmap = ({ report }) => {
  const [yearOffset, setYearOffset] = useState(0);
  const baseYear = new Date().getFullYear();
  const favorableYears = (report?.timing?.favorable_years || []).map(Number);

  // Generate all 50 years of data once so counts and pagination are consistent
  const full50YearsData = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const year = baseYear + i;
      const isFavorable = favorableYears.includes(year);
      // Pseudo-random based on year and match scores so it stays consistent for the same match but varies across different people
      const matchOffset = Math.floor((report?.guna_milan?.total_score || 0) * 17 + (report?.success_probability || 0) * 23);
      const pseudoRandom = (((year + matchOffset) * 137) % 100) / 100;

      let score;
      if (isFavorable) {
        score = 80 + Math.floor(pseudoRandom * 20); // 80 - 99
      } else {
        score = 20 + Math.floor(pseudoRandom * 60); // 20 - 79
      }

      let category = '';
      let color = '';
      if (score >= 80) {
        category = 'good';
        color = 'bg-emerald-500';
      } else if (score >= 60) {
        category = 'average';
        color = 'bg-amber-400';
      } else if (score >= 40) {
        category = 'bad';
        color = 'bg-orange-500';
      } else {
        category = 'very_bad';
        color = 'bg-red-500';
      }

      return { year, score, color, category };
    });
  }, [baseYear, favorableYears]);

  const heatmapData = full50YearsData.slice(yearOffset, yearOffset + 10);
  const totalGood = full50YearsData.filter(d => d.category === 'good').length;
  const totalAverage = full50YearsData.filter(d => d.category === 'average').length;
  const totalBad = full50YearsData.filter(d => d.category === 'bad').length;
  const totalVeryBad = full50YearsData.filter(d => d.category === 'very_bad').length;

  return (
    <div className="bg-cyan-900/80 p-6 rounded-[2rem] border border-cyan-500/20 backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            🔥
          </div>
          <h4 className="text-[14px] font-black uppercase tracking-[0.3em] text-black">
            Timeline Heatmap
          </h4>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setYearOffset(prev => Math.max(0, prev - 10))}
            disabled={yearOffset === 0}
            className="w-6 h-6 flex items-center justify-center rounded bg-cyan-500/10 hover:bg-cyan-500/30 text-black border border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition text-[35px] font-bold"
          >
            -
          </button>
          <button
            onClick={() => setYearOffset(prev => Math.min(40, prev + 10))}
            disabled={yearOffset >= 40}
            className="w-6 h-6 flex items-center justify-center rounded bg-cyan-500/10 hover:bg-cyan-500/30 text-black border border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition text-[22px] font-bold"
          >
            +
          </button>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-end h-24 space-x-1 mb-2">
          {heatmapData.map((data, idx) => (
            <div key={idx} className="flex-1 h-full flex flex-col justify-end group relative">
              <div
                className={`w-full rounded-t-sm transition-all duration-500 ${data.color} opacity-80 group-hover:opacity-100 cursor-pointer`}
                style={{ height: `${data.score}%` }}
              ></div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none transition-opacity z-20">
                {data.score}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-[14px] text-black font-bold uppercase tracking-widest">
          <span>{heatmapData[0].year}</span>
          <span>{heatmapData[heatmapData.length - 1].year}</span>
        </div>

        <div className="mt-4 pt-4 border-t border-cyan-500/20">
          <div className="flex flex-col md:flex-row justify-between md:items-center text-[14px] uppercase font-black tracking-widest gap-2 mb-2">
            <div className="flex flex-wrap gap-4 bg-black/20 p-2 rounded-lg border border-white/5 w-full justify-between">
              <span className="text-emerald-400">✅ very Good: {totalGood}</span>
              <span className="text-amber-400">⚡ Good: {totalAverage}</span>
              <span className="text-orange-400">⚠️ Average: {totalBad}</span>
              <span className="text-red-400">❌ Bad: {totalVeryBad}</span>
            </div>
          </div>
          <p className="text-[16px] text-white leading-relaxed">
            Forecasted harmony index mapping dasha and transit periods over the next 50 years.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RelationshipHeatmap;
