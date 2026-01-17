import React, { useEffect, useState } from "react";
import NavigationButtons from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProjectSlidesAdmin = () => {
  const [slides, setSlides] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ alt: "", caption: "", src: null });
  const [newSlideData, setNewSlideData] = useState({
    alt: "",
    caption: "",
    src: null,
  });

  // Fetch slides
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/project-slides`)
      .then((res) => res.json())
      .then((data) => setSlides(data))
      .catch((err) => console.error(err));
  }, []);

  // Edit existing slide
  const handleEdit = (slide) => {
    setEditing(slide._id);
    setFormData({ alt: slide.alt, caption: slide.caption, src: null });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) =>
    setFormData((prev) => ({ ...prev, src: e.target.files[0] }));

  const handleUpdate = async (id) => {
    const form = new FormData();
    form.append("alt", formData.alt);
    form.append("caption", formData.caption);
    if (formData.src) form.append("src", formData.src);

    try {
      const res = await fetch(`${BACKEND_URL}/api/project-slides/${id}`, {
        method: "PUT",
        body: form,
      });
      if (!res.ok) throw new Error("Failed to update");
      const updatedSlide = await res.json();
      setSlides((prev) => prev.map((s) => (s._id === id ? updatedSlide : s)));
      setEditing(null);
      alert("✅ Slide updated!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update slide");
    }
  };

  // Add new slide
  const handleNewSlideChange = (e) => {
    const { name, value } = e.target;
    setNewSlideData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewSlideFileChange = (e) =>
    setNewSlideData((prev) => ({ ...prev, src: e.target.files[0] }));

  const handleAddNewSlide = async () => {
    if (!newSlideData.src) return alert("Please select an image for the new slide");
    const form = new FormData();
    form.append("alt", newSlideData.alt);
    form.append("caption", newSlideData.caption);
    form.append("src", newSlideData.src);

    try {
      const res = await fetch(`${BACKEND_URL}/api/project-slides`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Failed to add slide");
      const addedSlide = await res.json();
      setSlides((prev) => [...prev, addedSlide]);
      setNewSlideData({ alt: "", caption: "", src: null });
      alert("✅ Slide added!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add slide");
    }
  };

  // Delete slide
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) return;
    try {
      await fetch(`${BACKEND_URL}/api/project-slides/${id}`, { method: "DELETE" });
      setSlides((prev) => prev.filter((s) => s._id !== id));
      alert("✅ Slide deleted");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete slide");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-gray-100 p-6">
      <NavigationButtons/>
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
        Project Slides Admin
      </h1>

      {/* Add New Slide */}
      <div className="max-w-4xl mx-auto mb-12 backdrop-blur-lg bg-white/10 border border-white/10 p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-indigo-300 mb-4">
          Add New Slide
        </h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleNewSlideFileChange}
          className="w-full bg-gray-900/50 text-white border border-gray-700 rounded p-3 mb-3"
        />
        <input
          type="text"
          name="alt"
          value={newSlideData.alt}
          onChange={handleNewSlideChange}
          placeholder="Alt text"
          className="w-full bg-gray-900/50 text-white border border-gray-700 rounded p-3 mb-3"
        />
        <input
          type="text"
          name="caption"
          value={newSlideData.caption}
          onChange={handleNewSlideChange}
          placeholder="Caption"
          className="w-full bg-gray-900/50 text-white border border-gray-700 rounded p-3 mb-4"
        />
        <button
          onClick={handleAddNewSlide}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
        >
          Add Slide
        </button>
      </div>

      {/* Existing Slides */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {slides.map((slide) => (
          <div
            key={slide._id}
            className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl overflow-hidden shadow-md hover:shadow-indigo-500/20 transition transform hover:-translate-y-1"
          >
            <img
              src={`${BACKEND_URL}${slide.src}`}
              alt={slide.alt}
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              {editing === slide._id ? (
                <div className="space-y-3">
                  <input
                    name="alt"
                    value={formData.alt}
                    onChange={handleChange}
                    placeholder="Alt text"
                    className="w-full bg-gray-900/50 text-white border border-gray-700 rounded p-2"
                  />
                  <input
                    name="caption"
                    value={formData.caption}
                    onChange={handleChange}
                    placeholder="Caption"
                    className="w-full bg-gray-900/50 text-white border border-gray-700 rounded p-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full bg-gray-900/50 text-white border border-gray-700 rounded p-2"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setEditing(null)}
                      className="bg-gray-700 text-gray-300 px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdate(slide._id)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded hover:opacity-90"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-semibold text-indigo-300">
                    {slide.caption}
                  </p>
                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => handleEdit(slide)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded hover:opacity-90"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slide._id)}
                      className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded hover:opacity-90"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectSlidesAdmin;
