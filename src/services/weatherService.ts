// src/services/weatherService.ts

export interface ForecastDay {
  date: string;
  temp: number;
  condition: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  lastUpdated: string;
  forecast: ForecastDay[];
  hourly: HourlyForecast[];
}

const conditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"];

const generateForecast = (): ForecastDay[] => {
  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return {
      date: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      temp: 18 + Math.random() * 10,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
    };
  });
};

const generateHourly = (): HourlyForecast[] => {
  return Array.from({ length: 24 }).map((_, i) => {
    const date = new Date();
    date.setHours(date.getHours() + i + 1);
    return {
      time: date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
      temp: 20 + Math.sin(i / 3) * 5, // Creates a nice temp curve throughout the day
      condition: conditions[Math.floor(Math.random() * conditions.length)],
    };
  });
};

const mockWeather = {
  city: "San Francisco",
  temperature: 22,
  condition: "Partly Cloudy",
  humidity: 65,
  windSpeed: 10,
};

// Maps OpenWeatherMap codes to our simple conditions
const mapCondition = (id: number): string => {
  if (id >= 200 && id < 600) return "Rainy";
  if (id >= 600 && id < 700) return "Snowy";
  if (id >= 801 && id <= 804) return "Cloudy";
  if (id === 800) return "Sunny";
  return "Partly Cloudy";
};

export const fetchWeather = async (city?: string, lat?: number, lon?: number): Promise<WeatherData> => {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  // Real API fetching if key is present
  if (apiKey && apiKey !== "YOUR_API_KEY_HERE") {
    try {
      let queryParams = city ? `q=${city}` : `lat=${lat}&lon=${lon}`;
      
      const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?${queryParams}&appid=${apiKey}&units=metric`);
      if (!currentRes.ok) throw new Error("City not found");
      const currentData = await currentRes.json();

      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${queryParams}&appid=${apiKey}&units=metric`);
      const forecastData = await forecastRes.json();

      // Extract 24 hour forecast (every 3 hours from API, we'll map to 8 items)
      const hourly: HourlyForecast[] = forecastData.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
        temp: item.main.temp,
        condition: mapCondition(item.weather[0].id),
      }));

      // Extract 5-day forecast (grabbing 1 reading per day)
      const dailyMap = new Map();
      forecastData.list.forEach((item: any) => {
        const dateStr = new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        if (!dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, {
            date: dateStr,
            temp: item.main.temp,
            condition: mapCondition(item.weather[0].id),
          });
        }
      });
      const forecast: ForecastDay[] = Array.from(dailyMap.values()).slice(0, 5);

      return {
        city: currentData.name,
        temperature: currentData.main.temp,
        condition: mapCondition(currentData.weather[0].id),
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
        lastUpdated: new Date().toLocaleTimeString(),
        forecast,
        hourly,
      };
    } catch (e) {
      console.warn("Real API failed, falling back to mock data.", e);
    }
  }

  // Fallback to Mock Data
  await new Promise((resolve) => setTimeout(resolve, 800));

  let finalCity = city || mockWeather.city;
  if (!city && lat && lon) {
    finalCity = "Local Weather (Demo)";
  }

  return {
    ...mockWeather,
    city: finalCity,
    temperature: mockWeather.temperature + (Math.random() * 2 - 1),
    lastUpdated: new Date().toLocaleTimeString(),
    forecast: generateForecast(),
    hourly: generateHourly(),
  };
};
