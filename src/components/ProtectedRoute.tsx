
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
  
  console.log("ProtectedRoute checking auth:", { isAuthenticated, isLoading, path: location.pathname });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg">Loading authentication...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login from:", location.pathname);
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role requirements if specified
  if (requiredRole && user?.role !== requiredRole) {
    console.log("Unauthorized role, redirecting");
    return <Navigate to="/unauthorized" replace />;
  }

  // Render the protected content
  return <AppLayout>{children}</AppLayout>;
};

export default ProtectedRoute;
