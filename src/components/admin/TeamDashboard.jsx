import React, { useState, useEffect } from "react";
import axios from "axios";
import NavigationButtons from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const colors = ["#1e3a8a", "#16a34a", "#9333ea"]; // Dark gradient palette

const api = axios.create({ baseURL: `${BACKEND_URL}/api/team` });

const TeamMemberDashboard = () => {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: "", role: "", email: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/");
      setMembers(res.data);
    } catch {
      setMessage("Failed to load team members.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (file) data.append("image", file);

    try {
      setLoading(true);
      if (editingId) {
        await api.put(`/${editingId}`, data);
        setMessage("Member updated successfully!");
      } else {
        await api.post("/", data);
        setMessage("Member added successfully!");
      }
      resetForm();
      fetchMembers();
    } catch {
      setMessage("Error saving member.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setFormData({ name: member.name, role: member.role, email: member.email || "" });
    setEditingId(member._id);
    setPreview(member.image ? `${BACKEND_URL}${member.image}` : null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      setLoading(true);
      await api.delete(`/${id}`);
      setMessage("Member deleted successfully!");
      fetchMembers();
    } catch {
      setMessage("Error deleting member.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", role: "", email: "" });
    setFile(null);
    setPreview(null);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-10 text-gray-100">
      <NavigationButtons/>
      <h1 className="text-4xl font-extrabold text-center text-blue-400 mb-10 drop-shadow-lg">
        Team Member Dashboard
      </h1>

      {/* MESSAGE */}
      {message && (
        <div
          className={`text-center mb-6 p-3 rounded-md font-medium ${
            message.includes("Error") ? "bg-red-700 text-red-100" : "bg-green-700 text-green-100"
          }`}
        >
          {message}
        </div>
      )}

      {/* FORM SECTION */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto mb-12"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-100 text-center">
          {editingId ? "Edit Member" : "Add New Member"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-600 p-3 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Role</label>
            <input
              type="text"
              placeholder="e.g. Frontend Developer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full border border-gray-600 p-3 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-600 p-3 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-300 mb-1">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setFile(file);
                setPreview(file ? URL.createObjectURL(file) : null);
              }}
              className="w-full border border-gray-600 p-2 rounded-lg cursor-pointer bg-gray-900 text-gray-100"
            />
          </div>

          {preview && (
            <div className="md:col-span-2 flex justify-center mt-2">
              <img
                src={preview}
                alt="Preview"
                className="w-28 h-28 object-cover rounded-full shadow-md border border-gray-600"
              />
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Saving..." : editingId ? "Update Member" : "Add Member"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 shadow-md hover:shadow-lg transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* MEMBERS LIST */}
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        {members.map((m, idx) => (
          <div
            key={m._id}
            className="flex items-center p-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${colors[idx % colors.length]}, #1f2937)`,
            }}
          >
            {m.image ? (
              <img
                src={`${BACKEND_URL}${m.image}`}
                alt={m.name}
                className="w-16 h-16 object-cover rounded-full mr-4 flex-shrink-0 shadow-sm border border-gray-600"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-600 rounded-full mr-4 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-100 truncate">{m.name}</h3>
              <p className="text-gray-300 text-sm truncate">{m.role}</p>
              <p className="text-gray-400 text-xs truncate">{m.email || "-"}</p>
            </div>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEdit(m)}
                className="px-3 py-1 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 transition text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(m._id)}
                className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-center text-gray-400 py-8">No team members found.</p>
        )}
      </div>
    </div>
  );
};

export default TeamMemberDashboard;
