import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const StatsSection = ({ statsSettings = { stats: [], backgroundColor: "bg-black" } }) => {
  const [counts, setCounts] = useState([]);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-50px" });

  // Initialize counts array once when statsSettings changes
  useEffect(() => {
    if (statsSettings?.stats?.length) {
      setCounts(statsSettings.stats.map(() => 0));
    }
  }, [statsSettings]);

  // Animate counts when section enters viewport
  useEffect(() => {
    if (!inView || !statsSettings?.stats?.length || counts.length === 0) return;

    statsSettings.stats.forEach((stat, idx) => {
      const duration = 1500;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(progress * (stat.target || 0));

        setCounts((prev) => {
          const next = [...prev];
          next[idx] = value;
          return next;
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    });
  }, [inView, statsSettings]);

  const bgClass = statsSettings.backgroundColor || "bg-black";

  return (
    <section
      ref={sectionRef}
      className={`${bgClass} py-20 font-sans text-white`}
    >
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 text-center gap-12">
        {statsSettings.stats?.length > 0 ? (
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
                {counts[idx] ?? 0}
                {stat.plus ? "+" : ""}
              </h3>
              <p className="mt-3 text-lg font-medium text-gray-300">
                {stat.label || "Statistic"}
              </p>
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-400">No statistics available</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StatsSection;