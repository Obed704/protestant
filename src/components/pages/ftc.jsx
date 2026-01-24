import Navbar from "../Header";
import Footer from "../Footer";
import FTCLanding from "../ftc-welcome";
import ChatBolt from "../ChatBolt";
import { useState,useEffect } from "react";
function FtcPage() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

   const [navbar, setNavbar] = useState(null);
    useEffect(() => {
      let mounted = true;
  
      const fetchNavbar = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/navbar`);
          if (!res.ok) throw new Error("Failed to fetch navbar");
  
          const data = await res.json();
  
          if (!mounted) return;
  
          setNavbar(data);
          setLoading(false);
        } catch (err) {
          console.error(err);
          setError("Unable to load navbar");
          setLoading(false);
        }
      };
  
      fetchNavbar();
  
      return () => {
        mounted = false;
      };
    }, []);
  return (
    <div className="bg-gray-400">
      <Navbar bg="bg-black" settings={navbar}/>
      <FTCLanding/>
      <ChatBolt/>
      <Footer />
    </div>
  );
}

export default FtcPage;
