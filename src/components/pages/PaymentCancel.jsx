import React from "react";

const PaymentCancel = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-center">
    <h1 className="text-4xl font-bold text-red-700 mb-4">Payment Cancelled</h1>
    <p className="text-lg text-gray-700">You cancelled your payment. You can try again anytime.</p>
  </div>
);

export default PaymentCancel;
