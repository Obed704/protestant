import React, { useEffect, useState } from "react";
import NavigationButtons from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProcessDashboard = () => {
  const [steps, setSteps] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    alt: "",
    highlight: "",
    img: null,
  });
  const [loading, setLoading] = useState(true);

  // Fetch process steps
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/process`)
      .then((res) => res.json())
      .then((data) => {
        setSteps(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching process steps:", err);
        setLoading(false);
      });
  }, []);

  // Start editing
  const handleEdit = (step) => {
    setEditing(step._id);
    setFormData({
      title: step.title,
      description: step.description,
      alt: step.alt,
      highlight: step.highlight || "",
      img: null,
    });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, img: e.target.files[0] }));
  };

  // Save updates
  const handleUpdate = async (id) => {
    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) form.append(key, formData[key]);
    });

    try {
      const res = await fetch(`${BACKEND_URL}/api/process/${id}`, {
        method: "PUT",
        body: form,
      });

      if (!res.ok) throw new Error("Failed to update");

      const updatedStep = await res.json();
      setSteps((prev) =>
        prev.map((step) => (step._id === id ? updatedStep : step))
      );

      setEditing(null);
      alert("✅ Process step updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update process step.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-black text-white">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-gray-100 p-6">
      <NavigationButtons/>
      <h1 className="text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-10">
        Process Steps Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {steps.map((step) => (
          <div
            key={step._id}
            className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl shadow-lg hover:shadow-indigo-500/20 transition transform hover:-translate-y-1"
          >
            <img
              src={`${BACKEND_URL}${step.img}`}
              alt={step.alt}
              className="w-full h-48 object-cover rounded-t-2xl"
            />

            <div className="p-5">
              {editing === step._id ? (
                <div className="space-y-3">
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-gray-900/50 text-white border border-gray-700 rounded p-2"
                    placeholder="Title"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-gray-900/50 text-white border border-gray-700 rounded p-2 h-24"
                    placeholder="Description"
                  />
                  <input
                    name="alt"
                    value={formData.alt}
                    onChange={handleChange}
                    className="w-full bg-gray-900/50 text-white border border-gray-700 rounded p-2"
                    placeholder="Alt text"
                  />
                  <input
                    name="highlight"
                    value={formData.highlight}
                    onChange={handleChange}
                    className="w-full bg-gray-900/50 text-white border border-gray-700 rounded p-2"
                    placeholder="Highlight color (e.g. text-indigo-400)"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full bg-gray-900/50 text-sm border border-gray-700 rounded p-2"
                  />

                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => setEditing(null)}
                      className="bg-gray-700 text-gray-200 px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdate(step._id)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded hover:opacity-90"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-indigo-300">
                    {step.title}
                  </h2>
                  <p className="text-gray-300 mt-2 text-sm line-clamp-3">
                    {step.description}
                  </p>
                  <button
                    onClick={() => handleEdit(step)}
                    className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded hover:opacity-90 transition"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessDashboard;
