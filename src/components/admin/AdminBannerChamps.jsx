import { useEffect, useState } from "react";
import NavigationButtons from "./Button";

const AdminBanner = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/banner`)
      .then((res) => res.json())
      .then((data) => setBanner(data))
      .catch((err) => console.error(err));
  }, [BACKEND_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBanner((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/banner`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(banner),
      });

      const data = await res.json();
      setBanner(data);
      setMessage("✅ Banner updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update banner.");
    } finally {
      setLoading(false);
    }
  };

  if (!banner) return <div className="text-center mt-12 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 flex justify-center items-start py-12 px-4">
      <NavigationButtons/>
      <div className="bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-800 shadow-2xl rounded-2xl p-8 max-w-3xl w-full text-white">
        <h2 className="text-3xl font-orbitron mb-6 text-center text-cyan-400">
          Admin: Edit Banner
        </h2>

        {message && (
          <p className="text-center mb-4 font-semibold text-green-400">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={banner.title}
              onChange={handleChange}
              className="w-full rounded-lg p-2 border border-gray-600 bg-gray-900 text-white"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Description</label>
            <textarea
              name="description"
              rows="4"
              value={banner.description}
              onChange={handleChange}
              className="w-full rounded-lg p-2 border border-gray-600 bg-gray-900 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">Primary Color</label>
              <input
                type="color"
                name="primaryColor"
                value={banner.primaryColor || "#17CFDC"}
                onChange={handleChange}
                className="w-full h-10 border rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Background Color</label>
              <input
                type="color"
                name="backgroundColor"
                value={banner.backgroundColor || "#FFFFFF"}
                onChange={handleChange}
                className="w-full h-10 border rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all"
          >
            {loading ? "Updating..." : "Update Banner"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminBanner;
