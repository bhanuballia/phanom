import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result.success) {
      // Navigation will be handled by the useEffect below
    }
  };

  // Redirect based on user role after successful login
  useEffect(() => {
    if (user) {
      console.log('Login: User detected, determining redirect path. From:', from);

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'astrologer') {
        // If they were trying to go to video-chat, let them go there
        if (from.startsWith('/video-chat')) {
          navigate(from);
        } else {
          // Otherwise, redirect them to the astrologer portal
          window.location.href = '/astrologer/dashboard';
        }
      } else {
        // For normal users, go to the requested page or dashboard
        navigate(from);
      }
    }
  }, [user, navigate, from]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/images/log1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
      </div>

      <div className="max-w-md w-full space-y-8 p-8 glass-card rounded-2xl shadow-divine border border-astro-gold/20 mystical-glow relative z-10 bg-white/90 backdrop-blur-sm overflow-hidden">
        {/* Overlay Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-astro-gold/5 via-transparent to-divine-orange/5 opacity-50 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-astro-gold to-divine-orange rounded-full flex items-center justify-center mystical-glow">
              <span className="flex items-center justify-center text-2xl">🕉</span>
            </div>
            <h2 className="flex items-center justify-center mt-6 text-3xl font-cinzel font-bold text-black">
              <span className="flex items-center justify-center">Welcome Back</span>
            </h2>
            <p className="flex items-center justify-center mt-2 text-sm text-black">
              <span className="flex items-center justify-center">Sign in to your sacred astrology account</span>
            </p>
            <p className="flex items-center justify-center mt-1 text-astro-gold font-hindi text-sm">
              <span className="flex items-center justify-center">नमस्ते (Namaste)</span>
            </p>
          </div>

          <form className="mt-8 flex flex-col space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-black px-4 py-3 rounded-lg backdrop-blur-sm relative overflow-hidden">
                {/* Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-astro-gold/5 via-transparent to-divine-orange/5 opacity-50 pointer-events-none"></div>
                <p className="relative z-10 flex items-center justify-center text-black">{error}</p>
              </div>
            )}

            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-astro-gold/30 placeholder-gray-500 text-black bg-white/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent backdrop-blur-sm"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-astro-gold/30 placeholder-gray-500 text-black bg-white/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent backdrop-blur-sm"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-600 hover:text-gray-800"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-astro-dark bg-gradient-to-r from-astro-gold to-divine-orange hover:from-astro-gold-light hover:to-astro-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-astro-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 mystical-glow"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="flex items-center justify-center">Sign In</span>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center text-center">
              <p className="flex flex-wrap items-center justify-center text-sm text-black">
                <span className="flex items-center justify-center">Don't have an account?</span>{' '}
                <Link
                  to="/register"
                  className="flex items-center font-medium text-astro-gold hover:text-astro-gold-light transition-colors duration-200"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;