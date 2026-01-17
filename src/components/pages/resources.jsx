// Modern DownloadsPage.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../Header";
import Footer from "../Footer";
import { motion } from "framer-motion";

const brandColors = {
  yellow: "rgb(247, 244, 46)",
  cyan: "rgb(23, 207, 220)",
  pink: "rgb(242, 30, 167)",
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.15 } },
};

const DownloadsPage = () => {
  const [downloads, setDownloads] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loadingDownloads, setLoadingDownloads] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/downloads`);
        if (!res.ok) throw new Error("Failed to fetch downloads");
        const data = await res.json();
        const formatted = data.map((d) => ({
          ...d,
          image: `${BACKEND_URL}/${d.image}`,
        }));
        setDownloads(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDownloads(false);
      }
    };

    const fetchVideos = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/videos`);
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();
        setVideos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchDownloads();
    fetchVideos();
  }, [BACKEND_URL]);

  return (
    <>
      <Navbar />

      {/* Downloads Section */}
      <section className="px-6 py-24 bg-gradient-to-b from-gray-900 to-gray-950">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-20"
          style={{ color: brandColors.cyan }}
        >
          Download Files
        </motion.h2>

        {loadingDownloads ? (
          <p className="text-center text-gray-400 text-sm">Loading...</p>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10"
          >
            {downloads.map((item) => (
              <motion.div
                key={item._id}
                variants={fadeUp}
                className="relative group rounded-3xl bg-gray-800 shadow-lg hover:shadow-2xl transition-shadow duration-500 overflow-hidden"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden rounded-t-3xl">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Title */}
                <div className="p-5 text-center">
                  <h3
                    className="text-lg font-semibold truncate"
                    style={{ color: brandColors.yellow }}
                  >
                    {item.title}
                  </h3>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center text-white text-center px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <p className="text-sm mb-4 line-clamp-3">{item.description}</p>
                  <a
                    href={item.linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 transition"
                  >
                    Download
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Videos Section */}
      <section className="px-6 py-24 bg-gray-950 border-t border-gray-800">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16"
          style={{ color: brandColors.pink }}
        >
          Watch Our Playlists
        </motion.h2>

        {loadingVideos ? (
          <p className="text-center text-gray-400 text-sm">Loading videos...</p>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10"
          >
            {videos.map((item) => (
              <motion.div
                key={item._id}
                variants={fadeUp}
                className="bg-gray-900 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-500 overflow-hidden"
              >
                <div className="aspect-video rounded-t-3xl overflow-hidden">
                  <iframe
                    src={item.embedUrl}
                    title={item.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                <div className="p-5">
                  <h3
                    className="text-lg font-semibold line-clamp-1"
                    style={{ color: brandColors.cyan }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-300 line-clamp-2 mt-2">
                    {item.description}
                  </p>
                  <a
                    href={item.embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block text-center text-sm py-2 rounded-full bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 text-white transition"
                  >
                    Open
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <Footer />
    </>
  );
};

export default DownloadsPage;