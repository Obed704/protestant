import React, { useState, useEffect } from "react";
import axios from "axios";
import NavigationButtons from "./Button";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminFtc() {
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState({ name: "", location: "", website: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  /* ------------------------------------------------------------------ */
  /*  Data fetching                                                    */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/schools`);
      setSchools(res.data);
    } catch (err) {
      console.error("Error fetching schools:", err);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Form handling                                                    */
  /* ------------------------------------------------------------------ */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", form.name);
    data.append("location", form.location);
    data.append("website", form.website);
    if (selectedFile) data.append("img", selectedFile);

    try {
      if (editingId) {
        await axios.put(`${BACKEND_URL}/api/schools/${editingId}`, data);
      } else {
        await axios.post(`${BACKEND_URL}/api/schools`, data);
      }
      resetForm();
      fetchSchools();
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to submit data.");
    }
  };

  const startEdit = (school) => {
    setEditingId(school._id);
    setForm({
      name: school.name,
      location: school.location,
      website: school.website || "",
    });
    setPreview(school.img ? `${BACKEND_URL}${school.img}` : null);
  };

  const deleteSchool = async (id) => {
    if (!window.confirm("Delete this school?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/schools/${id}`);
      fetchSchools();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setEditingId(null);
    setForm({ name: "", location: "", website: "" });
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <>
      <NavigationButtons />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 sm:p-6 md:p-10 pt-20">

        {/* TITLE */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-cyan-400 to-pink-500 animate-gradient">
          FTC Schools Dashboard
        </h1>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-5">
            {editingId ? "Edit School" : "Add New School"}
          </h2>

          {error && <p className="text-red-400 mb-3">{error}</p>}

          <div className="space-y-5">
            <input
              type="text"
              placeholder="School Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-pink-500"
              required
            />

            <input
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-400"
              required
            />

            <input
              type="text"
              placeholder="Website (optional)"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
            />

            {/* Upload */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-400 rounded-xl cursor-pointer hover:bg-gray-700 transition-all py-8">
              <p className="text-cyan-400 font-semibold">Upload School Image</p>
              <p className="text-xs text-gray-400">PNG, JPG up to 5 MB</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {preview && (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full h-40 object-cover rounded-lg shadow-lg border border-gray-600"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-pink-500 via-cyan-400 to-yellow-400 text-black font-semibold py-3 rounded-lg hover:scale-105 transition-all"
          >
            {editingId ? "Update School" : "Add School"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full mt-3 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-all"
            >
              Cancel Edit
            </button>
          )}
        </form>

        {/* LIST – MOBILE CARDS / DESKTOP TABLE */}
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-0">

          {/* ---------- MOBILE CARDS ---------- */}
          <div className="md:hidden">
            {schools.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No schools found.</p>
            ) : (
              schools.map((s) => (
                <div
                  key={s._id}
                  className="bg-gray-800/80 backdrop-blur-md rounded-xl p-4 mb-4 shadow-lg"
                >
                  {s.img && (
                    <img
                      src={`${BACKEND_URL}${s.img}`}
                      alt={s.name}
                      className="w-full h-40 object-cover rounded-md mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-lg">{s.name}</h3>
                  <p className="text-sm text-gray-300">{s.location}</p>
                  {s.website ? (
                    <a
                      href={s.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 text-sm underline"
                    >
                      {s.website}
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">—</span>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => startEdit(s)}
                      className="flex-1 bg-gradient-to-r from-yellow-400 via-cyan-400 to-pink-500 text-black font-medium py-2 rounded-lg hover:scale-105 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSchool(s._id)}
                      className="flex-1 bg-red-600 text-white font-medium py-2 rounded-lg hover:scale-105 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ---------- DESKTOP TABLE ---------- */}
          <div className="hidden md:block bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-semibold mb-5">Schools List</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-white">
                <thead className="bg-gray-800/60">
                  <tr>
                    <th className="p-3 border text-left">Image</th>
                    <th className="p-3 border text-left">Name</th>
                    <th className="p-3 border text-left">Location</th>
                    <th className="p-3 border text-left">Website</th>
                    <th className="p-3 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((s) => (
                    <tr
                      key={s._id}
                      className="hover:bg-gray-700 transition-colors border-b border-gray-800"
                    >
                      <td className="p-3">
                        {s.img && (
                          <img
                            src={`${BACKEND_URL}${s.img}`}
                            alt={s.name}
                            className="w-20 h-14 object-cover rounded-md shadow-lg"
                          />
                        )}
                      </td>
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3">{s.location}</td>
                      <td className="p-3 text-cyan-400">
                        {s.website ? (
                          <a href={s.website} target="_blank" rel="noreferrer">
                            {s.website}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3 text-center flex justify-center gap-2">
                        <button
                          onClick={() => startEdit(s)}
                          className="bg-gradient-to-r from-yellow-400 via-cyan-400 to-pink-500 px-5 py-1 rounded-lg text-black font-semibold hover:scale-105 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSchool(s._id)}
                          className="bg-red-600 px-5 py-1 rounded-lg text-white font-semibold hover:scale-105 transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {schools.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-400 py-4">
                        No schools found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Gradient animation (unchanged) */}
        <style jsx>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 8s ease infinite;
          }
        `}</style>
      </div>

    </>
  );
}