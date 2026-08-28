import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  HourlyForecastItem, 
  UserPreferences 
} from '../types';
import { 
  CloudRain, 
  Sun, 
  Cloud, 
  CloudDrizzle, 
  CloudLightning, 
  CloudSnow, 
  Umbrella, 
  Droplets,
  Wind,
  SunMedium,
  Compass
} from 'lucide-react';
import { formatTemp, formatPrecip, formatWind } from '../services/weatherService';

interface HourlyTimelineProps {
  hourlyItems: HourlyForecastItem[];
  prefs: UserPreferences;
}

export const HourlyPrecipitationTimeline: React.FC<HourlyTimelineProps> = ({
  hourlyItems,
  prefs,
}) => {
  const [selectedHour, setSelectedHour] = useState<HourlyForecastItem | null>(
    hourlyItems[0] || null
  );

  const getDynamicIcon = (iconName: string, isRain: boolean, size = 'w-5 h-5') => {
    switch (iconName) {
      case 'Sun':
      case 'SunMedium':
        return <Sun className={`${size} text-amber-400`} />;
      case 'CloudSun':
        return <SunMedium className={`${size} text-amber-300`} />;
      case 'Cloud':
        return <Cloud className={`${size} text-slate-300`} />;
      case 'CloudDrizzle':
        return <CloudDrizzle className={`${size} text-sky-400`} />;
      case 'CloudRain':
      case 'CloudRainWind':
        return <CloudRain className={`${size} text-blue-400`} />;
      case 'CloudLightning':
        return <CloudLightning className={`${size} text-amber-300`} />;
      case 'CloudSnow':
      case 'CloudHail':
        return <CloudSnow className={`${size} text-cyan-200`} />;
      default:
        return isRain ? <CloudRain className={`${size} text-blue-400`} /> : <Sun className={`${size} text-amber-400`} />;
    }
  };

  const maxProb = Math.max(10, ...hourlyItems.map((h) => h.rainProb));

  return (
    <div className="w-full rounded-3xl p-6 sm:p-7 glass border border-white/10 shadow-2xl mb-6">
      {/* Header with Bold Typography accents */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-cyan-400">
              Live Hourly Radar
            </p>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight mt-0.5">
            24-Hour Precipitation Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tap any hour to inspect exact rain likelihood, wind gusts, and umbrella status
          </p>
        </div>

        {selectedHour && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl glass-subtle border border-white/10 text-xs shrink-0">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Selected:</span>
            <span className="font-bold text-white">{selectedHour.timeStr}</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-cyan-300 font-bold">{selectedHour.rainProb}% Rain</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-slate-200">{formatTemp(selectedHour.temp, prefs.tempUnit)}</span>
          </div>
        )}
      </div>

      {/* Interactive Horizontal Scrollable Hourly Track */}
      <div className="relative">
        {/* Probability Threshold Reference lines */}
        <div className="absolute inset-x-0 top-12 h-32 pointer-events-none opacity-20 border-t border-dashed border-cyan-400">
          <span className="absolute right-2 -top-4 text-[10px] text-cyan-400 font-mono tracking-wider">30% Umbrella threshold</span>
        </div>

        <div className="flex items-end gap-2.5 overflow-x-auto pb-4 pt-6 px-1 no-scrollbar scroll-smooth">
          {hourlyItems.map((item, idx) => {
            const isSelected = selectedHour?.isoTime === item.isoTime;
            const barHeight = Math.max(12, Math.round((item.rainProb / 100) * 110));
            const isHighRain = item.rainProb >= 60;
            const isModerateRain = item.rainProb >= 30;

            return (
              <motion.button
                key={item.isoTime}
                onClick={() => setSelectedHour(item)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.96 }}
                className={`relative flex flex-col items-center min-w-[72px] sm:min-w-[80px] p-3 rounded-2xl transition-all cursor-pointer select-none shrink-0 ${
                  isSelected
                    ? 'glass border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 bg-white/10'
                    : 'glass-subtle hover:bg-white/5 border border-white/5'
                }`}
              >
                {/* Umbrella or Parasol Icon if needed during this hour */}
                <div className="h-5 flex items-center justify-center mb-1.5">
                  {item.umbrellaNeeded ? (
                    <span 
                      title="Rain umbrella recommended"
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-400"
                    >
                      <Umbrella className="w-3 h-3" />
                    </span>
                  ) : item.uvIndex >= 6.0 ? (
                    <span 
                      title="High UV - Sun parasol recommended"
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400"
                    >
                      <Sun className="w-3 h-3" />
                    </span>
                  ) : item.rainProb >= 20 ? (
                    <span 
                      title="Slight rain chance"
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-400"
                    >
                      <Droplets className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  )}
                </div>

                {/* Time */}
                <span className={`text-xs font-black tracking-tight mb-2 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                  {item.timeStr}
                </span>

                {/* Weather Icon */}
                <div className="my-1.5">
                  {getDynamicIcon(item.weatherIcon, item.umbrellaNeeded, 'w-6 h-6')}
                </div>

                {/* Temp */}
                <span className="text-xs font-mono font-bold text-slate-200 mb-3">
                  {formatTemp(item.temp, prefs.tempUnit)}
                </span>

                {/* Rain Probability Bar Container */}
                <div className="w-full flex flex-col items-center justify-end h-28 bg-[#05070A]/60 rounded-xl p-1 border border-white/5 relative overflow-hidden">
                  {/* Probability Bar */}
                  <div
                    className={`w-full rounded-lg transition-all duration-500 flex flex-col items-center justify-start pt-1 ${
                      isHighRain
                        ? 'bg-gradient-to-t from-rose-600 via-indigo-600 to-cyan-400 shadow-md shadow-rose-500/20'
                        : isModerateRain
                        ? 'bg-gradient-to-t from-sky-600 to-cyan-400 shadow-sm shadow-cyan-500/15'
                        : 'bg-gradient-to-t from-slate-800 to-slate-700'
                    }`}
                    style={{ height: `${barHeight}px` }}
                  >
                    {item.rainProb > 0 && (
                      <span className="text-[10px] font-mono font-black text-white drop-shadow">
                        {item.rainProb}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Precipitation Volume (if any) */}
                <span className="text-[10px] font-mono font-semibold text-slate-400 mt-2 h-4">
                  {item.precipitation > 0 ? `${item.precipitation.toFixed(1)}mm` : '0.0mm'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Details Drawer */}
      {selectedHour && (
        <motion.div
          key={selectedHour.isoTime}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-2xl glass border border-white/10 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center shrink-0">
              {getDynamicIcon(selectedHour.weatherIcon, selectedHour.umbrellaNeeded, 'w-5 h-5')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{selectedHour.timeStr} Conditions</span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-black ${
                  selectedHour.umbrellaNeeded
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : selectedHour.uvIndex >= 6.0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {selectedHour.umbrellaNeeded ? 'Rain Umbrella Advised' : selectedHour.uvIndex >= 6.0 ? 'UV Parasol Advised' : 'Dry & Safe'}
                </span>
              </div>
              <span className="text-xs text-slate-400">{selectedHour.weatherDesc}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Rain Prob</span>
              <span className="font-mono font-black text-cyan-400 text-sm">{selectedHour.rainProb}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Volume</span>
              <span className="font-mono font-black text-slate-200 text-sm">
                {formatPrecip(selectedHour.precipitation, prefs.rainUnit)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Wind</span>
              <span className="font-mono font-black text-slate-200 text-sm">
                {formatWind(selectedHour.windSpeed, prefs.windUnit)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">UV Index</span>
              <span className="font-mono font-black text-amber-300 text-sm">
                {selectedHour.uvIndex.toFixed(1)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
