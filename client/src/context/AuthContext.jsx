import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    // Handle OAuth callback from URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const provider = urlParams.get('provider');

        if (token) {
            localStorage.setItem('token', token);
            // Fetch user data with the token
            fetchUserWithToken(token);
            // Clear URL params
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const fetchUserWithToken = async (token) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
            }
        } catch (error) {
            console.error('Failed to fetch user after OAuth:', error);
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await authAPI.register(userData);
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
            }
            return data;
        } catch (error) {
            throw error;
        }
    };

    const login = async (credentials) => {
        try {
            const { data } = await authAPI.login(credentials);
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
            }
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch {
            // Ignore errors
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateProfile = async (updates) => {
        const { data } = await authAPI.updateProfile(updates);
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
        }
        return data;
    };

    const toggleWishlist = async (productId) => {
        const { data } = await authAPI.toggleWishlist(productId);
        if (data.success) {
            const updatedUser = { ...user, wishlist: data.wishlist };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        }
        return data;
    };

    const refreshUser = useCallback(async () => {
        try {
            const { data } = await authAPI.getMe();
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
            }
        } catch {
            // Silent fail
        }
    }, []);

    const isInWishlist = useCallback(
        (productId) => {
            if (!user?.wishlist) return false;
            return user.wishlist.some((item) =>
                typeof item === 'string' ? item === productId : item._id === productId
            );
        },
        [user]
    );

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                isAdmin: user?.role === 'admin',
                register,
                login,
                logout,
                updateProfile,
                toggleWishlist,
                isInWishlist,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
