import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  // State machine mode: 'login' | 'register'
  const [mode, setMode] = useState('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Form validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Check if user has remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('washify_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateLogin = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email wajib diisi');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Format email tidak valid');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password wajib diisi');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password minimal 6 karakter');
      isValid = false;
    }

    return isValid;
  };

  const validateRegister = () => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');

    if (!name.trim()) {
      setNameError('Nama wajib diisi');
      isValid = false;
    }

    if (!email) {
      setEmailError('Email wajib diisi');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Format email tidak valid');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password wajib diisi');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password minimal 6 karakter');
      isValid = false;
    }

    return isValid;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    
    if (!validateLogin()) return;
    
    setLoading(true);
    try {
      await login(email, password);
      
      if (rememberMe) {
        localStorage.setItem('washify_remembered_email', email);
      } else {
        localStorage.removeItem('washify_remembered_email');
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    
    if (!validateRegister()) return;
    
    setLoading(true);
    try {
      const response = await API.post('/api/auth/register', { name, email, password });
      setInfoMessage(response.data.message);
      // Automatically clear fields and go to login mode on success
      setName('');
      setPassword('');
      setMode('login');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Pendaftaran gagal. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  // Generate background rising bubbles for the Hero section
  const [bubbles, setBubbles] = useState([]);
  useEffect(() => {
    const bubbleArray = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 24 + 10,
      left: Math.random() * 90 + 5,
      delay: Math.random() * 6,
      duration: Math.random() * 4 + 6,
    }));
    setBubbles(bubbleArray);
  }, []);

  const logoSVG = (
    <svg className="w-12 h-12 text-primary-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <circle cx="12" cy="14" r="5" strokeDasharray="3 1.5" />
      <circle cx="12" cy="14" r="2" />
      <line x1="8" y1="5" x2="8.01" y2="5" />
      <line x1="12" y1="5" x2="12.01" y2="5" />
      <line x1="16" y1="5" x2="16.01" y2="5" />
    </svg>
  );

  return (
    <div className="min-h-screen flex transition-colors duration-200">
      
      {/* LEFT SECTION (Hero Illustration & Promotions) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-primary-50 to-primary-100 dark:from-darkbg-dark dark:to-darkbg-deep relative overflow-hidden flex-col justify-between p-12 select-none border-r border-gray-150 dark:border-gray-800">
        
        {/* Animated Background Bubbles */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {bubbles.map(b => (
            <div 
              key={b.id}
              className="absolute bottom-0 bg-white/20 dark:bg-primary-500/5 rounded-full backdrop-blur-[1px] animate-bubble-rise"
              style={{
                width: `${b.size}px`,
                height: `${b.size}px`,
                left: `${b.left}%`,
                animationDelay: `${b.delay}s`,
                animationDuration: `${b.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Brand details */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            {logoSVG}
            <div className="leading-none">
              <span className="font-black text-3xl tracking-wider bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">WASHIFY</span>
              <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-extrabold tracking-widest">Laundry Management System</span>
            </div>
          </div>
        </div>

        {/* Central Illustration Container */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-8">
          
          {/* Main Large Washing Machine Object */}
          <div className="relative w-80 h-80 rounded-[40px] bg-white dark:bg-darkbg-dark shadow-2xl border-4 border-white dark:border-gray-700 flex flex-col justify-between p-6 animate-float-slow">
            
            {/* Control Panel */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="px-3 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-[10px] font-mono text-primary-500 font-bold">
                WASHIFY-99%
              </div>
            </div>

            {/* Washing Machine Door/Drum */}
            <div className="relative w-48 h-48 rounded-full bg-gray-100 dark:bg-darkbg-light border-8 border-gray-300 dark:border-gray-600 shadow-inner mx-auto flex items-center justify-center overflow-hidden">
              
              {/* Inner spin container */}
              <div className="absolute inset-0 bg-primary-100/60 dark:bg-primary-950/20 animate-drum-spin flex items-center justify-center">
                {/* Sloshing Water */}
                <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-primary-400 to-primary-300/40 rounded-b-full animate-water-slosh" />
                
                {/* Clothes inside spinning */}
                <span className="text-6xl relative z-10 select-none animate-bounce">👔</span>
                <span className="text-4xl absolute top-6 left-6 z-10 select-none">🧦</span>
                <span className="text-5xl absolute bottom-8 right-6 z-10 select-none">👕</span>
              </div>
              
              {/* Glass Reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/40 pointer-events-none" />
            </div>

            {/* Bottom details */}
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-24 mx-auto" />
          </div>

          {/* Title & Subtitle */}
          <div className="text-center space-y-3 max-w-md">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Washify Laundry Management System</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Kelola usaha laundry lebih cepat, lebih rapi, dan lebih modern dalam satu platform terintegrasi.
            </p>
          </div>
        </div>

        {/* Promo Banner Footer */}
        <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-gray-200 dark:border-gray-800 pt-6">
          {[
            { tag: '🏷️ DISKON 20%', desc: 'Member Baru' },
            { tag: '⚡ LAUNDRY EXPRESS', desc: 'Selesai 1 Hari' },
            { tag: '🌸 BERSIH & WANGI', desc: 'Parfum Premium' }
          ].map((promo, idx) => (
            <div key={idx} className="text-center bg-white/50 dark:bg-darkbg-dark/40 border border-white/80 dark:border-gray-800/80 rounded-2xl py-3 px-2 shadow-sm">
              <span className="text-[10px] font-extrabold text-primary-500 block">{promo.tag}</span>
              <span className="text-[9px] text-gray-400 block mt-0.5">{promo.desc}</span>
            </div>
          ))}
        </div>

      </div>

      {/* RIGHT SECTION (Auth form) */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-darkbg-deep flex items-center justify-center p-8 transition-colors duration-200">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Header only */}
          <div className="lg:hidden text-center space-y-2">
            <div className="inline-block text-4xl mb-2">🧼</div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">WASHIFY</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Laundry Management System</p>
          </div>

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <>
              <div className="text-center lg:text-left space-y-2">
                <div className="hidden lg:block mb-4">{logoSVG}</div>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-955 dark:text-white">Welcome Back Admin</h2>
                <p className="text-sm text-gray-500">Silakan login untuk mengelola data laundry.</p>
              </div>

              {infoMessage && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-xs text-emerald-700 dark:text-emerald-450 leading-relaxed font-semibold">
                  {infoMessage}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl flex items-center space-x-3 text-sm text-red-700 dark:text-red-400">
                  <FiAlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isExpired && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-250 dark:border-yellow-900 rounded-2xl flex items-center space-x-3 text-sm text-yellow-700 dark:text-yellow-400">
                  <FiAlertCircle className="w-5 h-5 shrink-0" />
                  <span>Sesi login Anda telah berakhir. Silakan masuk kembali.</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                      <FiMail className="w-5 h-5" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white"
                      placeholder="admin@washify.com"
                    />
                  </div>
                  {emailError && <p className="text-xs text-red-500 font-semibold mt-1">{emailError}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                      <FiLock className="w-5 h-5" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white"
                      placeholder="Masukkan password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-650"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-xs text-red-500 font-semibold mt-1">{passwordError}</p>}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4.5 h-4.5 border-gray-200 text-primary-500 focus:ring-primary-400 rounded-lg"
                    />
                    <span className="text-gray-500 font-medium text-xs">Ingat saya di perangkat ini</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white font-bold text-sm transition-all duration-200 glow-button flex items-center justify-center shadow-lg shadow-primary-500/20"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Masuk Ke Dashboard Admin'
                  )}
                </button>
              </form>

              <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400">Belum punya akun admin?</p>
                <button
                  onClick={() => {
                    setError('');
                    setInfoMessage('');
                    setMode('register');
                  }}
                  className="mt-2 text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors uppercase tracking-wider"
                >
                  Daftarkan Akun Baru
                </button>
              </div>
            </>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <>
              <div className="text-center lg:text-left space-y-2">
                <div className="hidden lg:block mb-4">{logoSVG}</div>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-955 dark:text-white">Daftar Admin Baru</h2>
                <p className="text-sm text-gray-500">Buat kredensial admin baru untuk masuk ke sistem.</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl flex items-center space-x-3 text-sm text-red-700 dark:text-red-400">
                  <FiAlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                      <FiUser className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      required
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  {nameError && <p className="text-xs text-red-500 font-semibold mt-1">{nameError}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                      <FiMail className="w-5 h-5" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white"
                      placeholder="admin@washify.com"
                    />
                  </div>
                  {emailError && <p className="text-xs text-red-500 font-semibold mt-1">{emailError}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                      <FiLock className="w-5 h-5" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white"
                      placeholder="Minimal 6 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-650"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-xs text-red-500 font-semibold mt-1">{passwordError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white font-bold text-sm transition-all duration-200 glow-button flex items-center justify-center shadow-lg shadow-primary-500/20"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Daftar Akun Baru'
                  )}
                </button>
              </form>

              <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    setError('');
                    setInfoMessage('');
                    setMode('login');
                  }}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors uppercase tracking-wider"
                >
                  Kembali ke Login
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>

    </div>
  );
};

export default Login;
