import { Link } from "react-router-dom";
import { FaVideo, FaBolt, FaYoutube } from "react-icons/fa"; // Import icons

const Sidebar = () => {
  return (
    <div className="w-full md:w-48 bg-gray-900 text-white p-4 flex flex-row md:flex-col md:h-[400px] md:flex-none justify-around md:justify-start space-x-4 md:space-x-0 md:space-y-4">
      <Link
        to="/videos"
        className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded mt-20"
      >
        <FaVideo />
        <span className="hidden md:inline">Videos</span>
      </Link>
      <Link
        to="/shorts"
        className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded"
      >
        <FaBolt />
        <span className="hidden md:inline">Shorts</span>
      </Link>
      {/* <Link
        to="/tube"
        className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded"
      >
        <FaYoutube />
        <span className="hidden md:inline">Tube</span>
      </Link> */}
    </div>
  );
};

export default Sidebar;
