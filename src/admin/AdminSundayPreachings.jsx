import React, { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiX,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import { AuthContext } from "../context/authContext.jsx";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/sundayService`;

const toDateInputValue = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const docFrom = (res) => res?.data?.data || res?.data?.preaching || res?.data;

export default function AdminSundayPreachings() {
  const { token: ctxToken, isAuthenticated, authLoading, user } =
    useContext(AuthContext) || {};
  const token = ctxToken || localStorage.getItem("token");

  const headers = useMemo(() => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      token,
      "x-access-token": token,
    };
  }, [token]);

  const [preachings, setPreachings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState({ text: "", type: "" });

  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // desc | asc
  const [page, setPage] = useState(1);
  const [limit] = useState(24);
  const [pages, setPages] = useState(1);

  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    verses: "",
    serviceNumber: "",
    date: "",
  });

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    window.clearTimeout(showMessage._t);
    showMessage._t = window.setTimeout(() => setMessage({ text: "", type: "" }), 4500);
  };

  const resetForm = () => {
    setForm({
      title: "",
      shortDescription: "",
      fullDescription: "",
      verses: "",
      serviceNumber: "",
      date: "",
    });
    setEditingId(null);
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const fetchPreachings = async (opts = {}) => {
    if (!token) return;

    const nextPage = opts.page ?? page;
    const nextQuery = opts.query ?? query;
    const nextSort = opts.sortOrder ?? sortOrder;

    try {
      setLoading(true);

      const res = await axios.get(API_ENDPOINT, {
        headers,
        params: {
          search: nextQuery || undefined,
          sortBy: "date",
          sortOrder: nextSort,
          limit,
          page: nextPage,
        },
      });

      const arr =
        (Array.isArray(res.data) && res.data) ||
        res.data?.preachings ||
        res.data?.data ||
        res.data?.sundayServices ||
        [];

      setPreachings(Array.isArray(arr) ? arr : []);
      const p = res.data?.pagination;
      if (p?.pages) setPages(p.pages);
      else setPages(1);

      setPage(nextPage);
      setQuery(nextQuery);
      setSortOrder(nextSort);
    } catch (err) {
      console.error("Fetch preachings failed:", err?.response?.data || err);
      showMessage(err.response?.data?.message || "Could not load Sunday preachings", "error");
      setPreachings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && token) fetchPreachings({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token]);

  const buildPayload = () => {
    const payload = {
      title: form.title?.trim(),
      shortDescription: form.shortDescription?.trim() || "",
      fullDescription: form.fullDescription?.trim(),
      verses: form.verses?.trim() || "",
      date: form.date, // "YYYY-MM-DD" (backend parses)
    };

    if (form.serviceNumber !== "") payload.serviceNumber = form.serviceNumber;
    else payload.serviceNumber = "";

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      showMessage("You must be logged in to perform this action", "error");
      return;
    }

    if (!form.title?.trim() || !form.fullDescription?.trim() || !form.date) {
      showMessage("Title, full sermon notes, and date are required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();

      if (editingId) {
        const res = await axios.put(`${API_ENDPOINT}/${editingId}`, payload, { headers });
        const updatedDoc = docFrom(res);

        showMessage("Preaching updated successfully!", "success");
        setPreachings((prev) => prev.map((p) => (p._id === editingId ? updatedDoc : p)));
      } else {
        const res = await axios.post(API_ENDPOINT, payload, { headers });
        const createdDoc = docFrom(res);

        showMessage("New preaching added successfully!", "success");
        setPreachings((prev) => [createdDoc, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error("Save failed:", err?.response?.data || err);
      showMessage(err.response?.data?.message || "Failed to save preaching", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      title: p.title || "",
      shortDescription: p.shortDescription || "",
      fullDescription: p.fullDescription || "",
      verses: p.verses || "",
      serviceNumber:
        p.serviceNumber === 0 || p.serviceNumber ? String(p.serviceNumber) : "",
      date: toDateInputValue(p.date),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Sunday preaching permanently?")) return;
    if (!token) return showMessage("Authentication required", "error");

    setDeletingId(id);
    try {
      await axios.delete(`${API_ENDPOINT}/${id}`, { headers });
      showMessage("Preaching deleted successfully", "success");
      setPreachings((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete failed:", err?.response?.data || err);
      showMessage(err.response?.data?.message || "Failed to delete preaching", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    fetchPreachings({ page: 1, query });
  };

  const toggleSort = () => {
    const next = sortOrder === "desc" ? "asc" : "desc";
    fetchPreachings({ page: 1, sortOrder: next });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You must be logged in as an admin to manage Sunday preachings.
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Admin Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPreachings({ page: 1 })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-800 shadow-sm"
              title="Refresh"
            >
              <FiRefreshCw />
              Refresh
            </button>
            <div className="px-4 py-2 rounded-lg border bg-white text-gray-700 shadow-sm">
              <span className="text-sm">Signed in:</span>{" "}
              <span className="font-semibold">{user?.fullName || "Admin"}</span>
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Manage Sunday Preachings
            </h1>
            <p className="text-gray-600">
              Create, edit, and delete Sunday service preachings.
            </p>
          </div>

          <form onSubmit={onSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-[340px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, verses, preacher..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
            >
              Search
            </button>
            <button
              type="button"
              onClick={toggleSort}
              className="px-4 py-2.5 rounded-lg border bg-white hover:bg-gray-50 text-gray-800 shadow-sm"
              title="Toggle sort order"
            >
              Date: {sortOrder === "desc" ? "Newest" : "Oldest"}
            </button>
          </form>
        </div>

        {message.text && (
          <div
            className={`mb-8 p-4 rounded-xl border flex items-center gap-3 shadow-sm ${
              message.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            {message.type === "error" ? (
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden mb-12">
          <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              {editingId ? (
                <>
                  <FiEdit className="text-yellow-600" />
                  Edit Preaching
                </>
              ) : (
                <>
                  <FiPlus className="text-blue-600" />
                  Add New Preaching
                </>
              )}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium"
              >
                <FiX />
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sermon Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. The Power of Faith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description (preview)
                </label>
                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  placeholder="Brief summary shown in lists..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[90px]"
                  rows="3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Sermon Notes / Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="fullDescription"
                  value={form.fullDescription}
                  onChange={handleChange}
                  placeholder="Complete sermon content, key points, scriptures..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[200px]"
                  rows="7"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Bible Verses
                </label>
                <input
                  type="text"
                  name="verses"
                  value={form.verses}
                  onChange={handleChange}
                  placeholder="John 3:16, Psalm 23:1-4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Number
                </label>
                <input
                  type="number"
                  name="serviceNumber"
                  value={form.serviceNumber}
                  onChange={handleChange}
                  placeholder="e.g. 52"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className={`px-8 py-3 rounded-lg font-medium shadow transition flex items-center justify-center gap-2 min-w-[180px] ${
                  saving
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : editingId
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {saving ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                    Saving...
                  </>
                ) : editingId ? (
                  <>
                    <FiEdit />
                    Update Preaching
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Add Preaching
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition min-w-[180px]"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg">Loading Sunday preachings...</p>
          </div>
        ) : preachings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No preachings found
            </h3>
            <p className="text-gray-500">
              Add a new Sunday preaching using the form above.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Published Preachings ({preachings.length})
              </h2>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchPreachings({ page: Math.max(1, page - 1) })}
                  className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Prev
                </button>
                <div className="px-4 py-2 rounded-lg border bg-white text-gray-700">
                  Page <span className="font-semibold">{page}</span> /{" "}
                  <span className="font-semibold">{pages}</span>
                </div>
                <button
                  disabled={page >= pages}
                  onClick={() => fetchPreachings({ page: Math.min(pages, page + 1) })}
                  className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {preachings.map((p) => (
                <div
                  key={p._id}
                  className={`bg-white rounded-2xl shadow border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    deletingId === p._id ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                        {p.title || "Untitled Preaching"}
                      </h3>
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                        {p.date ? new Date(p.date).toLocaleDateString() : "—"}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {p.shortDescription || "No short description"}
                    </p>

                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                      <p className="truncate">
                        <strong>Verses:</strong> {p.verses || "—"}
                      </p>
                      <p>
                        <strong>Service #:</strong>{" "}
                        {p.serviceNumber === 0 || p.serviceNumber ? p.serviceNumber : "—"}
                      </p>
                    </div>

                    <div className="flex gap-3 mt-6 pt-5 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(p)}
                        disabled={deletingId === p._id}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2.5 rounded-lg transition shadow-sm disabled:opacity-50"
                      >
                        <FiEdit />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        disabled={deletingId === p._id}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition shadow-sm disabled:opacity-50"
                      >
                        <FiTrash2 />
                        {deletingId === p._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}