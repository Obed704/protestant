import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext.jsx";
import { FiEdit, FiTrash2, FiPlus, FiBookOpen, FiAlertCircle } from "react-icons/fi";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/sermons`;

const AdminSermonDashboard = () => {
  const { user } = useContext(AuthContext);
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingId, setEditingId] = useState(null);

  // Form fields
  const [verse, setVerse] = useState("");
  const [description, setDescription] = useState("");
  const [preacher] = useState(user?.fullName || "Admin");

  const token = localStorage.getItem("token");

  const fetchSermons = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINT);
      const data = res.data;

      let sermonsArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.sermons)
        ? data.sermons
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setSermons(sermonsArray);
    } catch (err) {
      console.error("Failed to load sermons:", err);
      setSermons([]);
      showMessage("Could not load sermons. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verse.trim() || !description.trim()) {
      showMessage("Verse and description are required.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        verse: verse.trim(),
        description: description.trim(),
        preacher,
      };

      if (editingId) {
        await axios.put(`${API_ENDPOINT}/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showMessage("Sermon updated successfully!");
      } else {
        await axios.post(API_ENDPOINT, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showMessage("New sermon added successfully!");
      }

      setVerse("");
      setDescription("");
      setEditingId(null);
      fetchSermons();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to save sermon", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (sermon) => {
    setVerse(sermon.verse || "");
    setDescription(sermon.description || "");
    setEditingId(sermon._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sermon permanently?")) return;

    try {
      await axios.delete(`${API_ENDPOINT}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMessage("Sermon deleted successfully");
      fetchSermons();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to delete sermon", "error");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setVerse("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center text-gray-600 hover:text-blue-700 mb-8 group"
        >
          <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span>
          Back to Admin Dashboard
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Sermon Management
          </h1>
          <p className="text-gray-600">Add, edit, or remove sermons visible to church members.</p>
        </header>

        {message.text && (
          <div
            className={`mb-8 p-4 rounded-xl border flex items-center gap-3 shadow-sm ${
              message.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            {message.type === "error" ? (
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <FiBookOpen className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-12">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/70">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              {editingId ? (
                <>
                  <FiEdit className="text-yellow-600" />
                  Edit Sermon
                </>
              ) : (
                <>
                  <FiPlus className="text-green-600" />
                  Add New Sermon
                </>
              )}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bible Verse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                placeholder="John 3:16"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sermon Content / Key Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share the main points, insights, or full sermon text..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition min-h-[160px] whitespace-pre-wrap"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preacher</label>
              <input
                type="text"
                value={preacher}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-3 rounded-lg font-medium shadow transition flex items-center justify-center gap-2 min-w-[140px] ${
                  saving
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : editingId
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {saving ? "Saving..." : editingId ? "Update Sermon" : "Publish Sermon"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition min-w-[140px]"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg">Loading sermons...</p>
          </div>
        ) : sermons.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-12 text-center">
            <FiBookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No sermons yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first sermon using the form above.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiBookOpen className="text-blue-600" />
              Published Sermons ({sermons.length})
            </h2>

            {sermons.map((sermon) => (
              <div
                key={sermon._id}
                className="bg-white rounded-2xl shadow border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                    {/* IMPORTANT FIX: min-w-0 allows wrapping inside flex row */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xl sm:text-2xl font-bold text-blue-700 mb-3 break-words [overflow-wrap:anywhere]">
                        {sermon.verse || "No verse provided"}
                      </p>

                      <div className="prose prose-gray max-w-none">
                        {/* IMPORTANT FIX: overflow-wrap:anywhere prevents long unbroken strings from pushing buttons out */}
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
                          {sermon.description || "No content"}
                        </p>
                      </div>

                      <div className="mt-4 text-sm text-gray-500">
                        Preacher:{" "}
                        <span className="font-medium text-gray-700">
                          {sermon.preacher || "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* IMPORTANT FIX: keep actions visible */}
                    <div className="flex items-center gap-3 self-start sm:self-center flex-shrink-0">
                      <button
                        onClick={() => handleEdit(sermon)}
                        className="p-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
                        title="Edit sermon"
                      >
                        <FiEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(sermon._id)}
                        className="p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                        title="Delete sermon"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
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