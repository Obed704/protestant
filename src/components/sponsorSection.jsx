import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Example Stem Inspires gradient colors
const stemGradients = [
  "from-[#17CFDC] via-[#23A6D5] to-[#1E3C72]", // blue-teal
  "from-[#FF6B6B] via-[#FFD93D] to-[#FF9F1C]", // orange-red-yellow
  "from-[#6A11CB] via-[#2575FC] to-[#6A11CB]", // purple-blue
  "from-[#43CEA2] via-[#185A9D] to-[#43CEA2]", // green-blue
  "from-[#F7971E] via-[#FFD200] to-[#F7971E]", // yellow-orange
];

const SponsorsSection = () => {
  const [sponsors, setSponsors] = useState([]);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/sponsors`);
        const data = await res.json();

        // Assign Stem Inspires gradients cyclically
        const formatted = data.map((sponsor, idx) => ({
          ...sponsor,
          img: `${BACKEND_URL}${sponsor.img}`,
          gradient: stemGradients[idx % stemGradients.length],
        }));

        setSponsors(formatted);
      } catch (err) {
        console.error("Error fetching sponsors:", err);
      }
    };

    fetchSponsors();
  }, []);

  return (
    <section className="p-16 px-4 md:px-12 max-w-7xl mx-auto bg-gray-200">
      <motion.h2
        className="text-4xl font-bold text-center mb-12 text-gray-800"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        🌟 Our Sponsors
      </motion.h2>

      <div className="grid gap-4 grid-cols-3 md:grid-cols-7 md:px-16">
        {sponsors.map((sponsor, idx) => (
          <motion.div
            key={sponsor._id}
            className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer group"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={sponsor.img}
              alt={sponsor.name}
              className="w-full h-full object-cover block transition-opacity duration-300"
            />

            <div
              className={`absolute inset-0 bg-gradient-to-br ${sponsor.gradient} text-white p-6 flex flex-col justify-center items-center text-center space-y-2 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300`}
            >
              <h3 className="text-lg font-semibold break-words">{sponsor.name}</h3>
              <p className="text-xs opacity-90 break-words">{sponsor.description}</p>
              {/* <button
                className={`mt-2 px-4 py-1 bg-white font-semibold rounded-full text-xs text-gray-800 hover:text-gray-700 transition duration-300`}
              >
                See Partner
              </button> */}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SponsorsSection;
