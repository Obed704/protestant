import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function FTCLandingAdmin() {
  const [content, setContent] = useState(null);
  const [heroImage, setHeroImage] = useState(null);
  const [aboutImage, setAboutImage] = useState(null);
  const [saving, setSaving] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/ftc-landing`)
      .then(res => setContent(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-300 text-xl">Loading FTC content…</p>
      </div>
    );
  }

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("data", JSON.stringify(content));

      if (heroImage) formData.append("heroImage", heroImage);
      if (aboutImage) formData.append("aboutImage", aboutImage);

      await axios.put(
        `${BACKEND_URL}/api/ftc-landing`,
        formData,
        { withCredentials: true }
      );

      alert("✅ FTC Landing updated successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update FTC Landing");
    } finally {
      setSaving(false);
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-cyan-400">
          FTC Landing Page CMS
        </h1>

        {/* ================= HERO ================= */}
        <section className="bg-gray-800 shadow-2xl rounded-2xl p-8 mb-10 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-cyan-300">Hero Section</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Input
              label="Title Prefix"
              value={content.hero.titlePrefix}
              onChange={v =>
                setContent({
                  ...content,
                  hero: { ...content.hero, titlePrefix: v },
                })
              }
            />

            <Input
              label="Highlighted Title"
              value={content.hero.titleHighlight}
              onChange={v =>
                setContent({
                  ...content,
                  hero: { ...content.hero, titleHighlight: v },
                })
              }
            />
          </div>

          <Textarea
            label="Subtitle"
            value={content.hero.subtitle}
            onChange={v =>
              setContent({
                ...content,
                hero: { ...content.hero, subtitle: v },
              })
            }
          />

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Input
              label="CTA Text"
              value={content.hero.ctaText}
              onChange={v =>
                setContent({
                  ...content,
                  hero: { ...content.hero, ctaText: v },
                })
              }
            />  
            

            {/* <Input
              label="CTA Link"
              value={content.hero.ctaLink}
              onChange={v =>
                setContent({
                  ...content,
                  hero: { ...content.hero, ctaLink: v },
                })
              }
            /> */}
          </div>

          <ImageUpload
            label="Hero Background Image"
            current={`${BACKEND_URL}${content.hero.backgroundImage}`}
            onChange={setHeroImage}
          />
        </section>

        {/* ================= ABOUT ================= */}
        <section className="bg-gray-800 shadow-2xl rounded-2xl p-8 mb-10 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-cyan-300">About Section</h2>

          <Input
            label="Title"
            value={content.about.title}
            onChange={v =>
              setContent({
                ...content,
                about: { ...content.about, title: v },
              })
            }
          />

          <Textarea
            label="Description"
            value={content.about.description}
            onChange={v =>
              setContent({
                ...content,
                about: { ...content.about, description: v },
              })
            }
          />

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Input
              label="Link Text"
              value={content.about.linkText}
              onChange={v =>
                setContent({
                  ...content,
                  about: { ...content.about, linkText: v },
                })
              }
            />

            <Input
              label="Link URL"
              value={content.about.linkUrl}
              onChange={v =>
                setContent({
                  ...content,
                  about: { ...content.about, linkUrl: v },
                })
              }
            />
          </div>

          <ImageUpload
            label="About Image"
            current={`${BACKEND_URL}${content.about.image}`}
            onChange={setAboutImage}
          />
        </section>

        {/* ================= SCHOOLS CTA ================= */}
        <section className="bg-gray-800 shadow-2xl rounded-2xl p-8 mb-10 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-cyan-300">Schools Section</h2>

          <Input
            label="Section Title"
            value={content.schoolsSection.title}
            onChange={v =>
              setContent({
                ...content,
                schoolsSection: {
                  ...content.schoolsSection,
                  title: v,
                },
              })
            }
          />

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Input
              label="CTA Text"
              value={content.schoolsSection.ctaText}
              onChange={v =>
                setContent({
                  ...content,
                  schoolsSection: {
                    ...content.schoolsSection,
                    ctaText: v,
                  },
                })
              }
            />

            {/* <Input
              label="CTA Link"
              value={content.schoolsSection.ctaLink}
              onChange={v =>
                setContent({
                  ...content,
                  schoolsSection: {
                    ...content.schoolsSection,
                    ctaLink: v,
                  },
                })
              }
            /> */}
          </div>
        </section>

        {/* ================= SAVE ================= */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl transition-all duration-300"
        >
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>
      </div>
    </div>
  );
}

/* ===================== REUSABLE COMPONENTS (Dark Theme) ===================== */

const Input = ({ label, value, onChange }) => (
  <div className="mb-6">
    <label className="block text-gray-300 font-medium mb-2">{label}</label>
    <input
      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-5 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition"
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={`Enter ${label.toLowerCase()}...`}
    />
  </div>
);

const Textarea = ({ label, value, onChange }) => (
  <div className="mb-6">
    <label className="block text-gray-300 font-medium mb-2">{label}</label>
    <textarea
      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-5 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition h-32 resize-none"
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={`Enter ${label.toLowerCase()}...`}
    />
  </div>
);

const ImageUpload = ({ label, current, onChange }) => (
  <div className="mb-8">
    <label className="block text-gray-300 font-medium mb-3">{label}</label>

    {current && (
      <div className="relative rounded-xl overflow-hidden shadow-xl border-2 border-gray-700 mb-4">
        <img
          src={current}
          alt="Current preview"
          className="w-full max-h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    )}

    <input
      type="file"
      accept="image/*"
      onChange={e => onChange(e.target.files[0])}
      className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-400 cursor-pointer transition"
    />
  </div>
);
// ----------------  ----------------