import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext.jsx";
import EnhancedHeader from "../components/header.jsx";
import Footer from "../components/footer.jsx";

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

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
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
  const onSocial = (k, v) => setForm((p) => ({ ...p, socials: { ...p.socials, [k]: v } }));

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

      const res = await axios.patch(`${API_USERS}/me`, payload, { headers: authHeaders });
      const updated = res.data?.user;

      // ✅ Keep AuthContext + localStorage updated
      // token stays same, only user object changes
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
        token
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
        { headers: authHeaders }
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
      <div className="min-h-screen bg-gray-50">
        <EnhancedHeader />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white border rounded-2xl p-8 text-center">
            Please login to view your profile.
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-b from-white to-gray-50">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl overflow-hidden border bg-gray-100">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold">
                    {form.fullName?.slice(0, 2)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="text-2xl font-bold text-gray-900 truncate">{form.fullName || "Profile"}</div>
                <div className="text-sm text-gray-600 truncate">{form.email}</div>
                <div className="mt-2 inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                  {user?.role || "user"}
                </div>
              </div>
            </div>

            {(error || msg) && (
              <div className="mt-4">
                {error ? (
                  <div className="px-4 py-3 rounded-2xl bg-red-50 text-red-700 border border-red-100 text-sm">
                    {error}
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm">
                    {msg}
                  </div>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-gray-600">Loading profile…</div>
          ) : (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile info */}
              <div className="border rounded-2xl p-5">
                <div className="text-lg font-bold text-gray-900">Profile</div>
                <div className="text-sm text-gray-500 mt-1">Update your public info</div>

                <div className="mt-4 space-y-3">
                  <Field label="Full name">
                    <input
                      value={form.fullName}
                      onChange={(e) => onChange("fullName", e.target.value)}
                      className="w-full border rounded-xl px-4 py-3"
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      value={form.email}
                      onChange={(e) => onChange("email", e.target.value)}
                      className="w-full border rounded-xl px-4 py-3"
                    />
                  </Field>

                  <Field label="Avatar URL">
                    <input
                      value={form.avatarUrl}
                      onChange={(e) => onChange("avatarUrl", e.target.value)}
                      placeholder="https://..."
                      className="w-full border rounded-xl px-4 py-3"
                    />
                  </Field>

                  <Field label="Bio">
                    <textarea
                      value={form.bio}
                      onChange={(e) => onChange("bio", e.target.value)}
                      rows={4}
                      className="w-full border rounded-xl px-4 py-3"
                      placeholder="Short bio…"
                    />
                  </Field>

                  <div className="flex gap-2">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="flex-1 px-4 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save profile"}
                    </button>
                    <button
                      onClick={loadMe}
                      className="px-4 py-3 rounded-2xl border hover:bg-gray-50"
                    >
                      Reload
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact + socials */}
              <div className="space-y-6">
                <div className="border rounded-2xl p-5">
                  <div className="text-lg font-bold text-gray-900">Contact</div>
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <Field label="Phone">
                      <input
                        value={form.phone}
                        onChange={(e) => onChange("phone", e.target.value)}
                        className="w-full border rounded-xl px-4 py-3"
                        placeholder="+250..."
                      />
                    </Field>
                    <Field label="Location">
                      <input
                        value={form.location}
                        onChange={(e) => onChange("location", e.target.value)}
                        className="w-full border rounded-xl px-4 py-3"
                        placeholder="Kigali, Rwanda"
                      />
                    </Field>
                    <Field label="Website">
                      <input
                        value={form.website}
                        onChange={(e) => onChange("website", e.target.value)}
                        className="w-full border rounded-xl px-4 py-3"
                        placeholder="https://..."
                      />
                    </Field>
                  </div>
                </div>

                <div className="border rounded-2xl p-5">
                  <div className="text-lg font-bold text-gray-900">Socials</div>
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <Field label="WhatsApp">
                      <input
                        value={form.socials.whatsapp}
                        onChange={(e) => onSocial("whatsapp", e.target.value)}
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </Field>
                    <Field label="Instagram">
                      <input
                        value={form.socials.instagram}
                        onChange={(e) => onSocial("instagram", e.target.value)}
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </Field>
                    <Field label="Facebook">
                      <input
                        value={form.socials.facebook}
                        onChange={(e) => onSocial("facebook", e.target.value)}
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </Field>
                    <Field label="X (Twitter)">
                      <input
                        value={form.socials.x}
                        onChange={(e) => onSocial("x", e.target.value)}
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </Field>
                  </div>
                </div>

                <div className="border rounded-2xl p-5">
                  <div className="text-lg font-bold text-gray-900">Security</div>
                  <div className="text-sm text-gray-500 mt-1">Change your password</div>

                  <div className="mt-4 space-y-3">
                    <Field label="Current password">
                      <input
                        type="password"
                        value={pw.currentPassword}
                        onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </Field>
                    <Field label="New password">
                      <input
                        type="password"
                        value={pw.newPassword}
                        onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </Field>
                    <Field label="Confirm new password">
                      <input
                        type="password"
                        value={pw.confirm}
                        onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                        className="w-full border rounded-xl px-4 py-3"
                      />
                    </Field>

                    <button
                      onClick={changePassword}
                      disabled={savingPw}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-900 text-white hover:bg-black disabled:opacity-60"
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
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
      {children}
    </label>
  );
}