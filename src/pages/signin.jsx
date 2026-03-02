import React, { useState, useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { GiOpenBook } from "react-icons/gi";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineLoading3Quarters,
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineUser,
  AiOutlineCheckCircle,
  AiOutlineArrowLeft,
} from "react-icons/ai";
import { RiShieldUserFill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/img/logo.jpg";

// Use environment variables for API and video URLs
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_REGISTER_ENDPOINT = `${API_BASE_URL}/api/auth/register`;
const API_GOOGLE_AUTH = `${API_BASE_URL}/api/auth/google`;
const BACKGROUND_VIDEO_URL = `${API_BASE_URL}/largeVideo/1756800250256-878408921.mp4`;

export default function SigninPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
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
  const videoRef = useRef(null);

  // Custom styles object
  const styles = {
    floatAnimation: `
      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
        50% { transform: translateY(-20px) rotate(180deg); opacity: 0.3; }
      }
      .animate-float { animation: float linear infinite; }
    `,
    shakeAnimation: `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
      .animate-shake { animation: shake 0.5s ease-in-out; }
    `,
    pulseAnimation: `
      @keyframes pulse-glow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
    `,
  };

  // Password strength checker
  useEffect(() => {
    let strength = 0;
    if (form.password.length >= 6) strength += 1;
    if (/[A-Z]/.test(form.password)) strength += 1;
    if (/[0-9]/.test(form.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) strength += 1;
    setPasswordStrength(strength);
  }, [form.password]);

  // Form validation
  useEffect(() => {
    const isValid =
      form.fullName.trim() !== "" &&
      form.email.trim() !== "" &&
      /\S+@\S+\.\S+/.test(form.email) &&
      form.password.trim() !== "" &&
      form.password.length >= 6 &&
      form.password === form.confirmPassword;
    setFormValid(isValid);
  }, [form]);

  // Clear errors on input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  // Handle video error
  const handleVideoError = () => {
    console.warn("Background video failed to load");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email format";
    if (!form.password) newErrors.password = "Password is required";
    if (form.password.length < 6)
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
      const res = await fetch(API_REGISTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setErrors({ server: data.msg || "Registration failed" });
      }
    } catch (err) {
      setErrors({ server: "Server error. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = API_GOOGLE_AUTH;
  };

  return (
    <>
      {/* Inline Styles */}
      <style>{styles.floatAnimation}</style>
      <style>{styles.shakeAnimation}</style>
      <style>{styles.pulseAnimation}</style>

      <div className="relative min-h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 to-purple-900">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
            autoPlay
            muted
            loop
            playsInline
            onError={handleVideoError}
          >
            <source src={BACKGROUND_VIDEO_URL} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-purple-900/40 to-gray-900/70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/60"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/10 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${20 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            to="/"
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl border border-white/20 transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <AiOutlineArrowLeft />
            Back Home
          </Link>
        </div>

        {/* Success Message */}
        {success && (
          <div className="fixed top-6 right-6 z-50">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-pulse-glow border border-green-400/50">
              <div className="flex items-center gap-3">
                <AiOutlineCheckCircle className="text-2xl" />
                <div>
                  <p className="font-semibold">Registration Successful!</p>
                  <p className="text-sm opacity-90">Redirecting to login...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-screen px-4 md:px-8 lg:px-20 py-8">
          {/* Left Section */}
          <div className="w-full lg:w-1/2 p-6 lg:p-12 text-center lg:text-left mb-8 lg:mb-0">
            <div className="max-w-xl mx-auto lg:mx-0">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 mb-8">
                <div className="relative">
                  <img
                    src={Logo}
                    alt="Groupe Protestant Logo"
                    className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl shadow-2xl border-2 border-yellow-400/30"
                  />
                  <div className="absolute -inset-4 bg-yellow-400/10 blur-xl rounded-2xl"></div>
                </div>
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Groupe Protestant
                  </h1>
                  <p className="text-gray-300 font-medium mt-2 text-lg">
                    Join Our Faith Community
                  </p>
                </div>
              </div>

              <div className="mt-10 p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
                <div className="flex items-start gap-4">
                  <GiOpenBook className="text-3xl text-yellow-400 flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <p className="text-xl lg:text-2xl text-white italic leading-relaxed">
                      "Come to me, all you who are weary and burdened, and I
                      will give you rest."
                    </p>
                    <p className="mt-6 text-gray-300 font-medium text-lg">
                      – Matthew 11:28
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <RiShieldUserFill className="text-blue-400 text-2xl mx-auto mb-2" />
                  <p className="text-gray-300 text-sm">Secure Registration</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="text-green-400 text-2xl mx-auto mb-2">✓</div>
                  <p className="text-gray-300 text-sm">Instant Access</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="text-purple-400 text-2xl mx-auto mb-2">☆</div>
                  <p className="text-gray-300 text-sm">Community Benefits</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="w-full lg:w-1/2 max-w-lg">
            <div className="backdrop-blur-xl bg-white/10 p-8 lg:p-10 rounded-3xl shadow-2xl border border-white/20">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-white">
                  Create Account
                </h2>
                <p className="text-gray-300 mt-2">Join our community today</p>
              </div>

              {/* Server Error */}
              {errors.server && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl animate-shake">
                  <p className="text-red-200 text-center">{errors.server}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <div className="relative">
                    <AiOutlineUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className={`w-full pl-12 pr-4 py-3.5 bg-white/15 text-white placeholder-gray-400 rounded-xl outline-none border transition-all duration-200 ${
                        errors.fullName
                          ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/30"
                          : "border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                      }`}
                      disabled={loading}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-300 text-sm pl-4">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <div className="relative">
                    <AiOutlineMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className={`w-full pl-12 pr-4 py-3.5 bg-white/15 text-white placeholder-gray-400 rounded-xl outline-none border transition-all duration-200 ${
                        errors.email
                          ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/30"
                          : "border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                      }`}
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-300 text-sm pl-4">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="relative">
                    <AiOutlineLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className={`w-full pl-12 pr-12 py-3.5 bg-white/15 text-white placeholder-gray-400 rounded-xl outline-none border transition-all duration-200 ${
                        errors.password
                          ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/30"
                          : "border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <AiOutlineEyeInvisible />
                      ) : (
                        <AiOutlineEye />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-300 text-sm pl-4">
                      {errors.password}
                    </p>
                  )}

                  {/* Password Strength */}
                  {form.password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`flex-1 h-2 rounded-full transition-all duration-300 ${
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
                      <p className="text-xs text-gray-400">
                        {passwordStrength === 0 && "Very weak"}
                        {passwordStrength === 1 && "Weak"}
                        {passwordStrength === 2 && "Fair"}
                        {passwordStrength === 3 && "Good"}
                        {passwordStrength === 4 && "Strong"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <div className="relative">
                    <AiOutlineLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      className={`w-full pl-12 pr-12 py-3.5 bg-white/15 text-white placeholder-gray-400 rounded-xl outline-none border transition-all duration-200 ${
                        errors.confirmPassword
                          ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/30"
                          : "border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <AiOutlineEyeInvisible />
                      ) : (
                        <AiOutlineEye />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-300 text-sm pl-4">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300">
                    I agree to the{" "}
                    <a
                      href="/terms"
                      className="text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!formValid || loading}
                  className={`w-full py-4 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                    !formValid || loading
                      ? "bg-blue-500/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <AiOutlineLoading3Quarters className="animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gray-600"></div>
                <span className="px-4 text-sm text-gray-400">
                  Or sign up with
                </span>
                <div className="flex-1 h-px bg-gray-600"></div>
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 rounded-xl font-medium transition-all duration-200 border border-gray-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FcGoogle className="text-2xl" />
                <span>Continue with Google</span>
              </button>

              {/* Login Link */}
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-gray-300">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-400 hover:text-blue-300 font-semibold transition-colors hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
      </div>
    </>
  );
}