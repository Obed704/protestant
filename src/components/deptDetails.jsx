import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/authContext.jsx";

import {
  FiPhone,
  FiMessageCircle,
  FiHelpCircle,
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
  FiImage,
  FiInstagram,
  FiFacebook,
  FiLinkedin,
  FiGlobe,
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

  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  const [joinOpen, setJoinOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [joinFeedback, setJoinFeedback] = useState("");

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
      setCommentError(err.response?.data?.message || "Failed to add comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

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

  if (loading) {
    return (
      <section className="bg-slate-950 py-16 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-amber-300 mx-auto mb-4" />
          <p className="text-sm text-slate-300">Loading department details...</p>
        </div>
      </section>
    );
  }

  if (error || !dept) {
    return (
      <section className="bg-slate-950 py-16 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md bg-white/5 p-8 rounded-2xl border border-red-500/30">
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
              Back
            </button>
            <Link
              to="/departments"
              className="bg-amber-300 hover:bg-amber-400 text-slate-900 font-semibold py-2.5 px-5 rounded-xl transition text-sm"
            >
              Departments
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const isMember = (dept.members || []).some(
    (m) => String(m?.name || "").trim().toLowerCase() === String(displayName).trim().toLowerCase()
  );

  return (
    <section className="bg-gradient-to-b from-slate-950 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition text-sm font-medium mb-5"
        >
          <FiChevronLeft className="text-lg" />
          Back to Departments
        </button>

        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 mb-6">
          <div className="relative h-[260px] md:h-[380px]">
            {dept.heroImage ? (
              <img
                src={dept.heroImage}
                alt={dept.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-700 via-slate-800 to-amber-600" />
            )}
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{dept.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-200">
                <span>President: {dept.president}</span>
                {dept.est && <span>Established: {dept.est}</span>}
                {dept.members?.length > 0 && <span>Members: {dept.members.length}</span>}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <p className="text-slate-300 leading-relaxed mb-5">
              {dept.description || "No description provided."}
            </p>

            {joinFeedback && (
              <div className="mb-5 text-sm text-amber-200 bg-amber-300/10 border border-amber-300/20 rounded-xl px-4 py-3">
                {joinFeedback}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {dept.phone && (
                <a
                  href={`tel:${dept.phone}`}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-amber-300 hover:bg-white/10 inline-flex items-center gap-2"
                >
                  <FiPhone />
                  Call
                </a>
              )}

              {dept.email && (
                <a
                  href={`mailto:${dept.email}`}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-amber-300 hover:bg-white/10 inline-flex items-center gap-2"
                >
                  <FiMail />
                  Email
                </a>
              )}

              <button
                onClick={() => navigate(`/contact?dept=${encodeURIComponent(dept.name)}`)}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-amber-300 hover:bg-white/10 inline-flex items-center gap-2"
              >
                <FiHelpCircle />
                Support
              </button>

              <button
                className={`px-4 py-3 rounded-xl inline-flex items-center gap-2 ${
                  isMember
                    ? "bg-emerald-400/10 text-emerald-200 border border-emerald-300/20 cursor-default"
                    : "bg-amber-300 text-slate-900 hover:bg-amber-200"
                }`}
                onClick={() => !isMember && setJoinOpen(true)}
                disabled={isMember}
              >
                <FiUserPlus />
                {isMember ? "Already a Member" : "Apply to Join"}
              </button>
            </div>
          </div>
        </div>

        {(dept.gallery || []).length > 0 && (
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FiImage className="text-2xl text-amber-300" />
              <h2 className="text-lg font-semibold text-white">Gallery</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dept.gallery.map((img) => (
                <div
                  key={img._id}
                  className="group bg-black/20 rounded-2xl overflow-hidden border border-white/5"
                >
                  <img
                    src={img.imageUrl}
                    alt={img.title || dept.name}
                    className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-slate-100">
                        {img.title || "Department Image"}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-amber-300/10 text-amber-200 border border-amber-300/20">
                        {img.type}
                      </span>
                    </div>
                    {img.description && (
                      <p className="text-xs text-slate-400">{img.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            {(dept.members || []).length > 0 && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <MdGroups className="text-2xl text-amber-300" />
                  <h2 className="text-lg font-semibold text-white">Members</h2>
                  <span className="bg-amber-300/10 text-amber-200 px-3 py-1 rounded-full text-xs border border-amber-300/20">
                    {dept.members.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dept.members.map((member) => (
                    <div
                      key={member._id}
                      className="bg-black/20 rounded-2xl overflow-hidden border border-white/5"
                    >
                      <div className="h-52 bg-slate-800">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-amber-400 to-orange-500">
                            {member.name?.charAt(0)?.toUpperCase() || "M"}
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-base font-semibold text-white">{member.name}</h3>
                        {member.role && (
                          <p className="text-sm text-amber-200 mt-1">{member.role}</p>
                        )}

                        {member.bio && (
                          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                            {member.bio}
                          </p>
                        )}

                        <div className="mt-4 space-y-2 text-sm">
                          {member.phone && (
                            <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-slate-300 hover:text-amber-200">
                              <FiPhone />
                              {member.phone}
                            </a>
                          )}
                          {member.email && (
                            <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-slate-300 hover:text-amber-200">
                              <FiMail />
                              {member.email}
                            </a>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {member.socials?.instagram && (
                            <a href={member.socials.instagram} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 text-pink-300 hover:bg-white/10">
                              <FiInstagram />
                            </a>
                          )}
                          {member.socials?.facebook && (
                            <a href={member.socials.facebook} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 text-sky-300 hover:bg-white/10">
                              <FiFacebook />
                            </a>
                          )}
                          {member.socials?.linkedin && (
                            <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 text-blue-300 hover:bg-white/10">
                              <FiLinkedin />
                            </a>
                          )}
                          {member.socials?.x && (
                            <a href={member.socials.x} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10">
                              <FiGlobe />
                            </a>
                          )}
                          {member.socials?.whatsapp && (
                            <a href={member.socials.whatsapp} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 text-emerald-300 hover:bg-white/10">
                              <FiMessageCircle />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(dept.committee || []).length > 0 && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <FaUserTie className="text-xl text-amber-300" />
                  <h2 className="text-lg font-semibold text-white">Committee</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dept.committee.map((m) => (
                    <div key={m._id} className="p-4 bg-black/20 rounded-xl border border-white/5 flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                        {m.imageUrl ? (
                          <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-sky-500 to-indigo-600">
                            {m.name?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-100">{m.name}</div>
                        <div className="text-xs text-slate-400 mb-2">{m.role}</div>
                        {m.phone && <div className="text-xs text-slate-300">{m.phone}</div>}
                        {m.email && <div className="text-xs text-slate-400 break-all">{m.email}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {(dept.plans || []).length > 0 && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <FiTarget className="text-xl text-amber-300" />
                  <h2 className="text-lg font-semibold text-white">Plans</h2>
                </div>
                <ul className="space-y-2">
                  {dept.plans.map((plan, i) => (
                    <li key={i} className="flex items-start gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                      <FiStar className="text-amber-300 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-200">{plan}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(dept.actions || []).length > 0 && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <FiCheckCircle className="text-xl text-amber-300" />
                  <h2 className="text-lg font-semibold text-white">Actions</h2>
                </div>
                <ul className="space-y-2">
                  {dept.actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                      <span className="mt-1 w-2 h-2 rounded-full bg-emerald-300/80 flex-shrink-0" />
                      <span className="text-sm text-slate-200">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 md:p-6 border border-white/10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <FiMessageCircle className="text-2xl text-amber-300" />
              <div>
                <h2 className="text-lg font-semibold text-white">Comments</h2>
                <p className="text-xs text-slate-400">Share your thoughts about this department</p>
              </div>
            </div>

            <div className="bg-amber-300/10 text-amber-200 px-3 py-1 rounded-full text-xs border border-amber-300/20">
              {dept.comments?.length || 0}
            </div>
          </div>

          <div className="mb-6 max-h-[420px] overflow-y-auto pr-2 space-y-4">
            {(dept.comments || []).length === 0 ? (
              <div className="text-center py-10 bg-black/20 rounded-2xl border border-white/5">
                <FiMessageCircle className="text-5xl text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300 text-sm">No comments yet.</p>
              </div>
            ) : (
              dept.comments.map((comment) => (
                <div key={comment._id} className="bg-black/20 p-5 rounded-2xl border border-white/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm">
                        {comment.name?.charAt(0).toUpperCase() || "A"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-amber-200 text-sm">{comment.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <FiClock className="text-[11px]" />
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-200 text-sm leading-relaxed">{comment.text}</p>

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
                                <p className="text-[11px] text-slate-500">
                                  {new Date(reply.createdAt).toLocaleTimeString()}
                                </p>
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
                disabled={!isAuthenticated || submittingComment}
                className="w-full px-4 py-3 bg-black/20 text-slate-100 rounded-2xl border border-white/10 focus:border-amber-300 focus:outline-none"
              />
            </div>

            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || !isAuthenticated || submittingComment}
              className="bg-amber-300 hover:bg-amber-200 text-slate-900 font-semibold px-6 py-3 rounded-2xl transition disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {submittingComment ? <FiLoader className="animate-spin" /> : <FiSend />}
              {submittingComment ? "Posting..." : "Comment"}
            </button>
          </div>
        </div>
      </div>

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
              >
                <FiX />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-300">
                  You are applying to join <span className="text-amber-200 font-semibold">{dept.name}</span>.
                </p>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone</label>
                <input
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 text-slate-100 rounded-xl border border-white/10"
                  placeholder="+250..."
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Message</label>
                <textarea
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-black/20 text-slate-100 rounded-xl border border-white/10 resize-none"
                  placeholder="Why do you want to join?"
                />
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
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DepartmentDetail;