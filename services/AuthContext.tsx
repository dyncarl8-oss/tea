
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

    const fetchUser = async (token?: string) => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
        } catch (error) {
            console.error('Failed to fetch user', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Check for token in URL (simulating Whop Iframe pass)
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get('whop_user_token'); // Hypothetical

        // Or check localStorage
        const storedToken = localStorage.getItem('whop_user_token');

        if (tokenFromUrl) {
            localStorage.setItem('whop_user_token', tokenFromUrl);
            // Sync with backend
            api.post('/auth/login').then(res => {
                setUser(res.data.user);
                setIsLoading(false);
            }).catch(() => setIsLoading(false));
        } else if (storedToken) {
            // validate session
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async () => {
        // In a real Whop app, we might redirect to OAuth or just wait for iframe token
        // For DEV mode: Simulate a login
        const devToken = prompt("Enter Dev Whop Token (or leave empty for Guest)");
        if (devToken) {
            localStorage.setItem('whop_user_token', devToken);
            const res = await api.post('/auth/login');
            setUser(res.data.user);
        }
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
