import React, { useState, useEffect, useRef } from "react";
import {
  FiMoreHorizontal,
  FiX,
  FiSearch,
  FiCalendar,
  FiUser,
  FiMusic,
  FiList,
  FiBook,
  FiShare2,
  FiPrinter,
  FiDownload,
  FiFilter,
  FiClock,
  FiEye,
  FiHeart,
  FiMessageSquare,
  FiBookmark,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
  FiPlayCircle,
} from "react-icons/fi";
import {
  FaYoutube,
  FaSpotify,
  FaApple,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import axios from "axios";
import Header from "../components/header.jsx";
import Footer from "../components/footer.jsx";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle.min.js";

const SundayPreachings = () => {
  const [preachings, setPreachings] = useState([]);
  const [filteredPreachings, setFilteredPreachings] = useState([]);
  const [modalPreach, setModalPreach] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    class: "All",
    preacher: "All",
    year: "All",
  });
  const [stats, setStats] = useState({
    total: 0,
    byClass: {},
    byPreacher: {},
  });
  const [selectedPreacher, setSelectedPreacher] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const modalRef = useRef(null);

  // Fetch preachings
  useEffect(() => {
    fetchPreachings();
  }, []);

  const fetchPreachings = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_BASE_URL = import.meta.env.VITE_BASE_URL;

      const url = `${API_BASE_URL}/api/sundayService`;
      const res = await axios.get(url);

      // ✅ Get the array of preachings
      const preachingsData = res.data.preachings;

      // Sort by date descending
      const sortedData = preachingsData.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setPreachings(sortedData);
      setFilteredPreachings(sortedData);

      // Optional: populate stats from backend
      const backendStats = res.data.stats;
      setStats({
        total: backendStats.total,
        byClass: Object.fromEntries(
          backendStats.byClass.map((c) => [c._id, c.count])
        ),
        byPreacher: Object.fromEntries(
          backendStats.byPreacher.map((p) => [p._id, p.count])
        ),
        byYear: Object.fromEntries(
          backendStats.byYear.map((y) => [y._id, y.count])
        ),
      });
    } catch (err) {
      console.error("Error fetching preachings:", err);
      setError("Failed to load preachings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const classStats = {};
    const preacherStats = {};

    data.forEach((preaching) => {
      // Count by class
      classStats[preaching.class] = (classStats[preaching.class] || 0) + 1;

      // Count by preacher
      preacherStats[preaching.preacherName] =
        (preacherStats[preaching.preacherName] || 0) + 1;
    });

    setStats({
      total: data.length,
      byClass: classStats,
      byPreacher: preacherStats,
    });
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...preachings];

    // Apply search
    if (searchTerm) {
      const lowercaseQuery = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(lowercaseQuery) ||
          p.preacherName?.toLowerCase().includes(lowercaseQuery) ||
          p.verses?.toLowerCase().includes(lowercaseQuery) ||
          p.class?.toLowerCase().includes(lowercaseQuery) ||
          p.shortDescription?.toLowerCase().includes(lowercaseQuery) ||
          p.fullDescription?.toLowerCase().includes(lowercaseQuery) ||
          p.serviceNumber?.toString().includes(searchTerm) ||
          new Date(p.date)
            .toLocaleDateString()
            .toLowerCase()
            .includes(lowercaseQuery)
      );
    }

    // Apply class filter
    if (filters.class !== "All") {
      filtered = filtered.filter((p) => p.class === filters.class);
    }

    // Apply preacher filter
    if (filters.preacher !== "All") {
      filtered = filtered.filter((p) => p.preacherName === filters.preacher);
    }

    // Apply year filter
    if (filters.year !== "All") {
      filtered = filtered.filter(
        (p) => new Date(p.date).getFullYear().toString() === filters.year
      );
    }

    setFilteredPreachings(filtered);
    setCurrentPage(1);
  };

  // Initial load
  useEffect(() => {
    fetchPreachings();

    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem("sundayPreachingsBookmarks");
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm, preachings]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Toggle bookmark
  const toggleBookmark = (preachingId) => {
    let updatedBookmarks;
    if (bookmarks.includes(preachingId)) {
      updatedBookmarks = bookmarks.filter((id) => id !== preachingId);
    } else {
      updatedBookmarks = [...bookmarks, preachingId];
    }
    setBookmarks(updatedBookmarks);
    localStorage.setItem(
      "sundayPreachingsBookmarks",
      JSON.stringify(updatedBookmarks)
    );
  };

  // Share preaching
  const sharePreaching = (preaching) => {
    if (navigator.share) {
      navigator.share({
        title: preaching.title,
        text: `${preaching.title} by ${preaching.preacherName}`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(
        `${preaching.title} - ${window.location.href}`
      );
      alert("Link copied to clipboard!");
    }
  };

  // Print preaching
  const printPreaching = (preaching) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${preaching.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #333; border-bottom: 3px solid #4F46E5; padding-bottom: 10px; }
            .meta { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .program-item { margin: 10px 0; padding: 10px; border-left: 4px solid #4F46E5; }
            .song { background: #fef3c7; padding: 10px; margin: 5px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>${preaching.title}</h1>
          <div class="meta">
            <p><strong>Service #:</strong> ${preaching.serviceNumber}</p>
            <p><strong>Date:</strong> ${formatDate(preaching.date)}</p>
            <p><strong>Preacher:</strong> ${preaching.preacherName}</p>
            <p><strong>Bible Verses:</strong> ${preaching.verses}</p>
            <p><strong>Class:</strong> ${preaching.class}</p>
          </div>
          <h2>Sermon Summary</h2>
          <p>${preaching.fullDescription}</p>
          <h2>Service Program</h2>
          ${preaching.programOrder
            ?.map(
              (item) => `
            <div class="program-item">
              <h3>${item.order}. ${item.activity}</h3>
              <p>${item.details}</p>
            </div>
          `
            )
            .join("")}
          <h2>Worship Songs</h2>
          <p>Choir: ${preaching.choirName}</p>
          ${preaching.choirSongs
            ?.map(
              (song) => `
            <div class="song">
              <h4>${song.title}</h4>
              <p>Composer: ${song.composer}</p>
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  // Download as PDF
  const downloadAsPDF = (preaching) => {
    const element = document.createElement("div");
    element.innerHTML = `
      <div style="padding: 40px; font-family: Arial, sans-serif;">
        <h1 style="color: #4F46E5; border-bottom: 3px solid #4F46E5; padding-bottom: 10px;">
          ${preaching.title}
        </h1>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service #:</strong> ${preaching.serviceNumber}</p>
          <p><strong>Date:</strong> ${formatDate(preaching.date)}</p>
          <p><strong>Preacher:</strong> ${preaching.preacherName}</p>
          <p><strong>Bible Verses:</strong> ${preaching.verses}</p>
          <p><strong>Class:</strong> ${preaching.class}</p>
        </div>
        <h2 style="color: #374151;">Sermon Summary</h2>
        <p style="line-height: 1.6;">${preaching.fullDescription}</p>
        <h2 style="color: #374151; margin-top: 30px;">Service Program</h2>
        <div style="margin-top: 20px;">
          ${preaching.programOrder
            ?.map(
              (item) => `
            <div style="border-left: 4px solid #4F46E5; padding-left: 15px; margin: 10px 0;">
              <h3 style="margin: 0;">${item.order}. ${item.activity}</h3>
              <p style="margin: 5px 0; color: #6B7280;">${item.details}</p>
            </div>
          `
            )
            .join("")}
        </div>
        <h2 style="color: #374151; margin-top: 30px;">Worship Songs</h2>
        <p><strong>Choir:</strong> ${preaching.choirName}</p>
        <div style="margin-top: 15px;">
          ${preaching.choirSongs
            ?.map(
              (song) => `
            <div style="background: #fef3c7; padding: 10px; margin: 5px 0; border-radius: 4px;">
              <h4 style="margin: 0; color: #92400E;">${song.title}</h4>
              <p style="margin: 5px 0 0 0; color: #B45309;">Composer: ${song.composer}</p>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${preaching.title.replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  // Get unique values for filters
  const getUniqueClasses = () => {
    return ["All", ...new Set(preachings.map((p) => p.class))];
  };

  const getUniquePreachers = () => {
    return ["All", ...new Set(preachings.map((p) => p.preacherName))];
  };

  const getUniqueYears = () => {
    const years = preachings.map((p) => new Date(p.date).getFullYear());
    return ["All", ...new Set(years)].sort((a, b) => b - a);
  };

  // Pagination
  const totalPages = Math.ceil(filteredPreachings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPreachings = filteredPreachings.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      {/* Modern Header with Stats */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Sunday Sermons Archive
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Explore our collection of inspiring sermons, worship details, and
              service insights
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total Sermons</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.total}
                  </p>
                </div>
                <FiBook className="text-2xl text-white/60" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Unique Preachers</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {Object.keys(stats.byPreacher).length}
                  </p>
                </div>
                <FiUser className="text-2xl text-white/60" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Active Classes</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {Object.keys(stats.byClass).length}
                  </p>
                </div>
                <FiList className="text-2xl text-white/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-12"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              fill="white"
              fillOpacity="0.1"
            />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8">
        {/* Search and Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search sermons, preachers, or verses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
              <div className="text-center">
                <p className="text-sm text-gray-600">Showing</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {filteredPreachings.length}
                </p>
                <p className="text-xs text-gray-500">sermons</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Bookmarked</p>
                <p className="text-2xl font-bold text-purple-600">
                  {bookmarks.length}
                </p>
                <p className="text-xs text-gray-500">saved</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Page</p>
                <p className="text-2xl font-bold text-pink-600">
                  {currentPage}
                </p>
                <p className="text-xs text-gray-500">of {totalPages}</p>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Class
              </label>
              <select
                value={filters.class}
                onChange={(e) =>
                  setFilters({ ...filters, class: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {getUniqueClasses().map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Preacher
              </label>
              <select
                value={filters.preacher}
                onChange={(e) =>
                  setFilters({ ...filters, preacher: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {getUniquePreachers().map((preacher) => (
                  <option key={preacher} value={preacher}>
                    {preacher}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Year
              </label>
              <select
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {getUniqueYears().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar with Preacher Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Preachers
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.byPreacher)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([preacher, count]) => (
                    <button
                      key={preacher}
                      onClick={() => setSelectedPreacher(preacher)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition ${
                        selectedPreacher === preacher
                          ? "bg-indigo-50 border border-indigo-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {preacher}
                      </span>
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                        {count}
                      </span>
                    </button>
                  ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg hover:from-indigo-100 hover:to-purple-100 transition">
                    <span className="text-sm font-medium text-gray-700">
                      View All Bookmarked
                    </span>
                    <FiBookmark className="text-indigo-600" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition">
                    <span className="text-sm font-medium text-gray-700">
                      Most Popular Sermons
                    </span>
                    <FiEye className="text-green-600" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg hover:from-pink-100 hover:to-rose-100 transition">
                    <span className="text-sm font-medium text-gray-700">
                      Recent Additions
                    </span>
                    <FiClock className="text-pink-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preachings Grid */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {loading && (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600 text-lg">Loading sermons...</p>
                <p className="text-gray-400 text-sm">
                  Fetching the latest messages
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiX className="text-2xl text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium mb-4">{error}</p>
                  <button
                    onClick={fetchPreachings}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition shadow-lg"
                  >
                    <FiSearch className="inline mr-2" />
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* No Results State */}
            {!loading && !error && filteredPreachings.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                  <div className="text-gray-300 text-8xl mb-6">📖</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No sermons found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ||
                    filters.class !== "All" ||
                    filters.preacher !== "All" ||
                    filters.year !== "All"
                      ? "Try adjusting your search or filters"
                      : "No sermons available yet. Check back soon!"}
                  </p>
                  {(searchTerm ||
                    filters.class !== "All" ||
                    filters.preacher !== "All" ||
                    filters.year !== "All") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilters({
                          class: "All",
                          preacher: "All",
                          year: "All",
                        });
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Preachings Grid */}
            {!loading && !error && filteredPreachings.length > 0 && (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedPreachings.map((preaching) => (
                    <div
                      key={preaching._id}
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200"
                    >
                      {/* Card Header */}
                      <div className="relative h-40 overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600">
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute top-4 right-4">
                          <button
                            onClick={() => toggleBookmark(preaching._id)}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition"
                          >
                            <FiBookmark
                              className={`h-4 w-4 ${
                                bookmarks.includes(preaching._id)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-white"
                              }`}
                            />
                          </button>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <span className="bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1 rounded-full">
                            #{preaching.serviceNumber}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded">
                            {preaching.class}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(preaching.date)}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition">
                          {preaching.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {preaching.shortDescription}
                        </p>

                        {/* Quick Info */}
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center text-sm text-gray-700">
                            <FiUser className="h-3 w-3 mr-2 text-gray-400" />
                            <span className="truncate">
                              {preaching.preacherName}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-700">
                            <FiBook className="h-3 w-3 mr-2 text-gray-400" />
                            <span className="truncate">{preaching.verses}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => setModalPreach(preaching)}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-medium text-sm"
                          >
                            <FiMoreHorizontal className="h-4 w-4 mr-2" />
                            Details
                          </button>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => sharePreaching(preaching)}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <FiShare2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mb-12">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <FiChevronLeft className="h-5 w-5" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum =
                        currentPage <= 3
                          ? i + 1
                          : currentPage >= totalPages - 2
                          ? totalPages - 4 + i
                          : currentPage - 2 + i;

                      if (pageNum > totalPages || pageNum < 1) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <FiChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {modalPreach && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && setModalPreach(null)}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-slideUp"
          >
            {/* Modal Header with Actions */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6 z-10">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {modalPreach.title}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      Service #{modalPreach.serviceNumber}
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      {modalPreach.class}
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      {formatDate(modalPreach.date)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => toggleBookmark(modalPreach._id)}
                    className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition"
                  >
                    <FiBookmark
                      className={`h-5 w-5 ${
                        bookmarks.includes(modalPreach._id)
                          ? "fill-yellow-400 text-yellow-400"
                          : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => sharePreaching(modalPreach)}
                    className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition"
                  >
                    <FiShare2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => printPreaching(modalPreach)}
                    className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition"
                  >
                    <FiPrinter className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => downloadAsPDF(modalPreach)}
                    className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition"
                  >
                    <FiDownload className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setModalPreach(null)}
                    className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(95vh-180px)]">
              {/* Quick Stats Row */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
                  <p className="text-sm text-indigo-600 mb-1">Program Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {modalPreach.programOrder?.length || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                  <p className="text-sm text-purple-600 mb-1">Worship Songs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {modalPreach.choirSongs?.length || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 text-center">
                  <p className="text-sm text-pink-600 mb-1">Service Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTime(modalPreach.date)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-600 mb-1">Program Leader</p>
                  <p className="text-lg font-semibold text-gray-900 truncate">
                    {modalPreach.programLeader}
                  </p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Sermon Details */}
                <div className="lg:col-span-2">
                  {/* Preacher and Verses */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-5 border border-indigo-100">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                          <FiUser className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Preacher
                          </h3>
                          <p className="text-2xl font-bold text-indigo-700 mt-1">
                            {modalPreach.preacherName}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-100">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                          <FiBook className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Bible Verses
                          </h3>
                          <p className="text-xl font-bold text-emerald-700 mt-1">
                            {modalPreach.verses}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full Description */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3">
                        <FiMessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Sermon Summary
                      </h3>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
                      <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {modalPreach.fullDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Program Order */}
                  <div className="mb-8">
                    <div className="flex items-center mb-6">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-3">
                        <FiList className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Service Program
                        </h3>
                        <p className="text-gray-600">
                          Led by {modalPreach.programLeader}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {modalPreach.programOrder
                        ?.sort((a, b) => a.order - b.order)
                        .map((item) => (
                          <div
                            key={item._id}
                            className="group relative bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                {item.order}
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-semibold text-gray-900 text-lg group-hover:text-indigo-600 transition">
                                  {item.activity}
                                </h4>
                                <p className="text-gray-600 mt-1">
                                  {item.details}
                                </p>
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.duration || "—"}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Worship Team */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8">
                    {/* Choir Details */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6 mb-6">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg mr-3">
                          <FiMusic className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Worship Team
                          </h3>
                          <p className="text-orange-700 font-semibold">
                            {modalPreach.choirName}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {modalPreach.choirSongs?.map((song, index) => (
                          <div
                            key={song._id || index}
                            className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-orange-100 hover:border-orange-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                Song #{index + 1}
                              </span>
                              <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-orange-600 transition">
                                <FiPlayCircle className="h-4 w-4" />
                              </button>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                              {song.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              by {song.composer}
                            </p>
                            {song.key && (
                              <div className="mt-2">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  Key: {song.key}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Share Options */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Share This Sermon
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                          <FaFacebook className="h-5 w-5 mr-2" />
                          <span className="text-sm">Facebook</span>
                        </button>
                        <button className="flex items-center justify-center p-3 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition">
                          <FaTwitter className="h-5 w-5 mr-2" />
                          <span className="text-sm">Twitter</span>
                        </button>
                        <button className="flex items-center justify-center p-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition">
                          <FaWhatsapp className="h-5 w-5 mr-2" />
                          <span className="text-sm">WhatsApp</span>
                        </button>
                        <button className="flex items-center justify-center p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                          <FaYoutube className="h-5 w-5 mr-2" />
                          <span className="text-sm">YouTube</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SundayPreachings;
