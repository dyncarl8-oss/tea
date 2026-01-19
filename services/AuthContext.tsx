
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const syncUser = async () => {
            // Silence frontend logs as requested. Diagnostics occur on server.
            const params = new URLSearchParams(window.location.search);
            const tokenFromUrl = params.get('whop_user_token');

            if (tokenFromUrl) {
                localStorage.setItem('whop_user_token', tokenFromUrl);
            }

            const token = localStorage.getItem('whop_user_token');

            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // Synchronize silently with backend
                const res = await api.post('/auth/login');
                setUser(res.data);
            } catch (err: any) {
                // Fail silently on frontend, error will reflect in server logs
                if (err.response?.status === 401) {
                    localStorage.removeItem('whop_user_token');
                    setUser(null);
                }
            } finally {
                setIsLoading(false);
            }
        };

        syncUser();
    }, []);

    const logout = () => {
        localStorage.removeItem('whop_user_token');
        setUser(null);
        window.location.href = 'https://whop.com/hub';
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
