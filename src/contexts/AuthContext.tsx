
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '../types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple local storage key
const USER_STORAGE_KEY = 'safeguard70e_user';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state from localStorage only once on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Error loading user from localStorage:', e);
        localStorage.removeItem(USER_STORAGE_KEY); // Clear corrupted data
      } finally {
        setIsLoading(false); // Always set loading to false when done
      }
    };
    
    // Run initialization
    initAuth();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Super simple signup - just create a user object and store it
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'technician'
      };
      
      // Check if email already exists
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser && JSON.parse(storedUser).email === email) {
        throw new Error('Email already in use.');
      }

      // Store the user in localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      
      toast({
        title: 'Account created',
        description: 'Your account has been created. Please sign in.',
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: error.message || 'Could not create account.',
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Test admin user
      if (email === 'admin@example.com' && password === 'password123') {
        // Create a mock admin user
        const adminUser: User = {
          id: 'admin-test-id',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin' as UserRole
        };
        
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(adminUser));
        setUser(adminUser);
        
        toast({
          title: 'Login successful',
          description: 'Welcome back, Admin!',
        });
        
        return;
      }
      
      // Test regular technician user
      if (email === 'tech@example.com' && password === 'password123') {
        // Create a mock tech user
        const techUser: User = {
          id: 'tech-test-id',
          name: 'Tech User',
          email: 'tech@example.com',
          role: 'technician' as UserRole
        };
        
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(techUser));
        setUser(techUser);
        
        toast({
          title: 'Login successful',
          description: 'Welcome back, Technician!',
        });
        
        return;
      }
      
      // Otherwise, failed login
      throw new Error('Invalid email or password');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      
      toast({
        title: 'Logged out',
        description: 'You have been signed out successfully.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Error signing out',
        description: 'Please try again.',
      });
    }
  };

  // Create a stable context value to prevent unnecessary re-renders
  const authContextValue = React.useMemo(() => ({
    user,
    login,
    signUp,
    logout,
    isAuthenticated: !!user,
    isLoading,
  }), [user, isLoading]);

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
