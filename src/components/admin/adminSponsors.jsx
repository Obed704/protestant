import React, { useState, useEffect } from "react";
import axios from "axios";
import NavigationButtons from "./Button";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const colors = ["rgb(247, 244, 46)", "rgb(23, 207, 220)", "rgb(242, 30, 167)"]; // Color palette

const gradientOptions = [
  { id: 1, value: "from-yellow-400 to-pink-500", colors: ["#F7F42E", "#F21EA7"] },
  { id: 2, value: "from-cyan-400 to-blue-600", colors: ["#17CFDC", "#3B82F6"] },
  { id: 3, value: "from-pink-500 to-purple-600", colors: ["#F21EA7", "#8B5CF6"] },
];

const btnColors = [
  { id: 1, value: "from-yellow-400 to-pink-500", label: "Pink-Yellow" },
  { id: 2, value: "from-cyan-400 to-blue-600", label: "Cyan-Blue" },
  { id: 3, value: "from-pink-500 to-purple-600", label: "Pink-Purple" },
];

const SponsorDashboard = () => {
  const [sponsors, setSponsors] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    gradient: "",
    btnColor: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/sponsors`);
      setSponsors(res.data);
    } catch (err) {
      console.error("Error fetching sponsors:", err.response?.data || err.message);
    }
  };

  const validateFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG, JPG, PNG files are allowed");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.gradient || !formData.btnColor) {
      alert("Please fill all fields and select gradient/button color.");
      return;
    }
    if (!editingId && !file) {
      alert("Please upload an image for the sponsor.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (file) data.append("img", file);

    try {
      if (editingId) {
        await axios.put(`${BACKEND_URL}/api/sponsors/${editingId}`, data);
      } else {
        await axios.post(`${BACKEND_URL}/api/sponsors`, data);
      }
      resetForm();
      fetchSponsors();
    } catch (err) {
      console.error("Axios error:", err.response?.data || err.message);
      alert("Failed to save sponsor. Check console for details.");
    }
  };

  const handleEdit = (s) => {
    setFormData(s);
    setEditingId(s._id);
    setPreview(`${BACKEND_URL}${s.img}`);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/sponsors/${id}`);
      fetchSponsors();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      alert("Failed to delete sponsor. Check console for details.");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", gradient: "", btnColor: "" });
    setFile(null);
    setPreview(null);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-10 text-white">
      <NavigationButtons />
      <h1 className="text-4xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-cyan-400 to-pink-500 animate-gradient mt-6">
        Sponsor Dashboard
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto mb-16"
      >
        <h2 className="text-2xl font-semibold mb-6"> 
          {editingId ? "Edit Sponsor" : "Add New Sponsor"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Sponsor Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-gray-900"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none md:col-span-2 bg-gray-900"
            required
          />

          {/* Gradient Options */}
          <div className="md:col-span-2">
            <p className="font-semibold mb-2">Select Background Gradient:</p>
            <div className="flex gap-3 flex-wrap">
              {gradientOptions.map((g) => (
                <div
                  key={g.id}
                  className={`w-14 h-14 rounded-lg cursor-pointer border-4 transition-all ${formData.gradient === g.value ? "border-white scale-105" : "border-transparent"}`}
                  style={{ background: `linear-gradient(45deg, ${g.colors[0]}, ${g.colors[1]})` }}
                  onClick={() => setFormData({ ...formData, gradient: g.value })}
                />
              ))}
            </div>
          </div>

          {/* Button Options */}
          <div className="md:col-span-2">
            <p className="font-semibold mb-2">Select Button Gradient:</p>
            <div className="flex gap-3 flex-wrap">
              {btnColors.map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  className={`px-4 py-2 rounded-lg bg-gradient-to-r ${btn.value} font-semibold transition-all ${formData.btnColor === btn.value ? "ring-2 ring-white scale-105" : ""}`}
                  onClick={() => setFormData({ ...formData, btnColor: btn.value })}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <label className="md:col-span-2 flex flex-col items-center justify-center border-2 border-dashed border-cyan-400 rounded-xl cursor-pointer hover:bg-gray-700 transition-all py-6">
            <p className="text-cyan-400 font-semibold">Upload Sponsor Image</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" required={!editingId} />
          </label>

          {preview && (
            <div className="md:col-span-2 flex justify-center mt-4">
              <img src={preview} alt="Preview" className="w-48 h-32 object-cover rounded-lg shadow-lg border border-gray-600 transition-transform hover:scale-105" />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-gradient-to-r from-pink-500 via-cyan-400 to-yellow-400 text-black font-semibold py-3 rounded-lg hover:scale-105 transition-all"
        >
          {editingId ? "Update Sponsor" : "Add Sponsor"}
        </button>
      </form>

      {/* Sponsor Compact Cards */}
<div className="max-w-6xl mx-auto flex flex-col gap-3">
  {sponsors.map((s, idx) => (
    <div
      key={s._id}
      className="flex items-center p-3 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02]"
      style={{ background: `linear-gradient(135deg, ${colors[idx % colors.length]}, rgba(0,0,0,0.1))` }}
    >
      {/* Image */}
      {s.img && (
        <img
          src={`${BACKEND_URL}${s.img}`}
          alt={s.name}
          className="w-20 h-20 object-cover rounded-lg mr-4 flex-shrink-0 shadow-sm"
        />
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{s.name}</h3>
        <p className="text-gray-700 text-sm truncate">{s.description}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 ml-4">
        <button
          onClick={() => handleEdit(s)}
          className="px-3 py-1 rounded-lg bg-white text-black font-semibold hover:scale-105 transition-all text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(s._id)}
          className="px-3 py-1 rounded-lg bg-red-600 text-white hover:scale-105 transition-all text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  ))}
</div>


    </div>
  );
};

export default SponsorDashboard;
