import React, { useState } from 'react';

// Determine color based on planet nature
const getStatusColor = (planet) => {
  const benefic = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const malefic = ['Mars', 'Saturn', 'Sun', 'Rahu', 'Ketu'];
  if (benefic.includes(planet)) return 'green';
  if (malefic.includes(planet)) return 'red';
  return 'blue';
};

// Props: brideDasha and groomDasha are arrays of dasha entries with fields
// planet, start_date, end_date, description (optional)

const VimshottariDashaDisplay = ({ brideDasha, groomDasha }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState('Bride');

  const openModal = (entry, partner) => {
    setSelectedEntry(entry);
    setSelectedPartner(partner);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEntry(null);
  };

  const renderDashaList = (list, partner) => (
    <div className="space-y-2">
      {list.map((d, idx) => {
        const statusColor = getStatusColor(d.planet);
        return (
          <button
            key={idx}
            onClick={() => openModal(d, partner)}
            className={`w-full text-left px-4 py-2 bg-${statusColor}-100/20 backdrop-blur-md rounded-lg border border-${statusColor}-200 hover:bg-${statusColor}-200 transition-colors`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-200">{d.planet}</span>
              <span className="text-xs text-slate-400">{d.start_date} – {d.end_date}</span>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <section className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-[2rem] p-8 shadow-xl border border-slate-200">
      <h3 className="text-2xl font-serif italic text-slate-800 mb-6 text-center">विंशोत्तरी पंचस्तरीय · Dasha</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-bold text-slate-700 mb-3">Bride</h4>
          {brideDasha && brideDasha.length > 0 ? renderDashaList(brideDasha, 'Bride') : <p className="text-slate-500">No Dasha data</p>}
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-700 mb-3">Groom</h4>
          {groomDasha && groomDasha.length > 0 ? renderDashaList(groomDasha, 'Groom') : <p className="text-slate-500">No Dasha data</p>}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedEntry && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-slate-500 hover:text-slate-800"
            >✖️</button>
            <h4 className="text-xl font-semibold mb-2">{selectedPartner} – {selectedEntry.planet} Dasha</h4>
            <p className="mb-2"><strong>Period:</strong> {selectedEntry.start_date} → {selectedEntry.end_date}</p>
            {selectedEntry.description && (
              <p className="text-sm text-slate-700"><strong>Details:</strong> {selectedEntry.description}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default VimshottariDashaDisplay;
