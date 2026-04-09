import React, { useState, useContext, useEffect } from "react";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaUserCircle,
  FaArrowRight,
  FaQuoteLeft,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { AuthContext } from "../context/authContext.jsx";
import Confetti from "react-confetti";
import { useAppData } from "../context/DataContext.jsx";

const HolidayConnect = () => {
  const { user } = useContext(AuthContext);
  const { holidaySettings: settings, participants: initialParticipants } =
    useAppData();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participants, setParticipants] = useState(initialParticipants || 0);
  const [activeTab, setActiveTab] = useState("join");
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setShowConfetti(true);
      setParticipants((p) => p + 1);
      setIsSubmitting(false);
      setTimeout(() => setShowConfetti(false), 4000);
    }, 1000);
  };

  if (!settings) return null;

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center p-4 sm:p-8 md:p-20 overflow-x-hidden bg-[#020617]">
      {/* 1. BACKGROUND ENGINE */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 md:opacity-100"
          style={{ backgroundImage: `url('img3.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-emerald-950/60 to-indigo-950/50" />
        <div className="absolute inset-0 backdrop-blur-[4px]" />
      </div>

      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          gravity={0.15}
          style={{ zIndex: 100 }}
        />
      )}

      {/* 2. THE CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-5xl backdrop-blur-3xl bg-slate-900/40 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden"
      >
        <div className="grid lg:grid-cols-12">
          {/* LEFT SIDE: EMERALD THEME */}
          <div className="lg:col-span-5 p-6 md:p-12 flex flex-col justify-between bg-gradient-to-b from-emerald-500/10 to-transparent border-b lg:border-b-0 lg:border-r border-white/5">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-400/10 text-emerald-400 px-3 py-1 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] border border-emerald-400/20 mb-4 md:mb-6">
                <FaCalendarAlt /> {settings.season}
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 tracking-tighter leading-[1.1]">
                {settings.title}
              </h1>

              <p className="text-sm md:text-base text-slate-300/70 leading-relaxed mb-6 md:mb-8 font-light">
                {settings.description}
              </p>

              {/* Quote Box - Adjusted for mobile */}
              <div className="relative p-5 md:p-7 bg-white/[0.02] rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-xl">
                <FaQuoteLeft className="text-2xl text-emerald-500/10 mb-2" />
                <p className="text-sm md:text-base leading-relaxed text-white/80 mb-3 font-serif italic">
                  "{settings.bibleVerse?.text}"
                </p>
                <span className="text-emerald-400 font-bold text-[10px] tracking-widest uppercase">
                  {settings.bibleVerse?.reference}
                </span>
              </div>
            </div>

            {/* Participant Section */}
            <div className="mt-8 md:mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden"
                  >
                    <FaUserCircle size={20} className="text-slate-500" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-bold text-xs md:text-sm">
                  {participants.toLocaleString()}+
                </p>
                <p className="text-slate-500 text-[8px] md:text-[9px] uppercase font-bold tracking-widest">
                  {settings.participantsLabel}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: FORM */}
          <div className="lg:col-span-7 p-6 md:p-12 bg-black/30">
            <div className="max-w-sm mx-auto h-full flex flex-col">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight italic">
                  {settings.spiritualTitle}
                </h3>
                <div className="flex gap-2">
                  {settings.socialLinks?.map((link, i) => (
                    <a
                      key={i}
                      href={link.href}
                      className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-xl bg-slate-800/50 hover:bg-emerald-500 hover:text-white text-slate-400 transition-all border border-white/5"
                    >
                      {link.label === "WhatsApp" ? (
                        <FaWhatsapp size={14} />
                      ) : link.label === "Call" ? (
                        <FaPhone size={12} />
                      ) : (
                        <FaEnvelope size={12} />
                      )}
                    </a>
                  ))}
                </div>
              </div>

              {/* Nav Tabs - Optimized for tap areas */}
              <div className="flex p-1 bg-slate-800/40 rounded-xl mb-6 md:mb-8 border border-white/5 overflow-hidden">
                {settings.tabs?.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-2 md:py-2.5 px-2 md:px-3 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.15em] transition-all duration-300 ${
                      activeTab === tab.key
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1"
                >
                  {activeTab === "join" ? (
                    <form
                      onSubmit={handleSubmit}
                      className="space-y-4 md:space-y-5"
                    >
                      <div>
                        <label className="block text-[8px] md:text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">
                          Identity / Name
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-800/30 border border-white/5 rounded-xl p-3.5 md:p-4 text-sm text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                          placeholder="Your Name"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] md:text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">
                          WhatsApp Reach
                        </label>
                        <div className="flex gap-2">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 md:px-4 flex items-center text-emerald-400 font-bold text-[10px] md:text-xs">
                            +250
                          </div>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) =>
                              setPhone(
                                e.target.value.replace(/\D/g, "").slice(0, 9),
                              )
                            }
                            className="flex-1 bg-slate-800/30 border border-white/5 rounded-xl p-3.5 md:p-4 text-sm text-white outline-none placeholder:text-slate-600"
                            placeholder="788 000 000"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || !user}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] shadow-xl transition-all flex items-center justify-center gap-3 mt-4 active:scale-95 ${
                          user
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : "bg-slate-800 text-slate-600 border border-white/5"
                        }`}
                      >
                        {isSubmitting
                          ? "Syncing..."
                          : user
                            ? settings.joinButtonText
                            : "Login To Send"}
                        {user && !isSubmitting && <FaArrowRight />}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-emerald-400/5 border border-emerald-500/10 rounded-[1.5rem] p-5 md:p-6 text-slate-300 leading-relaxed text-xs md:text-sm font-light">
                      {settings.tabs.find((t) => t.key === activeTab)?.content}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HolidayConnect;
