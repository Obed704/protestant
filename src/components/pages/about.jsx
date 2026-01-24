import { useEffect, useState } from "react";
import Navbar from "../Header";
import SistersCard from "../sisters";
import TeamSection from "../team";
import SponsorsSection from "../sponsorSection";
import Footer from "../Footer";
import ChatBolt from "../ChatBolt";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const About = () => {
  const [navbar, setNavbar] = useState(null);
  const [team, setTeam] = useState([]);
  const [sistersSection, setSistersSection] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        // Fetch all endpoints at once
        const [navbarRes, teamRes, sistersRes, sponsorsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/navbar`),
          fetch(`${BACKEND_URL}/api/team`),
          fetch(`${BACKEND_URL}/api/sections/sisters_card`),
          fetch(`${BACKEND_URL}/api/sponsors`),
        ]);

        if (!navbarRes.ok || !teamRes.ok || !sistersRes.ok || !sponsorsRes.ok) {
          throw new Error("One or more requests failed");
        }

        // Parse JSON
        const navbarData = await navbarRes.json();
        const teamData = await teamRes.json();
        const sistersData = await sistersRes.json();
        const sponsorsData = await sponsorsRes.json();

        if (!mounted) return;

        setNavbar(navbarData);

        setTeam(
          Array.isArray(teamData)
            ? teamData.map((m) => ({
                ...m,
                image: m.image ? `${BACKEND_URL}${m.image}` : "",
              }))
            : []
        );

        setSistersSection(sistersData);
        setSponsors(Array.isArray(sponsorsData) ? sponsorsData : []);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchAll();

    return () => (mounted = false);
  }, []);

if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <img
            src={`./welcomeSlide/Logo.png`} // or static /public/logo.png
            alt="STEM Inspires"
            className="w-32 mx-auto mb-6 animate-pulse"
          />
          <div className="text-white text-xl">Loading STEM Inspires…</div>
        </div>
      </div>
    );
  }


  return (
    <>
      <Navbar textColor="text-gray-300" fixed={false} settings={navbar} />
      <SistersCard team={team} section={sistersSection} />
      <TeamSection team={team} />
      <ChatBolt />
      <SponsorsSection sponsors={sponsors} />
      <Footer />
    </>
  );
};

export default About;
