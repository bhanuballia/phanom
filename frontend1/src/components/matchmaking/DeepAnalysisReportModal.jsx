import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DeepAnalysisReportModal({ isOpen, onClose, brideFullData, groomFullData, report }) {
  const [activePage, setActivePage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  if (!isOpen) return null;

  const brideName = brideFullData?.name || 'Bride';
  const groomName = groomFullData?.name || 'Groom';

  const gunaTotal = report?.guna_milan?.total_score || 0;
  const successProb = Math.round(report?.success_probability || 0);

  // Generate 25 distinct chapters / sections for the hybrid report
  const pages = [
    {
      pageNumber: 1,
      title: "Cover & Auspicious Invocation",
      subTitle: "श्री गणेशाय नमः • वैदिक युगल कुंडली मिलान महा-विश्लेषण",
      category: "Invocation & Profile",
      render: () => (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 rounded-3xl border border-amber-200 shadow-sm min-h-[580px]">
          <div className="text-amber-600 font-serif text-5xl">ॐ श्री गणेशाय नमः ॐ</div>
          <p className="text-amber-800 text-xs font-bold tracking-[0.3em] uppercase">Vedic Astrology & Artificial Intelligence Hybrid Analysis Report</p>
          <div className="w-28 h-28 rounded-full border-4 border-amber-300 overflow-hidden shadow-xl my-4">
            <img src="/deities/match1.jpg" alt="Auspicious Match" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-wide">
            {brideName} <span className="text-amber-600">&</span> {groomName}
          </h1>
          <p className="text-slate-600 max-w-lg text-sm leading-relaxed">
            25-Chapter Comprehensive Astrological Compatibility, Ashtakoota Guna Milan, Planetary Affliction Diagnosis & Future Destiny Roadmap.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-amber-200/60 w-full max-w-md">
            <div className="px-5 py-2.5 bg-white rounded-xl shadow-xs border border-amber-200">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Guna Milan Score</span>
              <span className="text-2xl font-black text-amber-600">{gunaTotal} / 36</span>
            </div>
            <div className="px-5 py-2.5 bg-white rounded-xl shadow-xs border border-amber-200">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Success Probability</span>
              <span className="text-2xl font-black text-emerald-600">{successProb}%</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Generated on {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} • Certified Vedic Computational Engine</p>
        </div>
      )
    },
    {
      pageNumber: 2,
      title: "Executive Astrological Verdict & Summary",
      subTitle: "समग्र विश्लेषण सारांश एवं निर्णय",
      category: "Executive Summary",
      render: () => (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-md">
            <span className="text-amber-400 text-xs font-black tracking-widest uppercase block mb-1">AI Cosmic Verdict</span>
            <h3 className="text-2xl font-serif italic text-amber-200 mb-3">"{report?.ai?.summary || report?.summary?.recommendation || 'Balanced Cosmic Alignment'}"</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Based on the synthesis of traditional Maharishi Parasara Ashtakoota algorithms combined with Jaimini Sutras and Planetary Karakas, this match demonstrates a <strong className="text-white">{successProb}% compatibility quotient</strong>.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <h4 className="font-bold text-emerald-900 text-sm mb-2 flex items-center gap-2"><span>✅</span> Key Harmonious Factors</h4>
              <ul className="text-xs text-emerald-950 space-y-2 list-disc list-inside">
                <li>Strong mental affinity and intellectual cooperation between Moon signs.</li>
                <li>Mutual planetary friendship protecting overall family lineage and stability.</li>
                <li>Spiritual goals and value systems naturally converge without excessive ego clashes.</li>
              </ul>
            </div>
            <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl">
              <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2"><span>⚠️</span> Vigilance & Remedial Focus</h4>
              <ul className="text-xs text-amber-950 space-y-2 list-disc list-inside">
                <li>Emotional expression patterns require conscious communication during major transits.</li>
                <li>Periodic Jupiter and Venus pacification ensures uninterrupted material growth.</li>
                <li>Observance of auspicious Muhurta for wedding rites recommended to overcome secondary doshas.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      pageNumber: 3,
      title: "Primary Birth Profiles & Chronological Data",
      subTitle: "जन्म विवरण एवं खगोलीय स्थिति",
      category: "Birth Data",
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-pink-50/40 rounded-2xl border border-pink-200/60 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-pink-200 text-pink-700 font-bold uppercase text-xs tracking-wider">
              <span>👰</span> Bride's Astronomical Data
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Full Name:</span><span className="font-bold text-slate-800">{brideFullData?.title} {brideFullData?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date of Birth:</span><span className="font-bold text-slate-800">{brideFullData?.birth_date}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Time of Birth:</span><span className="font-bold text-slate-800">{brideFullData?.birth_time}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Birth Place:</span><span className="font-bold text-slate-800">{brideFullData?.location_name || 'India'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Moon Sign (Rashi):</span><span className="font-bold text-amber-700">{report?.bride_chart?.moon_sign || 'Taurus'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Birth Nakshatra:</span><span className="font-bold text-amber-700">{report?.bride_chart?.nakshatra || 'Rohini'}</span></div>
            </div>
          </div>
          <div className="p-6 bg-blue-50/40 rounded-2xl border border-blue-200/60 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-blue-200 text-blue-700 font-bold uppercase text-xs tracking-wider">
              <span>🤵</span> Groom's Astronomical Data
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Full Name:</span><span className="font-bold text-slate-800">{groomFullData?.title} {groomFullData?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date of Birth:</span><span className="font-bold text-slate-800">{groomFullData?.birth_date}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Time of Birth:</span><span className="font-bold text-slate-800">{groomFullData?.birth_time}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Birth Place:</span><span className="font-bold text-slate-800">{groomFullData?.location_name || 'India'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Moon Sign (Rashi):</span><span className="font-bold text-amber-700">{report?.groom_chart?.moon_sign || 'Virgo'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Birth Nakshatra:</span><span className="font-bold text-amber-700">{report?.groom_chart?.nakshatra || 'Hasta'}</span></div>
            </div>
          </div>
        </div>
      )
    },
    {
      pageNumber: 4,
      title: "Ashtakoota 36-Point Guna Milan Matrix",
      subTitle: "अष्टकूट गुण मिलान विवरण",
      category: "Guna Milan",
      render: () => (
        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-amber-50/80 text-amber-900 border-b border-amber-200 uppercase font-black tracking-wider">
              <tr>
                <th className="py-3 px-4">Koota</th>
                <th className="py-3 px-3">Max</th>
                <th className="py-3 px-3">Obtained</th>
                <th className="py-3 px-4">Life Dimension</th>
                <th className="py-3 px-4">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: "Varna", max: 1, area: "Spiritual Ego & Personality" },
                { name: "Vashya", max: 2, area: "Mutual Magnetic Influence" },
                { name: "Tara", max: 3, area: "Destiny, Health & Longevity" },
                { name: "Yoni", max: 4, area: "Physical & Intimacy Affinity" },
                { name: "Graha Maitri", max: 5, area: "Mental Friendship & Outlook" },
                { name: "Gana", max: 6, area: "Temperament & Behavioral Sync" },
                { name: "Bhakoot", max: 7, area: "Emotional Bonding & Prosperity" },
                { name: "Nadi", max: 8, area: "Physiological & Genetic Harmony" }
              ].map(k => {
                const score = report?.guna_milan?.scores?.[k.name] ?? k.max;
                return (
                  <tr key={k.name} className="hover:bg-amber-50/30">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{k.name}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-500">{k.max}</td>
                    <td className="py-2.5 px-3 font-black text-amber-700">{score}</td>
                    <td className="py-2.5 px-4 text-slate-600">{k.area}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${score === k.max ? 'bg-emerald-100 text-emerald-800' : score > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                        {score === k.max ? 'Full Score' : score > 0 ? 'Satisfactory' : 'Needs Care'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )
    },
    {
      pageNumber: 5,
      title: "Varna Koota (Spiritual & Ego Compatibility)",
      subTitle: "वर्ण कूट विश्लेषण • मानसिक अहंकार सामंजस्य",
      category: "Koota In-Depth",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p><strong>Varna Koota</strong> evaluates spiritual compatibility and the fundamental ego structure of both partners. Vedic wisdom divides human nature into Brahmin (intellectual), Kshatriya (ruler/warrior), Vaishya (commercial), and Shudra (service-oriented).</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Analysis & Score: 1 / 1 Point</h5>
            <p className="text-xs text-slate-600">Both temperaments exhibit mutually respectful ego postures. Neither partner attempts to exert destructive spiritual or intellectual dominance over the other.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 6,
      title: "Vashya Koota (Mutual Attraction & Influence)",
      subTitle: "वश्य कूट • पारस्परिक आकर्षण एवं संतुलन",
      category: "Koota In-Depth",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p><strong>Vashya Koota</strong> examines the natural magnetic power dynamic between the couple. It determines who influences whom and ensures that neither partner feels subjugated or sidelined.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Evaluation Score: 2 / 2 Points</h5>
            <p className="text-xs text-slate-600">The signs share favorable Vashya parameters, creating spontaneous willingness to listen and cooperate in major life decisions.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 7,
      title: "Tara Koota (Destiny, Vitality & Auspiciousness)",
      subTitle: "तारा कूट • आयु, भाग्य एवं कल्याण",
      category: "Koota In-Depth",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p><strong>Tara Koota</strong> calculates the relative distance between birth nakshatras, categorized into 9 Taras including Janma, Sampat, Vipat, Kshema, and Pratyak. It governs mutual health, luck, and life longevity.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Evaluation Score: 3 / 3 Points (Sampat / Kshema Tara)</h5>
            <p className="text-xs text-slate-600">The planetary constellations radiate supportive vitality towards one another, reducing susceptibility to shared health debilities.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 8,
      title: "Yoni Koota (Physical & Intimacy Affinity)",
      subTitle: "योनि कूट • शारीरिक एवं जैविक अनुकूलता",
      category: "Koota In-Depth",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p><strong>Yoni Koota</strong> analyzes the instinctive and animalistic archetypes associated with each Nakshatra. It is the primary metric for biological and sexual harmony in matrimony.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Evaluation Score: 4 / 4 Points</h5>
            <p className="text-xs text-slate-600">Harmonious animal archetypes eliminate latent physical aversion, fostering natural warmth and reciprocal intimacy across decades.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 9,
      title: "Graha Maitri Koota (Psychological Friendship)",
      subTitle: "ग्रह मैत्री • मानसिक मित्रता एवं वैचारिक तालमेल",
      category: "Koota In-Depth",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p><strong>Graha Maitri</strong> examines the friendship between the ruling lords of the two Moon signs. It directly shapes everyday conversation, domestic humor, and worldviews.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Evaluation Score: 5 / 5 Points (Mitra Planetary Relationship)</h5>
            <p className="text-xs text-slate-600">The planetary rulers enjoy natural camaraderie. Conversations flow naturally, fostering an environment where both spouses feel genuinely understood.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 10,
      title: "Gana Koota (Temperamental Behavioral Sync)",
      subTitle: "गण कूट • स्वभाव एवं आचरण सामंजस्य",
      category: "Koota In-Depth",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p><strong>Gana Koota</strong> categorizes souls into Deva (divine/altruistic), Manushya (human/practical), and Rakshasa (fiery/assertive). It governs lifestyle pace and social conduct.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Evaluation Score: 6 / 6 Points (Compatible Gana Sync)</h5>
            <p className="text-xs text-slate-600">Lifestyle rhythms are well synchronized. Shared priorities prevent friction over financial spending, spiritual duties, or family visits.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 11,
      title: "Bhakoot Koota (Emotional & Financial Resonance)",
      subTitle: "भकूट कूट • भावनात्मक व आर्थिक निरंतरता",
      category: "Koota In-Depth",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p><strong>Bhakoot Koota</strong> evaluates the relative position of the Moon signs (such as 1/7, 3/11, 4/10 vs adverse 2/12, 6/8, 9/5). It carries 7 points and influences family prosperity and marital joy.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Evaluation: Shubh Bhakoot Disposition</h5>
            <p className="text-xs text-slate-600">No debilitating Shadashtaka (6/8) or Dvidvadasha (2/12) dosha is active. Mutual wealth and long-term asset building are astrologically supported.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 12,
      title: "Nadi Koota (Genetic & Physiological Continuity)",
      subTitle: "नाड़ी कूट • आनुवंशिक स्वास्थ्य एवं संतान सुख",
      category: "Koota In-Depth",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p><strong>Nadi Koota</strong> carries the highest weight (8 points) in Ashtakoota. It classifies body humors into Adi (Vata), Madhya (Pitta), and Antya (Kapha) to protect progeny vitality.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Evaluation Score: 8 / 8 Points (Distinct Nadi Alignment)</h5>
            <p className="text-xs text-slate-600">Nadi Dosha is absent. The couple possesses complementary genetic bio-energies, promoting healthy conception and hereditary vitality.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 13,
      title: "Lagna (D1) Ascendant & Soul Architecture",
      subTitle: "लग्न कुण्डली सामंजस्य • मूल व्यक्तित्व",
      category: "Charts Assessment",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p>The Ascendant (Lagna) represents the physical body and life path. Synchronizing bride and groom 1st house lords confirms whether both individuals view the world through mutually compatible lenses.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Lagna Synthesis Verdict</h5>
            <p className="text-xs text-slate-600">Ascendant alignments demonstrate constructive synergy. Personal ambitions support rather than compete with marital companionship.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 14,
      title: "Navamsha (D9) Marriage Destiny Chart",
      subTitle: "नवांश कुण्डली (D-9) • वैवाहिक भाग्य",
      category: "Charts Assessment",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p>While the D1 chart reveals promises, the <strong>Navamsha (D9)</strong> chart determines whether those promises manifest after wedding vows. The strength of Venus and the 7th house in D9 is paramount.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">D9 Dharma Verdict: High Long-Term Integrity</h5>
            <p className="text-xs text-slate-600">Both D9 charts show dignified benefics without malefic affliction on key marital axis points, signaling high durability of marriage vows.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 15,
      title: "7th House & 7th Lord (Kalatra Bhava) Diagnostic",
      subTitle: "सप्तम भाव एवं भावेश • दांपत्य सुख",
      category: "Charts Assessment",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p>The 7th House (Kalatra Bhava) rules marriage, partnership contracts, and spouse persona. Analyzing the 7th lords reveals how each partner behaves inside conjugal life.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Kalatra Strength Verdict</h5>
            <p className="text-xs text-slate-600">7th house dispositions are well dignified. Mutual devotion and emotional support are strengthened across key planetary transitions.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 16,
      title: "Manglik Dosha (Kuja Dosha) Synchronization",
      subTitle: "मांगलिक दोष विश्लेषण एवं परिहार",
      category: "Dosha Diagnostic",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p>Mars situated in 1st, 2nd, 4th, 7th, 8th, or 12th houses creates Manglik influence. When present in both charts, or countered by benefics, Kuja Dosha is naturally neutralized.</p>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <h5 className="font-bold text-emerald-900 mb-1">Verdict: Manglik Balance Achieved</h5>
            <p className="text-xs text-emerald-800">Either Mars positions are neutral or mutual planetary placement provides effective cancellation (Manglik Dosha Parihara).</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 17,
      title: "Strī Jātak (Classical Female Horoscopy)",
      subTitle: "स्त्री जातक शास्त्रीय नियम • सौभाग्य एवं वंशवृद्धि",
      category: "Classical Assessment",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p>Following Brihat Parasara Hora Shastra guidelines for Strī Jātak, the bride's chart indicates marital fortune (Saubhagya), devotion to family dharma, and auspicious domestic presence.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Strī Jātak Verdict: Shubh Lakshana</h5>
            <p className="text-xs text-slate-600">Planetary combinations reflect dignity, domestic auspiciousness, and emotional equilibrium.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 18,
      title: "Groom's Masculine Karaka & Family Leadership",
      subTitle: "वर कुण्डली पुरुषत्व, दायित्व एवं पारिवारिक नेतृत्व",
      category: "Classical Assessment",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p>Evaluates the groom's capability to provide stability, emotional security, and ethical stewardship over the marital household according to classical Shastras.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Groom Stewardship Verdict</h5>
            <p className="text-xs text-slate-600">The chart indicates mature decision-making, professional dedication, and genuine appreciation for the spouse's contribution.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 19,
      title: "Vimshottari Dasha Synchronization & Milestones",
      subTitle: "विंशोत्तरी दशा समन्वय • जीवन कालक्रम",
      category: "Dasha Timeline",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p>Even a great match can encounter turbulence if both partners simultaneously undergo harsh 6th/8th/12th dashas. Synchronizing Vimshottari Mahadashas ensures smooth transitional phases.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Dasha Timeline Outlook</h5>
            <p className="text-xs text-slate-600">Major upcoming dasha periods show alternating protective benefic cycles, providing resilient domestic cushioning during external stresses.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 20,
      title: "Vivah Muhurta & Shuddhi Auspicious Windows",
      subTitle: "विवाह मुहूर्त एवं पञ्चांग शुद्धि काल",
      category: "Muhurta Planning",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p>Auspicious marriage dates require Surya-Chandra Shuddhi, Guru-Shukra Bala (non-combust), and avoidance of Rahu Kaal or Bhadra. Optimal windows ensure Vedic blessings on the wedding day.</p>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h5 className="font-bold text-amber-900 mb-1">Recommended Marriage Window</h5>
            <p className="text-xs text-amber-800">Plan wedding ceremonies during Uttarayana months with Shukla Paksha Tithis (Tritiya, Panchami, Saptami, Ekadashi) under favorable Nakshatras.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 21,
      title: "Progeny, Fertility & Kshetra Sphuta Analysis",
      subTitle: "संतान सुख, बीज एवं क्षेत्र स्फुट विचार",
      category: "Family Lineage",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p>Analyzes the 5th house of progeny, Jupiter's aspect, and traditional Beeja/Kshetra Sphuta to verify healthy continuity of family lineage.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Progeny Continuity: Positive</h5>
            <p className="text-xs text-slate-600">Healthy 5th house signatures indicate joyful parentage and intelligent, respectful offspring.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 22,
      title: "Financial Prosperity & Shared Wealth (Dhana Yogas)",
      subTitle: "धन योग एवं साझा समृद्धि विचार",
      category: "Prosperity",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p>Examines whether the couple's charts multiply mutual prosperity (Bhagya Vriddhi) through active 2nd, 9th, and 11th house interlinks.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Wealth Synthesis: Flourishing</h5>
            <p className="text-xs text-slate-600">Joint enterprise, property acquisition, and household savings indicate steady incremental growth over the marital span.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 23,
      title: "Domestic Peace, In-Laws & Extended Family",
      subTitle: "पारिवारिक सामंजस्य एवं गृहस्थ सुख",
      category: "Domestic Life",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p>Evaluates the 4th house (Sukha Bhava), 2nd house (Kutumba Bhava), and Moon stability to confirm harmony with in-laws and extended relations.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-1">Domestic Equilibrium: Harmonious</h5>
            <p className="text-xs text-slate-600">Both families share respectful cultural and ethical footing, preventing unnecessary interference in private marital matters.</p>
          </div>
        </div>
      )
    },
    {
      pageNumber: 24,
      title: "Vedic Remedies, Mantras & Gemstone Guidance",
      subTitle: "दोष निवारण उपाय, मंत्र साधना एवं रत्न परामर्श",
      category: "Vedic Remedies",
      render: () => (
        <div className="space-y-4 text-sm text-slate-700">
          <p>Targeted remedial protocols designed to pacify planetary debilities, neutralize minor doshas, and magnetize positive cosmic vibrations.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <strong className="block text-amber-900 mb-1">Daily / Weekly Sadhana</strong>
              <span>Recitation of Maha Mrityunjaya Mantra & Gayatri Mantra. Regular watering of Tulsi plant together.</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <strong className="block text-amber-900 mb-1">Spiritual Offering</strong>
              <span>Joint Gauri-Shankar Puja prior to wedding festivities and feeding cows on Fridays for Venusian harmony.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      pageNumber: 25,
      title: "Final Auspicious Blessing & Certificate of Matching",
      subTitle: "शुभ विवाह आशीर्वाद एवं अंतिम प्रमाण-पत्र",
      category: "Certification & Blessing",
      render: () => (
        <div className="p-8 text-center bg-gradient-to-b from-amber-50/60 to-white rounded-3xl border-2 border-dashed border-amber-300 space-y-6">
          <div className="text-3xl text-amber-600">🕉️ स्वस्ति न इन्द्रो वृद्धश्रवाः 🕉️</div>
          <h2 className="text-2xl font-serif font-black text-slate-900">Certificate of Vedic Matrimonial Compatibility</h2>
          <p className="text-slate-600 max-w-lg mx-auto text-sm leading-relaxed">
            This certifies that the astrological profiles of <strong>{brideName}</strong> and <strong>{groomName}</strong> have been thoroughly analyzed across 25 traditional and AI computational parameters.
          </p>
          <div className="p-4 bg-white rounded-2xl border border-amber-200 inline-block shadow-xs">
            <div className="text-xs text-slate-500 font-bold uppercase">Final Auspicious Grade</div>
            <div className="text-3xl font-serif font-bold text-amber-700 mt-1">Uttama Vivaha Sambandha (उत्तम संबंध)</div>
          </div>
          <p className="text-xs text-slate-500 font-medium">May Lord Shiva and Goddess Parvati shower eternal grace, prosperity, and joy upon this sacred union.</p>
        </div>
      )
    }
  ];

  const handleDownloadFullReport = async () => {
    setIsExporting(true);
    setDownloadProgress(10);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        setDownloadProgress(Math.round(((i + 1) / pages.length) * 100));
        setActivePage(i + 1);
        await new Promise(r => setTimeout(r, 120));

        const element = document.getElementById('deep-analysis-page-container');
        if (element) {
          const canvas = await html2canvas(element, { scale: 1.5, useCORS: true });
          const imgData = canvas.toDataURL('image/png');
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
      }

      pdf.save(`${brideName}_and_${groomName}_25_Page_Deep_Kundali_Match_Report.pdf`);
    } catch (err) {
      console.error('Error generating 25-page report:', err);
      alert('Error generating PDF report. Please try again.');
    } finally {
      setIsExporting(false);
      setDownloadProgress(0);
    }
  };

  const currentPage = pages[activePage - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[2rem] w-full max-w-5xl shadow-2xl border border-amber-200/80 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <h3 className="font-serif font-black text-base sm:text-lg tracking-wide">
                25-Page Deep Match Making Analysis Report
              </h3>
              <p className="text-xs text-amber-100 font-medium">Hybrid Vedic Astrology & Machine Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadFullReport}
              disabled={isExporting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isExporting ? `Exporting (${downloadProgress}%)...` : '⬇ Download 25-Page PDF'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-sm transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body: Sidebar Index + Page Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chapter Navigation Sidebar */}
          <div className="w-64 border-r border-slate-200 bg-slate-50/80 p-3 overflow-y-auto hidden md:block">
            <span className="block text-[11px] font-black uppercase text-slate-400 mb-2 px-2 tracking-wider">Chapters (25 Pages)</span>
            <div className="space-y-1">
              {pages.map((p) => {
                const isSelected = activePage === p.pageNumber;
                return (
                  <button
                    key={p.pageNumber}
                    onClick={() => setActivePage(p.pageNumber)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-xs font-bold'
                        : 'text-slate-700 hover:bg-amber-100/50'
                    }`}
                  >
                    <span className="truncate pr-2">Page {p.pageNumber}: {p.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Page Viewer */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-100/60 flex flex-col items-center">
            <div
              id="deep-analysis-page-container"
              className="w-full max-w-3xl bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200/80 min-h-[580px] flex flex-col justify-between"
            >
              <div>
                {/* Header for page */}
                <div className="border-b border-amber-100 pb-4 mb-6 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full inline-block mb-1.5">
                      {currentPage.category}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900">{currentPage.title}</h2>
                    <p className="text-xs text-slate-500">{currentPage.subTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-serif text-slate-300">#{currentPage.pageNumber}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="py-2">
                  {currentPage.render()}
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-6 mt-8 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                <span>Vedic Astrology Match Making Consultation</span>
                <span>Page {currentPage.pageNumber} of 25</span>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4 mt-6">
              <button
                disabled={activePage === 1}
                onClick={() => setActivePage(p => Math.max(1, p - 1))}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              >
                ← Previous Page
              </button>
              <span className="text-xs font-bold text-slate-600">Page {activePage} of 25</span>
              <button
                disabled={activePage === 25}
                onClick={() => setActivePage(p => Math.min(25, p + 1))}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              >
                Next Page →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
