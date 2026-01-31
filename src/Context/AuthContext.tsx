import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import type { User } from '../Types/index';
import { getUserProfile } from '../api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        Cookies.remove('token');

        if (window.location.pathname !== '/connexion') {
            window.location.href = '/connexion';
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = Cookies.get('token');

            if (storedToken) {
                try {
                    const userProfile = await getUserProfile();
                    setUser(userProfile);
                    setToken(storedToken);
                } catch (e) {
                    handleLogout();
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);

        Cookies.set('token', newToken, {
            expires: 7,
            secure: true,
            sameSite: 'strict'
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token,
            isLoading,
            login,
            logout: handleLogout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
