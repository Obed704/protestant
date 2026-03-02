import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Use your existing BASE_URL via VITE_ prefix (required for Vite frontend)
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
  const [loading, setLoading] = useState(false);

  // Fetch preachings safely
  const fetchPreachings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINT);

      // Safely extract array — your API might return { data: [...] } or direct array
      let preachingsData = [];

      if (res.data) {
        if (Array.isArray(res.data)) {
          preachingsData = res.data;
        } else if (Array.isArray(res.data.preachings)) {
          preachingsData = res.data.preachings;
        } else if (Array.isArray(res.data.data)) {
          preachingsData = res.data.data;
        }
      }

      setPreachings(preachingsData);
    } catch (err) {
      console.error("Error fetching preachings:", err);
      setPreachings([]); // Always ensure it's an array
      alert("Failed to load preachings. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreachings();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const data = {
      ...form,
      verses: form.verses
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v),
    };

    try {
      if (editingId) {
        await axios.put(`${API_ENDPOINT}/${editingId}`, data);
      } else {
        await axios.post(API_ENDPOINT, data);
      }
      fetchPreachings();
      resetForm();
      alert(editingId ? "Preaching updated!" : "Preaching added!");
    } catch (err) {
      console.error("Error saving preaching:", err);
      alert("Failed to save preaching.");
    }
  };

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this preaching?")) return;

    try {
      await axios.delete(`${API_ENDPOINT}/${id}`);
      fetchPreachings();
      alert("Preaching deleted successfully!");
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
    <div>
      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/admin"
          className="bg-white/80 hover:bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="p-6 bg-gray-100 min-h-screen pt-20">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Admin Daily Preaching
        </h2>

        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto mb-8">
          <h3 className="text-2xl font-bold mb-4">
            {editingId ? "Edit Preaching" : "Add New Preaching"}
          </h3>
          <div className="grid gap-4">
            <input
              type="text"
              name="day"
              value={form.day}
              onChange={handleChange}
              placeholder="Day (e.g., Monday)"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              name="preacher"
              value={form.preacher}
              onChange={handleChange}
              placeholder="Preacher Name"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              name="verses"
              value={form.verses}
              onChange={handleChange}
              placeholder="Verses (comma separated, e.g. John 3:16, Romans 8:28)"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Preaching Description / Key Message"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows="5"
            />

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition"
              >
                {editingId ? "Update Preaching" : "Add Preaching"}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-6 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-medium transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading & Empty States */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading preachings...</p>
          </div>
        )}

        {!loading && preachings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-xl text-gray-500">No daily preachings found.</p>
            <p className="text-gray-400 mt-2">Add your first one using the form above.</p>
          </div>
        )}

        {/* Preachings Grid */}
        {!loading && preachings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {preachings.map((p) => (
              <div
                key={p._id}
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition relative border border-gray-200"
              >
                <h3 className="font-bold text-lg text-gray-800 mb-1">
                  {p.day} - {new Date(p.date).toLocaleDateString()}
                </h3>
                <p className="text-gray-600 font-medium mb-2">Preacher: {p.preacher}</p>
                <p className="text-gray-500 text-sm mb-3">
                  <strong>Verses:</strong>{" "}
                  {Array.isArray(p.verses) ? p.verses.join(", ") : p.verses || "None"}
                </p>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {p.description || "No description provided."}
                </p>

                <div className="flex gap-2 justify-end mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(p)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}