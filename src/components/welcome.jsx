import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const WelcomeLite = () => {
  const reduceMotion = useReducedMotion();
  const [currentVerse, setCurrentVerse] = useState(0);

  const verses = useMemo(
    () => [
      {
        text:
          "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
        reference: "Jeremiah 29:11",
      },
      { text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
      { text: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1" },
      { text: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
    ],
    []
  );

  // Precompute lightweight particle positions (no random during render loops)
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const left = (i * 97) % 100; // deterministic spread
      const top = (i * 53) % 100;
      const delay = (i * 0.4) % 3;
      const duration = 6 + (i % 5);
      const size = 2 + (i % 3);
      return { left, top, delay, duration, size };
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVerse((prev) => (prev + 1) % verses.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [verses.length]);

  const bgPattern = useMemo(() => {
    // Tiny inline SVG pattern (cross motif) to keep it Bible-related without downloading assets
    const svg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0" stop-color="rgba(255,215,128,0.08)"/>
            <stop offset="1" stop-color="rgba(255,215,128,0.02)"/>
          </linearGradient>
        </defs>
        <rect width="220" height="220" fill="transparent"/>
        <g fill="url(#g)">
          <path d="M108 40h4v46h46v4h-46v90h-4V90H62v-4h46z"/>
          <circle cx="110" cy="110" r="1.6" fill="rgba(255,215,128,0.18)"/>
        </g>
      </svg>
    `);
    return `url("data:image/svg+xml,${svg}")`;
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden text-white">
      {/* Local CSS keyframes (fast, no JS loops) */}
      <style>{`
        .bg-animated {
          background-size: 200% 200%;
          animation: bgShift 10s ease-in-out infinite;
        }
        @keyframes bgShift {
          0% { background-position: 0% 40%; }
          50% { background-position: 100% 60%; }
          100% { background-position: 0% 40%; }
        }

        .beam {
          position: absolute;
          top: -20%;
          width: 14rem;
          height: 140%;
          transform: rotate(18deg);
          filter: blur(2px);
          opacity: 0.18;
          background: linear-gradient(to bottom, rgba(255,215,128,0.35), rgba(255,215,128,0.05), transparent);
          animation: beamPulse 5.5s ease-in-out infinite;
        }
        @keyframes beamPulse {
          0%,100% { opacity: 0.12; transform: translateY(0) rotate(18deg); }
          50% { opacity: 0.24; transform: translateY(10px) rotate(18deg); }
        }

        .floatDot {
          position: absolute;
          border-radius: 999px;
          background: rgba(255, 215, 128, 0.75);
          box-shadow: 0 0 20px rgba(255,215,128,0.15);
          animation-name: dotFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes dotFloat {
          0% { transform: translate(0, 0); opacity: 0.25; }
          50% { transform: translate(14px, -80px); opacity: 0.7; }
          100% { transform: translate(0, 0); opacity: 0.25; }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .bg-animated, .beam, .floatDot { animation: none !important; }
        }
      `}</style>

      {/* Background (no video) */}
      <div
        className="absolute inset-0 bg-animated"
        style={{
          backgroundImage: `
            radial-gradient(1200px 600px at 50% 20%, rgba(255,215,128,0.18), transparent 60%),
            radial-gradient(900px 500px at 20% 70%, rgba(59,130,246,0.22), transparent 55%),
            radial-gradient(900px 500px at 80% 70%, rgba(168,85,247,0.18), transparent 55%),
            linear-gradient(to bottom, rgba(10,20,55,0.95), rgba(10,15,40,0.95)),
            ${bgPattern}
          `,
          backgroundBlendMode: "screen, screen, screen, normal, overlay",
        }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/60" />

      {/* Light beams (few elements = cheaper) */}
      {!reduceMotion && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="beam" style={{ left: "8%", animationDelay: "0s" }} />
          <div className="beam" style={{ left: "38%", animationDelay: "1.2s", opacity: 0.14 }} />
          <div className="beam" style={{ left: "68%", animationDelay: "2.2s", opacity: 0.12 }} />
        </div>
      )}

      {/* Floating dots */}
      {!reduceMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p, i) => (
            <div
              key={i}
              className="floatDot"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-5xl text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="mx-auto"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur">
              <span className="text-sm tracking-wider text-white/80">GROUPE PROTESTANT</span>
              <span className="w-1 h-1 rounded-full bg-yellow-200/70" />
              <span className="text-sm text-yellow-200/90">Word • Worship • Fellowship</span>
            </div>

            <h1 className="mt-8 text-5xl md:text-7xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-300 bg-clip-text text-transparent">
                WELCOME
              </span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              A calm, fast-loading landing page inspired by Scripture—built for smooth animations and strong readability.
            </p>
          </motion.div>

          {/* Verse carousel */}
          <div className="mt-10 mx-auto max-w-3xl">
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8 shadow-xl shadow-black/20">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-200/10 via-white/0 to-blue-400/10" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentVerse}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.45 }}
                  className="relative"
                >
                  <p className="text-lg md:text-2xl italic leading-relaxed text-white">
                    "{verses[currentVerse].text}"
                  </p>
                  <p className="mt-4 text-sm md:text-base font-semibold text-yellow-200/90">
                    {verses[currentVerse].reference}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="relative mt-6 flex justify-center gap-2">
                {verses.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentVerse(index)}
                    aria-label={`Show verse ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentVerse
                        ? "w-8 bg-gradient-to-r from-yellow-200 to-amber-200"
                        : "w-2 bg-white/35 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.a
              href="/home"
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              className="relative inline-flex items-center justify-center px-8 py-3 rounded-full font-bold
                         bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700
                         shadow-lg shadow-black/25 border border-white/10"
            >
              <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-200 bg-clip-text text-transparent">
                Enter
              </span>
              {!reduceMotion && (
                <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-200/20 via-white/0 to-yellow-200/20 blur-lg opacity-60" />
              )}
            </motion.a>

            {/* <a
              href="/home#services"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full font-semibold
                         bg-white/5 border border-white/12 backdrop-blur
                         hover:bg-white/8 transition"
            >
              See service times
            </a> */}
          </motion.div>

          {/* Footer note */}
          <div className="mt-10 text-xs md:text-sm text-white/60">
            Built for speed: no heavy video, minimal JS animation, strong readability.
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeLite;