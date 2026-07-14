import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const location = useLocation();

  // Check for role requirement from URL query params (e.g. ?role=astrologer)
  const searchParams = new URLSearchParams(location.search);
  const requiredRole = searchParams.get('role');

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute state:', {
      isAuthenticated,
      user: user ? { id: user._id, role: user.role, name: user.name } : null,
      loading,
      adminOnly,
      requiredRole,
      path: location.pathname,
    });

    // If we have a role mismatch (e.g. logged in as client but need astrologer for this call)
    if (isAuthenticated && requiredRole && user && user.role !== requiredRole) {
      console.warn(`Role mismatch detected! Current: ${user.role}, Required: ${requiredRole}. Forcing logout.`);
      logout();
    }
  }, [isAuthenticated, user, loading, adminOnly, location, requiredRole, logout]);

  if (loading) {
    // ... loading UI ...
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Verifying security...</p>
        </div>
      </div>
    );
  }

  // If we just logged out due to mismatch, or weren't logged in
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If they reached here but shouldn't have (race condition)
  if (requiredRole && user && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Switching accounts...</p>
      </div>
    );
  }

  if (adminOnly && user?.role !== 'admin') {
    console.log('ProtectedRoute: Not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute: Rendering protected content');
  return children;
};

export default ProtectedRoute;