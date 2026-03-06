import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/events`;
const DEFAULT_EVENT_IMAGE = "/default-event.jpg";

const resolveEventImage = (imageUrl) => {
  if (!imageUrl) return DEFAULT_EVENT_IMAGE;

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("//")
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return imageUrl;
};

const UpcomingEventsAdmin = () => {
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    verse: "",
    description: "",
    shortDescription: "",
    date: "",
    endDate: "",
    location: "",
    virtualLink: "",
    category: "other",
    capacity: "",
    postedBy: "",
    imageUrl: "",
    isFeatured: false,
    status: "published",
    tags: "",
    image: null,
  });

  const authHeaders = useMemo(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API_ENDPOINT, {
        params: { status: "all", limit: 100, page: 1 },
      });

      let eventsArray = [];

      if (Array.isArray(res.data)) eventsArray = res.data;
      else if (Array.isArray(res.data.events)) eventsArray = res.data.events;
      else if (Array.isArray(res.data.data)) eventsArray = res.data.data;

      setEvents(eventsArray);
    } catch (err) {
      console.error(err);
      alert("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      verse: "",
      description: "",
      shortDescription: "",
      date: "",
      endDate: "",
      location: "",
      virtualLink: "",
      category: "other",
      capacity: "",
      postedBy: "",
      imageUrl: "",
      isFeatured: false,
      status: "published",
      tags: "",
      image: null,
    });
    setEditingId(null);
    setPreviewImage(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files?.[0] || null;
      setFormData((prev) => ({ ...prev, image: file }));

      if (file) {
        setPreviewImage(URL.createObjectURL(file));
      } else {
        setPreviewImage(formData.imageUrl || null);
      }

      return;
    }

    const nextValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (name === "imageUrl") {
      setPreviewImage(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const hasFile = !!formData.image;
      let payload;
      let config = { headers: { ...authHeaders } };

      if (hasFile) {
        payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            payload.append(key, value);
          }
        });
        config.headers["Content-Type"] = "multipart/form-data";
      } else {
        payload = {
          title: formData.title,
          verse: formData.verse,
          description: formData.description,
          shortDescription: formData.shortDescription,
          date: formData.date,
          endDate: formData.endDate || null,
          location: formData.location,
          virtualLink: formData.virtualLink,
          category: formData.category,
          capacity: formData.capacity === "" ? 0 : Number(formData.capacity),
          postedBy: formData.postedBy,
          imageUrl: formData.imageUrl,
          isFeatured: formData.isFeatured,
          status: formData.status,
          tags: formData.tags,
        };
      }

      if (editingId) {
        await axios.put(`${API_ENDPOINT}/${editingId}`, payload, config);
        alert("Event updated");
      } else {
        await axios.post(API_ENDPOINT, payload, config);
        alert("Event created");
      }

      resetForm();
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving event");
    }
  };

  const handleEdit = (event) => {
    const startDate = event.dateStart || event.date;
    const finalEndDate = event.dateEnd || event.endDate;

    setEditingId(event._id);
    setFormData({
      title: event.title || "",
      verse: event.verse || "",
      description: event.description || "",
      shortDescription: event.shortDescription || "",
      date: startDate ? new Date(startDate).toISOString().slice(0, 16) : "",
      endDate: finalEndDate ? new Date(finalEndDate).toISOString().slice(0, 16) : "",
      location: event.location || "",
      virtualLink: event.virtualLink || "",
      category: event.category || "other",
      capacity: event.capacity ?? "",
      postedBy: event.postedBy || "",
      imageUrl: event.imageUrl || "",
      isFeatured: !!event.isFeatured,
      status: event.status || "published",
      tags: Array.isArray(event.tags) ? event.tags.join(", ") : "",
      image: null,
    });

    setPreviewImage(event.imageUrl || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      await axios.delete(`${API_ENDPOINT}/${id}`, {
        headers: { ...authHeaders },
      });
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <Link
        to="/admin"
        className="bg-white shadow px-4 py-2 rounded fixed top-4 left-4 z-20"
      >
        ← Dashboard
      </Link>

      <div className="pt-16">
        <h1 className="text-4xl font-bold text-center mb-10">Manage Events</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow max-w-5xl mx-auto mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? "Edit Event" : "Create Event"}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="text"
              name="title"
              placeholder="Event Title"
              value={formData.title}
              onChange={handleChange}
              className="border p-3 rounded"
              required
            />

            <input
              type="text"
              name="verse"
              placeholder="Bible Verse"
              value={formData.verse}
              onChange={handleChange}
              className="border p-3 rounded"
            />

            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="border p-3 rounded"
              required
            />

            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="border p-3 rounded"
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="border p-3 rounded"
            />

            <input
              type="text"
              name="virtualLink"
              placeholder="Virtual Link"
              value={formData.virtualLink}
              onChange={handleChange}
              className="border p-3 rounded"
            />

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border p-3 rounded"
            >
              <option value="general">General</option>
              <option value="worship">Worship</option>
              <option value="bible_study">Bible Study</option>
              <option value="prayer">Prayer</option>
              <option value="youth">Youth</option>
              <option value="choir">Choir</option>
              <option value="training">Training</option>
              <option value="baptism">Baptism</option>
              <option value="fellowship">Fellowship</option>
              <option value="outreach">Outreach</option>
              <option value="other">Other</option>
            </select>

            <input
              type="number"
              name="capacity"
              placeholder="Capacity (0 = unlimited)"
              value={formData.capacity}
              onChange={handleChange}
              className="border p-3 rounded"
              min="0"
            />

            <input
              type="text"
              name="postedBy"
              placeholder="Posted By"
              value={formData.postedBy}
              onChange={handleChange}
              className="border p-3 rounded"
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border p-3 rounded"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </select>

            <div className="md:col-span-2">
              <input
                type="text"
                name="shortDescription"
                placeholder="Short Description"
                value={formData.shortDescription}
                onChange={handleChange}
                className="border p-3 rounded w-full"
              />
            </div>

            <div className="md:col-span-2">
              <textarea
                name="description"
                placeholder="Event description..."
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="border p-3 rounded w-full"
                required
              />
            </div>

            <div className="md:col-span-2">
              <input
                type="text"
                name="tags"
                placeholder="Tags separated by comma"
                value={formData.tags}
                onChange={handleChange}
                className="border p-3 rounded w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold block mb-2">Image URL</label>
              <input
                type="text"
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={handleChange}
                className="border p-3 rounded w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold block mb-2">Or Upload Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="border p-3 rounded w-full"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <input
                id="isFeatured"
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />
              <label htmlFor="isFeatured" className="font-medium">
                Featured Event
              </label>
            </div>
          </div>

          {previewImage && (
            <div className="mt-6">
              <p className="text-sm mb-2">Preview</p>
              <img
                src={resolveEventImage(previewImage)}
                alt="preview"
                className="w-full max-h-80 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_EVENT_IMAGE;
                }}
              />
            </div>
          )}

          <div className="mt-8 flex gap-4 justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              {editingId ? "Update" : "Create"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <p className="text-center text-lg">Loading events...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const startDate = event.dateStart || event.date;

              return (
                <div
                  key={event._id}
                  className="bg-white rounded-xl shadow overflow-hidden"
                >
                  <img
                    src={resolveEventImage(event.imageUrl)}
                    alt={event.title}
                    className="w-full h-60 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_EVENT_IMAGE;
                    }}
                  />

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      {event.isFeatured && (
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>

                    {event.verse && (
                      <p className="italic text-blue-600 mb-3">"{event.verse}"</p>
                    )}

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {event.shortDescription || event.description}
                    </p>

                    <div className="text-sm text-gray-500 mb-4 space-y-1">
                      <p>
                        <strong>Date:</strong>{" "}
                        {startDate ? new Date(startDate).toLocaleString() : "No date"}
                      </p>
                      <p>
                        <strong>Category:</strong> {event.category || "other"}
                      </p>
                      <p>
                        <strong>Status:</strong> {event.status || "published"}
                      </p>
                      <p>
                        <strong>Posted by:</strong> {event.postedBy || "Admin"}
                      </p>
                      <p>
                        <strong>Attendees:</strong> {event.attendeesCount ?? event.attendees?.length ?? 0}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(event)}
                        className="flex-1 bg-yellow-500 text-white py-2 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(event._id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingEventsAdmin;