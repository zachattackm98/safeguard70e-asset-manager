import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { User, UserRole } from '../types/auth';
import { supabase } from '@/integrations/supabase/client';
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

// Local storage keys
const ADMIN_USER_STORAGE_KEY = 'safeguard70e_admin_user';
const AUTH_STATE_KEY = 'safeguard70e_auth_state';

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
  const authInitialized = useRef(false);
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null);
  
  // Helper to save admin user to localStorage - memoized to remain stable
  const saveAdminUser = useCallback((adminUser: User) => {
    localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(adminUser));
    localStorage.setItem(AUTH_STATE_KEY, 'admin');
  }, []);

  // Helper to get admin user from localStorage - memoized to remain stable
  const getAdminUserFromStorage = useCallback((): User | null => {
    const storedUser = localStorage.getItem(ADMIN_USER_STORAGE_KEY);
    const authState = localStorage.getItem(AUTH_STATE_KEY);
    
    if (storedUser && authState === 'admin') {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Error parsing stored admin user:", e);
        localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
        localStorage.removeItem(AUTH_STATE_KEY);
      }
    }
    return null;
  }, []);

  // Initialize auth state once on mount
  useEffect(() => {
    let mounted = true;
    
    // Prevent duplicate initialization
    if (authInitialized.current) return;
    authInitialized.current = true;
    
    const initializeAuth = async () => {
      try {
        // Check for admin user first
        const adminUser = getAdminUserFromStorage();
        const authState = localStorage.getItem(AUTH_STATE_KEY);
        
        if (adminUser && authState === 'admin') {
          // Using admin authentication
          if (mounted) {
            setUser(adminUser);
            setIsLoading(false);
          }
          return;
        }
        
        // Set up Supabase auth listener - only if we're not using admin auth
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setIsLoading(false);
            localStorage.removeItem(AUTH_STATE_KEY);
            return;
          }
          
          if (session?.user) {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('name, email, role')
                .eq('id', session.user.id)
                .single();
  
              if (!mounted) return;
  
              if (profileError) {
                console.error('Error fetching user profile:', profileError);
                setUser(null);
              } else if (profileData) {
                const userData = {
                  id: session.user.id,
                  name: profileData.name,
                  email: profileData.email,
                  role: profileData.role as UserRole,
                };
                localStorage.setItem(AUTH_STATE_KEY, 'supabase');
                setUser(userData);
              }
            } catch (error) {
              console.error('Error in profile fetch:', error);
              if (mounted) setUser(null);
            } finally {
              if (mounted) setIsLoading(false);
            }
          } else {
            if (mounted) {
              setUser(null);
              setIsLoading(false);
              localStorage.removeItem(AUTH_STATE_KEY);
            }
          }
        });
        
        // Store subscription for cleanup
        authSubscription.current = data.subscription;
        
        // Initial session check
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session && mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    // Cleanup function
    return () => {
      mounted = false;
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
        authSubscription.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Add retry logic for network issues
      let retries = 2;
      let error = null;
      
      while (retries >= 0) {
        try {
          const result = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
              },
            }
          });
          
          if (result.error) throw result.error;
          
          toast({
            title: 'Account created',
            description: 'Please sign in with your new account.',
          });
          
          return;
        } catch (err: any) {
          error = err;
          // Only retry network or timeout errors
          if (err.status !== 504 && err.message !== 'Load failed') {
            throw err;
          }
          retries--;
          // Wait before retrying
          if (retries >= 0) await new Promise(r => setTimeout(r, 1000));
        }
      }
      
      // If we've exhausted retries, throw the last error
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: error.message || 'Could not create account.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Clear any existing auth state
      localStorage.removeItem(AUTH_STATE_KEY);
      await supabase.auth.signOut();
      
      // Special handling for the test admin account
      if (email === 'admin@example.com' && password === 'password123') {
        // Create a mock admin user
        const adminUser: User = {
          id: 'admin-test-id',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin' as UserRole
        };
        
        // Save admin user to localStorage for persistence
        saveAdminUser(adminUser);
        setUser(adminUser);
        
        toast({
          title: 'Login successful',
          description: 'Welcome back, Admin!',
        });
        
        setIsLoading(false);
        return;
      }
      
      // For regular users, proceed with Supabase auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Auth state listener will handle setting the user
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again.',
      });
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const authState = localStorage.getItem(AUTH_STATE_KEY);
      
      if (authState === 'admin') {
        // Admin user logout
        localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
        localStorage.removeItem(AUTH_STATE_KEY);
        setUser(null);
      } else {
        // Regular user logout through Supabase
        localStorage.removeItem(AUTH_STATE_KEY);
        await supabase.auth.signOut();
      }
      
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

  // Stable context value to prevent unnecessary re-renders
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
