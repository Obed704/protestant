import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import Header from "../components/header.jsx";
import Footer from "../components/footer.jsx";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "";

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

/* ─── Constants ─────────────────────────────────────────────── */
const ROLES = [
  { value: "representative", label: "Representative", needsGender: false },
  {
    value: "vice_representative",
    label: "Vice Representative",
    needsGender: false,
  },
  { value: "advisor", label: "Advisor", needsGender: true },
  { value: "intercessor", label: "Intercessor", needsGender: true },
  { value: "secretary", label: "Secretary", needsGender: false },
  { value: "treasurer", label: "Treasurer", needsGender: false },
  { value: "accountant", label: "Accountant", needsGender: false },
  { value: "grand_pere", label: "Grand Père", needsGender: false },
];

const ROLE_ORDER_LABEL = (m) => {
  const r = ROLES.find((x) => x.value === m.role);
  if (!r) return "Member";
  if (r.needsGender)
    return `${r.label} (${m.gender === "boy" ? "Boy" : "Girl"})`;
  return r.label;
};

const TIER_OF = {
  representative: "leadership",
  vice_representative: "leadership",
  advisor: "advisory",
  intercessor: "advisory",
  secretary: "executive",
  treasurer: "executive",
  accountant: "executive",
  grand_pere: "honorary",
};

/* ─── Small reusable components ─────────────────────────────── */
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const cls =
    type === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl ${cls} text-sm font-medium`}
    >
      {type === "error" ? "⚠️" : "✓"} {message}
      <button
        onClick={onClose}
        className="ml-2 opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-label="Confirm action"
  >
    <div className="bg-white rounded-3xl border border-black/10 shadow-2xl p-6 max-w-sm w-full">
      <div className="text-xl font-bold text-slate-900 mb-2">Are you sure?</div>
      <p className="text-slate-600 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-black/10 text-slate-700 hover:bg-slate-50 font-medium text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const Field = ({ label, children, required, id }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-xs font-medium text-slate-600">
      {label}{" "}
      {required && (
        <span className="text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
    {children}
  </div>
);

const inputCls =
  "rounded-xl border border-black/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 w-full bg-white text-slate-900 placeholder:text-slate-400";
const selectCls = `${inputCls}`;

/* ─── Avatar preview ────────────────────────────────────────── */
const AvatarPreview = ({ url, name }) => {
  const [err, setErr] = useState(false);
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  if (url && !err) {
    return (
      <img
        src={url}
        alt={name}
        onError={() => setErr(true)}
        className="w-12 h-12 rounded-xl object-cover border border-black/10 flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-black/10 flex items-center justify-center text-slate-500 font-bold text-sm flex-shrink-0">
      {initials}
    </div>
  );
};

/* ─── Inline editable member row ────────────────────────────── */
const MemberRow = ({ m, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: m.name,
    narration: m.narration,
    imageUrl: m.imageUrl,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(m._id, form);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="border-t border-black/5 first:border-0">
      {!editing ? (
        <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 group">
          <span className="text-xs text-slate-400 w-6 text-center font-mono">
            {m.order}
          </span>
          <AvatarPreview url={m.imageUrl} name={m.name} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-900 text-sm truncate">
              {m.name}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {ROLE_ORDER_LABEL(m)}
            </div>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 rounded-lg border border-black/10 text-xs font-medium hover:bg-slate-50"
              aria-label={`Edit ${m.name}`}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(m._id, m.name)}
              className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100"
              aria-label={`Delete ${m.name}`}
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <AvatarPreview url={form.imageUrl} name={form.name} />
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {ROLE_ORDER_LABEL(m)}
              </div>
              <div className="text-xs text-slate-500">Editing member</div>
            </div>
          </div>
          <Field label="Name" id={`name-${m._id}`} required>
            <input
              id={`name-${m._id}`}
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
          </Field>
          <Field label="Image URL" id={`img-${m._id}`}>
            <input
              id={`img-${m._id}`}
              className={inputCls}
              value={form.imageUrl}
              onChange={(e) =>
                setForm((s) => ({ ...s, imageUrl: e.target.value }))
              }
              placeholder="https://..."
            />
          </Field>
          <Field label="Bio / Narration" id={`bio-${m._id}`}>
            <textarea
              id={`bio-${m._id}`}
              className={`${inputCls} min-h-[80px] resize-y`}
              value={form.narration}
              onChange={(e) =>
                setForm((s) => ({ ...s, narration: e.target.value }))
              }
              placeholder="Short bio or description…"
            />
          </Field>
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-xl border border-black/10 text-sm font-medium text-slate-700 hover:bg-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main admin page ───────────────────────────────────────── */
export default function AdminCommitteesPage() {
  const { user, token, authLoading } = useContext(AuthContext);

  const [years, setYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState(null); // { message, type }
  const [confirm, setConfirm] = useState(null); // { message, onConfirm }

  const [activeTab, setActiveTab] = useState("members"); // "members" | "settings"

  // Year form
  const [yearForm, setYearForm] = useState({
    label: "",
    startYear: "",
    endYear: "",
    title: "Church Committee",
    description: "",
    isActive: false,
  });

  // Member form
  const [memberForm, setMemberForm] = useState({
    role: "representative",
    gender: "na",
    name: "",
    imageUrl: "",
    narration: "",
  });

  const [memberSearch, setMemberSearch] = useState("");

  const isAdmin = user?.role === "admin";

  const showToast = (message, type = "success") => setToast({ message, type });
  const closeToast = () => setToast(null);

  /* ── API helpers ── */
  const loadYears = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/api/committees/years`);
    setYears(data);
    if (!selectedYearId && data?.[0]?._id) setSelectedYearId(data[0]._id);
  };

  const loadYear = async (id) => {
    if (!id) return;
    const { data } = await axios.get(
      `${API_BASE_URL}/api/committees/years/${id}`,
    );
    setPayload(data);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadYears();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedYearId) loadYear(selectedYearId);
  }, [selectedYearId]);

  /* ── Year CRUD ── */
  const onCreateYear = async () => {
    if (!yearForm.label || !yearForm.startYear || !yearForm.endYear) {
      showToast("Label, start year, and end year are required.", "error");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/committees/years`,
        {
          ...yearForm,
          startYear: Number(yearForm.startYear),
          endYear: Number(yearForm.endYear),
        },
        { headers: authHeaders(token) },
      );
      setYearForm({
        label: "",
        startYear: "",
        endYear: "",
        title: "Church Committee",
        description: "",
        isActive: false,
      });
      await loadYears();
      showToast(`Year "${yearForm.label}" created.`);
    } catch (e) {
      showToast(e?.response?.data?.message || e.message, "error");
    }
  };

  const onDeleteYear = (id, label) => {
    setConfirm({
      message: `This will permanently delete the "${label}" committee year and ALL its members. This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await axios.delete(`${API_BASE_URL}/api/committees/years/${id}`, {
            headers: authHeaders(token),
          });
          setSelectedYearId("");
          setPayload(null);
          await loadYears();
          showToast("Committee year deleted.");
        } catch (e) {
          showToast(e?.response?.data?.message || e.message, "error");
        }
      },
    });
  };

  const onToggleActive = async (id, isActive) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/committees/years/${id}`,
        { isActive },
        { headers: authHeaders(token) },
      );
      await loadYears();
      await loadYear(selectedYearId);
      showToast(isActive ? "Year set as active." : "Year deactivated.");
    } catch (e) {
      showToast(e?.response?.data?.message || e.message, "error");
    }
  };

  /* ── Member CRUD ── */
  const onAddMember = async () => {
    if (!selectedYearId) {
      showToast("Select a year first.", "error");
      return;
    }
    if (!memberForm.name.trim()) {
      showToast("Name is required.", "error");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/committees/years/${selectedYearId}/members`,
        memberForm,
        { headers: authHeaders(token) },
      );
      setMemberForm({
        role: "representative",
        gender: "na",
        name: "",
        imageUrl: "",
        narration: "",
      });
      await loadYear(selectedYearId);
      showToast(`Member "${memberForm.name}" added.`);
    } catch (e) {
      showToast(e?.response?.data?.message || e.message, "error");
    }
  };

  const onDeleteMember = (id, name) => {
    setConfirm({
      message: `Delete "${name}" from this committee?`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await axios.delete(`${API_BASE_URL}/api/committees/members/${id}`, {
            headers: authHeaders(token),
          });
          await loadYear(selectedYearId);
          showToast(`"${name}" removed.`);
        } catch (e) {
          showToast(e?.response?.data?.message || e.message, "error");
        }
      },
    });
  };

  const onUpdateMember = async (id, updates) => {
    try {
      await axios.put(`${API_BASE_URL}/api/committees/members/${id}`, updates, {
        headers: authHeaders(token),
      });
      await loadYear(selectedYearId);
      showToast("Member updated.");
    } catch (e) {
      showToast(e?.response?.data?.message || e.message, "error");
    }
  };

  /* ── Computed ── */
  const selectedYear = useMemo(
    () => years.find((y) => y._id === selectedYearId),
    [years, selectedYearId],
  );
  const members = payload?.members || [];
  const year = payload?.year;

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        ROLE_ORDER_LABEL(m).toLowerCase().includes(q),
    );
  }, [members, memberSearch]);

  const needsGender =
    memberForm.role === "advisor" || memberForm.role === "intercessor";

  /* ── Guards ── */
  if (authLoading) return null;

  if (!isAdmin) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4" aria-hidden="true">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="mt-2 text-slate-600">
            This page is only accessible to administrators.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  /* ── Render ── */
  return (
    <>
      <Header />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-1">
              Admin Panel
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Committee Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Create years, manage members, and control visibility.
            </p>
          </div>
          {year && (
            <a
              href="/committee"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              View Public Page ↗
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Left panel: years ── */}
          <aside className="lg:col-span-4" aria-label="Committee years">
            <div className="rounded-3xl border border-black/8 bg-white overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-black/5">
                <h2 className="font-semibold text-slate-900">
                  Committee Years
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {years.length} year{years.length !== 1 ? "s" : ""} total
                </p>
              </div>

              {/* Year list */}
              <div className="p-3 space-y-1.5" role="list">
                {years.map((y) => (
                  <div
                    key={y._id}
                    role="listitem"
                    className={[
                      "group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition",
                      selectedYearId === y._id
                        ? "bg-slate-900 text-white"
                        : "hover:bg-slate-50 text-slate-900",
                    ].join(" ")}
                    onClick={() => setSelectedYearId(y._id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {y.label}
                      </div>
                      <div
                        className={`text-xs truncate ${selectedYearId === y._id ? "text-white/60" : "text-slate-500"}`}
                      >
                        {y.title}
                      </div>
                    </div>
                    {y.isActive && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${selectedYearId === y._id ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"}`}
                      >
                        Active
                      </span>
                    )}
                  </div>
                ))}
                {years.length === 0 && (
                  <div className="px-3 py-6 text-center text-sm text-slate-400">
                    No years yet.
                  </div>
                )}
              </div>

              {/* Add year form */}
              <div className="border-t border-black/5 p-5 space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Create New Year
                </h3>

                <Field label="Label" id="y-label" required>
                  <input
                    id="y-label"
                    className={inputCls}
                    placeholder="e.g. 2024-2025"
                    value={yearForm.label}
                    onChange={(e) =>
                      setYearForm((s) => ({ ...s, label: e.target.value }))
                    }
                  />
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="Start Year" id="y-start" required>
                    <input
                      id="y-start"
                      className={inputCls}
                      placeholder="2024"
                      type="number"
                      value={yearForm.startYear}
                      onChange={(e) =>
                        setYearForm((s) => ({
                          ...s,
                          startYear: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="End Year" id="y-end" required>
                    <input
                      id="y-end"
                      className={inputCls}
                      placeholder="2025"
                      type="number"
                      value={yearForm.endYear}
                      onChange={(e) =>
                        setYearForm((s) => ({ ...s, endYear: e.target.value }))
                      }
                    />
                  </Field>
                </div>

                <Field label="Title" id="y-title">
                  <input
                    id="y-title"
                    className={inputCls}
                    placeholder="Church Committee"
                    value={yearForm.title}
                    onChange={(e) =>
                      setYearForm((s) => ({ ...s, title: e.target.value }))
                    }
                  />
                </Field>

                <Field label="Description" id="y-desc">
                  <textarea
                    id="y-desc"
                    className={`${inputCls} min-h-[70px] resize-y`}
                    placeholder="Optional description…"
                    value={yearForm.description}
                    onChange={(e) =>
                      setYearForm((s) => ({
                        ...s,
                        description: e.target.value,
                      }))
                    }
                  />
                </Field>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={yearForm.isActive}
                    onChange={(e) =>
                      setYearForm((s) => ({ ...s, isActive: e.target.checked }))
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">
                    Set as active year
                  </span>
                </label>

                <button
                  onClick={onCreateYear}
                  className="w-full rounded-xl bg-slate-900 text-white py-2.5 text-sm font-semibold hover:bg-slate-800"
                >
                  Create Year
                </button>
              </div>
            </div>
          </aside>

          {/* ── Right panel: year details ── */}
          <div className="lg:col-span-8">
            {!selectedYearId ? (
              <div className="rounded-3xl border border-black/8 bg-white p-10 text-center text-slate-400">
                <div className="text-4xl mb-3" aria-hidden="true">
                  📅
                </div>
                <div className="font-semibold text-slate-600">
                  Select a year to manage
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-black/8 bg-white overflow-hidden">
                {/* Year header */}
                <div className="px-6 pt-5 pb-4 border-b border-black/5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {selectedYear?.label || "—"}
                      {year?.isActive && (
                        <span className="ml-2 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {year?.title}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {year && !year.isActive && (
                      <button
                        onClick={() => onToggleActive(selectedYearId, true)}
                        className="px-3 py-2 rounded-xl border border-green-200 bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100"
                      >
                        Set Active
                      </button>
                    )}
                    {year && year.isActive && (
                      <button
                        onClick={() => onToggleActive(selectedYearId, false)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100"
                      >
                        Deactivate
                      </button>
                    )}
                    <button
                      onClick={() =>
                        onDeleteYear(selectedYearId, selectedYear?.label)
                      }
                      className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100"
                    >
                      Delete Year
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-0 border-b border-black/5">
                  {[
                    { key: "members", label: `Members (${members.length})` },
                    { key: "settings", label: "Year Settings" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      aria-selected={activeTab === t.key}
                      role="tab"
                      className={[
                        "px-5 py-3 text-sm font-medium border-b-2 transition",
                        activeTab === t.key
                          ? "border-slate-900 text-slate-900"
                          : "border-transparent text-slate-500 hover:text-slate-700",
                      ].join(" ")}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab: Members */}
                {activeTab === "members" && (
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Add member form */}
                      <div className="rounded-2xl border border-black/8 bg-slate-50 p-4 space-y-3">
                        <h3 className="font-semibold text-slate-900 text-sm">
                          Add Member
                        </h3>

                        <Field label="Role" id="m-role" required>
                          <select
                            id="m-role"
                            className={selectCls}
                            value={memberForm.role}
                            onChange={(e) => {
                              const role = e.target.value;
                              setMemberForm((s) => ({
                                ...s,
                                role,
                                gender:
                                  role === "advisor" || role === "intercessor"
                                    ? "boy"
                                    : "na",
                              }));
                            }}
                          >
                            {ROLES.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        </Field>

                        {needsGender && (
                          <Field label="Gender" id="m-gender" required>
                            <select
                              id="m-gender"
                              className={selectCls}
                              value={memberForm.gender}
                              onChange={(e) =>
                                setMemberForm((s) => ({
                                  ...s,
                                  gender: e.target.value,
                                }))
                              }
                            >
                              <option value="boy">Boy</option>
                              <option value="girl">Girl</option>
                            </select>
                          </Field>
                        )}

                        <Field label="Full Name" id="m-name" required>
                          <input
                            id="m-name"
                            className={inputCls}
                            placeholder="e.g. Jean-Pierre Habimana"
                            value={memberForm.name}
                            onChange={(e) =>
                              setMemberForm((s) => ({
                                ...s,
                                name: e.target.value,
                              }))
                            }
                          />
                        </Field>

                        <Field label="Image URL" id="m-img">
                          <div className="flex gap-2 items-center">
                            <input
                              id="m-img"
                              className={`${inputCls} flex-1`}
                              placeholder="https://..."
                              value={memberForm.imageUrl}
                              onChange={(e) =>
                                setMemberForm((s) => ({
                                  ...s,
                                  imageUrl: e.target.value,
                                }))
                              }
                            />
                            {memberForm.imageUrl && (
                              <AvatarPreview
                                url={memberForm.imageUrl}
                                name={memberForm.name}
                              />
                            )}
                          </div>
                        </Field>

                        <Field label="Bio / Narration" id="m-bio">
                          <textarea
                            id="m-bio"
                            className={`${inputCls} min-h-[80px] resize-y`}
                            placeholder="Short bio or description of this member…"
                            value={memberForm.narration}
                            onChange={(e) =>
                              setMemberForm((s) => ({
                                ...s,
                                narration: e.target.value,
                              }))
                            }
                          />
                          <div className="text-xs text-slate-400 text-right">
                            {memberForm.narration.length} chars
                          </div>
                        </Field>

                        <button
                          onClick={onAddMember}
                          disabled={!memberForm.name.trim()}
                          className="w-full rounded-xl bg-slate-900 text-white py-2.5 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
                        >
                          Add Member
                        </button>
                      </div>

                      {/* Members list */}
                      <div className="rounded-2xl border border-black/8 bg-white overflow-hidden">
                        <div className="p-3 border-b border-black/5">
                          <input
                            type="search"
                            placeholder="Search members…"
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            aria-label="Search members in this year"
                            className={`${inputCls} text-xs`}
                          />
                        </div>
                        <div
                          className="overflow-y-auto max-h-[500px]"
                          role="list"
                          aria-label="Committee members"
                        >
                          {filteredMembers.length === 0 && (
                            <div className="p-6 text-center text-sm text-slate-400">
                              {members.length === 0
                                ? "No members yet."
                                : "No members match your search."}
                            </div>
                          )}
                          {filteredMembers.map((m) => (
                            <MemberRow
                              key={m._id}
                              m={m}
                              onDelete={onDeleteMember}
                              onUpdate={onUpdateMember}
                            />
                          ))}
                        </div>
                        {members.length > 0 && (
                          <div className="px-4 py-2 border-t border-black/5 text-xs text-slate-400">
                            {filteredMembers.length} of {members.length} members
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Year settings */}
                {activeTab === "settings" && year && (
                  <YearSettingsTab
                    year={year}
                    token={token}
                    onSave={async (updates) => {
                      try {
                        await axios.put(
                          `${API_BASE_URL}/api/committees/years/${year._id}`,
                          updates,
                          { headers: authHeaders(token) },
                        );
                        await loadYears();
                        await loadYear(selectedYearId);
                        showToast("Year settings saved.");
                      } catch (e) {
                        showToast(
                          e?.response?.data?.message || e.message,
                          "error",
                        );
                      }
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ─── Year settings tab ─────────────────────────────────────── */
function YearSettingsTab({ year, onSave }) {
  const [form, setForm] = useState({
    label: year.label,
    startYear: year.startYear,
    endYear: year.endYear,
    title: year.title,
    description: year.description,
    coverImageUrl: year.coverImageUrl || "",
    isActive: year.isActive,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...form,
      startYear: Number(form.startYear),
      endYear: Number(form.endYear),
    });
    setSaving(false);
  };

  return (
    <div className="p-5 space-y-4 max-w-lg">
      <h3 className="font-semibold text-slate-900">Year Settings</h3>

      <Field label="Label" id="ys-label" required>
        <input
          id="ys-label"
          className={inputCls}
          value={form.label}
          onChange={(e) => setForm((s) => ({ ...s, label: e.target.value }))}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Start Year" id="ys-start" required>
          <input
            id="ys-start"
            type="number"
            className={inputCls}
            value={form.startYear}
            onChange={(e) =>
              setForm((s) => ({ ...s, startYear: e.target.value }))
            }
          />
        </Field>
        <Field label="End Year" id="ys-end" required>
          <input
            id="ys-end"
            type="number"
            className={inputCls}
            value={form.endYear}
            onChange={(e) =>
              setForm((s) => ({ ...s, endYear: e.target.value }))
            }
          />
        </Field>
      </div>

      <Field label="Display Title" id="ys-title">
        <input
          id="ys-title"
          className={inputCls}
          value={form.title}
          onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
        />
      </Field>

      <Field label="Description" id="ys-desc">
        <textarea
          id="ys-desc"
          className={`${inputCls} min-h-[90px] resize-y`}
          value={form.description}
          onChange={(e) =>
            setForm((s) => ({ ...s, description: e.target.value }))
          }
        />
      </Field>

      <Field label="Cover Image URL" id="ys-cover">
        <input
          id="ys-cover"
          className={inputCls}
          placeholder="https://..."
          value={form.coverImageUrl}
          onChange={(e) =>
            setForm((s) => ({ ...s, coverImageUrl: e.target.value }))
          }
        />
      </Field>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) =>
            setForm((s) => ({ ...s, isActive: e.target.checked }))
          }
          className="rounded"
        />
        <span className="text-sm text-slate-700">
          Active year (shown by default on public page)
        </span>
      </label>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}
