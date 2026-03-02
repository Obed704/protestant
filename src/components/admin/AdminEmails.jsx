import React, { useState, useEffect } from "react";
import NavigationButtons from "./Button";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const colors = ["rgb(247, 244, 46)", "rgb(23, 207, 220)", "rgb(242, 30, 167)"]; // palette

const AdminInbox = () => {
  const [emails, setEmails] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [sortBy, setSortBy] = useState("newest");

  const handleDeleteEmail = async (emailId) => {
  if (!window.confirm("Are you sure you want to delete this email?")) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/emails/${emailId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Delete failed");
    fetchEmails(); // refresh list
  } catch (err) {
    console.error("Failed to delete email:", err);
    alert("Failed to delete email.");
  }
};

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/emails`);
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const toggleSelectEmail = (id) => {
    const newSelected = new Set(selectedEmails);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedEmails(newSelected);
  };

  const selectAllEmails = () => {
    if (selectedEmails.size === filteredEmails.length) setSelectedEmails(new Set());
    else setSelectedEmails(new Set(filteredEmails.map((email) => email._id)));
  };

  // Sort and filter
  const sortedEmails = [...emails].sort((a, b) => {
    const dateA = new Date(a.createdAt || a._id);
    const dateB = new Date(b.createdAt || b._id);
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  const filteredEmails = sortedEmails.filter((e) => {
    const subject = (e.customSubject || e.subject || "").toLowerCase();
    const name = e.name?.toLowerCase() || "";
    const email = e.email?.toLowerCase() || "";

    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      subject.includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || subject.includes(category.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || e.status === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    "All",
    ...new Set(
      emails.map((e) => e.customSubject || e.subject || "Uncategorized").filter(Boolean)
    ),
  ];

  const getStatusColor = (status) => {
    if (status === "read") return colors[1];
    if (status === "unread") return colors[0];
    return colors[2];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleReply = (email) => {
    const subject = encodeURIComponent(email.customSubject || email.subject || "");
    const body = encodeURIComponent(`Hi ${email.name},\n\n`);
    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${email.email}&su=${subject}&body=${body}`;
    window.open(mailtoLink, "_blank");
  };

  if (loading) {
    return (
      <>
        <section className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading emails...</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>

        <NavigationButtons/>

      <section className="min-h-screen pt-28 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-cyan-400 to-pink-500 animate-gradient">
              Admin Inbox
            </h1>
            <p className="text-gray-400 mt-2">Manage and respond to user messages</p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:col-span-2 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-pink-500"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pink-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pink-500"
            >
              <option value="All">All Status</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>
          </div>

          {/* Emails List */}
          <div className="bg-gray-900/70 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedEmails.size === filteredEmails.length &&
                    filteredEmails.length > 0
                  }
                  onChange={selectAllEmails}
                  className="h-4 w-4 text-pink-500 rounded"
                />
                <span className="text-sm text-gray-300">Select All</span>
              </label>

              <span className="text-sm text-gray-400">
                {filteredEmails.length} messages
              </span>
            </div>

            {filteredEmails.map((email) => {
              const isExpanded = expandedId === email._id;
              const isSelected = selectedEmails.has(email._id);

              return (
                <div
                  key={email._id}
                  className={`border-b border-gray-800 transition-all duration-300 hover:bg-gray-800/60 ${
                    isSelected ? "ring-2 ring-pink-400" : ""
                  }`}
                >
                  {/* Email Preview */}
                  <div
                    className="flex justify-between items-center px-6 py-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : email._id)}
                  >
                    
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold"
                        style={{
                          backgroundColor: getStatusColor(email.status),
                        }}
                      >
                        {email.name[0]?.toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-100">{email.name}</p>
                        <p className="text-sm text-gray-400 truncate max-w-[300px]">
                          {email.customSubject || email.subject || "No Subject"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${getStatusColor(email.status)}30`,
                          color: getStatusColor(email.status),
                        }}
                      >
                        {email.status?.toUpperCase() || "NEW"}
                      </span>

                      <p className="text-xs text-gray-500">
                        {formatDate(email.createdAt || email._id)}
                      </p>

                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <div className="mt-4 flex gap-3">
  <button
    onClick={() => handleReply(email)}
    className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white transition-all"
  >
    Reply
  </button>

  <button
    onClick={() => handleDeleteEmail(email._id)}
    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all"
  >
    Delete
  </button>
</div>

                    </div>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className="bg-gray-800/60 px-8 pb-6 animate-fadeIn">
                      <div className="text-gray-300 mt-2 border-t border-gray-700 pt-4 leading-relaxed whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                        {email.message}
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleReply(email)}
                          className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white transition-all"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>



      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 8s ease infinite;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
        `}
      </style>
    </>
  );
};

export default AdminInbox;
