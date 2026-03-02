import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { FiPhone, FiMessageCircle, FiHelpCircle, FiX, FiLoader, FiAlertCircle } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/authContext.jsx";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/departments`;

const VISIBLE_DEPARTMENTS_COUNT = 4;

const Departments = () => {
  const { user, token, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [modalDept, setModalDept] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Fetch departments safely
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(API_ENDPOINT);

      // Safely extract array
      let deptsArray = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          deptsArray = res.data;
        } else if (Array.isArray(res.data.departments)) {
          deptsArray = res.data.departments;
        } else if (Array.isArray(res.data.data)) {
          deptsArray = res.data.data;
        }
      }

      setDepartments(deptsArray);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to load departments. Please try again later.");
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Memoized visible departments
  const displayedDepartments = useMemo(() => 
    showAll ? departments : departments.slice(0, VISIBLE_DEPARTMENTS_COUNT),
    [departments, showAll]
  );

  // Add comment with full error handling
  const addComment = async (deptId) => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment) {
      setCommentError("Comment cannot be empty");
      return;
    }

    setCommentError("");
    setSubmittingComment(true);

    if (!isAuthenticated || !token) {
      setCommentError("You must be logged in to comment.");
      setTimeout(() => navigate("/login"), 1500);
      setSubmittingComment(false);
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const res = await axios.post(
        `${API_ENDPOINT}/${deptId}/comments`,
        {
          name: user?.fullName || user?.username || "Anonymous",
          text: trimmedComment,
        },
        config
      );

      // Update local state
      const updatedDept = res.data;
      setDepartments(prev => prev.map(d => d._id === deptId ? updatedDept : d));
      setModalDept(updatedDept);
      setNewComment("");
      setCommentError("");
    } catch (err) {
      console.error("Error adding comment:", err);

      if (err.response?.status === 401) {
        setCommentError("Session expired. Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else if (err.response?.status === 403) {
        setCommentError("You don't have permission to comment.");
      } else {
        setCommentError(
          err.response?.data?.message || "Failed to post comment. Please try again."
        );
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle Enter key in comment input
  const handleKeyDown = (e, deptId) => {
    if (e.key === "Enter" && !e.shiftKey && !submittingComment) {
      e.preventDefault();
      addComment(deptId);
    }
  };

  // Close modal
  const closeModal = () => {
    setModalDept(null);
    setNewComment("");
    setCommentError("");
  };

  // Authentication check for commenting
  const canComment = isAuthenticated && token;

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-20 px-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiLoader className="animate-spin text-5xl text-yellow-300 mx-auto mb-6" />
          <p className="text-xl text-gray-300">Loading departments...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-20 px-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md bg-gray-800/50 backdrop-blur-sm p-10 rounded-2xl border border-red-500/30">
          <FiAlertCircle className="text-6xl text-red-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-red-400 mb-4">Connection Error</h3>
          <p className="text-gray-300 mb-8">{error}</p>
          <button
            onClick={fetchDepartments}
            className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-xl transition shadow-lg"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-6">
            Our Church Departments
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover our dedicated teams serving with passion and excellence
          </p>
        </div>

        {departments.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-16 max-w-md mx-auto">
              <FiHelpCircle className="text-6xl text-gray-600 mx-auto mb-6" />
              <p className="text-2xl text-gray-400">No departments available yet</p>
              <p className="text-gray-500 mt-4">Check back soon for updates!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Departments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {displayedDepartments.map((dept) => (
                <div
                  key={dept._id}
                  className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-3xl p-7 border border-gray-700 hover:border-yellow-400/50 transform hover:-translate-y-3 transition-all duration-500 group"
                >
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-yellow-300 group-hover:text-yellow-200 transition-colors mb-3">
                      {dept.name}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                      {dept.description}
                    </p>
                    <p className="text-gray-400 text-sm">
                      <span className="font-medium text-yellow-300">President:</span> {dept.president}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                    <Link
                      to={`/dept/${dept._id}`}
                      className="text-yellow-300 hover:text-yellow-200 transition flex items-center gap-2 font-medium"
                    >
                      <FiHelpCircle className="text-xl" />
                      <span>Details</span>
                    </Link>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setModalDept(dept)}
                        className="relative flex items-center gap-2 text-gray-300 hover:text-yellow-300 transition"
                        title="View comments"
                      >
                        <FiMessageCircle className="text-xl" />
                        {dept.comments?.length > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {dept.comments.length}
                          </span>
                        )}
                      </button>

                      {dept.phone && (
                        <a
                          href={`tel:${dept.phone}`}
                          className="text-gray-300 hover:text-green-400 transition"
                          title="Call department"
                        >
                          <FiPhone className="text-xl" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More / Less Button */}
            {departments.length > VISIBLE_DEPARTMENTS_COUNT && (
              <div className="text-center mb-12">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold py-4 px-12 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg"
                >
                  {showAll ? "Show Fewer Departments" : `View All ${departments.length} Departments`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comments Modal */}
      {modalDept && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-md"
          onClick={closeModal}
        >
          <div
            className="bg-gray-800 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-3xl border border-yellow-400/30 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-bold mb-2">{modalDept.name}</h3>
                  <p className="text-yellow-100 text-lg">
                    President: <span className="font-semibold">{modalDept.president}</span>
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8">
              <p className="text-gray-300 text-lg leading-relaxed mb-8 italic">
                "{modalDept.description}"
              </p>

              {/* Comments List */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-yellow-300 mb-6 flex items-center">
                  <FiMessageCircle className="mr-3 text-2xl" />
                  Community Feedback ({modalDept.comments?.length || 0})
                </h4>

                {modalDept.comments?.length === 0 ? (
                  <div className="text-center py-12 bg-gray-900/50 rounded-2xl">
                    <FiMessageCircle className="text-6xl text-gray-600 mx-auto mb-6" />
                    <p className="text-gray-400 text-lg">No comments yet</p>
                    <p className="text-gray-500 mt-2">
                      {canComment ? "Be the first to share your thoughts!" : "Login to comment"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {modalDept.comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="bg-gray-900/70 p-6 rounded-2xl border border-gray-700 hover:border-yellow-400/50 transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-gray-900 font-bold">
                              {comment.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-yellow-300">{comment.name}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-200 leading-relaxed mb-4">{comment.text}</p>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-12 pl-6 border-l-4 border-yellow-400/30">
                            <p className="text-sm font-medium text-yellow-300 mb-3">
                              Replies ({comment.replies.length})
                            </p>
                            {comment.replies.map((reply) => (
                              <div key={reply._id} className="mb-4 last:mb-0 bg-gray-800/50 p-4 rounded-xl">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {reply.name.charAt(0).toUpperCase()}
                                  </div>
                                  <p className="text-sm font-medium text-gray-300">{reply.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(reply.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                                <p className="text-gray-400 text-sm">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="border-t-2 border-gray-700 pt-8">
                {commentError && (
                  <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-xl flex items-start gap-3">
                    <FiAlertCircle className="text-2xl text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300">{commentError}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder={
                      canComment
                        ? "Share your thoughts about this department..."
                        : "Please login to comment"
                    }
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      setCommentError("");
                    }}
                    onKeyDown={(e) => handleKeyDown(e, modalDept._id)}
                    disabled={!canComment || submittingComment}
                    className="flex-1 px-6 py-4 bg-gray-900/70 text-gray-100 rounded-2xl border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/20 transition disabled:opacity-60"
                  />

                  <button
                    onClick={() => addComment(modalDept._id)}
                    disabled={!newComment.trim() || !canComment || submittingComment}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3"
                  >
                    {submittingComment ? (
                      <>
                        <FiLoader className="animate-spin text-xl" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      "Post Comment"
                    )}
                  </button>
                </div>

                {!canComment && (
                  <p className="text-gray-400 text-sm mt-4 text-center">
                    You need to be logged in to comment.{" "}
                    <Link to="/login" className="text-yellow-300 hover:underline font-medium">
                      Login here
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Departments;