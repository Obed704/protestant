import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import EnhancedHeader from "../components/header";
import Footer from "../components/footer";
import { AuthContext } from "../context/authContext.jsx";
import { Search, UserPlus, ArrowLeft } from "lucide-react";
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

  const loadUsers = async (q = "") => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_USERS}?search=${encodeURIComponent(q)}`, { headers: authHeaders });
      const users = (res.data || []).filter((u) => String(u._id) !== String(myId));
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
      { headers: authHeaders }
    );

    const convoId = res.data?._id;
    // ✅ pass it to ChatHome
    navigate(`/chat?dm=${convoId}`);
  } catch (e) {
    alert(e.response?.data?.message || "Failed to start chat");
  }
};

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedHeader />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            Please login to start a chat.
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
        <button
          onClick={() => navigate("/chat")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-xl hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          Back to chat
        </button>

        <div className="bg-white rounded-2xl shadow border mt-4 overflow-hidden">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Start a new chat</h1>
            <p className="text-gray-600 text-sm mt-1">Search church members and message them.</p>
          </div>

          <div className="p-4 border-b">
            <div className="flex items-center gap-2 border rounded-xl px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none text-sm"
                placeholder="Search by name or email…"
              />
              <button
                onClick={() => loadUsers(search)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-gray-500">Loading…</div>
            ) : list.length === 0 ? (
              <div className="text-gray-500">No members found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {list.map((m) => (
                  <div key={m._id} className="border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{m.fullName}</div>
                      <div className="text-sm text-gray-500">{m.email}</div>
                    </div>
                    <button
                      onClick={() => startDm(m._id)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
  );
}