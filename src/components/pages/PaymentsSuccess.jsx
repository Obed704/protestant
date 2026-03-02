import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [counter, setCounter] = useState(15);

  useEffect(() => {
    if (counter === 0) {
      navigate("/"); // Redirect to home page when counter hits 0
      return;
    }
    const timer = setTimeout(() => setCounter(counter - 1), 1000);
    return () => clearTimeout(timer);
  }, [counter, navigate]);

  const handleSkip = () => {
    navigate("/"); // Redirect immediately if user clicks skip
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-green-100 via-green-50 to-green-100 text-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h1 className="text-5xl font-extrabold text-green-700 mb-4 animate-bounce">
          ✅ Success!
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          Thank you for your donation.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Transaction ID: <span className="font-mono">{token}</span>
        </p>

        <p className="text-gray-600 mb-4">
          Redirecting to the homepage in{" "}
          <span className="font-bold">{counter}</span> seconds.
        </p>

        <button
          onClick={handleSkip}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300"
        >
          Skip & Go Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
