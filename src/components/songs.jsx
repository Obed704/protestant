import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  FiPlay,
  FiPause,
  FiX,
  FiClock,
  FiGrid,
  FiList,
  FiUser,
  FiHeart,
  FiShuffle,
  FiTrendingUp,
  FiMaximize,
  FiMinimize,
  FiSkipBack,
  FiSkipForward,
  FiChevronLeft,
  FiChevronRight,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { AiOutlineSearch, AiOutlineStar } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { useAppData } from "../context/DataContext.jsx";

// Helper: get YouTube video ID from URL
const getVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const formatDuration = (seconds) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(s / 60);
  const secs = s % 60;
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

// YouTube IFrame API loader
const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
};

const GospelSongs = () => {
  const { songs: videosFromContext, loading: globalLoading } = useAppData();

  // ---------- Data state ----------
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------- UI state ----------
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("default");
  const [showAll, setShowAll] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // ---------- Player state ----------
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [activeVideoObj, setActiveVideoObj] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const playerRef = useRef(null);
  const containerRef = useRef(null);

  // ---------- Process videos from context ----------
  useEffect(() => {
    if (!videosFromContext) return;
    const enhanced = videosFromContext.map((v, idx) => {
      const id = getVideoId(v.link);
      return {
        ...v,
        id,
        name: v.name || v.title || "Untitled Worship Song",
        artist: v.artist || "Worship Collective",
        duration: v.duration || Math.floor(Math.random() * 600) + 120,
        category: v.category || (idx % 2 === 0 ? "praise" : "worship"),
        views: v.views || Math.floor(Math.random() * 1000000) + 1000,
        likes: v.likes || Math.floor(Math.random() * 50000) + 1000,
        uploadDate:
          v.uploadDate ||
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        thumbnail:
          v.thumbnail ||
          (id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null),
      };
    });
    setVideos(enhanced);
    setLoading(false);
  }, [videosFromContext]);

  const categories = useMemo(() => {
    return ["all", ...new Set(videos.map((v) => v.category).filter(Boolean))];
  }, [videos]);

  const filteredVideos = useMemo(() => {
    let arr = [...videos];
    if (sortBy === "popular")
      arr.sort((a, b) => (b.views || 0) - (a.views || 0));
    if (sortBy === "newest")
      arr.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    return arr.filter((video) => {
      const name = (video.name || "").toLowerCase();
      const artist = (video.artist || "").toLowerCase();
      const s = searchTerm.toLowerCase();
      const matchesSearch = name.includes(s) || artist.includes(s);
      const matchesCategory =
        selectedCategory === "all" || video.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [videos, searchTerm, selectedCategory, sortBy]);

  const displayedVideos = showAll
    ? filteredVideos
    : filteredVideos.slice(0, 12);

  const toggleFavorite = (videoId, e) => {
    e?.stopPropagation();
    setFavorites((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId],
    );
  };

  const openPlayer = (videoId) => {
    const video = videos.find((v) => v.id === videoId);
    if (!video) return;
    setActiveVideoId(videoId);
    setActiveVideoObj(video);
    setIsModalOpen(true);
    setIsMiniPlayerOpen(false);
  };

  const closeModalToMini = () => {
    setIsModalOpen(false);
    setIsMiniPlayerOpen(true);
  };

  const closeEverything = () => {
    setIsModalOpen(false);
    setIsMiniPlayerOpen(false);
    setActiveVideoId(null);
    setActiveVideoObj(null);
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
  };

  const handlePrev = () => {
    const currentIdx = videos.findIndex((v) => v.id === activeVideoId);
    if (currentIdx === -1) return;
    const prevIdx = (currentIdx - 1 + videos.length) % videos.length;
    openPlayer(videos[prevIdx].id);
  };

  const handleNext = () => {
    const currentIdx = videos.findIndex((v) => v.id === activeVideoId);
    if (currentIdx === -1) return;
    const nextIdx = (currentIdx + 1) % videos.length;
    openPlayer(videos[nextIdx].id);
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const handleSeek = (time) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(time, true);
    setCurrentTime(time);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    if (!isModalOpen || !activeVideoId) return;
    let internalPlayer = null;
    const initPlayer = async () => {
      const YT = await loadYouTubeAPI();
      internalPlayer = new YT.Player("youtube-player-modal", {
        videoId: activeVideoId,
        playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0 },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            setDuration(event.target.getDuration());
            event.target.setVolume(isMuted ? 0 : volume * 100);
            setIsPlaying(true);
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) setIsPlaying(true);
            if (event.data === YT.PlayerState.PAUSED) setIsPlaying(false);
            if (event.data === YT.PlayerState.ENDED) handleNext();
          },
        },
      });
    };
    initPlayer();
    return () => {
      if (internalPlayer && internalPlayer.destroy) {
        internalPlayer.destroy();
        playerRef.current = null;
      }
    };
  }, [isModalOpen, activeVideoId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        playerRef.current &&
        isPlaying &&
        typeof playerRef.current.getCurrentTime === "function"
      ) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (playerRef.current)
      playerRef.current.setVolume(isMuted ? 0 : volume * 100);
  }, [volume, isMuted]);

  const styles = {
    glassCard:
      "bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
    inputGlass:
      "bg-white/5 backdrop-blur-md border border-white/10 focus:border-emerald-500/50 transition-all",
    accentText:
      "bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent",
    pillActive:
      "bg-emerald-500 text-white shadow-[0_10px_20px_rgba(16,185,129,0.2)]",
    pillInactive:
      "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5",
  };

  if (globalLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full"
        />
      </div>
    );

  return (
    <section className="relative w-full min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      {/* BACKGROUND ELEMENTS - FIXED OVERLAY REMOVED */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-24 scale-[0.95] md:scale-100 origin-top">
        <header className="mb-10 md:mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 opacity-80 block mb-2">
              Heavenly Melodies
            </span>
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter text-white">
              Gospel <span className={styles.accentText}>Library</span>
            </h1>
          </motion.div>

          <div
            className={`${styles.glassCard} p-3 md:p-4 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col md:flex-row gap-4 items-center`}
          >
            <div className="relative flex-1 w-full">
              <AiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search songs..."
                className={`${styles.inputGlass} w-full pl-10 pr-4 py-3 rounded-xl md:rounded-[1.5rem] outline-none text-xs md:text-sm text-white`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hidden md:flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl ${viewMode === "grid" ? "bg-emerald-500" : "text-slate-400"}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl ${viewMode === "list" ? "bg-emerald-500" : "text-slate-400"}`}
              >
                <FiList />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? styles.pillActive : styles.pillInactive}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`${styles.pillInactive} px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-wider bg-transparent outline-none`}
              >
                <option value="default" className="bg-slate-900">
                  Default
                </option>
                <option value="popular" className="bg-slate-900">
                  Most Popular
                </option>
                <option value="newest" className="bg-slate-900">
                  Newest First
                </option>
              </select>
              <button
                onClick={() =>
                  openPlayer(
                    filteredVideos[
                      Math.floor(Math.random() * filteredVideos.length)
                    ]?.id,
                  )
                }
                className={`${styles.pillInactive} px-3 py-2 rounded-full flex items-center gap-1 text-[10px] font-black uppercase tracking-wider`}
              >
                <FiShuffle size={12} /> Shuffle
              </button>
            </div>
          </div>
        </header>

        <motion.div
          layout
          className={`grid gap-3 md:gap-6 ${viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          <AnimatePresence mode="popLayout">
            {displayedVideos.map((video) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${styles.glassCard} rounded-2xl md:rounded-[2rem] group cursor-pointer overflow-hidden flex flex-col h-full`}
                onClick={() => openPlayer(video.id)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 md:w-14 md:h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                      <FiPlay
                        fill="currentColor"
                        size={14}
                        className="md:size-5 ml-0.5"
                      />
                    </div>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(video.id, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-sm z-10"
                  >
                    <FiHeart
                      className={
                        favorites.includes(video.id)
                          ? "fill-red-500 text-red-500"
                          : "text-white"
                      }
                      size={14}
                    />
                  </button>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[10px] font-mono text-white">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                <div className="p-3 md:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-emerald-400">
                      {video.category}
                    </span>
                    <h3 className="text-[11px] md:text-xl font-bold text-white mt-1 md:mt-4 line-clamp-1 md:line-clamp-2 leading-tight">
                      {video.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 mt-3 md:mt-6 pt-2 md:pt-6 border-t border-white/5">
                    <div className="flex items-center gap-1 min-w-0">
                      <FiUser className="text-emerald-500 shrink-0 size-3 md:size-4" />
                      <span className="text-[9px] md:text-xs font-semibold truncate">
                        {video.artist}
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold">
                      <FiTrendingUp size={10} /> {formatNumber(video.views)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredVideos.length > 12 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className={`${styles.pillActive} px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2`}
            >
              {showAll ? (
                <>
                  Show Less <FiChevronLeft />
                </>
              ) : (
                <>
                  Load More <FiChevronRight />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mini Player */}
      <AnimatePresence>
        {activeVideoObj && isMiniPlayerOpen && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl"
          >
            <div className="bg-slate-900/95 backdrop-blur-3xl border border-white/20 rounded-2xl md:rounded-[2.5rem] p-2 md:p-4 flex items-center gap-3 md:gap-6 shadow-2xl">
              <img
                src={activeVideoObj.thumbnail}
                className="w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-2xl object-cover"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-xs md:text-sm truncate">
                  {activeVideoObj.name}
                </h4>
                <p className="text-slate-400 text-[10px] md:text-xs truncate">
                  {activeVideoObj.artist}
                </p>
              </div>
              <div className="flex items-center gap-1 md:gap-4">
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsMiniPlayerOpen(false);
                  }}
                  className="w-8 h-8 md:w-12 md:h-12 bg-white text-black rounded-full flex items-center justify-center"
                >
                  <FiPlay size={16} className="ml-0.5" />
                </button>
                <button
                  onClick={closeEverything}
                  className="p-2 text-slate-400"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Player - Opacity adjusted for clarity */}
      <AnimatePresence>
        {activeVideoId && isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModalToMini}
          >
            <motion.div
              ref={containerRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={closeModalToMini}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20"
                    >
                      Mini Player
                    </button>
                    <button
                      onClick={closeEverything}
                      className="px-3 py-1.5 rounded-lg bg-red-600/80 text-white text-xs"
                    >
                      Close
                    </button>
                  </div>
                  <h2 className="text-white font-semibold truncate max-w-[50%]">
                    {activeVideoObj?.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.5fr] gap-4 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                      <div
                        id="youtube-player-modal"
                        className="w-full h-full"
                      />
                    </div>
                    {/* Controls */}
                    <div className="bg-white/5 p-4 rounded-xl space-y-3">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={(e) => handleSeek(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-1"
                      />
                      <div className="flex justify-between text-white/50 text-[10px] font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={handlePrev}
                            className="text-white/70 hover:text-white"
                          >
                            <FiSkipBack size={20} />
                          </button>
                          <button
                            onClick={togglePlayPause}
                            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition"
                          >
                            {isPlaying ? (
                              <FiPause size={24} />
                            ) : (
                              <FiPlay size={24} className="ml-1" />
                            )}
                          </button>
                          <button
                            onClick={handleNext}
                            className="text-white/70 hover:text-white"
                          >
                            <FiSkipForward size={20} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-white/70"
                          >
                            {isMuted ? (
                              <FiVolumeX size={18} />
                            ) : (
                              <FiVolume2 size={18} />
                            )}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) =>
                              setVolume(parseFloat(e.target.value))
                            }
                            className="w-20 accent-emerald-500 h-1"
                          />
                          <button
                            onClick={toggleFullscreen}
                            className="text-white/70"
                          >
                            <FiMaximize size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl">
                      <h4 className="text-white font-bold mb-2">Up Next</h4>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {videos.slice(0, 10).map((v) => (
                          <button
                            key={v.id}
                            onClick={() => openPlayer(v.id)}
                            className={`w-full flex gap-3 p-2 rounded-lg transition-all text-left ${v.id === activeVideoId ? "bg-emerald-500/20 border border-emerald-500/40" : "hover:bg-white/5"}`}
                          >
                            <img
                              src={v.thumbnail}
                              className="w-16 h-10 rounded object-cover shrink-0"
                              alt=""
                            />
                            <div className="min-w-0">
                              <p className="text-white text-xs font-semibold truncate">
                                {v.name}
                              </p>
                              <p className="text-slate-500 text-[10px] truncate">
                                {v.artist}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GospelSongs;
