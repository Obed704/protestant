import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaUser,
  FaHeart,
  FaStar,
  FaComment,
  FaShare,
  FaBible,
  FaChevronRight,
  FaTimes,
  FaExternalLinkAlt,
  FaPrayingHands,
  FaExpand,
  FaBookOpen,
  FaBookmark,
  FaPrint,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaCopy,
  FaSpinner,
  FaBars,
} from "react-icons/fa";
import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/dailyPreachingsWord`;
const BG_IMAGE =
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000";

const DailyPreachingsPage = () => {
  const [preachings, setPreachings] = useState([]);
  const [filteredPreachings, setFilteredPreachings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPreaching, setSelectedPreaching] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser] = useState("user123");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPreacher, setSelectedPreacher] = useState("all");
  const [selectedDay, setSelectedDay] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(API_ENDPOINT);
        setPreachings(response.data);
        setFilteredPreachings(response.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load preachings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let results = [...preachings];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (preaching) =>
          preaching.description.toLowerCase().includes(term) ||
          preaching.preacher.toLowerCase().includes(term) ||
          preaching.day.toLowerCase().includes(term) ||
          preaching.verses.some((verse) => verse.toLowerCase().includes(term)),
      );
    }

    if (selectedPreacher !== "all") {
      results = results.filter(
        (preaching) => preaching.preacher === selectedPreacher,
      );
    }

    if (selectedDay !== "all") {
      results = results.filter((preaching) => preaching.day === selectedDay);
    }

    if (sortBy === "date-desc") {
      results.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "date-asc") {
      results.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "day") {
      const dayOrder = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      results.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
    }

    setFilteredPreachings(results);
  }, [searchTerm, selectedPreacher, selectedDay, sortBy, preachings]);

  const preachers = useMemo(
    () => [...new Set(preachings.map((p) => p.preacher))],
    [preachings],
  );
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const formatDateDisplay = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      if (isYesterday(date)) return "Yesterday";
      return format(date, "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const getDayColor = (day) => {
    const colors = {
      Monday: "bg-blue-500/20 text-blue-200 border-blue-500/30",
      Tuesday: "bg-purple-500/20 text-purple-200 border-purple-500/30",
      Wednesday: "bg-green-500/20 text-green-200 border-green-500/30",
      Thursday: "bg-yellow-500/20 text-yellow-200 border-yellow-500/30",
      Friday: "bg-red-500/20 text-red-200 border-red-500/30",
      Saturday: "bg-indigo-500/20 text-indigo-200 border-indigo-500/30",
      Sunday: "bg-pink-500/20 text-pink-200 border-pink-500/30",
    };
    return colors[day] || "bg-gray-500/20 text-gray-200";
  };

  const handleLike = async (id) => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/${id}/like`, {
        user: currentUser,
      });
      setPreachings((prev) =>
        prev.map((p) => (p._id === id ? { ...p, likes: response.data } : p)),
      );
      if (selectedPreaching?._id === id)
        setSelectedPreaching((prev) => ({ ...prev, likes: response.data }));
    } catch (err) {
      console.error(err);
      alert("Failed to update like.");
    }
  };

  const handleFavorite = async (id) => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/${id}/favorite`, {
        user: currentUser,
      });
      setPreachings((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, favorites: response.data } : p,
        ),
      );
      if (selectedPreaching?._id === id)
        setSelectedPreaching((prev) => ({ ...prev, favorites: response.data }));
    } catch (err) {
      console.error(err);
      alert("Failed to update favorite.");
    }
  };

  const handleAddComment = async (id, text) => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/${id}/comment`, {
        user: currentUser,
        text,
      });
      setPreachings((prev) =>
        prev.map((p) => (p._id === id ? { ...p, comments: response.data } : p)),
      );
      if (selectedPreaching?._id === id)
        setSelectedPreaching((prev) => ({ ...prev, comments: response.data }));
      return response.data;
    } catch (err) {
      console.error(err);
      alert("Failed to add comment.");
      return null;
    }
  };

  const handleReplyToComment = async (id, commentId, text) => {
    try {
      const response = await axios.post(
        `${API_ENDPOINT}/${id}/comment/${commentId}/reply`,
        { user: currentUser, text },
      );
      const updateComments = (comments) =>
        comments.map((c) =>
          c._id === commentId ? { ...c, replies: response.data } : c,
        );
      setPreachings((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, comments: updateComments(p.comments) } : p,
        ),
      );
      if (selectedPreaching?._id === id)
        setSelectedPreaching((prev) => ({
          ...prev,
          comments: updateComments(prev.comments),
        }));
      return response.data;
    } catch (err) {
      console.error(err);
      alert("Failed to add reply.");
      return null;
    }
  };

  const openModal = async (preaching) => {
    try {
      const response = await axios.get(`${API_ENDPOINT}/${preaching._id}`);
      setSelectedPreaching(response.data);
    } catch {
      setSelectedPreaching(preaching);
    }
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPreaching(null);
    document.body.style.overflow = "auto";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPreacher("all");
    setSelectedDay("all");
    setSortBy("date-desc");
  };

  const handleShare = (platform) => {
    if (!selectedPreaching) return;
    const text = `${selectedPreaching.day}'s Preaching: ${selectedPreaching.description}`;
    const url = window.location.href;
    let shareUrl = "";
    if (platform === "facebook")
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    else if (platform === "twitter")
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    else if (platform === "whatsapp")
      shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
    if (shareUrl) window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const copyToClipboard = () => {
    if (!selectedPreaching) return;
    const text = `${selectedPreaching.day}'s Preaching\nPreacher: ${selectedPreaching.preacher}\nDate: ${formatDateDisplay(selectedPreaching.date)}\n\n${selectedPreaching.description}\n\nVerses: ${selectedPreaching.verses.join(", ")}`;
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Copied!"))
      .catch(console.error);
  };

  const hasLiked = (preaching) => preaching.likes?.includes(currentUser);
  const hasFavorited = (preaching) =>
    preaching.favorites?.includes(currentUser);
  const totalVerses = preachings.reduce((acc, p) => acc + p.verses.length, 0);
  const avgVerses =
    preachings.length > 0
      ? (totalVerses / preachings.length).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950" />
        <div className="relative bg-white/10 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/20">
          <FaSpinner className="animate-spin text-emerald-400 text-xl mx-auto mb-2" />
          <p className="text-xs text-white">Loading preachings...</p>
        </div>
      </div>
    );
  }

  if (error && preachings.length === 0) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950" />
        <div className="relative bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20 max-w-md text-center">
          <div className="text-rose-400 text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Unable to Load
          </h3>
          <p className="text-sm text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600/80 text-white px-4 py-1.5 rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-100">
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

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl">
              <FaBible className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Daily Preachings
              </h1>
              <p className="text-white/60 text-sm">
                Spiritual nourishment for every day
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const todayPreaching =
                preachings.find((p) => {
                  try {
                    return isToday(parseISO(p.date));
                  } catch {
                    return false;
                  }
                }) || preachings[0];
              if (todayPreaching) openModal(todayPreaching);
            }}
            className="bg-emerald-600/80 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm backdrop-blur-sm"
          >
            <FaPrayingHands /> Today's Devotion
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
            <div className="text-2xl font-bold text-white">
              {preachings.length}
            </div>
            <div className="text-xs text-white/60">Preachings</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
            <div className="text-2xl font-bold text-white">
              {preachers.length}
            </div>
            <div className="text-xs text-white/60">Preachers</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
            <div className="text-2xl font-bold text-white">{totalVerses}</div>
            <div className="text-xs text-white/60">Total Verses</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
            <div className="text-2xl font-bold text-white">{avgVerses}</div>
            <div className="text-xs text-white/60">Avg Verses</div>
          </div>
        </div>

        {/* Main Row: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar (Preachers List) */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Mobile toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-full mb-3 bg-white/10 backdrop-blur-md rounded-xl p-2 flex items-center justify-between text-sm"
            >
              <span>Preachers ({preachers.length})</span>
              <FaBars />
            </button>
            <div
              className={`${sidebarOpen ? "block" : "hidden lg:block"} bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-3`}
            >
              <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-1.5">
                <FaUser size={12} /> Preachers
              </h3>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1 custom-scroll">
                <button
                  onClick={() => {
                    setSelectedPreacher("all");
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedPreacher === "all" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"}`}
                >
                  All Preachers
                </button>
                {preachers.map((preacher) => (
                  <button
                    key={preacher}
                    onClick={() => {
                      setSelectedPreacher(preacher);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedPreacher === preacher ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"}`}
                  >
                    {preacher}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Search & Filter Bar */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-3 mb-6">
              <div className="relative mb-3">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                <input
                  type="text"
                  placeholder="Search by title, preacher, verse..."
                  className="w-full bg-white/20 border border-white/20 rounded-lg py-2 pl-9 pr-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs flex items-center gap-1"
                  >
                    <FaFilter size={10} /> Filters
                  </button>
                  <button
                    onClick={clearFilters}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs"
                  >
                    Clear
                  </button>
                </div>
                <div className="text-xs text-white/50">
                  {filteredPreachings.length} of {preachings.length} shown
                </div>
              </div>
              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="bg-white/20 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs"
                  >
                    <option value="all">All Days</option>
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/20 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="day">By Day of Week</option>
                  </select>
                </div>
              )}
            </div>

            {/* Preachings Grid */}
            {filteredPreachings.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 text-center">
                <FaSearch className="text-4xl text-white/30 mx-auto mb-3" />
                <p className="text-white/70">
                  No preachings found. Try adjusting filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredPreachings.map((preaching, idx) => (
                  <div
                    key={preaching._id}
                    className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden hover:border-emerald-500/40 transition-all duration-300"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getDayColor(preaching.day)} border`}
                          >
                            {preaching.day.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-base">
                              {preaching.day}'s Word
                            </h3>
                            <p className="text-white/50 text-xs">
                              {formatDateDisplay(preaching.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleLike(preaching._id)}
                            className={`p-1.5 rounded-lg transition ${hasLiked(preaching) ? "text-rose-400" : "text-white/40 hover:text-rose-400"}`}
                          >
                            <FaHeart size={12} />
                          </button>
                          <button
                            onClick={() => handleFavorite(preaching._id)}
                            className={`p-1.5 rounded-lg transition ${hasFavorited(preaching) ? "text-yellow-400" : "text-white/40 hover:text-yellow-400"}`}
                          >
                            <FaStar size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3 text-xs text-white/60">
                        <FaUser size={10} /> {preaching.preacher}
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed mb-3 line-clamp-2 italic">
                        "{preaching.description}"
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {preaching.verses.slice(0, 2).map((verse, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/70"
                          >
                            {verse}
                          </span>
                        ))}
                        {preaching.verses.length > 2 && (
                          <span className="text-[10px] text-white/40">
                            +{preaching.verses.length - 2}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <div className="flex gap-3 text-xs text-white/50">
                          <span>
                            <FaHeart className="inline mr-1" size={10} />{" "}
                            {preaching.likes?.length || 0}
                          </span>
                          <span>
                            <FaStar className="inline mr-1" size={10} />{" "}
                            {preaching.favorites?.length || 0}
                          </span>
                          <span>
                            <FaComment className="inline mr-1" size={10} />{" "}
                            {preaching.comments?.length || 0}
                          </span>
                        </div>
                        <button
                          onClick={() => openModal(preaching)}
                          className="text-emerald-300 hover:text-emerald-200 text-xs flex items-center gap-1"
                        >
                          Read More <FaChevronRight size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal (same functionality, glass styled) */}
      {isModalOpen && selectedPreaching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="absolute inset-0" onClick={closeModal} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl modal-content flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white/5 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedPreaching.day}'s Message
                </h2>
                <p className="text-white/60 text-sm">
                  {formatDateDisplay(selectedPreaching.date)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  <FaCopy size={14} />
                </button>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                <FaUser className="text-emerald-400" />
                <div>
                  <p className="font-medium text-white">
                    {selectedPreaching.preacher}
                  </p>
                  <p className="text-white/50 text-xs">Preacher</p>
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Message</h3>
                <p className="text-white/80 bg-white/5 p-4 rounded-lg border-l-4 border-emerald-400 italic">
                  "{selectedPreaching.description}"
                </p>
              </div>
              {selectedPreaching.fullContent && (
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <FaBookOpen size={14} /> Full Teaching
                  </h3>
                  <div className="text-white/70 text-sm space-y-2">
                    {selectedPreaching.fullContent.split("\n").map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <FaBible size={14} /> Scripture
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPreaching.verses.map((verse, i) => (
                    <a
                      key={i}
                      href={`https://www.biblegateway.com/passage/?search=${verse}&version=NIV`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-white/10 px-3 py-1.5 rounded-full text-emerald-300 hover:bg-white/20"
                    >
                      {verse}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">
                  Comments ({selectedPreaching.comments?.length || 0})
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {selectedPreaching.comments?.map((c, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-white">{c.user}</span>
                        <span className="text-white/40">
                          {format(
                            new Date(c.createdAt || Date.now()),
                            "MMM dd",
                          )}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mt-1">{c.text}</p>
                      {c.replies?.map((r, j) => (
                        <div
                          key={j}
                          className="ml-4 mt-2 pl-2 border-l border-white/20"
                        >
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-white/80">
                              {r.user}
                            </span>
                            <span className="text-white/40 text-[10px]">
                              {format(
                                new Date(r.createdAt || Date.now()),
                                "HH:mm",
                              )}
                            </span>
                          </div>
                          <p className="text-white/60 text-xs">{r.text}</p>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const reply = prompt("Reply:");
                          if (reply)
                            handleReplyToComment(
                              selectedPreaching._id,
                              c._id,
                              reply,
                            );
                        }}
                        className="text-xs text-emerald-400 mt-1"
                      >
                        Reply
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    id="newComment"
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("newComment");
                      if (input.value.trim())
                        handleAddComment(selectedPreaching._id, input.value);
                      input.value = "";
                    }}
                    className="bg-emerald-600/80 px-4 py-2 rounded-lg text-sm"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="sticky bottom-0 bg-white/5 backdrop-blur-md border-t border-white/10 p-4 flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={() => handleLike(selectedPreaching._id)}
                  className={`flex items-center gap-1 text-sm ${hasLiked(selectedPreaching) ? "text-rose-400" : "text-white/60"}`}
                >
                  <FaHeart /> {selectedPreaching.likes?.length || 0}
                </button>
                <button
                  onClick={() => handleFavorite(selectedPreaching._id)}
                  className={`flex items-center gap-1 text-sm ${hasFavorited(selectedPreaching) ? "text-yellow-400" : "text-white/60"}`}
                >
                  <FaStar /> {selectedPreaching.favorites?.length || 0}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare("facebook")}
                  className="p-2 bg-white/10 rounded-lg"
                >
                  <FaFacebook size={14} />
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="p-2 bg-white/10 rounded-lg"
                >
                  <FaTwitter size={14} />
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="p-2 bg-white/10 rounded-lg"
                >
                  <FaWhatsapp size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default DailyPreachingsPage;
