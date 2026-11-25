import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { PYTHON_ASTRO_URL } from '../services/api';

/**
 * PlaceAutocomplete component for Location Search & Timezone lookup
 */
export default function PlaceAutocomplete({ 
  onSelect, 
  onInputChange,
  value = '', 
  placeholder = 'City, State, Country',
  inputClassName = '',
  dropdownClassName = ''
}) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (val) => {
    setQuery(val);
    if (onInputChange) {
      onInputChange(val);
    }
    if (!val || val.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const baseUrl = PYTHON_ASTRO_URL.replace(/\/api\/kundali\/?$/, '').replace(/\/+$/, '');
      const res = await axios.get(`${baseUrl}/api/locations/search`, {
        params: { q: val.trim() }
      });
      if (Array.isArray(res.data)) {
        setResults(res.data);
        setIsOpen(true);
      }
    } catch (err) {
      console.warn('Place search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePick = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const tz_offset_hours = item.tz_offset_hours !== undefined 
      ? parseFloat(item.tz_offset_hours) 
      : (item.tz !== undefined ? parseFloat(item.tz) : 5.5);
    const display_name = item.display_name || item.name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

    setQuery(display_name);
    setIsOpen(false);
    if (onSelect) {
      onSelect({
        display_name,
        lat,
        lon,
        tz_offset_hours
      });
    }
  };

  const defaultInputClass = "w-full bg-amber-50/50 border border-amber-300/80 rounded-xl pl-9 pr-9 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all text-sm placeholder:text-stone-400 font-medium";
  const defaultDropdownClass = "absolute z-50 left-0 right-0 mt-1.5 bg-white border border-amber-300 rounded-xl max-h-56 overflow-y-auto shadow-2xl divide-y divide-amber-100";

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className={inputClassName || defaultInputClass}
          required
        />
        <MapPin className="w-4 h-4 text-amber-700 absolute left-3 top-3.5 pointer-events-none" />
        {loading && (
          <Loader2 className="w-4 h-4 text-rose-600 animate-spin absolute right-3 top-3.5" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className={dropdownClassName || defaultDropdownClass}>
          {results.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handlePick(item)}
              className="px-3.5 py-2.5 text-xs text-stone-800 hover:bg-amber-50 cursor-pointer transition flex items-center justify-between"
            >
              <span className="truncate pr-2 font-medium">{item.display_name || item.name}</span>
              <span className="text-[10px] text-rose-700 font-mono shrink-0 font-bold bg-amber-100/70 px-1.5 py-0.5 rounded">
                {parseFloat(item.lat).toFixed(2)}°, {parseFloat(item.lon).toFixed(2)}°
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
