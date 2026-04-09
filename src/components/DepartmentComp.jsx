import React, { useState, useContext, useMemo } from "react";
import {
  FiPhone,
  FiMessageCircle,
  FiHelpCircle,
  FiX,
  FiLoader,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { AuthContext } from "../context/authContext.jsx";
import { useAppData } from "../context/DataContext.jsx";

const VISIBLE_DEPARTMENTS_COUNT = 4;

const Departments = () => {
  const { user, token, isAuthenticated } = useContext(AuthContext);
  const { departments: allDepartments, loading: globalLoading } = useAppData();
  const navigate = useNavigate();

  const [showAll, setShowAll] = useState(false);
  const [modalDept, setModalDept] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const displayedDepartments = useMemo(
    () =>
      showAll
        ? allDepartments
        : allDepartments.slice(0, VISIBLE_DEPARTMENTS_COUNT),
    [allDepartments, showAll],
  );

  const addComment = async (deptId) => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment || !isAuthenticated) return;
    setSubmittingComment(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/departments/${deptId}/comments`,
        {
          name: user?.fullName || user?.username || "Anonymous User",
          text: trimmedComment,
        },
        config,
      );
      setModalDept(res.data);
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (globalLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-emerald-400">
        <FiLoader className="animate-spin text-4xl" />
      </div>
    );

  return (
    /* FIX: Changed h-auto to h-fit and min-h-screen is only applied 
       to md screens and up to prevent bottom dead-space on mobile.
    */
    <section className="relative w-full h-fit md:min-h-screen p-5 md:p-20 overflow-hidden bg-[#020617] flex flex-col items-center">
      {/* BACKGROUND ENGINE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 md:opacity-100"
          style={{ backgroundImage: `url('img2.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/90 to-emerald-950/40" />
        <div className="absolute inset-0 backdrop-blur-[3px]" />
      </div>

      {/* Main Container: origin-top keeps it pinned to the top.
          pb-4 instead of pb-10 reduces the gap after the "See All" button.
      */}
      <div className="relative z-10 w-full max-w-6xl mx-auto scale-[0.96] sm:scale-100 origin-top pb-4">
        {/* Header */}
        <header className="text-center mb-10 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-emerald-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">
              Our Ecosystem
            </span>
            <h2 className="text-2xl md:text-6xl font-extrabold text-white tracking-tighter mb-4">
              Church <span className="text-emerald-400">Departments</span>
            </h2>
            <div className="h-1 w-12 md:w-20 bg-emerald-500 mx-auto rounded-full" />
          </motion.div>
        </header>

        {allDepartments.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {displayedDepartments.map((dept, index) => (
              <motion.div
                key={dept._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative backdrop-blur-xl bg-slate-900/40 border border-white/5 rounded-[1.2rem] md:rounded-[2rem] p-4 md:p-8 hover:bg-slate-800/60 transition-all duration-500 shadow-2xl flex flex-col justify-between"
              >
                <div className="mb-4">
                  <h3 className="text-[13px] md:text-xl font-bold text-white mb-1 md:mb-3 group-hover:text-emerald-400 transition-colors leading-tight truncate">
                    {dept.name}
                  </h3>
                  <p className="text-[10px] md:text-sm text-slate-400 leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-4 font-light">
                    {dept.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 md:pt-6 border-t border-white/5">
                  <Link
                    to={`/dept/${dept._id}`}
                    className="p-1.5 md:p-2.5 bg-white/5 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <FiHelpCircle size={14} className="md:w-5 md:h-5" />
                  </Link>
                  <div className="flex gap-1 md:gap-2">
                    <button
                      onClick={() => setModalDept(dept)}
                      className="relative p-1.5 md:p-2.5 bg-white/5 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <FiMessageCircle size={14} className="md:w-5 md:h-5" />
                      {dept.comments?.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-emerald-500 text-[7px] text-white font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                          {dept.comments.length}
                        </span>
                      )}
                    </button>
                    {dept.phone && (
                      <a
                        href={`tel:${dept.phone}`}
                        className="p-1.5 md:p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        <FiPhone size={14} className="md:w-5 md:h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 py-20">
            No departments found.
          </div>
        )}

        {allDepartments.length > VISIBLE_DEPARTMENTS_COUNT && (
          <div className="text-center mt-8 md:mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full sm:w-auto px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95 shadow-xl"
            >
              {showAll ? "Collapse" : `See All ${allDepartments.length}`}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalDept && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 backdrop-blur-xl bg-black/70"
            onClick={() => setModalDept(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-slate-900/95 border-t md:border border-white/10 w-full max-w-2xl h-[85vh] md:h-auto rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center">
                <div className="min-w-0">
                  <h3 className="text-lg md:text-2xl font-bold text-white truncate">
                    {modalDept.name}
                  </h3>
                  <p className="text-emerald-400 text-[9px] md:text-xs font-bold uppercase tracking-widest mt-1">
                    Lead: {modalDept.president}
                  </p>
                </div>
                <button
                  onClick={() => setModalDept(null)}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 text-slate-400"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
                {modalDept.comments?.map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-white/[0.03] border border-white/5 p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[8px] font-bold">
                        {comment.name.charAt(0)}
                      </div>
                      <span className="text-white font-bold text-[11px] md:text-sm">
                        {comment.name}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] md:text-sm font-light">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 pb-12 md:pb-8">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Share a thought..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!isAuthenticated || submittingComment}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={() => addComment(modalDept._id)}
                    disabled={!newComment.trim() || submittingComment}
                    className="bg-emerald-500 text-white font-bold px-4 py-3 rounded-xl text-[10px] uppercase tracking-widest"
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Departments;
