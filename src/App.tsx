import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  LocationInfo, 
  WeatherApiResponse, 
  UmbrellaAdvice, 
  UserPreferences,
  HourlyForecastItem,
  DailyForecastItem
} from './types';
import { 
  POPULAR_LOCATIONS, 
  fetchWeatherData, 
  analyzeUmbrellaDecision, 
  getProcessedHourly, 
  getProcessedDaily, 
  reverseGeocode 
} from './services/weatherService';
import { rainSound } from './utils/rainSound';

import { WeatherBackground } from './components/WeatherBackground';
import { Header } from './components/Header';
import { VerdictHero } from './components/VerdictHero';
import { HourlyPrecipitationTimeline } from './components/HourlyPrecipitationTimeline';
import { CommutePlanner } from './components/CommutePlanner';
import { DailyForecastCard } from './components/DailyForecastCard';
import { WeatherDetailsGrid } from './components/WeatherDetailsGrid';
import { LocationSearchModal } from './components/LocationSearchModal';
import { UmbrellaGuideModal } from './components/UmbrellaGuideModal';
import { SettingsModal } from './components/SettingsModal';
import { UmbrellaAlertPrompt } from './components/UmbrellaAlertPrompt';
import { DisqusComments } from './components/DisqusComments';
import { notificationService } from './utils/notificationService';

import { Loader2, AlertCircle, Sparkles, Umbrella } from 'lucide-react';

const DEFAULT_LOCATION: LocationInfo = POPULAR_LOCATIONS[0]; // Tokyo as default, will auto-detect GPS if allowed

export default function App() {
  const [location, setLocation] = useState<LocationInfo>(() => {
    try {
      const saved = localStorage.getItem('umbrella_cast_active_location');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('umbrella_cast_user_prefs');
      return saved ? JSON.parse(saved) : {
        tempUnit: 'celsius',
        windUnit: 'kmh',
        rainUnit: 'mm',
        timeFormat24h: true,
        umbrellaSensitivity: 'standard'
      };
    } catch {
      return {
        tempUnit: 'celsius',
        windUnit: 'kmh',
        rainUnit: 'mm',
        timeFormat24h: true,
        umbrellaSensitivity: 'standard'
      };
    }
  });

  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [advice, setAdvice] = useState<UmbrellaAdvice | null>(null);
  const [hourlyItems, setHourlyItems] = useState<HourlyForecastItem[]>([]);
  const [dailyItems, setDailyItems] = useState<DailyForecastItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlertPromptOpen, setIsAlertPromptOpen] = useState(false);

  // Modals & Sound
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // High umbrella need threshold evaluation (>50% by default, rain OR sun)
  const threshold = prefs.highRainThreshold ?? 50;
  const umbrellaNeed = advice ? (advice.overallUmbrellaNeedPercent ?? Math.max(advice.maxRainChanceToday, advice.riskScore)) : 0;
  const isHighUmbrellaRisk = Boolean(
    advice && (umbrellaNeed > threshold || advice.isRainingNow || advice.verdict === 'definitely' || advice.verdict === 'likely' || (advice.verdict === 'sun_parasol' && umbrellaNeed > threshold))
  );

  // Automated notification and prompt trigger effect when need > 50%
  useEffect(() => {
    if (!advice) return;
    const currentNeed = advice.overallUmbrellaNeedPercent ?? Math.max(advice.maxRainChanceToday, advice.riskScore);
    const trigThreshold = prefs.highRainThreshold ?? 50;
    const highRisk = currentNeed > trigThreshold || advice.isRainingNow || advice.verdict === 'definitely' || advice.verdict === 'likely';

    if (highRisk && (prefs.notifyOnHighRainRisk ?? true)) {
      setIsAlertPromptOpen(true);

      // Play gentle audio chime if enabled
      if (prefs.enableSoundAlert ?? true) {
        notificationService.playAlertChime();
      }

      // Dispatch desktop/mobile push notification if permitted
      if ((prefs.enableBrowserPush ?? true) && notificationService.getPermission() === 'granted') {
        const factorLabel = advice.primaryNeedFactor === 'sun' ? 'Solar UV Radiation' : advice.primaryNeedFactor === 'both' ? 'Rain & High UV' : 'Rain Probability';
        notificationService.sendNotification(
          `☔ Umbrella Alert for ${location.name} (${currentNeed}% Possibility)`,
          {
            body: `Possibility of needing an umbrella is ${currentNeed}% (>50% threshold). ${factorLabel}. Recommended: ${advice.recommendedUmbrellaType}.`,
          }
        );
      }
    }
  }, [advice, location.name, prefs.highRainThreshold, prefs.notifyOnHighRainRisk, prefs.enableSoundAlert, prefs.enableBrowserPush]);

  // Load weather data
  const loadWeather = useCallback(async (loc: LocationInfo) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(loc.latitude, loc.longitude, loc.timezone, loc.name, loc.country);
      const calculatedAdvice = analyzeUmbrellaDecision(data, prefs.umbrellaSensitivity);
      const hourly = getProcessedHourly(data, prefs.timeFormat24h);
      const daily = getProcessedDaily(data);

      setWeatherData(data);
      setAdvice(calculatedAdvice);
      setHourlyItems(hourly);
      setDailyItems(daily);

      // Save active location
      try {
        localStorage.setItem('umbrella_cast_active_location', JSON.stringify(loc));
      } catch (e) {
        console.warn(e);
      }
    } catch (err: any) {
      console.error('Failed to load weather:', err);
      setError(err.message || 'Unable to load real-time weather. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [prefs.umbrellaSensitivity, prefs.timeFormat24h]);

  // Initial load
  useEffect(() => {
    loadWeather(location);
  }, [location, loadWeather]);

  // Geolocation trigger
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const locInfo = await reverseGeocode(lat, lon);
          setLocation(locInfo);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  // Update preferences
  const handleUpdatePrefs = (updated: Partial<UserPreferences>) => {
    const newPrefs = { ...prefs, ...updated };
    setPrefs(newPrefs);
    try {
      localStorage.setItem('umbrella_cast_user_prefs', JSON.stringify(newPrefs));
    } catch (e) {
      console.warn(e);
    }

    // Re-analyze if sensitivity changed
    if (weatherData && updated.umbrellaSensitivity) {
      const calculatedAdvice = analyzeUmbrellaDecision(weatherData, newPrefs.umbrellaSensitivity);
      setAdvice(calculatedAdvice);
    }
    if (weatherData && updated.timeFormat24h !== undefined) {
      const hourly = getProcessedHourly(weatherData, newPrefs.timeFormat24h);
      setHourlyItems(hourly);
    }
  };

  // Toggle ambient audio
  const handleToggleAudio = () => {
    const nextState = !isAudioPlaying;
    setIsAudioPlaying(nextState);
    const rainVol = advice?.totalPrecipitationToday || 1.0;
    rainSound.toggleRainSound(nextState, Math.max(0.4, Math.min(1.0, rainVol / 5)));
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      rainSound.toggleRainSound(false);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-200">
      {/* Dynamic Animated Ambiance Background */}
      <WeatherBackground weather={weatherData} />

      {/* Main App Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          currentLocation={location}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRefresh={() => loadWeather(location)}
          isLoading={isLoading}
          isAudioPlaying={isAudioPlaying}
          onToggleAudio={handleToggleAudio}
          isLocating={isLocating}
          onUseCurrentLocation={handleUseCurrentLocation}
          isHighRainAlert={isHighUmbrellaRisk}
          rainChance={umbrellaNeed}
          onOpenAlertPrompt={() => setIsAlertPromptOpen(true)}
        />

        {/* Umbrella Need >50% Interactive Prompt Banner */}
        <UmbrellaAlertPrompt
          advice={advice}
          location={location}
          prefs={prefs}
          isOpen={isAlertPromptOpen && isHighUmbrellaRisk}
          onDismiss={() => setIsAlertPromptOpen(false)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onUpdatePrefs={handleUpdatePrefs}
        />

        {/* Error Notification */}
        {error && (
          <div className="my-4 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between gap-3 text-rose-200 text-sm animate-shake">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadWeather(location)}
              className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold text-xs transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-6 sm:gap-8 my-4">
          {isLoading && !weatherData ? (
            <div className="flex-1 min-h-[450px] flex flex-col items-center justify-center p-8 rounded-3xl glass-panel text-center">
              <div className="relative flex items-center justify-center w-20 h-20 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-sky-400/20 animate-ping" />
                <div className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Umbrella className="w-8 h-8 animate-bounce" />
                </div>
              </div>
              <h3 className="text-xl font-bold font-display text-white">Analyzing Live Rain Radar...</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Fetching real-time atmospheric precipitation & satellite data for {location.name}
              </p>
            </div>
          ) : advice && weatherData ? (
            <>
              {/* Verdict Hero Card */}
              <VerdictHero
                advice={advice}
                location={location}
                weather={weatherData}
                prefs={prefs}
              />

              {/* 24-Hour Precipitation Timeline */}
              {hourlyItems.length > 0 && (
                <HourlyPrecipitationTimeline
                  hourlyItems={hourlyItems}
                  prefs={prefs}
                />
              )}

              {/* Commute & Daily Window Planner */}
              <CommutePlanner
                advice={advice}
                prefs={prefs}
              />

              {/* Bento Grid: 7-Day Forecast + Environmental Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                <div className="lg:col-span-6 w-full">
                  {dailyItems.length > 0 && (
                    <DailyForecastCard
                      dailyItems={dailyItems}
                      prefs={prefs}
                    />
                  )}
                </div>

                <div className="lg:col-span-6 w-full">
                  <WeatherDetailsGrid
                    weather={weatherData}
                    advice={advice}
                    prefs={prefs}
                  />
                </div>
              </div>

              {/* Disqus Community Comments & Live Weather Discussion */}
              <DisqusComments location={location} />
            </>
          ) : null}
        </main>

        {/* Aesthetic Footer */}
        <footer className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connected to real-time meteorological API</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Umbrella Guide
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Units & Settings
            </button>
            <span>•</span>
            <span>Live WMO Sensors</span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={(loc) => {
          setLocation(loc);
          loadWeather(loc);
        }}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLocating={isLocating}
      />

      <UmbrellaGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        prefs={prefs}
        onUpdatePrefs={handleUpdatePrefs}
      />
    </div>
  );
}
