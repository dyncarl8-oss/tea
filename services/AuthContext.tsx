
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
            console.log('[FE TRACE] Initializing tribal sync...');

            // 1. Log full environment for diagnostics
            console.log('[FE TRACE] Current URL:', window.location.href);

            // 2. Extract token from URL
            const params = new URLSearchParams(window.location.search);
            let token = params.get('whop_user_token');

            if (token) {
                console.log('[FE TRACE] Token captured from URL parameters.');
                localStorage.setItem('whop_user_token', token);
            } else {
                token = localStorage.getItem('whop_user_token');
                if (token) {
                    console.log('[FE TRACE] Token retrieved from LocalStorage.');
                }
            }

            if (!token) {
                console.warn('[FE TRACE] No Whop token found in URL or Storage. User is anonymous.');
                setIsLoading(false);
                return;
            }

            try {
                console.log('[FE TRACE] Sending sync request to backend...');
                // The API interceptor will attach the token to the header
                const res = await api.post('/auth/login');
                console.log('[FE TRACE] Sync Successful! User:', res.data.username, 'Role:', res.data.role);
                setUser(res.data);
            } catch (err: any) {
                console.error('[FE TRACE] Sync Request Failed:', err.response?.data || err.message);

                // If 401, token is definitely bad
                if (err.response?.status === 401) {
                    console.warn('[FE TRACE] 401 Unauthorized - Clearing stale token.');
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
