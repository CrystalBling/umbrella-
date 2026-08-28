import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Umbrella, 
  AlertTriangle, 
  Bell, 
  BellRing, 
  X, 
  Clock, 
  CloudRain, 
  Sun,
  Volume2, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Zap
} from 'lucide-react';
import { UmbrellaAdvice, LocationInfo, UserPreferences } from '../types';
import { notificationService } from '../utils/notificationService';

interface UmbrellaAlertPromptProps {
  advice: UmbrellaAdvice | null;
  location: LocationInfo;
  prefs: UserPreferences;
  onOpenGuide: () => void;
  onDismiss: () => void;
  isOpen: boolean;
  onUpdatePrefs: (updated: Partial<UserPreferences>) => void;
}

export const UmbrellaAlertPrompt: React.FC<UmbrellaAlertPromptProps> = ({
  advice,
  location,
  prefs,
  onOpenGuide,
  onDismiss,
  isOpen,
  onUpdatePrefs,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [isRequestingPush, setIsRequestingPush] = useState(false);
  const [pushSuccessMsg, setPushSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setPermissionStatus(notificationService.getPermission());
  }, []);

  if (!isOpen || !advice) return null;

  const umbrellaNeedPercent = advice.overallUmbrellaNeedPercent ?? Math.max(advice.maxRainChanceToday, advice.riskScore);
  const threshold = prefs.highRainThreshold ?? 50;
  const isSunDriven = advice.primaryNeedFactor === 'sun';
  const isDualDriven = advice.primaryNeedFactor === 'both';

  const handleRequestPush = async () => {
    setIsRequestingPush(true);
    const result = await notificationService.requestPermission();
    setPermissionStatus(result);
    setIsRequestingPush(false);

    if (result === 'granted') {
      onUpdatePrefs({ enableBrowserPush: true });
      notificationService.sendNotification(
        `☔ Umbrella Required for ${location.name} (${umbrellaNeedPercent}% Need)`,
        {
          body: `${isSunDriven ? 'High Solar UV' : isDualDriven ? 'Rain & UV Sun Protection' : 'High Rain Probability'} detected. Recommended gear: ${advice.recommendedUmbrellaType}.`,
        }
      );
      setPushSuccessMsg('Browser push alerts enabled!');
      setTimeout(() => setPushSuccessMsg(null), 3500);
    }
  };

  const handlePlayChime = () => {
    notificationService.playAlertChime();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full mb-6 z-20"
      >
        <div className={`relative overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-xl p-4 sm:p-6 ${
          isSunDriven 
            ? 'bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-yellow-950/90 border-amber-500/40' 
            : 'bg-gradient-to-r from-cyan-950/90 via-slate-900/95 to-sky-950/90 border-cyan-500/40'
        }`}>
          {/* Subtle Ambient Water/Sun Ripple Glow Effect */}
          <div className={`absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isSunDriven ? 'bg-amber-500/15' : 'bg-cyan-500/15'
          }`} />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Left: Icon & High-Contrast Probability Alert */}
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1">
              <div className="relative shrink-0">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center shadow-lg ${
                  isSunDriven 
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-amber-950/50'
                    : 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-cyan-950/50'
                }`}>
                  {isSunDriven ? (
                    <Sun className="w-6 h-6 sm:w-7 sm:h-7 animate-spin-slow" />
                  ) : (
                    <Umbrella className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce" />
                  )}
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isSunDriven ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-4 w-4 items-center justify-center text-[9px] font-black text-slate-950 ${
                    isSunDriven ? 'bg-amber-400' : 'bg-cyan-500'
                  }`}>!</span>
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                    isSunDriven ? 'bg-amber-400 text-slate-950' : 'bg-cyan-500 text-slate-950'
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                    Umbrella Alert ({umbrellaNeedPercent}% &gt; {threshold}%)
                  </span>

                  {/* Factor Badges */}
                  {isDualDriven ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-500/20 text-amber-200 border border-amber-500/30">
                      🌧️ Rain & ☀️ UV Dual Protection
                    </span>
                  ) : isSunDriven ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-500/20 text-amber-200 border border-amber-500/30">
                      ☀️ Solar UV Shield ({advice.maxUvToday.toFixed(1)} UV)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
                      🌧️ Rain Protection ({advice.rainNeedPercent}%)
                    </span>
                  )}

                  {advice.isRainingNow && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 animate-pulse">
                      <CloudRain className="w-3 h-3" /> Active Rain Now
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    in <strong className="text-slate-200">{location.name}</strong>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  Umbrella Need Exceeds {threshold}% ({umbrellaNeedPercent}%) — Grab Your Umbrella!
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {advice.rainStartTime ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-cyan-300 mr-1.5">
                      <Clock className="w-3.5 h-3.5" /> Rain expected around {advice.rainStartTime}.
                    </span>
                  ) : null}
                  {advice.maxUvToday >= 6 && (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-300 mr-1.5">
                      <Sun className="w-3.5 h-3.5" /> Peak UV index {advice.maxUvToday.toFixed(1)} requires solar shielding.
                    </span>
                  )}
                  Recommended gear: <strong className="text-white underline decoration-cyan-400/50">{advice.recommendedUmbrellaType}</strong>. {advice.summary}
                </p>
              </div>
            </div>

            {/* Right: Interactive Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
              {/* Push Notification Toggle Button */}
              {permissionStatus !== 'granted' ? (
                <button
                  onClick={handleRequestPush}
                  disabled={isRequestingPush}
                  title="Enable browser system push notifications"
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <BellRing className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isRequestingPush ? 'Enabling...' : 'Enable Push Alerts'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    notificationService.sendNotification(`☔ Test Umbrella Alert`, {
                      body: `System notifications active for ${location.name} (${umbrellaNeedPercent}% umbrella need).`,
                    });
                    setPushSuccessMsg('Test notification sent!');
                    setTimeout(() => setPushSuccessMsg(null), 3000);
                  }}
                  title="System push notifications active"
                  className="px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Push Active</span>
                </button>
              )}

              {/* Chime Sound Trigger */}
              <button
                onClick={handlePlayChime}
                title="Play alert chime"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {/* View Gear Guide */}
              <button
                onClick={onOpenGuide}
                title="View umbrella selection guide"
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-medium transition-colors flex items-center gap-1"
              >
                <span>Guide</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Dismiss Prompt */}
              <button
                onClick={onDismiss}
                title="Dismiss alert prompt"
                className={`px-3.5 py-2 rounded-xl text-slate-950 text-xs font-black transition-all flex items-center gap-1 active:scale-95 shadow-md ${
                  isSunDriven ? 'bg-amber-400 hover:bg-amber-300 shadow-amber-950/40' : 'bg-cyan-400 hover:bg-cyan-300 shadow-cyan-950/40'
                }`}
              >
                <span>Got It</span>
                <X className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>

          {/* Optional push success toast line */}
          {pushSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-xs text-emerald-300 font-semibold flex items-center gap-1.5 pt-2 border-t border-white/10"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{pushSuccessMsg}</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
