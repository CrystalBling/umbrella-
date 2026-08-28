import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Settings, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  HelpCircle,
  Umbrella,
  Navigation
} from 'lucide-react';
import { LocationInfo } from '../types';

interface HeaderProps {
  currentLocation: LocationInfo;
  onOpenSearch: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  isLocating: boolean;
  onUseCurrentLocation: () => void;
  isHighRainAlert?: boolean;
  rainChance?: number;
  onOpenAlertPrompt?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onOpenSearch,
  onOpenGuide,
  onOpenSettings,
  onRefresh,
  isLoading,
  isAudioPlaying,
  onToggleAudio,
  isLocating,
  onUseCurrentLocation,
  isHighRainAlert,
  rainChance = 0,
  onOpenAlertPrompt,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-1 sm:px-0 border-b border-white/10 mb-4 sm:mb-6">
      {/* Brand & Location info in Bold Typography style */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-black text-cyan-400">
            Weather Intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenSearch}
            className="text-left group flex items-center gap-2"
            title="Click to search location"
          >
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              {currentLocation.name}{currentLocation.country ? `, ${currentLocation.country}` : ''}
            </h2>
            <MapPin className="w-4 h-4 text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>

          {isHighRainAlert && (
            <button
              onClick={onOpenAlertPrompt}
              title="Umbrella need possibility >50%. Click to view umbrella alert prompt."
              className="px-2.5 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 animate-pulse shadow-md shadow-cyan-950/40"
            >
              <Umbrella className="w-3.5 h-3.5 text-cyan-400" />
              <span>☔ Need: {rainChance}%</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Controls & Live Time */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
        <div className="text-left sm:text-right">
          <p className="text-2xl sm:text-3xl font-light italic opacity-90 text-white tracking-tight">
            {timeStr || 'LIVE'}
          </p>
          <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold text-slate-300">
            {isLoading ? 'Fetching Satellite Data...' : 'Real-time Sync Active'}
          </p>
        </div>

        {/* Action button pills in glass style */}
        <div className="flex items-center gap-2 pl-2 sm:pl-4 sm:border-l sm:border-white/10">
          <button
            onClick={onOpenSearch}
            title="Search city"
            className="glass p-2.5 rounded-xl text-slate-300 hover:text-white hover:border-cyan-400/40 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            title="Detect GPS location"
            className="glass p-2.5 rounded-xl text-slate-300 hover:text-white hover:border-cyan-400/40 transition-colors disabled:opacity-40"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={onToggleAudio}
            title={isAudioPlaying ? "Mute ambient rain audio" : "Play ambient rain audio"}
            className={`glass p-2.5 rounded-xl transition-all ${
              isAudioPlaying
                ? 'text-cyan-300 border-cyan-400/50 bg-cyan-500/10'
                : 'text-slate-300 hover:text-white hover:border-cyan-400/40'
            }`}
          >
            {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenGuide}
            title="Gear Guide"
            className="glass p-2.5 rounded-xl text-slate-300 hover:text-white hover:border-cyan-400/40 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh forecast"
            className="glass p-2.5 rounded-xl text-slate-300 hover:text-white hover:border-cyan-400/40 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={onOpenSettings}
            title="Preferences & Units"
            className="glass p-2.5 rounded-xl text-slate-300 hover:text-white hover:border-cyan-400/40 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
