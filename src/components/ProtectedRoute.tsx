
import React, { useEffect, useRef } from 'react';
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
  const hasCheckedAuth = useRef(false);
  
  useEffect(() => {
    // Skip navigation if auth check is still loading
    if (isLoading) return;
    
    // Skip if navigation has already happened to prevent loops
    if (hasCheckedAuth.current) return;
    
    const currentPath = location.pathname;
    
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
    
    // Mark that we've checked auth to prevent loops
    hasCheckedAuth.current = true;
    
  // Deliberately exclude location from dependencies to prevent redirect loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, user?.role, requiredRole, navigate]);

  // Reset the check flag when authentication status changes
  useEffect(() => {
    hasCheckedAuth.current = false;
  }, [isAuthenticated]);

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
  
  // For all other cases, render null while the useEffect handles navigation
  return null;
};

export default ProtectedRoute;
