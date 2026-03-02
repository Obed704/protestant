import React, { useState, useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../src/context/authContext.jsx";
import Logo from "../assets/img/logo.jpg";
import {
  FiVideo, FiZap, FiBook, FiUsers, FiMenu, FiX, FiHeadphones,
  FiCalendar, FiGift, FiChevronDown, FiHome, FiUser, FiLogOut,
  FiChevronRight, FiChevronUp, FiSun, FiStar
} from "react-icons/fi";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  const menuItems = [
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
          ]
        },
        {
          heading: "Events",
          icon: "📅",
          items: [
            { name: "Bible Study", to: "/bible-study", icon: <FiBook /> },
            { name: "Baptism Program", to: "/baptism", icon: <FiGift /> },
            { name: "Upcoming Events", to: "/upcomingEvents", icon: <FiCalendar /> },
            { name: "Week Theme", to: "/weeks", icon: <FiBook /> },
          ]
        },
        {
          heading: "Resources",
          icon: "📚",
          items: [
            { name: "Shorts", to: "/shorts", icon: <FiZap /> },
            { name: "Videos", to: "/videos", icon: <FiVideo /> },
          ]
        },
      ]
    },
    // { name: "About", to: "/about" },
    // { name: "Contact", to: "/contact" },
  ];

  return (
    <>
      {/* Top Announcement Bar with subtle glow */}
      <div className="relative bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white overflow-hidden">
  {/* Ticker */}
  <div className="flex items-center gap-3 py-2">
    {/* Small label (professional, minimal) */}
    <span className="shrink-0 ml-4 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-wide">
      ANNOUNCEMENTS
    </span>

    {/* Fade edges */}
    <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-blue-900 to-transparent" />
    <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-blue-900 to-transparent" />

    {/* Moving content */}
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

          {/* Duplicate for seamless loop */}
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

  {/* Subtle rays (kept but lighter) */}
  <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
    <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent animate-ray-vertical" />
    <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent animate-ray-horizontal" />
    <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent animate-ray-vertical delay-1000" />
  </div>

  <style>{`
    /* Smooth TV-style ticker */
    .ticker-track {
      width: 100%;
      overflow: hidden;
    }
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
    .ticker-sep {
      opacity: 0.6;
      font-size: 0.95rem;
    }

    /* The trick: move left by 50% because we duplicated the content */
    @keyframes tickerScroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    @keyframes ray-vertical {
      0%, 100% { opacity: 0.15; transform: translateY(-100%); }
      50% { opacity: 0.35; }
      100% { opacity: 0.15; transform: translateY(100%); }
    }
    @keyframes ray-horizontal {
      0%, 100% { opacity: 0.12; transform: translateX(-100%); }
      50% { opacity: 0.30; }
      100% { opacity: 0.12; transform: translateX(100%); }
    }

    .animate-ray-vertical { animation: ray-vertical 4s ease-in-out infinite; }
    .animate-ray-horizontal { animation: ray-horizontal 5s ease-in-out infinite; }
    .delay-1000 { animation-delay: 1s; }

    /* Respect reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .ticker-content { animation: none; }
      .animate-ray-vertical, .animate-ray-horizontal { animation: none; }
    }
  `}</style>
</div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Floating crosses */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-blue-200/10"
            style={{
              left: `${15 + i * 20}%`,
              top: `${10 + i * 15}%`,
              animation: `float-cross ${15 + i * 3}s infinite ease-in-out`,
              animationDelay: `${i * 2}s`,
              fontSize: '2rem'
            }}
          >
            ✝
          </div>
        ))}
        
        {/* Gentle light beams */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-100/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-100/5 to-transparent"></div>
        
        {/* Subtle glowing orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-300/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-yellow-300/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Header with glass effect */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-blue-100/20">
        {/* Animated border glow */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Floating particles around logo */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400/20 rounded-full animate-bounce"></div>
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400/20 rounded-full animate-bounce animation-delay-300"></div>
          
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo with glow effect */}
            <Link to="/" className="flex items-center space-x-3 group relative">
              {/* Glow effect */}
              <div className="absolute -inset-2 bg-blue-400/10 rounded-full blur-md group-hover:bg-blue-400/20 transition-all duration-500"></div>
              
              <div className="relative">
                <img
                  src={Logo}
                  alt="Groupe Protestant"
                  className="h-10 w-10 md:h-12 md:w-12 rounded-full ring-2 md:ring-4 ring-white/50 shadow-lg group-hover:ring-blue-200/70 transition-all duration-500"
                />
                {/* Animated status indicator */}
                <div className="absolute -bottom-1 -right-1 h-3 w-3 md:h-4 md:w-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full ring-2 ring-white animate-pulse"></div>
                
                {/* Tiny floating particles */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400/40 rounded-full animate-ping animation-delay-700"></div>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all duration-500">
                  Groupe Protestant
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block flex items-center gap-1">
                  <FiSun className="animate-spin-slow" /> Faith • Community • Hope <FiStar className="animate-pulse" />
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {menuItems.map((item) =>
                item.submenu ? (
                  <MegaMenu key={item.name} item={item} />
                ) : (
                  <Link
                    key={item.name}
                    to={item.to}
                    className="group relative py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium"
                  >
                    <span className="relative z-10">{item.name}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 group-hover:w-full transition-all duration-500"></span>
                    {/* Subtle glow on hover */}
                    <span className="absolute inset-0 bg-blue-500/5 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  </Link>
                )
              )}
            </nav>

            {/* Auth + Mobile toggle */}
            <div className="flex items-center space-x-4">
              {/* Desktop Auth */}
              <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
                {user ? <UserProfile user={user} logout={logout} /> : <AuthButtons />}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-blue-50/50 transition-all duration-300 group relative"
                aria-label="Toggle menu"
              >
                {/* Button glow */}
                <div className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

      {/* Mobile Menu Drawer with worship theme */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-500 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Animated background overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-transparent backdrop-blur-sm transition-all duration-500"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Floating elements in overlay */}
          <div className="absolute top-10 left-10 text-3xl text-white/10 animate-float">✝</div>
          <div className="absolute bottom-10 right-10 text-2xl text-white/10 animate-float animation-delay-1000">✟</div>
        </div>

        <div
          ref={mobileMenuRef}
          className={`absolute top-0 right-0 h-full w-full max-w-xs bg-gradient-to-b from-white to-blue-50/30 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } overflow-y-auto border-l border-white/20`}
        >
          {/* Side glow effect */}
          <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-400/30 via-blue-300/20 to-transparent"></div>
          
          <div className="p-5 flex flex-col h-full relative">
            {/* Header inside menu */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img src={Logo} alt="Logo" className="h-10 w-10 rounded-full ring-2 ring-blue-200/50" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400/70 rounded-full animate-pulse"></div>
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

            {/* Menu Items */}
            <nav className="flex-1 space-y-2">
              {menuItems.map((item) =>
                item.submenu ? (
                  <CollapsibleMenuItem key={item.name} item={item} onClose={() => setMobileMenuOpen(false)} />
                ) : (
                  <Link
                    key={item.name}
                    to={item.to}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-lg hover:bg-white/70 hover:shadow-md transition-all duration-300 text-gray-800 font-medium border border-transparent hover:border-blue-200/50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon && <span className="text-blue-600 w-5 animate-pulse">{item.icon}</span>}
                    <span>{item.name}</span>
                    <FiChevronRight className="ml-auto text-blue-400/50" />
                  </Link>
                )
              )}
            </nav>

            {/* Mobile Auth */}
            <div className="mt-auto pt-6 border-t border-blue-200/30">
              {user ? (
                <div className="space-y-3">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50/50 to-white/30 rounded-lg border border-blue-100/50 backdrop-blur-sm">
                    <p className="font-medium text-blue-900">{user.fullName}</p>
                    <p className="text-sm text-blue-700/70 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 rounded-lg transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser className="w-5 h-5 text-blue-600" /> My Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
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
                    {/* Button shine effect */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                    <span className="relative">Join Now</span>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Decorative corner element */}
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-400/5 to-transparent rounded-tl-full"></div>
          </div>
        </div>
      </div>

      {/* Spacer for sticky header */}
      <div className="h-16 md:h-20" />

      {/* Add CSS animations */}
      <style>{`
        @keyframes float-cross {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        
        @keyframes ray-vertical {
          0%, 100% { opacity: 0.1; transform: translateY(-100%); }
          50% { opacity: 0.3; }
          100% { opacity: 0.1; transform: translateY(100%); }
        }
        
        @keyframes ray-horizontal {
          0%, 100% { opacity: 0.1; transform: translateX(-100%); }
          50% { opacity: 0.3; }
          100% { opacity: 0.1; transform: translateX(100%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-ray-vertical {
          animation: ray-vertical 3s ease-in-out infinite;
        }
        
        .animate-ray-horizontal {
          animation: ray-horizontal 4s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-700 {
          animation-delay: 700ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
      `}</style>
    </>
  );
};

// ────────────────────────────────────────────────
// Reusable Components
// ────────────────────────────────────────────────

function MegaMenu({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        className="group flex items-center gap-1 py-2 text-gray-700 hover:text-blue-600 font-medium relative"
      >
        <span className="relative z-10">{item.name}</span>
        <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""} relative z-10`} />
        {/* Hover glow */}
        <div className="absolute inset-0 bg-blue-500/5 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-screen max-w-5xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
          onMouseLeave={() => setOpen(false)}
        >
          {/* Mega menu glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20"></div>
          
          <div className="p-6 grid grid-cols-3 gap-6 relative z-10">
            {item.submenu.map((section) => (
              <div key={section.heading} className="group">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl animate-pulse">{section.icon}</span>
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                    {section.heading}
                  </h4>
                </div>
                <ul className="space-y-2">
                  {section.items.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.to}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-50/30 text-gray-700 transition-all duration-300 group/item"
                      >
                        <span className="text-blue-600 group-hover/item:scale-110 transition-transform duration-300">
                          {link.icon}
                        </span>
                        <span className="group-hover/item:text-blue-700 group-hover/item:translate-x-1 transition-all duration-300">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CollapsibleMenuItem({ item, onClose }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden border border-blue-100/50 bg-white/50 backdrop-blur-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-blue-50/30 to-white/30 hover:from-blue-50/50 hover:to-white/50 text-left font-medium text-gray-800 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          {item.icon && <span className="text-blue-600 w-5 group-hover:animate-pulse">{item.icon}</span>}
          <span className="group-hover:text-blue-700 transition-colors">{item.name}</span>
        </div>
        {expanded ? 
          <FiChevronUp className="text-blue-500 group-hover:scale-110 transition-transform" /> : 
          <FiChevronDown className="text-blue-500 group-hover:scale-110 transition-transform" />
        }
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

function UserProfile({ user, logout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 focus:outline-none group relative"
      >
        {/* Profile glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/10 to-blue-600/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold shadow-lg group-hover:shadow-blue-500/30 transition-all duration-500 relative">
          {user.fullName?.charAt(0)?.toUpperCase()}
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-300/30 animate-ping"></div>
        </div>
        <div className="hidden xl:block text-left">
          <p className="font-medium text-sm leading-tight">{user.fullName}</p>
          <p className="text-xs text-blue-600/70">Member</p>
        </div>
        <FiChevronDown className={`w-4 h-4 text-blue-500 transition-transform duration-300 ${open ? "rotate-180" : ""} relative z-10`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 py-2 z-40 overflow-hidden">
            {/* Menu background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20"></div>
            
            <div className="px-4 py-3 border-b border-blue-100/30 relative z-10">
              <p className="font-medium text-blue-900">{user.fullName}</p>
              <p className="text-sm text-blue-700/70 truncate">{user.email}</p>
            </div>
            <Link 
              to="/profile" 
              className="flex items-center px-4 py-3 hover:bg-blue-50/50 transition-all duration-300 relative z-10 group"
              onClick={() => setOpen(false)}
            >
              <FiUser className="w-4 h-4 mr-3 text-blue-600 group-hover:scale-110 transition-transform" /> 
              <span className="group-hover:text-blue-700">My Profile</span>
            </Link>
            <button 
              onClick={() => { logout(); setOpen(false); }} 
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50/50 transition-all duration-300 relative z-10 group"
            >
              <FiLogOut className="w-4 h-4 mr-3 inline group-hover:scale-110 transition-transform" /> 
              <span className="group-hover:text-red-700">Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

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
        {/* Shine effect */}
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
        <span className="relative">Join Now</span>
      </Link>
    </>
  );
}

export default Header;