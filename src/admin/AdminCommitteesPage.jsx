import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext.jsx";
import Header from "../components/header.jsx";
import Footer from "../components/footer.jsx";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  token,
  "x-access-token": token,
});

export default function AdminCommitteesPage() {
  const { user, token, authLoading } = useContext(AuthContext);

  const [years, setYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  const [newYear, setNewYear] = useState({
    label: "",
    startYear: "",
    endYear: "",
    title: "Church Committee",
    description: "",
    coverImageUrl: "",
    isActive: false,
  });

  const [newMember, setNewMember] = useState({
    role: "representative",
    gender: "na",
    name: "",
    imageUrl: "",
    narration: "",
  });

  const selectedYear = useMemo(() => years.find((y) => y._id === selectedYearId), [years, selectedYearId]);

  const loadYears = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/api/committees/years`);
    setYears(data);
    if (!selectedYearId && data?.[0]?._id) setSelectedYearId(data[0]._id);
  };

  const loadYear = async (id) => {
    if (!id) return;
    const { data } = await axios.get(`${API_BASE_URL}/api/committees/years/${id}`);
    setPayload(data);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await loadYears();
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!selectedYearId) return;
    loadYear(selectedYearId);
    // eslint-disable-next-line
  }, [selectedYearId]);

  const onCreateYear = async () => {
    if (!token) return alert("Login first.");
    try {
      const body = {
        ...newYear,
        startYear: Number(newYear.startYear),
        endYear: Number(newYear.endYear),
      };
      await axios.post(`${API_BASE_URL}/api/committees/years`, body, { headers: authHeaders(token) });
      setNewYear({
        label: "",
        startYear: "",
        endYear: "",
        title: "Church Committee",
        description: "",
        coverImageUrl: "",
        isActive: false,
      });
      await loadYears();
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  const onDeleteYear = async (id) => {
    if (!confirm("Delete this committee year and all members?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/committees/years/${id}`, { headers: authHeaders(token) });
      setSelectedYearId("");
      setPayload(null);
      await loadYears();
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  const onAddMember = async () => {
    if (!selectedYearId) return alert("Select a year first.");
    try {
      await axios.post(
        `${API_BASE_URL}/api/committees/years/${selectedYearId}/members`,
        newMember,
        { headers: authHeaders(token) }
      );
      setNewMember({ role: "representative", gender: "na", name: "", imageUrl: "", narration: "" });
      await loadYear(selectedYearId);
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  const onDeleteMember = async (memberId) => {
    if (!confirm("Delete this member?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/committees/members/${memberId}`, { headers: authHeaders(token) });
      await loadYear(selectedYearId);
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  const onQuickEditMember = async (m) => {
    const name = prompt("Update name:", m.name);
    if (name === null) return;

    const narration = prompt("Update narration:", m.narration || "");
    if (narration === null) return;

    try {
      await axios.put(
        `${API_BASE_URL}/api/committees/members/${m._id}`,
        { name, narration },
        { headers: authHeaders(token) }
      );
      await loadYear(selectedYearId);
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  if (authLoading) return null;

  if (!isAdmin) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="rounded-3xl border border-black/10 bg-white p-6">
            Admins only.
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const members = payload?.members || [];

  return (
    <>
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Committee Admin</h1>
            <p className="text-slate-600">Create years and manage ranked committee members.</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Years list */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-black/10 bg-white p-5">
              <div className="font-semibold text-slate-900">Committee Years</div>

              <div className="mt-4 space-y-2">
                {years.map((y) => (
                  <button
                    key={y._id}
                    onClick={() => setSelectedYearId(y._id)}
                    className={[
                      "w-full text-left rounded-2xl px-4 py-3 border transition",
                      selectedYearId === y._id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-black/10 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="font-semibold">{y.label}</div>
                    <div className={selectedYearId === y._id ? "text-white/80 text-sm" : "text-slate-600 text-sm"}>
                      {y.title || "Church Committee"}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-black/10">
                <div className="font-semibold text-slate-900">Add New Year</div>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <input
                    className="rounded-2xl border border-black/10 px-4 py-3"
                    placeholder="Label (e.g. 2024-2025)"
                    value={newYear.label}
                    onChange={(e) => setNewYear((s) => ({ ...s, label: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="rounded-2xl border border-black/10 px-4 py-3"
                      placeholder="Start (e.g. 2024)"
                      value={newYear.startYear}
                      onChange={(e) => setNewYear((s) => ({ ...s, startYear: e.target.value }))}
                    />
                    <input
                      className="rounded-2xl border border-black/10 px-4 py-3"
                      placeholder="End (e.g. 2025)"
                      value={newYear.endYear}
                      onChange={(e) => setNewYear((s) => ({ ...s, endYear: e.target.value }))}
                    />
                  </div>

                  <textarea
                    className="rounded-2xl border border-black/10 px-4 py-3 min-h-[90px]"
                    placeholder="Description"
                    value={newYear.description}
                    onChange={(e) => setNewYear((s) => ({ ...s, description: e.target.value }))}
                  />

                  <button
                    onClick={onCreateYear}
                    className="rounded-2xl bg-slate-900 text-white px-4 py-3 font-semibold hover:bg-slate-800"
                  >
                    Create Year
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Year details + members */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-black/10 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-600">Selected Year</div>
                  <div className="text-xl font-extrabold text-slate-900">
                    {selectedYear?.label || "—"}
                  </div>
                </div>

                {selectedYearId ? (
                  <button
                    onClick={() => onDeleteYear(selectedYearId)}
                    className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 font-semibold hover:bg-red-100"
                  >
                    Delete Year
                  </button>
                ) : null}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-3xl border border-black/10 bg-slate-50 p-4">
                  <div className="font-semibold text-slate-900">Add Member</div>

                  <div className="mt-3 grid gap-2">
                    <select
                      className="rounded-2xl border border-black/10 px-4 py-3"
                      value={newMember.role}
                      onChange={(e) => {
                        const role = e.target.value;
                        setNewMember((s) => ({
                          ...s,
                          role,
                          gender: role === "advisor" || role === "intercessor" ? "boy" : "na",
                        }));
                      }}
                    >
                      <option value="representative">Representative</option>
                      <option value="vice_representative">Vice Representative</option>
                      <option value="advisor">Advisor</option>
                      <option value="intercessor">Intercessor</option>
                      <option value="secretary">Secretary</option>
                      <option value="treasurer">Treasurer</option>
                      <option value="accountant">Accountant</option>
                      <option value="grand_pere">Grand Père</option>
                    </select>

                    {(newMember.role === "advisor" || newMember.role === "intercessor") && (
                      <select
                        className="rounded-2xl border border-black/10 px-4 py-3"
                        value={newMember.gender}
                        onChange={(e) => setNewMember((s) => ({ ...s, gender: e.target.value }))}
                      >
                        <option value="boy">Boy</option>
                        <option value="girl">Girl</option>
                      </select>
                    )}

                    <input
                      className="rounded-2xl border border-black/10 px-4 py-3"
                      placeholder="Name"
                      value={newMember.name}
                      onChange={(e) => setNewMember((s) => ({ ...s, name: e.target.value }))}
                    />
                    <input
                      className="rounded-2xl border border-black/10 px-4 py-3"
                      placeholder="Image URL"
                      value={newMember.imageUrl}
                      onChange={(e) => setNewMember((s) => ({ ...s, imageUrl: e.target.value }))}
                    />
                    <textarea
                      className="rounded-2xl border border-black/10 px-4 py-3 min-h-[90px]"
                      placeholder="Narration"
                      value={newMember.narration}
                      onChange={(e) => setNewMember((s) => ({ ...s, narration: e.target.value }))}
                    />

                    <button
                      onClick={onAddMember}
                      className="rounded-2xl bg-slate-900 text-white px-4 py-3 font-semibold hover:bg-slate-800"
                    >
                      Add Member
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-black/10 bg-white p-4">
                  <div className="font-semibold text-slate-900">Members (Ranked)</div>

                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-600">
                          <th className="py-2 pr-3">Order</th>
                          <th className="py-2 pr-3">Role</th>
                          <th className="py-2 pr-3">Name</th>
                          <th className="py-2 pr-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((m) => (
                          <tr key={m._id} className="border-t border-black/5">
                            <td className="py-2 pr-3 font-semibold">{m.order}</td>
                            <td className="py-2 pr-3">{m.role}{m.gender !== "na" ? ` (${m.gender})` : ""}</td>
                            <td className="py-2 pr-3">{m.name}</td>
                            <td className="py-2 pr-3 flex gap-2">
                              <button
                                onClick={() => onQuickEditMember(m)}
                                className="rounded-xl border border-black/10 px-3 py-1 hover:bg-slate-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => onDeleteMember(m._id)}
                                className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-1 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!members.length && (
                          <tr>
                            <td className="py-4 text-slate-600" colSpan={4}>
                              No members yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

              {loading && <div className="mt-6 text-slate-600">Loading...</div>}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}