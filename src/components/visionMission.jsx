import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Define the exact colors you provided
const STEM_COLORS = [
  "rgb(247, 244, 46)",   // Yellow - for Mission
  "rgb(23, 207, 220)",   // STEM Inspires Blue - for Vision
  "rgb(242, 30, 167)",   // Pink/Magenta - spare if needed
];

const MissionVision = () => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/mission-vision`);
        const data = await res.json();
        setCards(data);
      } catch (err) {
        console.error("Error fetching mission/vision:", err);
      }
    };
    fetchCards();
  }, []);

  // Render title with whole words colored (no splitting letters)
  const renderColoredTitle = (text) => {
    if (!text) return "Untitled";

    const parts = text.split(/(\s+)/); // Keep spaces intact

    return parts.map((part, i) => {
      const trimmed = part.trim();
      if (trimmed === "Mission") {
        return (
          <span key={i} style={{ color: STEM_COLORS[0] }}>
            {part}
          </span>
        );
      }
      if (trimmed === "Vision") {
        return (
          <span key={i} style={{ color: STEM_COLORS[1] }}>
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!cards.length) {
    return (
      <section className="bg-black text-white py-16 px-6 md:px-20 text-center">
        <h2 className="text-4xl font-extrabold mb-6">Our Mission & Vision</h2>
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section className="bg-black text-white py-16 px-6 md:px-20 overflow-hidden">
      {/* Section Title */}
      <motion.h2
        className="text-4xl font-extrabold text-center mb-16 text-white"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        Our Mission & Vision
      </motion.h2>

      {/* Cards container */}
      <div className="flex flex-col md:flex-row md:space-x-10 space-y-10 md:space-y-0 items-stretch">
        {cards.map((card, index) => {
          // Determine shadow color based on title
          const isMission = card.title?.toLowerCase().includes("mission");
          const shadowColor = isMission ? STEM_COLORS[0] : STEM_COLORS[1];
          
          // Convert RGB to RGBA for shadow effects
          const shadowColorDark = shadowColor.replace('rgb', 'rgba').replace(')', ', 0.6)');
          const shadowColorMedium = shadowColor.replace('rgb', 'rgba').replace(')', ', 0.4)');
          const shadowColorLight = shadowColor.replace('rgb', 'rgba').replace(')', ', 0.2)');

          return (
            <motion.div
              key={card._id}
              className="relative flex-1 h-full min-h-[360px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-10 
                         border border-gray-700 flex flex-col justify-between overflow-hidden"
              // Initial state - no colored shadows
              style={{
                boxShadow: `
                  0 4px 20px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `,
              }}
              // Hover state with animated shadows
              whileHover={{
                boxShadow: [
                  `
                    0 4px 20px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `,
                 
                  `
                    0 4px 20px rgba(0, 0, 0, 0.3),
                    0 15px 40px -10px ${shadowColorLight},
                    0 25px 60px -15px ${shadowColorMedium},
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `
                ],
                scale: 1.03,
              }}
              transition={{
                boxShadow: {
                  duration: 1.2,
                  ease: "easeOut",
                  times: [0, 1]
                },
                scale: {
                  duration: 0.5,
                  ease: "easeOut"
                }
              }}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* Animated Bottom Shadow */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-0"
                whileHover={{
                  opacity: [0, 0.4, 0.7, 1],
                }}
                transition={{
                  duration: 1.2,
                  ease: "ease",
                  delay: 0.1
                }}
                style={{
                  background: `linear-gradient(to top, ${shadowColor}, transparent)`,
                  borderRadius: '0 0 24px 24px',
                  filter: 'blur(15px)',
                }}
              />

              {/* Animated Left Shadow */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none opacity-0"
                whileHover={{
                  opacity: [0, 0.3, 0.5, 0.8],
                }}
                transition={{
                  duration: 1.2,
                  ease: "ease",
                  delay: 0.2
                }}
                style={{
                  background: `linear-gradient(to right, ${shadowColor}, transparent)`,
                  borderRadius: '24px 0 0 24px',
                  filter: 'blur(12px)',
                }}
              />

              {/* Corner Glow Effect */}
              <motion.div
                className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none opacity-0"
                whileHover={{
                  opacity: [0.6],
                  scale: [0.5],
                }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                  delay: 0
                }}
                style={{
                  background: `radial-gradient(circle, ${shadowColor}80, transparent 70%)`,
                  filter: 'blur(50px)',
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Title with solid word color (no per-letter split) */}
                <h3 className="text-2xl font-semibold mb-4">
                  {renderColoredTitle(card.title)}
                </h3>
                <p className="text-gray-300 leading-relaxed lg:leading-8 group-hover:text-gray-100 transition-colors duration-500 delay-200">
                  {card.description || "No description provided."}
                </p>
              </div>

              {/* Subtle Border Glow */}
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none border-2 opacity-0"
                whileHover={{
                  opacity: [0, 0.3, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: 0.4
                }}
                style={{
                  borderColor: shadowColor,
                  boxShadow: `inset 0 0 30px ${shadowColorLight}`,
                }}
              />

              {/* Floating particles effect */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      background: shadowColor,
                      width: `${Math.random() * 8 + 4}px`,
                      height: `${Math.random() * 8 + 4}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{
                      opacity: [0, 0.6, 0],
                      scale: [0, 1],
                      x: [0, (Math.random() - 0.5) * 40],
                      y: [0, (Math.random() - 0.5) * 40],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeOut",
                      delay: Math.random() * 0.5,
                      repeat: Infinity,
                      repeatDelay: Math.random() * 2 + 1,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default MissionVision;