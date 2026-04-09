import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/authContext.jsx";

const AdminRoute = ({ children }) => {
  const { user, token, authLoading } = useContext(AuthContext);
  const location = useLocation();

  // Wait for localStorage restore
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // After loading finished, if still not logged in -> redirect
  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default AdminRoute;
