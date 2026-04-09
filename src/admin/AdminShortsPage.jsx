// src/admin/AdminShortsPage.jsx  (or src/admin/AdminVideosDashboard.jsx)
//
// ✅ Requirements on backend:
// 1) app.js must have:  app.use("/api/admin/videos", adminVideosRoutes)
// 2) routes/adminVideos.js should have: router.use(verifyToken, verifyAdmin)  (protect ALL admin routes)

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext.jsx";
import {
  Plus,
  Search,
  RefreshCcw,
  Pencil,
  Trash2,
  RotateCcw,
  ExternalLink,
  Copy,
  Save,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const ADMIN_API = `${API_BASE_URL}/api/admin/videos`;

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Badge = ({ children, tone = "gray" }) => {
  const tones = {
    green: "bg-green-600/20 text-green-300 border-green-600/30",
    red: "bg-red-600/20 text-red-300 border-red-600/30",
    yellow: "bg-yellow-600/20 text-yellow-200 border-yellow-600/30",
    gray: "bg-gray-600/20 text-gray-200 border-gray-600/30",
    blue: "bg-blue-600/20 text-blue-200 border-blue-600/30",
  };
  return (
    <span className={cn("px-2 py-1 text-xs rounded-full border", tones[tone] || tones.gray)}>
      {children}
    </span>
  );
};

const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <h3 className="text-white font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-300 hover:bg-white/10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const TextArea = (props) => (
  <textarea
    {...props}
    className={cn(
      "w-full rounded-xl bg-gray-900 border border-gray-800 px-4 py-3 text-white",
      "placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/60",
      props.className
    )}
  />
);

const Input = (props) => (
  <input
    {...props}
    className={cn(
      "w-full rounded-xl bg-gray-900 border border-gray-800 px-4 py-3 text-white",
      "placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/60",
      props.className
    )}
  />
);

const Select = (props) => (
  <select
    {...props}
    className={cn(
      "w-full rounded-xl bg-gray-900 border border-gray-800 px-4 py-3 text-white",
      "focus:outline-none focus:ring-2 focus:ring-blue-600/60",
      props.className
    )}
  />
);

const Button = ({ children, className, tone = "default", ...props }) => {
  const tones = {
    default: "bg-white/10 hover:bg-white/15 text-white border-gray-700",
    primary: "bg-blue-600 hover:bg-blue-500 text-white border-blue-600",
    danger: "bg-red-600 hover:bg-red-500 text-white border-red-600",
    success: "bg-green-600 hover:bg-green-500 text-white border-green-600",
    ghost: "bg-transparent hover:bg-white/10 text-white border-gray-800",
  };
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed",
        tones[tone] || tones.default,
        className
      )}
    >
      {children}
    </button>
  );
};

export default function AdminShortsPage() {
  const navigate = useNavigate();
  const { user, token: ctxToken, authLoading, logout } = useContext(AuthContext);

  // token source of truth:
  const token = ctxToken || localStorage.getItem("token");

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | active | inactive
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // data
  const [videos, setVideos] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ui
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [toast, setToast] = useState(null); // {type, msg}
  const toastTimerRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [activeItem, setActiveItem] = useState(null);

  const [form, setForm] = useState({
    url: "",
    title: "",
    description: "",
    channel: "",
    isActive: true,
  });

  const noToken = !token;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  };

  const authHeaders = useMemo(() => {
    if (!token) return null;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [token]);

  const api = useCallback(
    async (url, options = {}) => {
      const headers = {
        ...(authHeaders || {}),
        ...(options.headers || {}),
      };

      const res = await fetch(url, { ...options, headers });

      // Try to parse JSON; backend sends JSON
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        // Token missing/expired
        throw new Error(data.message || "Unauthorized (401). Login again.");
      }
      if (res.status === 403) {
        throw new Error(data.message || "Forbidden (403). Admins only.");
      }
      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    },
    [authHeaders]
  );

  const fetchAdminVideos = useCallback(
    async ({ signal } = {}) => {
      if (!authHeaders) return; // don’t fetch without token
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          q: q.trim(),
          status,
          page: String(page),
          limit: String(limit),
        });

        const data = await api(`${ADMIN_API}?${params.toString()}`, { signal });

        setVideos(data.videos || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    },
    [api, authHeaders, q, status, page, limit]
  );

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [q, status, limit]);

  // Guard + debounced fetch
  useEffect(() => {
    if (authLoading) return;

    // If not logged in -> redirect to login
    if (!token) {
      setError("Login required (no token).");
      return;
    }

    // If user exists but not admin -> block
    if (user && user.role !== "admin") {
      setError("Admins only.");
      return;
    }

    const controller = new AbortController();
    const t = setTimeout(() => {
      fetchAdminVideos({ signal: controller.signal });
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [authLoading, token, user, q, status, page, limit, fetchAdminVideos]);

  const openCreate = () => {
    setMode("create");
    setActiveItem(null);
    setForm({ url: "", title: "", description: "", channel: "", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setMode("edit");
    setActiveItem(v);
    setForm({
      url: v.youtubeUrl || "",
      title: v.title || "",
      description: v.description || "",
      channel: v.youtubeChannel || "",
      isActive: !!v.isActive,
    });
    setModalOpen(true);
  };

  const createYoutube = async () => {
    if (!form.url.trim()) return showToast("error", "YouTube URL is required");
    if (!authHeaders) return showToast("error", "Login required");

    try {
      const data = await api(`${ADMIN_API}/youtube`, {
        method: "POST",
        body: JSON.stringify({
          url: form.url.trim(),
          title: form.title.trim(),
          description: form.description.trim(),
          channel: form.channel.trim() || "Unknown Channel",
        }),
      });

      showToast("success", "Video created");
      setModalOpen(false);

      // refetch (keeps pagination consistent)
      await fetchAdminVideos();
      return data;
    } catch (e) {
      showToast("error", e.message || "Create error");
    }
  };

  const updateVideo = async () => {
    if (!activeItem?._id) return;
    if (!authHeaders) return showToast("error", "Login required");

    try {
      const data = await api(`${ADMIN_API}/${activeItem._id}`, {
        method: "PUT",
        body: JSON.stringify({
          url: form.url.trim(),
          title: form.title.trim(),
          description: form.description.trim(),
          channel: form.channel.trim(),
          isActive: form.isActive,
        }),
      });

      showToast("success", "Video updated");
      setModalOpen(false);

      if (data.video) {
        setVideos((prev) => prev.map((v) => (v._id === data.video._id ? data.video : v)));
      } else {
        await fetchAdminVideos();
      }
    } catch (e) {
      showToast("error", e.message || "Update error");
    }
  };

  const softDelete = async (id) => {
    if (!window.confirm("Soft delete this video? (It becomes inactive)")) return;
    if (!authHeaders) return showToast("error", "Login required");

    try {
      await api(`${ADMIN_API}/${id}`, { method: "DELETE" });
      showToast("success", "Video deleted (soft)");
      setVideos((prev) => prev.map((v) => (v._id === id ? { ...v, isActive: false } : v)));
    } catch (e) {
      showToast("error", e.message || "Delete error");
    }
  };

  const restore = async (id) => {
    if (!authHeaders) return showToast("error", "Login required");

    try {
      const data = await api(`${ADMIN_API}/${id}/restore`, { method: "PATCH" });
      showToast("success", "Video restored");

      if (data.video) {
        setVideos((prev) => prev.map((v) => (v._id === id ? data.video : v)));
      } else {
        setVideos((prev) => prev.map((v) => (v._id === id ? { ...v, isActive: true } : v)));
      }
    } catch (e) {
      showToast("error", e.message || "Restore error");
    }
  };

  const toggleActiveQuick = async (v) => {
    if (!authHeaders) return showToast("error", "Login required");

    try {
      const data = await api(`${ADMIN_API}/${v._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !v.isActive }),
      });

      showToast("success", data.video?.isActive ? "Activated" : "Deactivated");
      if (data.video) setVideos((prev) => prev.map((x) => (x._id === v._id ? data.video : x)));
      else setVideos((prev) => prev.map((x) => (x._id === v._id ? { ...x, isActive: !x.isActive } : x)));
    } catch (e) {
      showToast("error", e.message || "Update error");
    }
  };

  const copyText = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt);
      showToast("success", "Copied");
    } catch {
      showToast("error", "Copy failed");
    }
  };

  const handleRelogin = () => {
    try {
      logout?.();
    } catch {}
    navigate("/login");
  };

  const canUsePage = !authLoading && !!token && (!user || user.role === "admin");

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[1000]">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-3 shadow-2xl",
              toast.type === "success" && "bg-green-600/15 border-green-600/30",
              toast.type === "error" && "bg-red-600/15 border-red-600/30",
              toast.type === "info" && "bg-blue-600/15 border-blue-600/30"
            )}
          >
            {toast.type === "success" ? <CheckCircle2 size={18} className="text-green-300" /> : null}
            {toast.type === "error" ? <AlertTriangle size={18} className="text-red-300" /> : null}
            <span className="text-sm">{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Videos Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage YouTube videos (create, edit, soft delete, restore).</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              tone="ghost"
              onClick={() => fetchAdminVideos()}
              disabled={loading || !canUsePage}
              title={!canUsePage ? "Login as admin first" : "Refresh"}
            >
              <RefreshCcw size={16} />
              Refresh
            </Button>

            <Button tone="primary" onClick={openCreate} disabled={!canUsePage}>
              <Plus size={16} />
              Add YouTube Video
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, description, channel, url, youtubeId..."
                className="pl-11"
                disabled={!canUsePage}
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <Select value={status} onChange={(e) => setStatus(e.target.value)} disabled={!canUsePage}>
              <option value="all">All</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </Select>
          </div>

          <div className="md:col-span-3">
            <Select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              disabled={!canUsePage}
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </Select>
          </div>
        </div>

        {/* Warnings / Errors */}
        {authLoading && (
          <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-950 p-4 text-gray-300">
            Checking authentication...
          </div>
        )}

        {!authLoading && !token && (
          <div className="mt-4 rounded-2xl border border-yellow-700/40 bg-yellow-600/10 p-4 text-yellow-200">
            No token found. Login as an admin to use this dashboard.
            <div className="mt-3">
              <Button tone="primary" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </div>
          </div>
        )}

        {!authLoading && token && user && user.role !== "admin" && (
          <div className="mt-4 rounded-2xl border border-red-700/40 bg-red-600/10 p-4 text-red-200">
            Admins only. Your account role is: <b>{user.role}</b>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-700/40 bg-red-600/10 p-4 text-red-200">
            {error}
            {String(error).toLowerCase().includes("unauthorized") && (
              <div className="mt-3">
                <Button tone="primary" onClick={handleRelogin}>
                  Login again
                </Button>
              </div>
            )}
          </div>
        )}

        {/* List */}
        <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <div className="text-sm text-gray-300">
              Total: <span className="text-white font-semibold">{total}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              Page <span className="text-white font-semibold">{page}</span> /{" "}
              <span className="text-white font-semibold">{totalPages}</span>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading...</div>
          ) : !canUsePage ? (
            <div className="p-10 text-center text-gray-500">Login as admin to view videos.</div>
          ) : videos.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No videos found.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {videos.map((v) => (
                <div key={v._id} className="p-4 hover:bg-white/5 transition">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-4">
                      <div className="h-20 w-36 shrink-0 overflow-hidden rounded-xl border border-gray-800 bg-black">
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const id = v.youtubeId;
                            e.currentTarget.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-semibold text-white max-w-[520px]">
                            {v.title || "Untitled"}
                          </h3>
                          {v.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Inactive</Badge>}
                          <Badge tone="blue">{v.youtubeChannel || "Unknown Channel"}</Badge>
                        </div>

                        <p className="mt-1 text-sm text-gray-400 line-clamp-2 max-w-[720px]">
                          {v.description || "No description"}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                          <span className="rounded-lg border border-gray-800 bg-gray-900 px-2 py-1">
                            Likes: <b className="text-white">{v.likesCount ?? v.likedBy?.length ?? 0}</b>
                          </span>
                          <span className="rounded-lg border border-gray-800 bg-gray-900 px-2 py-1">
                            Favorites: <b className="text-white">{v.favoritesCount ?? v.favoritedBy?.length ?? 0}</b>
                          </span>
                          <span className="rounded-lg border border-gray-800 bg-gray-900 px-2 py-1">
                            Views: <b className="text-white">{v.views ?? 0}</b>
                          </span>
                          <span className="rounded-lg border border-gray-800 bg-gray-900 px-2 py-1">
                            Shares: <b className="text-white">{v.shares ?? 0}</b>
                          </span>
                          <span className="rounded-lg border border-gray-800 bg-gray-900 px-2 py-1">
                            ID: <span className="text-white">{String(v._id).slice(0, 8)}...</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <Button tone="ghost" onClick={() => copyText(v._id)} title="Copy Mongo ID">
                        <Copy size={16} />
                        Copy ID
                      </Button>

                      <Button tone="ghost" onClick={() => window.open(v.youtubeUrl, "_blank")} title="Open on YouTube">
                        <ExternalLink size={16} />
                        Open
                      </Button>

                      <Button tone="ghost" onClick={() => openEdit(v)} title="Edit">
                        <Pencil size={16} />
                        Edit
                      </Button>

                      <Button
                        tone={v.isActive ? "default" : "success"}
                        onClick={() => toggleActiveQuick(v)}
                        title={v.isActive ? "Deactivate" : "Activate"}
                      >
                        {v.isActive ? "Deactivate" : "Activate"}
                      </Button>

                      {v.isActive ? (
                        <Button tone="danger" onClick={() => softDelete(v._id)} title="Soft delete">
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      ) : (
                        <Button tone="success" onClick={() => restore(v._id)} title="Restore">
                          <RotateCcw size={16} />
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-800 px-4 py-3">
            <div className="text-sm text-gray-400">
              Showing <span className="text-white">{videos.length}</span> items
            </div>

            <div className="flex items-center gap-2">
              <Button
                tone="ghost"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading || !canUsePage}
              >
                Prev
              </Button>
              <Button
                tone="ghost"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading || !canUsePage}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        title={mode === "create" ? "Add YouTube Video" : "Edit Video"}
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300">YouTube URL</label>
            <Input
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              placeholder="https://youtube.com/shorts/... or https://youtu.be/..."
            />
            <p className="mt-1 text-xs text-gray-500">Supports shorts, watch?v=, embed, youtu.be</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-300">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Video title"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Channel</label>
              <Input
                value={form.channel}
                onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}
                placeholder="Channel name"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">Description</label>
            <TextArea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short description..."
            />
          </div>

          {mode === "edit" && (
            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              <label htmlFor="isActive" className="text-sm text-gray-300">
                Active
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button tone="ghost" onClick={() => setModalOpen(false)}>
              <X size={16} />
              Cancel
            </Button>

            {mode === "create" ? (
              <Button tone="primary" onClick={createYoutube} disabled={!canUsePage}>
                <Save size={16} />
                Create
              </Button>
            ) : (
              <Button tone="primary" onClick={updateVideo} disabled={!canUsePage}>
                <Save size={16} />
                Save changes
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}