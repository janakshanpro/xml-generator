// src/components/WeatherBackground.tsx
import styles from './WeatherBackground.module.css';

interface Props {
  condition?: string;
}

export default function WeatherBackground({ condition }: Props) {
  const weatherStr = condition?.toLowerCase() || '';
  const isRainy = weatherStr.includes('rain') || weatherStr.includes('drizzle') || weatherStr.includes('storm');
  const isCloudy = weatherStr.includes('cloud') && !weatherStr.includes('partly');
  const isPartlyCloudy = weatherStr.includes('partly');
  const isSunny = weatherStr.includes('sun') || weatherStr.includes('clear');

  let weatherClass = styles.default;
  if (isRainy) weatherClass = styles.rainy;
  else if (isCloudy) weatherClass = styles.cloudy;
  else if (isPartlyCloudy) weatherClass = styles.partlyCloudy;
  else if (isSunny) weatherClass = styles.sunny;

  return (
    <div className={`${styles.background} ${weatherClass}`}>
      {isRainy && (
        <div className={styles.rainContainer}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className={styles.raindrop}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 0.4}s`
              }}
            ></div>
          ))}
        </div>
      )}
      {(isSunny || isPartlyCloudy) && <div className={styles.sun}></div>}
      {(isCloudy || isPartlyCloudy) && (
        <div className={styles.cloudsContainer}>
          <div className={styles.cloud} style={{ top: '10%', animationDuration: '40s' }}></div>
          <div className={styles.cloud} style={{ top: '30%', animationDuration: '55s', animationDelay: '-15s', transform: 'scale(1.5)' }}></div>
          <div className={styles.cloud} style={{ top: '50%', animationDuration: '45s', animationDelay: '-30s', opacity: 0.5 }}></div>
          <div className={styles.cloud} style={{ top: '70%', animationDuration: '65s', animationDelay: '-10s', transform: 'scale(0.8)', opacity: 0.3 }}></div>
        </div>
      )}
      <div className={styles.overlay}></div>
    </div>
  );
}
