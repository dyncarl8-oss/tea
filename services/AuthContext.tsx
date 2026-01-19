
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: async () => { },
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const syncUser = async () => {
            // 1. Extract token from URL (Whop iFrame pass)
            const params = new URLSearchParams(window.location.search);
            const urlToken = params.get('whop_user_token');

            if (urlToken) {
                localStorage.setItem('whop_user_token', urlToken);
            }

            const token = localStorage.getItem('whop_user_token');

            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // 2. Sync with backend (upserts user and gets latest profile/role)
                const res = await api.post('/auth/login');
                setUser(res.data);
            } catch (err) {
                console.error('Auto-sync failed', err);
                if ((err as any).response?.status === 401) {
                    localStorage.removeItem('whop_user_token');
                }
            } finally {
                setIsLoading(false);
            }
        };

        syncUser();
    }, []);

    const login = async () => {
        console.log("Whop automatic authentication is active.");
    };

    const logout = () => {
        localStorage.removeItem('whop_user_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
