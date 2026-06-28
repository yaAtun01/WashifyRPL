import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('washify_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('washify_role');
    const email = localStorage.getItem('washify_email');
    const name = localStorage.getItem('washify_name');

    if (token && role && email) {
      setUser({ token, role, email, name });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await API.post('/api/auth/login', { email, password });
      const data = response.data;
      
      localStorage.setItem('washify_token', data.token);
      localStorage.setItem('washify_role', data.role);
      localStorage.setItem('washify_email', data.email);
      localStorage.setItem('washify_name', data.name);
      
      setToken(data.token);
      setUser({
        token: data.token,
        role: data.role,
        email: data.email,
        name: data.name
      });
      return data;
    } catch (error) {
      throw error.response?.data?.detail || error.response?.data?.error || 'Login failed. Silakan periksa kredensial Anda.';
    }
  };

  const verifyOtp = async (email, otpCode) => {
    try {
      const response = await API.post('/api/auth/verify-otp', { email, otp_code: otpCode });
      const data = response.data;
      
      localStorage.setItem('washify_token', data.token);
      localStorage.setItem('washify_role', data.role);
      localStorage.setItem('washify_email', data.email);
      localStorage.setItem('washify_name', data.name);
      
      setToken(data.token);
      setUser({
        token: data.token,
        role: data.role,
        email: data.email,
        name: data.name
      });
      return data;
    } catch (error) {
      throw error.response?.data?.detail || error.response?.data?.error || 'Verifikasi OTP gagal. Silakan periksa kembali kode Anda.';
    }
  };

  const logout = () => {
    localStorage.removeItem('washify_token');
    localStorage.removeItem('washify_role');
    localStorage.removeItem('washify_email');
    localStorage.removeItem('washify_name');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => !!user;
  const isAdmin = () => user?.role === 'ADMIN';

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading || showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-primary-100 dark:from-darkbg-deep dark:to-darkbg-dark select-none">
        {/* Floating bubbles background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <div 
              key={i}
              className="absolute bottom-0 bg-white/20 dark:bg-primary-500/10 rounded-full animate-bubble-rise animate-pulse"
              style={{
                width: `${Math.random() * 24 + 10}px`,
                height: `${Math.random() * 24 + 10}px`,
                left: `${Math.random() * 90 + 5}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${Math.random() * 3 + 5}s`,
              }}
            />
          ))}
        </div>

        {/* Pulsing/Floating Container */}
        <div className="flex flex-col items-center space-y-6 animate-float-slow">
          {/* Animated Washing Machine */}
          <div className="relative w-36 h-36 rounded-3xl bg-white dark:bg-darkbg-light shadow-2xl border-4 border-white dark:border-gray-750 flex flex-col justify-between p-3">
            {/* Controls */}
            <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-700 pb-1.5">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="w-10 h-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
            </div>

            {/* Drum/Spinner */}
            <div className="relative w-20 h-20 rounded-full bg-gray-50 dark:bg-darkbg-dark border-4 border-gray-200 dark:border-gray-650 shadow-inner mx-auto flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-primary-100/50 dark:bg-primary-950/25 animate-drum-spin flex items-center justify-center">
                <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-primary-400/80 dark:bg-primary-500/60 rounded-b-full animate-water-slosh" />
                <span className="text-3xl relative z-10 select-none">👕</span>
              </div>
            </div>

            {/* Base strip */}
            <div className="h-1 bg-gray-250 dark:bg-gray-700 rounded-full w-12 mx-auto" />
          </div>

          {/* Text Details */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black tracking-widest bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent uppercase">Washify</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wider animate-pulse">Menyiapkan Washify...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export const useAuth = () => useContext(AuthContext);


