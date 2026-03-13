// src/components/WeatherCard.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchWeather, WeatherData } from "@/services/weatherService";
import styles from "./WeatherCard.module.css";
import WeatherBackground from "./WeatherBackground";
import { MapPin, Search, Wind, Droplets, Clock, Cloud, Sun, CloudRain, CloudSun, History } from "lucide-react";

const UPDATE_INTERVAL = 300000; // 5 minutes

// Helper to map weather to icons
const WeatherIcon = ({ condition, size = 24 }: { condition: string; size?: number }) => {
  const cond = condition.toLowerCase();
  if (cond.includes("rain") || cond.includes("snow")) return <CloudRain size={size} />;
  if (cond.includes("partly")) return <CloudSun size={size} />;
  if (cond.includes("cloud")) return <Cloud size={size} />;
  return <Sun size={size} />;
};

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("San Francisco");
  const [locating, setLocating] = useState(false);
  
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  const saveRecentSearch = (searchCity: string) => {
    if (searchCity === "Your Location" || searchCity === "Local Weather (Demo)") return;
    
    setRecentSearches(prev => {
      const updated = [searchCity, ...prev.filter(c => c !== searchCity)].slice(0, 4);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  const updateWeather = async (searchCity?: string, lat?: number, lon?: number) => {
    setLoading(true);
    try {
      const data = await fetchWeather(searchCity, lat, lon);
      setWeather(data);
      if (data.city && data.city !== "Local Weather (Demo)") {
         saveRecentSearch(data.city);
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch weather data. Please check city name.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getInitialLocation = () => {
      if (!navigator.geolocation) {
        updateWeather(city);
        return;
      }

      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCity("Your Location");
          updateWeather(undefined, latitude, longitude);
          setLocating(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          updateWeather(city); 
          setLocating(false);
        }
      );
    };

    getInitialLocation();
  }, []); 

  const handleCityChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.currentTarget.elements[0] as HTMLInputElement).value;
    if (input) {
      setCity(input);
      updateWeather(input);
    }
  };

  const handleRecentClick = (recentCity: string) => {
    setCity(recentCity);
    updateWeather(recentCity);
  };

  const toggleUnit = () => {
    setUnit(prev => prev === 'C' ? 'F' : 'C');
  };

  const displayTemp = (tempC: number, exact = true) => {
    const temp = unit === 'F' ? (tempC * 9/5) + 32 : tempC;
    return exact ? temp.toFixed(1) : temp.toFixed(0);
  };

  if ((loading || locating) && !weather) {
    return (
      <>
        <WeatherBackground />
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Scanning the skies...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <WeatherBackground condition={weather?.condition} />
      <div className={styles.card}>
        <div className={styles.headerControls}>
           <form onSubmit={handleCityChange} className={styles.search}>
             <div className={styles.searchInputWrapper}>
               <Search className={styles.searchIcon} size={18} />
               <input type="text" placeholder="Search city..." defaultValue={city === "Your Location" ? "" : city} />
             </div>
             <button type="submit">Search</button>
           </form>
           <button onClick={toggleUnit} className={styles.unitToggle} title="Toggle Celsius/Fahrenheit">
              °{unit}
           </button>
        </div>

        {recentSearches.length > 0 && (
          <div className={styles.recentSearches}>
            <History size={14} />
            {recentSearches.map(term => (
              <span key={term} className={styles.searchTag} onClick={() => handleRecentClick(term)}>
                {term}
              </span>
            ))}
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        {weather && (
          <div className={styles.content}>
            <div className={styles.cityHeader}>
              <MapPin size={20} className={styles.accentIcon} />
              <h1 className={styles.city}>{weather.city}</h1>
            </div>
            
            <div className={styles.updateBadge}>
              <Clock size={12} />
              <span>{weather.lastUpdated}</span>
            </div>
            
            <div className={styles.mainInfo}>
              <div className={styles.conditionIconWrapper}>
                <WeatherIcon condition={weather.condition} size={80} />
              </div>
              <div className={styles.tempWrapper}>
                <span className={styles.temp}>{displayTemp(weather.temperature)}°</span>
                <span className={styles.condition}>{weather.condition}</span>
              </div>
            </div>

            <div className={styles.details}>
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}><Droplets size={20} /></div>
                <div className={styles.detailText}>
                  <span>Humidity</span>
                  <strong>{weather.humidity}%</strong>
                </div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}><Wind size={20} /></div>
                <div className={styles.detailText}>
                  <span>Wind Speed</span>
                  <strong>{weather.windSpeed} km/h</strong>
                </div>
              </div>
            </div>

            <div className={styles.forecastContainer}>
              <div className={styles.forecast}>
                <h3>Today</h3>
                <div className={styles.forecastScroll}>
                  {weather.hourly.map((hour, idx) => (
                    <div key={idx} className={styles.forecastItem}>
                      <span className={styles.forecastDate}>{hour.time}</span>
                      <div className={styles.forecastIcon}>
                        <WeatherIcon condition={hour.condition} size={20} />
                      </div>
                      <span className={styles.forecastTemp}>{displayTemp(hour.temp, false)}°</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.forecast}>
                <h3>Weekly</h3>
                <div className={styles.forecastScroll}>
                  {weather.forecast.map((day, idx) => (
                    <div key={idx} className={styles.forecastItem}>
                      <span className={styles.forecastDate}>{day.date.split(',')[0]}</span>
                      <div className={styles.forecastIcon}>
                        <WeatherIcon condition={day.condition} size={20} />
                      </div>
                      <span className={styles.forecastTemp}>{displayTemp(day.temp, false)}°</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
