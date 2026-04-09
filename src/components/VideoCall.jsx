import React, { useRef, useState, useEffect } from "react";
import { FiVideo, FiVolume2, FiVolumeX, FiPlay, FiPause, FiRefreshCw } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/videos`;
const BG_VIDEO_URL = `${API_BASE_URL}/videos/bg-video.mp4`;

const LiveMeeting = () => {
  const liveRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [isLiveMuted, setIsLiveMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [videosList, setVideosList] = useState([]);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_ENDPOINT);
        const data = await res.json();
        if (data.length > 0) {
          const formattedVideos = data.map((video, index) => ({
            ...video,
            ref: React.createRef(),
            muted: true,
            isActive: index === 0
          }));
          setVideosList(formattedVideos);
          setVideo(formattedVideos[0]);
        }
      } catch (err) {
        console.error("Error fetching video:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, []);

  useEffect(() => {
    if (video?.ref.current?.play) {
      video.ref.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Autoplay blocked:", err));
    }
  }, [video]);

  const toggleMute = () => {
    if (video?.ref.current) {
      video.ref.current.muted = !video.ref.current.muted;
      setVideo((prev) => ({ ...prev, muted: video.ref.current.muted }));
    }
  };

  const toggleLiveMute = () => {
    if (liveRef.current) {
      liveRef.current.muted = !liveRef.current.muted;
      setIsLiveMuted(liveRef.current.muted);
    }
  };

  const togglePlayPause = () => {
    if (video?.ref.current) {
      if (isPlaying) video.ref.current.pause();
      else video.ref.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const selectVideo = (selectedVideo) => {
    if (video?.ref.current) video.ref.current.pause();
    const updatedVideos = videosList.map(v => ({ ...v, isActive: v.id === selectedVideo.id }));
    setVideosList(updatedVideos);
    setVideo({ ...selectedVideo, ref: selectedVideo.ref || React.createRef() });
    setIsPlaying(true);
  };

  const restartVideo = () => {
    if (video?.ref.current) {
      video.ref.current.currentTime = 0;
      video.ref.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 p-4 md:p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 md:mb-12 text-white"
      >
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <FiVideo className="text-4xl" />
          <h1 className="text-4xl md:text-5xl font-bold">Live Meeting Center</h1>
        </div>
        <p className="text-lg md:text-xl font-light">
          Stay connected with real-time updates and recorded sessions
        </p>
      </motion.div>

      {/* Videos Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-blue-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">Recorded Sessions</h2>
              <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">{videosList.length} videos</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
              </div>
            ) : videosList.length > 0 ? (
              <div className="space-y-4">
                {videosList.map((vid, index) => (
                  <div
                    key={vid.id || index}
                    onClick={() => selectVideo(vid)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 ${
                      vid.isActive ? 'bg-blue-600 border-cyan-400 shadow-lg' : 'bg-blue-700 hover:bg-blue-600/80 border-blue-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${vid.isActive ? 'bg-white/20' : 'bg-blue-700/30'}`}>
                        <FiVideo className={vid.isActive ? "text-white" : "text-blue-300"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium truncate ${vid.isActive ? 'text-white' : 'text-blue-100'}`}>{vid.title || `Session ${index+1}`}</h3>
                        <p className="text-sm text-blue-300/70 truncate">{vid.description || "Meeting recording"}</p>
                      </div>
                      {vid.isActive && <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-blue-300 py-8">No recorded videos available</p>
            )}
          </div>
        </motion.div>

        {/* Main Live Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-blue-800 rounded-2xl p-5 shadow-lg">
            {/* Selected Video */}
            <AnimatePresence mode="wait">
              {video && (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-between mb-4 text-white">
                    <div>
                      <h3 className="text-2xl font-bold">{video.title || "Selected Session"}</h3>
                      <p className="text-blue-300">{video.description || "Meeting recording"}</p>
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden shadow-lg bg-black">
                    <video
                      ref={video.ref}
                      className="w-full h-[300px] md:h-[400px] object-cover"
                      src={video.src}
                      loop
                      muted={video.muted}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 flex justify-between items-center">
                      <div className="flex gap-3">
                        <button onClick={togglePlayPause} className="p-2 rounded-full bg-white/20">
                          {isPlaying ? <FiPause className="text-white" /> : <FiPlay className="text-white" />}
                        </button>
                        <button onClick={restartVideo} className="p-2 rounded-full bg-white/20">
                          <FiRefreshCw className="text-white" />
                        </button>
                        <button onClick={toggleMute} className="p-2 rounded-full bg-white/20">
                          {video.muted ? <FiVolumeX className="text-white" /> : <FiVolume2 className="text-white" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Stream */}
            <div>
              <div className="flex items-center justify-between mb-4 text-white">
                <h3 className="text-2xl font-bold">Live Broadcast</h3>
                <div className="flex items-center gap-2 text-red-400 font-medium">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  LIVE NOW
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <video
                  ref={liveRef}
                  className="w-full h-[200px] md:h-[250px] object-cover"
                  src={BG_VIDEO_URL}
                  autoPlay
                  loop
                  muted={isLiveMuted}
                />
                <button
                  onClick={toggleLiveMute}
                  className={`absolute top-4 right-4 px-4 py-2 rounded-full text-white ${
                    isLiveMuted ? 'bg-red-500' : 'bg-green-500'
                  }`}
                >
                  {isLiveMuted ? "Unmute" : "Mute"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveMeeting;
