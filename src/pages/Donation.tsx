import React, { useState } from "react";
import axios from "axios";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/donations`;

const DonationPage = () => {
  const [donor, setDonor] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    paymentMethod: "MTN",
  });
  const [status, setStatus] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!donor.name || !donor.phone || !donor.amount) {
      alert("Name, Phone and Amount are required!");
      return;
    }

    setLoading(true);
    setStatus("Pending");

    try {
      const res = await axios.post(API_ENDPOINT, donor);
      setTransactionId(res.data.donation._id);
      setStatus("Pending: Please authorize on your phone");

      // Poll for status every 5 seconds
      const interval = setInterval(async () => {
        try {
          const statusRes = await axios.get(API_ENDPOINT);
          const donation = statusRes.data.find(
            (d: any) => d._id === res.data.donation._id
          );
          if (donation && donation.status !== "Pending") {
            setStatus(donation.status);
            clearInterval(interval);
            setLoading(false);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 5000);
    } catch (err) {
      console.error(err);
      setStatus("Error submitting donation");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Support Groupe Protestant
      </h1>

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        <div className="flex flex-col gap-4 mb-4">
          <input
            type="text"
            placeholder="Name"
            className="p-3 border rounded"
            value={donor.name}
            onChange={(e) => setDonor({ ...donor, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="p-3 border rounded"
            value={donor.email}
            onChange={(e) => setDonor({ ...donor, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone"
            className="p-3 border rounded"
            value={donor.phone}
            onChange={(e) => setDonor({ ...donor, phone: e.target.value })}
          />
          <input
            type="number"
            placeholder="Amount"
            className="p-3 border rounded"
            value={donor.amount}
            onChange={(e) => setDonor({ ...donor, amount: e.target.value })}
          />
          <select
            className="p-3 border rounded"
            value={donor.paymentMethod}
            onChange={(e) => setDonor({ ...donor, paymentMethod: e.target.value })}
          >
            <option value="MTN">MTN Money</option>
            <option value="AIRTEL">Airtel Money</option>
          </select>
        </div>

        <button
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : "Donate Now"}
        </button>

        {status && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-center font-semibold">
            {status}
          </div>
        )}

        {transactionId && (
          <div className="mt-2 text-gray-500 text-sm text-center">
            Transaction ID: {transactionId}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationPage;