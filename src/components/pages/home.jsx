// pages/home.jsx
import React, { useState, useEffect } from "react";
import Header from "../Header.jsx";
import HeroSection from "../welcome.jsx";
import MissionVision from "../visionMission.jsx";
import ChampionsSection from "../champions.jsx";
import StatsSection from "../counter.jsx";
import TestimonialsSlider from "../comments.jsx";
import GetInvolved from "../getInvolved.jsx";
import SupportComponent from "../pages/supportComponent.jsx";
import SponsorsSection from "../sponsorSection.jsx";
import Footer from "../Footer.jsx";
import ChatBolt from "../ChatBolt.jsx";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // All data in one place
  const [data, setData] = useState({
    navbar:    null,
    hero:      null,
    slides:    [],
    missionVision: [],
    champions: [],
    stats:     null,
    testimonials: [],
    getInvolved: [],
    support:   [],
    sponsors:  [],
  });

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      try {
        const endpoints = [
          "/api/navbar",
          "/api/hero",
          "/api/slides",
          "/api/mission-vision",
          "/api/champions",
          "/api/stats",
          "/api/testimonials",
          "/api/getinvolved",
          "/api/support",
          "/api/sponsors",
        ];

        const promises = endpoints.map((ep) =>
          fetch(`${BACKEND_URL}${ep}`).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status} on ${ep}`);
            return r.json();
          })
        );

        const [
          navbar,
          hero,
          slides,
          missionVision,
          championsRaw,
          stats,
          testimonials,
          getInvolved,
          support,
          sponsorsRaw,
        ] = await Promise.all(promises);

        // Optional: sort champions here (same logic you had)
        const champions = championsRaw
          .slice()
          .sort((a, b) => {
            const ya = a.year || 0;
            const yb = b.year || 0;
            if (yb !== ya) return yb - ya;
            return b._id.localeCompare(a._id);
          });

        if (!isMounted) return;

        setData({
          navbar,
          hero,
          slides,
          missionVision,
          champions,
          stats,
          testimonials,
          getInvolved,
          support,
          sponsors: sponsorsRaw,
        });
      
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAll();

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl mb-4">Something went wrong</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // ── Now safely render everything ────────────────────────────────
  return (
    <>
      <Header fixed={true} settings={data.navbar} />
      <HeroSection hero={data.hero} slides={data.slides} />
      <MissionVision cards={data.missionVision} />
      <ChatBolt />
      <ChampionsSection championsFromParent={data.champions} />
      {/* {console.log(data.champions)} */}
      <StatsSection statsSettings={data.stats} />
      <TestimonialsSlider testimonials={data.testimonials} />
      <GetInvolved involvementData={data.getInvolved} />
      <SupportComponent supportCards={data.support} />
      <SponsorsSection sponsors={data.sponsors} />
      <Footer />
    </>
  );
}