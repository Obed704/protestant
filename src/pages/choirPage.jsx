import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaYoutube,
  FaInstagram,
  FaEnvelope,
  FaTimes,
  FaSpinner,
  FaMusic,
  FaUsers,
  FaCrown,
  FaHeart,
  FaStar,
} from "react-icons/fa";
import axios from "axios";
import { getVideoThumbnail } from "../utils/thumbnailGenerator";
import Header from "../components/header";
import Footer from "../components/footer";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/choirs`;

// Inline styles for animations (unchanged)
const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.9);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.5); }
  50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.8); }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.animate-scaleIn {
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}

.animate-shimmer {
  background: linear-gradient(90deg, 
    rgba(255,255,255,0) 0%, 
    rgba(255,255,255,0.4) 50%, 
    rgba(255,255,255,0) 100%);
  background-size: 200% auto;
  animation: shimmer 2s infinite linear;
}
`;

const ChoirCard = React.memo(({ choir, onOpenSongs, onApply, index }) => {
  const committee = Array.isArray(choir.committee) ? choir.committee : [];
  const songsCount = Array.isArray(choir.songs) ? choir.songs.length : 0;

  return (
    <div
      className="group relative bg-gradient-to-br from-white to-gray-50 p-7 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-gray-100 overflow-hidden animate-scaleIn"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Background decorative elements */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-100 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
      <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-blue-100 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-md">
                <FaUsers className="text-white text-lg" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                {choir.name}
              </h2>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-2 text-sm md:text-base leading-relaxed">
              {choir.description}
            </p>
          </div>
        </div>

        {/* Leadership Info */}
        <div className="mb-5 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <FaCrown className="text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">President</p>
                <p className="font-medium text-gray-800">{choir.president}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FaStar className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Vice President</p>
                <p className="font-medium text-gray-800">
                  {choir.vicePresident}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verse */}
        <div className="mb-5 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 rounded-r-lg">
          <div className="flex items-start gap-3">
            <FaHeart className="text-yellow-500 mt-1 flex-shrink-0" />
            <p className="text-gray-700 italic text-sm leading-relaxed">
              "{choir.verse}"
            </p>
          </div>
        </div>

        {/* Committee */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
            <FaUsers className="text-gray-400" />
            Committee Members
          </p>
          <div className="flex flex-wrap gap-2">
            {committee.slice(0, 3).map((member, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              >
                {member}
              </span>
            ))}
            {committee.length > 3 && (
              <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-600">
                +{committee.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-5 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onOpenSongs(choir)}
                className="group relative px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 overflow-hidden animate-pulse-glow"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <FaMusic className="transition-transform group-hover:scale-110" />
                  View Songs ({songsCount})
                </span>
                <div className="absolute inset-0 animate-shimmer" />
              </button>

              <button
                onClick={() => onApply(choir)}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-800 font-semibold rounded-xl shadow-sm hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <FaEnvelope />
                  Apply to Join
                </span>
              </button>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {choir?.social?.youtube && (
                <a
                  href={choir.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-white hover:bg-red-500 hover:border-red-500 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-110 group"
                >
                  <FaYoutube className="group-hover:animate-float" />
                </a>
              )}
              {choir?.social?.instagram && (
                <a
                  href={choir.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-white hover:bg-gradient-to-r from-purple-500 to-pink-500 hover:border-transparent rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-110 group"
                >
                  <FaInstagram className="group-hover:animate-float" />
                </a>
              )}
              {choir?.social?.email && (
                <a
                  href={`mailto:${choir.social.email}`}
                  aria-label="Email"
                  className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-white hover:bg-gradient-to-r from-blue-500 to-cyan-500 hover:border-transparent rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-110 group"
                >
                  <FaEnvelope className="group-hover:animate-float" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const SongCard = React.memo(({ song, index }) => (
  <a
    href={song.youtubeLink}
    target="_blank"
    rel="noopener noreferrer nofollow"
    className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.05] block animate-scaleIn"
    style={{ animationDelay: `${index * 0.05}s` }}
    aria-label={`Watch ${song.title} on YouTube`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

    <div className="relative bg-white rounded-2xl overflow-hidden h-full">
      {song.thumbnail ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={song.thumbnail}
            alt={`Thumbnail for ${song.title}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/40 to-transparent p-3">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 text-white p-1.5 rounded-lg shadow-lg">
                <FaYoutube className="text-sm" />
              </div>
              <span className="text-white text-xs font-semibold">YouTube</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
          <div className="relative">
            <FaYoutube className="text-5xl text-gray-400 mb-3" />
            <div className="absolute inset-0 animate-pulse-glow" />
          </div>
          <span className="text-gray-600 text-center font-medium truncate w-full px-2">
            {song.title}
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
            #{index + 1}
          </span>
          <div className="flex items-center gap-1 text-gray-400">
            <FaStar className="text-xs" />
            <FaStar className="text-xs" />
            <FaStar className="text-xs" />
          </div>
        </div>
        <h3 className="font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors duration-300 line-clamp-2">
          {song.title}
        </h3>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
          <FaYoutube className="text-white text-2xl" />
        </div>
      </div>
    </div>
  </a>
));

const SongsModal = React.memo(({ choir, thumbnails, onClose, isLoading }) => {
  if (!choir) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-lg flex justify-center items-center z-50 p-4 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gradient-to-b from-white via-gray-50 to-gray-100 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden animate-slideUp border border-gray-200/30">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-lg">
                <FaMusic className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {choir.name}
                </h2>
                <p className="text-gray-600 mt-1">Songs Collection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-xl transition-all duration-300 hover:scale-110 shadow-sm"
              aria-label="Close modal"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <FaSpinner className="animate-spin text-5xl text-yellow-500 mb-6" />
                <div className="absolute inset-0 animate-pulse-glow rounded-full" />
              </div>
              <p className="text-gray-600 text-lg font-medium">Loading songs...</p>
              <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
            </div>
          ) : thumbnails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {thumbnails.map((song, i) => (
                <SongCard key={`${song.youtubeLink}-${i}`} song={song} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <FaMusic className="text-8xl text-gray-300" />
                <div className="absolute inset-0 animate-pulse-glow rounded-full" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">
                No Songs Available
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                This choir hasn't uploaded any songs yet. Check back soon for updates!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const ApplyModal = React.memo(
  ({ choir, form, setForm, onClose, onSubmit, isLoading, error, success }) => {
    if (!choir) return null;

    return (
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-lg flex justify-center items-center z-50 p-4 animate-fadeIn"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slideUp border border-gray-200/30">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-lg">
                <FaEnvelope className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Apply to Join
                </h2>
                <p className="text-gray-600">{choir.name}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all"
              aria-label="Close apply modal"
              disabled={isLoading}
            >
              <FaTimes />
            </button>
          </div>

          <div className="p-6">
            {success && (
              <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-200"
                placeholder="Full name *"
                value={form.fullName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fullName: e.target.value }))
                }
              />

              <input
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-200"
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />

              <input
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-200 md:col-span-2"
                placeholder="Email (optional)"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />

              <textarea
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-200 md:col-span-2 min-h-[120px]"
                placeholder="Why do you want to join? (optional)"
                value={form.message}
                onChange={(e) =>
                  setForm((p) => ({ ...p, message: e.target.value }))
                }
              />
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Provide at least one contact (email or phone) so leaders can reach you.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-all"
                disabled={isLoading}
              >
                Cancel
              </button>

              <button
                onClick={onSubmit}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading && <FaSpinner className="animate-spin" />}
                Submit Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default function ChoirsPage() {
  const [choirs, setChoirs] = useState([]);
  const [activeChoir, setActiveChoir] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // APPLY states
  const [applyChoir, setApplyChoir] = useState(null);
  const [applyForm, setApplyForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [applySuccess, setApplySuccess] = useState(null);

  // Add animation styles to document
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const extractYouTubeID = useCallback((url) => {
    if (!url) return null;
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  }, []);

  useEffect(() => {
    const fetchChoirs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINT);
        setChoirs(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching choirs:", err);
        setError("Failed to load choirs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChoirs();
  }, []);

  const openSongsModal = useCallback(
    async (choir) => {
      setActiveChoir(choir);
      setModalLoading(true);

      const songs = Array.isArray(choir?.songs) ? choir.songs : [];

      try {
        const thumbs = await Promise.all(
          songs.map(async (song, index) => {
            try {
              const videoId = extractYouTubeID(song.youtubeLink);
              if (!videoId) return { ...song, thumbnail: null, index };

              const url = `https://www.youtube.com/embed/${videoId}`;
              const thumb = await getVideoThumbnail(url, 2);
              return { ...song, thumbnail: thumb, videoId, index };
            } catch {
              return { ...song, thumbnail: null, index };
            }
          })
        );
        setThumbnails(thumbs);
      } catch (err) {
        console.error("Error generating thumbnails:", err);
        setThumbnails(
          songs.map((song, index) => ({
            ...song,
            thumbnail: null,
            index,
          }))
        );
      } finally {
        setModalLoading(false);
      }
    },
    [extractYouTubeID]
  );

  const closeModal = useCallback(() => {
    setActiveChoir(null);
    setThumbnails([]);
    setModalLoading(false);
  }, []);

  // APPLY handlers
  const openApplyModal = useCallback((choir) => {
    setApplyChoir(choir);
    setApplyForm({ fullName: "", email: "", phone: "", message: "" });
    setApplyLoading(false);
    setApplyError(null);
    setApplySuccess(null);
  }, []);

  const closeApplyModal = useCallback(() => {
    setApplyChoir(null);
    setApplyLoading(false);
    setApplyError(null);
    setApplySuccess(null);
  }, []);

  const submitApply = useCallback(async () => {
    if (!applyChoir?._id) return;

    setApplyError(null);
    setApplySuccess(null);

    const fullName = String(applyForm.fullName || "").trim();
    const email = String(applyForm.email || "").trim();
    const phone = String(applyForm.phone || "").trim();
    const message = String(applyForm.message || "").trim();

    if (!fullName) {
      setApplyError("Full name is required.");
      return;
    }
    if (!email && !phone) {
      setApplyError("Provide at least email or phone.");
      return;
    }

    try {
      setApplyLoading(true);
      const url = `${API_ENDPOINT}/${applyChoir._id}/apply`;

      const res = await axios.post(url, { fullName, email, phone, message });

      setApplySuccess(res?.data?.message || "Application submitted successfully.");
      // Optional: clear form after success
      setApplyForm({ fullName: "", email: "", phone: "", message: "" });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to submit application. Please try again.";
      setApplyError(msg);
    } finally {
      setApplyLoading(false);
    }
  }, [applyChoir, applyForm]);

  // Filter choirs based on search term
  const filteredChoirs = useMemo(() => {
    if (!searchTerm.trim()) return choirs;

    const q = searchTerm.toLowerCase();

    return choirs.filter((choir) => {
      const name = (choir?.name || "").toLowerCase();
      const desc = (choir?.description || "").toLowerCase();
      const pres = (choir?.president || "").toLowerCase();
      const committee = Array.isArray(choir?.committee) ? choir.committee : [];

      return (
        name.includes(q) ||
        desc.includes(q) ||
        pres.includes(q) ||
        committee.some((m) => String(m || "").toLowerCase().includes(q))
      );
    });
  }, [choirs, searchTerm]);

  const sortedChoirs = useMemo(() => {
    return [...filteredChoirs].sort((a, b) =>
      String(a?.name || "").localeCompare(String(b?.name || ""))
    );
  }, [filteredChoirs]);

  const totalSongs = useMemo(() => {
    return choirs.reduce((acc, choir) => acc + (choir?.songs?.length || 0), 0);
  }, [choirs]);

  const totalMembers = useMemo(() => {
    return choirs.reduce(
      (acc, choir) => acc + (Array.isArray(choir?.committee) ? choir.committee.length : 0),
      0
    );
  }, [choirs]);

  return (
    <>
      <Header />
      <style>{animationStyles}</style>

      <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 py-16">
          <div className="absolute inset-0 bg-black/5" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slideUp">
                Our <span className="text-gray-900">Choirs</span>
              </h1>
              <p
                className="text-xl md:text-2xl mb-8 text-white/90 font-light leading-relaxed animate-slideUp"
                style={{ animationDelay: "0.1s" }}
              >
                Discover the harmony, leadership, and soulful melodies of our
                vibrant choir community
              </p>

              {/* Search Bar */}
              <div
                className="max-w-2xl mx-auto mb-8 animate-slideUp"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search choirs by name, description, or member..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-6 py-4 pl-14 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-white/50 transition-all duration-300"
                  />
                  <FaMusic className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white/70 text-xl" />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-5 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-900 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 -mt-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-scaleIn">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <FaUsers className="text-2xl text-yellow-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{choirs.length}</p>
                  <p className="text-gray-600">Total Choirs</p>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-scaleIn"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FaMusic className="text-2xl text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{totalSongs}</p>
                  <p className="text-gray-600">Total Songs</p>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-scaleIn"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FaCrown className="text-2xl text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{totalMembers}</p>
                  <p className="text-gray-600">Total Members</p>
                </div>
              </div>
            </div>
          </div>

          {/* Choirs Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="relative inline-block">
                  <FaSpinner className="animate-spin text-5xl text-yellow-500 mb-4" />
                  <div className="absolute inset-0 animate-pulse-glow rounded-full" />
                </div>
                <p className="text-gray-600 text-lg font-medium">Loading choirs...</p>
                <p className="text-gray-400 text-sm mt-2">
                  Please wait while we fetch the latest data
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8 max-w-2xl mx-auto text-center shadow-lg animate-scaleIn">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTimes className="text-3xl text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Oops! Something went wrong
              </h3>
              <p className="text-red-600 text-lg mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
            </div>
          ) : sortedChoirs.length === 0 ? (
            <div className="text-center py-16 animate-fadeIn">
              <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaMusic className="text-6xl text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-700 mb-3">
                No Choirs Found
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
                {searchTerm
                  ? `No choirs match "${searchTerm}". Try a different search term.`
                  : "No choirs available at the moment."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-8 flex justify-between items-center animate-slideUp">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">All Choirs</h2>
                  <p className="text-gray-600">
                    Showing {sortedChoirs.length} choir
                    {sortedChoirs.length !== 1 ? "s" : ""}
                    {searchTerm && ` for "${searchTerm}"`}
                  </p>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300 flex items-center gap-2"
                  >
                    <FaTimes /> Clear Search
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {sortedChoirs.map((choir, index) => (
                  <ChoirCard
                    key={choir._id}
                    choir={choir}
                    onOpenSongs={openSongsModal}
                    onApply={openApplyModal}
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {activeChoir && (
        <SongsModal
          choir={activeChoir}
          thumbnails={thumbnails}
          onClose={closeModal}
          isLoading={modalLoading}
        />
      )}

      {applyChoir && (
        <ApplyModal
          choir={applyChoir}
          form={applyForm}
          setForm={setApplyForm}
          onClose={closeApplyModal}
          onSubmit={submitApply}
          isLoading={applyLoading}
          error={applyError}
          success={applySuccess}
        />
      )}

      <Footer />
    </>
  );
}