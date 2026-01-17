import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const HeroSection = () => {
  const [slides, setSlides] = useState([]);
  const [hero, setHero] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideIntervalRef = useRef(null);
  const wordColors = useRef({});

  /* --------------------------------
     Fetch HERO config
  --------------------------------- */
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/hero`);
        const data = await res.json();
        setHero(data);

        // 🎨 Color logic
        if (data.colorMode === "random") {
          const shuffled = [...data.colorPalette].sort(() => 0.5 - Math.random());
          wordColors.current = {
            word1: shuffled[0],
            word2: shuffled[1] || shuffled[0],
          };
        } else {
          wordColors.current = {
            word1: data.colorPalette[0],
            word2: data.colorPalette[1] || data.colorPalette[0],
          };
        }
      } catch (err) {
        console.error("Failed to fetch hero data:", err);
      }
    };
    fetchHero();
  }, []);

  /* --------------------------------
     Fetch slides
  --------------------------------- */
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/slides`);
        const data = await res.json();
        setSlides(data);
      } catch (err) {
        console.error("Failed to fetch slides:", err);
      }
    };
    fetchSlides();
  }, []);

  /* --------------------------------
     Auto slide
  --------------------------------- */
  useEffect(() => {
    if (!slides.length || !hero) return;

    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, hero.slideInterval || 7000);

    return () => clearInterval(slideIntervalRef.current);
  }, [slides, hero]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    clearInterval(slideIntervalRef.current);
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, hero.slideInterval || 7000);
  };

  // Loading state with logo
  if (!hero) {
    return (
      <section className="relative h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden">
        {/* Optional subtle background or fallback */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
        
        <div className="relative z-10 text-center space-y-8">
          <motion.img
            src={`${BACKEND_URL}/logo/logo.png`} // Adjust fallback path if needed
            alt="Logo"
            className="w-32 md:w-40 rounded-md mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.p
            className="text-lg md:text-xl text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Loading...
          </motion.p>
        </div>
      </section>
    );
  }

  // If hero is loaded but slides are still loading
  const isLoadingSlides = hero && slides.length === 0;

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Slides */}
      <AnimatePresence>
        {slides.map(
          (slide, index) =>
            index === currentSlide && (
              <motion.div
                key={slide._id}
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${BACKEND_URL}${slide.bg})`,
                }}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 1.3, ease: "easeInOut" }}
              />
            )
        )}
      </AnimatePresence>

      {/* Fallback background while slides load */}
      {isLoadingSlides && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-12 max-w-5xl text-white">
        <div className="space-y-7">
          {/* Logo */}
          <motion.img
            src={`${BACKEND_URL}/logo/${hero.logoImage.startsWith("/") ? "" : "/"}${hero.logoImage}`}
            alt="Logo"
            className="w-28 md:w-32 rounded-md"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          />

          {/* Title */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1]"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8 }}
          >
            <span style={{ color: wordColors.current.word1 }}>
              {hero.title.word1}
            </span>{" "}
            <span style={{ color: wordColors.current.word2 }}>
              {hero.title.word2}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base md:text-lg max-w-2xl text-white/90 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {hero.subtitle}
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-wrap gap-4 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            {hero.buttons.map((btn, i) => {
              const isPrimary = btn.type === "primary";
              return (
                <a
                  key={btn._id || i}
                  href={btn.link}
                  style={
                    isPrimary
                      ? {
                          backgroundColor: wordColors.current.word1,
                          color: "#000",
                        }
                      : {
                          borderColor: wordColors.current.word2,
                          color: wordColors.current.word2,
                        }
                  }
                  className={`px-7 py-3 rounded-full font-semibold tracking-wide transition-all hover:scale-105 ${
                    isPrimary ? "" : "border-2"
                  }`}
                >
                  {btn.label}
                </a>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Dots - only show when slides are loaded */}
      {!isLoadingSlides && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3.5 h-3.5 rounded-full cursor-pointer ${
                index === currentSlide ? "scale-125" : "opacity-50"
              }`}
              style={{
                backgroundColor:
                  index === currentSlide
                    ? wordColors.current.word1
                    : "rgba(255,255,255,0.35)",
              }}
              whileHover={{ scale: 1.4 }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
