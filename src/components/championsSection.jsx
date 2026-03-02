import React, { useEffect, useState } from "react";
import ChampionCard from "./championsCard.jsx";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ChampionsSection = () => {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const GradientBanner = () => (
    <div className="bg-gradient-to-r from-[rgb(23,207,220)] via-[rgba(23,207,220,0.5)] to-[rgb(23,207,220)] py-10 text-center shadow-md">
      <h1 className="text-4xl font-extrabold text-black tracking-wide">
        Champions
      </h1>
    </div>
  );

  useEffect(() => {
    let mounted = true;

    const fetchChampions = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/champions`);
        if (!res.ok) throw new Error("Failed to fetch champions");

        const data = await res.json();

        if (!mounted) return;

        const normalized = Array.isArray(data) ? data : [];

        setChampions(
          normalized.map((c) => ({
            ...c,
            image: `${BACKEND_URL}${c.image?.startsWith("/") ? "" : "/"}${c.image}`,
          }))
        );

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load champions");
        setLoading(false);
      }
    };

    fetchChampions();
    return () => (mounted = false);
  }, []);

  if (loading) return <p className="text-center py-10">Loading champions...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  return (
    <>
      <GradientBanner />
      <div className="max-w-6xl mx-auto py-16 space-y-16">
        {champions.map((champion, index) => (
          <ChampionCard
            key={champion._id}
            champion={champion}
            reverse={index % 2 !== 0}
          />
        ))}
      </div>
    </>
  );
};

export default ChampionsSection;
