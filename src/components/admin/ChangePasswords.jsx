import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import NavigationButtons from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // <-- use .env

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Not authenticated");

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/change-password`, { // <-- dynamic URL
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      alert(data.message);
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <NavigationButtons/>
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 transition-all duration-300 hover:scale-[1.01]">
        <h2 className="text-2xl font-semibold text-center text-white mb-6">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-2">Current Password</label>
            <input
              type="password"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-4 text-white font-semibold rounded-lg transition-all duration-200 ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-6">
          Make sure your new password is strong and unique.
        </p>
      </div>
    </div>
  );
}
