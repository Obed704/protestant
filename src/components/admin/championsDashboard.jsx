import { useEffect, useState } from "react";
import axios from "axios";
import NavigationButtons from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ChampionDashboard() {
  const [champions, setChampions] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    season: "",
    description: "",
    roadToVictory: "",
    alt: "",
    showHeader: true,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChampions();
  }, []);

  const fetchChampions = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/champions`);
      setChampions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (file) data.append("image", file);

    try {
      if (editingId) {
        await axios.put(`${BACKEND_URL}/api/champions/${editingId}`, data);
      } else {
        await axios.post(`${BACKEND_URL}/api/champions`, data);
      }
      resetForm();
      fetchChampions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (c) => {
    setFormData({
      title: c.title || "",
      season: c.season || "",
      description: c.description || "",
      roadToVictory: c.roadToVictory || "",
      alt: c.alt || "",
      showHeader: c.showHeader ?? true,
    });
    setEditingId(c._id);
    setPreview(c.image ? `${BACKEND_URL}${c.image}` : null);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${BACKEND_URL}/api/champions/${id}`);
    fetchChampions();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      season: "",
      description: "",
      roadToVictory: "",
      alt: "",
      showHeader: true,
    });
    setFile(null);
    setPreview(null);
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-400">
        Loading champions…
      </div>
    );
  }

  return (
    <>
      <NavigationButtons />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4 py-6 sm:p-10">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-10 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-cyan-400 to-pink-500">
          Champion Dashboard
        </h1>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/80 p-4 sm:p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-6">
            {editingId ? "Edit Champion" : "Add New Champion"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <input
              className="input"
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <input
              className="input"
              placeholder="Season"
              value={formData.season}
              onChange={(e) =>
                setFormData({ ...formData, season: e.target.value })
              }
              required
            />

            <textarea
              className="input sm:col-span-2"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />

            <textarea
              className="input sm:col-span-2"
              placeholder="Road To Victory"
              value={formData.roadToVictory}
              onChange={(e) =>
                setFormData({ ...formData, roadToVictory: e.target.value })
              }
              required
            />

            <input
              className="input"
              placeholder="Alt text"
              value={formData.alt}
              onChange={(e) =>
                setFormData({ ...formData, alt: e.target.value })
              }
            />

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-400 rounded-xl p-6 cursor-pointer hover:bg-gray-700">
              <span className="text-cyan-400 font-semibold">
                Upload Image
              </span>
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files[0];
                  setFile(f);
                  setPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
            </label>

            {preview && (
              <div className="sm:col-span-2 flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-w-xs h-40 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <button className="w-full mt-6 bg-gradient-to-r from-pink-500 via-cyan-400 to-yellow-400 text-black font-semibold py-3 rounded-lg">
            {editingId ? "Update Champion" : "Add Champion"}
          </button>
        </form>

        {/* MOBILE CARDS */}
        <div className="grid gap-4 sm:hidden">
          {champions.map((c) => (
            <div key={c._id} className="bg-gray-900 p-4 rounded-xl shadow">
              {c.image && (
                <img
                  src={`${BACKEND_URL}${c.image}`}
                  alt={c.alt}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              )}
              <h3 className="font-bold">{c.title}</h3>
              <p className="text-gray-400">{c.season}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(c)}
                  className="flex-1 bg-yellow-400 text-black py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="flex-1 bg-red-600 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden sm:block max-w-6xl mx-auto bg-gray-900/80 p-6 rounded-2xl shadow-2xl overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Season</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {champions.map((c) => (
                <tr key={c._id} className="border-b border-gray-700">
                  <td className="p-3">
                    {c.image && (
                      <img
                        src={`${BACKEND_URL}${c.image}`}
                        alt={c.alt}
                        className="w-20 h-14 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="p-3">{c.title}</td>
                  <td className="p-3">{c.season}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(c)}
                        className="px-3 py-1 bg-yellow-400 text-black rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="px-3 py-1 bg-red-600 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
        }
