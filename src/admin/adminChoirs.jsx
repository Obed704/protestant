import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Load API base URL from .env
const API_BASE_URL = import.meta.env.VITE_API_URL;


export default function AdminChoirsPage() {
  const [choirs, setChoirs] = useState([]);
  const [editingChoir, setEditingChoir] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState({
    name: "",
    description: "",
    president: "",
    vicePresident: "",
    committee: "",
    verse: "",
    about: "",
    songs: "",
    social: { youtube: "", instagram: "", email: "" },
  });

  const fetchChoirs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/choirs`);
      setChoirs(res.data);
    } catch (err) {
      console.error("Error fetching choirs:", err);
    }
  };

  useEffect(() => {
    fetchChoirs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social.")) {
      const key = name.split(".")[1];
      setForm({ ...form, social: { ...form.social, [key]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleUpdate = async () => {
    const choirData = {
      ...form,
      committee: form.committee.split(",").map((c) => c.trim()),
      songs: form.songs
        .split("\n")
        .filter((s) => s.trim() !== "")
        .map((line) => {
          const [title, youtubeLink] = line.split("|").map((s) => s.trim());
          return { title, youtubeLink };
        }),
    };
    try {
      await axios.put(
        `${API_BASE_URL}/api/choirs/${editingChoir._id}`,
        choirData
      );
      fetchChoirs();
      resetForm();
    } catch (err) {
      console.error("Error updating choir:", err);
    }
  };

  const handleEdit = (choir) => {
    setEditingChoir(choir);
    setForm({
      name: choir.name,
      description: choir.description,
      president: choir.president,
      vicePresident: choir.vicePresident,
      committee: choir.committee.join(", "),
      verse: choir.verse,
      about: choir.about,
      songs: choir.songs.map((s) => `${s.title} | ${s.youtubeLink}`).join("\n"),
      social: choir.social || { youtube: "", instagram: "", email: "" },
    });
  };

  const resetForm = () => {
    setEditingChoir(null);
    setActiveTab("basic");
    setForm({
      name: "",
      description: "",
      president: "",
      vicePresident: "",
      committee: "",
      verse: "",
      about: "",
      songs: "",
      social: { youtube: "", instagram: "", email: "" },
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/admin"
          className="bg-white/80 hover:bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md"
        >
          ← Dashboard
        </Link>
      </div>
      <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-6">
        Choirs Admin Panel
      </h1>

      {/* Edit Form */}
      {editingChoir && (
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-5xl mx-auto mb-10 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">
            Editing: {editingChoir.name}
          </h2>

          {/* Tabs */}
          <div className="flex border-b mb-6">
            {["basic", "songs", "social"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "basic" && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium">Choir Name</span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full mt-1 border p-2 rounded-lg focus:ring focus:ring-blue-300"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">President</span>
                  <input
                    type="text"
                    name="president"
                    value={form.president}
                    onChange={handleChange}
                    className="w-full mt-1 border p-2 rounded-lg focus:ring focus:ring-blue-300"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Vice President</span>
                  <input
                    type="text"
                    name="vicePresident"
                    value={form.vicePresident}
                    onChange={handleChange}
                    className="w-full mt-1 border p-2 rounded-lg focus:ring focus:ring-blue-300"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Committee Members</span>
                  <input
                    type="text"
                    name="committee"
                    value={form.committee}
                    onChange={handleChange}
                    placeholder="Comma separated"
                    className="w-full mt-1 border p-2 rounded-lg focus:ring focus:ring-blue-300"
                  />
                </label>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium">Verse</span>
                  <input
                    type="text"
                    name="verse"
                    value={form.verse}
                    onChange={handleChange}
                    className="w-full mt-1 border p-2 rounded-lg focus:ring focus:ring-blue-300"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Description</span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full mt-1 border p-2 rounded-lg focus:ring focus:ring-blue-300"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">About</span>
                  <textarea
                    name="about"
                    value={form.about}
                    onChange={handleChange}
                    className="w-full mt-1 border p-2 rounded-lg focus:ring focus:ring-blue-300"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === "songs" && (
            <div>
              <label className="block">
                <span className="text-sm font-medium">Songs</span>
                <textarea
                  name="songs"
                  value={form.songs}
                  onChange={handleChange}
                  placeholder="Title | YouTube Link (one per line)"
                  className="w-full mt-1 border p-2 rounded-lg focus:ring focus:ring-blue-300"
                />
              </label>
            </div>
          )}

          {activeTab === "social" && (
            <div className="grid md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm font-medium">YouTube Link</span>
                <input
                  type="text"
                  name="social.youtube"
                  value={form.social.youtube}
                  onChange={handleChange}
                  className="w-full mt-1 border p-2 rounded-lg focus:ring focus:ring-blue-300"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Instagram Link</span>
                <input
                  type="text"
                  name="social.instagram"
                  value={form.social.instagram}
                  onChange={handleChange}
                  className="w-full mt-1 border p-2 rounded-lg focus:ring focus:ring-blue-300"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input
                  type="text"
                  name="social.email"
                  value={form.social.email}
                  onChange={handleChange}
                  className="w-full mt-1 border p-2 rounded-lg focus:ring focus:ring-blue-300"
                />
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Update Choir
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Choirs List */}
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Choirs List</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {choirs.map((choir) => (
          <div
            key={choir._id}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-2xl border border-gray-200 transition flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">
                {choir.name}
              </h3>
              <p className="text-gray-600 mb-2">{choir.description}</p>
              <p className="text-gray-500 text-sm">
                <strong>President:</strong> {choir.president}
              </p>
              <p className="text-gray-500 text-sm">
                <strong>Vice:</strong> {choir.vicePresident}
              </p>
              <p className="text-gray-500 text-sm mb-2">
                <strong>Committee:</strong> {choir.committee.join(", ")}
              </p>
            </div>
            <button
              onClick={() => handleEdit(choir)}
              className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}