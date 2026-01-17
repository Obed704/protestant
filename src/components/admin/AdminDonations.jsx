import React, { useEffect, useState } from "react";
import NavigationButtons from "./Button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// 🌌 Dark Gradient Palette
const colors = ["#1e3a8a", "#16a34a", "#9333ea"];

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/donations`)
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

  if (loading)
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          background: `linear-gradient(160deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
        }}
      >
        <NavigationButtons/>
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-4"
          style={{ borderColor: colors[1] }}
        ></div>
      </div>
    );

  return (
    <div
      className="p-6 min-h-screen text-gray-100"
      style={{
        background: `linear-gradient(160deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
      }}
    >
      <div className="max-w-6xl mx-auto bg-gray-900/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h1
          className="text-3xl md:text-4xl font-bold text-center mb-10"
          style={{
            background: `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Donations Dashboard
        </h1>

        <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-800">
          <table className="w-full">
            <thead
              style={{
                background: `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
              }}
              className="text-white text-left"
            >
              <tr>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Message</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.length > 0 ? (
                donations.map((d, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-700 hover:bg-gray-800/70 transition-all duration-200"
                  >
                    <td
                      className="py-2 px-4 font-semibold"
                      style={{ color: colors[1] }}
                    >
                      ${d.amount}
                    </td>
                    <td className="py-2 px-4 capitalize text-gray-200">
                      {d.method}
                    </td>
                    <td className="py-2 px-4 text-gray-400">
                      {d.message || "—"}
                    </td>
                    <td
                      className={`py-2 px-4 font-semibold ${
                        d.status.toLowerCase() === "completed"
                          ? "text-green-400"
                          : d.status.toLowerCase() === "pending"
                          ? "text-yellow-400"
                          : "text-red-500"
                      }`}
                    >
                      {d.status}
                    </td>
                    <td className="py-2 px-4 text-gray-300">
                      {new Date(d.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-gray-400 italic"
                  >
                    No donations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDonations;
