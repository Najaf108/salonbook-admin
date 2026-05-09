// src/lib/auth.js
import api from './api';

export const authLib = {
  /*
  async requestOTP(phone) {
    const res = await api.post('/auth/request-otp', { phone });
    return res.data;
  },
  async verifyOTP(phone, otp) {
    const res = await api.post('/auth/verify-otp', { phone, otp });
    const { token, user } = res.data;
    if (user.role !== 'ADMIN') throw new Error('Access denied. Admin accounts only.');
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    return { token, user };
  },
  */
  async loginWithToken(idToken, name) {
    const res = await api.post('/auth/verify-otp', { idToken, name });
    const { token, user } = res.data;
    if (user.role !== 'ADMIN') throw new Error('Access denied. Admin accounts only.');
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    return { token, user };
  },
  async emailLogin(email, password) {
    const res = await api.post('/auth/admin-login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    return { token, user };
  },
  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
  },
  getUser() {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem('admin_user')); } catch { return null; }
  },
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('admin_token');
  },
};
