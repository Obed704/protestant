import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaEnvelope,
  FaPhone,
  FaUsers,
  FaMusic,
  FaCrown,
  FaClock,
  FaImage,
  FaHistory,
  FaTimes,
  FaSpinner,
  FaRandom,
  FaPrint,
  FaChevronRight,
  FaBars,
} from "react-icons/fa";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/choirs`;
const BG_IMAGE =
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000";

// Reusable glass committee card
function CommitteeCard({ member }) {
  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 hover:bg-white/10 transition">
      <div className="flex items-start gap-3">
        <img
          src={
            member.imageUrl || "https://via.placeholder.com/80x80?text=Member"
          }
          alt={member.name}
          className="h-16 w-16 rounded-xl object-cover border border-white/20"
        />
        <div className="flex-1">
          <h4 className="text-base font-bold text-white">{member.name}</h4>
          <p className="text-sm text-emerald-300 font-semibold">
            {member.role}
          </p>
          {member.bio && (
            <p className="mt-1 text-xs text-white/70">{member.bio}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {member.instagram && (
              <a
                href={member.instagram}
                target="_blank"
                rel="noreferrer"
                className="text-pink-300 hover:text-pink-200"
              >
                <FaInstagram />
              </a>
            )}
            {member.facebook && (
              <a
                href={member.facebook}
                target="_blank"
                rel="noreferrer"
                className="text-blue-300 hover:text-blue-200"
              >
                <FaFacebook />
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="text-white/60 hover:text-white"
              >
                <FaEnvelope />
              </a>
            )}
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                className="text-green-300 hover:text-green-200"
              >
                <FaPhone />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Apply Modal (glass styled)
function ApplyModal({
  choir,
  form,
  setForm,
  onClose,
  onSubmit,
  applyLoading,
  applyError,
  applySuccess,
}) {
  if (!choir) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/20 p-5">
          <div>
            <h3 className="text-2xl font-bold text-white">Apply to Join</h3>
            <p className="text-white/60">{choir.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-5">
          {applySuccess && (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200 text-sm">
              {applySuccess}
            </div>
          )}
          {applyError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">
              {applyError}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.fullName}
              onChange={(e) =>
                setForm((p) => ({ ...p, fullName: e.target.value }))
              }
              placeholder="Full name *"
              className="rounded-xl bg-white/10 border border-white/20 p-3 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <input
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="Phone"
              className="rounded-xl bg-white/10 border border-white/20 p-3 text-white placeholder-white/40"
            />
            <input
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="Email"
              className="rounded-xl bg-white/10 border border-white/20 p-3 text-white placeholder-white/40 md:col-span-2"
            />
            <textarea
              value={form.message}
              onChange={(e) =>
                setForm((p) => ({ ...p, message: e.target.value }))
              }
              placeholder="Why do you want to join?"
              className="rounded-xl bg-white/10 border border-white/20 p-3 text-white placeholder-white/40 md:col-span-2 min-h-[100px]"
            />
          </div>
          {choir.applicationNote && (
            <p className="mt-4 text-sm text-white/50">
              {choir.applicationNote}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl bg-white/10 px-5 py-2 font-semibold text-white hover:bg-white/20"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={applyLoading}
              className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-white hover:bg-emerald-600"
            >
              {applyLoading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChoirsPage() {
  const [choirs, setChoirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [selectedChoir, setSelectedChoir] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [applyChoir, setApplyChoir] = useState(null);
  const [applyForm, setApplyForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");

  // Fetch choirs
  useEffect(() => {
    const fetchChoirs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINT);
        setChoirs(Array.isArray(res.data) ? res.data : []);
        if (res.data.length) setSelectedChoir(res.data[0]);
        setPageError("");
      } catch (err) {
        console.error(err);
        setPageError("Failed to load choirs.");
      } finally {
        setLoading(false);
      }
    };
    fetchChoirs();
  }, []);

  // Randomize order
  const shuffleChoirs = useCallback(() => {
    setChoirs((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setSelectedChoir(choirs[0]);
  }, [choirs]);

  // Select random choir
  const selectRandomChoir = useCallback(() => {
    if (choirs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * choirs.length);
    setSelectedChoir(choirs[randomIndex]);
  }, [choirs]);

  const openApply = useCallback((choir) => {
    setApplyChoir(choir);
    setApplyForm({ fullName: "", email: "", phone: "", message: "" });
    setApplyError("");
    setApplySuccess("");
  }, []);

  const closeApply = useCallback(() => {
    setApplyChoir(null);
  }, []);

  const submitApply = useCallback(async () => {
    if (!applyChoir?._id) return;
    const payload = {
      fullName: applyForm.fullName.trim(),
      email: applyForm.email.trim(),
      phone: applyForm.phone.trim(),
      message: applyForm.message.trim(),
    };
    if (!payload.fullName) {
      setApplyError("Full name is required.");
      return;
    }
    if (!payload.email && !payload.phone) {
      setApplyError("Provide at least email or phone.");
      return;
    }
    try {
      setApplyLoading(true);
      setApplyError("");
      setApplySuccess("");
      const res = await axios.post(
        `${API_ENDPOINT}/${applyChoir._id}/apply`,
        payload,
      );
      setApplySuccess(
        res?.data?.message || "Application submitted successfully.",
      );
      setApplyForm({ fullName: "", email: "", phone: "", message: "" });
    } catch (err) {
      setApplyError(
        err?.response?.data?.error || "Failed to submit application.",
      );
    } finally {
      setApplyLoading(false);
    }
  }, [applyChoir, applyForm]);

  // Print function (hide sidebar, adjust background)
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${selectedChoir?.name || "Choir"} - Details`;
    window.print();
    document.title = originalTitle;
  };

  // Add print styles dynamically
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        .no-print { display: none !important; }
        body { background: white; color: black; }
        .print-card { background: white !important; color: black !important; border: 1px solid #ccc !important; box-shadow: none !important; }
        .print-card * { color: black !important; }
        .print-card img { opacity: 1; }
        .bg-white\\/10, .backdrop-blur-*, .bg-gradient-to-br { background: white !important; backdrop-filter: none !important; }
        .border-white\\/20 { border-color: #ccc !important; }
        .text-white, .text-white\\/80, .text-white\\/70, .text-white\\/60 { color: black !important; }
        .text-emerald-300, .text-emerald-400 { color: #059669 !important; }
        button, a { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const totalMembers = useMemo(
    () => choirs.reduce((sum, c) => sum + (c?.members?.length || 0), 0),
    [choirs],
  );
  const totalSongs = useMemo(
    () => choirs.reduce((sum, c) => sum + (c?.songs?.length || 0), 0),
    [choirs],
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950" />
          <div className="relative bg-white/10 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/20">
            <FaSpinner className="animate-spin text-emerald-400 text-xl mx-auto mb-2" />
            <p className="text-xs text-white">Loading choirs...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (pageError) {
    return (
      <>
        <Header />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950" />
          <div className="relative bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20 text-center">
            <p className="text-red-300">{pageError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-emerald-500/30 px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="relative min-h-screen">
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <img
            src={BG_IMAGE}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 via-transparent to-emerald-900/30" />
          <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-emerald-500/20 rounded-full blur-[130px] animate-pulse" />
          <div
            className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-cyan-600/20 rounded-full blur-[130px] animate-pulse"
            style={{ animationDelay: "1.5s" }}
          />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 lg:py-8">
          {/* Header stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">
                {choirs.length}
              </div>
              <div className="text-xs text-white/60">Choirs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">
                {totalMembers}
              </div>
              <div className="text-xs text-white/60">Members</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">{totalSongs}</div>
              <div className="text-xs text-white/60">Songs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">
                {choirs.filter((c) => c.acceptsApplications).length}
              </div>
              <div className="text-xs text-white/60">Open for Applications</div>
            </div>
          </div>

          {/* Sidebar + Main */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar (choir list) */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden bg-white/10 backdrop-blur-md rounded-xl p-2 flex items-center gap-2 text-white text-sm"
                >
                  <FaBars /> Choirs ({choirs.length})
                </button>
                <div className="hidden lg:flex gap-2">
                  <button
                    onClick={shuffleChoirs}
                    className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 text-white"
                  >
                    <FaRandom size={12} /> Shuffle
                  </button>
                  <button
                    onClick={selectRandomChoir}
                    className="bg-emerald-500/30 hover:bg-emerald-500/40 px-3 py-1.5 rounded-lg text-xs text-white"
                  >
                    Random Pick
                  </button>
                </div>
              </div>
              <div
                className={`${sidebarOpen ? "block" : "hidden lg:block"} bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-3`}
              >
                <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-1.5">
                  <FaMusic size={12} /> All Choirs
                </h3>
                <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1 custom-scroll">
                  {choirs.map((choir) => (
                    <button
                      key={choir._id}
                      onClick={() => {
                        setSelectedChoir(choir);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        selectedChoir?._id === choir._id
                          ? "bg-white/20 text-white"
                          : "text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {choir.name}
                    </button>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 flex justify-between">
                  <button
                    onClick={shuffleChoirs}
                    className="text-white/60 text-xs flex items-center gap-1"
                  >
                    <FaRandom size={10} /> Shuffle
                  </button>
                  <button
                    onClick={selectRandomChoir}
                    className="text-emerald-300 text-xs"
                  >
                    Random
                  </button>
                </div>
              </div>
            </div>

            {/* Main content: selected choir detail */}
            <div className="flex-1 print-card">
              {selectedChoir ? (
                <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 overflow-hidden">
                  {/* Cover image */}
                  {selectedChoir.coverImage && (
                    <img
                      src={selectedChoir.coverImage}
                      alt={selectedChoir.name}
                      className="w-full h-56 object-cover"
                    />
                  )}
                  <div className="p-5 md:p-6 space-y-5">
                    {/* Title & actions */}
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">
                          {selectedChoir.name}
                        </h2>
                        {selectedChoir.description && (
                          <p className="text-white/70 mt-1">
                            {selectedChoir.description}
                          </p>
                        )}
                        {selectedChoir.verse && (
                          <p className="mt-3 text-sm italic text-emerald-200 bg-white/5 rounded-lg p-3 border-l-4 border-emerald-400">
                            {selectedChoir.verse}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 no-print">
                        <button
                          onClick={handlePrint}
                          className="bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white"
                        >
                          <FaPrint />
                        </button>
                        <div className="flex gap-1">
                          {selectedChoir.socials?.youtube && (
                            <a
                              href={selectedChoir.socials.youtube}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-red-500/20 p-2 rounded-xl text-red-300"
                            >
                              <FaYoutube />
                            </a>
                          )}
                          {selectedChoir.socials?.instagram && (
                            <a
                              href={selectedChoir.socials.instagram}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-pink-500/20 p-2 rounded-xl text-pink-300"
                            >
                              <FaInstagram />
                            </a>
                          )}
                          {selectedChoir.socials?.facebook && (
                            <a
                              href={selectedChoir.socials.facebook}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-blue-500/20 p-2 rounded-xl text-blue-300"
                            >
                              <FaFacebook />
                            </a>
                          )}
                          {selectedChoir.socials?.email && (
                            <a
                              href={`mailto:${selectedChoir.socials.email}`}
                              className="bg-white/10 p-2 rounded-xl text-white/70"
                            >
                              <FaEnvelope />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Leadership & rehearsals */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-emerald-300 mb-2">
                          <FaCrown />{" "}
                          <span className="font-semibold">Leadership</span>
                        </div>
                        <p>
                          <strong className="text-white/80">President:</strong>{" "}
                          <span className="text-white/60">
                            {selectedChoir.president || "—"}
                          </span>
                        </p>
                        <p>
                          <strong className="text-white/80">
                            Vice President:
                          </strong>{" "}
                          <span className="text-white/60">
                            {selectedChoir.vicePresident || "—"}
                          </span>
                        </p>
                        {selectedChoir.foundedYear && (
                          <p>
                            <strong className="text-white/80">Founded:</strong>{" "}
                            <span className="text-white/60">
                              {selectedChoir.foundedYear}
                            </span>
                          </p>
                        )}
                        {selectedChoir.motto && (
                          <p>
                            <strong className="text-white/80">Motto:</strong>{" "}
                            <span className="text-white/60">
                              {selectedChoir.motto}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-emerald-300 mb-2">
                          <FaClock />{" "}
                          <span className="font-semibold">Rehearsals</span>
                        </div>
                        {selectedChoir.rehearsals?.length ? (
                          selectedChoir.rehearsals.map((r, i) => (
                            <div key={i} className="mb-2 text-sm text-white/70">
                              <strong>{r.day}</strong> — {r.time}
                              <br />
                              {r.venue}
                              {r.note && (
                                <div className="text-xs text-white/40">
                                  {r.note}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-white/50">No schedule</p>
                        )}
                      </div>
                    </div>

                    {/* About, Mission, Vision */}
                    {selectedChoir.about && (
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-2">
                          About
                        </h3>
                        <p className="text-white/70 leading-relaxed">
                          {selectedChoir.about}
                        </p>
                      </div>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                      {selectedChoir.mission && (
                        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                          <h3 className="font-bold text-blue-200">Mission</h3>
                          <p className="text-white/70">
                            {selectedChoir.mission}
                          </p>
                        </div>
                      )}
                      {selectedChoir.vision && (
                        <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                          <h3 className="font-bold text-emerald-200">Vision</h3>
                          <p className="text-white/70">
                            {selectedChoir.vision}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Committee */}
                    {selectedChoir.committee?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                          <FaUsers /> Committee
                        </h3>
                        <div className="grid gap-3 md:grid-cols-2">
                          {selectedChoir.committee.map((member, i) => (
                            <CommitteeCard key={i} member={member} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Members */}
                    {selectedChoir.members?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                          <FaUsers /> Members
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedChoir.members.map((m, i) => (
                            <span
                              key={i}
                              className="bg-white/10 rounded-full px-3 py-1 text-sm text-white/80"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Songs */}
                    {selectedChoir.songs?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                          <FaMusic /> Songs
                        </h3>
                        <div className="space-y-2">
                          {selectedChoir.songs.map((song, i) => (
                            <div
                              key={i}
                              className="bg-white/5 rounded-xl p-3 flex flex-wrap justify-between items-center gap-2"
                            >
                              <div>
                                <span className="font-semibold text-white">
                                  {song.title}
                                </span>{" "}
                                {song.artist && (
                                  <span className="text-white/50 text-sm">
                                    — {song.artist}
                                  </span>
                                )}
                              </div>
                              {song.youtubeLink && (
                                <a
                                  href={song.youtubeLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-red-500/30 px-3 py-1 rounded-lg text-sm"
                                >
                                  Watch
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gallery */}
                    {selectedChoir.gallery?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                          <FaImage /> Gallery
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedChoir.gallery.map((item, i) => (
                            <div
                              key={i}
                              className="bg-white/5 rounded-xl overflow-hidden"
                            >
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title || "Gallery"}
                                  className="w-full h-32 object-cover"
                                />
                              )}
                              {item.title && (
                                <div className="p-2 text-xs text-white/70">
                                  {item.title}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Achievements, History, FAQs (simplified) */}
                    {selectedChoir.achievements?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">
                          Achievements
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-white/70">
                          {selectedChoir.achievements.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedChoir.previousYears?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                          <FaHistory /> History
                        </h3>
                        <div className="space-y-4">
                          {selectedChoir.previousYears.map((year, i) => (
                            <div
                              key={i}
                              className="bg-white/5 rounded-xl p-4 border border-white/10"
                            >
                              <h4 className="font-bold text-emerald-200">
                                {year.yearLabel}
                              </h4>
                              {year.theme && (
                                <p className="text-sm text-white/60 italic">
                                  {year.theme}
                                </p>
                              )}
                              {year.summary && (
                                <p className="text-sm text-white/70 mt-1">
                                  {year.summary}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Apply button */}
                    {selectedChoir.acceptsApplications && (
                      <div className="bg-emerald-500/20 rounded-xl p-4 text-center border border-emerald-500/30">
                        <p className="text-white/90 mb-2">
                          Interested in joining this choir?
                        </p>
                        <button
                          onClick={() => openApply(selectedChoir)}
                          className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-emerald-600"
                        >
                          Apply to Join
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-8 text-center text-white/70">
                  Select a choir from the sidebar
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Button (Random) */}
        <button
          onClick={selectRandomChoir}
          className="fixed bottom-6 right-6 z-30 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 no-print"
          title="Random Choir"
        >
          <FaRandom size={24} />
        </button>
      </div>

      <ApplyModal
        choir={applyChoir}
        form={applyForm}
        setForm={setApplyForm}
        onClose={closeApply}
        onSubmit={submitApply}
        applyLoading={applyLoading}
        applyError={applyError}
        applySuccess={applySuccess}
      />

      <Footer />
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
      `}</style>
    </>
  );
}
