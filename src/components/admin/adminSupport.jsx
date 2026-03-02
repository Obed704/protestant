import React, { useEffect, useState } from "react";
import Button from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminSupport = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState(null);

  // ---------------- FETCH CARDS ----------------
    // ----------------  ----------------
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/support`);
        if (!res.ok) throw new Error("Failed to fetch support cards");
        const data = await res.json();
        setCards(data.map((c) => ({ ...c, imageFile: null })));
      } catch (err) {
        console.error("Error fetching support cards:", err);
        alert("Failed to load support cards");
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  // ---------------- HANDLE CHANGES ----------------
  const handleChange = (idx, key, value) => {
    const updated = [...cards];
    updated[idx][key] = value;
    setCards(updated);
  };

  const handleFileChange = (idx, file) => {
    if (!file) return;
    const updated = [...cards];
    updated[idx].imageFile = file;
    setCards(updated);
  };

  // ---------------- SAVE CARD ----------------
  const saveCard = async (card, idx) => {
    setSavingIndex(idx);
    const formData = new FormData();
    formData.append("title", card.title || "");
    formData.append("description", card.description || "");
    formData.append("linkText", card.linkText || "");
    formData.append("linkHref", card.linkHref || "#");
    formData.append("alt", card.alt || "");

    if (card.imageFile) {
      formData.append("image", card.imageFile);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/support/${card._id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Save failed");
      const updatedCard = await res.json();

      const newCards = [...cards];
      newCards[idx] = { ...updatedCard, imageFile: null };
      setCards(newCards);

      alert("Card updated successfully!");
    } catch (err) {
      console.error("Error saving card:", err);
      alert("Error updating card");
    } finally {
      setSavingIndex(null);
    }
  };

  // ---------------- LOADING STATE ----------------
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-700 rounded w-96"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <p className="text-gray-400">No support cards found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-5xl mx-auto p-8 space-y-12">
        <header>
          <h1 className="text-4xl font-bold text-white">Support & Sponsors Section</h1>
          <p className="mt-3 text-gray-400">
            Manage the sponsor/support cards displayed on your homepage or dedicated page.
          </p>
        </header>

        {cards.map((card, idx) => (
          <section
            key={card._id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-xl space-y-8"
          >
            <h2 className="text-2xl font-semibold text-white">
              Card #{idx + 1}: {card.title || "Untitled Sponsor"}
            </h2>

            <div className="grid lg:grid-cols-2 gap-10">
              {/* ---------------- EDIT FORM ---------------- */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={card.title || ""}
                    onChange={(e) => handleChange(idx, "title", e.target.value)}
                    placeholder="e.g., Google for Education"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Description</label>
                  <textarea
                    value={card.description || ""}
                    onChange={(e) => handleChange(idx, "description", e.target.value)}
                    rows={3}
                    placeholder="A short description of this sponsor or support level..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>

                {/* Link Text & URL */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Link Text</label>
                    <input
                      type="text"
                      value={card.linkText || ""}
                      onChange={(e) => handleChange(idx, "linkText", e.target.value)}
                      placeholder="e.g., Visit Website"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Link URL</label>
                    <input
                      type="text"
                      value={card.linkHref || ""}
                      onChange={(e) => handleChange(idx, "linkHref", e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Image Alt Text */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Image Alt Text</label>
                  <input
                    type="text"
                    value={card.alt || ""}
                    onChange={(e) => handleChange(idx, "alt", e.target.value)}
                    placeholder="e.g., Google for Education logo"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Sponsor Logo/Image</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(idx, e.target.files[0])}
                      className="hidden"
                      id={`support-upload-${idx}`}
                    />
                    <label htmlFor={`support-upload-${idx}`} className="cursor-pointer block">
                      <svg className="w-10 h-10 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5.5 5.5 0 1119.5 8L20 8a6 6 0 11-1.5 11.8M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-300">Click to upload new image</p>
                      <p className="text-sm text-gray-500">Recommended: 300×200px (transparent PNG ideal)</p>
                    </label>
                  </div>

                  {card.imageFile && (
                    <p className="mt-3 text-sm text-indigo-400">
                      New file: <span className="font-mono">{card.imageFile.name}</span>
                    </p>
                  )}
                </div>

                {/* Save Button */}
                <button
                  onClick={() => saveCard(card, idx)}
                  disabled={savingIndex === idx}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-semibold rounded-lg transition flex items-center justify-center gap-3"
                >
                  {savingIndex === idx ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save This Card"
                  )}
                </button>
              </div>

              {/* ---------------- LIVE CARD PREVIEW ---------------- */}
              <div className="flex justify-center items-start">
                <div className="bg-gray-950 rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-gray-700 text-center space-y-6">
                  {/* Image */}
                  <img
                    src={
                      card.imageFile
                        ? URL.createObjectURL(card.imageFile)
                        : `${BACKEND_URL}${card.image}`
                    }
                    alt={card.alt || card.title || "Sponsor logo"}
                    className="mx-auto h-32 object-contain bg-white p-4 rounded-lg"
                  />

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white">
                    {card.title || "Sponsor Name"}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 leading-relaxed">
                    {card.description || "Supporting STEM education and innovation."}
                  </p>

                  {/* Link */}
                  {card.linkText && (
                    <a
                      href={card.linkHref || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition shadow-lg"
                    >
                      {card.linkText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
      <Button/>
    </div>
  );
};

export default AdminSupport;