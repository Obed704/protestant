// src/components/largeVideos.jsx
import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import {
  FiPlay,
  FiPause,
  FiX,
  FiHeart,
  FiList,
  FiGrid,
  FiShuffle,
  FiUser,
  FiMessageCircle,
  FiSend,
  FiMaximize,
  FiMinimize,
  FiSkipBack,
  FiSkipForward,
  FiStar,
} from "react-icons/fi";
import { AiOutlineLoading3Quarters, AiOutlineSearch, AiOutlineYoutube } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { AuthContext } from "../context/authContext.jsx";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/largeVideo`;

const getIdFromEmbedOrUrl = (video) => {
  if (video?.youtubeId) return video.youtubeId;
  const s = video?.youtubeUrl || video?.src || "";
  const match = s.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const formatNumber = (num) => {
  const n = Number(num) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
};

const LargeVideos = () => {
  const { token, authLoading } = useContext(AuthContext);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("default");
  const [scope, setScope] = useState("all");

  const [activeVideoDb, setActiveVideoDb] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState(false);
  const [isDocked, setIsDocked] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const playerRef = useRef(null);
  const iframeRef = useRef(null);

  const styles = useMemo(
    () => ({
      gradientBg: "bg-gradient-to-br from-blue-950 via-blue-900/30 to-blue-950",
      cardBg: "bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-xl",
      primaryBtn:
        "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600",
      secondaryBtn:
        "bg-gradient-to-r from-blue-800/60 to-blue-900/60 hover:from-blue-700/60 hover:to-blue-800/60",
      badgeGradient: "bg-gradient-to-r from-blue-600 to-cyan-500",
      pill: (active) =>
        active
          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/20"
          : "bg-blue-900/40 hover:bg-blue-800/60 text-blue-200",
    }),
    []
  );

  // Keep middleware/auth.js unchanged: send multiple styles
  const authHeaders = () => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      token: token,
      "x-access-token": token,
    };
  };

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINT);
        setVideos(res.data || []);
      } catch (e) {
        console.error("Fetch large videos failed:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Fetch favorites ids (after AuthContext loads)
  useEffect(() => {
    const fetchFavIds = async () => {
      if (authLoading) return;

      if (!token) {
        setFavoriteIds(new Set());
        return;
      }

      try {
        const res = await fetch(`${API_ENDPOINT}/favorites/ids`, {
          headers: authHeaders(),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn("Favorites ids failed:", res.status, err);
          return;
        }

        const data = await res.json();
        setFavoriteIds(new Set((data?.ids || []).map(String)));
      } catch (e) {
        console.error("Fetch favorites failed:", e);
      }
    };

    fetchFavIds();
  }, [token, authLoading]);

  const sortedVideos = useMemo(() => {
    const arr = [...videos];
    arr.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.likes || 0) - (a.likes || 0);
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
    return arr;
  }, [videos, sortBy]);

  const filteredVideos = useMemo(() => {
    const s = searchTerm.toLowerCase();

    const base = sortedVideos.filter((v) => {
      const t = (v.title || "").toLowerCase();
      const d = (v.description || "").toLowerCase();
      const u = (v.uploader || "").toLowerCase();
      const c = (v.youtubeChannel || "").toLowerCase();
      return t.includes(s) || d.includes(s) || u.includes(s) || c.includes(s);
    });

    if (scope === "favorites") {
      return base.filter((v) => favoriteIds.has(String(v._id)));
    }

    return base;
  }, [sortedVideos, searchTerm, scope, favoriteIds]);

  const openPlayer = (video) => {
    setActiveVideoDb(video);
    setIsModalOpen(true);
    setIsMiniPlayerOpen(false);
    setIsDocked(false);
    setIsPlaying(true);
    setShowComments(false);
  };

  const closeModalToMini = () => {
    setIsModalOpen(false);
    setIsMiniPlayerOpen(true);
  };

  const closeEverything = () => {
    setIsModalOpen(false);
    setIsMiniPlayerOpen(false);
    setActiveVideoDb(null);
    setIsDocked(false);
    setIsPlaying(false);
    setShowComments(false);
    setNewComment("");
    setIsFullscreen(false);
  };

  // auto-mini on scroll
  useEffect(() => {
    const onScroll = () => {
      if (!activeVideoDb) return;
      if (!isModalOpen) return;
      if (window.scrollY > 200) setIsDocked(true);
      else setIsDocked(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeVideoDb, isModalOpen]);

  useEffect(() => {
    if (isDocked && isModalOpen) {
      setIsModalOpen(false);
      setIsMiniPlayerOpen(true);
    }
  }, [isDocked, isModalOpen]);

  const handleNext = () => {
    if (!activeVideoDb || videos.length === 0) return;
    const list = filteredVideos.length ? filteredVideos : videos;
    const idx = list.findIndex((x) => x._id === activeVideoDb._id);
    if (idx === -1) return;
    openPlayer(list[(idx + 1) % list.length]);
  };

  const handlePrev = () => {
    if (!activeVideoDb || videos.length === 0) return;
    const list = filteredVideos.length ? filteredVideos : videos;
    const idx = list.findIndex((x) => x._id === activeVideoDb._id);
    if (idx === -1) return;
    openPlayer(list[(idx - 1 + list.length) % list.length]);
  };

  // Like (now protected in backend to block duplicates)
  const handleLike = async (e) => {
    e?.stopPropagation?.();
    if (!activeVideoDb) return;

    if (!token) {
      alert("Please login to like videos");
      return;
    }

    try {
      const res = await fetch(`${API_ENDPOINT}/${activeVideoDb._id}/like`, {
        method: "POST",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 400) {
          alert(err?.message || "You already liked this video");
          return;
        }
        alert(err?.message || "Like failed");
        return;
      }

      const updated = await res.json();
      setActiveVideoDb(updated);
      setVideos((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  // Comment (protected)
  const handleCommentSubmit = async () => {
    if (!activeVideoDb) return;
    if (!newComment.trim()) return;

    if (!token) {
      alert("Please login to comment");
      return;
    }

    try {
      const res = await fetch(`${API_ENDPOINT}/${activeVideoDb._id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.message || "Comment failed");
        return;
      }

      const updated = await res.json();
      setActiveVideoDb(updated);
      setVideos((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
      setNewComment("");
    } catch (err) {
      console.error("Comment failed:", err);
      alert("Failed to post comment");
    }
  };

  // Favorite toggle (protected)
  const toggleFavorite = async (videoId, e) => {
    e?.stopPropagation?.();

    if (!token) {
      alert("Please login to use favorites");
      return;
    }

    try {
      const res = await fetch(`${API_ENDPOINT}/${videoId}/favorite/toggle`, {
        method: "POST",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.message || "Favorite failed");
        return;
      }

      const data = await res.json();
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (data?.favorited) next.add(String(videoId));
        else next.delete(String(videoId));
        return next;
      });
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    }
  };

  // Mobile-friendly fullscreen:
  // - Try iframe requestFullscreen (best on Android)
  // - Fallback to container requestFullscreen
  // - If neither works, modal is already full-screen (works everywhere)
  const toggleFullscreen = async () => {
    try {
      const iframeEl = iframeRef.current;
      const containerEl = playerRef.current;

      if (!document.fullscreenElement) {
        if (iframeEl?.requestFullscreen) {
          await iframeEl.requestFullscreen();
        } else if (containerEl?.requestFullscreen) {
          await containerEl.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn("Fullscreen failed:", e);
      // Modal already fills the screen; this is the safe fallback.
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const activeId = useMemo(() => getIdFromEmbedOrUrl(activeVideoDb), [activeVideoDb]);
  const activeIsFav = useMemo(
    () => (activeVideoDb ? favoriteIds.has(String(activeVideoDb._id)) : false),
    [activeVideoDb, favoriteIds]
  );

  return (
    <section className={`min-h-screen py-10 px-4 md:px-8 lg:px-12 ${styles.gradientBg} relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:40px_40px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                <AiOutlineYoutube className="text-blue-400" />
                <span className="text-blue-300 text-sm font-semibold tracking-wider">
                  LARGE VIDEOS • YOUTUBE
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                  Church Videos
                </span>
              </h1>

              <p className="text-blue-200/80 text-lg max-w-2xl">
                Like, comment, and save your favorites.
              </p>
            </div>

            <div className={`${styles.cardBg} px-6 py-4 rounded-2xl border border-blue-700/30`}>
              <div className="text-3xl font-bold text-white">{filteredVideos.length}</div>
              <div className="text-blue-300 text-sm">
                {scope === "favorites" ? "My Favorites" : "Videos"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className={`${styles.cardBg} rounded-2xl border border-blue-700/30 p-6 mb-8`}>
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative group">
                <AiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 text-xl" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search title, description, uploader..."
                  className={`${styles.cardBg} pl-12 pr-4 py-3.5 w-full rounded-xl border border-blue-700/50 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setScope("all")}
                className={`px-4 py-2.5 rounded-xl transition ${styles.pill(scope === "all")}`}
              >
                All
              </button>

              <button
                onClick={() => setScope("favorites")}
                className={`px-4 py-2.5 rounded-xl transition ${styles.pill(scope === "favorites")}`}
                title={!token ? "Login required" : "My favorites"}
              >
                <span className="inline-flex items-center gap-2">
                  <FiStar />
                  Favorites
                </span>
              </button>

              <div className={`${styles.secondaryBtn} rounded-xl p-1 flex items-center`}>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    viewMode === "grid" ? "bg-blue-600 text-white" : "text-blue-300 hover:text-white"
                  }`}
                >
                  <FiGrid className="text-lg" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    viewMode === "list" ? "bg-blue-600 text-white" : "text-blue-300 hover:text-white"
                  }`}
                >
                  <FiList className="text-lg" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`${styles.secondaryBtn} text-white border border-blue-700/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              >
                <option value="default">Default</option>
                <option value="popular">Most Liked</option>
                <option value="newest">Newest</option>
              </select>

              <button
                onClick={() => {
                  if (filteredVideos.length === 0) return;
                  const shuffled = [...filteredVideos].sort(() => Math.random() - 0.5);
                  openPlayer(shuffled[0]);
                }}
                className={`${styles.primaryBtn} text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all`}
              >
                <FiShuffle />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <AiOutlineLoading3Quarters className="text-4xl text-blue-300" />
            </motion.div>
            <p className="text-blue-300 mt-4">Loading videos...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-20 text-blue-200/80">No videos found.</div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            <AnimatePresence>
              {filteredVideos.map((v, index) => {
                const vid = getIdFromEmbedOrUrl(v);
                if (!vid) return null;

                const thumb = v.thumbnail || `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
                const isFav = favoriteIds.has(String(v._id));

                return (
                  <motion.div
                    key={v._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ y: -8 }}
                    className="group cursor-pointer"
                    onClick={() => openPlayer(v)}
                  >
                    <div className={`${styles.cardBg} rounded-2xl overflow-hidden border border-blue-800/50 hover:border-blue-400/50 transition-all hover:shadow-2xl hover:shadow-blue-500/20 h-full flex flex-col`}>
                      <div className="relative aspect-video overflow-hidden bg-black">
                        <img
                          src={thumb}
                          alt={v.title || "Video"}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-blue-500/90 flex items-center justify-center border-2 border-white/20">
                              <FiPlay className="text-2xl text-white ml-1" />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => toggleFavorite(v._id, e)}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur transition ${
                            isFav ? "bg-yellow-400/90 text-black" : "bg-black/40 text-white hover:bg-yellow-400/70 hover:text-black"
                          }`}
                          title="Favorite"
                        >
                          <FiStar />
                        </button>
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 flex-1">
                          {v.title || "Untitled"}
                        </h3>

                        <div className="flex items-center justify-between text-xs mt-auto text-blue-300/80">
                          <span className="flex items-center gap-2">
                            <FiUser />
                            <span className="truncate max-w-[90px]">{v.uploader || "Unknown"}</span>
                          </span>

                          <span className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <FiHeart /> {formatNumber(v.likes || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiMessageCircle /> {formatNumber(v.comments?.length || 0)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVideos.map((v) => {
              const vid = getIdFromEmbedOrUrl(v);
              if (!vid) return null;

              const thumb = v.thumbnail || `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
              const isFav = favoriteIds.has(String(v._id));

              return (
                <div
                  key={v._id}
                  className={`${styles.cardBg} rounded-xl border border-blue-800/30 hover:border-blue-400/50 transition-all`}
                  onClick={() => openPlayer(v)}
                >
                  <div className="flex items-center p-4 cursor-pointer group">
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                      <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    <div className="flex-1 ml-4 min-w-0">
                      <h3 className="text-white font-semibold text-base mb-1 truncate">{v.title}</h3>
                      <p className="text-blue-200/70 text-sm truncate">{v.description || "No description."}</p>

                      <div className="flex items-center gap-4 text-xs text-blue-300/70 mt-2">
                        <span className="flex items-center gap-1"><FiHeart /> {formatNumber(v.likes || 0)}</span>
                        <span className="flex items-center gap-1"><FiMessageCircle /> {formatNumber(v.comments?.length || 0)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => toggleFavorite(v._id, e)}
                        className={`p-2 rounded-lg transition ${
                          isFav ? "bg-yellow-400/90 text-black" : "bg-blue-900/30 text-blue-200 hover:bg-yellow-400/50 hover:text-black"
                        }`}
                        title="Favorite"
                      >
                        <FiStar />
                      </button>

                      <button
                        className="p-2 rounded-lg bg-blue-900/30 text-blue-200 hover:bg-blue-500/30 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPlayer(v);
                        }}
                      >
                        <FiPlay className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= MODAL PLAYER ================= */}
        <AnimatePresence>
          {activeVideoDb && isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // IMPORTANT: z-[9999] so Header never overlaps
              className="fixed inset-0 bg-blue-950/95 backdrop-blur-sm z-[9999] mt-32"
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
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="text-white font-semibold text-lg md:text-xl truncate">
                      {activeVideoDb.title || "Now playing"}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button
                        onClick={() => toggleFavorite(activeVideoDb._id)}
                        className={`px-3 py-2 rounded-lg border transition ${
                          activeIsFav
                            ? "bg-yellow-400/90 text-black border-black/10"
                            : "bg-blue-900/60 text-blue-100 border-blue-700/40 hover:bg-yellow-400/40 hover:text-black"
                        }`}
                        title="Favorite"
                      >
                        <span className="flex items-center gap-2">
                          <FiStar />
                          <span className="hidden sm:inline">{activeIsFav ? "Favorited" : "Favorite"}</span>
                        </span>
                      </button>

                      <button
                        onClick={() => setShowComments((s) => !s)}
                        className="px-3 py-2 rounded-lg bg-blue-900/60 text-blue-100 border border-blue-700/40 hover:bg-blue-800/70 transition"
                      >
                        <span className="flex items-center gap-2">
                          <FiMessageCircle />
                          <span className="hidden sm:inline">Comments</span>
                        </span>
                      </button>

                      <button
                        onClick={handleLike}
                        className="px-3 py-2 rounded-lg bg-blue-900/60 text-blue-100 border border-blue-700/40 hover:bg-red-600/40 transition"
                      >
                        <span className="flex items-center gap-2">
                          <FiHeart />
                          {formatNumber(activeVideoDb.likes || 0)}
                        </span>
                      </button>

                      <button
                        onClick={closeModalToMini}
                        className="px-3 py-2 rounded-lg bg-blue-900/60 text-blue-100 border border-blue-700/40 hover:bg-blue-800/70 transition"
                      >
                        Mini
                      </button>

                      <button
                        onClick={closeEverything}
                        className="px-3 py-2 rounded-lg bg-red-600/80 text-white border border-white/10 hover:bg-red-600 transition"
                        title="Close"
                      >
                        <span className="flex items-center gap-2">
                          <FiX />
                          <span className="hidden sm:inline">Close</span>
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Main grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4 h-[calc(100%-52px)]">
                    <div className="flex flex-col min-h-0">
                      <div
                        ref={playerRef}
                        className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-blue-700/30 bg-black"
                      >
                        <iframe
                          ref={iframeRef}
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${activeId}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                          title={activeVideoDb.title || "YouTube video"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          allowFullScreen
                          frameBorder="0"
                        />

                        <div className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setIsPlaying((p) => !p)}
                                className="w-11 h-11 rounded-full bg-blue-600/80 hover:bg-blue-500/90 flex items-center justify-center transition"
                                title="UI play/pause"
                              >
                                {isPlaying ? <FiPause className="text-xl text-white" /> : <FiPlay className="text-xl text-white ml-1" />}
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
                                onClick={closeEverything}
                                className="w-10 h-10 rounded-lg bg-red-600/70 hover:bg-red-600 text-white flex items-center justify-center transition"
                                title="Close"
                              >
                                <FiX />
                              </button>
                            </div>

                            <button
                              onClick={toggleFullscreen}
                              className="w-10 h-10 rounded-lg bg-blue-900/50 hover:bg-blue-800/70 text-white flex items-center justify-center transition"
                              title="Fullscreen"
                            >
                              {isFullscreen ? <FiMinimize /> : <FiMaximize />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {showComments && (
                        <div className="lg:hidden mt-3 rounded-2xl border border-blue-700/30 bg-blue-900/40 backdrop-blur-xl overflow-hidden">
                          <div className="p-4 border-b border-blue-700/30 text-white font-semibold">
                            Comments ({activeVideoDb.comments?.length || 0})
                          </div>

                          <div className="max-h-[260px] overflow-y-auto p-4 space-y-3">
                            {activeVideoDb.comments?.length ? (
                              activeVideoDb.comments.map((c, idx) => (
                                <div key={idx} className="bg-blue-950/40 border border-blue-700/30 rounded-xl p-3">
                                  <div className="text-white font-semibold text-sm">{c.user}</div>
                                  <div className="text-blue-200/90 text-sm mt-1">{c.text}</div>
                                </div>
                              ))
                            ) : (
                              <div className="text-blue-200/70 text-sm">No comments yet.</div>
                            )}
                          </div>

                          <div className="p-4 border-t border-blue-700/30">
                            <div className="flex gap-2">
                              <input
                                className="flex-1 bg-blue-950/50 text-white rounded-xl px-4 py-2 border border-blue-700/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()}
                              />
                              <button
                                onClick={handleCommentSubmit}
                                disabled={!newComment.trim()}
                                className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
                                  newComment.trim() ? styles.primaryBtn : "bg-blue-900/40 cursor-not-allowed"
                                }`}
                              >
                                <FiSend />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Desktop comments panel */}
                    <div className="hidden lg:flex flex-col min-h-0 rounded-2xl border border-blue-700/30 bg-blue-900/40 backdrop-blur-xl overflow-hidden">
                      {showComments ? (
                        <div className="flex-1 min-h-0 flex flex-col">
                          <div className="p-4 font-semibold text-white border-b border-blue-700/30">
                            Comments ({activeVideoDb.comments?.length || 0})
                          </div>

                          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                            {activeVideoDb.comments?.length ? (
                              activeVideoDb.comments.map((c, idx) => (
                                <div key={idx} className="bg-blue-950/40 border border-blue-700/30 rounded-xl p-3">
                                  <div className="text-white font-semibold text-sm">{c.user}</div>
                                  <div className="text-blue-200/90 text-sm mt-1">{c.text}</div>
                                </div>
                              ))
                            ) : (
                              <div className="text-blue-200/70 text-sm">No comments yet.</div>
                            )}
                          </div>

                          <div className="p-4 border-t border-blue-700/30">
                            <div className="flex gap-2">
                              <input
                                className="flex-1 bg-blue-950/50 text-white rounded-xl px-4 py-2 border border-blue-700/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()}
                              />
                              <button
                                onClick={handleCommentSubmit}
                                disabled={!newComment.trim()}
                                className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
                                  newComment.trim() ? styles.primaryBtn : "bg-blue-900/40 cursor-not-allowed"
                                }`}
                              >
                                <FiSend />
                                Post
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-blue-200/80">
                          Tap “Comments” to view and add comments.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= MINI PLAYER ================= */}
        <AnimatePresence>
          {activeVideoDb && isMiniPlayerOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              // IMPORTANT: z-[9999] so Header never overlaps
              className="fixed bottom-4 right-4 z-[9999] w-[320px] sm:w-[360px] rounded-2xl overflow-hidden border border-blue-700/30 shadow-2xl shadow-blue-500/20 bg-blue-950/90 backdrop-blur"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-blue-700/30">
                <div className="text-white text-sm font-semibold truncate max-w-[220px]">
                  {activeVideoDb.title || "Now playing"}
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
                  src={`https://www.youtube.com/embed/${activeId}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                  title="Mini player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  frameBorder="0"
                />
              </div>

              <div className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying((p) => !p)}
                    className="w-10 h-10 rounded-full bg-blue-600/70 hover:bg-blue-500/80 text-white flex items-center justify-center transition"
                    title="UI play/pause"
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
                  onClick={() => toggleFavorite(activeVideoDb._id)}
                  className={`w-9 h-9 rounded-lg transition flex items-center justify-center ${
                    favoriteIds.has(String(activeVideoDb._id))
                      ? "bg-yellow-400/90 text-black"
                      : "bg-blue-900/50 hover:bg-yellow-400/50 hover:text-black text-white"
                  }`}
                  title="Favorite"
                >
                  <FiStar />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default LargeVideos;