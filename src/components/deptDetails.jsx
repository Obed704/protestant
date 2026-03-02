import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/authContext.jsx";

import {
  FiPhone,
  FiMessageCircle,
  FiHelpCircle,
  FiUsers,
  FiTarget,
  FiCheckCircle,
  FiCalendar,
  FiLoader,
  FiAlertCircle,
  FiChevronLeft,
  FiStar,
  FiSend,
  FiClock,
  FiMail,
  FiUserPlus,
  FiX,
} from "react-icons/fi";
import { FaUserTie, FaHandsHelping } from "react-icons/fa";
import { MdGroups } from "react-icons/md";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const DepartmentDetail = () => {
  const { user, token, isAuthenticated } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // comments
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  // join/apply
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [joinFeedback, setJoinFeedback] = useState(""); // small inline message

  const displayName = useMemo(
    () => user?.fullName || user?.username || "Anonymous",
    [user]
  );

  const displayEmail = useMemo(() => user?.email || "", [user]);

  const fetchDepartment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${BASE_URL}/api/departments/${id}`);
      setDept(res.data);
    } catch (err) {
      console.error("Error fetching department:", err);
      setError(err.response?.data?.message || "Failed to load department details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  const handleAddComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) {
      setCommentError("Comment cannot be empty");
      return;
    }

    setCommentError("");
    setSubmittingComment(true);

    if (!isAuthenticated || !token) {
      setCommentError("You must be logged in to comment.");
      setTimeout(() => navigate("/login"), 1200);
      setSubmittingComment(false);
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/api/departments/${id}/comments`,
        { name: displayName, email: displayEmail, text: trimmed },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      setDept(res.data);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      setCommentError(err.response?.data?.message || "Failed to add comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !submittingComment) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // APPLY TO JOIN
  const handleApplyJoin = async () => {
    setJoinFeedback("");

    if (!isAuthenticated || !token) {
      setJoinFeedback("Please login first to apply.");
      setTimeout(() => navigate("/login"), 1200);
      return;
    }

    try {
      setJoinSubmitting(true);

      const payload = {
        userId: user?._id || user?.id || "",
        name: displayName,
        email: displayEmail,
        phone: joinPhone.trim(),
        message: joinMessage.trim(),
      };

      const res = await axios.post(
        `${BASE_URL}/api/departments/${id}/join`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      setJoinFeedback(res.data?.message || "Application submitted.");
      setJoinOpen(false);
      setJoinMessage("");
      setJoinPhone("");
    } catch (err) {
      setJoinFeedback(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setJoinSubmitting(false);
    }
  };

  // ---------- UI STATES ----------
  if (loading) {
    return (
      <section className="bg-gradient-to-b from-slate-950 to-slate-900 py-16 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-amber-300 mx-auto mb-4" />
          <p className="text-sm text-slate-300">Loading department details...</p>
        </div>
      </section>
    );
  }

  if (error || !dept) {
    return (
      <section className="bg-gradient-to-b from-slate-950 to-slate-900 py-16 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-red-500/30">
          <FiAlertCircle className="text-5xl text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-300 mb-2">Department Not Found</h3>
          <p className="text-slate-300 text-sm mb-6">
            {error || "The department you're looking for doesn't exist."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-5 rounded-xl transition text-sm"
            >
              <FiChevronLeft className="inline mr-2" />
              Go Back
            </button>
            <Link
              to="/departments"
              className="bg-amber-300 hover:bg-amber-400 text-slate-900 font-semibold py-2.5 px-5 rounded-xl transition text-sm"
            >
              Browse Departments
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // optional: lightweight membership check (members are strings)
  const isMember = (dept.members || []).some(
    (m) => String(m).trim().toLowerCase() === String(displayName).trim().toLowerCase()
  );

  return (
    <section className="bg-gradient-to-b from-slate-950 to-slate-900 py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Back */}
        <div className="mb-5">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition text-sm font-medium"
          >
            <FiChevronLeft className="text-lg" />
            Back to Departments
          </button>
        </div>

        {/* Header */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 md:p-8 mb-6 border border-white/10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {dept.name}
              </h1>

              <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <FaUserTie className="text-amber-300" />
                  <span>
                    <span className="text-slate-200 font-semibold">President:</span>{" "}
                    {dept.president}
                  </span>
                </div>

                {dept.est && (
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-amber-300" />
                    <span>
                      <span className="text-slate-200 font-semibold">Established:</span>{" "}
                      {dept.est}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                {dept.description || "No description provided."}
              </p>

              {joinFeedback && (
                <div className="mt-4 text-sm text-amber-200 bg-amber-300/10 border border-amber-300/20 rounded-xl px-4 py-3">
                  {joinFeedback}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 text-lg">
              {dept.phone && (
                <a
                  href={`tel:${dept.phone}`}
                  className="text-amber-300 hover:text-emerald-300 transition p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10"
                  title="Call"
                >
                  <FiPhone />
                </a>
              )}

              {dept.email && (
                <a
                  href={`mailto:${dept.email}`}
                  className="text-amber-300 hover:text-sky-300 transition p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10"
                  title="Email"
                >
                  <FiMail />
                </a>
              )}

              <button
                className="text-amber-300 hover:text-sky-300 transition p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10"
                title="Support"
                onClick={() => navigate(`/contact?dept=${encodeURIComponent(dept.name)}`)}
              >
                <FiHelpCircle />
              </button>

              <button
                className={`transition p-3 rounded-xl border ${
                  isMember
                    ? "bg-emerald-400/10 text-emerald-200 border-emerald-300/20 cursor-default"
                    : "bg-amber-300 text-slate-900 border-amber-200 hover:bg-amber-200"
                }`}
                title={isMember ? "Already a member" : "Apply to Join"}
                onClick={() => !isMember && setJoinOpen(true)}
                disabled={isMember}
              >
                <FiUserPlus />
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Members */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <MdGroups className="text-2xl text-amber-300" />
                <h2 className="text-lg font-semibold text-white">Members</h2>
                <span className="bg-amber-300/10 text-amber-200 px-3 py-1 rounded-full text-xs font-medium border border-amber-300/20">
                  {dept.members?.length || 0}
                </span>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(dept.members || []).map((member, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 px-3 py-2 bg-black/20 rounded-xl border border-white/5"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm">
                      {String(member).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-200">{member}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Committee */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <FaUserTie className="text-xl text-amber-300" />
                <h2 className="text-lg font-semibold text-white">Committee</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(dept.committee || []).map((m, i) => (
                  <div key={i} className="p-4 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {String(m.name).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-100">{m.name}</div>
                        <div className="text-xs text-slate-400">{m.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Plans */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <FiTarget className="text-xl text-amber-300" />
                <h2 className="text-lg font-semibold text-white">Plans</h2>
                <span className="bg-sky-400/10 text-sky-200 px-3 py-1 rounded-full text-xs font-medium border border-sky-300/20">
                  {dept.plans?.length || 0}
                </span>
              </div>

              <ul className="space-y-2">
                {(dept.plans || []).map((plan, i) => (
                  <li key={i} className="flex items-start gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                    <FiStar className="text-amber-300 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-200">{plan}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <FiCheckCircle className="text-xl text-amber-300" />
                <h2 className="text-lg font-semibold text-white">Actions</h2>
                <span className="bg-emerald-400/10 text-emerald-200 px-3 py-1 rounded-full text-xs font-medium border border-emerald-300/20">
                  {dept.actions?.length || 0}
                </span>
              </div>

              <ul className="space-y-2">
                {(dept.actions || []).map((action, i) => (
                  <li key={i} className="flex items-start gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                    <span className="mt-1 w-2 h-2 rounded-full bg-emerald-300/80 flex-shrink-0" />
                    <span className="text-sm text-slate-200">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <FiMessageCircle className="text-2xl text-amber-300" />
              <div>
                <h2 className="text-lg font-semibold text-white">Comments</h2>
                <p className="text-xs text-slate-400">Share your thoughts about this department</p>
              </div>
            </div>

            <div className="bg-amber-300/10 text-amber-200 px-3 py-1 rounded-full text-xs font-medium border border-amber-300/20">
              {dept.comments?.length || 0}
            </div>
          </div>

          {/* list */}
          <div className="mb-6 max-h-[420px] overflow-y-auto pr-2 space-y-4">
            {(dept.comments || []).length === 0 ? (
              <div className="text-center py-10 bg-black/20 rounded-2xl border border-white/5">
                <FiMessageCircle className="text-5xl text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300 text-sm">No comments yet.</p>
                <p className="text-slate-500 text-xs mt-1">
                  {isAuthenticated ? "Be the first to comment." : "Login to comment."}
                </p>
              </div>
            ) : (
              (dept.comments || []).map((comment) => (
                <div key={comment._id} className="bg-black/20 p-5 rounded-2xl border border-white/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm">
                        {comment.name?.charAt(0).toUpperCase() || "A"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-amber-200 text-sm">{comment.name}</h3>
                          {comment.email && (
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <FiMail className="text-[11px]" />
                              {comment.email}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <FiClock className="text-[11px]" />
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-200 text-sm leading-relaxed">{comment.text}</p>

                  {/* replies */}
                  {comment.replies?.length > 0 && (
                    <div className="ml-3 pl-4 border-l-2 border-amber-300/20 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FaHandsHelping className="text-amber-300" />
                        <h4 className="text-xs font-medium text-amber-200">
                          Replies ({comment.replies.length})
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3 mb-1">
                              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {reply.name?.charAt(0).toUpperCase() || "R"}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-200">{reply.name}</p>
                                <p className="text-[11px] text-slate-500">{new Date(reply.createdAt).toLocaleTimeString()}</p>
                              </div>
                            </div>
                            <p className="text-slate-300 text-xs">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* add comment */}
          <div className="border-t border-white/10 pt-5">
            {commentError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <FiAlertCircle className="text-xl text-red-300 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{commentError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={isAuthenticated ? "Write a comment..." : "Login to comment"}
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    setCommentError("");
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={!isAuthenticated || submittingComment}
                  className="w-full px-4 py-3 bg-black/20 text-slate-100 rounded-2xl border border-white/10 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 transition disabled:opacity-60 text-sm"
                />
                {!isAuthenticated && (
                  <p className="text-slate-400 text-xs mt-2">
                    <Link to="/login" className="text-amber-300 hover:underline font-medium">
                      Login
                    </Link>{" "}
                    to add a comment.
                  </p>
                )}
              </div>

              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || !isAuthenticated || submittingComment}
                className="bg-amber-300 hover:bg-amber-200 text-slate-900 font-semibold px-6 py-3 rounded-2xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {submittingComment ? <FiLoader className="animate-spin" /> : <FiSend />}
                {submittingComment ? "Posting..." : "Comment"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* JOIN MODAL */}
      {joinOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FiUserPlus className="text-amber-300" />
                <h3 className="text-white font-semibold text-sm">Apply to Join</h3>
              </div>
              <button
                onClick={() => setJoinOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-300"
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-300">
                  You are applying to join <span className="text-amber-200 font-semibold">{dept.name}</span>.
                  Provide a short message (optional) and your phone (optional).
                </p>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone (optional)</label>
                <input
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 text-slate-100 rounded-xl border border-white/10 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 text-sm"
                  placeholder="+250..."
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Message (optional)</label>
                <textarea
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-black/20 text-slate-100 rounded-xl border border-white/10 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 text-sm resize-none"
                  placeholder="Why do you want to join? (optional)"
                />
                <div className="mt-1 text-[11px] text-slate-500">
                  {joinMessage.length}/300
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setJoinOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleApplyJoin}
                  disabled={joinSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-900 font-semibold text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {joinSubmitting ? <FiLoader className="animate-spin" /> : <FiSend />}
                  {joinSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>

              {!isAuthenticated && (
                <p className="text-xs text-slate-400">
                  You must be logged in to apply.{" "}
                  <Link to="/login" className="text-amber-300 hover:underline font-medium">
                    Login
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DepartmentDetail;