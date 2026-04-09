import React, { useState } from "react";
import axios from "axios";
import { X, Save, Link as LinkIcon } from "lucide-react";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE}/api/studies`;

const defaultImage = "/images/bible-study-default.jpg";

const resolveImageUrl = (url) => {
  if (!url) return defaultImage;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE}${url}`;
  }

  return url;
};

export default function AdminEditStudyModal({
  study = null,
  token,
  onClose,
  onSaved,
}) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: study?.title || "",
    description: study?.description || "",
    imageUrl: study?.imageUrl || "",
  });

  const [previewError, setPreviewError] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setPreviewError(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert("Title required");
      return;
    }

    try {
      setSaving(true);

      if (study?._id) {
        await axios.put(`${API_ENDPOINT}/${study._id}`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.post(API_ENDPOINT, form, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save study");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl">

        {/* Header */}

        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-bold">
            {study ? "Edit Study" : "Create Study"}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Body */}

        <div className="p-6 space-y-4">

          {/* Title */}

          <div>
            <label className="block text-sm font-semibold mb-1">Title</label>
            <input
              className="w-full border rounded-lg px-4 py-2"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          {/* Description */}

          <div>
            <label className="block text-sm font-semibold mb-1">
              Description
            </label>
            <textarea
              rows="4"
              className="w-full border rounded-lg px-4 py-2"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* Image URL */}

          <div>
            <label className="block text-sm font-semibold mb-1">
              Image URL
            </label>

            <div className="relative">
              <LinkIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                className="w-full border rounded-lg pl-10 pr-4 py-2"
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
              />
            </div>
          </div>

          {/* Preview */}

          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-sm font-semibold mb-2">Preview</div>

            <img
              src={
                previewError
                  ? defaultImage
                  : resolveImageUrl(form.imageUrl)
              }
              alt="preview"
              className="w-full max-h-60 object-cover rounded"
              onError={() => setPreviewError(true)}
            />

            {previewError && (
              <p className="text-xs text-red-500 mt-2">
                Could not load image. Using default placeholder.
              </p>
            )}
          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t px-6 py-4">

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Study"}
          </button>

        </div>
      </div>
    </div>
  );
}