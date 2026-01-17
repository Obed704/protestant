import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Header = ({ fixed = true }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch navbar settings from backend
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/navbar`)
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!settings) return null;

  // Logo served from backend/public/logo
  const logoSrc = `${BACKEND_URL}/logo/${settings.logoImage}`;

  return (
    <nav
      className={`${
        fixed ? "fixed" : "absolute"
      } top-0 left-0 w-full bg-black/60 backdrop-blur-md z-50 px-8 py-3 flex justify-between items-center transition-all duration-300`}
    >
      {/* ================= LOGO ================= */}
      <Link
        to="/"
        className="flex flex-col items-center justify-center leading-none transition-transform duration-300 hover:scale-105"
      >
        <img
          src={logoSrc}
          alt="STEM Inspires Logo"
          className="h-10 w-14 object-contain -mt-4"
          onError={(e) => {
            e.target.src = "/logo/default-logo.png";
          }}
        />

        {settings.logoMode === "logo-with-text" && (
          <div className="text-center leading-[1] -mt-[8px]">
            <span className=" text-sm font-bold text-[rgb(247,244,46)]">
              STEM
            </span>
            <span className=" text-xs font-medium text-[rgb(23,207,220)]">
              Inspires
            </span>
          </div>
        )}
      </Link>

      {/* ================= DESKTOP LINKS ================= */}
      <div className="hidden lg:flex gap-6 items-center">
        {settings.links.map(({ name, link }) => (
          <Link
            key={name}
            to={link}
            className={`relative group pb-2 transition-colors duration-300 ${settings.textColor}`}
          >
            {name}
            <span
              className="absolute bottom-0 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full"
              style={{ backgroundColor: settings.hoverColor }}
            />
          </Link>
        ))}
      </div>

      {/* ================= HAMBURGER ================= */}
      <div
        className="lg:hidden flex flex-col gap-1 cursor-pointer z-50"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className="w-6 h-0.5 bg-white" />
        <span className="w-6 h-0.5 bg-white" />
        <span className="w-6 h-0.5 bg-white" />
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-black/95 flex flex-col items-center justify-center gap-8 text-2xl lg:hidden transition-transform duration-300 ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {settings.links.map(({ name, link }) => (
          <Link
            key={name}
            to={link}
            onClick={() => setMenuOpen(false)}
            className={`relative group transition ${settings.textColor}`}
          >
            {name}
            <span
              className="absolute bottom-0 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full"
              style={{ backgroundColor: settings.hoverColor }}
            />
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Header;
