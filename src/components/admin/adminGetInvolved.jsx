import React, { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminGetInvolved = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState(null);

  // ---------------- FETCH ITEMS ----------------
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/getinvolved`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const formatted = data.map((item) => ({
          ...item,
          imgFile: null, // temporary file for upload preview
        }));
        setItems(formatted);
      } catch (err) {
        console.error("Error fetching Get Involved items:", err);
        alert("Failed to load items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // ---------------- HANDLE CHANGES ----------------
  const handleChange = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
  };

  const handleFileChange = (index, file) => {
    if (!file) return;
    const updated = [...items];
    updated[index].imgFile = file;
    setItems(updated);
  };

  // ---------------- SAVE ITEM ----------------
  const saveItem = async (item, index) => {
    setSavingIndex(index);
    const formData = new FormData();
    formData.append("title", item.title || "");
    formData.append("description", item.description || "");
    formData.append("buttonText", item.buttonText || "");
    formData.append("buttonLink", item.buttonLink || "#");
    formData.append("buttonColor", item.buttonColor || "#f21ea7");

    if (item.imgFile) {
      formData.append("img", item.imgFile);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/getinvolved/${item._id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();

      const updated = [...items];
      updated[index] = { ...data, imgFile: null };
      setItems(updated);

      alert("Item updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating item");
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

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <p className="text-gray-400">No "Get Involved" items found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-5xl mx-auto p-8 space-y-12">
        <header>
          <h1 className="text-4xl font-bold text-white">Get Involved Section</h1>
          <p className="mt-3 text-gray-400">
            Manage the cards shown in the "Get Involved" section of the homepage.
          </p>
        </header>

        {items.map((item, idx) => (
          <section
            key={item._id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-xl space-y-8"
          >
            <h2 className="text-2xl font-semibold text-white">
              Card #{idx + 1}: {item.title || "Untitled"}
            </h2>

            <div className="grid lg:grid-cols-2 gap-10">
              {/* ---------------- EDIT FORM ---------------- */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) => handleChange(idx, "title", e.target.value)}
                    placeholder="e.g., Volunteer With Us"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Description</label>
                  <textarea
                    value={item.description || ""}
                    onChange={(e) => handleChange(idx, "description", e.target.value)}
                    rows={4}
                    placeholder="Brief description of this involvement opportunity..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>

                {/* Button Text */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Button Text</label>
                  <input
                    type="text"
                    value={item.buttonText || ""}
                    onChange={(e) => handleChange(idx, "buttonText", e.target.value)}
                    placeholder="e.g., Learn More"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Button Color */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Button Color</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={item.buttonColor || "#f21ea7"}
                      onChange={(e) => handleChange(idx, "buttonColor", e.target.value)}
                      className="w-20 h-12 rounded cursor-pointer border-4 border-gray-700"
                    />
                    <span className="font-mono text-sm text-gray-400 bg-gray-900 px-4 py-2 rounded border border-gray-700">
                      {item.buttonColor || "#f21ea7"}
                    </span>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Card Image</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(idx, e.target.files[0])}
                      className="hidden"
                      id={`upload-${idx}`}
                    />
                    <label htmlFor={`upload-${idx}`} className="cursor-pointer block">
                      <svg className="w-10 h-10 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5.5 5.5 0 1119.5 8L20 8a6 6 0 11-1.5 11.8M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-300">Click to upload new image</p>
                      <p className="text-sm text-gray-500">Recommended: 600×400px</p>
                    </label>
                  </div>

                  {item.imgFile && (
                    <p className="mt-3 text-sm text-indigo-400">
                      New file selected: <span className="font-mono">{item.imgFile.name}</span>
                    </p>
                  )}
                </div>

                {/* Save Button */}
                <button
                  onClick={() => saveItem(item, idx)}
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
              <div className="flex justify-center">
                <div className="bg-gray-950 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md border border-gray-700">
                  {/* Image */}
                  <img
                    src={
                      item.imgFile
                        ? URL.createObjectURL(item.imgFile)
                        : `${BACKEND_URL}${item.img}`
                    }
                    alt={item.title || "Card preview"}
                    className="w-full h-64 object-cover"
                  />

                  {/* Content */}
                  <div className="p-8 text-center space-y-4">
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: item.buttonColor || "#f21ea7" }}
                    >
                      {item.title || "Your Title Here"}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {item.description || "Your description will appear here."}
                    </p>
                    <a
                      href={item.buttonLink || "#"}
                      style={{ backgroundColor: item.buttonColor || "#f21ea7" }}
                      className="inline-block px-8 py-3 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg"
                    >
                      {item.buttonText || "Call to Action"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
  // ---------------- ----------------

export default AdminGetInvolved;