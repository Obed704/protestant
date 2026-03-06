import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  ChevronRight,
  Users,
  Star,
  Bell,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/events`;
const DEFAULT_EVENT_IMAGE = "/default-event.jpg";

const resolveEventImage = (imageUrl) => {
  if (!imageUrl) return DEFAULT_EVENT_IMAGE;

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("//")
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return imageUrl;
};

const UpcomingEventsPreview = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reminders, setReminders] = useState({});

  useEffect(() => {
    fetchEvents();
    loadReminders();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(API_ENDPOINT, {
        params: { status: "upcoming", limit: 2, page: 1 },
      });

      setEvents(res.data?.events || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to load upcoming events. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = () => {
    const saved = localStorage.getItem("eventReminders");
    setReminders(saved ? JSON.parse(saved) : {});
  };

  const handleSetReminder = (eventId, eventTitle) => {
    const newReminders = {
      ...reminders,
      [eventId]: {
        eventId,
        eventTitle,
        enabled: true,
        setAt: new Date().toISOString(),
      },
    };

    setReminders(newReminders);
    localStorage.setItem("eventReminders", JSON.stringify(newReminders));

    if ("Notification" in window && Notification.permission !== "denied") {
      const notify = () =>
        new Notification(`Reminder set: ${eventTitle}`, {
          body: "You will be notified 24 hours before the event.",
          icon: "/favicon.ico",
        });

      if (Notification.permission === "granted") notify();
      else {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") notify();
        });
      }
    }
  };

  const getEventStatus = (eventDate) => {
    const now = new Date();
    const date = new Date(eventDate);
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Past", color: "bg-gray-600/30 text-gray-300" };
    if (diffDays <= 1) return { label: "Tomorrow", color: "bg-red-600/30 text-red-200" };
    if (diffDays <= 7) return { label: "This Week", color: "bg-yellow-600/30 text-yellow-200" };
    return { label: "Upcoming", color: "bg-green-600/30 text-green-200" };
  };

  const getEventDate = (event) => event?.dateStart || event?.date;
  const getAttendeeCount = (event) =>
    typeof event?.attendeesCount === "number"
      ? event.attendeesCount
      : event?.attendees?.length || 0;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 text-white py-10 px-4 sm:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Upcoming Events</h2>
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 animate-pulse">
              <div className="h-7 bg-white/10 rounded mb-4"></div>
              <div className="h-5 bg-white/10 rounded mb-4 w-3/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 text-white py-12 px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">Upcoming Events</h2>
        <p className="text-lg text-red-300 mb-6">{error}</p>
        <button
          onClick={fetchEvents}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl xl:max-w-6xl 2xl:max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-1">Upcoming Events</h2>
            <p className="text-blue-200 text-base sm:text-lg">
              Join our spiritual gatherings and grow in faith
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm sm:text-base bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full">
            <Users size={18} />
            <span>
              {events.reduce((sum, e) => sum + getAttendeeCount(e), 0)} attending
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-5 2xl:gap-4 mb-10">
          {events.slice(0, 2).map((event) => {
            const when = getEventDate(event);
            const status = getEventStatus(when);
            const hasReminder = !!reminders[event._id]?.enabled;
            const attendeeCount = getAttendeeCount(event);

            return (
              <div
                key={event._id}
                className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-7 xl:p-5 2xl:p-4 border border-white/10 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-[1.015]"
              >
                <div className="mb-4 overflow-hidden rounded-xl">
                  <img
                    src={resolveEventImage(event.imageUrl)}
                    alt={event.title}
                    className="w-full h-52 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_EVENT_IMAGE;
                    }}
                  />
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    {event.isFeatured && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-600/30 text-purple-200 flex items-center gap-1">
                        <Star size={12} /> Featured
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleSetReminder(event._id, event.title)}
                    disabled={hasReminder}
                    className={`p-2 rounded-full transition-all ${
                      hasReminder
                        ? "text-green-400 cursor-not-allowed bg-green-900/20"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                    title={hasReminder ? "Reminder already set" : "Set reminder"}
                  >
                    <Bell size={20} fill={hasReminder ? "currentColor" : "none"} />
                  </button>
                </div>

                <h3 className="text-xl sm:text-2xl xl:text-xl 2xl:text-lg font-bold mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-200 transition-colors">
                  {event.title}
                </h3>

                <p className="text-white/80 text-base sm:text-lg xl:text-base 2xl:text-sm mb-5 sm:mb-6 line-clamp-3 leading-relaxed">
                  {event.description || event.shortDescription || "Join us for this special gathering."}
                </p>

                <div className="space-y-3 sm:space-y-4 text-white/80">
                  <div className="flex items-center gap-2.5 sm:gap-3 text-sm sm:text-base xl:text-sm 2xl:text-xs">
                    <CalendarDays size={18} className="flex-shrink-0 text-blue-300" />
                    <span>
                      {new Date(when).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 text-sm sm:text-base xl:text-sm 2xl:text-xs">
                    <Clock size={18} className="flex-shrink-0 text-blue-300" />
                    <span>
                      {new Date(when).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2.5 sm:gap-3 text-sm sm:text-base xl:text-sm 2xl:text-xs">
                      <MapPin size={18} className="flex-shrink-0 text-blue-300" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}

                  {event.capacity > 0 && (
                    <div className="pt-4 border-t border-white/10 mt-3 sm:mt-4">
                      <div className="flex justify-between items-center text-sm sm:text-base mb-2">
                        <span className="flex items-center gap-2">
                          <Users size={16} />
                          {attendeeCount} attending
                        </span>
                        <span className="text-white/60">
                          {(event.availableSpots ?? Math.max(0, event.capacity - attendeeCount))} spots left
                        </span>
                      </div>

                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, (attendeeCount / event.capacity) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            to="/upcomingEvents"
            className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-xl font-semibold text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 group"
          >
            View All Upcoming Events
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="mt-5 text-sm text-white/60">
            Showing preview of upcoming gatherings • Check back for new events
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpcomingEventsPreview;