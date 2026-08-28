export interface LocationInfo {
  id: number | string;
  name: string;
  country: string;
  country_code?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  isCurrentLocation?: boolean;
}

export interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  cloud_cover: number;
  wind_speed_10m: number;
  wind_gusts_10m: number;
  surface_pressure?: number;
  time: string;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  rain: number[];
  showers: number[];
  snowfall: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  uv_index: number[];
  visibility: number[];
}

export interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  precipitation_hours: number[];
  uv_index_max: number[];
  wind_speed_10m_max: number[];
  sunrise: string[];
  sunset: string[];
}

export interface SingaporeNeaMeta {
  activeRainStations: number;
  maxStationRain: number;
  availableAreasCount?: number;
  areaList?: Array<{ name: string; forecast: string }>;
  nearestStation?: string;
  regionalForecast?: Record<string, { code: string; text: string }>;
}

export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  areaName?: string;
  forecastText?: string;
  dataSource?: string;
  neaMeta?: SingaporeNeaMeta;
  current: CurrentWeather;
  hourly: HourlyWeather;
  daily: DailyWeather;
}

export type UmbrellaVerdictType = 
  | 'definitely'    // Heavy rain, persistent rain, or storm
  | 'likely'        // Good chance of rain (>50%)
  | 'maybe'         // Slight chance (25-50%), pocket umbrella recommended
  | 'unlikely'      // Very low chance (<25%)
  | 'no'            // 0-10% chance, dry & clear
  | 'sun_parasol';  // Clear skies with extreme UV index (>7)

export type UmbrellaType = 
  | 'Windproof Heavy-Duty' 
  | 'Compact Pocket Umbrella' 
  | 'Classic Full-Size' 
  | 'UV Protection Parasol' 
  | 'None Needed'
  | 'Rain Jacket / Poncho';

export interface CommutePeriod {
  name: string;
  timeLabel: string;
  periodHours: number[]; // hours e.g. [7, 8, 9]
  rainProb: number;
  precipSum: number;
  weatherCode: number;
  temp: number;
  verdict: 'rain' | 'chance' | 'clear';
}

export interface HourlyForecastItem {
  timeStr: string; // "14:00"
  isoTime: string;
  hour: number;
  temp: number;
  rainProb: number;
  precipitation: number; // mm
  weatherCode: number;
  weatherDesc: string;
  weatherIcon: string;
  isCurrentHour: boolean;
  windSpeed: number;
  uvIndex: number;
  umbrellaNeeded: boolean;
}

export interface DailyForecastItem {
  dateStr: string; // "2026-08-27"
  dayName: string; // "Thu" or "Today"
  fullDate: string;
  weatherCode: number;
  weatherDesc: string;
  tempMax: number;
  tempMin: number;
  rainProbMax: number;
  precipitationSum: number;
  uvMax: number;
  windMax: number;
  umbrellaVerdict: UmbrellaVerdictType;
  sunrise: string;
  sunset: string;
}

export interface UmbrellaAdvice {
  verdict: UmbrellaVerdictType;
  verdictTitle: string;
  verdictBadge: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
    glow: string;
  };
  summary: string;
  detailedAnalysis: string;
  recommendedUmbrellaType: UmbrellaType;
  umbrellaTypeReason: string;
  riskScore: number; // 0 - 100
  overallUmbrellaNeedPercent: number; // 0 - 100: combined probability of needing an umbrella (for rain or sun)
  rainNeedPercent: number; // 0 - 100: probability of needing an umbrella for rain
  sunNeedPercent: number; // 0 - 100: probability of needing an umbrella / parasol for UV/sun
  primaryNeedFactor: 'rain' | 'sun' | 'both' | 'none';
  possibilityLabel: 'Certain' | 'Very High' | 'High' | 'Moderate' | 'Low' | 'Minimal';
  isRainingNow: boolean;
  maxRainChanceToday: number;
  rainStartTime?: string;
  rainDurationEstimate?: string;
  totalPrecipitationToday: number; // in mm
  maxWindGustToday: number; // in km/h
  isHighWindRisk: boolean;
  isHighUVRisk: boolean;
  maxUvToday: number;
  currentUvIndex: number;
  cloudCover: number;
  isHeavyRain: boolean;
  isVerySunny: boolean;
  commuteSummary: {
    morning: CommutePeriod;
    afternoon: CommutePeriod;
    evening: CommutePeriod;
    night: CommutePeriod;
  };
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindUnit = 'kmh' | 'mph' | 'ms';
export type RainUnit = 'mm' | 'inch';

export interface UserPreferences {
  tempUnit: TemperatureUnit;
  windUnit: WindUnit;
  rainUnit: RainUnit;
  timeFormat24h: boolean;
  umbrellaSensitivity: 'cautious' | 'standard' | 'relaxed'; // cautious flags rain at 20%, standard at 35%, relaxed at 50%
  notifyOnHighRainRisk?: boolean; // Prompt/notify if umbrella need > 50%
  highRainThreshold?: number; // threshold percentage (defaults to 50)
  enableSoundAlert?: boolean; // play notification chime
  enableBrowserPush?: boolean; // dispatch native browser push notification
}
