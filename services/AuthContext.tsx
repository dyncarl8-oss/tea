
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
            // 1. Prioritize token from URL (Whop iFrame behavior)
            const params = new URLSearchParams(window.location.search);
            const urlToken = params.get('whop_user_token');

            if (urlToken) {
                console.log('Capturing tribal token from URL...');
                localStorage.setItem('whop_user_token', urlToken);
            }

            const token = localStorage.getItem('whop_user_token');

            if (!token) {
                console.log('No tribal identity found yet.');
                setIsLoading(false);
                return;
            }

            try {
                // 2. Synchronize with backend
                // The API interceptor will automatically attach the token from localStorage
                const res = await api.post('/auth/login');
                console.log('Tribal identity verified:', res.data.username);
                setUser(res.data);
            } catch (err) {
                console.error('Tribal synchronization failed:', err);
                // On 401, the token is likely stale
                if ((err as any).response?.status === 401) {
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
