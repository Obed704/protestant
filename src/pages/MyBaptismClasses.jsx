import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import EnhancedHeader from "../components/header.jsx";
import Footer from "../components/footer.jsx";
import BaptismNav from "../components/BaptismNav";
import { AuthContext } from "../context/authContext.jsx";
import {
  Calendar,
  MapPin,
  Users,
  BookOpen,
  ChevronRight,
  Loader2,
  DropletIcon,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API = `${API_BASE_URL}/api/baptism`;

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-RW", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "TBD";

export default function MyClassesPage() {
  const { user, token } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const authH = token
    ? { Authorization: `Bearer ${token}`, token, "x-access-token": token }
    : {};

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get(`${API}/me/joined`, { headers: authH })
      .then((r) => setClasses(r.data || []))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <EnhancedHeader />
        <BaptismNav isAdmin={isAdmin} />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <DropletIcon size={40} className="mx-auto text-indigo-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">
            Please log in
          </h2>
          <p className="text-slate-500 text-sm">
            You must be logged in to view your joined classes.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <EnhancedHeader />
      <BaptismNav isAdmin={isAdmin} />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800">My Classes</h1>
          <p className="text-slate-500 text-sm mt-1">
            Classes you've joined as a member
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500" size={28} />
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={40} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-lg font-bold text-slate-600 mb-2">
              No classes joined yet
            </h2>
            <p className="text-slate-400 text-sm mb-5">
              Browse available baptism classes and click "Join Class" to get
              started.
            </p>
            <Link
              to="/baptism"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              Browse Classes <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => {
              const myMembership = (cls.members || []).find(
                (m) => String(m.userId) === String(user?._id || user?.id),
              );
              return (
                <Link
                  key={cls._id}
                  to={`/baptism?class=${cls._id}`}
                  className="block bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all p-5 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                        {cls.title}
                      </h3>
                      <span
                        className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          cls.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {cls.isActive ? "Active" : "Completed"}
                      </span>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0 mt-1"
                    />
                  </div>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {cls.description}
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {fmt(cls.schedule?.startDate)} →{" "}
                      {fmt(cls.schedule?.endDate)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} />
                      {cls.schedule?.location || "TBD"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={12} />
                      {cls.students?.length || 0} students ·{" "}
                      {cls.members?.length || 0} members
                    </div>
                  </div>
                  {myMembership && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Joined as{" "}
                        <strong className="capitalize text-slate-700">
                          {myMembership.role}
                        </strong>
                      </span>
                      <span className="text-xs text-slate-400">
                        {fmt(myMembership.joinedAt)}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
