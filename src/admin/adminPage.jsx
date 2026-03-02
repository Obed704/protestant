import {
  FiBook,
  FiUsers,
  FiHeadphones,
  FiCalendar,
  FiGift,
  FiDownload,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const links = [
  { name: "Sermons", icon: <FiBook />, to: "/admin/update/sermons" },
  { name: "week theme", icon: <FiBook />, to: "/admin/update/weekTheme" },
  {
    name: "Sunday Service",
    icon: <FiBook />,
    to: "/admin/update/sunday-service",
  },
  { name: "Daily Prayer", icon: <FiUsers />, to: "/admin/update/daily-prayer" },
  { name: "Choir", icon: <FiHeadphones />, to: "/admin/update/choir" },
  {
    name: "Upcoming Events",
    icon: <FiCalendar />,
    to: "/admin/update/UpcomingEvents",
  },
  { name: "Bible Study", icon: <FiBook />, to: "/admin/update/bible-study" },
  { name: "Baptism Program", icon: <FiGift />, to: "/admin/update/baptism" },
  // { name: "Donations", icon: <FiGift />, to: "/admin/update/donations" },
  { name: "shorts", icon: <FiDownload />, to: "/admin/update/shorts" },
  { name: "videos", icon: <FiUsers />, to: "/admin/update/videos" },
  { name: "departments", icon: <FiUsers />, to: "/admin/update/departments" },
  { name: "Holiday", icon: <FiUsers />, to: "/admin/update/holiday" },
  { name: "Daly word", icon: <FiUsers />, to: "/admin-daily-word" },
];

export default function AdminUpdateLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link
        to="/home"
        className="bg-white/80 hover:bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md"
      >
        ← home
      </Link>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Admin - Update Pages
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link, index) => (
          <div
            key={index}
            onClick={() => navigate(link.to)}
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="text-blue-600 text-3xl">{link.icon}</div>
              <h2 className="text-xl font-semibold text-gray-800">
                {link.name}
              </h2>
            </div>
            <p className="text-gray-500 mt-3 text-sm">
              Click to update {link.name} details
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
