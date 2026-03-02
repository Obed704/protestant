// AdminBaptismPage.jsx (FULL SAFE COMPONENT TEMPLATE)
// Fixes: baptismClasses.filter is not a function
// - normalizes API response to an array
// - handles 401/HTML responses safely
// - supports Vite env var
// NOTE: Replace endpoints if your backend uses different ones.

import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext.jsx";

// Vite env var (recommended)
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helpers
const toArray = (data) => {
  if (Array.isArray(data)) return data;

  // common API shapes:
  // { classes: [...] } , { baptismClasses: [...] }, { data: [...] }
  if (Array.isArray(data?.classes)) return data.classes;
  if (Array.isArray(data?.baptismClasses)) return data.baptismClasses;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const safeJsonText = async (res) => {
  try {
    const text = await res.text();
    return text?.slice(0, 200);
  } catch {
    return "";
  }
};

export default function AdminBaptismPage() {
  const { token, authLoading } = useContext(AuthContext);

  // ====== STATE ======
  const [baptismClasses, setBaptismClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Optional UI controls
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | archived

  // ====== AUTH HEADERS ======
  const authHeaders = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  // ====== FETCH ======
  const fetchClasses = async () => {
    setLoading(true);
    setApiError("");

    try {
      if (!API_BASE_URL) {
        throw new Error(
          "VITE_API_URL is missing. Add it to .env and restart Vite."
        );
      }

      // IMPORTANT: update this endpoint if yours differs
      const url = `${API_BASE_URL}/api/baptism/classes`;

      const res = await axios.get(url, { headers: authHeaders });

      // Normalize response to array
      const list = toArray(res.data);
      setBaptismClasses(list);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch baptism classes";

      console.error("Fetch classes error:", err.response?.data || err);
      setApiError(msg);

      // Ensure state stays an array so .filter never crashes
      setBaptismClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth restore on refresh
    if (authLoading) return;

    // If your endpoint is protected, require token
    if (!token) {
      setLoading(false);
      setApiError("You must be logged in to view this page.");
      setBaptismClasses([]);
      return;
    }

    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token]);

  // ====== SAFE FILTERING ======
  const safeClasses = Array.isArray(baptismClasses) ? baptismClasses : [];

  const filteredClasses = useMemo(() => {
    return safeClasses
      .filter((c) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "active") return c?.status === "active";
        if (statusFilter === "archived") return c?.status === "archived";
        return true;
      })
      .filter((c) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          (c?.title || "").toLowerCase().includes(q) ||
          (c?.name || "").toLowerCase().includes(q) ||
          (c?.description || "").toLowerCase().includes(q)
        );
      });
  }, [safeClasses, search, statusFilter]);

  // ====== CRUD (optional examples) ======
  const deleteClass = async (id) => {
    if (!window.confirm("Delete this baptism class?")) return;

    try {
      const url = `${API_BASE_URL}/api/baptism/classes/${id}`;
      await axios.delete(url, { headers: authHeaders });
      setBaptismClasses((prev) => prev.filter((x) => x._id !== id));
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete";
      alert(msg);
      console.error("Delete error:", err.response?.data || err);
    }
  };

  // ====== RENDER ======
  return (
    <section className="p-6 min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            to="/admin"
            className="bg-white/80 hover:bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md"
          >
            ← Dashboard
          </Link>

          <button
            onClick={fetchClasses}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            disabled={loading}
            title="Refresh"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <h1 className="text-3xl font-bold text-blue-800 mb-4">
          Baptism Classes (Admin)
        </h1>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Search by title, name, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded-lg px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <div className="text-gray-600 flex items-center">
            Total:{" "}
            <span className="font-semibold text-gray-900 ml-2">
              {safeClasses.length}
            </span>
          </div>
        </div>

        {/* Error */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
            {apiError}
            {!API_BASE_URL && (
              <div className="mt-2 text-sm text-red-700">
                Fix: add <b>VITE_API_URL</b> to your .env then restart Vite.
              </div>
            )}
          </div>
        )}

        {/* List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center text-gray-600 py-10">
              Loading classes...
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="col-span-full text-center text-gray-600 py-10">
              No classes found.
            </div>
          ) : (
            filteredClasses.map((c) => (
              <div
                key={c._id}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-blue-700 mb-2">
                    {c.title || c.name || "Untitled"}
                  </h3>

                  {c.description && (
                    <p className="text-gray-700 mb-3 line-clamp-3">
                      {c.description}
                    </p>
                  )}

                  <div className="text-sm text-gray-600 space-y-1">
                    {c.status && (
                      <div>
                        <span className="font-semibold">Status:</span>{" "}
                        {c.status}
                      </div>
                    )}
                    {c.date && (
                      <div>
                        <span className="font-semibold">Date:</span> {c.date}
                      </div>
                    )}
                    {typeof c.participantsCount === "number" && (
                      <div>
                        <span className="font-semibold">Participants:</span>{" "}
                        {c.participantsCount}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {/* add your edit navigation here if you have it */}
                  <button
                    onClick={() => deleteClass(c._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
