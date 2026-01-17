import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import NavigationButtons from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Normalize any YouTube URL to embed
const normalizeYouTubeUrl = (url) => {
  if (!url) return null;
  try {
    // Already embed
    if (url.includes("embed/")) return url;

    // Regular video
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    
    // Short link
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }

    // Playlist
    if (url.includes("playlist?list=")) {
      const list = url.split("list=")[1].split("&")[0];
      return `https://www.youtube.com/embed/videoseries?list=${list}`;
    }

    return url;
  } catch {
    return null;
  }
};

// Normalize file/image URLs from backend
const normalizeFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export default function AdminDashboard() {
  const [downloads, setDownloads] = useState([]);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState("downloads");
  const [downloadForm, setDownloadForm] = useState({
    title: "",
    description: "",
    fileType: "PDF",
    fileSize: "",
    file: null,
    externalLink: "",
    imageFile: null,
  });
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
  });
  const [editing, setEditing] = useState({ downloads: null, videos: null });
  const [error, setError] = useState("");

  const API = {
    downloads: `${BACKEND_URL}/api/downloads`,
    videos: `${BACKEND_URL}/api/videos`,
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [d, v] = await Promise.all([axios.get(API.downloads), axios.get(API.videos)]);
      setDownloads(d.data);
      setVideos(v.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ DOWNLOADS ------------------
  const handleDownloadSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", downloadForm.title);
    formData.append("description", downloadForm.description);
    formData.append("fileType", downloadForm.fileType);
    formData.append("fileSize", downloadForm.fileSize);
    if (downloadForm.file) formData.append("file", downloadForm.file);
    if (downloadForm.imageFile) formData.append("image", downloadForm.imageFile);
    if (downloadForm.externalLink) formData.append("linkHref", downloadForm.externalLink);

    const url = editing.downloads ? `${API.downloads}/${editing.downloads}` : API.downloads;

    try {
      await axios[editing.downloads ? "put" : "post"](url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      resetDownloadForm();
      fetchAll();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save download");
    }
  };

  const resetDownloadForm = () => {
    setDownloadForm({
      title: "",
      description: "",
      fileType: "PDF",
      fileSize: "",
      file: null,
      externalLink: "",
      imageFile: null,
    });
    setEditing({ ...editing, downloads: null });
    setError("");
  };

  const handleDownloadEdit = (item) => {
    setDownloadForm({
      title: item.title,
      description: item.description,
      fileType: item.fileType,
      fileSize: item.fileSize,
      file: null,
      externalLink: item.linkHref || "",
      imageFile: null,
    });
    setEditing({ ...editing, downloads: item._id });
  };

  const handleDownloadDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this download?")) {
      await axios.delete(`${API.downloads}/${id}`);
      fetchAll();
    }
  };

  // ------------------ VIDEOS ------------------
  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    const embedUrl = normalizeYouTubeUrl(videoForm.videoUrl);
    if (!embedUrl) {
      setError("Invalid YouTube URL");
      return;
    }

    const payload = { title: videoForm.title, description: videoForm.description, embedUrl };
    const url = editing.videos ? `${API.videos}/${editing.videos}` : API.videos;

    try {
      await axios[editing.videos ? "put" : "post"](url, payload);
      resetVideoForm();
      fetchAll();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save video");
    }
  };

  const resetVideoForm = () => {
    setVideoForm({ title: "", description: "", videoUrl: "" });
    setEditing({ ...editing, videos: null });
    setError("");
  };

  const handleVideoEdit = (item) => {
    setVideoForm({
      title: item.title,
      description: item.description,
      videoUrl: item.embedUrl,
    });
    setEditing({ ...editing, videos: item._id });
  };

  const handleVideoDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      await axios.delete(`${API.videos}/${id}`);
      fetchAll();
    }
  };

  // ------------------ RENDER ------------------
  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <NavigationButtons/>
      <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-2">
        <button
          onClick={() => setActiveTab("downloads")}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === "downloads"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
          }`}
        >
          Downloads
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === "videos"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
          }`}
        >
          Videos
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {/* ------------------ DOWNLOADS FORM ------------------ */}
          {activeTab === "downloads" && (
            <motion.div
              key="downloads"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4">
                {editing.downloads ? "Edit Download" : "Add Download"}
              </h2>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <form onSubmit={handleDownloadSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Title</label>
                  <input
                    type="text"
                    placeholder="Enter title"
                    className="mt-1 border border-gray-700 p-2 w-full rounded-md bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={downloadForm.title}
                    onChange={(e) => setDownloadForm({ ...downloadForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Description</label>
                  <textarea
                    placeholder="Enter description"
                    className="mt-1 border border-gray-700 p-2 w-full rounded-md bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    value={downloadForm.description}
                    onChange={(e) =>
                      setDownloadForm({ ...downloadForm, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">File</label>
                  <input
                    type="file"
                    accept=".pdf,.zip,.docx"
                    className="mt-1 border border-gray-700 p-2 w-full rounded-md bg-gray-900 text-gray-100"
                    onChange={(e) => setDownloadForm({ ...downloadForm, file: e.target.files[0] })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 border border-gray-700 p-2 w-full rounded-md bg-gray-900 text-gray-100"
                    onChange={(e) =>
                      setDownloadForm({ ...downloadForm, imageFile: e.target.files[0] })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">External Link</label>
                  <input
                    type="url"
                    placeholder="Enter external link"
                    className="mt-1 border border-gray-700 p-2 w-full rounded-md bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={downloadForm.externalLink}
                    onChange={(e) =>
                      setDownloadForm({ ...downloadForm, externalLink: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    {editing.downloads ? "Update" : "Add"}
                  </button>
                  {editing.downloads && (
                    <button
                      type="button"
                      onClick={resetDownloadForm}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {/* ------------------ DOWNLOADS PREVIEW ------------------ */}
          {activeTab === "downloads" && (
            <motion.div
              key="downloads-preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="lg:col-span-2 space-y-4"
            >
              {downloads.map((d) => (
                <div
                  key={d._id}
                  className="bg-gray-800 rounded-lg shadow-md p-4 flex gap-4 items-center hover:shadow-lg transition"
                >
                  {d.image && (
                    <img
                      src={normalizeFileUrl(d.image)}
                      alt={d.alt || d.title}
                      className="w-16 h-16 object-cover rounded-md border border-gray-700"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-100">{d.title}</h3>
                    <p className="text-sm text-gray-400">{d.description}</p>
                    <div className="mt-2 flex gap-2">
                      <a
                        href={normalizeFileUrl(d.linkHref)}
                        target="_blank"
                        className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => handleDownloadEdit(d)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDownloadDelete(d._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ------------------ VIDEOS FORM ------------------ */}
          {activeTab === "videos" && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4">
                {editing.videos ? "Edit Video" : "Add Video"}
              </h2>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <form onSubmit={handleVideoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Title</label>
                  <input
                    type="text"
                    placeholder="Enter title"
                    className="mt-1 border border-gray-700 p-2 w-full rounded-md bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Description</label>
                  <textarea
                    placeholder="Enter description"
                    className="mt-1 border border-gray-700 p-2 w-full rounded-md bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">YouTube Link</label>
                  <input
                    type="url"
                    placeholder="Enter YouTube link"
                    className="mt-1 border border-gray-700 p-2 w-full rounded-md bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={videoForm.videoUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    {editing.videos ? "Update Video" : "Add Video"}
                  </button>
                  {editing.videos && (
                    <button
                      type="button"
                      onClick={resetVideoForm}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {/* ------------------ VIDEOS PREVIEW ------------------ */}
          {activeTab === "videos" && (
            <motion.div
              key="videos-preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="lg:col-span-2 space-y-4"
            >
              {videos.map((v) => (
                <div
                  key={v._id}
                  className="bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-gray-100">{v.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{v.description}</p>
                  {v.embedUrl && (
                    <iframe
                      className="w-full h-64 rounded-md"
                      src={normalizeYouTubeUrl(v.embedUrl)}
                      title={v.title}
                      allowFullScreen
                    />
                  )}
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleVideoEdit(v)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleVideoDelete(v._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}