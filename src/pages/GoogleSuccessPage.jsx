import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/authContext.jsx";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ME_ENDPOINT = `${API_BASE_URL}/api/auth/me`;

export default function GoogleSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = params.get("token");

    if (!token) return navigate("/login");

    fetch(API_ME_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to authenticate");
        return res.json();
      })
      .then((data) => {
        login(data, token);
        navigate(data.role === "admin" ? "/admin" : "/home");
      })
      .catch((err) => {
        console.error("Google auth error:", err);
        navigate("/login");
      });
  }, [params, navigate, login]);

  return <p className="text-center py-10">Signing you in with Google…</p>;
}