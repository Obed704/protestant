import React, { useEffect, useState } from "react";
import axios from "axios";
import EnhancedHeader from "./header";
import Footer from "./footer";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/bibleStudies`;

const StudyList = ({ onSelect }) => {
  const [studies, setStudies] = useState([]);

  useEffect(() => {
    axios
      .get(API_ENDPOINT)
      .then((res) => setStudies(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <EnhancedHeader />
      <div className="p-8 h-screen">
        <h2 className="text-2xl font-bold mb-6">📖 Bible Study Topics</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {studies.map((study) => (
            <div
              key={study._id}
              onClick={() => onSelect(study._id)}
              className="p-6 bg-white rounded-lg shadow hover:shadow-lg hover:shadow-blue-500/40 cursor-pointer transition"
            >
              <h3 className="text-lg font-semibold mb-2">{study.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-3">
                {study.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StudyList;