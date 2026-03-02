import React, { useState, useRef, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaForward,
  FaBackward,
  FaYoutube,
  FaVideo,
  FaFilter,
  FaHeart,
  FaComment,
  FaEye,
} from "react-icons/fa";
import { getVideoThumbnail } from "../utils/thumbnailGenerator";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/largeVideo`;

const LargeVideos = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [thumbnails, setThumbnails] = useState({});
  const [filterType, setFilterType] = useState("all"); // 'all', 'uploaded', 'youtube'
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(API_ENDPOINT);
        const data = await res.json();
        setVideos(data);

        // Generate thumbnails for uploaded videos
        const thumbs = {};
        for (const video of data) {
          if (video.type === "uploaded") {
            try {
              thumbs[video._id] = await getVideoThumbnail(video.src, 15);
            } catch (err) {
              console.warn(`Thumbnail failed for ${video.src}`, err);
              thumbs[video._id] =
                "https://via.placeholder.com/320x180?text=No+Thumbnail";
            }
          } else if (video.type === "youtube") {
            // Use YouTube thumbnail
            thumbs[
              video._id
            ] = `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
          }
        }
        setThumbnails(thumbs);
      } catch (err) {
        console.error("Error fetching videos:", err);
      }
    };
    fetchVideos();
  }, []);

  const openVideo = (video) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    setShowComments(false);
  };

  const closeVideo = () => {
    if (videoRef.current) videoRef.current.pause();
    if (iframeRef.current) {
      // Stop YouTube video by changing src
      const iframe = iframeRef.current;
      iframe.src = iframe.src;
    }
    setIsPlaying(false);
    setProgress(0);
    setSelectedVideo(null);
  };

  const togglePlay = () => {
    if (!selectedVideo) return;

    if (selectedVideo.type === "uploaded") {
      if (!videoRef.current) return;
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }

    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && selectedVideo?.type === "uploaded") {
      setProgress(
        (videoRef.current.currentTime / videoRef.current.duration) * 100
      );
    }
  };

  const handleSeek = (e) => {
    if (selectedVideo?.type === "uploaded" && videoRef.current) {
      const newTime = (e.target.value / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(e.target.value);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = e.target.value;
    if (videoRef.current) videoRef.current.volume = vol;
    setVolume(vol);
  };

  const handleSpeedChange = (e) => {
    const spd = e.target.value;
    if (videoRef.current) videoRef.current.playbackRate = spd;
    setSpeed(spd);
  };

  const skipTime = (seconds) => {
    if (selectedVideo?.type === "uploaded" && videoRef.current) {
      videoRef.current.currentTime += seconds;
      setProgress(
        (videoRef.current.currentTime / videoRef.current.duration) * 100
      );
    }
  };

  // Handle like
  const handleLike = async () => {
    if (!selectedVideo) return;

    try {
      const res = await fetch(
        `${API_ENDPOINT}/${selectedVideo._id}/like`,
        {
          method: "POST",
        }
      );
      const updatedVideo = await res.json();
      setSelectedVideo(updatedVideo);

      // Update in videos list
      setVideos(
        videos.map((v) => (v._id === updatedVideo._id ? updatedVideo : v))
      );
    } catch (err) {
      console.error("Error liking video:", err);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!selectedVideo || !newComment.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to comment");
      return;
    }

    try {
      const res = await fetch(
        `${API_ENDPOINT}/${selectedVideo._id}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newComment }),
        }
      );
      const updatedVideo = await res.json();
      setSelectedVideo(updatedVideo);
      setNewComment("");

      // Update in videos list
      setVideos(
        videos.map((v) => (v._id === updatedVideo._id ? updatedVideo : v))
      );
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment");
    }
  };

  // Filter videos
  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.uploader?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || video.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 overflow-scroll h-screen hover:cursor-pointer bg-gray-50">
      {/* Header with Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                filterType === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FaFilter /> All
            </button>
            <button
              onClick={() => setFilterType("uploaded")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                filterType === "uploaded"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FaVideo /> Uploaded
            </button>
            <button
              onClick={() => setFilterType("youtube")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                filterType === "youtube"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FaYoutube /> YouTube
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaVideo className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Uploaded Videos</p>
                <p className="text-2xl font-bold">
                  {videos.filter((v) => v.type === "uploaded").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaYoutube className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">YouTube Videos</p>
                <p className="text-2xl font-bold">
                  {videos.filter((v) => v.type === "youtube").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaEye className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Videos</p>
                <p className="text-2xl font-bold">{videos.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredVideos.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No videos found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {filteredVideos.map((video) => (
          <div
            key={video._id}
            onClick={() => openVideo(video)}
            className="bg-white rounded-xl shadow-md hover:shadow-2xl hover:cursor-pointer transition transform hover:-translate-y-1 overflow-hidden group"
          >
            {/* Video Thumbnail */}
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={thumbnails[video._id] || "/images/no-thumbnail.png"}
                alt={video.title || "Untitled Video"}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Video Type Badge */}
              <div className="absolute top-2 left-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    video.type === "youtube"
                      ? "bg-red-600 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {video.type === "youtube" ? "YouTube" : "Uploaded"}
                </span>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <FaPlay className="text-white text-2xl" />
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-4">
              <h2 className="font-bold text-gray-800 text-lg truncate">
                {video.title || "Untitled Video"}
              </h2>
              <p className="text-gray-600 text-sm mt-1 truncate">
                {video.description}
              </p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FaHeart /> {video.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaComment /> {video.comments?.length || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaEye /> {video.views || 0}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  by {video.uploader || "Unknown"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <div>
                <h2 className="text-white font-bold text-xl">
                  {selectedVideo.title}
                </h2>
                <p className="text-gray-400">
                  {selectedVideo.type === "youtube" ? "YouTube" : "Uploaded"} •
                  by {selectedVideo.uploader}
                  {selectedVideo.type === "youtube" &&
                    ` • ${selectedVideo.youtubeChannel}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-white hover:text-blue-400"
                >
                  <FaComment className="text-xl" />
                </button>
                <button
                  onClick={handleLike}
                  className="text-white hover:text-red-400 flex items-center gap-2"
                >
                  <FaHeart /> {selectedVideo.likes}
                </button>
                <button
                  onClick={closeVideo}
                  className="text-white hover:text-gray-300 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Video Player */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 relative bg-black flex items-center justify-center">
                  {selectedVideo.type === "uploaded" ? (
                    <video
                      ref={videoRef}
                      src={selectedVideo.src}
                      autoPlay
                      controls
                      muted // required for autoplay without user interaction
                      onClick={() => {
                        videoRef.current.muted = false;
                      }} // unmute on first click
                    />
                  ) : (
                    <iframe
                      ref={iframeRef}
                      src={selectedVideo.src}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`YouTube - ${selectedVideo.title}`}
                    />
                  )}
                </div>

                {/* Controls for uploaded videos */}
                {selectedVideo.type === "uploaded" && (
                  <div className="bg-black bg-opacity-80 p-4 space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleSeek}
                      className="w-full"
                    />

                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => skipTime(-10)}
                          className="flex items-center gap-2 p-2 bg-gray-700 rounded hover:bg-gray-600"
                        >
                          <FaBackward /> 10s
                        </button>
                        <button
                          onClick={togglePlay}
                          className="p-3 bg-blue-600 rounded-full hover:bg-blue-500"
                        >
                          {isPlaying ? <FaPause /> : <FaPlay />}
                        </button>
                        <button
                          onClick={() => skipTime(10)}
                          className="flex items-center gap-2 p-2 bg-gray-700 rounded hover:bg-gray-600"
                        >
                          10s <FaForward />
                        </button>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {volume > 0 ? <FaVolumeUp /> : <FaVolumeMute />}
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-28"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <label className="text-white">Speed:</label>
                          <select
                            value={speed}
                            onChange={handleSpeedChange}
                            className="bg-gray-800 text-white rounded py-1 px-2"
                          >
                            <option value={0.5}>0.5x</option>
                            <option value={1}>1x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              {showComments && (
                <div className="w-96 border-l border-gray-800 flex flex-col">
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="text-white font-bold">
                      Comments ({selectedVideo.comments?.length || 0})
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedVideo.comments?.length > 0 ? (
                      selectedVideo.comments.map((comment, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                {comment.user?.charAt(0) || "U"}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-white">
                                  {comment.user}
                                </span>
                              </div>
                              <p className="text-gray-300 mt-1">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400">
                          No comments yet. Be the first to comment!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Comment Input */}
                  <div className="p-4 border-t border-gray-800">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleCommentSubmit()
                        }
                      />
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim()}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LargeVideos;