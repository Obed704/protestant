import React, { useState, useEffect } from "react";
import axios from "axios";
import EnhancedHeader from "../components/header";
import Footer from "../components/footer";
import { Calendar, Users, BookOpen, CheckCircle, Download, BarChart, X, Edit } from "lucide-react";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/baptism`;

const BaptismPage = () => {
  const [baptismClasses, setBaptismClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [student, setStudent] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    dateOfBirth: "",
    address: "" 
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStatistics();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINT}?active=true`);
      setBaptismClasses(res.data);
      if (res.data.length > 0 && !selectedClass) {
        setSelectedClass(res.data[0]);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/${selectedClass._id}/statistics`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  };

  const handleRegister = async () => {
    if (!student.name.trim()) {
      alert("Please enter your name");
      return;
    }
    
    try {
      const res = await axios.post(
        `${API_ENDPOINT}/${selectedClass._id}/students`,
        student
      );
      
      // Update local state
      const updatedClass = {
        ...selectedClass,
        students: res.data
      };
      setSelectedClass(updatedClass);
      
      // Reset form
      setStudent({ name: "", email: "", phone: "", dateOfBirth: "", address: "" });
      setShowStudentForm(false);
      
      alert("Registration successful!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleUpdateStudent = async (studentId, updates) => {
    try {
      await axios.put(
        `${API_ENDPOINT}/${selectedClass._id}/students/${studentId}`,
        updates
      );
      
      // Refresh data
      const [classRes, statsRes] = await Promise.all([
        axios.get(`${API_ENDPOINT}/${selectedClass._id}`),
        axios.get(`${API_ENDPOINT}/${selectedClass._id}/statistics`)
      ]);
      
      setSelectedClass(classRes.data);
      setStats(statsRes.data);
      setEditingStudent(null);
      
      alert("Student updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student?")) {
      return;
    }
    
    try {
      await axios.delete(`${API_ENDPOINT}/${selectedClass._id}/students/${studentId}`);
      
      // Refresh data
      const [classRes, statsRes] = await Promise.all([
        axios.get(`${API_ENDPOINT}/${selectedClass._id}`),
        axios.get(`${API_ENDPOINT}/${selectedClass._id}/statistics`)
      ]);
      
      setSelectedClass(classRes.data);
      setStats(statsRes.data);
      
      alert("Student removed successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to remove student");
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(
        `${API_ENDPOINT}/${selectedClass._id}/export`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `baptism-students-${selectedClass.title.replace(/\s+/g, '-')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  const startEditStudent = (student) => {
    setEditingStudent(student);
    setStudent({
      name: student.name,
      email: student.email || "",
      phone: student.phone || "",
      dateOfBirth: student.dateOfBirth || "",
      address: student.address || ""
    });
    setShowStudentForm(true);
  };

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

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative px-4 py-20 md:py-24 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Baptism Preparation
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Journey with us as you prepare for this significant step of faith
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center bg-blue-800 bg-opacity-50 px-4 py-2 rounded-lg">
              <Calendar className="mr-2" size={20} />
              <span>8-Week Program</span>
            </div>
            <div className="flex items-center bg-blue-800 bg-opacity-50 px-4 py-2 rounded-lg">
              <Users className="mr-2" size={20} />
              <span>Personal Mentorship</span>
            </div>
            <div className="flex items-center bg-blue-800 bg-opacity-50 px-4 py-2 rounded-lg">
              <BookOpen className="mr-2" size={20} />
              <span>Biblical Foundation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Class Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Available Classes</h2>
            {selectedClass && (
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Download size={18} className="mr-2" />
                Export List
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {baptismClasses.map(cls => (
              <div
                key={cls._id}
                onClick={() => setSelectedClass(cls)}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  selectedClass?._id === cls._id
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-white border border-gray-200 hover:shadow-lg'
                }`}
              >
                <h3 className="font-bold text-lg mb-2">{cls.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{cls.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={16} className="mr-1" />
                  <span>{cls.schedule?.startDate ? new Date(cls.schedule.startDate).toLocaleDateString() : 'TBD'} - {cls.schedule?.endDate ? new Date(cls.schedule.endDate).toLocaleDateString() : 'TBD'}</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-600">
                    {cls.students?.length || 0} / {cls.maxStudents || 20} students
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    cls.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {cls.isActive ? 'Active' : 'Completed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedClass && (
          <>
            {/* Tabs */}
            <div className="mb-8 border-b border-gray-200">
              <nav className="flex flex-wrap space-x-8">
                {["overview", "curriculum", "students", "statistics"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{selectedClass.title}</h2>
                    <button
                      onClick={() => setActiveTab("students")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      View Students ({selectedClass.students?.length || 0})
                    </button>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed">{selectedClass.preaching}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <h3 className="font-bold text-lg mb-4 text-blue-900">Class Schedule</h3>
                      <div className="space-y-2">
                        <p><strong>Dates:</strong> {selectedClass.schedule?.startDate ? new Date(selectedClass.schedule.startDate).toLocaleDateString() : 'TBD'} - {selectedClass.schedule?.endDate ? new Date(selectedClass.schedule.endDate).toLocaleDateString() : 'TBD'}</p>
                        <p><strong>Days:</strong> {selectedClass.schedule?.days?.join(', ') || 'TBD'}</p>
                        <p><strong>Time:</strong> {selectedClass.schedule?.time || 'TBD'}</p>
                        <p><strong>Location:</strong> {selectedClass.schedule?.location || 'TBD'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-6 rounded-xl">
                      <h3 className="font-bold text-lg mb-4 text-yellow-900">Requirements</h3>
                      {selectedClass.requirements?.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedClass.requirements.map((req, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle size={18} className="mr-2 mt-1 text-yellow-600 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No specific requirements listed.</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowStudentForm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-900 transition"
                    >
                      Register for This Class
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "curriculum" && selectedClass?.curriculum && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Curriculum</h2>
                  {selectedClass.curriculum.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {selectedClass.curriculum.map((week, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="font-bold text-blue-600 mb-2">Week {week.week || index + 1}</div>
                          <h4 className="font-semibold mb-2">{week.topic}</h4>
                          <p className="text-sm text-gray-600 mb-2">{week.scripture}</p>
                          {week.materials && week.materials.length > 0 && (
                            <div className="text-xs text-gray-500">
                              Materials: {week.materials.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Curriculum details coming soon.</p>
                  )}
                </div>
              )}

              {activeTab === "students" && (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Class Students</h2>
                      <p className="text-gray-600">
                        {selectedClass?.students?.length || 0} students enrolled
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingStudent(null);
                          setStudent({ name: "", email: "", phone: "", dateOfBirth: "", address: "" });
                          setShowStudentForm(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Add New Student
                      </button>
                      <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                      >
                        <Download size={18} className="mr-2" />
                        Export
                      </button>
                    </div>
                  </div>
                  
                  {selectedClass?.students?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Baptized
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedClass.students.map((s) => (
                            <tr key={s._id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div className="font-medium text-gray-900">{s.name}</div>
                                <div className="text-sm text-gray-500">
                                  Registered: {new Date(s.dateRegistered).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm text-gray-900">{s.email || 'No email'}</div>
                                <div className="text-sm text-gray-500">{s.phone || 'No phone'}</div>
                              </td>
                              <td className="px-4 py-4">
                                <select
                                  value={s.status}
                                  onChange={(e) => handleUpdateStudent(s._id, { status: e.target.value })}
                                  className="text-sm border rounded px-2 py-1 bg-white"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in_preparation">In Preparation</option>
                                  <option value="ready">Ready</option>
                                  <option value="completed">Completed</option>
                                  <option value="dropped">Dropped</option>
                                </select>
                              </td>
                              <td className="px-4 py-4">
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={s.baptized || false}
                                    onChange={(e) => handleUpdateStudent(s._id, { 
                                      baptized: e.target.checked,
                                      baptismDate: e.target.checked ? new Date() : null 
                                    })}
                                    className="rounded text-blue-600"
                                  />
                                  <span className="ml-2 text-sm text-gray-600">
                                    {s.baptized && s.baptismDate 
                                      ? new Date(s.baptismDate).toLocaleDateString()
                                      : 'Not yet'}
                                  </span>
                                </label>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => startEditStudent(s)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Edit"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStudent(s._id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete"
                                  >
                                    <X size={16} />
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
                      <p className="text-gray-500 text-lg">No students registered yet.</p>
                      <button
                        onClick={() => {
                          setEditingStudent(null);
                          setStudent({ name: "", email: "", phone: "", dateOfBirth: "", address: "" });
                          setShowStudentForm(true);
                        }}
                        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Register First Student
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "statistics" && stats && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Class Statistics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                    <div className="bg-blue-50 p-4 md:p-6 rounded-xl">
                      <div className="text-2xl md:text-3xl font-bold text-blue-700">{stats.total}</div>
                      <div className="text-sm text-gray-600">Total Students</div>
                    </div>
                    <div className="bg-green-50 p-4 md:p-6 rounded-xl">
                      <div className="text-2xl md:text-3xl font-bold text-green-700">{stats.baptized}</div>
                      <div className="text-sm text-gray-600">Baptized</div>
                    </div>
                    <div className="bg-yellow-50 p-4 md:p-6 rounded-xl">
                      <div className="text-2xl md:text-3xl font-bold text-yellow-700">
                        {stats.completionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Completion Rate</div>
                    </div>
                    <div className="bg-purple-50 p-4 md:p-6 rounded-xl">
                      <div className="text-2xl md:text-3xl font-bold text-purple-700">
                        {(selectedClass?.maxStudents || 20) - stats.total}
                      </div>
                      <div className="text-sm text-gray-600">Spots Available</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Status Distribution</h3>
                    <div className="space-y-4">
                      {Object.entries(stats.byStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center">
                          <div className="w-24 md:w-32 text-sm capitalize text-gray-600">
                            {status.replace('_', ' ')}:
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                status === 'completed' ? 'bg-green-500' :
                                status === 'ready' ? 'bg-blue-500' :
                                status === 'in_preparation' ? 'bg-yellow-500' :
                                status === 'pending' ? 'bg-gray-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(count / stats.total) * 100}%` }}
                            ></div>
                          </div>
                          <div className="w-8 md:w-12 text-right text-sm font-medium">{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Student Registration/Edit Modal */}
        {showStudentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingStudent ? 'Edit Student' : 'Register for Baptism'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowStudentForm(false);
                      setEditingStudent(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={student.name}
                      onChange={(e) => setStudent({ ...student, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={student.email}
                      onChange={(e) => setStudent({ ...student, email: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={student.phone}
                      onChange={(e) => setStudent({ ...student, phone: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={student.dateOfBirth}
                      onChange={(e) => setStudent({ ...student, dateOfBirth: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      rows="3"
                      value={student.address}
                      onChange={(e) => setStudent({ ...student, address: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        if (editingStudent) {
                          handleUpdateStudent(editingStudent._id, student);
                        } else {
                          handleRegister();
                        }
                      }}
                      disabled={!student.name.trim()}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingStudent ? 'Update Student' : 'Register'}
                    </button>
                    <button
                      onClick={() => {
                        setShowStudentForm(false);
                        setEditingStudent(null);
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
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to Take the Next Step?</h2>
          <p className="text-lg md:text-xl mb-8 text-blue-100">
            Join our baptism preparation class and deepen your faith journey
          </p>
          <button
            onClick={() => {
              setActiveTab("overview");
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 md:px-8 py-3 md:py-4 bg-yellow-500 text-white text-lg font-semibold rounded-lg hover:bg-yellow-400 transition"
          >
            View Available Classes
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BaptismPage;