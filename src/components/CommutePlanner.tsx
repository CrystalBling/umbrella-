import React from 'react';
import { UmbrellaAdvice, UserPreferences } from '../types';
import { 
  Sun, 
  Briefcase, 
  Coffee, 
  Home, 
  Moon, 
  Droplets, 
  Umbrella, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { formatTemp, formatPrecip } from '../services/weatherService';

interface CommutePlannerProps {
  advice: UmbrellaAdvice;
  prefs: UserPreferences;
}

export const CommutePlanner: React.FC<CommutePlannerProps> = ({ advice, prefs }) => {
  const periods = [
    {
      key: 'morning',
      item: advice.commuteSummary.morning,
      icon: Briefcase,
      accent: 'sky',
      adviceText: (prob: number) => 
        prob >= 50 
          ? 'Carry full-sized or sturdy umbrella on your way out.' 
          : prob >= 20 
          ? 'Tuck a compact umbrella in your backpack.' 
          : 'Dry morning commute expected.'
    },
    {
      key: 'afternoon',
      item: advice.commuteSummary.afternoon,
      icon: Coffee,
      accent: 'amber',
      adviceText: (prob: number) => 
        prob >= 50 
          ? 'Grab an umbrella if stepping out for lunch or coffee.' 
          : prob >= 20 
          ? 'Spotty showers possible during lunch break.' 
          : 'Great conditions for an outdoor lunch walk.'
    },
    {
      key: 'evening',
      item: advice.commuteSummary.evening,
      icon: Home,
      accent: 'indigo',
      adviceText: (prob: number) => 
        prob >= 50 
          ? 'Heavy rain risk during rush hour heading home.' 
          : prob >= 20 
          ? 'Chance of damp roads and light drizzle.' 
          : 'Clear skies for your evening commute.'
    },
    {
      key: 'night',
      item: advice.commuteSummary.night,
      icon: Moon,
      accent: 'purple',
      adviceText: (prob: number) => 
        prob >= 50 
          ? 'Umbrella necessary for dinner or late evening outings.' 
          : prob >= 20 
          ? 'Slight risk of overnight precipitation.' 
          : 'Pleasant, dry night forecasted.'
    },
  ];

  return (
    <div className="w-full rounded-3xl p-6 sm:p-7 glass border border-white/10 shadow-2xl mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-cyan-400">
            Commute Intelligence
          </p>
          <h3 className="text-2xl font-black text-white tracking-tight mt-0.5">
            Daily Routine & Transit Advisor
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Targeted precipitation breakdown tailored to daily travel windows
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {periods.map(({ key, item, icon: Icon, adviceText }) => {
          const isRain = item.verdict === 'rain';
          const isChance = item.verdict === 'chance';

          return (
            <div
              key={key}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isRain
                  ? 'glass bg-rose-500/10 border-rose-500/30'
                  : isChance
                  ? 'glass bg-amber-500/10 border-amber-500/30'
                  : 'glass border-white/10'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isRain ? 'glass bg-rose-500/20 text-rose-300' : isChance ? 'glass bg-amber-500/20 text-amber-300' : 'glass-subtle text-cyan-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white leading-none uppercase tracking-wide">{item.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{item.timeLabel}</span>
                    </div>
                  </div>

                  {isRain ? (
                    <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400" title="Rain Expected">
                      <Umbrella className="w-4 h-4" />
                    </span>
                  ) : isChance ? (
                    <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400" title="Possible Showers">
                      <Droplets className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400" title="Clear">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {/* Rain Probability Metric in Bold Typography */}
                <div className="my-3">
                  <p className="text-[10px] uppercase tracking-widest opacity-40 font-black text-slate-300">
                    Rain Likelihood
                  </p>
                  <p className={`text-3xl font-black font-mono tracking-tight ${
                    isRain ? 'text-rose-400' : isChance ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {item.rainProb}<span className="text-base opacity-50 font-normal">%</span>
                  </p>
                </div>

                {/* Probability Bar */}
                <div className="w-full bg-[#05070A]/60 rounded-full h-1.5 overflow-hidden mb-3.5 border border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      isRain ? 'bg-rose-500' : isChance ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.max(4, item.rainProb)}%` }}
                  />
                </div>

                {/* Advice statement */}
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {adviceText(item.rainProb)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{formatTemp(item.temp, prefs.tempUnit)}</span>
                {item.precipSum > 0 && <span className="text-cyan-300 font-bold">{formatPrecip(item.precipSum, prefs.rainUnit)}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
