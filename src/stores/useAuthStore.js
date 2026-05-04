import { create } from 'zustand';
import { authLib } from '../lib/auth';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,

    init: () => {
        if (typeof window === 'undefined') return;
        const user = authLib.getUser();
        const token = localStorage.getItem('admin_token');
        if (user && token) {
            set({ user, token, isAuthenticated: true, isLoading: false });
        } else {
            set({ isLoading: false });
        }
    },

    setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
    },

    logout: () => {
        authLib.logout();
        set({ user: null, token: null, isAuthenticated: false });
    },
}));
