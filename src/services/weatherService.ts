import { 
  WeatherApiResponse, 
  LocationInfo, 
  UmbrellaAdvice, 
  UmbrellaVerdictType, 
  UmbrellaType, 
  HourlyForecastItem, 
  DailyForecastItem, 
  CommutePeriod 
} from '../types';
import { getWeatherCodeDetail } from './weatherCodes';

export const POPULAR_LOCATIONS: LocationInfo[] = [
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { id: 'london', name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { id: 'newyork', name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { id: 'paris', name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { id: 'seattle', name: 'Seattle', country: 'United States', admin1: 'Washington', latitude: 47.6062, longitude: -122.3321, timezone: 'America/Los_Angeles' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', admin1: 'New South Wales', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { id: 'taipei', name: 'Taipei', country: 'Taiwan', latitude: 25.0330, longitude: 121.5654, timezone: 'Asia/Taipei' },
];

export async function searchLocations(query: string): Promise<LocationInfo[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to search locations');
    const data = await res.json();
    if (!data.results) return [];
    
    return data.results.map((item: any) => ({
      id: item.id || `${item.latitude}-${item.longitude}`,
      name: item.name,
      country: item.country || '',
      country_code: item.country_code,
      admin1: item.admin1,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'auto',
    }));
  } catch (err) {
    console.error('Error searching locations:', err);
    return [];
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationInfo> {
  try {
    // Open-Meteo reverse geocoding via bigdatacloud free client api or fallback to generic
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (res.ok) {
      const data = await res.json();
      return {
        id: `gps-${lat.toFixed(4)}-${lon.toFixed(4)}`,
        name: data.locality || data.city || data.principalSubdivision || 'Current Location',
        country: data.countryName || '',
        admin1: data.principalSubdivision,
        latitude: lat,
        longitude: lon,
        isCurrentLocation: true
      };
    }
  } catch (e) {
    console.warn('Reverse geocoding failed, fallback:', e);
  }
  return {
    id: `gps-${lat.toFixed(4)}-${lon.toFixed(4)}`,
    name: 'Current Location',
    country: '',
    latitude: lat,
    longitude: lon,
    isCurrentLocation: true
  };
}

export const SINGAPORE_TOWNS: Array<{ name: string; region: string; lat: number; lon: number }> = [
  { name: 'City / Marina Bay', region: 'Central', lat: 1.2869, lon: 103.8545 },
  { name: 'Orchard', region: 'Central', lat: 1.3048, lon: 103.8318 },
  { name: 'Ang Mo Kio', region: 'North-East', lat: 1.3691, lon: 103.8454 },
  { name: 'Bedok', region: 'East', lat: 1.3236, lon: 103.9273 },
  { name: 'Bishan', region: 'Central', lat: 1.3526, lon: 103.8352 },
  { name: 'Bukit Batok', region: 'West', lat: 1.3590, lon: 103.7637 },
  { name: 'Bukit Timah', region: 'Central', lat: 1.3294, lon: 103.8021 },
  { name: 'Changi', region: 'East', lat: 1.3644, lon: 103.9915 },
  { name: 'Choa Chu Kang', region: 'West', lat: 1.3840, lon: 103.7470 },
  { name: 'Clementi', region: 'West', lat: 1.3162, lon: 103.7649 },
  { name: 'Geylang', region: 'Central', lat: 1.3201, lon: 103.8918 },
  { name: 'Hougang', region: 'North-East', lat: 1.3612, lon: 103.8863 },
  { name: 'Jurong East', region: 'West', lat: 1.3329, lon: 103.7436 },
  { name: 'Jurong West', region: 'West', lat: 1.3404, lon: 103.7090 },
  { name: 'Kallang', region: 'Central', lat: 1.3100, lon: 103.8651 },
  { name: 'Novena', region: 'Central', lat: 1.3204, lon: 103.8438 },
  { name: 'Pasir Ris', region: 'East', lat: 1.3721, lon: 103.9474 },
  { name: 'Punggol', region: 'North-East', lat: 1.4052, lon: 103.9023 },
  { name: 'Queenstown', region: 'Central', lat: 1.2942, lon: 103.8060 },
  { name: 'Sembawang', region: 'North', lat: 1.4491, lon: 103.8185 },
  { name: 'Sengkang', region: 'North-East', lat: 1.3868, lon: 103.8914 },
  { name: 'Sentosa', region: 'South', lat: 1.2494, lon: 103.8303 },
  { name: 'Serangoon', region: 'North-East', lat: 1.3554, lon: 103.8679 },
  { name: 'Tampines', region: 'East', lat: 1.3533, lon: 103.9452 },
  { name: 'Toa Payoh', region: 'Central', lat: 1.3343, lon: 103.8563 },
  { name: 'Tuas', region: 'West', lat: 1.3292, lon: 103.6364 },
  { name: 'Woodlands', region: 'North', lat: 1.4382, lon: 103.7890 },
  { name: 'Yishun', region: 'North', lat: 1.4304, lon: 103.8354 }
];

export async function fetchWeatherData(
  lat: number, 
  lon: number, 
  timezone = 'auto', 
  locationName?: string,
  country?: string
): Promise<WeatherApiResponse> {
  // Check if coordinates or location are in Singapore
  const isSingapore = (country && country.toLowerCase().includes('singapore')) ||
    (locationName && locationName.toLowerCase().includes('singapore')) ||
    (lat >= 1.15 && lat <= 1.48 && lon >= 103.60 && lon <= 104.05);

  if (isSingapore) {
    try {
      const area = locationName ? locationName.replace(/,.*$/, '').trim() : 'Central';
      const sgRes = await fetch(`/api/weather/singapore-formatted?area=${encodeURIComponent(area)}`);
      if (sgRes.ok) {
        const sgData: WeatherApiResponse = await sgRes.json();
        return sgData;
      }
    } catch (e) {
      console.warn('Backend Data.gov.sg live request fallback to Open-Meteo:', e);
    }
  }

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_gusts_10m',
      'surface_pressure'
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation_probability',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'wind_speed_10m',
      'uv_index',
      'visibility'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'precipitation_hours',
      'uv_index_max',
      'wind_speed_10m_max',
      'sunrise',
      'sunset'
    ].join(','),
    timezone: timezone || 'auto',
    forecast_days: '8'
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API returned ${response.status}`);
  }
  const data: WeatherApiResponse = await response.json();
  data.dataSource = 'Open-Meteo Global Satellite Radar';
  return data;
}

// Data.gov.sg Direct Backend Feed API Helpers
export async function fetchDataGovSgAll(): Promise<any> {
  const res = await fetch('/api/weather/data-gov-sg/all');
  if (!res.ok) throw new Error('Failed to fetch Data.gov.sg aggregated feed');
  return res.json();
}

export async function fetchDataGovSgTwoHr(): Promise<any> {
  const res = await fetch('/api/weather/data-gov-sg/two-hr-forecast');
  return res.json();
}

export async function fetchDataGovSgTwentyFourHr(): Promise<any> {
  const res = await fetch('/api/weather/data-gov-sg/twenty-four-hr-forecast');
  return res.json();
}

export async function fetchDataGovSgFourDay(): Promise<any> {
  const res = await fetch('/api/weather/data-gov-sg/four-day-outlook');
  return res.json();
}

export async function fetchDataGovSgAirTemp(): Promise<any> {
  const res = await fetch('/api/weather/data-gov-sg/air-temperature');
  return res.json();
}

export async function fetchDataGovSgRainfall(): Promise<any> {
  const res = await fetch('/api/weather/data-gov-sg/rainfall');
  return res.json();
}

export async function fetchDataGovSgUv(): Promise<any> {
  const res = await fetch('/api/weather/data-gov-sg/uv');
  return res.json();
}

export async function fetchDataGovSgHumidity(): Promise<any> {
  const res = await fetch('/api/weather/data-gov-sg/relative-humidity');
  return res.json();
}

export function analyzeUmbrellaDecision(
  data: WeatherApiResponse,
  sensitivity: 'cautious' | 'standard' | 'relaxed' = 'standard'
): UmbrellaAdvice {
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  // Thresholds based on user sensitivity
  const probDefiniteThreshold = sensitivity === 'cautious' ? 45 : sensitivity === 'standard' ? 60 : 75;
  const probLikelyThreshold = sensitivity === 'cautious' ? 25 : sensitivity === 'standard' ? 35 : 50;
  const probMaybeThreshold = sensitivity === 'cautious' ? 15 : sensitivity === 'standard' ? 20 : 30;

  // Find next 18 hours from current
  const currentTimeIso = current.time;
  let currentIndex = hourly.time.findIndex(t => t >= currentTimeIso);
  if (currentIndex === -1) currentIndex = 0;

  const next18Hours = {
    probs: hourly.precipitation_probability.slice(currentIndex, currentIndex + 18),
    precips: hourly.precipitation.slice(currentIndex, currentIndex + 18),
    codes: hourly.weather_code.slice(currentIndex, currentIndex + 18),
    winds: hourly.wind_speed_10m.slice(currentIndex, currentIndex + 18),
    uvs: hourly.uv_index.slice(currentIndex, currentIndex + 18),
    times: hourly.time.slice(currentIndex, currentIndex + 18),
    temps: hourly.temperature_2m.slice(currentIndex, currentIndex + 18),
  };

  const isRainingNow = (current.precipitation > 0.05 || current.rain > 0.05 || current.showers > 0.05) ||
    [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(current.weather_code);

  const maxProbNext18h = next18Hours.probs.length > 0 ? Math.max(...next18Hours.probs) : 0;
  const totalPrecipNext18h = next18Hours.precips.reduce((sum, val) => sum + (val || 0), 0);
  const maxWindNext18h = next18Hours.winds.length > 0 ? Math.max(...next18Hours.winds) : current.wind_speed_10m;
  const maxGust = current.wind_gusts_10m || (maxWindNext18h * 1.4);
  const maxUvToday = daily.uv_index_max && daily.uv_index_max[0] ? daily.uv_index_max[0] : 0;
  const todayPrecipSum = daily.precipitation_sum && daily.precipitation_sum[0] ? daily.precipitation_sum[0] : totalPrecipNext18h;

  // Rain start time estimation
  let rainStartTime: string | undefined = undefined;
  let rainDurationHours = 0;
  
  if (isRainingNow) {
    rainStartTime = 'Raining right now';
  } else {
    for (let i = 0; i < next18Hours.probs.length; i++) {
      if (next18Hours.probs[i] >= probLikelyThreshold || (next18Hours.precips[i] && next18Hours.precips[i] >= 0.2)) {
        const dateObj = new Date(next18Hours.times[i]);
        rainStartTime = dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        break;
      }
    }
  }

  // Count consecutive rain hours
  for (let i = 0; i < next18Hours.probs.length; i++) {
    if (next18Hours.probs[i] >= probLikelyThreshold || next18Hours.precips[i] >= 0.1) {
      rainDurationHours++;
    }
  }

  const rainDurationEstimate = rainDurationHours > 0 
    ? `~${rainDurationHours} hour${rainDurationHours > 1 ? 's' : ''} of expected showers` 
    : 'No sustained precipitation detected';

  const hasStorm = next18Hours.codes.some(c => [95, 96, 99].includes(c)) || [95, 96, 99].includes(current.weather_code);
  const hasHeavyRain = next18Hours.precips.some(p => p >= 2.5) || next18Hours.codes.some(c => [65, 82, 96, 99].includes(c));
  const isHighWindRisk = maxGust >= 38 || maxWindNext18h >= 28;
  const currentUvIndex = (hourly.uv_index && hourly.uv_index[currentIndex] !== undefined) 
    ? hourly.uv_index[currentIndex] 
    : (maxUvToday > 0 ? maxUvToday * 0.75 : 0);
  const cloudCover = current.cloud_cover !== undefined ? current.cloud_cover : 50;
  
  const isHeavyRain = isRainingNow && (current.precipitation >= 1.5 || current.weather_code >= 63) || hasHeavyRain || hasStorm || (maxProbNext18h >= 75 && totalPrecipNext18h >= 3.0);
  const isExtremeUV = maxUvToday >= 7.5 && cloudCover <= 75 && maxProbNext18h < 30 && totalPrecipNext18h < 0.3;
  const isVerySunny = (maxUvToday >= 5.5 || currentUvIndex >= 5.0) && cloudCover <= 65 && maxProbNext18h < 30 && totalPrecipNext18h < 0.3;

  // Calculate Specific Possibility Percentages for Rain vs Sun/UV
  let rainNeedPercent = 0;
  if (isRainingNow) {
    rainNeedPercent = 100;
  } else if (hasHeavyRain || hasStorm) {
    rainNeedPercent = Math.min(99, Math.max(85, maxProbNext18h + 15));
  } else if (totalPrecipNext18h >= 2.0) {
    rainNeedPercent = Math.min(99, Math.max(75, maxProbNext18h));
  } else {
    rainNeedPercent = Math.min(99, maxProbNext18h);
  }

  // Sun / UV Parasol Protection Need Percentage
  let rawSunNeed = 0;
  if (maxUvToday >= 11) {
    rawSunNeed = 95;
  } else if (maxUvToday >= 8) {
    rawSunNeed = Math.round(75 + (maxUvToday - 8) * 6.5);
  } else if (maxUvToday >= 6) {
    rawSunNeed = Math.round(55 + (maxUvToday - 6) * 10);
  } else if (maxUvToday >= 3) {
    rawSunNeed = Math.round(25 + (maxUvToday - 3) * 10);
  } else {
    rawSunNeed = Math.round(maxUvToday * 7);
  }

  // Adjust Sun Need for Cloud Cover if extremely overcast
  let sunNeedPercent = rawSunNeed;
  if (cloudCover > 85) {
    sunNeedPercent = Math.round(rawSunNeed * 0.7);
  }

  // Combined Umbrella Need Percentage (Rain OR Sun)
  let overallUmbrellaNeedPercent = 0;
  if (isRainingNow) {
    overallUmbrellaNeedPercent = 100;
  } else if (rainNeedPercent >= 40 && sunNeedPercent >= 40) {
    // Dual threat (e.g. blazing tropical UV midday + thundery rain in afternoon)
    overallUmbrellaNeedPercent = Math.min(99, Math.round(Math.max(rainNeedPercent, sunNeedPercent) + 6));
  } else {
    overallUmbrellaNeedPercent = Math.min(99, Math.max(rainNeedPercent, sunNeedPercent));
  }

  // Primary Need Driver
  let primaryNeedFactor: 'rain' | 'sun' | 'both' | 'none' = 'none';
  if (rainNeedPercent >= 35 && sunNeedPercent >= 35) {
    primaryNeedFactor = 'both';
  } else if (rainNeedPercent >= sunNeedPercent && rainNeedPercent >= 20) {
    primaryNeedFactor = 'rain';
  } else if (sunNeedPercent > rainNeedPercent && sunNeedPercent >= 25) {
    primaryNeedFactor = 'sun';
  } else {
    primaryNeedFactor = 'none';
  }

  // Possibility Label
  let possibilityLabel: 'Certain' | 'Very High' | 'High' | 'Moderate' | 'Low' | 'Minimal' = 'Minimal';
  if (overallUmbrellaNeedPercent >= 85 || isRainingNow) {
    possibilityLabel = 'Certain';
  } else if (overallUmbrellaNeedPercent >= 70) {
    possibilityLabel = 'Very High';
  } else if (overallUmbrellaNeedPercent >= 50) {
    possibilityLabel = 'High';
  } else if (overallUmbrellaNeedPercent >= 30) {
    possibilityLabel = 'Moderate';
  } else if (overallUmbrellaNeedPercent >= 15) {
    possibilityLabel = 'Low';
  } else {
    possibilityLabel = 'Minimal';
  }

  // Determine Verdict
  let verdict: UmbrellaVerdictType = 'no';
  let verdictTitle = 'No Umbrella Needed';
  let verdictBadge = 'LEAVE IT AT HOME';
  let badgeColor = {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'rgba(16, 185, 129, 0.2)'
  };
  let summary = 'Skies are dry and precipitation is negligible today.';
  let detailedAnalysis = 'You can leave your umbrella behind and enjoy light traveling.';
  let recommendedUmbrellaType: UmbrellaType = 'None Needed';
  let umbrellaTypeReason = 'Zero to minimal rain probability and safe UV index detected in the forecast window.';
  let riskScore = 5;

  if (isRainingNow || hasStorm || hasHeavyRain || maxProbNext18h >= probDefiniteThreshold || totalPrecipNext18h >= 2.0) {
    verdict = 'definitely';
    if (isHeavyRain) {
      verdictTitle = isRainingNow ? 'Torrential Rain Active — Heavy Rain Umbrella Needed' : 'Heavy Rain & Downpours Expected!';
      verdictBadge = 'HEAVY RAIN WARNING';
    } else {
      verdictTitle = isRainingNow ? 'Definitely Bring One — Raining Now' : 'Definitely Bring an Umbrella!';
      verdictBadge = isRainingNow ? 'RAINING NOW' : 'UMBRELLA MANDATORY';
    }
    badgeColor = {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      glow: 'rgba(244, 63, 94, 0.25)'
    };
    riskScore = Math.min(99, Math.max(75, maxProbNext18h + (hasStorm || isHeavyRain ? 15 : 0)));
    
    if (isHighWindRisk || hasStorm) {
      recommendedUmbrellaType = 'Windproof Heavy-Duty';
      umbrellaTypeReason = `Strong gusts up to ${Math.round(maxGust)} km/h are expected. A reinforced windproof umbrella is required.`;
      summary = `High rain certainty (${maxProbNext18h}%) combined with gusty winds and heavy precipitation (${totalPrecipNext18h.toFixed(1)} mm).`;
    } else if (isHeavyRain) {
      recommendedUmbrellaType = 'Classic Full-Size';
      umbrellaTypeReason = `Substantial rain volume (${totalPrecipNext18h.toFixed(1)} mm) will overwhelm compact umbrellas. Full canopy coverage recommended.`;
      summary = `Heavy rain volume expected (${totalPrecipNext18h.toFixed(1)} mm) with ${maxProbNext18h}% rain likelihood.`;
    } else {
      recommendedUmbrellaType = 'Classic Full-Size';
      umbrellaTypeReason = `Solid rain likelihood expected (${totalPrecipNext18h.toFixed(1)} mm). Full coverage will keep you dry.`;
      summary = `Rain probability peaks at ${maxProbNext18h}% with significant precipitation expected.`;
    }
    detailedAnalysis = `Precipitation likelihood reaches ${maxProbNext18h}% with estimated total volume of ${totalPrecipNext18h.toFixed(1)} mm over the next 18 hours. ${rainStartTime ? `Expected starting around ${rainStartTime}.` : ''}`;

  } else if (maxProbNext18h >= probLikelyThreshold || totalPrecipNext18h >= 0.8) {
    verdict = 'likely';
    verdictTitle = 'Grab an Umbrella Before You Go';
    verdictBadge = 'HIGH CHANCE OF RAIN';
    badgeColor = {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      glow: 'rgba(245, 158, 11, 0.25)'
    };
    riskScore = Math.min(74, Math.max(50, maxProbNext18h));
    recommendedUmbrellaType = isHighWindRisk ? 'Windproof Heavy-Duty' : 'Compact Pocket Umbrella';
    umbrellaTypeReason = 'A convenient compact umbrella easily stashes into your bag and keeps you covered.';
    summary = `Moderate to high rain probability (${maxProbNext18h}%) across parts of the day.`;
    detailedAnalysis = `Showers or intermittent rain are likely today (peak ${maxProbNext18h}%). Having an umbrella on hand will prevent getting drenched during commutes.`;

  } else if (maxProbNext18h >= probMaybeThreshold || totalPrecipNext18h >= 0.2) {
    verdict = 'maybe';
    verdictTitle = 'Pack a Compact Umbrella Just in Case';
    verdictBadge = 'POCKET UMBRELLA';
    badgeColor = {
      bg: 'bg-sky-500/15',
      text: 'text-sky-400',
      border: 'border-sky-500/30',
      glow: 'rgba(14, 165, 233, 0.2)'
    };
    riskScore = Math.min(49, Math.max(25, maxProbNext18h));
    recommendedUmbrellaType = 'Compact Pocket Umbrella';
    umbrellaTypeReason = 'Low to moderate spotty shower risk. A lightweight foldable umbrella is ideal insurance.';
    summary = `Isolated showers or drizzle are possible (${maxProbNext18h}% max chance).`;
    detailedAnalysis = `Passing clouds or brief drizzle might occur (${totalPrecipNext18h.toFixed(1)} mm possible). You probably won't need it constantly, but a pocket umbrella is smart to carry.`;

  } else if (isExtremeUV || isVerySunny) {
    verdict = 'sun_parasol';
    verdictTitle = maxUvToday >= 8 ? 'Intense Sunshine — UV Sun Parasol Needed' : 'Very Sunny — Carry a UV Parasol';
    verdictBadge = maxUvToday >= 8 ? 'EXTREME UV SHIELD' : 'HIGH UV PROTECTION';
    badgeColor = {
      bg: 'bg-amber-400/20',
      text: 'text-amber-300',
      border: 'border-amber-400/40',
      glow: 'rgba(251, 191, 36, 0.35)'
    };
    riskScore = Math.min(85, Math.round(maxUvToday * 9));
    recommendedUmbrellaType = 'UV Protection Parasol';
    umbrellaTypeReason = `Peak UV Index will hit ${maxUvToday.toFixed(1)} with low cloud cover (${cloudCover}%). A UV-blocking parasol shields your skin and eyes from intense solar radiation.`;
    summary = `No rain expected, but peak solar UV reaches high levels (${maxUvToday.toFixed(1)}).`;
    detailedAnalysis = `Clear to partly cloudy skies (${cloudCover}% clouds) mean zero rain risk, but solar radiation is intense. A UV-blocking sun parasol or hat is strongly advised for outdoor walks.`;

  } else if (maxProbNext18h > 10) {
    verdict = 'unlikely';
    verdictTitle = 'Unlikely to Rain — Clear Skies Ahead';
    verdictBadge = 'LOW RAIN RISK';
    badgeColor = {
      bg: 'bg-teal-500/15',
      text: 'text-teal-400',
      border: 'border-teal-500/30',
      glow: 'rgba(20, 184, 166, 0.2)'
    };
    riskScore = 12;
    recommendedUmbrellaType = 'None Needed';
    umbrellaTypeReason = 'Dry conditions forecasted with safe UV levels. Low probability of precipitation.';
    summary = `Rain probability is only ${maxProbNext18h}%. Safe to travel light.`;
    detailedAnalysis = `Weather forecast indicates dry conditions throughout the day. You should be fine without an umbrella.`;
  }

  // Calculate Commute Periods
  const commuteSummary = calculateCommuteSummary(hourly, currentIndex);

  return {
    verdict,
    verdictTitle,
    verdictBadge,
    badgeColor,
    summary,
    detailedAnalysis,
    recommendedUmbrellaType,
    umbrellaTypeReason,
    riskScore,
    overallUmbrellaNeedPercent,
    rainNeedPercent,
    sunNeedPercent,
    primaryNeedFactor,
    possibilityLabel,
    isRainingNow,
    maxRainChanceToday: maxProbNext18h,
    rainStartTime,
    rainDurationEstimate,
    totalPrecipitationToday: todayPrecipSum,
    maxWindGustToday: maxGust,
    isHighWindRisk,
    isHighUVRisk: isExtremeUV || isVerySunny,
    maxUvToday,
    currentUvIndex,
    cloudCover,
    isHeavyRain,
    isVerySunny,
    commuteSummary
  };
}

function calculateCommuteSummary(hourly: WeatherApiResponse['hourly'], currentIndex: number) {
  const periods = [
    { key: 'morning', name: 'Morning Commute', timeLabel: '07:00 – 09:00', targetHours: [7, 8, 9] },
    { key: 'afternoon', name: 'Midday & Lunch', timeLabel: '12:00 – 14:00', targetHours: [12, 13, 14] },
    { key: 'evening', name: 'Evening Commute', timeLabel: '17:00 – 19:00', targetHours: [17, 18, 19] },
    { key: 'night', name: 'Night & Dinner', timeLabel: '20:00 – 22:00', targetHours: [20, 21, 22] },
  ];

  const result: any = {};

  // Find entries matching today's or tomorrow's target hours
  for (const p of periods) {
    const matchedIndices: number[] = [];
    
    // Look up to 28 hours ahead
    for (let i = currentIndex; i < Math.min(hourly.time.length, currentIndex + 28); i++) {
      const d = new Date(hourly.time[i]);
      const hour = d.getHours();
      if (p.targetHours.includes(hour)) {
        matchedIndices.push(i);
        if (matchedIndices.length >= 3) break;
      }
    }

    if (matchedIndices.length === 0) {
      // Default fallback
      result[p.key] = {
        name: p.name,
        timeLabel: p.timeLabel,
        periodHours: p.targetHours,
        rainProb: 0,
        precipSum: 0,
        weatherCode: 0,
        temp: 20,
        verdict: 'clear' as const
      };
      continue;
    }

    const rainProb = Math.max(...matchedIndices.map(i => hourly.precipitation_probability[i] || 0));
    const precipSum = matchedIndices.reduce((sum, i) => sum + (hourly.precipitation[i] || 0), 0);
    const weatherCode = hourly.weather_code[matchedIndices[0]] || 0;
    const temp = Math.round(hourly.temperature_2m[matchedIndices[0]] || 20);

    let verdict: 'rain' | 'chance' | 'clear' = 'clear';
    if (rainProb >= 50 || precipSum >= 1.0) verdict = 'rain';
    else if (rainProb >= 25 || precipSum > 0.1) verdict = 'chance';

    result[p.key] = {
      name: p.name,
      timeLabel: p.timeLabel,
      periodHours: p.targetHours,
      rainProb,
      precipSum,
      weatherCode,
      temp,
      verdict
    };
  }

  return result as UmbrellaAdvice['commuteSummary'];
}

export function getProcessedHourly(data: WeatherApiResponse, timeFormat24h = true): HourlyForecastItem[] {
  const currentIso = data.current.time;
  const hourly = data.hourly;
  let startIndex = hourly.time.findIndex(t => t >= currentIso);
  if (startIndex === -1) startIndex = 0;

  // Return next 24 hours
  const result: HourlyForecastItem[] = [];
  const count = Math.min(24, hourly.time.length - startIndex);

  for (let i = 0; i < count; i++) {
    const idx = startIndex + i;
    const isoTime = hourly.time[idx];
    const dateObj = new Date(isoTime);
    const hour = dateObj.getHours();

    let timeStr = '';
    if (i === 0) {
      timeStr = 'Now';
    } else if (timeFormat24h) {
      timeStr = `${hour.toString().padStart(2, '0')}:00`;
    } else {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = hour % 12 || 12;
      timeStr = `${h12} ${ampm}`;
    }

    const code = hourly.weather_code[idx] || 0;
    const detail = getWeatherCodeDetail(code);
    const prob = hourly.precipitation_probability[idx] || 0;
    const precip = hourly.precipitation[idx] || 0;

    result.push({
      timeStr,
      isoTime,
      hour,
      temp: hourly.temperature_2m[idx],
      rainProb: prob,
      precipitation: precip,
      weatherCode: code,
      weatherDesc: detail.description,
      weatherIcon: detail.iconName,
      isCurrentHour: i === 0,
      windSpeed: hourly.wind_speed_10m[idx] || 0,
      uvIndex: hourly.uv_index[idx] || 0,
      umbrellaNeeded: prob >= 35 || precip >= 0.2 || detail.isRain
    });
  }

  return result;
}

export function getProcessedDaily(data: WeatherApiResponse): DailyForecastItem[] {
  const daily = data.daily;
  const result: DailyForecastItem[] = [];
  const days = Math.min(7, daily.time.length);

  for (let i = 0; i < days; i++) {
    const dateStr = daily.time[i];
    const dateObj = new Date(dateStr + 'T00:00:00');
    
    let dayName = '';
    if (i === 0) dayName = 'Today';
    else if (i === 1) dayName = 'Tomorrow';
    else dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    const fullDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const code = daily.weather_code[i] || 0;
    const detail = getWeatherCodeDetail(code);
    const rainProb = daily.precipitation_probability_max[i] || 0;
    const precipSum = daily.precipitation_sum[i] || 0;

    let umbrellaVerdict: UmbrellaVerdictType = 'no';
    if (rainProb >= 60 || precipSum >= 2.0 || detail.isRain) {
      umbrellaVerdict = 'definitely';
    } else if (rainProb >= 35 || precipSum >= 0.5) {
      umbrellaVerdict = 'likely';
    } else if (rainProb >= 20) {
      umbrellaVerdict = 'maybe';
    }

    result.push({
      dateStr,
      dayName,
      fullDate,
      weatherCode: code,
      weatherDesc: detail.description,
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      rainProbMax: rainProb,
      precipitationSum: precipSum,
      uvMax: daily.uv_index_max ? daily.uv_index_max[i] : 0,
      windMax: daily.wind_speed_10m_max ? daily.wind_speed_10m_max[i] : 0,
      umbrellaVerdict,
      sunrise: daily.sunrise && daily.sunrise[i] ? daily.sunrise[i].split('T')[1] : '06:00',
      sunset: daily.sunset && daily.sunset[i] ? daily.sunset[i].split('T')[1] : '18:30',
    });
  }

  return result;
}

export function formatTemp(tempC: number, unit: 'celsius' | 'fahrenheit'): string {
  if (unit === 'fahrenheit') {
    const f = Math.round((tempC * 9) / 5 + 32);
    return `${f}°F`;
  }
  return `${Math.round(tempC)}°C`;
}

export function formatPrecip(mm: number, unit: 'mm' | 'inch'): string {
  if (unit === 'inch') {
    const inches = (mm / 25.4).toFixed(2);
    return `${inches} in`;
  }
  return `${mm.toFixed(1)} mm`;
}

export function formatWind(kmh: number, unit: 'kmh' | 'mph' | 'ms'): string {
  if (unit === 'mph') {
    const mph = Math.round(kmh * 0.621371);
    return `${mph} mph`;
  }
  if (unit === 'ms') {
    const ms = (kmh / 3.6).toFixed(1);
    return `${ms} m/s`;
  }
  return `${Math.round(kmh)} km/h`;
}
