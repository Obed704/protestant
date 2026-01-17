import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/pages/home.jsx";
import OurProjects from "./components/pages/ourProject.jsx";
import FundTheirFuture from "./components/pages/donate.jsx";
import WomenInStem from "./components/pages/champions.jsx";
import support from "./components/pages/supportComponent.jsx";
import DownloadsSection from "./components/pages/resources.jsx";
import About from "./components/pages/about.jsx";
import ContactUs from "./components/pages/contact.jsx";
import FtcPage from "./components/pages/ftc.jsx";
import AdminDashboardEmails from "./components/admin/AdminEmails.jsx";
import ChampionDashboard from "./components/admin/championsDashboard.jsx";
import MissionVisionAdmin from "./components/admin/MissionVisionDashboard.jsx";
import AdminSponsors from "./components/admin/adminSponsors.jsx";
import TeamMemberDashboard from "./components/admin/TeamDashboard.jsx";
import DownloadsVideosDashboard from "./components/admin/DownloadDashboard.jsx";
import AdminDonation from "./components/admin/AdminDonatePage.jsx";
import EducationDashboard from "./components/admin/AdminEducation.jsx";
import ProcessDashboard from "./components/admin/RecruitingAdminPage.jsx";
import ProjectSlide from "./components/admin/ProjectSlideAdmin.jsx";
import GalleryAdmin from "./components/admin/AdminGallery.jsx";
import TestimonialsAdmin from "./components/admin/AdminComments.jsx";
import Login from "./components/pages/LoginAdmin.jsx";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import ChangePassword from "./components/admin/ChangePasswords.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import PaymentSuccess from "./components/pages/PaymentsSuccess.jsx";
import PaymentCancel from "./components/pages/PaymentCancel.jsx";
import AdminBanner from "./components/admin/AdminBannerChamps.jsx";
import AdminPayments from "./components/admin/PaymentsAdmin.jsx";
import FllAdmin from "./components/admin/AdminMap.jsx";
import AdminFtc from "./components/admin/Adminftc.jsx";
import AdminNavbar from "./components/admin/AdminNavbar.jsx";
import AdminHero from "./components/admin/AdminHero.jsx";
import AdminStats from "./components/admin/adminStarts.jsx";
import AdminGetInvolved from "./components/admin/adminGetInvolved.jsx";
import AdminSupport from "./components/admin/adminSupport.jsx";
import FTCLandingAdmin from "./components/admin/adminFTCsection.jsx";
import AdminSistersCards from "./components/AdminSisterCard.jsx";
import AdminHomeSlides from "./components/admin/AdminHomeSlides.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home bg={"bg-black/80"} />} />
          <Route path="/ourProjects" element={<OurProjects />} />
          <Route path="/donate" element={<FundTheirFuture />} />
          <Route path="/champions" element={<WomenInStem />} />
          <Route path="/resources" element={<DownloadsSection />} />
          <Route path="/about" element={<About />} />
          <Route path="/ftc" element={<FtcPage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />

  



          {/* Admin protected pages */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-welcome-slides"
            element={
              <ProtectedRoute>
                <AdminHomeSlides />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-sisters"
            element={
              <ProtectedRoute>
                <AdminSistersCards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-ftc-settings"
            element={
              <ProtectedRoute>
                <FTCLandingAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-support"
            element={
              <ProtectedRoute>
                <AdminSupport/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-getInvolved"
            element={
              <ProtectedRoute>
                <AdminGetInvolved />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-starts"
            element={
              <ProtectedRoute>
                <AdminStats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/welcome-settings"
            element={
              <ProtectedRoute>
                <AdminHero />
              </ProtectedRoute>
            }
          />
          <Route
            path="/header-settings"
            element={
              <ProtectedRoute>
                <AdminNavbar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-ftc"
            element={
              <ProtectedRoute>
                <AdminFtc />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fll-map"
            element={
              <ProtectedRoute>
                <FllAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-payments"
            element={
              <ProtectedRoute>
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-emails"
            element={
              <ProtectedRoute>
                <AdminDashboardEmails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-banner"
            element={
              <ProtectedRoute>
                <AdminBanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-champions"
            element={
              <ProtectedRoute>
                <ChampionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-vision-mission"
            element={
              <ProtectedRoute>
                <MissionVisionAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-sponsors"
            element={
              <ProtectedRoute>
                <AdminSponsors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-team"
            element={
              <ProtectedRoute>
                <TeamMemberDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-resources"
            element={
              <ProtectedRoute>
                <DownloadsVideosDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-donation"
            element={
              <ProtectedRoute>
                <AdminDonation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-education"
            element={
              <ProtectedRoute>
                <EducationDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-recruiting-process"
            element={
              <ProtectedRoute>
                <ProcessDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-project-slide"
            element={
              <ProtectedRoute>
                <ProjectSlide />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-gallery"
            element={
              <ProtectedRoute>
                <GalleryAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-testimonials"
            element={
              <ProtectedRoute>
                <TestimonialsAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
