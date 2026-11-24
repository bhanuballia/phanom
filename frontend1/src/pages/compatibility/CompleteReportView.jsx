import React from 'react';
import { ArrowLeft, Printer, Heart, Star, Moon, Sun, Flame, Users, Calendar, Sparkles } from 'lucide-react';

const CompleteReportView = ({ data, onBack }) => {
    const handlePrint = () => {
        window.print();
    };

    const { inputs, overallScore, numerology, astrology } = data;
    const p1 = inputs.person1;
    const p2 = inputs.person2;

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in-up">
            {/* Non-printable Controls */}
            <div className="flex justify-between items-center mb-8 print:hidden">
                <button onClick={onBack} className="p-2 bg-amber-400 hover:bg-slate-800 rounded-full transition-colors text-slate-900 hover:text-white flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" /> <span>Back to Form</span>
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-white text-slate-900 font-bold py-2 px-6 rounded-full hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg"
                >
                    <Printer className="w-5 h-5" /> Download / Print PDF
                </button>
            </div>

            {/* Printable Report Container */}
            <div className="bg-white text-slate-900 p-8 md:p-12 rounded-3xl shadow-2xl print:shadow-none print:p-0 print:bg-white print:text-black font-sans relative overflow-hidden">

                {/* Header */}
                <div className="text-center mb-12 relative z-10 border-b-2 border-slate-100 pb-8">
                    <h1 className="text-5xl font-black text-slate-900 mb-4 font-serif tracking-tight">The Stars Align</h1>
                    <h2 className="text-2xl text-slate-900 font-light">A Comprehensive Compatibility Analysis</h2>

                    <div className="flex justify-center items-center gap-10 mt-10">
                        <div className="text-right">
                            <h3 className="text-3xl font-bold text-indigo-900">{p1.name}</h3>
                            <p className="text-slate-900">{p1.dob}</p>
                        </div>
                        <div className="text-6xl text-rose-500"><Heart className="w-16 h-16 fill-current" /></div>
                        <div className="text-left">
                            <h3 className="text-3xl font-bold text-indigo-900">{p2.name}</h3>
                            <p className="text-slate-900">{p2.dob}</p>
                        </div>
                    </div>
                </div>

                {/* Overall Score */}
                <div className="flex justify-center mb-16 relative z-10">
                    <div className={`rounded-3xl p-8 border-4 text-center max-w-sm w-full shadow-xl ${getScoreColor(overallScore).replace('text-', 'border-').replace('500', '200')} bg-white`}>
                        <p className="text-slate-500 font-bold uppercase tracking-widest mb-2">Overall Match</p>
                        <div className={`text-7xl font-black ${getScoreColor(overallScore)}`}>
                            {overallScore}%
                        </div>
                        <div className="mt-4 flex gap-1 justify-center">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-6 h-6 ${i < Math.round(overallScore / 20) ? getScoreColor(overallScore) + ' fill-current' : 'text-slate-200'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                    {/* Left Column: Numerology */}
                    <div className="space-y-8">
                        <h3 className="text-2xl font-black border-b-2 border-indigo-100 pb-2 text-indigo-900 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-black" /> Numerology Analysis
                        </h3>

                        <ReportSection
                            title="Destiny (Name) Match"
                            score={numerology.nameCompatibility.score}
                            text={numerology.nameCompatibility.message}
                            textColor="text-amber-900 bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 font-medium text-[17px]"
                        />
                        <ReportSection
                            title="Life Path Match"
                            score={numerology.birthDateCompatibility.score}
                            text={numerology.birthDateCompatibility.message}
                            textColor="text-green-900 bg-green-50/70 p-3 rounded-xl border border-green-200/80 font-medium text-[17px]"
                        />
                        <ReportSection
                            title="Friendship Foundation"
                            score={numerology.friendship.score}
                            text={numerology.friendship.message}
                            textColor="text-amber-900 bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 font-medium text-[17px]"
                        />

                        {/* Relationship Path Special Box */}
                        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                            <h4 className="font-bold text-indigo-900 mb-2 flex justify-between items-center">
                                Relationship Destiny <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center">{numerology.relationshipPath.relationshipNumber}</span>
                            </h4>
                            <p className="text-[16px] text-indigo-800 italic mb-2">"{numerology.relationshipPath.title}"</p>
                            <p className="text-[16px] text-black">{numerology.relationshipPath.message}</p>
                        </div>

                        {/* Master Number Note */}
                        {numerology.masterNumber.hasMasterNumber && (
                            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                                <h4 className="font-bold text-amber-900 mb-2">Spiritual Soul Contract</h4>
                                <p className="text-[16px] text-amber-800 font-medium mb-1">{numerology.masterNumber.message}</p>
                                <p className="text-[16px] text-black">{numerology.masterNumber.details}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Astrology */}
                    <div className="space-y-8">
                        <h3 className="text-2xl font-black border-b-2 border-rose-100 pb-2 text-rose-900 flex items-center gap-2">
                            <Moon className="w-6 h-6 text-rose-500" /> Astrological Analysis
                        </h3>

                        <ReportSection
                            title="Sun Sign (Ego & Persona)"
                            score={astrology.sunSign.score}
                            text={astrology.sunSign.message}
                            textColor="text-green-900 bg-green-50/70 p-3 rounded-xl border border-green-200/80 font-medium text-[17px]"
                        />
                        <ReportSection
                            title="Moon Sign (Emotions)"
                            score={astrology.moonSign.score}
                            text={astrology.moonSign.message}
                            textColor="text-green-900 bg-green-50/70 p-3 rounded-xl border border-green-200/80 font-medium text-[17px]"
                        />
                        <ReportSection
                            title="Venus/Mars (Passion)"
                            score={astrology.passion.score}
                            text={astrology.passion.message}
                            textColor="text-green-900 bg-green-50/70 p-3 rounded-xl border border-green-200/80 font-medium text-[17px]"
                        />

                        {/* Inputs Reference */}
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mt-12 print:break-inside-avoid">
                            <h4 className="font-bold text-slate-900 mb-4 text-center">Astrological Profile Data</h4>
                            <div className="grid grid-cols-2 gap-4 text-[16px]">
                                <div>
                                    <p className="font-bold text-indigo-900 mb-2">{p1.name}</p>
                                    <p><strong>Sun:</strong> {p1.sun}</p>
                                    <p><strong>Moon:</strong> {p1.moon}</p>
                                    <p><strong>Venus:</strong> {p1.venus}</p>
                                    <p><strong>Mars:</strong> {p1.mars}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-rose-900 mb-2">{p2.name}</p>
                                    <p><strong>Sun:</strong> {p2.sun}</p>
                                    <p><strong>Moon:</strong> {p2.moon}</p>
                                    <p><strong>Venus:</strong> {p2.venus}</p>
                                    <p><strong>Mars:</strong> {p2.mars}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Styles */}
                <style dangerouslySetInnerHTML={{
                    __html: `
          @media print {
            body { background: white; }
            .animate-fade-in-up { animation: none !important; opacity: 1 !important; transform: none !important; }
            @page { margin: 2cm; size: A4; }
          }
        `}} />
            </div>
        </div>
    );
};

const ReportSection = ({ title, score, text, textColor = "text-slate-600" }) => {
    const getScoreColor = (s) => {
        if (s >= 80) return 'text-green-600 bg-green-100 border-green-200';
        if (s >= 60) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
        return 'text-red-600 bg-red-100 border-red-200';
    };

    return (
        <div className="print:break-inside-avoid mb-6">
            <div className="flex justify-between items-end mb-2">
                <h4 className="font-bold text-slate-800 text-lg">{title}</h4>
                <div className={`px-3 py-1 rounded-full border font-bold text-sm ${getScoreColor(score)}`}>
                    {score}%
                </div>
            </div>
            <p className={`leading-relaxed text-sm ${textColor}`}>{text}</p>
        </div>
    );
};

export default CompleteReportView;
