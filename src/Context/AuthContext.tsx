import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import type { User } from '../Types/index';
import { getUserById } from '../api';

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

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = Cookies.get('token');
            const storedUserId = Cookies.get('userId');

            console.log('🔄 AuthContext: Initializing...', { storedToken, storedUserId });

            if (storedToken && storedUserId) {
                setToken(storedToken);
                try {
                    console.log('🔄 AuthContext: Fetching user data for ID:', storedUserId);
                    const userData = await getUserById(storedUserId);
                    console.log('✅ AuthContext: Fetched user data:', userData);

                    if (userData) {
                        setUser(userData);
                    } else {
                        console.warn('⚠️ AuthContext: User not found for ID, logging out.');
                        handleLogout();
                    }
                } catch (err) {
                    console.error("❌ AuthContext: Failed to restore user session", err);
                    handleLogout();
                }
            } else {
                console.log('ℹ️ AuthContext: No session found.');
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (newToken: string, newUser: User) => {
        console.log('🔓 AuthContext: Login called for user:', newUser);
        setToken(newToken);
        setUser(newUser);

        // Persistent storage
        Cookies.set('token', newToken, { expires: 7 });
        Cookies.set('userId', newUser.id, { expires: 7 });
        Cookies.set('userRole', newUser.role, { expires: 7 });
        console.log('💾 AuthContext: Cookies set.');
    };

    const handleLogout = () => {
        console.log('🔒 AuthContext: Logging out.');
        setToken(null);
        setUser(null);

        Cookies.remove('token');
        Cookies.remove('userId');
        Cookies.remove('userRole');

        if (window.location.pathname !== '/connexion') {
            window.location.href = '/connexion';
        }
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
