import Navbar from "../Header";
import Fll from "../fll";
import RecruitingProcess from "../recruiting";
import Footer from "../Footer";
import EducationElements from "../educationElements";
import ThumbnailCarousel from "../imageSlider";
import ChatBolt from "../ChatBolt";
function App() {
  return (
    <div style={{ backgroundColor: "rgb(23, 207, 220)" }}>
      <Navbar  />
      <Fll />
      <RecruitingProcess/>
      <EducationElements/>
      <ChatBolt/>
      <ThumbnailCarousel/>
      <Footer />
    </div>
  );
}

export default App;
