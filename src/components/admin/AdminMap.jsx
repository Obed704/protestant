import React, { useState, useEffect } from "react";
import axios from "axios";
import NavigationButtons from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const FllAdmin = () => {
  const [flls, setFlls] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", logo: "", mapUrl: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFlls();
  }, []);

  const fetchFlls = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/fll`);
      setFlls(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${BACKEND_URL}/api/fll/${editingId}`, form);
      } else {
        await axios.post(`${BACKEND_URL}/api/fll`, form);
      }
      setForm({ title: "", description: "", logo: "", mapUrl: "" });
      setEditingId(null);
      fetchFlls();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (fll) => {
    setForm({ title: fll.title, description: fll.description, logo: fll.logo, mapUrl: fll.mapUrl || "" });
    setEditingId(fll._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/fll/${id}`);
      fetchFlls();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-12">
      <NavigationButtons />
      <h1 className="text-4xl font-bold mb-10 text-center md:text-left">FLL Admin Dashboard</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 md:p-10 rounded-3xl shadow-lg mb-12 space-y-6 max-w-3xl mx-auto"
      >
        {["title", "description", "logo", "mapUrl"].map((field) => (
          <div key={field}>
            <label className="block mb-2 text-gray-300 font-medium capitalize">{field}</label>
            {field === "description" ? (
              <textarea
                placeholder={`Enter ${field}`}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl bg-gray-700 border border-gray-600 focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-30 outline-none transition resize-none"
                rows={4}
                required
              />
            ) : (
              <input
                type="text"
                placeholder={`Enter ${field}`}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl bg-gray-700 border border-gray-600 focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-30 outline-none transition"
                required={field !== "mapUrl"}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          className={`w-full py-4 rounded-2xl text-white font-semibold transition text-lg ${
            editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-pink-600 hover:bg-pink-700"
          }`}
        >
          {editingId ? "Update FLL" : "Add FLL"}
        </button>
      </form>

      {/* FLL List */}
      <div className="grid gap-6 md:grid-cols-2">
        {flls.map((fll) => (
          <div
            key={fll._id}
            className="bg-gray-800 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg hover:shadow-xl transition"
          >
            <div className="flex-1">
              <h2 className="font-bold text-xl md:text-2xl mb-2">{fll.title}</h2>
              <p className="text-gray-300 mb-4">{fll.description}</p>

              {/* Map Preview */}
              {fll.mapUrl && (
                <div className="w-full h-64 md:h-48 rounded-2xl overflow-hidden border border-gray-600">
                  <iframe
                    src={fll.mapUrl}
                    title={fll.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
            <div className="flex gap-3 md:gap-2 mt-4 md:mt-0">
              <button
                onClick={() => handleEdit(fll)}
                className="px-4 py-2 bg-blue-600 rounded-2xl hover:bg-blue-700 transition font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(fll._id)}
                className="px-4 py-2 bg-red-600 rounded-2xl hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FllAdmin;
