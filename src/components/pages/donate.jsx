import React, { useState, useEffect } from "react";
import Navbar from "../Header";
import Footer from "../Footer";
import ChatBolt from "../ChatBolt";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const styles = `
@keyframes scrollVertical {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
@keyframes scrollHorizontal {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-scroll-vertical {
  animation: scrollVertical 25s linear infinite;
}
.animate-scroll-horizontal {
  animation: scrollHorizontal 25s linear infinite;
}
`;

// Helper validators
const isPositiveNumber = (v) => {
  if (v === null || v === undefined) return false;
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

const MAX_AMOUNT = 99999999; // safe guard (dollars) to avoid backend/Stripe limits

export default function FundTheirFuturePage() {
  const [leftImages, setLeftImages] = useState([]);
  const [rightImages, setRightImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAmount, setSelectedAmount] = useState(null); // number or 'custom'
  const [customAmount, setCustomAmount] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [paymentType, setPaymentType] = useState("one-time");

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/donation-images`)
      .then((res) => res.json())
      .then((data) => {
        setLeftImages(
          data
            .filter((i) => i.side === "left")
            .map((i) => `${BACKEND_URL}${i.image}`)
        );
        setRightImages(
          data
            .filter((i) => i.side === "right")
            .map((i) => `${BACKEND_URL}${i.image}`)
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching images:", err);
        setLoading(false);
      });
  }, []);

  // Clear custom input when user picks a preset amount
  useEffect(() => {
    if (selectedAmount !== "custom") setCustomAmount("");
  }, [selectedAmount]);

  const donationOptions = [
    { value: 10, label: "$10 - 1-time transport" },
    { value: 100, label: "$100 - Fund a student" },
    { value: 510, label: "$510 - “Kit-Start” a team" },
    { value: 2000, label: "$2000 - Fund a team" },
    { value: "custom", label: "Custom amount" },
  ];

  const getAmount = () => {
    if (selectedAmount === "custom") {
      const raw = String(customAmount).trim();
      if (!raw) return null;
      const num = Number(raw);
      if (!isPositiveNumber(num)) return null;
      if (num > MAX_AMOUNT) return null;
      return Math.round(num * 100) / 100; // normalize to 2dp
    }
    return selectedAmount; // null or number
  };

  const isFormValid = () => {
    const amount = getAmount();
    return (
      isPositiveNumber(amount) &&
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      // simple email pattern check
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
    );
  };

  const handlePayment = async (provider) => {
    setError("");
    const amount = getAmount();

    if (!amount) {
      setError(
        selectedAmount === "custom"
          ? "Please enter a valid custom amount between 0.01 and 99,999,999."
          : "Please select a donation amount."
      );
      return;
    }

    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and a valid email address.");
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setProcessing(true);

    try {
      // Decide endpoint depending on provider + subscription vs one-time
      let endpoint = "";
      if (provider === "paypal") endpoint = "/api/payments/paypal";
      else if (provider === "stripe")
        endpoint = paymentType === "monthly" ? "/api/payments/stripe/subscription" : "/api/payments/stripe";

      // Send amount in dollars as a number (backend should convert to cents or use price ids)
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, message, name, email, paymentType }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const serverMsg = (body && body.error) || (body && body.message) || res.statusText;
        throw new Error(`Server responded with ${res.status}: ${serverMsg}`);
      }

      const data = await res.json();

      if (provider === "paypal") {
        if (data && data.id) {
          // If you test in sandbox, this URL is correct.
          window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${data.id}`;
        } else if (data && data.approvalUrl) {
          // alternate naming
          window.location.href = data.approvalUrl;
        } else {
          throw new Error("PayPal initialization failed: invalid response from server.");
        }
      } else if (provider === "stripe") {
        if (data && data.url) {
          window.location.href = data.url;
        } else if (data && data.sessionId) {
          // If your backend returns a sessionId instead of url
          window.location.href = `${BACKEND_URL}/stripe-checkout?sessionId=${data.sessionId}`;
        } else {
          throw new Error("Stripe initialization failed: invalid response from server.");
        }
      }
    } catch (err) {
      console.error(`${provider} payment error:`, err);
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-600">
        Loading...
      </div>
    );

  return (
    <>
      <style>{styles}</style>

      <div className="bg-blue-500 w-full h-16">
        <Navbar bg="bg-black" />
      </div>

      <ChatBolt />

      {/* Banner */}
      <div
        className="w-[98%] h-28 sm:h-56 bg-center bg-cover mx-auto mt-4"
        style={{ backgroundImage: "url('https://back-11-jtbr.onrender.com/welcomeSlide/table.jpg')" }}
      />

      <main className="bg-gray-50 font-sans min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="hidden md:flex items-center justify-center gap-8 w-full">
          {/* Left scroll */}
          <div className="relative w-44 h-[600px] overflow-hidden rounded-xl shadow-lg bg-white">
            <div className="absolute animate-scroll-vertical space-y-4">
              {leftImages.concat(leftImages).map((img, idx) => (
                <img key={idx} src={img} alt="donation" className="rounded-xl shadow-md w-full object-cover" />
              ))}
            </div>
          </div>

          <DonationForm
            name={name}
            email={email}
            setName={setName}
            setEmail={setEmail}
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            donationOptions={donationOptions}
            selectedAmount={selectedAmount}
            setSelectedAmount={setSelectedAmount}
            customAmount={customAmount}
            setCustomAmount={setCustomAmount}
            message={message}
            setMessage={setMessage}
            handlePayment={handlePayment}
            processing={processing}
            error={error}
            isFormValid={isFormValid}
          />

          {/* Right scroll */}
          <div className="relative w-44 h-[600px] overflow-hidden rounded-xl shadow-lg bg-white">
            <div className="absolute animate-scroll-vertical space-y-4">
              {rightImages.concat(rightImages).map((img, idx) => (
                <img key={idx} src={img} alt="donation" className="rounded-xl shadow-md w-full object-cover" />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex flex-col md:hidden w-full items-center gap-6">
          <div className="relative w-full h-40 overflow-hidden rounded-xl shadow-lg bg-white">
            <div className="absolute flex animate-scroll-horizontal space-x-4">
              {leftImages.concat(rightImages, leftImages).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="donation"
                  className="w-40 h-40 object-cover rounded-lg shadow-md flex-shrink-0"
                />
              ))}
            </div>
          </div>

          <DonationForm
            name={name}
            email={email}
            setName={setName}
            setEmail={setEmail}
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            donationOptions={donationOptions}
            selectedAmount={selectedAmount}
            setSelectedAmount={setSelectedAmount}
            customAmount={customAmount}
            setCustomAmount={setCustomAmount}
            message={message}
            setMessage={setMessage}
            handlePayment={handlePayment}
            processing={processing}
            error={error}
            isFormValid={isFormValid}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}

function DonationForm({
  name,
  email,
  setName,
  setEmail,
  paymentType,
  setPaymentType,
  donationOptions,
  selectedAmount,
  setSelectedAmount,
  customAmount,
  setCustomAmount,
  message,
  setMessage,
  handlePayment,
  processing,
  error,
  isFormValid,
}) {
  return (
    <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center"style={{ color: "rgb(242, 30, 167)" }}>Donate</h2>

      <label className="sr-only">Your Name</label>
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:ring-blue-300"
      />

      <label className="sr-only">Your Email</label>
      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:ring-blue-300"
      />

      <div className="flex justify-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setPaymentType("one-time")}
          className={`px-4 py-2 rounded transition ${
            paymentType === "one-time" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          One-Time
        </button>
        <button
          type="button"
          onClick={() => setPaymentType("monthly")}
          className={`px-4 py-2 rounded transition ${
            paymentType === "monthly" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Monthly
        </button>
      </div>

      {donationOptions.map((opt) => {
        const isSelected = selectedAmount === opt.value;
        return (
          <label
            key={opt.value}
            className={`flex items-center border border-blue-300 rounded-lg px-4 py-3 mb-3 cursor-pointer transition ${
              isSelected
                ? "bg-gradient-to-r from-yellow-200 via-cyan-200 to-pink-300 text-black shadow-lg"
                : "bg-white hover:bg-gray-50"
            }`}
            onClick={() => setSelectedAmount(opt.value)}
          >
            <input
              type="radio"
              name="amount"
              value={opt.value}
              checked={isSelected}
              onChange={() => setSelectedAmount(opt.value)}
              className="mr-3 accent-pink-600"
            />
            {opt.label}
          </label>
        );
      })}

      {selectedAmount === "custom" && (
        <div className="mb-3">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="Enter custom amount (e.g. 25.00)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className={`w-full border rounded-lg px-4 py-3 focus:ring-blue-300 mb-1 ${
              !customAmount ? "border-red-400" : "border-gray-300"
            }`}
          />
          {!customAmount && (
            <p className="text-red-500 text-sm mt-1">Please enter a valid amount.</p>
          )}
          {customAmount && Number(customAmount) > MAX_AMOUNT && (
            <p className="text-red-500 text-sm mt-1">Amount exceeds maximum allowed.</p>
          )}
        </div>
      )}

      <textarea
        placeholder="Write a comment..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full mt-2 border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-300"
      />

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={() => handlePayment("stripe")}
          disabled={processing}
          className={`w-full font-bold py-3 rounded-lg transition ${
            processing ? "opacity-70 cursor-not-allowed" : ""
          }  hover:bg-purple-700 text-white`}
          style={{ backgroundColor: "rgb(23, 207, 220)" ,color: "rgba(219, 249, 154, 1)"}}
          aria-disabled={processing}
        >
          {processing ? "Processing..." : "Pay with Credit Card (Stripe)"}
        </button>

        <button
          onClick={() => handlePayment("paypal")}
          disabled={processing}
          className={`w-full font-bold py-3 rounded-lg transition ${
            processing ? "opacity-70 cursor-not-allowed" : ""
          } hover:bg-yellow-600`}
        
          style={{ backgroundColor: "rgb(247, 244, 46)" ,color: "rgba(23, 205, 219, 1)" }}
          aria-disabled={processing}
        >
          {processing ? "Processing..." : "Pay with PayPal"}
        </button>
      </div>
    </div>
  );
}
