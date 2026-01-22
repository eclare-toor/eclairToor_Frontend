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

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = Cookies.get('token');

            console.log('🔄 AuthContext: Initializing...', { storedToken });

            if (storedToken) {
                try {
                    // Real verification with server
                    const userProfile = await getUserProfile();
                    setUser(userProfile);
                    setToken(storedToken);
                    console.log('✅ AuthContext: Token verified, session restored.');
                } catch (e) {
                    console.error('❌ AuthContext: Token invalid or expired, logging out.', e);
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
        localStorage.setItem('user_data', JSON.stringify(newUser));
        console.log('💾 AuthContext: Cookies & LocalStorage set.');
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
