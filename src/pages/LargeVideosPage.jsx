import LargeVideos from "../components/largeVideos.jsx";
import Header from "../components/header.jsx";
import Sidebar from "../components/sidebar.jsx";

export default function LargeVideosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-col md:flex-row flex-1">
        <div className="flex-1 order-2 md:order-2 overflow-auto">
          <LargeVideos />
        </div>
{/* 
        <div className="order-1 md:order-1 w-full md:w-48 bg-gray-900 text-white">
          <Sidebar />
        </div> */}
      </div>
    </div>
  );
}