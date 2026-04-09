import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { GiOpenBook, GiCandleFlame } from "react-icons/gi";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineLoading3Quarters,
  AiOutlineMail,
  AiOutlineLock,
  AiFillCheckCircle,
  AiOutlineGlobal,
  AiOutlineSafety,
  AiOutlineUser,
  AiOutlinePicture,
} from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/img/logo.jpg";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_REGISTER_ENDPOINT = `${API_BASE_URL}/api/auth/register`;
const API_GOOGLE_AUTH = `${API_BASE_URL}/api/auth/google`;

export default function SigninPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    avatarUrl: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [success, setSuccess] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let strength = 0;
    if (form.password.length >= 6) strength += 1;
    if (/[A-Z]/.test(form.password)) strength += 1;
    if (/[0-9]/.test(form.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) strength += 1;
    setPasswordStrength(strength);
  }, [form.password]);

  useEffect(() => {
    const emailOk = form.email.trim() !== "" && /\S+@\S+\.\S+/.test(form.email);
    const pwOk =
      form.password.trim() !== "" &&
      form.password.length >= 6 &&
      form.password === form.confirmPassword;
    const avatarOk =
      !form.avatarUrl.trim() || /^https?:\/\/.+/i.test(form.avatarUrl.trim());
    setFormValid(form.fullName.trim() !== "" && emailOk && pwOk && avatarOk);
  }, [form]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email format";
    if (
      form.avatarUrl.trim() &&
      !/^https?:\/\/.+/i.test(form.avatarUrl.trim())
    ) {
      newErrors.avatarUrl = "Avatar URL must start with http:// or https://";
    }
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        avatarUrl: form.avatarUrl,
      };
      const res = await fetch(API_REGISTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErrors({ server: data.msg || "Registration failed" });
        setLoading(false);
      }
    } catch (err) {
      setErrors({ server: "Server error. Please try again later." });
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = API_GOOGLE_AUTH;
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 font-sans">
      {/* Background Image & Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="/img2.jpg"
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

      {/* Top Navigation Bar – slightly more compact for zoom out */}
      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-16 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all group-hover:bg-white/20">
              <img
                src={Logo}
                alt="Logo"
                className="w-7 h-7 rounded-full object-cover"
              />
            </div>
            <span className="text-white font-medium tracking-wide text-sm">
              Groupe Protestant
            </span>
          </Link>
          <div className="hidden md:block text-amber-300/80 text-xs italic tracking-wide">
            “Faith in every step”
          </div>
          <Link
            to="/"
            className="text-gray-200 hover:text-white text-xs font-medium transition px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/15"
          >
            Home
          </Link>
        </div>
      </div>

      {/* Main container – zoomed out: larger max-width, more padding */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-16 min-h-screen py-12 lg:py-20">
        {/* Left Hero – hidden on mobile, slightly reduced text sizes */}
        <div className="hidden lg:block w-full lg:w-1/2 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center justify-center gap-2 p-1 pr-4 rounded-full bg-white/5 backdrop-blur-md border border-white/20 shadow-xl">
            <div className="p-1.5 rounded-full bg-amber-500/20">
              <img
                src={Logo}
                alt="Logo"
                className="w-10 h-10 rounded-full object-cover border border-amber-400/50"
              />
            </div>
            <span className="text-amber-300 font-medium tracking-wide text-xs">
              Groupe Protestant
            </span>
          </div>
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              Nourish your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400">
                Spirit
              </span>
            </h1>
            <p className="mt-4 text-base text-gray-200 max-w-lg leading-relaxed">
              Join a faith-driven community. Access devotionals, prayer groups,
              and inspiring messages — all in one sacred space.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-200 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 w-full">
            <div className="flex items-center gap-1.5">
              <AiOutlineGlobal className="text-amber-400 text-sm" />
              <span>Global community</span>
              <span className="ml-1 text-amber-300">12k+</span>
            </div>
            <div className="w-px h-4 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <AiOutlineSafety className="text-emerald-400 text-sm" />
              <span>Encrypted & safe</span>
            </div>
            <div className="w-px h-4 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <GiOpenBook className="text-sky-400 text-sm" />
              <span>Daily devotionals</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-xl p-3 max-w-md border-l-4 border-amber-400">
            <GiCandleFlame className="text-amber-300 text-xl shrink-0" />
            <p className="text-xs text-gray-200 italic">
              “This platform deepened my faith journey — inspiring messages and
              a truly welcoming community.”
            </p>
          </div>
        </div>

        {/* Signup Card – reduced padding, smaller text, no translate offset */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md mx-auto lg:mx-0"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 via-rose-500/30 to-purple-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 p-5 sm:p-6 rounded-2xl shadow-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.div
                    key="signup-form"
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="text-center mb-5">
                      <h2 className="text-2xl font-bold text-white tracking-tight">
                        Create Account
                      </h2>
                      <p className="text-gray-300 mt-1 text-sm">
                        Join our community today
                      </p>
                    </div>

                    {errors.server && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-2 bg-red-500/20 border border-red-400/40 rounded-lg text-red-100 text-xs text-center backdrop-blur-sm"
                      >
                        {errors.server}
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                      {/* Full Name */}
                      <div className="group/field relative">
                        <AiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-amber-400 transition-colors text-base" />
                        <input
                          type="text"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          className={`w-full bg-white/5 border ${
                            errors.fullName
                              ? "border-red-400"
                              : "border-white/15"
                          } rounded-xl py-2.5 pl-9 pr-3 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-amber-400/60 focus:bg-white/15 transition-all duration-300 text-sm`}
                          placeholder="Full Name"
                          disabled={loading}
                        />
                        {errors.fullName && (
                          <p className="text-red-300 text-xs mt-1 pl-3">
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="group/field relative">
                        <AiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-amber-400 transition-colors text-base" />
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className={`w-full bg-white/5 border ${
                            errors.email ? "border-red-400" : "border-white/15"
                          } rounded-xl py-2.5 pl-9 pr-3 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-amber-400/60 focus:bg-white/15 transition-all duration-300 text-sm`}
                          placeholder="Email Address"
                          disabled={loading}
                        />
                        {errors.email && (
                          <p className="text-red-300 text-xs mt-1 pl-3">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Avatar URL */}
                      <div className="group/field relative">
                        <AiOutlinePicture className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-amber-400 transition-colors text-base" />
                        <input
                          type="text"
                          name="avatarUrl"
                          value={form.avatarUrl}
                          onChange={handleChange}
                          className={`w-full bg-white/5 border ${
                            errors.avatarUrl
                              ? "border-red-400"
                              : "border-white/15"
                          } rounded-xl py-2.5 pl-9 pr-3 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-amber-400/60 focus:bg-white/15 transition-all duration-300 text-sm`}
                          placeholder="Avatar URL (optional)"
                          disabled={loading}
                        />
                        <p className="text-gray-400/70 text-[11px] mt-1 pl-3">
                          Public image link (https://...)
                        </p>
                        {errors.avatarUrl && (
                          <p className="text-red-300 text-xs mt-1 pl-3">
                            {errors.avatarUrl}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="group/field relative">
                        <AiOutlineLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-amber-400 transition-colors text-base" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          className={`w-full bg-white/5 border ${
                            errors.password
                              ? "border-red-400"
                              : "border-white/15"
                          } rounded-xl py-2.5 pl-9 pr-9 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-amber-400/60 focus:bg-white/15 transition-all duration-300 text-sm`}
                          placeholder="Password"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                        >
                          {showPassword ? (
                            <AiOutlineEyeInvisible size={16} />
                          ) : (
                            <AiOutlineEye size={16} />
                          )}
                        </button>
                        {errors.password && (
                          <p className="text-red-300 text-xs mt-1 pl-3">
                            {errors.password}
                          </p>
                        )}
                      </div>

                      {/* Password Strength */}
                      {form.password && (
                        <div className="space-y-1 px-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                                  passwordStrength >= level
                                    ? level === 1
                                      ? "bg-red-400"
                                      : level === 2
                                        ? "bg-orange-400"
                                        : level === 3
                                          ? "bg-yellow-400"
                                          : "bg-green-400"
                                    : "bg-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-[11px] text-gray-400">
                            {passwordStrength === 0 && "Very weak"}
                            {passwordStrength === 1 && "Weak"}
                            {passwordStrength === 2 && "Fair"}
                            {passwordStrength === 3 && "Good"}
                            {passwordStrength === 4 && "Strong"}
                          </p>
                        </div>
                      )}

                      {/* Confirm Password */}
                      <div className="group/field relative">
                        <AiOutlineLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-amber-400 transition-colors text-base" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          className={`w-full bg-white/5 border ${
                            errors.confirmPassword
                              ? "border-red-400"
                              : "border-white/15"
                          } rounded-xl py-2.5 pl-9 pr-9 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-amber-400/60 focus:bg-white/15 transition-all duration-300 text-sm`}
                          placeholder="Confirm Password"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                        >
                          {showConfirmPassword ? (
                            <AiOutlineEyeInvisible size={16} />
                          ) : (
                            <AiOutlineEye size={16} />
                          )}
                        </button>
                        {errors.confirmPassword && (
                          <p className="text-red-300 text-xs mt-1 pl-3">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>

                      {/* Terms */}
                      <div className="flex items-start gap-2 px-1">
                        <input
                          type="checkbox"
                          id="terms"
                          required
                          className="mt-0.5 w-3.5 h-3.5 rounded border-gray-500 bg-white/5 text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
                        />
                        <label
                          htmlFor="terms"
                          className="text-xs text-gray-300"
                        >
                          I agree to the{" "}
                          <a
                            href="/terms"
                            className="text-amber-300 hover:underline"
                          >
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a
                            href="/privacy"
                            className="text-amber-300 hover:underline"
                          >
                            Privacy Policy
                          </a>
                        </label>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={!formValid || loading}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-orange-900/30 transform transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {loading ? (
                          <AiOutlineLoading3Quarters className="animate-spin mx-auto text-lg" />
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    </form>

                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/15"></span>
                      </div>
                      <div className="relative flex justify-center text-[11px] uppercase">
                        <span className="bg-[#ffffff0a] px-2 text-gray-300 backdrop-blur-md rounded-full">
                          or sign up with
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleGoogleSignup}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-white/95 hover:bg-white py-2.5 rounded-xl text-gray-800 font-medium transition-all shadow-xl backdrop-blur-sm text-sm"
                    >
                      <FcGoogle size={18} />
                      Google
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                      <AiFillCheckCircle className="text-emerald-400 text-4xl" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Registration Successful!
                    </h2>
                    <p className="text-gray-300 mt-1 text-sm">
                      Redirecting to login...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-5 text-center text-xs">
                <span className="text-gray-300">Already have an account? </span>
                <Link
                  to="/login"
                  className="text-amber-400 font-semibold hover:text-amber-300 transition underline decoration-amber-400/30"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
