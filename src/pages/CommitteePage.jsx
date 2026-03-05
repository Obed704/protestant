import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Header from "../components/header.jsx";
import Footer from "../components/footer.jsx";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || "";

const ROLE_LABEL = (m) => {
  if (m.role === "representative") return "Representative";
  if (m.role === "vice_representative") return "Vice Representative";
  if (m.role === "advisor")
    return `Advisor (${m.gender === "boy" ? "Boy" : "Girl"})`;
  if (m.role === "intercessor")
    return `Intercessor (${m.gender === "boy" ? "Boy" : "Girl"})`;
  if (m.role === "secretary") return "Secretary";
  if (m.role === "treasurer") return "Treasurer";
  if (m.role === "accountant") return "Accountant";
  if (m.role === "grand_pere") return "Grand Père";
  return "Member";
};

const CurvedDivider = ({ flip = false, tone = "light" }) => (
  <div className={flip ? "rotate-180" : ""} aria-hidden="true">
    <svg viewBox="0 0 1440 120" className="w-full h-[70px] md:h-[90px]">
      <path
        fill="currentColor"
        className={tone === "light" ? "text-white/90" : "text-slate-950"}
        d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,53.3C1120,53,1280,75,1360,85.3L1440,96L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
      />
    </svg>
  </div>
);

const MemberCard = ({ m, highlight = false }) => (
  <div
    className={[
      "group relative overflow-hidden rounded-3xl border border-black/10 bg-white",
      "p-4 md:p-5 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.35)]",
      "transition hover:-translate-y-[1px] hover:shadow-[0_25px_70px_-35px_rgba(0,0,0,0.45)]",
      highlight ? "md:col-span-2" : "",
    ].join(" ")}
  >
    {/* soft hover glow */}
    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-slate-900/5 blur-2xl" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-indigo-500/10 blur-2xl" />
    </div>

    <div className="relative flex gap-4 items-start">
      <div className="shrink-0">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border border-black/10 bg-slate-50">
          {m.imageUrl ? (
            <img
              src={m.imageUrl}
              alt={m.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-slate-400 text-xs">
              No Image
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-xs md:text-sm text-slate-500">
          {ROLE_LABEL(m)}
        </div>

        <div className="text-base md:text-lg font-semibold text-slate-900 truncate">
          {m.name}
        </div>

        {m.narration ? (
          <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3">
            {m.narration}
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-400">No narration yet.</p>
        )}
      </div>
    </div>
  </div>
);

export default function CommitteePage() {
  const [years, setYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [payload, setPayload] = useState(null);

  const [loadingYears, setLoadingYears] = useState(true);
  const [fetchingYear, setFetchingYear] = useState(false);
  const [errorText, setErrorText] = useState("");

  const requestIdRef = useRef(0);

  const selectedYear = useMemo(
    () => years.find((y) => y._id === selectedYearId),
    [years, selectedYearId]
  );

  useEffect(() => {
    const loadYears = async () => {
      try {
        setErrorText("");
        setLoadingYears(true);

        const { data } = await axios.get(`${API_BASE_URL}/api/committees/years`);
        setYears(data);

        const active = data.find((y) => y.isActive) || data?.[0];
        setSelectedYearId(active?._id || "");
      } catch (err) {
        console.log("LOAD YEARS ERROR:", err?.response?.status, err?.response?.data || err.message);
        setErrorText(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load committee years"
        );
      } finally {
        setLoadingYears(false);
      }
    };

    loadYears();
  }, []);

  useEffect(() => {
    if (!selectedYearId) return;

    const loadYear = async () => {
      const rid = ++requestIdRef.current;

      try {
        setErrorText("");
        setFetchingYear(true);

        const { data } = await axios.get(
          `${API_BASE_URL}/api/committees/years/${selectedYearId}`
        );

        if (rid !== requestIdRef.current) return;

        console.log("Loaded year:", data?.year?.label, "members:", data?.members?.length);
        setPayload(data);
      } catch (err) {
        if (rid !== requestIdRef.current) return;

        console.log("LOAD YEAR ERROR:", err?.response?.status, err?.response?.data || err.message);
        setErrorText(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load committee year"
        );
      } finally {
        if (rid === requestIdRef.current) setFetchingYear(false);
      }
    };

    loadYear();
  }, [selectedYearId]);

  const members = payload?.members || [];
  const year = payload?.year;
  const initialLoading = loadingYears && !payload;

  const rep = members.find((m) => m.role === "representative");
  const vice = members.find((m) => m.role === "vice_representative");
  const rest = members.filter((m) => m._id !== rep?._id && m._id !== vice?._id);

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-6 md:pt-14 md:pb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Church Leadership
              </div>

              <h1 className="mt-4 text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                Committee Members
              </h1>

              <p className="mt-2 text-white/70 max-w-2xl">
                View the committee for the current and previous years, ranked by leadership roles.
              </p>

              {fetchingYear && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                  Updating…
                  <span className="inline-block w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                </div>
              )}
            </div>

            <div className="w-full md:w-[260px]">
              <label className="text-xs text-white/60">Select Year</label>
              <select
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-white/20"
              >
                {years.map((y) => (
                  <option key={y._id} value={y._id} className="bg-slate-950">
                    {y.label}
                    {y.isActive ? " (Active)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 md:p-6">
            <div className="text-sm text-white/70">{year?.title || "Church Committee"}</div>
            <div className="text-xl md:text-2xl font-bold text-white">
              {year?.label || selectedYear?.label || ""}
            </div>
            {year?.description ? (
              <p className="mt-2 text-white/70">{year.description}</p>
            ) : (
              <p className="mt-2 text-white/50">No description for this committee year yet.</p>
            )}
          </div>

          {errorText ? (
            <div className="mt-4 rounded-2xl border border-red-200/30 bg-red-500/10 px-4 py-3 text-red-100">
              <div className="font-semibold">Could not load committee</div>
              <div className="text-sm opacity-90">{errorText}</div>
            </div>
          ) : null}
        </div>

        <CurvedDivider tone="light" />
      </section>

      {/* Content */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {initialLoading && (
            <div className="rounded-3xl border border-black/10 bg-white p-6 text-slate-700">
              Loading committee...
            </div>
          )}

          {!initialLoading && members.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {rep ? <MemberCard m={rep} highlight /> : null}
                {vice ? <MemberCard m={vice} highlight /> : null}
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((m) => (
                  <MemberCard key={m._id} m={m} />
                ))}
              </div>
            </>
          )}

          {!initialLoading && year && !members.length && !errorText && (
            <div className="rounded-3xl border border-black/10 bg-white p-6 text-slate-700">
              No committee members yet for this year.
            </div>
          )}
        </div>
      </section>

      {/* Bottom Curve */}
      <section className="bg-white">
        <CurvedDivider flip tone="dark" />
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 h-10" />
      </section>

      <Footer />
    </>
  );
}