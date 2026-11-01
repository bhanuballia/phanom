import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import VimshottariTable from '../components/VimshottariTable';

export default function VimshottariDashaWindow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const birthData = {
    name: searchParams.get('name') || 'User',
    dateOfBirth: searchParams.get('date') || '1990-10-01',
    timeOfBirth: searchParams.get('time') || '12:00:00',
    lat: parseFloat(searchParams.get('lat') || '28.6139'),
    lon: parseFloat(searchParams.get('lon') || '77.2090'),
    tz_offset: parseFloat(searchParams.get('tz_offset') || '5.5'),
    placeOfBirth: searchParams.get('location_name') || 'Birth Place',
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.opener) {
                window.close();
              } else {
                navigate(-1);
              }
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Close / Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h1 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                विंशोत्तरी पंचस्तरीय · Dasha Table
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              {birthData.name} · {birthData.dateOfBirth} {birthData.timeOfBirth} ({birthData.placeOfBirth})
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-amber-300/90 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vedic 120-Year Vimshottari Cycle</span>
        </div>
      </header>

      {/* Main Table Container */}
      <main className="flex-1 p-2 sm:p-4 max-w-7xl w-full mx-auto flex flex-col">
        <div className="flex-1 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
          <VimshottariTable birthData={birthData} initialLevels={5} />
        </div>
      </main>
    </div>
  );
}
