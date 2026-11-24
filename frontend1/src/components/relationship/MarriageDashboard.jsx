import React from 'react';
import CompatibilityMeter from './CompatibilityMeter';
import GunaMilanPanel from './GunaMilanPanel';
import EmotionalCompatibility from './EmotionalCompatibility';
import MarriageTimeline from './MarriageTimeline';
import KPActivationPanel from './KPActivationPanel';
import MuhuratSelector from './MuhuratSelector';
import SynastryOverlay from './SynastryOverlay';
import DivorceRiskPanel from './DivorceRiskPanel';
import ChildbirthPanel from './ChildbirthPanel';
import RelationshipHeatmap from './RelationshipHeatmap';
import AIInsightCard from './AIInsightCard';

const MarriageDashboard = ({ report, translations, t = (key, fallback) => fallback }) => {
  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-2xl font-serif italic text-black mb-6 border-b border-slate-700 pb-4">
        {t('modularRelationshipComponents', 'Modular Relationship Components')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-6">
        <CompatibilityMeter report={report} />
        <AIInsightCard report={report} />
        <DivorceRiskPanel report={report} />
        <GunaMilanPanel report={report} />
        <EmotionalCompatibility report={report} />
        <MarriageTimeline report={report} />
        <KPActivationPanel report={report} />
        <MuhuratSelector report={report} />
        <SynastryOverlay report={report} />
        <ChildbirthPanel report={report} />
        <RelationshipHeatmap report={report} />
      </div>
    </div>
  );
};

export default MarriageDashboard;
