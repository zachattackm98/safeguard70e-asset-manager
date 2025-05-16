
import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from './AppLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'technician';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use an effect to prevent layout thrashing during auth checks
  useEffect(() => {
    // Only run navigation logic when not loading, prevents unnecessary redirections
    if (!isLoading) {
      console.log('ProtectedRoute auth check completed:', { 
        isAuthenticated, 
        userRole: user?.role,
        requiredRole,
        path: location.pathname
      });
      
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login from:', location.pathname);
        // Navigate programmatically to prevent chain redirections
        navigate('/login', { state: { from: location }, replace: true });
      } else if (requiredRole && user?.role !== requiredRole) {
        console.log(`Role ${user?.role} does not match required role ${requiredRole}`);
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, navigate, location]);

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // If auth check is complete and user is authenticated with correct role, render content
  if (isAuthenticated && (!requiredRole || user?.role === requiredRole)) {
    return <AppLayout>{children}</AppLayout>;
  }
  
  // For all other cases, render null to let the useEffect handle navigation
  // This prevents render cycles that could cause infinite redirects
  return null;
};

export default ProtectedRoute;
