import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { PartnerAuthProvider } from "./context/PartnerAuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";

import PartnerLayout from "./layouts/PartnerLayout";
import AdminLayout from "./layouts/AdminLayout";
import VerifiedGate from "./components/partner/VerifiedGate";

import Landing from "./pages/Landing";

// Partner auth pages
import PartnerRegister from "./pages/Partnerregister";
import PartnerLogin from "./pages/Partnerlogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Partner app pages
import Dashboard from "./pages/partner/Dashboard";
import Settlements from "./pages/partner/Settlements";
import Documents from "./pages/partner/Documents";
import Bank from "./pages/partner/Bank";
import Notifications from "./pages/partner/Notifications";
import Profile from "./pages/partner/Profile";
import PartnerSocialMedia from "./pages/partner/SocialMedia";
import PartnerPostReel from "./pages/partner/PostReel";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminPartnerDetail from "./pages/admin/AdminPartnerDetail";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminBank from "./pages/admin/AdminBank";
import AdminSettlements from "./pages/admin/AdminSettlements";
import AdminSocialMedia from "./pages/admin/AdminSocialMedia";
import AdminAgreement from "./pages/admin/AdminAgreement";

// ======================================================
// PARTNER ROUTE GUARDS
// ======================================================

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("partnerToken");
  if (!token) return <Navigate to="/partner/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("partnerToken");
  if (token) return <Navigate to="/partner/dashboard" replace />;
  return children;
}

// ======================================================
// ADMIN ROUTE GUARDS
// ======================================================

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

function AdminPublicRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  if (token) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

// ======================================================
// APP
// ======================================================

function App() {
  return (
    <PartnerAuthProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />

            {/* PARTNER AUTH */}
            <Route path="/partner/register" element={<PublicRoute><PartnerRegister /></PublicRoute>} />
            <Route path="/partner/login" element={<PublicRoute><PartnerLogin /></PublicRoute>} />
            <Route path="/partner/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/partner/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

            {/* PARTNER APP */}
            <Route path="/partner" element={<ProtectedRoute><PartnerLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settlements" element={<VerifiedGate><Settlements /></VerifiedGate>} />
              <Route path="documents" element={<Documents />} />
              <Route path="bank" element={<Bank />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
              <Route path="social-media" element={<PartnerSocialMedia />} />
              <Route path="post-reel" element={<PartnerPostReel />} />
            </Route>

            {/* ADMIN AUTH */}
            <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />

            {/* ADMIN APP */}
            <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="partners/:id" element={<AdminPartnerDetail />} />
              <Route path="documents" element={<AdminDocuments />} />
              <Route path="bank" element={<AdminBank />} />
              <Route path="settlements" element={<AdminSettlements />} />
              <Route path="social-media" element={<AdminSocialMedia />} />
              <Route path="agreement" element={<AdminAgreement />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </PartnerAuthProvider>
  );
}

export default App;
