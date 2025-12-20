import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const ProtectedRoute = () => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center">Chargement...</div>;
    }

    if (user?.role!=='user') {
        return <Navigate to="/connexion" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
