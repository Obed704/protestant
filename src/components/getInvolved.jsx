import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const GetInvolved = ({ involvementData = [] }) => {
  if (!involvementData?.length) {
    return (
      <section className="py-16 text-center bg-gray-50 min-h-[300px] flex items-center justify-center">
        <div className="text-gray-600">
          <p>No involvement opportunities available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 md:px-20 bg-white">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <motion.h2
          className="text-3xl md:text-5xl font-bold"
          style={{ color: "rgb(242, 30, 167)" }}
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Get Involved
        </motion.h2>
        <motion.p
          className="mt-4 text-lg md:text-xl text-gray-700"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          You can make a difference by taking it further or supporting a team.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-stretch">
        {involvementData.map((item, idx) => (
          <motion.div
            key={item._id || idx}
            className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: idx * 0.2 }}
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ scale: 1.03 }}
          >
           <img
  src={`${BACKEND_URL}${item.img?.startsWith("/") ? "" : "/"}${item.img}`}
  alt={item.title || "Get Involved"}
  className="w-full h-48 md:h-64 object-cover"
  onError={(e) => {
    e.currentTarget.src = "/images/placeholder-involvement.jpg";
  }}
/>

            <div className="p-8 flex flex-col flex-grow text-center">
              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: "rgb(242, 30, 167)" }}
              >
                {item.title || "Opportunity"}
              </h3>
              <p className="text-gray-700 text-sm md:text-base mb-6 flex-grow">
                {item.description || "No description available."}
              </p>

              {item.buttonLink && item.buttonText && (
                <Link
                  to={item.buttonLink}
                  className="inline-block px-6 py-3 rounded-full font-semibold text-white transition transform hover:scale-105 mt-auto"
                  style={{ backgroundColor: item.buttonColor || "#f21ea7" }}
                >
                  {item.buttonText}
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default GetInvolved;