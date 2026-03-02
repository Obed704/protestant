import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/events`;

const UpcomingEventsAdmin = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    verse: "",
    description: "",
    date: "",
    postedBy: "",
    image: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all events safely
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINT);

      // Safely extract events array
      let eventsArray = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          eventsArray = res.data;
        } else if (Array.isArray(res.data.events)) {
          eventsArray = res.data.events;
        } else if (Array.isArray(res.data.data)) {
          eventsArray = res.data.data;
        }
      }

      setEvents(eventsArray);
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
      alert("Failed to load events. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      setPreviewImage(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Submit create or update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    try {
      if (editingId) {
        await axios.put(`${API_ENDPOINT}/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Event updated successfully!");
      } else {
        await axios.post(API_ENDPOINT, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Event created successfully!");
      }

      // Reset form
      setFormData({
        title: "",
        verse: "",
        description: "",
        date: "",
        postedBy: "",
        image: null,
      });
      setPreviewImage(null);
      setEditingId(null);
      fetchEvents();
    } catch (err) {
      console.error("Error saving event:", err);
      alert("Failed to save event.");
    }
  };

  // Edit event
  const handleEdit = (event) => {
    setEditingId(event._id);
    setFormData({
      title: event.title || "",
      verse: event.verse || "",
      description: event.description || "",
      date: event.date ? event.date.split("T")[0] : "",
      postedBy: event.postedBy || "",
      image: null, // Can't pre-fill file input
    });
    setPreviewImage(event.imageUrl ? `${API_BASE_URL}${event.imageUrl}` : null);
  };

  // Delete event
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await axios.delete(`${API_ENDPOINT}/${id}`);
      alert("Event deleted successfully!");
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event.");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <Link
        to="/admin"
        className="bg-white/80 hover:bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md mb-6 inline-block fixed top-4 left-4 z-10"
      >
        ← Dashboard
      </Link>

      <div className="pt-20">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10">
          Manage Upcoming Events
        </h1>

        {/* Event Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg p-8 rounded-2xl mb-12 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-8 text-gray-800">
            {editingId ? "Edit Event" : "Add New Event"}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="text"
              name="title"
              placeholder="Event Title"
              value={formData.title}
              onChange={handleChange}
              className="border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <input
              type="text"
              name="verse"
              placeholder="Bible Verse (optional)"
              value={formData.verse}
              onChange={handleChange}
              className="border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <input
              type="text"
              name="postedBy"
              placeholder="Posted By"
              value={formData.postedBy}
              onChange={handleChange}
              className="border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="md:col-span-2">
              <textarea
                name="description"
                placeholder="Event Description"
                value={formData.description}
                onChange={handleChange}
                className="border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
                rows="4"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Image Preview */}
          {previewImage && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Image Preview:</p>
              <img
                src={previewImage}
                alt="Event preview"
                className="w-full max-h-96 object-cover rounded-xl shadow-md"
              />
            </div>
          )}

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-md"
            >
              {editingId ? "Update Event" : "Create Event"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    title: "",
                    verse: "",
                    description: "",
                    date: "",
                    postedBy: "",
                    image: null,
                  });
                  setPreviewImage(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition shadow-md"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-xl text-gray-600">Loading events...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <p className="text-2xl text-gray-500 mb-3">No upcoming events yet</p>
            <p className="text-gray-400">Create your first event using the form above.</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {event.imageUrl && (
                  <img
                    src={`${API_BASE_URL}${event.imageUrl}`}
                    alt={event.title}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {event.title}
                  </h2>
                  {event.verse && (
                    <p className="text-lg italic text-blue-700 mb-4">“{event.verse}”</p>
                  )}
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {event.description}
                  </p>
                  <div className="text-sm text-gray-500 space-y-1 mb-6">
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Posted by:</strong> {event.postedBy || "Unknown"}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(event)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingEventsAdmin;