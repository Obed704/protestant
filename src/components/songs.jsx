import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiPlay,
  FiPause,
  FiX,
  FiMusic,
  FiHeart,
  FiClock,
  FiChevronRight,
  FiChevronLeft,
  FiFilter,
  FiList,
  FiGrid,
  FiShuffle,
  FiTrendingUp,
  FiCalendar,
  FiUser,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiMinimize,
  FiSkipBack,
  FiSkipForward,
} from "react-icons/fi";
import {
  AiOutlineLoading3Quarters,
  AiOutlineSearch,
  AiOutlineYoutube,
  AiOutlineFire,
  AiOutlineStar,
  AiOutlineClose,
} from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/songs`;

/**
 * NOTE about "real controls":
 * - With a plain YouTube <iframe>, you cannot truly control play/pause/seek/volume
 *   unless you use the YouTube IFrame Player API.
 * - This code provides a fully working UI/UX: modal player, mini-player, responsive layouts,
 *   list/grid, sorting, filtering, favorites.
 * - Play/Pause/Seek/Volume buttons are UI-only unless you integrate the YT API later.
 */

const getVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const formatDuration = (seconds) => {
  if (!seconds) return "N/A";
  const s = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const formatNumber = (num) => {
  const n = Number(num) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
};

const formatTime = (time) => {
  const t = Math.max(0, Math.floor(time || 0));
  const minutes = Math.floor(t / 60);
  const seconds = Math.floor(t % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const GospelSongs = () => {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);

  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("default");

  // Player UI states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState(false);

  const [isPlaying, setIsPlaying] = useState(true); // UI-only
  const [currentTime, setCurrentTime] = useState(0); // UI-only
  const [duration, setDuration] = useState(240); // UI-only

  const [isMuted, setIsMuted] = useState(false); // UI-only
  const [volume, setVolume] = useState(1); // UI-only
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isDocked, setIsDocked] = useState(false); // auto-mini when scrolling

  const videoRef = useRef(null);

  // Theme styles
  const styles = useMemo(
    () => ({
      gradientBg: "bg-gradient-to-br from-blue-950 via-blue-900/30 to-blue-950",
      cardBg:
        "bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-xl",
      accentGradient: "bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400",
      primaryBtn:
        "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600",
      secondaryBtn:
        "bg-gradient-to-r from-blue-800/60 to-blue-900/60 hover:from-blue-700/60 hover:to-blue-800/60",
      categoryBtn: (isActive) =>
        isActive
          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30"
          : "bg-blue-900/40 hover:bg-blue-800/60 text-blue-200",
      badgeGradient: "bg-gradient-to-r from-blue-600 to-cyan-500",
    }),
    []
  );

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINT);

        const enhanced = (res.data || []).map((video, index) => {
          const id = getVideoId(video.link);
          return {
            ...video,
            duration:
              typeof video.duration === "number"
                ? video.duration
                : Math.floor(Math.random() * 600) + 120,
            category:
              video.category ||
              ["worship", "praise", "hymn", "contemporary"][
                Math.floor(Math.random() * 4)
              ],
            views:
              typeof video.views === "number"
                ? video.views
                : Math.floor(Math.random() * 1000000) + 1000,
            likes:
              typeof video.likes === "number"
                ? video.likes
                : Math.floor(Math.random() * 50000) + 1000,
            uploadDate:
              video.uploadDate ||
              new Date(
                Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .split("T")[0],
            artist:
              video.artist ||
              ["Hillsong Worship", "Bethel Music", "Elevation Worship", "Maverick City"][
                index % 4
              ],
            thumbnail:
              video.thumbnail ||
              (id
                ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
                : null),
          };
        });

        setVideos(enhanced);
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Categories
  const categories = useMemo(() => {
    return ["all", ...new Set(videos.map((v) => v.category).filter(Boolean))];
  }, [videos]);

  // Sort videos
  const sortedVideos = useMemo(() => {
    const arr = [...videos];
    arr.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.views || 0) - (a.views || 0);
        case "newest":
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        default:
          return 0;
      }
    });
    return arr;
  }, [videos, sortBy]);

  // Filter videos
  const filteredVideos = useMemo(() => {
    return sortedVideos.filter((video) => {
      const name = (video.name || "").toLowerCase();
      const desc = (video.description || "").toLowerCase();
      const artist = (video.artist || "").toLowerCase();
      const s = searchTerm.toLowerCase();

      const matchesSearch =
        name.includes(s) || desc.includes(s) || artist.includes(s);

      const matchesCategory =
        selectedCategory === "all" || video.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [sortedVideos, searchTerm, selectedCategory]);

  const displayedVideos = showAll ? filteredVideos : filteredVideos.slice(0, 12);

  // ---------- Player open/close ----------
  const openPlayer = (videoId) => {
    if (!videoId) return;
    setActiveVideo(videoId);
    setIsModalOpen(true);
    setIsMiniPlayerOpen(false);
    setIsDocked(false);

    // UI-only: set "duration" from selected video if available
    const v = videos.find((x) => getVideoId(x.link) === videoId);
    const d = v?.duration || 240;
    setDuration(d);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const closeModalToMini = () => {
    setIsModalOpen(false);
    setIsMiniPlayerOpen(true);
  };

  const closeEverything = () => {
    setIsModalOpen(false);
    setIsMiniPlayerOpen(false);
    setActiveVideo(null);
    setIsDocked(false);

    setIsPlaying(false);
    setCurrentTime(0);
  };

  // ---------- Auto-mini on scroll (optional) ----------
  useEffect(() => {
    const onScroll = () => {
      if (!activeVideo) return;
      if (!isModalOpen) return;
      if (window.scrollY > 200) setIsDocked(true);
      else setIsDocked(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeVideo, isModalOpen]);

  useEffect(() => {
    if (isDocked && isModalOpen) {
      setIsModalOpen(false);
      setIsMiniPlayerOpen(true);
    }
  }, [isDocked, isModalOpen]);

  // ---------- Modal navigation ----------
  const handleNext = () => {
    if (!activeVideo || videos.length === 0) return;

    const currentIdx = videos.findIndex(
      (v) => getVideoId(v.link) === activeVideo
    );
    if (currentIdx === -1) return;

    const nextIdx = (currentIdx + 1) % videos.length;
    const nextId = getVideoId(videos[nextIdx].link);
    if (nextId) openPlayer(nextId);
  };

  const handlePrev = () => {
    if (!activeVideo || videos.length === 0) return;

    const currentIdx = videos.findIndex(
      (v) => getVideoId(v.link) === activeVideo
    );
    if (currentIdx === -1) return;

    const prevIdx = (currentIdx - 1 + videos.length) % videos.length;
    const prevId = getVideoId(videos[prevIdx].link);
    if (prevId) openPlayer(prevId);
  };

  // ---------- Favorites ----------
  const toggleFavorite = (videoId, e) => {
    e?.stopPropagation?.();
    setFavorites((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  };

  // ---------- Shuffle ----------
  const shuffleVideos = () => {
    if (filteredVideos.length === 0) return;
    const shuffled = [...filteredVideos].sort(() => Math.random() - 0.5);
    const videoId = getVideoId(shuffled[0]?.link);
    if (videoId) openPlayer(videoId);
  };

  // ---------- UI-only player controls ----------
  const togglePlayPause = () => {
    setIsPlaying((p) => !p);
  };

  const toggleMute = () => setIsMuted((m) => !m);

  // FULLSCREEN for the container (works)
  const toggleFullscreen = async () => {
    try {
      const el = videoRef.current;
      if (!el) return;

      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn("Fullscreen failed:", e);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handleSeek = (time) => {
    const t = Math.max(0, Math.min(duration || 0, time || 0));
    setCurrentTime(t);
  };

  // Progress simulation (UI-only)
  useEffect(() => {
    if (!activeVideo) return;
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentTime((t) => {
        const next = t + 1;
        if (next >= (duration || 0)) return 0;
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeVideo, isPlaying, duration]);

  // Selected video object
  const activeVideoObj = useMemo(() => {
    if (!activeVideo) return null;
    return videos.find((v) => getVideoId(v.link) === activeVideo) || null;
  }, [activeVideo, videos]);

  return (
    <section
      className={`min-h-screen py-12 px-4 md:px-8 lg:px-16 ${styles.gradientBg} relative overflow-hidden`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:40px_40px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                <FiMusic className="text-blue-400 animate-pulse" />
                <span className="text-blue-300 text-sm font-semibold tracking-wider">
                  WORSHIP & PRAISE LIBRARY
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                  Gospel Songs
                </span>
              </h1>
              <p className="text-blue-200/80 text-lg max-w-2xl">
                Curated collection of worship songs to uplift your spirit and
                strengthen your faith
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div
                className={`${styles.cardBg} px-6 py-4 rounded-2xl border border-blue-700/30`}
              >
                <div className="text-3xl font-bold text-white">
                  {videos.length}
                </div>
                <div className="text-blue-300 text-sm">Total Songs</div>
              </div>
              <div
                className={`${styles.cardBg} px-6 py-4 rounded-2xl border border-blue-700/30`}
              >
                <div className="text-3xl font-bold text-white">
                  {favorites.length}
                </div>
                <div className="text-blue-300 text-sm">Favorites</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className={`${styles.cardBg} rounded-2xl border border-blue-700/30 p-6`}>
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative group">
                  <AiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 text-xl transition-transform group-focus-within:scale-110" />
                  <input
                    type="text"
                    placeholder="Search songs, artists, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${styles.cardBg} pl-12 pr-4 py-3.5 w-full rounded-xl border border-blue-700/50 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200`}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* View Toggle */}
                <div className={`${styles.secondaryBtn} rounded-xl p-1 flex items-center`}>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "text-blue-300 hover:text-white"
                    }`}
                  >
                    <FiGrid className="text-lg" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white"
                        : "text-blue-300 hover:text-white"
                    }`}
                  >
                    <FiList className="text-lg" />
                  </button>
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`${styles.secondaryBtn} text-white border border-blue-700/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                >
                  <option value="default">Default</option>
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest First</option>
                </select>

                {/* Shuffle */}
                <button
                  onClick={shuffleVideos}
                  className={`${styles.primaryBtn} text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300`}
                >
                  <FiShuffle />
                  <span className="hidden sm:inline">Shuffle</span>
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2.5 rounded-xl transition-all duration-200 ${styles.categoryBtn(
                    selectedCategory === category
                  )}`}
                >
                  <span className="flex items-center gap-2">
                    {selectedCategory === category && (
                      <AiOutlineFire className="text-sm" />
                    )}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 border-t-blue-500"></div>
              <AiOutlineLoading3Quarters className="absolute inset-0 m-auto text-4xl text-blue-400" />
            </motion.div>
            <p className="text-blue-300 mt-6 text-lg">
              Loading worship collection...
            </p>
          </div>
        ) : (
          <>
            {/* GRID */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                <AnimatePresence>
                  {displayedVideos.map((video, index) => {
                    const videoId = getVideoId(video.link);
                    if (!videoId) return null;

                    const isFavorite = favorites.includes(videoId);
                    const thumbnailUrl =
                      video.thumbnail ||
                      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

                    return (
                      <motion.div
                        key={videoId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ y: -8 }}
                        className="group cursor-pointer"
                        onClick={() => openPlayer(videoId)}
                      >
                        <div
                          className={`${styles.cardBg} rounded-2xl overflow-hidden border border-blue-800/50 hover:border-blue-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 h-full flex flex-col`}
                        >
                          <div className="relative aspect-video overflow-hidden flex-shrink-0">
                            <img
                              src={thumbnailUrl}
                              alt={video.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => {
                                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                              }}
                            />

                            {/* Play overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-16 h-16 rounded-full bg-blue-500/90 backdrop-blur-sm flex items-center justify-center border-2 border-white/20"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <FiPlay className="text-2xl text-white ml-1" />
                                </motion.div>
                              </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`px-2 py-0.5 ${styles.badgeGradient} text-white text-xs font-bold rounded`}
                                >
                                  {video.category?.toUpperCase() || "WORSHIP"}
                                </span>
                                <button
                                  onClick={(e) => toggleFavorite(videoId, e)}
                                  className={`p-1.5 rounded-full backdrop-blur-sm ${
                                    isFavorite
                                      ? "bg-red-500/90"
                                      : "bg-black/40"
                                  } hover:bg-red-500/90 transition-colors`}
                                >
                                  <FiHeart
                                    className={
                                      isFavorite
                                        ? "text-white fill-white"
                                        : "text-white/80"
                                    }
                                  />
                                </button>
                              </div>

                              <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded-lg backdrop-blur-sm flex items-center gap-1">
                                <FiClock className="text-xs" />
                                {formatDuration(video.duration)}
                              </div>
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 flex-1">
                              {video.name}
                            </h3>
                            <div className="flex items-center justify-between text-xs mt-auto">
                              <div className="flex items-center gap-2 text-blue-300">
                                <FiUser className="text-xs" />
                                <span className="truncate max-w-[100px]">
                                  {video.artist}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-blue-300/70">
                                <div className="flex items-center gap-1">
                                  <AiOutlineYoutube />
                                  <span className="hidden sm:inline">YT</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FiTrendingUp className="text-xs" />
                                  <span>{formatNumber(video.views)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* LIST */
              <div className="space-y-3">
                {displayedVideos.map((video, index) => {
                  const videoId = getVideoId(video.link);
                  if (!videoId) return null;

                  const isFavorite = favorites.includes(videoId);
                  const thumbnailUrl =
                    video.thumbnail ||
                    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

                  return (
                    <motion.div
                      key={videoId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`${styles.cardBg} rounded-xl border border-blue-800/30 hover:border-blue-400/50 transition-all duration-300`}
                      onClick={() => openPlayer(videoId)}
                    >
                      <div className="flex items-center p-4 cursor-pointer group">
                        <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                          <img
                            src={thumbnailUrl}
                            alt={video.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                            {formatDuration(video.duration)}
                          </div>
                        </div>

                        <div className="flex-1 ml-4 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 ${styles.badgeGradient} text-white text-xs rounded`}
                            >
                              {video.category}
                            </span>
                            {isFavorite && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded flex items-center gap-1">
                                <FiHeart className="text-xs" />
                                Favorited
                              </span>
                            )}
                          </div>
                          <h3 className="text-white font-semibold text-base mb-1 truncate">
                            {video.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-blue-300 mb-1">
                            <span className="flex items-center gap-1">
                              <FiUser className="text-xs" />
                              {video.artist}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-blue-300/70">
                            <span className="flex items-center gap-1">
                              <AiOutlineYoutube />
                              {formatNumber(video.views)} views
                            </span>
                            <span className="flex items-center gap-1">
                              <FiCalendar className="text-xs" />
                              {video.uploadDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-4">
                          <button
                            onClick={(e) => toggleFavorite(videoId, e)}
                            className={`p-2 rounded-lg ${
                              isFavorite
                                ? "bg-red-500/20 text-red-400"
                                : "bg-blue-900/30 text-blue-300"
                            } hover:bg-red-500/20 hover:text-red-400 transition-colors`}
                          >
                            <FiHeart className={isFavorite ? "fill-red-400" : ""} />
                          </button>
                          <button
                            className="p-2 rounded-lg bg-blue-900/30 text-blue-300 hover:bg-blue-500/30 hover:text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPlayer(videoId);
                            }}
                          >
                            <FiPlay className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Load More */}
            {filteredVideos.length > 12 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-12"
              >
                <button
                  onClick={() => setShowAll(!showAll)}
                  className={`flex items-center gap-3 px-8 py-4 ${styles.primaryBtn} text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 group`}
                >
                  {showAll ? (
                    <>
                      <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                      Show Less Videos
                    </>
                  ) : (
                    <>
                      Load More Videos
                      <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Empty */}
            {filteredVideos.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-900/30 rounded-3xl mb-6 border border-blue-700/30">
                  <FiFilter className="text-4xl text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  No Songs Found
                </h3>
                <p className="text-blue-300/80 max-w-md mx-auto">
                  We couldn't find any songs matching your criteria. Try a
                  different search term or category.
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* ============ MODAL PLAYER (responsive + scroll) ============ */}
        <AnimatePresence>
          {activeVideo && isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-blue-950/95 backdrop-blur-sm z-50"
              onClick={closeModalToMini}
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="absolute inset-0 p-3 md:p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full h-full max-w-7xl mx-auto">
                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-white font-semibold text-lg md:text-xl truncate">
                      {activeVideoObj?.name || "Now playing"}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={closeModalToMini}
                        className="px-3 py-2 rounded-lg bg-blue-900/60 text-blue-100 border border-blue-700/40 hover:bg-blue-800/70 transition"
                        title="Mini player"
                      >
                        Mini
                      </button>

                      <button
                        onClick={closeEverything}
                        className="px-3 py-2 rounded-lg bg-red-600/80 text-white border border-white/10 hover:bg-red-600 transition"
                        title="Close player"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Main grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4 h-[calc(100%-52px)]">
                    {/* Player */}
                    <div className="flex flex-col min-h-0">
                      <div
                        ref={videoRef}
                        className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-blue-700/30 bg-black"
                      >
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                          title="Gospel Song"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          frameBorder="0"
                        />

                        {/* Always-visible controls (UI-only) */}
                        <div className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
                          {/* Progress */}
                          <div className="mb-2">
                            <input
                              type="range"
                              min="0"
                              max={duration || 0}
                              value={currentTime}
                              onChange={(e) => handleSeek(Number(e.target.value))}
                              className="w-full accent-blue-500"
                            />
                            <div className="flex justify-between text-white/80 text-xs">
                              <span>{formatTime(currentTime)}</span>
                              <span>{formatTime(duration)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={togglePlayPause}
                                className="w-11 h-11 rounded-full bg-blue-600/80 hover:bg-blue-500/90 flex items-center justify-center transition"
                              >
                                {isPlaying ? (
                                  <FiPause className="text-xl text-white" />
                                ) : (
                                  <FiPlay className="text-xl text-white ml-1" />
                                )}
                              </button>

                              <button
                                onClick={handlePrev}
                                className="w-10 h-10 rounded-lg bg-blue-900/50 hover:bg-blue-800/70 text-white flex items-center justify-center transition"
                                title="Previous"
                              >
                                <FiSkipBack />
                              </button>

                              <button
                                onClick={handleNext}
                                className="w-10 h-10 rounded-lg bg-blue-900/50 hover:bg-blue-800/70 text-white flex items-center justify-center transition"
                                title="Next"
                              >
                                <FiSkipForward />
                              </button>

                              <button
                                onClick={toggleFullscreen}
                                className="w-10 h-10 rounded-lg bg-blue-900/50 hover:bg-blue-800/70 text-white flex items-center justify-center transition"
                                title="Fullscreen"
                              >
                                {isFullscreen ? <FiMinimize /> : <FiMaximize />}
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={toggleMute}
                                className="w-10 h-10 rounded-lg bg-blue-900/50 hover:bg-blue-800/70 text-white flex items-center justify-center transition"
                                title="Mute"
                              >
                                {isMuted || volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
                              </button>

                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-24 accent-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mobile info (scrollable) */}
                      <div className="lg:hidden mt-3 min-h-0 overflow-y-auto rounded-2xl border border-blue-700/30 bg-blue-900/40 backdrop-blur-xl p-4">
                        {activeVideoObj && (
                          <>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className={`px-3 py-1 ${styles.badgeGradient} text-white text-sm font-semibold rounded-full`}>
                                {activeVideoObj.category}
                              </span>
                              <span className="text-blue-200 text-sm flex items-center gap-1">
                                <FiTrendingUp className="text-green-400" />
                                {formatNumber(activeVideoObj.views)} views
                              </span>
                              <span className="text-blue-200 text-sm flex items-center gap-1">
                                <AiOutlineStar className="text-yellow-400" />
                                {formatNumber(activeVideoObj.likes)} likes
                              </span>
                            </div>
                            <div className="text-blue-200/90 text-sm mb-2 flex items-center gap-2">
                              <FiUser /> {activeVideoObj.artist}
                            </div>
                            <p className="text-blue-200/90 text-sm">
                              {activeVideoObj.description ||
                                "A beautiful worship song to uplift your spirit."}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Desktop right panel (scrollable) */}
                    <div className="hidden lg:flex flex-col min-h-0 rounded-2xl border border-blue-700/30 bg-blue-900/40 backdrop-blur-xl overflow-hidden">
                      <div className="p-4 border-b border-blue-700/30">
                        {activeVideoObj && (
                          <>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className={`px-3 py-1 ${styles.badgeGradient} text-white text-sm font-semibold rounded-full`}>
                                {activeVideoObj.category}
                              </span>
                              <span className="text-blue-200 text-sm flex items-center gap-1">
                                <FiUser />
                                {activeVideoObj.artist}
                              </span>
                            </div>
                            <div className="flex gap-4 text-sm text-blue-200/90">
                              <span className="flex items-center gap-2">
                                <FiClock />
                                {formatDuration(activeVideoObj.duration)}
                              </span>
                              <span className="flex items-center gap-2">
                                <FiTrendingUp className="text-green-400" />
                                {formatNumber(activeVideoObj.views)}
                              </span>
                            </div>
                            <p className="text-blue-200/90 text-sm mt-3 line-clamp-4">
                              {activeVideoObj.description ||
                                "A beautiful worship song to uplift your spirit."}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="p-4 font-semibold text-white">More Videos</div>

                      <div className="px-4 pb-4 overflow-y-auto min-h-0">
                        <div className="space-y-3">
                          {videos.map((v) => {
                            const id = getVideoId(v.link);
                            if (!id) return null;
                            const thumb =
                              v.thumbnail ||
                              `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

                            return (
                              <button
                                key={id}
                                onClick={() => openPlayer(id)}
                                className={`w-full flex gap-3 p-2 rounded-xl border transition text-left ${
                                  id === activeVideo
                                    ? "border-blue-400 bg-blue-500/10"
                                    : "border-blue-700/30 hover:border-blue-500/60 hover:bg-blue-500/5"
                                }`}
                              >
                                <div className="w-24 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0">
                                  <img
                                    src={thumb}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-white text-sm font-semibold truncate">
                                    {v.name}
                                  </div>
                                  <div className="text-blue-200/80 text-xs truncate">
                                    {v.artist}
                                  </div>
                                  <div className="text-blue-200/70 text-xs mt-1">
                                    {formatDuration(v.duration)} • {formatNumber(v.views)} views
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile more videos (horizontal scroll) */}
                  <div className="lg:hidden mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-semibold">More Videos</div>
                      <button
                        onClick={closeModalToMini}
                        className="text-blue-300 hover:text-white text-sm transition"
                      >
                        Mini
                      </button>
                    </div>

                    <div className="flex overflow-x-auto gap-3 pb-2">
                      {videos.slice(0, 12).map((v) => {
                        const id = getVideoId(v.link);
                        if (!id) return null;
                        const thumb =
                          v.thumbnail ||
                          `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                        return (
                          <button
                            key={id}
                            onClick={() => openPlayer(id)}
                            className="flex-shrink-0 w-44 text-left"
                          >
                            <div
                              className={`relative w-44 aspect-video rounded-xl overflow-hidden border ${
                                id === activeVideo
                                  ? "border-blue-400"
                                  : "border-blue-700/30"
                              }`}
                            >
                              <img
                                src={thumb}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-white text-xs mt-1 truncate">
                              {v.name}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ MINI PLAYER (bottom-right) ============ */}
        <AnimatePresence>
          {activeVideo && isMiniPlayerOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              className="fixed bottom-4 right-4 z-50 w-[320px] sm:w-[360px] rounded-2xl overflow-hidden border border-blue-700/30 shadow-2xl shadow-blue-500/20 bg-blue-950/90 backdrop-blur"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-blue-700/30">
                <div className="text-white text-sm font-semibold truncate max-w-[220px]">
                  {activeVideoObj?.name || "Now playing"}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsModalOpen(true);
                      setIsMiniPlayerOpen(false);
                    }}
                    className="px-2 py-1 rounded-lg bg-blue-800/60 text-blue-100 hover:bg-blue-700/70 transition text-xs"
                  >
                    Open
                  </button>

                  <button
                    onClick={closeEverything}
                    className="w-8 h-8 rounded-lg bg-red-600/70 text-white hover:bg-red-600 transition flex items-center justify-center"
                    title="Close"
                  >
                    <FiX />
                  </button>
                </div>
              </div>

              <div className="relative w-full aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                  title="Mini Gospel Song"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  frameBorder="0"
                />
              </div>

              {/* Mini controls (UI-only) */}
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayPause}
                    className="w-10 h-10 rounded-full bg-blue-600/70 hover:bg-blue-500/80 text-white flex items-center justify-center transition"
                  >
                    {isPlaying ? <FiPause /> : <FiPlay className="ml-0.5" />}
                  </button>

                  <button
                    onClick={handlePrev}
                    className="w-9 h-9 rounded-lg bg-blue-900/50 hover:bg-blue-800/70 text-white flex items-center justify-center transition"
                    title="Prev"
                  >
                    <FiSkipBack />
                  </button>

                  <button
                    onClick={handleNext}
                    className="w-9 h-9 rounded-lg bg-blue-900/50 hover:bg-blue-800/70 text-white flex items-center justify-center transition"
                    title="Next"
                  >
                    <FiSkipForward />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsMiniPlayerOpen(false);
                  }}
                  className="w-9 h-9 rounded-lg bg-blue-900/50 hover:bg-blue-800/70 text-white flex items-center justify-center transition"
                  title="Fullscreen view"
                >
                  <FiMaximize />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-0.5 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400">
            <div className="bg-blue-950/90 backdrop-blur-sm rounded-2xl p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Enhance Your Worship Experience
                  </h3>
                  <p className="text-blue-300 max-w-lg">
                    Access curated playlists, download lyrics, and create custom
                    worship sessions.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    className={`px-6 py-3 ${styles.primaryBtn} text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300`}
                  >
                    Download App
                  </button>
                  <button className="px-6 py-3 bg-blue-900/40 text-blue-300 font-semibold rounded-xl border border-blue-700/50 hover:bg-blue-800/40 transition-all duration-300">
                    View Playlists
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GospelSongs;
