import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// ================= ANIMATIONS =================
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

export default function FTCLanding() {
  const [schools, setSchools] = useState([]);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH DATA =================
  useEffect(() => {
    Promise.all([
      axios.get(`${BACKEND_URL}/api/ftc-landing`),
      axios.get(`${BACKEND_URL}/api/schools`)
    ])
      .then(([contentRes, schoolsRes]) => {
        setContent(contentRes.data);
        setSchools(schoolsRes.data);
      })
      .catch(err => console.error("FTC load error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !content) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <img
            src={`./welcomeSlide/Logo.png`} // or static /public/logo.png
            alt="STEM Inspires"
            className="w-32 mx-auto mb-6 animate-pulse"
          />
          <div className="text-white text-xl">Loading STEM Inspires…</div>
        </div>
      </div>
    );
  }

  // ================= RENDER =================
  return (
    <>
      {/* ================= HERO ================= */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: `url(${BACKEND_URL}${content.hero.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />

        <motion.div
          className="relative z-10 max-w-4xl px-6 text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight"
            custom={0}
            variants={fadeUp}
          >
            {content.hero.titlePrefix}{" "}
            <span className="text-cyan-400 drop-shadow-lg">
              {content.hero.titleHighlight}
            </span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl mb-8 text-gray-100 max-w-2xl mx-auto"
            custom={1}
            variants={fadeUp}
          >
            {content.hero.subtitle}
          </motion.p>

          <motion.button
            custom={2}
            variants={fadeUp}
            onClick={() => (window.location.href = content.hero.ctaLink)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-4 text-lg rounded-full shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {content.hero.ctaText}
          </motion.button>
        </motion.div>
      </motion.section>

      {/* ================= ABOUT ================= */}
      <motion.section
        className="py-16 sm:py-20 bg-gradient-to-b from-gray-100 to-gray-200"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-6">
          <motion.div variants={staggerContainer}>
            <motion.h2
              className="text-3xl sm:text-4xl font-bold mb-5"
              style={{ color: "rgb(242, 30, 167)" }}
              custom={0}
              variants={fadeUp}
            >
              {content.about.title}
            </motion.h2>

            <motion.p
              className="text-base sm:text-lg leading-relaxed text-gray-700 mb-6"
              custom={1}
              variants={fadeUp}
            >
              {content.about.description}
            </motion.p>

            <motion.a
              href={content.about.linkUrl}
              custom={2}
              variants={fadeUp}
              className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-6 py-3 rounded-xl shadow-md"
              whileHover={{ x: 5 }}
            >
              {content.about.linkText}
            </motion.a>
          </motion.div>

          <motion.div custom={3} variants={fadeUp}>
            <img
              src={`${BACKEND_URL}${content.about.image}`}
              alt="FTC Competition"
              className="rounded-2xl shadow-xl w-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* ================= SCHOOLS ================= */}
      <motion.section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-12"
            style={{ color: "rgb(23, 207, 220)" }}
            variants={fadeUp}
          >
            {content.schoolsSection.title}
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            variants={staggerContainer}
          >
            {schools.map((school, index) => (
              <motion.a
                key={school._id}
                href={school.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gray-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all"
                custom={index}
                variants={fadeUp}
              >
                <div className="h-40 bg-gray-200 overflow-hidden">
                  <img
                    src={`${BACKEND_URL}${school.img}`}
                    alt={school.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {school.name}
                  </h3>
                  <p className="text-sm text-gray-600">{school.location}</p>
                </div>
              </motion.a>
            ))}
          </motion.div>

          <motion.button
            onClick={() =>
              (window.location.href = content.schoolsSection.ctaLink)
            }
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-4 text-lg rounded-full shadow-xl"
            variants={fadeUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {content.schoolsSection.ctaText}
          </motion.button>
        </div>
      </motion.section>
    </>
  );
}
