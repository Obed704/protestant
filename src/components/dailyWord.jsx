import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/dailyPreachings`;

export default function AdminDailyPreaching() {
  const [preachings, setPreachings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    day: "",
    date: "",
    preacher: "",
    verses: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch preachings safely
  const fetchPreachings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINT);

      // Safely extract array
      let preachingsArray = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          preachingsArray = res.data;
        } else if (Array.isArray(res.data.preachings)) {
          preachingsArray = res.data.preachings;
        } else if (Array.isArray(res.data.data)) {
          preachingsArray = res.data.data;
        }
      }

      setPreachings(preachingsArray);
    } catch (err) {
      console.error("Error fetching preachings:", err);
      setPreachings([]);
      alert("Failed to load preachings. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreachings();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update preaching
  const handleSubmit = async () => {
    const data = {
      ...form,
      verses: form.verses
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v !== ""),
    };

    try {
      if (editingId) {
        await axios.put(`${API_ENDPOINT}/${editingId}`, data);
        alert("Preaching updated successfully!");
      } else {
        await axios.post(API_ENDPOINT, data);
        alert("Preaching added successfully!");
      }
      fetchPreachings();
      resetForm();
    } catch (err) {
      console.error("Error saving preaching:", err);
      alert("Failed to save preaching.");
    }
  };

  // Edit preaching
  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      day: p.day || "",
      date: p.date ? new Date(p.date).toISOString().split("T")[0] : "",
      preacher: p.preacher || "",
      verses: Array.isArray(p.verses) ? p.verses.join(", ") : "",
      description: p.description || "",
    });
  };

  // Delete preaching
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this preaching?")) return;

    try {
      await axios.delete(`${API_ENDPOINT}/${id}`);
      alert("Preaching deleted successfully!");
      fetchPreachings();
    } catch (err) {
      console.error("Error deleting preaching:", err);
      alert("Failed to delete preaching.");
    }
  };

  const resetForm = () => {
    setForm({
      day: "",
      date: "",
      preacher: "",
      verses: "",
      description: "",
    });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Link
        to="/admin"
        className="fixed top-4 left-4 z-10 bg-white/80 hover:bg-white text-gray-800 font-semibold px-6 py-3 rounded-lg shadow-md transition"
      >
        ← Dashboard
      </Link>

      <div className="pt-20 max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12">
          Admin Daily Preaching
        </h2>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">
            {editingId ? "Edit Preaching" : "Add New Preaching"}
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                name="day"
                value={form.day}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">Select day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preacher Name
              </label>
              <input
                type="text"
                name="preacher"
                value={form.preacher}
                onChange={handleChange}
                placeholder="Enter preacher name"
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bible Verses (comma separated)
              </label>
              <input
                type="text"
                name="verses"
                value={form.verses}
                onChange={handleChange}
                placeholder="e.g. John 3:16, Romans 8:28"
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preaching Message / Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter the daily preaching message..."
                className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                rows="6"
                required
              />
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-4">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-lg transition shadow-lg"
            >
              {editingId ? "Update Preaching" : "Add Preaching"}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-10 rounded-lg transition shadow-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-6 text-xl text-gray-600">Loading daily preachings...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && preachings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto">
            <p className="text-3xl text-gray-400 mb-6">📖</p>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              No Daily Preachings Yet
            </h3>
            <p className="text-gray-600 mb-8">
              Start by adding your first preaching using the form above.
            </p>
          </div>
        )}

        {/* Preachings Grid */}
        {!loading && preachings.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              All Daily Preachings ({preachings.length})
            </h3>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {preachings.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-2xl font-bold">{p.day}</h4>
                      <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                        {new Date(p.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-blue-100 font-medium">Preacher: {p.preacher}</p>
                  </div>

                  <div className="p-6">
                    <div className="mb-5">
                      <p className="text-gray-800 leading-relaxed italic bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                        "{p.description}"
                      </p>
                    </div>

                    {p.verses && p.verses.length > 0 && (
                      <div className="mb-6">
                        <p className="font-semibold text-gray-700 mb-2">Scriptures:</p>
                        <div className="flex flex-wrap gap-2">
                          {p.verses.map((verse, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {verse}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(p)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-3 rounded-lg transition shadow"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg transition shadow"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}