// src/components/Gallery.jsx
import React, { useEffect, useState } from "react";

// Load backend URL from environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/gallery`);
        const data = await res.json();
        setGalleryImages(data);
      } catch (err) {
        console.error("Error loading gallery:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading gallery…</div>;
  }

  if (galleryImages.length === 0) {
    return <div className="p-6 text-center text-gray-500">No images found in gallery.</div>;
  }

  return (
    <section
      id="gallery"
      className="p-6 md:p-10 w-full flex flex-col items-center justify-center bg-gray-50"
    >
      {/* Heading */}
      <h2 className="text-3xl md:mb-16 md:text-4xl font-serif font-semibold text-center mb-3 tracking-wide" style={{ color: "rgb(242, 30, 167)" }}>
        Champions Gallery
      </h2>

      {/* Gallery container */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full max-w-6xl">
        {galleryImages.map((item, index) => (
          <div
            key={item._id || index}
            className="
              relative overflow-hidden rounded-xl shadow-lg bg-white
              hover:scale-105 hover:shadow-xl transition-all duration-500
              flex items-center justify-center
            "
            style={{
              width: index % 2 === 0 ? "320px" : "420px",
              height: index % 2 === 0 ? "220px" : "300px",
            }}
          >
            <img
              src={`${BACKEND_URL}${item.image}`}
              alt={item.alt || `Gallery ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Overlay Text on Hover */}
            <div
              className="
                absolute inset-0 bg-black/40 opacity-0 
                hover:opacity-100 flex items-center justify-center 
                text-white text-lg font-medium transition-opacity duration-300
              "
            >
              {item.title || item.alt || "Champions Gallery"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;
