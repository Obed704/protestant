import Navbar from "../Header";
import SistersCard from "../sisters";
import TeamSection from "../team";
import SponsorsSection from "../sponsorSection";
import Footer from "../Footer";
import ChatBolt from "../ChatBolt";

function About() {
  return (
    <>
      <Navbar textColor="text-gray-300" fixed={false}/>
      <SistersCard/>
      <TeamSection/>
      <ChatBolt/>
      <SponsorsSection/>
      <Footer />
    </>
  );
}

export default About;
