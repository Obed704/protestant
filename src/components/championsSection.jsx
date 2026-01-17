import React, { useEffect, useState } from "react";
import ChampionCard from "./championsCard.jsx"; // keep the same import
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ChampionsSection = () => {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const GradientBanner = () => (
  <div className="bg-gradient-to-r from-[rgb(23,207,220)] via-[rgb(23,207,220,0.5)] to-[rgb(23,207,220)] py-10 text-center shadow-md">
    <h1 className="text-4xl font-extrabold text-black tracking-wide">
      Champions
    </h1>
  </div>
);


  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/champions`);
        if (!res.ok) throw new Error("Failed to fetch champions");
        const data = await res.json();

        // Prepend backend URL to images
        const formattedData = data.map((champion) => ({
          ...champion,
          image: `${BACKEND_URL}${champion.image}`,
        }));

        setChampions(formattedData);
      } catch (err) {
        console.error(err);
        setError("Could not load champions");
      } finally {
        setLoading(false);
      }
    };

    fetchChampions();
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
            reverse={index % 2 !== 0} // reverse layout for even-indexed cards
          />
        ))}
      </div>
    </>
  );
};

export default ChampionsSection;
