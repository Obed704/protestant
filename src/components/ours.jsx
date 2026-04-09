// components/GospelSongs.jsx
import React, { useState } from "react";
import { FiPlay, FiX } from "react-icons/fi";

// Add YouTube link and description here
const videos = [
  {
    link: "https://youtu.be/oSwlZVl5oXA?list=RDoSwlZVl5oXA",
    description: "waramenye by ebenezer family choir",
  },
  {
    link: "https://youtu.be/rEPdjdmgpCg",
    description: "yaratuzahuye .. ebenezer",
  },
  {
    link: "https://youtu.be/yjpf7k0yb8U",
    description: "uyakire ebenezer ",
  },
  {
    link: "https://youtu.be/ytN1uREOq3U?list=RDytN1uREOq3U",
    description: "bethel .... humura",
  },
  {
    link: "https://youtu.be/pv7Ty2y_wMQ?list=RDytN1uREOq3U",
    description: "bethel ....dufite imana ikora",
  },
  {
    link: "https://youtu.be/ghMlkJ-24cs?list=RDytN1uREOq3U",
    description: "bethel ... service 2",
  },
  {
    link: "https://youtu.be/84iG8KWV5kQ?list=RDQMTctBPByXZUk",
    description: "Uplifting Gospel Track 2",
  },
  {
    link: "https://youtu.be/aBOexazN3xs?list=RDQMTctBPByXZUk",
    description: "Uplifting Gospel Track 2",
  },
  {
    link: "https://youtu.be/4mpqTVONxko?list=RDQMTctBPByXZUk&t=3",
    description: "Uplifting Gospel Track 2",
  },
];

const getVideoId = (url) => {
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const GospelSongs = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <section
      className="py-16 bg-gray-900 text-white px-8"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <h2 className="text-4xl font-bold mb-8 text-yellow-300">
        our choirs songs
      </h2>
      <div
        className="flex space-x-6 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {videos.map((video, index) => {
          const videoId = getVideoId(video.link);
          if (!videoId) return null;

          return (
            <div
              key={index}
              className="relative min-w-[200px] bg-gray-800 rounded-xl overflow-hidden shadow-lg group hover:scale-105 transform transition"
            >
              <img
                src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
                alt="Gospel Song"
                className="w-full h-48 object-cover"
              />

              {/* Overlay play button */}
              <button
                onClick={() => setActiveVideo(videoId)}
                className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition duration-300 flex justify-center items-center text-yellow-300 text-3xl"
              >
                <FiPlay />
              </button>

              {/* Description under thumbnail */}
              <p className="p-2 text-sm text-gray-200">{video.description}</p>
            </div>
          );
        })}
      </div>

      {/* Modal for playing video */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 px-4">
          <div className="relative w-full max-w-3xl aspect-video">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-2 right-2 text-white text-2xl z-10"
            >
              <FiX />
            </button>
            <iframe
              className="w-full h-full rounded-xl"
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
              title="Gospel Song"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
};

export default GospelSongs;
