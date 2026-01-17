import Navbar from "../Header";
import Banner from "../bannerChampion";
import ChampionsSection from "../championsSection";
import Gallery from "../gallery";
import Footer from "../Footer";
import ChatBolt from "../ChatBolt";

function WomenInStem() {
  return (
    <>
      <Navbar bg="bg-black" />
    <Banner/>
    <ChatBolt/>
     <ChampionsSection/>
     <Gallery/>
      <Footer />
    </>
  );
}

export default WomenInStem;
