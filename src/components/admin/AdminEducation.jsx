import React, { useEffect, useState } from "react";
import NavigationButtons from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // use .env

const EducationDashboard = () => {
  const [educationItems, setEducationItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    borderColor: "",
    alt: "",
    img: null,
  });
  const [loading, setLoading] = useState(true);

  // Fetch all education elements
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/education`)
      .then((res) => res.json())
      .then((data) => {
        setEducationItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching education items:", err);
        setLoading(false);
      });
  }, []);

  // Start editing
  const handleEdit = (item) => {
    setEditing(item._id);
    setFormData({
      title: item.title,
      description: item.description,
      borderColor: item.borderColor,
      alt: item.alt,
      img: null,
    });
  };

  // Handle text field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, img: e.target.files[0] }));
  };

  // Submit updates
  const handleUpdate = async (id) => {
    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) form.append(key, formData[key]);
    });

    try {
      const res = await fetch(`${BACKEND_URL}/api/education/${id}`, {
        method: "PUT",
        body: form,
      });

      if (!res.ok) throw new Error("Failed to update");

      const updatedItem = await res.json();
      setEducationItems((prev) =>
        prev.map((item) => (item._id === id ? updatedItem : item))
      );

      setEditing(null);
      alert("✅ Education element updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update education element.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-300">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-8 text-gray-100">
      <NavigationButtons/>
      <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 mb-10">
        Education Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8">
        {educationItems.map((item) => (
          <div
            key={item._id}
            className={`border-2 ${item.borderColor || "border-indigo-500"} rounded-2xl p-5 bg-gray-900 bg-opacity-70 backdrop-blur-md shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300`}
          >
            <img
              src={`${BACKEND_URL}${item.img}`}
              alt={item.alt}
              className="w-full h-48 object-cover rounded-xl mb-4 border border-gray-700"
            />

            {editing === item._id ? (
              <div className="space-y-3">
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-100 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Title"
                />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-100 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Description"
                  rows="3"
                ></textarea>
                <input
                  name="borderColor"
                  value={formData.borderColor}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-100 focus:ring-2 focus:ring-purple-500"
                  placeholder="Border color (e.g., border-blue-400)"
                />
                <input
                  name="alt"
                  value={formData.alt}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-100 focus:ring-2 focus:ring-pink-500"
                  placeholder="Alt text"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-gray-300 file:bg-gradient-to-r file:from-indigo-500 file:to-pink-500 file:text-white file:border-none file:rounded-lg file:px-3 file:py-1 hover:file:opacity-90 cursor-pointer"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setEditing(null)}
                    className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdate(item._id)}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-white">
                  {item.title}
                </h2>
                <p className="text-gray-400 mt-2">{item.description}</p>
                <button
                  onClick={() => handleEdit(item)}
                  className="mt-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationDashboard;
