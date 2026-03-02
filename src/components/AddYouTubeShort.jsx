import React, { useState, useContext } from "react";
import { AuthContext } from "../context/authContext.jsx";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/videos`;

const AddYouTubeShort = ({ onVideoAdded }) => {
  const { user } = useContext(AuthContext);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const token = localStorage.getItem("token");

  // Extract YouTube ID from various URL formats
  const extractYouTubeId = (url) => {
    const patterns = [
      /(?:youtube\.com\/shorts\/|youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1].substring(0, 11);
      }
    }
    return null;
  };

  // Fetch video preview from YouTube oEmbed + thumbnail
  const fetchPreview = async (videoId) => {
    try {
      // Use YouTube oEmbed for title and author
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );

      if (oembedRes.ok) {
        const data = await oembedRes.json();
        setPreview({
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          title: data.title || "YouTube Video",
          author: data.author_name || "Unknown",
        });
      } else {
        // Fallback: just show thumbnail
        setPreview({
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          title: "YouTube Video",
          author: "Unknown",
        });
      }
    } catch (err) {
      console.warn("Failed to fetch YouTube preview:", err);
      // Still show thumbnail even if oEmbed fails
      setPreview({
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        title: "YouTube Video",
        author: "Unknown",
      });
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value.trim();
    setUrl(newUrl);
    setError("");

    const videoId = extractYouTubeId(newUrl);
    if (videoId) {
      fetchPreview(videoId);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please log in to add YouTube Shorts");
      return;
    }

    if (!url.trim()) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      setError("Invalid YouTube URL. Please check and try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_ENDPOINT}/youtube`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: url.trim(),
          text: text.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add YouTube Short");
      }

      // Success!
      setUrl("");
      setText("");
      setPreview(null);

      if (onVideoAdded) {
        onVideoAdded(data); // Pass new video to parent (e.g. to refresh list)
      }

      alert("YouTube Short added successfully! 🎉");
    } catch (err) {
      console.error("Error adding YouTube Short:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-8 mb-10 shadow-xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Add YouTube Short</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YouTube URL
          </label>
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://youtube.com/shorts/... or https://youtu.be/..."
            className="w-full px-5 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            required
          />
          <p className="text-xs text-gray-400 mt-2">
            Supports YouTube Shorts, regular videos, and youtu.be links
          </p>
        </div>

        {/* Video Preview */}
        {preview && (
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-3">Preview:</p>
            <div className="flex gap-4">
              <img
                src={preview.thumbnail}
                alt="Video thumbnail"
                className="w-48 h-36 object-cover rounded-lg shadow-md"
              />
              <div className="flex-1">
                <h3 className="text-white font-semibold line-clamp-2">
                  {preview.title}
                </h3>
                <p className="text-gray-400 text-sm mt-1">By: {preview.author}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Comment (Optional)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts about this short..."
            className="w-full px-5 py-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
            rows="4"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-5 py-3 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !url}
          className={`w-full py-4 rounded-lg font-bold text-lg transition shadow-lg ${
            loading || !url
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {loading ? "Adding Short..." : "Add YouTube Short"}
        </button>
      </form>
    </div>
  );
};

export default AddYouTubeShort;