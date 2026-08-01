"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface WeatherData {
  current: {
    temperature_2m: number;
    weather_code: number;
    relativehumidity_2m: number;
    wind_speed_10m: number;
    precipitation_probability?: number;
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

const CACHE_KEY = "lionsconnect_weather_cache";

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

export default function WeatherCard() {
  const router = useRouter();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isOfflineData, setIsOfflineData] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchWeather = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=19.8456&longitude=74.0031&current=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto",
        { signal }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const result: WeatherData = await response.json();
      setData(result);
      setIsOfflineData(false);
      const currentTime = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastUpdated(currentTime);

      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ result, lastUpdated: currentTime })
        );
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
          setData(parsed.result);
          setLastUpdated(parsed.lastUpdated || "");
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

    const intervalId = setInterval(() => {
      const refreshController = new AbortController();
      fetchWeather(refreshController.signal);
    }, 30 * 60 * 1000);

    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, [fetchWeather]);

  const handleRefresh = () => {
    if (!loading) {
      const controller = new AbortController();
      fetchWeather(controller.signal);
    }
  };

  const currentTemp = data ? Math.round(data.current.temperature_2m) : 0;
  const weatherCode = data ? data.current.weather_code : 0;
  const conditionMarathi = useMemo(
    () => getMarathiWeatherDescription(weatherCode),
    [weatherCode]
  );
  const weatherEmoji = useMemo(() => getWeatherEmoji(weatherCode), [weatherCode]);
  const humidity = data ? data.current.relativehumidity_2m : 0;
  const windSpeed = data ? data.current.wind_speed_10m : 0;
  const rainProb = data
    ? data.daily.precipitation_probability_max?.[0] ??
      data.current.precipitation_probability ??
      0
    : 0;

  const formatTime = (isoString: string): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const sunrise = data?.daily.sunrise?.[0]
    ? formatTime(data.daily.sunrise[0])
    : "उपलब्ध नाही";
  const sunset = data?.daily.sunset?.[0]
    ? formatTime(data.daily.sunset[0])
    : "उपलब्ध नाही";

  const todayMax = data ? Math.round(data.daily.temperature_2m_max[0]) : 0;
  const todayMin = data ? Math.round(data.daily.temperature_2m_min[0]) : 0;

  const alertMessage = useMemo(() => {
    if (rainProb > 70) {
      return "☔ आज छत्री सोबत ठेवा.";
    }
    if (currentTemp > 38) {
      return "🥵 उष्णतेची तीव्रता जास्त आहे.";
    }
    if (windSpeed > 30) {
      return "💨 जोरदार वारे वाहत आहेत.";
    }
    return "✅ हवामान सामान्य आहे.";
  }, [rainProb, currentTemp, windSpeed]);

  if (loading && !data) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-xl p-4 animate-pulse border border-slate-100">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
        <div className="flex items-center justify-between my-3">
          <div className="h-10 bg-slate-200 rounded w-1/3"></div>
          <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          <div className="h-10 bg-slate-200 rounded-xl"></div>
          <div className="h-10 bg-slate-200 rounded-xl"></div>
          <div className="h-10 bg-slate-200 rounded-xl"></div>
          <div className="h-10 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-xl p-5 text-center border border-slate-100">
        <div className="text-2xl mb-1.5">⚠️</div>
        <h3 className="text-xs font-bold text-red-600 mb-1">
          अडचण निर्माण झाली आहे
        </h3>
        <p className="text-[10px] text-slate-500 mb-2.5">
          हवामान माहिती लोड करण्यात अयशस्वी. कृपया तुमचे इंटरनेट कनेक्शन तपासा.
        </p>
        <button
          onClick={handleRefresh}
          className="px-3 py-1 bg-[#003B75] text-white rounded-xl text-[11px] font-semibold hover:bg-[#002d5c] transition-colors"
        >
          पुन्हा प्रयत्न करा
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100 text-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#003B75] to-[#002850] px-4 py-2.5 text-white relative">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm md:text-base font-bold tracking-wide">
                सिन्नर, नाशिक
              </h2>
              {isOfflineData && (
                <span className="bg-[#F2A900] text-[#003B75] text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  ऑफलाइन डेटा
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#F2A900] font-medium leading-none mt-0.5">
              LionsConnect Weather
            </p>
          </div>
          <span className="text-lg bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
            {weatherEmoji}
          </span>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {currentTemp}°C
            </div>
            <div className="text-[11px] md:text-xs font-medium text-slate-100">
              {conditionMarathi}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-300">कमाल / किमान</div>
            <div className="text-[11px] md:text-xs font-semibold mt-0.5">
              {todayMax}°C / {todayMin}°C
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 space-y-2">
        {/* Alert Strip */}
        <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-2.5 py-1.5 flex items-center space-x-2 text-amber-900 font-medium text-[11px] shadow-sm">
          <span>{alertMessage}</span>
        </div>

        {/* Four Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-100 flex items-center space-x-2">
            <span className="text-base">💧</span>
            <div>
              <div className="text-[9px] text-slate-500 font-medium leading-none mb-0.5">आर्द्रता</div>
              <div className="text-[11px] font-bold text-[#003B75]">
                {humidity}%
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-100 flex items-center space-x-2">
            <span className="text-base">💨</span>
            <div>
              <div className="text-[9px] text-slate-500 font-medium leading-none mb-0.5">वारा</div>
              <div className="text-[11px] font-bold text-[#003B75]">
                {windSpeed} किमी/तास
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-100 flex items-center space-x-2">
            <span className="text-base">🌧️</span>
            <div>
              <div className="text-[9px] text-slate-500 font-medium leading-none mb-0.5">पावसाची शक्यता</div>
              <div className="text-[11px] font-bold text-[#003B75]">
                {rainProb}%
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-100 flex items-center space-x-2">
            <span className="text-sm">☀️</span>
            <div>
              <div className="text-[9px] text-slate-500 font-medium leading-none mb-0.5">सुर्योदय / सूर्यास्त</div>
              <div className="text-[9px] font-bold text-[#003B75] leading-tight">
                🌅 {sunrise}
              </div>
              <div className="text-[9px] font-bold text-[#003B75] leading-tight mt-0.5">
                🌇 {sunset}
              </div>
            </div>
          </div>
        </div>

        {/* More Weather Button */}
        <div>
          <button
            onClick={() => router.push("/weather")}
            className="w-full rounded-xl border border-[#003B75] bg-[#EEF6FF] text-[#003B75] font-semibold py-1.5 text-[11px] hover:bg-[#E2F0FF] transition-all cursor-pointer"
          >
            🌦️ अधिक हवामान माहिती →
          </button>
        </div>

        {/* Footer / Refresh Section */}
        <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
          <span>शेवटचे अपडेट: {lastUpdated}</span>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-1 text-[#003B75] font-semibold hover:underline disabled:opacity-50 py-0.5 cursor-pointer"
          >
            {loading && (
              <svg
                className="animate-spin h-3 w-3 text-[#003B75]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span>रिफ्रेश करा</span>
          </button>
        </div>
      </div>
    </div>
  );
}