import React from 'react';
import { DailyForecastItem, UserPreferences } from '../types';
import { 
  CloudRain, 
  Sun, 
  Cloud, 
  CloudDrizzle, 
  CloudLightning, 
  CloudSnow, 
  Umbrella, 
  Droplets,
  Sunrise,
  Sunset,
  SunMedium
} from 'lucide-react';
import { formatTemp, formatPrecip } from '../services/weatherService';

interface DailyForecastProps {
  dailyItems: DailyForecastItem[];
  prefs: UserPreferences;
}

export const DailyForecastCard: React.FC<DailyForecastProps> = ({ dailyItems, prefs }) => {
  const getDynamicIcon = (code: number, size = 'w-5 h-5') => {
    if ([0, 1].includes(code)) return <Sun className={`${size} text-amber-400`} />;
    if ([2].includes(code)) return <SunMedium className={`${size} text-amber-300`} />;
    if ([3, 45, 48].includes(code)) return <Cloud className={`${size} text-slate-300`} />;
    if ([51, 53, 55, 56, 57].includes(code)) return <CloudDrizzle className={`${size} text-sky-400`} />;
    if ([61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain className={`${size} text-blue-400`} />;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow className={`${size} text-cyan-200`} />;
    if ([95, 96, 99].includes(code)) return <CloudLightning className={`${size} text-amber-300`} />;
    return <CloudRain className={`${size} text-blue-400`} />;
  };

  // Find min and max across all days for temperature bar scale
  const allMins = dailyItems.map(d => d.tempMin);
  const allMaxs = dailyItems.map(d => d.tempMax);
  const lowestTemp = Math.min(...allMins);
  const highestTemp = Math.max(...allMaxs);
  const tempSpan = Math.max(1, highestTemp - lowestTemp);

  return (
    <div className="w-full rounded-3xl p-6 sm:p-7 glass border border-white/10 shadow-2xl mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-cyan-400">
            Weekly Horizon
          </p>
          <h3 className="text-2xl font-black text-white tracking-tight mt-0.5">
            7-Day Precipitation Outlook
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Weekly precipitation certainty and high/low temperature trajectory
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {dailyItems.map((item, idx) => {
          const isDefinite = item.umbrellaVerdict === 'definitely';
          const isLikely = item.umbrellaVerdict === 'likely';
          const isMaybe = item.umbrellaVerdict === 'maybe';

          // Percentage positions for temp bar
          const leftPercent = Math.max(0, Math.min(80, ((item.tempMin - lowestTemp) / tempSpan) * 100));
          const rightPercent = Math.max(20, Math.min(100, ((item.tempMax - lowestTemp) / tempSpan) * 100));
          const barWidth = Math.max(15, rightPercent - leftPercent);

          return (
            <div
              key={item.dateStr}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-3 ${
                idx === 0
                  ? 'glass border-cyan-400/40 shadow-lg shadow-cyan-500/10 bg-white/10'
                  : 'glass-subtle hover:bg-white/5 border-white/5'
              }`}
            >
              {/* Day & Condition */}
              <div className="flex items-center gap-3.5 sm:w-48">
                <div className="w-10 h-10 rounded-xl glass-subtle border border-white/10 flex items-center justify-center shrink-0">
                  {getDynamicIcon(item.weatherCode, 'w-5 h-5')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-sm tracking-tight">{item.dayName}</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">{item.fullDate}</span>
                  </div>
                  <span className="text-xs text-slate-400 truncate block max-w-[140px] font-medium">{item.weatherDesc}</span>
                </div>
              </div>

              {/* Rain Chance, Rain Volume, UV & Umbrella Decision */}
              <div className="flex items-center gap-3 sm:w-56">
                <div className="flex flex-col w-20">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    <span className={`font-mono text-xs font-black ${
                      item.rainProbMax >= 50 ? 'text-rose-400' : item.rainProbMax >= 25 ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {item.rainProbMax}%
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    {item.precipitationSum > 0 ? formatPrecip(item.precipitationSum, prefs.rainUnit) : `${item.uvMax.toFixed(1)} UV`}
                  </span>
                </div>

                <div className="flex-1">
                  {isDefinite ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <Umbrella className="w-3 h-3" /> Yes
                    </span>
                  ) : isLikely ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Umbrella className="w-3 h-3" /> Likely
                    </span>
                  ) : isMaybe ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      <Umbrella className="w-3 h-3" /> Maybe
                    </span>
                  ) : item.uvMax >= 6.5 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Sun className="w-3 h-3" /> Parasol
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider glass-subtle text-slate-400 border border-white/10">
                      No
                    </span>
                  )}
                </div>
              </div>

              {/* Temperature Range Gauge Bar */}
              <div className="flex items-center gap-3 flex-1 max-w-xs">
                <span className="font-mono text-xs text-slate-400 w-10 text-right font-medium">
                  {formatTemp(item.tempMin, prefs.tempUnit)}
                </span>
                
                <div className="flex-1 h-2 bg-[#05070A]/80 rounded-full relative overflow-hidden border border-white/5">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-400 opacity-85"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidth}%`,
                    }}
                  />
                </div>

                <span className="font-mono text-xs font-black text-white w-10 text-left">
                  {formatTemp(item.tempMax, prefs.tempUnit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
