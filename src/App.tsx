import React from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { DashboardPage } from "./components/pages/DashboardPage";
import { SubscribersPage } from "./components/pages/SubscribersPage";
import { CustomerReviews } from "./components/pages/CustomerReviews";
import { Services } from "./components/pages/Services";
import { TeamMembers } from "./components/pages/TeamMembers";
// import "@fortawesome/fontawesome-free/css/all.min.css";

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage = location.pathname.slice(1) || "dashboard";

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Dashboard Overview";
      case "subscribers":
        return "Subscribers Management";
      case "reviews":
        return "Customer Reviews";
      case "services":
        return "Services Management";
      case "team":
        return "Team Members";
      case "leadership":
        return "Leadership Team";
      case "project-categories":
        return "Project Categories";
      case "projects":
        return "Projects Portfolio";
      case "faqs":
        return "Frequently Asked Questions";
      case "settings":
        return "Site Settings";
      case "privacy":
        return "Privacy Policy";
      default:
        return "Dashboard";
    }
  };

  const handlePageChange = (page: string) => {
    navigate(`/${page}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />

      <div className="flex-1 overflow-hidden">
        <Header title={getPageTitle()} />

        <main className="p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/subscribers" element={<SubscribersPage />} />
            <Route path="/reviews" element={<CustomerReviews />} />
            <Route path="/services" element={<Services />} />
            <Route path="/team" element={<TeamMembers />} />
            <Route
              path="/leadership"
              element={
                <div className="p-6 text-center text-slate-600">
                  Leadership page - Coming soon!
                </div>
              }
            />
            <Route
              path="/project-categories"
              element={
                <div className="p-6 text-center text-slate-600">
                  Project Categories page - Coming soon!
                </div>
              }
            />
            <Route
              path="/projects"
              element={
                <div className="p-6 text-center text-slate-600">
                  Projects page - Coming soon!
                </div>
              }
            />
            <Route
              path="/faqs"
              element={
                <div className="p-6 text-center text-slate-600">
                  FAQs page - Coming soon!
                </div>
              }
            />
            <Route
              path="/settings"
              element={
                <div className="p-6 text-center text-slate-600">
                  Settings page - Coming soon!
                </div>
              }
            />
            <Route
              path="/privacy"
              element={
                <div className="p-6 text-center text-slate-600">
                  Privacy Policy page - Coming soon!
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
