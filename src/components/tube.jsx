import React, { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause, FaBackward, FaForward, FaTimes, FaSearch } from "react-icons/fa";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL
const API_ENDPOINT = `${API_BASE_URL}/api/songs`;

const getVideoId = (url) => {
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const GospelSongs = () => {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const playerRef = useRef(null);

  // Fetch videos
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await axios.get(API_ENDPOINT);
        setVideos(res.data);
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      }
    };
    fetchSongs();
  }, []);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // Initialize player when activeVideo changes
  useEffect(() => {
    if (activeVideo && window.YT) {
      playerRef.current = new window.YT.Player("youtube-player", {
        videoId: activeVideo,
        playerVars: { autoplay: 1, modestbranding: 1 },
      });
    }
  }, [activeVideo]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const player = playerRef.current;
      if (!player) return;

      switch (e.key) {
        case "ArrowRight":
          player.seekTo(player.getCurrentTime() + 10, true);
          break;
        case "ArrowLeft":
          player.seekTo(player.getCurrentTime() - 10, true);
          break;
        case "ArrowUp":
          player.setVolume(Math.min(player.getVolume() + 10, 100));
          break;
        case "ArrowDown":
          player.setVolume(Math.max(player.getVolume() - 10, 0));
          break;
        case " ":
          e.preventDefault();
          const state = player.getPlayerState();
          if (state === 1) player.pauseVideo();
          else player.playVideo();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideo]);

  // Double tap skip
  let lastTap = 0;
  const handleDoubleTap = (e) => {
    const player = playerRef.current;
    if (!player) return;

    const now = new Date().getTime();
    const dt = now - lastTap;
    lastTap = now;

    if (dt < 300) {
      const x = e.nativeEvent.offsetX;
      const width = e.target.offsetWidth;
      if (x < width / 2) player.seekTo(player.getCurrentTime() - 10, true);
      else player.seekTo(player.getCurrentTime() + 10, true);
    }
  };

  const filteredVideos = videos.filter((video) =>
    video.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-16 px-4 md:px-16 bg-gray-900 text-white">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-yellow-400">
        Worship with Us
      </h2>

      {/* Search bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search songs..."
            className="w-full px-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Scrollable video grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 overflow-y-auto max-h-[70vh] pr-2">
        {filteredVideos.map((video, index) => {
          const videoId = getVideoId(video.link);
          if (!videoId) return null;

          return (
            <div
              key={index}
              className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition duration-300 cursor-pointer"
              onClick={() => setActiveVideo(videoId)}
            >
              <img
                src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
                alt={video.name}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex justify-center items-center opacity-0 hover:opacity-100 transition duration-300">
                <FaPlay className="text-5xl text-yellow-400 drop-shadow-lg" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-sm font-semibold truncate">{video.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {activeVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 text-white text-3xl z-10 hover:text-yellow-400 transition"
            >
              <FaTimes />
            </button>

            <div className="w-full h-full" onClick={handleDoubleTap}>
              <iframe
                id="youtube-player"
                className="w-full h-full rounded-2xl"
                src={`https://www.youtube.com/embed/${activeVideo}?enablejsapi=1&autoplay=1`}
                title="Gospel Song"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="absolute bottom-4 left-4 flex space-x-4">
              <button
                className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                onClick={() =>
                  playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10, true)
                }
              >
                <FaBackward /> 10s
              </button>
              <button
                className="p-2 bg-yellow-400 rounded hover:bg-yellow-300"
                onClick={() => {
                  const state = playerRef.current.getPlayerState();
                  if (state === 1) playerRef.current.pauseVideo();
                  else playerRef.current.playVideo();
                }}
              >
                <FaPlay />
              </button>
              <button
                className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                onClick={() =>
                  playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10, true)
                }
              >
                10s <FaForward />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GospelSongs;