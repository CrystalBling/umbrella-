import React from 'react';
import { motion } from 'motion/react';
import { 
  UmbrellaAdvice, 
  LocationInfo, 
  WeatherApiResponse, 
  UserPreferences,
  CommutePeriod
} from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Wind, 
  Sun, 
  Droplets, 
  Clock, 
  Sparkles, 
  Compass,
  AlertTriangle,
  Umbrella,
  CloudRain,
  SunMedium,
  Zap,
  Info
} from 'lucide-react';
import { formatTemp, formatPrecip, formatWind } from '../services/weatherService';

interface VerdictHeroProps {
  advice: UmbrellaAdvice;
  location: LocationInfo;
  weather: WeatherApiResponse;
  prefs: UserPreferences;
}

export const VerdictHero: React.FC<VerdictHeroProps> = ({
  advice,
  location,
  weather,
  prefs,
}) => {
  const isRainVerdict = advice.verdict === 'definitely' || advice.verdict === 'likely';
  const isHeavyRain = advice.isHeavyRain || (isRainVerdict && advice.totalPrecipitationToday >= 3.0);
  const isMaybe = advice.verdict === 'maybe';
  const isParasol = advice.verdict === 'sun_parasol' || advice.isVerySunny || advice.maxUvToday >= 6.5;

  // Major Bold Typography verdict statement
  const verdictWord = isHeavyRain ? 'RAIN.' : isRainVerdict ? 'YES.' : isParasol ? 'SUN UV.' : isMaybe ? 'MAYBE.' : 'NO.';
  const verdictColorClass = isHeavyRain
    ? 'text-rose-400 drop-shadow-[0_0_35px_rgba(244,63,94,0.5)]'
    : isRainVerdict 
    ? 'text-rose-400 drop-shadow-[0_0_35px_rgba(244,63,94,0.4)]' 
    : isParasol 
    ? 'text-amber-400 drop-shadow-[0_0_35px_rgba(251,191,36,0.5)]' 
    : isMaybe 
    ? 'text-cyan-400 drop-shadow-[0_0_35px_rgba(6,182,212,0.4)]' 
    : 'text-emerald-400 drop-shadow-[0_0_35px_rgba(52,211,153,0.4)]';

  const current = weather.current;
  const currentUv = advice.currentUvIndex || advice.maxUvToday;

  return (
    <div id="verdict-hero-section" className="relative w-full rounded-3xl p-6 sm:p-10 glass-panel shadow-2xl border border-white/10 overflow-hidden mb-6">
      {/* Background ambient glowing gradient */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-80 rounded-full blur-[140px] pointer-events-none opacity-25 transition-all duration-700"
        style={{ background: isHeavyRain ? 'rgba(225, 29, 72, 0.4)' : isParasol ? 'rgba(245, 158, 11, 0.4)' : advice.badgeColor.glow }}
      />

      {/* Vertical Metadata Accent from Theme */}
      <div className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none select-none">
        <p className="vertical-text text-[10px] uppercase tracking-[0.5em] font-black text-slate-400">
          Umbrella Cast v4.2
        </p>
      </div>

      {/* Main Center Recommendation Display */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center py-2 sm:py-4">
        <p className="text-xs sm:text-sm uppercase tracking-[0.4em] mb-2 text-cyan-400 font-bold">
          {isParasol ? 'Solar Shield Assessment' : isHeavyRain ? 'Downpour & Storm Alert' : 'The Recommendation is'}
        </p>
        
        {/* Massive Bold Headline Word */}
        <motion.h1 
          key={verdictWord}
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 120 }}
          className={`huge-text select-none text-white tracking-tighter ${verdictColorClass}`}
        >
          {verdictWord}
        </motion.h1>

        {/* Dynamic Context Glass Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-2 sm:mt-4 glass px-5 sm:px-8 py-2.5 rounded-full inline-flex flex-wrap items-center justify-center gap-2 max-w-2xl border border-white/15 text-center"
        >
          <p className="text-sm sm:text-lg tracking-tight font-medium text-slate-200">
            {advice.verdictTitle} — <span className="text-cyan-400 font-bold">{advice.detailedAnalysis.split('.')[0]}.</span>
          </p>
          {weather.dataSource && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              {weather.dataSource}
            </span>
          )}
        </motion.div>
      </div>

      {/* CALCULATED % FOR NEED OF AN UMBRELLA (BIG DISPLAY & RAIN VS SUN POSSIBILITY) */}
      <div className="relative z-10 my-6 p-6 sm:p-8 rounded-3xl bg-slate-950/70 border border-cyan-500/30 backdrop-blur-xl shadow-2xl shadow-cyan-950/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Main Huge Calculated Percentage Column */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left justify-center border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 mb-2">
              <Umbrella className="w-3.5 h-3.5 text-cyan-400" />
              <span>Calculated Umbrella Need</span>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 12 }}
                className={`text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tighter leading-none ${
                  advice.overallUmbrellaNeedPercent >= 70 
                    ? 'text-rose-400 drop-shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                    : advice.overallUmbrellaNeedPercent >= 50
                    ? 'text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.4)]'
                    : advice.overallUmbrellaNeedPercent >= 25
                    ? 'text-cyan-300 drop-shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                    : 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                }`}
              >
                {advice.overallUmbrellaNeedPercent}
              </motion.span>
              <span className="text-3xl sm:text-4xl font-black text-slate-400 font-mono">%</span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                advice.overallUmbrellaNeedPercent >= 75
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : advice.overallUmbrellaNeedPercent >= 50
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : advice.overallUmbrellaNeedPercent >= 25
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {advice.possibilityLabel} Possibility
              </span>

              {advice.overallUmbrellaNeedPercent > 50 && (
                <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" /> &gt;50% Alert Active
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-2 max-w-sm">
              Overall possibility of needing an umbrella today, factoring in both <strong>Rain Precipitation</strong> and <strong>Solar UV Radiation</strong>.
            </p>
          </div>

          {/* Dual Possibility Breakdown: Rain vs Sun/UV */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-cyan-400" /> Possibility Breakdown (Rain & Sun)
              </h4>
              <span className="text-[11px] font-medium text-slate-400">
                50% threshold marked
              </span>
            </div>

            {/* 1. Rain Protection Probability Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">1. Rain Protection Need</span>
                  {advice.isRainingNow && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse">
                      Active Rain
                    </span>
                  )}
                </div>
                <span className="font-mono text-base font-black text-cyan-300">
                  {advice.rainNeedPercent}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                {/* 50% Threshold marker line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40 z-10" title="50% Alert Threshold" />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, advice.rainNeedPercent)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    advice.rainNeedPercent >= 60 
                      ? 'bg-gradient-to-r from-cyan-500 to-rose-500' 
                      : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Peak Rain Chance: <strong className="text-slate-200">{advice.maxRainChanceToday}%</strong></span>
                <span>Volume: <strong className="text-slate-200">{formatPrecip(advice.totalPrecipitationToday, prefs.rainUnit)}</strong></span>
                <span>{advice.rainStartTime ? `Starts ~${advice.rainStartTime}` : 'No rain window'}</span>
              </div>
            </div>

            {/* 2. Sun / UV Parasol Protection Probability Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SunMedium className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">2. Sun & UV Parasol Need</span>
                  {advice.maxUvToday >= 7 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/30 text-amber-300 border border-amber-500/40">
                      High UV Shield
                    </span>
                  )}
                </div>
                <span className="font-mono text-base font-black text-amber-300">
                  {advice.sunNeedPercent}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                {/* 50% Threshold marker line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40 z-10" title="50% Alert Threshold" />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, advice.sunNeedPercent)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                  className={`h-full rounded-full ${
                    advice.sunNeedPercent >= 60 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                      : 'bg-gradient-to-r from-amber-600 to-yellow-400'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Peak Solar UV: <strong className="text-amber-300">{advice.maxUvToday.toFixed(1)} UV</strong></span>
                <span>Cloud Cover: <strong className="text-slate-200">{advice.cloudCover}%</strong></span>
                <span>{advice.maxUvToday >= 8 ? 'Extreme UV Shield Needed' : advice.maxUvToday >= 6 ? 'High UV Parasol Advised' : 'Safe Solar Levels'}</span>
              </div>
            </div>

            {/* Factor Outcome Callout */}
            <div className={`px-4 py-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              advice.primaryNeedFactor === 'both'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : advice.primaryNeedFactor === 'rain'
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                : advice.primaryNeedFactor === 'sun'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}>
              <Umbrella className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>
                {advice.primaryNeedFactor === 'both' ? (
                  <><strong>Dual Protection Needed:</strong> You will need an umbrella for both intense daytime UV radiation and afternoon/evening rain showers.</>
                ) : advice.primaryNeedFactor === 'rain' ? (
                  <><strong>Rain Protection Driven:</strong> Precipitation probability ({advice.rainNeedPercent}%) is the primary reason to carry an umbrella today.</>
                ) : advice.primaryNeedFactor === 'sun' ? (
                  <><strong>Solar UV Protection Driven:</strong> High UV index ({advice.maxUvToday.toFixed(1)}) requires a UV-blocking parasol or umbrella to shield your skin.</>
                ) : (
                  <><strong>Clear & Low UV:</strong> Skies are dry and solar radiation is safe today. Minimal need for an umbrella.</>
                )}
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* Visual & Gear Bar + Dynamic Vector Umbrella */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-6 pt-6 border-t border-white/10">
        {/* Left Side: Animated SVG Umbrella & Risk Status */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56">
            {/* Ambient Background Aura */}
            <div 
              className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
                isHeavyRain 
                  ? 'bg-rose-500/15 animate-pulse blur-xl' 
                  : isParasol 
                  ? 'bg-amber-400/20 animate-pulse blur-xl' 
                  : 'border border-white/5'
              }`} 
            />
            
            {/* Animated SVG Umbrella with Dedicated Heavy Rain / Very Sunny States */}
            <motion.div
              initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 120 }}
              className="relative z-10 filter drop-shadow-2xl"
            >
              <svg 
                viewBox="0 0 220 220" 
                className="w-44 h-44 sm:w-52 sm:h-52 transform transition-transform hover:scale-105 duration-300 overflow-visible"
              >
                <defs>
                  {/* Heavy Rain Canopy Gradient */}
                  <linearGradient id="heavyRainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="40%" stopColor="#be123c" />
                    <stop offset="100%" stopColor="#881337" />
                  </linearGradient>

                  {/* Standard Rain Canopy Gradient */}
                  <linearGradient id="standardRainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>

                  {/* Very Sunny / UV Parasol Canopy Gradient */}
                  <linearGradient id="parasolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="35%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>

                  {/* Safe / No Umbrella Gradient */}
                  <linearGradient id="safeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>

                  <linearGradient id="canopySheen" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>

                  <linearGradient id="shaftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="50%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#64748b" />
                  </linearGradient>

                  {/* Solar Ray Glow */}
                  <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* 1. VERY SUNNY / HIGH UV: RADIANT ROTATING SUNBURST BACKGROUND */}
                {isParasol && (
                  <g className="origin-[110px_60px]">
                    {/* Rotating Sun Rays */}
                    <motion.g
                      animate={{ rotate: 360 }}
                      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    >
                      <circle cx="110" cy="60" r="45" fill="url(#sunGlow)" />
                      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                        <line
                          key={i}
                          x1="110"
                          y1="60"
                          x2={110 + 65 * Math.cos((angle * Math.PI) / 180)}
                          y2={60 + 65 * Math.sin((angle * Math.PI) / 180)}
                          stroke="#fbbf24"
                          strokeWidth={i % 2 === 0 ? "3" : "1.5"}
                          strokeLinecap="round"
                          opacity={i % 2 === 0 ? "0.85" : "0.5"}
                        />
                      ))}
                    </motion.g>

                    {/* Solar Shimmer Particles */}
                    <motion.circle
                      cx="65" cy="40" r="2.5" fill="#fde047"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.circle
                      cx="155" cy="45" r="2" fill="#fde047"
                      animate={{ scale: [1, 2, 1], opacity: [0.3, 0.9, 0.3] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.circle
                      cx="110" cy="18" r="3" fill="#ffffff"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
                    />
                  </g>
                )}

                {/* 2. HEAVY RAIN: CASCADING RAIN STREAKS & BOUNCE SPLASHES */}
                {isHeavyRain && (
                  <g className="overflow-visible">
                    {/* Torrential Rain Streaks hitting & passing the canopy */}
                    {[-40, -20, 0, 20, 40, -30, 30].map((xOffset, i) => (
                      <motion.line
                        key={`heavy-rain-${i}`}
                        x1={110 + xOffset - 12}
                        y1="10"
                        x2={110 + xOffset}
                        y2="85"
                        stroke="#7dd3fc"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        animate={{
                          y1: [0, 85],
                          y2: [35, 120],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.55 + (i % 3) * 0.15,
                          delay: (i * 0.1) % 0.6,
                          ease: "linear"
                        }}
                      />
                    ))}

                    {/* Water Splash Ripples Bouncing off Canopy */}
                    <motion.circle
                      cx="95" cy="72" r="3" fill="#bae6fd"
                      animate={{ cy: [72, 58], cx: [95, 85], opacity: [1, 0], scale: [1, 1.5] }}
                      transition={{ repeat: Infinity, duration: 0.7, ease: "easeOut" }}
                    />
                    <motion.circle
                      cx="125" cy="74" r="3" fill="#bae6fd"
                      animate={{ cy: [74, 60], cx: [125, 138], opacity: [1, 0], scale: [1, 1.5] }}
                      transition={{ repeat: Infinity, duration: 0.65, delay: 0.2, ease: "easeOut" }}
                    />
                    <motion.circle
                      cx="110" cy="65" r="2.5" fill="#ffffff"
                      animate={{ cy: [65, 50], opacity: [1, 0], scale: [1, 1.3] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    />

                    {/* Drips falling from umbrella edges */}
                    <motion.circle
                      cx="42" cy="115" r="2" fill="#7dd3fc"
                      animate={{ cy: [115, 175], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: 0.1, ease: "easeIn" }}
                    />
                    <motion.circle
                      cx="178" cy="115" r="2" fill="#7dd3fc"
                      animate={{ cy: [115, 175], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.85, delay: 0.4, ease: "easeIn" }}
                    />
                  </g>
                )}

                {/* 3. MODERATE / LIGHT RAIN DROPLETS */}
                {!isHeavyRain && (isRainVerdict || isMaybe) && (
                  <g className="opacity-80">
                    <motion.circle 
                      animate={{ cy: [20, 75, 65], cx: [90, 88, 75], opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeIn" }}
                      r="2" fill="#7dd3fc" 
                    />
                    <motion.circle 
                      animate={{ cy: [15, 82, 70], cx: [130, 132, 145], opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.4, delay: 0.3, ease: "easeIn" }}
                      r="2.5" fill="#7dd3fc" 
                    />
                    <motion.circle 
                      animate={{ cy: [10, 72, 60], cx: [110, 110, 110], opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.0, delay: 0.6, ease: "easeIn" }}
                      r="2" fill="#7dd3fc" 
                    />
                  </g>
                )}

                {/* UMBRELLA CANOPY */}
                <path 
                  d="M 35 110 Q 110 32 185 110 Q 160 102 135 110 Q 110 102 85 110 Q 60 102 35 110 Z" 
                  fill={
                    isHeavyRain 
                      ? "url(#heavyRainGrad)" 
                      : isParasol 
                      ? "url(#parasolGrad)" 
                      : (isRainVerdict || isMaybe) 
                      ? "url(#standardRainGrad)" 
                      : "url(#safeGrad)"
                  }
                  stroke={isParasol ? "#fef08a" : isHeavyRain ? "#fda4af" : "rgba(255,255,255,0.3)"}
                  strokeWidth={isHeavyRain || isParasol ? "2" : "1.5"}
                />

                {/* Canopy Rib Structural Lines */}
                <path d="M 110 34 Q 85 70 85 110" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
                <path d="M 110 34 Q 135 70 135 110" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
                <path d="M 110 34 L 110 110" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />

                {/* UV Shield Reflective Line for Parasol */}
                {isParasol && (
                  <path 
                    d="M 45 102 Q 110 44 175 102" 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="1.8" 
                    strokeDasharray="4 3" 
                    opacity="0.8" 
                  />
                )}

                {/* Canopy Top Sheen */}
                <path 
                  d="M 45 105 Q 110 42 175 105 Q 155 80 110 60 Q 65 80 45 105 Z" 
                  fill="url(#canopySheen)"
                />

                {/* Umbrella Tip / Finial */}
                <path d="M 108 34 L 112 34 L 110 22 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="0.5" />

                {/* Umbrella Central Shaft */}
                <rect x="108.5" y="95" width="3" height="70" rx="1.5" fill="url(#shaftGrad)" />

                {/* Umbrella Curved Handle */}
                <path 
                  d="M 110 165 Q 110 188 126 188 Q 140 188 140 176" 
                  fill="none" 
                  stroke="url(#shaftGrad)" 
                  strokeWidth="4.5" 
                  strokeLinecap="round" 
                />
              </svg>
            </motion.div>
          </div>

          {/* Condition Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${advice.badgeColor.bg} ${advice.badgeColor.text} ${advice.badgeColor.border}`}>
              {isHeavyRain ? 'HEAVY RAIN WARNING' : isParasol ? 'HIGH UV SUN SHIELD' : advice.verdictBadge}
            </span>
            {advice.isRainingNow && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                Active Rain
              </span>
            )}
            {isParasol && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40">
                UV {advice.maxUvToday.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Recommended Gear & Commute Windows */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div className="glass p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                isHeavyRain 
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                  : isParasol 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              }`}>
                {isParasol ? (
                  <Sun className="w-6 h-6 text-amber-400" />
                ) : isHeavyRain ? (
                  <Droplets className="w-6 h-6 text-rose-400" />
                ) : advice.recommendedUmbrellaType === 'Windproof Heavy-Duty' ? (
                  <Wind className="w-6 h-6 text-rose-400" />
                ) : (
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">
                  Recommended Equipment
                </p>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {advice.recommendedUmbrellaType}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 max-w-md">
                  {advice.umbrellaTypeReason}
                </p>
              </div>
            </div>

            {/* Core variable quick pill: Rain mm or UV index */}
            <div className="shrink-0 glass-subtle px-4 py-2.5 rounded-xl border border-white/10 text-right self-stretch sm:self-auto flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                {advice.totalPrecipitationToday > 0 ? 'Rain Volume' : 'Peak UV Index'}
              </span>
              <span className={`text-base font-black font-mono ${advice.totalPrecipitationToday > 0 ? 'text-cyan-300' : 'text-amber-300'}`}>
                {advice.totalPrecipitationToday > 0 
                  ? formatPrecip(advice.totalPrecipitationToday, prefs.rainUnit) 
                  : `${advice.maxUvToday.toFixed(1)} UV`}
              </span>
            </div>
          </div>

          {/* Commute Windows Quick Grid */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-cyan-400" /> Commute Windows
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Hourly Risk</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Object.entries(advice.commuteSummary) as [string, CommutePeriod][]).map(([key, item]) => {
                const isCommuteRain = item.verdict === 'rain';
                const isCommuteChance = item.verdict === 'chance';

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCommuteRain
                        ? 'glass bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : isCommuteChance
                        ? 'glass bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : 'glass border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                        {item.name.replace(' Commute', '').replace(' & Lunch', '').replace(' & Dinner', '')}
                      </span>
                      <span className={`font-mono text-xs font-black ${
                        isCommuteRain ? 'text-rose-400' : isCommuteChance ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {item.rainProb}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                      <span>{item.timeLabel.split('–')[0].trim()}</span>
                      <span className="font-semibold">{item.verdict === 'rain' ? '☔ Rain' : item.verdict === 'chance' ? '🌦️ Spotty' : '☀️ Dry'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Determinant Variables for Needing an Umbrella */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
        {/* Variable 1: Rainfall / Rain Likelihood */}
        <div className="glass p-5 rounded-2xl flex flex-col justify-between min-h-[130px] border border-white/10 hover:border-cyan-400/30 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-black text-slate-300">
              1. Rain Likelihood
            </p>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
              {advice.maxRainChanceToday}<span className="text-base opacity-50 font-normal">%</span>
            </p>
            <p className="text-[11px] opacity-75 mt-1 text-cyan-300 font-medium truncate">
              {advice.isRainingNow ? 'Active rain right now' : advice.maxRainChanceToday > 60 ? 'Heavy rain probable' : advice.maxRainChanceToday > 25 ? 'Spotty showers' : 'Dry forecast'}
            </p>
          </div>
        </div>

        {/* Variable 2: Rain (mm) / Precipitation Volume */}
        <div className="glass p-5 rounded-2xl flex flex-col justify-between min-h-[130px] border border-white/10 hover:border-cyan-400/30 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-black text-slate-300">
              2. Rain Volume (mm)
            </p>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
              {formatPrecip(advice.totalPrecipitationToday, prefs.rainUnit)}
            </p>
            <p className="text-[11px] opacity-75 mt-1 text-slate-300 font-medium truncate">
              {advice.totalPrecipitationToday >= 5 ? 'Heavy downpours' : advice.totalPrecipitationToday >= 1 ? 'Moderate accumulation' : 'Minimal / dry'}
            </p>
          </div>
        </div>

        {/* Variable 3: Cloud Cover (%) */}
        <div className="glass p-5 rounded-2xl flex flex-col justify-between min-h-[130px] border border-white/10 hover:border-cyan-400/30 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-black text-slate-300">
              3. Cloud Cover
            </p>
            <span className="text-[10px] font-bold text-slate-400 font-mono">{current.cloud_cover > 75 ? 'Dense' : 'Open'}</span>
          </div>
          <div className="mt-2">
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
              {current.cloud_cover}<span className="text-base opacity-50 font-normal">%</span>
            </p>
            <p className="text-[11px] opacity-75 mt-1 text-slate-300 font-medium truncate">
              {current.cloud_cover > 75 ? 'Overcast skies' : current.cloud_cover > 40 ? 'Partly cloudy' : 'Clear open sky'}
            </p>
          </div>
        </div>

        {/* Variable 4: UV Index (Solar Umbrella / Parasol Factor) */}
        <div className={`glass p-5 rounded-2xl flex flex-col justify-between min-h-[130px] border transition-all ${
          isParasol ? 'border-amber-400/50 bg-amber-500/10' : 'border-white/10 hover:border-amber-400/30'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-black text-slate-300">
              4. UV Solar Index
            </p>
            <Sun className={`w-4 h-4 ${advice.maxUvToday >= 6 ? 'text-amber-400' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2">
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
              {advice.maxUvToday.toFixed(1)}
            </p>
            <p className={`text-[11px] font-bold mt-1 truncate ${
              advice.maxUvToday >= 8 ? 'text-amber-300 font-black' : advice.maxUvToday >= 6 ? 'text-amber-400' : 'text-slate-300'
            }`}>
              {advice.maxUvToday >= 8 ? 'Extreme UV (Parasol)' : advice.maxUvToday >= 6 ? 'High UV (Parasol)' : advice.maxUvToday >= 3 ? 'Moderate UV' : 'Low / safe'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
