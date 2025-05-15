
import React, { useEffect, useState } from 'react';
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    // Wait until auth check is complete
    if (!isLoading) {
      // If not authenticated, redirect
      if (!isAuthenticated) {
        navigate('/login', { state: { from: location }, replace: true });
        return;
      }
      
      // If role check is required and fails
      if (requiredRole && user?.role !== requiredRole) {
        navigate('/unauthorized', { replace: true });
        return;
      }
      
      // User passes all checks
      setIsAuthorized(true);
    }
  }, [isLoading, isAuthenticated, user, requiredRole, navigate, location]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  
  // Don't render anything until we know the user is authorized
  // This prevents any flicker of protected content
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg">Checking permissions...</p>
      </div>
    );
  }

  // Render the protected content
  return <AppLayout>{children}</AppLayout>;
};

export default ProtectedRoute;
