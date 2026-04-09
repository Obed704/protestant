import React from "react";
import { DataProvider, useAppData } from "../context/DataContext.jsx";

import Header from "../components/header.jsx";
import BibleVerse from "../components/verse.jsx";
import WeekTheme from "../components/week.jsx";
import HolidayConnect from "../components/holidayConnect.jsx";
import Departments from "../components/DepartmentComp.jsx";
import UpcomingEventsPreview from "../components/UpcomingEventsPreview.jsx";
import GospelSongs from "../components/songs.jsx";
import Footer from "../components/Footer.jsx";

// Inner component that safely uses the context
const HomeContent = () => {
  const { loading, error } = useAppData();

  // Global Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-8"></div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Welcome to Church
          </h2>
          <p className="text-gray-600 text-lg max-w-sm mx-auto">
            Loading Bible verses, weekly themes, events and more...
          </p>

          <div className="mt-12 flex justify-center gap-2">
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Global Error Screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-xl p-10">
          <div className="text-red-500 text-7xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Failed to Load Content
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-3.5 rounded-2xl transition shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main Page Content
  return (
    <>
      <Header />
      <BibleVerse />
      <WeekTheme />
      <HolidayConnect />
      <Departments />
      <UpcomingEventsPreview />
      <GospelSongs />
      <Footer />
    </>
  );
};

// Main Home component that provides the context
const Home = () => {
  return (
    <DataProvider>
      <HomeContent />
    </DataProvider>
  );
};

export default Home;
