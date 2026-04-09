import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  FiSearch,
  FiX,
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
  FiChevronLeft,
  FiChevronRight,
  FiPlayCircle,
  FiMenu,
  FiStar,
  FiShuffle,
  FiChevronDown,
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
import Footer from "../components/Footer.jsx";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle.min.js";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const BG_IMAGE =
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000";

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
    byYear: {},
  });
  const [bookmarks, setBookmarks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [randomMode, setRandomMode] = useState(false);
  const itemsPerPage = 9;
  const modalRef = useRef(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/sundayService`);
        const data = res.data.preachings || [];
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPreachings(sorted);
        setFilteredPreachings(sorted);
        // stats from backend or compute
        const byClass = {};
        const byPreacher = {};
        const byYear = {};
        sorted.forEach((p) => {
          byClass[p.class] = (byClass[p.class] || 0) + 1;
          byPreacher[p.preacherName] = (byPreacher[p.preacherName] || 0) + 1;
          const year = new Date(p.date).getFullYear();
          byYear[year] = (byYear[year] || 0) + 1;
        });
        setStats({ total: sorted.length, byClass, byPreacher, byYear });
      } catch (err) {
        console.error(err);
        setError("Failed to load preachings.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const saved = localStorage.getItem("sundayPreachingsBookmarks");
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...preachings];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(term) ||
          p.preacherName?.toLowerCase().includes(term) ||
          p.verses?.toLowerCase().includes(term) ||
          p.class?.toLowerCase().includes(term) ||
          p.shortDescription?.toLowerCase().includes(term) ||
          p.fullDescription?.toLowerCase().includes(term) ||
          p.serviceNumber?.toString().includes(term),
      );
    }
    if (filters.class !== "All")
      filtered = filtered.filter((p) => p.class === filters.class);
    if (filters.preacher !== "All")
      filtered = filtered.filter((p) => p.preacherName === filters.preacher);
    if (filters.year !== "All")
      filtered = filtered.filter(
        (p) => new Date(p.date).getFullYear().toString() === filters.year,
      );
    setFilteredPreachings(filtered);
    setCurrentPage(1);
  }, [preachings, searchTerm, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Shuffle / random
  const shufflePreachings = useCallback(() => {
    const shuffled = [...preachings];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPreachings(shuffled);
    setRandomMode(true);
  }, [preachings]);

  const pickRandom = useCallback(() => {
    if (filteredPreachings.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredPreachings.length);
    setModalPreach(filteredPreachings[randomIndex]);
  }, [filteredPreachings]);

  // Toggle bookmark
  const toggleBookmark = (id) => {
    const updated = bookmarks.includes(id)
      ? bookmarks.filter((b) => b !== id)
      : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem("sundayPreachingsBookmarks", JSON.stringify(updated));
  };

  // Share, print, download
  const sharePreaching = (p) => {
    if (navigator.share)
      navigator.share({
        title: p.title,
        text: `${p.title} by ${p.preacherName}`,
        url: window.location.href,
      });
    else
      navigator.clipboard
        .writeText(`${p.title} - ${window.location.href}`)
        .then(() => alert("Link copied!"));
  };
  const printPreaching = (p) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>${p.title}</title><style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #059669; border-bottom: 3px solid #059669; }
        .meta { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .program-item { margin: 10px 0; padding: 10px; border-left: 4px solid #059669; }
        .song { background: #fef3c7; padding: 10px; margin: 5px 0; }
      </style></head><body>
      <h1>${p.title}</h1>
      <div class="meta"><p><strong>Service #${p.serviceNumber}</strong> | ${new Date(p.date).toLocaleDateString()} | Preacher: ${p.preacherName}</p><p><strong>Verses:</strong> ${p.verses}</p><p><strong>Class:</strong> ${p.class}</p></div>
      <h2>Sermon Summary</h2><p>${p.fullDescription}</p>
      <h2>Service Program</h2>${p.programOrder?.map((item) => `<div class="program-item"><h3>${item.order}. ${item.activity}</h3><p>${item.details}</p></div>`).join("")}
      <h2>Worship Songs</h2><p>Choir: ${p.choirName}</p>${p.choirSongs?.map((song) => `<div class="song"><h4>${song.title}</h4><p>${song.composer}</p></div>`).join("")}
      </body></html>
    `);
    win.document.close();
    win.print();
  };
  const downloadPDF = (p) => {
    const element = document.createElement("div");
    element.innerHTML = `<div style="padding:40px;font-family:Arial;"><h1 style="color:#059669;">${p.title}</h1><div style="background:#f3f4f6;padding:20px;"><p>Service #${p.serviceNumber} | ${new Date(p.date).toLocaleDateString()}</p><p>Preacher: ${p.preacherName}</p><p>Verses: ${p.verses}</p><p>Class: ${p.class}</p></div><h2>Sermon</h2><p>${p.fullDescription}</p><h2>Program</h2>${p.programOrder?.map((item) => `<div><strong>${item.order}. ${item.activity}</strong><br/>${item.details}</div>`).join("")}<h2>Songs</h2>${p.choirSongs?.map((s) => `<div><em>${s.title}</em> – ${s.composer}</div>`).join("")}</div>`;
    html2pdf()
      .set({
        margin: 10,
        filename: `${p.title.replace(/\s/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const uniqueClasses = ["All", ...new Set(preachings.map((p) => p.class))];
  const uniquePreachers = [
    "All",
    ...new Set(preachings.map((p) => p.preacherName)),
  ];
  const uniqueYears = [
    "All",
    ...new Set(
      preachings.map((p) => new Date(p.date).getFullYear().toString()),
    ),
  ].sort((a, b) => b - a);
  const totalPages = Math.ceil(filteredPreachings.length / itemsPerPage);
  const paginated = filteredPreachings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading)
    return (
      <>
        <Header />
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950" />
          <div className="relative bg-white/10 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-400 mx-auto mb-2" />
            <p className="text-white text-xs">Loading sermons...</p>
          </div>
        </div>
        <Footer />
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950" />
          <div className="relative bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-emerald-500/30 px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />
      <div className="relative min-h-screen">
        {/* Background */}
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

        {/* Main content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 lg:py-8">
          {/* Header stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-white/60">Sermons</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">
                {Object.keys(stats.byPreacher).length}
              </div>
              <div className="text-xs text-white/60">Preachers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">
                {Object.keys(stats.byClass).length}
              </div>
              <div className="text-xs text-white/60">Classes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">
                {bookmarks.length}
              </div>
              <div className="text-xs text-white/60">Bookmarks</div>
            </div>
          </div>

          {/* Sidebar + main */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden bg-white/10 backdrop-blur-md rounded-xl p-2 flex items-center gap-2 text-white text-sm"
                >
                  <FiMenu /> Filters
                </button>
                <div className="hidden lg:flex gap-2">
                  <button
                    onClick={shufflePreachings}
                    className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 text-white"
                  >
                    <FiShuffle size={12} /> Shuffle
                  </button>
                  <button
                    onClick={pickRandom}
                    className="bg-emerald-500/30 hover:bg-emerald-500/40 px-3 py-1.5 rounded-lg text-xs text-white"
                  >
                    Random Pick
                  </button>
                </div>
              </div>
              <div
                className={`${sidebarOpen ? "block" : "hidden lg:block"} bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4`}
              >
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <FiFilter size={12} /> Filters
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-white/60 text-xs block mb-1">
                      Class
                    </label>
                    <select
                      value={filters.class}
                      onChange={(e) =>
                        setFilters({ ...filters, class: e.target.value })
                      }
                      className="w-full bg-white/20 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm"
                    >
                      {uniqueClasses.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs block mb-1">
                      Preacher
                    </label>
                    <select
                      value={filters.preacher}
                      onChange={(e) =>
                        setFilters({ ...filters, preacher: e.target.value })
                      }
                      className="w-full bg-white/20 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm"
                    >
                      {uniquePreachers.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs block mb-1">
                      Year
                    </label>
                    <select
                      value={filters.year}
                      onChange={(e) =>
                        setFilters({ ...filters, year: e.target.value })
                      }
                      className="w-full bg-white/20 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm"
                    >
                      {uniqueYears.map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/20">
                  <div className="text-white/50 text-xs mb-2">
                    Top Preachers
                  </div>
                  <div className="space-y-1">
                    {Object.entries(stats.byPreacher)
                      .slice(0, 5)
                      .map(([name, count]) => (
                        <button
                          key={name}
                          onClick={() =>
                            setFilters({ ...filters, preacher: name })
                          }
                          className="w-full text-left text-white/80 text-xs hover:bg-white/10 rounded px-2 py-1 flex justify-between"
                        >
                          <span>{name}</span>
                          <span>{count}</span>
                        </button>
                      ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFilters({ class: "All", preacher: "All", year: "All" });
                    setSearchTerm("");
                  }}
                  className="mt-4 w-full bg-white/10 hover:bg-white/20 rounded-lg py-1.5 text-xs text-white"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Main grid */}
            <div className="flex-1">
              {/* Search bar */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-3 mb-6">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search title, preacher, verse..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/20 border border-white/20 rounded-lg py-2 pl-9 pr-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-white/50">
                  <span>{filteredPreachings.length} sermons found</span>
                  <button
                    onClick={pickRandom}
                    className="text-emerald-300 flex items-center gap-1"
                  >
                    <FiShuffle size={10} /> Random
                  </button>
                </div>
              </div>

              {/* Cards grid */}
              {filteredPreachings.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 text-center">
                  <p className="text-white/70">
                    No sermons match your filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {paginated.map((preaching) => (
                      <div
                        key={preaching._id}
                        className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden hover:border-emerald-500/40 transition-all group"
                      >
                        <div className="relative h-32 bg-gradient-to-r from-emerald-800 to-cyan-800">
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => toggleBookmark(preaching._id)}
                              className="p-1.5 bg-black/30 rounded-full hover:bg-black/50"
                            >
                              <FiBookmark
                                className={`h-3 w-3 ${bookmarks.includes(preaching._id) ? "text-yellow-400 fill-yellow-400" : "text-white"}`}
                              />
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <span className="bg-black/40 text-white text-[10px] px-2 py-0.5 rounded">
                              #{preaching.serviceNumber}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded">
                              {preaching.class}
                            </span>
                            <span className="text-[10px] text-white/50">
                              {new Date(preaching.date).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-white font-semibold text-base mb-1 line-clamp-1">
                            {preaching.title}
                          </h3>
                          <p className="text-white/70 text-xs mb-2 line-clamp-2">
                            {preaching.shortDescription}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-white/60 mb-3">
                            <FiUser /> {preaching.preacherName}{" "}
                            <FiBook className="ml-2" /> {preaching.verses}
                          </div>
                          <button
                            onClick={() => setModalPreach(preaching)}
                            className="w-full py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs flex items-center justify-center gap-1"
                          >
                            Read More <FiChevronRight size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-1.5 bg-white/10 rounded-lg text-white disabled:opacity-30"
                      >
                        <FiChevronLeft />
                      </button>
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let page =
                            currentPage <= 3
                              ? i + 1
                              : currentPage >= totalPages - 2
                                ? totalPages - 4 + i
                                : currentPage - 2 + i;
                          if (page < 1 || page > totalPages) return null;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-7 h-7 text-xs rounded-lg ${currentPage === page ? "bg-emerald-500 text-white" : "bg-white/10 text-white/70"}`}
                            >
                              {page}
                            </button>
                          );
                        },
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="p-1.5 bg-white/10 rounded-lg text-white disabled:opacity-30"
                      >
                        <FiChevronRight />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Floating Random Button */}
        <button
          onClick={pickRandom}
          className="fixed bottom-6 right-6 z-30 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110"
        >
          <FiShuffle size={24} />
        </button>

        {/* Enhanced Modal with POP colors */}
        {modalPreach && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={(e) =>
              e.target === e.currentTarget && setModalPreach(null)
            }
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl animate-modalPop">
              {/* Sticky header with gradient accent */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-800/90 via-cyan-800/90 to-indigo-800/90 backdrop-blur-md border-b border-white/20 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FiStar className="text-yellow-400" /> {modalPreach.title}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    <FiUser className="inline mr-1" />{" "}
                    {modalPreach.preacherName} ·
                    <FiCalendar className="inline ml-2 mr-1" />{" "}
                    {formatDate(modalPreach.date)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleBookmark(modalPreach._id)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                  >
                    <FiBookmark
                      className={
                        bookmarks.includes(modalPreach._id)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-white"
                      }
                    />
                  </button>
                  <button
                    onClick={() => sharePreaching(modalPreach)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                  >
                    <FiShare2 />
                  </button>
                  <button
                    onClick={() => printPreaching(modalPreach)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                  >
                    <FiPrinter />
                  </button>
                  <button
                    onClick={() => downloadPDF(modalPreach)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                  >
                    <FiDownload />
                  </button>
                  <button
                    onClick={() => setModalPreach(null)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                  >
                    <FiX />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Quick stats with colorful backgrounds */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-3 text-center border border-emerald-500/30">
                    <div className="text-emerald-300 text-xs uppercase tracking-wide">
                      Service #
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {modalPreach.serviceNumber}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl p-3 text-center border border-cyan-500/30">
                    <div className="text-cyan-300 text-xs uppercase tracking-wide">
                      Class
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {modalPreach.class}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-3 text-center border border-amber-500/30">
                    <div className="text-amber-300 text-xs uppercase tracking-wide">
                      Songs
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {modalPreach.choirSongs?.length || 0}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-3 text-center border border-purple-500/30">
                    <div className="text-purple-300 text-xs uppercase tracking-wide">
                      Program
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {modalPreach.programOrder?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Sermon Summary */}
                <div className="bg-white/5 rounded-xl p-5 border-l-4 border-emerald-400">
                  <h3 className="text-emerald-300 font-semibold mb-2 flex items-center gap-2">
                    <FiMessageSquare /> Sermon Summary
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {modalPreach.fullDescription}
                  </p>
                </div>

                {/* Bible Verses */}
                <div className="bg-white/5 rounded-xl p-5 border-l-4 border-cyan-400">
                  <h3 className="text-cyan-300 font-semibold mb-2 flex items-center gap-2">
                    <FiBook /> Scripture References
                  </h3>
                  <p className="text-white/90 text-sm font-mono">
                    {modalPreach.verses}
                  </p>
                </div>

                {/* Service Program */}
                <div>
                  <h3 className="text-amber-300 font-semibold mb-3 flex items-center gap-2">
                    <FiList /> Service Program
                  </h3>
                  <div className="space-y-2">
                    {modalPreach.programOrder
                      ?.sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <div
                          key={item._id}
                          className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white flex items-center justify-center text-xs font-bold">
                                {item.order}
                              </span>
                              <div>
                                <div className="font-semibold text-white">
                                  {item.activity}
                                </div>
                                <div className="text-white/60 text-sm">
                                  {item.details}
                                </div>
                              </div>
                            </div>
                            {item.duration && (
                              <span className="text-white/40 text-xs">
                                {item.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Worship Songs */}
                <div>
                  <h3 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                    <FiMusic /> Worship Team – {modalPreach.choirName}
                  </h3>
                  <div className="grid gap-2">
                    {modalPreach.choirSongs?.map((song, i) => (
                      <div
                        key={i}
                        className="bg-white/5 rounded-xl p-3 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-white">
                            {song.title}
                          </div>
                          <div className="text-white/50 text-sm">
                            by {song.composer}
                          </div>
                        </div>
                        <button className="p-2 text-white/40 hover:text-emerald-300 transition">
                          <FiPlayCircle />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer note */}
              <div className="sticky bottom-0 bg-white/5 backdrop-blur-md border-t border-white/20 px-6 py-3 text-center text-white/40 text-xs">
                ✝️ May this message bless your heart
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <style>{`
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        @keyframes modalPop {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-modalPop { animation: modalPop 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default SundayPreachings;
