import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { fetchApi } from "./utils/api";

// Public Pages
import RoleSelection from "./pages/RoleSelection";
import DonorLogin from "./pages/DonorLogin";
import DonorSignup from "./pages/DonorSignup";
import OrganizationLogin from "./pages/OrganizationLogin";
import OrganizationSignup from "./pages/OrganizationSignup";

// Main Pages
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import MyCampaigns from "./pages/MyCampaigns";
import MyDonations from "./pages/MyDonations";
import AiRecommendations from "./pages/AiRecommendations";

import DonorAuth from "./pages/DonorAuth";
import OrganizationAuth from "./pages/OrganizationAuth";

import DonorDashboard from "./pages/DonorDashboard";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

import CreateCampaign from "./pages/CreateCampaign";
import DonationHistory from "./pages/DonationHistory";

import Campaigns from "./pages/Campaigns";
import CampaignDetails from "./pages/CampaignDetails";
import EditCampaign from "./pages/EditCampaign";
import DonationForm from "./pages/DonationForm";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  useEffect(() => {
    // Pre-warm production Render backend in background on app launch
    fetchApi("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem("cached_campaigns", JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}

        <Route
          path="/"
          element={<RoleSelection />}
        />

        <Route
          path="/donor-login"
          element={<DonorLogin />}
        />

        <Route
          path="/donor-signup"
          element={<DonorSignup />}
        />

        <Route
          path="/organization-login"
          element={<OrganizationLogin />}
        />

        <Route
          path="/organization-signup"
          element={<OrganizationSignup />}
        />

        <Route
          path="/donor"
          element={<DonorAuth />}
        />

        <Route
          path="/organization"
          element={<OrganizationAuth />}
        />

        {/* HOME */}

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* DONOR ROUTES */}

        <Route
          path="/donor-dashboard"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="donor">
                <Layout>
                  <DonorDashboard />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-recommendations"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="donor">
                <Layout>
                  <AiRecommendations />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-donations"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="donor">
                <Layout>
                  <MyDonations />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* ORGANIZATION ROUTES */}

        <Route
          path="/organization-dashboard"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="organization">
                <Layout>
                  <OrganizationDashboard />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
  path="/admin-login"
  element={<AdminLogin />}
/>

        <Route
          path="/create-campaign"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="organization">
                <Layout>
                  <CreateCampaign />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-campaigns"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="organization">
                <Layout>
                  <MyCampaigns />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
  path="/edit-campaign/:id"
  element={
    <ProtectedRoute>
      <RoleProtectedRoute allowedRole="organization">
        <Layout>
          <EditCampaign />
        </Layout>
      </RoleProtectedRoute>
    </ProtectedRoute>
  }
/>

        {/* ADMIN ROUTES */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="admin">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* COMMON PROTECTED ROUTES */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <Layout>
                <Campaigns />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaign/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <CampaignDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/donate"
          element={
            <ProtectedRoute>
              <Layout>
                <DonationForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/donation-history"
          element={
            <ProtectedRoute>
              <Layout>
                <DonationHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;