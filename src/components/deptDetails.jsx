import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

import {
  FiPhone,
  FiMessageCircle,
  FiTarget,
  FiCheckCircle,
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
const BG_IMAGE =
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000";

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
    [user],
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
      setError(
        err.response?.data?.message || "Failed to load department details",
      );
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setJoinFeedback(res.data?.message || "Application submitted.");
      setJoinOpen(false);
      setJoinMessage("");
      setJoinPhone("");
    } catch (err) {
      setJoinFeedback(
        err.response?.data?.message || "Failed to submit application.",
      );
    } finally {
      setJoinSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950" />
        <div className="relative bg-white/5 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/10">
          <FiLoader className="animate-spin text-emerald-400 text-xl mx-auto mb-2" />
          <p className="text-xs text-slate-300">Loading department...</p>
        </div>
      </div>
    );
  }

  if (error || !dept) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950" />
        <div className="relative bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20 max-w-md text-center">
          <FiAlertCircle className="text-4xl text-rose-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">Not Found</h3>
          <p className="text-sm text-slate-300 mb-5">
            {error || "Department doesn't exist."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-white/10 rounded-xl text-sm text-white hover:bg-white/20"
            >
              Back
            </button>
            <Link
              to="/departments"
              className="px-4 py-2 bg-emerald-500/30 text-emerald-300 rounded-xl text-sm hover:bg-emerald-500/40"
            >
              Departments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isMember = (dept.members || []).some(
    (m) =>
      String(m?.name || "")
        .trim()
        .toLowerCase() === String(displayName).trim().toLowerCase(),
  );

  return (
    <div className="relative min-h-screen text-slate-100">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src={BG_IMAGE}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 via-transparent to-emerald-900/30" />
        {/* Animated glass orbs */}
        <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-emerald-500/20 rounded-full blur-[130px] animate-pulse" />
        <div
          className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-cyan-600/20 rounded-full blur-[130px] animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 py-6 lg:py-10">
        {/* Back button - glass */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 text-xs font-medium mb-6 transition bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10"
        >
          <FiChevronLeft size={14} /> Back to Departments
        </button>

        {/* Hero Card - glassmorphism */}
        <div className="rounded-2xl overflow-hidden backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl mb-8">
          <div className="relative h-48 md:h-64">
            {dept.heroImage ? (
              <img
                src={dept.heroImage}
                alt={dept.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-800 via-slate-800 to-emerald-800" />
            )}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {dept.name}
              </h1>
              <div className="flex flex-wrap gap-3 text-xs text-slate-200">
                <span>President: {dept.president}</span>
                {dept.est && <span>Est. {dept.est}</span>}
                {dept.members?.length > 0 && (
                  <span>Members: {dept.members.length}</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <p className="text-sm text-slate-200 leading-relaxed mb-5">
              {dept.description || "No description provided."}
            </p>

            {joinFeedback && (
              <div className="mb-5 text-xs text-emerald-200 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                {joinFeedback}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {dept.phone && (
                <a
                  href={`tel:${dept.phone}`}
                  className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-300 hover:bg-white/20 text-sm flex items-center gap-1.5 transition"
                >
                  <FiPhone size={14} /> Call
                </a>
              )}
              {dept.email && (
                <a
                  href={`mailto:${dept.email}`}
                  className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-300 hover:bg-white/20 text-sm flex items-center gap-1.5 transition"
                >
                  <FiMail size={14} /> Email
                </a>
              )}
              <button
                className={`px-3 py-2 rounded-xl text-sm flex items-center gap-1.5 transition ${
                  isMember
                    ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 cursor-default"
                    : "bg-emerald-500/30 text-emerald-100 hover:bg-emerald-500/40 backdrop-blur-sm border border-emerald-500/30"
                }`}
                onClick={() => !isMember && setJoinOpen(true)}
                disabled={isMember}
              >
                <FiUserPlus size={14} />
                {isMember ? "Already a Member" : "Apply to Join"}
              </button>
            </div>
          </div>
        </div>

        {/* Gallery - glass cards */}
        {(dept.gallery || []).length > 0 && (
          <div className="backdrop-blur-xl bg-white/5 rounded-xl p-5 border border-white/10 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FiImage className="text-emerald-300 text-xl" />
              <h2 className="text-base font-semibold text-white">Gallery</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dept.gallery.map((img) => (
                <div
                  key={img._id}
                  className="bg-black/30 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10"
                >
                  <img
                    src={img.imageUrl}
                    alt={img.title || dept.name}
                    className="w-full h-48 object-cover hover:scale-105 transition duration-300"
                  />
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-xs font-medium text-slate-100">
                        {img.title || "Image"}
                      </h3>
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {img.type}
                      </span>
                    </div>
                    {img.description && (
                      <p className="text-[11px] text-slate-300">
                        {img.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two column layout - glass cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Members */}
            {(dept.members || []).length > 0 && (
              <div className="backdrop-blur-xl bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <MdGroups className="text-emerald-300 text-xl" />
                  <h2 className="text-base font-semibold text-white">
                    Members
                  </h2>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/30">
                    {dept.members.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dept.members.map((member) => (
                    <div
                      key={member._id}
                      className="bg-black/30 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10"
                    >
                      <div className="h-40 bg-slate-800">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-br from-emerald-400 to-teal-500">
                            {member.name?.charAt(0)?.toUpperCase() || "M"}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-white">
                          {member.name}
                        </h3>
                        {member.role && (
                          <p className="text-xs text-emerald-300 mt-0.5">
                            {member.role}
                          </p>
                        )}
                        {member.bio && (
                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            {member.bio}
                          </p>
                        )}
                        <div className="mt-3 space-y-1 text-xs">
                          {member.phone && (
                            <a
                              href={`tel:${member.phone}`}
                              className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-300"
                            >
                              <FiPhone size={12} /> {member.phone}
                            </a>
                          )}
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-300"
                            >
                              <FiMail size={12} /> {member.email}
                            </a>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {member.socials?.instagram && (
                            <a
                              href={member.socials.instagram}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-pink-300 hover:bg-white/20"
                            >
                              <FiInstagram size={12} />
                            </a>
                          )}
                          {member.socials?.facebook && (
                            <a
                              href={member.socials.facebook}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-sky-300 hover:bg-white/20"
                            >
                              <FiFacebook size={12} />
                            </a>
                          )}
                          {member.socials?.linkedin && (
                            <a
                              href={member.socials.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-blue-300 hover:bg-white/20"
                            >
                              <FiLinkedin size={12} />
                            </a>
                          )}
                          {member.socials?.x && (
                            <a
                              href={member.socials.x}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-slate-200 hover:bg-white/20"
                            >
                              <FiGlobe size={12} />
                            </a>
                          )}
                          {member.socials?.whatsapp && (
                            <a
                              href={member.socials.whatsapp}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-emerald-300 hover:bg-white/20"
                            >
                              <FiMessageCircle size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Committee */}
            {(dept.committee || []).length > 0 && (
              <div className="backdrop-blur-xl bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <FaUserTie className="text-emerald-300 text-lg" />
                  <h2 className="text-base font-semibold text-white">
                    Committee
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dept.committee.map((m) => (
                    <div
                      key={m._id}
                      className="p-3 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 flex gap-3"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                        {m.imageUrl ? (
                          <img
                            src={m.imageUrl}
                            alt={m.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-sky-500 to-indigo-600 text-sm">
                            {m.name?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-100">
                          {m.name}
                        </div>
                        <div className="text-xs text-slate-300 mb-1">
                          {m.role}
                        </div>
                        {m.phone && (
                          <div className="text-xs text-slate-300">
                            {m.phone}
                          </div>
                        )}
                        {m.email && (
                          <div className="text-xs text-slate-400 break-all">
                            {m.email}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar - Plans & Actions */}
          <div className="space-y-5">
            {(dept.plans || []).length > 0 && (
              <div className="backdrop-blur-xl bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <FiTarget className="text-emerald-300 text-lg" />
                  <h2 className="text-base font-semibold text-white">Plans</h2>
                </div>
                <ul className="space-y-2">
                  {dept.plans.map((plan, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 p-2 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10"
                    >
                      <FiStar className="text-emerald-300 text-sm mt-0.5 shrink-0" />
                      <span className="text-xs text-slate-200">{plan}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(dept.actions || []).length > 0 && (
              <div className="backdrop-blur-xl bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <FiCheckCircle className="text-emerald-300 text-lg" />
                  <h2 className="text-base font-semibold text-white">
                    Actions
                  </h2>
                </div>
                <ul className="space-y-2">
                  {dept.actions.map((action, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 p-2 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                      <span className="text-xs text-slate-200">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Comments section - glass */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiMessageCircle className="text-emerald-300 text-xl" />
              <div>
                <h2 className="text-base font-semibold text-white">Comments</h2>
                <p className="text-[10px] text-slate-300">
                  Share your thoughts
                </p>
              </div>
            </div>
            <div className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/30">
              {dept.comments?.length || 0}
            </div>
          </div>

          <div className="mb-5 max-h-[360px] overflow-y-auto pr-1 space-y-3">
            {(dept.comments || []).length === 0 ? (
              <div className="text-center py-8 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                <FiMessageCircle className="text-3xl text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No comments yet.</p>
              </div>
            ) : (
              dept.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-slate-900 font-bold text-xs">
                        {comment.name?.charAt(0).toUpperCase() || "A"}
                      </div>
                      <div>
                        <div className="font-semibold text-emerald-200 text-xs">
                          {comment.name}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <FiClock size={10} />{" "}
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {comment.text}
                  </p>
                  {comment.replies?.length > 0 && (
                    <div className="ml-2 pl-3 border-l border-emerald-500/30 mt-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <FaHandsHelping className="text-emerald-300 text-xs" />
                        <h4 className="text-[10px] font-medium text-emerald-200">
                          Replies ({comment.replies.length})
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply._id}
                            className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/10"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                                {reply.name?.charAt(0).toUpperCase() || "R"}
                              </div>
                              <div>
                                <p className="text-[10px] font-medium text-slate-200">
                                  {reply.name}
                                </p>
                                <p className="text-[9px] text-slate-400">
                                  {new Date(
                                    reply.createdAt,
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-300">
                              {reply.text}
                            </p>
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
            <div className="mb-4 p-2.5 bg-rose-500/20 border border-rose-500/30 rounded-lg flex items-start gap-2 backdrop-blur-sm">
              <FiAlertCircle className="text-rose-300 text-sm mt-0.5" />
              <p className="text-rose-200 text-xs">{commentError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder={
                  isAuthenticated ? "Write a comment..." : "Login to comment"
                }
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  setCommentError("");
                }}
                disabled={!isAuthenticated || submittingComment}
                className="w-full px-3 py-2 bg-black/30 backdrop-blur-sm text-slate-100 rounded-xl border border-white/20 focus:border-emerald-400 focus:outline-none text-sm"
              />
            </div>
            <button
              onClick={handleAddComment}
              disabled={
                !newComment.trim() || !isAuthenticated || submittingComment
              }
              className="bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-100 font-medium px-4 py-2 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-1.5 text-sm backdrop-blur-sm"
            >
              {submittingComment ? (
                <FiLoader className="animate-spin" size={14} />
              ) : (
                <FiSend size={14} />
              )}
              {submittingComment ? "Posting..." : "Comment"}
            </button>
          </div>
        </div>
      </div>

      {/* Join Modal - glass */}
      {joinOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FiUserPlus className="text-emerald-300" />
                <h3 className="text-white font-semibold text-sm">
                  Apply to Join
                </h3>
              </div>
              <button
                onClick={() => setJoinOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
              >
                <FiX size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-xs text-slate-200">
                  You are applying to join{" "}
                  <span className="text-emerald-300 font-semibold">
                    {dept.name}
                  </span>
                  .
                </p>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 text-slate-100 rounded-lg border border-white/20 focus:border-emerald-400 outline-none text-sm"
                  placeholder="+250..."
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Message
                </label>
                <textarea
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-black/30 text-slate-100 rounded-lg border border-white/20 focus:border-emerald-400 outline-none resize-none text-sm"
                  placeholder="Why do you want to join?"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setJoinOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyJoin}
                  disabled={joinSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-100 text-xs flex items-center gap-1.5 disabled:opacity-60"
                >
                  {joinSubmitting ? (
                    <FiLoader className="animate-spin" size={12} />
                  ) : (
                    <FiSend size={12} />
                  )}
                  {joinSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetail;
