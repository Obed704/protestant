import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Header from "../components/header.jsx";
import Footer from "../components/Footer.jsx";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || "";

/* ─── Role metadata ─────────────────────────────────────────── */
const ROLE_META = {
  representative: { label: "Representative", icon: "👑", tier: "leadership" },
  vice_representative: {
    label: "Vice Representative",
    icon: "⭐",
    tier: "leadership",
  },
  advisor: { label: "Advisor", icon: "🎓", tier: "advisory" },
  intercessor: { label: "Intercessor", icon: "🙏", tier: "advisory" },
  secretary: { label: "Secretary", icon: "📋", tier: "executive" },
  treasurer: { label: "Treasurer", icon: "💼", tier: "executive" },
  accountant: { label: "Accountant", icon: "📊", tier: "executive" },
  grand_pere: { label: "Grand Père", icon: "🏛️", tier: "honorary" },
};

const TIER_COLORS = {
  leadership: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  advisory: {
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
  },
  executive: {
    bg: "bg-teal-50",
    text: "text-teal-800",
    border: "border-teal-200",
    dot: "bg-teal-500",
  },
  honorary: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

const roleLabel = (m) => {
  const base = ROLE_META[m.role]?.label ?? "Member";
  if (m.role === "advisor" || m.role === "intercessor") {
    return `${base} (${m.gender === "boy" ? "Boy" : "Girl"})`;
  }
  return base;
};

/* ─── Utility components ────────────────────────────────────── */
const Avatar = ({ member, size = "md" }) => {
  const [imgErr, setImgErr] = useState(false);
  const dim =
    size === "lg"
      ? "w-24 h-24 text-2xl"
      : size === "sm"
        ? "w-10 h-10 text-sm"
        : "w-16 h-16 text-base";
  const initials = member.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (member.imageUrl && !imgErr) {
    return (
      <img
        src={member.imageUrl}
        alt={member.name}
        onError={() => setImgErr(true)}
        className={`${dim} rounded-2xl object-cover border border-black/10 flex-shrink-0`}
        loading="lazy"
      />
    );
  }
  const tier = ROLE_META[member.role]?.tier ?? "executive";
  const { bg, text } = TIER_COLORS[tier];
  return (
    <div
      className={`${dim} ${bg} ${text} rounded-2xl flex items-center justify-center font-bold flex-shrink-0 border border-black/8`}
    >
      {initials}
    </div>
  );
};

const RoleBadge = ({ member }) => {
  const tier = ROLE_META[member.role]?.tier ?? "executive";
  const { bg, text, border } = TIER_COLORS[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${bg} ${text} ${border}`}
    >
      <span aria-hidden="true">{ROLE_META[member.role]?.icon}</span>
      {roleLabel(member)}
    </span>
  );
};

const TierDot = ({ tier }) => {
  const { dot } = TIER_COLORS[tier] ?? TIER_COLORS.executive;
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${dot} flex-shrink-0`}
    />
  );
};

/* ─── Member card ───────────────────────────────────────────── */
const MemberCard = ({ member, isHero = false }) => {
  const [expanded, setExpanded] = useState(false);
  const narrationRef = useRef(null);
  const maxLines = expanded ? "none" : "3";
  const tier = ROLE_META[member.role]?.tier ?? "executive";
  const { border } = TIER_COLORS[tier];

  return (
    <article
      aria-label={`${member.name}, ${roleLabel(member)}`}
      className={[
        "group relative rounded-3xl bg-white overflow-hidden",
        "border border-black/8 shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        isHero ? `border-l-4 ${border}` : "",
      ].join(" ")}
    >
      <div className="p-5 flex gap-4 items-start">
        <Avatar member={member} size={isHero ? "lg" : "md"} />

        <div className="min-w-0 flex-1">
          <RoleBadge member={member} />

          <h3 className="mt-2 font-semibold text-slate-900 text-base leading-snug">
            {member.name}
          </h3>

          {member.narration ? (
            <div className="mt-2 relative">
              <p
                ref={narrationRef}
                style={{
                  WebkitLineClamp: expanded ? "unset" : 3,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
                className="text-sm text-slate-600 leading-relaxed"
              >
                {member.narration}
              </p>
              {member.narration.length > 120 && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  aria-expanded={expanded}
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400 italic">
              No bio available.
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

/* ─── Stats bar ─────────────────────────────────────────────── */
const StatsBar = ({ members }) => {
  const counts = useMemo(() => {
    const byTier = { leadership: 0, advisory: 0, executive: 0, honorary: 0 };
    members.forEach((m) => {
      const t = ROLE_META[m.role]?.tier ?? "executive";
      byTier[t]++;
    });
    return byTier;
  }, [members]);

  const stats = [
    { label: "Total Members", value: members.length },
    { label: "Leadership", value: counts.leadership, tier: "leadership" },
    { label: "Advisory", value: counts.advisory, tier: "advisory" },
    { label: "Executive", value: counts.executive, tier: "executive" },
  ];

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      role="list"
      aria-label="Committee statistics"
    >
      {stats.map((s) => (
        <div
          key={s.label}
          role="listitem"
          className="rounded-2xl border border-black/8 bg-white p-4 flex flex-col gap-1"
        >
          <div className="flex items-center gap-1.5">
            {s.tier && <TierDot tier={s.tier} />}
            <span className="text-xs text-slate-500">{s.label}</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">{s.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Tier section ──────────────────────────────────────────── */
const TierSection = ({ title, members, tier }) => {
  if (!members.length) return null;
  const { dot } = TIER_COLORS[tier];

  return (
    <section aria-labelledby={`tier-${tier}`} className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-3 h-3 rounded-full ${dot}`} aria-hidden="true" />
        <h2
          id={`tier-${tier}`}
          className="text-sm font-semibold text-slate-700 uppercase tracking-wider"
        >
          {title}
        </h2>
        <span className="text-xs text-slate-400 ml-1">({members.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <MemberCard key={m._id} member={m} isHero={tier === "leadership"} />
        ))}
      </div>
    </section>
  );
};

/* ─── Curved divider ────────────────────────────────────────── */
const CurvedDivider = ({ flip = false, tone = "light" }) => (
  <div className={flip ? "rotate-180" : ""} aria-hidden="true">
    <svg viewBox="0 0 1440 120" className="w-full h-[70px] md:h-[90px]">
      <path
        fill="currentColor"
        className={tone === "light" ? "text-white" : "text-slate-950"}
        d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,53.3C1120,53,1280,75,1360,85.3L1440,96L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
      />
    </svg>
  </div>
);

/* ─── Main page ─────────────────────────────────────────────── */
export default function CommitteePage() {
  const [years, setYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [payload, setPayload] = useState(null);
  const [loadingYears, setLoadingYears] = useState(true);
  const [fetchingYear, setFetchingYear] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTierFilter, setActiveTierFilter] = useState("all");
  const [viewMode, setViewMode] = useState("tiered"); // "tiered" | "grid" | "list"
  const requestIdRef = useRef(0);

  const selectedYear = useMemo(
    () => years.find((y) => y._id === selectedYearId),
    [years, selectedYearId],
  );

  /* load years */
  useEffect(() => {
    (async () => {
      try {
        setErrorText("");
        setLoadingYears(true);
        const { data } = await axios.get(
          `${API_BASE_URL}/api/committees/years`,
        );
        setYears(data);
        const active = data.find((y) => y.isActive) || data?.[0];
        setSelectedYearId(active?._id || "");
      } catch (err) {
        setErrorText(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load committee years",
        );
      } finally {
        setLoadingYears(false);
      }
    })();
  }, []);

  /* load selected year */
  useEffect(() => {
    if (!selectedYearId) return;
    const rid = ++requestIdRef.current;
    (async () => {
      try {
        setErrorText("");
        setFetchingYear(true);
        const { data } = await axios.get(
          `${API_BASE_URL}/api/committees/years/${selectedYearId}`,
        );
        if (rid !== requestIdRef.current) return;
        setPayload(data);
        setSearchQuery("");
        setActiveTierFilter("all");
      } catch (err) {
        if (rid !== requestIdRef.current) return;
        setErrorText(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load committee year",
        );
      } finally {
        if (rid === requestIdRef.current) setFetchingYear(false);
      }
    })();
  }, [selectedYearId]);

  const members = payload?.members || [];
  const year = payload?.year;
  const initialLoading = loadingYears && !payload;

  /* filtered members */
  const filteredMembers = useMemo(() => {
    let list = members;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          roleLabel(m).toLowerCase().includes(q) ||
          (m.narration || "").toLowerCase().includes(q),
      );
    }
    if (activeTierFilter !== "all") {
      list = list.filter(
        (m) => (ROLE_META[m.role]?.tier ?? "executive") === activeTierFilter,
      );
    }
    return list;
  }, [members, searchQuery, activeTierFilter]);

  /* grouped by tier */
  const grouped = useMemo(() => {
    const g = { leadership: [], advisory: [], executive: [], honorary: [] };
    filteredMembers.forEach((m) => {
      const t = ROLE_META[m.role]?.tier ?? "executive";
      g[t].push(m);
    });
    return g;
  }, [filteredMembers]);

  const tierFilters = [
    { key: "all", label: "All" },
    { key: "leadership", label: "Leadership" },
    { key: "advisory", label: "Advisory" },
    { key: "executive", label: "Executive" },
    { key: "honorary", label: "Honorary" },
  ];

  return (
    <>
      <Header />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        aria-label="Committee header"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-0 w-96 h-96 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-4 md:pt-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Church Leadership
              </div>
              <h1 className="mt-4 text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                Committee Members
              </h1>
              <p className="mt-2 text-white/60 max-w-2xl text-sm md:text-base">
                Meet the dedicated servants leading our church community — past
                and present.
              </p>
              {fetchingYear && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                  Updating…
                  <span className="inline-block w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                </div>
              )}
            </div>

            {/* Year selector */}
            <div className="w-full md:w-[260px]">
              <label
                htmlFor="year-select"
                className="text-xs text-white/60 block mb-2"
              >
                Select Year
              </label>
              <select
                id="year-select"
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-white/20"
                aria-label="Select committee year"
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

          {/* Year info card */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-sm text-white/60">
                  {year?.title || "Church Committee"}
                </div>
                <div className="text-xl md:text-2xl font-bold text-white">
                  {year?.label || selectedYear?.label || "—"}
                  {year?.isActive && (
                    <span className="ml-3 text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30 px-2.5 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                {year?.description && (
                  <p className="mt-1.5 text-sm text-white/60 max-w-2xl">
                    {year.description}
                  </p>
                )}
              </div>

              {/* Quick stats */}
              {members.length > 0 && (
                <div className="flex gap-4 shrink-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {members.length}
                    </div>
                    <div className="text-xs text-white/50">Members</div>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {new Set(members.map((m) => m.role)).size}
                    </div>
                    <div className="text-xs text-white/50">Roles</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {errorText && (
            <div
              className="mt-4 rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-red-100"
              role="alert"
            >
              <div className="font-semibold text-sm">
                Could not load committee
              </div>
              <div className="text-sm opacity-90 mt-0.5">{errorText}</div>
            </div>
          )}
        </div>

        <CurvedDivider tone="light" />
      </section>

      {/* ── Content ── */}
      <section className="bg-white" aria-label="Committee members">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {initialLoading && (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-3xl bg-slate-100" />
              ))}
            </div>
          )}

          {!initialLoading && members.length > 0 && (
            <>
              {/* Stats */}
              <StatsBar members={members} />

              {/* Controls */}
              <div
                className="flex flex-col sm:flex-row gap-3 mb-6"
                role="search"
              >
                {/* Search */}
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search members by name or role…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search committee members"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-black/10 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Tier filter */}
                <div
                  className="flex gap-1.5 flex-wrap"
                  role="group"
                  aria-label="Filter by tier"
                >
                  {tierFilters.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setActiveTierFilter(f.key)}
                      aria-pressed={activeTierFilter === f.key}
                      className={[
                        "px-3.5 py-2 rounded-xl text-sm font-medium border transition",
                        activeTierFilter === f.key
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-black/10 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* View mode */}
                <div
                  className="flex gap-1 border border-black/10 rounded-xl p-1 bg-white"
                  role="group"
                  aria-label="View mode"
                >
                  {[
                    { key: "tiered", icon: "⊞", label: "Tiered view" },
                    { key: "grid", icon: "▦", label: "Grid view" },
                    { key: "list", icon: "☰", label: "List view" },
                  ].map((v) => (
                    <button
                      key={v.key}
                      onClick={() => setViewMode(v.key)}
                      aria-label={v.label}
                      aria-pressed={viewMode === v.key}
                      title={v.label}
                      className={[
                        "px-3 py-1.5 rounded-lg text-sm transition",
                        viewMode === v.key
                          ? "bg-slate-900 text-white"
                          : "text-slate-500 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {v.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search results feedback */}
              {searchQuery && (
                <p className="mb-4 text-sm text-slate-500" aria-live="polite">
                  {filteredMembers.length === 0
                    ? `No members match "${searchQuery}".`
                    : `Showing ${filteredMembers.length} of ${members.length} members.`}
                </p>
              )}

              {/* ── Tiered view ── */}
              {viewMode === "tiered" && (
                <>
                  <TierSection
                    title="Leadership"
                    members={grouped.leadership}
                    tier="leadership"
                  />
                  <TierSection
                    title="Advisory"
                    members={grouped.advisory}
                    tier="advisory"
                  />
                  <TierSection
                    title="Executive"
                    members={grouped.executive}
                    tier="executive"
                  />
                  <TierSection
                    title="Honorary"
                    members={grouped.honorary}
                    tier="honorary"
                  />
                </>
              )}

              {/* ── Grid view ── */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMembers.map((m) => (
                    <MemberCard key={m._id} member={m} />
                  ))}
                </div>
              )}

              {/* ── List view ── */}
              {viewMode === "list" && (
                <div
                  className="rounded-3xl border border-black/8 overflow-hidden bg-white"
                  role="list"
                >
                  {filteredMembers.map((m, i) => {
                    const tier = ROLE_META[m.role]?.tier ?? "executive";
                    const { dot } = TIER_COLORS[tier];
                    return (
                      <div
                        key={m._id}
                        role="listitem"
                        className={`flex items-center gap-4 px-5 py-4 ${i !== 0 ? "border-t border-black/5" : ""} hover:bg-slate-50 transition`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`}
                          aria-hidden="true"
                        />
                        <Avatar member={m} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-sm truncate">
                            {m.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {roleLabel(m)}
                          </div>
                        </div>
                        {m.narration && (
                          <p className="hidden md:block text-sm text-slate-500 truncate max-w-xs">
                            {m.narration}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No results */}
              {filteredMembers.length === 0 && !searchQuery && (
                <div className="rounded-3xl border border-black/8 bg-white p-8 text-center text-slate-500">
                  No members found for the selected filter.
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {!initialLoading && year && members.length === 0 && !errorText && (
            <div className="rounded-3xl border border-black/8 bg-white p-8 text-center text-slate-500">
              <div className="text-4xl mb-3" aria-hidden="true">
                🏛️
              </div>
              <div className="font-semibold text-slate-700">No members yet</div>
              <p className="mt-1 text-sm">
                Committee members for {year.label} haven't been added yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom curve */}
      <section className="bg-white" aria-hidden="true">
        <CurvedDivider flip tone="dark" />
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 h-10" />
      </section>

      <Footer />
    </>
  );
}
