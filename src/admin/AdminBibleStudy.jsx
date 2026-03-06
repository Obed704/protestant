import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import { AuthContext } from "../context/authContext.jsx";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Star,
  Eye,
  Heart,
  MessageCircle,
  Save,
  X,
  BookOpen,
  BarChart3,
  Upload,
  FileText,
  Music,
  HelpCircle,
  Sparkles,
  Shield,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE}/api/studies`;

const emptyStudyForm = {
  title: "",
  callToAction: "",
  description: "",
  summary: "",
  category: "topical",
  subcategory: "",
  difficulty: "intermediate",
  estimatedTime: 30,
  imageUrl: "",
  isFeatured: false,
  status: "published",
  postedBy: "Admin",
  verses: [{ reference: "", text: "", version: "NIV", notes: "" }],
  songs: [{ name: "", url: "", artist: "", duration: "" }],
  discussionQuestions: [""],
  keyTakeaways: [""],
  prayerPoints: [""],
  tagsText: "",
};

const categories = [
  { value: "old_testament", label: "Old Testament" },
  { value: "new_testament", label: "New Testament" },
  { value: "gospels", label: "Gospels" },
  { value: "prophets", label: "Prophets" },
  { value: "wisdom", label: "Wisdom" },
  { value: "epistles", label: "Epistles" },
  { value: "apocalyptic", label: "Apocalyptic" },
  { value: "topical", label: "Topical" },
];

export default function AdminBibleStudies() {
  const { user, token, authLoading } = useContext(AuthContext);

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      token,
      "x-access-token": token,
    };
  }, [token]);

  const isAdmin = user?.role === "admin";

  const [studies, setStudies] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    difficulty: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "all",
  });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [studyForm, setStudyForm] = useState(emptyStudyForm);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading) {
      fetchAll();
    }
  }, [authLoading]);

  useEffect(() => {
    fetchStudies();
  }, [filters]);

  const fetchAll = async () => {
    await Promise.all([fetchStudies(), fetchStats()]);
  };

  const fetchStudies = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category !== "all") params.append("category", filters.category);
      if (filters.difficulty !== "all") params.append("difficulty", filters.difficulty);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const res = await axios.get(`${API_ENDPOINT}?${params.toString()}`);
      let items = res.data.studies || res.data || [];

      if (filters.status !== "all") {
        items = items.filter((item) => item.status === filters.status);
      }

      setStudies(items);

      if (items.length > 0) {
        const stillExists = items.find((s) => s._id === selectedStudy?._id);
        setSelectedStudy(stillExists || items[0]);
      } else {
        setSelectedStudy(null);
      }
    } catch (err) {
      console.error("Failed to fetch studies:", err);
      setStudies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/stats/summary`);
      setStats(res.data || {});
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setStats({});
    }
  };

  const fetchOneStudy = async (id) => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/${id}`);
      setSelectedStudy(res.data.study || res.data);
    } catch (err) {
      console.error("Failed to fetch single study:", err);
    }
  };

  const resetForm = () => {
    setStudyForm(emptyStudyForm);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = async (study) => {
    setEditingId(study._id);
    setStudyForm({
      title: study.title || "",
      callToAction: study.callToAction || "",
      description: study.description || "",
      summary: study.summary || "",
      category: study.category || "topical",
      subcategory: study.subcategory || "",
      difficulty: study.difficulty || "intermediate",
      estimatedTime: study.estimatedTime || 30,
      imageUrl: study.imageUrl || "",
      isFeatured: !!study.isFeatured,
      status: study.status || "published",
      postedBy: study.postedBy || "Admin",
      verses:
        study.verses?.length > 0
          ? study.verses
          : [{ reference: "", text: "", version: "NIV", notes: "" }],
      songs:
        study.songs?.length > 0
          ? study.songs
          : [{ name: "", url: "", artist: "", duration: "" }],
      discussionQuestions:
        study.discussionQuestions?.length > 0 ? study.discussionQuestions : [""],
      keyTakeaways: study.keyTakeaways?.length > 0 ? study.keyTakeaways : [""],
      prayerPoints: study.prayerPoints?.length > 0 ? study.prayerPoints : [""],
      tagsText: (study.tags || []).join(", "),
    });
    setShowModal(true);
  };

  const handleSaveStudy = async () => {
    if (!studyForm.title.trim()) return alert("Title is required");
    if (!studyForm.description.trim()) return alert("Description is required");

    try {
      setSaving(true);

      const payload = {
        title: studyForm.title.trim(),
        callToAction: studyForm.callToAction.trim(),
        description: studyForm.description.trim(),
        summary: studyForm.summary.trim(),
        category: studyForm.category,
        subcategory: studyForm.subcategory.trim(),
        difficulty: studyForm.difficulty,
        estimatedTime: Number(studyForm.estimatedTime || 30),
        imageUrl: studyForm.imageUrl.trim(),
        isFeatured: !!studyForm.isFeatured,
        status: studyForm.status,
        postedBy: user?.fullName || studyForm.postedBy || "Admin",
        updatedBy: user?.fullName || "Admin",
        verses: (studyForm.verses || []).filter(
          (v) => v.reference?.trim() && v.text?.trim()
        ),
        songs: (studyForm.songs || []).filter(
          (s) => s.name?.trim() && s.url?.trim()
        ),
        discussionQuestions: (studyForm.discussionQuestions || [])
          .map((q) => q.trim())
          .filter(Boolean),
        keyTakeaways: (studyForm.keyTakeaways || [])
          .map((q) => q.trim())
          .filter(Boolean),
        prayerPoints: (studyForm.prayerPoints || [])
          .map((q) => q.trim())
          .filter(Boolean),
        tags: studyForm.tagsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editingId) {
        await axios.put(`${API_ENDPOINT}/${editingId}`, payload, {
          headers: authHeaders,
        });
        alert("Study updated successfully");
      } else {
        await axios.post(API_ENDPOINT, payload, { headers: authHeaders });
        alert("Study created successfully");
      }

      setShowModal(false);
      resetForm();
      await Promise.all([fetchStudies(), fetchStats()]);
    } catch (err) {
      console.error("Save study error:", err);
      alert(err.response?.data?.error || "Failed to save study");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudy = async (studyId) => {
    const okay = window.confirm("Are you sure you want to delete this study?");
    if (!okay) return;

    try {
      await axios.delete(`${API_ENDPOINT}/${studyId}`, {
        headers: authHeaders,
      });
      alert("Study deleted successfully");
      await Promise.all([fetchStudies(), fetchStats()]);
    } catch (err) {
      console.error("Delete study error:", err);
      alert(err.response?.data?.error || "Failed to delete study");
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(`${API_ENDPOINT}/upload-image`, formData, {
        headers: {
          ...authHeaders,
          "Content-Type": "multipart/form-data",
        },
      });

      setStudyForm((prev) => ({
        ...prev,
        imageUrl: res.data.imageUrl || "",
      }));
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const updateVerse = (index, field, value) => {
    const updated = [...studyForm.verses];
    updated[index][field] = value;
    setStudyForm((prev) => ({ ...prev, verses: updated }));
  };

  const addVerse = () => {
    setStudyForm((prev) => ({
      ...prev,
      verses: [...prev.verses, { reference: "", text: "", version: "NIV", notes: "" }],
    }));
  };

  const removeVerse = (index) => {
    setStudyForm((prev) => ({
      ...prev,
      verses: prev.verses.filter((_, i) => i !== index),
    }));
  };

  const updateSong = (index, field, value) => {
    const updated = [...studyForm.songs];
    updated[index][field] = value;
    setStudyForm((prev) => ({ ...prev, songs: updated }));
  };

  const addSong = () => {
    setStudyForm((prev) => ({
      ...prev,
      songs: [...prev.songs, { name: "", url: "", artist: "", duration: "" }],
    }));
  };

  const removeSong = (index) => {
    setStudyForm((prev) => ({
      ...prev,
      songs: prev.songs.filter((_, i) => i !== index),
    }));
  };

  const updateStringArray = (key, index, value) => {
    const updated = [...studyForm[key]];
    updated[index] = value;
    setStudyForm((prev) => ({ ...prev, [key]: updated }));
  };

  const addStringArrayItem = (key) => {
    setStudyForm((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  };

  const removeStringArrayItem = (key, index) => {
    setStudyForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!token || !isAdmin) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-lg">
            <Shield className="mx-auto text-red-500 mb-4" size={48} />
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Admin only</h1>
            <p className="text-gray-600">
              You must be logged in as an admin to access the Bible Study dashboard.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100">
        {/* Hero */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">Bible Study Admin</h1>
                <p className="text-blue-100 mt-3">
                  Manage studies, content, featured posts, and insights
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={fetchAll}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>

                <button
                  onClick={openCreateModal}
                  className="px-4 py-3 rounded-xl bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-300 transition flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Study
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <DashboardStat title="Total Studies" value={stats?.totalStudies || 0} />
              <DashboardStat title="Total Comments" value={stats?.totalComments || 0} />
              <DashboardStat title="Total Likes" value={stats?.totalLikes || 0} />
              <DashboardStat title="Featured" value={stats?.featuredStudies || 0} />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search studies..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="px-4 py-3 rounded-xl border border-gray-300"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.difficulty}
                onChange={(e) => setFilters((prev) => ({ ...prev, difficulty: e.target.value }))}
                className="px-4 py-3 rounded-xl border border-gray-300"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="px-4 py-3 rounded-xl border border-gray-300"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Studies list */}
            <div className="xl:col-span-5">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Studies</h2>
                  <span className="text-sm text-gray-500">{studies.length} found</span>
                </div>

                <div className="max-h-[75vh] overflow-y-auto">
                  {studies.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No studies found.</div>
                  ) : (
                    studies.map((study) => (
                      <button
                        key={study._id}
                        onClick={() => {
                          setSelectedStudy(study);
                          fetchOneStudy(study._id);
                          setActiveTab("overview");
                        }}
                        className={`w-full text-left p-5 border-b border-gray-100 transition ${
                          selectedStudy?._id === study._id ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {study.title}
                            </div>
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {study.summary || study.description}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                              <span>{study.category}</span>
                              <span>{study.difficulty}</span>
                              <span>{study.status}</span>
                            </div>

                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Eye size={13} /> {study.views || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart size={13} /> {study.likes?.length || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle size={13} /> {study.comments?.length || 0}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            {study.isFeatured && (
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-semibold">
                                Featured
                              </span>
                            )}

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(study);
                                }}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteStudy(study._id);
                                }}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Preview panel */}
            <div className="xl:col-span-7">
              {!selectedStudy ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
                  Select a study to preview details.
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedStudy.title}</h2>
                      <p className="text-gray-600 mt-2">
                        {selectedStudy.summary || selectedStudy.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <Badge>{selectedStudy.category}</Badge>
                        <Badge>{selectedStudy.difficulty}</Badge>
                        <Badge>{selectedStudy.status}</Badge>
                        {selectedStudy.isFeatured && <Badge tone="yellow">Featured</Badge>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => openEditModal(selectedStudy)}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStudy(selectedStudy._id)}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="px-6 border-b border-gray-100">
                    <div className="flex flex-wrap gap-6">
                      {["overview", "verses", "songs", "discussion", "takeaways"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-4 text-sm font-medium border-b-2 ${
                            activeTab === tab
                              ? "border-blue-600 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6">
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <SmallStat icon={<Eye size={16} />} label="Views" value={selectedStudy.views || 0} />
                          <SmallStat
                            icon={<Heart size={16} />}
                            label="Likes"
                            value={selectedStudy.likes?.length || 0}
                          />
                          <SmallStat
                            icon={<MessageCircle size={16} />}
                            label="Comments"
                            value={selectedStudy.comments?.length || 0}
                          />
                          <SmallStat
                            icon={<Star size={16} />}
                            label="Favorites"
                            value={selectedStudy.favorites?.length || 0}
                          />
                        </div>

                        <InfoSection title="Description" icon={<FileText size={18} />}>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {selectedStudy.description}
                          </p>
                        </InfoSection>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoSection title="Call to Action" icon={<Sparkles size={18} />}>
                            <p className="text-gray-700">{selectedStudy.callToAction || "None"}</p>
                          </InfoSection>

                          <InfoSection title="Details" icon={<BarChart3 size={18} />}>
                            <div className="space-y-2 text-gray-700">
                              <p><strong>Estimated Time:</strong> {selectedStudy.estimatedTime || 0} min</p>
                              <p><strong>Posted By:</strong> {selectedStudy.postedBy || "Admin"}</p>
                              <p><strong>Status:</strong> {selectedStudy.status}</p>
                            </div>
                          </InfoSection>
                        </div>
                      </div>
                    )}

                    {activeTab === "verses" && (
                      <InfoSection title="Scripture Verses" icon={<BookOpen size={18} />}>
                        {(selectedStudy.verses || []).length === 0 ? (
                          <p className="text-gray-500">No verses added.</p>
                        ) : (
                          <div className="space-y-4">
                            {selectedStudy.verses.map((verse, idx) => (
                              <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                                <div className="font-semibold text-blue-700">{verse.reference}</div>
                                <div className="text-gray-700 mt-2">{verse.text}</div>
                                {verse.notes && (
                                  <div className="text-sm text-gray-500 mt-2">{verse.notes}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </InfoSection>
                    )}

                    {activeTab === "songs" && (
                      <InfoSection title="Songs" icon={<Music size={18} />}>
                        {(selectedStudy.songs || []).length === 0 ? (
                          <p className="text-gray-500">No songs added.</p>
                        ) : (
                          <div className="space-y-3">
                            {selectedStudy.songs.map((song, idx) => (
                              <div key={idx} className="p-4 rounded-xl border border-gray-200">
                                <div className="font-semibold text-gray-900">{song.name}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {song.artist || "Unknown artist"} {song.duration ? `• ${song.duration}` : ""}
                                </div>
                                <a
                                  href={song.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 text-sm mt-2 inline-block"
                                >
                                  Open link
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </InfoSection>
                    )}

                    {activeTab === "discussion" && (
                      <InfoSection title="Discussion Questions" icon={<HelpCircle size={18} />}>
                        {(selectedStudy.discussionQuestions || []).length === 0 ? (
                          <p className="text-gray-500">No discussion questions.</p>
                        ) : (
                          <div className="space-y-3">
                            {selectedStudy.discussionQuestions.map((q, idx) => (
                              <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                                <span className="font-semibold text-blue-700 mr-2">{idx + 1}.</span>
                                <span className="text-gray-700">{q}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </InfoSection>
                    )}

                    {activeTab === "takeaways" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoSection title="Key Takeaways" icon={<Sparkles size={18} />}>
                          {(selectedStudy.keyTakeaways || []).length === 0 ? (
                            <p className="text-gray-500">No takeaways.</p>
                          ) : (
                            <ul className="space-y-2 text-gray-700">
                              {selectedStudy.keyTakeaways.map((item, idx) => (
                                <li key={idx}>• {item}</li>
                              ))}
                            </ul>
                          )}
                        </InfoSection>

                        <InfoSection title="Prayer Points" icon={<Sparkles size={18} />}>
                          {(selectedStudy.prayerPoints || []).length === 0 ? (
                            <p className="text-gray-500">No prayer points.</p>
                          ) : (
                            <ul className="space-y-2 text-gray-700">
                              {selectedStudy.prayerPoints.map((item, idx) => (
                                <li key={idx}>• {item}</li>
                              ))}
                            </ul>
                          )}
                        </InfoSection>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl">
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? "Edit Study" : "Create Study"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Basic */}
                <SectionTitle title="Basic Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Title *">
                    <input
                      className="w-full border rounded-xl px-4 py-3"
                      value={studyForm.title}
                      onChange={(e) => setStudyForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </InputField>

                  <InputField label="Call To Action">
                    <input
                      className="w-full border rounded-xl px-4 py-3"
                      value={studyForm.callToAction}
                      onChange={(e) =>
                        setStudyForm((prev) => ({ ...prev, callToAction: e.target.value }))
                      }
                    />
                  </InputField>
                </div>

                <InputField label="Description *">
                  <textarea
                    rows={6}
                    className="w-full border rounded-xl px-4 py-3"
                    value={studyForm.description}
                    onChange={(e) =>
                      setStudyForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </InputField>

                <InputField label="Summary">
                  <textarea
                    rows={3}
                    className="w-full border rounded-xl px-4 py-3"
                    value={studyForm.summary}
                    onChange={(e) => setStudyForm((prev) => ({ ...prev, summary: e.target.value }))}
                  />
                </InputField>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="Category">
                    <select
                      className="w-full border rounded-xl px-4 py-3"
                      value={studyForm.category}
                      onChange={(e) => setStudyForm((prev) => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </InputField>

                  <InputField label="Difficulty">
                    <select
                      className="w-full border rounded-xl px-4 py-3"
                      value={studyForm.difficulty}
                      onChange={(e) => setStudyForm((prev) => ({ ...prev, difficulty: e.target.value }))}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </InputField>

                  <InputField label="Status">
                    <select
                      className="w-full border rounded-xl px-4 py-3"
                      value={studyForm.status}
                      onChange={(e) => setStudyForm((prev) => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </InputField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="Subcategory">
                    <input
                      className="w-full border rounded-xl px-4 py-3"
                      value={studyForm.subcategory}
                      onChange={(e) => setStudyForm((prev) => ({ ...prev, subcategory: e.target.value }))}
                    />
                  </InputField>

                  <InputField label="Estimated Time (min)">
                    <input
                      type="number"
                      min="1"
                      className="w-full border rounded-xl px-4 py-3"
                      value={studyForm.estimatedTime}
                      onChange={(e) =>
                        setStudyForm((prev) => ({ ...prev, estimatedTime: e.target.value }))
                      }
                    />
                  </InputField>

                  <InputField label="Featured">
                    <select
                      className="w-full border rounded-xl px-4 py-3"
                      value={String(studyForm.isFeatured)}
                      onChange={(e) =>
                        setStudyForm((prev) => ({
                          ...prev,
                          isFeatured: e.target.value === "true",
                        }))
                      }
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </InputField>
                </div>

                {/* Image */}
                <SectionTitle title="Study Image" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <InputField label="Image URL">
                    <input
                      className="w-full border rounded-xl px-4 py-3"
                      value={studyForm.imageUrl}
                      onChange={(e) => setStudyForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    />
                  </InputField>

                  <InputField label="Upload Image">
                    <label className="w-full border rounded-xl px-4 py-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50">
                      <Upload size={18} />
                      {uploadingImage ? "Uploading..." : "Choose file"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files?.[0])}
                      />
                    </label>
                  </InputField>
                </div>

                {/* Verses */}
                <SectionTitle title="Verses" />
                <div className="space-y-4">
                  {studyForm.verses.map((verse, index) => (
                    <div key={index} className="border rounded-2xl p-4 bg-gray-50 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Reference">
                          <input
                            className="w-full border rounded-xl px-4 py-3"
                            value={verse.reference}
                            onChange={(e) => updateVerse(index, "reference", e.target.value)}
                          />
                        </InputField>

                        <InputField label="Version">
                          <select
                            className="w-full border rounded-xl px-4 py-3"
                            value={verse.version}
                            onChange={(e) => updateVerse(index, "version", e.target.value)}
                          >
                            <option value="NIV">NIV</option>
                            <option value="KJV">KJV</option>
                            <option value="ESV">ESV</option>
                            <option value="NASB">NASB</option>
                            <option value="NLT">NLT</option>
                            <option value="MSG">MSG</option>
                            <option value="AMP">AMP</option>
                          </select>
                        </InputField>
                      </div>

                      <InputField label="Text">
                        <textarea
                          rows={3}
                          className="w-full border rounded-xl px-4 py-3"
                          value={verse.text}
                          onChange={(e) => updateVerse(index, "text", e.target.value)}
                        />
                      </InputField>

                      <InputField label="Notes">
                        <textarea
                          rows={2}
                          className="w-full border rounded-xl px-4 py-3"
                          value={verse.notes}
                          onChange={(e) => updateVerse(index, "notes", e.target.value)}
                        />
                      </InputField>

                      <button
                        onClick={() => removeVerse(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove verse
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addVerse}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl"
                  >
                    + Add Verse
                  </button>
                </div>

                {/* Songs */}
                <SectionTitle title="Songs" />
                <div className="space-y-4">
                  {studyForm.songs.map((song, index) => (
                    <div key={index} className="border rounded-2xl p-4 bg-gray-50 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Song Name">
                          <input
                            className="w-full border rounded-xl px-4 py-3"
                            value={song.name}
                            onChange={(e) => updateSong(index, "name", e.target.value)}
                          />
                        </InputField>

                        <InputField label="Artist">
                          <input
                            className="w-full border rounded-xl px-4 py-3"
                            value={song.artist}
                            onChange={(e) => updateSong(index, "artist", e.target.value)}
                          />
                        </InputField>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="URL">
                          <input
                            className="w-full border rounded-xl px-4 py-3"
                            value={song.url}
                            onChange={(e) => updateSong(index, "url", e.target.value)}
                          />
                        </InputField>

                        <InputField label="Duration">
                          <input
                            className="w-full border rounded-xl px-4 py-3"
                            value={song.duration}
                            onChange={(e) => updateSong(index, "duration", e.target.value)}
                          />
                        </InputField>
                      </div>

                      <button
                        onClick={() => removeSong(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove song
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addSong}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl"
                  >
                    + Add Song
                  </button>
                </div>

                {/* Arrays */}
                <SectionTitle title="Discussion Questions" />
                <ArrayEditor
                  items={studyForm.discussionQuestions}
                  onChange={(index, value) =>
                    updateStringArray("discussionQuestions", index, value)
                  }
                  onAdd={() => addStringArrayItem("discussionQuestions")}
                  onRemove={(index) => removeStringArrayItem("discussionQuestions", index)}
                />

                <SectionTitle title="Key Takeaways" />
                <ArrayEditor
                  items={studyForm.keyTakeaways}
                  onChange={(index, value) =>
                    updateStringArray("keyTakeaways", index, value)
                  }
                  onAdd={() => addStringArrayItem("keyTakeaways")}
                  onRemove={(index) => removeStringArrayItem("keyTakeaways", index)}
                />

                <SectionTitle title="Prayer Points" />
                <ArrayEditor
                  items={studyForm.prayerPoints}
                  onChange={(index, value) =>
                    updateStringArray("prayerPoints", index, value)
                  }
                  onAdd={() => addStringArrayItem("prayerPoints")}
                  onRemove={(index) => removeStringArrayItem("prayerPoints", index)}
                />

                <SectionTitle title="Tags" />
                <InputField label="Tags separated by commas">
                  <input
                    className="w-full border rounded-xl px-4 py-3"
                    value={studyForm.tagsText}
                    onChange={(e) => setStudyForm((prev) => ({ ...prev, tagsText: e.target.value }))}
                    placeholder="faith, prayer, salvation"
                  />
                </InputField>

                {/* Footer buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={handleSaveStudy}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save size={18} />
                    {saving ? "Saving..." : editingId ? "Update Study" : "Create Study"}
                  </button>

                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

function DashboardStat({ title, value }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
      <div className="text-sm text-blue-100">{title}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}

function SmallStat({ icon, label, value }) {
  return (
    <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
      <div className="flex items-center justify-between text-gray-600">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-2">{value}</div>
    </div>
  );
}

function Badge({ children, tone = "blue" }) {
  const styles =
    tone === "yellow"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-blue-100 text-blue-700";

  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles}`}>{children}</span>;
}

function SectionTitle({ title }) {
  return <h3 className="text-xl font-bold text-gray-900">{title}</h3>;
}

function InputField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

function InfoSection({ title, icon, children }) {
  return (
    <div className="border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function ArrayEditor({ items, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex gap-3">
          <input
            className="flex-1 border rounded-xl px-4 py-3"
            value={item}
            onChange={(e) => onChange(index, e.target.value)}
          />
          <button
            onClick={() => onRemove(index)}
            className="px-4 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        onClick={onAdd}
        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl"
      >
        + Add item
      </button>
    </div>
  );
}