import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import NavigationButtons from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // <-- use .env
const API_URL = `${BACKEND_URL}/api/mission-vision`;

export default function MissionVisionDashboard() {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    borderColor: "border-blue-600",
    shadowColor: "hover:shadow-blue-400/50",
  });
  const [editingId, setEditingId] = useState(null);

  const borderOptions = [
    { label: "Blue", value: "border-blue-600" },
    { label: "Green", value: "border-green-500" },
    { label: "Red", value: "border-red-500" },
    { label: "Yellow", value: "border-yellow-400" },
  ];

  const shadowOptions = [
    { label: "Blue Shadow", value: "hover:shadow-blue-400/50" },
    { label: "Green Shadow", value: "hover:shadow-green-400/50" },
    { label: "Red Shadow", value: "hover:shadow-red-400/50" },
    { label: "Purple Shadow", value: "hover:shadow-purple-400/50" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      await axios.put(`${API_URL}/${editingId}`, formData);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      borderColor: "border-blue-600",
      shadowColor: "hover:shadow-blue-400/50",
    });
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-8 text-white">
      <NavigationButtons/>
      <h1 className="text-4xl font-bold text-center mb-10 tracking-tight">
        Mission & Vision Dashboard
      </h1>

      {/* Animated Edit Form */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-2xl font-semibold text-center text-blue-400 mb-6">
              Edit Mission / Vision
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    Border Color
                  </label>
                  <select
                    value={formData.borderColor}
                    onChange={(e) =>
                      setFormData({ ...formData, borderColor: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {borderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-2 font-medium">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                    placeholder="Enter description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    Shadow Color
                  </label>
                  <select
                    value={formData.shadowColor}
                    onChange={(e) =>
                      setFormData({ ...formData, shadowColor: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {shadowOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold text-white shadow-lg shadow-blue-500/30 transition"
                >
                  Update
                </motion.button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 px-6 py-2 rounded-lg font-semibold text-white transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Display Cards */}
      <motion.div
        layout
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"
      >
        {data.map((item) => (
          <motion.div
            key={item._id}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className={`relative p-6 w-80 rounded-2xl border-2 ${item.borderColor} bg-white/10 backdrop-blur-md shadow-md hover:shadow-lg ${item.shadowColor} transition`}
          >
            <h3 className="text-xl font-semibold mb-2 text-blue-300">
              {item.title}
            </h3>
            <p className="text-gray-200 text-sm mb-6 leading-relaxed">
              {item.description}
            </p>

            <div className="flex justify-between mt-auto">
              <button
                onClick={() => handleEdit(item)}
                className="bg-yellow-500 text-white px-4 py-1 rounded-md hover:bg-yellow-600 transition font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
