import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Instagram, Youtube, Heart, Plus } from "lucide-react";

const FloatingSocials = () => {
  const [isOpen, setIsOpen] = useState(false);

  // BRANDED COLORS & DATA
  const socials = [
    {
      id: "fb",
      icon: <Facebook size={18} fill="white" />,
      color: "bg-[#1877F2]", // FB Blue
      label: "Facebook",
    },
    {
      id: "ig",
      icon: <Instagram size={18} />,
      color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F56040]", // IG Gradient
      label: "Instagram",
    },
    {
      id: "yt",
      icon: <Youtube size={18} fill="white" />,
      color: "bg-[#FF0000]", // YT Red
      label: "YouTube",
    },
  ];

  // ANIMATION VARIANTS
  const containerVariants = {
    closed: {
      scale: 0.9,
      y: 10,
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
    open: {
      scale: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    closed: { x: 50, opacity: 0, transition: { x: { stiffness: 1000 } } },
    open: {
      x: 0,
      opacity: 1,
      transition: { x: { stiffness: 1000, velocity: -100 } },
    },
  };

  return (
    /* FIXED POSITION: Always visible in bottom right */
    <div
      className="fixed bottom-6 right-6 z-[100] flex items-end gap-3 pointer-events-none"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <AnimatePresence>
        {isOpen && (
          /* FLOATING DOCK OF SOCIALS */
          <motion.div
            className="flex items-center gap-2 pointer-events-auto"
            initial="closed"
            animate="open"
            exit="closed"
            variants={containerVariants}
          >
            {socials.map((social) => (
              <motion.a
                key={social.id}
                href="#" // Link to your profiles
                aria-label={social.label}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`${social.color} text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-black/10 transition-shadow hover:shadow-2xl hover:shadow-black/20`}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* THE MAIN FLOATING TRIGGER */}
      <motion.div
        className="pointer-events-auto group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button className="relative w-14 h-14 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-emerald-900/10 active:shadow-lg transition-all">
          {/* Subtle Ambient Pulse Effect */}
          <span className="absolute inset-0 rounded-[1.5rem] bg-emerald-500 animate-pulse-slow group-hover:opacity-0 transition-opacity"></span>

          <AnimatePresence mode="wait">
            <motion.div
              key={isOpen ? "plus" : "heart"}
              initial={{ rotate: isOpen ? -90 : 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: isOpen ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              {isOpen ? (
                <Plus size={24} className="text-white" />
              ) : (
                <Heart size={24} className="text-white" fill="currentColor" />
              )}
            </motion.div>
          </AnimatePresence>
        </button>
      </motion.div>
    </div>
  );
};

export default FloatingSocials;
