// App.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../Header";
import Fll from "../fll";
import RecruitingProcess from "../recruiting";
import Footer from "../Footer";
import EducationElements from "../educationElements";
import ThumbnailCarouselFullScreen from "../imageSlider";
import ChatBolt from "../ChatBolt";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pageData, setPageData] = useState({
    navbar: null,
    fll: [],
    process: [],
    education: [],
    slides: [],
  });

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        const endpoints = [
          "/api/navbar",
          "/api/fll",
          "/api/process",
          "/api/education",
          "/api/project-slides",
        ];

        const promises = endpoints.map((endpoint) =>
          fetch(`${BACKEND_URL}${endpoint}`).then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch ${endpoint} – ${res.status}`);
            }
            return res.json();
          })
        );

        const [
          navbar,
          fllData,
          processData,
          educationData,
          slidesData,
        ] = await Promise.all(promises);

        if (!isMounted) return;

        setPageData({
          navbar,
          fll: fllData,
          process: processData,
          education: educationData,
          slides: slidesData,
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to load page data:", err);
        setError(err.message || "Could not load the content. Please try again.");
        setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <img
            src={`./welcomeSlide/Logo.png`} // or static /public/logo.png
            alt="STEM Inspires"
            className="w-32 mx-auto mb-6 animate-pulse"
          />
          <div className="text-white text-xl">Loading STEM Inspires…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-white p-6"
        style={{ backgroundColor: "rgb(23, 207, 220)" }}
      >
        <div className="text-center max-w-lg">
          <h2 className="text-4xl mb-6">Oops...</h2>
          <p className="text-xl mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white text-[rgb(34, 49, 50)] font-bold rounded-full shadow-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "rgb(23, 207, 220)" }}>
      <Navbar settings={pageData.navbar} />
      <Fll data={pageData.fll} />
      <RecruitingProcess steps={pageData.process} />
      <EducationElements elements={pageData.education} />
      <ChatBolt />
      <ThumbnailCarouselFullScreen initialSlides={pageData.slides} />
      <Footer />
    </div>
  );
}

export default App;
