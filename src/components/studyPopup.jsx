import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FiCornerDownRight } from "react-icons/fi";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/bibleStudies`;

const StudyPopup = ({ study, onClose }) => {
  const [studyData, setStudyData] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState({});
  const [showReply, setShowReply] = useState({});

  useEffect(() => {
    if (study) {
      setStudyData({
        ...study,
        comments: study.comments || [],
        verses: study.verses || [],
        songs: study.songs || [],
      });
    }
  }, [study]);

  if (!studyData) return null;

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await axios.post(
        `${API_ENDPOINT}/${studyData._id}/comments`,
        { user: "Anonymous", text: commentText }
      );
      setStudyData({ ...studyData, comments: res.data });
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText[commentId]?.trim()) return;
    try {
      const res = await axios.post(
        `${API_ENDPOINT}/${studyData._id}/comments/${commentId}/replies`,
        { user: "Anonymous", text: replyText[commentId] }
      );
      const updatedComments = studyData.comments.map((c) =>
        c._id === commentId ? { ...c, replies: res.data } : c
      );
      setStudyData({ ...studyData, comments: updatedComments });
      setReplyText({ ...replyText, [commentId]: "" });
      setShowReply({ ...showReply, [commentId]: false });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60"
        onClick={onClose}
      />

      {/* Close button OUTSIDE the popup card */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-gray-500 hover:text-black text-lg font-bold bg-white rounded-full p-1 shadow"
      >
        <a href="">✖</a>
      </button>

      {/* Popup container */}
      <div className="relative z-40 bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] p-8">
        {/* Title & CTA */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {studyData.title}
        </h2>
        {studyData.callToAction && (
          <p className="italic text-indigo-600 mb-6">
            {studyData.callToAction}
          </p>
        )}

        {/* Description */}
        <p className="mb-6 text-gray-700 leading-relaxed">
          {studyData.description}
        </p>

        {/* Verses */}
        {studyData.verses.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              📖 Key Verses
            </h3>
            <div className="grid gap-3 mb-6">
              {studyData.verses.map((verse) => (
                <div
                  key={verse._id}
                  className="p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded shadow-sm hover:shadow-md transition"
                >
                  <strong>{verse.reference}:</strong> {verse.text}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Songs */}
        {studyData.songs.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🎵 Suggested Songs
            </h3>
            <div className="grid gap-2 mb-6">
              {studyData.songs.map((song) => (
                <a
                  key={song._id}
                  href={song.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-green-50 rounded shadow-sm hover:bg-green-100 transition text-green-800 font-medium"
                >
                  {song.name}
                </a>
              ))}
            </div>
          </>
        )}

        {/* Comments */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          💬 Comments
        </h3>
        <div className="space-y-4 mb-6">
          {studyData.comments.length > 0 ? (
            studyData.comments.map((comment) => (
              <div
                key={comment._id}
                className="p-4 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <p className="font-semibold text-gray-700">{comment.user}</p>
                <p className="text-gray-600 mt-1">{comment.text}</p>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-6 mt-3 space-y-2">
                    {comment.replies.map((r) => (
                      <p key={r._id} className="text-sm text-gray-500">
                        ↳ <strong>{r.user}:</strong> {r.text}
                      </p>
                    ))}
                  </div>
                )}

                {/* Reply icon */}
                <button
                  className="flex items-center gap-1 text-sm text-indigo-600 mt-2 hover:underline"
                  onClick={() =>
                    setShowReply({
                      ...showReply,
                      [comment._id]: !showReply[comment._id],
                    })
                  }
                >
                  <FiCornerDownRight /> Reply
                </button>

                {/* Reply input */}
                {showReply[comment._id] && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                      value={replyText[comment._id] || ""}
                      onChange={(e) =>
                        setReplyText({
                          ...replyText,
                          [comment._id]: e.target.value,
                        })
                      }
                    />
                    <button
                      className="px-4 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      onClick={() => handleReplySubmit(comment._id)}
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>

        {/* Add new comment */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-400 focus:outline-none"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            onClick={handleCommentSubmit}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyPopup;