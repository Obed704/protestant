import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminStatsWithPreview = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---------------- FETCH STATS SETTINGS ----------------

  // ---------------- FETCH STATS SETTINGS ----------------
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/stats`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        alert("Failed to load stats settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // ---------------- HANDLE STAT CHANGE ----------------
  const handleStatChange = (index, key, value) => {
    const newStats = [...settings.stats];
    newStats[index] = {
      ...newStats[index],
      [key]: key === "target" ? Number(value) || 0 : value,
    };
    setSettings({ ...settings, stats: newStats });
  };

  // ---------------- HANDLE BACKGROUND COLOR ----------------
  const handleBackgroundColorChange = (color) => {
    setSettings({ ...settings, backgroundColor: color });
  };

  // ---------------- HANDLE NUMBER COLOR ----------------
  const handleNumberColorChange = (index, color) => {
    const newStats = [...settings.stats];
    newStats[index].color = color;
    setSettings({ ...settings, stats: newStats });
  };

  // ---------------- SAVE SETTINGS ----------------
  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/stats`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setSettings(data);
      alert("Stats updated successfully!");
    } catch (err) {
      console.error("Error saving stats:", err);
      alert("Error saving stats settings");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- LOADING STATE ----------------
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-700 rounded w-96"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-gray-800 rounded-xl"></div>
          ))}
          <div className="h-96 bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <p className="text-red-400">Failed to load stats settings</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Button/>
      <div className="max-w-5xl mx-auto p-8 space-y-10">
        <header>
          <h1 className="text-4xl font-bold text-white">Homepage Stats Section</h1>
          <p className="mt-3 text-gray-400">
            Customize the animated counter stats that appear on your homepage. Preview updates live below.
          </p>
        </header>

        {/* ---------------- BACKGROUND COLOR ---------------- */}
        <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Section Background</h2>
          <div className="flex items-center gap-6">
            <input
              type="color"
              value={settings.backgroundColor || "#1a1a1a"}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="w-24 h-16 rounded-lg cursor-pointer border-4 border-gray-700 shadow-inner"
            />
            <div>
              <span className="font-mono text-sm text-gray-400 bg-gray-900 px-4 py-2 rounded border border-gray-700">
                {settings.backgroundColor || "#1a1a1a"}
              </span>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            This color fills the entire stats section background.
          </p>
        </section>

        {/* ---------------- STATS CONFIGURATION ---------------- */}
        <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Stats Items</h2>
          <div className="space-y-6">
            {settings.stats.map((stat, idx) => (
              <div
                key={stat._id || idx}
                className="bg-gray-900 p-6 rounded-lg border border-gray-700 space-y-4"
              >
                <div className="grid md:grid-cols-3 gap-6 items-end">
                  {/* Label */}
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Label / Description</label>
                    <input
                      type="text"
                      value={stat.label || ""}
                      onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                      placeholder="e.g., Students Inspired"
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  {/* Target Number */}
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Target Number</label>
                    <input
                      type="number"
                      value={stat.target || 0}
                      onChange={(e) => handleStatChange(idx, "target", e.target.value)}
                      min="0"
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  {/* Number Color */}
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Number Color</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={stat.color || "#ffffff"}
                        onChange={(e) => handleNumberColorChange(idx, e.target.value)}
                        className="w-20 h-12 rounded cursor-pointer border-4 border-gray-800"
                      />
                      <span className="font-mono text-sm text-gray-400 bg-gray-950 px-3 py-2 rounded border border-gray-800">
                        {stat.color || "#ffffff"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Plus Sign Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stat.plus || false}
                    onChange={(e) => handleStatChange(idx, "plus", e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-gray-300">Show "+" after the number (e.g., 500+)</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- SAVE BUTTON ---------------- */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
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
              "Save Stats Settings"
            )}
          </button>
        </div>

        {/* ---------------- LIVE PREVIEW ---------------- */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Live Preview</h2>
          <div
            className="py-24 rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: settings.backgroundColor || "#1a1a1a" }}
          >
            <div className="max-w-5xl mx-auto px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                {settings.stats.map((stat, idx) => (
                  <motion.div
                    key={stat._id || idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.2 }}
                    className="space-y-4"
                  >
                    <h3
                      className="text-6xl font-extrabold tracking-tight"
                      style={{ color: stat.color || "#ffffff" }}
                    >
                      {stat.target?.toLocaleString()}
                      {stat.plus ? "+" : ""}
                    </h3>
                    <p className="text-xl font-medium text-gray-300">
                      {stat.label || "Untitled Stat"}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            This is how your stats will appear on the homepage (with count-up animation on scroll).
          </p>
        </section>
      </div>
    </div>
  );
};

export default AdminStatsWithPreview;