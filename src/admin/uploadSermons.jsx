import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext.jsx";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import { Link } from "react-router-dom";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/sermons`;

const AdminSermonDashboard = () => {
  const { user } = useContext(AuthContext);
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [verse, setVerse] = useState("");
  const [description, setDescription] = useState("");
  const [preacher] = useState(user?.fullName || "Admin");

  const token = localStorage.getItem("token");

  // Fetch all sermons safely
  const fetchSermons = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINT);

      // Safely extract array
      let sermonsArray = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          sermonsArray = res.data;
        } else if (Array.isArray(res.data.sermons)) {
          sermonsArray = res.data.sermons;
        } else if (Array.isArray(res.data.data)) {
          sermonsArray = res.data.data;
        }
      }

      setSermons(sermonsArray);
    } catch (err) {
      console.error("Error fetching sermons:", err);
      setSermons([]);
      showMessage("Failed to load sermons.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  // Helper to show temporary messages
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(""), 5000);
  };

  // Upload or update sermon
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verse.trim() || !description.trim()) {
      showMessage("Please fill in verse and description.", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await axios.put(
          `${API_ENDPOINT}/${editingId}`,
          { verse: verse.trim(), description: description.trim(), preacher },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showMessage("Sermon updated successfully!");
      } else {
        await axios.post(
          API_ENDPOINT,
          { verse: verse.trim(), description: description.trim(), preacher },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showMessage("Sermon uploaded successfully!");
      }

      setVerse("");
      setDescription("");
      setEditingId(null);
      fetchSermons();
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.message || "Error saving sermon",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // Edit sermon
  const handleEdit = (sermon) => {
    setVerse(sermon.verse || "");
    setDescription(sermon.description || "");
    setEditingId(sermon._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete sermon
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sermon?")) return;

    try {
      await axios.delete(`${API_ENDPOINT}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMessage("Sermon deleted successfully!");
      fetchSermons();
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.message || "Error deleting sermon",
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Link
        to="/admin"
        className="fixed top-4 left-4 z-10 bg-white/80 hover:bg-white text-gray-800 font-semibold px-6 py-3 rounded-lg shadow-md transition"
      >
        ← Dashboard
      </Link>

      <div className="max-w-4xl mx-auto pt-20">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10">
          Admin Sermon Dashboard
        </h1>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-center font-medium text-lg shadow-md ${
              message.type === "error"
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-green-100 text-green-800 border border-green-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Upload / Edit Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">
            {editingId ? "Edit Sermon" : "Add New Sermon"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bible Verse
              </label>
              <input
                type="text"
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                placeholder="e.g. John 3:16"
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sermon Message / Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter the sermon notes or key message..."
                className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                rows="6"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preacher
              </label>
              <input
                type="text"
                value={preacher}
                readOnly
                className="w-full px-5 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex gap-4 justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-lg transition shadow-md"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Sermon"
                  : "Upload Sermon"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setVerse("");
                    setDescription("");
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition shadow-md"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-xl text-gray-600">Loading sermons...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && sermons.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <p className="text-2xl text-gray-500 mb-3">No sermons yet</p>
            <p className="text-gray-400">Add your first sermon using the form above.</p>
          </div>
        )}

        {/* Sermon List */}
        {!loading && sermons.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">All Sermons</h2>
            {sermons.map((sermon) => (
              <div
                key={sermon._id}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-xl font-bold text-blue-700 mb-3">
                      {sermon.verse || "No verse"}
                    </p>
                    <p className="text-gray-800 leading-relaxed mb-4">
                      {sermon.description || "No description"}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Preacher:</strong> {sermon.preacher || "Unknown"}
                    </p>
                  </div>

                  <div className="flex gap-3 ml-6">
                    <button
                      onClick={() => handleEdit(sermon)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-lg shadow transition"
                      title="Edit"
                    >
                      <FiEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(sermon._id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg shadow transition"
                      title="Delete"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSermonDashboard;