// src/pages/ProfilePage.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext.jsx";
import EnhancedHeader from "../components/header.jsx";
import Footer from "../components/footer.jsx";
import { Palette } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_USERS = `${API_BASE_URL}/api/users`;

const clean = (v) => (typeof v === "string" ? v.trim() : v);

export default function ProfilePage() {
  const { user, token, login, authLoading } = useContext(AuthContext);

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [error, setError] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Theme color state (sync with ChatHome/NewChat)
  const [themeColor, setThemeColor] = useState(() => {
    const saved = localStorage.getItem("chat_theme_color");
    return saved && saved.match(/^#[0-9A-F]{6}$/i) ? saved : "#d946ef";
  });

  // Apply CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", themeColor);
    root.style.setProperty("--theme-primary-light", `${themeColor}30`);
    root.style.setProperty("--theme-primary-dark", themeColor);
    localStorage.setItem("chat_theme_color", themeColor);
  }, [themeColor]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    avatarUrl: "",
    bio: "",
    phone: "",
    location: "",
    website: "",
    socials: { whatsapp: "", instagram: "", facebook: "", x: "" },
  });

  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [msg, setMsg] = useState("");

  const loadMe = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_USERS}/me`, { headers: authHeaders });
      const me = res.data?.user;

      setForm({
        fullName: me?.fullName || "",
        email: me?.email || "",
        avatarUrl: me?.avatarUrl || "",
        bio: me?.bio || "",
        phone: me?.phone || "",
        location: me?.location || "",
        website: me?.website || "",
        socials: {
          whatsapp: me?.socials?.whatsapp || "",
          instagram: me?.socials?.instagram || "",
          facebook: me?.socials?.facebook || "",
          x: me?.socials?.x || "",
        },
      });
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || authLoading) return;
    loadMe();
    // eslint-disable-next-line
  }, [token, authLoading]);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const onSocial = (k, v) =>
    setForm((p) => ({ ...p, socials: { ...p.socials, [k]: v } }));

  const saveProfile = async () => {
    setSaving(true);
    setMsg("");
    setError("");

    try {
      const payload = {
        fullName: clean(form.fullName),
        email: clean(form.email),
        avatarUrl: clean(form.avatarUrl),
        bio: clean(form.bio),
        phone: clean(form.phone),
        location: clean(form.location),
        website: clean(form.website),
        socials: {
          whatsapp: clean(form.socials.whatsapp),
          instagram: clean(form.socials.instagram),
          facebook: clean(form.socials.facebook),
          x: clean(form.socials.x),
        },
      };

      const res = await axios.patch(`${API_USERS}/me`, payload, {
        headers: authHeaders,
      });
      const updated = res.data?.user;

      login(
        {
          id: updated?._id || user?.id,
          _id: updated?._id || user?._id,
          fullName: updated?.fullName,
          email: updated?.email,
          role: updated?.role,
          avatarUrl: updated?.avatarUrl,
          bio: updated?.bio,
          phone: updated?.phone,
          location: updated?.location,
          website: updated?.website,
          socials: updated?.socials,
        },
        token,
      );

      setMsg("Profile updated ✅");
    } catch (e) {
      setError(e.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setSavingPw(true);
    setMsg("");
    setError("");

    try {
      if (!pw.currentPassword || !pw.newPassword) {
        setError("Fill current and new password");
        setSavingPw(false);
        return;
      }
      if (pw.newPassword !== pw.confirm) {
        setError("New password and confirm do not match");
        setSavingPw(false);
        return;
      }

      await axios.patch(
        `${API_USERS}/me/password`,
        { currentPassword: pw.currentPassword, newPassword: pw.newPassword },
        { headers: authHeaders },
      );

      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      setMsg("Password updated ✅");
    } catch (e) {
      setError(e.response?.data?.message || "Password update failed");
    } finally {
      setSavingPw(false);
    }
  };

  if (authLoading || !token) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/img2.jpg')] bg-cover bg-center bg-no-repeat" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        </div>
        <div className="relative z-10">
          <EnhancedHeader />
          <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-8 text-center">
              <p className="text-white/90">
                Please login to view your profile.
              </p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background image and overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/img2.jpg')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <EnhancedHeader />

        <div className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-5 py-6">
          {/* Header with color picker */}
          <div className="flex items-center justify-end mb-5">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/30 transition flex items-center gap-2"
                title="Change theme color"
              >
                <div
                  className="w-5 h-5 rounded-full shadow-inner"
                  style={{ backgroundColor: themeColor }}
                />
                <Palette size={16} className="text-white/80" />
              </button>
              {showColorPicker && (
                <div className="absolute right-0 mt-2 p-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl z-50">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-32 h-10 rounded-lg cursor-pointer"
                  />
                  <div className="text-xs text-white/70 text-center mt-2">
                    Pick a color
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/20 bg-gradient-to-r from-white/5 to-transparent">
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 shadow-md">
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white font-bold text-2xl">
                      {form.fullName?.slice(0, 2)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-2xl font-bold text-white drop-shadow truncate">
                    {form.fullName || "Profile"}
                  </div>
                  <div className="text-sm text-white/70 truncate">
                    {form.email}
                  </div>
                  <div className="mt-2 inline-flex px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-xs font-semibold border border-white/30">
                    {user?.role || "user"}
                  </div>
                </div>
              </div>

              {(error || msg) && (
                <div className="mt-5">
                  {error ? (
                    <div className="px-4 py-3 rounded-2xl bg-red-500/20 backdrop-blur-md text-white border border-red-500/30 text-sm">
                      {error}
                    </div>
                  ) : (
                    <div className="px-4 py-3 rounded-2xl bg-emerald-500/20 backdrop-blur-md text-white border border-emerald-500/30 text-sm">
                      {msg}
                    </div>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="p-8 text-white/70 flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile info */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                  <div className="text-lg font-bold text-white">Profile</div>
                  <div className="text-sm text-white/60 mt-1">
                    Update your public info
                  </div>

                  <div className="mt-4 space-y-4">
                    <Field label="Full name">
                      <input
                        value={form.fullName}
                        onChange={(e) => onChange("fullName", e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50"
                      />
                    </Field>

                    <Field label="Email">
                      <input
                        value={form.email}
                        onChange={(e) => onChange("email", e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50"
                      />
                    </Field>

                    <Field label="Avatar URL">
                      <input
                        value={form.avatarUrl}
                        onChange={(e) => onChange("avatarUrl", e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50"
                      />
                    </Field>

                    <Field label="Bio">
                      <textarea
                        value={form.bio}
                        onChange={(e) => onChange("bio", e.target.value)}
                        rows={4}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50 resize-none"
                        placeholder="Short bio…"
                      />
                    </Field>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex-1 px-4 py-3 rounded-xl theme-gradient text-white font-semibold hover:shadow-xl disabled:opacity-60 transition"
                      >
                        {saving ? "Saving…" : "Save profile"}
                      </button>
                      <button
                        onClick={loadMe}
                        className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white/90 hover:bg-white/20 transition"
                      >
                        Reload
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contact + socials + security */}
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                    <div className="text-lg font-bold text-white">Contact</div>
                    <div className="mt-4 grid grid-cols-1 gap-4">
                      <Field label="Phone">
                        <input
                          value={form.phone}
                          onChange={(e) => onChange("phone", e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50"
                          placeholder="+250..."
                        />
                      </Field>
                      <Field label="Location">
                        <input
                          value={form.location}
                          onChange={(e) => onChange("location", e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50"
                          placeholder="Kigali, Rwanda"
                        />
                      </Field>
                      <Field label="Website">
                        <input
                          value={form.website}
                          onChange={(e) => onChange("website", e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50"
                          placeholder="https://..."
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                    <div className="text-lg font-bold text-white">Socials</div>
                    <div className="mt-4 grid grid-cols-1 gap-4">
                      <Field label="WhatsApp">
                        <input
                          value={form.socials.whatsapp}
                          onChange={(e) => onSocial("whatsapp", e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50"
                        />
                      </Field>
                      <Field label="Instagram">
                        <input
                          value={form.socials.instagram}
                          onChange={(e) =>
                            onSocial("instagram", e.target.value)
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50"
                        />
                      </Field>
                      <Field label="Facebook">
                        <input
                          value={form.socials.facebook}
                          onChange={(e) => onSocial("facebook", e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50"
                        />
                      </Field>
                      <Field label="X (Twitter)">
                        <input
                          value={form.socials.x}
                          onChange={(e) => onSocial("x", e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50"
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                    <div className="text-lg font-bold text-white">Security</div>
                    <div className="text-sm text-white/60 mt-1">
                      Change your password
                    </div>

                    <div className="mt-4 space-y-4">
                      <Field label="Current password">
                        <input
                          type="password"
                          value={pw.currentPassword}
                          onChange={(e) =>
                            setPw((p) => ({
                              ...p,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50"
                        />
                      </Field>
                      <Field label="New password">
                        <input
                          type="password"
                          value={pw.newPassword}
                          onChange={(e) =>
                            setPw((p) => ({
                              ...p,
                              newPassword: e.target.value,
                            }))
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50"
                        />
                      </Field>
                      <Field label="Confirm new password">
                        <input
                          type="password"
                          value={pw.confirm}
                          onChange={(e) =>
                            setPw((p) => ({ ...p, confirm: e.target.value }))
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/50"
                        />
                      </Field>

                      <button
                        onClick={changePassword}
                        disabled={savingPw}
                        className="w-full px-4 py-3 rounded-xl theme-gradient text-white font-semibold hover:shadow-xl disabled:opacity-60 transition"
                      >
                        {savingPw ? "Updating…" : "Update password"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>

      {/* Dynamic theme styles */}
      <style>{`
        :root {
          --theme-primary: ${themeColor};
          --theme-primary-light: ${themeColor}30;
          --theme-primary-dark: ${themeColor};
        }
        .theme-gradient {
          background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
        }
        input, textarea {
          transition: all 0.2s ease;
        }
        input:focus, textarea:focus {
          box-shadow: 0 0 0 2px rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-white/80 mb-1">{label}</div>
      {children}
    </label>
  );
}
