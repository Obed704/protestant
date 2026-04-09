import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiStar,
  FiShare2,
  FiBookOpen,
  FiHeart,
  FiMessageCircle,
  FiX,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  FaQuoteLeft,
  FaQuoteRight,
  FaBible,
  FaPray,
  FaTimes,
  FaExpandAlt,
  FaCompressAlt,
} from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${BASE_URL}/api/sermons`;

export default function BibleVerse() {
  const { user, token } = useContext(AuthContext);
  const [sermonsData, setSermonsData] = useState([]);
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [userActions, setUserActions] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSearchFilter, setShowSearchFilter] = useState(false);
  const [expandedVerse, setExpandedVerse] = useState(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const scrollContainerRef = useRef(null);

  const categories = [
    "all",
    "inspiration",
    "faith",
    "hope",
    "love",
    "forgiveness",
    "strength",
    "peace",
    "wisdom",
    "grace",
  ];

  // Fetch sermons from backend
  useEffect(() => {
    const fetchSermons = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(API_ENDPOINT);
        setSermonsData(res.data);
        setFilteredSermons(res.data);
      } catch (err) {
        console.error("Error fetching sermons:", err);
        setError("Failed to load Bible verses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSermons();
  }, []);

  // Map user actions from backend (likedBy & favorites)
  useEffect(() => {
    if (!user || !sermonsData.length) return;

    const actions = {};
    sermonsData.forEach((s) => {
      actions[s._id] = {
        liked: s.likedBy?.includes(user.id),
        favorited: s.favorites?.includes(user.id),
      };
    });
    setUserActions(actions);
  }, [sermonsData, user]);

  // Filter & sort sermons
  useEffect(() => {
    let filtered = sermonsData;

    if (searchTerm) {
      filtered = filtered.filter(
        (sermon) =>
          sermon.verse.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sermon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sermon.preacher.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (sermon) => sermon.category?.toLowerCase() === categoryFilter,
      );
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
          );
        case "oldest":
          return (
            new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
          );
        case "likes":
          return (b.likes || 0) - (a.likes || 0);
        case "verse":
          return a.verse.localeCompare(b.verse);
        default:
          return 0;
      }
    });

    setFilteredSermons(filtered);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
      updateScrollState();
    }
  }, [searchTerm, categoryFilter, sortBy, sermonsData]);

  const updateScrollState = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setIsAtStart(scrollLeft <= 10);
    setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 10);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => updateScrollState();
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateScrollState);
    updateScrollState();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  // Toggle like
  const toggleLike = async (id) => {
    if (!user) return alert("Please log in to like verses.");

    const wasLiked = userActions[id]?.liked;
    setUserActions((prev) => ({
      ...prev,
      [id]: { ...prev[id], liked: !wasLiked },
    }));

    try {
      const res = await axios.post(
        `${API_ENDPOINT}/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSermonsData((prev) => prev.map((s) => (s._id === id ? res.data : s)));
    } catch (err) {
      console.error("Error liking sermon:", err.response?.data || err.message);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (id) => {
    if (!user) return alert("Please log in to save favorite verses.");

    const wasFavorited = userActions[id]?.favorited;
    setUserActions((prev) => ({
      ...prev,
      [id]: { ...prev[id], favorited: !wasFavorited },
    }));

    try {
      await axios.post(
        `${API_ENDPOINT}/${id}/favorite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {
      console.error("Error updating favorite:", err);
    }
  };

  // Comments
  const handleCommentChange = useCallback((id, text) => {
    setCommentInputs((prev) => ({ ...prev, [id]: text }));
  }, []);

  const addComment = async (id) => {
    if (!user) return alert("Please log in to add comments.");
    if (!token) return alert("Your session expired. Please log in again.");

    const text = (commentInputs[id] || "").trim();
    if (!text) return;

    try {
      const res = await axios.post(
        `${API_ENDPOINT}/${id}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSermonsData((prev) => prev.map((s) => (s._id === id ? res.data : s)));
      setCommentInputs((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Error adding comment:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to add comment.");
    }
  };

  // Share verse
  const handleShare = async (id) => {
    const verse = sermonsData.find((s) => s._id === id);
    const shareText = `Check out this Bible verse: ${verse.verse} - ${verse.description.substring(0, 100)}...`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: verse.verse,
          text: shareText,
          url: window.location.href,
        });
      } catch {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      alert("Verse copied to clipboard!");
    }
  };

  const handleScrollLeft = () =>
    scrollContainerRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  const handleScrollRight = () =>
    scrollContainerRef.current?.scrollBy({ left: 350, behavior: "smooth" });

  const applyFilters = () => setShowSearchFilter(false);
  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setSortBy("newest");
  };

  const TruncatedText = ({ text, maxLength = 100, verseId }) => {
    const isExpanded = expandedVerse === verseId;
    const shouldTruncate = text.length > maxLength && !isExpanded;
    return (
      <div className="relative">
        <div
          className={`text-gray-200 text-sm leading-relaxed ${
            isExpanded ? "" : "line-clamp-3"
          }`}
        >
          {shouldTruncate ? `${text.substring(0, maxLength)}...` : text}
        </div>
        {text.length > maxLength && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedVerse(isExpanded ? null : verseId);
            }}
            className="mt-1 text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1 transition"
          >
            {isExpanded ? (
              <>
                <FaCompressAlt className="w-3 h-3" />
                Show less
              </>
            ) : (
              <>
                <FaExpandAlt className="w-3 h-3" />
                Read more
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Bible verses...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg max-w-md text-center border border-white/20">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Error Loading Verses
          </h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=2070')",
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 py-8 md:px-12">
        {/* Section Header */}
        <div className="container mx-auto px-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <FaBible className="text-white text-xl" />
                </div>
                Bible Verses
              </h2>
              <p className="text-gray-300 text-sm mt-1">
                Daily inspiration and wisdom
              </p>
            </div>

            <div className="flex items-center gap-3">
              {(searchTerm ||
                categoryFilter !== "all" ||
                sortBy !== "newest") && (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xs text-gray-300">Filters:</span>
                  {searchTerm && (
                    <span className="px-2 py-1 bg-blue-500/30 backdrop-blur-sm text-blue-200 text-xs rounded-full border border-blue-400/30">
                      {searchTerm}
                    </span>
                  )}
                  {categoryFilter !== "all" && (
                    <span className="px-2 py-1 bg-purple-500/30 backdrop-blur-sm text-purple-200 text-xs rounded-full border border-purple-400/30">
                      {categoryFilter}
                    </span>
                  )}
                </div>
              )}
              <button
                onClick={() => setShowSearchFilter(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-xl hover:bg-white/20 transition shadow-lg text-sm"
              >
                <FiFilter className="w-4 h-4" />
                <span className="font-medium">Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Verses Container */}
        <div className="container mx-auto px-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-gray-300 text-sm">
              Showing{" "}
              <span className="font-semibold text-white">
                {filteredSermons.length}
              </span>{" "}
              verse{filteredSermons.length !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleScrollLeft}
                disabled={isAtStart}
                className={`p-2 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition shadow-lg border border-white/20 ${
                  isAtStart ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FiChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleScrollRight}
                disabled={isAtEnd}
                className={`p-2 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition shadow-lg border border-white/20 ${
                  isAtEnd ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FiChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="relative">
            {filteredSermons.length === 0 ? (
              <div className="text-center py-12 bg-white/10 backdrop-blur-lg rounded-2xl shadow-inner border border-white/20">
                <div className="text-4xl mb-4">📖</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No verses found
                </h3>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                  {searchTerm
                    ? `No results for "${searchTerm}"`
                    : "No verses match your filters"}
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-lg text-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-white/10 hover:scrollbar-thumb-blue-600"
                style={{ scrollBehavior: "smooth" }}
              >
                {filteredSermons.map((sermon) => (
                  <div
                    key={sermon._id}
                    className="relative min-w-[280px] max-w-[280px] h-[320px] bg-white/10 backdrop-blur-lg rounded-xl shadow-lg flex-shrink-0 flex flex-col transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] overflow-hidden border border-white/20"
                    onMouseLeave={() => setOpenComments(null)}
                  >
                    {/* Top actions */}
                    <div className="absolute top-2 right-2 flex space-x-1 z-20">
                      <button
                        onClick={() => toggleFavorite(sermon._id)}
                        className={`p-1.5 rounded-full transition backdrop-blur-sm ${
                          userActions[sermon._id]?.favorited
                            ? "text-yellow-400 bg-yellow-500/20"
                            : "text-gray-400 hover:text-yellow-400 hover:bg-white/10"
                        }`}
                      >
                        <FiStar size={16} />
                      </button>
                    </div>

                    {/* Card content */}
                    <div className="p-4 flex flex-col flex-grow min-h-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md">
                          <FiBookOpen className="text-white" size={16} />
                        </div>
                        <span className="font-bold text-base text-white truncate">
                          {sermon.verse}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                        <FiCalendar className="w-3 h-3" />
                        <span>
                          {new Date(sermon.date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="relative mb-3 flex-1 overflow-hidden">
                        <FaQuoteLeft className="absolute -left-1 -top-1 text-blue-400/40 text-sm" />
                        <div className="h-full overflow-y-auto pr-1">
                          <TruncatedText
                            text={sermon.description}
                            maxLength={100}
                            verseId={sermon._id}
                          />
                        </div>
                        <FaQuoteRight className="absolute -right-1 -bottom-1 text-blue-400/40 text-sm" />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-300 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <FiUser className="text-white w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-200">
                            Preacher:{" "}
                          </span>
                          <span className="truncate text-gray-300">
                            {sermon.preacher}
                          </span>
                        </div>
                      </div>

                      {sermon.category && (
                        <div className="mb-2 inline-flex items-center gap-1 px-2 py-1 bg-purple-500/30 backdrop-blur-sm text-purple-200 rounded-full text-xs font-semibold border border-purple-400/30 w-fit">
                          {sermon.category}
                        </div>
                      )}

                      {/* Bottom actions */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleLike(sermon._id)}
                            className={`flex items-center gap-1 text-sm transition ${
                              userActions[sermon._id]?.liked
                                ? "text-red-400"
                                : "text-gray-400 hover:text-red-400"
                            }`}
                          >
                            <FiHeart size={16} />
                            <span>{sermon.likes || 0}</span>
                          </button>

                          <button
                            onClick={() =>
                              setOpenComments(
                                openComments === sermon._id ? null : sermon._id,
                              )
                            }
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 transition"
                          >
                            <FiMessageCircle size={16} />
                            <span>{sermon.comments?.length || 0}</span>
                          </button>

                          <button
                            onClick={() => handleShare(sermon._id)}
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-green-400 transition"
                          >
                            <FiShare2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Comments drawer */}
                      <AnimatePresence>
                        {openComments === sermon._id && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl p-4 overflow-y-auto rounded-xl flex flex-col gap-3 z-10 shadow-2xl border border-white/20"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-white text-sm">
                                Comments ({sermon.comments?.length || 0})
                              </h4>
                              <button
                                onClick={() => setOpenComments(null)}
                                className="text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-white/10"
                              >
                                <FiX size={18} />
                              </button>
                            </div>
                            <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[200px]">
                              {sermon.comments?.length > 0 ? (
                                sermon.comments.map((c, i) => (
                                  <div
                                    key={i}
                                    className="bg-white/10 backdrop-blur-sm p-2 rounded-lg text-xs text-gray-200 border border-white/10"
                                  >
                                    <span className="font-semibold text-blue-300">
                                      {c.userName || "Anonymous"}:
                                    </span>{" "}
                                    {c.text}
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-400 text-xs text-center py-4">
                                  No comments yet. Be the first to comment!
                                </div>
                              )}
                            </div>
                            {user && (
                              <div className="mt-2 flex gap-2">
                                <input
                                  value={commentInputs[sermon._id] || ""}
                                  onChange={(e) =>
                                    handleCommentChange(
                                      sermon._id,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Add a comment..."
                                  className="flex-1 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition"
                                  onKeyPress={(e) =>
                                    e.key === "Enter" && addComment(sermon._id)
                                  }
                                />
                                <button
                                  onClick={() => addComment(sermon._id)}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
                                >
                                  Send
                                </button>
                              </div>
                            )}
                            {!user && (
                              <p className="text-xs text-gray-400 text-center mt-2">
                                Please log in to add comments
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      <AnimatePresence>
        {showSearchFilter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 relative border border-white/20"
            >
              <button
                onClick={() => setShowSearchFilter(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-white/10"
              >
                <FiX size={20} />
              </button>
              <h3 className="text-xl font-semibold text-white">
                Filter Verses
              </h3>

              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search verses, descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-800">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
              >
                <option value="newest" className="bg-gray-800">
                  Newest First
                </option>
                <option value="oldest" className="bg-gray-800">
                  Oldest First
                </option>
                <option value="likes" className="bg-gray-800">
                  Most Liked
                </option>
                <option value="verse" className="bg-gray-800">
                  Verse Name (A-Z)
                </option>
              </select>

              <div className="flex justify-between gap-2 mt-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
                >
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  className="flex-1 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/20 transition border border-white/20"
                >
                  Reset All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
