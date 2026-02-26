import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import DashboardLayout from "./components/DashboardLayout";

// Pages
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ComplainTickets = lazy(() => import("./pages/ComplainTickets"));
const TicketTypes = lazy(() => import("./pages/TicketTypes"));
const AssignedJobs = lazy(() => import("./pages/AssignedJobs"));
const NewLead = lazy(() => import("./pages/NewLead"));
const MyAssets = lazy(() => import("./pages/MyAssets"));
const AssetsHistory = lazy(() => import("./pages/AssetsHistory"));
const Profile = lazy(() => import("./pages/Profile"));
const Reports = lazy(() => import("./pages/Reports"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ServiceRequests = lazy(() => import("./pages/ServiceRequests"));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-slate-600 font-medium">Loading Employee Panel...</p>
    </div>
  </div>
);

function App() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Router>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} 
        />

        {/* Protected Routes */}
        {isLoggedIn ? (
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={
               <Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>
            } />
            <Route path="/complain-tickets" element={
               <Suspense fallback={<LoadingSpinner />}><ComplainTickets /></Suspense>
            } />
            <Route path="/ticket-types" element={
               <Suspense fallback={<LoadingSpinner />}><TicketTypes /></Suspense>
            } />
            <Route path="/assigned-jobs" element={
               <Suspense fallback={<LoadingSpinner />}><AssignedJobs /></Suspense>
            } />
            <Route path="/new-lead" element={
               <Suspense fallback={<LoadingSpinner />}><NewLead /></Suspense>
            } />
            <Route path="/my-assets" element={
               <Suspense fallback={<LoadingSpinner />}><MyAssets /></Suspense>
            } />
            <Route path="/assets-history" element={
               <Suspense fallback={<LoadingSpinner />}><AssetsHistory /></Suspense>
            } />
            <Route path="/profile" element={
               <Suspense fallback={<LoadingSpinner />}><Profile /></Suspense>
            } />
            <Route path="/reports" element={
               <Suspense fallback={<LoadingSpinner />}><Reports /></Suspense>
            } />
            <Route path="/change-password" element={
               <Suspense fallback={<LoadingSpinner />}><ChangePassword /></Suspense>
            } />
            <Route path="/notifications" element={
               <Suspense fallback={<LoadingSpinner />}><Notifications /></Suspense>
            } />
            <Route path="/service-requests" element={
               <Suspense fallback={<LoadingSpinner />}><ServiceRequests /></Suspense>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

const RootApp = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default RootApp;
