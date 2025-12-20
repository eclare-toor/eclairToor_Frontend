import { Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicOnlyRoute from "./components/Auth/PublicOnlyRoute";

import AdminRoute from "./components/Auth/AdminRoute";

import HomePage from "./Pages/client/HomePage";
import UserLayout from "./components/Layout/UserLayout";
import TripsListPage from "./Pages/client/trips/TripsListPage";
import TripDetailsPage from "./Pages/client/trips/TripDetailsPage";
import Reservation from "./Pages/client/trips/Reservation";
import CongratulationReservation from "./Pages/client/trips/congratulationReservation";
import CustomNationalTripPage from "./Pages/client/trips/CustomNationalTripPage";
import CustomInternationalTripPage from "./Pages/client/trips/CustomInternationalTripPage";
import CustomOmraTripPage from "./Pages/client/trips/CustomOmraTripPage";
import HotelPage from "./Pages/client/services/HotelPage";
import FlightsPage from "./Pages/client/services/FlightsPage";
import Promos from "./Pages/client/Promos";
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




import { useAuth } from "./Context/AuthContext";
import { useEffect } from "react";

function App() {
  
  const { isLoading,user } = useAuth();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Chargement...</div>;
  }

  useEffect(() => {
  }, [user, isLoading]);

  return (
    <>
      <Routes>
        {/* ROUTES PUBLIQUES (Layout Standard) */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/voyages" element={<TripsListPage />} />
          <Route path="/voyages/:id" element={<TripDetailsPage />} />
          <Route path="/voyages/:id/reservation" element={<Reservation />} />

          <Route path="/voyages/CustomNationalTripPage" element={<CustomNationalTripPage />} />
          <Route path="/voyages/CustomInternationalTripPage" element={<CustomInternationalTripPage />} />
          <Route path="/voyages/CustomOmraTripPage" element={<CustomOmraTripPage />} />
          <Route path="/request-hotel" element={<HotelPage />} />
          <Route path="/request-flight" element={<FlightsPage />} />
          <Route path="/Promos-trips" element={<Promos />} />
          <Route path="/contact" element={<Contact />} />

          {/* ROUTES PROTÉGÉES (Nécessitent une connexion) */}
          <Route element={<Protecte dRoute />}>
            <Route path="/voyages/:id/congratulationReservation" element={<CongratulationReservation />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/mon-compte" element={<DashboardUser />} />
          </Route>

        </Route>

        {/* AUTH (Uniquement si NON connecté) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/inscription" element={<RegisterPage />} />
        </Route>

        {/* ROUTES ADMIN (Layout Admin - Protégé Role='ADMIN') */}
        {user?.role==='admin' && (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="voyages" element={<AdminTripsPage />} />
            <Route path="hotels" element={<AdminOmraHotelsPage />} />
            <Route path="demandes" element={<AdminRequestsPage />} />
            <Route path="messages" element={<AdminRequestContact />} />
            <Route path="users" element={<AdminUsersPage />} />
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
