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
} from "react-icons/fa";
import Header from "../components/header";
import Footer from "../components/footer";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/choirs`;

function CommitteeCard({ member }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-lg transition">
      <div className="flex items-start gap-4">
        <img
          src={member.imageUrl || "https://via.placeholder.com/120x120?text=Member"}
          alt={member.name}
          className="h-20 w-20 rounded-2xl object-cover border"
        />
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
          <p className="text-sm text-yellow-600 font-semibold">{member.role}</p>
          {member.bio && <p className="mt-2 text-sm text-gray-600">{member.bio}</p>}

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {member.instagram && (
              <a href={member.instagram} target="_blank" rel="noreferrer" className="text-pink-600">
                <FaInstagram />
              </a>
            )}
            {member.facebook && (
              <a href={member.facebook} target="_blank" rel="noreferrer" className="text-blue-600">
                <FaFacebook />
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`} className="text-gray-700">
                <FaEnvelope />
              </a>
            )}
            {member.phone && (
              <a href={`tel:${member.phone}`} className="text-green-600">
                <FaPhone />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Apply to Join</h3>
            <p className="text-gray-500">{choir.name}</p>
          </div>
          <button onClick={onClose} className="rounded-xl bg-gray-100 p-3">
            <FaTimes />
          </button>
        </div>

        <div className="p-5">
          {applySuccess && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
              {applySuccess}
            </div>
          )}
          {applyError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {applyError}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Full name *"
              className="rounded-xl border p-3"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Phone"
              className="rounded-xl border p-3"
            />
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="Email"
              className="rounded-xl border p-3 md:col-span-2"
            />
            <textarea
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Why do you want to join?"
              className="rounded-xl border p-3 md:col-span-2 min-h-[120px]"
            />
          </div>

          {choir.applicationNote && (
            <p className="mt-4 text-sm text-gray-500">{choir.applicationNote}</p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl bg-gray-100 px-5 py-3 font-semibold text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={applyLoading}
              className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-gray-900"
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

  useEffect(() => {
    const fetchChoirs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINT);
        setChoirs(Array.isArray(res.data) ? res.data : []);
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

  const totalMembers = useMemo(
    () => choirs.reduce((sum, choir) => sum + (choir?.members?.length || 0), 0),
    [choirs]
  );

  const totalSongs = useMemo(
    () => choirs.reduce((sum, choir) => sum + (choir?.songs?.length || 0), 0),
    [choirs]
  );

  const openApply = useCallback((choir) => {
    setApplyChoir(choir);
    setApplyForm({ fullName: "", email: "", phone: "", message: "" });
    setApplyError("");
    setApplySuccess("");
  }, []);

  const closeApply = useCallback(() => {
    setApplyChoir(null);
    setApplyError("");
    setApplySuccess("");
  }, []);

  const submitApply = useCallback(async () => {
    if (!applyChoir?._id) return;

    const payload = {
      fullName: String(applyForm.fullName || "").trim(),
      email: String(applyForm.email || "").trim(),
      phone: String(applyForm.phone || "").trim(),
      message: String(applyForm.message || "").trim(),
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

      const res = await axios.post(`${API_ENDPOINT}/${applyChoir._id}/apply`, payload);

      setApplySuccess(res?.data?.message || "Application submitted successfully.");
      setApplyForm({ fullName: "", email: "", phone: "", message: "" });
    } catch (err) {
      setApplyError(err?.response?.data?.error || "Failed to submit application.");
    } finally {
      setApplyLoading(false);
    }
  }, [applyChoir, applyForm]);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <section className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-16">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-5xl font-extrabold text-gray-900">Our Choirs</h1>
            <p className="mt-4 text-lg text-white/95">
              Discover leadership, members, songs, history, and how to join each choir.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow">
                <p className="text-sm text-gray-500">Choirs</p>
                <p className="text-3xl font-bold text-gray-900">{choirs.length}</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow">
                <p className="text-sm text-gray-500">Members</p>
                <p className="text-3xl font-bold text-gray-900">{totalMembers}</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow">
                <p className="text-sm text-gray-500">Songs</p>
                <p className="text-3xl font-bold text-gray-900">{totalSongs}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          {loading ? (
            <div className="flex justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-yellow-500" />
            </div>
          ) : pageError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              {pageError}
            </div>
          ) : (
            <div className="space-y-10">
              {choirs.map((choir) => (
                <div
                  key={choir._id}
                  className="overflow-hidden rounded-3xl border bg-white shadow-xl"
                >
                  {choir.coverImage && (
                    <img
                      src={choir.coverImage}
                      alt={choir.name}
                      className="h-64 w-full object-cover"
                    />
                  )}

                  <div className="p-6 md:p-8">
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">{choir.name}</h2>
                        <p className="mt-2 text-gray-600">{choir.description}</p>
                        {choir.verse && (
                          <p className="mt-3 rounded-xl bg-yellow-50 px-4 py-3 text-sm italic text-gray-700 border-l-4 border-yellow-400">
                            {choir.verse}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {choir?.socials?.youtube && (
                          <a
                            href={choir.socials.youtube}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-red-50 p-3 text-red-600"
                          >
                            <FaYoutube />
                          </a>
                        )}
                        {choir?.socials?.instagram && (
                          <a
                            href={choir.socials.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-pink-50 p-3 text-pink-600"
                          >
                            <FaInstagram />
                          </a>
                        )}
                        {choir?.socials?.facebook && (
                          <a
                            href={choir.socials.facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-blue-50 p-3 text-blue-600"
                          >
                            <FaFacebook />
                          </a>
                        )}
                        {choir?.socials?.email && (
                          <a
                            href={`mailto:${choir.socials.email}`}
                            className="rounded-xl bg-gray-100 p-3 text-gray-700"
                          >
                            <FaEnvelope />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl bg-gray-50 p-5 border">
                            <div className="mb-2 flex items-center gap-2 text-yellow-600">
                              <FaCrown />
                              <span className="font-semibold">Leadership</span>
                            </div>
                            <p><strong>President:</strong> {choir.president || "—"}</p>
                            <p><strong>Vice President:</strong> {choir.vicePresident || "—"}</p>
                            {choir.foundedYear && <p><strong>Founded:</strong> {choir.foundedYear}</p>}
                            {choir.motto && <p><strong>Motto:</strong> {choir.motto}</p>}
                          </div>

                          <div className="rounded-2xl bg-gray-50 p-5 border">
                            <div className="mb-2 flex items-center gap-2 text-blue-600">
                              <FaClock />
                              <span className="font-semibold">Rehearsals</span>
                            </div>
                            {Array.isArray(choir.rehearsals) && choir.rehearsals.length ? (
                              <div className="space-y-2 text-sm text-gray-700">
                                {choir.rehearsals.map((r, i) => (
                                  <div key={i} className="rounded-xl bg-white p-3 border">
                                    <p><strong>{r.day}</strong> — {r.time}</p>
                                    <p>{r.venue}</p>
                                    {r.note && <p className="text-gray-500">{r.note}</p>}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500">No rehearsal schedule available.</p>
                            )}
                          </div>
                        </div>

                        {choir.about && (
                          <div className="rounded-2xl border bg-white p-5">
                            <h3 className="mb-3 text-xl font-bold text-gray-900">About the Choir</h3>
                            <p className="leading-7 text-gray-700">{choir.about}</p>
                          </div>
                        )}

                        {(choir.mission || choir.vision) && (
                          <div className="grid gap-4 md:grid-cols-2">
                            {choir.mission && (
                              <div className="rounded-2xl border bg-blue-50 p-5">
                                <h3 className="mb-2 font-bold text-blue-800">Mission</h3>
                                <p className="text-gray-700">{choir.mission}</p>
                              </div>
                            )}
                            {choir.vision && (
                              <div className="rounded-2xl border bg-yellow-50 p-5">
                                <h3 className="mb-2 font-bold text-yellow-700">Vision</h3>
                                <p className="text-gray-700">{choir.vision}</p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="rounded-2xl border bg-white p-5">
                          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                            <FaUsers className="text-blue-600" />
                            Current Committee
                          </h3>
                          {Array.isArray(choir.committee) && choir.committee.length ? (
                            <div className="grid gap-4 md:grid-cols-2">
                              {choir.committee.map((member, i) => (
                                <CommitteeCard key={i} member={member} />
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No committee listed yet.</p>
                          )}
                        </div>

                        <div className="rounded-2xl border bg-white p-5">
                          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                            <FaUsers className="text-green-600" />
                            All Choir Members
                          </h3>
                          {Array.isArray(choir.members) && choir.members.length ? (
                            <div className="flex flex-wrap gap-2">
                              {choir.members.map((member, i) => (
                                <span
                                  key={i}
                                  className="rounded-full border bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                                >
                                  {member}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No members listed.</p>
                          )}
                        </div>

                        <div className="rounded-2xl border bg-white p-5">
                          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                            <FaMusic className="text-yellow-500" />
                            Songs
                          </h3>
                          {Array.isArray(choir.songs) && choir.songs.length ? (
                            <div className="grid gap-3">
                              {choir.songs.map((song, i) => (
                                <div
                                  key={i}
                                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-gray-50 p-4"
                                >
                                  <div>
                                    <p className="font-semibold text-gray-900">{song.title}</p>
                                    <p className="text-sm text-gray-500">
                                      {[song.artist, song.duration].filter(Boolean).join(" • ")}
                                    </p>
                                  </div>
                                  {song.youtubeLink && (
                                    <a
                                      href={song.youtubeLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="rounded-xl bg-red-500 px-4 py-2 text-white"
                                    >
                                      Watch
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No songs available.</p>
                          )}
                        </div>

                        {Array.isArray(choir.achievements) && choir.achievements.length > 0 && (
                          <div className="rounded-2xl border bg-white p-5">
                            <h3 className="mb-4 text-xl font-bold text-gray-900">Achievements</h3>
                            <ul className="space-y-2 text-gray-700">
                              {choir.achievements.map((item, i) => (
                                <li key={i} className="rounded-xl bg-gray-50 p-3 border">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {Array.isArray(choir.previousYears) && choir.previousYears.length > 0 && (
                          <div className="rounded-2xl border bg-white p-5">
                            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                              <FaHistory className="text-purple-600" />
                              Previous Years
                            </h3>

                            <div className="space-y-5">
                              {choir.previousYears.map((year, i) => (
                                <div key={i} className="rounded-2xl border bg-gray-50 p-5">
                                  <h4 className="text-lg font-bold text-gray-900">{year.yearLabel}</h4>
                                  {year.theme && <p className="text-sm text-purple-700 mt-1">{year.theme}</p>}
                                  {year.verse && (
                                    <p className="mt-2 text-sm italic text-gray-600">{year.verse}</p>
                                  )}
                                  {year.summary && (
                                    <p className="mt-3 text-gray-700">{year.summary}</p>
                                  )}

                                  {Array.isArray(year.committee) && year.committee.length > 0 && (
                                    <div className="mt-4">
                                      <h5 className="font-semibold text-gray-800 mb-3">
                                        Committee
                                      </h5>
                                      <div className="grid gap-4 md:grid-cols-2">
                                        {year.committee.map((member, idx) => (
                                          <CommitteeCard key={idx} member={member} />
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {Array.isArray(year.members) && year.members.length > 0 && (
                                    <div className="mt-4">
                                      <h5 className="font-semibold text-gray-800 mb-2">Members</h5>
                                      <div className="flex flex-wrap gap-2">
                                        {year.members.map((m, idx) => (
                                          <span
                                            key={idx}
                                            className="rounded-full border bg-white px-3 py-1.5 text-sm"
                                          >
                                            {m}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {Array.isArray(year.achievements) && year.achievements.length > 0 && (
                                    <div className="mt-4">
                                      <h5 className="font-semibold text-gray-800 mb-2">
                                        Achievements
                                      </h5>
                                      <ul className="space-y-2">
                                        {year.achievements.map((a, idx) => (
                                          <li key={idx} className="rounded-xl bg-white p-3 border">
                                            {a}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {Array.isArray(year.content) && year.content.length > 0 && (
                                    <div className="mt-4">
                                      <h5 className="font-semibold text-gray-800 mb-2">Contents</h5>
                                      <div className="space-y-3">
                                        {year.content.map((c, idx) => (
                                          <div key={idx} className="rounded-xl bg-white p-4 border">
                                            <p className="font-semibold text-gray-900">{c.title}</p>
                                            <p className="text-gray-600 mt-1">{c.body}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {Array.isArray(choir.faqs) && choir.faqs.length > 0 && (
                          <div className="rounded-2xl border bg-white p-5">
                            <h3 className="mb-4 text-xl font-bold text-gray-900">FAQs</h3>
                            <div className="space-y-3">
                              {choir.faqs.map((item, i) => (
                                <div key={i} className="rounded-2xl border bg-gray-50 p-4">
                                  <p className="font-semibold text-gray-900">{item.question}</p>
                                  <p className="mt-1 text-gray-600">{item.answer}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        {choir.heroImage && (
                          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                            <img
                              src={choir.heroImage}
                              alt={choir.name}
                              className="h-72 w-full object-cover"
                            />
                          </div>
                        )}

                        {Array.isArray(choir.gallery) && choir.gallery.length > 0 && (
                          <div className="rounded-2xl border bg-white p-5">
                            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                              <FaImage className="text-pink-600" />
                              Gallery
                            </h3>
                            <div className="grid gap-3">
                              {choir.gallery.map((item, i) => (
                                <div key={i} className="overflow-hidden rounded-2xl border">
                                  {item.imageUrl && (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title || `Gallery ${i + 1}`}
                                      className="h-40 w-full object-cover"
                                    />
                                  )}
                                  {item.title && (
                                    <div className="p-3 text-sm font-medium text-gray-700">
                                      {item.title}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {choir.acceptsApplications && (
                          <div className="rounded-2xl border bg-yellow-50 p-5">
                            <h3 className="text-xl font-bold text-gray-900">Want to Join?</h3>
                            <p className="mt-2 text-gray-600">
                              Submit your application and the choir leaders will contact you.
                            </p>
                            <button
                              onClick={() => openApply(choir)}
                              className="mt-4 w-full rounded-xl bg-yellow-500 px-4 py-3 font-semibold text-gray-900"
                            >
                              Apply to Join
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

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
    </>
  );
}