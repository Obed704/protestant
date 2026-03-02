import { useEffect, useState } from "react";
import Button from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminNavbar = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch navbar settings
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/navbar`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Save settings
  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/navbar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Save failed");
      alert("✅ Navbar settings saved successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Upload logo
  const uploadLogo = async (file) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("logo", file);

    try {
      const uploadRes = await fetch(`${BACKEND_URL}/api/navbar/upload-logo`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const refreshed = await fetch(`${BACKEND_URL}/api/navbar`).then((r) => {
        if (!r.ok) throw new Error("Refresh failed");
        return r.json();
      });

      setData(refreshed);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-9 bg-gray-700 rounded w-64"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // No data
  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-red-400">No navbar data found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto p-8 space-y-10">
        <header>
          <h1 className="text-4xl font-bold text-white">Navbar Settings</h1>
          <p className="mt-2 text-gray-400">
            Customize the appearance of your site's navigation bar
          </p>
        </header>

        {/* Logo Upload */}
        <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Navbar Logo</h2>

          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className="cursor-pointer block">
              <div className="text-gray-400">
                <svg
                  className="w-12 h-12 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-lg">Click to upload or drag and drop</p>
                <p className="text-sm mt-1">PNG, JPG, SVG (recommended 200×60px)</p>
              </div>
            </label>
          </div>

          {uploading && (
            <p className="mt-4 text-center text-indigo-400">Uploading...</p>
          )}

          {data.logoImage && (
            <div className="mt-6 flex justify-center">
              <img
                src={`${BACKEND_URL}/logo/${data.logoImage}`}
                alt="Current logo"
                className="h-20 object-contain bg-gray-900 p-3 rounded-lg border border-gray-700"
              />
            </div>
          )}
        </section>

        {/* Logo Mode */}
        <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Logo Layout</h2>
          <select
            value={data.logoMode || "logo-only"}
            onChange={(e) => setData({ ...data, logoMode: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="logo-only">Logo only</option>
            <option value="logo-with-text">Logo + “STEM Inspires” text</option>
          </select>
        </section>

        {/* Colors */}
        <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Colors</h2>

          <div className="space-y-6">
            {/* Hover Color */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="text-gray-300 font-medium sm:w-40">
                Hover Color
              </label>
              <div className="flex items-center gap-4 flex-1">
                <input
                  type="color"
                  value={data.hoverColor || "#000000"}
                  onChange={(e) =>
                    setData({ ...data, hoverColor: e.target.value })
                  }
                  className="w-20 h-12 rounded cursor-pointer bg-gray-900 border border-gray-700"
                />
                <span className="font-mono text-sm text-gray-400 bg-gray-900 px-3 py-2 rounded border border-gray-700">
                  {data.hoverColor || "#000000"}
                </span>
              </div>
            </div>

            {/* Text Color */}
            {/* <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="text-gray-300 font-medium sm:w-40">
                Text Color
              </label>
              <input
                type="text"
                value={data.textColor || ""}
                onChange={(e) =>
                  setData({ ...data, textColor: e.target.value })
                }
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition font-mono"
                placeholder="e.g., text-white, text-gray-200"
              />
            </div> */}
          </div>
        </section>

        {/* Links Preview */}
        <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">
            Navbar Links (Preview)
          </h2>
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
            {data.links && data.links.length > 0 ? (
              <ul className="space-y-3">
                {data.links.map((link, index) => (
                  <li
                    key={`${link.name}-${index}`} // safe unique key
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-300">{link.name}</span>
                    <span className="text-gray-500 font-mono text-xs">
                      {link.link}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No links configured</p>
            )}
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              "Save Navbar Settings"
            )}
          </button>
        </div>
      </div>
      <Button/>
    </div>
  );
};

export default AdminNavbar;