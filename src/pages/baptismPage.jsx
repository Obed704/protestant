import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import EnhancedHeader from "../components/header.jsx";
import Footer from "../components/footer.jsx";
import BaptismNav from "../components/BaptismNav.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import {
  Calendar,
  Users,
  BookOpen,
  CheckCircle,
  Download,
  BarChart2,
  X,
  Edit2,
  MessageCircle,
  Send,
  Shield,
  FileText,
  BookMarked,
  Pin,
  Megaphone,
  Flame,
  ChevronRight,
  Heart,
  Eye,
  Bell,
  DropletIcon,
  User,
  Phone,
  Mail,
  MapPin,
  Hash,
  Plus,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Award,
  Target,
  Activity,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API = `${API_BASE_URL}/api/baptism`;

// ─── Tiny helpers ────────────────────────────────────────────────────────────

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-RW", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "TBD";

const STATUS_META = {
  pending: { label: "Pending", color: "bg-slate-100 text-slate-600" },
  in_preparation: { label: "In Prep", color: "bg-blue-100 text-blue-700" },
  ready: { label: "Ready ✓", color: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Completed", color: "bg-purple-100 text-purple-700" },
  dropped: { label: "Dropped", color: "bg-red-100 text-red-600" },
};

const POST_TYPE_META = {
  teaching: { label: "Teaching", color: "bg-indigo-100 text-indigo-700" },
  verse: { label: "Verse", color: "bg-amber-100 text-amber-700" },
  announcement: { label: "Notice", color: "bg-rose-100 text-rose-700" },
  resource: { label: "Resource", color: "bg-teal-100 text-teal-700" },
  testimony: { label: "Testimony", color: "bg-violet-100 text-violet-700" },
};

const CATEGORY_META = {
  adult: { label: "Adults", icon: "👨‍👩‍👧‍👦" },
  youth: { label: "Youth", icon: "🧑‍🎓" },
  teen: { label: "Teens", icon: "🙋" },
  children: { label: "Children", icon: "👧" },
  special: { label: "Special", icon: "⭐" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Spinner() {
  return <Loader2 className="animate-spin" size={20} />;
}

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function InputClass({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm
        focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed transition ${className}`}
      {...props}
    />
  );
}

function TextAreaClass({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm
        focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
        disabled:opacity-50 transition resize-none ${className}`}
      {...props}
    />
  );
}

function StatCard({ icon, label, value, sub, color = "indigo" }) {
  const colors = {
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
    violet: "from-violet-500 to-violet-600",
    sky: "from-sky-500 to-sky-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${colors[color]} text-white mb-3`}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-sm font-medium text-slate-600 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, icon, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
        <span className="text-indigo-600">{icon}</span>
        {title}
      </h2>
      {action}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const BaptismPage = () => {
  const { user, token, authLoading } = useContext(AuthContext);
  const myId = user?._id || user?.id;
  const isAdmin = user?.role === "admin";

  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [chat, setChat] = useState([]);
  const [chatText, setChatText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [dmText, setDmText] = useState("");
  const [dmLoading, setDmLoading] = useState(false);

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    gender: "",
    emergencyContact: "",
  });

  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({
    type: "teaching",
    title: "",
    body: "",
    pinned: false,
  });
  const [postLoading, setPostLoading] = useState(false);

  const [joinLoading, setJoinLoading] = useState(false);

  const authH = useMemo(
    () =>
      token
        ? { Authorization: `Bearer ${token}`, token, "x-access-token": token }
        : {},
    [token],
  );

  const isMember = useMemo(() => {
    if (!selected || !myId) return false;
    return (selected.members || []).some(
      (m) => String(m.userId) === String(myId),
    );
  }, [selected, myId]);

  const tabs = [
    { id: "overview", label: "Overview", icon: <BookOpen size={15} /> },
    { id: "curriculum", label: "Curriculum", icon: <Hash size={15} /> },
    { id: "content", label: "Teachings", icon: <BookMarked size={15} /> },
    { id: "community", label: "Community", icon: <Users size={15} /> },
    { id: "students", label: "Students", icon: <User size={15} /> },
    { id: "statistics", label: "Statistics", icon: <BarChart2 size={15} /> },
  ];

  // ── Data fetchers ────────────────────────────────────────────────────────

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}?active=true`);
      const list = res.data?.classes || res.data || [];
      setClasses(list);
      if (list.length && !selected) setSelected(list[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSelected = useCallback(
    async (id = selected?._id) => {
      if (!id) return;
      const res = await axios.get(`${API}/${id}`);
      setSelected(res.data);
      setComments(res.data.comments || []);
    },
    [selected?._id],
  );

  const fetchStats = useCallback(async () => {
    if (!selected?._id) return;
    const res = await axios.get(`${API}/${selected._id}/statistics`);
    setStats(res.data);
  }, [selected?._id]);

  const fetchPosts = useCallback(async () => {
    if (!selected?._id) return;
    setPostsLoading(true);
    const res = await axios.get(`${API}/${selected._id}/posts`);
    setPosts(res.data || []);
    setPostsLoading(false);
  }, [selected?._id]);

  const fetchChat = useCallback(async () => {
    if (!selected?._id || authLoading || !token) {
      setChat([]);
      return;
    }
    setChatLoading(true);
    try {
      const res = await axios.get(`${API}/${selected._id}/chat`, {
        headers: authH,
      });
      setChat(res.data || []);
    } catch {
      setChat([]);
    } finally {
      setChatLoading(false);
    }
  }, [selected?._id, authLoading, token, authH]);

  useEffect(() => {
    fetchClasses();
  }, []);
  useEffect(() => {
    if (selected?._id) {
      fetchStats();
      fetchPosts();
      fetchChat();
      setComments(selected.comments || []);
    }
  }, [selected?._id]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleJoin = async () => {
    if (!token) return alert("Please login to join");
    setJoinLoading(true);
    try {
      await axios.post(`${API}/${selected._id}/join`, {}, { headers: authH });
      await refreshSelected();
    } catch (err) {
      alert(err.response?.data?.message || "Join failed");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Leave this class?")) return;
    try {
      await axios.delete(`${API}/${selected._id}/leave`, { headers: authH });
      await refreshSelected();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave");
    }
  };

  const handleRegister = async () => {
    if (!studentForm.name.trim()) return alert("Name is required");
    if (!studentForm.email.trim() && !studentForm.phone.trim())
      return alert("Provide email or phone to prevent duplicates");
    try {
      await axios.post(`${API}/${selected._id}/students`, studentForm);
      await refreshSelected();
      await fetchStats();
      setShowStudentForm(false);
      setStudentForm({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        address: "",
        gender: "",
        emergencyContact: "",
      });
      alert("Registered successfully ✅");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleUpdateStudent = async (studentId, updates) => {
    try {
      await axios.put(`${API}/${selected._id}/students/${studentId}`, updates, {
        headers: authH,
      });
      await refreshSelected();
      await fetchStats();
      setEditingStudent(null);
      setShowStudentForm(false);
    } catch {
      alert("Update failed (admin only)");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Remove this student?")) return;
    try {
      await axios.delete(`${API}/${selected._id}/students/${studentId}`, {
        headers: authH,
      });
      await refreshSelected();
      await fetchStats();
    } catch {
      alert("Delete failed (admin only)");
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get(`${API}/${selected._id}/export`, {
        headers: authH,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `baptism-${selected.title.replace(/\s+/g, "-")}.csv`;
      a.click();
      a.remove();
    } catch {
      alert("Export failed (admin only)");
    }
  };

  const submitComment = async () => {
    if (!token) return alert("Login to comment");
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await axios.post(
        `${API}/${selected._id}/comments`,
        { text: commentText },
        { headers: authH },
      );
      setComments(res.data || []);
      setCommentText("");
    } catch (err) {
      alert(err.response?.data?.message || "Comment failed");
    } finally {
      setCommentLoading(false);
    }
  };

  const sendChat = async () => {
    if (!token) return alert("Login to chat");
    if (!chatText.trim()) return;
    try {
      const res = await axios.post(
        `${API}/${selected._id}/chat`,
        { text: chatText },
        { headers: authH },
      );
      setChat(res.data || []);
      setChatText("");
    } catch (err) {
      alert(err.response?.data?.message || "Chat failed");
    }
  };

  const sendDM = async () => {
    if (!token) return alert("Login to message");
    if (!dmText.trim()) return;
    setDmLoading(true);
    try {
      await axios.post(
        `${API}/${selected._id}/message-to-holder`,
        { text: dmText },
        { headers: authH },
      );
      setDmText("");
      alert("Message sent to admin ✅");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send");
    } finally {
      setDmLoading(false);
    }
  };

  const submitPost = async () => {
    if (!postForm.title.trim()) return alert("Title required");
    setPostLoading(true);
    try {
      await axios.post(`${API}/${selected._id}/posts`, postForm, {
        headers: authH,
      });
      await fetchPosts();
      setShowPostForm(false);
      setPostForm({ type: "teaching", title: "", body: "", pinned: false });
    } catch (err) {
      alert(err.response?.data?.message || "Post failed");
    } finally {
      setPostLoading(false);
    }
  };

  const likePost = async (postId) => {
    if (!token) return alert("Login to like");
    try {
      await axios.post(
        `${API}/${selected._id}/posts/${postId}/like`,
        {},
        { headers: authH },
      );
      fetchPosts();
    } catch {}
  };

  const startEditStudent = (s) => {
    setEditingStudent(s);
    setStudentForm({
      name: s.name,
      email: s.email || "",
      phone: s.phone || "",
      dateOfBirth: s.dateOfBirth ? String(s.dateOfBirth).slice(0, 10) : "",
      address: s.address || "",
      gender: s.gender || "",
      emergencyContact: s.emergencyContact || "",
    });
    setShowStudentForm(true);
  };

  // ── Loading state ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Loading classes…</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <EnhancedHeader />
      <BaptismNav isAdmin={isAdmin} />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white mt-4">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-18">
          <div className="flex items-center gap-2 text-indigo-300 text-sm font-medium mb-4">
            <DropletIcon size={16} />
            <span>Baptism Preparation Ministry</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Walk the Path to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
              Baptism
            </span>
          </h1>
          <p className="text-indigo-200 text-base md:text-lg max-w-2xl leading-relaxed">
            Scripture. Community. Mentorship. A journey prepared to bring every
            candidate to their moment of public declaration.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <Users size={15} className="text-indigo-300" />
              <span>
                {classes.reduce((a, c) => a + (c.students?.length || 0), 0)}{" "}
                registered students
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <BookOpen size={15} className="text-indigo-300" />
              <span>{classes.length} active classes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* ── Class Grid ── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              Available Classes
            </h2>
            <div className="flex gap-2">
              {selected && isAdmin && (
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
                >
                  <Download size={15} /> Export CSV
                </button>
              )}
              {selected && (
                <button
                  onClick={() => {
                    setEditingStudent(null);
                    setStudentForm({
                      name: "",
                      email: "",
                      phone: "",
                      dateOfBirth: "",
                      address: "",
                      gender: "",
                      emergencyContact: "",
                    });
                    setShowStudentForm(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                >
                  <Plus size={15} /> Register
                </button>
              )}
              {selected && !isMember && (
                <button
                  onClick={handleJoin}
                  disabled={joinLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition disabled:opacity-60"
                >
                  {joinLoading ? <Spinner /> : <Shield size={15} />}
                  Join Class
                </button>
              )}
              {selected && isMember && (
                <button
                  onClick={handleLeave}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition"
                >
                  <CheckCircle size={15} /> Joined
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const isSelected = selected?._id === cls._id;
              const spotsLeft =
                (cls.maxStudents || 20) - (cls.students?.length || 0);
              const pct = Math.round(
                ((cls.students?.length || 0) / (cls.maxStudents || 20)) * 100,
              );
              return (
                <div
                  key={cls._id}
                  onClick={() => setSelected(cls)}
                  className={`group relative bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 hover:shadow-lg
                    ${isSelected ? "border-indigo-500 shadow-lg shadow-indigo-100" : "border-transparent shadow-sm hover:border-indigo-200"}`}
                >
                  {cls.isFeatured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-amber-100 text-amber-700">
                        <Flame size={11} className="mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">
                      {CATEGORY_META[cls.category]?.icon || "📖"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-base leading-tight truncate pr-8">
                        {cls.title}
                      </h3>
                      <Badge
                        className={
                          cls.isActive
                            ? "bg-emerald-100 text-emerald-700 mt-1"
                            : "bg-slate-100 text-slate-500 mt-1"
                        }
                      >
                        {cls.isActive ? "Active" : "Completed"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {cls.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-slate-500 gap-1.5">
                      <Calendar size={12} />
                      {fmt(cls.schedule?.startDate)} →{" "}
                      {fmt(cls.schedule?.endDate)}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 gap-1.5">
                      <MapPin size={12} />
                      {cls.schedule?.location || "TBD"}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span>
                        {cls.students?.length || 0} / {cls.maxStudents || 20}{" "}
                        students
                      </span>
                      <span
                        className={
                          spotsLeft <= 3 ? "text-rose-600 font-semibold" : ""
                        }
                      >
                        {spotsLeft} spots left
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct > 80 ? "bg-rose-400" : pct > 50 ? "bg-amber-400" : "bg-emerald-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-indigo-500 pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Tabs + Content ── */}
        {selected && (
          <>
            <div className="mb-1">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1 flex flex-wrap gap-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === t.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
              {/* ── OVERVIEW ── */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className="bg-indigo-100 text-indigo-700">
                          {CATEGORY_META[selected.category]?.icon}{" "}
                          {CATEGORY_META[selected.category]?.label}
                        </Badge>
                        <Badge className="bg-slate-100 text-slate-600">
                          {selected.language}
                        </Badge>
                        {selected.isFeatured && (
                          <Badge className="bg-amber-100 text-amber-700">
                            <Flame size={11} className="mr-1" /> Featured
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                        {selected.title}
                      </h2>
                      <p className="text-slate-500 mt-2 max-w-2xl">
                        {selected.description}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <button
                        onClick={() => setActiveTab("content")}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition"
                      >
                        <FileText size={15} /> Teachings
                      </button>
                      <button
                        onClick={() => setActiveTab("community")}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-black transition"
                      >
                        <MessageCircle size={15} /> Community
                      </button>
                    </div>
                  </div>

                  {/* Preaching */}
                  {selected.preaching && (
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6">
                      <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-3 text-sm">
                        <BookOpen size={16} /> Pastor's Word
                      </div>
                      <p className="text-slate-700 leading-relaxed text-sm md:text-base italic">
                        "{selected.preaching}"
                      </p>
                    </div>
                  )}

                  {/* Announcements */}
                  {(selected.announcements || []).length > 0 && (
                    <div>
                      <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                        <Megaphone size={15} className="text-rose-500" />{" "}
                        Announcements
                      </h3>
                      <div className="space-y-2">
                        {selected.announcements
                          .slice()
                          .reverse()
                          .map((a) => (
                            <div
                              key={a._id}
                              className={`flex gap-3 p-4 rounded-xl border ${a.urgent ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200"}`}
                            >
                              {a.urgent && (
                                <AlertTriangle
                                  size={16}
                                  className="text-rose-500 shrink-0 mt-0.5"
                                />
                              )}
                              <div>
                                <div className="font-semibold text-sm text-slate-800">
                                  {a.title}
                                </div>
                                {a.body && (
                                  <div className="text-xs text-slate-600 mt-1">
                                    {a.body}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Schedule + Requirements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Calendar size={16} className="text-indigo-600" />{" "}
                        Schedule
                      </h3>
                      <div className="space-y-2.5 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          {selected.schedule?.time || "TBD"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {selected.schedule?.days?.join(", ") || "TBD"}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400" />
                          {selected.schedule?.location || "TBD"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Target size={14} className="text-slate-400" />
                          {fmt(selected.schedule?.startDate)} →{" "}
                          {fmt(selected.schedule?.endDate)}
                        </div>
                        {selected.instructor?.name && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                            <User size={14} className="text-slate-400" />
                            <span className="font-medium">
                              Instructor: {selected.instructor.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CheckCircle size={16} className="text-amber-600" />{" "}
                        Requirements
                      </h3>
                      {(selected.requirements || []).length > 0 ? (
                        <ul className="space-y-2">
                          {selected.requirements.map((r, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-slate-700"
                            >
                              <CheckCircle
                                size={15}
                                className="text-amber-500 shrink-0 mt-0.5"
                              />
                              {r}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500">
                          No specific requirements listed.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <button
                        onClick={() => {
                          setEditingStudent(null);
                          setStudentForm({
                            name: "",
                            email: "",
                            phone: "",
                            dateOfBirth: "",
                            address: "",
                            gender: "",
                            emergencyContact: "",
                          });
                          setShowStudentForm(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition shadow-sm"
                      >
                        Register for This Class
                      </button>
                      <p className="text-xs text-slate-400 mt-2">
                        No account required to register
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${isMember ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}
                    >
                      {isMember
                        ? "✅ You are a member — community unlocked"
                        : "Join to access chat & comments"}
                    </div>
                  </div>
                </div>
              )}

              {/* ── CURRICULUM ── */}
              {activeTab === "curriculum" && (
                <div>
                  <SectionHeader title="Curriculum" icon={<Hash size={20} />} />
                  {(selected.curriculum || []).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selected.curriculum.map((week, idx) => (
                        <div
                          key={week._id || idx}
                          className={`relative rounded-2xl border p-5 transition-all ${week.completed ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white hover:shadow-md"}`}
                        >
                          {week.completed && (
                            <div className="absolute top-3 right-3">
                              <CheckCircle
                                size={18}
                                className="text-emerald-500"
                              />
                            </div>
                          )}
                          <div className="text-xs font-bold text-indigo-600 mb-2">
                            WEEK {week.week || idx + 1}
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm mb-2 pr-6">
                            {week.topic}
                          </h4>
                          {week.scripture && (
                            <p className="text-xs text-slate-500 italic mb-3 flex items-start gap-1.5">
                              <BookOpen
                                size={12}
                                className="shrink-0 mt-0.5 text-indigo-400"
                              />
                              {week.scripture}
                            </p>
                          )}
                          {week.description && (
                            <p className="text-xs text-slate-500 mb-3">
                              {week.description}
                            </p>
                          )}
                          {(week.materials || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {week.materials.map((m, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400 text-sm">
                      Curriculum coming soon.
                    </div>
                  )}
                </div>
              )}

              {/* ── CONTENT / TEACHINGS ── */}
              {activeTab === "content" && (
                <div>
                  <SectionHeader
                    title="Teachings & Resources"
                    icon={<BookMarked size={20} />}
                    action={
                      <div className="flex gap-2">
                        <button
                          onClick={fetchPosts}
                          className="text-xs px-3 py-1.5 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition"
                        >
                          Refresh
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setShowPostForm(true)}
                            className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-1"
                          >
                            <Plus size={13} /> Post
                          </button>
                        )}
                      </div>
                    }
                  />
                  {postsLoading ? (
                    <div className="flex justify-center py-12">
                      <Spinner />
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-sm">
                      No content uploaded yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((p) => {
                        const tm =
                          POST_TYPE_META[p.type] || POST_TYPE_META.teaching;
                        return (
                          <div
                            key={p._id}
                            className={`rounded-2xl border p-5 transition-all hover:shadow-sm ${p.pinned ? "border-amber-200 bg-amber-50/40" : "border-slate-200"}`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex flex-wrap items-center gap-2">
                                {p.pinned && (
                                  <Pin size={14} className="text-amber-500" />
                                )}
                                <Badge className={tm.color}>{tm.label}</Badge>
                                <span className="text-xs text-slate-400">
                                  {p.createdByName} · {fmt(p.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                                <span className="flex items-center gap-1">
                                  <Eye size={12} />
                                  {p.views || 0}
                                </span>
                                <button
                                  onClick={() => likePost(p._id)}
                                  className="flex items-center gap-1 hover:text-rose-500 transition"
                                >
                                  <Heart size={12} />
                                  {(p.likes || []).length}
                                </button>
                              </div>
                            </div>
                            <h3 className="font-bold text-slate-800 text-base mt-2">
                              {p.title}
                            </h3>
                            {p.body && (
                              <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
                                {p.body}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── COMMUNITY ── */}
              {activeTab === "community" && (
                <div>
                  <SectionHeader title="Community" icon={<Users size={20} />} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Comments */}
                    <div className="border border-slate-200 rounded-2xl p-5">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1">
                        <MessageCircle size={18} className="text-indigo-600" />{" "}
                        Comments
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">
                        {isMember ? "Members can comment" : "Join to comment"}
                      </p>
                      <div className="space-y-2.5 max-h-72 overflow-y-auto mb-4 pr-1">
                        {comments.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-sm">
                            No comments yet.
                          </div>
                        ) : (
                          comments.map((c) => (
                            <div
                              key={c._id}
                              className="bg-slate-50 border border-slate-100 rounded-xl p-3"
                            >
                              <div className="text-xs font-bold text-slate-800">
                                {c.userName}
                              </div>
                              <div className="text-sm text-slate-600 mt-1">
                                {c.text}
                              </div>
                              <div className="text-xs text-slate-400 mt-1">
                                {fmt(c.createdAt)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex gap-2">
                        <InputClass
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={
                            isMember ? "Write a comment…" : "Join to comment"
                          }
                          disabled={!isMember || !token}
                          onKeyDown={(e) =>
                            e.key === "Enter" && !e.shiftKey && submitComment()
                          }
                        />
                        <button
                          onClick={submitComment}
                          disabled={
                            !isMember ||
                            !token ||
                            !commentText.trim() ||
                            commentLoading
                          }
                          className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition shrink-0"
                        >
                          {commentLoading ? <Spinner /> : <Send size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Chat */}
                    <div className="border border-slate-200 rounded-2xl p-5">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1">
                        <Users size={18} className="text-indigo-600" /> Member
                        Chat
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">
                        {isMember ? "Live group chat" : "Join to access chat"}
                      </p>
                      <div className="space-y-2 max-h-52 overflow-y-auto mb-4 pr-1">
                        {chatLoading ? (
                          <div className="flex justify-center py-6">
                            <Spinner />
                          </div>
                        ) : chat.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-sm">
                            {token
                              ? isMember
                                ? "No messages yet"
                                : "Join to chat"
                              : "Login to view"}
                          </div>
                        ) : (
                          chat.map((m) => (
                            <div
                              key={m._id}
                              className={`flex gap-2.5 ${String(m.userId) === String(myId) ? "flex-row-reverse" : ""}`}
                            >
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                                {(m.userName || "?")[0].toUpperCase()}
                              </div>
                              <div
                                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${String(m.userId) === String(myId) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"}`}
                              >
                                {String(m.userId) !== String(myId) && (
                                  <div className="text-xs font-bold mb-0.5 opacity-70">
                                    {m.userName}
                                  </div>
                                )}
                                {m.text}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex gap-2">
                        <InputClass
                          value={chatText}
                          onChange={(e) => setChatText(e.target.value)}
                          placeholder={isMember ? "Message…" : "Join to chat"}
                          disabled={!isMember || !token}
                          onKeyDown={(e) =>
                            e.key === "Enter" && !e.shiftKey && sendChat()
                          }
                        />
                        <button
                          onClick={sendChat}
                          disabled={!isMember || !token || !chatText.trim()}
                          className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-black disabled:opacity-50 transition shrink-0"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                      {/* DM to admin */}
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                          <Bell size={14} className="text-amber-500" /> Message
                          the class admin
                        </h4>
                        <div className="flex gap-2">
                          <InputClass
                            value={dmText}
                            onChange={(e) => setDmText(e.target.value)}
                            placeholder={
                              token
                                ? "Private message to admin…"
                                : "Login to message"
                            }
                            disabled={!token}
                          />
                          <button
                            onClick={sendDM}
                            disabled={!token || !dmText.trim() || dmLoading}
                            className="p-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 transition shrink-0"
                          >
                            {dmLoading ? <Spinner /> : <Send size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STUDENTS ── */}
              {activeTab === "students" && (
                <div>
                  <SectionHeader
                    title={`Students (${selected.students?.length || 0})`}
                    icon={<User size={20} />}
                    action={
                      <button
                        onClick={() => {
                          setEditingStudent(null);
                          setStudentForm({
                            name: "",
                            email: "",
                            phone: "",
                            dateOfBirth: "",
                            address: "",
                            gender: "",
                            emergencyContact: "",
                          });
                          setShowStudentForm(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                      >
                        <Plus size={15} /> Add Student
                      </button>
                    }
                  />
                  {!isAdmin && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl mb-4">
                      Edit / Delete requires admin privileges.
                    </p>
                  )}
                  {(selected.students || []).length > 0 ? (
                    <div className="overflow-x-auto -mx-2">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                              Contact
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                              Baptized
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                              Attendance
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                              Registered
                            </th>
                            {isAdmin && (
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                                Actions
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selected.students.map((s) => (
                            <tr
                              key={s._id}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                                    {s.name[0].toUpperCase()}
                                  </div>
                                  <span className="font-medium text-slate-800">
                                    {s.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="text-xs text-slate-500 space-y-0.5">
                                  {s.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail size={11} />
                                      {s.email}
                                    </div>
                                  )}
                                  {s.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone size={11} />
                                      {s.phone}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                {isAdmin ? (
                                  <select
                                    value={s.status}
                                    onChange={(e) =>
                                      handleUpdateStudent(s._id, {
                                        status: e.target.value,
                                      })
                                    }
                                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                                  >
                                    {Object.entries(STATUS_META).map(
                                      ([v, m]) => (
                                        <option key={v} value={v}>
                                          {m.label}
                                        </option>
                                      ),
                                    )}
                                  </select>
                                ) : (
                                  <Badge
                                    className={
                                      STATUS_META[s.status]?.color ||
                                      "bg-slate-100 text-slate-600"
                                    }
                                  >
                                    {STATUS_META[s.status]?.label || s.status}
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-3.5">
                                {isAdmin ? (
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={!!s.baptized}
                                      onChange={(e) =>
                                        handleUpdateStudent(s._id, {
                                          baptized: e.target.checked,
                                          baptismDate: e.target.checked
                                            ? new Date()
                                            : null,
                                        })
                                      }
                                      className="w-4 h-4 rounded accent-indigo-600"
                                    />
                                    <span className="text-xs text-slate-600">
                                      {s.baptized ? "Yes" : "No"}
                                    </span>
                                  </label>
                                ) : (
                                  <Badge
                                    className={
                                      s.baptized
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-slate-100 text-slate-500"
                                    }
                                  >
                                    {s.baptized ? "✓ Yes" : "No"}
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                  <Activity
                                    size={12}
                                    className="text-indigo-400"
                                  />
                                  {s.attendanceCount || 0}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-xs text-slate-400">
                                {fmt(s.dateRegistered)}
                              </td>
                              {isAdmin && (
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => startEditStudent(s)}
                                      title="Edit"
                                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteStudent(s._id)}
                                      title="Delete"
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400">
                      <User size={36} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-sm">No students registered yet.</p>
                      <button
                        onClick={() => setShowStudentForm(true)}
                        className="mt-3 text-sm text-indigo-600 hover:underline"
                      >
                        Be the first to register
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── STATISTICS ── */}
              {activeTab === "statistics" && stats && (
                <div>
                  <SectionHeader
                    title="Class Statistics"
                    icon={<BarChart2 size={20} />}
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <StatCard
                      icon={<Users size={18} />}
                      label="Total Students"
                      value={stats.total}
                      color="indigo"
                    />
                    <StatCard
                      icon={<DropletIcon size={18} />}
                      label="Baptized"
                      value={stats.baptized}
                      color="emerald"
                    />
                    <StatCard
                      icon={<TrendingUp size={18} />}
                      label="Completion"
                      value={`${(stats.completionRate || 0).toFixed(1)}%`}
                      color="amber"
                    />
                    <StatCard
                      icon={<Users size={18} />}
                      label="Members"
                      value={stats.members}
                      color="violet"
                    />
                    <StatCard
                      icon={<Target size={18} />}
                      label="Spots Left"
                      value={stats.spotsAvailable}
                      color="sky"
                    />
                    <StatCard
                      icon={<Award size={18} />}
                      label="Posts"
                      value={stats.posts}
                      color="rose"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status breakdown */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <h3 className="font-bold text-slate-700 text-sm mb-4">
                        Students by Status
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(stats.byStatus || {}).map(
                          ([status, count]) => {
                            const pct =
                              stats.total > 0
                                ? Math.round((count / stats.total) * 100)
                                : 0;
                            const meta = STATUS_META[status] || {
                              label: status,
                              color: "bg-slate-100 text-slate-600",
                            };
                            return (
                              <div key={status}>
                                <div className="flex items-center justify-between mb-1">
                                  <Badge className={meta.color}>
                                    {meta.label}
                                  </Badge>
                                  <span className="text-xs font-semibold text-slate-600">
                                    {count} ({pct}%)
                                  </span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* Gender breakdown */}
                    {stats.genderBreakdown && (
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <h3 className="font-bold text-slate-700 text-sm mb-4">
                          Gender Breakdown
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(stats.genderBreakdown).map(
                            ([g, count]) => {
                              const pct =
                                stats.total > 0
                                  ? Math.round((count / stats.total) * 100)
                                  : 0;
                              const colors = {
                                male: "bg-sky-500",
                                female: "bg-rose-400",
                                other: "bg-slate-400",
                              };
                              return (
                                <div key={g}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="capitalize text-sm text-slate-600">
                                      {g}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-600">
                                      {count} ({pct}%)
                                    </span>
                                  </div>
                                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${colors[g] || "bg-slate-500"}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Student Registration Modal ── */}
      {showStudentForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[92vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">
                    {editingStudent ? "Edit Student" : "Register for Baptism"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {editingStudent
                      ? "Update student information"
                      : "Fill in your details to register"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowStudentForm(false);
                    setEditingStudent(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <Field label="Full Name" required>
                  <InputClass
                    type="text"
                    value={studentForm.name}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, name: e.target.value })
                    }
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email" hint="Required if no phone">
                    <InputClass
                      type="email"
                      value={studentForm.email}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </Field>
                  <Field label="Phone" hint="Required if no email">
                    <InputClass
                      type="tel"
                      value={studentForm.phone}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date of Birth">
                    <InputClass
                      type="date"
                      value={studentForm.dateOfBirth}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </Field>
                  <Field label="Gender">
                    <select
                      value={studentForm.gender}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          gender: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    >
                      <option value="">Select…</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                </div>
                <Field label="Address">
                  <TextAreaClass
                    rows={2}
                    value={studentForm.address}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        address: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Emergency Contact">
                  <InputClass
                    type="text"
                    placeholder="Name & phone number"
                    value={studentForm.emergencyContact}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        emergencyContact: e.target.value,
                      })
                    }
                  />
                </Field>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={
                    editingStudent
                      ? () =>
                          handleUpdateStudent(editingStudent._id, studentForm)
                      : handleRegister
                  }
                  disabled={!studentForm.name.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition disabled:opacity-50"
                >
                  {editingStudent ? "Update Student" : "Register Now"}
                </button>
                <button
                  onClick={() => {
                    setShowStudentForm(false);
                    setEditingStudent(null);
                  }}
                  className="px-5 py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-slate-400 text-center mt-3">
                Provide email or phone to prevent duplicate registrations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── New Post Modal (admin) ── */}
      {showPostForm && isAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-slate-800">
                  New Post
                </h2>
                <button
                  onClick={() => setShowPostForm(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <Field label="Type">
                  <select
                    value={postForm.type}
                    onChange={(e) =>
                      setPostForm({ ...postForm, type: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {Object.entries(POST_TYPE_META).map(([v, m]) => (
                      <option key={v} value={v}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Title" required>
                  <InputClass
                    type="text"
                    value={postForm.title}
                    onChange={(e) =>
                      setPostForm({ ...postForm, title: e.target.value })
                    }
                  />
                </Field>
                <Field label="Body">
                  <TextAreaClass
                    rows={5}
                    value={postForm.body}
                    onChange={(e) =>
                      setPostForm({ ...postForm, body: e.target.value })
                    }
                  />
                </Field>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={postForm.pinned}
                    onChange={(e) =>
                      setPostForm({ ...postForm, pinned: e.target.checked })
                    }
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Pin this post
                  </span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={submitPost}
                  disabled={!postForm.title.trim() || postLoading}
                  className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {postLoading ? <Spinner /> : null} Publish Post
                </button>
                <button
                  onClick={() => setShowPostForm(false)}
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
};

export default BaptismPage;
