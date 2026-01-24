// Modern DownloadsPage.jsx - Fixed Loading and Animations
import React, { useEffect, useState } from "react";
import Navbar from "../Header";
import Footer from "../Footer";
import { motion } from "framer-motion";

const brandColors = {
  yellow: "rgb(247, 244, 46)",
  cyan: "rgb(23, 207, 220)",
  pink: "rgb(242, 30, 167)",
  gray: {
    50: "rgb(250, 250, 250)",
    100: "rgb(245, 245, 245)",
    200: "rgb(229, 229, 229)",
    300: "rgb(212, 212, 212)",
    400: "rgb(163, 163, 163)",
    500: "rgb(115, 115, 115)",
    600: "rgb(82, 82, 82)",
    700: "rgb(64, 64, 64)",
    800: "rgb(38, 38, 38)",
    900: "rgb(23, 23, 23)",
    950: "rgb(10, 10, 10)"
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  hover: {
    y: -8,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
    transition: { duration: 0.2 }
  }
};

// Add this CSS for reverse spin animation
const style = `
  @keyframes spin-reverse {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }
  .animate-spin-reverse {
    animation: spin-reverse 1s linear infinite;
  }
`;

const DownloadsPage = () => {
   const [navbar, setNavbar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloads, setDownloads] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loadingDownloads, setLoadingDownloads] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    let mounted = true;

    const fetchNavbar = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/navbar`);
        if (!res.ok) throw new Error("Failed to fetch navbar");

        const data = await res.json();

        if (!mounted) return;

        setNavbar(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Unable to load navbar");
        setLoading(false);
      }
    };

    fetchNavbar();

    return () => {
      mounted = false;
    };
  }, []);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

  if (loading) return null;
  if (error) return <p className="text-red-500">{error}</p>;


  return (
    <>
      <style>{style}</style>
      
      {/* Page Wrapper with Fade-in Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-950"
      >
        <Navbar settings={navbar}/>

        {/* Hero Section with Dynamic Wave */}
        <div className="relative bg-gray-950 overflow-hidden">
          {/* Animated Multi-wave SVG */}
          <div className="absolute top-0 left-0 right-0 h-48">
            <svg 
              viewBox="0 0 1200 200" 
              preserveAspectRatio="none" 
              className="absolute bottom-0 w-full h-full"
            >
              {/* Base Wave */}
              <path 
                d="M0,100 C150,200 350,0 600,100 C850,200 1050,0 1200,100 L1200,0 L0,0 Z"
                fill="rgb(23, 23, 23)"
              />
              {/* Cyan Accent Wave */}
              <path 
                d="M0,120 C200,40 400,160 600,80 C800,200 1000,40 1200,120 L1200,0 L0,0 Z"
                fill="rgb(23, 207, 220)"
                fillOpacity="0.1"
              />
              {/* Yellow Accent Wave */}
              <path 
                d="M0,140 C250,60 450,180 600,100 C750,20 950,140 1200,60 L1200,0 L0,0 Z"
                fill="rgb(247, 244, 46)"
                fillOpacity="0.05"
              />
            </svg>
          </div>

          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-cyan-500 blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-pink-500 blur-3xl"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="pt-40 pb-24 px-6 relative z-10"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="w-3 h-3 rounded-full bg-cyan-500 mr-3 animate-pulse"></div>
                <h1 
                  className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-yellow-400 to-pink-400 bg-clip-text text-transparent"
                >
                  Resources
                </h1>
                <div className="w-3 h-3 rounded-full bg-pink-500 ml-3 animate-pulse delay-300"></div>
              </div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-center text-gray-400 max-w-2xl mx-auto text-lg mb-10"
              >
                Download premium materials and watch expert tutorials
              </motion.p>
              
              {/* Animated Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-8 text-sm"
              >
                {/* <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">50+</div>
                  <div className="text-gray-500">Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">20+</div>
                  <div className="text-gray-500">Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400">∞</div>
                  <div className="text-gray-500">Possibilities</div>
                </div> */}
              </motion.div>
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-20 left-10 w-4 h-4 rounded-full bg-cyan-500/30"
          ></motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-20 right-10 w-6 h-6 rounded-full bg-pink-500/20"
          ></motion.div>
        </div>

        {/* Downloads Section - Enhanced Curve */}
        <section className="relative bg-gray-900 py-32">
          {/* Complex Wave Separator */}
          <div className="absolute -top-20 left-0 right-0 h-20">
            <svg 
              viewBox="0 0 1200 120" 
              preserveAspectRatio="none" 
              className="w-full h-full"
            >
              {/* Main Pink Wave with multiple peaks */}
              <path 
                d="M0,60 C100,0 200,120 300,40 C400,-40 500,80 600,20 C700,-40 800,80 900,20 C1000,-40 1100,80 1200,20 L1200,120 L0,120 Z"
                fill="rgb(242, 30, 167)"
                fillOpacity="0.8"
              />
              {/* Secondary Cyan Wave */}
              <path 
                d="M0,80 C150,0 300,100 450,30 C600,-40 750,100 900,40 C1050,-20 1200,100 1200,100 L1200,120 L0,120 Z"
                fill="rgb(23, 207, 220)"
                fillOpacity="0.4"
              />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-20"
            >
              {/* <div className="inline-block px-6 py-2 rounded-full bg-gray-800 border border-gray-700 mb-6">
                <span className="text-sm font-medium text-cyan-400">✦ Premium Content ✦</span>
              </div> */}
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                Download Files
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                High-quality resources designed for professionals and enthusiasts
              </p>
            </motion.div>

            {loadingDownloads ? (
              <div className="flex justify-center items-center h-96">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500/30 border-b-pink-500 rounded-full animate-spin-reverse"></div>
                </div>
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {downloads.map((item) => (
                  <motion.div
                    key={item._id}
                    variants={cardVariants}
                    whileHover="hover"
                    className="group relative bg-gray-800 rounded-3xl overflow-hidden border border-gray-700 hover:border-cyan-500 transition-all duration-300 flex flex-col h-full backdrop-blur-sm bg-opacity-50"
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950">
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10"></div>
                      <img
                        src={item.image}
                        alt={item.alt}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                      />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-gray-900/90 backdrop-blur-md rounded-full border border-gray-700">
                        <span className="text-xs font-medium text-cyan-400 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          File
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col relative z-20">
                      {/* Title and Description */}
                      <div className="mb-5 flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                          <h3 className="text-base font-semibold line-clamp-2" style={{ color: brandColors.yellow }}>
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      
                      {/* Download Button */}
                      <div className="mt-auto">
                        <a
                          href={item.linkHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/btn relative w-full inline-flex items-center justify-center py-3.5 px-6 text-sm font-medium rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-cyan-500 hover:from-cyan-600 hover:to-cyan-700 text-white transition-all duration-300 overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            Download Now
                            <svg className="w-4 h-4 group-hover/btn:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </span>
                          <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-cyan-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                        </a>
                      </div>
                    </div>

                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-pink-500/50 rounded-br-3xl"></div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Videos Section - Modern Wave Design */}
        <section className="relative bg-gray-950 py-32 overflow-hidden">
          {/* Complex Multi-Wave Divider */}
          <div className="absolute -top-24 left-0 right-0 h-24">
            <svg 
              viewBox="0 0 1200 120" 
              preserveAspectRatio="none" 
              className="w-full h-full"
            >
              {/* Yellow Wave - Multiple Peaks */}
              <path 
                d="M0,40 C150,100 250,0 400,60 C550,120 650,20 800,80 C950,140 1050,40 1200,100 L1200,120 L0,120 Z"
                fill="rgb(247, 244, 46)"
                fillOpacity="0.7"
              />
              {/* Pink Wave - More Dramatic */}
              <path 
                d="M0,20 C200,80 350,-20 550,40 C750,100 850,0 1050,60 L1200,100 L1200,120 L0,120 Z"
                fill="rgb(242, 30, 167)"
                fillOpacity="0.3"
              />
            </svg>
          </div>

          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  x: [0, 10, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="absolute w-1 h-1 bg-cyan-500/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              />
            ))}
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
                <span className="text-sm font-medium text-pink-400">✦ Video Collection ✦</span>
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-yellow-400 to-cyan-400 bg-clip-text text-transparent">
                Video Playlists
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Expert tutorials and guides to level up your skills
              </p>
            </motion.div>

            {loadingVideos ? (
              <div className="flex justify-center items-center h-96">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-yellow-500/30 border-b-yellow-500 rounded-full animate-spin-reverse"></div>
                </div>
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
              >
                {videos.map((item) => (
                  <motion.div
                    key={item._id}
                    variants={cardVariants}
                    whileHover="hover"
                    className="group relative bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 hover:border-pink-500 transition-all duration-300 backdrop-blur-sm bg-opacity-50"
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Video Container */}
                    <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                      
                      <iframe
                        src={item.embedUrl}
                        title={item.title}
                        className="w-full h-full relative z-0"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                      
                      {/* Floating Play Button */}
                      <div className="absolute top-4 right-4 z-20 px-4 py-2 bg-gray-900/80 backdrop-blur-md rounded-full border border-gray-700">
                        <span className="text-xs font-medium text-pink-400 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Watch
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 relative z-20">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 group-hover:from-pink-600 group-hover:to-pink-700 transition-all duration-300">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold line-clamp-1 mb-2" style={{ color: brandColors.cyan }}>
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <a
                        href={item.embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full py-3.5 px-6 text-sm font-medium rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-pink-500 hover:from-pink-600 hover:to-pink-700 text-white transition-all duration-300 group/btn"
                      >
                        <span className="flex items-center gap-2">
                          Open in YouTube
                          <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                      </a>
                    </div>

                    {/* Accent Line */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Bottom Complex Wave */}
          <div className="absolute -bottom-24 left-0 right-0 h-24 rotate-180">
            <svg 
              viewBox="0 0 1200 120" 
              preserveAspectRatio="none" 
              className="w-full h-full"
            >
              <path 
                d="M0,40 C150,100 250,0 400,60 C550,120 650,20 800,80 C950,140 1050,40 1200,100 L1200,120 L0,120 Z"
                fill="rgb(247, 244, 46)"
                fillOpacity="0.7"
              />
              <path 
                d="M0,20 C200,80 350,-20 550,40 C750,100 850,0 1050,60 L1200,100 L1200,120 L0,120 Z"
                fill="rgb(242, 30, 167)"
                fillOpacity="0.3"
              />
            </svg>
          </div>
        </section>

        {/* Final Wave Footer Separator */}
        <div className="relative bg-gray-950">
          <div className="absolute -top-24 left-0 right-0 h-24">
            <svg 
              viewBox="0 0 1200 120" 
              preserveAspectRatio="none" 
              className="w-full h-full"
            >
              <path 
                d="M0,0 C300,120 600,0 900,120 C1000,80 1100,40 1200,0 L1200,120 L0,120 Z"
                fill="rgb(23, 23, 23)"
              />
              <path 
                d="M0,20 C200,100 400,20 600,100 C800,180 1000,100 1200,20 L1200,120 L0,120 Z"
                fill="rgb(23, 207, 220)"
                fillOpacity="0.2"
              />
            </svg>
          </div>
        </div>

        <Footer />
      </motion.div>
    </>
  );
};

export default DownloadsPage;