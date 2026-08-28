import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  X, 
  Clock, 
  Sparkles, 
  Loader2,
  Globe
} from 'lucide-react';
import { LocationInfo } from '../types';
import { searchLocations, POPULAR_LOCATIONS, SINGAPORE_TOWNS, reverseGeocode } from '../services/weatherService';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: LocationInfo) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  onUseCurrentLocation,
  isLocating,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentLocations, setRecentLocations] = useState<LocationInfo[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load recents from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('umbrella_cast_recent_locations');
      if (saved) {
        setRecentLocations(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load recent locations', e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      const res = await searchLocations(query);
      setResults(res);
      setIsSearching(false);
    }, 280);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (loc: LocationInfo) => {
    // Save to recents
    try {
      const filtered = recentLocations.filter(r => r.name !== loc.name || r.country !== loc.country);
      const updated = [loc, ...filtered].slice(0, 5);
      setRecentLocations(updated);
      localStorage.setItem('umbrella_cast_recent_locations', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    onSelectLocation(loc);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-xl rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl overflow-hidden z-10"
        >
          {/* Search Header Input */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, town, or coordinates (e.g. Kyoto, London, San Francisco)..."
              className="w-full bg-transparent text-white text-base placeholder:text-slate-500 focus:outline-none"
            />
            {isSearching && <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />}
            {query && !isSearching && (
              <button 
                onClick={() => setQuery('')}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-white/5"
            >
              ESC
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* GPS Location Button */}
            <button
              onClick={() => {
                onUseCurrentLocation();
                onClose();
              }}
              disabled={isLocating}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 hover:from-sky-500/20 hover:to-indigo-500/20 border border-sky-500/20 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                </div>
                <div>
                  <span className="font-semibold text-white text-sm block">Use Current GPS Location</span>
                  <span className="text-xs text-sky-300/80">Real-time local rain & umbrella radar</span>
                </div>
              </div>
              <span className="text-xs text-sky-400 font-semibold px-2 py-1 rounded-lg bg-sky-500/15">
                Auto-Detect
              </span>
            </button>

            {/* Live Search Results */}
            {query.trim().length >= 2 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                  Search Results
                </span>
                {results.length === 0 && !isSearching ? (
                  <div className="p-6 text-center text-slate-500 text-sm bg-slate-950/40 rounded-2xl border border-white/5">
                    No locations found matching "{query}". Try a different spelling.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {results.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-white/10 text-left transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors" />
                          <div>
                            <span className="font-medium text-white text-sm block">{item.name}</span>
                            <span className="text-xs text-slate-400">
                              {[item.admin1, item.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                          {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recent Searches */}
            {recentLocations.length > 0 && query.trim().length < 2 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Recent Locations
                  </span>
                  <button
                    onClick={() => {
                      setRecentLocations([]);
                      localStorage.removeItem('umbrella_cast_recent_locations');
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-300"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1.5">
                  {recentLocations.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-white/10 text-left transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-sky-400" />
                        <span className="font-medium text-white text-sm">{item.name}</span>
                        <span className="text-xs text-slate-500">
                          {[item.admin1, item.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Singapore Live Towns (Data.gov.sg v2) */}
            {query.trim().length < 2 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Singapore Towns (Live Data.gov.sg)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">2-hr NEA Radar</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SINGAPORE_TOWNS.slice(0, 12).map((town) => (
                    <button
                      key={town.name}
                      onClick={() => handleSelect({
                        id: `sg-${town.name.toLowerCase().replace(/\s+/g, '-')}`,
                        name: town.name,
                        country: 'Singapore',
                        latitude: town.lat,
                        longitude: town.lon,
                        timezone: 'Asia/Singapore'
                      })}
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/20 hover:border-cyan-400/50 text-xs font-medium text-cyan-200 transition-all flex items-center gap-1"
                    >
                      <span>{town.name}</span>
                      <span className="text-cyan-500 text-[10px]">({town.region})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Global Cities */}
            {query.trim().length < 2 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Global Metros
                </span>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelect(loc)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 hover:border-white/20 text-xs font-medium text-slate-200 transition-all flex items-center gap-1.5"
                    >
                      <span>{loc.name}</span>
                      <span className="text-slate-500 text-[10px]">{loc.country}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
