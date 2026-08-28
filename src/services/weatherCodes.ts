export interface WeatherCodeDetail {
  description: string;
  isRain: boolean;
  isSnow: boolean;
  isStorm: boolean;
  isDrizzle: boolean;
  iconName: string;
  category: 'clear' | 'clouds' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';
}

export const WMO_WEATHER_CODES: Record<number, WeatherCodeDetail> = {
  0: { description: 'Clear Sky', isRain: false, isSnow: false, isStorm: false, isDrizzle: false, iconName: 'Sun', category: 'clear' },
  1: { description: 'Mainly Clear', isRain: false, isSnow: false, isStorm: false, isDrizzle: false, iconName: 'SunMedium', category: 'clear' },
  2: { description: 'Partly Cloudy', isRain: false, isSnow: false, isStorm: false, isDrizzle: false, iconName: 'CloudSun', category: 'clouds' },
  3: { description: 'Overcast', isRain: false, isSnow: false, isStorm: false, isDrizzle: false, iconName: 'Cloud', category: 'clouds' },
  45: { description: 'Foggy', isRain: false, isSnow: false, isStorm: false, isDrizzle: false, iconName: 'CloudFog', category: 'fog' },
  48: { description: 'Depositing Rime Fog', isRain: false, isSnow: false, isStorm: false, isDrizzle: false, iconName: 'CloudFog', category: 'fog' },
  51: { description: 'Light Drizzle', isRain: true, isSnow: false, isStorm: false, isDrizzle: true, iconName: 'CloudDrizzle', category: 'drizzle' },
  53: { description: 'Moderate Drizzle', isRain: true, isSnow: false, isStorm: false, isDrizzle: true, iconName: 'CloudDrizzle', category: 'drizzle' },
  55: { description: 'Dense Drizzle', isRain: true, isSnow: false, isStorm: false, isDrizzle: true, iconName: 'CloudDrizzle', category: 'drizzle' },
  56: { description: 'Freezing Light Drizzle', isRain: true, isSnow: true, isStorm: false, isDrizzle: true, iconName: 'CloudHail', category: 'drizzle' },
  57: { description: 'Freezing Dense Drizzle', isRain: true, isSnow: true, isStorm: false, isDrizzle: true, iconName: 'CloudHail', category: 'drizzle' },
  61: { description: 'Slight Rain', isRain: true, isSnow: false, isStorm: false, isDrizzle: false, iconName: 'CloudRain', category: 'rain' },
  63: { description: 'Moderate Rain', isRain: true, isSnow: false, isStorm: false, isDrizzle: false, iconName: 'CloudRain', category: 'rain' },
  65: { description: 'Heavy Rain', isRain: true, isSnow: false, isStorm: false, isDrizzle: false, iconName: 'CloudRainWind', category: 'rain' },
  66: { description: 'Light Freezing Rain', isRain: true, isSnow: true, isStorm: false, isDrizzle: false, iconName: 'CloudHail', category: 'rain' },
  67: { description: 'Heavy Freezing Rain', isRain: true, isSnow: true, isStorm: false, isDrizzle: false, iconName: 'CloudHail', category: 'rain' },
  71: { description: 'Slight Snowfall', isRain: false, isSnow: true, isStorm: false, isDrizzle: false, iconName: 'CloudSnow', category: 'snow' },
  73: { description: 'Moderate Snowfall', isRain: false, isSnow: true, isStorm: false, isDrizzle: false, iconName: 'CloudSnow', category: 'snow' },
  75: { description: 'Heavy Snowfall', isRain: false, isSnow: true, isStorm: false, isDrizzle: false, iconName: 'CloudSnow', category: 'snow' },
  77: { description: 'Snow Grains', isRain: false, isSnow: true, isStorm: false, isDrizzle: false, iconName: 'CloudSnow', category: 'snow' },
  80: { description: 'Slight Rain Showers', isRain: true, isSnow: false, isStorm: false, isDrizzle: false, iconName: 'CloudRain', category: 'rain' },
  81: { description: 'Moderate Rain Showers', isRain: true, isSnow: false, isStorm: false, isDrizzle: false, iconName: 'CloudRain', category: 'rain' },
  82: { description: 'Violent Rain Showers', isRain: true, isSnow: false, isStorm: false, isDrizzle: false, iconName: 'CloudRainWind', category: 'rain' },
  85: { description: 'Slight Snow Showers', isRain: false, isSnow: true, isStorm: false, isDrizzle: false, iconName: 'CloudSnow', category: 'snow' },
  86: { description: 'Heavy Snow Showers', isRain: false, isSnow: true, isStorm: false, isDrizzle: false, iconName: 'CloudSnow', category: 'snow' },
  95: { description: 'Thunderstorm', isRain: true, isSnow: false, isStorm: true, isDrizzle: false, iconName: 'CloudLightning', category: 'thunderstorm' },
  96: { description: 'Thunderstorm with Slight Hail', isRain: true, isSnow: true, isStorm: true, isDrizzle: false, iconName: 'CloudLightning', category: 'thunderstorm' },
  99: { description: 'Thunderstorm with Heavy Hail', isRain: true, isSnow: true, isStorm: true, isDrizzle: false, iconName: 'CloudLightning', category: 'thunderstorm' },
};

export function getWeatherCodeDetail(code: number): WeatherCodeDetail {
  return WMO_WEATHER_CODES[code] || {
    description: 'Partly Cloudy',
    isRain: false,
    isSnow: false,
    isStorm: false,
    isDrizzle: false,
    iconName: 'Cloud',
    category: 'clouds'
  };
}
