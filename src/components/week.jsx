import React, { useEffect, useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  BookOpen,
  Target,
  ListChecks,
  Clock,
  Hash,
  Calendar,
} from "lucide-react";
import { useAppData } from "../context/DataContext.jsx";

const SLIDE_DURATION = 60000; // 1 minute

const GlassSlideContent = memo(({ week }) => {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d)
      ? dateStr
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  return (
    <div className="space-y-5">
      {" "}
      {/* reduced from space-y-6 */}
      {/* Header - more compact */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-md opacity-70" />
            <span className="relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg">
              Week {week.weekNo}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <Calendar size={10} className="text-blue-300" />
            <span className="text-blue-200/80 text-[10px]">
              {week.date?.slice(0, 10) || "Current"}
            </span>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
          <span className="text-base">{week.icon || "📖"}</span>
        </div>
      </div>
      {/* Title – smaller */}
      <div className="text-center space-y-1 py-1">
        <h3 className="text-3xl md:text-4xl font-serif font-light text-white tracking-tight leading-tight">
          {week.name}
        </h3>
        <p className="text-base md:text-lg text-blue-200/80 italic font-light max-w-3xl mx-auto">
          "{week.theme}"
        </p>
      </div>
      {/* 2-Column Layout – reduced gap and padding */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 space-y-4">
          <div className="group bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-white/15 hover:border-blue-500/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-amber-400" />
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
                Scripture
              </h4>
            </div>
            <p className="text-sm text-blue-50 leading-relaxed font-light">
              {week.verse}
            </p>
          </div>
          <div className="group bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-white/15 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-cyan-400" />
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
                Objective
              </h4>
            </div>
            <p className="text-xs text-blue-100/80 font-light leading-relaxed">
              {week.purpose}
            </p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="h-full bg-gradient-to-br from-blue-500/10 to-indigo-500/5 backdrop-blur-2xl p-4 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks size={14} className="text-amber-400" />
              <h4 className="text-[10px] font-bold text-white">Weekly Plans</h4>
            </div>
            <ul className="space-y-2">
              {week.plans?.slice(0, 6).map((plan, i) => (
                <li key={i} className="flex items-start gap-2 group/item">
                  <div className="mt-1 w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
                  <span className="text-blue-100/70 text-xs group-hover/item:text-white transition-colors">
                    {plan}
                  </span>
                </li>
              ))}
              {week.plans?.length > 6 && (
                <li className="text-blue-300/50 text-[10px] italic">
                  + {week.plans.length - 6} more
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      {/* Footer metadata – even smaller */}
      <div className="pt-2 border-t border-white/10 flex flex-wrap justify-between gap-1 text-[8px] text-white/30">
        <span className="flex items-center gap-1">
          <Hash size={8} /> {week._id?.slice(-6)}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={8} /> {formatDate(week.updatedAt)}
        </span>
        <span className="flex items-center gap-1">
          <Sparkles size={8} /> v{week.__v || 0}
        </span>
      </div>
    </div>
  );
});

export default function GlassDevotionalSlideshow() {
  const { weeks, loading, error } = useAppData();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();

  const paginate = useCallback(
    (newDir) => {
      if (!weeks.length) return;
      setDirection(newDir);
      setIndex((prev) => (prev + newDir + weeks.length) % weeks.length);
    },
    [weeks.length],
  );

  useEffect(() => {
    if (loading || isPaused || weeks.length === 0) return;
    const timer = setTimeout(() => paginate(1), SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [index, isPaused, loading, weeks.length, paginate]);

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
      filter: "blur(8px)",
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: (dir) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      filter: "blur(8px)",
      scale: 0.98,
    }),
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-2xl px-6 py-3 rounded-xl border border-white/20">
          <span className="text-blue-200 text-xs tracking-widest animate-pulse">
            LOADING...
          </span>
        </div>
      </div>
    );
  }

  if (error || !weeks.length) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-2xl p-5 rounded-xl text-center">
          <p className="text-red-300 text-sm mb-3">
            Unable to load weekly themes.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-1.5 bg-blue-500/20 rounded-full text-white text-xs"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentWeek = weeks[index];

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Premium blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020b1a] via-[#0a1a3a] to-[#001845]">
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-2/3 left-1/2 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[90px] animate-pulse delay-2000" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiAvPjwvc3ZnPg==')] bg-repeat opacity-30" />
      </div>

      <div className="relative w-full max-w-6xl z-10 space-y-5">
        {/* Main slide card – more compact */}
        <div className="relative group rounded-xl bg-white/[0.04] backdrop-blur-3xl border border-white/15 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full p-5 md:p-6 lg:p-8"
            >
              <GlassSlideContent week={currentWeek} />
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows – smaller and more subtle */}
          <button
            onClick={() => paginate(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white/60 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-105"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white/60 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-105"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Controls – more compact pill */}
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-3 px-4 py-2 bg-white/[0.03] backdrop-blur-2xl rounded-full border border-white/10">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-full bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-white hover:from-blue-500 hover:to-cyan-500 transition-all hover:scale-105"
          >
            {isPaused ? (
              <Play size={14} fill="currentColor" />
            ) : (
              <Pause size={14} fill="currentColor" />
            )}
          </button>

          <div className="flex-1 w-full space-y-1.5">
            <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
              {!isPaused && (
                <motion.div
                  key={index}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: SLIDE_DURATION / 1000,
                    ease: "linear",
                  }}
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                />
              )}
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-[8px] font-bold text-white/30 uppercase">
                Week {currentWeek.weekNo}
              </span>
              <div className="flex gap-1">
                {weeks.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > index ? 1 : -1);
                      setIndex(i);
                    }}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === index
                        ? "w-4 bg-blue-400"
                        : "w-1 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[8px] font-bold text-white/30 uppercase">
                {index + 1}/{weeks.length}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/weeks")}
            className="px-4 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-wider rounded-full hover:bg-white/20 transition-all"
          >
            All Weeks
          </button>
        </div>

        <div className="text-center opacity-30 text-[8px] text-white/30 font-mono">
          ← → • SPACE to pause • auto 60s
        </div>
      </div>
    </section>
  );
}
