import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MainContent = () => {
  const [fllData, setFllData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // Fetch FLL data from API
  const fetchFllData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/fll`);
      setFllData(res.data);
    } catch (err) {
      console.error("Failed to fetch FLL data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600"></div>
        <p className="mt-4" style={{ color: "rgb(23, 207, 220)" }}>Loading FIRST LEGO League info...</p>
      </div>
    );
  }

  return (
    <main className="pt-36 px-4 pb-20 space-y-16 max-w-7xl md:mx-auto">
      {fllData.map((fll) => (
        <motion.div
          key={fll._id}
          className="bg-white shadow-2xl rounded-3xl overflow-hidden w-full p-10 space-y-10"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Heading + Logo */}
          <div className="flex items-center justify-center gap-4 flex-wrap text-center md:text-left">
            <motion.img
              src={`${BACKEND_URL}${fll.logo}`}
              alt={`${fll.title} Logo`}
              className="w-20 md:w-24 h-auto object-contain"
              onError={(e) => (e.target.src = "/fallback-logo.png")}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            />
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-tight"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {fll.title.split(" ").map((word, idx) => (
                <span
                  key={idx}
                  className={idx === 1 ? "text-red-600" : "text-black"}
                >
                  {word}{" "}
                </span>
              ))}
            </motion.h1>
          </div>

          {/* Body Text */}
          <motion.div
            className="text-center space-y-6 px-4 md:px-10"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <p className="text-lg leading-relaxed text-black">
              {fll.description}
            </p>
            <p className="text-xl font-semibold">
              We are bringing this to central Africa!
            </p>
            <p className="text-lg font-medium" style={{ color: "rgb(23, 207, 220)" }}>
              Check out the schools we are connecting:
            </p>
          </motion.div>

          {/* Map Section */}
          {/* Map Section */}
{fll.mapUrl && (
  <motion.section
    className="bg-white py-16 px-0 md:px-20 rounded-none md:rounded-3xl shadow-md"
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
  >
    <div className="text-center space-y-8 w-full md:rounded-3xl md:overflow-hidden">
      <motion.h2
        className="text-3xl md:text-4xl font-bold"
        style={{ color: "rgb(242, 30, 167)" }}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        Schools We're Connecting
      </motion.h2>
      <motion.p
        className="text-lg text-gray-600 max-w-2xl mx-auto px-4 md:px-0"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        Here's where we're bringing the FIRST LEGO League program across Central Africa. Explore the locations of participating schools.
      </motion.p>

      <motion.iframe
        src={fll.mapUrl}
        width="100%"
        height="480"
        loading="lazy"
        title={`${fll.title} Participating Schools Map`}
        className="rounded-none md:rounded-xl shadow-lg"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      ></motion.iframe>
    </div>
  </motion.section>
)}

        </motion.div>
      ))}
    </main>
  );
};

export default MainContent;
