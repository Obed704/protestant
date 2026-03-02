import React, { useState, useEffect, useRef } from "react";
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
  FiSkipForward
} from "react-icons/fi";
import {
  AiOutlineLoading3Quarters,
  AiOutlineSearch,
  AiOutlineYoutube,
  AiOutlineFire,
  AiOutlineStar,
  AiOutlineClose
} from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/songs`;

const getVideoId = (url) => {
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const formatDuration = (seconds) => {
  if (!seconds) return "N/A";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);

  // Custom styles with blue theme
  const styles = {
    gradientBg: "bg-gradient-to-br from-blue-950 via-blue-900/30 to-blue-950",
    cardBg: "bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-xl",
    accentGradient: "bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400",
    primaryBtn: "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600",
    secondaryBtn: "bg-gradient-to-r from-blue-800/60 to-blue-900/60 hover:from-blue-700/60 hover:to-blue-800/60",
    categoryBtn: (isActive) =>
      isActive
        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30"
        : "bg-blue-900/40 hover:bg-blue-800/60 text-blue-200",
    badgeGradient: "bg-gradient-to-r from-blue-600 to-cyan-500"
  };

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINT);
        const enhancedVideos = res.data.map((video, index) => ({
          ...video,
          duration: Math.floor(Math.random() * 600) + 120,
          category:
            video.category ||
            ["worship", "praise", "hymn", "contemporary"][
              Math.floor(Math.random() * 4)
            ],
          views: Math.floor(Math.random() * 1000000) + 1000,
          likes: Math.floor(Math.random() * 50000) + 1000,
          uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          artist: video.artist || ["Hillsong Worship", "Bethel Music", "Elevation Worship", "Maverick City"][index % 4],
          thumbnail: `https://img.youtube.com/vi/${getVideoId(video.link)}/maxresdefault.jpg`
        }));
        setVideos(enhancedVideos);
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  // Extract unique categories
  const categories = [
    "all",
    ...new Set(videos.map((v) => v.category).filter(Boolean)),
  ];

  // Sort videos
  const sortedVideos = [...videos].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.views - a.views;
      case "newest":
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      default:
        return 0;
    }
  });

  // Filter videos
  const filteredVideos = sortedVideos.filter((video) => {
    const name = video.name || "";
    const desc = video.description || "";
    const artist = video.artist || "";
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedVideos = showAll
    ? filteredVideos
    : filteredVideos.slice(0, 12);

  // Navigation in modal
  const handleNext = () => {
    const currentIdx = videos.findIndex(
      (v) => getVideoId(v.link) === activeVideo
    );
    const nextIdx = (currentIdx + 1) % videos.length;
    setActiveVideo(getVideoId(videos[nextIdx].link));
  };

  const handlePrev = () => {
    const currentIdx = videos.findIndex(
      (v) => getVideoId(v.link) === activeVideo
    );
    const prevIdx = (currentIdx - 1 + videos.length) % videos.length;
    setActiveVideo(getVideoId(videos[prevIdx].link));
  };

  // Toggle favorite
  const toggleFavorite = (videoId, e) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  };

  // Shuffle videos
  const shuffleVideos = () => {
    const shuffled = [...filteredVideos].sort(() => Math.random() - 0.5);
    const videoId = getVideoId(shuffled[0]?.link);
    if (videoId) {
      setActiveVideo(videoId);
    }
  };

  // Video controls
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, you would control the YouTube iframe
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen && videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };

  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
  };

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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
        {/* Header Section */}
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
                Curated collection of worship songs to uplift your spirit and strengthen your faith
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className={`${styles.cardBg} px-6 py-4 rounded-2xl border border-blue-700/30`}>
                <div className="text-3xl font-bold text-white">{videos.length}</div>
                <div className="text-blue-300 text-sm">Total Songs</div>
              </div>
              <div className={`${styles.cardBg} px-6 py-4 rounded-2xl border border-blue-700/30`}>
                <div className="text-3xl font-bold text-white">{favorites.length}</div>
                <div className="text-blue-300 text-sm">Favorites</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className={`${styles.cardBg} rounded-2xl border border-blue-700/30 p-6`}>
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search Bar */}
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

              {/* Controls Group */}
              <div className="flex flex-wrap items-center gap-3">
                {/* View Toggle */}
                <div className={`${styles.secondaryBtn} rounded-xl p-1 flex items-center`}>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-blue-300 hover:text-white"}`}
                  >
                    <FiGrid className="text-lg" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-lg transition-all ${viewMode === "list" ? "bg-blue-600 text-white" : "text-blue-300 hover:text-white"}`}
                  >
                    <FiList className="text-lg" />
                  </button>
                </div>

                {/* Sort Options */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`${styles.secondaryBtn} text-white border border-blue-700/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                >
                  <option value="default">Default</option>
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest First</option>
                </select>

                {/* Shuffle Button */}
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
                    {selectedCategory === category && <AiOutlineFire className="text-sm" />}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
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
            <p className="text-blue-300 mt-6 text-lg">Loading worship collection...</p>
          </div>
        ) : (
          <>
            {/* Videos Display - Grid View */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                <AnimatePresence>
                  {displayedVideos.map((video, index) => {
                    const videoId = getVideoId(video.link);
                    if (!videoId) return null;

                    const isFavorite = favorites.includes(videoId);
                    const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

                    return (
                      <motion.div
                        key={videoId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ y: -8 }}
                        className="group cursor-pointer"
                        onClick={() => setActiveVideo(videoId)}
                      >
                        <div
                          className={`${styles.cardBg} rounded-2xl overflow-hidden border border-blue-800/50 hover:border-blue-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 h-full flex flex-col`}
                        >
                          {/* Thumbnail Container */}
                          <div className="relative aspect-video overflow-hidden flex-shrink-0">
                            {/* Video Thumbnail */}
                            <img
                              src={thumbnailUrl}
                              alt={video.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => {
                                e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                              }}
                            />

                            {/* Play Button Overlay */}
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

                            {/* Video Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`px-2 py-0.5 ${styles.badgeGradient} text-white text-xs font-bold rounded`}>
                                  {video.category?.toUpperCase() || "WORSHIP"}
                                </span>
                                <button
                                  onClick={(e) => toggleFavorite(videoId, e)}
                                  className={`p-1.5 rounded-full backdrop-blur-sm ${
                                    isFavorite ? "bg-red-500/90" : "bg-black/40"
                                  } hover:bg-red-500/90 transition-colors`}
                                >
                                  <FiHeart
                                    className={
                                      isFavorite ? "text-white fill-white" : "text-white/80"
                                    }
                                  />
                                </button>
                              </div>
                              
                              {/* Duration Badge */}
                              <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded-lg backdrop-blur-sm flex items-center gap-1">
                                <FiClock className="text-xs" />
                                {formatDuration(video.duration)}
                              </div>
                            </div>
                          </div>

                          {/* Video Info */}
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 flex-1">
                              {video.name}
                            </h3>
                            <div className="flex items-center justify-between text-xs mt-auto">
                              <div className="flex items-center gap-2 text-blue-300">
                                <FiUser className="text-xs" />
                                <span className="truncate max-w-[100px]">{video.artist}</span>
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
              /* List View */
              <div className="space-y-3">
                {displayedVideos.map((video, index) => {
                  const videoId = getVideoId(video.link);
                  if (!videoId) return null;

                  const isFavorite = favorites.includes(videoId);
                  const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

                  return (
                    <motion.div
                      key={videoId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`${styles.cardBg} rounded-xl border border-blue-800/30 hover:border-blue-400/50 transition-all duration-300`}
                      onClick={() => setActiveVideo(videoId)}
                    >
                      <div className="flex items-center p-4 cursor-pointer group">
                        <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={thumbnailUrl}
                            alt={video.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-10 h-10 rounded-full bg-blue-500/80 flex items-center justify-center">
                              <FiPlay className="text-lg text-white ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                            {formatDuration(video.duration)}
                          </div>
                        </div>

                        <div className="flex-1 ml-4 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 ${styles.badgeGradient} text-white text-xs rounded`}>
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
                            className={`p-2 rounded-lg ${isFavorite ? "bg-red-500/20 text-red-400" : "bg-blue-900/30 text-blue-300"} hover:bg-red-500/20 hover:text-red-400 transition-colors`}
                          >
                            <FiHeart className={isFavorite ? "fill-red-400" : ""} />
                          </button>
                          <button className="p-2 rounded-lg bg-blue-900/30 text-blue-300 hover:bg-blue-500/30 hover:text-white transition-colors">
                            <FiPlay className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Load More / Show Less */}
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

            {/* Empty State */}
            {filteredVideos.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-900/30 rounded-3xl mb-6 border border-blue-700/30">
                  <FiFilter className="text-4xl text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Songs Found</h3>
                <p className="text-blue-300/80 max-w-md mx-auto">
                  We couldn't find any songs matching your criteria. Try a different search term or category.
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* Video Modal */}
        <AnimatePresence>
          {activeVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-blue-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveVideo(null)}
            >
              {/* Main Modal Container */}
              <div className="relative w-full max-w-6xl">
                {/* Close Button - Large and Prominent */}
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  onClick={() => setActiveVideo(null)}
                  className="absolute -top-4 -right-4 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30 border-2 border-white/20 hover:shadow-red-500/50 transition-all duration-300"
                >
                  <AiOutlineClose className="text-2xl" />
                </motion.button>

                {/* Navigation Buttons */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-4 lg:-left-14 top-1/2 transform -translate-y-1/2 text-white text-3xl p-4 bg-blue-900/60 hover:bg-blue-800/80 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 z-10 border border-blue-700/30"
                >
                  <FiChevronLeft />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 lg:-right-14 top-1/2 transform -translate-y-1/2 text-white text-3xl p-4 bg-blue-900/60 hover:bg-blue-800/80 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 z-10 border border-blue-700/30"
                >
                  <FiChevronRight />
                </button>

                {/* Video Info */}
                <div className="absolute top-6 left-6 lg:left-12 text-white max-w-xl z-10">
                  {(() => {
                    const video = videos.find(
                      (v) => getVideoId(v.link) === activeVideo
                    );
                    return video ? (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-900/60 backdrop-blur-sm rounded-xl p-4 border border-blue-700/30"
                      >
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className={`px-3 py-1 ${styles.badgeGradient} text-white text-sm font-semibold rounded-full`}>
                            {video.category}
                          </span>
                          <span className="text-blue-300 text-sm flex items-center gap-1">
                            <AiOutlineStar className="text-yellow-400" />
                            {formatNumber(video.likes)} likes
                          </span>
                          <span className="text-blue-300 text-sm flex items-center gap-1">
                            <FiTrendingUp className="text-green-400" />
                            {formatNumber(video.views)} views
                          </span>
                        </div>
                        <h3 className="text-2xl lg:text-3xl font-bold mb-2 line-clamp-2">{video.name}</h3>
                        <div className="flex items-center gap-4 mb-3 text-sm text-blue-300">
                          <span className="flex items-center gap-2">
                            <FiUser />
                            {video.artist}
                          </span>
                          <span className="flex items-center gap-2">
                            <FiClock />
                            {formatDuration(video.duration)}
                          </span>
                        </div>
                        <p className="text-blue-200/90 text-sm lg:text-base line-clamp-2">
                          {video.description || "A beautiful worship song to uplift your spirit."}
                        </p>
                      </motion.div>
                    ) : null;
                  })()}
                </div>

                {/* Video Player Container */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-blue-700/30"
                  onClick={(e) => e.stopPropagation()}
                  ref={videoRef}
                >
                  {/* YouTube Player */}
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`}
                    title="Gospel Song"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    frameBorder="0"
                  />

                  {/* Custom Video Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="h-1 bg-blue-900/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-white text-xs mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Play/Pause */}
                        <button
                          onClick={togglePlayPause}
                          className="w-12 h-12 rounded-full bg-blue-600/80 hover:bg-blue-500/90 flex items-center justify-center transition-all duration-200 hover:scale-110"
                        >
                          {isPlaying ? (
                            <FiPause className="text-xl text-white" />
                          ) : (
                            <FiPlay className="text-xl text-white ml-1" />
                          )}
                        </button>

                        {/* Skip Backward */}
                        <button
                          onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                          className="p-2 text-white hover:text-blue-300 transition-colors"
                        >
                          <FiSkipBack className="text-xl" />
                        </button>

                        {/* Skip Forward */}
                        <button
                          onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                          className="p-2 text-white hover:text-blue-300 transition-colors"
                        >
                          <FiSkipForward className="text-xl" />
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={toggleMute}
                            className="p-2 text-white hover:text-blue-300 transition-colors"
                          >
                            {isMuted || volume === 0 ? (
                              <FiVolumeX className="text-xl" />
                            ) : (
                              <FiVolume2 className="text-xl" />
                            )}
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

                      {/* Right Side Controls */}
                      <div className="flex items-center gap-3">
                        {/* Current Time */}
                        <div className="px-3 py-1 bg-blue-900/50 rounded-lg text-white text-sm">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </div>

                        {/* Fullscreen Toggle */}
                        <button
                          onClick={toggleFullscreen}
                          className="w-10 h-10 rounded-lg bg-blue-600/50 hover:bg-blue-500/70 flex items-center justify-center transition-all duration-200 hover:scale-110"
                        >
                          {isFullscreen ? (
                            <FiMinimize className="text-lg text-white" />
                          ) : (
                            <FiMaximize className="text-lg text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Play/Pause Overlay Button */}
                  <button
                    onClick={togglePlayPause}
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="w-24 h-24 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
                      {isPlaying ? (
                        <FiPause className="text-4xl text-white" />
                      ) : (
                        <FiPlay className="text-4xl text-white ml-2" />
                      )}
                    </div>
                  </button>

                  {/* Gradient Overlays */}
                  <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-950/90 to-transparent pointer-events-none"></div>
                  <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-950/90 to-transparent pointer-events-none"></div>
                </motion.div>

                {/* Thumbnail Carousel */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold text-lg">More Videos</h4>
                    <button
                      onClick={() => setActiveVideo(null)}
                      className="text-blue-300 hover:text-white text-sm flex items-center gap-2 transition-colors"
                    >
                      Close
                      <FiX className="text-sm" />
                    </button>
                  </div>
                  <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                    {videos.slice(0, 12).map((v) => {
                      const id = getVideoId(v.link);
                      const thumbnail = v.thumbnail || `https://img.youtube.com/vi/${id}/default.jpg`;
                      
                      return (
                        <motion.div
                          key={id}
                          whileHover={{ scale: 1.05 }}
                          className="flex-shrink-0 cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveVideo(id);
                          }}
                        >
                          <div className={`relative w-40 h-24 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            id === activeVideo
                              ? "border-blue-400 shadow-lg shadow-blue-400/30"
                              : "border-transparent hover:border-blue-500/50"
                          }`}>
                            <img
                              src={thumbnail}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {id === activeVideo && (
                              <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                  <FiPlay className="text-white text-xs ml-0.5" />
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                              {formatDuration(v.duration)}
                            </div>
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                              {v.category}
                            </div>
                          </div>
                          <p className="text-white text-xs mt-1 truncate max-w-[160px]">
                            {v.name}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
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
                  <h3 className="text-2xl font-bold text-white mb-2">Enhance Your Worship Experience</h3>
                  <p className="text-blue-300 max-w-lg">
                    Access curated playlists, download lyrics, and create custom worship sessions.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button className={`px-6 py-3 ${styles.primaryBtn} text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300`}>
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