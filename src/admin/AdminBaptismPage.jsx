import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import EnhancedHeader from "../components/header";
import Footer from "../components/footer";
import { AuthContext } from "../context/authContext.jsx";
import { Plus, Trash2, Edit, X, Save, FileText, Pin, MessageCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/baptism`;

export default function AdminBaptismPage() {
  const { user, token } = useContext(AuthContext);

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      token: token,
      "x-access-token": token,
    };
  }, [token]);

  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    preaching: "",
    documentation: "",
    isActive: true,
    maxStudents: 20,
    schedule: { startDate: "", endDate: "", days: [], time: "", location: "" },
    requirements: [],
    curriculum: [],
  });

  // Posts
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({ type: "teaching", title: "", body: "", pinned: false, attachments: [] });

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINT);
      setClasses(res.data || []);
      setSelected((res.data || [])[0] || null);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingClass(null);
    setForm({
      title: "",
      description: "",
      preaching: "",
      documentation: "",
      isActive: true,
      maxStudents: 20,
      schedule: { startDate: "", endDate: "", days: [], time: "", location: "" },
      requirements: [],
      curriculum: [],
    });
    setShowClassModal(true);
  };

  const openEdit = (cls) => {
    setEditingClass(cls);
    setForm({
      title: cls.title || "",
      description: cls.description || "",
      preaching: cls.preaching || "",
      documentation: cls.documentation || "",
      isActive: !!cls.isActive,
      maxStudents: cls.maxStudents || 20,
      schedule: {
        startDate: cls.schedule?.startDate ? String(cls.schedule.startDate).slice(0, 10) : "",
        endDate: cls.schedule?.endDate ? String(cls.schedule.endDate).slice(0, 10) : "",
        days: cls.schedule?.days || [],
        time: cls.schedule?.time || "",
        location: cls.schedule?.location || "",
      },
      requirements: cls.requirements || [],
      curriculum: cls.curriculum || [],
    });
    setShowClassModal(true);
  };

  const saveClass = async () => {
    if (!token) return alert("Login required");
    if (user?.role !== "admin") return alert("Admin only");
    if (!form.title.trim() || !form.preaching.trim()) return alert("Title and preaching are required");

    const payload = {
      ...form,
      schedule: {
        ...form.schedule,
        startDate: form.schedule.startDate ? new Date(form.schedule.startDate) : null,
        endDate: form.schedule.endDate ? new Date(form.schedule.endDate) : null,
      },
    };

    try {
      if (editingClass?._id) {
        const res = await axios.put(`${API_ENDPOINT}/${editingClass._id}`, payload, { headers: authHeaders });
        await fetchAll();
        setSelected(res.data);
      } else {
        const res = await axios.post(`${API_ENDPOINT}`, payload, { headers: authHeaders });
        await fetchAll();
        setSelected(res.data);
      }
      setShowClassModal(false);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || e.response?.data?.message || "Save failed");
    }
  };

  const deleteClass = async (cls) => {
    if (!token) return alert("Login required");
    if (user?.role !== "admin") return alert("Admin only");
    if (!window.confirm(`Delete "${cls.title}"?`)) return;

    try {
      await axios.delete(`${API_ENDPOINT}/${cls._id}`, { headers: authHeaders });
      await fetchAll();
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  const openPost = () => {
    if (!selected) return;
    setPostForm({ type: "teaching", title: "", body: "", pinned: false, attachments: [] });
    setShowPostModal(true);
  };

  const createPost = async () => {
    if (!selected) return;
    if (!token) return alert("Login required");
    if (user?.role !== "admin") return alert("Admin only");
    if (!postForm.title.trim()) return alert("Post title is required");

    try {
      await axios.post(`${API_ENDPOINT}/${selected._id}/posts`, postForm, { headers: authHeaders });
      const fresh = await axios.get(`${API_ENDPOINT}/${selected._id}`);
      setSelected(fresh.data);
      setShowPostModal(false);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Post failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <EnhancedHeader />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin • Baptism Classes</h1>

          <div className="flex gap-2">
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={18} />
              New Class
            </button>

            {selected && (
              <button
                onClick={openPost}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black flex items-center gap-2"
              >
                <FileText size={18} />
                Add Content
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
          {/* Classes list */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="font-bold text-gray-800 mb-4">All Classes</h2>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {classes.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selected?._id === c._id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-gray-900">{c.title}</div>
                      <div className="text-sm text-gray-600 line-clamp-2 mt-1">{c.description}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Active: {c.isActive ? "Yes" : "No"} • Students: {c.students?.length || 0} • Members: {c.members?.length || 0}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {c.isActive ? "ACTIVE" : "DONE"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected class details */}
          <div className="bg-white rounded-2xl shadow p-6">
            {!selected ? (
              <div className="text-gray-600">Select a class to manage.</div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selected.title}</h2>
                    <p className="text-gray-600 mt-1">{selected.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(selected)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => deleteClass(selected)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <StatCard title="Students" value={selected.students?.length || 0} />
                  <StatCard title="Joined Members" value={selected.members?.length || 0} />
                  <StatCard title="Posts" value={selected.posts?.length || 0} />
                </div>

                {/* Posts */}
                <div className="mt-6">
                  <h3 className="font-bold text-gray-800 mb-3">Uploaded Content</h3>
                  {(selected.posts || []).length === 0 ? (
                    <div className="text-gray-500">No posts yet.</div>
                  ) : (
                    <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                      {selected.posts.map((p) => (
                        <div key={p._id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {p.pinned && <Pin size={16} className="text-yellow-600" />}
                              <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                {String(p.type).toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500">{p.createdByName}</span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                            </span>
                          </div>
                          <div className="font-semibold text-gray-900 mt-2">{p.title}</div>
                          {p.body && <div className="text-sm text-gray-700 mt-1 line-clamp-2">{p.body}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Messages to holder */}
                <div className="mt-6">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <MessageCircle size={18} className="text-blue-600" />
                    Messages to Holder
                  </h3>
                  {(selected.messagesToHolder || []).length === 0 ? (
                    <div className="text-gray-500">No messages yet.</div>
                  ) : (
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {selected.messagesToHolder.slice().reverse().map((m) => (
                        <div key={m._id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <div className="text-sm font-semibold text-gray-900">{m.fromName}</div>
                          <div className="text-sm text-gray-700 mt-1">{m.text}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingClass ? "Edit Class" : "Create Class"}</h2>
              <button onClick={() => setShowClassModal(false)} className="text-gray-500 hover:text-gray-800">
                <X />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <Input label="Title *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
              <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
              <Textarea label="Preaching *" value={form.preaching} onChange={(v) => setForm({ ...form, preaching: v })} />
              <Textarea label="Documentation" value={form.documentation} onChange={(v) => setForm({ ...form, documentation: v })} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={form.schedule.startDate}
                  onChange={(v) => setForm({ ...form, schedule: { ...form.schedule, startDate: v } })}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={form.schedule.endDate}
                  onChange={(v) => setForm({ ...form, schedule: { ...form.schedule, endDate: v } })}
                />
                <Input
                  label="Time"
                  value={form.schedule.time}
                  onChange={(v) => setForm({ ...form, schedule: { ...form.schedule, time: v } })}
                />
                <Input
                  label="Location"
                  value={form.schedule.location}
                  onChange={(v) => setForm({ ...form, schedule: { ...form.schedule, location: v } })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Max Students"
                  type="number"
                  value={form.maxStudents}
                  onChange={(v) => setForm({ ...form, maxStudents: Number(v || 0) })}
                />

                <div className="flex items-center gap-2 mt-7">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Active class</span>
                </div>
              </div>

              <TagEditor
                label="Days (type and press Enter)"
                values={form.schedule.days}
                onChange={(vals) => setForm({ ...form, schedule: { ...form.schedule, days: vals } })}
                placeholder="e.g. Wednesday"
              />

              <TagEditor
                label="Requirements (type and press Enter)"
                values={form.requirements}
                onChange={(vals) => setForm({ ...form, requirements: vals })}
                placeholder="e.g. Attend 6/8 weeks"
              />

              <div className="pt-3 flex justify-end gap-2">
                <button
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveClass}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={16} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Content</h2>
              <button onClick={() => setShowPostModal(false)} className="text-gray-500 hover:text-gray-800">
                <X />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={postForm.type}
                  onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  <option value="teaching">Teaching</option>
                  <option value="verse">Verse</option>
                  <option value="resource">Resource</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              <Input label="Title *" value={postForm.title} onChange={(v) => setPostForm({ ...postForm, title: v })} />
              <Textarea label="Body" value={postForm.body} onChange={(v) => setPostForm({ ...postForm, body: v })} />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={postForm.pinned}
                  onChange={(e) => setPostForm({ ...postForm, pinned: e.target.checked })}
                />
                <span className="text-sm text-gray-700">Pin this post</span>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button onClick={() => setShowPostModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={createPost} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black">
                  Publish
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Attachments are URLs in your current schema. If you want file upload later, we can add multer.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}

function TagEditor({ label, values, onChange, placeholder }) {
  const [input, setInput] = useState("");

  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (values.includes(v)) return setInput("");
    onChange([...values, v]);
    setInput("");
  };

  const remove = (v) => onChange(values.filter((x) => x !== v));

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2 mt-1">
        <input
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button onClick={add} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border">
            <span className="text-sm">{v}</span>
            <button onClick={() => remove(v)} className="text-gray-500 hover:text-red-600">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}