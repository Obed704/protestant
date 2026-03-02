import React, { useEffect, useState } from "react";
import axios from "axios";
import FloatingNavigationButtons from "./admin/Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminSistersCard = () => {
  const [title, setTitle] = useState("");
  const [paragraphs, setParagraphs] = useState([{ text: "", highlight: false }]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ================= FETCH DATA =================
  // ================= FETCH DATA =================
  // ----------------  ----------------
  const fetchData = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/sections/sisters_card?_=${Date.now()}`);
      setTitle(res.data.title || "");
      setParagraphs(res.data.description || [{ text: "", highlight: false }]);
    } catch (err) {
      console.error("Failed to fetch sisters card:", err);
      alert("❌ Failed to load data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= HANDLERS =================
  const handleParagraphChange = (index, key, value) => {
    const updated = [...paragraphs];
    updated[index][key] = value;
    setParagraphs(updated);
  };

  const addParagraph = () => {
    setParagraphs([...paragraphs, { text: "", highlight: false }]);
  };

  const removeParagraph = (index) => {
    setParagraphs(paragraphs.filter((_, i) => i !== index));
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      await axios.put(`${BACKEND_URL}/api/sections/sisters_card`, {
        title,
        description: paragraphs,
      });
      await fetchData();
      alert("✅ Updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-300">Loading...</p>;

  // ================= RENDER =================
  return (
    <div className="bg-gray-800">
      <FloatingNavigationButtons/>
      <div className="max-w-5xl mx-auto p-8 bg-gray-900 rounded-xl shadow-xl border border-gray-700 
    ">
      <h2 className="text-3xl font-bold mb-8 text-cyan-400">Edit Sisters Card</h2>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2 text-gray-200">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-4 border border-gray-600 bg-gray-800 text-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Paragraphs */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2 text-gray-200">Paragraphs</label>
        {paragraphs.map((p, index) => (
          <div key={index} className="mb-4 border border-gray-700 rounded-lg p-4 bg-gray-800">
            <textarea
              value={p.text}
              onChange={(e) => handleParagraphChange(index, "text", e.target.value)}
              placeholder="Enter paragraph text..."
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-gray-200 focus:ring-1 focus:ring-cyan-400"
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-gray-200">
                <input
                  type="checkbox"
                  checked={p.highlight}
                  onChange={(e) => handleParagraphChange(index, "highlight", e.target.checked)}
                  className="accent-cyan-400"
                />
                Highlight this paragraph
              </label>
              <button
                onClick={() => removeParagraph(index)}
                className="text-red-400 hover:text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={addParagraph}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md mt-2 shadow-md transition transform hover:scale-105"
        >
          + Add Paragraph
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={saveChanges}
        disabled={saving}
        className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition transform hover:scale-105 disabled:scale-100"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
    </div>
  );
};

export default AdminSistersCard;
