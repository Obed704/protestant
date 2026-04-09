import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API_BASE_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || "";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );
  const [authLoading, setAuthLoading] = useState(true); // true until we've attempted restore

  // On mount: restore user from localStorage, then verify token with server
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }

    if (!savedToken) {
      setAuthLoading(false);
      return;
    }

    // Re-validate the token with /api/users/me
    axios
      .get(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
      .then(({ data }) => {
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // Token is invalid/expired — clear session
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = useCallback((userData, tok) => {
    setUser(userData);
    setToken(tok);
    localStorage.setItem("token", tok);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  // Helper: update user in context + storage (for profile edits)
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, authLoading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
