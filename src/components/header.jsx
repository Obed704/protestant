import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../src/context/authContext.jsx";
import Logo from "../assets/img/logo.jpg";
import {
  FiVideo,
  FiZap,
  FiBook,
  FiUsers,
  FiMenu,
  FiX,
  FiHeadphones,
  FiCalendar,
  FiGift,
  FiChevronDown,
  FiHome,
  FiUser,
  FiLogOut,
  FiChevronRight,
  FiChevronUp,
  FiSun,
  FiStar,
  FiSearch,
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const absUrl = (url) => {
  if (!url) return "";
  const s = String(url).trim();
  if (!s) return "";
  if (s.startsWith("http")) return s;
  const base = String(API_BASE_URL || "").replace(/\/+$/, "");
  if (!base) return s;
  return `${base}${s.startsWith("/") ? s : `/${s}`}`;
};

const initialsOf = (nameOrEmail = "") => {
  const s = String(nameOrEmail || "").trim();
  if (!s) return "U";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

function UserAvatar({ label, src, size = 36, ring = true }) {
  const [broken, setBroken] = useState(false);
  const initials = initialsOf(label);

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden ${
        ring ? "ring-2 ring-white/60 shadow-lg" : "border border-blue-100/60"
      } bg-gray-100`}
      style={{ width: size, height: size }}
      title={label || ""}
    >
      {src && !broken ? (
        <img
          src={src}
          alt={label || "avatar"}
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white font-bold">
          {initials}
        </div>
      )}
    </div>
  );
}

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = useMemo(
    () => [
      { name: "Home", to: "/home", icon: <FiHome /> },
      {
        name: "Ministries",
        icon: <FiUsers />,
        submenu: [
          {
            heading: "Worship & Prayer",
            icon: "🙏",
            items: [
              { name: "Sunday Service", to: "/sunday-service", icon: <FiBook /> },
              { name: "Daily Prayer", to: "/daily-word", icon: <FiUsers /> },
              { name: "Choir", to: "/choir", icon: <FiHeadphones /> },
              { name: "Upcoming Events", to: "/upcomingEvents", icon: <FiCalendar /> },
            ],
          },
          {
            heading: "Events",
            icon: "📅",
            items: [
              { name: "Bible Study", to: "/bible-study", icon: <FiBook /> },
              { name: "Baptism Program", to: "/baptism", icon: <FiGift /> },
              { name: "Upcoming Events", to: "/upcomingEvents", icon: <FiCalendar /> },
              { name: "Week Theme", to: "/weeks", icon: <FiBook /> },
            ],
          },
          {
            heading: "Resources",
            icon: "📚",
            items: [
              { name: "Shorts", to: "/shorts", icon: <FiZap /> },
              { name: "Videos", to: "/videos", icon: <FiVideo /> },
              { name: "Chat", to: "/chat", icon: <FiZap /> },
              { name: "Committees", to: "/committee", icon: <FiZap /> },
            ],
          },
        ],
      },
    ],
    []
  );

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="relative bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="flex items-center gap-3 py-2">
          <span className="shrink-0 ml-4 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-wide">
            ANNOUNCEMENTS
          </span>

          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-blue-900 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-blue-900 to-transparent" />

          <div className="relative flex-1 overflow-hidden">
            <div className="ticker-track">
              <div className="ticker-content">
                <span className="ticker-item">
                  Sunday Service • 10:00 AM • Worship • Word • Fellowship
                </span>
                <span className="ticker-sep">•</span>
                <span className="ticker-item">
                  Midweek Prayer • Wednesday • 6:00 PM • All are welcome
                </span>
                <span className="ticker-sep">•</span>
                <span className="ticker-item">
                  Youth Fellowship • Saturday • 4:00 PM • Grow in faith together
                </span>
                <span className="ticker-sep">•</span>
                <span className="ticker-item">
                  New Sermon & Daily Word available • Visit the website for updates
                </span>

                <span className="ticker-sep">•</span>
                <span className="ticker-item">
                  Sunday Service • 10:00 AM • Worship • Word • Fellowship
                </span>
                <span className="ticker-sep">•</span>
                <span className="ticker-item">
                  Midweek Prayer • Wednesday • 6:00 PM • All are welcome
                </span>
                <span className="ticker-sep">•</span>
                <span className="ticker-item">
                  Youth Fellowship • Saturday • 4:00 PM • Grow in faith together
                </span>
                <span className="ticker-sep">•</span>
                <span className="ticker-item">
                  New Sermon & Daily Word available • Visit the website for updates
                </span>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .ticker-track { width: 100%; overflow: hidden; }
          .ticker-content {
            display: inline-flex;
            align-items: center;
            gap: 14px;
            white-space: nowrap;
            will-change: transform;
            animation: tickerScroll 28s linear infinite;
          }
          .ticker-item {
            font-size: 0.9rem;
            line-height: 1.25rem;
            color: rgba(255, 255, 255, 0.92);
            letter-spacing: 0.01em;
          }
          .ticker-sep { opacity: 0.6; font-size: 0.95rem; }
          @keyframes tickerScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @media (prefers-reduced-motion: reduce) {
            .ticker-content { animation: none; }
          }
        `}</style>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-blue-200/10"
            style={{
              left: `${15 + i * 20}%`,
              top: `${10 + i * 15}%`,
              animation: `float-cross ${15 + i * 3}s infinite ease-in-out`,
              animationDelay: `${i * 2}s`,
              fontSize: "2rem",
            }}
          >
            ✝
          </div>
        ))}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-100/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-100/5 to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-300/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-yellow-300/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-blue-100/20">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group relative">
              <div className="absolute -inset-2 bg-blue-400/10 rounded-full blur-md group-hover:bg-blue-400/20 transition-all duration-500" />
              <div className="relative">
                <img
                  src={Logo}
                  alt="Groupe Protestant"
                  className="h-10 w-10 md:h-12 md:w-12 rounded-full ring-2 md:ring-4 ring-white/50 shadow-lg group-hover:ring-blue-200/70 transition-all duration-500"
                />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 md:h-4 md:w-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full ring-2 ring-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all duration-500">
                  Groupe Protestant
                </h1>
                <p className="text-xs text-gray-500 hidden sm:flex items-center gap-1">
                  <FiSun className="animate-spin-slow" /> Faith • Community • Hope{" "}
                  <FiStar className="animate-pulse" />
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-2 xl:gap-4">
              {menuItems.map((item) =>
                item.submenu ? (
                  <MegaMenu key={item.name} item={item} />
                ) : (
                  <NavLink key={item.name} to={item.to}>
                    {item.name}
                  </NavLink>
                )
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Desktop Auth */}
              <div className="hidden lg:flex items-center">
                {user ? <UserProfile user={user} logout={logout} /> : <AuthButtons />}
              </div>

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileMenuOpen((s) => !s)}
                className="lg:hidden p-2 rounded-lg hover:bg-blue-50/50 transition-all duration-300 group relative"
                aria-label="Toggle menu"
              >
                <div className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {mobileMenuOpen ? (
                  <FiX className="w-7 h-7 text-blue-700 relative z-10" />
                ) : (
                  <FiMenu className="w-7 h-7 text-blue-700 relative z-10" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-500 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-transparent backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          ref={mobileMenuRef}
          className={`absolute top-0 right-0 h-full w-full max-w-xs bg-gradient-to-b from-white to-blue-50/30 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } overflow-y-auto border-l border-white/20`}
        >
          <div className="p-5 flex flex-col h-full relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={Logo}
                    alt="Logo"
                    className="h-10 w-10 rounded-full ring-2 ring-blue-200/50"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400/70 rounded-full animate-pulse" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Groupe Protestant
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-blue-100/50 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-blue-700" />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {menuItems.map((item) =>
                item.submenu ? (
                  <CollapsibleMenuItem
                    key={item.name}
                    item={item}
                    onClose={() => setMobileMenuOpen(false)}
                  />
                ) : (
                  <Link
                    key={item.name}
                    to={item.to}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-lg hover:bg-white/70 hover:shadow-md transition-all duration-300 text-gray-800 font-medium border border-transparent hover:border-blue-200/50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon && <span className="text-blue-600 w-5">{item.icon}</span>}
                    <span>{item.name}</span>
                    <FiChevronRight className="ml-auto text-blue-400/50" />
                  </Link>
                )
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-blue-200/30">
              {user ? (
                <div className="space-y-3">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50/50 to-white/30 rounded-lg border border-blue-100/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        label={user.fullName || user.email}
                        src={absUrl(user.avatarUrl)}
                        size={42}
                        ring={false}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-blue-900 truncate">{user.fullName}</p>
                        <p className="text-sm text-blue-700/70 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 rounded-lg transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser className="w-5 h-5 text-blue-600" /> My Profile
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50/50 rounded-lg transition-all duration-300"
                  >
                    <FiLogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="py-3 text-center border border-blue-200 bg-white/50 backdrop-blur-sm rounded-lg font-medium hover:bg-blue-50/70 transition-all duration-300 hover:border-blue-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signin"
                    className="py-3 text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative">Join Now</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Optional Spacer (remove if you see extra blank space) */}
      <div className="h-16 md:h-20" />

      {/* Global small CSS helpers */}
      <style>{`
        @keyframes float-cross {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>
    </>
  );
};

// ────────────────────────────────────────────────
// Friendly Desktop Link
// ────────────────────────────────────────────────
function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group relative px-3 py-2 rounded-xl text-gray-700 hover:text-blue-700 transition-all duration-300 font-medium"
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 rounded-xl bg-blue-500/5 scale-0 group-hover:scale-100 transition-transform duration-300" />
      <span className="absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Link>
  );
}

// ────────────────────────────────────────────────
// Click Mega Menu (no hover; stable)
// ────────────────────────────────────────────────
function MegaMenu({ item }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0, width: 1100 });

  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const location = useLocation();

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  const computePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;

    const desiredWidth = Math.min(1150, vw - 32); // 16px gutters
    const half = desiredWidth / 2;
    const centerX = rect.left + rect.width / 2;

    const left = clamp(centerX - half, 16, vw - desiredWidth - 16);
    const top = rect.bottom + 10;

    setPos({ left, top, width: desiredWidth });
  };

  // close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // position + keep positioned on resize/scroll while open
  useEffect(() => {
    if (!open) return;

    computePosition();

    const onResize = () => computePosition();
    const onScroll = () => computePosition();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  // close on outside click (mouse + touch)
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      const t = e.target;
      const inTrigger = triggerRef.current?.contains(t);
      const inMenu = menuRef.current?.contains(t);
      if (!inTrigger && !inMenu) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="group relative px-3 py-2 rounded-xl text-gray-700 hover:text-blue-700 transition-all duration-300 font-medium flex items-center gap-1"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="relative z-10">{item.name}</span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        <span className="absolute inset-0 rounded-xl bg-blue-500/5 scale-0 group-hover:scale-100 transition-transform duration-300" />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="fixed z-[70] rounded-2xl shadow-2xl border border-white/20 overflow-hidden bg-white/95 backdrop-blur-xl"
          style={{ left: pos.left, top: pos.top, width: pos.width }}
          role="menu"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/25 via-transparent to-purple-50/20" />

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-blue-700 font-semibold">Explore Ministries</span>
                <span className="text-xs text-gray-500">Click outside or press Esc to close</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-blue-700/70 hover:text-blue-800 px-3 py-1 rounded-full hover:bg-blue-50 transition"
              >
                Close
              </button>
            </div>

            <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {item.submenu.map((section) => (
                <div
                  key={section.heading}
                  className="rounded-xl border border-blue-100/40 bg-white/60 backdrop-blur-sm p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{section.icon}</span>
                    <h4 className="font-semibold text-gray-900">{section.heading}</h4>
                  </div>

                  <ul className="space-y-2">
                    {section.items.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.to}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-blue-50/30 text-gray-700 transition-all duration-200 group/item"
                        >
                          <span className="text-blue-600 group-hover/item:scale-110 transition-transform">
                            {link.icon}
                          </span>
                          <span className="group-hover/item:text-blue-800 group-hover/item:translate-x-1 transition-all">
                            {link.name}
                          </span>
                          <FiChevronRight className="ml-auto text-blue-400/60 group-hover/item:text-blue-600 transition" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-5 text-xs text-gray-500">Tip: Click “Ministries” again to toggle.</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// Mobile Collapsible Menu
// ────────────────────────────────────────────────
function CollapsibleMenuItem({ item, onClose }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden border border-blue-100/50 bg-white/50 backdrop-blur-sm">
      <button
        onClick={() => setExpanded((s) => !s)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-blue-50/30 to-white/30 hover:from-blue-50/50 hover:to-white/50 text-left font-medium text-gray-800 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          {item.icon && <span className="text-blue-600 w-5">{item.icon}</span>}
          <span className="group-hover:text-blue-700 transition-colors">{item.name}</span>
        </div>
        {expanded ? <FiChevronUp className="text-blue-500" /> : <FiChevronDown className="text-blue-500" />}
      </button>

      {expanded && (
        <div className="bg-gradient-to-b from-white/70 to-blue-50/30 divide-y divide-blue-100/30">
          {item.submenu.map((section) => (
            <div key={section.heading} className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-blue-800/70">
                <span>{section.icon}</span>
                <span>{section.heading}</span>
              </div>
              <ul className="space-y-1 pl-1">
                {section.items.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-white/70 text-gray-700 text-sm transition-all duration-300 group/link"
                      onClick={onClose}
                    >
                      <span className="text-blue-600 w-5 group-hover/link:rotate-12 transition-transform">
                        {link.icon}
                      </span>
                      <span className="group-hover/link:text-blue-700 group-hover/link:translate-x-2 transition-all duration-300">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// User Profile Dropdown (now uses avatarUrl)
// ────────────────────────────────────────────────
function UserProfile({ user, logout }) {
  const [open, setOpen] = useState(false);

  const label = user?.fullName || user?.email || "User";
  const src = absUrl(user?.avatarUrl);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-3 focus:outline-none group relative"
      >
        <UserAvatar label={label} src={src} size={38} />

        <div className="hidden xl:block text-left">
          <p className="font-medium text-sm leading-tight">{user.fullName}</p>
          <p className="text-xs text-blue-600/70">Member</p>
        </div>

        <FiChevronDown className={`w-4 h-4 text-blue-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 py-2 z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-blue-100/30">
              <div className="flex items-center gap-3">
                <UserAvatar label={label} src={src} size={40} ring={false} />
                <div className="min-w-0">
                  <p className="font-medium text-blue-900 truncate">{user.fullName}</p>
                  <p className="text-sm text-blue-700/70 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            <Link
              to="/profile"
              className="flex items-center px-4 py-3 hover:bg-blue-50/50 transition-all duration-200"
              onClick={() => setOpen(false)}
            >
              <FiUser className="w-4 h-4 mr-3 text-blue-600" />
              My Profile
            </Link>

            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50/50 transition-all duration-200"
            >
              <FiLogOut className="w-4 h-4 mr-3 inline" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// Auth Buttons
// ────────────────────────────────────────────────
function AuthButtons() {
  return (
    <>
      <Link
        to="/login"
        className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium hover:bg-blue-50/50 rounded-lg transition-all duration-300"
      >
        Sign In
      </Link>
      <Link
        to="/signin"
        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-full hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-500 relative overflow-hidden group"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <span className="relative">Join Now</span>
      </Link>
    </>
  );
}

export default Header;