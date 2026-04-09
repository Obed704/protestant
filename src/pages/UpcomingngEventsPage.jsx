import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import EnhancedHeader from "../components/header";
import Footer from "../components/footer";
import {
  CalendarDays,
  MapPin,
  Users,
  Clock,
  Bell,
  Share2,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  Tag,
  Download,
  Printer,
  UserPlus,
  AlertCircle,
  Loader2,
  Grid,
  List,
  Bookmark,
  BellOff,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_EVENTS_ENDPOINT = `${API_BASE_URL}/api/events`;
const DEFAULT_EVENT_IMAGE = "/default-event.jpg";
const BG_IMAGE =
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000";

const resolveEventImage = (imageUrl) => {
  if (!imageUrl) return DEFAULT_EVENT_IMAGE;
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("//")
  )
    return imageUrl;
  if (imageUrl.startsWith("/")) return `${API_BASE_URL}${imageUrl}`;
  return imageUrl;
};

const UpcomingEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reminders, setReminders] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [notifications, setNotifications] = useState([]);

  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    category: "all",
    timeframe: "upcoming",
    search: "",
    featured: "all",
    sortBy: "date_asc",
  });

  const [stats, setStats] = useState(null);
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  const auth = useMemo(() => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      null;
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("user") || "null");
    } catch {}
    const id = storedUser?._id || storedUser?.id || "user123";
    const name = storedUser?.fullName || storedUser?.name || "John Doe";
    const email = storedUser?.email || "john@example.com";
    return { token, user: { id, name, email } };
  }, []);

  const getEventDate = useCallback((e) => e?.dateStart || e?.date, []);
  const getEventEndDate = useCallback(
    (e) => e?.dateEnd || e?.endDate || null,
    [],
  );
  const getAttendeeCount = useCallback(
    (e) =>
      typeof e?.attendeesCount === "number"
        ? e.attendeesCount
        : e?.attendees?.length || 0,
    [],
  );
  const getAvailableSpots = useCallback(
    (e) => {
      const cap = Number(e?.capacity || 0);
      if (!cap || cap <= 0) return null;
      return Math.max(0, cap - getAttendeeCount(e));
    },
    [getAttendeeCount],
  );

  const getEventStatus = useCallback((eventDate) => {
    const now = new Date();
    const date = new Date(eventDate);
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (date < now)
      return {
        label: "Past",
        style: "bg-gray-700/80 text-gray-200",
        days: diffDays,
      };
    if (diffDays <= 1)
      return {
        label: "Tomorrow",
        style: "bg-red-500/30 text-red-100",
        days: diffDays,
      };
    if (diffDays <= 7)
      return {
        label: "This Week",
        style: "bg-yellow-500/30 text-yellow-100",
        days: diffDays,
      };
    return {
      label: "Upcoming",
      style: "bg-green-500/30 text-green-100",
      days: diffDays,
    };
  }, []);

  const filterEvents = useCallback(() => {
    let filtered = [...events];
    if (filters.category !== "all")
      filtered = filtered.filter((e) => e.category === filters.category);
    if (filters.featured === "featured")
      filtered = filtered.filter((e) => !!e.isFeatured);
    if (filters.featured === "regular")
      filtered = filtered.filter((e) => !e.isFeatured);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((e) => {
        const tags = Array.isArray(e.tags) ? e.tags : [];
        return (
          (e.title || "").toLowerCase().includes(s) ||
          (e.description || "").toLowerCase().includes(s) ||
          (e.shortDescription || "").toLowerCase().includes(s) ||
          (e.verse || "").toLowerCase().includes(s) ||
          (e.location || "").toLowerCase().includes(s) ||
          tags.some((t) => String(t).toLowerCase().includes(s))
        );
      });
    }
    filtered.sort((a, b) => {
      const dateA = new Date(getEventDate(a));
      const dateB = new Date(getEventDate(b));
      switch (filters.sortBy) {
        case "date_desc":
          return dateB - dateA;
        case "title_asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title_desc":
          return (b.title || "").localeCompare(a.title || "");
        case "popularity":
          return getAttendeeCount(b) - getAttendeeCount(a);
        default:
          return dateA - dateB;
      }
    });
    setFilteredEvents(filtered);
    if (
      filtered.length > 0 &&
      (!selectedEvent || !filtered.some((e) => e._id === selectedEvent._id))
    ) {
      setSelectedEvent(filtered[0]);
    } else if (filtered.length === 0) {
      setSelectedEvent(null);
    }
  }, [events, filters, getEventDate, getAttendeeCount, selectedEvent]);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const status = filters.timeframe === "all" ? "all" : filters.timeframe;
      const res = await axios.get(API_EVENTS_ENDPOINT, {
        params: { status, limit: 50, page: 1 },
      });
      setEvents(res.data?.events || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load events. Please try again.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters.timeframe]);

  const loadUserData = useCallback(() => {
    setReminders(JSON.parse(localStorage.getItem("eventReminders")) || {});
    setBookmarks(JSON.parse(localStorage.getItem("eventBookmarks")) || {});
  }, []);

  const checkNotificationPermission = useCallback(() => {
    if ("Notification" in window)
      setNotificationPermission(Notification.permission);
  }, []);

  const showNotification = useCallback((message, type = "info") => {
    const id = Date.now();
    const n = { id, message, type, timestamp: new Date() };
    setNotifications((prev) => [n, ...prev.slice(0, 4)]);
    setTimeout(
      () => setNotifications((prev) => prev.filter((x) => x.id !== id)),
      5000,
    );
  }, []);

  const handleRegister = useCallback(
    async (eventId) => {
      try {
        if (!auth.token) {
          showNotification("Please login first to RSVP.", "warning");
          return;
        }
        const res = await axios.post(
          `${API_EVENTS_ENDPOINT}/${eventId}/rsvp`,
          {},
          { headers: { Authorization: `Bearer ${auth.token}` } },
        );
        const updated = res.data;
        setEvents((prev) => prev.map((e) => (e._id === eventId ? updated : e)));
        const nowRegistered = updated?.attendees?.some(
          (a) => String(a.userId) === String(auth.user.id),
        );
        showNotification(
          nowRegistered ? "RSVP confirmed!" : "RSVP removed.",
          "success",
        );
      } catch (err) {
        showNotification(err.response?.data?.message || "RSVP failed", "error");
      }
    },
    [auth, showNotification],
  );

  const scheduleBrowserNotification = useCallback(
    (event, reminderTime) => {
      if (!("Notification" in window) || Notification.permission !== "granted")
        return;
      const now = new Date();
      const delay = reminderTime.getTime() - now.getTime();
      if (delay <= 0 || delay >= 2147483647) return;
      setTimeout(() => {
        if (Notification.permission !== "granted") return;
        const when = getEventDate(event);
        new Notification(`Reminder: ${event.title}`, {
          body: `Starts at ${new Date(when).toLocaleTimeString()}${event.location ? ` at ${event.location}` : ""}`,
          icon: "/favicon.ico",
          tag: `event-reminder-${event._id}`,
        });
      }, delay);
    },
    [getEventDate],
  );

  const handleSetReminder = useCallback(
    (eventId) => {
      const event = events.find((e) => e._id === eventId);
      if (!event) return;
      const when = new Date(getEventDate(event));
      const reminderTime = new Date(when.getTime() - 24 * 60 * 60 * 1000);
      const newReminders = {
        ...reminders,
        [eventId]: {
          eventId,
          eventTitle: event.title,
          reminderTime: reminderTime.toISOString(),
          enabled: true,
          notified: false,
        },
      };
      setReminders(newReminders);
      localStorage.setItem("eventReminders", JSON.stringify(newReminders));
      scheduleBrowserNotification(event, reminderTime);
      showNotification(
        `Reminder set for 24 hours before "${event.title}"`,
        "success",
      );
    },
    [
      events,
      reminders,
      getEventDate,
      scheduleBrowserNotification,
      showNotification,
    ],
  );

  const handleRemoveReminder = useCallback(
    (eventId) => {
      const newReminders = { ...reminders };
      delete newReminders[eventId];
      setReminders(newReminders);
      localStorage.setItem("eventReminders", JSON.stringify(newReminders));
      showNotification("Reminder removed", "info");
    },
    [reminders, showNotification],
  );

  const handleBookmark = useCallback(
    (eventId) => {
      const event = events.find((e) => e._id === eventId);
      if (!event) return;
      const next = { ...bookmarks };
      if (next[eventId]) delete next[eventId];
      else
        next[eventId] = {
          eventId,
          eventTitle: event.title,
          date: getEventDate(event),
          bookmarkedAt: new Date().toISOString(),
        };
      setBookmarks(next);
      localStorage.setItem("eventBookmarks", JSON.stringify(next));
      showNotification(
        next[eventId] ? "Event bookmarked" : "Bookmark removed",
        "info",
      );
    },
    [events, bookmarks, getEventDate, showNotification],
  );

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      showNotification("Browser does not support notifications", "warning");
      return;
    }
    try {
      const p = await Notification.requestPermission();
      setNotificationPermission(p);
      if (p === "granted")
        showNotification("Browser notifications enabled!", "success");
    } catch {
      showNotification("Failed to enable notifications", "error");
    }
  }, [showNotification]);

  const handleShareEvent = useCallback(
    async (event) => {
      const when = getEventDate(event);
      const shareData = {
        title: event.title,
        text: `Join us for ${event.title} on ${new Date(when).toLocaleDateString()}`,
        url: window.location.href,
      };
      if (navigator.share && navigator.canShare?.(shareData)) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          if (err?.name === "AbortError") return;
        }
      }
      const text = `${event.title}\nDate: ${new Date(when).toLocaleDateString()}\n${event.location ? `Location: ${event.location}\n` : ""}${window.location.href}`;
      await navigator.clipboard.writeText(text);
      showNotification("Event details copied to clipboard!", "success");
    },
    [getEventDate, showNotification],
  );

  const exportEvents = useCallback(() => {
    if (!filteredEvents.length) return;
    const exportData = filteredEvents.map((event) => {
      const when = getEventDate(event);
      return {
        Title: event.title,
        Date: new Date(when).toLocaleDateString(),
        Time: new Date(when).toLocaleTimeString(),
        Location: event.location || "N/A",
        Description: event.description || "",
        Category: event.category || "",
        Attendees: getAttendeeCount(event),
        Capacity: event.capacity || "Unlimited",
      };
    });
    const csv = [
      Object.keys(exportData[0]).join(","),
      ...exportData.map((row) =>
        Object.values(row)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification("Events exported to CSV", "success");
  }, [filteredEvents, getEventDate, getAttendeeCount, showNotification]);

  const printEvents = useCallback(() => {
    if (!filteredEvents.length) return;
    const html = filteredEvents
      .map((event) => {
        const when = getEventDate(event);
        return `<div style="margin-bottom:20px;border-bottom:1px solid #ccc;padding-bottom:20px;">
        <h3 style="font-size:18px;font-weight:bold;margin-bottom:5px;">${event.title}</h3>
        <p><strong>Date:</strong> ${new Date(when).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date(when).toLocaleTimeString()}</p>
        ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ""}
        <p>${event.description || ""}</p>
      </div>`;
      })
      .join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<html><head><title>Events List</title><style>body{font-family:Arial;padding:20px}</style></head><body><h1>Events List</h1><p>Printed on: ${new Date().toLocaleString()}</p>${html}</body></html>`,
    );
    w.document.close();
    w.print();
  }, [filteredEvents, getEventDate]);

  useEffect(() => {
    loadUserData();
    checkNotificationPermission();
  }, [loadUserData, checkNotificationPermission]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  useEffect(() => {
    const now = new Date();
    const upcoming = events.filter(
      (e) => new Date(getEventDate(e)) >= now,
    ).length;
    const past = events.filter((e) => new Date(getEventDate(e)) < now).length;
    const featured = events.filter((e) => !!e.isFeatured).length;
    const totalAtt = events.reduce((sum, e) => sum + getAttendeeCount(e), 0);
    setStats({
      upcomingEvents: upcoming,
      pastEvents: past,
      featuredEvents: featured,
      totalAttendees: totalAtt,
    });
  }, [events, getEventDate, getAttendeeCount]);

  const NotificationToast = ({ notification }) => (
    <div
      className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-xl backdrop-blur-md ${
        notification.type === "success"
          ? "bg-green-500/20 border-l-4 border-green-400 text-green-100"
          : notification.type === "error"
            ? "bg-red-500/20 border-l-4 border-red-400 text-red-100"
            : notification.type === "warning"
              ? "bg-yellow-500/20 border-l-4 border-yellow-400 text-yellow-100"
              : "bg-blue-500/20 border-l-4 border-blue-400 text-blue-100"
      } animate-slideIn`}
    >
      <div className="flex items-center gap-2 text-sm">
        {notification.message}
      </div>
    </div>
  );

  const EventSidebarItem = ({ event, isActive, onClick }) => {
    const when = getEventDate(event);
    const status = getEventStatus(when);
    return (
      <button
        onClick={onClick}
        className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-white/20 shadow-md border border-white/30"
            : "bg-white/5 hover:bg-white/10 border border-white/10"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-xs truncate">
              {event.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-white/70">
              <CalendarDays size={10} />
              <span>
                {new Date(when).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
          <span
            className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${status.style}`}
          >
            {status.label}
          </span>
        </div>
      </button>
    );
  };

  const SelectedEventDetail = ({ event }) => {
    if (!event) return null;
    const when = getEventDate(event);
    const endWhen = getEventEndDate(event);
    const status = getEventStatus(when);
    const attendeeCount = getAttendeeCount(event);
    const isRegistered = event.attendees?.some(
      (a) => String(a.userId) === String(auth.user.id),
    );
    const hasReminder = reminders[event._id]?.enabled;
    const isBookmarked = !!bookmarks[event._id];
    const availableSpots = getAvailableSpots(event);

    return (
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="relative h-48 md:h-56 overflow-hidden">
          <img
            src={resolveEventImage(event.imageUrl)}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = DEFAULT_EVENT_IMAGE)}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.style}`}
            >
              {status.label}
            </span>
            {event.isFeatured && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/70 text-white">
                <Star size={10} className="inline mr-0.5" />
                Featured
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => handleBookmark(event._id)}
              className={`p-1.5 rounded-full ${isBookmarked ? "bg-yellow-500 text-white" : "bg-white/80 text-gray-700 hover:bg-white"}`}
            >
              <Bookmark
                size={14}
                fill={isBookmarked ? "currentColor" : "none"}
              />
            </button>
            <button
              onClick={() => handleShareEvent(event)}
              className="p-1.5 rounded-full bg-white/80 text-gray-700 hover:bg-white"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {event.title}
            </h2>
            {event.verse && (
              <p className="mt-1 italic text-white/80 border-l-3 border-emerald-400 pl-3 text-sm">
                "{event.verse}"
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white/80 text-sm">
            <div className="space-y-1.5">
              <div className="flex items-center">
                <CalendarDays size={14} className="mr-1.5" />
                <span>
                  {new Date(when).toLocaleDateString()} at{" "}
                  {new Date(when).toLocaleTimeString()}
                </span>
              </div>
              {endWhen && (
                <div className="flex items-center">
                  <Clock size={14} className="mr-1.5" />
                  Ends: {new Date(endWhen).toLocaleString()}
                </div>
              )}
              {event.location && (
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1.5" />
                  {event.location}
                </div>
              )}
              {event.virtualLink && (
                <div className="flex items-center">
                  <ExternalLink size={14} className="mr-1.5" />
                  <a
                    href={event.virtualLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-300 hover:underline"
                  >
                    Join Virtually
                  </a>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center">
                <Users size={14} className="mr-1.5" />
                {attendeeCount} attending
                {event.capacity > 0 && (
                  <span className="ml-1 text-xs">
                    ({availableSpots} spots left)
                  </span>
                )}
              </div>
              {event.capacity > 0 && (
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div
                    className="bg-emerald-400 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, (attendeeCount / event.capacity) * 100)}%`,
                    }}
                  />
                </div>
              )}
              <div className="flex items-center">
                <Tag size={14} className="mr-1.5" />
                <span className="capitalize text-xs">
                  {String(event.category || "general").replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="border-t border-white/20 pt-3">
              <h3 className="text-sm font-semibold text-white mb-1.5">
                Description
              </h3>
              <div className="prose prose-invert max-w-none text-white/80 text-xs">
                {event.description
                  .split("\n")
                  .filter(Boolean)
                  .map((p, idx) => (
                    <p key={idx} className="mb-2">
                      {p}
                    </p>
                  ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {isRegistered ? (
              <button
                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-100 rounded-lg flex items-center gap-1.5 text-xs"
                disabled
              >
                <CheckCircle size={14} />
                Registered
              </button>
            ) : (
              <button
                onClick={() => handleRegister(event._id)}
                className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1.5 text-xs transition"
                disabled={event.capacity > 0 && attendeeCount >= event.capacity}
              >
                <UserPlus size={14} />
                Register
              </button>
            )}
            {hasReminder ? (
              <button
                onClick={() => handleRemoveReminder(event._id)}
                className="px-3 py-1.5 bg-red-500/20 text-red-100 rounded-lg flex items-center gap-1.5 text-xs hover:bg-red-500/30"
              >
                <BellOff size={14} />
                Remove Reminder
              </button>
            ) : (
              <button
                onClick={() => handleSetReminder(event._id)}
                className="px-3 py-1.5 bg-yellow-500/20 text-yellow-100 rounded-lg flex items-center gap-1.5 text-xs hover:bg-yellow-500/30"
              >
                <Bell size={14} />
                Set Reminder
              </button>
            )}
            <button
              onClick={() => handleShareEvent(event)}
              className="px-3 py-1.5 bg-blue-500/20 text-blue-100 rounded-lg flex items-center gap-1.5 text-xs hover:bg-blue-500/30"
            >
              <Share2 size={14} />
              Share
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <EnhancedHeader />
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950" />
          <div className="relative bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-xl border border-white/20">
            <Loader2 className="animate-spin text-emerald-400 text-lg mx-auto mb-2" />
            <p className="text-xs text-white">Loading events...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <EnhancedHeader />
      {notifications.map((n) => (
        <NotificationToast key={n.id} notification={n} />
      ))}

      <div className="relative min-h-screen">
        {/* Background Image with Overlays */}
        <div className="fixed inset-0 z-0">
          <img
            src={BG_IMAGE}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 via-transparent to-emerald-900/30" />
          <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-emerald-500/20 rounded-full blur-[130px] animate-pulse" />
          <div
            className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-cyan-600/20 rounded-full blur-[130px] animate-pulse"
            style={{ animationDelay: "1.5s" }}
          />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        {/* Main Content - zoomed out layout */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-8">
          {/* Hero & stats */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
              Upcoming Events
            </h1>
            <p className="text-white/80 text-sm mt-1">
              Join our community for worship, fellowship, and spiritual growth
            </p>
            {stats && (
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 min-w-[80px]">
                  <div className="text-xl font-bold text-white">
                    {stats.upcomingEvents || 0}
                  </div>
                  <div className="text-[10px] text-white/70">Upcoming</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 min-w-[80px]">
                  <div className="text-xl font-bold text-white">
                    {stats.totalAttendees || 0}
                  </div>
                  <div className="text-[10px] text-white/70">Attendees</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 min-w-[80px]">
                  <div className="text-xl font-bold text-white">
                    {stats.featuredEvents || 0}
                  </div>
                  <div className="text-[10px] text-white/70">Featured</div>
                </div>
              </div>
            )}
          </div>

          {/* Filters bar - glass */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  placeholder="Search events..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-1 focus:ring-white/50"
                />
              </div>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 text-white text-sm"
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="worship">Worship</option>
                <option value="bible_study">Bible Study</option>
                <option value="prayer">Prayer</option>
                <option value="youth">Youth</option>
                <option value="choir">Choir</option>
                <option value="training">Training</option>
                <option value="baptism">Baptism</option>
                <option value="fellowship">Fellowship</option>
                <option value="outreach">Outreach</option>
                <option value="other">Other</option>
              </select>
              <select
                value={filters.timeframe}
                onChange={(e) =>
                  setFilters({ ...filters, timeframe: e.target.value })
                }
                className="px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 text-white text-sm"
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past Events</option>
                <option value="all">All Events</option>
              </select>
              <select
                value={filters.featured}
                onChange={(e) =>
                  setFilters({ ...filters, featured: e.target.value })
                }
                className="px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 text-white text-sm"
              >
                <option value="all">All Events</option>
                <option value="featured">Featured Only</option>
                <option value="regular">Regular Only</option>
              </select>
            </div>
            <div className="flex flex-wrap justify-between items-center mt-2 gap-2">
              <div className="flex gap-2">
                <button
                  onClick={exportEvents}
                  className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg text-white text-xs flex items-center gap-1"
                >
                  <Download size={12} /> Export
                </button>
                <button
                  onClick={printEvents}
                  className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg text-white text-xs flex items-center gap-1"
                >
                  <Printer size={12} /> Print
                </button>
                <button
                  onClick={() =>
                    setFilters({
                      category: "all",
                      timeframe: "upcoming",
                      search: "",
                      featured: "all",
                      sortBy: "date_asc",
                    })
                  }
                  className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg text-white text-xs"
                >
                  Clear
                </button>
              </div>
              {notificationPermission !== "granted" && (
                <button
                  onClick={requestNotificationPermission}
                  className="flex items-center gap-1 bg-yellow-500/30 text-white px-2.5 py-1 rounded-lg text-xs"
                >
                  <Bell size={12} />
                  Enable Notifications
                </button>
              )}
            </div>
          </div>

          {/* Main area */}
          {error ? (
            <div className="text-center py-10 bg-white/10 backdrop-blur-md rounded-xl">
              <AlertCircle className="mx-auto text-red-300 mb-3" size={40} />
              <h3 className="text-lg font-semibold text-white mb-1">
                Error Loading Events
              </h3>
              <p className="text-white/70 text-sm mb-3">{error}</p>
              <button
                onClick={fetchEvents}
                className="bg-emerald-600/80 text-white px-4 py-1.5 rounded-lg text-sm"
              >
                Try Again
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-10 bg-white/10 backdrop-blur-md rounded-xl">
              <Calendar className="mx-auto text-white/40 mb-3" size={48} />
              <h3 className="text-lg font-semibold text-white mb-1">
                No Events Found
              </h3>
              <p className="text-white/70 text-sm">
                Adjust your filters or check back later.
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-5">
              {/* Sidebar */}
              <div className="lg:w-72 flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3">
                  <h2 className="text-white font-semibold text-sm mb-2 flex items-center gap-1.5">
                    <Calendar size={14} /> Events ({filteredEvents.length})
                  </h2>
                  <div className="hidden lg:block space-y-1.5 max-h-[65vh] overflow-y-auto pr-1 custom-scroll">
                    {filteredEvents.map((ev) => (
                      <EventSidebarItem
                        key={ev._id}
                        event={ev}
                        isActive={selectedEvent?._id === ev._id}
                        onClick={() => setSelectedEvent(ev)}
                      />
                    ))}
                  </div>
                  <div className="lg:hidden overflow-x-auto pb-1 -mx-1 px-1 flex gap-1.5">
                    {filteredEvents.map((ev) => (
                      <button
                        key={ev._id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-xs whitespace-nowrap transition ${
                          selectedEvent?._id === ev._id
                            ? "bg-white/30 text-white shadow-md"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {ev.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detail */}
              <div className="flex-1">
                {selectedEvent ? (
                  <SelectedEventDetail event={selectedEvent} />
                ) : (
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 text-center text-white/70 text-sm">
                    Select an event from the sidebar
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
      `}</style>

      <Footer />
    </>
  );
};

export default UpcomingEventsPage;
