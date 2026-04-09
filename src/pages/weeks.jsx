import React from "react"; // Add this
import Header from "../components/header.jsx";
import WeekThemeSlideshow from "./weeksPage.jsx";
import Footer from "../components/footer.jsx";

const WeeksPage = () => {
  return (
    <>
      <Header />
      <WeekThemeSlideshow />
      <Footer />
    </>
  );
};

export default WeeksPage;
