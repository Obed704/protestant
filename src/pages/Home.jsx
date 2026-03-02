import Header from "../components/header.jsx";
import BibleVerse from "../components/verse.jsx";
import Departments from "../components/DepartmentComp.jsx";
// import VideoCall from "../VideoCall.jsx";
import GospelSongs from "../components/songs.jsx";
import Footer from "../components/footer.jsx";
import WeekTheme from "../components/week.jsx";
import HolidayConnect from "../components/holidayConnect.jsx";
import UpcomingEventsPreview from "../components/UpcomingEventsPreview.jsx";

const Home = () => {
  return (
    <>
      <Header />
      <BibleVerse />
      <WeekTheme />
      <HolidayConnect />
      <Departments />
      <UpcomingEventsPreview />
      {/* <VideoCall /> */}
      <GospelSongs />
      <Footer />
      
    </>
  );
};

export default Home;
