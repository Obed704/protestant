import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import Navbar from "../Header.jsx";
import Footer from "../Footer.jsx";
import ChatBolt from "../ChatBolt.jsx";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

// STEM Colors
const STEM_COLORS = ['rgb(247, 244, 46)', 'rgb(23, 207, 220)', 'rgb(242, 30, 167)'];

/* -----------------------------
   FloatingInput Component
   ------------------------------*/
export const FloatingInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  autoComplete = "",
}) => {
  const inputRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const hasValue = Boolean(value && value.toString().trim().length);
    gsap.to(labelRef.current, {
      y: hasValue ? -22 : 0,
      scale: hasValue ? 0.85 : 1,
      color: hasValue ? STEM_COLORS[1] : "#cbd5e1",
      duration: 0.18,
      ease: "power1.out",
    });
  }, [value]);

  const handleFocus = () => {
    gsap.to(labelRef.current, { y: -22, scale: 0.85, color: STEM_COLORS[1], duration: 0.18 });
  };

  const handleBlur = () => {
    const hasValue = Boolean(inputRef.current.value && inputRef.current.value.trim().length);
    if (!hasValue) {
      gsap.to(labelRef.current, { y: 0, scale: 1, color: "#cbd5e1", duration: 0.18 });
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder=" "
        required={required}
        autoComplete={autoComplete}
        className="w-full px-4 py-4 bg-black/30 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none transition"
      />
      <label
        ref={labelRef}
        htmlFor={id}
        className="absolute left-4 top-4 text-gray-300 pointer-events-none origin-left select-none"
      >
        {label} {required ? "*" : ""}
      </label>
    </div>
  );
};

/* -----------------------------
   FloatingTextarea Component
   ------------------------------*/
export const FloatingTextarea = ({ id, label, value, onChange, rows = 6 }) => {
  const taRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const hasValue = Boolean(value && value.toString().trim().length);
    gsap.to(labelRef.current, {
      y: hasValue ? -22 : 0,
      scale: hasValue ? 0.85 : 1,
      color: hasValue ? STEM_COLORS[1] : "#cbd5e1",
      duration: 0.18,
    });
  }, [value]);

  const handleFocus = () => gsap.to(labelRef.current, { y: -22, scale: 0.85, color: STEM_COLORS[1], duration: 0.18 });
  const handleBlur = () => {
    const hasValue = Boolean(taRef.current.value && taRef.current.value.trim().length);
    if (!hasValue) gsap.to(labelRef.current, { y: 0, scale: 1, color: "#cbd5e1", duration: 0.18 });
  };

  return (
    <div className="relative w-full h-full">
      <textarea
        ref={taRef}
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder=" "
        className="w-full px-4 py-4 bg-black/30 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none transition resize-none h-40"
      />
      <label ref={labelRef} htmlFor={id} className="absolute left-4 top-4 text-gray-300 pointer-events-none select-none">
        {label}
      </label>
    </div>
  );
};

/* -----------------------------
   FloatingSelect Component
   ------------------------------*/
export const FloatingSelect = ({ id, label, value, onChange, options = [] }) => {
  const labelRef = useRef(null);

  useEffect(() => {
    const hasValue = Boolean(value && value.toString().trim().length);
    gsap.to(labelRef.current, { y: hasValue ? -22 : 0, scale: hasValue ? 0.85 : 1, color: hasValue ? STEM_COLORS[1] : "#cbd5e1", duration: 0.18 });
  }, [value]);

  return (
    <div className="relative w-full">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-black/30 text-gray-200 border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none transition appearance-none"
      >
        <option value="" className="bg-gray-800 text-gray-500">Choose a subject</option>
        {options.map((opt) => (
          <option key={opt} value={opt}  className="bg-gray-800 text-gray-200">
            {opt}
          </option>
        ))}
      </select>
      <label ref={labelRef} htmlFor={id} className="absolute left-4 top-4 text-gray-300 pointer-events-none select-none">
        {label}
      </label>
      <div className="absolute right-3 top-4 pointer-events-none text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
    </div>
  );
};

/* -----------------------------
   ContactForm Component
   ------------------------------*/
const SUBJECT_OPTIONS = [
  "Donating Money",
  "Used Pieces for FTC",
  "Used Pieces for FLL",
  "Sharing Skills",
  "Helping Hand",
  "Take It To Your School",
];

export const ContactForm = ({ backendUrl = BACKEND_URL }) => {
  const location = useLocation();
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    customSubject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [presetSubject, setPresetSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selected = params.get("subject");
    if (selected) {
      setFormData((p) => ({ ...p, customSubject: selected }));
      setPresetSubject(selected);
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "subject") {
      setFormData((p) => ({ ...p, subject: value, customSubject: "" }));
    } else if (id === "customSubject") {
      setFormData((p) => ({ ...p, customSubject: value, subject: "" }));
    } else {
      setFormData((p) => ({ ...p, [id]: value }));
    }
    setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const validate = () => {
    const e = {};
    if ((formData.name || "").trim().length < 3) e.name = "Name must be at least 3 characters.";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test((formData.email || "").trim())) e.email = "Please enter a valid email.";
    const finalSubject = (formData.customSubject || formData.subject || "").trim();
    if (!finalSubject || finalSubject.length < 2) e.subject = "Please provide a subject.";
    if ((formData.message || "").trim().length < 10) e.message = "Message must be at least 10 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const shakeErrors = () => {
    const tl = gsap.timeline();
    tl.to(formRef.current, { x: -8, duration: 0.06 })
      .to(formRef.current, { x: 8, duration: 0.06 })
      .to(formRef.current, { x: -6, duration: 0.06 })
      .to(formRef.current, { x: 6, duration: 0.06 })
      .to(formRef.current, { x: 0, duration: 0.06 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      shakeErrors();
      return;
    }
    setSubmitting(true);
    const finalSubject = formData.customSubject || formData.subject;
    try {
      const res = await fetch(`${backendUrl}/api/emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, subject: finalSubject }),
      });
      if (!res.ok) throw new Error("Server error");
      await gsap.fromTo(formRef.current, { scale: 1 }, { scale: 0.98, duration: 0.08, yoyo: true, repeat: 1 });
      alert("Thank you — message sent. We'll reply within 24 hours.");
      setFormData({ name: "", email: "", subject: "", customSubject: "", message: "" });
      setErrors({});
      setPresetSubject("");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <FloatingInput id="name" label="Full name" value={formData.name} onChange={handleChange} required autoComplete="name" />
        {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}

        <FloatingInput id="email" label="Email address" type="email" value={formData.email} onChange={handleChange} required autoComplete="email" />
        {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}

        {!presetSubject ? (
          <>
            <FloatingInput
              id="customSubject"
              label="Custom subject (optional)"
              value={formData.customSubject}
              onChange={handleChange}
            />

            <FloatingSelect id="subject"  value={formData.subject} onChange={handleChange} options={SUBJECT_OPTIONS} />
          </>
        ) : (
          <div className="text-white px-4 py-3 bg-black/30 border border-gray-600 rounded-lg">Preset: {presetSubject}</div>
        )}

        {errors.subject && <p className="text-red-400 text-sm">{errors.subject}</p>}
      </div>

      <div className="flex flex-col justify-between">
        <FloatingTextarea id="message" label="Your message" value={formData.message} onChange={handleChange} rows={8} />
        {errors.message && <p className="text-red-400 text-sm">{errors.message}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="mt-4 w-full bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 text-black font-bold py-4 rounded-lg shadow-lg disabled:opacity-60 hover:shadow-cyan-500/30 hover:shadow-xl transition-shadow"
          style={{
            backgroundColor: ` ${STEM_COLORS[1]}`,
          }}
        >
          {submitting ? "Sending..." : "Send Message"}
        </motion.button>
      </div>
    </form>
  );
};

/* -----------------------------
   ContactPage - full page
   ------------------------------*/
const ContactPage = () => {
  return (
    <>
      <Navbar />
      <motion.section
      style={{
          background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${BACKEND_URL}/contact/contact-bg.jpg) center/cover no-repeat`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="min-h-screen flex items-center justify-center p-6 pt-32 relative bg-black"
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 60 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-black/50 shadow-2xl rounded-2xl overflow-hidden border border-gray-800 p-8 md:p-12">
            <div className="text-center mb-8">
              <motion.h1 
                className="text-5xl font-bold mb-4"
                style={{ color: "rgb(23, 207, 220)" }}
              >
                Contact Us
              </motion.h1>
              <p className="text-gray-300 mt-2 text-lg">We'd love to hear from you — questions, partnerships, or volunteering.</p>
            </div>

            <ContactForm />

          </div>

          <div className="bg-black/70 text-center px-6 py-4 border-t border-gray-800 mt-4 rounded-b-2xl">
            <p className="text-gray-400 text-sm">
              We reply within 24 hours. For urgent matters email:
              <a 
                className="ml-1 font-medium hover:underline transition"
                style={{ color: STEM_COLORS[1] }}
                href="mailto:amelia@steminspires.tech"
              >
                amelia@steminspires.tech
              </a>
            </p>
          </div>
        </motion.div>
      </motion.section>

      <ChatBolt />
      <Footer />
    </>
  );
};

export default ContactPage;