import React, { useState } from 'react';
import NameNumerologyCalculator from './NameNumerologyCalculator';
import BirthNumerologyCalculator from './BirthNumerologyCalculator';
import MoonSignCalculator from './MoonSignCalculator';
import SunSignCalculator from './SunSignCalculator';
import NameHoroscopeCalculator from './NameHoroscopeCalculator';
import FriendshipCalculator from './FriendshipCalculator';
import PassionCalculator from './PassionCalculator';
import PersonalAlignmentCalculator from './PersonalAlignmentCalculator';
import RelationshipPathCalculator from './RelationshipPathCalculator';
import MasterNumberCalculator from './MasterNumberCalculator';
import CompleteReportForm from './CompleteReportForm';
import WeeklyRelationshipCalculator from './WeeklyRelationshipCalculator';
import { Sparkles, Moon, Sun, Star, Users, Calendar, Heart, Flame, UserCheck, Hexagon, Eye, FileText, ArrowLeft } from 'lucide-react';

const CompatibilityHub = () => {
  const params = new URLSearchParams(window.location.search);
  const [activeCalculator, setActiveCalculator] = useState(params.get('calculator') || null);

  const calculators = [
    {
      id: 'weekly-relationship',
      title: 'Weekly Relationship Horoscope',
      description: 'Generate daily love, harmony & chemistry forecasts for both partners.',
      icon: <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />,
      component: <WeeklyRelationshipCalculator onBack={() => setActiveCalculator(null)} />
    },
    {
      id: 'name-numerology',
      title: 'Match Compatibility By Name ',
      description: 'Check compatibility using the Chaldean method based on names.',
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      component: <NameNumerologyCalculator onBack={() => setActiveCalculator(null)} />
    },
    {
      id: 'moon-sign',
      title: 'Match Compatibility By Moon Sign',
      description: 'Analyze emotional compatibility based on Moon signs.',
      icon: <Moon className="w-6 h-6 text-blue-500" />,
      component: <MoonSignCalculator onBack={() => setActiveCalculator(null)} />
    },
    {
      id: 'sun-sign',
      title: 'Match Compatibility By Sun Sign',
      description: 'Analyze core personality and ego alignment.',
      icon: <Sun className="w-6 h-6 text-orange-500" />,
      component: <SunSignCalculator onBack={() => setActiveCalculator(null)} />
    },
    {
      id: 'name-horoscope',
      title: 'Match Compatibility By Name',
      description: 'Astrological compatibility using name initials.',
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      component: <NameHoroscopeCalculator onBack={() => setActiveCalculator(null)} />
    },
    {
      id: 'birth-numerology',
      title: 'Match Compatibility By Birth Date',
      description: 'Compatibility based on Life Path and Birth numbers.',
      icon: <Calendar className="w-6 h-6 text-green-500" />,
      component: <BirthNumerologyCalculator onBack={() => setActiveCalculator(null)} />
    },
    {
      id: 'friendship',
      title: 'Friendship Compatibility',
      description: 'Discover how strong your bond is as friends.',
      icon: <Users className="w-6 h-6 text-purple-500" />,
      component: <FriendshipCalculator onBack={() => setActiveCalculator(null)} />
    },
    {
      id: 'passion-romance',
      title: 'Passion & Romance (Venus/Mars)',
      description: 'Calculate physical and romantic chemistry.',
      icon: <Flame className="w-6 h-6 text-red-500" />,
      component: <PassionCalculator onBack={() => setActiveCalculator(null)} />
    },
    {
      id: 'personal-alignment',
      title: 'Name vs Birth Date Alignment',
      description: 'Check if your name is lucky for your life path.',
      icon: <UserCheck className="w-6 h-6 text-teal-500" />,
      component: <PersonalAlignmentCalculator onBack={() => setActiveCalculator(null)} />
    },
    {
      id: 'relationship-path',
      title: 'The Relationship Path',
      description: 'Discover the ultimate destiny of your partnership.',
      icon: <Hexagon className="w-6 h-6 text-indigo-500" />,
      component: <RelationshipPathCalculator onBack={() => setActiveCalculator(null)} />
    },
    {
      id: 'master-number',
      title: 'Spiritual Bond (Master Numbers)',
      description: 'Check for rare, karmic Soul Contracts.',
      icon: <Eye className="w-6 h-6 text-amber-500" />,
      component: <MasterNumberCalculator onBack={() => setActiveCalculator(null)} />
    },
    {
      id: 'complete-report',
      title: 'Generate Master Love Report',
      description: 'Run ALL calculators at once & download PDF!',
      icon: <FileText className="w-6 h-6 text-white" />,
      special: true,
      component: <CompleteReportForm onBack={() => setActiveCalculator(null)} />
    }
  ];

  if (activeCalculator) {
    const active = calculators.find(c => c.id === activeCalculator);
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 pt-24 font-sans">
        {active.component}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="space-y-8 animate-fade-in-up">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 bg-rose-500/10 rounded-full mb-4">
              <Heart className="w-12 h-12 text-rose-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400">
              Love & Compatibility Hub
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Explore various dimensions of your relationships using ancient numerology and astrological principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {calculators.filter(c => !c.special).map((calc) => (
              <button
                key={calc.id}
                onClick={() => setActiveCalculator(calc.id)}
                className="group relative text-left bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-700/50 hover:border-rose-500/50 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="p-3 bg-slate-900/80 rounded-xl w-fit mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {calc.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200 mb-2 group-hover:text-rose-400 transition-colors">
                    {calc.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed flex-grow">
                    {calc.description}
                  </p>

                  <div className="mt-6 flex items-center text-indigo-400 text-sm font-medium opacity-80 group-hover:opacity-100 group-hover:text-rose-400 transition-all">
                    <span>Start Calculator</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Master Report Banner */}
          <div
            onClick={() => setActiveCalculator('complete-report')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 shadow-[0_0_40px_rgba(217,70,239,0.3)] cursor-pointer transform hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group border border-pink-400/50 my-10"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform duration-700">
              <FileText className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-white font-bold text-sm mb-4 border border-white/30">
                <Sparkles className="w-4 h-4" /> RECOMMENDED
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Generate Master Love Report</h2>
              <p className="text-xl text-pink-100 max-w-2xl">Don't want to click through all calculators? Run them all simultaneously and generate a beautiful, printable PDF summary in one click.</p>
              <div className="mt-8 flex items-center gap-3 text-white font-bold text-lg group-hover:gap-5 transition-all">
                Start Generation <ArrowLeft className="w-6 h-6 rotate-180" />
              </div>
            </div>
          </div>

          <footer className="w-full text-center py-8 text-slate-500 text-xs font-semibold mt-12 border-t border-slate-700/30">
            Copyright © 2026 Phanom Technologies. All Rights Reserved
          </footer>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityHub;
