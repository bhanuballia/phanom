import React from 'react';

const ChildbirthPanel = ({ report }) => {
  const ent = report?.enterprise_analysis || {};
  const children = ent.children || { score: 0, description: "Awaiting analysis", details: [] };

  const isExcellent = children.score >= 80;

  return (
    <div className="bg-slate-900 p-6 rounded-[2rem] border border-teal-500/20 backdrop-blur-md relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full -mr-16 -mb-16"></div>

      <div className="flex items-center space-x-3 mb-6 relative z-10">
        <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
          👶
        </div>
        <h4 className="text-[14px] font-black uppercase tracking-[0.3em] text-white">
          Progeny Prospects
        </h4>
      </div>

      <div className="relative z-10">
        <div className="flex items-end space-x-2 mb-2">
          <span className="text-3xl font-serif italic text-white">{children.score}</span>
          <span className="text-[14px] text-white pb-1 uppercase tracking-widest">/ 100 Score</span>
        </div>

        <p className={`text-[16px] mb-4 font-medium ${isExcellent ? 'text-teal-400' : 'text-amber-400'}`}>
          {children.description}
        </p>

        {children.details && children.details.length > 0 && (
          <ul className="space-y-2 mt-4 border-t border-teal-500/10 pt-4">
            {children.details.map((detail, idx) => (
              <li key={idx} className="text-[12px] text-white flex items-start">
                <span className="mr-2 text-white">•</span>
                {detail}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChildbirthPanel;
