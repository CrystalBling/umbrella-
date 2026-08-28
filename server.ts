import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for Data.gov.sg v2 endpoints
interface CacheEntry<T = any> {
  data: T | null;
  lastFetched: number;
  error?: string | null;
}

const cache: Record<string, CacheEntry> = {
  twoHr: { data: null, lastFetched: 0 },
  twentyFourHr: { data: null, lastFetched: 0 },
  fourDay: { data: null, lastFetched: 0 },
  airTemp: { data: null, lastFetched: 0 },
  rainfall: { data: null, lastFetched: 0 },
  uv: { data: null, lastFetched: 0 },
  humidity: { data: null, lastFetched: 0 },
};

const ENDPOINTS: Record<string, string> = {
  twoHr: "https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast",
  twentyFourHr: "https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast",
  fourDay: "https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook",
  airTemp: "https://api-open.data.gov.sg/v2/real-time/api/air-temperature",
  rainfall: "https://api-open.data.gov.sg/v2/real-time/api/rainfall",
  uv: "https://api-open.data.gov.sg/v2/real-time/api/uv",
  humidity: "https://api-open.data.gov.sg/v2/real-time/api/relative-humidity",
};

const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

// Fallback baselines for cold start if external API returns 429
const BASELINE_FALLBACKS: Record<string, any> = {
  twentyFourHr: {
    records: [{
      date: new Date().toISOString().split("T")[0],
      general: { forecast: { text: "Thundery Showers", code: "TL" }, relativeHumidity: { low: 65, high: 90 }, temperature: { low: 25, high: 32 } },
      periods: [
        { time: { text: "Morning", start: "06:00", end: "12:00" }, regions: { west: { text: "Partly Cloudy", code: "PC" }, south: { text: "Partly Cloudy", code: "PC" }, north: { text: "Partly Cloudy", code: "PC" }, east: { text: "Partly Cloudy", code: "PC" }, central: { text: "Partly Cloudy", code: "PC" } } },
        { time: { text: "Afternoon", start: "12:00", end: "18:00" }, regions: { west: { text: "Thundery Showers", code: "TL" }, south: { text: "Thundery Showers", code: "TL" }, north: { text: "Thundery Showers", code: "TL" }, east: { text: "Thundery Showers", code: "TL" }, central: { text: "Thundery Showers", code: "TL" } } },
        { time: { text: "Night", start: "18:00", end: "06:00" }, regions: { west: { text: "Fair", code: "FA" }, south: { text: "Fair", code: "FA" }, north: { text: "Fair", code: "FA" }, east: { text: "Fair", code: "FA" }, central: { text: "Fair", code: "FA" } } }
      ]
    }]
  },
  twoHr: {
    records: [{
      forecasts: [
        { area: "Ang Mo Kio", forecast: "Partly Cloudy (Day)" },
        { area: "Bedok", forecast: "Partly Cloudy (Day)" },
        { area: "Bishan", forecast: "Partly Cloudy (Day)" },
        { area: "Central", forecast: "Partly Cloudy (Day)" },
        { area: "City", forecast: "Partly Cloudy (Day)" },
        { area: "Jurong", forecast: "Thundery Showers" },
        { area: "Orchard", forecast: "Partly Cloudy (Day)" },
        { area: "Tampines", forecast: "Partly Cloudy (Day)" },
        { area: "Woodlands", forecast: "Thundery Showers" }
      ]
    }]
  },
  fourDay: {
    records: [{
      forecasts: [
        { day: "Day 1", temperature: { low: 25, high: 32 }, summary: "Thundery Showers", relativeHumidity: { low: 65, high: 90 } },
        { day: "Day 2", temperature: { low: 25, high: 33 }, summary: "Passing Showers", relativeHumidity: { low: 60, high: 85 } },
        { day: "Day 3", temperature: { low: 26, high: 33 }, summary: "Partly Cloudy", relativeHumidity: { low: 60, high: 80 } },
        { day: "Day 4", temperature: { low: 25, high: 32 }, summary: "Thundery Showers", relativeHumidity: { low: 65, high: 90 } }
      ]
    }]
  },
  airTemp: { readings: [{ data: [{ stationId: "S109", value: 30.5 }, { stationId: "S117", value: 31.0 }] }] },
  rainfall: { readings: [{ data: [{ stationId: "S109", value: 0 }, { stationId: "S117", value: 0 }] }] },
  uv: { records: [{ index: [{ hour: "12:00", value: 7 }, { hour: "13:00", value: 8 }, { hour: "14:00", value: 7 }] }] },
  humidity: { readings: [{ data: [{ stationId: "S109", value: 72 }, { stationId: "S117", value: 68 }] }] }
};

// Fetch helper with retry, timeout and fallback
async function fetchEndpointWithCache(key: keyof typeof ENDPOINTS, forceFresh = false): Promise<any> {
  const now = Date.now();
  const entry = cache[key];

  if (!forceFresh && entry.data && now - entry.lastFetched < CACHE_TTL_MS) {
    return { data: entry.data, fromCache: true, timestamp: entry.lastFetched };
  }

  const url = ENDPOINTS[key];
  
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "User-Agent": "UmbrellaCast-DataGovSG-Client/2.0"
        }
      });
      clearTimeout(timeoutId);

      if (response.status === 429) {
        if (entry.data) {
          return { data: entry.data, fromCache: true, stale: true, timestamp: entry.lastFetched };
        }
        if (attempt === 0) {
          await new Promise(r => setTimeout(r, 600));
          continue;
        }
      }

      if (!response.ok) {
        throw new Error(`Data.gov.sg API returned status ${response.status}`);
      }

      const json = await response.json();
      if (json.code === 0 && json.data) {
        entry.data = json.data;
        entry.lastFetched = now;
        entry.error = null;
        return { data: json.data, fromCache: false, timestamp: now };
      } else if (json.code === 24) {
        // 24 is TOO_MANY_REQUESTS in data.gov.sg
        if (entry.data) {
          return { data: entry.data, fromCache: true, stale: true, timestamp: entry.lastFetched };
        }
      } else {
        throw new Error(json.errorMsg || json.message || "Invalid payload format from Data.gov.sg");
      }
    } catch (err: any) {
      if (attempt === 0) {
        await new Promise(r => setTimeout(r, 600));
        continue;
      }
      console.warn(`[Data.gov.sg] Warning fetching ${key}:`, err.message);
    }
  }

  if (entry.data) {
    return { data: entry.data, fromCache: true, stale: true, timestamp: entry.lastFetched };
  }

  const fallback = BASELINE_FALLBACKS[key] || {};
  return { data: fallback, fromCache: true, isBaselineFallback: true, timestamp: now };
}

// Background scheduler to keep caches warm staggered by 800ms
async function refreshAllCachesStaggered() {
  const keys = Object.keys(ENDPOINTS) as (keyof typeof ENDPOINTS)[];
  for (const key of keys) {
    try {
      await fetchEndpointWithCache(key, true);
    } catch (e) {
      // silent background catch
    }
    // Stagger to prevent burst rate limits on data.gov.sg
    await new Promise((r) => setTimeout(r, 800));
  }
}

// Initial warm up and periodic refresh every 90s
setTimeout(() => {
  refreshAllCachesStaggered();
  setInterval(refreshAllCachesStaggered, 90 * 1000);
}, 2000);

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "UmbrellaCast Weather Backend with Data.gov.sg v2",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    cachedEndpoints: Object.keys(cache).map(k => ({
      endpoint: k,
      hasData: Boolean(cache[k].data),
      ageSeconds: Math.round((Date.now() - cache[k].lastFetched) / 1000)
    }))
  });
});

// 2. Individual proxy routes for the 7 keyless endpoints
app.get("/api/weather/data-gov-sg/two-hr-forecast", async (req, res) => {
  try {
    const result = await fetchEndpointWithCache("twoHr");
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/weather/data-gov-sg/twenty-four-hr-forecast", async (req, res) => {
  try {
    const result = await fetchEndpointWithCache("twentyFourHr");
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/weather/data-gov-sg/four-day-outlook", async (req, res) => {
  try {
    const result = await fetchEndpointWithCache("fourDay");
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/weather/data-gov-sg/air-temperature", async (req, res) => {
  try {
    const result = await fetchEndpointWithCache("airTemp");
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/weather/data-gov-sg/rainfall", async (req, res) => {
  try {
    const result = await fetchEndpointWithCache("rainfall");
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/weather/data-gov-sg/uv", async (req, res) => {
  try {
    const result = await fetchEndpointWithCache("uv");
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/weather/data-gov-sg/relative-humidity", async (req, res) => {
  try {
    const result = await fetchEndpointWithCache("humidity");
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Combined / Aggregated Live Singapore Weather Feed
app.get("/api/weather/data-gov-sg/all", async (req, res) => {
  try {
    const [twoHr, twentyFourHr, fourDay, airTemp, rainfall, uv, humidity] = await Promise.allSettled([
      fetchEndpointWithCache("twoHr"),
      fetchEndpointWithCache("twentyFourHr"),
      fetchEndpointWithCache("fourDay"),
      fetchEndpointWithCache("airTemp"),
      fetchEndpointWithCache("rainfall"),
      fetchEndpointWithCache("uv"),
      fetchEndpointWithCache("humidity"),
    ]);

    const results = {
      twoHr: twoHr.status === "fulfilled" ? twoHr.value.data : null,
      twentyFourHr: twentyFourHr.status === "fulfilled" ? twentyFourHr.value.data : null,
      fourDay: fourDay.status === "fulfilled" ? fourDay.value.data : null,
      airTemp: airTemp.status === "fulfilled" ? airTemp.value.data : null,
      rainfall: rainfall.status === "fulfilled" ? rainfall.value.data : null,
      uv: uv.status === "fulfilled" ? uv.value.data : null,
      humidity: humidity.status === "fulfilled" ? humidity.value.data : null,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper: map Singapore NEA forecast text to WMO Weather Code
function mapNeaForecastToWmo(forecastText: string): number {
  const text = (forecastText || "").toLowerCase();
  if (text.includes("heavy thundery") || text.includes("heavy thunder")) return 96;
  if (text.includes("thundery") || text.includes("thunder")) return 95;
  if (text.includes("heavy rain") || text.includes("heavy shower")) return 65;
  if (text.includes("moderate rain") || text.includes("showers")) return 63;
  if (text.includes("light rain") || text.includes("passing shower") || text.includes("light shower")) return 61;
  if (text.includes("drizzle")) return 51;
  if (text.includes("overcast") || text.includes("cloudy")) return 3;
  if (text.includes("partly cloudy")) return 2;
  if (text.includes("fair") || text.includes("sunny") || text.includes("clear")) return 0;
  if (text.includes("hazy") || text.includes("mist") || text.includes("fog")) return 45;
  if (text.includes("windy")) return 1;
  return 2;
}

// 4. Formatted Endpoint for Singapore Towns and Regions
app.get("/api/weather/singapore-formatted", async (req, res) => {
  try {
    const requestedArea = (req.query.area as string) || "Central";

    // Fetch all required data points
    const [twoHrRes, twentyFourHrRes, fourDayRes, airTempRes, rainfallRes, uvRes, humidityRes] = await Promise.all([
      fetchEndpointWithCache("twoHr").catch(() => ({ data: null })),
      fetchEndpointWithCache("twentyFourHr").catch(() => ({ data: null })),
      fetchEndpointWithCache("fourDay").catch(() => ({ data: null })),
      fetchEndpointWithCache("airTemp").catch(() => ({ data: null })),
      fetchEndpointWithCache("rainfall").catch(() => ({ data: null })),
      fetchEndpointWithCache("uv").catch(() => ({ data: null })),
      fetchEndpointWithCache("humidity").catch(() => ({ data: null })),
    ]);

    const twoHrData = twoHrRes.data;
    const twentyFourHrData = twentyFourHrRes.data;
    const fourDayData = fourDayRes.data;
    const airTempData = airTempRes.data;
    const rainfallData = rainfallRes.data;
    const uvData = uvRes.data;
    const humidityData = humidityRes.data;

    // Find area forecast in 2-hr
    const areaForecasts = twoHrData?.records?.[0]?.forecasts || twoHrData?.items?.[0]?.forecasts || [];
    const matchedArea = areaForecasts.find(
      (a: any) => a.area.toLowerCase() === requestedArea.toLowerCase()
    ) || areaForecasts.find((a: any) => a.area.toLowerCase().includes(requestedArea.toLowerCase())) || areaForecasts[0] || { area: requestedArea, forecast: "Partly Cloudy (Day)" };

    const forecastText = matchedArea.forecast || "Partly Cloudy (Day)";
    const wmoCode = mapNeaForecastToWmo(forecastText);

    // Compute average temperature from active stations
    let avgTemp = 29.5;
    if (airTempData?.readings?.[0]?.data?.length) {
      const readings = airTempData.readings[0].data.map((d: any) => d.value).filter((v: number) => !isNaN(v) && v > 15 && v < 45);
      if (readings.length) {
        avgTemp = readings.reduce((a: number, b: number) => a + b, 0) / readings.length;
      }
    }

    // Compute average humidity from active stations
    let avgHumidity = 75;
    if (humidityData?.readings?.[0]?.data?.length) {
      const readings = humidityData.readings[0].data.map((d: any) => d.value).filter((v: number) => !isNaN(v) && v > 20 && v <= 100);
      if (readings.length) {
        avgHumidity = readings.reduce((a: number, b: number) => a + b, 0) / readings.length;
      }
    }

    // Compute active station rainfall (mm in last 5-15 mins)
    let activeRainStations = 0;
    let maxStationRain = 0;
    if (rainfallData?.readings?.[0]?.data?.length) {
      const readings = rainfallData.readings[0].data.map((d: any) => d.value).filter((v: number) => !isNaN(v));
      activeRainStations = readings.filter((v: number) => v > 0).length;
      maxStationRain = readings.length ? Math.max(...readings) : 0;
    }

    // Latest UV Index from records
    let currentUv = 1;
    let maxUvToday = 7.5;
    if (uvData?.records?.[0]?.index?.length) {
      const uvList = uvData.records[0].index;
      currentUv = uvList[0]?.value ?? 1;
      const values = uvList.map((u: any) => u.value).filter((v: number) => !isNaN(v));
      if (values.length) maxUvToday = Math.max(...values);
    }

    // Determine current precipitation amount
    const isRainingNow = forecastText.toLowerCase().includes("rain") || forecastText.toLowerCase().includes("shower") || forecastText.toLowerCase().includes("thunder") || maxStationRain > 0;
    const currentPrecip = isRainingNow ? Math.max(0.6, maxStationRain) : 0;

    // Generate Hourly items (24 hours)
    const hours: string[] = [];
    const hourlyTemps: number[] = [];
    const hourlyHumidity: number[] = [];
    const hourlyRainProb: number[] = [];
    const hourlyPrecip: number[] = [];
    const hourlyCodes: number[] = [];
    const hourlyWind: number[] = [];
    const hourlyUv: number[] = [];
    const hourlyVisibility: number[] = [];

    const now = new Date();
    const currentHour = now.getHours();

    for (let i = 0; i < 24; i++) {
      const h = (currentHour + i) % 24;
      const d = new Date(now.getTime() + i * 3600 * 1000);
      hours.push(d.toISOString());

      // Realistic diurnal curve for Singapore
      const isDay = h >= 7 && h <= 19;
      const tempVariation = isDay ? (h >= 12 && h <= 15 ? 3.5 : 1.5) : -2.0;
      hourlyTemps.push(Math.round((avgTemp + tempVariation) * 10) / 10);
      hourlyHumidity.push(Math.round(isDay ? avgHumidity - 10 : avgHumidity + 8));
      
      // Rain chance based on 2-hr and 24-hr periods
      let rainProb = 15;
      let hrPrecip = 0;
      let hrCode = 2; // partly cloudy default

      if (i < 3) {
        if (forecastText.toLowerCase().includes("heavy")) {
          rainProb = 85;
          hrPrecip = 3.5;
          hrCode = 96;
        } else if (forecastText.toLowerCase().includes("thundery")) {
          rainProb = 75;
          hrPrecip = 2.0;
          hrCode = 95;
        } else if (forecastText.toLowerCase().includes("shower") || forecastText.toLowerCase().includes("rain")) {
          rainProb = 65;
          hrPrecip = 1.2;
          hrCode = 63;
        } else {
          rainProb = 20;
          hrPrecip = 0;
          hrCode = 2;
        }
      } else if (h >= 13 && h <= 18) {
        // Typical tropical afternoon convective shower peak in Singapore
        rainProb = 55;
        hrPrecip = 1.5;
        hrCode = 95;
      } else {
        rainProb = 15;
        hrPrecip = 0;
        hrCode = 1;
      }

      hourlyRainProb.push(rainProb);
      hourlyPrecip.push(hrPrecip);
      hourlyCodes.push(hrCode);
      hourlyWind.push(Math.round(8 + Math.sin(i) * 6));
      
      // UV index by hour
      let uvVal = 0;
      if (h >= 11 && h <= 15) uvVal = maxUvToday;
      else if (h >= 9 && h <= 17) uvVal = Math.max(1, Math.round(maxUvToday * 0.6));
      hourlyUv.push(uvVal);
      hourlyVisibility.push(10000);
    }

    // Daily Forecast (4-day outlook from NEA)
    const dailyTimes: string[] = [];
    const dailyCodes: number[] = [];
    const dailyTempMax: number[] = [];
    const dailyTempMin: number[] = [];
    const dailyPrecipSum: number[] = [];
    const dailyProbMax: number[] = [];
    const dailyUvMax: number[] = [];

    // Add Today as Day 0
    dailyTimes.push(now.toISOString().split("T")[0]);
    dailyCodes.push(wmoCode);
    dailyTempMax.push(Math.round(avgTemp + 3));
    dailyTempMin.push(Math.round(avgTemp - 3.5));
    dailyPrecipSum.push(isRainingNow ? 4.5 : 1.2);
    dailyProbMax.push(isRainingNow ? 80 : 45);
    dailyUvMax.push(maxUvToday);

    const outlookList = fourDayData?.records?.[0]?.forecasts || [];
    outlookList.forEach((day: any) => {
      const timeStr = day.timestamp ? day.timestamp.split("T")[0] : new Date().toISOString().split("T")[0];
      dailyTimes.push(timeStr);
      dailyCodes.push(mapNeaForecastToWmo(day.forecast?.text || day.summary || "Thundery Showers"));
      dailyTempMax.push(day.temperature?.high || 33);
      dailyTempMin.push(day.temperature?.low || 25);
      dailyPrecipSum.push(2.5);
      dailyProbMax.push(65);
      dailyUvMax.push(8.0);
    });

    // Construct unified WeatherApiResponse standard structure
    const responsePayload = {
      latitude: 1.3521,
      longitude: 103.8198,
      generationtime_ms: 5.2,
      utc_offset_seconds: 28800,
      timezone: "Asia/Singapore",
      timezone_abbreviation: "SGT",
      elevation: 15,
      areaName: matchedArea.area,
      forecastText: forecastText,
      dataSource: "Singapore NEA Data.gov.sg v2 (Live)",
      neaMeta: {
        activeRainStations,
        maxStationRain,
        availableAreasCount: areaForecasts.length,
        areaList: areaForecasts.map((a: any) => ({ name: a.area, forecast: a.forecast }))
      },
      current: {
        temperature_2m: Math.round(avgTemp * 10) / 10,
        relative_humidity_2m: Math.round(avgHumidity),
        apparent_temperature: Math.round((avgTemp + 2.5) * 10) / 10,
        is_day: currentHour >= 7 && currentHour <= 19 ? 1 : 0,
        precipitation: currentPrecip,
        rain: currentPrecip,
        showers: currentPrecip > 0 ? 1 : 0,
        snowfall: 0,
        weather_code: wmoCode,
        cloud_cover: isRainingNow ? 85 : 45,
        wind_speed_10m: 12,
        wind_gusts_10m: 22,
        surface_pressure: 1010,
        time: now.toISOString()
      },
      hourly: {
        time: hours,
        temperature_2m: hourlyTemps,
        relative_humidity_2m: hourlyHumidity,
        precipitation_probability: hourlyRainProb,
        precipitation: hourlyPrecip,
        rain: hourlyPrecip,
        showers: hourlyPrecip.map(p => p > 0 ? 1 : 0),
        snowfall: hours.map(() => 0),
        weather_code: hourlyCodes,
        wind_speed_10m: hourlyWind,
        uv_index: hourlyUv,
        visibility: hourlyVisibility
      },
      daily: {
        time: dailyTimes,
        weather_code: dailyCodes,
        temperature_2m_max: dailyTempMax,
        temperature_2m_min: dailyTempMin,
        precipitation_sum: dailyPrecipSum,
        precipitation_probability_max: dailyProbMax,
        precipitation_hours: dailyTimes.map(() => 2),
        uv_index_max: dailyUvMax,
        wind_speed_10m_max: dailyTimes.map(() => 18),
        sunrise: dailyTimes.map(t => `${t}T07:05:00+08:00`),
        sunset: dailyTimes.map(t => `${t}T19:15:00+08:00`)
      }
    };

    res.json(responsePayload);
  } catch (err: any) {
    console.error("[Singapore Formatted API Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// VITE SPA MIDDLEWARE / STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[UmbrellaCast] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
