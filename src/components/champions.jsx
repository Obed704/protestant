import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ChampionsSection = () => {
  const [champions, setChampions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const displayLimit = 3;

  // Fetch champions from API
  const fetchChampions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/champions`);
      if (!res.ok) throw new Error("Failed to fetch champions");
      const data = await res.json();

      // Sort champions by year descending, then by creation time (_id)
      const sortedData = data
        .slice()
        .sort((a, b) => {
          const yearA = a.year || 0;
          const yearB = b.year || 0;
          if (yearB !== yearA) return yearB - yearA; // sort by year descending
          // fallback to _id descending if year is same or missing
          return b._id.localeCompare(a._id);
        });

      const formattedData = sortedData.map((champion) => ({
        id: champion._id,
        name: champion.title,
        description: champion.description,
        image: champion.image,
        to: "/champions",
      }));

      setChampions(formattedData);
    } catch (err) {
      console.error("Error fetching champions:", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchChampions();
  }, []);

  const hasMore = champions.length > displayLimit;
  const displayedChampions = champions.slice(0, displayLimit);

  return (
    <section id="champions" className="py-16 bg-blue-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          className="text-4xl font-bold text-center mb-12"
          style={{ color: "rgb(242, 30, 167)" }}
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          Champions in recent years
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {displayedChampions.map((champion, index) => (
            <motion.div
              key={champion.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: index * 0.2,
                ease: "easeOut",
              }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <img
                src={`${BACKEND_URL}${champion.image}`}
                alt={champion.name}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2"
                style={{ color: "rgb(23, 207, 220)" }} >
                  {champion.name}
                </h3>
                <p className="text-gray-600 mb-4">{champion.description}</p>
              </div>
              <div className="text-blue-400 text-2xl font-bold mb-2 px-4">
                <Link to={champion.to}>more</Link>
              </div>
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition"
            >
              View More
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl max-w-4xl w-full p-6 relative overflow-y-auto max-h-[80vh]"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl"
                >
                  &times;
                </button>

                <h3 className="text-2xl font-bold mb-6 text-center text-blue-700">
                  All Champions
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {champions.map((champion, index) => (
                    <motion.div
                      key={champion.id}
                      className="bg-gray-100 rounded-xl overflow-hidden shadow p-4 flex flex-col"
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <img
                        src={`${BACKEND_URL}${champion.image}`}
                        alt={champion.name}
                        className="w-full h-36 object-cover rounded-lg mb-4"
                        loading="lazy"
                      />
                      <h4 className="text-lg font-semibold text-blue-700 mb-2">
                        {champion.name}
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {champion.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ChampionsSection;
