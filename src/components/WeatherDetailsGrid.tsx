import React from 'react';
import { WeatherApiResponse, UmbrellaAdvice, UserPreferences } from '../types';
import { 
  Droplets, 
  Sun, 
  Cloud, 
  CloudRain,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { formatPrecip } from '../services/weatherService';

interface WeatherDetailsGridProps {
  weather: WeatherApiResponse;
  advice: UmbrellaAdvice;
  prefs: UserPreferences;
}

export const WeatherDetailsGrid: React.FC<WeatherDetailsGridProps> = ({
  weather,
  advice,
  prefs,
}) => {
  const current = weather.current;
  const isParasol = advice.verdict === 'sun_parasol' || advice.isVerySunny || advice.maxUvToday >= 6.5;
  const isHeavyRain = advice.isHeavyRain || advice.totalPrecipitationToday >= 3.0;

  const coreVariables = [
    {
      id: 'rainfall-weather',
      title: '1. Rainfall & Weather Status',
      value: `${advice.maxRainChanceToday}%`,
      unit: 'Chance',
      subValue: advice.isRainingNow 
        ? 'Active Rain Right Now' 
        : advice.maxRainChanceToday > 60 
        ? 'High Likelihood of Rain' 
        : advice.maxRainChanceToday > 25 
        ? 'Passing Spotty Showers' 
        : 'Dry & Clear Skies',
      icon: CloudRain,
      iconColor: advice.maxRainChanceToday > 50 ? 'text-rose-400' : 'text-cyan-400',
      badge: advice.isRainingNow ? 'Raining Now' : advice.maxRainChanceToday > 50 ? 'High Risk' : advice.maxRainChanceToday > 20 ? 'Moderate' : 'Low',
      badgeClass: advice.maxRainChanceToday > 50 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      desc: advice.rainStartTime 
        ? `Precipitation risk window begins around ${advice.rainStartTime}.`
        : 'Meteorological sensors detect low probability of precipitation today.',
      umbrellaImpact: advice.maxRainChanceToday > 35 
        ? 'Directly triggers need for rain umbrella' 
        : 'Precipitation is unlikely to require rain protection'
    },
    {
      id: 'rain-volume',
      title: '2. Rain Volume (mm)',
      value: formatPrecip(advice.totalPrecipitationToday, prefs.rainUnit),
      unit: '',
      subValue: advice.totalPrecipitationToday >= 5.0 
        ? 'Heavy Downpour Volume' 
        : advice.totalPrecipitationToday >= 1.0 
        ? 'Moderate Rain Accumulation' 
        : advice.totalPrecipitationToday > 0 
        ? 'Light Drizzle / Misting' 
        : 'Zero Precipitation Measured',
      icon: Droplets,
      iconColor: advice.totalPrecipitationToday >= 2.0 ? 'text-blue-400' : 'text-slate-400',
      badge: advice.totalPrecipitationToday >= 4.0 ? 'Heavy' : advice.totalPrecipitationToday >= 1.0 ? 'Moderate' : 'Dry',
      badgeClass: advice.totalPrecipitationToday >= 1.0 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-white/5',
      desc: advice.totalPrecipitationToday >= 3.0 
        ? 'Substantial water volume will overwhelm compact models; full-size or heavy-duty canopy advised.'
        : 'Estimated 24-hour total liquid rainfall volume across your region.',
      umbrellaImpact: advice.totalPrecipitationToday >= 2.5 
        ? 'Requires full-coverage waterproof canopy' 
        : 'Light or zero liquid accumulation'
    },
    {
      id: 'cloud-cover',
      title: '3. Cloud Cover',
      value: `${current.cloud_cover}%`,
      unit: 'Sky Cover',
      subValue: current.cloud_cover > 75 
        ? 'Overcast Cloud Blanket' 
        : current.cloud_cover > 40 
        ? 'Scattered / Partly Cloudy' 
        : 'Open Sky / Direct Sunlight',
      icon: Cloud,
      iconColor: 'text-sky-300',
      badge: current.cloud_cover > 75 ? 'Overcast' : current.cloud_cover > 40 ? 'Partly Cloudy' : 'Clear',
      badgeClass: 'bg-slate-800 text-slate-300 border-white/10',
      desc: current.cloud_cover <= 40 
        ? 'Low cloud cover allows intense solar UV penetration, increasing need for sun parasol.'
        : 'Thick clouds attenuate direct sun rays but trap atmospheric moisture.',
      umbrellaImpact: current.cloud_cover <= 50 && advice.maxUvToday >= 5.5
        ? 'Exposes you to direct sun rays (UV Parasol factor)'
        : 'Cloud layers shield direct sunlight'
    },
    {
      id: 'uv-index',
      title: '4. UV Solar Index',
      value: advice.maxUvToday.toFixed(1),
      unit: 'UV Rating',
      subValue: advice.maxUvToday >= 8 
        ? 'Extreme UV Radiation' 
        : advice.maxUvToday >= 6 
        ? 'High UV (Parasol Advised)' 
        : advice.maxUvToday >= 3 
        ? 'Moderate Solar Intensity' 
        : 'Low UV Hazard',
      icon: Sun,
      iconColor: advice.maxUvToday >= 6 ? 'text-amber-400' : 'text-slate-400',
      badge: advice.maxUvToday >= 8 ? 'Extreme UV' : advice.maxUvToday >= 6 ? 'High UV' : 'Safe UV',
      badgeClass: advice.maxUvToday >= 6 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-white/5',
      desc: advice.maxUvToday >= 6 
        ? 'Intense solar radiation causes skin damage within 15–25 minutes. A UV-blocking parasol protects skin & eyes.'
        : 'Safe to mild UV radiation levels throughout the day.',
      umbrellaImpact: advice.maxUvToday >= 6.0 
        ? 'Directly triggers UV Sun Parasol recommendation' 
        : 'UV index is safe without dedicated sun umbrella'
    },
  ];

  return (
    <div id="weather-details-section" className="w-full rounded-3xl p-6 sm:p-8 glass border border-white/10 shadow-2xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-cyan-400">
            Core Decision Factors
          </p>
          <h3 className="text-2xl font-black text-white tracking-tight mt-0.5">
            The 4 Umbrella Determinants
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            The fundamental meteorological variables evaluated to determine whether you need a rain umbrella or UV sun parasol
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
            isHeavyRain 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
              : isParasol 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
          }`}>
            {isHeavyRain ? 'Heavy Rain Mode' : isParasol ? 'UV Sun Parasol Mode' : 'Standard Rain Mode'}
          </span>
        </div>
      </div>

      {/* 4 Focused Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {coreVariables.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="glass p-6 rounded-2xl flex flex-col justify-between min-h-[220px] border border-white/10 hover:border-cyan-400/30 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">
                    {card.title}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold border ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                </div>

                <div className="my-2 flex items-baseline gap-2">
                  <p className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono group-hover:text-cyan-300 transition-colors">
                    {card.value}
                  </p>
                </div>
                <p className="text-xs font-semibold text-slate-200 mt-1">{card.subValue}</p>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-1.5">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {card.desc}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400">
                  <Info className="w-3 h-3 shrink-0" />
                  <span className="truncate">{card.umbrellaImpact}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
