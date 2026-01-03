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

            if (storedToken) {
                setToken(storedToken);

                // Fallback to localStorage since we don't have a getUserById endpoint yet
                const storedUser = localStorage.getItem('user_data');
                if (storedUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        setUser(parsedUser);
                        console.log('✅ AuthContext: Restored user from localStorage:', parsedUser);
                    } catch (e) {
                        console.error('❌ AuthContext: Failed to parse user data from localStorage');

                    }
                } else {
                    console.warn('⚠️ AuthContext: Token found but no user data in localStorage.');
                    // Optional: handleLogout() if you want to force re-login
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
        Cookies.set('userId', newUser.id, { expires: 7 }); // Kept for consistency but not primarily used for rehydration now
        Cookies.set('userRole', newUser.role, { expires: 7 });
        localStorage.setItem('user_data', JSON.stringify(newUser));
        console.log('💾 AuthContext: Cookies & LocalStorage set.');
    };

    const handleLogout = () => {
        console.log('🔒 AuthContext: Logging out.');
        setToken(null);
        setUser(null);

        Cookies.remove('token');
        Cookies.remove('userId');
        Cookies.remove('userRole');
        localStorage.removeItem('user_data');

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
