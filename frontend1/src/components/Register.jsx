import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, Clock, MapPin } from 'lucide-react';
import { geoAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    role: 'client',
    // Hidden geo fields
    latitude: 0,
    longitude: 0,
    timezone: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
    if (passwordError) setPasswordError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enhanced client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setPasswordError('Please enter a valid email address');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    // Validate phone number
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s()-]/g, ''))) {
      setPasswordError('Please enter a valid phone number (10-15 digits)');
      return;
    }

    // Validate birth date (not in future)
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    if (birthDate >= today) {
      setPasswordError('Date of birth cannot be in the future');
      return;
    }

    // Validate age (minimum 13 years)
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13) {
      setPasswordError('You must be at least 13 years old to register');
      return;
    }

    const { confirmPassword, ...registrationData } = formData;

    // Add timestamp and additional metadata
    const enhancedData = {
      ...registrationData,
      registrationSource: 'web_form',
      registrationTimestamp: new Date().toISOString(),
    };

    const result = await register(enhancedData);
    if (result.success) {
      // Show success message before navigation
      alert('✨ स्वागतम्! Registration successful! Welcome to our divine astrology community.');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 overflow-hidden relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/home4.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />


      <div className="max-w-2xl w-full space-y-8 p-8 bg-white/40 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-astro-gold to-divine-orange rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl">🕉</span>
          </div>
          <h2 className="mt-6 text-3xl font-cinzel font-bold text-gray-900">
            Create Sacred Account
          </h2>
          <p className="mt-2 text-sm text-gray-800 font-medium">
            Join our divine astrology community
          </p>
          <p className="mt-1 text-astro-gold font-bold font-hindi text-sm">
            स्वागतम् (Welcome)
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {passwordError && (
            <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg">
              {passwordError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-200"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-200"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="sr-only">Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-200"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <select
                name="role"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-200"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="client" className="text-gray-900">Client</option>
                <option value="astrologer" className="text-gray-900">Astrologer</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="sr-only">Date of Birth</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-200"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Time of Birth */}
            <div>
              <label htmlFor="timeOfBirth" className="sr-only">Time of Birth</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  id="timeOfBirth"
                  name="timeOfBirth"
                  type="time"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-200"
                  value={formData.timeOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Place of Birth */}
          <div>
            <label htmlFor="placeOfBirth" className="sr-only">Place of Birth</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-600" />
              </div>
              <input
                id="placeOfBirth"
                name="placeOfBirth"
                type="text"
                required
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-200"
                placeholder="Place of Birth (City, Country)"
                value={formData.placeOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-200"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-transparent transition-all duration-200"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-gray-900 bg-gradient-to-r from-astro-gold to-divine-orange hover:from-astro-gold-light hover:to-astro-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-astro-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-800 font-medium">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-astro-gold hover:text-astro-gold-dark transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;