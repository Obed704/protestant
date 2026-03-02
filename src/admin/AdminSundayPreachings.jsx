import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Use your existing BASE_URL from .env → must be exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/sundayService`;

export default function AdminSundayPreachings() {
  const [preachings, setPreachings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    verses: "",
    serviceNumber: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch preachings safely from backend
  const fetchPreachings = async (query = "") => {
    try {
      setLoading(true);
      const url = query
        ? `${API_ENDPOINT}?search=${query}`
        : API_ENDPOINT;

      const res = await axios.get(url);

      // Safely extract the preachings array regardless of response structure
      let preachingsArray = [];

      if (res.data) {
        if (Array.isArray(res.data)) {
          preachingsArray = res.data;
        } else if (Array.isArray(res.data.preachings)) {
          preachingsArray = res.data.preachings;
        } else if (Array.isArray(res.data.data)) {
          preachingsArray = res.data.data;
        } else if (Array.isArray(res.data.sundayServices)) {
          preachingsArray = res.data.sundayServices;
        }
        // Add more if your backend uses different keys
      }

      setPreachings(preachingsArray);
    } catch (err) {
      console.error("Error fetching preachings:", err);
      setPreachings([]); // Always ensure it's an array
      alert("Failed to load preachings. Check console and network.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreachings();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update preaching
  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`${API_ENDPOINT}/${editingId}`, form);
        alert("Preaching updated successfully!");
      } else {
        await axios.post(API_ENDPOINT, form);
        alert("Preaching added successfully!");
      }
      fetchPreachings();
      resetForm();
    } catch (err) {
      console.error("Error saving preaching:", err);
      alert("Failed to save preaching. Check console for details.");
    }
  };

  // Edit preaching
  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      title: p.title || "",
      shortDescription: p.shortDescription || "",
      fullDescription: p.fullDescription || "",
      verses: p.verses || "",
      serviceNumber: p.serviceNumber || "",
      date: p.date ? new Date(p.date).toISOString().split("T")[0] : "",
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
      title: "",
      shortDescription: "",
      fullDescription: "",
      verses: "",
      serviceNumber: "",
      date: "",
    });
    setEditingId(null);
  };

  return (
    <div>
      <Link
        to="/admin"
        className="bg-white/80 hover:bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md fixed top-4 left-4 z-10"
      >
        ← Dashboard
      </Link>

      <div className="min-h-screen bg-gray-100 p-6 pt-20">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          Admin Sunday Preachings
        </h2>

        {/* Form */}
        <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto mb-10">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">
            {editingId ? "Edit Preaching" : "Add New Preaching"}
          </h3>
          <div className="grid gap-5">
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Sermon Title"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              placeholder="Short Description (for preview)"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <textarea
              name="fullDescription"
              value={form.fullDescription}
              onChange={handleChange}
              placeholder="Full Sermon Notes / Message"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none h-40 resize-none"
            />
            <input
              type="text"
              name="verses"
              value={form.verses}
              onChange={handleChange}
              placeholder="Key Bible Verses (e.g. John 3:16)"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              name="serviceNumber"
              value={form.serviceNumber}
              onChange={handleChange}
              placeholder="Service Number (e.g. Service 52)"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
              >
                {editingId ? "Update Preaching" : "Add Preaching"}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-8 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-lg text-gray-600">Loading preachings...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && preachings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow">
            <p className="text-2xl text-gray-500 mb-2">No Sunday preachings found</p>
            <p className="text-gray-400">Add your first preaching using the form above.</p>
          </div>
        )}

        {/* Preachings Grid */}
        {!loading && preachings.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {preachings.map((p) => (
              <div
                key={p._id}
                className="bg-white p-7 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {p.title || "Untitled"}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {p.shortDescription || "No short description"}
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <p>
                    <strong>Verses:</strong> {p.verses || "Not specified"}
                  </p>
                  <p>
                    <strong>Service:</strong> {p.serviceNumber || "N/A"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {p.date ? new Date(p.date).toLocaleDateString() : "Not set"}
                  </p>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(p)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium transition"
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