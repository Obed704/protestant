import React, { useState, useContext, useEffect } from "react";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaPray,
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaUserCircle,
  FaInfoCircle,
  FaLink,
  FaArrowRight,
  FaClock,
  FaChevronRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/authContext.jsx";
import Confetti from "react-confetti";

const API_BASE_URL = import.meta.env.VITE_API_URL; // make sure .env uses VITE_API_URL
const HOLIDAY_API = `${API_BASE_URL}/api/holiday`;

const HolidayConnect = () => {
  const { user, token } = useContext(AuthContext);

  const [settings, setSettings] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(""); // store ONLY the 9 digits (without +250)
  const [hovered, setHovered] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [activeTab, setActiveTab] = useState("join");
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch settings from admin
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${HOLIDAY_API}/settings`);
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch holiday settings", err);
      }
    };
    fetchSettings();
  }, []);

  // Fetch participant count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`${HOLIDAY_API}/count`);
        const data = await res.json();
        setParticipants(data.count);
      } catch (err) {
        console.error("Failed to fetch participant count", err);
      }
    };
    fetchCount();
  }, []);

  // Update window size for confetti
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Join holiday prayer
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return alert("Please log in to join holiday prayers.");
    if (!name.trim() || !phone.trim()) return alert("Please fill in both fields!");

    // Optional: Rwanda sanity check (9 digits, often starts with 7)
    if (phone.length !== 9) return alert("Enter a valid Rwanda WhatsApp number (9 digits).");

    setIsSubmitting(true);

    try {
      const res = await fetch(`${HOLIDAY_API}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Send the full international number to backend
        body: JSON.stringify({ name, phone: `+250${phone}` }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to join");

      setShowSuccess(true);
      setShowConfetti(true);
      setParticipants((prev) => prev + 1);

      setTimeout(() => {
        setShowSuccess(false);
        setShowConfetti(false);
        setName("");
        setPhone("");
      }, 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!settings) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 w-full max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-700 rounded w-1/2"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-40 bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default social links if not provided
  const defaultSocialLinks = [
    {
      icon: FaEnvelope,
      label: "Email",
      href: "mailto:support@church.org",
      color: "bg-gradient-to-r from-red-500 to-pink-600",
    },
    {
      icon: FaPhone,
      label: "Call",
      href: "tel:+250123456789",
      color: "bg-gradient-to-r from-blue-500 to-cyan-600",
    },
    {
      icon: FaWhatsapp,
      label: "WhatsApp",
      href: "https://wa.me/250123456789",
      color: "bg-gradient-to-r from-green-500 to-emerald-600",
    },
  ];

  const socialLinks =
    settings.socialLinks?.length > 0 ? settings.socialLinks : defaultSocialLinks;

  // Compact animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "tween", duration: 0.2 },
    },
  };

  return (
    <section className="relative py-4 md:py-6 overflow-hidden">
      {/* Success Modal */}
      {showSuccess && (
        <>
          {showConfetti && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={100}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                pointerEvents: "none",
                zIndex: 50,
              }}
            />
          )}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-2xl text-center max-w-sm mx-4 pointer-events-auto"
            >
              <FaCheckCircle className="text-4xl mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Joined Successfully!</h3>
              <p className="text-sm">
                {settings.successMessage ||
                  "You're now part of our holiday prayer community!"}
              </p>
            </motion.div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="container mx-auto px-2 sm:px-4 py-4 md:py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 md:mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full mb-3 text-sm">
              <FaCalendarAlt className="text-sm" />
              <span className="font-medium">{settings.season}</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent leading-tight">
              {settings.title}
            </h1>
            <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed px-2">
              {settings.description}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {/* Left Column */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col"
            >
              <div className="space-y-4 flex-1">
                {/* Main Info Card */}
                <motion.div variants={itemVariants} className="flex-1">
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-700/50 h-full">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                        <FaPray className="text-lg" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg md:text-xl font-bold mb-1">
                          {settings.spiritualTitle || "Spiritual Growth Together"}
                        </h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {settings.spiritualDescription ||
                            "Strengthen your faith through collective prayer and fellowship."}
                        </p>
                      </div>
                    </div>

                    {/* Participant Stats */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium">
                            {settings.liveSessionText || "Live Session"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-400">
                          <FaClock size={10} />
                          <span>{settings.startsIn || "2 days"}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-1">
                          {participants.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                          <FaUsers size={12} />
                          <span>{settings.participantsLabel || "Participants"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bible Verse */}
                    <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 border-l-2 border-amber-500 pl-3 pr-2 py-2 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="text-xl text-amber-500/50">"</div>
                        <div className="flex-1">
                          <p className="text-sm italic text-amber-100 leading-relaxed mb-1 line-clamp-2">
                            "
                            {settings.bibleVerse?.text ||
                              "The Lord is my shepherd; I shall not want."}
                            "
                          </p>
                          <p className="text-xs text-amber-300 font-medium">
                            – {settings.bibleVerse?.reference || "Psalm 23:1"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Social Links */}
                {/* <motion.div variants={itemVariants}>
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <FaLink size={14} className="text-blue-400" />
                      <h3 className="text-sm font-semibold">
                        {settings.connectTitle || "Quick Connect"}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {socialLinks.map((social, index) => {
                        const Icon = social.icon || FaEnvelope;
                        const label = social.label || "Connect";
                        const color =
                          social.color ||
                          "bg-gradient-to-r from-gray-600 to-gray-700";

                        return (
                          <motion.a
                            key={index}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 ${color} text-blue-100 p-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 text-xs shadow-md hover:shadow-lg`}
                            whileTap={{ scale: 0.95 }}
                            onMouseEnter={() => setHovered(index)}
                            onMouseLeave={() => setHovered(null)}
                          >
                            <Icon className="text-sm flex-shrink-0" />
                            <span className="truncate font-medium">{label}</span>
                          </motion.a>
                        );
                      })}
                    </div>
                    {settings.contactNote && (
                      <p className="text-xs text-gray-400 mt-3 text-center">
                        {settings.contactNote}
                      </p>
                    )}
                  </div>
                </motion.div> */}
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col"
            >
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-700/50 shadow-xl h-full flex flex-col">
                {user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl"
                  >
                    <FaUserCircle className="text-xl text-amber-400" />
                    <div>
                      <p className="text-sm font-medium">
                        {settings.welcomeText?.replace("{name}", user.name) ||
                          `Welcome, ${user.name || "Member"}!`}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 mb-4 bg-gray-900/50 p-1 rounded-lg">
                  {settings.tabs?.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 py-2 px-3 rounded-md text-xs transition-all duration-200 ${
                        activeTab === tab.key
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {settings.tabs?.map(
                    (tab) =>
                      activeTab === tab.key && (
                        <motion.div
                          key={tab.key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex-1 flex flex-col"
                        >
                          {tab.key === "join" && (
                            <form
                              onSubmit={handleSubmit}
                              className="space-y-4 flex-1 flex flex-col"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Your Name
                                  </label>
                                  <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Full name"
                                    className="w-full p-3 text-sm bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    required
                                  />
                                </div>

                                {/* PHONE INPUT (fixed +250; user cannot overwrite it) */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">
                                    WhatsApp Number
                                  </label>

                                  <div className="flex">
                                    <div className="flex items-center px-3 bg-gray-800 border border-r-0 border-gray-700 rounded-l-lg text-gray-300 text-sm">
                                      <FaWhatsapp className="text-green-500 mr-1" />
                                      +250
                                    </div>

                                    <input
                                      type="tel"
                                      inputMode="numeric"
                                      value={phone}
                                      onChange={(e) => {
                                        const onlyNumbers = e.target.value.replace(/\D/g, "");
                                        if (onlyNumbers.length <= 9) setPhone(onlyNumbers);
                                      }}
                                      placeholder="7XXXXXXXX"
                                      className="w-full p-3 text-sm bg-gray-900/50 border border-gray-700 rounded-r-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                                      required
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-900/30 p-2 rounded-lg">
                                <FaInfoCircle size={10} />
                                <span>
                                  {settings.whatsappNote ||
                                    "Confirmation will be sent via WhatsApp"}
                                </span>
                              </div>

                              <div className="mt-auto">
                                <motion.button
                                  type="submit"
                                  disabled={isSubmitting || !user}
                                  whileTap={{ scale: 0.98 }}
                                  className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                    user
                                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                                      : "bg-gradient-to-r from-gray-700 to-gray-800 cursor-not-allowed"
                                  }`}
                                >
                                  {isSubmitting ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                      {settings.processingText || "Processing..."}
                                    </>
                                  ) : user ? (
                                    <>
                                      {settings.joinButtonText || "Join Prayer Session"}
                                      <FaArrowRight size={12} />
                                    </>
                                  ) : (
                                    settings.loginRequiredText || "Log In to Join"
                                  )}
                                </motion.button>
                              </div>
                            </form>
                          )}

                          {tab.key !== "join" && (
                            <div className="p-3 text-sm text-gray-300 bg-gray-900/30 rounded-lg flex-1">
                              {tab.content || "Content coming soon..."}
                            </div>
                          )}
                        </motion.div>
                      )
                  )}
                </AnimatePresence>

                {/* Features */}
                <div className="mt-5 pt-4 border-t border-gray-700/50">
                  <div className="grid grid-cols-2 gap-2">
                    {settings.features?.slice(0, 4).map((feature, idx) => (
                      <div
                        key={idx}
                        className={`bg-gradient-to-br ${feature.color} text-white p-2 rounded-lg text-xs text-center font-medium shadow`}
                      >
                        {feature.label}
                      </div>
                    ))}
                  </div>
                  {settings.features?.length > 4 && (
                    <div className="text-center mt-2">
                      <button className="text-xs text-gray-400 hover:text-gray-300 flex items-center justify-center gap-1 mx-auto">
                        <span>+{settings.features.length - 4} more features</span>
                        <FaChevronRight size={10} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Info */}
                <div className="mt-4 pt-3 border-t border-gray-700/30 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span>Live Updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    <span>{participants} joined</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 pt-4 border-t border-gray-800/50"
          >
            <div className="text-center">
              <p className="text-xs text-gray-500 px-2">
                {settings.footerNote ||
                  "Join our holiday prayer community and grow together in faith."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                {settings.additionalLinks?.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.href}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors hover:underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HolidayConnect;

