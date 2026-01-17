import React, { useEffect, useState } from "react";
import Button from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminHero = () => {
  const [hero, setHero] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ---------------- FETCH HERO ----------------
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/hero`);
        if (!res.ok) throw new Error("Failed to fetch hero data");
        const data = await res.json();
        setHero(data);
      } catch (error) {
        console.error("Error fetching hero:", error);
        alert("Failed to load hero settings");
      } finally {
        setLoading(false);
      }
    };
    fetchHero();
  }, []);

  // ---------------- HANDLE FIELD CHANGE ----------------
  const handleChange = (field, value) => {
    setHero((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ---------------- HANDLE TITLE CHANGE ----------------
  const handleTitleChange = (wordKey, value) => {
    setHero((prev) => ({
      ...prev,
      title: { ...prev.title, [wordKey]: value },
    }));
  };

  // ---------------- HANDLE BUTTON CHANGE ----------------
  const handleButtonChange = (index, key, value) => {
    const newButtons = [...hero.buttons];
    newButtons[index] = { ...newButtons[index], [key]: value };
    setHero((prev) => ({ ...prev, buttons: newButtons }));
  };

  // ---------------- SAVE HERO ----------------
  const saveHero = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/hero`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hero),
      });

      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setHero(data);
      alert("Homepage hero updated successfully!");
    } catch (error) {
      console.error("Error saving hero:", error);
      alert("Error saving hero settings");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- UPLOAD LOGO ----------------
  const uploadLogo = async () => {
    if (!logoFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("logo", logoFile);

    try {
      const res = await fetch(`${BACKEND_URL}/api/hero/upload-logo`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setHero(data);
      setLogoFile(null);
      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Error uploading logo");
    } finally {
      setUploading(false);
    }
  };

  // ---------------- LOADING STATE ----------------
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-700 rounded w-80"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-40 bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!hero) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-red-400">Failed to load hero settings</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto p-8 space-y-10">
        <header>
          <h1 className="text-4xl font-bold text-white">Homepage Hero Settings</h1>
          <p className="mt-3 text-gray-400">
            Customize the main hero section that visitors see when they land on your site.
          </p>
        </header>

        {/* ---------------- LOGO ---------------- */}
        <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Hero Logo</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Current Logo Preview */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                <img
                  src={`${BACKEND_URL}/logo/${hero.logoImage}`}
                  alt="Current hero logo"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="mt-4 text-sm text-gray-400 text-center">
                Recommended: 200×200px (PNG/SVG for best quality)
              </p>
            </div>

            {/* Upload New Logo */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setLogoFile(e.target.files[0])}
                  className="hidden"
                  id="hero-logo-upload"
                />
                <label htmlFor="hero-logo-upload" className="cursor-pointer block">
                  <svg className="w-10 h-10 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5.5 5.5 0 1119.5 8L20 8a6 6 0 11-1.5 11.8M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-300">Click to select a new logo</p>
                  <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                </label>
              </div>

              {logoFile && (
                <div className="text-sm text-gray-300 bg-gray-900 p-3 rounded border border-gray-700">
                  Selected: <span className="font-mono">{logoFile.name}</span>
                </div>
              )}

              <button
                onClick={uploadLogo}
                disabled={!logoFile || uploading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  "Upload New Logo"
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ---------------- TITLE ---------------- */}
        <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Main Title</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 font-medium mb-2">First Word</label>
              <input
                type="text"
                value={hero.title.word1 || ""}
                onChange={(e) => handleTitleChange("word1", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="e.g., STEM"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Second Word</label>
              <input
                type="text"
                value={hero.title.word2 || ""}
                onChange={(e) => handleTitleChange("word2", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="e.g., Inspires"
              />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            These two words appear prominently in large, colorful text on the homepage.
          </p>
        </section>

        {/* ---------------- SUBTITLE ---------------- */}
        <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Subtitle / Description</h2>
          <textarea
            value={hero.subtitle || ""}
            onChange={(e) => handleChange("subtitle", e.target.value)}
            rows={4}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition resize-none"
            placeholder="Welcome to our mission of inspiring the next generation through STEM..."
          />
        </section>

        {/* ---------------- BUTTONS ---------------- */}
        <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Action Buttons</h2>
          <p className="text-sm text-gray-400 mb-6">
            Configure the call-to-action buttons shown in the hero section.
          </p>

          <div className="space-y-6">
            {hero.buttons.map((btn, idx) => (
              <div key={btn._id || idx} className="bg-gray-900 p-5 rounded-lg border border-gray-700">
                <label className="block text-gray-300 font-medium mb-2">
                  Button {idx + 1} Text
                </label>
                <input
                  type="text"
                  value={btn.label || ""}
                  onChange={(e) => handleButtonChange(idx, "label", e.target.value)}
                  placeholder="e.g., Get Started"
                  className="w-full bg-gray-950 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- COLORS ---------------- */}
        <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Color Palette</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Colors (comma-separated RGB or hex)
              </label>
              <input
                type="text"
                value={(hero.colorPalette || []).join(", ")}
                onChange={(e) =>
                  handleChange(
                    "colorPalette",
                    e.target.value
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean)
                  )
                }
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 transition"
                placeholder="e.g., #f7f42e, #17cfdc, #ff6b6b"
              />
              <p className="mt-2 text-sm text-gray-400">
                These colors cycle through your title words and buttons.
              </p>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">Color Behavior</label>
              <select
                value={hero.colorMode || "random-once"}
                onChange={(e) => handleChange("colorMode", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="random-once">Random Colors on Each Page Load</option>
                <option value="fixed">Always Use First Two Colors</option>
              </select>
            </div>
          </div>
        </section>

        {/* ---------------- SAVE ---------------- */}
        <div className="flex justify-end pt-6">
          <button
            onClick={saveHero}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-semibold px-10 py-4 rounded-lg shadow-lg transition transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              "Save All Changes"
            )}
          </button>
        </div>
      </div>
      <Button/>
    </div>
  );
};

export default AdminHero;