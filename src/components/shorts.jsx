// src/pages/VideoCard.jsx  (replace whole file)
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "../context/authContext.jsx";
import {
  ChevronUp,
  ChevronDown,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Send,
  X,
  Reply,
  RefreshCw,
  VolumeX,
  Volume2,
  ExternalLink,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/videos`;

const cn = (...classes) => classes.filter(Boolean).join(" ");

const extractYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m?.[1]) return m[1].substring(0, 11);
  }
  return null;
};

const toAbsoluteSrc = (maybePath) => {
  if (!maybePath) return "";
  if (String(maybePath).startsWith("http")) return maybePath;
  const p = String(maybePath).startsWith("/") ? maybePath : `/${maybePath}`;
  return `${API_BASE_URL}${p}`;
};

const normalizeVideo = (v) => {
  const youtubeId = v.youtubeId || extractYouTubeId(v.youtubeUrl);
  if (youtubeId) {
    return {
      ...v,
      youtubeId,
      type: "youtube",
      src: `https://www.youtube.com/embed/${youtubeId}?playsinline=1&autoplay=1&mute=1`,
      thumbnail: v.thumbnail || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }

  const raw =
    v.src ||
    v.videoUrl ||
    v.fileUrl ||
    v.path ||
    v.url ||
    v.videoPath ||
    v.video ||
    v.file ||
    "";

  const src = toAbsoluteSrc(raw);
  if (src) return { ...v, type: "uploaded", src, thumbnail: v.thumbnail || "" };

  return { ...v, type: "unknown", src: "", thumbnail: "" };
};

const countLikes = (v) => v?.likesCount ?? v?.likes ?? v?.likedBy?.length ?? 0;
const countViews = (v) => v?.views ?? 0;

export default function VideoCard() {
  const { user, token: ctxToken } = useContext(AuthContext);
  const token = ctxToken || localStorage.getItem("token");
  const myId = user?._id || user?.id;

  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [showComments, setShowComments] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [replyTexts, setReplyTexts] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [showReplies, setShowReplies] = useState({});

  const [likedVideos, setLikedVideos] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const videoRef = useRef(null);
  const viewedRef = useRef(new Set());
  const lastTapRef = useRef(0);

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const filteredVideos = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return videos;
    return videos.filter((v) => {
      const hay = `${v.title || ""} ${v.description || ""} ${v.youtubeChannel || ""} ${v.youtubeUrl || ""}`.toLowerCase();
      return hay.includes(text);
    });
  }, [videos, q]);

  const currentVideo = filteredVideos[currentIndex];

  const safeSetCurrentIndex = useCallback(
    (idx) => {
      const max = filteredVideos.length - 1;
      const next = Math.min(Math.max(0, idx), Math.max(0, max));
      setCurrentIndex(next);
    },
    [filteredVideos.length]
  );

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_ENDPOINT, {
        headers: { ...(token ? authHeaders : {}) },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to fetch videos");

      const normalized = (data.videos || []).map(normalizeVideo);
      setVideos(normalized);

      const likedMap = {};
      normalized.forEach((v) => {
        if (myId && Array.isArray(v.likedBy)) likedMap[v._id] = v.likedBy.some((x) => String(x) === String(myId));
        else likedMap[v._id] = false;
      });
      setLikedVideos(likedMap);

      setCurrentIndex(0);
    } catch (e) {
      setError(e.message || "Fetch error");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, myId, token]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowUp") safeSetCurrentIndex(currentIndex - 1);
      if (e.key === "ArrowDown") safeSetCurrentIndex(currentIndex + 1);
      if (e.key === "Escape") setShowComments(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex, safeSetCurrentIndex]);

  // Autoplay for uploaded
  useEffect(() => {
    if (!currentVideo) return;
    if (currentVideo.type !== "uploaded") return;
    if (!videoRef.current) return;
    videoRef.current.muted = true;
    videoRef.current.play().catch(() => {});
  }, [currentVideo?._id, currentVideo?.type]);

  // Increment view count once per video id
  useEffect(() => {
    if (!currentVideo?._id) return;
    const id = currentVideo._id;
    if (viewedRef.current.has(id)) return;
    viewedRef.current.add(id);

    fetch(`${API_ENDPOINT}/${id}/view`, { method: "POST" }).catch(() => {});
  }, [currentVideo?._id]);

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleLikeToggle = async () => {
    if (!user) return alert("Please login to like!");

    try {
      const res = await fetch(`${API_ENDPOINT}/${currentVideo._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to like");

      if (data.success && data.video) {
        setVideos((prev) => prev.map((v) => (v._id === data.video._id ? normalizeVideo(data.video) : v)));
        setLikedVideos((prev) => ({ ...prev, [currentVideo._id]: !prev[currentVideo._id] }));
      }
    } catch (e) {
      alert(e.message || "Error liking video");
    }
  };

  const handleDoubleTap = (e) => {
    if (!user) return;
    if (currentVideo?.type !== "uploaded") return;
    if (["BUTTON", "INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      if (!likedVideos[currentVideo._id]) handleLikeToggle();
    }
    lastTapRef.current = now;
  };

  const handleSend = async () => {
    if (!user) return alert("Please login to comment!");
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_ENDPOINT}/${currentVideo._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ text: newComment }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to comment");

      if (data.success && data.video) {
        setVideos((prev) => prev.map((v) => (v._id === data.video._id ? normalizeVideo(data.video) : v)));
        setNewComment("");
      }
    } catch (e) {
      alert(e.message || "Error sending comment");
    }
  };

  const handleSendReply = async (commentId) => {
    if (!user) return alert("Please login to reply!");
    const text = replyTexts[commentId]?.trim();
    if (!text) return;

    try {
      const res = await fetch(`${API_ENDPOINT}/${currentVideo._id}/comment/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ text }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to reply");

      if (data.success && data.video) {
        setVideos((prev) => prev.map((v) => (v._id === data.video._id ? normalizeVideo(data.video) : v)));
        setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
        setShowReplyInput((prev) => ({ ...prev, [commentId]: false }));
      }
    } catch (e) {
      alert(e.message || "Error sending reply");
    }
  };

  // ✅ SHARE: Web Share when possible + always increment backend share count
  const handleShare = async () => {
    const shareUrl = currentVideo?.type === "youtube" ? currentVideo.youtubeUrl : currentVideo?.src;
    if (!shareUrl) return;

    // increment shares (don’t block UX)
    fetch(`${API_ENDPOINT}/${currentVideo._id}/share`, { method: "POST" }).catch(() => {});

    const title = currentVideo?.title || "Video";
    const text = (currentVideo?.description || "").slice(0, 140);

    // Web Share API (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // user may cancel — fall back to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied!");
    } catch {
      alert("Copy failed.");
    }
  };

  // ✅ DOWNLOAD: reliable cross-origin download using Blob
  const handleDownload = async () => {
    if (currentVideo?.type !== "uploaded") return alert("YouTube videos cannot be downloaded directly.");
    if (!currentVideo?.src) return;

    const url = currentVideo.src;
    const filename =
      (url.split("?")[0].split("/").pop() || "video.mp4").replace(/[^a-zA-Z0-9._-]/g, "_");

    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    } catch {
      // fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  const goPrev = () => safeSetCurrentIndex(currentIndex - 1);
  const goNext = () => safeSetCurrentIndex(currentIndex + 1);

  useEffect(() => {
    if (!isMobile) setShowComments(true);
  }, [isMobile]);

  const [muted, setMuted] = useState(true);
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = muted;
  }, [muted, currentVideo?._id]);

  useEffect(() => {
    if (currentIndex > filteredVideos.length - 1) setCurrentIndex(0);
  }, [filteredVideos.length, currentIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white/60" />
          <p className="mt-4 text-white/70">Loading videos…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-white font-semibold">Could not load videos</p>
          <p className="mt-2 text-white/70 text-sm">{error}</p>
          <button
            onClick={fetchVideos}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-white/80">No videos available.</p>
          <button
            onClick={fetchVideos}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const likeCount = countLikes(currentVideo);
  const viewCount = countViews(currentVideo);
  const isLiked = !!likedVideos[currentVideo._id];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="font-semibold">Videos</div>

          <div className="flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search videos…"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <button
            onClick={fetchVideos}
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-sm"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>

          {isMobile && (
            <button
              onClick={() => setShowComments(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-sm"
            >
              <MessageCircle size={16} />
              Comments
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Playlist (desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 text-sm text-white/80">
                Playlist ({filteredVideos.length})
              </div>

              <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
                {filteredVideos.map((v, idx) => {
                  const active = idx === currentIndex;
                  const thumb =
                    v.thumbnail ||
                    (v.youtubeId ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg` : "");

                  return (
                    <button
                      key={v._id || idx}
                      onClick={() => safeSetCurrentIndex(idx)}
                      className={cn(
                        "w-full text-left p-3 border-b border-white/10 hover:bg-white/5 transition",
                        active && "bg-white/10"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="h-14 w-24 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
                          {thumb ? (
                            <img src={thumb} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-white/40">
                              No thumb
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{v.title || "Untitled"}</div>
                          <div className="mt-1 text-xs text-white/60 truncate">
                            {v.type === "youtube" ? v.youtubeChannel || "YouTube" : "Local video"}
                          </div>
                          <div className="mt-2 text-[11px] text-white/50">
                            {v.type.toUpperCase()} • {countViews(v)} views
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Player */}
          <div className={cn("lg:col-span-6", isMobile ? "col-span-1" : "")}>
            <div className="relative rounded-2xl border border-white/10 bg-black overflow-hidden">
              <div
                className="relative h-[calc(100vh-180px)] min-h-[520px] bg-black"
                onClick={currentVideo.type === "uploaded" ? handleDoubleTap : undefined}
              >
                {currentVideo.type === "uploaded" ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain bg-black"
                    src={currentVideo.src}
                    controls
                    autoPlay
                    muted={muted}
                    loop
                    playsInline
                  />
                ) : currentVideo.type === "youtube" ? (
                  <iframe
                    title={`YouTube-${currentVideo.title || "video"}`}
                    src={currentVideo.src}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/70 p-6 text-center">
                    This item has no playable source. Check your backend response fields.
                  </div>
                )}

                {/* Overlay controls */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <div className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-black/50 border border-white/10 px-3 py-2 text-xs">
                    <span className={cn("h-2 w-2 rounded-full", currentVideo.type === "youtube" ? "bg-red-500" : "bg-blue-500")} />
                    {currentVideo.type === "youtube" ? "YouTube" : currentVideo.type === "uploaded" ? "Local" : "Unknown"}
                  </div>

                  {currentVideo.type === "uploaded" && (
                    <button
                      onClick={() => setMuted((m) => !m)}
                      className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-black/50 border border-white/10 px-3 py-2 text-xs hover:bg-black/60"
                      title={muted ? "Unmute" : "Mute"}
                    >
                      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      {muted ? "Muted" : "Sound"}
                    </button>
                  )}
                </div>

                {/* Right action rail */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                  <button
                    onClick={handleLikeToggle}
                    className={cn(
                      "rounded-2xl border border-white/10 bg-black/40 hover:bg-black/60 px-3 py-3 flex flex-col items-center gap-1",
                      isLiked && "border-red-500/40"
                    )}
                    title="Like"
                  >
                    <Heart size={20} className={cn(isLiked ? "text-red-500" : "text-white")} />
                    <span className="text-[11px] text-white/80">{likeCount}</span>
                  </button>

                  <button
                    onClick={() => setShowComments(true)}
                    className="rounded-2xl border border-white/10 bg-black/40 hover:bg-black/60 px-3 py-3 flex flex-col items-center gap-1"
                    title="Comments"
                  >
                    <MessageCircle size={20} />
                    <span className="text-[11px] text-white/80">{currentVideo.comments?.length || 0}</span>
                  </button>

                  {currentVideo.type === "uploaded" && (
                    <button
                      onClick={handleDownload}
                      className="rounded-2xl border border-white/10 bg-black/40 hover:bg-black/60 px-3 py-3 flex flex-col items-center gap-1"
                      title="Download"
                    >
                      <Download size={20} />
                      <span className="text-[11px] text-white/80">Save</span>
                    </button>
                  )}

                  <button
                    onClick={handleShare}
                    className="rounded-2xl border border-white/10 bg-black/40 hover:bg-black/60 px-3 py-3 flex flex-col items-center gap-1"
                    title="Share"
                  >
                    <Share2 size={20} />
                    <span className="text-[11px] text-white/80">Share</span>
                  </button>

                  {currentVideo.type === "youtube" && currentVideo.youtubeUrl && (
                    <button
                      onClick={() => window.open(currentVideo.youtubeUrl, "_blank")}
                      className="rounded-2xl border border-white/10 bg-black/40 hover:bg-black/60 px-3 py-3 flex flex-col items-center gap-1"
                      title="Open on YouTube"
                    >
                      <ExternalLink size={20} />
                      <span className="text-[11px] text-white/80">Open</span>
                    </button>
                  )}
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/40 to-transparent p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-lg font-semibold truncate">{currentVideo.title || "Untitled"}</div>
                      <div className="mt-1 text-sm text-white/70 line-clamp-2">
                        {currentVideo.description || "No description"}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-white/60">Views</div>
                      <div className="text-sm font-semibold">{viewCount}</div>
                    </div>
                  </div>
                </div>

                {/* Navigation buttons */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  <button
                    onClick={goPrev}
                    disabled={currentIndex <= 0}
                    className="rounded-2xl border border-white/10 bg-black/40 hover:bg-black/60 px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Previous"
                  >
                    <ChevronUp size={20} />
                  </button>
                  <button
                    onClick={goNext}
                    disabled={currentIndex >= filteredVideos.length - 1}
                    className="rounded-2xl border border-white/10 bg-black/40 hover:bg-black/60 px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Next"
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments (desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="text-sm text-white/80">
                  Comments <span className="text-white/50">({currentVideo.comments?.length || 0})</span>
                </div>
              </div>

              <CommentsPanel
                currentVideo={currentVideo}
                user={user}
                newComment={newComment}
                setNewComment={setNewComment}
                handleSend={handleSend}
                replyTexts={replyTexts}
                setReplyTexts={setReplyTexts}
                showReplyInput={showReplyInput}
                setShowReplyInput={setShowReplyInput}
                showReplies={showReplies}
                toggleReplies={toggleReplies}
                handleSendReply={handleSendReply}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile comments drawer */}
      {isMobile && showComments && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t border-white/10 bg-black">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="text-sm font-semibold">
                Comments <span className="text-white/50">({currentVideo.comments?.length || 0})</span>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 p-2"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <CommentsPanel
              currentVideo={currentVideo}
              user={user}
              newComment={newComment}
              setNewComment={setNewComment}
              handleSend={handleSend}
              replyTexts={replyTexts}
              setReplyTexts={setReplyTexts}
              showReplyInput={showReplyInput}
              setShowReplyInput={setShowReplyInput}
              showReplies={showReplies}
              toggleReplies={toggleReplies}
              handleSendReply={handleSendReply}
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CommentsPanel({
  currentVideo,
  user,
  newComment,
  setNewComment,
  handleSend,
  replyTexts,
  setReplyTexts,
  showReplyInput,
  setShowReplyInput,
  showReplies,
  toggleReplies,
  handleSendReply,
  compact = false,
}) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentVideo?.comments?.length]);

  return (
    <div className={cn("flex flex-col", compact ? "h-[75vh]" : "h-[calc(100vh-200px)]")}>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {currentVideo.comments?.length ? (
          currentVideo.comments.map((comment) => {
            const name = comment.userName || comment.user || "Unknown";
            return (
              <div key={comment._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm">
                    {String(name).charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold truncate">{name}</div>
                      <div className="text-xs text-white/50">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                      </div>
                    </div>

                    <div className="mt-1 text-sm text-white/80 whitespace-pre-wrap">{comment.text}</div>

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() =>
                          setShowReplyInput((prev) => ({
                            ...prev,
                            [comment._id]: !prev[comment._id],
                          }))
                        }
                        className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white"
                      >
                        <Reply size={14} />
                        Reply
                      </button>

                      {comment.replies?.length > 0 && (
                        <button
                          onClick={() => toggleReplies(comment._id)}
                          className="text-xs text-white/60 hover:text-white"
                        >
                          {showReplies[comment._id] ? "Hide" : "View"} {comment.replies.length} replies
                        </button>
                      )}
                    </div>

                    {showReplyInput[comment._id] && (
                      <div className="mt-3 flex gap-2">
                        <input
                          value={replyTexts[comment._id] || ""}
                          onChange={(e) =>
                            setReplyTexts((prev) => ({
                              ...prev,
                              [comment._id]: e.target.value,
                            }))
                          }
                          placeholder={user ? "Write a reply…" : "Login to reply…"}
                          disabled={!user}
                          className="flex-1 rounded-xl bg-black border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
                        />
                        <button
                          onClick={() => handleSendReply(comment._id)}
                          disabled={!user || !(replyTexts[comment._id] || "").trim()}
                          className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Send reply"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    )}

                    {showReplies[comment._id] && comment.replies?.length > 0 && (
                      <div className="mt-3 space-y-2 pl-4 border-l border-white/10">
                        {comment.replies.map((r) => {
                          const rName = r.userName || r.user || "User";
                          return (
                            <div key={r._id} className="rounded-xl border border-white/10 bg-black/40 p-3">
                              <div className="flex items-center gap-2">
                                <div className="text-xs font-semibold">{rName}</div>
                                <div className="text-[11px] text-white/50">
                                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                                </div>
                              </div>
                              <div className="mt-1 text-sm text-white/80 whitespace-pre-wrap">{r.text}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-white/60 text-sm text-center py-10">No comments yet.</div>
        )}

        <div ref={endRef} />
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Add a comment…" : "Login to comment…"}
            disabled={!user}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1 rounded-xl bg-black border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!user || !newComment.trim()}
            className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Post"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}