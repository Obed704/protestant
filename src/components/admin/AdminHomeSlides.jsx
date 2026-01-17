import { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api/slides`;

export default function SlidesAdmin() {
  const [slides, setSlides] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchSlides = async () => {
    const res = await axios.get(API);
    setSlides(res.data);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  /* Handle file select */
  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  /* Submit (add / update) */
  const submit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);

    try {
      if (editId) {
        await axiosAuth.put(`${API}/${editId}`, formData);
      } else {
        await axiosAuth.post(API, formData);
      }

      resetForm();
      fetchSlides();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setEditId(null);
  };

  const editSlide = (slide) => {
    setEditId(slide._id);
    setPreview(`${BACKEND_URL}${slide.bg}`);
  };

  const deleteSlide = async (id) => {
    if (!confirm("Delete this slide?")) return;
    await axiosAuth.delete(`${API}/${id}`);
    fetchSlides();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            Slides Administration
          </h1>
          <p className="text-neutral-400 mt-1">
            Upload and manage homepage carousel images
          </p>
        </header>

        {/* Upload Form */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-14">
          <h2 className="text-lg font-medium mb-4">
            {editId ? "Update Slide Image" : "Add New Slide"}
          </h2>

          <div className="flex flex-col md:flex-row gap-6 items-start">

            {/* File Input */}
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              <div className="border-2 border-dashed border-neutral-700 rounded-xl h-48 flex items-center justify-center hover:border-neutral-500 transition">
                {preview ? (
                  <img
                    src={preview}
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-neutral-400 text-sm">
                    Click to upload image
                  </span>
                )}
              </div>
            </label>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={submit}
                disabled={loading}
                className="bg-white text-black font-medium px-8 py-3 rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : editId
                  ? "Update Slide"
                  : "Add Slide"}
              </button>

              {editId && (
                <button
                  onClick={resetForm}
                  className="text-sm text-neutral-400 hover:text-neutral-200"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Slides Grid */}
        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => (
            <div
              key={slide._id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={`${BACKEND_URL}${slide.bg}`}
                  alt="slide"
                  className="h-48 w-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition" />
              </div>

              <div className="p-4 flex justify-between">
                <button
                  onClick={() => editSlide(slide)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteSlide(slide._id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Empty State */}
        {slides.length === 0 && (
          <p className="text-center text-neutral-500 mt-20">
            No slides uploaded yet
          </p>
        )}
      </div>
    </div>
  );
}
