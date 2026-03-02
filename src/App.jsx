import Welcome from "./components/welcome";
import Home from "./pages/Home.jsx";
import LargeVideosPage from "./pages/LargeVideosPage.jsx";
import ShortVideos from "./pages/shortVideoes.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WeeksPage from "./pages/weeks.jsx";
import DeptPage from "./pages/deptPage.jsx";
import LoginPage from "./pages/login.jsx";
import SigninPage from "./pages/signin.jsx";
import SundayPreachings from "./pages/sundayService.jsx";
import ChoirsPage from "./pages/choirPage.jsx";
import UpcomingEventsPage from "./pages/UpcomingngEventsPage.jsx";
import BibleStudyPage from "./pages/bibleStudyPage.jsx";
import BaptismPage from "./pages/baptismPage.jsx";
import { AuthProvider } from "../src/context/authContext.jsx";
import TubePage from "./pages/tubePage.jsx";
import AdminRoute from "./components/adminSermonsRoute.jsx";
import AdminSermonPage from "./admin/uploadSermons.jsx";
import AdminPage from "./admin/adminPage.jsx";
import UpcomingEventsAdmin from "./admin/UpcomingEventsAdmin.jsx";
import AdminWeekThemes from "./admin/AdminWeekThemes.jsx";
import AdminSundayPreachings from "./admin/AdminSundayPreachings.jsx";
import AdminDailyPreaching from "./admin/adminDailyWord.jsx";
import AdminChoirsPage from "./admin/adminChoirs.jsx";
import AdminBibleStudiesPage from "./admin/AdminBibleStudy.jsx";
import AdminBaptism from "./admin/AdminBaptismPage.jsx";
import AdminShortsPage from "./admin/AdminShortsPage.jsx";
import AdminLargeVideoPage from "./admin/AdminLargeVideo.jsx";
import AdminDepartments from "./admin/AdminDepartments.jsx";
import AdminHoliday from "./admin/adminHoliday.jsx";
import GoogleSuccess from "./pages/GoogleSuccessPage.jsx";
import DailyPreachings from "./pages/dailyPreach.jsx";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Home />} />
          <Route path="/shorts" element={<ShortVideos />} />
          {/* match the URL you want */}
          <Route path="/videos" element={<LargeVideosPage />} />
          <Route path="/weeks" element={<WeeksPage />} />
          <Route path="/dept/:id" element={<DeptPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/sunday-service" element={<SundayPreachings />} />
          <Route path="/choir" element={<ChoirsPage />} />
          <Route path="/upcomingEvents" element={<UpcomingEventsPage />} />
          <Route path="/bible-study" element={<BibleStudyPage />} />
          <Route path="/baptism" element={<BaptismPage />} />
          <Route path="/tube" element={<TubePage />} />
          <Route path="/google-success" element={<GoogleSuccess />} />
          <Route path="/daily-word" element={<DailyPreachings />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin-daily-word"
            element={
              <AdminRoute>
                <AdminDailyPreaching />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/update/sermons"
            element={
              <AdminRoute>
                <AdminSermonPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/update/holiday"
            element={
              <AdminRoute>
                <AdminHoliday />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/update/UpcomingEvents"
            element={
              <AdminRoute>
                <UpcomingEventsAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/update/weekTheme"
            element={
              <AdminRoute>
                <AdminWeekThemes />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/update/sunday-service"
            element={
              <AdminRoute>
                <AdminSundayPreachings />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/update/daily-prayer"
            element={
              <AdminRoute>
                <AdminDailyPreaching />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/update/choir"
            element={
              <AdminRoute>
                <AdminChoirsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/update/bible-study"
            element={
              <AdminRoute>
                <AdminBibleStudiesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/update/baptism"
            element={
              <AdminRoute>
                <AdminBaptism />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/update/shorts"
            element={
              <AdminRoute>
                <AdminShortsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/update/videos"
            element={
              <AdminRoute>
                <AdminLargeVideoPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/update/departments"
            element={
              <AdminRoute>
                <AdminDepartments />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
