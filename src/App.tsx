import { Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicOnlyRoute from "./components/Auth/PublicOnlyRoute";


import { lazy, Suspense, useEffect, useState } from "react";
import { useAuth } from "./Context/AuthContext";
import { useTranslation } from 'react-i18next';
import OnboardingLoader from "./components/Shared/OnboardingLoader";
import UserLayout from "./components/Layout/UserLayout";
import AdminLayout from "./components/Layout/AdminLayout";

// Lazy Load Pages
const HomePage = lazy(() => import("./Pages/client/HomePage"));
const TripsListPage = lazy(() => import("./Pages/client/trips/TripsListPage"));
const TripDetailsPage = lazy(() => import("./Pages/client/trips/TripDetailsPage"));
const Reservation = lazy(() => import("./Pages/client/trips/Reservation"));
const CongratulationReservation = lazy(() => import("./Pages/client/trips/congratulationReservation"));
const CustomOmraTripPage = lazy(() => import("./Pages/client/trips/CustomOmraTripPage"));
const HotelPage = lazy(() => import("./Pages/client/trips/HotelPage"));
const FlightsPage = lazy(() => import("./Pages/client/trips/FlightsPage"));
const TransportPage = lazy(() => import("./Pages/client/trips/TransportPage"));
const Contact = lazy(() => import("./Pages/client/Contact"));
const LoginPage = lazy(() => import("./Pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./Pages/auth/RegisterPage"));
const AdminDashboardPage = lazy(() => import("./Pages/admin/AdminDashboardPage"));
const AdminTripsPage = lazy(() => import("./Pages/admin/AdminTripsPage"));
const AdminRequestsPage = lazy(() => import("./Pages/admin/AdminRequestsPage"));
const Notifications = lazy(() => import("./Pages/client/Notifications"));
const DashboardUser = lazy(() => import("./Pages/client/DashboardUser"));
const AdminOmraHotelsPage = lazy(() => import("./Pages/admin/AdminOmraHotelsPage"));
const AdminRequestContact = lazy(() => import("./Pages/admin/AdminRequestContact"));
const AdminUsersPage = lazy(() => import("./Pages/admin/AdminUsersPage"));
const Profile = lazy(() => import("./Pages/client/Profile"));
const AdminProfilePage = lazy(() => import("./Pages/admin/AdminProfilePage"));
const AdminNotificationsPage = lazy(() => import("./Pages/admin/AdminNotificationsPage"));
const AdminTripDetailPage = lazy(() => import("./Pages/admin/AdminTripDetailPage"));
const AdminTripBookingsPage = lazy(() => import("./Pages/admin/AdminTripBookingsPage"));
const AdminHotelDetailPage = lazy(() => import("./Pages/admin/AdminHotelDetailPage"));
const PromotionsPage = lazy(() => import("./Pages/client/trips/PromotionsPage"));
const CustomTripPage = lazy(() => import("./Pages/client/trips/CustomTripPage"));






function App() {
  const { i18n } = useTranslation();
  const { isLoading, user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    // Hide onboarding after the animation duration (2.2s + fade room)
    const timer = setTimeout(() => {
      setShowOnboarding(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showOnboarding) {
    return <OnboardingLoader />;
  }

  return (
    <>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/50 backdrop-blur-sm">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary/10 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
            Chargement...
          </p>
        </div>
      }>
        <Routes>
          {/* ROUTES PUBLIQUES (Layout Standard) */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/voyages" element={<TripsListPage />} />
            <Route path="/voyages/:id" element={<TripDetailsPage />} />
            <Route path="/voyages/:id/reservation" element={<Reservation />} />

            <Route path="/voyages/CustomTripPage" element={<CustomTripPage />} />
            <Route path="/voyages/CustomOmraTripPage" element={<CustomOmraTripPage />} />
            <Route path="/request-hotel" element={<HotelPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/request-flight" element={<FlightsPage />} />
            <Route path="/request-transport" element={<TransportPage />} />
            <Route path="/reservation/:id" element={<Reservation />} />
            <Route path="/contact" element={<Contact />} />

            {/* ROUTES PROTÉGÉES (Nécessitent une connexion) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/congratulation" element={<CongratulationReservation />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/mon-compte" element={<DashboardUser />} />
              <Route path="/mon-compte/:tab" element={<DashboardUser />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

          </Route>

          {/* AUTH (Uniquement si NON connecté) */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
          </Route>

          {/* ROUTES ADMIN (Layout Admin - Protégé Role='ADMIN') */}
          {user?.role === 'admin' && (
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="voyages" element={<AdminTripsPage />} />
              <Route path="voyages/:id" element={<AdminTripDetailPage />} />
              <Route path="voyages/:id/bookings" element={<AdminTripBookingsPage />} />
              <Route path="hotels" element={<AdminOmraHotelsPage />} />
              <Route path="hotels/:id" element={<AdminHotelDetailPage />} />
              <Route path="demandes" element={<AdminRequestsPage />} />
              <Route path="messages" element={<AdminRequestContact />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
            </Route>
          )}
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}


export default App
