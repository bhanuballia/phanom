import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AstrologerLogin from './components/AstrologerLogin';
import AstrologerDashboard from './pages/AstrologerDashboard';

const App = () => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) return false;

    try {
      const userData = JSON.parse(user);
      return userData.role === 'astrologer';
    } catch (e) {
      return false;
    }
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  return (
    <Router basename="/astrologer">
      <Routes>
        <Route path="/login" element={<AstrologerLogin />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AstrologerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;