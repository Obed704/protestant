import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  Calendar,
  ChevronDown,
  X,
  Mail,
  CreditCard,
  Clock,
  MessageCircle,
  User,
  TrendingUp,
  DollarSign,
  BarChart3,
} from "lucide-react";
import NavigationButtons from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const colors = ["#1e3a8a", "#16a34a", "#9333ea"]; // Dark gradient palette

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalDonation, setModalDonation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/payments`)
      .then((res) => res.json())
      .then((data) => {
        setDonations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch donations", err);
        setLoading(false);
      });
  }, []);

  const filteredDonations = useMemo(() => {
    let arr = [...donations];
    if (filterType !== "all") arr = arr.filter((d) => d.type === filterType);
    if (searchTerm) {
      arr = arr.filter(
        (d) =>
          d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (startDate) {
      const start = new Date(startDate);
      arr = arr.filter((d) => new Date(d.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      arr = arr.filter((d) => new Date(d.createdAt) <= end);
    }
    arr.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "amount") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });
    return arr;
  }, [donations, searchTerm, filterType, sortField, sortOrder, startDate, endDate]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900"
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-200 rounded-full animate-pulse opacity-20"></div>
        </div>
      </div>
    );
  }

  const totalAmount = filteredDonations.reduce((sum, d) => sum + Number(d.amount), 0);
  const typeCounts = filteredDonations.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <NavigationButtons/>
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Donations Dashboard
              </h1>
              <p className="text-gray-300 mt-1">Manage and track all incoming donations</p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full p-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Live Data</span>
            </div>
          </div>

          {/* Stats Cards */}
          {filteredDonations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Donations</p>
                    <p className="text-2xl font-bold text-white mt-1">{filteredDonations.length}</p>
                  </div>
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Amount</p>
                    <p className="text-2xl font-bold text-white mt-1">${totalAmount.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">One-time</p>
                    <p className="text-2xl font-bold text-white mt-1">{typeCounts["one-time"] || 0}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Monthly</p>
                    <p className="text-2xl font-bold text-white mt-1">{typeCounts["monthly"] || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Controls */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search donations by name or email..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Desktop Filters */}
              <div className="hidden lg:flex items-center gap-3">
                <select
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all" className="text-black">All Types</option>
                  <option value="one-time" className="text-black">One-time</option>
                  <option value="monthly" className="text-black">Monthly</option>
                </select>

                <select
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="createdAt" className="text-black">Date</option>
                  <option value="amount" className="text-black">Amount</option>
                </select>

                <select
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc" className="text-black">Newest</option>
                  <option value="asc" className="text-black">Oldest</option>
                </select>

                <input
                  type="date"
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Mobile Filter Toggle */}
              <div className="lg:hidden flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-200 text-white"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-white/10 lg:hidden grid grid-cols-2 gap-3">
                <select
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all" className="text-black">All Types</option>
                  <option value="one-time" className="text-black">One-time</option>
                  <option value="monthly" className="text-black">Monthly</option>
                </select>
                <select
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="createdAt" className="text-black">Date</option>
                  <option value="amount" className="text-black">Amount</option>
                </select>
                <select
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc" className="text-black">Newest</option>
                  <option value="asc" className="text-black">Oldest</option>
                </select>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 hover:text-red-200 transition-all duration-200 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Donor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredDonations.length > 0 ? (
                    filteredDonations.map((d, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-semibold text-white">{d.name?.charAt(0) || "A"}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{d.name || "Anonymous"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-400 font-bold">${d.amount}</td>
                        <td className="px-6 py-4 text-sm text-gray-300 truncate max-w-xs">{d.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">{d.provider}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${d.type==='monthly' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30':'bg-green-500/20 text-green-300 border-green-500/30'} border`}>{d.type}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 truncate max-w-xs" title={d.message}>{d.message || "—"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a href={`mailto:${d.email}`} className="text-blue-400 hover:text-blue-300 flex items-center gap-1"><Mail className="w-4 h-4" />Reply</a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <BarChart3 className="w-12 h-12 text-gray-500 mb-4" />
                          <h3 className="text-lg font-medium text-gray-300 mb-2">No donations found</h3>
                          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {filteredDonations.length > 0 ? filteredDonations.map((d, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-sm font-semibold text-white">{d.name?.charAt(0) || "A"}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{d.name || "Anonymous"}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(d.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">Amount</span><span className="text-xl font-bold text-green-400">${d.amount}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">Method</span><span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">{d.provider}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">Type</span><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${d.type==='monthly'?'bg-purple-500/20 text-purple-300 border-purple-500/30':'bg-green-500/20 text-green-300 border-green-500/30'} border`}>{d.type}</span></div>
                    </div>

                    {d.message && (
                      <div className="bg-gray-800/30 p-3 rounded-lg mb-4">
                        <p className="text-sm text-gray-300 flex items-start gap-2"><MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />"{d.message}"</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <a href={`mailto:${d.email}`} className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-all duration-200 text-sm font-medium">
                        <Mail className="w-4 h-4" />Reply
                      </a>
                      <div className="text-xs text-gray-500">{d.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No donations found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>

          {/* Footer Summary */}
          {filteredDonations.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Showing {filteredDonations.length} of {donations.length} donations</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">${totalAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Total Amount</p>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{filteredDonations.length}</p>
                    <p className="text-sm text-gray-400">Total Donations</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDonations;
