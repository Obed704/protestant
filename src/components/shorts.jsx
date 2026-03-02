import React, { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext.jsx";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/videos`;

const VideoCard = () => {
  const { user } = useContext(AuthContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCommentsMobile, setShowCommentsMobile] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [likedVideos, setLikedVideos] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const commentsEndRef = useRef(null);
  const lastTapRef = useRef(0);

  const token = localStorage.getItem("token");

  // Fetch videos
  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle resize for mobile view
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINT);
      const data = await res.json();
      
      if (data.success) {
        setVideos(data.videos || []);
        
        // Initialize liked videos state
        const liked = {};
        data.videos?.forEach(video => {
          liked[video._id] = false; // You might want to check user's liked videos
        });
        setLikedVideos(liked);
      }
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentVideo = videos[currentIndex];

  // Auto-play for uploaded videos
  useEffect(() => {
    if (currentVideo?.type === 'uploaded' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex, currentVideo]);

  // Scroll to bottom of comments
  useEffect(() => {
    if (commentsEndRef.current)
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [currentVideo?.comments]);

  // Increment view count
  useEffect(() => {
    if (currentVideo?._id) {
      fetch(`${API_ENDPOINT}/${currentVideo._id}/view`, {
        method: 'POST'
      }).catch(console.error);
    }
  }, [currentVideo?._id]);

  // Add comment
  const handleSend = async () => {
    if (!user) return alert("Please login to comment!");
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_ENDPOINT}/${currentVideo._id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to comment");
      }

      if (data.success) {
        const updatedVideos = [...videos];
        updatedVideos[currentIndex] = data.video;
        setVideos(updatedVideos);
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Error sending comment");
    }
  };

  // Add reply
  const handleSendReply = async (commentId) => {
    if (!user) return alert("Please login to reply!");
    const text = replyTexts[commentId]?.trim();
    if (!text) return;

    try {
      const res = await fetch(
        `${API_ENDPOINT}/${currentVideo._id}/comment/${commentId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to reply");
      }

      if (data.success) {
        const updatedVideos = [...videos];
        updatedVideos[currentIndex] = data.video;
        setVideos(updatedVideos);
        setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
        setShowReplyInput((prev) => ({ ...prev, [commentId]: false }));
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Error sending reply");
    }
  };

  // Like/unlike video
  const handleLikeToggle = async () => {
    if (!user) return alert("Please login to like!");
    try {
      const res = await fetch(`${API_ENDPOINT}/${currentVideo._id}/like`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to like");
      }

      if (data.success) {
        const updatedVideos = [...videos];
        updatedVideos[currentIndex] = data.video;
        setVideos(updatedVideos);
        
        // Toggle liked state locally
        setLikedVideos(prev => ({
          ...prev,
          [currentVideo._id]: !prev[currentVideo._id]
        }));
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Error liking video");
    }
  };

  // Double-tap like (only for uploaded videos)
  const handleDoubleTap = (e) => {
    if (!user || currentVideo?.type === 'youtube') return;
    if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") return;

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!likedVideos[currentVideo._id]) handleLikeToggle();
    }
    lastTapRef.current = now;
  };

  // Download video (only for uploaded videos)
  const handleDownload = () => {
    if (currentVideo?.type !== 'uploaded') {
      alert("YouTube videos cannot be downloaded directly");
      return;
    }
    
    const link = document.createElement("a");
    link.href = currentVideo.src;
    link.download = currentVideo.src.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share video
  const handleShare = () => {
    const shareUrl = currentVideo.type === 'youtube' 
      ? currentVideo.youtubeUrl 
      : currentVideo.src;
    
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => alert("Video link copied to clipboard!"))
      .catch(() => alert("Failed to copy link."));
  };

  // Navigation
  const goNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">No videos available</p>
          <button 
            onClick={fetchVideos}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col md:flex-row w-full bg-black">
      {/* Video Section */}
      <div
        className="relative flex-1 flex items-center justify-center bg-black"
        onClick={currentVideo.type === 'uploaded' ? handleDoubleTap : undefined}
      >
        {currentVideo.type === 'uploaded' ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={currentVideo.src}
            controls
            autoPlay
            loop
            playsInline
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={currentVideo.src}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`YouTube - ${currentVideo.title}`}
          />
        )}

        {/* Video Type Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            currentVideo.type === 'youtube' 
              ? 'bg-red-600 text-white' 
              : 'bg-blue-600 text-white'
          }`}>
            {currentVideo.type === 'youtube' ? 'YouTube' : 'Local'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-10">
          <button
            onClick={handleLikeToggle}
            className={`flex flex-col items-center p-3 rounded-full shadow-lg transition ${
              likedVideos[currentVideo._id]
                ? "bg-red-500 text-white"
                : "bg-white/20 text-white backdrop-blur-sm"
            }`}
          >
            <span className="text-2xl">❤️</span>
            <span className="text-xs mt-1">{currentVideo.likes}</span>
          </button>
          
          <button
            className="flex flex-col items-center p-3 rounded-full shadow-lg bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition"
            onClick={() => setShowCommentsMobile(true)}
          >
            <span className="text-2xl">💬</span>
            <span className="text-xs mt-1">{currentVideo.comments?.length || 0}</span>
          </button>
          
          {currentVideo.type === 'uploaded' && (
            <button
              className="flex flex-col items-center p-3 rounded-full shadow-lg bg-white/20 text-white backdrop-blur-sm hover:bg-green-500 transition"
              onClick={handleDownload}
            >
              <span className="text-2xl">⬇️</span>
              <span className="text-xs mt-1">Download</span>
            </button>
          )}
          
          <button
            className="flex flex-col items-center p-3 rounded-full shadow-lg bg-white/20 text-white backdrop-blur-sm hover:bg-yellow-500 transition"
            onClick={handleShare}
          >
            <span className="text-2xl">🔗</span>
            <span className="text-xs mt-1">Share</span>
          </button>
          
          <div className="flex flex-col items-center p-3 rounded-full shadow-lg bg-white/20 text-white backdrop-blur-sm">
            <span className="text-2xl">👁️</span>
            <span className="text-xs mt-1">{currentVideo.views}</span>
          </div>
        </div>

        {/* Video Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent p-6">
          <h2 className="text-xl font-bold text-white mb-2">{currentVideo.title}</h2>
          <p className="text-gray-300 text-sm">{currentVideo.description}</p>
          {currentVideo.type === 'youtube' && (
            <p className="text-gray-400 text-xs mt-1">Channel: {currentVideo.youtubeChannel}</p>
          )}
        </div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl bg-black/50 hover:bg-black/70 rounded-full p-2 z-20 transition"
          >
            ←
          </button>
        )}
        
        {currentIndex < videos.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl bg-black/50 hover:bg-black/70 rounded-full p-2 z-20 transition"
          >
            →
          </button>
        )}
      </div>

      {/* Comments Section */}
      {(showCommentsMobile || !isMobile) && (
        <div className={`${
          isMobile
            ? "fixed inset-0 bg-black/90 z-50 flex flex-col"
            : "md:w-96 h-full flex flex-col border-l border-gray-800"
        }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
            <h3 className="text-white font-semibold">Comments ({currentVideo.comments?.length || 0})</h3>
            {isMobile && (
              <button
                className="text-white text-xl"
                onClick={() => setShowCommentsMobile(false)}
              >
                ✕
              </button>
            )}
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentVideo.comments?.length > 0 ? (
              currentVideo.comments.map((comment) => (
                <div key={comment._id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {comment.user?.charAt(0) || "U"}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{comment.user}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 mt-1">{comment.text}</p>
                      
                      {/* Reply Button */}
                      <button
                        className="text-sm text-blue-400 hover:text-blue-300 mt-2"
                        onClick={() => setShowReplyInput(prev => ({
                          ...prev,
                          [comment._id]: !prev[comment._id]
                        }))}
                      >
                        Reply
                      </button>
                      
                      {/* Reply Input */}
                      {showReplyInput[comment._id] && (
                        <div className="mt-3 flex space-x-2">
                          <input
                            type="text"
                            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Write a reply..."
                            value={replyTexts[comment._id] || ""}
                            onChange={(e) => setReplyTexts(prev => ({
                              ...prev,
                              [comment._id]: e.target.value
                            }))}
                          />
                          <button
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 text-sm"
                            onClick={() => handleSendReply(comment._id)}
                          >
                            Send
                          </button>
                        </div>
                      )}
                      
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 border-l-2 border-gray-700 pl-4">
                          <button
                            className="text-sm text-gray-400 hover:text-gray-300 mb-2"
                            onClick={() => toggleReplies(comment._id)}
                          >
                            {showReplies[comment._id] ? "Hide" : "View"} {comment.replies.length} replies
                          </button>
                          
                          {showReplies[comment._id] && (
                            <div className="space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply._id} className="bg-gray-700 rounded p-3">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-white text-sm">
                                      {reply.user}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 text-sm mt-1">{reply.text}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No comments yet. Be the first to comment!</p>
              </div>
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 font-medium"
                onClick={handleSend}
                disabled={!newComment.trim()}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;