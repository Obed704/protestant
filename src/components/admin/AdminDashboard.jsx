import React from "react";
import { NavLink } from "react-router-dom";
import NavigationButtons from "./Button";

const AdminDashboard = () => {
  const pages = [
    { name: "Change Password", path: "/change-password" },
    { name: "Emails", path: "/admin-emails" },
    { name: "Champions", path: "/admin-champions" },
    { name: "Mission & Vision", path: "/admin-vision-mission" },
    { name: "Sponsors", path: "/admin-sponsors" },
    { name: "Team", path: "/admin-team" },
    { name: "Resources", path: "/admin-resources" },
    { name: "Donation Page Images", path: "/admin-donation" },
    { name: "Education", path: "/admin-education" },
    { name: "Recruiting", path: "/admin-recruiting-process" },
    { name: "Project Slides", path: "/admin-project-slide" },
    { name: "Champions Gallery", path: "/admin-gallery" },
    { name: "Testimonials / Comments", path: "/admin-testimonials" },
    { name: "Our Commitment", path: "/admin-banner" },
    { name: "Payments and Donations", path: "/admin-payments" },
    { name: "Change map and fll statement", path: "/fll-map" },
    { name: "First Tech Challenge", path: "/admin-ftc" },
    { name: "Header settings", path: "/header-settings" },
    { name: "Welcome settings", path: "/welcome-settings" },
    { name: "Teams Registered", path: "/admin-starts" },
    { name: "Get involved ", path: "/admin-getInvolved" },
    { name: "support component ", path: "/admin-support" },
    { name: "FTC ", path: "/admin-ftc-settings" },
    { name: "Sisters In Stem", path: "/admin-sisters" },
    { name: "Home Slides ", path: "/admin-welcome-slides" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <NavigationButtons />
      
      <div className="max-w-7xl mx-auto bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">STEM Inspire Admin Panel</h1>
              <p className="text-gray-400 text-sm mt-1">Manage website content and settings</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-300">Connected</span>
            </div>
            <div className="text-sm text-gray-400">
              {pages.length} management sections available
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Content Management</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pages.map((page, index) => (
              <NavLink
                key={page.path}
                to={page.path}
                className={({ isActive }) =>
                  `group block bg-gray-700 hover:bg-gray-600 border ${
                    isActive ? "border-blue-500" : "border-gray-600"
                  } rounded-lg p-4 transition-all duration-200 hover:shadow-lg`
                }
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    index % 4 === 0 ? "bg-blue-900/30 text-blue-400" :
                    index % 4 === 1 ? "bg-purple-900/30 text-purple-400" :
                    index % 4 === 2 ? "bg-green-900/30 text-green-400" :
                    "bg-orange-900/30 text-orange-400"
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                      {page.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Configure {page.name.toLowerCase()} settings
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </NavLink>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Last login: {new Date().toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500">
                v1.0.0 • Admin Panel
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
