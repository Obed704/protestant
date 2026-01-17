import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const GetInvolved = () => {
  const [involvementCards, setInvolvementCards] = useState([]);

  useEffect(() => {
    const fetchSupportCards = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/support`);
        const data = await res.json();
        setInvolvementCards(data);
      } catch (error) {
        console.error("Error fetching support cards:", error);
      }
    };
    fetchSupportCards();
  }, []);

  return (
    <section
      className="bg-gradient-to-br from-blue-200 to-blue-100 py-24 px-6"
      id="involved"
    >
      {/* Section Title */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4"
        style={{ color: "rgb(242, 30, 167)" }}>
          Support
        </h1>
        <h2 className="text-blue-800 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Collaboration is at the heart of STEM Inspires. Here’s how you can contribute:
        </h2>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {involvementCards.map((card, idx) => (
          <motion.div
            key={card._id}
            className="group bg-white rounded-2xl shadow-lg flex flex-col items-center p-8"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: idx * 0.2 }}
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: "0 12px 24px rgba(0,0,0,0.2)" }}
          >
            {/* Image */}
            <div className="relative w-32 h-32 mb-6">
              <img
                src={`${BACKEND_URL}${card.image}`}
                alt={card.alt}
                className="w-full h-full object-cover rounded-full border-4 border-yellow-400 shadow-md group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-blue-900 mb-3 group-hover:text-yellow-500 transition-colors duration-300">
              {card.title}
            </h3>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-4 text-center">
              {card.description}{" "}
              <a
                href={`/contact?subject=${encodeURIComponent(card.title)}`}
                className="text-blue-600 hover:text-yellow-500 font-semibold underline transition-colors duration-300"
              >
                {card.linkText}
              </a>
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default GetInvolved;
