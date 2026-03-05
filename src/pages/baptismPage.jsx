import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import EnhancedHeader from "../components/header";
import Footer from "../components/footer";
import BaptismNav from "../components/BaptismNav";
import { AuthContext } from "../context/authContext.jsx";
import {
  Calendar, Users, BookOpen, CheckCircle, Download, BarChart,
  X, Edit, MessageCircle, Send, Shield, FileText, BookMarked, Pin,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/baptism`;

const BaptismPage = () => {
  const { user, token, authLoading } = useContext(AuthContext);

  const myId = user?._id || user?.id;
  const isAdmin = user?.role === "admin";

  const [baptismClasses, setBaptismClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [student, setStudent] = useState({ name: "", email: "", phone: "", dateOfBirth: "", address: "" });
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const [chat, setChat] = useState([]);
  const [chatText, setChatText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [dmText, setDmText] = useState("");

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}`, token, "x-access-token": token };
  }, [token]);

  const isMember = useMemo(() => {
    if (!selectedClass || !myId) return false;
    return (selectedClass.members || []).some((m) => String(m.userId) === String(myId));
  }, [selectedClass, myId]);

  const tabList = useMemo(() => {
    return ["overview", "curriculum", "content", "community", "students", "statistics"];
  }, []);

  useEffect(() => { fetchClasses(); }, []);

  useEffect(() => {
    if (selectedClass?._id) {
      fetchStatistics();
      fetchPosts();
      fetchChat();
      setComments(selectedClass.comments || []);
    }
  }, [selectedClass?._id]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ENDPOINT}?active=true`);
      setBaptismClasses(res.data || []);
      if ((res.data || []).length > 0 && !selectedClass) setSelectedClass(res.data[0]);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSelected = async (id = selectedClass?._id) => {
    if (!id) return;
    const cls = await axios.get(`${API_ENDPOINT}/${id}`);
    setSelectedClass(cls.data);
  };

  const fetchStatistics = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/${selectedClass._id}/statistics`);
      setStats(res.data);
    } catch {}
  };

  const fetchPosts = async () => {
    if (!selectedClass?._id) return;
    try {
      setPostsLoading(true);
      const res = await axios.get(`${API_ENDPOINT}/${selectedClass._id}/posts`);
      setPosts(res.data || []);
    } catch {} finally {
      setPostsLoading(false);
    }
  };

  const fetchChat = async () => {
    if (!selectedClass?._id) return;
    if (authLoading) return;

    if (!token) {
      setChat([]);
      return;
    }

    try {
      setChatLoading(true);
      const res = await axios.get(`${API_ENDPOINT}/${selectedClass._id}/chat`, { headers: authHeaders });
      setChat(res.data || []);
    } catch {
      setChat([]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!token) return alert("Please login to join the class");
    try {
      await axios.post(`${API_ENDPOINT}/${selectedClass._id}/join`, {}, { headers: authHeaders });
      await refreshSelected(selectedClass._id);
      setActiveTab("community");
      alert("Joined successfully ✅");
    } catch (err) {
      alert(err.response?.data?.message || "Join failed");
    }
  };

  const handleRegister = async () => {
    if (!student.name.trim()) return alert("Please enter your name");

    // IMPORTANT: required to prevent duplicates
    if (!student.email.trim() && !student.phone.trim()) {
      return alert("Please provide email or phone to register (to prevent duplicates).");
    }

    try {
      const res = await axios.post(`${API_ENDPOINT}/${selectedClass._id}/students`, student);
      setSelectedClass((prev) => ({ ...prev, students: res.data }));
      setStudent({ name: "", email: "", phone: "", dateOfBirth: "", address: "" });
      setShowStudentForm(false);
      alert("Registration successful ✅");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleUpdateStudent = async (studentId, updates) => {
    try {
      await axios.put(`${API_ENDPOINT}/${selectedClass._id}/students/${studentId}`, updates, { headers: authHeaders });
      const [classRes, statsRes] = await Promise.all([
        axios.get(`${API_ENDPOINT}/${selectedClass._id}`),
        axios.get(`${API_ENDPOINT}/${selectedClass._id}/statistics`),
      ]);
      setSelectedClass(classRes.data);
      setStats(statsRes.data);
      setEditingStudent(null);
      alert("Student updated ✅");
    } catch {
      alert("Update failed (admin only)");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Remove this student?")) return;
    try {
      await axios.delete(`${API_ENDPOINT}/${selectedClass._id}/students/${studentId}`, { headers: authHeaders });
      const [classRes, statsRes] = await Promise.all([
        axios.get(`${API_ENDPOINT}/${selectedClass._id}`),
        axios.get(`${API_ENDPOINT}/${selectedClass._id}/statistics`),
      ]);
      setSelectedClass(classRes.data);
      setStats(statsRes.data);
      alert("Student removed ✅");
    } catch {
      alert("Delete failed (admin only)");
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINT}/${selectedClass._id}/export`, {
        headers: authHeaders,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `baptism-students-${selectedClass.title.replace(/\s+/g, "-")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Export failed (admin only)");
    }
  };

  const startEditStudent = (s) => {
    setEditingStudent(s);
    setStudent({
      name: s.name,
      email: s.email || "",
      phone: s.phone || "",
      dateOfBirth: s.dateOfBirth ? String(s.dateOfBirth).slice(0, 10) : "",
      address: s.address || "",
    });
    setShowStudentForm(true);
  };

  const submitComment = async () => {
    if (!token) return alert("Login first to comment");
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(
        `${API_ENDPOINT}/${selectedClass._id}/comments`,
        { text: commentText },
        { headers: authHeaders }
      );
      setComments(res.data || []);
      setCommentText("");
      await refreshSelected(selectedClass._id);
    } catch (err) {
      alert(err.response?.data?.message || "Comment failed");
    }
  };

  const sendChat = async () => {
    if (!token) return alert("Login first to chat");
    if (!chatText.trim()) return;

    try {
      const res = await axios.post(
        `${API_ENDPOINT}/${selectedClass._id}/chat`,
        { text: chatText },
        { headers: authHeaders }
      );
      setChat(res.data || []);
      setChatText("");
    } catch (err) {
      alert(err.response?.data?.message || "Chat message failed");
    }
  };

  const sendMessageToHolder = async () => {
    if (!token) return alert("Login first to message the class holder");
    if (!dmText.trim()) return;

    try {
      await axios.post(
        `${API_ENDPOINT}/${selectedClass._id}/message-to-holder`,
        { text: dmText },
        { headers: authHeaders }
      );
      setDmText("");
      alert("Message sent ✅");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send message");
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
      <BaptismNav isAdmin={isAdmin} />

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white mt-4">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative px-4 py-14 md:py-16 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Baptism Preparation</h1>
          <p className="text-lg md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Teachings • Verses • Community • Mentorship
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Class selection */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Available Classes</h2>

            <div className="flex flex-wrap items-center gap-2">
              {selectedClass && isAdmin && (
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Download size={18} className="mr-2" />
                  Export List
                </button>
              )}

              {selectedClass && (
                <button
                  onClick={() => setShowStudentForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Register
                </button>
              )}

              {selectedClass && (
                <button
                  onClick={handleJoin}
                  className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                    isMember
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-yellow-500 text-white hover:bg-yellow-400"
                  }`}
                >
                  <Shield size={18} />
                  {isMember ? "Joined" : "Join Class"}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {baptismClasses.map((cls) => (
              <div
                key={cls._id}
                onClick={() => setSelectedClass(cls)}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  selectedClass?._id === cls._id
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-white border border-gray-200 hover:shadow-lg"
                }`}
              >
                <h3 className="font-bold text-lg mb-2">{cls.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{cls.description}</p>

                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={16} className="mr-1" />
                  <span>
                    {cls.schedule?.startDate ? new Date(cls.schedule.startDate).toLocaleDateString() : "TBD"} -{" "}
                    {cls.schedule?.endDate ? new Date(cls.schedule.endDate).toLocaleDateString() : "TBD"}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-600">
                    {cls.students?.length || 0} / {cls.maxStudents || 20} students
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      cls.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {cls.isActive ? "Active" : "Completed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedClass && (
          <>
            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex flex-wrap gap-6">
                {tabList.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between gap-3 md:items-start">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{selectedClass.title}</h2>
                      <p className="text-gray-600 mt-2">{selectedClass.description}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab("content")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <FileText size={18} />
                        Teachings
                      </button>
                      <button
                        onClick={() => setActiveTab("community")}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition flex items-center gap-2"
                      >
                        <MessageCircle size={18} />
                        Community
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed">{selectedClass.preaching}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <h3 className="font-bold text-lg mb-4 text-blue-900">Class Schedule</h3>
                      <div className="space-y-2 text-gray-700">
                        <p><strong>Days:</strong> {selectedClass.schedule?.days?.join(", ") || "TBD"}</p>
                        <p><strong>Time:</strong> {selectedClass.schedule?.time || "TBD"}</p>
                        <p><strong>Location:</strong> {selectedClass.schedule?.location || "TBD"}</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-xl">
                      <h3 className="font-bold text-lg mb-4 text-yellow-900">Requirements</h3>
                      {selectedClass.requirements?.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedClass.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle size={18} className="mr-2 mt-1 text-yellow-600 flex-shrink-0" />
                              <span className="text-gray-800">{req}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No specific requirements listed.</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
                    <button
                      onClick={() => setShowStudentForm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-900 transition"
                    >
                      Register for This Class
                    </button>

                    <span className={`px-3 py-1 rounded-full text-sm ${
                      isMember ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {isMember ? "Joined ✅ Community unlocked" : "Join to chat/comment"}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "curriculum" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Curriculum</h2>
                  {selectedClass.curriculum?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {selectedClass.curriculum.map((week, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="font-bold text-blue-600 mb-2">Week {week.week || index + 1}</div>
                          <h4 className="font-semibold mb-2">{week.topic}</h4>
                          <p className="text-sm text-gray-600 mb-2">{week.scripture}</p>
                          {week.materials?.length > 0 && (
                            <div className="text-xs text-gray-500">Materials: {week.materials.join(", ")}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Curriculum details coming soon.</p>
                  )}
                </div>
              )}

              {activeTab === "content" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <BookMarked className="text-blue-600" />
                      Teachings • Verses • Resources
                    </h2>
                    <button
                      onClick={fetchPosts}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                    >
                      Refresh
                    </button>
                  </div>

                  {postsLoading ? (
                    <div className="text-gray-500">Loading content…</div>
                  ) : posts.length === 0 ? (
                    <div className="text-gray-500">No content uploaded yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((p) => (
                        <div key={p._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition">
                          <div className="flex items-center gap-2">
                            {p.pinned && <Pin className="text-yellow-600" size={18} />}
                            <span className="px-2 py-1 text-xs rounded-full font-semibold bg-blue-100 text-blue-700">
                              {String(p.type).toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {p.createdByName} • {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mt-2">{p.title}</h3>
                          {p.body && <p className="text-gray-700 mt-3 whitespace-pre-wrap">{p.body}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "community" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Comments */}
                  <div className="border rounded-2xl p-5">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <MessageCircle className="text-blue-600" />
                      Comments
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {isMember ? "You can comment." : "Join the class to comment."}
                    </p>

                    <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto">
                      {(comments || []).length === 0 ? (
                        <div className="text-gray-500">No comments yet.</div>
                      ) : (
                        comments.map((c) => (
                          <div key={c._id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                            <div className="text-sm font-semibold text-gray-900">{c.userName}</div>
                            <div className="text-sm text-gray-700 mt-1">{c.text}</div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={isMember ? "Write a comment..." : "Join to comment"}
                        disabled={!isMember || !token}
                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                      />
                      <button
                        onClick={submitComment}
                        disabled={!isMember || !token || !commentText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Chat + DM */}
                  <div className="border rounded-2xl p-5">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Users className="text-blue-600" />
                      Chat
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {isMember ? "Members-only chat." : "Join the class to access chat."}
                    </p>

                    <div className="mt-4 space-y-2 max-h-[240px] overflow-y-auto">
                      {chatLoading ? (
                        <div className="text-gray-500">Loading…</div>
                      ) : (chat || []).length === 0 ? (
                        <div className="text-gray-500">
                          {token ? (isMember ? "No messages yet." : "Join to see messages.") : "Login to see chat."}
                        </div>
                      ) : (
                        chat.map((m) => (
                          <div key={m._id} className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                            <div className="text-sm font-semibold text-blue-900">{m.userName}</div>
                            <div className="text-sm text-blue-900/90 mt-1">{m.text}</div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <input
                        value={chatText}
                        onChange={(e) => setChatText(e.target.value)}
                        placeholder={isMember ? "Write a message..." : "Join to chat"}
                        disabled={!isMember || !token}
                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                      />
                      <button
                        onClick={sendChat}
                        disabled={!isMember || !token || !chatText.trim()}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50"
                      >
                        <Send size={18} />
                      </button>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-semibold text-gray-800">Message the class holder/admin</h4>
                      <div className="mt-2 flex gap-2">
                        <input
                          value={dmText}
                          onChange={(e) => setDmText(e.target.value)}
                          placeholder={token ? "Write a private message..." : "Login to message"}
                          disabled={!token}
                          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
                        />
                        <button
                          onClick={sendMessageToHolder}
                          disabled={!token || !dmText.trim()}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-400 disabled:opacity-50"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "students" && (
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Students</h2>
                      <p className="text-gray-600">{selectedClass?.students?.length || 0} enrolled</p>
                      <p className="text-xs text-gray-500 mt-1">Edit/Delete is admin-only</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingStudent(null);
                          setStudent({ name: "", email: "", phone: "", dateOfBirth: "", address: "" });
                          setShowStudentForm(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Add Student
                      </button>
                    </div>
                  </div>

                  {selectedClass?.students?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baptized</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedClass.students.map((s) => (
                            <tr key={s._id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div className="font-medium text-gray-900">{s.name}</div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm text-gray-900">{s.email || "No email"}</div>
                                <div className="text-sm text-gray-500">{s.phone || "No phone"}</div>
                              </td>
                              <td className="px-4 py-4">
                                <select
                                  value={s.status}
                                  onChange={(e) => handleUpdateStudent(s._id, { status: e.target.value })}
                                  className="text-sm border rounded px-2 py-1 bg-white"
                                  disabled={!isAdmin}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in_preparation">In Preparation</option>
                                  <option value="ready">Ready</option>
                                  <option value="completed">Completed</option>
                                  <option value="dropped">Dropped</option>
                                </select>
                              </td>
                              <td className="px-4 py-4">
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={s.baptized || false}
                                    disabled={!isAdmin}
                                    onChange={(e) =>
                                      handleUpdateStudent(s._id, {
                                        baptized: e.target.checked,
                                        baptismDate: e.target.checked ? new Date() : null,
                                      })
                                    }
                                    className="rounded text-blue-600"
                                  />
                                  <span className="ml-2 text-sm text-gray-600">
                                    {s.baptized ? "Yes" : "No"}
                                  </span>
                                </label>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => startEditStudent(s)}
                                    className={`text-blue-600 hover:text-blue-900 ${!isAdmin ? "opacity-40 pointer-events-none" : ""}`}
                                    title="Edit"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStudent(s._id)}
                                    className={`text-red-600 hover:text-red-900 ${!isAdmin ? "opacity-40 pointer-events-none" : ""}`}
                                    title="Delete"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">No students yet.</div>
                  )}
                </div>
              )}

              {activeTab === "statistics" && stats && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <BarChart className="text-blue-600" />
                    Statistics
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Total" value={stats.total} color="blue" />
                    <StatCard title="Baptized" value={stats.baptized} color="green" />
                    <StatCard title="Completion" value={`${Number(stats.completionRate || 0).toFixed(1)}%`} color="yellow" />
                    <StatCard title="Available Spots" value={(selectedClass.maxStudents || 20) - (stats.total || 0)} color="purple" />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Student Modal */}
        {showStudentForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingStudent ? "Edit Student" : "Register for Baptism"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowStudentForm(false);
                      setEditingStudent(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <Field label="Full Name *">
                    <input
                      type="text"
                      required
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={student.name}
                      onChange={(e) => setStudent({ ...student, name: e.target.value })}
                    />
                  </Field>

                  <Field label="Email (required if no phone)">
                    <input
                      type="email"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={student.email}
                      onChange={(e) => setStudent({ ...student, email: e.target.value })}
                    />
                  </Field>

                  <Field label="Phone (required if no email)">
                    <input
                      type="tel"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={student.phone}
                      onChange={(e) => setStudent({ ...student, phone: e.target.value })}
                    />
                  </Field>

                  <Field label="Date of Birth">
                    <input
                      type="date"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={student.dateOfBirth}
                      onChange={(e) => setStudent({ ...student, dateOfBirth: e.target.value })}
                    />
                  </Field>

                  <Field label="Address">
                    <textarea
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      rows={3}
                      value={student.address}
                      onChange={(e) => setStudent({ ...student, address: e.target.value })}
                    />
                  </Field>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        if (editingStudent) handleUpdateStudent(editingStudent._id, student);
                        else handleRegister();
                      }}
                      disabled={!student.name.trim()}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingStudent ? "Update Student" : "Register"}
                    </button>
                    <button
                      onClick={() => {
                        setShowStudentForm(false);
                        setEditingStudent(null);
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="text-xs text-gray-500">
                    To prevent duplicates, provide at least email or phone.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

function StatCard({ title, value, color }) {
  const bg =
    color === "green"
      ? "bg-green-50 text-green-700"
      : color === "yellow"
      ? "bg-yellow-50 text-yellow-700"
      : color === "purple"
      ? "bg-purple-50 text-purple-700"
      : "bg-blue-50 text-blue-700";

  return (
    <div className={`${bg} p-4 rounded-xl`}>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default BaptismPage;