import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Calendar,
  BookOpen,
  Target,
  Clock,
  Filter,
} from "lucide-react";

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_WEEKS_ENDPOINT = `${API_BASE_URL}/api/weeks`;

export default function WeekThemeSlideshow() {
  const [weeks, setWeeks] = useState([]);
  const [filteredWeeks, setFilteredWeeks] = useState([]);
  const [index, setIndex] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all|current|upcoming|future

  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);
  const slideDuration = 5000;

  // ---------- Fetch weeks ----------
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(API_WEEKS_ENDPOINT);

        // Ensure array
        const data = Array.isArray(res.data) ? res.data : [];

        // Optional: sort by weekNo ascending for consistent UX
        data.sort((a, b) => Number(a.weekNo || 0) - Number(b.weekNo || 0));

        setWeeks(data);
        setFilteredWeeks(data);
        setIndex(0);
      } catch (err) {
        console.error("Error fetching weeks:", err);
        setError("Failed to load weeks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeks();
  }, []);

  // ---------- Filtering ----------
  useEffect(() => {
    let results = [...weeks];

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter((w) => {
        const name = String(w.name || "").toLowerCase();
        const theme = String(w.theme || "").toLowerCase();
        const purpose = String(w.purpose || "").toLowerCase();
        const weekNo = String(w.weekNo ?? "").toLowerCase();

        return (
          name.includes(term) ||
          weekNo.includes(term) ||
          theme.includes(term) ||
          purpose.includes(term)
        );
      });
    }

    // Category filter (kept similar logic, but safer)
    if (activeFilter !== "all") {
      results = results.filter((w) => {
        const weekNum = Number(w.weekNo || 0);

        switch (activeFilter) {
          case "current":
            return weekNum === 1;
          case "upcoming":
            return weekNum > 1 && weekNum <= 4;
          case "future":
            return weekNum > 4;
          default:
            return true;
        }
      });
    }

    setFilteredWeeks(results);
    setIndex(0); // reset slide when filters change
  }, [weeks, searchTerm, activeFilter]);

  // Keep index valid if filteredWeeks shrinks
  useEffect(() => {
    if (index >= filteredWeeks.length) setIndex(0);
  }, [filteredWeeks.length, index]);

  // ---------- Slideshow autoplay ----------
  useEffect(() => {
    // Stop if not playing or no data
    if (!filteredWeeks.length || !isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % filteredWeeks.length);
    }, slideDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, filteredWeeks, isPlaying]);

  // ---------- Controls ----------
  const handlePrevious = useCallback(() => {
    if (!filteredWeeks.length) return;
    setIndex((prev) => (prev - 1 + filteredWeeks.length) % filteredWeeks.length);
  }, [filteredWeeks.length]);

  const handleNext = useCallback(() => {
    if (!filteredWeeks.length) return;
    setIndex((prev) => (prev + 1) % filteredWeeks.length);
  }, [filteredWeeks.length]);

  const handleDotClick = useCallback((i) => {
    setIndex(i);
    setIsPlaying(false);
  }, []);

  const togglePlay = () => setIsPlaying((v) => !v);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setIsPlaying(false);
  };

  // Keyboard UX: ←/→ navigation, Space play/pause (ignore if typing)
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
      const isTyping =
        tag === "input" || tag === "textarea" || e.target?.isContentEditable;

      if (isTyping) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIsPlaying(false);
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setIsPlaying(false);
        handleNext();
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNext, handlePrevious]);

  const currentWeek = useMemo(() => filteredWeeks[index] || null, [filteredWeeks, index]);

  // ---------- UI states ----------
  if (loading) {
    return (
      <section className="min-h-[70vh] bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm">Loading weeks...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-[70vh] bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-7 shadow-md max-w-md w-full text-center border border-slate-200">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Data</h3>
          <p className="text-slate-600 text-sm mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition text-sm"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!weeks.length) {
    return (
      <section className="min-h-[70vh] bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Weeks Available</h3>
          <p className="text-slate-600 text-sm">Check back later for weekly themes.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            Weekly Spiritual Journey
          </h1>
          <p className="text-slate-600 text-sm">Explore weekly themes, verses, and plans</p>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search week number, name, theme, purpose..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsPlaying(false);
                }}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: "all", label: "All", icon: <Calendar className="w-4 h-4" /> },
                { id: "current", label: "Current", icon: <Clock className="w-4 h-4" /> },
                { id: "upcoming", label: "Upcoming", icon: <Play className="w-4 h-4" /> },
                { id: "future", label: "Future", icon: <Target className="w-4 h-4" /> },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFilterClick(f.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap text-sm transition ${
                    activeFilter === f.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>
                {filteredWeeks.length} week{filteredWeeks.length !== 1 ? "s" : ""} found
              </span>
            </div>

            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:text-blue-700 transition"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow transition text-sm"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Play
                </>
              )}
            </button>

            <div className="text-xs text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200">
              Auto-advance: <span className="font-medium">{isPlaying ? "On" : "Off"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsPlaying(false);
                handlePrevious();
              }}
              disabled={filteredWeeks.length <= 1}
              className="p-2 bg-white rounded-full border border-slate-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                handleNext();
              }}
              disabled={filteredWeeks.length <= 1}
              className="p-2 bg-white rounded-full border border-slate-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Week Card */}
        {currentWeek ? (
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl shadow-xl overflow-hidden border border-white/10">
            {/* Top badges */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Calendar className="w-4 h-4" />
                <span>{currentWeek.date || "—"}</span>
              </div>

              <div className="flex items-center gap-2">
                {Number(currentWeek.weekNo) === 1 && (
                  <span className="bg-emerald-500/20 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/20">
                    Current Week
                  </span>
                )}
                <span className="bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/10">
                  Week {currentWeek.weekNo}
                </span>
              </div>
            </div>

            <div className="p-5 md:p-7 text-white">
              {/* Title */}
              <div className="mb-5">
                <h2 className="text-xl md:text-2xl font-bold leading-snug">
                  {currentWeek.name || "Untitled Week"}
                </h2>
                <div className="mt-2 w-12 h-1 bg-blue-500 rounded-full" />
              </div>

              {/* Theme */}
              <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-base md:text-lg italic text-white/90 leading-relaxed">
                  {currentWeek.theme || "No theme provided."}
                </p>
              </div>

              {/* Verse */}
              <div className="mb-6 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-300" />
                  <h3 className="text-sm font-semibold">Bible Verse</h3>
                </div>
                <p className="text-sm text-white/85 leading-relaxed">
                  {currentWeek.verse || "No verse provided."}
                </p>
              </div>

              {/* Two columns: Purpose + Plans */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-emerald-300" />
                    <h3 className="text-sm font-semibold">Purpose</h3>
                  </div>
                  <p className="text-sm text-white/85 leading-relaxed">
                    {currentWeek.purpose || "No purpose provided."}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-amber-300" />
                    <h3 className="text-sm font-semibold">Plans</h3>
                  </div>

                  <ul className="space-y-2">
                    {(Array.isArray(currentWeek.plans) ? currentWeek.plans : [])
                      .slice(0, 12)
                      .map((plan, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-white/85">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-300/80" />
                          <span className="leading-relaxed">{plan}</span>
                        </li>
                      ))}

                    {!Array.isArray(currentWeek.plans) ||
                    (Array.isArray(currentWeek.plans) && currentWeek.plans.length === 0) ? (
                      <li className="text-sm text-white/60">No plans provided.</li>
                    ) : null}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                <span>
                  Slide {index + 1} of {filteredWeeks.length}
                </span>
                <span>{isPlaying ? `Auto: ${slideDuration / 1000}s` : "Manual mode"}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-200">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No matching weeks found</h3>
            <p className="text-slate-600 text-sm mb-5">Try adjusting your search or filters.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveFilter("all");
                setIsPlaying(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Dots */}
        {filteredWeeks.length > 1 && (
          <div className="flex justify-center mt-5 gap-2">
            {filteredWeeks.map((w, i) => (
              <button
                key={`${w.weekNo}-${i}`}
                onClick={() => handleDotClick(i)}
                className="p-1"
                aria-label={`Go to week ${w.weekNo}`}
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    i === index ? "bg-blue-600" : "bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-600">
          <p>Keyboard: ← → to navigate • Space to play/pause</p>
          <p className="mt-1">Total weeks available: {weeks.length}</p>
        </div>
      </div>
    </section>
  );
}