import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaYoutube, FaVideo, FaPlus, FaEdit, FaTrash, FaFilter } from "react-icons/fa";

// Use your existing BASE_URL from .env (must be exposed with VITE_ prefix in frontend)
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Your backend route uses capital "L" → confirmed working
const API_URL = `${API_BASE_URL}/api/LargeVideo`;

const AdminLargeVideoPage = () => {
  const [videos, setVideos] = useState([]);
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
  
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({
    title: "",
    description: ""
  });
  
  const [activeTab, setActiveTab] = useState("upload");
  const [videoFilter, setVideoFilter] = useState("all");
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchVideos();
  }, [videoFilter]);

  const fetchVideos = async () => {
    try {
      const res = await fetch(API_URL, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      if (!res.ok) throw new Error("Failed to fetch videos");

      const data = await res.json();
      let filtered = Array.isArray(data) ? data : [];

      if (videoFilter !== "all") {
        filtered = filtered.filter(video => video.type === videoFilter);
      }

      setVideos(filtered);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setVideos([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Select a video file!");
    
    const formData = new FormData();
    formData.append("video", selectedFile);
    formData.append("title", uploadForm.title);
    formData.append("description", uploadForm.description);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const newVideo = await res.json();
      setVideos([newVideo, ...videos]);
      setSelectedFile(null);
      setPreviewURL(null);
      setUploadForm({ title: "", description: "" });
      alert("Video uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const handleAddYouTubeVideo = async () => {
    if (!youtubeForm.url) return alert("Enter YouTube URL!");
    
    try {
      const res = await fetch(`${API_URL}/youtube`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(youtubeForm),
      });

      if (!res.ok) throw new Error("Failed to add YouTube video");

      const newVideo = await res.json();
      setVideos([newVideo, ...videos]);
      setYoutubeForm({
        url: "",
        title: "",
        description: "",
        channel: "Unknown Channel"
      });
      alert("YouTube video added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add YouTube video");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    
    try {
      await fetch(`${API_URL}/${id}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setVideos(videos.filter((v) => v._id !== id));
      alert("Video deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const startEditing = (video) => {
    setEditingId(video._id);
    setEditingForm({
      title: video.title || "",
      description: video.description || ""
    });
  };

  const saveEditing = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(editingForm),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setVideos(videos.map((v) => (v._id === id ? updated : v)));
      setEditingId(null);
      setEditingForm({ title: "", description: "" });
      alert("Video updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const getYouTubeIdFromUrl = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:youtu\.be\/)([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1].substring(0, 11);
    }
    return null;
  };

  const uploadedVideos = videos.filter(v => v.type === 'uploaded');
  const youtubeVideos = videos.filter(v => v.type === 'youtube');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Link
        to="/admin"
        className="bg-white/80 hover:bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md mb-6 inline-block"
      >
        ← Dashboard
      </Link>
      
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Admin Large Videos</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Videos</h3>
          <p className="text-3xl font-bold text-gray-800">{videos.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500">Uploaded Videos</h3>
          <p className="text-3xl font-bold text-blue-600">{uploadedVideos.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500">YouTube Videos</h3>
          <p className="text-3xl font-bold text-red-600">{youtubeVideos.length}</p>
        </div>
      </div>

      {/* Add Video Tabs */}
      <div className="mb-10 bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 text-center font-medium transition flex items-center justify-center gap-2 ${
              activeTab === "upload" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("upload")}
          >
            <FaVideo /> Upload Video
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium transition flex items-center justify-center gap-2 ${
              activeTab === "youtube" 
                ? "bg-red-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("youtube")}
          >
            <FaYoutube /> Add YouTube Video
          </button>
        </div>

        <div className="p-6">
          {activeTab === "upload" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
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
                <FaPlus className="inline mr-2" /> Upload Video
              </button>
            </div>
          )}

          {activeTab === "youtube" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeForm.url}
                  onChange={(e) => setYoutubeForm({...youtubeForm, url: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Title (Optional)</label>
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
                <FaPlus className="inline mr-2" /> Add YouTube Video
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setVideoFilter("all")} className={`px-4 py-2 rounded-lg font-medium transition ${videoFilter === "all" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
          <FaFilter className="inline mr-2" /> All Videos
        </button>
        <button onClick={() => setVideoFilter("uploaded")} className={`px-4 py-2 rounded-lg font-medium transition ${videoFilter === "uploaded" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}>
          <FaVideo className="inline mr-2" /> Uploaded Videos
        </button>
        <button onClick={() => setVideoFilter("youtube")} className={`px-4 py-2 rounded-lg font-medium transition ${videoFilter === "youtube" ? "bg-red-600 text-white" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>
          <FaYoutube className="inline mr-2" /> YouTube Videos
        </button>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No videos found</p>
            <p className="text-gray-400">Use the form above to add videos</p>
          </div>
        ) : (
          videos.map((video) => (
            <div key={video._id} className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden relative group">
              <div className="absolute top-2 left-2 z-10">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${video.type === 'youtube' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                  {video.type === 'youtube' ? 'YouTube' : 'Uploaded'}
                </span>
              </div>
              
              <div className="h-48 bg-black flex items-center justify-center">
                {video.type === 'uploaded' ? (
                  <video src={video.src} className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="p-4">
                {editingId === video._id ? (
                  <div className="space-y-2">
                    <input
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
                      <button onClick={() => saveEditing(video._id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-500">
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-300">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-gray-800 truncate">{video.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{video.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-gray-500 text-sm">
                        by {video.uploader}
                        {video.type === 'youtube' && ` • ${video.youtubeChannel}`}
                      </p>
                      <div className="flex gap-1">
                        <span className="text-yellow-500">❤️ {video.likes}</span>
                        <span className="text-blue-500 ml-2">💬 {video.comments?.length || 0}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {editingId !== video._id && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => startEditing(video)} className="bg-yellow-400 p-2 rounded-full shadow hover:bg-yellow-500" title="Edit">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(video._id)} className="bg-red-500 p-2 rounded-full shadow text-white hover:bg-red-600" title="Delete">
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminLargeVideoPage;