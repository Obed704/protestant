import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const RecruitingProcess = () => {
  const [processSteps, setProcessSteps] = useState([]);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/process`);
        const data = await res.json();
        setProcessSteps(data);
      } catch (error) {
        console.error("Error fetching process steps:", error);
      }
    };
    fetchSteps();
  }, []);

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="bg-gray-200 py-12 px-4 sm:px-6 md:px-24 font-sans">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold uppercase tracking-wide"
          style={{ color: "rgb(23, 207, 220)" }}
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.7 } }}
          viewport={{ once: true }}
        >
          Recruiting Schools: The Process
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 md:gap-16 max-w-7xl mx-auto text-center">
        {processSteps.map((step, index) => (
          <motion.div
            key={step._id}
            className="flex flex-col items-center px-2 sm:px-4"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.2 }}
          >
            <img
              src={`${BACKEND_URL}${step.img}`}
              alt={step.alt}
              className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full object-cover mb-6 sm:mb-8 shadow-lg transition-transform duration-300 hover:scale-105"
            />
            <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-800">{step.title}</h3>
            <p className="text-gray-600 leading-relaxed max-w-xs sm:max-w-sm whitespace-pre-line">
              {step.description.split("\n").map((line, idx) => (
                <span
                  key={idx}
                  className={line.includes("Why are they waiting?") ? step.highlight : ""}
                >
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RecruitingProcess;
