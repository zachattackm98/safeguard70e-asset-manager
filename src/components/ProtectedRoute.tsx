import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  
  useEffect(() => {
    // We'll use a single reference to the current pathname to avoid changing dependencies
    const currentPath = location.pathname;
    
    // Only run navigation logic when auth is fully initialized and not loading
    if (!isLoading) {
      console.log('ProtectedRoute auth check on path:', currentPath, {
        isAuthenticated,
        userRole: user?.role,
        requiredRole
      });
      
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login from:', currentPath);
        // Navigate with replace to prevent building up history
        navigate('/login', { 
          state: { from: { pathname: currentPath } }, 
          replace: true 
        });
      } else if (requiredRole && user?.role !== requiredRole) {
        console.log(`Role ${user?.role} does not match required role ${requiredRole}, path:`, currentPath);
        navigate('/unauthorized', { replace: true });
      }
    }
  // Importantly, we DON'T include location or location.pathname in dependencies
  // This prevents re-running the effect when location changes due to our own navigation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, user?.role, requiredRole, navigate]);

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