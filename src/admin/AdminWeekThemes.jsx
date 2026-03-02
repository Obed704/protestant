import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/weeks`;

export default function AdminWeekThemes() {
  const [weeks, setWeeks] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    weekNo: "",
    name: "",
    date: "",
    theme: "",
    verse: "",
    purpose: "",
    plans: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch weeks safely from backend
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINT);

        // Safely extract array from any response structure
        let weeksArray = [];

        if (res.data) {
          if (Array.isArray(res.data)) {
            weeksArray = res.data;
          } else if (Array.isArray(res.data.weeks)) {
            weeksArray = res.data.weeks;
          } else if (Array.isArray(res.data.data)) {
            weeksArray = res.data.data;
          }
        }

        setWeeks(weeksArray);
      } catch (err) {
        console.error("Error fetching weeks:", err);
        setWeeks([]);
        alert("Failed to load weeks. Check console.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeks();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new week
  const handleAdd = async () => {
    const newWeek = {
      ...form,
      weekNo: Number(form.weekNo),
      plans: form.plans
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p !== ""),
    };

    try {
      const res = await axios.post(API_ENDPOINT, newWeek);
      setWeeks([...weeks, res.data]); // Use response from server
      alert("Week added successfully!");
    } catch (err) {
      console.error("Error adding week:", err);
      alert("Failed to add week.");
      // Still add locally if backend fails (optional fallback)
      setWeeks([...weeks, newWeek]);
    }

    resetForm();
  };

  // Update existing week
  const handleUpdate = async () => {
    const updatedWeek = {
      ...form,
      weekNo: Number(form.weekNo),
      plans: form.plans
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p !== ""),
    };

    try {
      await axios.put(`${API_ENDPOINT}/${updatedWeek.weekNo}`, updatedWeek);
      alert("Week updated successfully!");
      setWeeks(weeks.map((w, i) => (i === editingIndex ? updatedWeek : w)));
    } catch (err) {
      console.error("Error updating week:", err);
      alert("Failed to update week.");
      // Local fallback
      setWeeks(weeks.map((w, i) => (i === editingIndex ? updatedWeek : w)));
    }

    setEditingIndex(null);
    resetForm();
  };

  // Start editing
  const handleEdit = (index) => {
    const w = weeks[index];
    setEditingIndex(index);
    setForm({
      weekNo: w.weekNo || "",
      name: w.name || "",
      date: w.date ? w.date.split("T")[0] : "",
      theme: w.theme || "",
      verse: w.verse || "",
      purpose: w.purpose || "",
      plans: Array.isArray(w.plans) ? w.plans.join("\n") : "",
    });
  };

  // Delete week
  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure you want to delete this week?")) return;

    const weekToDelete = weeks[index];

    try {
      await axios.delete(`${API_ENDPOINT}/${weekToDelete.weekNo}`);
      alert("Week deleted successfully!");
    } catch (err) {
      console.error("Error deleting week:", err);
      alert("Failed to delete from server, removing locally.");
    }

    setWeeks(weeks.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setForm({
      weekNo: "",
      name: "",
      date: "",
      theme: "",
      verse: "",
      purpose: "",
      plans: "",
    });
    setEditingIndex(null);
  };

  return (
    <section className="p-8 min-h-screen bg-gray-100">
      <Link
        to="/admin"
        className="bg-white/80 hover:bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md fixed top-4 left-4 z-10"
      >
        ← Dashboard
      </Link>

      <div className="pt-20">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10">
          Admin Week Themes
        </h1>

        {/* Form */}
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {editingIndex !== null ? "Edit Week" : "Add New Week"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="number"
              name="weekNo"
              value={form.weekNo}
              onChange={handleChange}
              placeholder="Week Number (e.g. 52)"
              className="border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Week Name"
              className="border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              name="theme"
              value={form.theme}
              onChange={handleChange}
              placeholder="Theme"
              className="border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              name="verse"
              value={form.verse}
              onChange={handleChange}
              placeholder="Bible Verse"
              className="border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <textarea
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              placeholder="Purpose of the Week"
              className="border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none md:col-span-2"
              rows="3"
            />
            <textarea
              name="plans"
              value={form.plans}
              onChange={handleChange}
              placeholder="Plans (one per line)"
              className="border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none md:col-span-2"
              rows="5"
            />
          </div>

          <div className="mt-8 flex gap-4 justify-end">
            <button
              onClick={editingIndex !== null ? handleUpdate : handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-md"
            >
              {editingIndex !== null ? "Update Week" : "Add Week"}
            </button>
            {editingIndex !== null && (
              <button
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition shadow-md"
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
            <p className="mt-4 text-xl text-gray-600">Loading weeks...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && weeks.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <p className="text-2xl text-gray-500 mb-3">No week themes yet</p>
            <p className="text-gray-400">Add your first week using the form above.</p>
          </div>
        )}

        {/* Weeks Grid */}
        {!loading && weeks.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {weeks.map((week, idx) => (
              <div
                key={week._id || idx}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 relative"
              >
                <div className="absolute top-4 right-6">
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow">
                    Week {week.weekNo}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 pr-20">
                  {week.name || "Unnamed Week"}
                </h3>

                <p className="text-gray-600 mb-3">
                  <strong>Date:</strong>{" "}
                  {week.date ? new Date(week.date).toLocaleDateString() : "Not set"}
                </p>

                <p className="text-lg italic text-blue-700 mb-4">
                  “{week.theme || "No theme"}”
                </p>

                <p className="text-gray-700 mb-3">
                  <strong>Verse:</strong> {week.verse || "None"}
                </p>

                <p className="text-gray-700 mb-5">
                  <strong>Purpose:</strong> {week.purpose || "Not specified"}
                </p>

                {week.plans && week.plans.length > 0 && (
                  <div className="mb-6">
                    <strong className="block mb-2 text-gray-800">Plans:</strong>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {week.plans.map((plan, i) => (
                        <li key={i}>{plan}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(idx)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}