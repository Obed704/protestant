// src/pages/NewChat.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import EnhancedHeader from "../components/header.jsx";
import Footer from "../components/Footer.jsx";
import { AuthContext } from "../context/authContext.jsx";
import { Search, UserPlus, ArrowLeft, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_USERS = `${API_BASE_URL}/api/users`;
const API_CHAT = `${API_BASE_URL}/api/chat`;

export default function NewChat() {
  const { user, token, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const myId = user?._id || user?.id;

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}`, token, "x-access-token": token };
  }, [token]);

  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Theme color state (sync with ChatHome via localStorage)
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

  const loadUsers = async (q = "") => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_USERS}?search=${encodeURIComponent(q)}`,
        { headers: authHeaders },
      );
      const users = (res.data || []).filter(
        (u) => String(u._id) !== String(myId),
      );
      setList(users);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || authLoading) return;
    loadUsers("");
    // eslint-disable-next-line
  }, [token, authLoading]);

  const startDm = async (otherUserId) => {
    try {
      const res = await axios.post(
        `${API_CHAT}/dm/start`,
        { otherUserId },
        { headers: authHeaders },
      );
      const convoId = res.data?._id;
      navigate(`/chat?dm=${convoId}`);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to start chat");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700">
        <div className="w-10 h-10 rounded-full border-2 border-white border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!token) {
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
              <p className="text-white/90">Please login to start a chat.</p>
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

        <div className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-5 py-6">
          {/* Header with back button and color picker */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => navigate("/chat")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white/90 hover:bg-white/20 transition shadow-lg"
            >
              <ArrowLeft size={18} />
              Back to chat
            </button>

            {/* Color picker (optional, matches ChatHome) */}
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
            <div className="p-5 border-b border-white/20">
              <h1 className="text-2xl font-bold text-white drop-shadow">
                Start a new chat
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Search church members and message them.
              </p>
            </div>

            <div className="p-5 border-b border-white/20">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
                <Search size={16} className="text-white/60" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/50"
                  placeholder="Search by name or email…"
                />
                <button
                  onClick={() => loadUsers(search)}
                  className="px-4 py-2 theme-gradient text-white rounded-lg hover:shadow-lg transition"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                </div>
              ) : list.length === 0 ? (
                <div className="text-white/70 text-center py-10">
                  No members found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {list.map((m) => (
                    <div
                      key={m._id}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-center justify-between hover:bg-white/20 transition"
                    >
                      <div>
                        <div className="font-semibold text-white drop-shadow">
                          {m.fullName}
                        </div>
                        <div className="text-sm text-white/60">{m.email}</div>
                      </div>
                      <button
                        onClick={() => startDm(m._id)}
                        className="inline-flex items-center gap-2 px-3 py-2 theme-gradient text-white rounded-lg hover:shadow-lg transition"
                      >
                        <UserPlus size={16} />
                        Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
      `}</style>

      {/* Custom scrollbar (optional) */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
