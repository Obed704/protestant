import React from "react"; // Add this
import Header from "../components/Header.jsx";
import WeekThemeSlideshow from "./weeksPage.jsx";
import Footer from "../components/Footer.jsx";

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
