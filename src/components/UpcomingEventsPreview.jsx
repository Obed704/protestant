import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, ChevronRight, Bell, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAppData } from "../context/DataContext.jsx";

const DEFAULT_EVENT_IMAGE = "/default-event.jpg";

const resolveEventImage = (imageUrl, BASE_URL) => {
  if (!imageUrl) return DEFAULT_EVENT_IMAGE;
  if (imageUrl.startsWith("http") || imageUrl.startsWith("//")) return imageUrl;
  if (imageUrl.startsWith("/")) return `${BASE_URL}${imageUrl}`;
  return imageUrl;
};

const UpcomingEventsPreview = () => {
  const { events, loading: globalLoading } = useAppData();
  const [reminders, setReminders] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("eventReminders");
    if (saved) setReminders(JSON.parse(saved));
  }, []);

  // Responsive slice: 1 event for mobile, 2 for desktop
  const displayedEvents = useMemo(() => {
    const isMobile = window.innerWidth < 768;
    return events.slice(0, isMobile ? 1 : 2);
  }, [events]);

  const handleSetReminder = (eventId, eventTitle) => {
    const newReminders = { ...reminders, [eventId]: { enabled: true } };
    setReminders(newReminders);
    localStorage.setItem("eventReminders", JSON.stringify(newReminders));
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") new Notification(`Reminder set: ${eventTitle}`);
      });
    }
  };

  const getEventStatus = (eventDate) => {
    const now = new Date();
    const date = new Date(eventDate);
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0)
      return {
        label: "Past",
        color: "text-slate-500 border-slate-500/20 bg-slate-500/5",
      };
    if (diffDays <= 1)
      return {
        label: "Tomorrow",
        color: "text-rose-400 border-rose-400/20 bg-rose-400/5",
      };
    return {
      label: "Upcoming",
      color: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
    };
  };

  if (globalLoading)
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );

  return (
    /* h-fit prevents extra space at the bottom on mobile */
    <section className="relative w-full h-fit md:min-h-screen p-6 md:p-20 overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 md:opacity-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1658104261277-c164ef314d12?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/90 to-indigo-950/40" />
        <div className="absolute inset-0 backdrop-blur-[4px]" />
      </div>

      {/* Zoom out effect for readability (scale-95 on mobile) */}
      <div className="relative z-10 max-w-6xl mx-auto scale-[0.95] md:scale-100 origin-top">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 md:mb-16 gap-6 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-emerald-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-3 block">
              Sacred Calendar
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tighter">
              Divine <span className="text-emerald-400">Encounters</span>
            </h2>
          </motion.div>

          <div className="flex items-center gap-4 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
              {events.length} Gatherings Scheduled
            </span>
          </div>
        </div>

        {/* Events Grid - Shows 1 on mobile, 2 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-16">
          {displayedEvents.map((event, idx) => {
            const when = event?.dateStart || event?.date;
            const status = getEventStatus(when);
            const hasReminder = !!reminders[event._id]?.enabled;

            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative flex flex-col bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden hover:bg-slate-800/60 transition-all duration-500 shadow-2xl"
              >
                <div className="relative h-48 md:h-64 overflow-hidden">
                  <img
                    src={resolveEventImage(
                      event.imageUrl,
                      import.meta.env.VITE_BASE_URL,
                    )}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent" />

                  <div className="absolute top-4 left-4 flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSetReminder(event._id, event.title)}
                    className={`absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      hasReminder
                        ? "bg-emerald-500 text-white"
                        : "bg-white/10 backdrop-blur-md text-white"
                    }`}
                  >
                    <Bell size={16} fill={hasReminder ? "white" : "none"} />
                  </button>
                </div>

                <div className="p-6 md:p-8 flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                    {event.title}
                  </h3>

                  <div className="flex gap-6 mb-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CalendarDays size={14} className="text-emerald-500" />
                      <span className="text-[11px] font-medium">
                        {new Date(when).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={14} className="text-emerald-500" />
                      <span className="text-[11px] font-medium">
                        {new Date(when).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed line-clamp-2 mb-6">
                    {event.description ||
                      "Join us for an atmosphere of worship and transformation."}
                  </p>

                  {event.capacity > 0 && (
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${(event.attendeesCount / event.capacity) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="text-center pb-6">
          <Link
            to="/upcomingEvents"
            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 group"
          >
            Explore All Gatherings
            <ChevronRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEventsPreview;
