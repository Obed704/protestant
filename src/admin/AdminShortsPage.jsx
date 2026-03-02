import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Use your existing BASE_URL from .env → must be prefixed with VITE_ for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_URL = `${API_BASE_URL}/api/videos`;

const AdminVideoPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: ""
  });
  
  const [youtubeForm, setYoutubeForm] = useState({
    url: "",
    title: "",
    description: "",
    channel: "Unknown Channel"
  });
  
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editingForm, setEditingForm] = useState({
    title: "",
    description: ""
  });
  
  const [activeTab, setActiveTab] = useState("upload");
  const [videoFilter, setVideoFilter] = useState("all");
  const [stats, setStats] = useState(null);
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchVideos();
    fetchStats();
  }, [videoFilter]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const url = videoFilter === "all" 
        ? API_URL 
        : `${API_URL}?type=${videoFilter}`;
      
      const res = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${res.statusText}\nResponse: ${text.substring(0, 200)}`);
      }

      const data = await res.json();

      // Your API returns { success: true, videos: [...] }
      const videoList = data.success && Array.isArray(data.videos) 
        ? data.videos 
        : [];

      setVideos(videoList);
    } catch (err) {
      console.error("Error fetching videos:", err);
      alert("Failed to load videos. Check console and server.");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a video file!");

    const formData = new FormData();
    formData.append("video", selectedFile);
    formData.append("title", uploadForm.title);
    formData.append("description", uploadForm.description);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      alert("Video uploaded successfully!");
      setSelectedFile(null);
      setPreviewURL(null);
      setUploadForm({ title: "", description: "" });
      fetchVideos();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error uploading video");
    }
  };

  const handleAddYouTubeVideo = async () => {
    if (!youtubeForm.url) return alert("Please enter a YouTube URL!");

    try {
      const res = await fetch(`${API_URL}/youtube`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(youtubeForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add YouTube video");

      alert("YouTube video added successfully!");
      setYoutubeForm({ url: "", title: "", description: "", channel: "Unknown Channel" });
      fetchVideos();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error adding YouTube video");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");

      alert("Video deleted successfully!");
      fetchVideos();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error deleting video");
    }
  };

  const startEditing = (video) => {
    setEditingVideoId(video._id);
    setEditingForm({
      title: video.title || "",
      description: video.description || ""
    });
  };

  const saveEditing = async () => {
    if (!editingVideoId) return;

    try {
      const res = await fetch(`${API_URL}/${editingVideoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");

      alert("Video updated successfully!");
      setEditingVideoId(null);
      setEditingForm({ title: "", description: "" });
      fetchVideos();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error updating video");
    }
  };

  const cancelEditing = () => {
    setEditingVideoId(null);
    setEditingForm({ title: "", description: "" });
  };

  const getYouTubeIdFromUrl = (url) => {
    const patterns = [
      /(?:youtube\.com\/shorts\/|youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1].substring(0, 11);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
        <p className="text-gray-600 mt-2">Manage uploaded videos and YouTube shorts</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Videos</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalVideos}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Uploaded Videos</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.uploadedVideos}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">YouTube Shorts</h3>
            <p className="text-2xl font-bold text-red-600">{stats.youtubeVideos}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Likes</h3>
            <p className="text-2xl font-bold text-green-600">{stats.totalLikes}</p>
          </div>
        </div>
      )}

      {/* Add Video Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="border-b">
          <div className="flex">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === "upload" ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("upload")}
            >
              📤 Upload Video
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === "youtube" ? "bg-red-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("youtube")}
            >
              🔴 Add YouTube Short
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "upload" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Video File (MP4, MOV, AVI, etc.)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">Max file size: 100MB</p>
              </div>

              {previewURL && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
                  <video src={previewURL} controls className="w-full max-h-64 rounded-lg" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Title</label>
                <input
                  type="text"
                  placeholder="Enter video title..."
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Enter video description..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  !selectedFile ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Upload Video
              </button>
            </div>
          )}

          {activeTab === "youtube" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/shorts/... or https://youtu.be/..."
                  value={youtubeForm.url}
                  onChange={(e) => setYoutubeForm({...youtubeForm, url: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports YouTube Shorts URLs or regular YouTube video URLs
                </p>
                
                {youtubeForm.url && getYouTubeIdFromUrl(youtubeForm.url) && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                    <img 
                      src={`https://img.youtube.com/vi/${getYouTubeIdFromUrl(youtubeForm.url)}/maxresdefault.jpg`}
                      alt="YouTube Thumbnail"
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                    <p className="text-xs text-gray-600">
                      Video ID: {getYouTubeIdFromUrl(youtubeForm.url)}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter custom title"
                  value={youtubeForm.title}
                  onChange={(e) => setYoutubeForm({...youtubeForm, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channel Name</label>
                <input
                  type="text"
                  placeholder="Enter channel name"
                  value={youtubeForm.channel}
                  onChange={(e) => setYoutubeForm({...youtubeForm, channel: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  placeholder="Enter video description..."
                  value={youtubeForm.description}
                  onChange={(e) => setYoutubeForm({...youtubeForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  rows="3"
                />
              </div>

              <button
                onClick={handleAddYouTubeVideo}
                disabled={!youtubeForm.url}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  !youtubeForm.url ? "bg-gray-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                Add YouTube Video
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setVideoFilter("all")} className={`px-4 py-2 rounded-lg font-medium transition ${videoFilter === "all" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
          All Videos
        </button>
        <button onClick={() => setVideoFilter("uploaded")} className={`px-4 py-2 rounded-lg font-medium transition ${videoFilter === "uploaded" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}>
          Uploaded Videos
        </button>
        <button onClick={() => setVideoFilter("youtube")} className={`px-4 py-2 rounded-lg font-medium transition ${videoFilter === "youtube" ? "bg-red-600 text-white" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>
          YouTube Shorts
        </button>
      </div>

      {/* Videos List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {videoFilter === "all" && "All Videos"}
            {videoFilter === "uploaded" && "Uploaded Videos"}
            {videoFilter === "youtube" && "YouTube Shorts"}
            <span className="text-gray-500 ml-2">({videos.length})</span>
          </h2>
          <button onClick={fetchVideos} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-gray-500 mt-2">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-gray-500">No videos found.</p>
            <p className="text-sm text-gray-400 mt-1">
              {videoFilter === "all" && "Upload a video or add a YouTube short to get started."}
              {videoFilter === "uploaded" && "No uploaded videos yet. Use the upload form above."}
              {videoFilter === "youtube" && "No YouTube shorts yet. Use the YouTube form above."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="px-4 pt-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    video.type === 'youtube' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {video.type === 'youtube' ? '🔴 YouTube' : '📤 Uploaded'}
                  </span>
                </div>

                <div className="p-4">
                  {video.type === 'uploaded' ? (
                    <video src={video.src} controls className="w-full h-48 object-cover rounded-lg mb-4" />
                  ) : (
                    <div className="relative">
                      <img
                        src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 text-white p-3 rounded-full">▶</div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {editingVideoId === video._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingForm.title}
                          onChange={(e) => setEditingForm({...editingForm, title: e.target.value})}
                          placeholder="Title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <textarea
                          value={editingForm.description}
                          onChange={(e) => setEditingForm({...editingForm, description: e.target.value})}
                          placeholder="Description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          rows="2"
                        />
                        <div className="flex gap-2">
                          <button onClick={saveEditing} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-500">
                            Save
                          </button>
                          <button onClick={cancelEditing} className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-300">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium text-gray-900">{video.title}</h3>
                        <p className="text-sm text-gray-600">{video.description}</p>
                        {video.type === 'youtube' && (
                          <p className="text-xs text-gray-500">Channel: {video.youtubeChannel}</p>
                        )}
                        <div className="flex justify-between text-sm text-gray-500 pt-2 border-t">
                          <span>❤️ {video.likes} likes</span>
                          <span>👁️ {video.views} views</span>
                          <span>💬 {video.comments?.length || 0} comments</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t">
                  {editingVideoId !== video._id && (
                    <div className="flex gap-2">
                      <button onClick={() => startEditing(video)} className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-400">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(video._id)} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-500">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVideoPage;