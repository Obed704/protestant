import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // ✅ Load from .env file

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin");
    if (savedAdmin) setAdmin(JSON.parse(savedAdmin));
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/login`, { // ✅ use env URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        return { success: false, message: data.message || "Login failed" };
      }

      setAdmin(data.admin);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      return { success: false, message: "Server error" };
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
