import React, { useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EnhancedHeader from "../components/header.jsx";
import Footer from "../components/footer.jsx";
import BaptismNav from "../components/BaptismNav.jsx";
import { AuthContext } from "../context/authContext.jsx";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  BookOpen,
  Users,
  BarChart2,
  Mail,
  Bell,
  MessageSquare,
  CheckCircle,
  Loader2,
  Eye,
  BookMarked,
  Megaphone,
  DropletIcon,
  ChevronDown,
  ChevronUp,
  Send,
  Shield,
  Calendar,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API = `${API_BASE_URL}/api/baptism`;

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-RW", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "TBD";

function InputC({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${className}`}
      {...props}
    />
  );
}
function TextAreaC({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none ${className}`}
      {...props}
    />
  );
}
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const EMPTY_CLASS = {
  title: "",
  description: "",
  preaching: "",
  category: "adult",
  language: "English",
  isActive: true,
  isFeatured: false,
  maxStudents: 20,
  allowPublicRegistration: true,
  schedule: {
    startDate: "",
    endDate: "",
    days: [],
    time: "",
    location: "",
    meetingLink: "",
    recurrence: "weekly",
  },
  instructor: { name: "", bio: "" },
  requirements: [],
  tags: [],
};

export default function AdminBaptismPage() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const authH = useMemo(
    () =>
      token
        ? { Authorization: `Bearer ${token}`, token, "x-access-token": token }
        : {},
    [token],
  );

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("classes");

  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form, setForm] = useState(EMPTY_CLASS);
  const [saving, setSaving] = useState(false);

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [expandedMsg, setExpandedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [annClass, setAnnClass] = useState("");
  const [annForm, setAnnForm] = useState({
    title: "",
    body: "",
    urgent: false,
  });
  const [annLoading, setAnnLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/baptism");
      return;
    }
    fetchClasses();
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === "messages") fetchMessages();
  }, [activeTab]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, { headers: authH });
      const list = res.data?.classes || res.data || [];
      setClasses(list);
      if (list.length && !annClass) setAnnClass(list[0]._id);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const res = await axios.get(`${API}/admin/messages`, { headers: authH });
      setMessages(res.data || []);
    } catch {
    } finally {
      setMessagesLoading(false);
    }
  };

  const openCreate = () => {
    setEditingClass(null);
    setForm(EMPTY_CLASS);
    setShowForm(true);
  };

  const openEdit = (cls) => {
    setEditingClass(cls);
    setForm({
      title: cls.title || "",
      description: cls.description || "",
      preaching: cls.preaching || "",
      category: cls.category || "adult",
      language: cls.language || "English",
      isActive: cls.isActive !== false,
      isFeatured: !!cls.isFeatured,
      maxStudents: cls.maxStudents || 20,
      allowPublicRegistration: cls.allowPublicRegistration !== false,
      schedule: {
        startDate: cls.schedule?.startDate
          ? String(cls.schedule.startDate).slice(0, 10)
          : "",
        endDate: cls.schedule?.endDate
          ? String(cls.schedule.endDate).slice(0, 10)
          : "",
        days: cls.schedule?.days || [],
        time: cls.schedule?.time || "",
        location: cls.schedule?.location || "",
        meetingLink: cls.schedule?.meetingLink || "",
        recurrence: cls.schedule?.recurrence || "weekly",
      },
      instructor: {
        name: cls.instructor?.name || "",
        bio: cls.instructor?.bio || "",
      },
      requirements: cls.requirements || [],
      tags: cls.tags || [],
    });
    setShowForm(true);
  };

  const saveClass = async () => {
    if (!form.title.trim()) return alert("Title required");
    setSaving(true);
    try {
      const payload = {
        ...form,
        schedule: {
          ...form.schedule,
          startDate: form.schedule.startDate || undefined,
          endDate: form.schedule.endDate || undefined,
        },
      };
      if (editingClass) {
        await axios.put(`${API}/${editingClass._id}`, payload, {
          headers: authH,
        });
      } else {
        await axios.post(API, payload, { headers: authH });
      }
      await fetchClasses();
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteClass = async (id) => {
    if (!window.confirm("Delete this class? This cannot be undone.")) return;
    await axios.delete(`${API}/${id}`, { headers: authH });
    fetchClasses();
  };

  const sendReply = async (msg) => {
    if (!replyText.trim()) return;
    await axios.put(
      `${API}/${msg.classId}/messages/${msg._id}/reply`,
      { reply: replyText },
      { headers: authH },
    );
    setReplyText("");
    setExpandedMsg(null);
    fetchMessages();
  };

  const markRead = async (msg) => {
    await axios.put(
      `${API}/${msg.classId}/messages/${msg._id}/reply`,
      { reply: "" },
      { headers: authH },
    );
    fetchMessages();
  };

  const submitAnn = async () => {
    if (!annForm.title.trim() || !annClass)
      return alert("Title and class required");
    setAnnLoading(true);
    try {
      await axios.post(`${API}/${annClass}/announcements`, annForm, {
        headers: authH,
      });
      setAnnForm({ title: "", body: "", urgent: false });
      alert("Announcement posted ✅");
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setAnnLoading(false);
    }
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const toggleDay = (d) => {
    const curr = form.schedule.days || [];
    setForm({
      ...form,
      schedule: {
        ...form.schedule,
        days: curr.includes(d) ? curr.filter((x) => x !== d) : [...curr, d],
      },
    });
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-slate-50 min-h-screen">
      <EnhancedHeader />
      <BaptismNav isAdmin={true} />

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white mt-4">
        <div className="max-w-7xl mx-auto px-4 py-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-2">
              <Shield size={14} /> Admin Panel
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              Baptism Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage classes, students, content, and community
            </p>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <div className="text-xl font-bold">{classes.length}</div>
              <div className="text-xs text-slate-400">Classes</div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <div className="text-xl font-bold">
                {classes.reduce((a, c) => a + (c.students?.length || 0), 0)}
              </div>
              <div className="text-xs text-slate-400">Students</div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <div className="text-xl font-bold">
                {messages.filter((m) => !m.read).length || "–"}
              </div>
              <div className="text-xs text-slate-400">Unread msgs</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "classes", label: "Classes", icon: <BookOpen size={15} /> },
            {
              id: "messages",
              label: "Messages",
              icon: <MessageSquare size={15} />,
            },
            {
              id: "announcements",
              label: "Announcements",
              icon: <Megaphone size={15} />,
            },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === t.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ── CLASSES TAB ── */}
        {activeTab === "classes" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-800">All Classes</h2>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
              >
                <Plus size={15} /> New Class
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-indigo-500" size={28} />
              </div>
            ) : (
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div
                    key={cls._id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 truncate">
                          {cls.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                        >
                          {cls.isActive ? "Active" : "Completed"}
                        </span>
                        {cls.isFeatured && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1 mb-2">
                        {cls.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {cls.students?.length || 0}/{cls.maxStudents || 20}{" "}
                          students
                        </span>
                        <span className="flex items-center gap-1">
                          <BookMarked size={12} />
                          {cls.members?.length || 0} members
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {fmt(cls.schedule?.startDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => navigate(`/baptism?class=${cls._id}`)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEdit(cls)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteClass(cls._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES TAB ── */}
        {activeTab === "messages" && (
          <div>
            <h2 className="font-bold text-slate-800 mb-5">
              Messages from Members
            </h2>
            {messagesLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-indigo-500" size={28} />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                No messages yet.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div
                    key={m._id}
                    className={`bg-white rounded-2xl border p-5 ${m.read ? "border-slate-200" : "border-indigo-200 shadow-sm"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!m.read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          )}
                          <span className="font-semibold text-sm text-slate-800">
                            {m.fromName}
                          </span>
                          <span className="text-xs text-slate-400">
                            · {fmt(m.createdAt)} · {m.classTitle}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{m.text}</p>
                        {m.reply && (
                          <div className="mt-2 pl-3 border-l-2 border-emerald-300 text-xs text-emerald-700">
                            <strong>Your reply:</strong> {m.reply}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!m.read && (
                          <button
                            onClick={() => markRead(m)}
                            title="Mark read"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setExpandedMsg(expandedMsg === m._id ? null : m._id)
                          }
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          {expandedMsg === m._id ? (
                            <ChevronUp size={15} />
                          ) : (
                            <ChevronDown size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedMsg === m._id && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply…"
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <button
                          onClick={() => sendReply(m)}
                          disabled={!replyText.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-1.5"
                        >
                          <Send size={14} /> Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ANNOUNCEMENTS TAB ── */}
        {activeTab === "announcements" && (
          <div className="max-w-lg">
            <h2 className="font-bold text-slate-800 mb-5">Post Announcement</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <Field label="Target Class" required>
                <select
                  value={annClass}
                  onChange={(e) => setAnnClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Title" required>
                <InputC
                  value={annForm.title}
                  onChange={(e) =>
                    setAnnForm({ ...annForm, title: e.target.value })
                  }
                />
              </Field>
              <Field label="Message">
                <TextAreaC
                  rows={4}
                  value={annForm.body}
                  onChange={(e) =>
                    setAnnForm({ ...annForm, body: e.target.value })
                  }
                />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={annForm.urgent}
                  onChange={(e) =>
                    setAnnForm({ ...annForm, urgent: e.target.checked })
                  }
                  className="w-4 h-4 rounded accent-rose-500"
                />
                <span className="text-sm text-slate-700 font-medium">
                  Mark as urgent
                </span>
              </label>
              <button
                onClick={submitAnn}
                disabled={annLoading || !annForm.title.trim()}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {annLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Megaphone size={16} />
                )}
                Post Announcement
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Class Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-slate-800">
                  {editingClass ? "Edit Class" : "Create New Class"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <Field label="Title" required>
                  <InputC
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </Field>
                <Field label="Description">
                  <TextAreaC
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </Field>
                <Field label="Pastor's Word / Preaching">
                  <TextAreaC
                    rows={3}
                    value={form.preaching}
                    onChange={(e) =>
                      setForm({ ...form, preaching: e.target.value })
                    }
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category">
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {["adult", "youth", "teen", "children", "special"].map(
                        (c) => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ),
                      )}
                    </select>
                  </Field>
                  <Field label="Language">
                    <InputC
                      value={form.language}
                      onChange={(e) =>
                        setForm({ ...form, language: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Max Students">
                    <InputC
                      type="number"
                      min={1}
                      value={form.maxStudents}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          maxStudents: parseInt(e.target.value) || 20,
                        })
                      }
                    />
                  </Field>
                  <Field label="Instructor Name">
                    <InputC
                      value={form.instructor.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          instructor: {
                            ...form.instructor,
                            name: e.target.value,
                          },
                        })
                      }
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Start Date">
                    <InputC
                      type="date"
                      value={form.schedule.startDate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          schedule: {
                            ...form.schedule,
                            startDate: e.target.value,
                          },
                        })
                      }
                    />
                  </Field>
                  <Field label="End Date">
                    <InputC
                      type="date"
                      value={form.schedule.endDate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          schedule: {
                            ...form.schedule,
                            endDate: e.target.value,
                          },
                        })
                      }
                    />
                  </Field>
                  <Field label="Time">
                    <InputC
                      value={form.schedule.time}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          schedule: { ...form.schedule, time: e.target.value },
                        })
                      }
                      placeholder="e.g. 10:00 AM – 12:00 PM"
                    />
                  </Field>
                  <Field label="Location">
                    <InputC
                      value={form.schedule.location}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          schedule: {
                            ...form.schedule,
                            location: e.target.value,
                          },
                        })
                      }
                    />
                  </Field>
                </div>
                <Field label="Days">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {days.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(d)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                          (form.schedule.days || []).includes(d)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </Field>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm({ ...form, isActive: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-indigo-600"
                    />
                    <span className="text-sm text-slate-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) =>
                        setForm({ ...form, isFeatured: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                    <span className="text-sm text-slate-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allowPublicRegistration}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          allowPublicRegistration: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded accent-emerald-600"
                    />
                    <span className="text-sm text-slate-700">
                      Public Registration
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={saveClass}
                  disabled={saving || !form.title.trim()}
                  className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : null}
                  {editingClass ? "Save Changes" : "Create Class"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
