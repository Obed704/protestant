import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext.jsx";

// Vite env var
const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminDepartments = () => {
  const { token } = useContext(AuthContext);

  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState({
    name: "",
    president: "",
    est: "",
    description: "",
    members: "",
    committee: "",
    plans: "",
    actions: "",
  });

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/departments`, {
        headers: authHeaders,
      });

      // Ensure array
      setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching departments:", err.response?.data || err);
      setDepartments([]); // avoid map crash
    }
  };

  // IMPORTANT: wait for token
  useEffect(() => {
    if (!token) return;
    fetchDepartments();
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const parseArray = (str) =>
    str
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      members: parseArray(formData.members),
      committee: parseArray(formData.committee).map((item) => {
        const [role, name] = item.split(":").map((s) => s.trim());
        return { role, name };
      }),
      plans: parseArray(formData.plans),
      actions: parseArray(formData.actions),
    };

    try {
      if (editingId) {
        await axios.put(
          `${API_BASE_URL}/api/departments/${editingId}`,
          payload,
          { headers: authHeaders }
        );
      } else {
        await axios.post(`${API_BASE_URL}/api/departments`, payload, {
          headers: authHeaders,
        });
      }

      setFormData({
        name: "",
        president: "",
        est: "",
        description: "",
        members: "",
        committee: "",
        plans: "",
        actions: "",
      });

      setEditingId(null);
      setActiveTab("info");
      fetchDepartments();
    } catch (err) {
      console.error("Error saving department:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to save department.");
    }
  };

  const handleEdit = (dept) => {
    setEditingId(dept._id);
    setFormData({
      name: dept.name || "",
      president: dept.president || "",
      est: dept.est || "",
      description: dept.description || "",
      members: (dept.members || []).join("\n"),
      committee: (dept.committee || [])
        .map((c) => `${c.role}: ${c.name}`)
        .join("\n"),
      plans: (dept.plans || []).join("\n"),
      actions: (dept.actions || []).join("\n"),
    });
    setActiveTab("info");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      await axios.delete(`${API_BASE_URL}/api/departments/${id}`, {
        headers: authHeaders,
      });
      fetchDepartments();
    } catch (err) {
      console.error("Error deleting department:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to delete department.");
    }
  };

  const safeDepartments = Array.isArray(departments) ? departments : [];

  return (
    <section className="p-8 min-h-screen bg-gray-100">
      <Link
        to="/admin"
        className="bg-white/80 hover:bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md"
      >
        ← Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
        Department Management
      </h1>

      {/* Form */}
      <div className="bg-white p-6 rounded-2xl shadow max-w-5xl mx-auto mb-10">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Department" : "Add New Department"}
        </h2>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          {["info", "members", "plans"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "info"
                ? "Basic Info"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {activeTab === "info" && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Department Name"
                value={formData.name}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                name="president"
                placeholder="President"
                value={formData.president}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="est"
                placeholder="Established Year"
                value={formData.est}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </>
          )}

          {activeTab === "members" && (
            <>
              <textarea
                name="members"
                placeholder="Members (one per line)"
                value={formData.members}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <textarea
                name="committee"
                placeholder="Committee (role: name per line)"
                value={formData.committee}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </>
          )}

          {activeTab === "plans" && (
            <>
              <textarea
                name="plans"
                placeholder="Plans (one per line)"
                value={formData.plans}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <textarea
                name="actions"
                placeholder="Actions (one per line)"
                value={formData.actions}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-2"
          >
            {editingId ? "Update Department" : "Add Department"}
          </button>
        </form>
      </div>

      {/* Departments List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {safeDepartments.map((dept) => (
          <div
            key={dept._id}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-2xl transition flex flex-col justify-between"
          >
            <div>
              <h3 className="text-2xl font-bold mb-2 text-blue-700">
                {dept.name}
              </h3>
              <p className="mb-1 text-gray-600">President: {dept.president}</p>
              <p className="mb-1 text-gray-600">Established: {dept.est}</p>
              <p className="mb-2 text-gray-700">{dept.description}</p>

              {dept.members?.length > 0 && (
                <p className="mb-1 text-gray-600">
                  Members: {dept.members.join(", ")}
                </p>
              )}

              {dept.committee?.length > 0 && (
                <p className="mb-1 text-gray-600">
                  Committee:{" "}
                  {dept.committee.map((c) => `${c.role}: ${c.name}`).join(", ")}
                </p>
              )}

              {dept.plans?.length > 0 && (
                <p className="mb-1 text-gray-600">
                  Plans: {dept.plans.join(", ")}
                </p>
              )}

              {dept.actions?.length > 0 && (
                <p className="mb-2 text-gray-600">
                  Actions: {dept.actions.join(", ")}
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEdit(dept)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(dept._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminDepartments;
