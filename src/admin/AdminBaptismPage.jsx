import React, { useState, useEffect } from "react";
import axios from "axios";
import EnhancedHeader from "../components/header";
import Footer from "../components/footer";
import {
  Calendar,
  Users,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Download,
  BarChart,
  Filter,
  Search,
  Eye,
  Clock,
  UserCheck,
  BookOpen,
  Settings,
  RefreshCw,
} from "lucide-react";

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.REACT_APP_API_URL;

const AdminBaptismPage = () => {
  const [baptismClasses, setBaptismClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [classForm, setClassForm] = useState({
    title: "",
    description: "",
    preaching: "",
    schedule: {
      startDate: "",
      endDate: "",
      days: [],
      time: "",
      location: "",
    },
    requirements: [""],
    curriculum: [{ week: 1, topic: "", scripture: "", materials: [""] }],
    maxStudents: 20,
    isActive: true,
  });
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    testimony: "",
    assignedMentor: "",
    notes: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    activeStudents: 0,
    baptizedStudents: 0,
    upcomingClasses: 0,
  });
  useEffect(() => {
    fetchClasses();
  }, []);
  useEffect(() => {
    calculateStatistics();
  }, [baptismClasses]);
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/baptism`);
      setBaptismClasses(res.data);
      if (res.data.length > 0 && !selectedClass) {
        setSelectedClass(res.data[0]);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
      alert("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };
  const calculateStatistics = () => {
    const totalClasses = baptismClasses.length;
    let totalStudents = 0;
    let activeStudents = 0;
    let baptizedStudents = 0;
    let upcomingClasses = 0;
    baptismClasses.forEach((cls) => {
      totalStudents += cls.students?.length || 0;
      baptizedStudents += cls.students?.filter((s) => s.baptized).length || 0;
      if (cls.isActive) {
        activeStudents += cls.students?.length || 0;
      }
      if (
        cls.schedule?.startDate &&
        new Date(cls.schedule.startDate) > new Date()
      ) {
        upcomingClasses++;
      }
    });
    setStats({
      totalClasses,
      totalStudents,
      activeStudents,
      baptizedStudents,
      upcomingClasses,
    });
  };
  const handleCreateClass = async () => {
    try {
      const formattedClass = {
        ...classForm,
        requirements: classForm.requirements.filter((req) => req.trim() !== ""),
        curriculum: classForm.curriculum.map((item) => ({
          ...item,
          materials: item.materials.filter((mat) => mat.trim() !== ""),
        })),
      };
      const res = editingClass
        ? await axios.put(
            `${API_BASE_URL}/api/baptism/${editingClass._id}`,
            formattedClass
          )
        : await axios.post(`${API_BASE_URL}/api/baptism`, formattedClass);
      if (editingClass) {
        setBaptismClasses((prev) =>
          prev.map((c) => (c._id === editingClass._id ? res.data : c))
        );
      } else {
        setBaptismClasses((prev) => [res.data, ...prev]);
      }
      setShowClassForm(false);
      resetClassForm();
      alert(`Class ${editingClass ? "updated" : "created"} successfully!`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to save class");
    }
  };
  const handleDeleteClass = async (classId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this class? This will also delete all students in this class."
      )
    ) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/api/baptism/${classId}`);
      setBaptismClasses((prev) => prev.filter((c) => c._id !== classId));
      if (selectedClass?._id === classId) {
        setSelectedClass(baptismClasses[1] || null);
      }
      alert("Class deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete class");
    }
  };
  const handleSaveStudent = async () => {
    if (!studentForm.name.trim()) {
      alert("Please enter student name");
      return;
    }
    try {
      if (editingStudent) {
        // Update existing student
        const res = await axios.put(
          `${API_BASE_URL}/api/baptism/${selectedClass._id}/students/${editingStudent._id}`,
          studentForm
        );
        // Update local state
        const updatedClass = {
          ...selectedClass,
          students: selectedClass.students.map((s) =>
            s._id === editingStudent._id ? { ...s, ...studentForm } : s
          ),
        };
        setSelectedClass(updatedClass);
        setBaptismClasses((prev) =>
          prev.map((c) => (c._id === selectedClass._id ? updatedClass : c))
        );
      } else {
        // Add new student
        const res = await axios.post(
          `${API_BASE_URL}/api/baptism/${selectedClass._id}/students`,
          studentForm
        );
        const updatedClass = {
          ...selectedClass,
          students: res.data,
        };
        setSelectedClass(updatedClass);
        setBaptismClasses((prev) =>
          prev.map((c) => (c._id === selectedClass._id ? updatedClass : c))
        );
      }
      setShowStudentForm(false);
      resetStudentForm();
      alert(`Student ${editingStudent ? "updated" : "added"} successfully!`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to save student");
    }
  };
  const handleUpdateStudentStatus = async (studentId, updates) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/baptism/${selectedClass._id}/students/${studentId}`,
        updates
      );
      // Update local state
      const updatedClass = {
        ...selectedClass,
        students: selectedClass.students.map((s) =>
          s._id === studentId ? { ...s, ...updates } : s
        ),
      };
      setSelectedClass(updatedClass);
      setBaptismClasses((prev) =>
        prev.map((c) => (c._id === selectedClass._id ? updatedClass : c))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update student status");
    }
  };
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }
    try {
      await axios.delete(
        `${API_BASE_URL}/api/baptism/${selectedClass._id}/students/${studentId}`
      );
      // Update local state
      const updatedClass = {
        ...selectedClass,
        students: selectedClass.students.filter((s) => s._id !== studentId),
      };
      setSelectedClass(updatedClass);
      setBaptismClasses((prev) =>
        prev.map((c) => (c._id === selectedClass._id ? updatedClass : c))
      );
      alert("Student deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete student");
    }
  };
  const startEditClass = (cls) => {
    setEditingClass(cls);
    setClassForm({
      title: cls.title || "",
      description: cls.description || "",
      preaching: cls.preaching || "",
      schedule: {
        startDate: cls.schedule?.startDate
          ? new Date(cls.schedule.startDate).toISOString().split("T")[0]
          : "",
        endDate: cls.schedule?.endDate
          ? new Date(cls.schedule.endDate).toISOString().split("T")[0]
          : "",
        days: cls.schedule?.days || [],
        time: cls.schedule?.time || "",
        location: cls.schedule?.location || "",
      },
      requirements: cls.requirements?.length > 0 ? cls.requirements : [""],
      curriculum:
        cls.curriculum?.length > 0
          ? cls.curriculum
          : [{ week: 1, topic: "", scripture: "", materials: [""] }],
      maxStudents: cls.maxStudents || 20,
      isActive: cls.isActive !== undefined ? cls.isActive : true,
    });
    setShowClassForm(true);
  };
  const startEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      dateOfBirth: student.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split("T")[0]
        : "",
      address: student.address || "",
      testimony: student.testimony || "",
      assignedMentor: student.assignedMentor || "",
      notes: student.notes || "",
    });
    setShowStudentForm(true);
  };
  const resetClassForm = () => {
    setClassForm({
      title: "",
      description: "",
      preaching: "",
      schedule: {
        startDate: "",
        endDate: "",
        days: [],
        time: "",
        location: "",
      },
      requirements: [""],
      curriculum: [{ week: 1, topic: "", scripture: "", materials: [""] }],
      maxStudents: 20,
      isActive: true,
    });
    setEditingClass(null);
  };
  const resetStudentForm = () => {
    setStudentForm({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      testimony: "",
      assignedMentor: "",
      notes: "",
    });
    setEditingStudent(null);
  };
  const addRequirement = () => {
    setClassForm((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };
  const updateRequirement = (index, value) => {
    setClassForm((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req, i) =>
        i === index ? value : req
      ),
    }));
  };
  const removeRequirement = (index) => {
    setClassForm((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };
  const addCurriculumItem = () => {
    setClassForm((prev) => ({
      ...prev,
      curriculum: [
        ...prev.curriculum,
        {
          week: prev.curriculum.length + 1,
          topic: "",
          scripture: "",
          materials: [""],
        },
      ],
    }));
  };
  const updateCurriculumItem = (index, field, value) => {
    setClassForm((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };
  const removeCurriculumItem = (index) => {
    setClassForm((prev) => ({
      ...prev,
      curriculum: prev.curriculum.filter((_, i) => i !== index),
    }));
  };
  const addMaterialToCurriculum = (curriculumIndex) => {
    setClassForm((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((item, i) =>
        i === curriculumIndex
          ? {
              ...item,
              materials: [...item.materials, ""],
            }
          : item
      ),
    }));
  };
  const updateMaterial = (curriculumIndex, materialIndex, value) => {
    setClassForm((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((item, i) =>
        i === curriculumIndex
          ? {
              ...item,
              materials: item.materials.map((mat, j) =>
                j === materialIndex ? value : mat
              ),
            }
          : item
      ),
    }));
  };
  const removeMaterial = (curriculumIndex, materialIndex) => {
    setClassForm((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((item, i) =>
        i === curriculumIndex
          ? {
              ...item,
              materials: item.materials.filter((_, j) => j !== materialIndex),
            }
          : item
      ),
    }));
  };
  const handleExportClass = async (cls) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/baptism/${cls._id}/export`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `baptism-class-${cls.title.replace(/\s+/g, "-")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };
  const filteredClasses = baptismClasses.filter(
    (cls) =>
      cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }
  return (
    <div className="bg-gray-50 min-h-screen">
      <EnhancedHeader />
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Baptism Admin Dashboard
              </h1>
              <p className="text-blue-100">
                Manage baptism classes, students, and statistics
              </p>
            </div>
            <button
              onClick={() => {
                resetClassForm();
                setShowClassForm(true);
              }}
              className="flex items-center px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-400 transition"
            >
              <Plus size={20} className="mr-2" />
              New Baptism Class
            </button>
          </div>
        </div>
      </div>
      {/* Admin Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {["dashboard", "classes", "students", "reports"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        {activeTab === "dashboard" && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Classes</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stats.totalClasses}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Students</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stats.totalStudents}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="text-green-600" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Baptized Students</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stats.baptizedStudents}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <UserCheck className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Students</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stats.activeStudents}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="text-yellow-600" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Upcoming Classes</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stats.upcomingClasses}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Calendar className="text-red-600" size={24} />
                  </div>
                </div>
              </div>
            </div>
            {/* Recent Classes */}
            <div className="mt-8 bg-white rounded-xl shadow border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Recent Classes
                </h2>
                <button
                  onClick={fetchClasses}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredClasses.slice(0, 5).map((cls) => (
                      <tr key={cls._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">
                            {cls.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cls.description?.substring(0, 60)}...
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {cls.schedule?.startDate ? (
                            <div className="text-sm">
                              {new Date(
                                cls.schedule.startDate
                              ).toLocaleDateString()}
                              <div className="text-gray-500">
                                {cls.schedule?.time}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No schedule</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium">
                            {cls.students?.length || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            {cls.students?.filter((s) => s.baptized).length ||
                              0}{" "}
                            baptized
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              cls.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {cls.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedClass(cls);
                                setActiveTab("students");
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Students"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => startEditClass(cls)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleExportClass(cls)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Export"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* Classes Tab */}
        {activeTab === "classes" && (
          <div className="bg-white rounded-xl shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    All Baptism Classes
                  </h2>
                  <p className="text-gray-600">
                    Manage and monitor all baptism classes
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search classes..."
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => {
                      resetClassForm();
                      setShowClassForm(true);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus size={20} className="mr-2" />
                    New Class
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClasses.map((cls) => (
                    <tr key={cls._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              cls.isActive ? "bg-blue-100" : "bg-gray-100"
                            }`}
                          >
                            <BookOpen
                              className={
                                cls.isActive ? "text-blue-600" : "text-gray-600"
                              }
                              size={20}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {cls.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {cls.description?.substring(0, 80)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {cls.schedule?.startDate ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {new Date(
                                cls.schedule.startDate
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500">
                              {cls.schedule?.days?.join(", ")}
                            </div>
                            <div className="text-gray-500">
                              {cls.schedule?.time}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not scheduled</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Users size={16} className="mr-2 text-gray-400" />
                            <span className="font-medium">
                              {cls.students?.length || 0}
                            </span>
                            <span className="text-gray-500 text-sm ml-1">
                              / {cls.maxStudents || 20}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {cls.students?.filter((s) => s.baptized).length ||
                              0}{" "}
                            baptized
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                              cls.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {cls.isActive ? "Active" : "Inactive"}
                          </span>
                          {cls.statistics?.completionRate > 0 && (
                            <div className="text-xs text-gray-500">
                              {cls.statistics.completionRate.toFixed(1)}%
                              completion
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedClass(cls);
                              setActiveTab("students");
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Students"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => startEditClass(cls)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Edit Class"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleExportClass(cls)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                            title="Export Data"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(cls._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Class"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredClasses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <BookOpen size={48} className="mx-auto" />
                </div>
                <p className="text-gray-500">No classes found</p>
                <button
                  onClick={() => {
                    resetClassForm();
                    setShowClassForm(true);
                  }}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create First Class
                </button>
              </div>
            )}
          </div>
        )}
        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="space-y-6">
            {/* Class Selection */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Class Students
                  </h2>
                  <p className="text-gray-600">
                    {selectedClass
                      ? selectedClass.title
                      : "Select a class to view students"}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={selectedClass?._id || ""}
                    onChange={(e) => {
                      const cls = baptismClasses.find(
                        (c) => c._id === e.target.value
                      );
                      setSelectedClass(cls || null);
                    }}
                  >
                    <option value="">Select a class...</option>
                    {baptismClasses.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.title} ({cls.students?.length || 0} students)
                      </option>
                    ))}
                  </select>
                  {selectedClass && (
                    <button
                      onClick={() => {
                        resetStudentForm();
                        setShowStudentForm(true);
                      }}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Plus size={20} className="mr-2" />
                      Add Student
                    </button>
                  )}
                </div>
              </div>
              {selectedClass && (
                <>
                  {/* Class Info */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Class Dates</div>
                        <div className="font-medium">
                          {selectedClass.schedule?.startDate
                            ? `${new Date(
                                selectedClass.schedule.startDate
                              ).toLocaleDateString()} - ${new Date(
                                selectedClass.schedule.endDate
                              ).toLocaleDateString()}`
                            : "No dates set"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">
                          Meeting Time
                        </div>
                        <div className="font-medium">
                          {selectedClass.schedule?.time || "No time set"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Location</div>
                        <div className="font-medium">
                          {selectedClass.schedule?.location ||
                            "No location set"}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Students Table */}
                  {selectedClass.students?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Baptism
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedClass.students.map((student) => (
                            <tr key={student._id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div className="font-medium text-gray-900">
                                  {student.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Registered:{" "}
                                  {new Date(
                                    student.dateRegistered
                                  ).toLocaleDateString()}
                                </div>
                                {student.assignedMentor && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    Mentor: {student.assignedMentor}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm">
                                  <div>{student.email || "No email"}</div>
                                  <div className="text-gray-500">
                                    {student.phone || "No phone"}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <select
                                  value={student.status || "pending"}
                                  onChange={(e) =>
                                    handleUpdateStudentStatus(student._id, {
                                      status: e.target.value,
                                    })
                                  }
                                  className="text-sm border rounded px-2 py-1 bg-white"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in_preparation">
                                    In Preparation
                                  </option>
                                  <option value="ready">Ready</option>
                                  <option value="completed">Completed</option>
                                  <option value="dropped">Dropped</option>
                                </select>
                                <div className="text-xs text-gray-500 mt-1">
                                  {student.preparationSessions?.filter(
                                    (s) => s.completed
                                  ).length || 0}{" "}
                                  sessions completed
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="space-y-2">
                                  <label className="inline-flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={student.baptized || false}
                                      onChange={(e) =>
                                        handleUpdateStudentStatus(student._id, {
                                          baptized: e.target.checked,
                                          baptismDate: e.target.checked
                                            ? new Date()
                                            : null,
                                        })
                                      }
                                      className="rounded text-blue-600"
                                    />
                                    <span className="ml-2 text-sm">
                                      {student.baptized
                                        ? "Baptized"
                                        : "Not baptized"}
                                    </span>
                                  </label>
                                  {student.baptized && student.baptismDate && (
                                    <div className="text-xs text-gray-500">
                                      {new Date(
                                        student.baptismDate
                                      ).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => startEditStudent(student)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                                    title="Edit"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteStudent(student._id)
                                    }
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Users size={48} className="mx-auto" />
                      </div>
                      <p className="text-gray-500">
                        No students registered in this class
                      </p>
                      <button
                        onClick={() => {
                          resetStudentForm();
                          setShowStudentForm(true);
                        }}
                        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Add First Student
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Reports & Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Baptism Rate Over Time */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Baptism Completion Rate
                  </h3>
                  <div className="space-y-4">
                    {baptismClasses.map((cls) => (
                      <div key={cls._id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{cls.title}</span>
                          <span className="text-gray-600">
                            {(
                              (cls.statistics?.totalBaptized /
                                (cls.statistics?.totalRegistered || 1)) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (cls.statistics?.totalBaptized /
                                  (cls.statistics?.totalRegistered || 1)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Student Status Distribution */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Student Status Distribution
                  </h3>
                  <div className="space-y-4">
                    {[
                      "pending",
                      "in_preparation",
                      "ready",
                      "completed",
                      "dropped",
                    ].map((status) => {
                      const count = baptismClasses.reduce((total, cls) => {
                        return (
                          total +
                          (cls.students?.filter((s) => s.status === status)
                            .length || 0)
                        );
                      }, 0);
                      return (
                        <div key={status} className="flex items-center">
                          <div className="w-32 text-sm capitalize text-gray-600">
                            {status.replace("_", " ")}:
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                status === "completed"
                                  ? "bg-green-500"
                                  : status === "ready"
                                  ? "bg-blue-500"
                                  : status === "in_preparation"
                                  ? "bg-yellow-500"
                                  : status === "pending"
                                  ? "bg-gray-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${
                                  (count / stats.totalStudents) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="w-12 text-right text-sm font-medium">
                            {count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Export Controls */}
                <div className="border border-gray-200 rounded-lg p-6 md:col-span-2">
                  <h3 className="font-bold text-gray-800 mb-4">Export Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={async () => {
                        try {
                          // Export all classes summary
                          const headers = [
                            "Class Title",
                            "Start Date",
                            "End Date",
                            "Total Students",
                            "Baptized Students",
                            "Completion Rate",
                          ];
                          const csvRows = baptismClasses.map((cls) => [
                            cls.title,
                            cls.schedule?.startDate
                              ? new Date(
                                  cls.schedule.startDate
                                ).toLocaleDateString()
                              : "",
                            cls.schedule?.endDate
                              ? new Date(
                                  cls.schedule.endDate
                                ).toLocaleDateString()
                              : "",
                            cls.students?.length || 0,
                            cls.students?.filter((s) => s.baptized).length || 0,
                            (
                              (cls.students?.filter((s) => s.baptized).length /
                                (cls.students?.length || 1)) *
                              100
                            ).toFixed(1) + "%",
                          ]);
                          const csv = [headers, ...csvRows]
                            .map((row) => row.join(","))
                            .join("\n");
                          const blob = new Blob([csv], { type: "text/csv" });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.setAttribute(
                            "download",
                            "baptism-summary-report.csv"
                          );
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                        } catch (err) {
                          console.error(err);
                          alert("Export failed");
                        }
                      }}
                      className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Download size={18} className="mr-2" />
                      Export Summary Report
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          // Export all students data
                          const headers = [
                            "Class",
                            "Name",
                            "Email",
                            "Phone",
                            "Status",
                            "Baptized",
                            "Baptism Date",
                            "Date Registered",
                          ];
                          const csvRows = [];
                          baptismClasses.forEach((cls) => {
                            cls.students?.forEach((student) => {
                              csvRows.push([
                                cls.title,
                                student.name,
                                student.email || "",
                                student.phone || "",
                                student.status,
                                student.baptized ? "Yes" : "No",
                                student.baptismDate
                                  ? new Date(
                                      student.baptismDate
                                    ).toLocaleDateString()
                                  : "",
                                new Date(
                                  student.dateRegistered
                                ).toLocaleDateString(),
                              ]);
                            });
                          });
                          const csv = [headers, ...csvRows]
                            .map((row) =>
                              row.map((cell) => `"${cell}"`).join(",")
                            )
                            .join("\n");
                          const blob = new Blob([csv], { type: "text/csv" });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.setAttribute(
                            "download",
                            "all-baptism-students.csv"
                          );
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                        } catch (err) {
                          console.error(err);
                          alert("Export failed");
                        }
                      }}
                      className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Download size={18} className="mr-2" />
                      Export All Students
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          // Export statistics
                          const headers = ["Metric", "Value"];
                          const csvRows = [
                            ["Total Classes", stats.totalClasses],
                            ["Total Students", stats.totalStudents],
                            ["Active Students", stats.activeStudents],
                            ["Baptized Students", stats.baptizedStudents],
                            [
                              "Baptism Rate",
                              `${(
                                (stats.baptizedStudents / stats.totalStudents) *
                                100
                              ).toFixed(1)}%`,
                            ],
                            ["Upcoming Classes", stats.upcomingClasses],
                          ];
                          const csv = [headers, ...csvRows]
                            .map((row) => row.join(","))
                            .join("\n");
                          const blob = new Blob([csv], { type: "text/csv" });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.setAttribute(
                            "download",
                            "baptism-statistics.csv"
                          );
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                        } catch (err) {
                          console.error(err);
                          alert("Export failed");
                        }
                      }}
                      className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      <BarChart size={18} className="mr-2" />
                      Export Statistics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Class Form Modal */}
      {showClassForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingClass
                    ? "Edit Baptism Class"
                    : "Create New Baptism Class"}
                </h2>
                <button
                  onClick={() => {
                    setShowClassForm(false);
                    resetClassForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class Title *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        value={classForm.title}
                        onChange={(e) =>
                          setClassForm({ ...classForm, title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Students
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        value={classForm.maxStudents}
                        onChange={(e) =>
                          setClassForm({
                            ...classForm,
                            maxStudents: parseInt(e.target.value) || 20,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      rows="3"
                      value={classForm.description}
                      onChange={(e) =>
                        setClassForm({
                          ...classForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preaching / Message *
                    </label>
                    <textarea
                      required
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      rows="4"
                      value={classForm.preaching}
                      onChange={(e) =>
                        setClassForm({
                          ...classForm,
                          preaching: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                {/* Schedule */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800">Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        value={classForm.schedule.startDate}
                        onChange={(e) =>
                          setClassForm({
                            ...classForm,
                            schedule: {
                              ...classForm.schedule,
                              startDate: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        value={classForm.schedule.endDate}
                        onChange={(e) =>
                          setClassForm({
                            ...classForm,
                            schedule: {
                              ...classForm.schedule,
                              endDate: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meeting Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 7:00 PM - 8:30 PM"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        value={classForm.schedule.time}
                        onChange={(e) =>
                          setClassForm({
                            ...classForm,
                            schedule: {
                              ...classForm.schedule,
                              time: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Main Sanctuary - Room 203"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        value={classForm.schedule.location}
                        onChange={(e) =>
                          setClassForm({
                            ...classForm,
                            schedule: {
                              ...classForm.schedule,
                              location: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                      ].map((day) => (
                        <label key={day} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={classForm.schedule.days.includes(day)}
                            onChange={(e) => {
                              const newDays = e.target.checked
                                ? [...classForm.schedule.days, day]
                                : classForm.schedule.days.filter(
                                    (d) => d !== day
                                  );
                              setClassForm({
                                ...classForm,
                                schedule: {
                                  ...classForm.schedule,
                                  days: newDays,
                                },
                              });
                            }}
                            className="rounded text-blue-600"
                          />
                          <span className="ml-2 text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Requirements */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Requirements</h3>
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Requirement
                    </button>
                  </div>
                  {classForm.requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="e.g., Personal faith in Jesus Christ"
                        className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        value={req}
                        onChange={(e) =>
                          updateRequirement(index, e.target.value)
                        }
                      />
                      {classForm.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="p-3 text-red-600 hover:text-red-800"
                        >
                          <XCircle size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {/* Curriculum */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Curriculum</h3>
                    <button
                      type="button"
                      onClick={addCurriculumItem}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Week
                    </button>
                  </div>
                  {classForm.curriculum.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-gray-800">
                          Week {item.week}
                        </div>
                        {classForm.curriculum.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCurriculumItem(index)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Topic
                          </label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            value={item.topic}
                            onChange={(e) =>
                              updateCurriculumItem(
                                index,
                                "topic",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Scripture Reference
                          </label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            value={item.scripture}
                            onChange={(e) =>
                              updateCurriculumItem(
                                index,
                                "scripture",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Materials
                          </label>
                          <button
                            type="button"
                            onClick={() => addMaterialToCurriculum(index)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            + Add Material
                          </button>
                        </div>
                        {item.materials.map((material, matIndex) => (
                          <div
                            key={matIndex}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <input
                              type="text"
                              placeholder="e.g., Study Guide, Video Link, etc."
                              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                              value={material}
                              onChange={(e) =>
                                updateMaterial(index, matIndex, e.target.value)
                              }
                            />
                            {item.materials.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeMaterial(index, matIndex)}
                                className="p-2 text-red-600 hover:text-red-800"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Status */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800">Status</h3>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={classForm.isActive}
                      onChange={(e) =>
                        setClassForm({
                          ...classForm,
                          isActive: e.target.checked,
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span className="ml-2">
                      Active Class (visible to users)
                    </span>
                  </label>
                </div>
                {/* Form Actions */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCreateClass}
                    disabled={
                      !classForm.title.trim() || !classForm.preaching.trim()
                    }
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingClass ? "Update Class" : "Create Class"}
                  </button>
                  <button
                    onClick={() => {
                      setShowClassForm(false);
                      resetClassForm();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Student Form Modal */}
      {showStudentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingStudent ? "Edit Student" : "Add New Student"}
                </h2>
                <button
                  onClick={() => {
                    setShowStudentForm(false);
                    resetStudentForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={studentForm.name}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={studentForm.email}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={studentForm.phone}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={studentForm.dateOfBirth}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    rows="2"
                    value={studentForm.address}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Testimony / Faith Story
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    rows="4"
                    value={studentForm.testimony}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        testimony: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Mentor
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={studentForm.assignedMentor}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          assignedMentor: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={studentForm.notes}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveStudent}
                    disabled={!studentForm.name.trim()}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingStudent ? "Update Student" : "Add Student"}
                  </button>
                  <button
                    onClick={() => {
                      setShowStudentForm(false);
                      resetStudentForm();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default AdminBaptismPage;