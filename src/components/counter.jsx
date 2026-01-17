import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const StatsSection = () => {
  const [statsSettings, setStatsSettings] = useState({
    stats: [],
    backgroundColor: "bg-black",
  });
  const [counts, setCounts] = useState([]);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-50px" });

  // ---------------- FETCH SETTINGS ----------------
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/stats`);
        const data = await res.json();
        if (data) {
          setStatsSettings(data);
          setCounts(data.stats.map(() => 0));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  // ---------------- ANIMATE COUNTS ----------------
  useEffect(() => {
    if (!inView || !statsSettings.stats.length) return;

    statsSettings.stats.forEach((stat, idx) => {
      const duration = 1500;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(progress * stat.target);

        setCounts((prev) => {
          const next = [...prev];
          next[idx] = value;
          return next;
        });

        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    });
  }, [inView, statsSettings]);

  // ---------------- RENDER ----------------
  return (
    <section
      ref={sectionRef}
      className={`${statsSettings.backgroundColor || "bg-black"} py-20 font-sans text-white`}
    >
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 text-center gap-12">
        {statsSettings.stats.length ? (
          statsSettings.stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
            >
              <h3
                style={{ color: stat.color || "white" }}
                className="text-5xl font-extrabold"
              >
                {counts[idx] || 0}
                {stat.plus ? "+" : ""}
              </h3>
              <p className="mt-3 text-lg font-medium text-gray-300">{stat.label}</p>
            </motion.div>
          ))
        ) : (
          <p className="text-white col-span-3 text-center">Loading stats...</p>
        )}
      </div>
    </section>
  );
};

export default StatsSection;
