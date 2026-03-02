import React, { useState, useEffect, useContext, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { GiOpenBook } from "react-icons/gi";
import { 
  AiOutlineEye, 
  AiOutlineEyeInvisible, 
  AiOutlineLoading3Quarters,
  AiOutlineMail,
  AiOutlineLock
} from "react-icons/ai";
import { RiShieldUserFill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/img/logo.jpg";
import { AuthContext } from "../context/authContext.jsx";

// Use environment variables for API and video URLs
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;
const API_GOOGLE_AUTH = `${API_BASE_URL}/api/auth/google`;
const BACKGROUND_VIDEO_URL = `${API_BASE_URL}/largeVideo/1756800250256-878408921.mp4`;

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);
  const videoRef = useRef(null);

  // Validate form
  useEffect(() => {
    const isValid = form.email.trim() !== "" && form.password.trim() !== "";
    setFormValid(isValid);
  }, [form.email, form.password]);

  // Redirect if already logged in (based on AuthContext)
  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin");
      else navigate("/home");
    }
  }, [user, navigate]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setForm(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Handle video error fallback
  const handleVideoError = () => {
    console.warn("Background video failed to load, using fallback");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValid) return;
    
    setError("");
    setLoading(true);

    try {
      const res = await fetch(API_LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        console.log("Logged in user data:", data);
        
        if (rememberMe) {
          localStorage.setItem('rememberEmail', form.email);
        } else {
          localStorage.removeItem('rememberEmail');
        }
      } else {
        setError(data.msg || "Invalid email or password");
      }
    } catch (err) {
      setError("Server error, try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth handler
  const handleGoogleLogin = () => {
    window.location.href = API_GOOGLE_AUTH;
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 to-blue-900">
      {/* Background Video with Fallback */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover opacity-50"
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

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center h-full px-4 md:px-20">
        {/* Left Section */}
        <div className="w-full md:w-1/2 p-6 md:p-12 text-center md:text-left mb-8 md:mb-0">
          <div className="max-w-lg mx-auto md:mx-0">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
              <div className="relative">
                <img
                  src={Logo}
                  alt="Groupe Protestant Logo"
                  className="w-20 h-20 md:w-24 md:h-24 rounded-xl shadow-2xl border-2 border-yellow-400/30"
                />
                <div className="absolute -inset-2 bg-yellow-400/20 blur-xl rounded-xl"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-yellow-400">
                  Groupe Protestant
                </h1>
                <p className="text-white font-medium mt-1">Faith Community</p>
              </div>
            </div>

            <div className="md:mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="flex items-start gap-3">
                <GiOpenBook className="text-2xl text-yellow-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <p className="text-lg text-white italic flex items-center gap-2">
                    "Come to me, all you who are weary and burdened, and I will give you rest."
                  </p>
                  <p className="md:mt-4 text-white">– Matthew 11:28</p>
                </div>
              </div>
            </div>

            <div className="mt-6 hidden md:block">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <RiShieldUserFill className="text-blue-400" />
                  <span>Secure Login</span>
                </div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">●</span>
                  <span>24/7 Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full md:w-1/2 max-w-md">
          <div className="backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-xl border border-white/20">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white">
                Welcome Back
              </h2>
              <p className="text-gray-300 mt-2">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-200 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="relative">
                <AiOutlineMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full pl-12 pr-4 py-3 bg-white/20 text-white placeholder-gray-300 rounded-lg outline-none border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <AiOutlineLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-3 bg-white/20 text-white placeholder-gray-300 rounded-lg outline-none border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-gray-300 text-sm">Remember me</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={!formValid || loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                  !formValid || loading
                    ? "bg-blue-500/50 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <AiOutlineLoading3Quarters className="animate-spin" />
                    <span>Logging in...</span>
                  </div>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-gray-600"></div>
              <span className="px-4 text-sm text-gray-400">Or continue with</span>
              <div className="flex-1 h-px bg-gray-600"></div>
            </div>

            {/* Google Login */}
            <div className="mt-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-all duration-200 border border-gray-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FcGoogle className="text-xl" />
                <span>Login with Google</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-sm text-gray-200">
                Don't have an account?{" "}
                <Link 
                  to="/signin" 
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
                >
                  Sign up
                </Link>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                By signing in, you agree to our Terms and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
    </div>
  );
}