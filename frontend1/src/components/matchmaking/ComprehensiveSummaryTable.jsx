import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COMPREHENSIVE_TOPICS = [
    {
        category: "Navamsha (D9) Compatibility",
        items: ["D9 Lagna", "D9 7th House", "D9 7th Lord", "D9 Venus", "D9 Jupiter", "D9 Moon", "Marriage Strength", "Spouse Nature", "Marriage Longevity"]
    },
    {
        category: "Emotional Compatibility",
        items: ["Moon Compatibility", "Emotional Stability", "Emotional Expression", "Caring Nature", "Emotional Security", "Mood Synchronization", "Mutual Understanding"]
    },
    {
        category: "Psychological Compatibility",
        items: ["Personality", "Communication Style", "Temperament", "Ego Balance", "Patience", "Trust", "Conflict Resolution", "Decision Making"]
    },
    {
        category: "Romantic Compatibility",
        items: ["Venus Compatibility", "Love Style", "Romance", "Attraction", "Mutual Affection", "Emotional Bond", "Long-term Relationship Potential"]
    },
    {
        category: "Physical / Intimacy Compatibility",
        items: ["Mars Compatibility", "Sexual Compatibility", "Physical Attraction", "Passion", "Yoni Matching", "Intimacy Balance"]
    },
    {
        category: "Family Compatibility",
        items: ["2nd House", "4th House", "Family Happiness", "Domestic Harmony", "In-law Relations", "Family Culture", "Home Environment"]
    },
    {
        category: "Financial Compatibility",
        items: ["Wealth Yogas", "Income Stability", "Spending Habits", "Savings Potential", "Business Compatibility", "Property Gains", "Financial Growth After Marriage"]
    },
    {
        category: "Career Compatibility",
        items: ["Career Goals", "Work-Life Balance", "Professional Support", "Relocation Possibility", "Career Growth Together"]
    },
    {
        category: "Childbirth Analysis",
        items: ["5th House", "Putrakaraka", "Santana Yoga", "Saptamsha (D7)", "Fertility Indicators", "Childbirth Timing", "Parenting Compatibility"]
    },
    {
        category: "Health Compatibility",
        items: ["General Health", "Chronic Disease Indicators", "Genetic Concerns", "Mental Health", "Lifestyle Compatibility", "Longevity"]
    },
    {
        category: "Marriage Longevity",
        items: ["8th House", "8th Lord", "Marriage Stability", "Endurance", "Long-term Happiness", "Marital Strength"]
    },
    {
        category: "Divorce & Separation Analysis",
        items: ["Divorce Yogas", "Separation Yogas", "Litigation Risk", "Multiple Marriage Indications", "Emotional Breakdown", "Reconciliation Possibility"]
    },
    {
        category: "Dasha Compatibility",
        items: ["Mahadasha Synchronization", "Antardasha Synchronization", "Marriage-supportive Periods", "Challenging Periods", "Future Relationship Cycles"]
    },
    {
        category: "Transit Compatibility",
        items: ["Jupiter Transit", "Saturn Transit", "Rahu-Ketu Transit", "Marriage Activation", "Transit to 7th House", "Transit to Venus", "Transit to Jupiter"]
    },
    {
        category: "Jaimini Marriage Analysis",
        items: ["Darakaraka", "Atmakaraka", "Upapada Lagna", "UL Lord", "Karakamsha", "Chara Dasha", "Marriage Timing"]
    },
    {
        category: "KP Astrology Analysis",
        items: ["2nd Cusp", "7th Cusp", "11th Cusp", "KP Significators", "Sub-Lords", "Marriage Promise", "Exact Marriage Timing"]
    },
    {
        category: "Nadi Astrology",
        items: ["Nadi Dosha", "Nadi Cancellation", "Health Compatibility"]
    }
];

const getRealDataStatus = (category, item, report) => {
    // Read the evaluated JSON dictionary directly from the backend
    const matrix = report?.comprehensive_matrix || {};

    // Safety fallback
    const fallbackStatus = { status: "Average", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" };

    // Fetch the tuple from the dictionary
    const itemData = matrix[category]?.[item] || { bride: { status: "Average" }, groom: { status: "Average" } };

    const mapColor = (status) => {
        if (status === "Strong") return { color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" };
        if (status === "Weak") return { color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" };
        return { color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" };
    };

    return {
        bride: {
            status: itemData.bride.status,
            ...mapColor(itemData.bride.status)
        },
        groom: {
            status: itemData.groom.status,
            ...mapColor(itemData.groom.status)
        }
    };
};

const ComprehensiveSummaryTable = ({ report }) => {
    const [isExporting, setIsExporting] = useState(false);

    const exportToPDF = async () => {
        const tableElement = document.getElementById("comprehensive-summary-table");
        if (!tableElement) return;

        setIsExporting(true);
        try {
            // Give UI a moment to show loading state if needed
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(tableElement, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                backgroundColor: "#f5f5f5ff" // match rose-50 background
            });

            const imgData = canvas.toDataURL("image/png");

            // Calculate PDF dimensions based on A4 ratio
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // If the table is very long, it will be scaled down to fit on one long continuous page (or split if we prefer, but scaling is simpler for a snapshot)
            // To ensure it doesn't get unreadably tiny on A4, we'll let it span multiple pages if height exceeds A4 height

            const pageHeight = pdf.internal.pageSize.getHeight();
            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }

            pdf.save("Astrological-Matrix-Report.pdf");
        } catch (error) {
            console.error("PDF Export failed:", error);
            alert("Failed to export PDF. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <section className="bg-rose-50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-rose-200 relative overflow-hidden mt-12 mb-12" id="comprehensive-summary-table">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full"></div>

            <div className="text-center mb-10 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <div className="w-24"></div> {/* spacer for centering */}
                    <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-rose-600">Milan Darpan</h3>
                    <button
                        onClick={exportToPDF}
                        disabled={isExporting}
                        className="mt-4 md:mt-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                    >
                        {isExporting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Exporting...
                            </span>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Export to PDF
                            </>
                        )}
                    </button>
                </div>
                <h2 className="text-4xl font-serif italic text-rose-950">Sampoorna Vivah Samiksha</h2>
                <p className="text-rose-700/80 mt-3 max-w-2xl mx-auto text-base">A profound synthesis of 100+ astrological dimensions, integrating Navamsha (D9) depth, planetary Dashas, Gochar (Transits), and precision KP methodologies for marital harmony.</p>
            </div>

            <div className="relative z-10 space-y-8">
                {COMPREHENSIVE_TOPICS.map((group, idx) => (
                    <div key={idx} className="bg-white/60 border border-rose-200 rounded-2xl overflow-hidden backdrop-blur-md shadow-sm">
                        <div className="bg-white/60 px-6 py-4 border-b border-rose-200">
                            <h4 className="text-xl font-bold text-rose-900 tracking-wide">{group.category}</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-rose-200/50 text-rose-800 text-sm uppercase tracking-widest border-b border-rose-100">
                                        <th className="px-6 py-3 font-semibold w-1/2">Topic / Dimension</th>
                                        <th className="px-6 py-3 font-semibold text-center w-1/4">Bride Status</th>
                                        <th className="px-6 py-3 font-semibold text-center w-1/4">Groom Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.items.map((item, itemIdx) => {
                                        const data = getRealDataStatus(group.category, item, report);
                                        return (
                                            <tr key={itemIdx} className="border-b border-rose-100 hover:bg-rose-100/30 transition-colors">
                                                <td className="px-6 py-4 text-base text-slate-800">{item}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className={`inline-block px-4 py-1.5 rounded-lg text-sm font-bold border ${data.bride.bg} ${data.bride.color}`}>
                                                        {data.bride.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className={`inline-block px-4 py-1.5 rounded-lg text-sm font-bold border ${data.groom.bg} ${data.groom.color}`}>
                                                        {data.groom.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ComprehensiveSummaryTable;
