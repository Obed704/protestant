import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext.jsx";
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
  FiStar,
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const absUrl = (url) => {
  if (!url) return "";
  const s = String(url).trim();
  if (!s) return "";
  if (s.startsWith("http")) return s;
  const base = String(API_BASE_URL || "").replace(/\/+$/, "");
  return base ? `${base}${s.startsWith("/") ? s : `/${s}`}` : s;
};

const initialsOf = (nameOrEmail = "") => {
  const s = String(nameOrEmail || "").trim();
  if (!s) return "U";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

/* ─── Avatar ─── */
function UserAvatar({ label, src, size = 36 }) {
  const [broken, setBroken] = useState(false);
  return (
    <div
      className="gp-avatar"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
      }}
      title={label || ""}
    >
      {src && !broken ? (
        <img
          src={src}
          alt={label || "avatar"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="gp-avatar-initials">{initialsOf(label)}</div>
      )}
    </div>
  );
}

/* ─── Main Header ─── */
const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileRef = useRef(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const esc = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    // Add a small delay for animation to play
    setTimeout(() => {
      logout();
      navigate("/login");
    }, 300);
  };

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
              {
                name: "Sunday Service",
                to: "/sunday-service",
                icon: <FiBook />,
              },
              { name: "Daily Prayer", to: "/daily-word", icon: <FiUsers /> },
              { name: "Choir", to: "/choir", icon: <FiHeadphones /> },
              {
                name: "Upcoming Events",
                to: "/upcomingEvents",
                icon: <FiCalendar />,
              },
            ],
          },
          {
            heading: "Events",
            icon: "📅",
            items: [
              { name: "Bible Study", to: "/bible-study", icon: <FiBook /> },
              { name: "Baptism Program", to: "/baptism", icon: <FiGift /> },
              {
                name: "Upcoming Events",
                to: "/upcomingEvents",
                icon: <FiCalendar />,
              },
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
    [],
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --gp-navy: #0f1e3c;
          --gp-blue: #1a3a6b;
          --gp-sky: #3b7dd8;
          --gp-gold: #c9a84c;
          --gp-gold-light: #f0d080;
          --gp-glass: rgba(255,255,255,0.62);
          --gp-glass-border: rgba(255,255,255,0.45);
          --gp-glass-dark: rgba(15,30,60,0.08);
          --font-display: 'Cormorant Garamond', serif;
          --font-body: 'DM Sans', sans-serif;
        }

        /* ── Ticker ── */
        .gp-ticker-wrap { background: linear-gradient(90deg, var(--gp-navy) 0%, var(--gp-blue) 50%, var(--gp-navy) 100%); overflow: hidden; padding: 7px 0; position: relative; }
        .gp-ticker-wrap::before, .gp-ticker-wrap::after { content:''; position:absolute; top:0; width:80px; height:100%; z-index:2; pointer-events:none; }
        .gp-ticker-wrap::before { left:0; background: linear-gradient(to right, var(--gp-navy), transparent); }
        .gp-ticker-wrap::after { right:0; background: linear-gradient(to left, var(--gp-navy), transparent); }
        .gp-ticker-label { margin-left:16px; padding:2px 10px; border:1px solid rgba(201,168,76,0.4); border-radius:20px; font-family:var(--font-body); font-size:10px; font-weight:500; letter-spacing:0.12em; color:var(--gp-gold); text-transform:uppercase; flex-shrink:0; }
        .gp-ticker-inner { display:inline-flex; gap:24px; white-space:nowrap; animation: gp-ticker 32s linear infinite; will-change:transform; }
        .gp-ticker-item { font-family:var(--font-body); font-size:12px; color:rgba(255,255,255,0.8); letter-spacing:0.02em; }
        .gp-ticker-dot { color:var(--gp-gold); opacity:0.7; }
        @keyframes gp-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @media(prefers-reduced-motion:reduce){ .gp-ticker-inner{animation:none} }

        /* ── Header shell ── */
        .gp-header {
          position: sticky; top: 0; z-index: 50;
          font-family: var(--font-body);
          transition: all 0.4s ease;
        }
        .gp-header.scrolled .gp-header-inner {
          background: rgba(255,255,255,0.78);
          box-shadow: 0 8px 40px rgba(15,30,60,0.10), 0 1.5px 0 rgba(201,168,76,0.18);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
        }
        .gp-header-inner {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border-bottom: 1px solid var(--gp-glass-border);
          transition: all 0.4s ease;
        }
        .gp-header-content { max-width:1280px; margin:0 auto; padding:0 24px; display:flex; align-items:center; justify-content:space-between; height:68px; }

        /* ── Logo ── */
        .gp-logo { display:flex; align-items:center; gap:12px; text-decoration:none; }
        .gp-logo-img-wrap { position:relative; }
        .gp-logo-img { width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid rgba(201,168,76,0.5); box-shadow:0 2px 12px rgba(15,30,60,0.14); transition:border-color 0.3s; }
        .gp-logo:hover .gp-logo-img { border-color:var(--gp-gold); }
        .gp-logo-dot { position:absolute; bottom:0; right:0; width:11px; height:11px; background:radial-gradient(circle, #4ade80, #16a34a); border-radius:50%; border:2px solid white; }
        .gp-logo-text { line-height:1.1; }
        .gp-logo-title { font-family:var(--font-display); font-size:22px; font-weight:600; color:var(--gp-navy); letter-spacing:-0.01em; display:block; }
        .gp-logo-sub { font-size:10px; color:var(--gp-gold); letter-spacing:0.18em; text-transform:uppercase; font-weight:500; }

        /* ── Nav pill ── */
        .gp-nav { display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.5); border:1px solid var(--gp-glass-border); border-radius:40px; padding:4px; backdrop-filter:blur(12px); box-shadow:0 2px 16px rgba(15,30,60,0.07); }
        .gp-navlink { font-family:var(--font-body); font-size:14px; font-weight:400; color:#374151; padding:7px 16px; border-radius:36px; text-decoration:none; transition:all 0.25s; letter-spacing:0.01em; white-space:nowrap; border:1px solid transparent; }
        .gp-navlink:hover { background:rgba(255,255,255,0.9); color:var(--gp-navy); border-color:rgba(201,168,76,0.25); box-shadow:0 1px 8px rgba(15,30,60,0.08); }
        .gp-navlink.active { background:var(--gp-navy); color:white; }
        .gp-megabtn { display:flex; align-items:center; gap:5px; cursor:pointer; }
        .gp-megabtn svg.chevron { transition:transform 0.3s; }
        .gp-megabtn.open svg.chevron { transform:rotate(180deg); }

        /* ── Mega panel ── */
        .gp-mega-container {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 12px;
          z-index: 60;
        }
        .gp-mega {
          width: 780px;
          max-width: calc(100vw - 32px);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(15,30,60,0.18), 0 2px 0 rgba(201,168,76,0.15);
          border: 1px solid rgba(255,255,255,0.55);
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(28px) saturate(200%);
          -webkit-backdrop-filter: blur(28px) saturate(200%);
          animation: megaFadeIn 0.2s ease-out;
        }
        @keyframes megaFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .gp-mega-inner { padding: 28px; }
        .gp-mega-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; padding-bottom:14px; border-bottom:1px solid rgba(15,30,60,0.06); }
        .gp-mega-title { font-family:var(--font-display); font-size:18px; font-weight:600; color:var(--gp-navy); }
        .gp-mega-close { font-family:var(--font-body); font-size:12px; color:var(--gp-sky); background:rgba(59,125,216,0.08); border:none; border-radius:20px; padding:4px 12px; cursor:pointer; transition:background 0.2s; }
        .gp-mega-close:hover { background:rgba(59,125,216,0.15); }
        .gp-mega-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
        .gp-mega-section { background:rgba(255,255,255,0.7); border:1px solid rgba(201,168,76,0.12); border-radius:14px; padding:16px; transition: all 0.2s; }
        .gp-mega-section:hover { background: rgba(255,255,255,0.85); transform: translateY(-2px); }
        .gp-mega-section-head { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
        .gp-mega-section-icon { font-size:18px; }
        .gp-mega-section-title { font-family:var(--font-display); font-size:15px; font-weight:600; color:var(--gp-navy); }
        .gp-mega-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:2px; }
        .gp-mega-link { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:9px; color:#4b5563; font-size:13.5px; text-decoration:none; transition:all 0.2s; }
        .gp-mega-link:hover { background:rgba(59,125,216,0.07); color:var(--gp-navy); }
        .gp-mega-link:hover .gp-mega-link-icon { color:var(--gp-sky); transform:scale(1.15); }
        .gp-mega-link:hover .gp-mega-link-text { transform:translateX(2px); }
        .gp-mega-link-icon { color:#9ca3af; font-size:14px; transition:all 0.2s; flex-shrink:0; }
        .gp-mega-link-text { transition:transform 0.2s; }
        .gp-mega-link-arrow { margin-left:auto; color:#d1d5db; font-size:12px; opacity:0; transition:opacity 0.2s; }
        .gp-mega-link:hover .gp-mega-link-arrow { opacity:1; color:var(--gp-sky); }

        /* ── Auth ── */
        .gp-auth { display:flex; align-items:center; gap:8px; }
        .gp-btn-ghost { font-family:var(--font-body); font-size:13.5px; font-weight:400; color:#374151; padding:7px 14px; border-radius:9px; text-decoration:none; transition:all 0.2s; border:1px solid transparent; }
        .gp-btn-ghost:hover { background:rgba(255,255,255,0.8); border-color:rgba(15,30,60,0.1); color:var(--gp-navy); }
        .gp-btn-primary { font-family:var(--font-body); font-size:13.5px; font-weight:500; color:white; padding:8px 18px; border-radius:20px; text-decoration:none; background:var(--gp-navy); border:1px solid rgba(255,255,255,0.1); transition:all 0.25s; letter-spacing:0.02em; position:relative; overflow:hidden; }
        .gp-btn-primary::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg, rgba(201,168,76,0.25) 0%, transparent 60%); opacity:0; transition:opacity 0.3s; }
        .gp-btn-primary:hover { background:var(--gp-blue); box-shadow:0 4px 20px rgba(15,30,60,0.25); }
        .gp-btn-primary:hover::after { opacity:1; }

        /* ── User dropdown ── */
        .gp-user-btn { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.6); border:1px solid var(--gp-glass-border); border-radius:30px; padding:5px 12px 5px 5px; cursor:pointer; transition:all 0.25s; }
        .gp-user-btn:hover { background:rgba(255,255,255,0.85); box-shadow:0 2px 12px rgba(15,30,60,0.1); }
        .gp-user-name { font-size:13px; font-weight:500; color:var(--gp-navy); max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .gp-user-role { font-size:10.5px; color:var(--gp-gold); font-weight:400; letter-spacing:0.05em; }
        .gp-dropdown { position:absolute; right:0; top:calc(100% + 8px); width:220px; background:rgba(255,255,255,0.95); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.6); border-radius:16px; box-shadow:0 16px 48px rgba(15,30,60,0.14); overflow:hidden; padding:8px; z-index:60; }
        .gp-dropdown-profile { display:flex; align-items:center; gap:10px; padding:10px 12px; background:rgba(15,30,60,0.03); border-radius:11px; margin-bottom:6px; }
        .gp-dropdown-link { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:9px; text-decoration:none; font-size:13.5px; color:#374151; transition:background 0.2s; cursor:pointer; border:none; background:transparent; width:100%; text-align:left; }
        .gp-dropdown-link:hover { background:rgba(59,125,216,0.07); color:var(--gp-navy); }
        .gp-dropdown-link.danger:hover { background:rgba(220,38,38,0.06); color:#dc2626; }
        .gp-dropdown-divider { height:1px; background:rgba(15,30,60,0.06); margin:6px 0; }

        /* Logout animation */
        .logout-fade-out {
          animation: fadeOut 0.3s ease forwards;
        }
        @keyframes fadeOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.96); }
        }

        /* ── Avatar ── */
        .gp-avatar { background:#e5e7eb; }
        .gp-avatar-initials { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, var(--gp-navy) 0%, var(--gp-blue) 100%); color:white; font-family:var(--font-body); font-size:13px; font-weight:500; }

        /* ── Mobile toggle ── */
        .gp-mobile-btn { display:flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:10px; background:rgba(255,255,255,0.6); border:1px solid var(--gp-glass-border); cursor:pointer; transition:all 0.2s; color:var(--gp-navy); }
        .gp-mobile-btn:hover { background:rgba(255,255,255,0.9); }

        /* ── Mobile drawer ── */
        .gp-drawer-overlay { position:fixed; inset:0; background:rgba(15,30,60,0.25); backdrop-filter:blur(4px); z-index:70; transition:opacity 0.35s; }
        .gp-drawer { position:fixed; top:0; left:0; bottom:0; width:min(320px, 90vw); background:rgba(255,255,255,0.94); backdrop-filter:blur(24px); border-right:1px solid rgba(255,255,255,0.5); box-shadow:24px 0 80px rgba(15,30,60,0.16); z-index:71; overflow-y:auto; transform:translateX(-100%); transition:transform 0.4s cubic-bezier(0.32,0.72,0,1); }
        .gp-drawer.open { transform:translateX(0); }
        .gp-drawer-head { display:flex; align-items:center; justify-content:space-between; padding:20px 20px 16px; border-bottom:1px solid rgba(15,30,60,0.06); }
        .gp-drawer-logo { display:flex; align-items:center; gap:10px; }
        .gp-drawer-logo-text { font-family:var(--font-display); font-size:18px; font-weight:600; color:var(--gp-navy); }
        .gp-drawer-close { width:34px; height:34px; border-radius:8px; background:rgba(15,30,60,0.05); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--gp-navy); transition:background 0.2s; }
        .gp-drawer-close:hover { background:rgba(15,30,60,0.1); }
        .gp-drawer-nav { padding:12px; }
        .gp-drawer-link { display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:11px; text-decoration:none; font-size:14px; color:#374151; transition:all 0.2s; font-family:var(--font-body); font-weight:400; }
        .gp-drawer-link:hover { background:rgba(59,125,216,0.07); color:var(--gp-navy); }
        .gp-drawer-section-btn { width:100%; display:flex; align-items:center; justify-content:space-between; padding:11px 14px; border-radius:11px; background:transparent; border:none; cursor:pointer; font-size:14px; color:#374151; transition:all 0.2s; font-family:var(--font-body); text-align:left; }
        .gp-drawer-section-btn:hover { background:rgba(59,125,216,0.07); color:var(--gp-navy); }
        .gp-drawer-subsection { padding:6px 6px 6px 12px; }
        .gp-drawer-sub-head { font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--gp-gold); font-weight:500; padding:6px 8px 4px; font-family:var(--font-body); }
        .gp-drawer-sublink { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; text-decoration:none; font-size:13.5px; color:#4b5563; transition:all 0.2s; }
        .gp-drawer-sublink:hover { background:rgba(59,125,216,0.07); color:var(--gp-navy); }
        .gp-drawer-foot { padding:16px; border-top:1px solid rgba(15,30,60,0.06); }
        .gp-drawer-user { display:flex; align-items:center; gap:10px; padding:12px; background:rgba(15,30,60,0.03); border-radius:12px; margin-bottom:10px; }
        .gp-drawer-auth { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .gp-drawer-auth-ghost { text-align:center; padding:10px; border:1px solid rgba(15,30,60,0.12); border-radius:10px; text-decoration:none; font-size:13.5px; color:var(--gp-navy); font-family:var(--font-body); transition:background 0.2s; }
        .gp-drawer-auth-ghost:hover { background:rgba(15,30,60,0.04); }
        .gp-drawer-auth-fill { text-align:center; padding:10px; background:var(--gp-navy); border-radius:10px; text-decoration:none; font-size:13.5px; color:white; font-family:var(--font-body); transition:background 0.2s; }
        .gp-drawer-auth-fill:hover { background:var(--gp-blue); }

        /* ── Gold accent line ── */
        .gp-gold-line { height:2px; background:linear-gradient(90deg, transparent 0%, var(--gp-gold) 30%, var(--gp-gold-light) 50%, var(--gp-gold) 70%, transparent 100%); opacity:0.6; }

        /* ── Spacer ── */
       .gp-spacer { 
  height: 68px;
  background: rgba(15,30,60,0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(201,168,76,0.15);
}
      `}</style>

      {/* Announcement ticker */}
      <div className="gp-ticker-wrap">
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="gp-ticker-label">Live</span>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div className="gp-ticker-inner">
              {[
                "Sunday Service · 10:00 AM · Worship · Word · Fellowship",
                "Midweek Prayer · Wednesday · 6:00 PM · All are welcome",
                "Youth Fellowship · Saturday · 4:00 PM · Grow in faith together",
                "New Sermon & Daily Word available · Visit the website for updates",
                "Sunday Service · 10:00 AM · Worship · Word · Fellowship",
                "Midweek Prayer · Wednesday · 6:00 PM · All are welcome",
                "Youth Fellowship · Saturday · 4:00 PM · Grow in faith together",
                "New Sermon & Daily Word available · Visit the website for updates",
              ].map((item, i, arr) => (
                <React.Fragment key={i}>
                  <span className="gp-ticker-item">{item}</span>
                  {i < arr.length - 1 && (
                    <span className="gp-ticker-dot">✦</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`gp-header${scrolled ? " scrolled" : ""}`}>
        <div className="gp-header-inner">
          <div className="gp-gold-line" />
          <div className="gp-header-content">
            {/* Logo */}
            <Link to="/" className="gp-logo">
              <div className="gp-logo-img-wrap">
                <img
                  src={Logo}
                  alt="Groupe Protestant"
                  className="gp-logo-img"
                />
                <span className="gp-logo-dot" />
              </div>
              <div className="gp-logo-text">
                <span className="gp-logo-title">Groupe Protestant</span>
                <span className="gp-logo-sub">Faith · Community · Hope</span>
              </div>
            </Link>

            {/* Desktop nav pill */}
            <nav
              className="gp-nav"
              style={{ display: "none" }}
              id="gp-desktop-nav"
            >
              {menuItems.map((item) =>
                item.submenu ? (
                  <MegaMenu key={item.name} item={item} />
                ) : (
                  <Link key={item.name} to={item.to} className="gp-navlink">
                    {item.name}
                  </Link>
                ),
              )}
            </nav>

            {/* Right */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div id="gp-desktop-auth" style={{ display: "none" }}>
                {user ? (
                  <UserProfile
                    user={user}
                    onLogout={handleLogout}
                    isLoggingOut={isLoggingOut}
                  />
                ) : (
                  <AuthButtons />
                )}
              </div>
              <MobileToggle open={false} onClick={() => setMobileOpen(true)} />
            </div>
          </div>
        </div>
      </header>

      {/* Responsive show/hide via style tag */}
      <style>{`
        @media(min-width:1024px){
          #gp-desktop-nav { display:flex !important; }
          #gp-desktop-auth { display:flex !important; }
          .gp-mobile-btn { display:none !important; }
        }
      `}</style>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="gp-drawer-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div ref={mobileRef} className={`gp-drawer${mobileOpen ? " open" : ""}`}>
        <div className="gp-drawer-head">
          <div className="gp-drawer-logo">
            <img
              src={Logo}
              alt=""
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1.5px solid rgba(201,168,76,0.4)",
              }}
            />
            <span className="gp-drawer-logo-text">Groupe Protestant</span>
          </div>
          <button
            className="gp-drawer-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <FiX size={18} />
          </button>
        </div>

        <nav className="gp-drawer-nav">
          {menuItems.map((item) =>
            item.submenu ? (
              <DrawerSubMenu
                key={item.name}
                item={item}
                onClose={() => setMobileOpen(false)}
              />
            ) : (
              <Link
                key={item.name}
                to={item.to}
                className="gp-drawer-link"
                onClick={() => setMobileOpen(false)}
              >
                <span style={{ color: "var(--gp-sky)", display: "flex" }}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ),
          )}
        </nav>

        <div className="gp-drawer-foot">
          {user ? (
            <>
              <div className="gp-drawer-user">
                <UserAvatar
                  label={user.fullName || user.email}
                  src={absUrl(user.avatarUrl)}
                  size={40}
                />
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--gp-navy)",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.fullName}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 11,
                      color: "#6b7280",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
              <Link
                to="/profile"
                className="gp-drawer-link"
                style={{ marginBottom: 2 }}
                onClick={() => setMobileOpen(false)}
              >
                <FiUser size={15} style={{ color: "var(--gp-sky)" }} /> My
                Profile
              </Link>
              <button
                className={`gp-drawer-link danger ${isLoggingOut ? "logout-fade-out" : ""}`}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#dc2626",
                }}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  "Logging out..."
                ) : (
                  <>
                    <FiLogOut size={15} /> Logout
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="gp-drawer-auth">
              <Link
                to="/login"
                className="gp-drawer-auth-ghost"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signin"
                className="gp-drawer-auth-fill"
                onClick={() => setMobileOpen(false)}
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="gp-spacer" />
    </>
  );
};

/* ─── Mobile Toggle Button ─── */
function MobileToggle({ open, onClick }) {
  return (
    <button className="gp-mobile-btn" onClick={onClick} aria-label="Open menu">
      <FiMenu size={20} />
    </button>
  );
}

/* ─── Desktop Mega Menu (Simplified with perfect centering) ─── */
function MegaMenu({ item }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const location = useLocation();

  // Close menu on location change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on escape key
  useEffect(() => {
    if (!open) return;
    const esc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`gp-navlink gp-megabtn${open ? " open" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        {item.name}
        <FiChevronDown
          size={14}
          className="chevron"
          style={{
            transition: "transform 0.3s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div className="gp-mega-container" ref={menuRef}>
          <div className="gp-mega">
            <div className="gp-mega-inner">
              <div className="gp-mega-header">
                <span className="gp-mega-title">✨ Explore Ministries</span>
                <button
                  className="gp-mega-close"
                  onClick={() => setOpen(false)}
                >
                  Close ✕
                </button>
              </div>
              <div className="gp-mega-grid">
                {item.submenu.map((section) => (
                  <div key={section.heading} className="gp-mega-section">
                    <div className="gp-mega-section-head">
                      <span className="gp-mega-section-icon">
                        {section.icon}
                      </span>
                      <span className="gp-mega-section-title">
                        {section.heading}
                      </span>
                    </div>
                    <ul className="gp-mega-list">
                      {section.items.map((link) => (
                        <li key={link.name}>
                          <Link
                            to={link.to}
                            className="gp-mega-link"
                            onClick={() => setOpen(false)}
                          >
                            <span className="gp-mega-link-icon">
                              {link.icon}
                            </span>
                            <span className="gp-mega-link-text">
                              {link.name}
                            </span>
                            <FiChevronRight
                              size={12}
                              className="gp-mega-link-arrow"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Mobile Sub Menu ─── */
function DrawerSubMenu({ item, onClose }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="gp-drawer-section-btn"
        onClick={() => setOpen((s) => !s)}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "var(--gp-sky)", display: "flex" }}>
            {item.icon}
          </span>
          {item.name}
        </span>
        <FiChevronDown
          size={15}
          style={{
            color: "var(--gp-sky)",
            transition: "transform 0.3s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {open && (
        <div className="gp-drawer-subsection">
          {item.submenu.map((section) => (
            <div key={section.heading} style={{ marginBottom: 10 }}>
              <div className="gp-drawer-sub-head">
                {section.icon} {section.heading}
              </div>
              {section.items.map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  className="gp-drawer-sublink"
                  onClick={onClose}
                >
                  <span
                    style={{
                      color: "var(--gp-sky)",
                      display: "flex",
                      fontSize: 13,
                    }}
                  >
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── User Profile Dropdown with animated logout ─── */
function UserProfile({ user, onLogout, isLoggingOut }) {
  const [open, setOpen] = useState(false);
  const label = user?.fullName || user?.email || "User";
  const src = absUrl(user?.avatarUrl);

  return (
    <div style={{ position: "relative" }}>
      <button className="gp-user-btn" onClick={() => setOpen((s) => !s)}>
        <UserAvatar label={label} src={src} size={30} />
        <div style={{ lineHeight: 1.2 }}>
          <div className="gp-user-name">{user.fullName}</div>
          <div className="gp-user-role">Member</div>
        </div>
        <FiChevronDown
          size={13}
          style={{
            color: "var(--gp-navy)",
            marginLeft: 2,
            transition: "transform 0.3s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            opacity: 0.6,
          }}
        />
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 55 }}
            onClick={() => setOpen(false)}
          />
          <div className="gp-dropdown">
            <div className="gp-dropdown-profile">
              <UserAvatar label={label} src={src} size={38} />
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: 13,
                    color: "var(--gp-navy)",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.fullName}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    color: "#6b7280",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.email}
                </p>
              </div>
            </div>
            <div className="gp-dropdown-divider" />
            <Link
              to="/profile"
              className="gp-dropdown-link"
              onClick={() => setOpen(false)}
            >
              <FiUser size={14} style={{ color: "var(--gp-sky)" }} /> My Profile
            </Link>
            <div className="gp-dropdown-divider" />
            <button
              className={`gp-dropdown-link danger ${isLoggingOut ? "logout-fade-out" : ""}`}
              style={{ color: "#dc2626" }}
              onClick={onLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                "Logging out..."
              ) : (
                <>
                  <FiLogOut size={14} /> Logout
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Auth Buttons ─── */
function AuthButtons() {
  return (
    <div className="gp-auth">
      <Link to="/login" className="gp-btn-ghost">
        Sign In
      </Link>
      <Link to="/signin" className="gp-btn-primary">
        Join Now
      </Link>
    </div>
  );
}

export default Header;
