// src/context/authContext.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);

  // NEW: loading flag to prevent redirects before localStorage is read
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("user");
      }
    }

    if (storedToken) {
      setTokenState(storedToken);
    }

    setAuthLoading(false);
  }, []);

  const login = (userData, authToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
    setUser(userData);
    setTokenState(authToken);

    console.log(
      "Login successful - Token stored:",
      authToken ? `${authToken.substring(0, 20)}...` : "No token"
    );
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setTokenState(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        authLoading, // NEW: expose loading state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
