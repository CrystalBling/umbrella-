import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Wind, 
  Sun, 
  Droplets, 
  ShieldCheck, 
  Sparkles, 
  Layers,
  ChevronRight
} from 'lucide-react';

interface UmbrellaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UmbrellaGuideModal: React.FC<UmbrellaGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const guides = [
    {
      title: 'Windproof Heavy-Duty Umbrella',
      category: 'Gusts & Storms (> 35 km/h)',
      icon: Wind,
      iconColor: 'text-rose-400',
      bgClass: 'bg-rose-500/10 border-rose-500/20',
      description: 'Features double-canopy wind vents and flexible fiberglass ribs that release air pressure, preventing the canopy from flipping inside out during turbulent storm gusts.',
      bestFor: 'Typhoons, seaside coastal walks, thunder squalls, heavy gale winds.'
    },
    {
      title: 'Compact Foldable Pocket Umbrella',
      category: 'Everyday Commutes (< 300g)',
      icon: Layers,
      iconColor: 'text-sky-400',
      bgClass: 'bg-sky-500/10 border-sky-500/20',
      description: 'Collapses to under 25cm to stash effortlessly into handbags, briefcases, or backpacks. Perfect insurance for isolated passing showers and unpredictably cloudy days.',
      bestFor: 'Daily subway commutes, spotty showers, office carry-on.'
    },
    {
      title: 'Classic Full-Size Stick Umbrella',
      category: 'Sustained Heavy Downpours',
      icon: Droplets,
      iconColor: 'text-blue-400',
      bgClass: 'bg-blue-500/10 border-blue-500/20',
      description: 'Uncompromising 110–130cm canopy diameter delivering complete shoulder-to-toe dry coverage with robust central shaft stability and an ergonomic hook handle.',
      bestFor: 'Continuous rainstorms, walking with luggage, shared walking.'
    },
    {
      title: 'UV-Blocking Sun Parasol',
      category: 'High Solar Index (UV 7+)',
      icon: Sun,
      iconColor: 'text-amber-400',
      bgClass: 'bg-amber-500/10 border-amber-500/20',
      description: 'Equipped with opaque black titanium/vinyl undercoating with UPF 50+ certification. Blocks 99% of UVA/UVB rays and lowers felt temperature beneath the canopy by 3–5°C.',
      bestFor: 'Summer midday walks, intense solar heat, skincare preservation.'
    },
  ];

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
          className="relative w-full max-w-2xl rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">Umbrella & Gear Guide</h3>
                <p className="text-xs text-slate-400">How to choose the ideal protection for every forecast</p>
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
          <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
            {guides.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl border ${item.bgClass} transition-all`}
                >
                  <div className="flex items-start gap-3.5 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-center shrink-0">
                      <Icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-950/60 text-slate-300 border border-white/10">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Ideal for:</span>
                    <span>{item.bestFor}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
            <span>Tip: Check the wind gauge before leaving with a lightweight umbrella.</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
