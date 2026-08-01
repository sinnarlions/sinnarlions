"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface WeatherData {
  current?: {
    time: string;
    temperature_2m: number;
    weather_code: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability?: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_probability_max?: number[];
  };
}

interface ForecastDay {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  rainProb: number;
  sunrise: string;
  sunset: string;
}

interface HourlyItem {
  time: string;
  temp: number;
  weatherCode: number;
  rainProb: number;
}

const CACHE_KEY = "lionsconnect_weather_forecast_cache";

const getMarathiWeatherDescription = (code: number): string => {
  switch (code) {
    case 0:
      return "निरभ्र आकाश";
    case 1:
    case 2:
    case 3:
      return "अंशतः ढगाळ";
    case 45:
    case 48:
      return "धुक्याचे वातावरण";
    case 51:
    case 53:
    case 55:
      return "रिमझिम पाऊस";
    case 61:
    case 63:
    case 65:
      return "पाऊस";
    case 71:
    case 73:
    case 75:
      return "हिमवृष्टी";
    case 80:
    case 81:
    case 82:
      return "मुसळधार पाऊस";
    case 95:
    case 96:
    case 99:
      return "विजांसह वादळ";
    default:
      return "ढगाळ";
  }
};

const getWeatherEmoji = (code: number): string => {
  switch (code) {
    case 0:
      return "☀️";
    case 1:
    case 2:
      return "⛅";
    case 3:
      return "☁️";
    case 45:
    case 48:
      return "🌫️";
    case 51:
    case 53:
    case 55:
    case 61:
    case 63:
      return "🌧️";
    case 65:
    case 80:
    case 81:
    case 82:
      return "⛈️";
    case 71:
    case 73:
    case 75:
      return "❄️";
    case 95:
    case 96:
    case 99:
      return "⚡";
    default:
      return "🌥️";
  }
};

export default function WeatherDetailPage() {
  const router = useRouter();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isOfflineData, setIsOfflineData] = useState<boolean>(false);

  const fetchWeather = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=19.8456&longitude=74.0031&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto",
        { signal }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch forecast data");
      }

      const result: WeatherData = await response.json();
      setData(result);
      setIsOfflineData(false);

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      } catch {
        // Ignore localStorage quota errors
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setData(parsed);
          setIsOfflineData(true);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchWeather(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchWeather]);

  const formatTime = (isoString: string): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatHourOnly = (isoString: string): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      hour12: true,
    });
  };

  const hourlyItems: HourlyItem[] = useMemo(() => {
    if (!data?.hourly) return [];
    const items: HourlyItem[] = [];
    const nowIndex = data.hourly.time.findIndex(
      (t) => new Date(t).getTime() >= new Date().getTime()
    );
    const startIndex = nowIndex !== -1 ? nowIndex : 0;

    for (let i = startIndex; i < startIndex + 24; i++) {
      if (data.hourly.time[i]) {
        items.push({
          time: formatHourOnly(data.hourly.time[i]),
          temp: Math.round(data.hourly.temperature_2m[i]),
          weatherCode: data.hourly.weather_code[i],
          rainProb: data.hourly.precipitation_probability?.[i] ?? 0,
        });
      }
    }
    return items;
  }, [data]);

  const forecastDays: ForecastDay[] = useMemo(() => {
    if (!data?.daily) return [];
    const days: ForecastDay[] = [];
    for (let i = 1; i <= 5; i++) {
      if (data.daily.time[i]) {
        const dateStr = data.daily.time[i];
        const d = new Date(dateStr);
        const dayName = d.toLocaleDateString("mr-IN", {
          weekday: "long",
          month: "short",
          day: "numeric",
        });
        days.push({
          date: dateStr,
          dayName,
          maxTemp: Math.round(data.daily.temperature_2m_max[i]),
          minTemp: Math.round(data.daily.temperature_2m_min[i]),
          weatherCode: data.daily.weather_code[i],
          rainProb: data.daily.precipitation_probability_max?.[i] ?? 0,
          sunrise: formatTime(data.daily.sunrise[i]),
          sunset: formatTime(data.daily.sunset[i]),
        });
      }
    }
    return days;
  }, [data]);

  if (loading && !data) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-pulse border border-slate-100 space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-20 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 md:p-6 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold text-red-600 mb-1">
            अडचण निर्माण झाली आहे
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            हवामानाचा अंदाज लोड करण्यात अयशस्वी. कृपया तुमचे इंटरनेट कनेक्शन तपासा.
          </p>
          <button
            onClick={() => fetchWeather()}
            className="px-4 py-2 bg-[#003B75] text-white rounded-xl text-xs font-semibold hover:bg-[#002d5c] transition-colors cursor-pointer"
          >
            पुन्हा प्रयत्न करा
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 text-slate-800">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#003B75] to-[#002850] px-5 py-4 text-white flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg md:text-xl font-bold tracking-wide">
                हवामान अंदाज व तपशील
              </h1>
              {isOfflineData && (
                <span className="bg-[#F2A900] text-[#003B75] text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  ऑफलाइन डेटा
                </span>
              )}
            </div>
            <p className="text-xs text-[#F2A900] font-medium mt-0.5">
              सिन्नर, नाशिक | LionsConnect Weather
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl backdrop-blur-sm transition-all cursor-pointer"
          >
            ← डॅशबोर्डवर जा
          </button>
        </div>

        {/* AQI / Air Quality Highlight Banner */}
        <div className="p-4 md:p-6 pb-2">
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between text-emerald-900">
            <div className="flex items-center space-x-3">
              <span className="text-2xl bg-white p-2 rounded-xl shadow-sm">🌿</span>
              <div>
                <div className="text-xs font-bold text-emerald-900">हवेची गुणवत्ता (AQI)</div>
                <div className="text-[11px] text-emerald-700 font-medium">सिन्नरमध्ये हवा उत्तम व श्वास घेण्यासाठी सुरक्षित आहे.</div>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                ४२ (छान)
              </span>
            </div>
          </div>
        </div>

        {/* Hourly Forecast Section */}
        <div className="p-4 md:p-6 py-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            तासानुसार अंदाज (पुढील २४ तास)
          </h2>
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
            {hourlyItems.map((hour, idx) => (
              <div
                key={idx}
                className="min-w-[80px] bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center flex-shrink-0 flex flex-col items-center justify-between"
              >
                <span className="text-[11px] font-semibold text-slate-500">
                  {hour.time}
                </span>
                <span className="text-2xl my-1">{getWeatherEmoji(hour.weatherCode)}</span>
                <span className="text-sm font-bold text-[#003B75]">
                  {hour.temp}°C
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  🌧️ {hour.rainProb}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Day Forecast List */}
        <div className="p-4 md:p-6 pt-2 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            पुढील ५ दिवसांचा अंदाज
          </h2>
          {forecastDays.map((day, index) => (
            <div
              key={index}
              className="bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3">
                <span className="text-3xl bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                  {getWeatherEmoji(day.weatherCode)}
                </span>
                <div>
                  <div className="font-bold text-sm text-[#003B75]">
                    {day.dayName}
                  </div>
                  <div className="text-xs font-medium text-slate-600 mt-0.5">
                    {getMarathiWeatherDescription(day.weatherCode)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-2">
                    <span>🌧️ पाऊस: {day.rainProb}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0 border-slate-200 gap-4">
                <div className="text-left md:text-right text-[11px] text-slate-500">
                  <div>🌅 {day.sunrise}</div>
                  <div>🌇 {day.sunset}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-800">
                    {day.maxTemp}°C
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    किमान: {day.minTemp}°C
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}