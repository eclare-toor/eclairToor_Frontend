import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const AdminRoute = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    console.log('isAuthenticated', isAuthenticated, 'user', user?.role);
    if (isLoading) {
        return <div className="h-screen flex items-center justify-center">Chargement...</div>;
    }

    if (!isAuthenticated) {

        return <Navigate to="/connexion" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
