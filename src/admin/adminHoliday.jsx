
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext.jsx";
import {
  FaTrash,
  FaEdit,
  FaSave,
  FaPlus,
  FaCalendarAlt,
  FaUsers,
  FaCog,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaUserTag,
} from "react-icons/fa";
import {
  AiOutlineLoading3Quarters,
  AiOutlineCheckCircle,
  AiOutlineExclamationCircle,
} from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

// Load API base URL from .env
const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminHolidayParticipants = () => {
  const { user, token } = useContext(AuthContext);

  // --- PARTICIPANTS STATE ---
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // --- SETTINGS STATE ---
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [expandedTabs, setExpandedTabs] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  // Custom styles
  const styles = {
    gradientBg: "bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900",
    cardBg:
      "bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl",
    inputBg: "bg-gray-900/50 backdrop-blur-sm border border-gray-700/50",
    primaryBtn:
      "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
    successBtn:
      "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700",
    dangerBtn:
      "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700",
    warningBtn:
      "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
  };

  // Fetch participants
  const fetchParticipants = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/holiday`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch participants");
      const data = await res.json();
      setParticipants(data);
      toast.success(`Loaded ${data.length} participants`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Fetch holiday settings
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/holiday/settings`);
      const data = await res.json();
      setSettings(data);
      // Initialize expanded tabs
      setExpandedTabs(data?.tabs?.map((_, index) => index) || []);
    } catch (err) {
      toast.error("Failed to fetch settings");
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchParticipants();
      fetchSettings();
    }
  }, [user, token]);

  // --- PARTICIPANTS CRUD ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this participant?"))
      return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/holiday/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete participant");
      setParticipants(participants.filter((p) => p._id !== id));
      toast.success("Participant deleted successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (participant) => {
    setEditingId(participant._id);
    setEditName(participant.name);
    setEditPhone(participant.phone);
  };

  const handleSaveParticipant = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/holiday/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      if (!res.ok) throw new Error("Failed to update participant");
      const updated = await res.json();

      setParticipants(
        participants.map((p) => (p._id === id ? updated.participant : p))
      );
      setEditingId(null);
      toast.success("Participant updated successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- SETTINGS CRUD ---
  const handleSaveSettings = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/holiday/settings/${settings._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settings),
        }
      );
      if (!res.ok) throw new Error("Failed to update settings");
      toast.success("Settings updated successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const addNewTab = () => {
    setSettings({
      ...settings,
      tabs: [...settings.tabs, { label: "New Session", content: "" }],
    });
  };

  const removeTab = (index) => {
    const newTabs = settings.tabs.filter((_, i) => i !== index);
    setSettings({ ...settings, tabs: newTabs });
  };

  const toggleTabExpand = (index) => {
    setExpandedTabs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Filter participants based on search
  const filteredParticipants = participants.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm) ||
      p.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || !token)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AiOutlineExclamationCircle className="text-6xl text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">
            Please log in as an administrator to access this page.
          </p>
        </div>
      </div>
    );

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
          },
        }}
      />

      <div className={`min-h-screen ${styles.gradientBg} p-4 md:p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Holiday Program Management
                </h1>
                <p className="text-gray-400 mt-2">
                  Manage participants and program settings
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-gray-800/50 rounded-xl">
                  <span className="text-gray-400">Total: </span>
                  <span className="text-white font-bold ml-1">
                    {participants.length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div
              className={`${styles.cardBg} p-6 rounded-2xl border border-gray-700/50`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <FaUsers className="text-2xl text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Participants</p>
                  <p className="text-2xl font-bold text-white">
                    {participants.length}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`${styles.cardBg} p-6 rounded-2xl border border-gray-700/50`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <FaCalendarAlt className="text-2xl text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Program Season</p>
                  <p className="text-xl font-bold text-white truncate">
                    {settings?.season || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`${styles.cardBg} p-6 rounded-2xl border border-gray-700/50`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <FaClock className="text-2xl text-emerald-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Sessions</p>
                  <p className="text-2xl font-bold text-white">
                    {settings?.tabs?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`${styles.cardBg} p-6 rounded-2xl border border-gray-700/50`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <FaUserTag className="text-2xl text-amber-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Latest Registration</p>
                  <p className="text-sm text-white truncate">
                    {participants[0]
                      ? new Date(participants[0].createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ------------------ SETTINGS PANEL ------------------ */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div
                className={`${styles.cardBg} rounded-2xl border border-gray-700/50 overflow-hidden`}
              >
                <div
                  className="p-6 cursor-pointer flex items-center justify-between"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FaCog className="text-xl text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Program Settings
                    </h2>
                  </div>
                  {showSettings ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </div>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-700/50"
                    >
                      <div className="p-6 space-y-6">
                        {loadingSettings ? (
                          <div className="flex items-center justify-center py-8">
                            <AiOutlineLoading3Quarters className="animate-spin text-3xl text-blue-400" />
                          </div>
                        ) : settings ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="block text-gray-300 font-medium">
                                  Season
                                </label>
                                <input
                                  type="text"
                                  value={settings.season}
                                  onChange={(e) =>
                                    setSettings({
                                      ...settings,
                                      season: e.target.value,
                                    })
                                  }
                                  className={`w-full ${styles.inputBg} text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                                  placeholder="e.g., Summer 2024"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-gray-300 font-medium">
                                  Program Title
                                </label>
                                <input
                                  type="text"
                                  value={settings.title}
                                  onChange={(e) =>
                                    setSettings({
                                      ...settings,
                                      title: e.target.value,
                                    })
                                  }
                                  className={`w-full ${styles.inputBg} text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                                  placeholder="Program title"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-gray-300 font-medium">
                                Description
                              </label>
                              <textarea
                                value={settings.description}
                                onChange={(e) =>
                                  setSettings({
                                    ...settings,
                                    description: e.target.value,
                                  })
                                }
                                rows="3"
                                className={`w-full ${styles.inputBg} text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                                placeholder="Program description..."
                              />
                            </div>

                            {/* Sessions Management */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="block text-gray-300 font-medium">
                                  Sessions / Activities
                                </label>
                                <button
                                  onClick={addNewTab}
                                  className={`flex items-center gap-2 ${styles.primaryBtn} text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200`}
                                >
                                  <FaPlus /> Add Session
                                </button>
                              </div>

                              <div className="space-y-3">
                                {settings.tabs.map((tab, i) => (
                                  <div
                                    key={i}
                                    className={`${styles.inputBg} rounded-xl overflow-hidden`}
                                  >
                                    <div
                                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/30 transition-colors"
                                      onClick={() => toggleTabExpand(i)}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded-lg">
                                          <span className="text-blue-400 font-bold">
                                            {i + 1}
                                          </span>
                                        </div>
                                        <div>
                                          <input
                                            type="text"
                                            value={tab.label}
                                            onChange={(e) => {
                                              const newTabs = [
                                                ...settings.tabs,
                                              ];
                                              newTabs[i].label = e.target.value;
                                              setSettings({
                                                ...settings,
                                                tabs: newTabs,
                                              });
                                            }}
                                            className={`bg-transparent text-white font-medium text-lg border-none focus:outline-none focus:ring-0`}
                                            placeholder="Session label"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                          <p className="text-sm text-gray-400">
                                            Click to expand
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeTab(i);
                                          }}
                                          className={`${styles.dangerBtn} p-2 rounded-lg`}
                                        >
                                          <FaTrash />
                                        </button>
                                        {expandedTabs.includes(i) ? (
                                          <FaChevronUp className="text-gray-400" />
                                        ) : (
                                          <FaChevronDown className="text-gray-400" />
                                        )}
                                      </div>
                                    </div>

                                    <AnimatePresence>
                                      {expandedTabs.includes(i) && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{
                                            height: "auto",
                                            opacity: 1,
                                          }}
                                          exit={{ height: 0, opacity: 0 }}
                                        >
                                          <div className="p-4 border-t border-gray-700/50">
                                            <textarea
                                              value={tab.content}
                                              onChange={(e) => {
                                                const newTabs = [
                                                  ...settings.tabs,
                                                ];
                                                newTabs[i].content =
                                                  e.target.value;
                                                setSettings({
                                                  ...settings,
                                                  tabs: newTabs,
                                                });
                                              }}
                                              rows="4"
                                              className={`w-full bg-gray-900/50 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                                              placeholder="Session details, time, notes..."
                                            />
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={handleSaveSettings}
                              className={`${styles.successBtn} text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 w-full justify-center`}
                            >
                              <FaSave /> Save All Settings
                            </button>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <AiOutlineExclamationCircle className="text-4xl text-amber-400 mx-auto mb-3" />
                            <p className="text-gray-400">
                              No settings found. Create program settings first.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ------------------ PARTICIPANTS TABLE ------------------ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div
                className={`${styles.cardBg} rounded-2xl border border-gray-700/50 overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FaUsers className="text-blue-400" />
                        Registered Participants
                      </h2>
                      <p className="text-gray-400 mt-1">
                        Manage all holiday program participants
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search participants..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`${styles.inputBg} text-white pl-10 pr-4 py-2.5 rounded-xl w-full md:w-64 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          🔍
                        </div>
                      </div>
                      <button
                        onClick={fetchParticipants}
                        className={`${styles.primaryBtn} p-2.5 rounded-xl hover:shadow-lg transition-all duration-200`}
                        title="Refresh"
                      >
                        ⟳
                      </button>
                    </div>
                  </div>

                  {loadingParticipants ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-400 mx-auto mb-3" />
                        <p className="text-gray-400">Loading participants...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700/50">
                            <th className="py-4 px-4 text-left text-gray-400 font-semibold">
                              #
                            </th>
                            <th className="py-4 px-4 text-left text-gray-400 font-semibold">
                              Participant
                            </th>
                            <th className="py-4 px-4 text-left text-gray-400 font-semibold">
                              Contact
                            </th>
                            <th className="py-4 px-4 text-left text-gray-400 font-semibold">
                              Registered By
                            </th>
                            <th className="py-4 px-4 text-left text-gray-400 font-semibold">
                              Date
                            </th>
                            <th className="py-4 px-4 text-left text-gray-400 font-semibold">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {filteredParticipants.map((p, idx) => (
                              <motion.tr
                                key={p._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                              >
                                <td className="py-4 px-4">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg">
                                    <span className="text-gray-300 font-bold">
                                      {idx + 1}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  {editingId === p._id ? (
                                    <input
                                      value={editName}
                                      onChange={(e) =>
                                        setEditName(e.target.value)
                                      }
                                      className={`${styles.inputBg} text-white p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                                    />
                                  ) : (
                                    <div>
                                      <p className="text-white font-medium">
                                        {p.name}
                                      </p>
                                      <p className="text-sm text-gray-400">
                                        ID: {p._id.slice(-6)}
                                      </p>
                                    </div>
                                  )}
                                </td>
                                <td className="py-4 px-4">
                                  {editingId === p._id ? (
                                    <input
                                      value={editPhone}
                                      onChange={(e) =>
                                        setEditPhone(e.target.value)
                                      }
                                      className={`${styles.inputBg} text-white p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                                    />
                                  ) : (
                                    <p className="text-white">{p.phone}</p>
                                  )}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded-lg">
                                      <FaUserTag className="text-purple-400" />
                                    </div>
                                    <div>
                                      <p className="text-white font-medium">
                                        {p.user?.fullName || "Anonymous"}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {p.user?.email || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div>
                                    <p className="text-white">
                                      {new Date(
                                        p.createdAt
                                      ).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(p.createdAt).toLocaleTimeString(
                                        [],
                                        { hour: "2-digit", minute: "2-digit" }
                                      )}
                                    </p>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    {editingId === p._id ? (
                                      <button
                                        onClick={() =>
                                          handleSaveParticipant(p._id)
                                        }
                                        className={`${styles.successBtn} p-2.5 rounded-lg hover:scale-105 transition-all duration-200`}
                                        title="Save"
                                      >
                                        <AiOutlineCheckCircle className="text-lg" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleEdit(p)}
                                        className={`${styles.primaryBtn} p-2.5 rounded-lg hover:scale-105 transition-all duration-200`}
                                        title="Edit"
                                      >
                                        <FaEdit />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDelete(p._id)}
                                      className={`${styles.dangerBtn} p-2.5 rounded-lg hover:scale-105 transition-all duration-200`}
                                      title="Delete"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>

                      {filteredParticipants.length === 0 && (
                        <div className="text-center py-12">
                          <div className="inline-block p-4 bg-gray-800/50 rounded-2xl mb-4">
                            <FaUsers className="text-4xl text-gray-600" />
                          </div>
                          <p className="text-gray-400 text-lg">
                            No participants found
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            {searchTerm
                              ? "Try a different search term"
                              : "No participants have registered yet"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHolidayParticipants;