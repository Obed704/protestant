// frontend/src/admin/TestimonialsAdmin.jsx
import React, { useEffect, useState } from "react";
import NavigationButtons from "./Button";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const COLOR_PRESETS = [
  { name: "Yellow", value: "#facc15" },
  { name: "Blue", value: "#60a5fa" },
  { name: "Green", value: "#34d399" },
  { name: "Pink", value: "#fb7185" },
  { name: "Lavender", value: "#c7b3ff" },
  { name: "White", value: "#ffffff" },
];

const FONTS = [
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Dancing Script", value: "'Dancing Script', cursive" },
  { name: "Montserrat", value: "'Montserrat', sans-serif" },
  { name: "Lobster", value: "'Lobster', cursive" },
  { name: "Arial", value: "Arial, sans-serif" },
];

const TestimonialsAdmin = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    text: "",
    name: "",
    role: "",
    font: "'Dancing Script', cursive",
    borderColor: "#60a5fa",
    textColor: "#ffffff",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/testimonials`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setForm({
      text: "",
      name: "",
      role: "",
      font: "'Dancing Script', cursive",
      borderColor: "#60a5fa",
      textColor: "#ffffff",
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.text.trim() || !form.name.trim())
      return alert("Name and text are required.");

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${BACKEND_URL}/api/testimonials/${editingId}`
      : `${BACKEND_URL}/api/testimonials`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) return alert("Operation failed");
    await fetchItems();
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    const res = await fetch(`${BACKEND_URL}/api/testimonials/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Delete failed");
    await fetchItems();
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      text: item.text,
      name: item.name,
      role: item.role || "",
      font: item.font || "'Dancing Script', cursive",
      borderColor: item.borderColor || "#60a5fa",
      textColor: item.textColor || "#ffffff",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#12111a] to-[#1c1a25] text-gray-200">
      <NavigationButtons />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-10">
          Testimonials Admin Dashboard
        </h1>

        {/* Form */}
        <div className="bg-[#1e1b2e]/70 backdrop-blur-lg shadow-xl rounded-2xl border border-[#5b21b6]/40 p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">
            {editingId ? "Edit Testimonial" : "Add Testimonial"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input fields */}
            <div className="space-y-4">
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Quote..."
                className="w-full p-3 bg-[#26243a] border border-purple-700/40 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-200 placeholder-gray-400"
                rows={4}
              />
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
                className="w-full p-3 bg-[#26243a] border border-purple-700/40 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-200 placeholder-gray-400"
              />
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Role"
                className="w-full p-3 bg-[#26243a] border border-purple-700/40 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-200 placeholder-gray-400"
              />
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="text-sm text-gray-300 font-medium">Font:</label>
                <select
                  value={form.font}
                  onChange={(e) => setForm({ ...form, font: e.target.value })}
                  className="flex-1 p-2 bg-[#26243a] border border-purple-700/40 rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color pickers */}
              <div className="flex gap-6 flex-wrap mt-2">
                <div>
                  <label className="text-sm text-gray-300 block mb-1">
                    Border Color:
                  </label>
                  <input
                    type="color"
                    value={form.borderColor}
                    onChange={(e) =>
                      setForm({ ...form, borderColor: e.target.value })
                    }
                    className="w-12 h-10 border-none rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-1">
                    Text Color:
                  </label>
                  <input
                    type="color"
                    value={form.textColor}
                    onChange={(e) =>
                      setForm({ ...form, textColor: e.target.value })
                    }
                    className="w-12 h-10 border-none rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col justify-between p-4 border border-purple-700/50 rounded-lg bg-[#201c33]/70">
              <div
                style={{
                  fontFamily: form.font,
                  color: form.textColor,
                  border: `3px solid ${form.borderColor}`,
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                <strong>{form.name || "Name"}</strong> ({form.role || "Role"})
                <p className="mt-2">{form.text || "Quote preview..."}</p>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-80 text-white px-5 py-2 rounded-lg transition"
                >
                  {editingId ? "Save Changes" : "Create Testimonial"}
                </button>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="bg-gray-600 hover:bg-gray-700 px-5 py-2 rounded-lg transition text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => (
              <div
                key={it._id}
                className="p-5 rounded-xl shadow-md border border-purple-700/30 bg-[#1f1b2f]/70 backdrop-blur-md hover:scale-[1.02] transition-transform duration-300"
              >
                <div>
                  <div className="text-sm text-gray-400 mb-1">{it.role}</div>
                  <div
                    className="font-semibold text-lg"
                    style={{ color: it.textColor, fontFamily: it.font }}
                  >
                    {it.name}
                  </div>
                  <div className="text-gray-300 mt-2">{it.text}</div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      border: `3px solid ${it.borderColor}`,
                      boxShadow: `0 0 10px ${it.borderColor}66`,
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(it)}
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(it._id)}
                      className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
                    >
                      Delete
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

export default TestimonialsAdmin;
