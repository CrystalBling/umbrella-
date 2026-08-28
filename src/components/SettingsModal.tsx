import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Thermometer, 
  Wind, 
  Droplets, 
  Clock, 
  Sliders, 
  Check,
  Bell,
  BellRing,
  Volume2,
  Umbrella
} from 'lucide-react';
import { UserPreferences, TemperatureUnit, WindUnit, RainUnit } from '../types';
import { notificationService } from '../utils/notificationService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefs: UserPreferences;
  onUpdatePrefs: (updated: Partial<UserPreferences>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  prefs,
  onUpdatePrefs,
}) => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    if (isOpen) {
      setNotificationPermission(notificationService.getPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTogglePush = async () => {
    if (notificationPermission !== 'granted') {
      const res = await notificationService.requestPermission();
      setNotificationPermission(res);
      if (res === 'granted') {
        onUpdatePrefs({ enableBrowserPush: true });
        notificationService.sendNotification('☔ Umbrella Alerts Enabled', {
          body: 'You will receive notifications whenever rain probability exceeds the configured threshold.',
        });
      }
    } else {
      const nextVal = !(prefs.enableBrowserPush ?? true);
      onUpdatePrefs({ enableBrowserPush: nextVal });
    }
  };

  const handleTestChime = () => {
    notificationService.playAlertChime();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">App Preferences</h3>
                <p className="text-xs text-slate-400">Configure units and forecast risk sensitivity</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Rain Threshold & Notifications */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-cyan-400" /> Umbrella Alerts & Prompts (&gt;50%)
                </label>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automatically prompt and notify you whenever the need for an umbrella exceeds the threshold.
              </p>

              {/* Threshold Selector */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1.5">
                  Rain Probability Trigger Threshold:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 35, label: '35% (Early)' },
                    { val: 50, label: '50% (Default)' },
                    { val: 65, label: '65% (Heavy)' }
                  ].map((t) => (
                    <button
                      key={t.val}
                      onClick={() => onUpdatePrefs({ highRainThreshold: t.val })}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        (prefs.highRainThreshold ?? 50) === t.val
                          ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification & Sound Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleTogglePush}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    (prefs.enableBrowserPush ?? true) && notificationPermission === 'granted'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BellRing className="w-3.5 h-3.5 text-cyan-400" />
                    <span>System Push Alerts</span>
                  </div>
                  {(prefs.enableBrowserPush ?? true) && notificationPermission === 'granted' && (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>

                <button
                  onClick={() => {
                    const nextSound = !(prefs.enableSoundAlert ?? true);
                    onUpdatePrefs({ enableSoundAlert: nextSound });
                    if (nextSound) handleTestChime();
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    prefs.enableSoundAlert ?? true
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Alert Chime Sound</span>
                  </div>
                  {(prefs.enableSoundAlert ?? true) && (
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Sensitivity Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Umbrella Recommendation Sensitivity
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Controls how early the app urges you to carry an umbrella:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cautious', label: 'Cautious', desc: 'Rain chance > 20%' },
                  { id: 'standard', label: 'Standard', desc: 'Rain chance > 35%' },
                  { id: 'relaxed', label: 'Relaxed', desc: 'Rain chance > 50%' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onUpdatePrefs({ umbrellaSensitivity: s.id as any })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      prefs.umbrellaSensitivity === s.id
                        ? 'bg-sky-500/20 border-sky-500/50 text-white'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold block mb-0.5">{s.label}</span>
                    <span className="text-[10px] text-slate-400 block">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Unit */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5" /> Temperature Scale
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdatePrefs({ tempUnit: 'celsius' })}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${
                    prefs.tempUnit === 'celsius'
                      ? 'bg-sky-500/20 border-sky-500/50 text-white'
                      : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Celsius (°C)</span>
                  {prefs.tempUnit === 'celsius' && <Check className="w-4 h-4 text-sky-400" />}
                </button>
                <button
                  onClick={() => onUpdatePrefs({ tempUnit: 'fahrenheit' })}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${
                    prefs.tempUnit === 'fahrenheit'
                      ? 'bg-sky-500/20 border-sky-500/50 text-white'
                      : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Fahrenheit (°F)</span>
                  {prefs.tempUnit === 'fahrenheit' && <Check className="w-4 h-4 text-sky-400" />}
                </button>
              </div>
            </div>

            {/* Wind Unit */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5" /> Wind Speed Units
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['kmh', 'mph', 'ms'] as WindUnit[]).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => onUpdatePrefs({ windUnit: unit })}
                    className={`p-3 rounded-2xl border text-center text-xs font-semibold uppercase transition-all ${
                      prefs.windUnit === unit
                        ? 'bg-sky-500/20 border-sky-500/50 text-white'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {unit === 'kmh' ? 'km/h' : unit === 'mph' ? 'mph' : 'm/s'}
                  </button>
                ))}
              </div>
            </div>

            {/* Precipitation Unit */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" /> Rain Volume Units
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdatePrefs({ rainUnit: 'mm' })}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${
                    prefs.rainUnit === 'mm'
                      ? 'bg-sky-500/20 border-sky-500/50 text-white'
                      : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Millimeters (mm)</span>
                  {prefs.rainUnit === 'mm' && <Check className="w-4 h-4 text-sky-400" />}
                </button>
                <button
                  onClick={() => onUpdatePrefs({ rainUnit: 'inch' })}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${
                    prefs.rainUnit === 'inch'
                      ? 'bg-sky-500/20 border-sky-500/50 text-white'
                      : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Inches (in)</span>
                  {prefs.rainUnit === 'inch' && <Check className="w-4 h-4 text-sky-400" />}
                </button>
              </div>
            </div>

            {/* Time Format */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Time Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdatePrefs({ timeFormat24h: true })}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${
                    prefs.timeFormat24h
                      ? 'bg-sky-500/20 border-sky-500/50 text-white'
                      : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>24-Hour (14:00)</span>
                  {prefs.timeFormat24h && <Check className="w-4 h-4 text-sky-400" />}
                </button>
                <button
                  onClick={() => onUpdatePrefs({ timeFormat24h: false })}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${
                    !prefs.timeFormat24h
                      ? 'bg-sky-500/20 border-sky-500/50 text-white'
                      : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>12-Hour (2:00 PM)</span>
                  {!prefs.timeFormat24h && <Check className="w-4 h-4 text-sky-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/60 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
