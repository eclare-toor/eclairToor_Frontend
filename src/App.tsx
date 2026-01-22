import { Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicOnlyRoute from "./components/Auth/PublicOnlyRoute";


import HomePage from "./Pages/client/HomePage";
import UserLayout from "./components/Layout/UserLayout";
import TripsListPage from "./Pages/client/trips/TripsListPage";
import TripDetailsPage from "./Pages/client/trips/TripDetailsPage";
import Reservation from "./Pages/client/trips/Reservation";
import CongratulationReservation from "./Pages/client/trips/congratulationReservation";
import CustomOmraTripPage from "./Pages/client/trips/CustomOmraTripPage";
import HotelPage from "./Pages/client/trips/HotelPage"; // Updated import path
import FlightsPage from "./Pages/client/trips/FlightsPage"; // Updated import path
import TransportPage from "./Pages/client/trips/TransportPage";
import Contact from "./Pages/client/Contact";
import LoginPage from "./Pages/auth/LoginPage";
import RegisterPage from "./Pages/auth/RegisterPage";
import AdminDashboardPage from "./Pages/admin/AdminDashboardPage";
import AdminTripsPage from "./Pages/admin/AdminTripsPage";
import AdminRequestsPage from "./Pages/admin/AdminRequestsPage";
import Notifications from "./Pages/client/Notifications";
import DashboardUser from "./Pages/client/DashboardUser";
import AdminOmraHotelsPage from "./Pages/admin/AdminOmraHotelsPage";
import AdminRequestContact from "./Pages/admin/AdminRequestContact";
import AdminUsersPage from "./Pages/admin/AdminUsersPage";
import AdminLayout from "./components/Layout/AdminLayout";
import Profile from "./Pages/client/Profile";
import AdminProfilePage from "./Pages/admin/AdminProfilePage";
import AdminNotificationsPage from "./Pages/admin/AdminNotificationsPage";
import AdminTripDetailPage from "./Pages/admin/AdminTripDetailPage";
import AdminTripBookingsPage from "./Pages/admin/AdminTripBookingsPage";
import AdminHotelDetailPage from "./Pages/admin/AdminHotelDetailPage";
import OnboardingLoader from "./components/Shared/OnboardingLoader";
import PromotionsPage from "./Pages/client/trips/PromotionsPage";




import { useAuth } from "./Context/AuthContext";
import { useEffect, useState } from "react";
import CustomTripPage from "./Pages/client/trips/CustomTripPage";

import { useTranslation } from 'react-i18next';

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
