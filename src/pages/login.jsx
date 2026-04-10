import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { GiOpenBook, GiCandleFlame, GiChainedHeart } from "react-icons/gi";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineLoading3Quarters,
  AiOutlineMail,
  AiOutlineLock,
  AiFillCheckCircle,
  AiOutlineGlobal,
  AiOutlineSafety,
  AiOutlineArrowLeft,
} from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/img/logo.jpg";
import { AuthContext } from "../context/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const isFormValid =
    form.email.trim().includes("@") && form.password.trim().length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter both email and password");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Login failed");
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      if (rememberMe) localStorage.setItem("rememberEmail", form.email);
      else localStorage.removeItem("rememberEmail");
      login(data.user, data.token);
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      console.error("Login error:", err);
      setError("Connection failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 font-sans">
      {/* Background unchanged */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images2-wpc.corriereobjects.it/GaMcK2kT19CKnHfuS5AK6e_R7bA=/fit-in/1280x720/style.corriere.it/assets/uploads/2025/01/gonzatto-hamza-lahlimi-_HVARV69ABQ-unsplash.jpg?v=543676"
          alt="Spiritual landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 via-transparent to-purple-900/30" />
        <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-amber-500/20 rounded-full blur-[130px] animate-pulse" />
        <div
          className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-fuchsia-600/20 rounded-full blur-[130px] animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl border border-white/20 transition-all duration-200 hover:scale-105"
        >
          <AiOutlineArrowLeft size={18} />
          Back Home
        </Link>
      </div>

      {/* Main container - zoomed out: larger max-width, more padding, larger gap */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 flex flex-col-reverse lg:flex-row items-center justify-between gap-16 lg:gap-20 min-h-screen py-20 lg:py-24">
        {/* Left Hero - more breathing space, slightly smaller text */}
        <div className="hidden lg:block w-full lg:w-1/2 text-center lg:text-left space-y-8">
          <div className="inline-flex items-center justify-center gap-3 p-1.5 pr-5 rounded-full bg-white/5 backdrop-blur-md border border-white/20 shadow-xl">
            <div className="p-2 rounded-full bg-amber-500/20">
              <img
                src={Logo}
                alt="Logo"
                className="w-10 h-10 rounded-full object-cover border border-amber-400/50"
              />
            </div>
            <span className="text-amber-300 font-semibold tracking-wide text-sm">
              Groupe Protestant
            </span>
          </div>

          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              Welcome back to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400">
                your spiritual home
              </span>
            </h1>
            <p className="mt-5 text-lg text-gray-200 max-w-lg leading-relaxed">
              Continue your journey of faith. Access daily devotionals, connect
              with prayer groups, and find peace in a community that walks with
              you.
            </p>
          </div>

          {/* Stats row - more compact */}
          <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-gray-200 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 w-full">
            <div className="flex items-center gap-2">
              <AiOutlineGlobal className="text-amber-400 text-base" />
              <span>Global community</span>
              <span className="ml-1 text-amber-300">12k+</span>
            </div>
            <div className="w-px h-4 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2">
              <AiOutlineSafety className="text-emerald-400 text-base" />
              <span>Encrypted & safe</span>
            </div>
            <div className="w-px h-4 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2">
              <GiOpenBook className="text-sky-400 text-base" />
              <span>Daily devotionals</span>
            </div>
          </div>

          {/* Verse card - slightly reduced padding */}
          <div className="flex items-start gap-4 bg-black/20 backdrop-blur-sm rounded-xl p-4 border-l-4 border-amber-400">
            <GiCandleFlame className="text-amber-300 text-2xl shrink-0 mt-0.5" />
            <div>
              <p className="text-white italic text-sm leading-relaxed">
                “Come to me, all you who are weary and burdened, and I will give
                you rest.”
              </p>
              <p className="text-amber-300/80 text-xs mt-2 font-medium">
                — Matthew 11:28
              </p>
            </div>
          </div>

          {/* Decorative icon - smaller */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <GiChainedHeart className="text-amber-400 text-3xl" />
            </div>
          </div>
        </div>

        {/* Login Card - same max-w-md but with extra outer margin */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md mx-auto lg:mx-0"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 via-rose-500/30 to-purple-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 p-6 sm:p-8 rounded-3xl shadow-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.div
                    key="login-form"
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-white tracking-tight">
                        Welcome back
                      </h2>
                      <p className="text-gray-300 mt-1 text-sm">
                        Sign in to continue your spiritual journey
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="group/field relative">
                        <AiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-amber-400 transition-colors text-lg" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/15 rounded-xl py-3 pl-11 pr-3 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-amber-400/60 focus:bg-white/15 transition-all duration-300 text-sm"
                          placeholder="Email address"
                        />
                      </div>

                      <div className="group/field relative">
                        <AiOutlineLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-amber-400 transition-colors text-lg" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          required
                          value={form.password}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/15 rounded-xl py-3 pl-11 pr-11 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-amber-400/60 focus:bg-white/15 transition-all duration-300 text-sm"
                          placeholder="Password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                        >
                          {showPassword ? (
                            <AiOutlineEyeInvisible size={18} />
                          ) : (
                            <AiOutlineEye size={18} />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs px-1">
                        <label className="flex items-center gap-2 text-gray-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded border-gray-500 bg-white/5 text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
                          />
                          <span>Remember me</span>
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-amber-300 hover:text-amber-200 transition hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <button
                        disabled={!isFormValid || loading}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold py-3 rounded-xl shadow-lg shadow-orange-900/30 transform transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-base"
                      >
                        {loading ? (
                          <AiOutlineLoading3Quarters className="animate-spin mx-auto text-xl" />
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </form>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-2 bg-red-500/20 border border-red-400/40 rounded-lg text-red-100 text-xs text-center backdrop-blur-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/15"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#ffffff0a] px-3 text-gray-300 backdrop-blur-md rounded-full text-xs">
                          or continue with
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        (window.location.href = `${API_BASE_URL}/api/auth/google`)
                      }
                      className="w-full flex items-center justify-center gap-3 bg-white/95 hover:bg-white py-3 rounded-xl text-gray-800 font-medium transition-all shadow-xl backdrop-blur-sm text-sm"
                    >
                      <FcGoogle size={20} /> Google
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <AiFillCheckCircle className="text-emerald-400 text-5xl" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Welcome back!
                    </h2>
                    <p className="text-gray-300 mt-1 text-sm">
                      Redirecting to your dashboard...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 text-center text-xs">
                <span className="text-gray-300">Don't have an account? </span>
                <Link
                  to="/signin"
                  className="text-amber-400 font-semibold hover:text-amber-300 transition underline decoration-amber-400/30"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
