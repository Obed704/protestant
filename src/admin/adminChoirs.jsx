import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/choirs`;

const emptyCommitteeMember = {
  name: "",
  role: "",
  imageUrl: "",
  instagram: "",
  facebook: "",
  email: "",
  phone: "",
  bio: "",
};

const emptySong = {
  title: "",
  youtubeLink: "",
  artist: "",
  duration: "",
};

const emptyRehearsal = {
  day: "",
  time: "",
  venue: "",
  note: "",
};

const emptyGalleryItem = {
  title: "",
  imageUrl: "",
};

const emptyFaq = {
  question: "",
  answer: "",
};

const emptyPreviousYear = {
  yearLabel: "",
  theme: "",
  verse: "",
  summary: "",
  achievementsText: "",
  membersText: "",
  committee: [{ ...emptyCommitteeMember }],
  contentText: "",
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  about: "",
  mission: "",
  vision: "",
  heroImage: "",
  coverImage: "",
  verse: "",
  motto: "",
  foundedYear: "",
  president: "",
  vicePresident: "",
  membersText: "",
  achievementsText: "",
  applicationNote: "",
  acceptsApplications: true,
  isFeatured: false,
  status: "active",
  sortOrder: 0,
  socials: {
    youtube: "",
    instagram: "",
    facebook: "",
    email: "",
    phone: "",
    website: "",
  },
  committee: [{ ...emptyCommitteeMember }],
  songs: [{ ...emptySong }],
  rehearsals: [{ ...emptyRehearsal }],
  gallery: [{ ...emptyGalleryItem }],
  faqs: [{ ...emptyFaq }],
  previousYears: [{ ...emptyPreviousYear }],
};

const parseCommaOrLineList = (text) =>
  String(text || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const parsePreviousYearContent = (text) =>
  String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, body] = line.split("|").map((x) => x.trim());
      return { title: title || "Untitled", body: body || "" };
    });

export default function AdminChoirsPage() {
  const [choirs, setChoirs] = useState([]);
  const [editingChoir, setEditingChoir] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchChoirs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINT);
      setChoirs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching choirs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChoirs();
  }, []);

  const stats = useMemo(() => {
    return {
      totalChoirs: choirs.length,
      totalMembers: choirs.reduce((acc, c) => acc + (c?.members?.length || 0), 0),
      totalCommittee: choirs.reduce((acc, c) => acc + (c?.committee?.length || 0), 0),
    };
  }, [choirs]);

  const resetForm = () => {
    setEditingChoir(null);
    setActiveTab("basic");
    setForm(emptyForm);
  };

  const handleBasicChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("socials.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        socials: { ...prev.socials, [key]: value },
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayObjectChange = (section, index, field, value) => {
    setForm((prev) => {
      const copy = [...prev[section]];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, [section]: copy };
    });
  };

  const addArrayObjectItem = (section, template) => {
    setForm((prev) => ({
      ...prev,
      [section]: [...prev[section], { ...template }],
    }));
  };

  const removeArrayObjectItem = (section, index) => {
    setForm((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const handlePreviousYearChange = (yearIndex, field, value) => {
    setForm((prev) => {
      const copy = [...prev.previousYears];
      copy[yearIndex] = { ...copy[yearIndex], [field]: value };
      return { ...prev, previousYears: copy };
    });
  };

  const handlePreviousYearCommitteeChange = (yearIndex, memberIndex, field, value) => {
    setForm((prev) => {
      const years = [...prev.previousYears];
      const committee = [...years[yearIndex].committee];
      committee[memberIndex] = { ...committee[memberIndex], [field]: value };
      years[yearIndex] = { ...years[yearIndex], committee };
      return { ...prev, previousYears: years };
    });
  };

  const addPreviousYear = () => {
    setForm((prev) => ({
      ...prev,
      previousYears: [...prev.previousYears, { ...emptyPreviousYear }],
    }));
  };

  const removePreviousYear = (yearIndex) => {
    setForm((prev) => ({
      ...prev,
      previousYears: prev.previousYears.filter((_, i) => i !== yearIndex),
    }));
  };

  const addPreviousYearCommitteeMember = (yearIndex) => {
    setForm((prev) => {
      const years = [...prev.previousYears];
      years[yearIndex].committee = [...years[yearIndex].committee, { ...emptyCommitteeMember }];
      return { ...prev, previousYears: years };
    });
  };

  const removePreviousYearCommitteeMember = (yearIndex, memberIndex) => {
    setForm((prev) => {
      const years = [...prev.previousYears];
      years[yearIndex].committee = years[yearIndex].committee.filter((_, i) => i !== memberIndex);
      return { ...prev, previousYears: years };
    });
  };

  const buildPayload = () => {
    return {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      shortDescription: form.shortDescription.trim(),
      about: form.about.trim(),
      mission: form.mission.trim(),
      vision: form.vision.trim(),
      heroImage: form.heroImage.trim(),
      coverImage: form.coverImage.trim(),
      verse: form.verse.trim(),
      motto: form.motto.trim(),
      foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
      president: form.president.trim(),
      vicePresident: form.vicePresident.trim(),
      members: parseCommaOrLineList(form.membersText),
      achievements: parseCommaOrLineList(form.achievementsText),
      applicationNote: form.applicationNote.trim(),
      acceptsApplications: !!form.acceptsApplications,
      isFeatured: !!form.isFeatured,
      status: form.status,
      sortOrder: Number(form.sortOrder || 0),
      socials: form.socials,
      committee: form.committee
        .map((item) => ({
          ...item,
          name: item.name.trim(),
          role: item.role.trim(),
          imageUrl: item.imageUrl.trim(),
          instagram: item.instagram.trim(),
          facebook: item.facebook.trim(),
          email: item.email.trim(),
          phone: item.phone.trim(),
          bio: item.bio.trim(),
        }))
        .filter((item) => item.name),
      songs: form.songs
        .map((item) => ({
          title: item.title.trim(),
          youtubeLink: item.youtubeLink.trim(),
          artist: item.artist.trim(),
          duration: item.duration.trim(),
        }))
        .filter((item) => item.title),
      rehearsals: form.rehearsals
        .map((item) => ({
          day: item.day.trim(),
          time: item.time.trim(),
          venue: item.venue.trim(),
          note: item.note.trim(),
        }))
        .filter((item) => item.day || item.time || item.venue),
      gallery: form.gallery
        .map((item) => ({
          title: item.title.trim(),
          imageUrl: item.imageUrl.trim(),
        }))
        .filter((item) => item.title || item.imageUrl),
      faqs: form.faqs
        .map((item) => ({
          question: item.question.trim(),
          answer: item.answer.trim(),
        }))
        .filter((item) => item.question || item.answer),
      previousYears: form.previousYears
        .map((year) => ({
          yearLabel: year.yearLabel.trim(),
          theme: year.theme.trim(),
          verse: year.verse.trim(),
          summary: year.summary.trim(),
          achievements: parseCommaOrLineList(year.achievementsText),
          members: parseCommaOrLineList(year.membersText),
          committee: year.committee
            .map((m) => ({
              ...m,
              name: m.name.trim(),
              role: m.role.trim(),
              imageUrl: m.imageUrl.trim(),
              instagram: m.instagram.trim(),
              facebook: m.facebook.trim(),
              email: m.email.trim(),
              phone: m.phone.trim(),
              bio: m.bio.trim(),
            }))
            .filter((m) => m.name),
          content: parsePreviousYearContent(year.contentText),
        }))
        .filter((year) => year.yearLabel),
    };
  };

  const handleEdit = (choir) => {
    setEditingChoir(choir);
    setActiveTab("basic");
    setForm({
      name: choir.name || "",
      slug: choir.slug || "",
      description: choir.description || "",
      shortDescription: choir.shortDescription || "",
      about: choir.about || "",
      mission: choir.mission || "",
      vision: choir.vision || "",
      heroImage: choir.heroImage || "",
      coverImage: choir.coverImage || "",
      verse: choir.verse || "",
      motto: choir.motto || "",
      foundedYear: choir.foundedYear || "",
      president: choir.president || "",
      vicePresident: choir.vicePresident || "",
      membersText: Array.isArray(choir.members) ? choir.members.join("\n") : "",
      achievementsText: Array.isArray(choir.achievements) ? choir.achievements.join("\n") : "",
      applicationNote: choir.applicationNote || "",
      acceptsApplications: !!choir.acceptsApplications,
      isFeatured: !!choir.isFeatured,
      status: choir.status || "active",
      sortOrder: choir.sortOrder || 0,
      socials: choir.socials || {
        youtube: "",
        instagram: "",
        facebook: "",
        email: "",
        phone: "",
        website: "",
      },
      committee:
        Array.isArray(choir.committee) && choir.committee.length
          ? choir.committee
          : [{ ...emptyCommitteeMember }],
      songs:
        Array.isArray(choir.songs) && choir.songs.length
          ? choir.songs
          : [{ ...emptySong }],
      rehearsals:
        Array.isArray(choir.rehearsals) && choir.rehearsals.length
          ? choir.rehearsals
          : [{ ...emptyRehearsal }],
      gallery:
        Array.isArray(choir.gallery) && choir.gallery.length
          ? choir.gallery
          : [{ ...emptyGalleryItem }],
      faqs:
        Array.isArray(choir.faqs) && choir.faqs.length
          ? choir.faqs
          : [{ ...emptyFaq }],
      previousYears:
        Array.isArray(choir.previousYears) && choir.previousYears.length
          ? choir.previousYears.map((year) => ({
              yearLabel: year.yearLabel || "",
              theme: year.theme || "",
              verse: year.verse || "",
              summary: year.summary || "",
              achievementsText: Array.isArray(year.achievements) ? year.achievements.join("\n") : "",
              membersText: Array.isArray(year.members) ? year.members.join("\n") : "",
              committee:
                Array.isArray(year.committee) && year.committee.length
                  ? year.committee
                  : [{ ...emptyCommitteeMember }],
              contentText: Array.isArray(year.content)
                ? year.content.map((c) => `${c.title || ""} | ${c.body || ""}`).join("\n")
                : "",
            }))
          : [{ ...emptyPreviousYear }],
    });
  };

  const handleUpdate = async () => {
    if (!editingChoir?._id) return;

    try {
      setSaving(true);
      await axios.put(`${API_ENDPOINT}/${editingChoir._id}`, buildPayload());
      await fetchChoirs();
      resetForm();
    } catch (err) {
      console.error("Error updating choir:", err);
      alert(err?.response?.data?.error || "Failed to update choir");
    } finally {
      setSaving(false);
    }
  };

  const tabs = ["basic", "committee", "members", "songs", "socials", "extras", "history"];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/admin"
            className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow"
          >
            ← Dashboard
          </Link>

          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800">
            Choirs Admin Panel
          </h1>

          <button
            onClick={fetchChoirs}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 text-sm">Total Choirs</p>
            <p className="text-3xl font-bold text-blue-700">{stats.totalChoirs}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 text-sm">Total Choir Members</p>
            <p className="text-3xl font-bold text-green-700">{stats.totalMembers}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 text-sm">Total Committee Members</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.totalCommittee}</p>
          </div>
        </div>

        {editingChoir && (
          <div className="mb-10 rounded-3xl bg-white p-6 shadow-xl border border-gray-200">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-blue-700">
                  Editing: {editingChoir.name}
                </h2>
                <p className="text-sm text-gray-500">Update choir details and structure</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Update Choir"}
                </button>
                <button
                  onClick={resetForm}
                  className="rounded-xl bg-gray-500 px-5 py-2.5 text-white font-semibold hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2 border-b pb-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-4 py-2 font-medium transition ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "basic" && (
              <div className="grid gap-5 md:grid-cols-2">
                {[
                  ["name", "Choir Name"],
                  ["slug", "Slug"],
                  ["description", "Description"],
                  ["shortDescription", "Short Description"],
                  ["president", "President"],
                  ["vicePresident", "Vice President"],
                  ["verse", "Verse"],
                  ["motto", "Motto"],
                  ["heroImage", "Hero Image URL"],
                  ["coverImage", "Cover Image URL"],
                  ["foundedYear", "Founded Year"],
                  ["sortOrder", "Sort Order"],
                ].map(([name, label]) => (
                  <label key={name} className="block">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    {["description", "shortDescription"].includes(name) ? (
                      <textarea
                        name={name}
                        value={form[name]}
                        onChange={handleBasicChange}
                        className="mt-1 w-full rounded-xl border p-3"
                      />
                    ) : (
                      <input
                        type={name === "foundedYear" || name === "sortOrder" ? "number" : "text"}
                        name={name}
                        value={form[name]}
                        onChange={handleBasicChange}
                        className="mt-1 w-full rounded-xl border p-3"
                      />
                    )}
                  </label>
                ))}

                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">About</span>
                  <textarea
                    name="about"
                    value={form.about}
                    onChange={handleBasicChange}
                    className="mt-1 w-full rounded-xl border p-3 min-h-[120px]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Mission</span>
                  <textarea
                    name="mission"
                    value={form.mission}
                    onChange={handleBasicChange}
                    className="mt-1 w-full rounded-xl border p-3"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Vision</span>
                  <textarea
                    name="vision"
                    value={form.vision}
                    onChange={handleBasicChange}
                    className="mt-1 w-full rounded-xl border p-3"
                  />
                </label>

                <div className="flex flex-wrap gap-6 md:col-span-2">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="acceptsApplications"
                      checked={form.acceptsApplications}
                      onChange={handleBasicChange}
                    />
                    <span>Accept Applications</span>
                  </label>

                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={form.isFeatured}
                      onChange={handleBasicChange}
                    />
                    <span>Featured</span>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 mr-2">Status</span>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleBasicChange}
                      className="rounded-xl border p-2"
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </label>
                </div>

                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Application Note</span>
                  <textarea
                    name="applicationNote"
                    value={form.applicationNote}
                    onChange={handleBasicChange}
                    className="mt-1 w-full rounded-xl border p-3"
                  />
                </label>
              </div>
            )}

            {activeTab === "committee" && (
              <div className="space-y-6">
                {form.committee.map((member, index) => (
                  <div key={index} className="rounded-2xl border p-4 bg-gray-50">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold text-lg text-blue-700">Committee Member #{index + 1}</h3>
                      <button
                        onClick={() => removeArrayObjectItem("committee", index)}
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-white"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {["name", "role", "imageUrl", "instagram", "facebook", "email", "phone"].map((field) => (
                        <input
                          key={field}
                          placeholder={field}
                          value={member[field]}
                          onChange={(e) =>
                            handleArrayObjectChange("committee", index, field, e.target.value)
                          }
                          className="rounded-xl border p-3"
                        />
                      ))}
                      <textarea
                        placeholder="bio"
                        value={member.bio}
                        onChange={(e) =>
                          handleArrayObjectChange("committee", index, "bio", e.target.value)
                        }
                        className="rounded-xl border p-3 md:col-span-2"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addArrayObjectItem("committee", emptyCommitteeMember)}
                  className="rounded-xl bg-green-600 px-4 py-2 text-white font-semibold"
                >
                  + Add Committee Member
                </button>
              </div>
            )}

            {activeTab === "members" && (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Choir Members Names
                  </span>
                  <textarea
                    name="membersText"
                    value={form.membersText}
                    onChange={handleBasicChange}
                    placeholder="One name per line or comma separated"
                    className="mt-1 w-full rounded-xl border p-3 min-h-[220px]"
                  />
                </label>

                <div className="rounded-2xl border bg-gray-50 p-4">
                  <h3 className="font-semibold text-blue-700 mb-3">Preview</h3>
                  <div className="flex flex-wrap gap-2">
                    {parseCommaOrLineList(form.membersText).map((member, i) => (
                      <span
                        key={`${member}-${i}`}
                        className="rounded-full bg-white border px-3 py-1 text-sm"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "songs" && (
              <div className="space-y-5">
                {form.songs.map((song, index) => (
                  <div key={index} className="rounded-2xl border p-4 bg-gray-50">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-bold text-blue-700">Song #{index + 1}</h3>
                      <button
                        onClick={() => removeArrayObjectItem("songs", index)}
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-white"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        placeholder="Title"
                        value={song.title}
                        onChange={(e) => handleArrayObjectChange("songs", index, "title", e.target.value)}
                        className="rounded-xl border p-3"
                      />
                      <input
                        placeholder="YouTube Link"
                        value={song.youtubeLink}
                        onChange={(e) =>
                          handleArrayObjectChange("songs", index, "youtubeLink", e.target.value)
                        }
                        className="rounded-xl border p-3"
                      />
                      <input
                        placeholder="Artist"
                        value={song.artist}
                        onChange={(e) => handleArrayObjectChange("songs", index, "artist", e.target.value)}
                        className="rounded-xl border p-3"
                      />
                      <input
                        placeholder="Duration"
                        value={song.duration}
                        onChange={(e) => handleArrayObjectChange("songs", index, "duration", e.target.value)}
                        className="rounded-xl border p-3"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addArrayObjectItem("songs", emptySong)}
                  className="rounded-xl bg-green-600 px-4 py-2 text-white font-semibold"
                >
                  + Add Song
                </button>
              </div>
            )}

            {activeTab === "socials" && (
              <div className="grid gap-4 md:grid-cols-2">
                {["youtube", "instagram", "facebook", "email", "phone", "website"].map((field) => (
                  <label key={field} className="block">
                    <span className="text-sm font-medium capitalize">{field}</span>
                    <input
                      type="text"
                      name={`socials.${field}`}
                      value={form.socials[field]}
                      onChange={handleBasicChange}
                      className="mt-1 w-full rounded-xl border p-3"
                    />
                  </label>
                ))}
              </div>
            )}

            {activeTab === "extras" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-blue-700 mb-3">Rehearsals</h3>
                  {form.rehearsals.map((item, index) => (
                    <div key={index} className="grid gap-3 md:grid-cols-4 mb-3">
                      <input
                        placeholder="Day"
                        value={item.day}
                        onChange={(e) => handleArrayObjectChange("rehearsals", index, "day", e.target.value)}
                        className="rounded-xl border p-3"
                      />
                      <input
                        placeholder="Time"
                        value={item.time}
                        onChange={(e) => handleArrayObjectChange("rehearsals", index, "time", e.target.value)}
                        className="rounded-xl border p-3"
                      />
                      <input
                        placeholder="Venue"
                        value={item.venue}
                        onChange={(e) => handleArrayObjectChange("rehearsals", index, "venue", e.target.value)}
                        className="rounded-xl border p-3"
                      />
                      <input
                        placeholder="Note"
                        value={item.note}
                        onChange={(e) => handleArrayObjectChange("rehearsals", index, "note", e.target.value)}
                        className="rounded-xl border p-3"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayObjectItem("rehearsals", emptyRehearsal)}
                    className="rounded-xl bg-green-600 px-4 py-2 text-white"
                  >
                    + Add Rehearsal
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-blue-700 mb-3">Achievements</h3>
                  <textarea
                    name="achievementsText"
                    value={form.achievementsText}
                    onChange={handleBasicChange}
                    placeholder="One achievement per line"
                    className="w-full rounded-xl border p-3 min-h-[140px]"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-blue-700 mb-3">Gallery</h3>
                  {form.gallery.map((item, index) => (
                    <div key={index} className="grid gap-3 md:grid-cols-2 mb-3">
                      <input
                        placeholder="Title"
                        value={item.title}
                        onChange={(e) => handleArrayObjectChange("gallery", index, "title", e.target.value)}
                        className="rounded-xl border p-3"
                      />
                      <input
                        placeholder="Image URL"
                        value={item.imageUrl}
                        onChange={(e) => handleArrayObjectChange("gallery", index, "imageUrl", e.target.value)}
                        className="rounded-xl border p-3"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayObjectItem("gallery", emptyGalleryItem)}
                    className="rounded-xl bg-green-600 px-4 py-2 text-white"
                  >
                    + Add Gallery Image
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-blue-700 mb-3">FAQs</h3>
                  {form.faqs.map((item, index) => (
                    <div key={index} className="grid gap-3 md:grid-cols-2 mb-3">
                      <input
                        placeholder="Question"
                        value={item.question}
                        onChange={(e) => handleArrayObjectChange("faqs", index, "question", e.target.value)}
                        className="rounded-xl border p-3"
                      />
                      <input
                        placeholder="Answer"
                        value={item.answer}
                        onChange={(e) => handleArrayObjectChange("faqs", index, "answer", e.target.value)}
                        className="rounded-xl border p-3"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayObjectItem("faqs", emptyFaq)}
                    className="rounded-xl bg-green-600 px-4 py-2 text-white"
                  >
                    + Add FAQ
                  </button>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-8">
                {form.previousYears.map((year, yearIndex) => (
                  <div key={yearIndex} className="rounded-2xl border p-5 bg-gray-50">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-blue-700">
                        Previous Year #{yearIndex + 1}
                      </h3>
                      <button
                        onClick={() => removePreviousYear(yearIndex)}
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-white"
                      >
                        Remove Year
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 mb-5">
                      {["yearLabel", "theme", "verse"].map((field) => (
                        <input
                          key={field}
                          placeholder={field}
                          value={year[field]}
                          onChange={(e) => handlePreviousYearChange(yearIndex, field, e.target.value)}
                          className="rounded-xl border p-3"
                        />
                      ))}
                      <textarea
                        placeholder="summary"
                        value={year.summary}
                        onChange={(e) => handlePreviousYearChange(yearIndex, "summary", e.target.value)}
                        className="rounded-xl border p-3 md:col-span-2"
                      />
                      <textarea
                        placeholder="Achievements (one per line)"
                        value={year.achievementsText}
                        onChange={(e) =>
                          handlePreviousYearChange(yearIndex, "achievementsText", e.target.value)
                        }
                        className="rounded-xl border p-3"
                      />
                      <textarea
                        placeholder="Members (one per line)"
                        value={year.membersText}
                        onChange={(e) =>
                          handlePreviousYearChange(yearIndex, "membersText", e.target.value)
                        }
                        className="rounded-xl border p-3"
                      />
                      <textarea
                        placeholder="Content lines: Title | Body"
                        value={year.contentText}
                        onChange={(e) => handlePreviousYearChange(yearIndex, "contentText", e.target.value)}
                        className="rounded-xl border p-3 md:col-span-2"
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Previous Committee</h4>
                      {year.committee.map((member, memberIndex) => (
                        <div key={memberIndex} className="grid gap-3 md:grid-cols-3 mb-3">
                          {["name", "role", "imageUrl", "instagram", "facebook", "email", "phone"].map(
                            (field) => (
                              <input
                                key={field}
                                placeholder={field}
                                value={member[field]}
                                onChange={(e) =>
                                  handlePreviousYearCommitteeChange(
                                    yearIndex,
                                    memberIndex,
                                    field,
                                    e.target.value
                                  )
                                }
                                className="rounded-xl border p-3"
                              />
                            )
                          )}
                          <textarea
                            placeholder="bio"
                            value={member.bio}
                            onChange={(e) =>
                              handlePreviousYearCommitteeChange(
                                yearIndex,
                                memberIndex,
                                "bio",
                                e.target.value
                              )
                            }
                            className="rounded-xl border p-3 md:col-span-3"
                          />
                          <button
                            onClick={() => removePreviousYearCommitteeMember(yearIndex, memberIndex)}
                            className="rounded-lg bg-red-500 px-3 py-2 text-white md:col-span-3"
                          >
                            Remove Previous Committee Member
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => addPreviousYearCommitteeMember(yearIndex)}
                        className="rounded-xl bg-green-600 px-4 py-2 text-white"
                      >
                        + Add Previous Committee Member
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addPreviousYear}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-white font-semibold"
                >
                  + Add Previous Year
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-blue-800">Choirs List</h2>
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {choirs.map((choir) => (
            <div
              key={choir._id}
              className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow transition hover:shadow-xl"
            >
              <div>
                <h3 className="mb-2 text-2xl font-bold text-blue-700">{choir.name}</h3>
                <p className="mb-3 text-gray-600">{choir.description}</p>

                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>President:</strong> {choir.president || "—"}</p>
                  <p><strong>Vice President:</strong> {choir.vicePresident || "—"}</p>
                  <p><strong>Members:</strong> {choir?.members?.length || 0}</p>
                  <p><strong>Committee:</strong> {choir?.committee?.length || 0}</p>
                  <p><strong>Songs:</strong> {choir?.songs?.length || 0}</p>
                  <p><strong>Previous Years:</strong> {choir?.previousYears?.length || 0}</p>
                  <p><strong>Status:</strong> {choir.status}</p>
                </div>
              </div>

              <button
                onClick={() => handleEdit(choir)}
                className="mt-5 rounded-xl bg-yellow-500 px-4 py-2.5 text-white font-semibold hover:bg-yellow-600"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}