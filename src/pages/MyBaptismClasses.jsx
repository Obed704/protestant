import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import EnhancedHeader from "../components/header.jsx";
import Footer from "../components/footer.jsx";
import { AuthContext } from "../context/authContext.jsx";
import { Calendar, Users, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/baptism`;

export default function MyBaptismClasses() {
  const { user, token } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}`, token, "x-access-token": token };
  }, [token]);

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setClasses([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${API_ENDPOINT}/me/joined`, { headers: authHeaders });
        setClasses(res.data || []);
      } catch {
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <EnhancedHeader />
      <BaptismNav isAdmin={isAdmin} />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Joined Classes</h1>
        <p className="text-gray-600 mb-6">Classes you joined (members-only community access).</p>

        {!token ? (
          <div className="bg-white rounded-2xl shadow p-6 text-gray-700">
            Please login to see your joined classes.
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 text-gray-700">
            You haven’t joined any class yet.
            <div className="mt-3">
              <Link to="/baptism" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Shield size={18} /> Go Join a Class
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((c) => (
              <div key={c._id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition">
                <h3 className="font-bold text-lg text-gray-900">{c.title}</h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{c.description}</p>

                <div className="mt-4 text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{c.schedule?.days?.join(", ") || "TBD"} • {c.schedule?.time || "TBD"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>Members: {c.members?.length || 0}</span>
                  </div>
                </div>

                <Link
                  to="/baptism"
                  className="inline-flex mt-5 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                  Open Baptism Page
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}