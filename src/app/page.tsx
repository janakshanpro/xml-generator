// src/app/page.tsx
import WeatherCard from "@/components/WeatherCard";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.badge}>Live Environment</div>
          <h1>SkyCast <span className={styles.light}>Realtime</span></h1>
          <p>Next-generation weather insights with hyper-local precision.</p>
        </header>
        
        <WeatherCard />

        <footer className={styles.footer}>
          <p>© 2026 SkyCast Labs • Powered by Next.js App Router</p>
        </footer>
      </div>
    </main>
  );
}
