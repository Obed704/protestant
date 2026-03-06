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

const UpcomingEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const [notificationPermission, setNotificationPermission] = useState("default");

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

  const styles = useMemo(
    () => ({
      container: "min-h-screen bg-gradient-to-b from-gray-50 to-blue-50",
      hero: "bg-gradient-to-r from-blue-600 to-purple-700 text-white relative overflow-hidden",
      card: "bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100",
      cardHover: "hover:-translate-y-1",
      badge: {
        upcoming: "bg-green-100 text-green-800",
        tomorrow: "bg-red-100 text-red-800",
        thisWeek: "bg-yellow-100 text-yellow-800",
        past: "bg-gray-100 text-gray-800",
      },
      notification: {
        success: "bg-green-50 border-l-4 border-green-500 text-green-800",
        error: "bg-red-50 border-l-4 border-red-500 text-red-800",
        info: "bg-blue-50 border-l-4 border-blue-500 text-blue-800",
        warning: "bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800",
      },
    }),
    []
  );

  const getEventDate = useCallback((e) => e?.dateStart || e?.date, []);
  const getEventEndDate = useCallback((e) => e?.dateEnd || e?.endDate || null, []);

  const getAttendeeCount = useCallback(
    (e) =>
      typeof e?.attendeesCount === "number"
        ? e.attendeesCount
        : e?.attendees?.length || 0,
    []
  );

  const getAvailableSpots = useCallback(
    (e) => {
      const cap = Number(e?.capacity || 0);
      if (!cap || cap <= 0) return null;
      return Math.max(0, cap - getAttendeeCount(e));
    },
    [getAttendeeCount]
  );

  const getEventStatus = useCallback(
    (eventDate) => {
      const now = new Date();
      const date = new Date(eventDate);
      const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

      if (date < now) {
        return { label: "Past", style: styles.badge.past, days: diffDays };
      }
      if (diffDays <= 1) {
        return { label: "Tomorrow", style: styles.badge.tomorrow, days: diffDays };
      }
      if (diffDays <= 7) {
        return { label: "This Week", style: styles.badge.thisWeek, days: diffDays };
      }
      return { label: "Upcoming", style: styles.badge.upcoming, days: diffDays };
    },
    [styles.badge]
  );

  const filterEvents = useCallback(() => {
    let filtered = [...events];

    if (filters.category !== "all") {
      filtered = filtered.filter((e) => e.category === filters.category);
    }

    if (filters.featured === "featured") {
      filtered = filtered.filter((e) => !!e.isFeatured);
    }

    if (filters.featured === "regular") {
      filtered = filtered.filter((e) => !e.isFeatured);
    }

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
  }, [events, filters, getEventDate, getAttendeeCount]);

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
        err.response?.data?.message || "Failed to load events. Please try again."
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
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const showNotification = useCallback((message, type = "info") => {
    const id = Date.now();
    const n = { id, message, type, timestamp: new Date() };
    setNotifications((prev) => [n, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((x) => x.id !== id));
    }, 5000);
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
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );

        const updated = res.data;
        setEvents((prev) => prev.map((e) => (e._id === eventId ? updated : e)));

        const nowRegistered = updated?.attendees?.some(
          (a) => String(a.userId) === String(auth.user.id)
        );

        showNotification(
          nowRegistered ? "RSVP confirmed!" : "RSVP removed.",
          "success"
        );
      } catch (err) {
        showNotification(err.response?.data?.message || "RSVP failed", "error");
      }
    },
    [auth, showNotification]
  );

  const scheduleBrowserNotification = useCallback(
    (event, reminderTime) => {
      if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
      }

      const now = new Date();
      const delay = reminderTime.getTime() - now.getTime();
      if (delay <= 0 || delay >= 2147483647) return;

      setTimeout(() => {
        if (Notification.permission !== "granted") return;
        const when = getEventDate(event);
        new Notification(`Reminder: ${event.title}`, {
          body: `Starts at ${new Date(when).toLocaleTimeString()}${
            event.location ? ` at ${event.location}` : ""
          }`,
          icon: "/favicon.ico",
          tag: `event-reminder-${event._id}`,
        });
      }, delay);
    },
    [getEventDate]
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
        "success"
      );
    },
    [events, reminders, getEventDate, scheduleBrowserNotification, showNotification]
  );

  const handleRemoveReminder = useCallback(
    (eventId) => {
      const newReminders = { ...reminders };
      delete newReminders[eventId];
      setReminders(newReminders);
      localStorage.setItem("eventReminders", JSON.stringify(newReminders));
      showNotification("Reminder removed", "info");
    },
    [reminders, showNotification]
  );

  const handleBookmark = useCallback(
    (eventId) => {
      const event = events.find((e) => e._id === eventId);
      if (!event) return;

      const next = { ...bookmarks };
      if (next[eventId]) {
        delete next[eventId];
      } else {
        next[eventId] = {
          eventId,
          eventTitle: event.title,
          date: getEventDate(event),
          bookmarkedAt: new Date().toISOString(),
        };
      }

      setBookmarks(next);
      localStorage.setItem("eventBookmarks", JSON.stringify(next));
      showNotification(next[eventId] ? "Event bookmarked" : "Bookmark removed", "info");
    },
    [events, bookmarks, getEventDate, showNotification]
  );

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      showNotification("Browser does not support notifications", "warning");
      return;
    }
    try {
      const p = await Notification.requestPermission();
      setNotificationPermission(p);
      if (p === "granted") {
        showNotification("Browser notifications enabled!", "success");
      }
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

      const text = `${event.title}\nDate: ${new Date(when).toLocaleDateString()}\n${
        event.location ? `Location: ${event.location}\n` : ""
      }${window.location.href}`;

      await navigator.clipboard.writeText(text);
      showNotification("Event details copied to clipboard!", "success");
    },
    [getEventDate, showNotification]
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
          .join(",")
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
        return `
          <div style="margin-bottom:20px;border-bottom:1px solid #ccc;padding-bottom:20px;">
            <h3 style="font-size:18px;font-weight:bold;margin-bottom:5px;">${event.title}</h3>
            <p style="margin:5px 0;"><strong>Date:</strong> ${new Date(when).toLocaleDateString()}</p>
            <p style="margin:5px 0;"><strong>Time:</strong> ${new Date(when).toLocaleTimeString()}</p>
            ${event.location ? `<p style="margin:5px 0;"><strong>Location:</strong> ${event.location}</p>` : ""}
            <p style="margin:5px 0;">${event.description || ""}</p>
          </div>
        `;
      })
      .join("");

    const w = window.open("", "_blank");
    if (!w) return;

    w.document.write(`
      <html>
        <head>
          <title>Events List - ${new Date().toLocaleDateString()}</title>
          <style>body{font-family:Arial,sans-serif;padding:20px}h1{text-align:center}</style>
        </head>
        <body>
          <h1>Events List</h1>
          <p>Printed on: ${new Date().toLocaleString()}</p>
          ${html}
        </body>
      </html>
    `);
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
    const upcoming = events.filter((e) => new Date(getEventDate(e)) >= now).length;
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
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${styles.notification[notification.type]} animate-slideIn`}
    >
      <div className="flex items-center">
        <span className="ml-2">{notification.message}</span>
      </div>
    </div>
  );

  const EventCard = ({ event }) => {
    const when = getEventDate(event);
    const status = getEventStatus(when);

    const attendeeCount = getAttendeeCount(event);
    const availableSpots = getAvailableSpots(event);

    const isRegistered = event.attendees?.some(
      (a) => String(a.userId) === String(auth.user.id)
    );
    const hasReminder = reminders[event._id]?.enabled;
    const isBookmarked = !!bookmarks[event._id];

    const daysUntil = Math.ceil(
      (new Date(when) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return (
      <div className={`${styles.card} ${styles.cardHover}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={resolveEventImage(event.imageUrl)}
            alt={event.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_EVENT_IMAGE;
            }}
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.style}`}>
              {status.label}
            </span>
            {event.isFeatured && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
                <Star size={10} className="inline mr-1" /> Featured
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 flex gap-1">
            <button
              onClick={() => handleBookmark(event._id)}
              className={`p-2 rounded-full ${
                isBookmarked
                  ? "bg-yellow-500 text-white"
                  : "bg-white/80 text-gray-700 hover:bg-white"
              }`}
              title={isBookmarked ? "Remove bookmark" : "Bookmark event"}
            >
              <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
            </button>

            <button
              onClick={() => handleShareEvent(event)}
              className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white"
              title="Share event"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{event.title}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Tag size={12} className="mr-1" />
              <span className="capitalize">
                {String(event.category || "general").replace("_", " ")}
              </span>
            </div>
          </div>

          {event.verse && (
            <p className="text-sm italic text-gray-600 mb-3 border-l-4 border-blue-500 pl-3 py-1">
              "{event.verse}"
            </p>
          )}

          <p className="text-gray-700 mb-4 line-clamp-2">
            {event.shortDescription || event.description || "No description provided."}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <CalendarDays size={16} className="mr-2 flex-shrink-0" />
              <span className="text-sm">
                {new Date(when).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="mx-1">•</span>
              <span className="text-sm">
                {new Date(when).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-2 flex-shrink-0" />
                <span className="text-sm truncate">{event.location}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Users size={16} className="mr-2" />
                <span className="text-sm">
                  {attendeeCount} attending
                  {event.capacity > 0 && (
                    <span className="ml-1 text-gray-500">({availableSpots} left)</span>
                  )}
                </span>
              </div>

              {daysUntil >= 0 && (
                <span className="text-sm font-medium">
                  {daysUntil === 0 ? "Today" : `${daysUntil} day${daysUntil === 1 ? "" : "s"} to go`}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
              className="flex-1 flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Details
              <ChevronRight size={16} className="ml-1" />
            </button>

            {isRegistered ? (
              <button
                className="px-3 py-2 bg-green-100 text-green-800 rounded-lg flex items-center"
                disabled
              >
                <CheckCircle size={16} className="mr-1" />
                Registered
              </button>
            ) : (
              <button
                onClick={() => handleRegister(event._id)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                disabled={event.capacity > 0 && attendeeCount >= event.capacity}
              >
                <UserPlus size={16} className="mr-1" />
                Register
              </button>
            )}

            {daysUntil > 0 &&
              (hasReminder ? (
                <button
                  onClick={() => handleRemoveReminder(event._id)}
                  className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                >
                  <BellOff size={16} className="mr-1" />
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => handleSetReminder(event._id)}
                  className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors flex items-center"
                >
                  <Bell size={16} className="mr-1" />
                  Remind
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const EventListView = ({ event }) => {
    const when = getEventDate(event);
    const status = getEventStatus(when);
    const attendeeCount = getAttendeeCount(event);
    const isRegistered = event.attendees?.some(
      (a) => String(a.userId) === String(auth.user.id)
    );

    return (
      <div className={`${styles.card} flex`}>
        <div className="w-32 flex-shrink-0">
          <img
            src={resolveEventImage(event.imageUrl)}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_EVENT_IMAGE;
            }}
          />
        </div>

        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.style}`}>
                  {status.label}
                </span>
                {event.isFeatured && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                    Featured
                  </span>
                )}
                <span className="text-sm text-gray-500 capitalize">
                  {String(event.category || "general").replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleBookmark(event._id)}
                className={`p-1 ${bookmarks[event._id] ? "text-yellow-500" : "text-gray-400"}`}
              >
                <Bookmark
                  size={18}
                  fill={bookmarks[event._id] ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={() => handleShareEvent(event)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {event.shortDescription || event.description || "No description provided."}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
            <span className="flex items-center">
              <CalendarDays size={14} className="mr-1" />
              {new Date(when).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Clock size={14} className="mr-1" />
              {new Date(when).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {event.location && (
              <span className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {event.location}
              </span>
            )}
            <span className="flex items-center">
              <Users size={14} className="mr-1" />
              {attendeeCount} attending
            </span>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View
            </button>
            {!isRegistered && (
              <button
                onClick={() => handleRegister(event._id)}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Register
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const EventModal = () => {
    if (!selectedEvent) return null;

    const when = getEventDate(selectedEvent);
    const endWhen = getEventEndDate(selectedEvent);
    const status = getEventStatus(when);
    const attendeeCount = getAttendeeCount(selectedEvent);

    const isRegistered = selectedEvent.attendees?.some(
      (a) => String(a.userId) === String(auth.user.id)
    );
    const hasReminder = reminders[selectedEvent._id]?.enabled;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slideUp">
          <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.style}`}>
                  {status.label}
                </span>
                {selectedEvent.isFeatured && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                    Featured
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {selectedEvent.verse && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-lg italic text-blue-800">"{selectedEvent.verse}"</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <img
                  src={resolveEventImage(selectedEvent.imageUrl)}
                  alt={selectedEvent.title}
                  className="w-full h-48 object-cover rounded mb-4"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_EVENT_IMAGE;
                  }}
                />
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Event Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CalendarDays size={16} className="mr-2 text-gray-500" />
                      <span>{new Date(when).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-gray-500" />
                      <span>{new Date(when).toLocaleTimeString()}</span>
                    </div>
                    {endWhen && (
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2 text-gray-500" />
                        <span>Ends: {new Date(endWhen).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedEvent.location && (
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2 text-gray-500" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                    {selectedEvent.virtualLink && (
                      <div className="flex items-center">
                        <ExternalLink size={16} className="mr-2 text-gray-500" />
                        <a
                          href={selectedEvent.virtualLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Join Virtually
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Attendance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Registered:</span>
                      <span className="font-semibold">{attendeeCount}</span>
                    </div>

                    {selectedEvent.capacity > 0 && (
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="font-semibold">{selectedEvent.capacity}</span>
                      </div>
                    )}

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (attendeeCount / (selectedEvent.capacity || 100)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <div className="prose max-w-none">
                {(selectedEvent.description || "")
                  .split("\n")
                  .filter(Boolean)
                  .map((p, idx) => (
                    <p key={idx} className="mb-3 text-gray-700">
                      {p}
                    </p>
                  ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {isRegistered ? (
                <button
                  className="px-6 py-2 bg-green-100 text-green-800 rounded-lg flex items-center"
                  disabled
                >
                  <CheckCircle size={18} className="mr-2" />
                  Already Registered
                </button>
              ) : (
                <button
                  onClick={() => handleRegister(selectedEvent._id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Register for Event
                </button>
              )}

              {hasReminder ? (
                <button
                  onClick={() => handleRemoveReminder(selectedEvent._id)}
                  className="px-6 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                >
                  <BellOff size={18} className="mr-2" />
                  Remove Reminder
                </button>
              ) : (
                <button
                  onClick={() => handleSetReminder(selectedEvent._id)}
                  className="px-6 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors flex items-center"
                >
                  <Bell size={18} className="mr-2" />
                  Set Reminder
                </button>
              )}

              <button
                onClick={() => handleShareEvent(selectedEvent)}
                className="px-6 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
              >
                <Share2 size={18} className="mr-2" />
                Share Event
              </button>

              <button
                onClick={() => handleBookmark(selectedEvent._id)}
                className={`px-6 py-2 rounded-lg flex items-center ${
                  bookmarks[selectedEvent._id]
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                <Bookmark
                  size={18}
                  className="mr-2"
                  fill={bookmarks[selectedEvent._id] ? "currentColor" : "none"}
                />
                {bookmarks[selectedEvent._id] ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <EnhancedHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading events...</p>
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

      <div className={styles.hero}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-xl mb-6 opacity-90">
            Join our community for worship, fellowship, and spiritual growth
          </p>

          {stats && (
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[120px]">
                <div className="text-2xl font-bold">{stats.upcomingEvents || 0}</div>
                <div className="text-sm opacity-90">Upcoming</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[120px]">
                <div className="text-2xl font-bold">{stats.totalAttendees || 0}</div>
                <div className="text-sm opacity-90">Total Attendees</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[120px]">
                <div className="text-2xl font-bold">{stats.featuredEvents || 0}</div>
                <div className="text-sm opacity-90">Featured</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    placeholder="Search events..."
                    className="w-full pl-4 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              </div>

              <div>
                <select
                  value={filters.timeframe}
                  onChange={(e) =>
                    setFilters({ ...filters, timeframe: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past Events</option>
                  <option value="all">All Events</option>
                </select>
              </div>

              <div>
                <select
                  value={filters.featured}
                  onChange={(e) =>
                    setFilters({ ...filters, featured: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Events</option>
                  <option value="featured">Featured Only</option>
                  <option value="regular">Regular Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date_asc">Date (Earliest First)</option>
                  <option value="date_desc">Date (Latest First)</option>
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="title_desc">Title (Z-A)</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <List size={20} />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={exportEvents}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200"
                >
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={printEvents}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200"
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>

              <div>
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
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredEvents.length} Event{filteredEvents.length !== 1 ? "s" : ""} Found
            </h2>
          </div>

          {notificationPermission !== "granted" && (
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <Bell size={18} />
              Enable Notifications
            </button>
          )}
        </div>

        {error ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-2">Error Loading Events</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchEvents}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or check back later for new events.
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {filteredEvents.map((event) => (
                  <EventListView key={event._id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {isModalOpen && <EventModal />}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(50px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; }
        .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
        .prose { max-width: 100%; }
        .prose p { margin-top: 0; margin-bottom: 1em; }
      `}</style>

      <Footer />
    </>
  );
};

export default UpcomingEventsPage;