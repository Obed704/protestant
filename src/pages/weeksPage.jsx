import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Menu,
  X,
  Search,
  BookOpen,
  Target,
  Calendar,
  ChevronRight,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Configuration ---
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_WEEKS_ENDPOINT = `${API_BASE_URL}/api/weeks`;
const BG_IMAGE =
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000";

const WeekDashboard = () => {
  const [weeks, setWeeks] = useState([]);
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_WEEKS_ENDPOINT);
        const data = Array.isArray(res.data) ? res.data : [];
        data.sort((a, b) => Number(a.weekNo || 0) - Number(b.weekNo || 0));
        setWeeks(data);
        if (data.length > 0) setSelectedWeekId(data[0].weekNo);
      } catch (err) {
        console.error("Error fetching spiritual journey data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeeks();
  }, []);

  // --- Filtering ---
  const filteredSidebarWeeks = useMemo(() => {
    return weeks.filter(
      (w) =>
        w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(w.weekNo).includes(searchTerm),
    );
  }, [weeks, searchTerm]);

  const activeData = useMemo(
    () => weeks.find((w) => w.weekNo === selectedWeekId),
    [weeks, selectedWeekId],
  );

  // --- UI Styles ---
  const glassStyle =
    "bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg"; // reduced opacity and shadow

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#020617]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full"
        />
      </div>
    );

  return (
    <div className="relative min-h-screen w-full text-slate-100 overflow-hidden bg-[#020617]">
      {/* 1. STYLES FOR SCROLLBAR */}
      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .custom-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb { 
          background: rgba(255, 255, 255, 0.1); 
          border-radius: 10px; 
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.3); }
      `}</style>

      {/* 2. MOBILE HEADER – more compact */}
      <div className="lg:hidden relative z-50 p-3 flex items-center justify-between bg-[#050810]/90 backdrop-blur-md border-b border-white/5">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-1.5 bg-white/5 rounded-lg active:scale-95 transition"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
          Spiritual Journey
        </h1>
        <div className="w-8" />
      </div>

      <div className="relative z-20 flex h-screen overflow-hidden">
        {/* 3. SIDEBAR NAVIGATION – zoomed out: less width, tighter spacing */}
        <AnimatePresence mode="wait">
          {(isSidebarOpen || window.innerWidth > 1024) && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`
                fixed lg:relative z-[60] w-64 h-full flex flex-col
                ${window.innerWidth < 1024 ? "bg-[#050810]/95 backdrop-blur-xl" : "bg-[#050810]"}
                border-r border-white/5
              `}
            >
              {/* Sidebar Header – more compact */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <LayoutDashboard className="text-emerald-500" size={14} />
                  </div>
                  <span className="font-black uppercase tracking-widest text-[9px] text-white/80">
                    Curriculum
                  </span>
                </div>
                <button
                  className="lg:hidden p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Sidebar Search – smaller */}
              <div className="p-3 shrink-0">
                <div className="relative group">
                  <Search
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors"
                    size={12}
                  />
                  <input
                    type="text"
                    placeholder="Find a week..."
                    className="w-full bg-white/5 rounded-lg py-2 pl-8 pr-3 text-[11px] outline-none border border-transparent focus:border-emerald-500/30 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Weeks List – tighter spacing */}
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-sidebar-scroll">
                {filteredSidebarWeeks.map((w) => (
                  <button
                    key={w.weekNo}
                    onClick={() => {
                      setSelectedWeekId(w.weekNo);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    className={`w-full group flex items-center gap-2 p-2 rounded-xl transition-all duration-300 border ${
                      selectedWeekId === w.weekNo
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "hover:bg-white/5 border-transparent text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold border shrink-0 transition-all ${
                        selectedWeekId === w.weekNo
                          ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      {w.weekNo}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-tighter">
                        Week {w.weekNo}
                      </p>
                      <p className="text-[10px] opacity-60 truncate font-medium">
                        {w.name}
                      </p>
                    </div>
                    <ChevronRight
                      size={12}
                      className={`transition-all shrink-0 ${selectedWeekId === w.weekNo ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"}`}
                    />
                  </button>
                ))}
                {filteredSidebarWeeks.length === 0 && (
                  <div className="text-center py-8 opacity-20 text-[10px] uppercase tracking-widest">
                    No results
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* 4. MAIN CONTENT AREA – zoomed out: more outer padding, smaller card */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 relative bg-[#020617] scroll-smooth">
          {/* Confined Image – opacity reduced further */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-10 pointer-events-none transition-opacity duration-1000"
            style={{ backgroundImage: `url(${BG_IMAGE})` }}
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617] pointer-events-none" />

          <AnimatePresence mode="wait">
            {activeData ? (
              <motion.div
                key={activeData.weekNo}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="max-w-4xl mx-auto space-y-5 relative z-10"
              >
                {/* Main Hero Card – reduced padding and border radius */}
                <div
                  className={`${glassStyle} rounded-2xl p-6 md:p-10 overflow-hidden relative border border-white/5`}
                >
                  {/* Large background number – smaller */}
                  <div className="absolute -top-8 -right-8 opacity-[0.02] pointer-events-none select-none">
                    <span className="text-[12rem] font-black leading-none">
                      {activeData.weekNo}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-[2px] w-8 bg-emerald-500 rounded-full" />
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400">
                        Active Lesson
                      </span>
                    </div>

                    <h2 className="text-3xl md:text-6xl font-black tracking-tighter mb-6 leading-[1.1]">
                      {activeData.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                        <Clock size={10} /> Week {activeData.weekNo}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-[9px] font-bold text-white/50 uppercase tracking-widest">
                        <Calendar size={10} /> {activeData.date || "Scheduled"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Grid – reduced gap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Theme Card – smaller padding */}
                  <div
                    className={`${glassStyle} rounded-2xl p-6 flex flex-col`}
                  >
                    <div className="flex items-center gap-2 text-emerald-400 mb-4">
                      <BookOpen size={16} />
                      <h3 className="font-black uppercase tracking-[0.2em] text-[9px]">
                        The Perspective
                      </h3>
                    </div>
                    <p className="text-lg md:text-xl italic font-light leading-relaxed text-white/90 mb-6 flex-1">
                      "{activeData.theme}"
                    </p>
                    <div className="pt-4 border-t border-white/5">
                      <h4 className="text-[9px] font-black uppercase text-emerald-500/60 tracking-widest mb-1">
                        Core Purpose
                      </h4>
                      <p className="text-xs text-white/40 leading-relaxed font-medium">
                        {activeData.purpose}
                      </p>
                    </div>
                  </div>

                  {/* Plans Card – smaller padding */}
                  <div
                    className={`${glassStyle} rounded-2xl p-6 bg-emerald-500/[0.02]`}
                  >
                    <div className="flex items-center gap-2 text-emerald-400 mb-5">
                      <Target size={16} />
                      <h3 className="font-black uppercase tracking-[0.2em] text-[9px]">
                        Weekly Objectives
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {activeData.plans?.map((plan, i) => (
                        <motion.li
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={i}
                          className="flex gap-3 group"
                        >
                          <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all duration-300">
                            <span className="text-[9px] font-bold text-white group-hover:text-black">
                              {i + 1}
                            </span>
                          </div>
                          <span className="text-xs text-white/60 group-hover:text-white transition-colors leading-snug font-medium">
                            {plan}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-white/10 relative z-10">
                <LayoutDashboard
                  size={60}
                  strokeWidth={1}
                  className="mb-4 opacity-20"
                />
                <p className="font-black uppercase tracking-[0.5em] text-xs">
                  Select a journey point
                </p>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* 5. OVERLAY FOR MOBILE SIDEBAR */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeekDashboard;
