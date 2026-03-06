import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext.jsx";
import {
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiSave,
  FiRefreshCw,
  FiImage,
  FiUsers,
  FiStar,
  FiCheckCircle,
  FiPhone,
  FiMail,
  FiUser,
  FiCamera,
  FiList,
  FiInfo,
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const imageTypes = [
  "hero",
  "gallery",
  "event",
  "choir",
  "worship",
  "service",
  "mission",
  "team",
  "other",
];

const createEmptyMember = () => ({
  name: "",
  role: "",
  imageUrl: "",
  phone: "",
  email: "",
  bio: "",
  socials: {
    instagram: "",
    facebook: "",
    linkedin: "",
    x: "",
    whatsapp: "",
  },
});

const createEmptyCommittee = () => ({
  role: "",
  name: "",
  imageUrl: "",
  phone: "",
  email: "",
});

const createEmptyGalleryItem = () => ({
  type: "gallery",
  title: "",
  imageUrl: "",
  description: "",
});

const createEmptyForm = () => ({
  name: "",
  president: "",
  est: "",
  description: "",
  phone: "",
  email: "",
  heroImage: "",
  plans: [""],
  actions: [""],
  members: [],
  committee: [],
  gallery: [],
});

const AdminDepartments = () => {
  const { token } = useContext(AuthContext);

  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(createEmptyForm());

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/departments`, {
        headers: authHeaders,
      });
      setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching departments:", err.response?.data || err);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(createEmptyForm());
    setEditingId(null);
    setActiveTab("info");
  };

  const cleanStringArray = (arr = []) =>
    arr.map((item) => String(item || "").trim()).filter(Boolean);

  const buildPayload = () => ({
    name: formData.name,
    president: formData.president,
    est: formData.est,
    description: formData.description,
    phone: formData.phone,
    email: formData.email,
    heroImage: formData.heroImage,
    plans: cleanStringArray(formData.plans),
    actions: cleanStringArray(formData.actions),
    members: (formData.members || [])
      .map((member) => ({
        name: member.name?.trim() || "",
        role: member.role?.trim() || "",
        imageUrl: member.imageUrl?.trim() || "",
        phone: member.phone?.trim() || "",
        email: member.email?.trim() || "",
        bio: member.bio?.trim() || "",
        socials: {
          instagram: member.socials?.instagram?.trim() || "",
          facebook: member.socials?.facebook?.trim() || "",
          linkedin: member.socials?.linkedin?.trim() || "",
          x: member.socials?.x?.trim() || "",
          whatsapp: member.socials?.whatsapp?.trim() || "",
        },
      }))
      .filter((member) => member.name),
    committee: (formData.committee || [])
      .map((item) => ({
        role: item.role?.trim() || "",
        name: item.name?.trim() || "",
        imageUrl: item.imageUrl?.trim() || "",
        phone: item.phone?.trim() || "",
        email: item.email?.trim() || "",
      }))
      .filter((item) => item.role && item.name),
    gallery: (formData.gallery || [])
      .map((img) => ({
        type: img.type?.trim() || "gallery",
        title: img.title?.trim() || "",
        imageUrl: img.imageUrl?.trim() || "",
        description: img.description?.trim() || "",
      }))
      .filter((img) => img.imageUrl),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Department name is required.");
      return;
    }

    if (!formData.president.trim()) {
      alert("President is required.");
      return;
    }

    const payload = buildPayload();

    try {
      setSaving(true);

      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/departments/${editingId}`, payload, {
          headers: authHeaders,
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/departments`, payload, {
          headers: authHeaders,
        });
      }

      resetForm();
      fetchDepartments();
    } catch (err) {
      console.error("Error saving department:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to save department.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dept) => {
    setEditingId(dept._id);
    setFormData({
      name: dept.name || "",
      president: dept.president || "",
      est: dept.est || "",
      description: dept.description || "",
      phone: dept.phone || "",
      email: dept.email || "",
      heroImage: dept.heroImage || "",
      plans: dept.plans?.length ? dept.plans : [""],
      actions: dept.actions?.length ? dept.actions : [""],
      members: Array.isArray(dept.members) ? dept.members : [],
      committee: Array.isArray(dept.committee) ? dept.committee : [],
      gallery: Array.isArray(dept.gallery) ? dept.gallery : [],
    });
    setActiveTab("info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/departments/${id}`, {
        headers: authHeaders,
      });
      fetchDepartments();

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error("Error deleting department:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to delete department.");
    }
  };

  const updateArrayItem = (field, index, key, value) => {
    setFormData((prev) => {
      const copy = [...prev[field]];
      copy[index] = { ...copy[index], [key]: value };
      return { ...prev, [field]: copy };
    });
  };

  const updateNestedSocial = (memberIndex, socialKey, value) => {
    setFormData((prev) => {
      const members = [...prev.members];
      members[memberIndex] = {
        ...members[memberIndex],
        socials: {
          ...(members[memberIndex].socials || {}),
          [socialKey]: value,
        },
      };
      return { ...prev, members };
    });
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, createEmptyMember()],
    }));
  };

  const addCommittee = () => {
    setFormData((prev) => ({
      ...prev,
      committee: [...prev.committee, createEmptyCommittee()],
    }));
  };

  const addGalleryItem = () => {
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, createEmptyGalleryItem()],
    }));
  };

  const updateSimpleStringList = (field, index, value) => {
    setFormData((prev) => {
      const copy = [...prev[field]];
      copy[index] = value;
      return { ...prev, [field]: copy };
    });
  };

  const addSimpleStringListItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeSimpleStringListItem = (field, index) => {
    setFormData((prev) => {
      const copy = prev[field].filter((_, i) => i !== index);
      return {
        ...prev,
        [field]: copy.length ? copy : [""],
      };
    });
  };

  const tabs = [
    { key: "info", label: "Basic Info", icon: <FiInfo /> },
    { key: "images", label: "Images", icon: <FiImage /> },
    { key: "members", label: "Members", icon: <FiUsers /> },
    { key: "committee", label: "Committee", icon: <FiUser /> },
    { key: "plans", label: "Plans & Actions", icon: <FiList /> },
  ];

  return (
    <section className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 mb-6 bg-white hover:bg-gray-50 text-gray-800 font-semibold px-4 py-2 rounded-lg shadow"
        >
          ← Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">
          Department Management
        </h1>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-10 border border-slate-200">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-5">
            <h2 className="text-2xl font-bold">
              {editingId ? "Edit Department" : "Create New Department"}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Use the tabs below to fill in department details step by step.
            </p>
          </div>

          <div className="p-4 md:p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Department Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter department name"
                      className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      President
                    </label>
                    <input
                      type="text"
                      name="president"
                      value={formData.president}
                      onChange={handleChange}
                      placeholder="Department president"
                      className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Established Year
                    </label>
                    <input
                      type="text"
                      name="est"
                      value={formData.est}
                      onChange={handleChange}
                      placeholder="e.g. 2018"
                      className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+250..."
                      className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="department@email.com"
                      className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the department"
                      rows={5}
                      className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === "images" && (
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-4 border">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Hero Image URL
                    </label>
                    <input
                      type="url"
                      name="heroImage"
                      value={formData.heroImage}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      This will be the main banner image at the top of the department page.
                    </p>

                    {formData.heroImage && (
                      <div className="mt-4">
                        <img
                          src={formData.heroImage}
                          alt="Hero preview"
                          className="w-full h-64 object-cover rounded-2xl border"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Gallery Images</h3>
                      <p className="text-sm text-slate-500">
                        Add department photos one by one.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addGalleryItem}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                    >
                      <FiPlus />
                      Add Image
                    </button>
                  </div>

                  {formData.gallery.length === 0 && (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500">
                      No gallery images added yet.
                    </div>
                  )}

                  <div className="space-y-4">
                    {formData.gallery.map((img, index) => (
                      <div
                        key={index}
                        className="bg-white border rounded-2xl p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-800">
                            Image #{index + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeArrayItem("gallery", index)}
                            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                          >
                            <FiTrash2 />
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Type
                            </label>
                            <select
                              value={img.type}
                              onChange={(e) =>
                                updateArrayItem("gallery", index, "type", e.target.value)
                              }
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {imageTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Title
                            </label>
                            <input
                              type="text"
                              value={img.title}
                              onChange={(e) =>
                                updateArrayItem("gallery", index, "title", e.target.value)
                              }
                              placeholder="Image title"
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Image URL
                            </label>
                            <input
                              type="url"
                              value={img.imageUrl}
                              onChange={(e) =>
                                updateArrayItem("gallery", index, "imageUrl", e.target.value)
                              }
                              placeholder="https://..."
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Description
                            </label>
                            <textarea
                              value={img.description}
                              onChange={(e) =>
                                updateArrayItem(
                                  "gallery",
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Short description"
                              rows={3}
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {img.imageUrl && (
                          <div className="mt-4">
                            <img
                              src={img.imageUrl}
                              alt={img.title || `Gallery ${index + 1}`}
                              className="w-full md:w-72 h-44 object-cover rounded-xl border"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "members" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Members</h3>
                      <p className="text-sm text-slate-500">
                        Add full member profiles using simple fields.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addMember}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                    >
                      <FiPlus />
                      Add Member
                    </button>
                  </div>

                  {formData.members.length === 0 && (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500">
                      No members added yet.
                    </div>
                  )}

                  <div className="space-y-5">
                    {formData.members.map((member, index) => (
                      <div
                        key={index}
                        className="bg-white border rounded-2xl p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-800">
                            Member #{index + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeArrayItem("members", index)}
                            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                          >
                            <FiTrash2 />
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Name
                            </label>
                            <input
                              type="text"
                              value={member.name || ""}
                              onChange={(e) =>
                                updateArrayItem("members", index, "name", e.target.value)
                              }
                              placeholder="Full name"
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Role
                            </label>
                            <input
                              type="text"
                              value={member.role || ""}
                              onChange={(e) =>
                                updateArrayItem("members", index, "role", e.target.value)
                              }
                              placeholder="Member role"
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Image URL
                            </label>
                            <input
                              type="url"
                              value={member.imageUrl || ""}
                              onChange={(e) =>
                                updateArrayItem("members", index, "imageUrl", e.target.value)
                              }
                              placeholder="https://..."
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Phone
                            </label>
                            <input
                              type="text"
                              value={member.phone || ""}
                              onChange={(e) =>
                                updateArrayItem("members", index, "phone", e.target.value)
                              }
                              placeholder="+250..."
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={member.email || ""}
                              onChange={(e) =>
                                updateArrayItem("members", index, "email", e.target.value)
                              }
                              placeholder="member@email.com"
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Bio
                            </label>
                            <textarea
                              value={member.bio || ""}
                              onChange={(e) =>
                                updateArrayItem("members", index, "bio", e.target.value)
                              }
                              placeholder="Short member bio"
                              rows={3}
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Instagram
                            </label>
                            <input
                              type="url"
                              value={member.socials?.instagram || ""}
                              onChange={(e) =>
                                updateNestedSocial(index, "instagram", e.target.value)
                              }
                              placeholder="https://instagram.com/..."
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Facebook
                            </label>
                            <input
                              type="url"
                              value={member.socials?.facebook || ""}
                              onChange={(e) =>
                                updateNestedSocial(index, "facebook", e.target.value)
                              }
                              placeholder="https://facebook.com/..."
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              LinkedIn
                            </label>
                            <input
                              type="url"
                              value={member.socials?.linkedin || ""}
                              onChange={(e) =>
                                updateNestedSocial(index, "linkedin", e.target.value)
                              }
                              placeholder="https://linkedin.com/..."
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              X / Twitter
                            </label>
                            <input
                              type="url"
                              value={member.socials?.x || ""}
                              onChange={(e) =>
                                updateNestedSocial(index, "x", e.target.value)
                              }
                              placeholder="https://x.com/..."
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              WhatsApp Link
                            </label>
                            <input
                              type="url"
                              value={member.socials?.whatsapp || ""}
                              onChange={(e) =>
                                updateNestedSocial(index, "whatsapp", e.target.value)
                              }
                              placeholder="https://wa.me/..."
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {member.imageUrl && (
                          <div className="mt-4">
                            <img
                              src={member.imageUrl}
                              alt={member.name || "Member preview"}
                              className="w-40 h-40 object-cover rounded-2xl border"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "committee" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Committee</h3>
                      <p className="text-sm text-slate-500">
                        Add committee leaders with their contacts and photos.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addCommittee}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                    >
                      <FiPlus />
                      Add Committee Member
                    </button>
                  </div>

                  {formData.committee.length === 0 && (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500">
                      No committee members added yet.
                    </div>
                  )}

                  <div className="space-y-5">
                    {formData.committee.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white border rounded-2xl p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-800">
                            Committee Member #{index + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeArrayItem("committee", index)}
                            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                          >
                            <FiTrash2 />
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Role
                            </label>
                            <input
                              type="text"
                              value={item.role || ""}
                              onChange={(e) =>
                                updateArrayItem("committee", index, "role", e.target.value)
                              }
                              placeholder="e.g. Secretary"
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Name
                            </label>
                            <input
                              type="text"
                              value={item.name || ""}
                              onChange={(e) =>
                                updateArrayItem("committee", index, "name", e.target.value)
                              }
                              placeholder="Full name"
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Image URL
                            </label>
                            <input
                              type="url"
                              value={item.imageUrl || ""}
                              onChange={(e) =>
                                updateArrayItem("committee", index, "imageUrl", e.target.value)
                              }
                              placeholder="https://..."
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Phone
                            </label>
                            <input
                              type="text"
                              value={item.phone || ""}
                              onChange={(e) =>
                                updateArrayItem("committee", index, "phone", e.target.value)
                              }
                              placeholder="+250..."
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={item.email || ""}
                              onChange={(e) =>
                                updateArrayItem("committee", index, "email", e.target.value)
                              }
                              placeholder="email@example.com"
                              className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {item.imageUrl && (
                          <div className="mt-4">
                            <img
                              src={item.imageUrl}
                              alt={item.name || "Committee preview"}
                              className="w-40 h-40 object-cover rounded-2xl border"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "plans" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-2xl p-4 border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Plans</h3>
                        <p className="text-sm text-slate-500">Add plans one by one.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addSimpleStringListItem("plans")}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                      >
                        <FiPlus />
                        Add Plan
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.plans.map((plan, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={plan}
                            onChange={(e) =>
                              updateSimpleStringList("plans", index, e.target.value)
                            }
                            placeholder={`Plan ${index + 1}`}
                            className="flex-1 border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeSimpleStringListItem("plans", index)}
                            className="px-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Actions</h3>
                        <p className="text-sm text-slate-500">Add actions one by one.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addSimpleStringListItem("actions")}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                      >
                        <FiPlus />
                        Add Action
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.actions.map((action, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={action}
                            onChange={(e) =>
                              updateSimpleStringList("actions", index, e.target.value)
                            }
                            placeholder={`Action ${index + 1}`}
                            className="flex-1 border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeSimpleStringListItem("actions", index)}
                            className="px-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60"
                >
                  <FiSave />
                  {saving
                    ? editingId
                      ? "Updating..."
                      : "Saving..."
                    : editingId
                    ? "Update Department"
                    : "Create Department"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 bg-slate-200 text-slate-800 px-6 py-3 rounded-xl hover:bg-slate-300"
                >
                  <FiRefreshCw />
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Existing Departments</h2>
            <p className="text-slate-500 text-sm">
              Manage, edit, or delete departments below.
            </p>
          </div>

          {loading && <p className="text-sm text-slate-500">Loading...</p>}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-3xl shadow overflow-hidden border border-slate-200"
            >
              {dept.heroImage ? (
                <img
                  src={dept.heroImage}
                  alt={dept.name}
                  className="w-full h-52 object-cover"
                />
              ) : (
                <div className="w-full h-52 bg-gradient-to-r from-blue-600 to-indigo-700" />
              )}

              <div className="p-5">
                <h3 className="text-2xl font-bold mb-2 text-blue-700">{dept.name}</h3>

                <div className="space-y-1 text-sm text-slate-600 mb-3">
                  <p className="flex items-center gap-2">
                    <FiUser />
                    <span>President: {dept.president}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FiStar />
                    <span>Established: {dept.est || "—"}</span>
                  </p>
                  {dept.phone && (
                    <p className="flex items-center gap-2">
                      <FiPhone />
                      <span>{dept.phone}</span>
                    </p>
                  )}
                  {dept.email && (
                    <p className="flex items-center gap-2 break-all">
                      <FiMail />
                      <span>{dept.email}</span>
                    </p>
                  )}
                </div>

                <p className="text-slate-700 mb-4 line-clamp-3 min-h-[72px]">
                  {dept.description || "No description provided."}
                </p>

                <div className="grid grid-cols-3 gap-3 text-center mb-5">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-lg font-bold text-slate-800">
                      {dept.members?.length || 0}
                    </p>
                    <p className="text-xs text-slate-500">Members</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-lg font-bold text-slate-800">
                      {dept.committee?.length || 0}
                    </p>
                    <p className="text-xs text-slate-500">Committee</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-lg font-bold text-slate-800">
                      {dept.gallery?.length || 0}
                    </p>
                    <p className="text-xs text-slate-500">Images</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="flex-1 inline-flex justify-center items-center gap-2 bg-yellow-500 text-white px-4 py-2.5 rounded-xl hover:bg-yellow-600"
                  >
                    <FiEdit3 />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id)}
                    className="flex-1 inline-flex justify-center items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600"
                  >
                    <FiTrash2 />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && departments.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500 mt-8">
            No departments found.
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminDepartments;