import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Calendar, 
  BookOpen,
  Target,
  ListChecks,
  Sparkles,
  RefreshCw,
  Maximize2,
  Minimize2
} from "lucide-react";

// Constants
const SLIDE_DURATION = 8000;
const FIRST_SLIDE_DURATION = 2500;

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/weeks`;

// Compact Slide Content – improved mobile readability
const CompactSlideContent = memo(({ week, isCurrentWeek }) => (
  <div className="space-y-6 sm:space-y-5 md:space-y-4">
    {/* Header Row */}
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4 sm:mb-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white text-sm sm:text-xs font-bold px-4 sm:px-3 py-1.5 sm:py-1 rounded-full shadow-md whitespace-nowrap">
          Week {week.weekNo}
        </span>
        <span className="text-blue-200/80 text-sm sm:text-xs bg-blue-900/30 px-3 sm:px-2 py-1.5 sm:py-1 rounded whitespace-nowrap">
          {week.date}
        </span>
      </div>
      
      {isCurrentWeek && (
        <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm sm:text-xs font-bold px-4 sm:px-3 py-1.5 sm:py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
          <Sparkles size={12} />
          Now
        </span>
      )}
    </div>

    {/* Title and Theme */}
    <div className="mb-4 sm:mb-3">
      <h3 className="text-2xl sm:text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
        {week.name}
      </h3>
      <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/30 p-4 sm:p-3 rounded-lg border border-blue-700/30">
        <p className="text-lg sm:text-base md:text-lg text-blue-100 italic leading-relaxed">
          "{week.theme}"
        </p>
      </div>
    </div>

    {/* Compact Layout Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-4">
      {/* Bible Verse */}
      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/25 p-5 sm:p-4 rounded-xl border border-blue-600/30">
        <div className="flex items-center gap-2.5 mb-3">
          <BookOpen size={16} className="text-amber-400" />
          <h4 className="text-base sm:text-sm font-semibold text-white">Bible Verse</h4>
        </div>
        <p className="text-base sm:text-sm text-blue-100 leading-relaxed">
          {week.verse}
        </p>
      </div>

      {/* Purpose */}
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-800/25 p-5 sm:p-4 rounded-xl border border-cyan-600/30">
        <div className="flex items-center gap-2.5 mb-3">
          <Target size={16} className="text-amber-400" />
          <h4 className="text-base sm:text-sm font-semibold text-white">Purpose</h4>
        </div>
        <p className="text-base sm:text-sm text-blue-100 leading-relaxed line-clamp-4 sm:line-clamp-3">
          {week.purpose}
        </p>
      </div>

      {/* Plans Count */}
      <div className="bg-gradient-to-br from-blue-900/30 to-violet-800/25 p-5 sm:p-4 rounded-xl border border-violet-600/30">
        <div className="flex items-center gap-2.5 mb-3">
          <ListChecks size={16} className="text-amber-400" />
          <h4 className="text-base sm:text-sm font-semibold text-white">Weekly Plans</h4>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-amber-300 text-2xl sm:text-xl font-bold">{week.plans.length}</span>
          <span className="text-sm sm:text-xs text-blue-200">activities planned</span>
        </div>
      </div>
    </div>

    {/* Quick Plans Overview */}
    <div className="mt-5 sm:mt-4">
      <div className="flex items-center gap-2.5 mb-3">
        <ListChecks size={16} className="text-amber-400" />
        <h4 className="text-base sm:text-sm font-semibold text-white">Quick Overview</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
        {week.plans.slice(0, 4).map((plan, idx) => (
          <div 
            key={idx}
            className="bg-blue-900/15 hover:bg-blue-800/25 p-3 sm:p-2.5 rounded-lg border border-blue-700/20 transition-colors group"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
              <p className="text-base sm:text-sm text-blue-100 group-hover:text-white leading-relaxed line-clamp-2 sm:line-clamp-2">
                {plan}
              </p>
            </div>
          </div>
        ))}
        {week.plans.length > 4 && (
          <div className="bg-blue-900/15 p-3 sm:p-2.5 rounded-lg border border-blue-700/20 text-center">
            <p className="text-sm sm:text-xs text-blue-300">
              +{week.plans.length - 4} more plans
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
));

CompactSlideContent.displayName = "CompactSlideContent";

// ────────────────────────────────────────────────
// Rest of your component remains almost unchanged
// ────────────────────────────────────────────────

const useSlideshow = (items, isPaused) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef(null);

  const navigateSlide = useCallback((newIndex) => {
    setDirection(newIndex > index ? 1 : -1);
    setIndex(newIndex);
  }, [index]);

  const handlePrev = useCallback(() => {
    navigateSlide((index - 1 + items.length) % items.length);
  }, [index, items.length, navigateSlide]);

  const handleNext = useCallback(() => {
    navigateSlide((index + 1) % items.length);
  }, [index, items.length, navigateSlide]);

  useEffect(() => {
    if (items.length === 0 || isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(
      () => handleNext(),
      index === 0 ? FIRST_SLIDE_DURATION : SLIDE_DURATION
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, items.length, isPaused, handleNext]);

  return { index, direction, handlePrev, handleNext, navigateSlide };
};

const CompactSlideshowSkeleton = () => (
  <div className="relative w-full max-w-4xl mx-auto px-3">
    <div className="bg-gradient-to-br from-blue-900/30 via-blue-800/25 to-cyan-900/20 backdrop-blur-sm rounded-2xl p-6 sm:p-5 shadow-xl border border-blue-700/20">
      <div className="space-y-5 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-7 bg-gradient-to-r from-blue-700/40 to-blue-600/40 rounded-full w-1/3 animate-pulse"></div>
          <div className="h-7 bg-gradient-to-r from-blue-700/40 to-blue-600/40 rounded-full w-1/5 animate-pulse"></div>
        </div>
        <div className="h-20 bg-gradient-to-r from-blue-700/40 to-cyan-600/40 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-gradient-to-r from-blue-700/40 to-blue-600/40 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gradient-to-r from-blue-700/40 to-blue-600/40 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function CompactWeekThemeSlideshow() {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_ENDPOINT);
        setWeeks(response.data);
      } catch (err) {
        console.error("Error fetching weeks:", err);
        setError("Unable to load weeks data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeks();
  }, []);

  const slideshow = useSlideshow(weeks, isPaused);
  const currentWeek = weeks[slideshow.index];

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "30%" : "-30%",
      opacity: 0,
      scale: 0.97,
      position: "absolute",
      width: "100%",
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      position: "relative",
    },
    exit: (direction) => ({
      x: direction > 0 ? "-30%" : "30%",
      opacity: 0,
      scale: 0.97,
      position: "absolute",
      width: "100%",
    }),
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      
      switch (e.key) {
        case "ArrowLeft": slideshow.handlePrev(); break;
        case "ArrowRight": slideshow.handleNext(); break;
        case " ": case "Spacebar":
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
        case "z": case "Z":
          setIsZoomed(prev => !prev);
          break;
        default: break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slideshow]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 min-h-[400px] bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 backdrop-blur-sm border border-red-700/30 rounded-xl p-6 max-w-sm shadow-lg text-center">
          <p className="text-red-300 text-base mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-base font-medium rounded-full transition-all shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <section className="flex justify-center items-center py-10 px-4 min-h-[450px] bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
        <CompactSlideshowSkeleton />
      </section>
    );
  }

  if (weeks.length === 0) {
    return (
      <section className="flex justify-center items-center py-12 px-4 min-h-[400px] bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-8 shadow-lg">
            <p className="text-lg text-blue-200 mb-4">No weekly themes available</p>
            <button
              onClick={() => navigate("/weeks")}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-base font-medium rounded-full transition-all shadow-md"
            >
              Browse Weeks
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={containerRef}
      className="flex justify-center items-center py-10 px-3 sm:px-4 min-h-[500px] bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 relative"
      tabIndex={0}
      aria-label="Weekly theme slideshow"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-600/5 to-cyan-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-amber-500/5 to-amber-600/5 rounded-full blur-2xl"></div>
      </div>

      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className={`relative w-full ${isZoomed ? 'max-w-6xl' : 'max-w-4xl'} transition-all duration-300 z-10`}
      >
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 px-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2.5 rounded-lg bg-gradient-to-r from-blue-800/40 to-cyan-800/40 hover:from-blue-700/50 hover:to-cyan-700/50 text-white transition-all border border-blue-700/40"
              aria-label={isZoomed ? "Zoom out" : "Zoom in"}
              title={`Press Z to ${isZoomed ? 'zoom out' : 'zoom in'}`}
            >
              {isZoomed ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2.5 rounded-lg bg-gradient-to-r from-blue-800/40 to-cyan-800/40 hover:from-blue-700/50 hover:to-cyan-700/50 text-white transition-all border border-blue-700/40"
              aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
              title="Press Space to pause/play"
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>
            
            <span className="text-sm text-blue-300/80 bg-blue-900/30 px-3 py-1.5 rounded">
              {isPaused ? "Paused" : "Auto-advancing"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-base text-blue-300 font-medium">
              Week {slideshow.index + 1} of {weeks.length}
            </span>
            <button
              onClick={() => navigate("/weeks")}
              className="text-sm px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-full transition-all shadow-md"
            >
              Explore All
            </button>
          </div>
        </div>

        {/* Main Slideshow Container */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-blue-900/35 via-blue-800/30 to-blue-900/35 backdrop-blur-md border border-blue-700/40">
          <AnimatePresence initial={false} custom={slideshow.direction} mode="popLayout">
            <motion.div
              key={currentWeek?.weekNo || slideshow.index}
              custom={slideshow.direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.45,
              }}
              className={`p-7 sm:p-6 md:p-7 ${isZoomed ? 'p-9 sm:p-8' : 'p-7 sm:p-6'}`}
              aria-live="polite"
              aria-atomic="true"
            >
              <CompactSlideContent 
                week={currentWeek} 
                isCurrentWeek={slideshow.index === 0} 
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={slideshow.handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-950/90 to-blue-900/90 backdrop-blur-lg text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xl border border-blue-700/60 hover:border-amber-500/60"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={slideshow.handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-950/90 to-cyan-950/90 backdrop-blur-lg text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xl border border-cyan-700/60 hover:border-amber-500/60"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Progress and Dots */}
        <div className="mt-7">
          <div className="h-2 bg-gradient-to-r from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-full overflow-hidden mb-5">
            {!isPaused && (
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                key={slideshow.index}
              />
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2" role="tablist">
            {weeks.map((week, i) => (
              <button
                key={i}
                onClick={() => slideshow.navigateSlide(i)}
                className={`relative transition-all duration-200 ${
                  i === slideshow.index ? 'scale-125' : 'hover:scale-110'
                }`}
                aria-label={`Week ${week.weekNo}`}
                role="tab"
                aria-selected={i === slideshow.index}
              >
                <div className={`w-3 h-3 rounded-full transition-all ${
                  i === slideshow.index 
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 ring-2 ring-amber-500/50' 
                    : 'bg-gradient-to-r from-blue-700/70 to-blue-600/70 hover:from-blue-600 hover:to-cyan-600'
                }`}></div>
                {i === slideshow.index && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-amber-300 font-bold">
                    {week.weekNo}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard Hint – smaller on mobile */}
        <div className="mt-6 flex justify-center">
          <div className="text-xs sm:text-sm text-blue-400/70 flex flex-wrap justify-center gap-4 bg-blue-900/30 px-4 py-2 rounded-full">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-blue-800/40 rounded text-xs">←</kbd>
              <kbd className="px-2 py-1 bg-blue-800/40 rounded text-xs">→</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-blue-800/40 rounded text-xs">Space</kbd>
              <span>Pause/Play</span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-blue-800/40 rounded text-xs">Z</kbd>
              <span>Zoom</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}