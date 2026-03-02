import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import {
  Search,
  Filter,
  BookOpen,
  Bookmark,
  Download,
  Share2,
  ChevronDown,
  Loader2,
  AlertCircle,
  Grid,
  List,
  Calendar,
  Users,
  Star,
  TrendingUp,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Tag,
  Award,
  ThumbsUp,
  Music,
  Zap,
  ChevronRight,
  X,
  Play,
  Pause,
  Volume2,
  ExternalLink,
  Printer,
  Copy,
  FileText,
  BarChart3,
  Sparkles,
  Target,
  Book,
  Lightbulb,
  Shield,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";

// Use environment variable for API base
const API_BASE = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const VISIBLE_DEPARTMENTS_COUNT = 4;

const BibleStudyPage = () => {
  const [studies, setStudies] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingStudy, setLoadingStudy] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [featuredStudies, setFeaturedStudies] = useState([]);
  const [trendingStudies, setTrendingStudies] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    difficulty: "all",
    sortBy: "newest",
    sortOrder: "desc",
    viewMode: "grid",
    timeFilter: "all",
  });
  const [bookmarks, setBookmarks] = useState({});
  const [likes, setLikes] = useState({});
  const [favorites, setFavorites] = useState({});
  const [audioStates, setAudioStates] = useState({});
  const [user] = useState({
    id: "user123",
    name: "John Doe",
    avatar:
      "https://ui-avatars.com/api/?name=John+Doe&background=4f46e5&color=fff",
  });
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Initialize
  useEffect(() => {
    fetchAllData();
    loadUserData();
    loadRecentlyViewed();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchStudies(),
        fetchCategories(),
        fetchStats(),
        fetchPopularTags(),
        fetchFeaturedStudies(),
        fetchTrendingStudies(),
      ]);
    } catch (err) {
      setError("Failed to load Bible studies. Please try again later.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudies = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.append(key, value);
      });

      const res = await axios.get(`${API_BASE}/api/studies?${params}`);
      setStudies(res.data.studies || res.data || []);
    } catch (err) {
      console.error("Failed to fetch studies:", err);
      setStudies([]);
    }
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/studies/categories/all`);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/studies/stats/summary`);
      setStats(res.data || {});
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setStats({});
    }
  };

  const fetchPopularTags = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/studies/tags/popular`);
      setPopularTags(res.data || []);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
      setPopularTags([]);
    }
  };

  const fetchFeaturedStudies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/studies/featured/studies`);
      setFeaturedStudies(res.data || []);
    } catch (err) {
      console.error("Failed to fetch featured studies:", err);
      setFeaturedStudies([]);
    }
  };

  const fetchTrendingStudies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/studies/trending/studies`);
      setTrendingStudies(res.data || []);
    } catch (err) {
      console.error("Failed to fetch trending studies:", err);
      setTrendingStudies([]);
    }
  };

  const loadUserData = () => {
    const savedBookmarks =
      JSON.parse(localStorage.getItem("studyBookmarks")) || {};
    const savedLikes = JSON.parse(localStorage.getItem("studyLikes")) || {};
    const savedFavorites =
      JSON.parse(localStorage.getItem("studyFavorites")) || {};
    setBookmarks(savedBookmarks);
    setLikes(savedLikes);
    setFavorites(savedFavorites);
  };

  const loadRecentlyViewed = () => {
    const recent = JSON.parse(localStorage.getItem("recentStudyViews") || "[]");
    setRecentlyViewed(recent.slice(0, 5));
  };

  // Handle filter changes
  useEffect(() => {
    fetchStudies();
  }, [fetchStudies, filters]);

  const handleSelectStudy = async (id) => {
    try {
      setLoadingStudy(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/api/studies/${id}`);

      setSelectedStudy(res.data);
      setIsPopupOpen(true);

      // Update recent views
      const recentViews = JSON.parse(
        localStorage.getItem("recentStudyViews") || "[]"
      );
      const updatedViews = [
        { id, title: res.data.study.title, viewedAt: new Date().toISOString() },
        ...recentViews.filter((view) => view.id !== id).slice(0, 9),
      ];
      localStorage.setItem("recentStudyViews", JSON.stringify(updatedViews));
      setRecentlyViewed(updatedViews.slice(0, 5));
    } catch (err) {
      setError("Failed to load study details. Please try again.");
      console.error("Study detail error:", err);
    } finally {
      setLoadingStudy(false);
    }
  };

  const handleLike = async (studyId) => {
    try {
      const res = await axios.post(`${API_BASE}/api/studies/${studyId}/like`, {
        userId: user.id,
      });

      // Update local state
      const newLikes = { ...likes };
      if (res.data.liked) {
        newLikes[studyId] = true;
      } else {
        delete newLikes[studyId];
      }
      setLikes(newLikes);
      localStorage.setItem("studyLikes", JSON.stringify(newLikes));

      // Update studies list
      setStudies((prev) =>
        prev.map((study) =>
          study._id === studyId ? { ...study, likes: res.data.likes } : study
        )
      );

      showNotification(
        res.data.liked ? "Study liked!" : "Like removed",
        res.data.liked ? "success" : "info"
      );
    } catch (err) {
      console.error("Failed to like study:", err);
      showNotification("Failed to update like", "error");
    }
  };

  const handleFavorite = async (studyId) => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/studies/${studyId}/favorite`,
        {
          userId: user.id,
        }
      );

      // Update local state
      const newFavorites = { ...favorites };
      if (res.data.favorited) {
        newFavorites[studyId] = true;
      } else {
        delete newFavorites[studyId];
      }
      setFavorites(newFavorites);
      localStorage.setItem("studyFavorites", JSON.stringify(newFavorites));

      showNotification(
        res.data.favorited ? "Added to favorites!" : "Removed from favorites",
        res.data.favorited ? "success" : "info"
      );
    } catch (err) {
      console.error("Failed to favorite study:", err);
      showNotification("Failed to update favorite", "error");
    }
  };

  const handleBookmark = (studyId, studyTitle) => {
    const newBookmarks = { ...bookmarks };

    if (newBookmarks[studyId]) {
      delete newBookmarks[studyId];
    } else {
      newBookmarks[studyId] = {
        id: studyId,
        title: studyTitle,
        bookmarkedAt: new Date().toISOString(),
      };
    }

    setBookmarks(newBookmarks);
    localStorage.setItem("studyBookmarks", JSON.stringify(newBookmarks));

    showNotification(
      newBookmarks[studyId] ? "Study bookmarked" : "Bookmark removed",
      newBookmarks[studyId] ? "success" : "info"
    );
  };

  const handleShare = async (study) => {
    try {
      // Record share
      await axios.post(`${API_BASE}/api/studies/${study._id}/share`);

      const shareData = {
        title: study.title,
        text: `${study.title} - ${
          study.summary || study.description.substring(0, 100)
        }...`,
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback
        const text = `${study.title}\n\n${
          study.summary || study.description.substring(0, 150)
        }...\n\n${window.location.href}`;
        await navigator.clipboard.writeText(text);
        showNotification("Link copied to clipboard!", "success");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        showNotification("Failed to share", "error");
      }
    }
  };

  const handleDownload = (study) => {
    const content = `
BIBLE STUDY: ${study.title}
Call to Action: ${study.callToAction || "N/A"}
Difficulty: ${study.difficulty || "Not specified"}
Estimated Time: ${
      study.estimatedTime ? `${study.estimatedTime} minutes` : "Not specified"
    }

DESCRIPTION:
${study.description}

KEY VERSES:
${
  study.verses
    ?.map((v) => `${v.reference} (${v.version || "NIV"}): ${v.text}`)
    .join("\n\n") || "None"
}

DISCUSSION QUESTIONS:
${
  study.discussionQuestions?.map((q, i) => `${i + 1}. ${q}`).join("\n") ||
  "None"
}

KEY TAKEAWAYS:
${study.keyTakeaways?.map((t, i) => `${i + 1}. ${t}`).join("\n") || "None"}

PRAYER POINTS:
${study.prayerPoints?.map((p, i) => `${i + 1}. ${p}`).join("\n") || "None"}

WORSHIP SONGS:
${
  study.songs
    ?.map((s) => `${s.name} - ${s.artist || "Unknown"}: ${s.url}`)
    .join("\n") || "None"
}

---
Downloaded from Bible Study App - ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bible-study-${study.title
      .toLowerCase()
      .replace(/\s+/g, "-")}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    showNotification("Study downloaded as text file", "success");
  };

  const toggleAudio = (songUrl) => {
    setAudioStates((prev) => ({
      ...prev,
      [songUrl]: !prev[songUrl],
    }));
  };

  const showNotification = (message, type = "info") => {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
      type === "success"
        ? "bg-green-100 text-green-800 border border-green-200"
        : type === "error"
        ? "bg-red-100 text-red-800 border border-red-200"
        : "bg-blue-100 text-blue-800 border border-blue-200"
    }`;
    notification.textContent = message;

    // Add to DOM
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add(
        "opacity-0",
        "transition-opacity",
        "duration-300"
      );
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "all",
      difficulty: "all",
      sortBy: "newest",
      sortOrder: "desc",
      viewMode: "grid",
      timeFilter: "all",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const StudyCard = ({ study }) => {
    const isBookmarked = !!bookmarks[study._id];
    const isLiked = !!likes[study._id];
    const isFavorited = !!favorites[study._id];

    return (
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 border border-gray-700 hover:border-yellow-400/50 group transform hover:-translate-y-2">
        {/* Card Header with Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={
              study.imageUrl
                ? `${API_BASE}${study.imageUrl}`
                : "/images/bible-study-default.jpg"
            }
            alt={study.title}
            onError={(e) => {
              e.currentTarget.src = "/images/bible-study-default.jpg";
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Difficulty Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                study.difficulty === "beginner"
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : study.difficulty === "intermediate"
                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}
            >
              {study.difficulty || "Intermediate"}
            </span>
          </div>

          {/* Featured Badge */}
          {study.isFeatured && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
              <Star size={10} className="mr-1" /> Featured
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 bg-black/70 text-white rounded-full text-xs font-medium backdrop-blur-sm">
              {study.category ? study.category.replace("_", " ") : "Topical"}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3
              onClick={() => handleSelectStudy(study._id)}
              className="text-xl font-bold text-yellow-300 hover:text-yellow-200 cursor-pointer transition-colors line-clamp-1 group-hover:text-yellow-200"
            >
              {study.title}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleBookmark(study._id, study.title)}
                className={`p-2 rounded-xl ${
                  isBookmarked
                    ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                    : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 border border-transparent hover:border-yellow-400/20"
                }`}
                title={isBookmarked ? "Remove bookmark" : "Bookmark"}
              >
                <Bookmark
                  size={18}
                  fill={isBookmarked ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>

          {study.callToAction && (
            <p className="text-sm italic text-blue-300 mb-3 border-l-4 border-blue-500 pl-3 py-1 bg-blue-500/10 rounded-r">
              "{study.callToAction}"
            </p>
          )}

          <p className="text-gray-300 mb-4 line-clamp-2">
            {study.summary || study.description}
          </p>

          {/* Study Metadata */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-400">
              <Clock size={14} className="mr-2 flex-shrink-0 text-yellow-400" />
              <span>
                {study.estimatedTime
                  ? `${study.estimatedTime} min`
                  : "Time not specified"}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-400">
              <Calendar size={14} className="mr-2 flex-shrink-0 text-blue-400" />
              <span>{formatDate(study.createdAt)}</span>
            </div>

            {study.tags && study.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {study.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-900 text-gray-400 rounded-full text-xs border border-gray-700"
                  >
                    {tag}
                  </span>
                ))}
                {study.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-900 text-gray-400 rounded-full text-xs border border-gray-700">
                    +{study.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <button
                onClick={() => handleLike(study._id)}
                className={`flex items-center gap-1 ${
                  isLiked
                    ? "text-red-400"
                    : "text-gray-400 hover:text-red-400 hover:bg-red-400/10 p-1 rounded"
                }`}
              >
                <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                <span>{study.likes?.length || 0}</span>
              </button>

              <div className="flex items-center gap-1 text-gray-400">
                <MessageCircle size={16} />
                <span>{study.comments?.length || 0}</span>
              </div>

              <div className="flex items-center gap-1 text-gray-400">
                <Eye size={16} />
                <span>{study.views || 0}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleShare(study)}
                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl border border-transparent hover:border-blue-400/20"
                title="Share"
              >
                <Share2 size={16} />
              </button>
              <button
                onClick={() => handleDownload(study)}
                className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-xl border border-transparent hover:border-green-400/20"
                title="Download"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StudyPopup = () => {
    if (!selectedStudy || !selectedStudy.study) return null;

    const study = selectedStudy.study;
    const isBookmarked = !!bookmarks[study._id];
    const isLiked = !!likes[study._id];
    const isFavorited = !!favorites[study._id];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
        <div className="bg-gray-800/95 backdrop-blur-md rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-slideUp border border-yellow-400/30">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900/90 border-b border-gray-700 p-6 flex justify-between items-start backdrop-blur-sm">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    study.difficulty === "beginner"
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : study.difficulty === "intermediate"
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  {study.difficulty || "Intermediate"}
                </span>
                {study.isFeatured && (
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 rounded-full text-sm font-semibold flex items-center">
                    <Star size={12} className="mr-1" /> Featured
                  </span>
                )}
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                  {study.category
                    ? study.category.replace("_", " ")
                    : "Topical"}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-yellow-300 mb-2">
                {study.title}
              </h2>
              {study.callToAction && (
                <p className="text-lg italic text-blue-300 mb-2">
                  "{study.callToAction}"
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  Posted by {study.postedBy || "Church Staff"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(study.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye size={14} /> {study.views || 0} views
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const printContent =
                    document.getElementById("study-content").innerHTML;
                  const printWindow = window.open("", "_blank");
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>${study.title}</title>
                        <style>
                          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background: #f8fafc; }
                          h1 { color: #1e293b; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
                          .verse { font-style: italic; color: #4b5563; margin: 20px 0; padding: 15px; background: #f1f5f9; border-left: 4px solid #3b82f6; }
                          .content { line-height: 1.6; margin: 20px 0; }
                          @media print { body { background: white; } }
                        </style>
                      </head>
                      <body>
                        <h1>${study.title}</h1>
                        <div>${printContent}</div>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }}
                className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl border border-transparent hover:border-yellow-400/20"
                title="Print"
              >
                <Printer size={20} />
              </button>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl border border-transparent hover:border-red-400/20"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
            id="study-content"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-300">
                    <FileText size={20} className="text-yellow-400" />
                    Study Description
                  </h3>
                  <div className="prose max-w-none text-gray-300 leading-relaxed">
                    {study.description?.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Key Verses */}
                {study.verses && study.verses.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-300">
                      <BookOpen size={20} className="text-yellow-400" />
                      Key Scriptures
                    </h3>
                    <div className="space-y-4">
                      {study.verses.map((verse, index) => (
                        <div
                          key={index}
                          className="bg-blue-500/10 rounded-xl p-5 border-l-4 border-blue-500 backdrop-blur-sm"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-blue-300 text-lg">
                              {verse.reference}
                            </div>
                            <button
                              onClick={() =>
                                window.open(
                                  `https://www.biblegateway.com/passage/?search=${
                                    verse.reference
                                  }&version=${verse.version || "NIV"}`,
                                  "_blank"
                                )
                              }
                              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                            >
                              Read more <ExternalLink size={14} />
                            </button>
                          </div>
                          <div className="text-gray-200 italic text-lg mb-3">
                            "{verse.text}"
                          </div>
                          {verse.notes && (
                            <div className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded border border-gray-700">
                              <strong className="text-blue-300">Notes:</strong>{" "}
                              {verse.notes}
                            </div>
                          )}
                          {verse.version && (
                            <div className="text-xs text-gray-500 mt-2">
                              Version: {verse.version}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Discussion Questions */}
                {study.discussionQuestions &&
                  study.discussionQuestions.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-300">
                        <MessageCircle size={20} className="text-yellow-400" />
                        Discussion Questions
                      </h3>
                      <div className="space-y-3">
                        {study.discussionQuestions.map((question, index) => (
                          <div
                            key={index}
                            className="flex items-start bg-gray-900/50 p-4 rounded-lg border border-gray-700"
                          >
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-500/20 text-yellow-300 rounded-full mr-4 font-semibold border border-yellow-500/30">
                              {index + 1}
                            </span>
                            <span className="text-gray-200">{question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 mb-6 border border-blue-500/20">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-yellow-300">
                    <BarChart3 size={18} className="text-yellow-400" />
                    Study Stats
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Views</span>
                      <span className="font-semibold text-yellow-300">
                        {study.views || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Likes</span>
                      <span className="font-semibold text-red-400">
                        {study.likes?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Comments</span>
                      <span className="font-semibold text-blue-400">
                        {study.comments?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Estimated Time</span>
                      <span className="font-semibold text-green-400">
                        {study.estimatedTime
                          ? `${study.estimatedTime} min`
                          : "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Worship Songs */}
                {study.songs && study.songs.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 mb-6 border border-purple-500/20">
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-yellow-300">
                      <Music size={18} className="text-purple-400" />
                      Worship Songs
                    </h4>
                    <div className="space-y-3">
                      {study.songs.map((song, index) => (
                        <div
                          key={index}
                          className="bg-gray-900/50 rounded-lg p-4 border border-purple-500/20"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium text-gray-200">
                                {song.name}
                              </div>
                              {song.artist && (
                                <div className="text-sm text-gray-400">
                                  {song.artist}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => toggleAudio(song.url)}
                              className="p-2 text-purple-400 hover:bg-purple-400/10 rounded-full border border-transparent hover:border-purple-400/20"
                            >
                              {audioStates[song.url] ? (
                                <Pause size={16} />
                              ) : (
                                <Play size={16} />
                              )}
                            </button>
                          </div>
                          <button
                            onClick={() => window.open(song.url, "_blank")}
                            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            Listen on YouTube <ExternalLink size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Takeaways */}
                {study.keyTakeaways && study.keyTakeaways.length > 0 && (
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 mb-6 border border-green-500/20">
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-yellow-300">
                      <Award size={18} className="text-green-400" />
                      Key Takeaways
                    </h4>
                    <div className="space-y-2">
                      {study.keyTakeaways.map((takeaway, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-6 h-6 bg-green-400/20 text-green-400 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 border border-green-400/30">
                            ✓
                          </div>
                          <span className="text-gray-300">{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prayer Points */}
                {study.prayerPoints && study.prayerPoints.length > 0 && (
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-orange-500/20">
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-yellow-300">
                      <Zap size={18} className="text-orange-400" />
                      Prayer Points
                    </h4>
                    <div className="space-y-2">
                      {study.prayerPoints.map((point, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-6 h-6 bg-orange-400/20 text-orange-400 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 border border-orange-400/30">
                            ✝
                          </div>
                          <span className="text-gray-300">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-gray-900/90 border-t border-gray-700 p-6 backdrop-blur-sm">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleLike(study._id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isLiked
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-gray-700/50 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-gray-700"
                }`}
              >
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                {isLiked ? "Liked" : "Like"} ({study.likes?.length || 0})
              </button>

              <button
                onClick={() => handleFavorite(study._id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isFavorited
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-gray-700/50 text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/20 border border-gray-700"
                }`}
              >
                <Star size={18} fill={isFavorited ? "currentColor" : "none"} />
                {isFavorited ? "Favorited" : "Add to Favorites"}
              </button>

              <button
                onClick={() => handleBookmark(study._id, study.title)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isBookmarked
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-gray-700/50 text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20 border border-gray-700"
                }`}
              >
                <Bookmark
                  size={18}
                  fill={isBookmarked ? "currentColor" : "none"}
                />
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </button>

              <button
                onClick={() => handleShare(study)}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 flex items-center gap-2"
              >
                <Share2 size={18} />
                Share
              </button>

              <button
                onClick={() => handleDownload(study)}
                className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 flex items-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-yellow-400 mx-auto mb-6" />
          <p className="text-xl text-gray-300">Loading Bible Studies...</p>
          <p className="text-gray-500 mt-2">Preparing your spiritual journey</p>
        </div>
      </div>
    );
  }

  if (error && !selectedStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md bg-gray-800/50 backdrop-blur-sm p-10 rounded-2xl border border-red-500/30">
          <AlertCircle className="text-6xl text-red-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-red-400 mb-4">
            Unable to Load Studies
          </h3>
          <p className="text-gray-300 mb-8">{error}</p>
          <button
            onClick={fetchAllData}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
              <div className="flex-1">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                  Bible Studies
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  Explore scripture with in-depth studies, discussion questions,
                  and worship resources
                </p>
                <div className="flex items-center gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[120px]">
                    <div className="text-3xl font-bold text-yellow-300">
                      {stats?.totalStudies || 0}
                    </div>
                    <div className="text-sm text-blue-200">Total Studies</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[120px]">
                    <div className="text-3xl font-bold text-green-300">
                      {stats?.totalComments || 0}
                    </div>
                    <div className="text-sm text-blue-200">Comments</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[120px]">
                    <div className="text-3xl font-bold text-purple-300">
                      {stats?.totalViews || 0}
                    </div>
                    <div className="text-sm text-blue-200">Views</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/30">
                <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
                  <Sparkles className="text-yellow-400" /> Quick Access
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const randomStudy =
                        studies[Math.floor(Math.random() * studies.length)];
                      if (randomStudy) handleSelectStudy(randomStudy._id);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition flex items-center justify-center gap-2"
                  >
                    <Zap size={18} />
                    Random Study
                  </button>
                  <button
                    onClick={() =>
                      setFilters({ ...filters, sortBy: "popular" })
                    }
                    className="w-full px-4 py-3 bg-gray-800/50 text-gray-300 rounded-xl hover:bg-gray-700/50 border border-gray-700 transition flex items-center justify-center gap-2"
                  >
                    <TrendingUpIcon size={18} />
                    Trending Now
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                      placeholder="Search studies, scriptures, or topics..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/70 text-white rounded-xl border border-gray-700 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 transition"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className="w-full p-3 bg-gray-900/70 text-white rounded-xl border border-gray-700 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 transition"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat.value}>
                        {cat.label} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <select
                    value={filters.difficulty}
                    onChange={(e) =>
                      setFilters({ ...filters, difficulty: e.target.value })
                    }
                    className="w-full p-3 bg-gray-900/70 text-white rounded-xl border border-gray-700 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 transition"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Second Row Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Sort By */}
                <div>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters({ ...filters, sortBy: e.target.value })
                    }
                    className="w-full p-3 bg-gray-900/70 text-white rounded-xl border border-gray-700 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 transition"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="views">Most Viewed</option>
                    <option value="likes">Most Liked</option>
                  </select>
                </div>

                {/* Time Filter */}
                <div>
                  <select
                    value={filters.timeFilter}
                    onChange={(e) =>
                      setFilters({ ...filters, timeFilter: e.target.value })
                    }
                    className="w-full p-3 bg-gray-900/70 text-white rounded-xl border border-gray-700 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 transition"
                  >
                    <option value="all">All Time</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, viewMode: "grid" })}
                    className={`p-2 rounded-xl ${
                      filters.viewMode === "grid"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : "bg-gray-700/50 text-gray-400 border border-gray-700 hover:border-yellow-500/30 hover:text-yellow-400"
                    }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, viewMode: "list" })}
                    className={`p-2 rounded-xl ${
                      filters.viewMode === "list"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : "bg-gray-700/50 text-gray-400 border border-gray-700 hover:border-yellow-500/30 hover:text-yellow-400"
                    }`}
                  >
                    <List size={20} />
                  </button>
                  <span className="text-sm text-gray-400">View:</span>
                </div>

                {/* Clear Filters */}
                <div>
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-3 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-600/50 border border-gray-700 hover:border-gray-600 transition"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Featured Studies */}
                {featuredStudies.length > 0 && (
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-yellow-300">
                      <Star size={20} className="text-yellow-400" />
                      Featured Studies
                    </h3>
                    <div className="space-y-3">
                      {featuredStudies.slice(0, 5).map((study) => (
                        <button
                          key={study._id}
                          onClick={() => handleSelectStudy(study._id)}
                          className="w-full text-left p-3 rounded-xl hover:bg-yellow-500/10 transition-colors border border-gray-700 hover:border-yellow-500/30"
                        >
                          <div className="font-medium text-gray-200 line-clamp-1">
                            {study.title}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {study.views || 0} views •{" "}
                            {study.likes?.length || 0} likes
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Studies */}
                {trendingStudies.length > 0 && (
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-yellow-300">
                      <TrendingUp size={20} className="text-green-400" />
                      Trending Now
                    </h3>
                    <div className="space-y-3">
                      {trendingStudies.slice(0, 5).map((study) => (
                        <button
                          key={study._id}
                          onClick={() => handleSelectStudy(study._id)}
                          className="w-full text-left p-3 rounded-xl hover:bg-green-500/10 transition-colors border border-gray-700 hover:border-green-500/30"
                        >
                          <div className="font-medium text-gray-200 line-clamp-1">
                            {study.title}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Eye size={12} /> {study.views || 0} views
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recently Viewed */}
                {recentlyViewed.length > 0 && (
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-yellow-300">
                      <Clock size={20} className="text-blue-400" />
                      Recently Viewed
                    </h3>
                    <div className="space-y-3">
                      {recentlyViewed.map((view, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectStudy(view.id)}
                          className="w-full text-left p-3 rounded-xl hover:bg-blue-500/10 transition-colors border border-gray-700 hover:border-blue-500/30"
                        >
                          <div className="font-medium text-gray-200 line-clamp-1">
                            {view.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(view.viewedAt)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Tags */}
                {popularTags.length > 0 && (
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-yellow-300">
                      <Tag size={20} className="text-purple-400" />
                      Popular Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.slice(0, 10).map((tag) => (
                        <button
                          key={tag.name}
                          onClick={() =>
                            setFilters({ ...filters, search: tag.name })
                          }
                          className="px-3 py-1.5 bg-purple-500/10 text-purple-300 rounded-full text-sm hover:bg-purple-500/20 transition-colors border border-purple-500/20"
                        >
                          {tag.name} ({tag.count})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl shadow-xl p-6 border border-yellow-500/20">
                  <h3 className="font-semibold text-lg mb-4 text-yellow-300">
                    Your Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Bookmark size={16} className="text-yellow-400" />
                        Bookmarks
                      </span>
                      <span className="font-bold text-yellow-300">
                        {Object.values(bookmarks).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Heart size={16} className="text-red-400" />
                        Liked Studies
                      </span>
                      <span className="font-bold text-red-400">
                        {Object.values(likes).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Star size={16} className="text-yellow-400" />
                        Favorites
                      </span>
                      <span className="font-bold text-yellow-400">
                        {Object.values(favorites).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Studies Area */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-yellow-300">
                    {studies.length} Study{studies.length !== 1 ? "ies" : ""}{" "}
                    Found
                  </h2>
                  {filters.search && (
                    <p className="text-gray-400 mt-2">
                      Search results for: "
                      <span className="text-yellow-400">{filters.search}</span>"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {Object.values(bookmarks).length > 0 && (
                    <span className="flex items-center gap-2 text-gray-400">
                      <Bookmark size={16} className="text-yellow-400" />
                      {Object.values(bookmarks).length} bookmarked
                    </span>
                  )}
                </div>
              </div>

              {/* Studies Grid */}
              {studies.length === 0 ? (
                <div className="text-center py-16 bg-gray-800/50 rounded-2xl border border-gray-700">
                  <BookOpen className="mx-auto text-gray-600 mb-6" size={80} />
                  <h3 className="text-2xl font-bold text-gray-300 mb-4">
                    No Studies Found
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Try adjusting your filters or check back for new studies.
                    You can also search for different topics or difficulty
                    levels.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition"
                  >
                    Clear Filters & Show All
                  </button>
                </div>
              ) : (
                <div
                  className={
                    filters.viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {studies.map((study) => (
                    <StudyCard key={study._id} study={study} />
                  ))}
                </div>
              )}

              {/* Loading State for Study Details */}
              {loadingStudy && (
                <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 border border-yellow-400/30">
                    <Loader2 className="animate-spin h-16 w-16 text-yellow-400 mx-auto mb-6" />
                    <p className="text-gray-300 text-xl">
                      Loading study details...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Study Popup */}
        {isPopupOpen && <StudyPopup />}

        {/* Inline CSS for animations */}
        <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(50px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        
        .prose {
          max-width: 100%;
        }
        
        .prose p {
          margin-top: 0;
          margin-bottom: 1em;
        }
      `}</style>
      </div>
      <Footer />
    </>
  );
};

export default BibleStudyPage;