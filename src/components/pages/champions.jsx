import { useEffect, useState } from "react";
import Navbar from "../Header";
import Banner from "../bannerChampion";
import ChampionsSection from "../championsSection";
import Gallery from "../gallery";
import Footer from "../Footer";
import ChatBolt from "../ChatBolt";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const WomenInStem = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [navbar, setNavbar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [navbarRes, bannerRes, galleryRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/navbar`),
          fetch(`${BACKEND_URL}/api/banner`),
          fetch(`${BACKEND_URL}/api/gallery`),
        ]);

        if (!navbarRes.ok || !bannerRes.ok || !galleryRes.ok) {
          throw new Error("One or more requests failed");
        }

        const navbarData = await navbarRes.json();
        const bannerData = await bannerRes.json();
        const galleryData = await galleryRes.json();

        if (!mounted) return;

        setNavbar(navbarData);
        setBanner(bannerData);
        setGallery(Array.isArray(galleryData) ? galleryData : []);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load Women in STEM page");
        setLoading(false);
      }
    };

    fetchData();
    return () => (mounted = false);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <img
            src="/welcomeSlide/Logo.png"
            alt="STEM Inspires"
            className="w-32 mx-auto mb-6 animate-pulse"
          />
          <div className="text-white text-xl">Loading STEM Inspires…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <Navbar bg="bg-black" settings={navbar} />
      <Banner bannerData={banner} />
      <ChatBolt />
      <ChampionsSection />
      <Gallery galleryImages={gallery}  />
      <Footer />
    </>
  );
};

export default WomenInStem;
